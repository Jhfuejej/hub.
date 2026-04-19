import { useMemo, useState } from 'react';
import { Card, HUB, Metric, Overline, YellowButton, GhostButton, IconButton, Badge, ProgressBar, EmptyState, Label, Segmented } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { Modal } from '../components/Modal.jsx';
import { useStore, todayISO, isoDate } from '../store/store.js';
import { fmtDate, fmtDayShort, macroTotals } from '../lib/format.js';

const SLOTS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch',     label: 'Lunch' },
  { value: 'snack',     label: 'Snack' },
  { value: 'dinner',    label: 'Dinner' },
];

export function Nutrition() {
  const { state, addMeal, deleteMeal, updateMeal, addFood, updateFood, deleteFood, updateSettings } = useStore();
  const [date, setDate] = useState(todayISO());
  const [addOpen, setAddOpen] = useState(false);
  const [preSlot, setPreSlot] = useState(null);
  const [foodsOpen, setFoodsOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const goals = state.settings.nutrition;
  const dayMeals = useMemo(
    () => state.meals.filter((m) => m.date === date).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [state.meals, date],
  );
  const totals = macroTotals(dayMeals);

  const bySlot = useMemo(() => {
    const groups = Object.fromEntries(SLOTS.map((s) => [s.value, []]));
    for (const m of dayMeals) (groups[m.slot || 'snack'] ||= []).push(m);
    return groups;
  }, [dayMeals]);

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const ms = state.meals.filter((m) => m.date === iso);
      const t = macroTotals(ms);
      out.push({ date: iso, ...t });
    }
    return out;
  }, [state.meals]);

  const maxKcal = Math.max(goals.calorieGoal, ...last7.map((d) => d.kcal)) || 1;

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconButton name="chevron-left" onClick={() => {
            const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() - 1);
            setDate(isoDate(d));
          }} title="Previous day" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 170 }}
          />
          <IconButton name="chevron" onClick={() => {
            const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + 1);
            setDate(isoDate(d));
          }} title="Next day" />
          {date !== todayISO() && (
            <GhostButton onClick={() => setDate(todayISO())} style={{ padding: '8px 14px' }}>Today</GhostButton>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GhostButton onClick={() => setGoalsOpen(true)}>Goals</GhostButton>
          <GhostButton onClick={() => setFoodsOpen(true)}>Food library</GhostButton>
          <YellowButton onClick={() => { setPreSlot(null); setAddOpen(true); }}>+ Log meal</YellowButton>
        </div>
      </div>

      {/* Summary + macros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <Card lit style={{
          padding: 28, minHeight: 170,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <Overline color="rgba(10,10,10,0.65)">Calories · {fmtDate(date)}</Overline>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{
                fontFamily: HUB.font, fontWeight: 900, fontSize: 72,
                letterSpacing: '-0.04em', lineHeight: 0.9, color: HUB.black,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {totals.kcal.toLocaleString()}
              </div>
              <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 18, color: 'rgba(10,10,10,0.5)' }}>
                / {goals.calorieGoal.toLocaleString()} kcal
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ height: 6, background: 'rgba(10,10,10,0.15)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (totals.kcal / goals.calorieGoal) * 100)}%`,
                  background: HUB.black, borderRadius: 999,
                }} />
              </div>
              <div style={{
                fontFamily: HUB.mono, fontSize: 11, color: 'rgba(10,10,10,0.65)', marginTop: 8,
              }}>
                {totals.kcal >= goals.calorieGoal ? 'Goal hit' : `${goals.calorieGoal - totals.kcal} to go`}
              </div>
            </div>
          </div>
        </Card>

        <MacroCard
          label="Protein"
          value={totals.protein}
          goal={goals.proteinGoal}
          color={HUB.yellow}
        />
        <MacroCard
          label="Carbs"
          value={totals.carbs}
          goal={goals.carbsGoal}
          color={HUB.bone}
        />
        <MacroCard
          label="Fat"
          value={totals.fat}
          goal={goals.fatGoal}
          color={HUB.ash}
        />
      </div>

      {/* 7-day bar chart */}
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <Overline>Calories · Last 7 days</Overline>
            <div style={{ marginTop: 6, fontFamily: HUB.mono, fontSize: 11, color: HUB.fog }}>
              Goal line at {goals.calorieGoal.toLocaleString()} kcal
            </div>
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.ash }}>
            Avg {Math.round(last7.reduce((a, d) => a + d.kcal, 0) / 7).toLocaleString()} / day
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12,
          height: 180, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            bottom: `${(goals.calorieGoal / maxKcal) * 140 + 20}px`,
            borderTop: `1px dashed ${HUB.steel}`, pointerEvents: 'none',
          }} />
          {last7.map((d, i) => {
            const pct = (d.kcal / maxKcal) * 140;
            const on = d.date === date;
            return (
              <button
                key={d.date}
                onClick={() => setDate(d.date)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                  gap: 8, border: 0, background: 'transparent', cursor: 'pointer', padding: 0,
                }}
              >
                <div style={{
                  fontFamily: HUB.mono, fontSize: 10,
                  color: d.kcal ? (on ? HUB.yellow : HUB.ash) : HUB.fog,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {d.kcal ? Math.round(d.kcal) : '—'}
                </div>
                <div style={{
                  width: '100%', maxWidth: 42, height: `${Math.max(pct, 4)}px`,
                  background: on ? HUB.yellow : HUB.slate,
                  borderRadius: 6, transition: 'all 200ms',
                }} />
                <div style={{
                  fontFamily: HUB.font, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: on ? '#fff' : HUB.fog,
                }}>
                  {fmtDayShort(d.date).slice(0, 2)}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Meal slots */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {SLOTS.map((slot) => {
          const items = bySlot[slot.value] || [];
          const slotTotal = macroTotals(items);
          return (
            <Card key={slot.value} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <Overline>{slot.label}</Overline>
                  {items.length > 0 && (
                    <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 6 }}>
                      {Math.round(slotTotal.kcal)} kcal · P {Math.round(slotTotal.protein)}g
                    </div>
                  )}
                </div>
                <GhostButton
                  onClick={() => { setPreSlot(slot.value); setAddOpen(true); }}
                  style={{ padding: '8px 12px', fontSize: 10 }}
                >
                  + Add
                </GhostButton>
              </div>
              {items.length === 0 ? (
                <div style={{
                  padding: '16px 0', color: HUB.fog,
                  fontFamily: HUB.mono, fontSize: 11, textAlign: 'center',
                }}>
                  Empty
                </div>
              ) : items.map((m, i) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: HUB.slate,
                    display: 'grid', placeItems: 'center', color: HUB.ash,
                  }}>
                    <Icon name="utensils" size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: HUB.font, fontWeight: 700, fontSize: 13,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {m.name}
                    </div>
                    <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>
                      {m.time || '—'} · P{Math.round(m.protein || 0)} · C{Math.round(m.carbs || 0)} · F{Math.round(m.fat || 0)}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: HUB.font, fontWeight: 800, fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {Math.round(m.kcal)}
                  </div>
                  <IconButton name="trash" onClick={() => { if (confirm('Delete meal?')) deleteMeal(m.id); }} size={12} title="Delete" />
                </div>
              ))}
            </Card>
          );
        })}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        subtitle={`${fmtDate(date)}`}
        title="Log meal"
        width={620}
      >
        <LogMealForm
          foods={state.foods}
          defaultSlot={preSlot || 'snack'}
          defaultDate={date}
          onSave={(meal) => { addMeal(meal); setAddOpen(false); }}
          onCreateFood={(food, cb) => {
            addFood(food);
            cb?.();
          }}
        />
      </Modal>

      <Modal
        open={foodsOpen}
        onClose={() => setFoodsOpen(false)}
        subtitle="Library"
        title="Foods"
        width={640}
      >
        <FoodLibrary
          foods={state.foods}
          onAdd={(f) => addFood(f)}
          onUpdate={(id, patch) => updateFood(id, patch)}
          onDelete={(id) => deleteFood(id)}
        />
      </Modal>

      <Modal
        open={goalsOpen}
        onClose={() => setGoalsOpen(false)}
        subtitle="Daily targets"
        title="Nutrition goals"
        width={480}
      >
        <GoalsForm
          goals={goals}
          onSave={(next) => {
            updateSettings({ nutrition: next });
            setGoalsOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function MacroCard({ label, value, goal, color }) {
  const pct = goal ? (value / goal) * 100 : 0;
  return (
    <Card style={{ padding: 20 }}>
      <Overline>{label}</Overline>
      <div style={{ marginTop: 10 }}>
        <Metric value={Math.round(value)} unit="g" size={32} />
      </div>
      <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, margin: '8px 0 10px' }}>
        of {goal}g
      </div>
      <ProgressBar pct={pct} color={color} />
    </Card>
  );
}

