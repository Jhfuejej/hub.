import { useEffect, useMemo, useState } from 'react';
import { StoreProvider, useStore, todayISO } from './store/store.js';
import { Sidebar } from './components/Sidebar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { QuickAdd } from './components/QuickAdd.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Workouts } from './pages/Workouts.jsx';
import { Nutrition } from './pages/Nutrition.jsx';
import { Weight } from './pages/Weight.jsx';
import { Habits } from './pages/Habits.jsx';
import { Journal } from './pages/Journal.jsx';
import { Finances } from './pages/Finances.jsx';
import { Tasks } from './pages/Tasks.jsx';
import { fmtDateFull, macroTotals, streakOf, volumeFor } from './lib/format.js';

const HASH_TO_NAV = ['dashboard', 'workouts', 'nutrition', 'weight', 'habits', 'journal', 'finances', 'tasks'];

function readHash() {
  const h = (window.location.hash || '').replace('#', '');
  return HASH_TO_NAV.includes(h) ? h : 'dashboard';
}

function Shell() {
  const { state } = useStore();
  const [nav, setNav] = useState(readHash);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    window.location.hash = nav;
  }, [nav]);

  useEffect(() => {
    const onHash = () => setNav(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K opens quick add
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const subtitles = useMemo(() => {
    const today = todayISO();
    const meals = state.meals.filter((m) => m.date === today);
    const totals = macroTotals(meals);
    const w = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
    const lastW = w[w.length - 1];
    const prevW = w[w.length - 2];
    const trend = lastW && prevW ? (lastW.kg - prevW.kg) : 0;
    const habitsDone = state.habits.filter((h) => (h.log || {})[today]).length;
    const tasksOpen = state.tasks.filter((t) => !t.done).length;
    const overdue = state.tasks.filter((t) => !t.done && t.due && t.due < today).length;
    const active = state.workouts.find((x) => !x.completedAt);
    const txMonth = state.transactions.filter((t) => {
      const d = new Date(); d.setDate(1);
      return t.date >= d.toISOString().slice(0, 10);
    });
    const monthNet = txMonth.reduce((a, t) => a + t.amount, 0);

    return {
      dashboard: fmtDateFull(today),
      workouts:  active ? `${active.name} · in progress` : `${state.workouts.length} sessions`,
      nutrition: `Today · ${totals.kcal.toLocaleString()} kcal`,
      weight:    lastW ? (trend === 0 ? 'No change' : trend < 0 ? 'Trending down' : 'Trending up') : 'No data',
      habits:    `${habitsDone} of ${state.habits.length}`,
      journal:   `${state.journal.length} entries`,
      finances:  `Net ${monthNet >= 0 ? '+' : '−'}$${Math.abs(monthNet).toFixed(2)} · this month`,
      tasks:     overdue ? `${overdue} overdue · ${tasksOpen} open` : `${tasksOpen} open`,
    };
  }, [state]);

  const titles = {
    dashboard: 'Dashboard',
    workouts:  'Workouts',
    nutrition: 'Nutrition',
    weight:    'Weight',
    habits:    'Habits',
    journal:   'Journal',
    finances:  'Finances',
    tasks:     'Tasks',
  };

  const Page = () => {
    switch (nav) {
      case 'dashboard': return <Dashboard onNav={setNav} />;
      case 'workouts':  return <Workouts />;
      case 'nutrition': return <Nutrition />;
      case 'weight':    return <Weight />;
      case 'habits':    return <Habits />;
      case 'journal':   return <Journal />;
      case 'finances':  return <Finances />;
      case 'tasks':     return <Tasks />;
      default:          return <Dashboard onNav={setNav} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={nav} onNav={setNav} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          title={titles[nav]}
          sub={subtitles[nav]}
          onQuickAdd={() => setQuickOpen(true)}
          addLabel="+ Quick add"
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Page />
        </div>
      </div>
      <QuickAdd open={quickOpen} onClose={() => setQuickOpen(false)} onNavigate={setNav} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
