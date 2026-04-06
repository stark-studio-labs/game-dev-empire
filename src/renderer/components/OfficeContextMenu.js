/**
 * OfficeContextMenu — Right-click context menu on the office area
 */
function OfficeContextMenu({ x, y, state, onAction, onClose }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    const c = () => onClose();
    document.addEventListener('keydown', h);
    setTimeout(() => document.addEventListener('click', c), 50);
    return () => { document.removeEventListener('keydown', h); document.removeEventListener('click', c); };
  }, [onClose]);

  const items = [
    { label: 'New Game', action: 'newGame', enabled: !state.currentGame && !state.sellingGame },
    { label: 'Staff', action: 'staff', enabled: true },
    { label: 'Finance', action: 'finance', enabled: true },
    { label: 'Marketing', action: 'marketing', enabled: state.level >= 1 || state.devMode },
    { label: 'Research', action: 'research', enabled: state.level >= 2 || state.devMode },
    { label: 'Training', action: 'training', enabled: state.level >= 1 || state.devMode },
    { label: 'Market', action: 'market', enabled: true },
    { label: 'Settings', action: 'settings', enabled: true },
  ];

  return (
    <div className="office-context-menu" style={{ left: x, top: y }}>
      {items.map(item => (
        <div
          key={item.action}
          className={`office-context-item ${!item.enabled ? 'office-context-item--disabled' : ''}`}
          onClick={() => { if (item.enabled) { onAction(item.action); onClose(); } }}
        >
          {item.label}
          {!item.enabled && <span style={{ fontSize: '10px', color: '#484f58', marginLeft: '8px' }}>&#x1F512;</span>}
        </div>
      ))}
    </div>
  );
}