function LogMealForm({ foods, defaultSlot, defaultDate, onSave, onCreateFood }) {
  const [mode, setMode] = useState('library');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState(1);
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [slot, setSlot] = useState(defaultSlot);

  // Custom mode
  const [c, setC] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '' });
  const [saveToLib, setSaveToLib] = useState(false);

  const filtered = foods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12);

  const submit = () => {
    if (mode === 'library') {
      if (!selected) return;
      const mult = Number(servings) || 1;
      onSave({
        foodId: selected.id,
        name: selected.name + (mult !== 1 ? ` · ${mult}×` : ''),
        kcal: Math.round(selected.kcal * mult),
        protein: +(selected.protein * mult).toFixed(1),
        carbs: +(selected.carbs * mult).toFixed(1),
        fat: +(selected.fat * mult).toFixed(1),
        date: defaultDate,
        time,
        slot,
      });
    } else {
      if (!c.name.trim()) return;
      const payload = {
        name: c.name.trim(),
        kcal: Number(c.kcal) || 0,
        protein: Number(c.protein) || 0,
        carbs: Number(c.carbs) || 0,
        fat: Number(c.fat) || 0,
      };
      onSave({
        ...payload,
        date: defaultDate,
        time,
        slot,
      });
      if (saveToLib) {
        onCreateFood({ ...payload, serving: '1 serving' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Segmented
        options={[{ value: 'library', label: 'From library' }, { value: 'custom', label: 'Custom' }]}
        value={mode}
        onChange={setMode}
      />

      {mode === 'library' ? (
        <>
          <input
            placeholder="Search foods…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{
            maxHeight: 220, overflowY: 'auto',
            background: HUB.ink, borderRadius: 10,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            {filtered.length === 0 && (
              <div style={{ padding: 20, fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, textAlign: 'center' }}>
                No foods found. Switch to Custom to log something new.
              </div>
            )}
            {filtered.map((f) => {
              const on = selected?.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  style={{
                    display: 'flex', width: '100%', padding: '10px 14px', gap: 12,
                    background: on ? HUB.slate : 'transparent',
                    border: 0, cursor: 'pointer', textAlign: 'left',
                    borderLeft: on ? `3px solid ${HUB.yellow}` : '3px solid transparent',
                    color: '#fff', alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 13 }}>{f.name}</div>
                    <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>
                      P{Math.round(f.protein)} · C{Math.round(f.carbs)} · F{Math.round(f.fat)} · {f.serving || '1 serving'}
                    </div>
                  </div>
                  <div style={{ fontFamily: HUB.font, fontWeight: 800, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(f.kcal)} kcal
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div>
              <Label>Servings</Label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="0.25"
                step="0.25"
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <Label>Name</Label>
            <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="e.g. Protein smoothie" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div>
              <Label>kcal</Label>
              <input type="number" value={c.kcal} onChange={(e) => setC({ ...c, kcal: e.target.value })} min="0" />
            </div>
            <div>
              <Label>Protein</Label>
              <input type="number" value={c.protein} onChange={(e) => setC({ ...c, protein: e.target.value })} min="0" step="0.1" />
            </div>
            <div>
              <Label>Carbs</Label>
              <input type="number" value={c.carbs} onChange={(e) => setC({ ...c, carbs: e.target.value })} min="0" step="0.1" />
            </div>
            <div>
              <Label>Fat</Label>
              <input type="number" value={c.fat} onChange={(e) => setC({ ...c, fat: e.target.value })} min="0" step="0.1" />
            </div>
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            fontFamily: HUB.font, fontWeight: 600, fontSize: 12, color: HUB.ash,
          }}>
            <input type="checkbox" checked={saveToLib} onChange={(e) => setSaveToLib(e.target.checked)} style={{ width: 16, height: 16 }} />
            Also save to food library
          </label>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label>Time</Label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <Label>Slot</Label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton
          onClick={submit}
          disabled={mode === 'library' ? !selected : !c.name.trim()}
        >
          Log meal
        </YellowButton>
      </div>
    </div>
  );
}

function FoodLibrary({ foods, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '', serving: '1 serving' });
  const filtered = foods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  const submit = () => {
    if (!draft.name.trim()) return;
    onAdd({
      name: draft.name.trim(),
      kcal: Number(draft.kcal) || 0,
      protein: Number(draft.protein) || 0,
      carbs: Number(draft.carbs) || 0,
      fat: Number(draft.fat) || 0,
      serving: draft.serving || '1 serving',
    });
    setDraft({ name: '', kcal: '', protein: '', carbs: '', fat: '', serving: '1 serving' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input placeholder="Search library…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{
        maxHeight: 280, overflowY: 'auto',
        background: HUB.ink, borderRadius: 10,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {filtered.length === 0 && (
          <div style={{ padding: 20, fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, textAlign: 'center' }}>
            No foods.
          </div>
        )}
        {filtered.map((f, i) => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px',
            borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 13 }}>{f.name}</div>
              <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>
                {f.serving || '1 serving'} · {Math.round(f.kcal)} kcal · P{Math.round(f.protein)} · C{Math.round(f.carbs)} · F{Math.round(f.fat)}
              </div>
            </div>
            <IconButton
              name="trash"
              onClick={() => { if (confirm(`Delete ${f.name}?`)) onDelete(f.id); }}
              size={12}
              title="Delete"
            />
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${HUB.slate}`, paddingTop: 16 }}>
        <Label>Add to library</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input placeholder="Serving" value={draft.serving} onChange={(e) => setDraft({ ...draft, serving: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <input type="number" placeholder="kcal" value={draft.kcal} onChange={(e) => setDraft({ ...draft, kcal: e.target.value })} min="0" />
          <input type="number" placeholder="P" value={draft.protein} onChange={(e) => setDraft({ ...draft, protein: e.target.value })} min="0" step="0.1" />
          <input type="number" placeholder="C" value={draft.carbs} onChange={(e) => setDraft({ ...draft, carbs: e.target.value })} min="0" step="0.1" />
          <input type="number" placeholder="F" value={draft.fat} onChange={(e) => setDraft({ ...draft, fat: e.target.value })} min="0" step="0.1" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <YellowButton onClick={submit} disabled={!draft.name.trim()}>+ Add food</YellowButton>
        </div>
      </div>
    </div>
  );
}

function GoalsForm({ goals, onSave }) {
  const [draft, setDraft] = useState(goals);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <Label>Calorie goal (kcal)</Label>
        <input type="number" value={draft.calorieGoal} onChange={(e) => setDraft({ ...draft, calorieGoal: Number(e.target.value) || 0 })} min="0" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div>
          <Label>Protein (g)</Label>
          <input type="number" value={draft.proteinGoal} onChange={(e) => setDraft({ ...draft, proteinGoal: Number(e.target.value) || 0 })} min="0" />
        </div>
        <div>
          <Label>Carbs (g)</Label>
          <input type="number" value={draft.carbsGoal} onChange={(e) => setDraft({ ...draft, carbsGoal: Number(e.target.value) || 0 })} min="0" />
        </div>
        <div>
          <Label>Fat (g)</Label>
          <input type="number" value={draft.fatGoal} onChange={(e) => setDraft({ ...draft, fatGoal: Number(e.target.value) || 0 })} min="0" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <YellowButton onClick={() => onSave(draft)}>Save goals</YellowButton>
      </div>
    </div>
  );
}
