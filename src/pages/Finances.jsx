import { useMemo, useState } from 'react';
import { Card, HUB, Metric, Overline, YellowButton, GhostButton, IconButton, Label, Segmented, EmptyState } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { Modal } from '../components/Modal.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtDate, fmtDayShort, fmtMoney } from '../lib/format.js';

const CATEGORIES = ['Income', 'Groceries', 'Dining', 'Coffee', 'Rent', 'Transit', 'Gym', 'Subscriptions', 'Travel', 'Misc'];

export function Finances() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('month'); // month | all

  const monthCutoff = useMemo(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const sorted = useMemo(
    () => [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [state.transactions],
  );

  const inView = view === 'month' ? sorted.filter((t) => t.date >= monthCutoff) : sorted;

  const income = inView.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expenses = inView.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  const net = income - expenses;

  const byCategory = useMemo(() => {
    const map = new Map();
    for (const t of inView) {
      if (t.amount >= 0) continue;
      const key = t.category || 'Misc';
      map.set(key, (map.get(key) || 0) + Math.abs(t.amount));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [inView]);

  const maxCat = byCategory.length ? byCategory[0][1] : 1;

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Segmented
          options={[{ value: 'month', label: 'This month' }, { value: 'all', label: 'All time' }]}
          value={view}
          onChange={setView}
        />
        <YellowButton onClick={() => { setEditing(null); setOpen(true); }}>+ Add transaction</YellowButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <Card lit style={{ padding: 28, minHeight: 160 }}>
          <Overline color="rgba(10,10,10,0.65)">Net · {view === 'month' ? 'This month' : 'All time'}</Overline>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{
              fontFamily: HUB.font, fontWeight: 900, fontSize: 60,
              letterSpacing: '-0.04em', lineHeight: 0.9, color: HUB.black,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtMoney(net)}
            </div>
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 12, color: 'rgba(10,10,10,0.65)', marginTop: 12 }}>
            {inView.length} transactions
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <Overline>Income</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unit="$" size={28} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.success, marginTop: 10 }}>↑ in</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Expenses</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unit="$" size={28} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.warning, marginTop: 10 }}>↓ out</div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Top category</Overline>
          <div style={{
            marginTop: 12, fontFamily: HUB.font, fontWeight: 900, fontSize: 22,
            letterSpacing: '-0.02em',
          }}>
            {byCategory[0]?.[0] || '—'}
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>
            {byCategory[0] ? `$${byCategory[0][1].toFixed(2)} spent` : 'No expenses'}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <Overline>Transactions</Overline>
          {inView.length === 0 ? (
            <EmptyState
              icon="wallet"
              title="No transactions"
              body="Add an income or expense to start tracking."
              action={<YellowButton onClick={() => setOpen(true)}>+ Add transaction</YellowButton>}
            />
          ) : (
            <div style={{ marginTop: 14 }}>
              {inView.map((t, i) => (
                <div key={t.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr auto auto',
                  alignItems: 'center', gap: 14,
                  padding: '12px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: HUB.slate, display: 'grid', placeItems: 'center',
                    color: t.amount >= 0 ? HUB.success : HUB.ash,
                  }}>
                    <Icon name={t.amount >= 0 ? 'trend' : 'wallet'} size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 13 }}>
                      {t.note || t.category}
                    </div>
                    <div style={{ fontFamily: HUB.mono, fontSize: 10, color: HUB.fog, marginTop: 2 }}>
                      {fmtDate(t.date)} · {fmtDayShort(t.date)} · {t.category}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: HUB.font, fontWeight: 800, fontSize: 14,
                    fontVariantNumeric: 'tabular-nums',
                    color: t.amount >= 0 ? HUB.success : '#fff',
                  }}>
                    {fmtMoney(t.amount)}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <IconButton name="edit" onClick={() => { setEditing(t); setOpen(true); }} size={12} title="Edit" />
                    <IconButton name="trash" onClick={() => { if (confirm('Delete transaction?')) deleteTransaction(t.id); }} size={12} title="Delete" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ padding: 24 }}>
          <Overline>By category</Overline>
          {byCategory.length === 0 ? (
            <div style={{ padding: '20px 0', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12, textAlign: 'center' }}>
              No expenses.
            </div>
          ) : (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byCategory.map(([cat, total], i) => {
                const pct = (total / maxCat) * 100;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontFamily: HUB.font, fontWeight: 700, fontSize: 12 }}>{cat}</div>
                      <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.ash }}>${total.toFixed(2)}</div>
                    </div>
                    <div style={{ height: 6, background: HUB.slate, borderRadius: 999 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: i === 0 ? HUB.yellow : HUB.bone,
                        borderRadius: 999, transition: 'width 360ms',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        subtitle={editing ? 'Edit' : 'Create'}
        title={editing ? 'Edit transaction' : 'New transaction'}
        width={500}
      >
        <TransactionForm
          tx={editing}
          onSave={(data) => {
            if (editing) updateTransaction(editing.id, data);
            else addTransaction(data);
            setOpen(false); setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

function TransactionForm({ tx, onSave }) {
  const [type, setType] = useState(tx ? (tx.amount >= 0 ? 'income' : 'expense') : 'expense');
  const [amount, setAmount] = useState(tx ? Math.abs(tx.amount) : '');
  const [date, setDate] = useState(tx?.date || todayISO());
  const [category, setCategory] = useState(tx?.category || 'Groceries');
  const [note, setNote] = useState(tx?.note || '');

  const submit = () => {
    const a = Number(amount) || 0;
    onSave({
      amount: type === 'income' ? Math.abs(a) : -Math.abs(a),
      date, category, note: note.trim(),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Segmented
        options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
        value={type}
        onChange={(v) => { setType(v); if (v === 'income' && !tx) setCategory('Income'); }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label>Amount</Label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" min="0" autoFocus />
        </div>
        <div>
          <Label>Date</Label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <Label>Note (optional)</Label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. weekly shop" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <YellowButton onClick={submit} disabled={!amount}>{tx ? 'Save' : 'Add'}</YellowButton>
      </div>
    </div>
  );
}
