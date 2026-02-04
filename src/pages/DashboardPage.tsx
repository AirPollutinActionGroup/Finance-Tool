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
      donors.filter((donor) => {
        const baseline = ADMIN_RATE_BY_TYPE[donor.type] * 100;
        return (
          donor.adminOverheadPercent >= baseline * 0.9 &&
          donor.adminOverheadPercent <= baseline * 1.1
        );
      }),
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
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Admin %</th>
                </tr>
              </thead>
              <tbody>
                {adminWatchlist.map((donor) => (
                  <tr key={donor.id}>
                    <td>{donor.name}</td>
                    <td>{formatPercent(donor.adminOverheadPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
};

export default DashboardPage;
