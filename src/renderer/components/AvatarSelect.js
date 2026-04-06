/**
 * AvatarSelect — CEO avatar picker shown at game start
 */
function AvatarSelect({ selected, onSelect }) {
  const avatars = [
    { id: 0,  emoji: '😎', bg: '#58a6ff' },
    { id: 1,  emoji: '🧑‍💻', bg: '#3fb950' },
    { id: 2,  emoji: '👩‍💻', bg: '#da7cff' },
    { id: 3,  emoji: '🎮', bg: '#d29922' },
    { id: 4,  emoji: '🚀', bg: '#f85149' },
    { id: 5,  emoji: '🎯', bg: '#ffa657' },
    { id: 6,  emoji: '🧠', bg: '#79c0ff' },
    { id: 7,  emoji: '🎨', bg: '#56d364' },
    { id: 8,  emoji: '⚡', bg: '#bc8cff' },
    { id: 9,  emoji: '🔥', bg: '#ff7b72' },
    { id: 10, emoji: '💎', bg: '#39d2c0' },
    { id: 11, emoji: '🌟', bg: '#e3b341' },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '13px', color: '#8b949e', display: 'block', marginBottom: '8px' }}>
        Choose Your Avatar
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
        {avatars.map(a => (
          <div
            key={a.id}
            onClick={() => onSelect(a.id)}
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', cursor: 'pointer',
              border: selected === a.id ? '3px solid #fff' : '3px solid transparent',
              opacity: selected === a.id ? 1 : 0.6,
              transition: 'all 0.15s ease',
            }}
          >
            {a.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
