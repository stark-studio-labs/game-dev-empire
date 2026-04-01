/**
 * TrainingPanel -- Staff training enrollment, progress tracking, skill projections
 */
function TrainingPanel({ state, onClose }) {
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [genreChoice, setGenreChoice] = React.useState('Action');
  const [statChoice, setStatChoice] = React.useState('design');
  const [tab, setTab] = React.useState('courses'); // courses | active | history

  const courses = trainingSystem.getCourses();
  const activeTraining = trainingSystem.getActiveTraining();
  const history = trainingSystem.getHistory();

  const formatCash = (n) => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + n.toLocaleString();
  };

  // Staff not currently in training and not the founder (founder can train too)
  const availableStaff = state.staff.filter(s => !trainingSystem.isTraining(s.id));

  const handleEnroll = () => {
    if (!selectedStaff || !selectedCourse) return;

    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;

    if (state.cash < course.cost) {
      alert('Not enough cash!');
      return;
    }

    const options = {};
    if (course.requiresGenreChoice) options.genreChoice = genreChoice;
    if (course.requiresStatChoice) options.statChoice = statChoice;

    const result = trainingSystem.enroll(selectedStaff, selectedCourse, state.totalWeeks, options);
    if (result.success) {
      // Deduct cost via engine
      engine.state.cash -= course.cost;
      finance.record('training', -course.cost, `Training: ${course.name}`, engine._dateStr());
      engine._emit();
      engine._save();
      setSelectedStaff(null);
      setSelectedCourse(null);
    }
  };

  const StatBar = ({ value, max, color, label, projected }) => (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
        <span style={{ color: '#8b949e' }}>{label}</span>
        <span style={{ color: '#c9d1d9', fontWeight: 500 }}>
          {Math.round(value)}
          {projected !== undefined && projected !== value && (
            <span style={{ color: projected > value ? '#3fb950' : '#f85149', marginLeft: '4px' }}>
              {'\u2192'} {Math.round(projected)} ({projected > value ? '+' : ''}{Math.round(projected - value)})
            </span>
          )}
        </span>
      </div>
      <div className="stat-bar" style={{ position: 'relative' }}>
        <div className="stat-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
        {projected !== undefined && projected > value && (
          <div style={{
            position: 'absolute', top: 0, left: `${Math.min(100, (value / max) * 100)}%`,
            width: `${Math.min(100 - (value / max) * 100, ((projected - value) / max) * 100)}%`,
            height: '100%', background: color, opacity: 0.3, borderRadius: '0 4px 4px 0',
          }} />
        )}
      </div>
    </div>
  );

  // Get projected stats for selected staff + course
  const getProjection = () => {
    if (!selectedStaff || !selectedCourse) return null;
    const staff = state.staff.find(s => s.id === selectedStaff);
    if (!staff) return null;
    const options = {};
    const course = courses.find(c => c.id === selectedCourse);
    if (course && course.requiresStatChoice) options.statChoice = statChoice;
    return trainingSystem.projectStats(staff, selectedCourse, options);
  };

  const projection = getProjection();
  const selectedStaffObj = selectedStaff ? state.staff.find(s => s.id === selectedStaff) : null;
  const selectedCourseObj = selectedCourse ? courses.find(c => c.id === selectedCourse) : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>
            {'\uD83D\uDCDA'} Staff Training
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['courses', 'active', 'history'].map(t => (
              <button
                key={t}
                className="btn-secondary"
                style={tab === t ? { borderColor: '#58a6ff', color: '#58a6ff' } : {}}
                onClick={() => setTab(t)}
              >
                {t === 'courses' ? 'Courses' : t === 'active' ? `Active (${activeTraining.length})` : 'History'}
              </button>
            ))}
          </div>
        </div>

        {state.level < 1 && (
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: '#d29922' }}>
            {'\uD83D\uDD12'} Training requires Small Office (Level 1+). Upgrade your office first!
          </div>
        )}

        {state.level >= 1 && tab === 'courses' && (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {/* Course catalog */}
            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              {courses.map(course => (
                <div
                  key={course.id}
                  className={`glass-card glass-card-hover`}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    border: selectedCourse === course.id ? '1px solid #58a6ff' : '1px solid transparent',
                  }}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                        {course.icon} {course.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                        {course.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f85149' }}>
                        {formatCash(course.cost)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>
                        {course.durationWeeks} week{course.durationWeeks !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {/* Stat boost preview */}
                  {Object.keys(course.statBoosts).length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(course.statBoosts).map(([stat, val]) => (
                        <span key={stat} style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          background: 'rgba(63,185,80,0.15)', color: '#3fb950',
                        }}>
                          +{val} {stat}
                        </span>
                      ))}
                    </div>
                  )}
                  {course.special && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: 'rgba(218,124,255,0.15)', color: '#da7cff',
                      }}>
                        {course.special === 'team_lead' ? 'Unlocks Team Lead' :
                         course.special === 'genre_specialty' ? '+25 Genre Specialty' :
                         course.special === 'networking' ? 'Networking Event' :
                         course.special === 'specialize' ? '+40/-10 Specialization' : course.special}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Enrollment section */}
            {selectedCourse && (
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e6edf3', marginBottom: '12px' }}>
                  Enroll Staff in: {selectedCourseObj?.icon} {selectedCourseObj?.name}
                </div>

                {/* Staff selector */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>Select Staff Member</label>
                  <select
                    value={selectedStaff || ''}
                    onChange={e => setSelectedStaff(e.target.value || null)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e6edf3', fontSize: '13px', outline: 'none',
                    }}
                  >
                    <option value="">-- Select --</option>
                    {availableStaff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (D:{Math.round(s.design)} T:{Math.round(s.tech)} S:{Math.round(s.speed)} R:{Math.round(s.research)})</option>
                    ))}
                  </select>
                </div>

                {/* Genre choice for Genre Mastery */}
                {selectedCourseObj?.requiresGenreChoice && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>Choose Genre</label>
                    <select
                      value={genreChoice}
                      onChange={e => setGenreChoice(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e6edf3', fontSize: '13px', outline: 'none',
                      }}
                    >
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}

                {/* Stat choice for Specialization */}
                {selectedCourseObj?.requiresStatChoice && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '4px' }}>Choose Stat to Specialize</label>
                    <select
                      value={statChoice}
                      onChange={e => setStatChoice(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e6edf3', fontSize: '13px', outline: 'none',
                      }}
                    >
                      <option value="design">Design</option>
                      <option value="tech">Tech</option>
                      <option value="speed">Speed</option>
                      <option value="research">Research</option>
                    </select>
                  </div>
                )}

                {/* Skill comparison */}
                {selectedStaffObj && projection && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Skill Projection for {selectedStaffObj.name}
                    </div>
                    <StatBar value={selectedStaffObj.design} max={200} color="#da7cff" label="Design" projected={projection.design} />
                    <StatBar value={selectedStaffObj.tech} max={200} color="#58a6ff" label="Tech" projected={projection.tech} />
                    <StatBar value={selectedStaffObj.speed} max={200} color="#3fb950" label="Speed" projected={projection.speed} />
                    <StatBar value={selectedStaffObj.research} max={200} color="#d29922" label="Research" projected={projection.research} />
                  </div>
                )}

                <button
                  className="btn-accent"
                  style={{ width: '100%', marginTop: '12px', padding: '10px' }}
                  onClick={handleEnroll}
                  disabled={!selectedStaff || !selectedCourse || state.cash < (selectedCourseObj?.cost || 0)}
                >
                  {state.cash < (selectedCourseObj?.cost || 0)
                    ? `Not Enough Cash (need ${formatCash(selectedCourseObj?.cost || 0)})`
                    : `Enroll \u2014 ${formatCash(selectedCourseObj?.cost || 0)}`}
                </button>
              </div>
            )}
          </div>
        )}

        {state.level >= 1 && tab === 'active' && (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {activeTraining.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#484f58', fontSize: '14px' }}>
                No staff currently in training
              </div>
            )}
            {activeTraining.map(entry => {
              const staff = state.staff.find(s => s.id === entry.staffId);
              const course = courses.find(c => c.id === entry.courseId);
              if (!staff || !course) return null;
              const progress = trainingSystem.getProgress(entry, state.totalWeeks);
              const weeksLeft = Math.max(0, entry.endWeek - state.totalWeeks);

              return (
                <div key={entry.staffId} className="glass-card" style={{ padding: '14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b949e' }}>
                        {course.icon} {course.name}
                        {entry.genreChoice && <span style={{ color: '#da7cff' }}> ({entry.genreChoice})</span>}
                        {entry.statChoice && <span style={{ color: '#da7cff' }}> ({entry.statChoice})</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#58a6ff' }}>{progress}%</div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>{weeksLeft}w left</div>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {state.level >= 1 && tab === 'history' && (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#484f58', fontSize: '14px' }}>
                No training completed yet
              </div>
            )}
            {history.slice().reverse().map((entry, i) => (
              <div key={i} className="glass-card" style={{ padding: '10px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#e6edf3', fontWeight: 500 }}>{entry.staffName}</span>
                  <span style={{ color: '#3fb950' }}>{entry.courseName}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
