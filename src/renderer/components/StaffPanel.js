/**
 * StaffPanel — Staff management: view, hire, fire
 */
function StaffPanel({ state, onClose }) {
  const [tab, setTab] = React.useState('roster'); // roster | hire
  const [applicants, setApplicants] = React.useState(null);

  const generateApplicants = () => {
    setApplicants(engine.generateApplicants(4));
    setTab('hire');
  };

  const handleHire = (applicant) => {
    if (engine.hireStaff(applicant)) {
      setApplicants(prev => prev.filter(a => a.id !== applicant.id));
    }
  };

  const handleFire = (staffId) => {
    engine.fireStaff(staffId);
  };

  const maxStat = 200;
  const office = OFFICE_LEVELS[state.level];
  const canHire = state.staff.length < office.maxStaff && state.level >= 1;

  const StatBar = ({ value, max, color, label }) => (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
        <span style={{ color: '#8b949e' }}>{label}</span>
        <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{Math.round(value)}</span>
      </div>
      <div className="stat-bar">
        <div className="stat-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );

  const StaffCard = ({ member, showFire }) => (
    <div className="staff-card" style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
            {member.name}
            {member.isFounder && <span style={{ fontSize: '11px', color: '#58a6ff', marginLeft: '8px' }}>Founder</span>}
          </div>
          {member.salary > 0 && (
            <div style={{ fontSize: '11px', color: '#8b949e' }}>
              Salary: ${member.salary.toLocaleString()}/mo
            </div>
          )}
        </div>
        {showFire && !member.isFounder && (
          <button
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', color: '#f85149', borderColor: 'rgba(248,81,73,0.3)' }}
            onClick={() => handleFire(member.id)}
          >
            Fire
          </button>
        )}
      </div>
      <StatBar value={member.design} max={maxStat} color="#da7cff" label="Design" />
      <StatBar value={member.tech} max={maxStat} color="#58a6ff" label="Tech" />
      <StatBar value={member.speed} max={maxStat} color="#3fb950" label="Speed" />
      <StatBar value={member.research} max={maxStat} color="#d29922" label="Research" />
      <div style={{ fontSize: '11px', color: '#484f58', marginTop: '4px' }}>
        Games worked: {member.gamesWorked}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>Staff</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn-secondary ${tab === 'roster' ? '' : ''}`}
              style={tab === 'roster' ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}}
              onClick={() => setTab('roster')}
            >
              Roster ({state.staff.length}/{office.maxStaff})
            </button>
            {canHire && (
              <button className="btn-accent" onClick={generateApplicants}>
                Hire
              </button>
            )}
          </div>
        </div>

        {tab === 'roster' && (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {state.staff.map(member => (
              <StaffCard key={member.id} member={member} showFire={!state.currentGame} />
            ))}
          </div>
        )}

        {tab === 'hire' && applicants && (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '12px' }}>
              Applicants available for hire:
            </div>
            {applicants.map(app => (
              <div key={app.id} style={{ marginBottom: '12px' }}>
                <StaffCard member={app} showFire={false} />
                <button
                  className="btn-accent"
                  style={{ width: '100%', marginTop: '-4px', padding: '8px' }}
                  onClick={() => handleHire(app)}
                  disabled={state.staff.length >= office.maxStaff}
                >
                  Hire — ${app.salary.toLocaleString()}/mo
                </button>
              </div>
            ))}
            <button className="btn-secondary" onClick={generateApplicants} style={{ width: '100%', marginTop: '8px' }}>
              Refresh Applicants
            </button>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
