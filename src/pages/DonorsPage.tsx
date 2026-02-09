import { useState, useMemo } from "react";
import DonorCard from "../components/DonorCard";
import HorizontalCarousel from "../components/HorizontalCarousel";
import Drawer from "../components/Drawer";
import { 
  donorMovementEvents,
  donors, 
  employees as baseEmployees, 
  programs 
} from "../data/mockData";
import { formatCurrency, formatDate, formatPercent, calculateProjectedSalary } from "../utils/format";
import { useEmployeeIncrements } from "../hooks/useEmployeeIncrements";

const DonorsPage = () => {
  const { increments } = useEmployeeIncrements();
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  // Apply individual increments to employees
  const employees = baseEmployees.map(emp => {
    const increment = increments[emp.id] || 0;
    if (increment > 0) {
      const projectedMonthly = calculateProjectedSalary(emp.monthlySalary, increment);
      return {
        ...emp,
        monthlySalary: projectedMonthly,
        pfContribution: Math.round(projectedMonthly * 0.12),
        tdsDeduction: Math.round(projectedMonthly * 0.1),
        plannedIncrement: increment,
      };
    }
    return { ...emp, plannedIncrement: 0 };
  });

  const selectedDonor = donors.find((donor) => donor.id === selectedDonorId);

  // Full donor detail calculations (from DonorDetailPage)
  const donorDetailData = useMemo(() => {
    if (!selectedDonor) return null;

    const preferencePrograms = selectedDonor.preferences.map((preference) => {
      const program = programs.find((item) => item.id === preference.programId);
      return {
        programId: preference.programId,
        programName: program?.name ?? "Unknown program",
        geography: program?.geography ?? "Unknown",
        cities: program?.cities ?? [],
        weight: preference.weight,
      };
    });

    const totalWeight = selectedDonor.preferences.reduce(
      (sum, preference) => sum + preference.weight,
      0
    );
    const unallocatedWeight = Math.max(0, 100 - totalWeight);
    const topPreference = preferencePrograms.reduce(
      (max, current) => (current.weight > max.weight ? current : max),
      preferencePrograms[0] ?? { programName: "None", weight: 0 }
    );

    const geographyPreferences = Array.from(
      preferencePrograms.reduce((map, program) => {
        const entry = map.get(program.geography) ?? new Set<string>();
        program.cities.forEach((city) => entry.add(city));
        map.set(program.geography, entry);
        return map;
      }, new Map<string, Set<string>>())
    ).map(([geography, cities]) => ({
      geography,
      cities: Array.from(cities),
    }));

    const employeesByProgram = employees.reduce<Record<string, typeof employees>>(
      (acc, employee) => {
        acc[employee.programId] ??= [];
        acc[employee.programId].push(employee);
        return acc;
      },
      {}
    );

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

    const buildAllocationScore = (employee: typeof employees[number]) => {
      const tenureMonths = getTenureMonths(employee.joiningDate);
      const tenureBoost = 1 + (Math.min(tenureMonths, 48) / 48) * 0.2;
      const annualSalary = employee.monthlySalary * 12;
      return annualSalary * tenureBoost;
    };

    const programScoreTotals = selectedDonor.preferences.reduce<Record<string, number>>(
      (acc, preference) => {
        const team = employeesByProgram[preference.programId] ?? [];
        const totalScore = team.reduce(
          (sum, employee) => sum + buildAllocationScore(employee),
          0
        );
        acc[preference.programId] = totalScore || 1;
        return acc;
      },
      {}
    );

    const allocatedEmployees = employees.filter((employee) =>
      selectedDonor.preferences.some(
        (preference) => preference.programId === employee.programId
      )
    );

    const allocatedEmployeeRows = allocatedEmployees.map((employee) => {
      const preference = selectedDonor.preferences.find(
        (item) => item.programId === employee.programId
      );
      const programName =
        programs.find((program) => program.id === employee.programId)?.name ??
        "Program";
      const totalScore = programScoreTotals[employee.programId] ?? 1;
      const allocationPercent = preference
        ? preference.weight * (buildAllocationScore(employee) / totalScore)
        : 0;

      return {
        employee,
        programName,
        allocationPercent,
      };
    });

    const recentMoves = donorMovementEvents.filter(
      (event) => event.donorId === selectedDonor.id
    );

    return {
      preferencePrograms,
      totalWeight,
      unallocatedWeight,
      topPreference,
      geographyPreferences,
      allocatedEmployeeRows,
      recentMoves,
    };
  }, [selectedDonor, employees]);

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Donors</h1>
          <p>Partners funding priority programs.</p>
        </div>
        <div className="page-meta">
          <span>{donors.length} donors</span>
        </div>
      </header>
      <HorizontalCarousel ariaLabel="Donor cards">
        {donors.map((donor) => (
          <div 
            key={donor.id} 
            className="card-link"
            onClick={() => setSelectedDonorId(donor.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedDonorId(donor.id);
              }
            }}
          >
            <DonorCard donor={donor} onDetails={() => setSelectedDonorId(donor.id)} />
          </div>
        ))}
      </HorizontalCarousel>
      <section className="detail-card">
        <h2>Donor Directory</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Type</th>
                <th>Admin %</th>
                <th>FCRA</th>
                <th>Contribution</th>
                <th>Preferences</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.name}</td>
                  <td>{donor.type}</td>
                  <td>{formatPercent(donor.adminOverheadPercent)}</td>
                  <td>{donor.fcraApproved ? "Yes" : "No"}</td>
                  <td>{formatCurrency(donor.contributionAmount)}</td>
                  <td>{donor.preferences.length}</td>
                  <td>
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => setSelectedDonorId(donor.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer with FULL Donor Details */}
      <Drawer
        isOpen={Boolean(selectedDonor)}
        title="Complete Donor Profile"
        onClose={() => setSelectedDonorId(null)}
      >
        {selectedDonor && donorDetailData ? (
          <div className="drawer-content-grid">
            <div className="drawer-hero">
              <div>
                <p className="detail-eyebrow">Donor</p>
                <h3>{selectedDonor.name}</h3>
                <p className="detail-subtitle">{selectedDonor.type}</p>
              </div>
            </div>

            <div className="detail-grid">
              <section className="detail-card">
                <h2>Overview</h2>
                <div className="detail-row">
                  <span>Donor type</span>
                  <span>{selectedDonor.type}</span>
                </div>
                <div className="detail-row">
                  <span>Contribution</span>
                  <span>{formatCurrency(selectedDonor.contributionAmount)}</span>
                </div>
                <div className="detail-row">
                  <span>Admin overhead</span>
                  <span>{formatPercent(selectedDonor.adminOverheadPercent)}</span>
                </div>
                <div className="detail-row">
                  <span>FCRA</span>
                  <span>{selectedDonor.fcraApproved ? "Approved" : "Not required"}</span>
                </div>
                <div className="detail-row">
                  <span>Preferences</span>
                  <span>{selectedDonor.preferences.length} allocations</span>
                </div>
              </section>

              <section className="detail-card">
                <h2>Metrics</h2>
                <div className="detail-row">
                  <span>Total preference weight</span>
                  <span>{formatPercent(donorDetailData.totalWeight)}</span>
                </div>
                <div className="detail-row">
                  <span>Unallocated weight</span>
                  <span>{formatPercent(donorDetailData.unallocatedWeight)}</span>
                </div>
                <div className="detail-row">
                  <span>Top preference</span>
                  <span>
                    {donorDetailData.topPreference.programName} (
                    {formatPercent(donorDetailData.topPreference.weight)})
                  </span>
                </div>
              </section>
            </div>

            <section className="detail-card">
              <h2>Allocation Preferences (Project)</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorDetailData.preferencePrograms.map((preference) => (
                      <tr key={preference.programName}>
                        <td>{preference.programName}</td>
                        <td>{formatPercent(preference.weight)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="detail-card">
              <h2>Geography Preferences</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Geography</th>
                      <th>Cities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorDetailData.geographyPreferences.map((preference) => (
                      <tr key={preference.geography}>
                        <td>{preference.geography}</td>
                        <td>{preference.cities.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="detail-card">
              <h2>Allocated Employees</h2>
              <p className="table-note">Allocation weighted by salary and tenure.</p>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Allocation %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorDetailData.allocatedEmployeeRows.map((row) => (
                      <tr key={row.employee.id}>
                        <td>
                          <div className="table-cell-title">
                            {row.employee.name}
                          </div>
                          <div className="table-cell-subtitle">
                            {row.employee.role} · {row.programName}
                          </div>
                        </td>
                        <td>{formatPercent(row.allocationPercent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="detail-card">
              <h2>Recent Moves</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Update</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorDetailData.recentMoves.length ? (
                      donorDetailData.recentMoves.map((event) => (
                        <tr key={event.id}>
                          <td>{event.summary}</td>
                          <td>{formatDate(event.date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2}>No recent moves recorded.</td>
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
                onClick={() => setSelectedDonorId(null)}
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

export default DonorsPage;
