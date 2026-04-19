import { useEffect, useMemo, useState } from 'react';
import { Card, HUB, Overline, YellowButton, GhostButton, IconButton, Label, EmptyState } from '../components/primitives.jsx';
import { Icon } from '../components/Icon.jsx';
import { useStore, todayISO } from '../store/store.js';
import { fmtDate, fmtDayShort, fmtDay } from '../lib/format.js';

export function Journal() {
  const { state, addJournal, updateJournal, deleteJournal } = useStore();
  const [activeId, setActiveId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [search, setSearch] = useState('');

  const sorted = useMemo(
    () => [...state.journal].sort((a, b) => b.date.localeCompare(a.date)),
    [state.journal],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((j) =>
      (j.title || '').toLowerCase().includes(q) || (j.body || '').toLowerCase().includes(q),
    );
  }, [sorted, search]);

  useEffect(() => {
    if (!activeId && filtered.length > 0) setActiveId(filtered[0].id);
  }, [filtered, activeId]);

  const active = sorted.find((j) => j.id === activeId);

  const startNew = () => {
    setDraft({ id: null, date: todayISO(), title: '', body: '' });
    setEditing(true);
  };

  const startEdit = () => {
    if (!active) return;
    setDraft({ ...active });
    setEditing(true);
  };

  const save = () => {
    if (!draft) return;
    if (!draft.title.trim() && !draft.body.trim()) {
      setEditing(false); setDraft(null);
      return;
    }
    if (draft.id) {
      updateJournal(draft.id, { title: draft.title, body: draft.body, date: draft.date });
    } else {
      addJournal({ title: draft.title || 'Untitled', body: draft.body, date: draft.date });
    }
    setEditing(false); setDraft(null);
  };

  return (
    <div style={{ padding: '28px 40px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, maxWidth: 1440, height: 'calc(100vh - 130px)' }}>
      <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${HUB.slate}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Overline>Entries · {sorted.length}</Overline>
            <YellowButton onClick={startNew} style={{ padding: '6px 12px', fontSize: 10 }}>+ New</YellowButton>
          </div>
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 12 }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: HUB.fog, fontFamily: HUB.mono, fontSize: 12 }}>
              {search ? 'Nothing matches.' : 'No entries yet.'}
            </div>
          )}
          {filtered.map((j, i) => {
            const on = activeId === j.id;
            return (
              <div
                key={j.id}
                onClick={() => { setActiveId(j.id); setEditing(false); }}
                style={{
                  padding: '14px 20px', cursor: 'pointer',
                  borderTop: i === 0 ? 'none' : `1px solid ${HUB.slate}`,
                  background: on ? HUB.slate : 'transparent',
                  borderLeft: on ? `3px solid ${HUB.yellow}` : '3px solid transparent',
                  transition: 'background 120ms',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <div style={{ fontFamily: HUB.font, fontWeight: 800, fontSize: 13 }}>{fmtDate(j.date)}</div>
                  <div style={{ fontFamily: HUB.mono, fontSize: 9, color: HUB.fog }}>{fmtDayShort(j.date)}</div>
                </div>
                <div style={{
                  fontFamily: HUB.font, fontWeight: 700, fontSize: 13,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: on ? '#fff' : HUB.bone,
                }}>
                  {j.title || 'Untitled'}
                </div>
                <div style={{
                  fontFamily: HUB.font, fontSize: 11, color: HUB.ash, marginTop: 4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {(j.body || '').slice(0, 120)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ padding: 32, overflow: 'auto' }}>
        {editing && draft ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
              <div>
                <Label>Date</Label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <GhostButton onClick={() => { setEditing(false); setDraft(null); }}>Cancel</GhostButton>
                <YellowButton onClick={save}>Save</YellowButton>
              </div>
            </div>
            <input
              placeholder="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              style={{
                fontFamily: HUB.font, fontWeight: 900, fontSize: 28,
                letterSpacing: '-0.02em', padding: '12px 16px',
              }}
            />
            <textarea
              placeholder="Write…"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              style={{
                flex: 1, minHeight: 300,
                fontFamily: HUB.font, fontSize: 14, lineHeight: 1.7,
                padding: '16px', resize: 'vertical',
              }}
            />
          </div>
        ) : active ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <Overline>Journal · {fmtDayShort(active.date)} {fmtDate(active.date)}</Overline>
              <div style={{ display: 'flex', gap: 8 }}>
                <IconButton name="edit" onClick={startEdit} title="Edit" />
                <IconButton name="trash" onClick={() => {
                  if (confirm('Delete entry?')) {
                    deleteJournal(active.id);
                    setActiveId(null);
                  }
                }} title="Delete" />
              </div>
            </div>
            <div style={{
              fontFamily: HUB.font, fontWeight: 900, fontSize: 32,
              letterSpacing: '-0.03em', marginBottom: 20,
            }}>
              {active.title || 'Untitled'}
            </div>
            <div style={{
              fontFamily: HUB.font, fontSize: 14, lineHeight: 1.7, color: HUB.bone,
              whiteSpace: 'pre-wrap',
            }}>
              {active.body || <span style={{ color: HUB.fog }}>(empty)</span>}
            </div>
            <div style={{
              marginTop: 32, paddingTop: 16, borderTop: `1px solid ${HUB.slate}`,
              fontFamily: HUB.mono, fontSize: 10, color: HUB.fog,
            }}>
              {fmtDay(active.date)} · created {new Date(active.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </>
        ) : (
          <EmptyState
            icon="book"
            title="No entry selected"
            body={sorted.length ? 'Pick an entry from the left, or write a new one.' : "Start writing to keep a log of how things went."}
            action={<YellowButton onClick={startNew}>+ New entry</YellowButton>}
          />
        )}
      </Card>
    </div>
  );
}
