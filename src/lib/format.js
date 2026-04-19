const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtDateFull(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${DAYS_SHORT[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtDay(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return DAYS[d.getDay()];
}

export function fmtDayShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return DAYS_SHORT[d.getDay()];
}

export function fmtNum(n, decimals = 0) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtMoney(amount) {
  const sign = amount < 0 ? '−' : '+';
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtRelative(iso) {
  const today = new Date().toISOString().slice(0, 10);
  if (iso === today) return 'Today';
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / 86400000);
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)}d ago`;
  if (diff > 0 && diff <= 7) return `In ${diff}d`;
  return fmtDate(iso);
}

export function volumeFor(workout) {
  let total = 0;
  for (const ex of workout.exercises || []) {
    for (const s of ex.sets || []) {
      if (s.done) total += (Number(s.weight) || 0) * (Number(s.reps) || 0);
    }
  }
  return total;
}

export function durationFor(workout) {
  if (!workout.startedAt) return 0;
  const end = workout.completedAt || Date.now();
  return Math.round((end - workout.startedAt) / 60000);
}

export function macroTotals(meals) {
  return meals.reduce((acc, m) => ({
    kcal:    acc.kcal    + (Number(m.kcal)    || 0),
    protein: acc.protein + (Number(m.protein) || 0),
    carbs:   acc.carbs   + (Number(m.carbs)   || 0),
    fat:     acc.fat     + (Number(m.fat)     || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

export function streakOf(habit, upTo = new Date()) {
  const log = habit.log || {};
  let count = 0;
  const d = new Date(upTo);
  d.setHours(0, 0, 0, 0);
  while (true) {
    const iso = d.toISOString().slice(0, 10);
    if (log[iso]) {
      count++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return count;
}
