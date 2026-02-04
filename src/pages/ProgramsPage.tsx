import { useMemo, useState } from "react";
import { donors, employees, programs } from "../data/mockData";
import { formatPercent } from "../utils/format";

const ProgramsPage = () => {
  const [activeTab, setActiveTab] = useState<"programs" | "geographies">(
    "programs"
  );

  const programInsights = useMemo(
    () =>
      programs.map((program) => {
        const programEmployees = employees.filter(
          (employee) => employee.programId === program.id
        );
        const programDonors = donors.filter((donor) =>
          donor.preferences.some((preference) => preference.programId === program.id)
        );

        return {
          program,
          programEmployees,
          programDonors,
        };
      }),
    []
  );

  const geographyInsights = useMemo(() => {
    const stateMap = new Map<
      string,
      {
        state: string;
        cities: Set<string>;
        employees: typeof employees;
        donors: typeof donors;
      }
    >();

    programs.forEach((program) => {
      const entry = stateMap.get(program.geography) ?? {
        state: program.geography,
        cities: new Set<string>(),
        employees: [],
        donors: [],
      };
      program.cities.forEach((city) => entry.cities.add(city));
      stateMap.set(program.geography, entry);
    });

    employees.forEach((employee) => {
      const entry = stateMap.get(employee.geography) ?? {
        state: employee.geography,
        cities: new Set<string>(),
        employees: [],
        donors: [],
      };
      entry.cities.add(employee.city);
      entry.employees.push(employee);
      stateMap.set(employee.geography, entry);
    });

    donors.forEach((donor) => {
      const donorStates = new Set<string>();
      donor.preferences.forEach((preference) => {
        const program = programs.find((item) => item.id === preference.programId);
        if (program) {
          donorStates.add(program.geography);
        }
      });

      donorStates.forEach((state) => {
        const entry = stateMap.get(state);
        if (entry) {
          entry.donors.push(donor);
        }
      });
    });

    return Array.from(stateMap.values());
  }, []);

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Programs & Geography</h1>
          <p>Explore program focus areas and regional coverage.</p>
        </div>
        <div className="page-meta tabs">
          <button
            type="button"
            className={activeTab === "programs" ? "tab active" : "tab"}
            onClick={() => setActiveTab("programs")}
          >
            Programs
          </button>
          <button
            type="button"
            className={activeTab === "geographies" ? "tab active" : "tab"}
            onClick={() => setActiveTab("geographies")}
          >
            Geographies
          </button>
        </div>
      </header>
      {activeTab === "programs" ? (
        <div className="insight-grid">
          {programInsights.map(({ program, programEmployees, programDonors }) => (
            <article key={program.id} className="insight-card">
              <header>
                <h2>{program.name}</h2>
                <p>{program.description}</p>
              </header>
              <div className="insight-meta">
                <span>{program.geography}</span>
                <span>{program.cities.join(", ")}</span>
              </div>
              <div className="insight-columns">
                <div>
                  <h3>Employees</h3>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>City</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programEmployees.map((employee) => (
                          <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.role}</td>
                            <td>{employee.city}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3>Donors</h3>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Admin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programDonors.map((donor) => (
                          <tr key={donor.id}>
                            <td>{donor.name}</td>
                            <td>{donor.type}</td>
                            <td>{formatPercent(donor.adminOverheadPercent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="insight-grid">
          {geographyInsights.map((geography) => (
            <article key={geography.state} className="insight-card">
              <header>
                <h2>{geography.state}</h2>
                <p>{Array.from(geography.cities).join(", ")}</p>
              </header>
              <div className="insight-columns">
                <div>
                  <h3>Employees</h3>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                          <th>City</th>
                        </tr>
                      </thead>
                      <tbody>
                        {geography.employees.map((employee) => (
                          <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.role}</td>
                            <td>{employee.city}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3>Donors</h3>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Admin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {geography.donors.map((donor) => (
                          <tr key={donor.id}>
                            <td>{donor.name}</td>
                            <td>{donor.type}</td>
                            <td>{formatPercent(donor.adminOverheadPercent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProgramsPage;
