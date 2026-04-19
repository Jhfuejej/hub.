import { useState } from 'react';
import { Icon } from './Icon.jsx';

export const HUB = {
  black: '#0A0A0A', ink: '#141414', graphite: '#1F1F1F', slate: '#2A2A2A',
  steel: '#3D3D3D', fog: '#6B6B6B', ash: '#A3A3A3', bone: '#E5E5E5',
  yellow: '#F5D033', yellowHi: '#FFE14A', yellowLo: '#C9A81C',
  success: '#4ADE80', warning: '#FBBF24', danger: '#EF4444', info: '#60A5FA',
  font: "'Montserrat', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

export function Overline({ children, style = {}, color = HUB.ash }) {
  return (
    <div style={{
      fontFamily: HUB.font, fontWeight: 700, fontSize: 10,
      letterSpacing: '0.14em', textTransform: 'uppercase', color, ...style,
    }}>
      {children}
    </div>
  );
}

export function Metric({ value, unit, accent = false, size = 36, style = {} }) {
  return (
    <div style={{
      fontFamily: HUB.font, fontWeight: 800, fontSize: size,
      letterSpacing: '-0.03em', lineHeight: 0.95,
      fontVariantNumeric: 'tabular-nums',
      color: accent ? HUB.yellow : '#fff', ...style,
    }}>
      {value}
      {unit && <span style={{ fontSize: size * 0.35, color: HUB.ash, fontWeight: 600, marginLeft: 4 }}>{unit}</span>}
    </div>
  );
}

export function YellowButton({ children, onClick, style = {}, type = 'button', disabled = false }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        background: disabled ? HUB.steel : press ? HUB.yellowLo : hover ? HUB.yellowHi : HUB.yellow,
        color: HUB.black,
        border: 0, borderRadius: 999, padding: '12px 20px',
        fontFamily: HUB.font, fontWeight: 800, fontSize: 12,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'background 120ms cubic-bezier(0.22,1,0.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style = {}, type = 'button', danger = false }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? HUB.slate : HUB.graphite,
        color: danger ? HUB.danger : '#fff',
        border: 0,
        borderRadius: 10, padding: '10px 16px',
        fontFamily: HUB.font, fontWeight: 700, fontSize: 12,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        transition: 'background 120ms cubic-bezier(0.22,1,0.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function IconButton({ name, onClick, size = 16, title, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? HUB.slate : 'transparent',
        border: 0, borderRadius: 8, padding: 8,
        color: hover ? '#fff' : HUB.ash,
        cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        transition: 'all 120ms',
        ...style,
      }}
    >
      <Icon name={name} size={size} />
    </button>
  );
}

export function Card({ children, lit = false, style = {}, onClick, hoverable = false }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: lit ? HUB.yellow : HUB.graphite,
        color: lit ? HUB.black : '#fff',
        borderRadius: 14, padding: 16,
        boxShadow: hover
          ? 'inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.04)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        transition: 'box-shadow 120ms',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'neutral', style = {} }) {
  const styles = {
    active:  { bg: HUB.yellow, fg: HUB.black },
    neutral: { bg: HUB.graphite, fg: HUB.bone },
    success: { bg: 'rgba(74,222,128,0.14)', fg: HUB.success },
    warning: { bg: 'rgba(251,191,36,0.14)', fg: HUB.warning },
    danger:  { bg: 'rgba(239,68,68,0.14)', fg: HUB.danger },
    info:    { bg: 'rgba(96,165,250,0.14)', fg: HUB.info },
  }[variant] || { bg: HUB.graphite, fg: HUB.bone };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: styles.bg, color: styles.fg,
      fontFamily: HUB.font, fontWeight: 700, fontSize: 10,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '5px 9px', borderRadius: 999, ...style,
    }}>
      {children}
    </span>
  );
}

export function ProgressBar({ pct, color = HUB.yellow, track = HUB.slate, height = 6 }) {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${clamped}%`, background: color, borderRadius: 999,
        transition: 'width 360ms cubic-bezier(0.22,1,0.36,1)',
      }} />
    </div>
  );
}

export function EmptyState({ icon = 'plus', title, body, action }) {
  return (
    <div style={{
      padding: '48px 32px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 999, background: HUB.ink,
        display: 'grid', placeItems: 'center', color: HUB.fog,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{
        fontFamily: HUB.font, fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em',
      }}>{title}</div>
      {body && (
        <div style={{ fontFamily: HUB.font, fontSize: 13, color: HUB.ash, maxWidth: 320 }}>{body}</div>
      )}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

export function Label({ children, style = {} }) {
  return (
    <label style={{
      fontFamily: HUB.font, fontWeight: 700, fontSize: 10, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: HUB.ash, display: 'block', marginBottom: 8,
      ...style,
    }}>
      {children}
    </label>
  );
}

export function Segmented({ options, value, onChange, style = {} }) {
  return (
    <div style={{
      display: 'inline-flex', background: HUB.ink, padding: 4, borderRadius: 999, gap: 4,
      ...style,
    }}>
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 12px', borderRadius: 999, border: 0,
              fontFamily: HUB.font, fontWeight: 700, fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: on ? HUB.yellow : 'transparent',
              color: on ? HUB.black : HUB.ash, cursor: 'pointer',
              transition: 'all 120ms',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
