function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function seedData() {
  const today = daysAgo(0);
  return {
    settings: {
      user: { name: 'Alex', initial: 'A' },
      nutrition: { calorieGoal: 2400, proteinGoal: 180, carbsGoal: 260, fatGoal: 75 },
      weight: { goal: 80, unit: 'kg' },
    },
    workouts: [
      {
        id: 'w_seed_1',
        name: 'Push · Chest & Triceps',
        date: today,
        startedAt: Date.now() - 41 * 60 * 1000,
        completedAt: null,
        notes: '',
        exercises: [
          {
            id: 'ex_1', name: 'Bench press',
            sets: [
              { id: 's1', weight: 80, reps: 8, done: true },
              { id: 's2', weight: 80, reps: 8, done: true },
              { id: 's3', weight: 80, reps: 7, done: true },
              { id: 's4', weight: 80, reps: 6, done: false },
            ],
          },
          {
            id: 'ex_2', name: 'Incline DB press',
            sets: [
              { id: 's5', weight: 28, reps: 10, done: true },
              { id: 's6', weight: 28, reps: 10, done: true },
              { id: 's7', weight: 28, reps: 9, done: false },
            ],
          },
          {
            id: 'ex_3', name: 'Tricep pushdown',
            sets: [
              { id: 's8', weight: 40, reps: 12, done: false },
            ],
          },
        ],
      },
      {
        id: 'w_seed_2',
        name: 'Legs · Quads',
        date: daysAgo(2),
        startedAt: Date.now() - 2 * 86400000,
        completedAt: Date.now() - 2 * 86400000 + 55 * 60 * 1000,
        notes: '',
        exercises: [
          {
            id: 'ex_4', name: 'Back squat',
            sets: [
              { id: 's9', weight: 100, reps: 6, done: true },
              { id: 's10', weight: 100, reps: 6, done: true },
              { id: 's11', weight: 100, reps: 5, done: true },
            ],
          },
          {
            id: 'ex_5', name: 'Leg press',
            sets: [
              { id: 's12', weight: 180, reps: 10, done: true },
              { id: 's13', weight: 180, reps: 10, done: true },
            ],
          },
        ],
      },
      {
        id: 'w_seed_3',
        name: 'Pull · Back & Biceps',
        date: daysAgo(4),
        startedAt: Date.now() - 4 * 86400000,
        completedAt: Date.now() - 4 * 86400000 + 48 * 60 * 1000,
        notes: '',
        exercises: [
          {
            id: 'ex_6', name: 'Deadlift',
            sets: [
              { id: 's14', weight: 120, reps: 5, done: true },
              { id: 's15', weight: 120, reps: 5, done: true },
              { id: 's16', weight: 120, reps: 5, done: true },
            ],
          },
          {
            id: 'ex_7', name: 'Pull-ups',
            sets: [
              { id: 's17', weight: 0, reps: 10, done: true },
              { id: 's18', weight: 0, reps: 8, done: true },
            ],
          },
        ],
      },
    ],
    foods: [
      { id: 'f_1', name: 'Oats with whey', kcal: 420, protein: 40, carbs: 55, fat: 8, serving: '1 bowl' },
      { id: 'f_2', name: 'Chicken & rice', kcal: 680, protein: 55, carbs: 80, fat: 12, serving: '1 plate' },
      { id: 'f_3', name: 'Greek yogurt', kcal: 180, protein: 18, carbs: 12, fat: 6, serving: '200g' },
      { id: 'f_4', name: 'Salmon & greens', kcal: 562, protein: 42, carbs: 18, fat: 34, serving: '1 serving' },
      { id: 'f_5', name: 'Banana', kcal: 105, protein: 1, carbs: 27, fat: 0, serving: '1 medium' },
      { id: 'f_6', name: 'Peanut butter', kcal: 190, protein: 7, carbs: 6, fat: 16, serving: '2 tbsp' },
      { id: 'f_7', name: 'Whey shake', kcal: 150, protein: 30, carbs: 4, fat: 2, serving: '1 scoop + water' },
      { id: 'f_8', name: 'Eggs scrambled', kcal: 220, protein: 16, carbs: 2, fat: 16, serving: '3 eggs' },
    ],
    meals: [
      { id: 'm_1', foodId: 'f_1', name: 'Oats with whey', kcal: 420, protein: 40, carbs: 55, fat: 8, date: today, time: '08:12', slot: 'breakfast' },
      { id: 'm_2', foodId: 'f_2', name: 'Chicken & rice', kcal: 680, protein: 55, carbs: 80, fat: 12, date: today, time: '13:30', slot: 'lunch' },
      { id: 'm_3', foodId: 'f_3', name: 'Greek yogurt', kcal: 180, protein: 18, carbs: 12, fat: 6, date: today, time: '16:05', slot: 'snack' },
      { id: 'm_4', foodId: 'f_4', name: 'Salmon & greens', kcal: 562, protein: 42, carbs: 18, fat: 34, date: today, time: '19:45', slot: 'dinner' },
      { id: 'm_5', foodId: 'f_1', name: 'Oats with whey', kcal: 420, protein: 40, carbs: 55, fat: 8, date: daysAgo(1), time: '08:30', slot: 'breakfast' },
      { id: 'm_6', foodId: 'f_2', name: 'Chicken & rice', kcal: 680, protein: 55, carbs: 80, fat: 12, date: daysAgo(1), time: '13:10', slot: 'lunch' },
    ],
    weights: [
      { id: 'wt_1', date: daysAgo(30), kg: 84.1, note: '' },
      { id: 'wt_2', date: daysAgo(21), kg: 83.6, note: '' },
      { id: 'wt_3', date: daysAgo(14), kg: 83.2, note: '' },
      { id: 'wt_4', date: daysAgo(10), kg: 83.0, note: '' },
      { id: 'wt_5', date: daysAgo(7), kg: 82.7, note: '' },
      { id: 'wt_6', date: daysAgo(4), kg: 82.6, note: '' },
      { id: 'wt_7', date: daysAgo(2), kg: 82.5, note: '' },
      { id: 'wt_8', date: today, kg: 82.4, note: '' },
    ],
    habits: [
      { id: 'h_1', name: 'Protein ≥ 120g', icon: 'flame', log: buildLog(12) },
      { id: 'h_2', name: 'Trained', icon: 'dumbbell', log: buildLog(7, 2) },
      { id: 'h_3', name: '8,000 steps', icon: 'trend', log: buildLog(18) },
      { id: 'h_4', name: 'Read 20 min', icon: 'book', log: buildLog(6) },
      { id: 'h_5', name: 'Journal', icon: 'edit', log: buildLog(9) },
      { id: 'h_6', name: 'No alcohol', icon: 'moon', log: buildLog(3) },
      { id: 'h_7', name: 'Sleep by 11', icon: 'moon', log: buildLog(5) },
    ],
    journal: [
      {
        id: 'j_1', date: today, title: 'Long run, felt easy.',
        body: "Went out for 10k at dawn. Hit the loop in 48 minutes — fastest since February. The new shoes make a difference, but it's mostly that I finally stopped ramping mileage too fast.\n\nLegs are still sore from Wednesday's squats. Noticing a pattern: when I sleep under 7 hours, recovery stalls. Going to try a hard cutoff at 23:00 this week.\n\nFood was clean. Protein 134g, kcal 2,180 — under target but I wasn't hungry.",
        createdAt: Date.now(),
      },
      {
        id: 'j_2', date: daysAgo(1), title: 'Deload week thoughts.',
        body: 'Backed weights down 20%. Feels wrong but bar speed is faster than it has been in months. Trust the cycle.',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'j_3', date: daysAgo(2), title: 'New PR on deadlift.',
        body: '140kg × 3 clean. Grip felt bulletproof. Rest of the session was maintenance.',
        createdAt: Date.now() - 2 * 86400000,
      },
      {
        id: 'j_4', date: daysAgo(3), title: 'Sleep was off.',
        body: 'Only got 5.5 hours. Workout intensity suffered — dropped bench by 5kg. Correlation = causation here.',
        createdAt: Date.now() - 3 * 86400000,
      },
    ],
    transactions: [
      { id: 't_1', date: today, amount: -42.50, category: 'Groceries', note: 'Weekly shop' },
      { id: 't_2', date: daysAgo(1), amount: -12.00, category: 'Coffee', note: 'Morning flat white' },
      { id: 't_3', date: daysAgo(2), amount: 2800.00, category: 'Income', note: 'Salary' },
      { id: 't_4', date: daysAgo(3), amount: -68.00, category: 'Gym', note: 'Monthly membership' },
      { id: 't_5', date: daysAgo(5), amount: -230.00, category: 'Rent', note: 'Utilities' },
      { id: 't_6', date: daysAgo(7), amount: -45.00, category: 'Dining', note: 'Dinner out' },
      { id: 't_7', date: daysAgo(10), amount: -18.00, category: 'Transit', note: 'Weekly pass' },
    ],
    tasks: [
      { id: 'tk_1', title: 'Program next mesocycle', done: false, priority: 'high', due: today },
      { id: 'tk_2', title: 'Order whey protein', done: false, priority: 'med', due: today },
      { id: 'tk_3', title: 'Book dentist', done: false, priority: 'low', due: daysAgo(-3) },
      { id: 'tk_4', title: 'Update resume', done: true, priority: 'low', due: daysAgo(1) },
      { id: 'tk_5', title: 'Run 5k easy', done: true, priority: 'med', due: today },
    ],
  };
}

function buildLog(count, skip = 0) {
  const log = {};
  let placed = 0;
  for (let i = skip; placed < count && i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    log[d.toISOString().slice(0, 10)] = true;
    placed++;
  }
  return log;
}
