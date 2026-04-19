import { useEffect } from 'react';
import { HUB } from './primitives.jsx';
import { Icon } from './Icon.jsx';

export function Modal({ open, onClose, title, subtitle, children, width = 520, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)',
        display: 'grid', placeItems: 'center', padding: 20,
        animation: 'hub-fade-in 200ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, maxHeight: '90vh',
          background: HUB.graphite, borderRadius: 20,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -12px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'hub-scale-in 200ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '22px 24px 14px', gap: 12,
        }}>
          <div>
            {subtitle && (
              <div style={{
                fontFamily: HUB.font, fontWeight: 700, fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: HUB.ash,
              }}>
                {subtitle}
              </div>
            )}
            <div style={{
              fontFamily: HUB.font, fontWeight: 900, fontSize: 22,
              letterSpacing: '-0.02em', marginTop: subtitle ? 6 : 0,
              textTransform: 'uppercase',
            }}>
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: HUB.slate, border: 0, borderRadius: 999,
              width: 32, height: 32, display: 'grid', placeItems: 'center',
              color: HUB.ash, cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Close"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <div style={{ padding: '8px 24px 20px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: `1px solid ${HUB.slate}`,
            display: 'flex', justifyContent: 'flex-end', gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
