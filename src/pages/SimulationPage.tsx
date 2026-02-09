import { useMemo, useState } from "react";
import { donors, employees as baseEmployees, programs } from "../data/mockData";
import {
  OPERATIONAL_OVERHEAD,
  runSimulation,
} from "../simulation/engine";
import { formatCurrency, formatPercent, calculateProjectedSalary } from "../utils/format";
import { useEmployeeIncrements } from "../hooks/useEmployeeIncrements";
import { useEmployeeOverrides, applyEmployeeOverrides } from "../hooks/useEmployeeOverrides";
import { useDonorOverrides, applyDonorPreferenceOverrides } from "../hooks/useDonorOverrides";

const scenarios = [
  {
    id: "current",
    name: "📊 Current State",
    description: "Your actual funding and costs as they are today",
    impact: "Shows your real financial position with no changes",
    icon: "📊",
    donorMultiplier: 1,
    salaryMultiplier: 1,
    overheadMultiplier: 1,
  },
  {
    id: "new-hire",
    name: "👥 New Hire Planning",
    description: "Planning to hire 2-3 new employees",
    impact: "Increases salaries by 15%, maintains current funding",
    icon: "👥",
    donorMultiplier: 1,
    salaryMultiplier: 1.15,
    overheadMultiplier: 1.05,
  },
  {
    id: "donor-exit",
    name: "🚨 Donor Exit Scenario",
    description: "What if a major donor withdraws?",
    impact: "Reduces funding by 20%, maintains current costs",
    icon: "🚨",
    donorMultiplier: 0.8,
    salaryMultiplier: 1,
    overheadMultiplier: 1,
  },
  {
    id: "salary-increment",
    name: "💰 Annual Increment",
    description: "Planning 10% annual salary increases",
    impact: "Increases all salaries by 10%, maintains funding",
    icon: "💰",
    donorMultiplier: 1,
    salaryMultiplier: 1.1,
    overheadMultiplier: 1,
  },
  {
    id: "expansion",
    name: "🎯 Program Expansion",
    description: "Adding new geography or program",
    impact: "Increases funding 15%, costs 12%, overhead 10%",
    icon: "🎯",
    donorMultiplier: 1.15,
    salaryMultiplier: 1.12,
    overheadMultiplier: 1.1,
  },
  {
    id: "emergency",
    name: "⚡ Emergency Mode",
    description: "Cost-cutting to extend runway",
    impact: "Reduces costs 10%, funding may drop 5%",
    icon: "⚡",
    donorMultiplier: 0.95,
    salaryMultiplier: 0.9,
    overheadMultiplier: 0.85,
  },
  {
    id: "custom",
    name: "⚙️ Custom Scenario",
    description: "Adjust all parameters manually",
    impact: "Full control over all financial variables",
    icon: "⚙️",
    donorMultiplier: 1,
    salaryMultiplier: 1,
    overheadMultiplier: 1,
  },
];

