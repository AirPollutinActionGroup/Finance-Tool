import { NavLink, useParams } from "react-router-dom";
import { donors, employees, programs } from "../data/mockData";
import { formatCurrency, formatDate, formatPercent, calculateProjectedCTC } from "../utils/format";
import { useEmployeeIncrements } from "../hooks/useEmployeeIncrements";
import { useEmployeeOverrides, applyEmployeeOverrides } from "../hooks/useEmployeeOverrides";

const EmployeeDetailPage = () => {
  const { employeeId } = useParams();
  const { getIncrement, setIncrement, resetEmployee } = useEmployeeIncrements();
  const { overrides, getCustomFields } = useEmployeeOverrides();

  const allEmployees = applyEmployeeOverrides(employees, overrides);
  const employee = allEmployees.find((item) => item.id === employeeId);

  if (!employee) {
    return (
      <section className="page-section">
        <h1>Employee not found</h1>
        <p>
          Return to the <NavLink to="/employees">employees list</NavLink>.
        </p>
      </section>
    );
  }

  const program =
    programs.find((item) => item.id === employee.programId)?.name ??
    "Unassigned";

  // Get planned increment
  const plannedIncrement = getIncrement(employee.id);

  // Calculate current annual figures
  const annualSalary = employee.monthlySalary * 12;
  const annualPF = employee.pfContribution * 12;
  const annualTDS = employee.tdsDeduction * 12;
  const annualCTC = annualSalary + annualPF;

  // Calculate projected figures with increment
  const projected = calculateProjectedCTC(employee.monthlySalary, plannedIncrement);
  const hasIncrement = plannedIncrement > 0;

  // Calculate donor contributions using same logic as DonorDetailPage
  const referenceDate = new Date(Date.UTC(2025, 0, 1));
  const getTenureMonths = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      return 0;
    }

    return Math.max(
      0,
      (referenceDate.getUTCFullYear() - date.getUTCFullYear()) * 12 +
        (referenceDate.getUTCMonth() - date.getUTCMonth())
    );
  };

  const buildAllocationScore = (emp: typeof employee) => {
    const tenureMonths = getTenureMonths(emp.joiningDate);
    const tenureBoost = 1 + (Math.min(tenureMonths, 48) / 48) * 0.2;
    // Use annual salary for allocation score to match annual compensation display
    const annualSalaryForScore = emp.monthlySalary * 12;
    return annualSalaryForScore * tenureBoost;
  };

  // Group employees by program for score calculation
  const employeesByProgram = allEmployees.reduce<Record<string, typeof allEmployees>>(
    (acc, emp) => {
      acc[emp.programId] ??= [];
      acc[emp.programId].push(emp);
      return acc;
    },
    {}
  );

  // Find donors that contribute to this employee's program
  const contributingDonors = donors
    .filter((donor) =>
      donor.preferences.some(
        (preference) => preference.programId === employee.programId
      )
    )
    .map((donor) => {
      const preference = donor.preferences.find(
        (p) => p.programId === employee.programId
      );
      
      if (!preference) {
        return { donor, allocationPercent: 0 };
      }

      // Calculate total score for all employees in this program
      const programEmployees = employeesByProgram[employee.programId] ?? [];
      const totalProgramScore = programEmployees.reduce(
        (sum, emp) => sum + buildAllocationScore(emp),
        0
      );

      // Calculate this employee's allocation percentage
      const employeeScore = buildAllocationScore(employee);
      const allocationPercent = totalProgramScore > 0
        ? preference.weight * (employeeScore / totalProgramScore)
        : 0;

      return {
        donor,
        allocationPercent,
      };
    })
    .filter((item) => item.allocationPercent > 0)
    .sort((a, b) => b.allocationPercent - a.allocationPercent);

  return (
    <section className="page-section">
      <header className="detail-header">
        <div className="detail-header-media">
          <img src={employee.photoUrl} alt={employee.name} />
        </div>
        <div className="detail-header-body">
          <p className="detail-eyebrow">Employee</p>
          <h1>{employee.name}</h1>
          <p className="detail-subtitle">{employee.role}</p>
        </div>
      </header>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Profile</h2>
          <div className="detail-row">
            <span>Role</span>
            <span>{employee.role}</span>
          </div>
          <div className="detail-row">
            <span>Location</span>
            <span>
              {employee.city}, {employee.geography}
            </span>
          </div>
          <div className="detail-row">
            <span>Program</span>
            <span>{program}</span>
          </div>
          <div className="detail-row">
            <span>Joined</span>
            <span>{formatDate(employee.joiningDate)}</span>
          </div>
        </section>
        <section className="detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h2>Compensation</h2>
            {hasIncrement && (
              <button
                type="button"
                className="ghost-button"
                onClick={() => resetEmployee(employee.id)}
                style={{ fontSize: '0.75rem', padding: 'var(--space-xs) var(--space-sm)' }}
              >
                Reset Increment
              </button>
            )}
          </div>
          
          <div className="increment-planner">
            <label htmlFor="increment-input" className="increment-planner-label">
              Plan Salary Increment
            </label>
            <div className="increment-planner-control">
              <input
                id="increment-input"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={plannedIncrement}
                onChange={(e) => setIncrement(employee.id, Number(e.target.value))}
                className="increment-planner-input"
                placeholder="0"
              />
              <span className="increment-planner-suffix">%</span>
            </div>
            {hasIncrement && (
              <div className="increment-planner-preview">
                Planning {plannedIncrement}% increment
              </div>
            )}
          </div>

          <div className="compensation-comparison">
            <div className="compensation-column">
              <h3>Current</h3>
              <div className="detail-row">
                <span>Annual salary</span>
                <span>{formatCurrency(annualSalary)}</span>
              </div>
              <div className="detail-row">
                <span>Annual PF contribution</span>
                <span>{formatCurrency(annualPF)}</span>
              </div>
              <div className="detail-row">
                <span>Annual CTC</span>
                <span>{formatCurrency(annualCTC)}</span>
              </div>
              <div className="detail-row">
                <span>Annual TDS deduction</span>
                <span>{formatCurrency(annualTDS)}</span>
              </div>
            </div>
            
            {hasIncrement && (
              <div className="compensation-column projected">
                <h3>Projected (+{plannedIncrement}%)</h3>
                <div className="detail-row">
                  <span>Annual salary</span>
                  <span>{formatCurrency(projected.salary)}</span>
                </div>
                <div className="detail-row">
                  <span>Annual PF contribution</span>
                  <span>{formatCurrency(projected.pf)}</span>
                </div>
                <div className="detail-row">
                  <span>Annual CTC</span>
                  <span className="projected-highlight">{formatCurrency(projected.ctc)}</span>
                </div>
                <div className="detail-row">
                  <span>Annual TDS deduction</span>
                  <span>{formatCurrency(Math.round(projected.salary * 0.1))}</span>
                </div>
                <div className="detail-row highlight">
                  <span>CTC Increase</span>
                  <span className="increase-amount">
                    +{formatCurrency(projected.ctc - annualCTC)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Custom compensation fields (shared with drawer) */}
          {getCustomFields(employee.id).map(field => (
            <div className="detail-row" key={field.id}>
              <span>{field.label}</span>
              <span>{field.value}</span>
            </div>
          ))}
        </section>
        <section className="detail-card">
          <h2>Donor Contributions</h2>
          <p className="table-note">
            Percentage of each donor's contribution allocated to this employee's annual salary.
          </p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Type</th>
                  <th>Allocation %</th>
                </tr>
              </thead>
              <tbody>
                {contributingDonors.length > 0 ? (
                  contributingDonors.map(({ donor, allocationPercent }) => (
                    <tr key={donor.id}>
                      <td>
                        <div className="table-cell-title">{donor.name}</div>
                        <div className="table-cell-subtitle">
                          {formatCurrency(donor.contributionAmount)} contribution
                        </div>
                      </td>
                      <td>{donor.type}</td>
                      <td>{formatPercent(allocationPercent)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No donors allocated to this employee's program.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
};

export default EmployeeDetailPage;
