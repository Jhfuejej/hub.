import { HUB } from './primitives.jsx';
import { YellowButton, Overline } from './primitives.jsx';
import { Icon } from './Icon.jsx';

export function TopBar({ title, sub, onQuickAdd, search, onSearch, addLabel = '+ Quick add' }) {
  return (
    <div style={{
      padding: '28px 40px 20px', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', borderBottom: `1px solid ${HUB.graphite}`,
      gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <Overline>{sub}</Overline>
        <div style={{
          fontFamily: HUB.font, fontWeight: 900, fontSize: 40,
          letterSpacing: '-0.03em', color: '#fff', marginTop: 6,
          lineHeight: 1, textTransform: 'uppercase',
        }}>
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input
            placeholder="Search anything…"
            value={search || ''}
            onChange={(e) => onSearch?.(e.target.value)}
            style={{
              background: HUB.graphite, border: `1px solid ${HUB.slate}`,
              color: '#fff', padding: '10px 14px 10px 36px', borderRadius: 10,
              fontFamily: HUB.font, fontSize: 13, width: 260, outline: 'none',
            }}
          />
          <div style={{ position: 'absolute', left: 12, top: 12, pointerEvents: 'none' }}>
            <Icon name="search" size={14} color={HUB.fog} />
          </div>
        </div>
        {onQuickAdd && (
          <YellowButton onClick={onQuickAdd} style={{ padding: '10px 18px' }}>
            {addLabel}
          </YellowButton>
        )}
      </div>
    </div>
  );
}
