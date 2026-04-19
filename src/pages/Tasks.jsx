import { useMemo, useState } from 'react';
import { Card, HUB, Metric, Overline, YellowButton, GhostButton, IconButton, Label, Segmented, Badge, EmptyState } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { Modal } from '../components/Modal.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtRelative } from '../lib/format.js';

const PRIORITIES = [
  { value: 'high', label: 'High', variant: 'danger' },
  { value: 'med',  label: 'Med',  variant: 'warning' },
  { value: 'low',  label: 'Low',  variant: 'neutral' },
];

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
  { value: 'all',  label: 'All' },
];

function priorityRank(p) {
  return p === 'high' ? 0 : p === 'med' ? 1 : 2;
}

export function Tasks() {
  const { state, addTask, updateTask, toggleTask, deleteTask } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('open');
  const [quick, setQuick] = useState('');

  const today = todayISO();

  const tasks = useMemo(() => {
    const list = state.tasks.filter((t) => {
      if (filter === 'open') return !t.done;
      if (filter === 'done') return t.done;
      return true;
    });
    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pa = priorityRank(a.priority), pb = priorityRank(b.priority);
      if (pa !== pb) return pa - pb;
      return (a.due || '').localeCompare(b.due || '');
    });
  }, [state.tasks, filter]);

  const groups = useMemo(() => {
    const overdue = []; const dueToday = []; const upcoming = []; const undated = []; const done = [];
    for (const t of tasks) {
      if (t.done) { done.push(t); continue; }
      if (!t.due) { undated.push(t); continue; }
      if (t.due < today) overdue.push(t);
      else if (t.due === today) dueToday.push(t);
      else upcoming.push(t);
    }
    return { overdue, dueToday, upcoming, undated, done };
  }, [tasks, today]);

  const open_ = state.tasks.filter((t) => !t.done).length;
  const dueTodayCount = state.tasks.filter((t) => !t.done && t.due === today).length;
  const overdueCount = state.tasks.filter((t) => !t.done && t.due && t.due < today).length;

  const quickAdd = () => {
    if (!quick.trim()) return;
    addTask({ title: quick.trim(), priority: 'med', due: today });
    setQuick('');
  };

  return (
    <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1440 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <Card lit style={{ padding: 28, minHeight: 160 }}>
          <Overline color="rgba(10,10,10,0.65)">Open</Overline>
          <div style={{
            marginTop: 14,
            fontFamily: HUB.font, fontWeight: 900, fontSize: 64,
            letterSpacing: '-0.04em', lineHeight: 0.9, color: HUB.black,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {open_}
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 12, color: 'rgba(10,10,10,0.65)', marginTop: 12 }}>
            {state.tasks.filter((t) => t.done).length} completed
          </div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Due today</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={dueTodayCount} accent={dueTodayCount > 0} size={32} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog, marginTop: 10 }}>
            {dueTodayCount === 0 ? 'Nothing today' : 'tasks'}
          </div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>Overdue</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={overdueCount} size={32} />
          </div>
          <div style={{
            fontFamily: HUB.mono, fontSize: 11, marginTop: 10,
            color: overdueCount > 0 ? HUB.warning : HUB.fog,
          }}>
            {overdueCount === 0 ? 'All caught up' : 'past due'}
          </div>
        </Card>
        <Card style={{ padding: 20 }}>
          <Overline>High priority</Overline>
          <div style={{ marginTop: 12 }}>
            <Metric value={state.tasks.filter((t) => !t.done && t.priority === 'high').length} size={32} />
          </div>
          <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.danger, marginTop: 10 }}>open</div>
        </Card>
      </div>

      <Card style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="plus" size={16} color={HUB.fog} />
        <input
          placeholder="Quick add a task — press Enter"
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') quickAdd(); }}
          style={{ background: 'transparent', border: 0, padding: '8px 0', flex: 1 }}
        />
        <GhostButton onClick={() => { setEditing(null); setOpen(true); }} style={{ padding: '8px 14px', fontSize: 10 }}>
          Detailed
        </GhostButton>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {tasks.length === 0 ? (
        <Card style={{ padding: 40 }}>
          <EmptyState
            icon="check"
            title={filter === 'done' ? 'Nothing completed yet' : 'No tasks here'}
            body="Add a task to get going."
            action={<YellowButton onClick={() => setOpen(true)}>+ New task</YellowButton>}
          />
        </Card>
      ) : (
        <>
          {groups.overdue.length > 0 && (
            <TaskGroup title="Overdue" tone="danger" items={groups.overdue}
              onToggle={toggleTask} onEdit={(t) => { setEditing(t); setOpen(true); }} onDelete={deleteTask} today={today} />
          )}
          {groups.dueToday.length > 0 && (
            <TaskGroup title="Today" tone="active" items={groups.dueToday}
              onToggle={toggleTask} onEdit={(t) => { setEditing(t); setOpen(true); }} onDelete={deleteTask} today={today} />
          )}
          {groups.upcoming.length > 0 && (
            <TaskGroup title="Upcoming" items={groups.upcoming}
              onToggle={toggleTask} onEdit={(t) => { setEditing(t); setOpen(true); }} onDelete={deleteTask} today={today} />
          )}
          {groups.undated.length > 0 && (
            <TaskGroup title="No date" items={groups.undated}
              onToggle={toggleTask} onEdit={(t) => { setEditing(t); setOpen(true); }} onDelete={deleteTask} today={today} />
          )}
          {filter !== 'open' && groups.done.length > 0 && (
            <TaskGroup title="Done" items={groups.done}
              onToggle={toggleTask} onEdit={(t) => { setEditing(t); setOpen(true); }} onDelete={deleteTask} today={today} />
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        subtitle={editing ? 'Edit' : 'Create'}
        title={editing ? 'Edit task' : 'New task'}
        width={460}
      >
        <TaskForm
          task={editing}
          onSave={(data) => {
            if (editing) updateTask(editing.id, data);
            else addTask(data);
            setOpen(false); setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

function TaskGroup({ title, tone, items, onToggle, onEdit, onDelete, today }) {
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Overline color={tone === 'danger' ? HUB.danger : tone === 'active' ? HUB.yellow : HUB.ash}>
          {title}
        </Overline>
        <div style={{ fontFamily: HUB.mono, fontSize: 11, color: HUB.fog }}>{items.length}</div>
      </div>
      {items.map((t, i) => {
        const variant = PRIORITIES.find((p) => p.value === t.priority);
        const overdue = t.due && t.due < today && !t.done;
        return (
          <div key={t.id} style={{
            display: 'grid', gridTemplateColumns: '24px 1fr auto auto auto',
            alignItems: 'center', gap: 14,
            padding: '12px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
          }}>
            <button
              onClick={() => onToggle(t.id)}
              style={{
                width: 20, height: 20, borderRadius: 6,
                background: t.done ? HUB.yellow : 'transparent',
                border: t.done ? 'none' : `1.5px solid ${HUB.steel}`,
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                transition: 'all 120ms',
              }}
            >
              {t.done && <Icon name="check" size={12} color={HUB.black} />}
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: HUB.font, fontWeight: 700, fontSize: 13,
                color: t.done ? HUB.fog : '#fff',
                textDecoration: t.done ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {t.title}
              </div>
              {t.due && (
                <div style={{
                  fontFamily: HUB.mono, fontSize: 10, marginTop: 2,
                  color: overdue ? HUB.warning : HUB.fog,
                }}>
                  {fmtRelative(t.due)}
                </div>
              )}
            </div>
            {variant && t.priority !== 'low' && <Badge variant={variant.variant}>{variant.label}</Badge>}
            <IconButton name="edit" onClick={() => onEdit(t)} size={12} title="Edit" />
            <IconButton name="trash" onClick={() => { if (confirm('Delete task?')) onDelete(t.id); }} size={12} title="Delete" />
          </div>
        );
      })}
    </Card>
  );
}

function TaskForm({ task, onSave }) {
  const [title, setTitle] = useState(task?.title || '');
  const [priority, setPriority] = useState(task?.priority || 'med');
  const [due, setDue] = useState(task?.due || '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <Label>Title</Label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="What needs doing?" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label>Priority</Label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <Label>Due</Label>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <YellowButton
          onClick={() => title.trim() && onSave({ title: title.trim(), priority, due: due || null })}
          disabled={!title.trim()}
        >
          {task ? 'Save' : 'Add'}
        </YellowButton>
      </div>
    </div>
  );
}
