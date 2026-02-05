import { NavLink } from "react-router-dom";
import EmployeeCard from "../components/EmployeeCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import { donors, employees as baseEmployees, programs } from "../data/mockData";
import { formatCurrency, formatDate, calculateProjectedSalary } from "../utils/format";
import { useEmployeeIncrements } from "../hooks/useEmployeeIncrements";

const EmployeesPage = () => {
  const { increments, setIncrement, resetAll, hasAnyIncrements } = useEmployeeIncrements();
  
  // Apply increments to employees
  const employees = baseEmployees.map(emp => ({
    ...emp,
    plannedIncrement: increments[emp.id] || 0,
  }));

  const donorsByProgram = donors.reduce<Record<string, typeof donors>>(
    (acc, donor) => {
      donor.preferences.forEach((preference) => {
        acc[preference.programId] ??= [];
        acc[preference.programId].push(donor);
      });
      return acc;
    },
    {}
  );

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Active team members across priority regions.</p>
        </div>
        <div className="page-meta">
          <span>{employees.length} employees</span>
        </div>
      </header>
      <HorizontalCarousel ariaLabel="Employee cards">
        {employees.map((employee) => (
          <NavLink
            key={employee.id}
            to={`/employees/${employee.id}`}
            className="card-link"
          >
            <EmployeeCard
              employee={employee}
              donorCount={donorsByProgram[employee.programId]?.length ?? 0}
            />
          </NavLink>
        ))}
      </HorizontalCarousel>
      <section className="detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2>Employee Directory</h2>
          {hasAnyIncrements && (
            <button
              type="button"
              className="ghost-button"
              onClick={resetAll}
              style={{ fontSize: '0.875rem' }}
            >
              Reset All Increments
            </button>
          )}
        </div>
        <p className="table-note">
          Set individual increment % to plan salary adjustments. Projections shown in simulation.
        </p>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Program</th>
                <th>Location</th>
                <th>Increment %</th>
                <th>Current Salary</th>
                <th>Projected Salary</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const programName =
                  programs.find((program) => program.id === employee.programId)
                    ?.name ?? "Unassigned";
                const increment = employee.plannedIncrement || 0;
                const currentAnnual = employee.monthlySalary * 12;
                const projectedMonthly = calculateProjectedSalary(employee.monthlySalary, increment);
                const projectedAnnual = projectedMonthly * 12;

                return (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td>{programName}</td>
                    <td>
                      {employee.city}, {employee.geography}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={increment}
                        onChange={(e) => setIncrement(employee.id, Number(e.target.value))}
                        className="increment-input"
                        placeholder="0"
                      />
                    </td>
                    <td>{formatCurrency(currentAnnual)}</td>
                    <td>
                      {increment > 0 ? (
                        <div className="projected-salary">
                          <strong>{formatCurrency(projectedAnnual)}</strong>
                          <span className="increment-badge">+{increment}%</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--ink-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <NavLink
                        to={`/employees/${employee.id}`}
                        className="table-action"
                      >
                        Details
                      </NavLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default EmployeesPage;
