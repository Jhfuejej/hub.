import { useMemo, useState } from 'react';
import { Card, HUB, Metric, Overline, YellowButton, GhostButton, IconButton, Label, EmptyState } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { Modal } from '../components/Modal.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtDayShort, streakOf } from '../lib/format.js';

const HABIT_ICONS = ['flame', 'dumbbell', 'utensils', 'book', 'moon', 'heart', 'check', 'trend', 'edit'];

function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function Habits() {
  const { state, addHabit, updateHabit, deleteHabit, toggleHabit } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const today = todayISO();
  const days = lastDays(14);

  const totalCompletions = state.habits.reduce(
    (a, h) => a + Object.values(h.log || {}).filter(Boolean).length, 0,
  );

  const todayDone = state.habits.filter((h) => (h.log || {})[today]).length;

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <Card lit style={{ padding: 28, minHeight: 160 }}>
          <Overline color="rgba(10,10,10,0.65)">Today</Overline>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{
              fontFamily: HUB.font, fontWeight: 900, fontSize: 64,
              letterSpacing: '-0.04em', lineHeight: 0.9, color: HUB.black,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {todayDone}
            </div>
            <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 18, color: 'rgba(10,10,10,0.5)' }}>
              / {state.habits.length} done
            </div>
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 12, color: 'rgba(10,10,10,0.65)', marginTop: 12 }}>
            {state.habits.length === todayDone ? 'All hit. Solid.' : `${state.habits.length - todayDone} remaining`}
          </div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Total habits</Overline>
          <div style={{ marginTop: 12 }}><Metric value={state.habits.length} size={32} /></div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>tracked</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Completions</Overline>
          <div style={{ marginTop: 12 }}><Metric value={totalCompletions} accent size={32} /></div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>all time</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Top streak</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric
              value={state.habits.reduce((m, h) => Math.max(m, streakOf(h)), 0)}
              unit="d"
              size={32}
            />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>current</div>
        </Card>
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Overline>Last 14 days</Overline>
          <YellowButton onClick={() => { setEditing(null); setOpen(true); }} style={{ padding: '8px 14px', fontSize: 10 }}>
            + New habit
          </YellowButton>
        </div>

        {state.habits.length === 0 && (
          <EmptyState
            icon="flame"
            title="No habits yet"
            body="Habits are simple checkboxes that build streaks. Start with one or two."
            action={<YellowButton onClick={() => setOpen(true)}>+ New habit</YellowButton>}
          />
        )}

        {state.habits.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `minmax(220px, 1.5fr) repeat(${days.length}, 26px) 60px 40px`,
              alignItems: 'center', gap: 6,
              fontFamily: HUB.font, fontWeight: 700, fontSize: 9,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: HUB.fog,
              padding: '0 0 12px',
            }}>
              <div>Habit</div>
              {days.map((d) => (
                <div key={d} style={{ textAlign: 'center', color: d === today ? HUB.yellow : HUB.fog }}>
                  {fmtDayShort(d)[0]}
                </div>
              ))}
              <div style={{ textAlign: 'right' }}>Streak</div>
              <div></div>
            </div>

            {state.habits.map((h) => {
              const streak = streakOf(h);
              return (
                <div key={h.id} style={{
                  display: 'grid',
                  gridTemplateColumns: `minmax(220px, 1.5fr) repeat(${days.length}, 26px) 60px 40px`,
                  alignItems: 'center', gap: 6,
                  padding: '12px 0',
                  borderTop: `1px solid ${HUB.slate}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: HUB.slate,
                      display: 'grid', placeItems: 'center', color: HUB.yellow, flexShrink: 0,
                    }}>
                      <Icon name={h.icon || 'flame'} size={14} />
                    </div>
                    <div style={{
                      fontFamily: HUB.font, fontWeight: 700, fontSize: 13,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {h.name}
                    </div>
                  </div>
                  {days.map((d) => {
                    const on = !!(h.log || {})[d];
                    const isToday = d === today;
                    return (
                      <button
                        key={d}
                        onClick={() => toggleHabit(h.id, d)}
                        style={{
                          width: 22, height: 22, margin: '0 auto', borderRadius: 5,
                          background: on ? HUB.yellow : HUB.ink,
                          border: isToday && !on ? `1.5px solid ${HUB.steel}` : 'none',
                          boxShadow: isToday && on ? `0 0 0 2px rgba(245,208,51,0.25)` : 'none',
                          display: 'grid', placeItems: 'center',
                          cursor: 'pointer', transition: 'all 120ms',
                        }}
                        title={d}
                      >
                        {on && <Icon name="check" size={10} color={HUB.black} />}
                      </button>
                    );
                  })}
                  <div style={{
                    fontFamily: HUB.mono, fontSize: 12, fontWeight: 700,
                    color: streak >= 7 ? HUB.yellow : HUB.ash, textAlign: 'right',
                  }}>
                    {streak}d
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton name="edit" onClick={() => { setEditing(h); setOpen(true); }} size={12} title="Edit" />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        subtitle={editing ? 'Edit' : 'Create'}
        title={editing ? 'Edit habit' : 'New habit'}
        width={460}
      >
        <HabitForm
          habit={editing}
          onSave={(data) => {
            if (editing) updateHabit(editing.id, data);
            else addHabit(data);
            setOpen(false); setEditing(null);
          }}
          onDelete={editing ? () => {
            if (confirm('Delete habit and all its history?')) {
              deleteHabit(editing.id);
              setOpen(false); setEditing(null);
            }
          } : null}
        />
      </Modal>
    </div>
  );
}

function HabitForm({ habit, onSave, onDelete }) {
  const [name, setName] = useState(habit?.name || '');
  const [icon, setIcon] = useState(habit?.icon || 'flame');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <Label>Name</Label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Drink 3L water" autoFocus />
      </div>
      <div>
        <Label>Icon</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 8 }}>
          {HABIT_ICONS.map((n) => (
            <button
              key={n}
              onClick={() => setIcon(n)}
              style={{
                aspectRatio: '1', borderRadius: 8,
                background: icon === n ? HUB.yellow : HUB.ink,
                color: icon === n ? HUB.black : HUB.ash,
                border: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
                transition: 'all 120ms',
              }}
            >
              <Icon name={n} size={16} />
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, gap: 10 }}>
        <div>
          {onDelete && <GhostButton danger onClick={onDelete}>Delete</GhostButton>}
        </div>
        <YellowButton onClick={() => name.trim() && onSave({ name: name.trim(), icon })} disabled={!name.trim()}>
          {habit ? 'Save' : 'Add habit'}
        </YellowButton>
      </div>
    </div>
  );
}
