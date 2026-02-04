import { useMemo, useState } from "react";
import { donors, employees, programs } from "../data/mockData";
import {
  OPERATIONAL_OVERHEAD,
  runSimulation,
} from "../simulation/engine";

const scenarios = [
  {
    id: "baseline",
    name: "Baseline",
    description: "Current funding and payroll levels.",
    donorMultiplier: 1,
    salaryMultiplier: 1,
    overheadMultiplier: 1,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Scaled funding with higher staffing costs.",
    donorMultiplier: 1.15,
    salaryMultiplier: 1.1,
    overheadMultiplier: 1.1,
  },
  {
    id: "conservative",
    name: "Conservative",
    description: "Lower funding with tighter operating costs.",
    donorMultiplier: 0.9,
    salaryMultiplier: 0.95,
    overheadMultiplier: 0.9,
  },
];

const SimulationPage = () => {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [salaryMultiplier, setSalaryMultiplier] = useState(1);
  const [donorMultiplier, setDonorMultiplier] = useState(1);
  const [manualOverhead, setManualOverhead] = useState(OPERATIONAL_OVERHEAD);

  const activeScenario = scenarios.find(
    (scenario) => scenario.id === activeScenarioId
  )!;

  const simulation = useMemo(() => {
    const effectiveSalaryMultiplier =
      salaryMultiplier * activeScenario.salaryMultiplier;
    const effectiveDonorMultiplier =
      donorMultiplier * activeScenario.donorMultiplier;
    const effectiveOverhead = Math.round(
      manualOverhead * activeScenario.overheadMultiplier
    );

    const adjustedEmployees = employees.map((employee) => {
      const monthlySalary = Math.round(
        employee.monthlySalary * effectiveSalaryMultiplier
      );
      const pfContribution = Math.round(monthlySalary * 0.12);
      const tdsDeduction = Math.round(monthlySalary * 0.1);

      return {
        ...employee,
        monthlySalary,
        pfContribution,
        tdsDeduction,
      };
    });

    const adjustedDonors = donors.map((donor) => ({
      ...donor,
      contributionAmount: Math.round(
        donor.contributionAmount * effectiveDonorMultiplier
      ),
    }));

    return runSimulation(
      adjustedDonors,
      programs,
      adjustedEmployees,
      effectiveOverhead
    );
  }, [activeScenario, donorMultiplier, manualOverhead, salaryMultiplier]);

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <h1>Simulation</h1>
          <p>Model funding scenarios and see live allocation impacts.</p>
        </div>
      </header>

      <div className="simulation-controls">
        <div className="scenario-selector">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={scenario.id === activeScenarioId ? "tab active" : "tab"}
              onClick={() => setActiveScenarioId(scenario.id)}
            >
              <strong>{scenario.name}</strong>
              <span>{scenario.description}</span>
            </button>
          ))}
        </div>
        <div className="manual-controls">
          <div className="control-group">
            <label htmlFor="salaryMultiplier">Salary multiplier</label>
            <input
              id="salaryMultiplier"
              type="range"
              min="0.8"
              max="1.2"
              step="0.01"
              value={salaryMultiplier}
              onChange={(event) =>
                setSalaryMultiplier(Number(event.target.value))
              }
            />
            <span>{salaryMultiplier.toFixed(2)}x</span>
          </div>
          <div className="control-group">
            <label htmlFor="donorMultiplier">Donor funding multiplier</label>
            <input
              id="donorMultiplier"
              type="range"
              min="0.8"
              max="1.2"
              step="0.01"
              value={donorMultiplier}
              onChange={(event) =>
                setDonorMultiplier(Number(event.target.value))
              }
            />
            <span>{donorMultiplier.toFixed(2)}x</span>
          </div>
          <div className="control-group">
            <label htmlFor="overheadInput">Operational overhead</label>
            <input
              id="overheadInput"
              type="number"
              min="0"
              value={manualOverhead}
              onChange={(event) =>
                setManualOverhead(Number(event.target.value))
              }
            />
          </div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <h3>Total contributions</h3>
          <p>INR {simulation.totalContributions.toLocaleString("en-IN")}</p>
        </div>
        <div className="metric-card">
          <h3>Admin cost</h3>
          <p>INR {simulation.totalAdminCost.toLocaleString("en-IN")}</p>
        </div>
        <div className="metric-card">
          <h3>Net funding</h3>
          <p>INR {simulation.totalNetFunding.toLocaleString("en-IN")}</p>
        </div>
        <div className="metric-card">
          <h3>General fund</h3>
          <p>INR {simulation.generalFundTotal.toLocaleString("en-IN")}</p>
        </div>
        <div className="metric-card">
          <h3>Monthly burn</h3>
          <p>INR {simulation.monthlyBurn.toLocaleString("en-IN")}</p>
        </div>
        <div className="metric-card">
          <h3>Runway</h3>
          <p>{simulation.runwayMonths.toFixed(1)} months</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          Funding vs burn (line chart placeholder)
        </div>
        <div className="chart-card">
          Allocation by geography (bar chart placeholder)
        </div>
        <div className="chart-card">
          Donor type mix (donut chart placeholder)
        </div>
      </div>

      <div className="table-grid">
        <section className="detail-card">
          <h2>Donor breakdown</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Type</th>
                <th>Net</th>
                <th>Admin</th>
                <th>General fund</th>
              </tr>
            </thead>
            <tbody>
              {simulation.donorSummaries.map((donor) => (
                <tr key={donor.donorId}>
                  <td>{donor.donorName}</td>
                  <td>{donor.donorType}</td>
                  <td>INR {donor.netAmount.toLocaleString("en-IN")}</td>
                  <td>INR {donor.adminAmount.toLocaleString("en-IN")}</td>
                  <td>INR {donor.generalFundAmount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="detail-card">
          <h2>Geography allocation</h2>
          <ul className="detail-list">
            {simulation.geographyAllocations.map((geo) => (
              <li key={geo.geography} className="detail-list-item">
                <span>{geo.geography}</span>
                <span>INR {geo.amount.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};

export default SimulationPage;