const SimulationPage = () => {
  const { increments, hasAnyIncrements } = useEmployeeIncrements();
  const { overrides } = useEmployeeOverrides();
  const { preferenceOverrides } = useDonorOverrides();
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [salaryMultiplier, setSalaryMultiplier] = useState(1);
  const [donorMultiplier, setDonorMultiplier] = useState(1);
  const [manualOverhead, setManualOverhead] = useState(OPERATIONAL_OVERHEAD);

  const activeScenario = scenarios.find(
    (scenario) => scenario.id === activeScenarioId
  )!;

  // Apply individual increments and profile overrides to create base employees
  const employees = applyEmployeeOverrides(
    baseEmployees.map(emp => {
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
    }),
    overrides
  );

  // Apply donor preference overrides
  const effectiveDonors = applyDonorPreferenceOverrides(donors, preferenceOverrides);

  // Baseline simulation (current state) for comparison
  const baselineSimulation = useMemo(() => {
    return runSimulation(effectiveDonors, programs, baseEmployees, OPERATIONAL_OVERHEAD);
  }, [effectiveDonors]);

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

    const adjustedDonors = effectiveDonors.map((donor) => ({
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
          {hasAnyIncrements && (
            <div className="planning-notice">
              ℹ️ Individual employee increments are included in all calculations
            </div>
          )}
        </div>
      </header>

      {/* Increment Summary */}
      {hasAnyIncrements && (
        <section className="detail-card">
          <h2>📋 Planned Increments Summary</h2>
          <div className="increment-summary-grid">
            <div className="increment-summary-stats">
              <div className="increment-stat">
                <span className="increment-stat-label">Employees with increments</span>
                <span className="increment-stat-value">
                  {Object.values(increments).filter(inc => inc > 0).length} / {baseEmployees.length}
                </span>
              </div>
              <div className="increment-stat">
                <span className="increment-stat-label">Average increment</span>
                <span className="increment-stat-value">
                  {(Object.values(increments).reduce((sum, inc) => sum + inc, 0) / 
                    Object.values(increments).filter(inc => inc > 0).length).toFixed(1)}%
                </span>
              </div>
              <div className="increment-stat">
                <span className="increment-stat-label">Additional annual cost</span>
                <span className="increment-stat-value">
                  {formatCurrency(
                    baseEmployees.reduce((sum, emp) => {
                      const inc = increments[emp.id] || 0;
                      const increase = emp.monthlySalary * 12 * (inc / 100);
                      const pfIncrease = increase * 0.12;
                      return sum + increase + pfIncrease;
                    }, 0)
                  )}
                </span>
              </div>
            </div>
            <div className="increment-summary-list">
              <h3>Employees with planned increments:</h3>
              <div className="increment-summary-items">
                {baseEmployees
                  .filter(emp => (increments[emp.id] || 0) > 0)
                  .sort((a, b) => (increments[b.id] || 0) - (increments[a.id] || 0))
                  .map(emp => {
                    const inc = increments[emp.id] || 0;
                    const currentAnnual = emp.monthlySalary * 12;
                    const projectedAnnual = calculateProjectedSalary(emp.monthlySalary, inc) * 12;
                    const increase = projectedAnnual - currentAnnual;
                    return (
                      <div key={emp.id} className="increment-summary-item">
                        <div className="increment-summary-item-info">
                          <span className="increment-summary-name">{emp.name}</span>
                          <span className="increment-summary-role">{emp.role}</span>
                        </div>
                        <div className="increment-summary-item-values">
                          <span className="increment-summary-percent">+{inc}%</span>
                          <span className="increment-summary-amount">
                            {formatCurrency(currentAnnual)} → {formatCurrency(projectedAnnual)}
                          </span>
                          <span className="increment-summary-increase">
                            +{formatCurrency(increase)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="simulation-controls">
        <div>
          <h2 style={{ marginBottom: 'var(--space-sm)' }}>What do you want to simulate?</h2>
          <p className="table-note">Choose a scenario to see its financial impact</p>
        </div>
        <div className="scenario-selector-grid">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={scenario.id === activeScenarioId ? "scenario-card active" : "scenario-card"}
              onClick={() => setActiveScenarioId(scenario.id)}
            >
              <div className="scenario-card-icon">{scenario.icon}</div>
              <div className="scenario-card-content">
                <strong>{scenario.name}</strong>
                <span className="scenario-card-description">{scenario.description}</span>
                <span className="scenario-card-impact">{scenario.impact}</span>
              </div>
            </button>
          ))}
        </div>
        
        {activeScenarioId === 'custom' && (
          <div className="manual-controls">
            <h3>Fine-Tune Parameters</h3>
            <p className="table-note" style={{ gridColumn: '1 / -1', marginTop: '-var(--space-sm)' }}>
              {hasAnyIncrements 
                ? 'These adjustments apply ON TOP of individual employee increments you set'
                : 'Set individual increments on Employees page, or use these for quick "what if" tests'}
            </p>
            <div className="control-group">
              <div className="control-header">
                <label htmlFor="salaryMultiplier">Additional Salary Adjustment</label>
                <span className="control-value">{salaryMultiplier > 1 ? '▲' : salaryMultiplier < 1 ? '▼' : '='} {((salaryMultiplier - 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                id="salaryMultiplier"
                type="range"
                min="0.7"
                max="1.3"
                step="0.01"
                value={salaryMultiplier}
                onChange={(event) =>
                  setSalaryMultiplier(Number(event.target.value))
                }
              />
              <div className="control-impact">
                {hasAnyIncrements 
                  ? `Applied after individual increments (e.g., for inflation adjustment)`
                  : `Current: ${formatCurrency(baselineSimulation.monthlyBurn)} → Projected: ${formatCurrency(simulation.monthlyBurn)}`}
              </div>
            </div>
            <div className="control-group">
              <div className="control-header">
                <label htmlFor="donorMultiplier">Funding Change</label>
                <span className="control-value">{donorMultiplier > 1 ? '▲' : donorMultiplier < 1 ? '▼' : '='} {((donorMultiplier - 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                id="donorMultiplier"
                type="range"
                min="0.7"
                max="1.3"
                step="0.01"
                value={donorMultiplier}
                onChange={(event) =>
                  setDonorMultiplier(Number(event.target.value))
                }
              />
              <div className="control-impact">
                Test new donor, donor exit, or funding reduction scenarios
              </div>
            </div>
            <div className="control-group">
              <div className="control-header">
                <label htmlFor="overheadInput">Monthly Operational Overhead</label>
                <span className="control-help">Fixed monthly costs</span>
              </div>
              <input
                id="overheadInput"
                type="number"
                min="0"
                step="10000"
                value={manualOverhead}
                onChange={(event) =>
                  setManualOverhead(Number(event.target.value))
                }
              />
              <div className="control-impact">
                Rent, utilities, admin salaries, software, insurance, etc.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Impact Comparison Display */}
      {activeScenarioId !== 'current' && (
        <section className="impact-comparison">
          <h2>📊 Impact Analysis</h2>
          <p className="table-note">Comparing {activeScenario.name} to current state</p>
          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-label">Monthly Burn Rate</div>
              <div className="impact-values">
                <span className="impact-before">{formatCurrency(baselineSimulation.monthlyBurn)}</span>
                <span className="impact-arrow">→</span>
                <span className="impact-after">{formatCurrency(simulation.monthlyBurn)}</span>
              </div>
              <div className={`impact-change ${simulation.monthlyBurn > baselineSimulation.monthlyBurn ? 'negative' : 'positive'}`}>
                {simulation.monthlyBurn > baselineSimulation.monthlyBurn ? '▲' : '▼'} 
                {formatCurrency(Math.abs(simulation.monthlyBurn - baselineSimulation.monthlyBurn))}
                ({((simulation.monthlyBurn / baselineSimulation.monthlyBurn - 1) * 100).toFixed(1)}%)
              </div>
            </div>
            
            <div className="impact-card">
              <div className="impact-label">Total Funding</div>
              <div className="impact-values">
                <span className="impact-before">{formatCurrency(baselineSimulation.totalContributions)}</span>
                <span className="impact-arrow">→</span>
                <span className="impact-after">{formatCurrency(simulation.totalContributions)}</span>
              </div>
              <div className={`impact-change ${simulation.totalContributions > baselineSimulation.totalContributions ? 'positive' : 'negative'}`}>
                {simulation.totalContributions > baselineSimulation.totalContributions ? '▲' : '▼'} 
                {formatCurrency(Math.abs(simulation.totalContributions - baselineSimulation.totalContributions))}
                ({((simulation.totalContributions / baselineSimulation.totalContributions - 1) * 100).toFixed(1)}%)
              </div>
            </div>
            
            <div className="impact-card">
              <div className="impact-label">Admin Costs</div>
              <div className="impact-values">
                <span className="impact-before">{formatCurrency(baselineSimulation.totalAdminCost)}</span>
                <span className="impact-arrow">→</span>
                <span className="impact-after">{formatCurrency(simulation.totalAdminCost)}</span>
              </div>
              <div className={`impact-change ${simulation.totalAdminCost < baselineSimulation.totalAdminCost ? 'positive' : 'negative'}`}>
                {simulation.totalAdminCost > baselineSimulation.totalAdminCost ? '▲' : '▼'} 
                {formatCurrency(Math.abs(simulation.totalAdminCost - baselineSimulation.totalAdminCost))}
                ({((simulation.totalAdminCost / baselineSimulation.totalAdminCost - 1) * 100).toFixed(1)}%)
              </div>
            </div>
            
            <div className="impact-card highlight">
              <div className="impact-label">Runway</div>
              <div className="impact-values">
                <span className="impact-before">{baselineSimulation.runwayMonths.toFixed(1)} months</span>
                <span className="impact-arrow">→</span>
                <span className="impact-after">{simulation.runwayMonths.toFixed(1)} months</span>
              </div>
              <div className={`impact-change ${simulation.runwayMonths > baselineSimulation.runwayMonths ? 'positive' : 'negative'}`}>
                {simulation.runwayMonths > baselineSimulation.runwayMonths ? '▲' : '▼'} 
                {Math.abs(simulation.runwayMonths - baselineSimulation.runwayMonths).toFixed(1)} months
                ({((simulation.runwayMonths / baselineSimulation.runwayMonths - 1) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* Donor Usage Timeline */}
      {simulation.donorRunways && simulation.donorRunways.length > 0 && (
        <section className="detail-card">
          <h2>📅 Recommended Donor Usage Timeline</h2>
          <p className="table-note">
            Strategic order to use donor funds for optimal cash flow and runway extension
          </p>
          <div className="donor-timeline">
            {simulation.donorRunways
              .sort((a, b) => {
                // Sort by strategy: Use donors with longer runway first to spread risk
                const aScore = simulation.donorScores?.find(s => s.donorId === a.donorId)?.totalScore || 0;
                const bScore = simulation.donorScores?.find(s => s.donorId === b.donorId)?.totalScore || 0;
                return bScore - aScore;
              })
              .map((runway, index) => {
                const donorData = effectiveDonors.find(d => d.id === runway.donorId);
                const score = simulation.donorScores?.find(s => s.donorId === runway.donorId);
                const isRecommended = index === 0;
                
                return (
                  <div key={runway.donorId} className={`donor-timeline-item ${isRecommended ? 'recommended' : ''}`}>
                    <div className="donor-timeline-rank">
                      <span className="donor-timeline-number">{index + 1}</span>
                      {isRecommended && <span className="donor-timeline-badge">USE FIRST</span>}
                    </div>
                    <div className="donor-timeline-content">
                      <div className="donor-timeline-header">
                        <div>
                          <h3>{runway.donorName}</h3>
                          <span className="donor-timeline-type">{donorData?.type}</span>
                        </div>
                        <div className="donor-timeline-score">
                          Score: {score?.totalScore || 0}/100
                        </div>
                      </div>
                      <div className="donor-timeline-metrics">
                        <div className="donor-timeline-metric">
                          <span>Available Funds</span>
                          <strong>{formatCurrency(runway.availableFunds)}</strong>
                        </div>
                        <div className="donor-timeline-metric">
                          <span>Can Cover</span>
                          <strong>{runway.runwayMonths.toFixed(1)} months</strong>
                        </div>
                        <div className="donor-timeline-metric">
                          <span>Until</span>
                          <strong>{runway.depletionDate}</strong>
                        </div>
                        <div className="donor-timeline-metric">
                          <span>Admin Rate</span>
                          <strong>{formatPercent(donorData?.adminOverheadPercent || 0)}</strong>
                        </div>
                      </div>
                      <div className="donor-timeline-recommendation">
                        {index === 0 && '✓ Start with this donor - highest score and optimal efficiency'}
                        {index === 1 && '→ Use next after first donor depletes'}
                        {index === 2 && '→ Reserve for later months or emergency'}
                        {index > 2 && simulation.donorRunways && `→ Use in month ${Math.floor(simulation.donorRunways.slice(0, index).reduce((sum, r) => sum + r.runwayMonths, 0)) + 1}+`}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

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

      {/* Month-by-Month Cash Flow */}
      {simulation.donorRunways && (
        <section className="detail-card">
          <h2>💰 12-Month Cash Flow Projection</h2>
          <p className="table-note">
            Detailed monthly breakdown showing fund usage and runway
          </p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Opening Balance</th>
                  <th>Funding In</th>
                  <th>Burn Out</th>
                  <th>Closing Balance</th>
                  <th>Primary Donor</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(12, Math.ceil(simulation.runwayMonths)) }, (_, i) => {
                  const monthNumber = i + 1;
                  const monthlyFunding = simulation.totalNetFunding / 12;
                  const monthlyBurn = simulation.monthlyBurn;
                  const openingBalance = simulation.totalNetFunding - (monthlyBurn * i);
                  const closingBalance = openingBalance + monthlyFunding - monthlyBurn;
                  
                  // Determine which donor to primarily use this month
                  let cumulativeMonths = 0;
                  let primaryDonor = simulation.donorRunways?.[0];
                  if (simulation.donorRunways) {
                    for (const runway of simulation.donorRunways) {
                      if (i < cumulativeMonths + runway.runwayMonths) {
                        primaryDonor = runway;
                        break;
                      }
                      cumulativeMonths += runway.runwayMonths;
                    }
                  }

                  const isLowBalance = closingBalance < monthlyBurn * 3;
                  const isCritical = closingBalance < monthlyBurn;

                  return (
                    <tr key={monthNumber} className={isCritical ? 'critical-row' : isLowBalance ? 'warning-row' : ''}>
                      <td><strong>Month {monthNumber}</strong></td>
                      <td>{formatCurrency(Math.max(0, openingBalance))}</td>
                      <td>{formatCurrency(monthlyFunding)}</td>
                      <td>{formatCurrency(monthlyBurn)}</td>
                      <td>
                        <strong style={{ color: isCritical ? 'var(--error)' : isLowBalance ? 'var(--warning)' : 'var(--success)' }}>
                          {formatCurrency(Math.max(0, closingBalance))}
                        </strong>
                      </td>
                      <td>{primaryDonor?.donorName || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
