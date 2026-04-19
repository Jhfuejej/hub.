import { useState } from 'react';
import { HUB, YellowButton, GhostButton, Label } from './primitives.jsx';
import { Icon } from './Icon.jsx';
import { Modal } from './Modal.jsx';
import { useStore } from '../store/store.js';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'workouts',  label: 'Workouts',  icon: 'dumbbell' },
  { id: 'nutrition', label: 'Nutrition', icon: 'utensils' },
  { id: 'weight',    label: 'Weight',    icon: 'scale' },
  { id: 'habits',    label: 'Habits',    icon: 'flame' },
  { id: 'journal',   label: 'Journal',   icon: 'book' },
  { id: 'finances',  label: 'Finances',  icon: 'wallet' },
  { id: 'tasks',     label: 'Tasks',     icon: 'check' },
];

function NavButton({ item, active, onClick }) {
  const [hover, setHover] = useState(false);
  const on = active;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: on ? HUB.graphite : hover ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: 0, cursor: 'pointer',
        color: on ? '#fff' : HUB.ash, textAlign: 'left',
        padding: '10px 12px', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: HUB.font, fontWeight: 600, fontSize: 13,
        transition: 'background 120ms',
      }}
    >
      <Icon name={item.icon} size={18} color={on ? HUB.yellow : HUB.fog} />
      <span>{item.label}</span>
    </button>
  );
}

export function Sidebar({ active, onNav }) {
  const { state, updateSettings, resetAll } = useStore();
  const user = state.settings.user;
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <>
      <aside style={{
        width: 240, background: HUB.ink, borderRight: `1px solid ${HUB.slate}`,
        padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 20px' }}>
          <div style={{
            fontFamily: HUB.font, fontWeight: 900, fontSize: 26,
            letterSpacing: '-0.03em', color: '#fff', lineHeight: 1,
          }}>
            HUB
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: 999, background: HUB.yellow, marginTop: 10,
          }} />
        </div>
        {NAV.map((it) => (
          <NavButton key={it.id} item={it} active={active === it.id} onClick={() => onNav(it.id)} />
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          title="Edit profile"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 12,
            background: hover ? HUB.slate : HUB.graphite, borderRadius: 12,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            border: 0, cursor: 'pointer', width: '100%',
            textAlign: 'left', color: '#fff',
            transition: 'background 120ms',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 999, background: HUB.yellow,
            display: 'grid', placeItems: 'center',
            fontFamily: HUB.font, fontWeight: 900, fontSize: 13, color: HUB.black,
            flexShrink: 0,
          }}>
            {user.initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: HUB.font, fontWeight: 700, fontSize: 12,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name}
            </div>
            <div style={{ fontFamily: HUB.mono, fontSize: 9, color: HUB.fog, marginTop: 1 }}>Personal</div>
          </div>
          <Icon name="settings" size={14} color={hover ? HUB.yellow : HUB.fog} />
        </button>
      </aside>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        subtitle="Profile"
        title="Account"
        width={440}
      >
        <AccountForm
          user={user}
          onSave={(next) => { updateSettings({ user: next }); setOpen(false); }}
          onResetAll={() => {
            if (confirm('Reset ALL data (workouts, meals, weights, habits, journal, tasks, finances)? This cannot be undone.')) {
              resetAll();
              setOpen(false);
            }
          }}
        />
      </Modal>
    </>
  );
}

function AccountForm({ user, onSave, onResetAll }) {
  const [name, setName] = useState(user.name || '');
  const [initial, setInitial] = useState(user.initial || '');

  const save = () => {
    const cleanName = name.trim() || 'You';
    const cleanInitial = (initial || cleanName[0] || '?').trim().slice(0, 2).toUpperCase();
    onSave({ name: cleanName, initial: cleanInitial });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <Label>Name</Label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!initial || initial === (user.initial || '')) {
              setInitial((e.target.value[0] || '').toUpperCase());
            }
          }}
          placeholder="Your name"
          autoFocus
        />
      </div>
      <div>
        <Label>Initial (shown in the avatar)</Label>
        <input
          value={initial}
          onChange={(e) => setInitial(e.target.value.slice(0, 2).toUpperCase())}
          maxLength={2}
          style={{ width: 80 }}
        />
      </div>

      <div style={{
        marginTop: 8, paddingTop: 14, borderTop: `1px solid ${HUB.slate}`,
        display: 'flex', justifyContent: 'space-between', gap: 10,
      }}>
        <GhostButton danger onClick={onResetAll}>Reset all data</GhostButton>
        <YellowButton onClick={save}>Save</YellowButton>
      </div>
    </div>
  );
}

export { NAV };
