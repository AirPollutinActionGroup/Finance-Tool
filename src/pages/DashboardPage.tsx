import { useMemo } from "react";
import { donors, employees, programs } from "../data/mockData";
import { ADMIN_RATE_BY_TYPE, runSimulation } from "../simulation/engine";
import { formatCurrency, formatDate, formatPercent } from "../utils/format";

const movementEvents = [
  {
    id: "move-1",
    employeeId: "emp-012",
    summary: "Kavya Joshi moved from DSP to MRS",
    date: "2024-10-15",
  },
  {
    id: "move-2",
    employeeId: "emp-021",
    summary: "Aditi Rao shifted from Delhi NCR to Uttar Pradesh",
    date: "2024-09-04",
  },
  {
    id: "move-3",
    employeeId: "emp-037",
    summary: "Pritam Saha reassigned from C&D to DSP",
    date: "2024-08-18",
  },
];

const DashboardPage = () => {
  const simulation = useMemo(
    () => runSimulation(donors, programs, employees),
    []
  );

  const recentJoins = useMemo(
    () =>
      [...employees]
        .sort((a, b) => b.joiningDate.localeCompare(a.joiningDate))
        .slice(0, 5),
    []
  );

  const adminWatchlist = useMemo(
    () =>
      donors
        .filter((donor) => {
          const baseline = ADMIN_RATE_BY_TYPE[donor.type] * 100;
          return (
            donor.adminOverheadPercent >= baseline * 0.9 &&
            donor.adminOverheadPercent <= baseline * 1.1
          );
        })
        .map((donor) => {
          const baseline = ADMIN_RATE_BY_TYPE[donor.type] * 100;
          const actual = donor.adminOverheadPercent;
          const difference = actual - baseline;
          const percentOfBaseline = (actual / baseline) * 100;
          
          // Determine status color
          let status: 'safe' | 'warning' | 'critical';
          if (actual < baseline * 0.9) {
            status = 'safe';
          } else if (actual > baseline * 1.1) {
            status = 'critical';
          } else {
            status = 'warning';
          }
          
          return {
            donor,
            baseline,
            actual,
            difference,
            percentOfBaseline,
            status,
          };
        })
        .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
    []
  );

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>High-level activity and funding signals.</p>
        </div>
      </header>

      <div className="metric-grid">
        <div className="metric-card">
          <h3>Total employees</h3>
          <p>{employees.length}</p>
        </div>
        <div className="metric-card">
          <h3>Total donors</h3>
          <p>{donors.length}</p>
        </div>
        <div className="metric-card">
          <h3>Overall balance left</h3>
          <p>{formatCurrency(simulation.generalFundTotal)}</p>
        </div>
        <div className="metric-card">
          <h3>Runway</h3>
          <p>{simulation.runwayMonths.toFixed(1)} months</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="detail-card">
          <h2>Recent joins</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentJoins.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{formatDate(employee.joiningDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="detail-card">
          <h2>Movement feed</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Update</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {movementEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.summary}</td>
                    <td>{formatDate(event.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="detail-card">
          <h2>Donors near admin threshold</h2>
          <p className="table-note">
            Monitoring donors within ±10% of their baseline admin overhead threshold.
          </p>
          <div className="admin-threshold-list">
            {adminWatchlist.map(({ donor, baseline, actual, difference, percentOfBaseline, status }) => (
              <div key={donor.id} className="admin-threshold-item">
                <div className="admin-threshold-header">
                  <div className="admin-threshold-info">
                    <div className="admin-threshold-title">
                      <span className="admin-threshold-name">{donor.name}</span>
                      <span className="admin-threshold-type">{donor.type}</span>
                    </div>
                    <div className="admin-threshold-contribution">
                      {formatCurrency(donor.contributionAmount)} contribution
                    </div>
                  </div>
                  <div className="admin-threshold-metrics">
                    <div className="admin-threshold-metric">
                      <span className="admin-threshold-metric-label">Actual</span>
                      <span className="admin-threshold-metric-value" data-status={status}>
                        {formatPercent(actual)}
                      </span>
                    </div>
                    <div className="admin-threshold-metric">
                      <span className="admin-threshold-metric-label">Baseline</span>
                      <span className="admin-threshold-metric-value">
                        {formatPercent(baseline)}
                      </span>
                    </div>
                    <div className="admin-threshold-metric">
                      <span className="admin-threshold-metric-label">Variance</span>
                      <span className="admin-threshold-metric-value" data-status={status}>
                        {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="admin-threshold-bar-container">
                  <div className="admin-threshold-bar-track">
                    {/* Safe zone (below 90%) */}
                    <div className="admin-threshold-zone safe" style={{ width: '40%' }} />
                    {/* Warning zone (90-110%) */}
                    <div className="admin-threshold-zone warning" style={{ width: '20%' }} />
                    {/* Critical zone (above 110%) */}
                    <div className="admin-threshold-zone critical" style={{ width: '40%' }} />
                    {/* Baseline marker */}
                    <div className="admin-threshold-baseline" style={{ left: '50%' }}>
                      <span className="admin-threshold-baseline-label">Target</span>
                    </div>
                    {/* Actual value indicator */}
                    <div 
                      className="admin-threshold-indicator" 
                      data-status={status}
                      style={{ 
                        left: `${Math.min(Math.max((percentOfBaseline - 80) * 2.5, 0), 100)}%` 
                      }}
                    >
                      <span className="admin-threshold-indicator-label">
                        {formatPercent(actual)}
                      </span>
                    </div>
                  </div>
                  <div className="admin-threshold-bar-labels">
                    <span className="admin-threshold-bar-label">Below Target</span>
                    <span className="admin-threshold-bar-label">Near Target</span>
                    <span className="admin-threshold-bar-label">Above Target</span>
                  </div>
                </div>
                <div className="admin-threshold-footer">
                  <div className="admin-threshold-status-badge" data-status={status}>
                    <span className="admin-threshold-status-icon">
                      {status === 'safe' && '✓'}
                      {status === 'warning' && '⚠'}
                      {status === 'critical' && '⚠'}
                    </span>
                    <span>
                      {status === 'safe' && 'Below Threshold'}
                      {status === 'warning' && 'Near Threshold'}
                      {status === 'critical' && 'Above Threshold'}
                    </span>
                  </div>
                  <span className="admin-threshold-usage-text">
                    Consuming <strong>{percentOfBaseline.toFixed(1)}%</strong> of allowed baseline
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default DashboardPage;
