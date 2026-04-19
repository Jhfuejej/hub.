import { useState } from 'react';
import { HUB, YellowButton, GhostButton, Label, Segmented } from './primitives.jsx';
import { Icon } from './Icon.jsx';
import { Modal } from './Modal.jsx';
import { useStore, todayISO } from '../store/store.js';

const TYPES = [
  { value: 'task',    label: 'Task',    icon: 'check' },
  { value: 'meal',    label: 'Meal',    icon: 'utensils' },
  { value: 'weight',  label: 'Weight',  icon: 'scale' },
  { value: 'journal', label: 'Journal', icon: 'book' },
  { value: 'tx',      label: 'Money',   icon: 'wallet' },
];

export function QuickAdd({ open, onClose, onNavigate }) {
  const { addTask, addMeal, addWeight, addJournal, addTransaction } = useStore();
  const [type, setType] = useState('task');

  const close = () => { onClose(); setType('task'); };

  return (
    <Modal open={open} onClose={close} subtitle="Anywhere" title="Quick add" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Label>What to add</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 8px', borderRadius: 10,
                background: type === t.value ? HUB.yellow : HUB.ink,
                color: type === t.value ? HUB.black : HUB.ash,
                border: 0, cursor: 'pointer', transition: 'all 120ms',
              }}
            >
              <Icon name={t.icon} size={18} />
              <div style={{
                fontFamily: HUB.font, fontWeight: 700, fontSize: 10,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {t.label}
              </div>
            </button>
          ))}
        </div>

        {type === 'task' && (
          <QuickTaskForm onSave={(t) => { addTask(t); close(); onNavigate?.('tasks'); }} />
        )}
        {type === 'meal' && (
          <QuickMealForm onSave={(m) => { addMeal(m); close(); onNavigate?.('nutrition'); }} />
        )}
        {type === 'weight' && (
          <QuickWeightForm onSave={(w) => { addWeight(w); close(); onNavigate?.('weight'); }} />
        )}
        {type === 'journal' && (
          <QuickJournalForm onSave={(j) => { addJournal(j); close(); onNavigate?.('journal'); }} />
        )}
        {type === 'tx' && (
          <QuickTxForm onSave={(t) => { addTransaction(t); close(); onNavigate?.('finances'); }} />
        )}
      </div>
    </Modal>
  );
}

function QuickTaskForm({ onSave }) {
  const [title, setTitle] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Label>Task</Label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) onSave({ title: title.trim(), priority: 'med', due: todayISO() }); }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton onClick={() => title.trim() && onSave({ title: title.trim(), priority: 'med', due: todayISO() })} disabled={!title.trim()}>
          Add task
        </YellowButton>
      </div>
    </div>
  );
}

function QuickMealForm({ onSave }) {
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Label>Meal</Label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What did you eat?" autoFocus />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input type="number" placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} min="0" />
        <select defaultValue="snack" id="qa-slot">
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="snack">Snack</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton
          onClick={() => {
            if (!name.trim() || !kcal) return;
            const slot = document.getElementById('qa-slot').value;
            const d = new Date();
            const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            onSave({ name: name.trim(), kcal: Number(kcal), protein: 0, carbs: 0, fat: 0, date: todayISO(), time, slot });
          }}
          disabled={!name.trim() || !kcal}
        >
          Log meal
        </YellowButton>
      </div>
    </div>
  );
}

function QuickWeightForm({ onSave }) {
  const [kg, setKg] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Label>Weight (kg)</Label>
      <input type="number" value={kg} onChange={(e) => setKg(e.target.value)} step="0.1" min="0" autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter' && kg) onSave({ date: todayISO(), kg: Number(kg), note: '' }); }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton onClick={() => kg && onSave({ date: todayISO(), kg: Number(kg), note: '' })} disabled={!kg}>
          Log weight
        </YellowButton>
      </div>
    </div>
  );
}

function QuickJournalForm({ onSave }) {
  const [title, setTitle] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Label>Title (you can fill body later)</Label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A few words…" autoFocus />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton onClick={() => title.trim() && onSave({ title: title.trim(), body: '', date: todayISO() })} disabled={!title.trim()}>
          New entry
        </YellowButton>
      </div>
    </div>
  );
}

function QuickTxForm({ onSave }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Segmented
        options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
        value={type}
        onChange={setType}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" autoFocus />
        <input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <YellowButton
          onClick={() => {
            if (!amount) return;
            const a = Number(amount);
            onSave({
              amount: type === 'income' ? Math.abs(a) : -Math.abs(a),
              date: todayISO(),
              category: type === 'income' ? 'Income' : 'Misc',
              note: note.trim(),
            });
          }}
          disabled={!amount}
        >
          Log {type === 'income' ? 'income' : 'expense'}
        </YellowButton>
      </div>
    </div>
  );
}
