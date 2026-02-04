import { NavLink, useParams } from "react-router-dom";
import {
  donorMovementEvents,
  donors,
  employees,
  programs,
} from "../data/mockData";

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
  const allocatedEmployees = employees.filter((employee) =>
    donor.preferences.some((preference) => preference.programId === employee.programId)
  );
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
            <span>INR {donor.contributionAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="detail-row">
            <span>Admin overhead</span>
            <span>{donor.adminOverheadPercent}%</span>
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
            <span>{totalWeight}%</span>
          </div>
          <div className="detail-row">
            <span>Unallocated weight</span>
            <span>{unallocatedWeight}%</span>
          </div>
          <div className="detail-row">
            <span>Top preference</span>
            <span>
              {topPreference.programName} ({topPreference.weight}%)
            </span>
          </div>
        </section>
        <section className="detail-card">
          <h2>Allocation Preferences (Project)</h2>
          <ul className="detail-list">
            {preferencePrograms.map((preference) => (
              <li key={preference.programName} className="detail-list-item">
                <span>{preference.programName}</span>
                <span>{preference.weight}%</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="detail-card">
          <h2>Geography Preferences</h2>
          <ul className="detail-list">
            {geographyPreferences.map((preference) => (
              <li key={preference.geography} className="detail-list-item">
                <span>{preference.geography}</span>
                <span>{preference.cities.join(", ")}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="detail-card">
          <h2>Allocated Employees</h2>
          <ul className="detail-list">
            {allocatedEmployees.map((employee) => {
              const programName =
                programs.find((program) => program.id === employee.programId)
                  ?.name ?? "Program";

              return (
                <li key={employee.id} className="detail-list-item">
                  <span>{employee.name}</span>
                  <span>
                    {employee.role} · {programName}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="detail-card">
          <h2>Recent Moves</h2>
          <ul className="detail-list">
            {recentMoves.length ? (
              recentMoves.map((event) => (
                <li key={event.id} className="detail-list-item">
                  <span>{event.summary}</span>
                  <span>{event.date}</span>
                </li>
              ))
            ) : (
              <li className="detail-list-item">
                <span>No recent moves recorded.</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
};

export default DonorDetailPage;
