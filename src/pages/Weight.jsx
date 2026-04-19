import { useMemo, useState } from 'react';
import { Card, HUB, Metric, Overline, YellowButton, GhostButton, IconButton, Segmented, Label, EmptyState } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { Modal } from '../components/Modal.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtDate, fmtDayShort } from '../lib/format.js';

const RANGES = [
  { value: '7',  label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' },
  { value: '365', label: '1y' },
  { value: 'all', label: 'All' },
];

export function Weight() {
  const { state, addWeight, deleteWeight, updateSettings } = useStore();
  const [range, setRange] = useState('30');
  const [open, setOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const all = useMemo(
    () => [...state.weights].sort((a, b) => a.date.localeCompare(b.date)),
    [state.weights],
  );

  const filtered = useMemo(() => {
    if (range === 'all' || all.length === 0) return all;
    const d = new Date();
    d.setDate(d.getDate() - Number(range));
    const cutoff = d.toISOString().slice(0, 10);
    return all.filter((w) => w.date >= cutoff);
  }, [all, range]);

  const latest = all[all.length - 1];
  const first = filtered[0];
  const delta = latest && first ? (latest.kg - first.kg) : 0;
  const goal = state.settings.weight?.goal || 0;
  const toGoal = goal && latest ? latest.kg - goal : 0;

  const min = Math.min(...filtered.map((w) => w.kg));
  const max = Math.max(...filtered.map((w) => w.kg));

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Segmented options={RANGES} value={range} onChange={setRange} />
        <div style={{ display: 'flex', gap: 10 }}>
          <GhostButton onClick={() => setGoalsOpen(true)}>Goal</GhostButton>
          <YellowButton onClick={() => setOpen(true)}>+ Log weight</YellowButton>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <Card lit style={{ padding: 28, minHeight: 160 }}>
          <Overline color="rgba(10,10,10,0.65)">Current</Overline>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{
              fontFamily: HUB.font, fontWeight: 900, fontSize: 64,
              letterSpacing: '-0.04em', lineHeight: 0.9, color: HUB.black,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {latest ? latest.kg.toFixed(1) : '—'}
            </div>
            <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 18, color: 'rgba(10,10,10,0.5)' }}>
              kg
            </div>
          </div>
          {latest && (
            <div style={{ fontFamily: HUB.mono, fontSize: 12, color: 'rgba(10,10,10,0.65)', marginTop: 12 }}>
              Logged {fmtDate(latest.date)} · {fmtDayShort(latest.date)}
            </div>
          )}
        </Card>

        <Card style={{ padding: 20 }}>
          <Overline>Change · {RANGES.find((r) => r.value === range)?.label}</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric
              value={`${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`}
              unit="kg"
              accent={delta < 0}
              size={32}
            />
          </div>
          <div style={{
            fontFamily: HUB.mono, fontSize: 11, marginTop: 10,
            color: delta <= 0 ? HUB.success : HUB.warning,
          }}>
            {delta === 0 ? 'No change' : delta < 0 ? 'Trending down' : 'Trending up'}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <Overline>Goal</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={goal || '—'} unit="kg" size={32} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>
            {goal && latest ? `${Math.abs(toGoal).toFixed(1)} kg ${toGoal > 0 ? 'above' : 'to gain'}` : 'Not set'}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <Overline>Range · {RANGES.find((r) => r.value === range)?.label}</Overline>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <Metric value={filtered.length ? min.toFixed(1) : '—'} unit="" size={22} />
            <span style={{ color: HUB.fog, fontFamily: HUB.mono, fontSize: 11 }}>—</span>
            <Metric value={filtered.length ? max.toFixed(1) : '—'} unit="kg" size={22} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>
            {filtered.length} entries
          </div>
        </Card>
      </div>

      <Card style={{ padding: 24 }}>
        <Overline>Weight · {RANGES.find((r) => r.value === range)?.label}</Overline>
        <div style={{ marginTop: 18 }}>
          {filtered.length < 2 ? (
            <div style={{ padding: 40, textAlign: 'center', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12 }}>
              Need at least two entries in this range to render a trend.
            </div>
          ) : (
            <WeightChart entries={filtered} goal={goal} />
          )}
        </div>
      </Card>

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Overline>History</Overline>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog }}>{all.length} entries</div>
        </div>
        {all.length === 0 && (
          <EmptyState
            icon="scale"
            title="No weight entries"
            body="Log your first entry to start tracking trends."
            action={<YellowButton onClick={() => setOpen(true)}>+ Log weight</YellowButton>}
          />
        )}
        {[...all].reverse().map((w, i, arr) => {
          const prev = arr[i + 1];
          const change = prev ? (w.kg - prev.kg) : 0;
          return (
            <div key={w.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto',
              alignItems: 'center', gap: 16,
              padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
            }}>
              <div>
                <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 13 }}>
                  {fmtDate(w.date)} · {fmtDayShort(w.date)}
                </div>
                {w.note && <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>{w.note}</div>}
              </div>
              <div style={{
                fontFamily: HUB.mono, fontSize: 11,
                color: change < 0 ? HUB.success : change > 0 ? HUB.warning : HUB.fog,
              }}>
                {prev ? (change >= 0 ? '+' : '') + change.toFixed(1) : '—'}
              </div>
              <div style={{
                fontFamily: HUB.font, fontWeight: 800, fontSize: 14,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {w.kg.toFixed(1)} <span style={{ color: HUB.fog, fontSize: 11, fontWeight: 600 }}>kg</span>
              </div>
              <IconButton name="trash" onClick={() => { if (confirm('Delete entry?')) deleteWeight(w.id); }} size={12} title="Delete" />
            </div>
          );
        })}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} subtitle="Today" title="Log weight" width={420}>
        <WeightForm
          defaultDate={todayISO()}
          defaultKg={latest?.kg || 80}
          onSave={(entry) => { addWeight(entry); setOpen(false); }}
        />
      </Modal>

      <Modal open={goalsOpen} onClose={() => setGoalsOpen(false)} subtitle="Target" title="Weight goal" width={400}>
        <GoalForm
          goal={goal}
          onSave={(g) => { updateSettings({ weight: { ...state.settings.weight, goal: g } }); setGoalsOpen(false); }}
        />
      </Modal>
    </div>
  );
}

