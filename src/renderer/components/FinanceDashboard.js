/**
 * FinanceDashboard — Cash trend, revenue per game, expense breakdown
 * Toggled via the $ button in the TopBar.
 */
function FinanceDashboard({ state, onClose }) {
  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const formatCash = (n) => {
    const abs = Math.abs(n);
    let s;
    if (abs >= 1000000) s = '$' + (abs / 1000000).toFixed(2) + 'M';
    else if (abs >= 1000) s = '$' + (abs / 1000).toFixed(1) + 'K';
    else s = '$' + abs.toLocaleString();
    return n < 0 ? '-' + s : s;
  };

  // Pull live data from the global finance tracker
  const history = finance.cashHistory;
  const revenueByGame = finance.revenueByGame();
  const expenses = finance.expensesByCategory();
  const totalRev = finance.totalRevenue();
  const totalExp = finance.totalExpenses();
  const netProfit = totalRev - totalExp;

  // Cash trend bar chart — last 24 snapshots
  const chartPoints = history.slice(-24);
  const cashValues = chartPoints.map(p => p.cash);
  const maxAbs = Math.max(...cashValues.map(Math.abs), 1);

  // Expense breakdown bars
  const expLabels = {
    salary:      { label: 'Salaries',         color: '#58a6ff' },
    office_rent: { label: 'Office Rent',       color: '#da7cff' },
    dev_cost:    { label: 'Dev Costs',         color: '#ff9800' },
    license:     { label: 'Platform Licenses', color: '#79c0ff' },
    marketing:   { label: 'Marketing',         color: '#d29922' },
    tax:         { label: 'Corporate Taxes',   color: '#f85149' },
    research:    { label: 'Research & Dev',     color: '#56d364' },
    training:    { label: 'Staff Training',     color: '#bc8cff' },
    perk:        { label: 'Office Perks',       color: '#ff7b72' },
    loan_payment:{ label: 'Loan Payments',      color: '#ffa657' },
  };
  const totalExpAmt = Object.values(expenses).reduce((a, b) => a + b, 0) || 1;

  const sectionLabel = {
    fontSize: '11px',
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: 600,
    marginBottom: '12px',
  };

  const panel = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '16px',
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#161b22',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '28px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '88vh',
        overflowY: 'auto',
        animation: 'slideUp 0.25s ease',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e6edf3' }}>Finance Dashboard</div>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px' }}>{state.companyName}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Cash', value: formatCash(state.cash), color: state.cash >= 0 ? '#3fb950' : '#f85149' },
            { label: 'Total Revenue', value: formatCash(totalRev), color: '#3fb950' },
            { label: 'Total Expenses', value: formatCash(totalExp), color: '#f85149' },
            { label: 'Net Profit', value: formatCash(netProfit), color: netProfit >= 0 ? '#3fb950' : '#f85149' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...panel, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Main content: 2-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Cash Over Time */}
          <div style={panel}>
            <div style={sectionLabel}>Cash Over Time</div>
            {chartPoints.length === 0 ? (
              <div style={{ color: '#8b949e', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                No data yet — start playing!
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '2px',
                  height: '120px',
                  padding: '0 0 4px 0',
                }}>
                  {chartPoints.map((point, i) => {
                    const heightPct = Math.max(2, (Math.abs(point.cash) / maxAbs) * 100);
                    const color = point.cash >= 0 ? '#3fb950' : '#f85149';
                    return (
                      <div
                        key={i}
                        title={`W${point.week}: ${formatCash(point.cash)}`}
                        style={{
                          flex: 1,
                          height: `${heightPct}%`,
                          background: color,
                          borderRadius: '2px 2px 0 0',
                          opacity: 0.75 + (i / chartPoints.length) * 0.25,
                          cursor: 'default',
                          transition: 'opacity 0.15s',
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#484f58', marginTop: '4px' }}>
                  <span>←{chartPoints.length}w ago</span>
                  <span>Now</span>
                </div>
              </>
            )}
          </div>

          {/* Expense Breakdown */}
          <div style={panel}>
            <div style={sectionLabel}>Expense Breakdown</div>
            {totalExpAmt === 1 ? (
              <div style={{ color: '#8b949e', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                No expenses yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(expLabels).map(([key, { label, color }]) => {
                  const amount = expenses[key] || 0;
                  const pct = totalExpAmt > 0 ? (amount / totalExpAmt) * 100 : 0;
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: '#c9d1d9' }}>{label}</span>
                        <span style={{ color: '#8b949e' }}>{formatCash(amount)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: color,
                          borderRadius: '3px',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Revenue per Game */}
        <div style={panel}>
          <div style={sectionLabel}>Revenue per Game</div>
          {revenueByGame.length === 0 ? (
            <div style={{ color: '#8b949e', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
              No games sold yet
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ textAlign: 'left', color: '#8b949e', fontWeight: 500, padding: '0 0 8px 0' }}>Game</th>
                  <th style={{ textAlign: 'right', color: '#8b949e', fontWeight: 500, padding: '0 0 8px 0' }}>Revenue</th>
                  <th style={{ textAlign: 'right', color: '#8b949e', fontWeight: 500, padding: '0 0 8px 0' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {revenueByGame.map(({ title, total }, i) => {
                  const share = totalRev > 0 ? (total / totalRev) * 100 : 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 0', color: '#e6edf3' }}>{title}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: '#3fb950', fontWeight: 600 }}>
                        {formatCash(total)}
                      </td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: '#8b949e' }}>
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Tax History */}
        <div style={{ ...panel, marginTop: '16px' }}>
          <div style={sectionLabel}>Tax History</div>
          {(() => {
            const taxHist = typeof taxSystem !== 'undefined' && taxSystem ? taxSystem.taxHistory : [];
            const currentRate = typeof taxSystem !== 'undefined' && taxSystem && typeof OFFICE_LEVELS !== 'undefined' ? taxSystem.getTaxRate(OFFICE_LEVELS[state.level].name) : 0;
            const totalPaid = typeof taxSystem !== 'undefined' && taxSystem ? taxSystem.totalTaxesPaid() : 0;

            return (
              <>
                {/* Current tax rate indicator */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    flex: 1, textAlign: 'center', padding: '10px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Tax Rate</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: currentRate > 0 ? '#f85149' : '#3fb950' }}>
                      {(currentRate * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div style={{
                    flex: 1, textAlign: 'center', padding: '10px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Total Taxes Paid</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#f85149' }}>
                      {formatCash(totalPaid)}
                    </div>
                  </div>
                  <div style={{
                    flex: 1, textAlign: 'center', padding: '10px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Office Level</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
                      {OFFICE_LEVELS[state.level].name}
                    </div>
                  </div>
                </div>

                {taxHist.length === 0 ? (
                  <div style={{ color: '#8b949e', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                    {currentRate === 0 ? 'Garage-level companies pay no taxes!' : 'No tax assessments yet — taxes are calculated quarterly.'}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <th style={{ textAlign: 'left', color: '#8b949e', fontWeight: 500, padding: '0 0 6px 0' }}>Quarter</th>
                        <th style={{ textAlign: 'right', color: '#8b949e', fontWeight: 500, padding: '0 0 6px 0' }}>Revenue</th>
                        <th style={{ textAlign: 'right', color: '#8b949e', fontWeight: 500, padding: '0 0 6px 0' }}>Deductions</th>
                        <th style={{ textAlign: 'right', color: '#8b949e', fontWeight: 500, padding: '0 0 6px 0' }}>Taxable</th>
                        <th style={{ textAlign: 'right', color: '#8b949e', fontWeight: 500, padding: '0 0 6px 0' }}>Tax Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxHist.slice(-8).map((rec) => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '6px 0', color: '#c9d1d9' }}>Q{rec.quarter}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#3fb950' }}>{formatCash(rec.grossRevenue)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#58a6ff' }}>{formatCash(rec.deductions.total)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#d29922' }}>{formatCash(rec.taxableIncome)}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f85149', fontWeight: 600 }}>{formatCash(rec.taxBill)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Deduction guide */}
                <div style={{
                  marginTop: '12px', padding: '10px', borderRadius: '8px',
                  background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.1)',
                }}>
                  <div style={{ fontSize: '10px', color: '#58a6ff', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tax Deductions
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#8b949e' }}>
                    <span>R&D: 50%</span>
                    <span>Marketing: 25%</span>
                    <span>Salaries: 100%</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Loan Section */}
        <div style={{ ...panel, marginTop: '16px' }}>
          <div style={sectionLabel}>Bank Loans</div>
          {state.loan ? (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  flex: 1, textAlign: 'center', padding: '10px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Remaining</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#f85149' }}>
                    {formatCash(Math.round(state.loan.remaining))}
                  </div>
                </div>
                <div style={{
                  flex: 1, textAlign: 'center', padding: '10px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Quarterly Payment</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#ffa657' }}>
                    {formatCash(state.loan.quarterlyPayment)}
                  </div>
                </div>
                <div style={{
                  flex: 1, textAlign: 'center', padding: '10px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Interest Rate</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#8b949e' }}>
                    {(state.loan.rate * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => { engine.repayLoan(); }}
                disabled={state.cash < state.loan.remaining}
                style={{ width: '100%', padding: '10px', fontSize: '13px' }}
              >
                Repay Early ({formatCash(Math.round(state.loan.remaining))})
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '12px' }}>
                Borrow up to $500K at 8% annual interest. Repaid quarterly over 2 years.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[100000, 250000, 500000].map(amount => (
                  <button
                    key={amount}
                    className="btn-secondary"
                    onClick={() => { engine.takeLoan(amount); }}
                    style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                  >
                    Borrow {formatCash(amount)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
