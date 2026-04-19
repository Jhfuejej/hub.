import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { seedData } from './seed.js';

const STORAGE_KEY = 'hub:state:v1';

const StoreContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch { /* fall through */ }
  return seedData();
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore quota errors */ }
  }, [state]);

  const update = useCallback((fn) => setState((s) => fn(s)), []);

  const api = useMemo(() => ({
    state,

    // Settings
    updateSettings: (patch) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } })),

    // Workouts
    addWorkout: (w) => update((s) => ({ ...s, workouts: [{ ...w, id: uid('w'), createdAt: Date.now() }, ...s.workouts] })),
    updateWorkout: (id, patch) => update((s) => ({
      ...s, workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    })),
    deleteWorkout: (id) => update((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) })),

    // Exercises inside a workout
    addExercise: (workoutId, exercise) => update((s) => ({
      ...s,
      workouts: s.workouts.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: [...w.exercises, { id: uid('ex'), sets: [], ...exercise }] }
          : w,
      ),
    })),
    updateExercise: (workoutId, exId, patch) => update((s) => ({
      ...s,
      workouts: s.workouts.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: w.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) }
          : w,
      ),
    })),
    deleteExercise: (workoutId, exId) => update((s) => ({
      ...s,
      workouts: s.workouts.map((w) =>
        w.id === workoutId ? { ...w, exercises: w.exercises.filter((e) => e.id !== exId) } : w,
      ),
    })),
    addSet: (workoutId, exId, set) => update((s) => ({
      ...s,
      workouts: s.workouts.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: w.exercises.map((e) => (e.id === exId ? { ...e, sets: [...e.sets, { id: uid('set'), done: false, ...set }] } : e)) }
          : w,
      ),
    })),
    updateSet: (workoutId, exId, setId, patch) => update((s) => ({
      ...s,
      workouts: s.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exId
                  ? { ...e, sets: e.sets.map((st) => (st.id === setId ? { ...st, ...patch } : st)) }
                  : e,
              ),
            }
          : w,
      ),
    })),
    deleteSet: (workoutId, exId, setId) => update((s) => ({
      ...s,
      workouts: s.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exId ? { ...e, sets: e.sets.filter((st) => st.id !== setId) } : e,
              ),
            }
          : w,
      ),
    })),

    // Meals / Nutrition
    addMeal: (m) => update((s) => ({ ...s, meals: [{ ...m, id: uid('m') }, ...s.meals] })),
    updateMeal: (id, patch) => update((s) => ({
      ...s, meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
    deleteMeal: (id) => update((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) })),

    addFood: (f) => update((s) => ({ ...s, foods: [{ ...f, id: uid('f') }, ...s.foods] })),
    updateFood: (id, patch) => update((s) => ({
      ...s, foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    })),
    deleteFood: (id) => update((s) => ({ ...s, foods: s.foods.filter((f) => f.id !== id) })),

    // Weight entries
    addWeight: (w) => update((s) => {
      const existing = s.weights.find((x) => x.date === w.date);
      if (existing) {
        return { ...s, weights: s.weights.map((x) => (x.date === w.date ? { ...x, kg: w.kg, note: w.note } : x)) };
      }
      return { ...s, weights: [{ ...w, id: uid('wt') }, ...s.weights].sort((a, b) => a.date.localeCompare(b.date)) };
    }),
    deleteWeight: (id) => update((s) => ({ ...s, weights: s.weights.filter((x) => x.id !== id) })),

    // Habits
    addHabit: (h) => update((s) => ({ ...s, habits: [...s.habits, { ...h, id: uid('h'), log: {} }] })),
    updateHabit: (id, patch) => update((s) => ({
      ...s, habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    })),
    deleteHabit: (id) => update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
    toggleHabit: (id, date) => update((s) => ({
      ...s,
      habits: s.habits.map((h) => {
        if (h.id !== id) return h;
        const log = { ...(h.log || {}) };
        log[date] = !log[date];
        if (!log[date]) delete log[date];
        return { ...h, log };
      }),
    })),

    // Journal entries
    addJournal: (j) => update((s) => ({ ...s, journal: [{ ...j, id: uid('j'), createdAt: Date.now() }, ...s.journal] })),
    updateJournal: (id, patch) => update((s) => ({
      ...s, journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: Date.now() } : j)),
    })),
    deleteJournal: (id) => update((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) })),

    // Transactions / Finance
    addTransaction: (t) => update((s) => ({ ...s, transactions: [{ ...t, id: uid('t') }, ...s.transactions] })),
    updateTransaction: (id, patch) => update((s) => ({
      ...s, transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
    deleteTransaction: (id) => update((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) })),

    // Tasks
    addTask: (t) => update((s) => ({ ...s, tasks: [{ ...t, id: uid('tk'), done: false, createdAt: Date.now() }, ...s.tasks] })),
    updateTask: (id, patch) => update((s) => ({
      ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
    toggleTask: (id) => update((s) => ({
      ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),
    deleteTask: (id) => update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),

    // Reset everything (for debugging)
    resetAll: () => setState(seedData()),
  }), [state, update]);

  return React.createElement(StoreContext.Provider, { value: api }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
