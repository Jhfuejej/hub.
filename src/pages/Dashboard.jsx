import { useMemo } from 'react';
import { Card, HUB, Metric, Overline, ProgressBar, YellowButton, Badge } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtDate, fmtDayShort, macroTotals, streakOf, volumeFor } from '../lib/format.js';

function buildPoints(values, width = 600, height = 140, pad = 8) {
  if (!values.length) return { line: '', area: '' };
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (height - pad * 2) * (1 - (v - lo) / span);
    return [x, y];
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} ${pts[pts.length - 1][0].toFixed(1)},${height} ${pts[0][0].toFixed(1)},${height}`;
  return { line, area, pts };
}

export function Dashboard({ onNav }) {
  const { state } = useStore();
  const today = todayISO();

  const todaysMeals = useMemo(() => state.meals.filter((m) => m.date === today), [state.meals, today]);
  const macros = macroTotals(todaysMeals);
  const goals = state.settings.nutrition;

  const recentWorkouts = useMemo(
    () => [...state.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    [state.workouts],
  );

  const weightSeries = useMemo(() => {
    const recent = [...state.weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
    return recent;
  }, [state.weights]);

  const latestWeight = weightSeries[weightSeries.length - 1];
  const firstWeight = weightSeries[0];
  const weightDelta = latestWeight && firstWeight ? (latestWeight.kg - firstWeight.kg) : 0;

  const weekVolume = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const cutoff = since.toISOString().slice(0, 10);
    return state.workouts
      .filter((w) => w.date >= cutoff)
      .reduce((acc, w) => acc + volumeFor(w), 0);
  }, [state.workouts]);

  const habitsToday = useMemo(
    () => state.habits.map((h) => ({ ...h, doneToday: !!(h.log || {})[today] })),
    [state.habits, today],
  );
  const habitsDone = habitsToday.filter((h) => h.doneToday).length;

  const topStreak = useMemo(() => {
    return state.habits.reduce((max, h) => Math.max(max, streakOf(h)), 0);
  }, [state.habits]);

  const chartData = useMemo(() => buildPoints(weightSeries.map((w) => w.kg)), [weightSeries]);

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1440 }}>
      {/* Hero metric row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16 }}>
        <Card
          lit
          hoverable
          onClick={() => onNav('nutrition')}
          style={{
            padding: 28, minHeight: 160,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          <Overline color="rgba(10,10,10,0.65)">Calories · Today</Overline>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{
                fontFamily: HUB.font, fontWeight: 900, fontSize: 72,
                letterSpacing: '-0.04em', lineHeight: 0.9, color: HUB.black,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {macros.kcal.toLocaleString()}
              </div>
              <div style={{
                fontFamily: HUB.font, fontWeight: 700, fontSize: 18,
                color: 'rgba(10,10,10,0.5)',
              }}>
                / {goals.calorieGoal.toLocaleString()} kcal
              </div>
            </div>
            <div style={{
              display: 'flex', gap: 18, marginTop: 14,
              fontFamily: HUB.mono, fontSize: 12, color: 'rgba(10,10,10,0.7)',
            }}>
              <span>P {Math.round(macros.protein)}g</span>
              <span>C {Math.round(macros.carbs)}g</span>
              <span>F {Math.round(macros.fat)}g</span>
            </div>
          </div>
        </Card>

        <Card hoverable onClick={() => onNav('weight')} style={{ padding: 20 }}>
          <Overline>Weight</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={latestWeight ? latestWeight.kg.toFixed(1) : '—'} unit="kg" size={40} />
          </div>
          <div style={{
            fontFamily: HUB.mono, fontSize: 11,
            color: weightDelta <= 0 ? HUB.success : HUB.warning, marginTop: 10,
          }}>
            {weightDelta === 0 ? '— no change' :
              weightDelta < 0 ? `↓ ${Math.abs(weightDelta).toFixed(1)} kg` : `↑ ${weightDelta.toFixed(1)} kg`}
          </div>
        </Card>

        <Card hoverable onClick={() => onNav('habits')} style={{ padding: 20 }}>
          <Overline>Streak</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={topStreak} unit="d" size={40} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>
            Top habit streak
          </div>
        </Card>

        <Card hoverable onClick={() => onNav('workouts')} style={{ padding: 20 }}>
          <Overline>Week volume</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={(weekVolume / 1000).toFixed(1)} unit="t" accent size={40} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>
            {state.workouts.filter((w) => w.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length} sessions
          </div>
        </Card>
      </div>

      {/* Chart + habits */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Overline>Weight · Recent</Overline>
              <div style={{ marginTop: 6 }}>
                <Metric value={latestWeight ? latestWeight.kg.toFixed(1) : '—'} unit="kg" size={28} />
              </div>
            </div>
            <YellowButton onClick={() => onNav('weight')} style={{ padding: '8px 14px', fontSize: 10 }}>
              Log weight
            </YellowButton>
          </div>
          {weightSeries.length > 1 ? (
            <svg viewBox="0 0 600 180" width="100%" height="180" preserveAspectRatio="none">
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" x2="600" y1={40 + i * 40} y2={40 + i * 40}
                  stroke={HUB.slate} strokeWidth="1" strokeDasharray="2,4"/>
              ))}
              <polyline fill="rgba(245,208,51,0.12)" stroke="none" points={chartData.area} />
              <polyline fill="none" stroke={HUB.yellow} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" points={chartData.line}/>
              {chartData.pts && chartData.pts.length > 0 && (
                <>
                  <circle cx={chartData.pts[chartData.pts.length - 1][0]} cy={chartData.pts[chartData.pts.length - 1][1]} r="4" fill={HUB.yellow}/>
                  <circle cx={chartData.pts[chartData.pts.length - 1][0]} cy={chartData.pts[chartData.pts.length - 1][1]} r="8" fill={HUB.yellow} fillOpacity="0.25"/>
                </>
              )}
            </svg>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12 }}>
              Log weight entries to see the trend.
            </div>
          )}
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Overline>Habits · Today</Overline>
            <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.yellow }}>
              {habitsDone} / {habitsToday.length}
            </div>
          </div>
          {habitsToday.length === 0 && (
            <div style={{ padding: '20px 0', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12, textAlign: 'center' }}>
              No habits yet.
            </div>
          )}
          {habitsToday.map((h, i) => (
            <div
              key={h.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: i < habitsToday.length - 1 ? `1px solid ${HUB.slate}` : 'none',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: h.doneToday ? HUB.yellow : 'transparent',
                border: h.doneToday ? 'none' : `1.5px solid ${HUB.steel}`,
                display: 'grid', placeItems: 'center',
              }}>
                {h.doneToday && <Icon name="check" size={12} color={HUB.black} />}
              </div>
              <div style={{
                flex: 1, fontFamily: HUB.font, fontWeight: 500, fontSize: 12,
                color: h.doneToday ? HUB.bone : HUB.ash,
              }}>
                {h.name}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Workouts + Meals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Overline>Workouts · Recent</Overline>
            <div
              onClick={() => onNav('workouts')}
              style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.yellow, cursor: 'pointer', letterSpacing: '0.08em' }}
            >
              VIEW ALL →
            </div>
          </div>
          {recentWorkouts.length === 0 && (
            <div style={{ padding: '20px 0', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12, textAlign: 'center' }}>
              No workouts yet.
            </div>
          )}
          {recentWorkouts.map((w, i) => {
            const vol = volumeFor(w);
            const done = !!w.completedAt;
            return (
              <div
                key={w.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0',
                  borderBottom: i < recentWorkouts.length - 1 ? `1px solid ${HUB.slate}` : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: HUB.slate,
                  display: 'grid', placeItems: 'center', color: done ? HUB.ash : HUB.yellow,
                }}>
                  <Icon name="dumbbell" size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 13 }}>{w.name}</div>
                  <div style={{
                    fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2,
                  }}>
                    {fmtDate(w.date)} · {fmtDayShort(w.date)}
                    {!done && <span style={{ color: HUB.yellow, marginLeft: 8 }}>IN PROGRESS</span>}
                  </div>
                </div>
                <div style={{
                  fontFamily: HUB.font, fontWeight: 800, fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                  color: done ? '#fff' : HUB.yellow,
                }}>
                  {vol.toLocaleString()} kg
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Overline>Today's meals</Overline>
            <div
              onClick={() => onNav('nutrition')}
              style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.yellow, cursor: 'pointer', letterSpacing: '0.08em' }}
            >
              VIEW ALL →
            </div>
          </div>
          {todaysMeals.length === 0 && (
            <div style={{ padding: '20px 0', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12, textAlign: 'center' }}>
              No meals logged today.
            </div>
          )}
          {todaysMeals.slice(0, 5).map((m, i) => (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < Math.min(todaysMeals.length, 5) - 1 ? `1px solid ${HUB.slate}` : 'none',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: HUB.slate,
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name="utensils" size={16} color={HUB.ash} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>
                  {m.time}
                  {m.slot && <span style={{ marginLeft: 6, textTransform: 'uppercase', color: HUB.ash }}>· {m.slot}</span>}
                </div>
              </div>
              <div style={{
                fontFamily: HUB.font, fontWeight: 800, fontSize: 13,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {Math.round(m.kcal)} kcal
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Macros progress bar row */}
      <Card style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { label: 'Calories', val: macros.kcal, goal: goals.calorieGoal, unit: 'kcal', accent: true },
            { label: 'Protein',  val: macros.protein, goal: goals.proteinGoal, unit: 'g' },
            { label: 'Carbs',    val: macros.carbs, goal: goals.carbsGoal, unit: 'g' },
            { label: 'Fat',      val: macros.fat, goal: goals.fatGoal, unit: 'g' },
          ].map((m) => {
            const pct = m.goal ? (m.val / m.goal) * 100 : 0;
            return (
              <div key={m.label}>
                <Overline>{m.label}</Overline>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
                  <div style={{
                    fontFamily: HUB.font, fontWeight: 800, fontSize: 24,
                    color: m.accent ? HUB.yellow : '#fff',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {Math.round(m.val)}
                  </div>
                  <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog }}>
                    / {m.goal} {m.unit}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <ProgressBar pct={pct} color={m.accent ? HUB.yellow : HUB.bone} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
