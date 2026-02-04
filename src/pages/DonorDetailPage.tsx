import { NavLink, useParams } from "react-router-dom";
import {
  donorMovementEvents,
  donors,
  employees,
  programs,
} from "../data/mockData";
import { formatCurrency, formatDate, formatPercent } from "../utils/format";

const DonorDetailPage = () => {
  const { donorId } = useParams();

  const donor = donors.find((item) => item.id === donorId);

  if (!donor) {
    return (
      <section className="page-section">
        <h1>Donor not found</h1>
        <p>
          Return to the <NavLink to="/donors">donors list</NavLink>.
        </p>
      </section>
    );
  }

  const preferencePrograms = donor.preferences.map((preference) => {
    const program = programs.find((item) => item.id === preference.programId);

    return {
      programId: preference.programId,
      programName: program?.name ?? "Unknown program",
      geography: program?.geography ?? "Unknown",
      cities: program?.cities ?? [],
      weight: preference.weight,
    };
  });
  const totalWeight = donor.preferences.reduce(
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
  const allocatedEmployees = employees.filter((employee) =>
    donor.preferences.some(
      (preference) => preference.programId === employee.programId
    )
  );
  const allocatedEmployeeRows = allocatedEmployees.map((employee) => {
    const preference = donor.preferences.find(
      (item) => item.programId === employee.programId
    );
    const programName =
      programs.find((program) => program.id === employee.programId)?.name ??
      "Program";
    const totalInProgram = employeesByProgram[employee.programId]?.length ?? 1;
    const allocationPercent = preference
      ? preference.weight / totalInProgram
      : 0;

    return {
      employee,
      programName,
      allocationPercent,
    };
  });
  const recentMoves = donorMovementEvents.filter(
    (event) => event.donorId === donor.id
  );

  return (
    <section className="page-section">
      <header className="detail-header">
        <div className="detail-header-body">
          <p className="detail-eyebrow">Donor</p>
          <h1>{donor.name}</h1>
          <p className="detail-subtitle">{donor.type}</p>
        </div>
      </header>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Overview</h2>
          <div className="detail-row">
            <span>Donor type</span>
            <span>{donor.type}</span>
          </div>
          <div className="detail-row">
            <span>Contribution</span>
            <span>{formatCurrency(donor.contributionAmount)}</span>
          </div>
          <div className="detail-row">
            <span>Admin overhead</span>
            <span>{formatPercent(donor.adminOverheadPercent)}</span>
          </div>
          <div className="detail-row">
            <span>FCRA</span>
            <span>{donor.fcraApproved ? "Approved" : "Not required"}</span>
          </div>
          <div className="detail-row">
            <span>Preferences</span>
            <span>{donor.preferences.length} allocations</span>
          </div>
        </section>
        <section className="detail-card">
          <h2>Metrics</h2>
          <div className="detail-row">
            <span>Total preference weight</span>
            <span>{formatPercent(totalWeight)}</span>
          </div>
          <div className="detail-row">
            <span>Unallocated weight</span>
            <span>{formatPercent(unallocatedWeight)}</span>
          </div>
          <div className="detail-row">
            <span>Top preference</span>
            <span>
              {topPreference.programName} (
              {formatPercent(topPreference.weight)})
            </span>
          </div>
        </section>
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
                {preferencePrograms.map((preference) => (
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
                {geographyPreferences.map((preference) => (
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
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Allocation %</th>
                </tr>
              </thead>
              <tbody>
                {allocatedEmployeeRows.map((row) => (
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
                {recentMoves.length ? (
                  recentMoves.map((event) => (
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
      </div>
    </section>
  );
};

export default DonorDetailPage;