function WeightChart({ entries, goal }) {
  const W = 1000;
  const H = 240;
  const pad = 24;
  const values = entries.map((e) => e.kg);
  const lo = Math.min(...values, goal || Infinity);
  const hi = Math.max(...values, goal || -Infinity);
  const span = (hi - lo) || 1;
  const xs = entries.length > 1 ? (W - pad * 2) / (entries.length - 1) : 0;

  const pts = entries.map((e, i) => {
    const x = pad + i * xs;
    const y = pad + (H - pad * 2) * (1 - (e.kg - lo) / span);
    return [x, y];
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} ${pts[pts.length - 1][0].toFixed(1)},${H - pad} ${pts[0][0].toFixed(1)},${H - pad}`;
  const goalY = goal ? pad + (H - pad * 2) * (1 - (goal - lo) / span) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={pad} x2={W - pad} y1={pad + i * ((H - pad * 2) / 4)} y2={pad + i * ((H - pad * 2) / 4)}
          stroke={HUB.slate} strokeWidth="1" strokeDasharray="2,4" />
      ))}
      {goalY != null && (
        <>
          <line x1={pad} x2={W - pad} y1={goalY} y2={goalY} stroke={HUB.fog} strokeWidth="1" strokeDasharray="6,6" />
          <text x={W - pad - 4} y={goalY - 6} textAnchor="end" fill={HUB.ash}
            fontFamily="JetBrains Mono, monospace" fontSize="10">GOAL {goal.toFixed(1)}</text>
        </>
      )}
      <polyline fill="rgba(245,208,51,0.12)" stroke="none" points={area} />
      <polyline fill="none" stroke={HUB.yellow} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" points={line} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 2.5} fill={HUB.yellow} />
      ))}
    </svg>
  );
}

function WeightForm({ defaultDate, defaultKg, onSave }) {
  const [date, setDate] = useState(defaultDate);
  const [kg, setKg] = useState(defaultKg);
  const [note, setNote] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <Label>Date</Label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <Label>Weight (kg)</Label>
        <input type="number" value={kg} onChange={(e) => setKg(e.target.value)} step="0.1" min="0" />
      </div>
      <div>
        <Label>Note (optional)</Label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. morning, fasted" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <YellowButton onClick={() => onSave({ date, kg: Number(kg), note })} disabled={!kg}>Save</YellowButton>
      </div>
    </div>
  );
}

function GoalForm({ goal, onSave }) {
  const [g, setG] = useState(goal || '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <Label>Target weight (kg)</Label>
        <input type="number" value={g} onChange={(e) => setG(e.target.value)} step="0.1" min="0" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton onClick={() => onSave(Number(g) || 0)}>Save</YellowButton>
      </div>
    </div>
  );
}
