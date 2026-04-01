/**
 * NotificationCenter — Bell icon with unread badge + dropdown panel
 */
function NotificationCenter({ state }) {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    const unsub = notificationManager.subscribe(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });
    // Initialize with current state
    setNotifications([...notificationManager.notifications].reverse());
    setUnreadCount(notificationManager.unreadCount);
    return () => unsub();
  }, []);

  // Close panel when clicking outside
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const typeConfig = {
    info:      { color: '#58a6ff', icon: 'i'  },
    success:   { color: '#3fb950', icon: '+'  },
    warning:   { color: '#d29922', icon: '!'  },
    error:     { color: '#f85149', icon: 'x'  },
    event:     { color: '#da7cff', icon: '*'  },
    milestone: { color: '#f0c674', icon: '#'  },
  };

  const handleToggle = () => {
    setOpen(v => !v);
  };

  const handleMarkAllRead = () => {
    notificationManager.markAllRead();
  };

  const handleClearAll = () => {
    notificationManager.clearAll();
    setOpen(false);
  };

  const handleClickNotification = (id) => {
    notificationManager.markRead(id);
  };

  const allNotifications = notificationManager.getAll();

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        className={`speed-btn ${open ? 'active' : ''}`}
        onClick={handleToggle}
        title="Notification Center"
        style={{ position: 'relative', fontWeight: 700, fontSize: '14px', lineHeight: 1 }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
          <path d="M8 16a2 2 0 002-2H6a2 2 0 002 2zM8 1.918l-.797.161A4.002 4.002 0 004 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 00-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 111.99 0A5.002 5.002 0 0113 6c0 .88.32 4.2 1.22 6z"/>
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            background: '#f85149',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '360px',
          maxHeight: '480px',
          background: '#161b22',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3' }}>
              Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'none', border: 'none', color: '#58a6ff',
                    fontSize: '11px', cursor: 'pointer', padding: '2px 4px',
                  }}
                >
                  Mark all read
                </button>
              )}
              {allNotifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'none', border: 'none', color: '#8b949e',
                    fontSize: '11px', cursor: 'pointer', padding: '2px 4px',
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {allNotifications.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#484f58', fontSize: '13px' }}>
                No notifications yet
              </div>
            )}
            {allNotifications.map(n => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              return (
                <div
                  key={n.id}
                  onClick={() => handleClickNotification(n.id)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(88,166,255,0.04)',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.15s',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(88,166,255,0.04)'}
                >
                  {/* Type icon */}
                  <div style={{
                    minWidth: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: `${cfg.color}20`,
                    color: cfg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: n.read ? 400 : 600,
                      color: n.read ? '#8b949e' : '#e6edf3',
                      marginBottom: '2px',
                    }}>
                      {n.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#8b949e',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#484f58', marginTop: '3px' }}>
                      {n.time}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#58a6ff',
                      marginTop: '8px',
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
