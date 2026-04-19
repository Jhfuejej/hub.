import { useMemo, useState } from 'react';
import { Card, HUB, Metric, Overline, YellowButton, GhostButton, IconButton, Badge, EmptyState, Label } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { Modal } from '../components/Modal.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtDate, fmtDayShort, volumeFor, durationFor } from '../lib/format.js';

const WORKOUT_TEMPLATES = [
  { name: 'Push · Chest & Triceps', exercises: ['Bench press', 'Incline DB press', 'Overhead press', 'Tricep pushdown'] },
  { name: 'Pull · Back & Biceps', exercises: ['Deadlift', 'Pull-ups', 'Barbell row', 'Bicep curls'] },
  { name: 'Legs · Quads', exercises: ['Back squat', 'Leg press', 'Lunges', 'Leg extension'] },
  { name: 'Legs · Hamstrings', exercises: ['Romanian deadlift', 'Leg curl', 'Good morning', 'Hip thrust'] },
  { name: 'Upper', exercises: ['Bench press', 'Barbell row', 'Overhead press', 'Pull-ups'] },
  { name: 'Full body', exercises: ['Back squat', 'Bench press', 'Barbell row'] },
];

export function Workouts() {
  const { state, addWorkout, updateWorkout, deleteWorkout,
    addExercise, updateExercise, deleteExercise,
    addSet, updateSet, deleteSet } = useStore();

  const [newOpen, setNewOpen] = useState(false);
  const [openId, setOpenId] = useState(null);

  const active = useMemo(() => state.workouts.find((w) => !w.completedAt), [state.workouts]);
  const history = useMemo(
    () => state.workouts.filter((w) => w.completedAt).sort((a, b) => b.date.localeCompare(a.date)),
    [state.workouts],
  );

  const detail = useMemo(() => state.workouts.find((w) => w.id === openId), [state.workouts, openId]);

  const startWorkout = (name) => {
    addWorkout({
      name: name || 'New workout',
      date: todayISO(),
      startedAt: Date.now(),
      completedAt: null,
      exercises: [],
      notes: '',
    });
    setNewOpen(false);
  };

  const startTemplate = (template) => {
    const w = {
      name: template.name,
      date: todayISO(),
      startedAt: Date.now(),
      completedAt: null,
      exercises: template.exercises.map((n, i) => ({
        id: `ex_${Date.now()}_${i}`,
        name: n,
        sets: [{ id: `set_${Date.now()}_${i}`, weight: 0, reps: 0, done: false }],
      })),
      notes: '',
    };
    addWorkout(w);
    setNewOpen(false);
  };

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440 }}>
      {active ? (
        <ActiveSession
          workout={active}
          onOpen={() => setOpenId(active.id)}
          onComplete={() => updateWorkout(active.id, { completedAt: Date.now() })}
          onToggleSet={(exId, setId, done) => updateSet(active.id, exId, setId, { done })}
        />
      ) : (
        <Card style={{ padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <Overline>No active session</Overline>
            <div style={{ fontFamily: HUB.font, fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', marginTop: 6, textTransform: 'uppercase' }}>
              Ready to train?
            </div>
            <div style={{ fontFamily: HUB.mono, fontSize: 12, color: HUB.fog, marginTop: 6 }}>
              Start from a template or build a custom workout.
            </div>
          </div>
          <YellowButton onClick={() => setNewOpen(true)} style={{ padding: '12px 22px' }}>
            + Start workout
          </YellowButton>
        </Card>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
        <StatCard label="Sessions · All time" value={state.workouts.filter((w) => w.completedAt).length} sub={`${state.workouts.length} total logged`} />
        <StatCard label="This week" value={state.workouts.filter((w) => w.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length} sub="sessions" accent />
        <StatCard label="Total volume" value={`${(state.workouts.reduce((a, w) => a + volumeFor(w), 0) / 1000).toFixed(1)}`} unit="t" sub="all time" />
        <StatCard label="Avg session" value={Math.round(
          (state.workouts.filter((w) => w.completedAt).reduce((a, w) => a + durationFor(w), 0) /
            Math.max(1, state.workouts.filter((w) => w.completedAt).length)) || 0,
        )} unit="min" sub="duration" />
      </div>

      {/* History */}
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Overline>History</Overline>
          <GhostButton onClick={() => setNewOpen(true)}>+ New workout</GhostButton>
        </div>
        {history.length === 0 && (
          <EmptyState
            icon="dumbbell"
            title="No completed workouts yet"
            body="Start your first session to build your history."
            action={<YellowButton onClick={() => setNewOpen(true)}>+ Start workout</YellowButton>}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {history.map((w, i) => {
            const vol = volumeFor(w);
            const dur = durationFor(w);
            const sets = (w.exercises || []).reduce((a, e) => a + (e.sets || []).filter((s) => s.done).length, 0);
            return (
              <div
                key={w.id}
                onClick={() => setOpenId(w.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr auto auto auto auto',
                  alignItems: 'center', gap: 16,
                  padding: '16px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: HUB.slate,
                  display: 'grid', placeItems: 'center', color: HUB.ash,
                }}>
                  <Icon name="dumbbell" size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: HUB.font, fontWeight: 800, fontSize: 14 }}>{w.name}</div>
                  <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>
                    {fmtDate(w.date)} · {fmtDayShort(w.date)}
                  </div>
                </div>
                <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.ash }}>{sets} sets</div>
                <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.ash }}>{dur} min</div>
                <div style={{
                  fontFamily: HUB.font, fontWeight: 800, fontSize: 14, color: HUB.yellow,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {vol.toLocaleString()} kg
                </div>
                <Icon name="chevron" size={14} color={HUB.fog} />
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} subtitle="Create" title="Start a workout" width={620}>
        <NewWorkoutForm onTemplate={startTemplate} onCustom={startWorkout} />
      </Modal>

      <Modal
        open={!!detail}
        onClose={() => setOpenId(null)}
        subtitle={detail ? `${fmtDate(detail.date)} · ${fmtDayShort(detail.date)}` : ''}
        title={detail?.name || 'Workout'}
        width={720}
        footer={detail && (
          <>
            <GhostButton
              danger
              onClick={() => { if (confirm('Delete workout?')) { deleteWorkout(detail.id); setOpenId(null); } }}
            >
              Delete
            </GhostButton>
            <YellowButton onClick={() => setOpenId(null)}>Close</YellowButton>
          </>
        )}
      >
        {detail && (
          <WorkoutDetail
            workout={detail}
            onUpdateName={(name) => updateWorkout(detail.id, { name })}
            onAddExercise={(name) => addExercise(detail.id, { name, sets: [{ id: `s_${Date.now()}`, weight: 0, reps: 0, done: false }] })}
            onUpdateExercise={(exId, patch) => updateExercise(detail.id, exId, patch)}
            onDeleteExercise={(exId) => deleteExercise(detail.id, exId)}
            onAddSet={(exId, prev) => addSet(detail.id, exId, { weight: prev?.weight || 0, reps: prev?.reps || 0, done: false })}
            onUpdateSet={(exId, setId, patch) => updateSet(detail.id, exId, setId, patch)}
            onDeleteSet={(exId, setId) => deleteSet(detail.id, exId, setId)}
            onComplete={() => { updateWorkout(detail.id, { completedAt: Date.now() }); }}
            onReopen={() => updateWorkout(detail.id, { completedAt: null })}
          />
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, unit, sub, accent }) {
  return (
    <Card style={{ padding: 20 }}>
      <Overline>{label}</Overline>
      <div style={{ marginTop: 10 }}>
        <Metric value={value} unit={unit} accent={accent} size={32} />
      </div>
      <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 8 }}>{sub}</div>
    </Card>
  );
}

function ActiveSession({ workout, onOpen, onComplete, onToggleSet }) {
  const dur = durationFor(workout);
  const vol = volumeFor(workout);
  const setsDone = (workout.exercises || []).reduce((a, e) => a + (e.sets || []).filter((s) => s.done).length, 0);
  const totalSets = (workout.exercises || []).reduce((a, e) => a + (e.sets || []).length, 0);

  return (
    <Card style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <Overline>Current session · Started {dur} min ago</Overline>
          <div style={{
            fontFamily: HUB.font, fontWeight: 900, fontSize: 32,
            letterSpacing: '-0.03em', marginTop: 6, textTransform: 'uppercase',
          }}>
            {workout.name}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 20, fontFamily: HUB.mono, fontSize: 12, color: HUB.ash }}>
            <span><span style={{ color: HUB.yellow }}>{setsDone}</span> / {totalSets} sets</span>
            <span><span style={{ color: HUB.yellow }}>{vol.toLocaleString()}</span> kg volume</span>
          </div>
          <div style={{ marginTop: 6, fontFamily: HUB.mono, fontSize: 10, color: HUB.fog }}>
            Click any set to toggle it done.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GhostButton onClick={onOpen}>Edit session</GhostButton>
          <YellowButton onClick={onComplete}>Complete</YellowButton>
        </div>
      </div>

      {workout.exercises.length > 0 ? (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {workout.exercises.map((ex) => (
            <div key={ex.id} style={{
              background: HUB.ink, borderRadius: 12, padding: 16,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: HUB.font, fontWeight: 800, fontSize: 16 }}>{ex.name}</div>
                <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog }}>
                  {ex.sets.filter((s) => s.done).length} / {ex.sets.length} sets
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {ex.sets.slice(0, 8).map((s) => (
                  <SetTile key={s.id} set={s} onToggle={() => onToggleSet(ex.id, s.id, !s.done)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          marginTop: 20, padding: 24, background: HUB.ink, borderRadius: 12,
          textAlign: 'center', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12,
        }}>
          No exercises yet. Tap "Edit session" to add exercises and log sets.
        </div>
      )}
    </Card>
  );
}

function SetTile({ set, onToggle }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={set.done ? 'Mark incomplete' : 'Mark done'}
      style={{
        background: set.done ? HUB.yellow : HUB.graphite,
        color: set.done ? HUB.black : HUB.ash,
        padding: '10px 12px', borderRadius: 8, textAlign: 'center',
        fontFamily: HUB.font, fontWeight: 700,
        border: 0, cursor: 'pointer',
        boxShadow: hover ? 'inset 0 0 0 1.5px rgba(245,208,51,0.55)' : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        transition: 'box-shadow 120ms, background 120ms',
      }}
    >
      <div style={{ fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
        {set.weight ? `${set.weight} kg` : '—'}
      </div>
      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, letterSpacing: '0.08em' }}>
        × {set.reps || '—'}
      </div>
    </button>
  );
}

function NewWorkoutForm({ onTemplate, onCustom }) {
  const [customName, setCustomName] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Label>Templates</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {WORKOUT_TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => onTemplate(t)}
              style={{
                background: HUB.ink, border: `1px solid ${HUB.slate}`, color: '#fff',
                borderRadius: 10, padding: 14, textAlign: 'left', cursor: 'pointer',
                transition: 'border-color 120ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = HUB.yellow)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = HUB.slate)}
            >
              <div style={{ fontFamily: HUB.font, fontWeight: 800, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 6 }}>
                {t.exercises.join(' · ')}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Custom</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            placeholder="e.g. Morning run"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <YellowButton
            onClick={() => customName.trim() && onCustom(customName.trim())}
            style={{ padding: '10px 18px', flexShrink: 0 }}
            disabled={!customName.trim()}
          >
            Start
          </YellowButton>
        </div>
      </div>
    </div>
  );
}

function WorkoutDetail({ workout, onUpdateName, onAddExercise, onUpdateExercise, onDeleteExercise,
  onAddSet, onUpdateSet, onDeleteSet, onComplete, onReopen }) {

  const [exName, setExName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(workout.name);

  const vol = volumeFor(workout);
  const dur = durationFor(workout);
  const done = !!workout.completedAt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <MiniStat label="Volume" value={vol.toLocaleString()} unit="kg" />
        <MiniStat label="Duration" value={dur} unit="min" />
        <MiniStat label="Sets" value={(workout.exercises || []).reduce((a, e) => a + (e.sets || []).filter((s) => s.done).length, 0)} unit="done" />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {editingName ? (
          <>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
            <GhostButton onClick={() => { onUpdateName(nameDraft || 'Workout'); setEditingName(false); }}>Save</GhostButton>
          </>
        ) : (
          <GhostButton onClick={() => { setNameDraft(workout.name); setEditingName(true); }}>
            Rename
          </GhostButton>
        )}
        {done
          ? <GhostButton onClick={onReopen}>Reopen</GhostButton>
          : <YellowButton onClick={onComplete}>Complete session</YellowButton>}
      </div>

      {workout.exercises.map((ex) => (
        <ExerciseBlock
          key={ex.id}
          exercise={ex}
          onRename={(name) => onUpdateExercise(ex.id, { name })}
          onDelete={() => onDeleteExercise(ex.id)}
          onAddSet={(prev) => onAddSet(ex.id, prev)}
          onUpdateSet={(setId, patch) => onUpdateSet(ex.id, setId, patch)}
          onDeleteSet={(setId) => onDeleteSet(ex.id, setId)}
        />
      ))}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Add exercise — e.g. Bench press"
          value={exName}
          onChange={(e) => setExName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && exName.trim()) {
              onAddExercise(exName.trim());
              setExName('');
            }
          }}
        />
        <YellowButton
          onClick={() => { if (exName.trim()) { onAddExercise(exName.trim()); setExName(''); } }}
          style={{ flexShrink: 0 }}
          disabled={!exName.trim()}
        >
          + Add
        </YellowButton>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit }) {
  return (
    <div style={{
      background: HUB.ink, borderRadius: 10, padding: 14,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      <Overline>{label}</Overline>
      <div style={{ marginTop: 6 }}>
        <Metric value={value} unit={unit} size={22} />
      </div>
    </div>
  );
}

function ExerciseBlock({ exercise, onRename, onDelete, onAddSet, onUpdateSet, onDeleteSet }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(exercise.name);

  return (
    <div style={{
      background: HUB.ink, borderRadius: 12, padding: 16,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {editingName ? (
          <>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus style={{ flex: 1 }} />
            <IconButton name="check" onClick={() => { onRename(nameDraft || 'Exercise'); setEditingName(false); }} title="Save" />
          </>
        ) : (
          <>
            <div style={{ fontFamily: HUB.font, fontWeight: 800, fontSize: 16, flex: 1 }}>{exercise.name}</div>
            <IconButton name="edit" onClick={() => { setNameDraft(exercise.name); setEditingName(true); }} title="Rename" />
            <IconButton name="trash" onClick={() => { if (confirm('Delete exercise?')) onDelete(); }} title="Delete" />
          </>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 1fr 60px',
        gap: 8, alignItems: 'center',
        padding: '4px 0', marginBottom: 6,
        fontFamily: HUB.font, fontWeight: 700, fontSize: 9,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: HUB.fog,
      }}>
        <div>Set</div>
        <div>Weight (kg)</div>
        <div>Reps</div>
        <div>Done</div>
      </div>

      {exercise.sets.map((s, i) => (
        <div
          key={s.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 1fr 60px',
            gap: 8, alignItems: 'center',
            padding: '6px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
          }}
        >
          <div style={{
            fontFamily: HUB.mono, fontSize: 11, color: s.done ? HUB.yellow : HUB.fog,
            width: 28, height: 28, borderRadius: 6, background: HUB.graphite,
            display: 'grid', placeItems: 'center', fontWeight: 700,
          }}>
            {i + 1}
          </div>
          <input
            type="number"
            value={s.weight ?? ''}
            onChange={(e) => onUpdateSet(s.id, { weight: e.target.value === '' ? 0 : Number(e.target.value) })}
            style={{ padding: '8px 10px' }}
            min="0"
            step="0.5"
          />
          <input
            type="number"
            value={s.reps ?? ''}
            onChange={(e) => onUpdateSet(s.id, { reps: e.target.value === '' ? 0 : Number(e.target.value) })}
            style={{ padding: '8px 10px' }}
            min="0"
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => onUpdateSet(s.id, { done: !s.done })}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: s.done ? HUB.yellow : 'transparent',
                border: s.done ? 'none' : `1.5px solid ${HUB.steel}`,
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                flexShrink: 0,
              }}
              title={s.done ? 'Mark incomplete' : 'Mark done'}
            >
              {s.done && <Icon name="check" size={14} color={HUB.black} />}
            </button>
            <IconButton name="trash" onClick={() => onDeleteSet(s.id)} title="Remove set" size={12} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: 10 }}>
        <GhostButton
          onClick={() => onAddSet(exercise.sets[exercise.sets.length - 1])}
          style={{ padding: '8px 14px', fontSize: 10 }}
        >
          + Add set
        </GhostButton>
      </div>
    </div>
  );
}
