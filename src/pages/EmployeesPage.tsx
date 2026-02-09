import { useState, useMemo, useEffect } from "react";
import EmployeeCard from "../components/EmployeeCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import Drawer from "../components/Drawer";
import { donors, employees as baseEmployees, programs } from "../data/mockData";
import { formatCurrency, formatDate, formatPercent, calculateProjectedSalary, calculateProjectedCTC } from "../utils/format";
import { useEmployeeIncrements } from "../hooks/useEmployeeIncrements";

const EmployeesPage = () => {
  const { increments, setIncrement, resetAll, hasAnyIncrements } = useEmployeeIncrements();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [profileOverrides, setProfileOverrides] = useState<Record<string, {
    role?: string;
    cityGeo?: string;
    programId?: string;
  }>>({});
  const [customCompFields, setCustomCompFields] = useState<Record<string, Array<{
    id: string;
    label: string;
    value: string;
  }>>>({});
  const [addingField, setAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

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

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId);
  
  const selectedProgram =
    programs.find((program) => program.id === selectedEmployee?.programId)?.name ??
    "Unassigned";

  // Full employee detail calculations (from EmployeeDetailPage)
  const employeeDetailData = useMemo(() => {
    if (!selectedEmployee) return null;

    const plannedIncrement = increments[selectedEmployee.id] || 0;
    const annualSalary = selectedEmployee.monthlySalary * 12;
    const annualPF = selectedEmployee.pfContribution * 12;
    const annualTDS = selectedEmployee.tdsDeduction * 12;
    const annualCTC = annualSalary + annualPF;
    const projected = calculateProjectedCTC(selectedEmployee.monthlySalary, plannedIncrement);

    // Donor contribution calculations
    const referenceDate = new Date(Date.UTC(2025, 0, 1));
    const getTenureMonths = (dateString: string) => {
      const date = new Date(`${dateString}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) return 0;
      return Math.max(
        0,
        (referenceDate.getUTCFullYear() - date.getUTCFullYear()) * 12 +
          (referenceDate.getUTCMonth() - date.getUTCMonth())
      );
    };

    const buildAllocationScore = (emp: typeof selectedEmployee) => {
      const tenureMonths = getTenureMonths(emp.joiningDate);
      const tenureBoost = 1 + (Math.min(tenureMonths, 48) / 48) * 0.2;
      const annualSalaryForScore = emp.monthlySalary * 12;
      return annualSalaryForScore * tenureBoost;
    };

    const employeesByProgram = employees.reduce<Record<string, typeof employees>>(
      (acc, emp) => {
        acc[emp.programId] ??= [];
        acc[emp.programId].push(emp);
        return acc;
      },
      {}
    );

    const contributingDonors = donors
      .filter((donor) =>
        donor.preferences.some(
          (preference) => preference.programId === selectedEmployee.programId
        )
      )
      .map((donor) => {
        const preference = donor.preferences.find(
          (p) => p.programId === selectedEmployee.programId
        );
        
        if (!preference) {
          return { donor, allocationPercent: 0 };
        }

        const programEmployees = employeesByProgram[selectedEmployee.programId] ?? [];
        const totalProgramScore = programEmployees.reduce(
          (sum, emp) => sum + buildAllocationScore(emp),
          0
        );

        const employeeScore = buildAllocationScore(selectedEmployee);
        const allocationPercent = totalProgramScore > 0
          ? preference.weight * (employeeScore / totalProgramScore)
          : 0;

        return { donor, allocationPercent };
      })
      .filter((item) => item.allocationPercent > 0)
      .sort((a, b) => b.allocationPercent - a.allocationPercent);

    return {
      plannedIncrement,
      annualSalary,
      annualPF,
      annualTDS,
      annualCTC,
      projected,
      contributingDonors,
    };
  }, [selectedEmployee, employees, increments]);

  // Reset add-field form when selected employee changes
  useEffect(() => {
    setAddingField(false);
    setNewFieldLabel("");
    setNewFieldValue("");
  }, [selectedEmployeeId]);

  const uniqueRoles = useMemo(() =>
    Array.from(new Set(employees.map(emp => emp.role))).sort(),
    [employees]
  );

  const uniqueLocations = useMemo(() => {
    const seen = new Map<string, { city: string; geography: string }>();
    employees.forEach(emp => {
      const key = `${emp.city}|${emp.geography}`;
      if (!seen.has(key)) seen.set(key, { city: emp.city, geography: emp.geography });
    });
    return Array.from(seen.values()).sort((a, b) =>
      `${a.city}, ${a.geography}`.localeCompare(`${b.city}, ${b.geography}`)
    );
  }, [employees]);

  const selectStyle: React.CSSProperties = {
    background: 'var(--panel)',
    color: 'var(--ink)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-xs) var(--space-sm)',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '140px',
  };

  const fieldInputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '100px',
    padding: 'var(--space-xs) var(--space-sm)',
    background: 'var(--panel)',
    color: 'var(--ink)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.875rem',
  };

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
          <div
            key={employee.id}
            className="card-link"
            onClick={() => setSelectedEmployeeId(employee.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedEmployeeId(employee.id);
              }
            }}
          >
            <EmployeeCard
              employee={employee}
              donorCount={donorsByProgram[employee.programId]?.length ?? 0}
              onDetails={() => setSelectedEmployeeId(employee.id)}
            />
          </div>
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
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => setSelectedEmployeeId(employee.id)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer with FULL Employee Details */}
      <Drawer
        isOpen={Boolean(selectedEmployee)}
        title="Complete Employee Profile"
        onClose={() => setSelectedEmployeeId(null)}
      >
        {selectedEmployee && employeeDetailData ? (
          <div className="drawer-content-grid">
            <div className="drawer-hero">
              <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} />
              <div>
                <p className="detail-eyebrow">Employee</p>
                <h3>{selectedEmployee.name}</h3>
                <p className="detail-subtitle">{selectedEmployee.role}</p>
              </div>
            </div>

            {/* Increment Planner */}
            <div className="increment-planner">
              <label htmlFor="drawer-increment-input" className="increment-planner-label">
                Plan Salary Increment
              </label>
              <div className="increment-planner-control">
                <input
                  id="drawer-increment-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={employeeDetailData.plannedIncrement}
                  onChange={(e) => setIncrement(selectedEmployee.id, Number(e.target.value))}
                  className="increment-planner-input"
                  placeholder="0"
                />
                <span className="increment-planner-suffix">%</span>
              </div>
              {employeeDetailData.plannedIncrement > 0 && (
                <div className="increment-planner-preview">
                  Planning {employeeDetailData.plannedIncrement}% increment
                </div>
              )}
            </div>

            <div className="detail-grid">
              <section className="detail-card">
                <h2>Profile</h2>
                <div className="detail-row">
                  <span>Role</span>
                  <select
                    value={profileOverrides[selectedEmployee.id]?.role ?? selectedEmployee.role}
                    onChange={(e) => setProfileOverrides(prev => ({
                      ...prev,
                      [selectedEmployee.id]: { ...prev[selectedEmployee.id], role: e.target.value }
                    }))}
                    style={selectStyle}
                    aria-label="Role"
                  >
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="detail-row">
                  <span>Location</span>
                  <select
                    value={profileOverrides[selectedEmployee.id]?.cityGeo ?? `${selectedEmployee.city}|${selectedEmployee.geography}`}
                    onChange={(e) => setProfileOverrides(prev => ({
                      ...prev,
                      [selectedEmployee.id]: { ...prev[selectedEmployee.id], cityGeo: e.target.value }
                    }))}
                    style={selectStyle}
                    aria-label="Location"
                  >
                    {uniqueLocations.map(loc => (
                      <option key={`${loc.city}|${loc.geography}`} value={`${loc.city}|${loc.geography}`}>
                        {loc.city}, {loc.geography}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="detail-row">
                  <span>Program</span>
                  <select
                    value={profileOverrides[selectedEmployee.id]?.programId ?? selectedEmployee.programId}
                    onChange={(e) => setProfileOverrides(prev => ({
                      ...prev,
                      [selectedEmployee.id]: { ...prev[selectedEmployee.id], programId: e.target.value }
                    }))}
                    style={selectStyle}
                    aria-label="Program"
                  >
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                </div>
                <div className="detail-row">
                  <span>Joined</span>
                  <span>{formatDate(selectedEmployee.joiningDate)}</span>
                </div>
              </section>

              <section className="detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                  <h2>Compensation</h2>
                  {employeeDetailData.plannedIncrement > 0 && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setIncrement(selectedEmployee.id, 0)}
                      style={{ fontSize: '0.75rem', padding: 'var(--space-xs) var(--space-sm)' }}
                    >
                      Reset Increment
                    </button>
                  )}
                </div>

                {employeeDetailData.plannedIncrement > 0 ? (
                  <div className="compensation-comparison">
                    <div className="compensation-column">
                      <h3>Current</h3>
                      <div className="detail-row">
                        <span>Annual salary</span>
                        <span>{formatCurrency(employeeDetailData.annualSalary)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Annual PF contribution</span>
                        <span>{formatCurrency(employeeDetailData.annualPF)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Annual CTC</span>
                        <span>{formatCurrency(employeeDetailData.annualCTC)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Annual TDS deduction</span>
                        <span>{formatCurrency(employeeDetailData.annualTDS)}</span>
                      </div>
                    </div>
                    <div className="compensation-column projected">
                      <h3>Projected (+{employeeDetailData.plannedIncrement}%)</h3>
                      <div className="detail-row">
                        <span>Annual salary</span>
                        <span>{formatCurrency(employeeDetailData.projected.salary)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Annual PF contribution</span>
                        <span>{formatCurrency(employeeDetailData.projected.pf)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Annual CTC</span>
                        <span className="projected-highlight">{formatCurrency(employeeDetailData.projected.ctc)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Annual TDS deduction</span>
                        <span>{formatCurrency(Math.round(employeeDetailData.projected.salary * 0.1))}</span>
                      </div>
                      <div className="detail-row highlight">
                        <span>CTC Increase</span>
                        <span className="increase-amount">
                          +{formatCurrency(employeeDetailData.projected.ctc - employeeDetailData.annualCTC)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="detail-row">
                      <span>Annual salary</span>
                      <span>{formatCurrency(employeeDetailData.annualSalary)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Annual PF contribution</span>
                      <span>{formatCurrency(employeeDetailData.annualPF)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Annual CTC</span>
                      <span>{formatCurrency(employeeDetailData.annualCTC)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Annual TDS deduction</span>
                      <span>{formatCurrency(employeeDetailData.annualTDS)}</span>
                    </div>
                  </>
                )}

                {/* Custom compensation fields */}
                {(customCompFields[selectedEmployee.id] ?? []).map(field => (
                  <div className="detail-row" key={field.id}>
                    <span>{field.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      {field.value}
                      <button
                        type="button"
                        onClick={() => setCustomCompFields(prev => ({
                          ...prev,
                          [selectedEmployee.id]: (prev[selectedEmployee.id] ?? []).filter(f => f.id !== field.id)
                        }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ink-muted)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          padding: '0 var(--space-xs)',
                        }}
                        aria-label={`Remove ${field.label}`}
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                ))}

                {addingField ? (
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    alignItems: 'center',
                    marginTop: 'var(--space-sm)',
                    flexWrap: 'wrap',
                  }}>
                    <input
                      type="text"
                      placeholder="Label"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      style={fieldInputStyle}
                      aria-label="Field label"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      style={fieldInputStyle}
                      aria-label="Field value"
                    />
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => {
                        if (newFieldLabel.trim() && newFieldValue.trim()) {
                          setCustomCompFields(prev => ({
                            ...prev,
                            [selectedEmployee.id]: [
                              ...(prev[selectedEmployee.id] ?? []),
                              { id: `custom-${Date.now()}`, label: newFieldLabel.trim(), value: newFieldValue.trim() }
                            ]
                          }));
                          setNewFieldLabel("");
                          setNewFieldValue("");
                          setAddingField(false);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--ink-muted)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-xs) var(--space-sm)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setAddingField(false);
                        setNewFieldLabel("");
                        setNewFieldValue("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setAddingField(true)}
                    style={{ marginTop: 'var(--space-sm)', fontSize: '0.8125rem', padding: 'var(--space-xs) var(--space-md)' }}
                  >
                    + Add Field
                  </button>
                )}
              </section>
            </div>

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
                    {employeeDetailData.contributingDonors.length > 0 ? (
                      employeeDetailData.contributingDonors.map(({ donor, allocationPercent }) => (
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

            <div className="drawer-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSelectedEmployeeId(null)}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </section>
  );
};

export default EmployeesPage;
