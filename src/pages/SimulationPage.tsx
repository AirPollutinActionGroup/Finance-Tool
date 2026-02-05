import { useMemo, useState } from "react";
import { donors, employees, programs } from "../data/mockData";
import {
  OPERATIONAL_OVERHEAD,
  runSimulation,
} from "../simulation/engine";
import { formatCurrency, formatPercent } from "../utils/format";

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
          <p>{formatCurrency(simulation.totalContributions)}</p>
        </div>
        <div className="metric-card">
          <h3>Admin cost</h3>
          <p>{formatCurrency(simulation.totalAdminCost)}</p>
        </div>
        <div className="metric-card">
          <h3>Net funding</h3>
          <p>{formatCurrency(simulation.totalNetFunding)}</p>
        </div>
        <div className="metric-card">
          <h3>General fund</h3>
          <p>{formatCurrency(simulation.generalFundTotal)}</p>
        </div>
        <div className="metric-card">
          <h3>Monthly burn</h3>
          <p>{formatCurrency(simulation.monthlyBurn)}</p>
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

      {/* Allocation Strategy Recommendations */}
      {simulation.allocationStrategies && (
        <section className="detail-card">
          <h2>💡 Allocation Strategy Recommendations</h2>
          <p className="table-note">
            Based on donor scoring, preference matching, and financial optimization
          </p>
          <div className="strategy-grid">
            {simulation.allocationStrategies.map((strategy) => (
              <div key={strategy.scenarioName} className="strategy-card">
                <div className="strategy-header">
                  <h3>{strategy.scenarioName}</h3>
                  <span className={`strategy-risk-badge risk-${strategy.riskLevel}`}>
                    {strategy.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <p className="strategy-description">{strategy.description}</p>
                <div className="strategy-metrics">
                  <div className="strategy-metric">
                    <span className="strategy-metric-label">Expected Admin Cost</span>
                    <span className="strategy-metric-value">
                      {formatCurrency(strategy.expectedAdminCost)}
                    </span>
                  </div>
                  <div className="strategy-metric">
                    <span className="strategy-metric-label">Expected Runway</span>
                    <span className="strategy-metric-value">
                      {strategy.expectedRunway.toFixed(1)} months
                    </span>
                  </div>
                </div>
                <div className="strategy-recommendations">
                  <strong>Recommendations:</strong>
                  <ul>
                    {strategy.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="table-grid">
        {/* Donor Scoring & Rankings */}
        {simulation.donorScores && (
          <section className="detail-card">
            <h2>📊 Donor Scoring & Rankings</h2>
            <p className="table-note">
              Scored on admin efficiency, preference match, balance, and flexibility
            </p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Donor</th>
                    <th>Total Score</th>
                    <th>Admin</th>
                    <th>Preference</th>
                    <th>Balance</th>
                    <th>FCRA</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.donorScores.map((score) => (
                    <tr key={score.donorId}>
                      <td>
                        <span className={`rank-badge rank-${score.ranking}`}>
                          #{score.ranking}
                        </span>
                      </td>
                      <td className="table-cell-title">{score.donorName}</td>
                      <td>
                        <strong style={{ color: 'var(--brand)' }}>
                          {score.totalScore}/100
                        </strong>
                      </td>
                      <td>{score.adminScore}/100</td>
                      <td>{score.preferenceScore}/100</td>
                      <td>{score.balanceScore}/100</td>
                      <td>{score.fcraBonus > 0 ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Donor Runway Analysis */}
        {simulation.donorRunways && (
          <section className="detail-card">
            <h2>⏱️ Per-Donor Runway Analysis</h2>
            <p className="table-note">
              How long each donor's funds will last at current burn rate
            </p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Available Funds</th>
                    <th>Monthly Allocation</th>
                    <th>Runway</th>
                    <th>Depletion Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.donorRunways.map((runway) => (
                    <tr key={runway.donorId}>
                      <td className="table-cell-title">{runway.donorName}</td>
                      <td>{formatCurrency(runway.availableFunds)}</td>
                      <td>{formatCurrency(runway.monthlyAllocation)}</td>
                      <td>
                        <strong>{runway.runwayMonths.toFixed(1)} months</strong>
                      </td>
                      <td>{runway.depletionDate}</td>
                      <td>
                        <span className={`status-badge status-${runway.status}`}>
                          {runway.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <div className="table-grid">
        <section className="detail-card">
          <h2>Donor breakdown</h2>
          <div className="table-wrapper">
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
                    <td>{formatCurrency(donor.netAmount)}</td>
                    <td>{formatCurrency(donor.adminAmount)}</td>
                    <td>{formatCurrency(donor.generalFundAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="detail-card">
          <h2>Geography allocation</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Geography</th>
                  <th>Allocation</th>
                </tr>
              </thead>
              <tbody>
                {simulation.geographyAllocations.map((geo) => (
                  <tr key={geo.geography}>
                    <td>{geo.geography}</td>
                    <td>{formatCurrency(geo.amount)}</td>
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

export default SimulationPage;
