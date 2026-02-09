import { useState, useMemo, useEffect } from "react";
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
import { useEmployeeOverrides, applyEmployeeOverrides } from "../hooks/useEmployeeOverrides";
import { useDonorOverrides, applyDonorPreferenceOverrides } from "../hooks/useDonorOverrides";

const DonorsPage = () => {
  const { increments } = useEmployeeIncrements();
  const { overrides, allocationOverrides, setAllocation, removeAllocation } = useEmployeeOverrides();
  const {
    preferenceOverrides, geoAdditions, metricOverrides,
    setPreferences, addGeoEntry, removeGeoEntry, setMetric,
  } = useDonorOverrides();
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newEmployeePercent, setNewEmployeePercent] = useState("");
  const [addingPref, setAddingPref] = useState(false);
  const [newPrefProgramId, setNewPrefProgramId] = useState("");
  const [newPrefWeight, setNewPrefWeight] = useState("");
  const [addingGeo, setAddingGeo] = useState(false);
  const [newGeoMode, setNewGeoMode] = useState<"select" | "manual">("select");
  const [newGeoSelect, setNewGeoSelect] = useState("");
  const [newGeoManual, setNewGeoManual] = useState("");
  const [newGeoCities, setNewGeoCities] = useState("");

  // Apply individual increments and profile overrides to employees
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

  const selectedDonor = effectiveDonors.find((donor) => donor.id === selectedDonorId);

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

  // Merge computed employee allocations with overrides for the selected donor
  const mergedEmployees = useMemo(() => {
    if (!selectedDonor || !donorDetailData) return [];
    const computedEmpIds = new Set(donorDetailData.allocatedEmployeeRows.map(r => r.employee.id));

    // Computed employees with override applied if present
    const result = donorDetailData.allocatedEmployeeRows.map((row) => {
      const empOverrides = allocationOverrides[row.employee.id] || {};
      const overrideVal = empOverrides[selectedDonor.id];
      return {
        ...row,
        allocationPercent: overrideVal !== undefined ? overrideVal : row.allocationPercent,
        isManual: false,
      };
    });

    // Manually added employees (in overrides but not computed)
    for (const [empId, donorAllocs] of Object.entries(allocationOverrides)) {
      const percent = donorAllocs[selectedDonor.id];
      if (percent > 0 && !computedEmpIds.has(empId)) {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
          const programName = programs.find(p => p.id === emp.programId)?.name ?? "Program";
          result.push({ employee: emp, programName, allocationPercent: percent, isManual: true });
        }
      }
    }

    return result.filter(r => r.allocationPercent > 0);
  }, [selectedDonor, donorDetailData, allocationOverrides, employees]);

  // Reset forms when selected donor changes
  useEffect(() => {
    setAddingEmployee(false);
    setNewEmployeeId("");
    setNewEmployeePercent("");
    setAddingPref(false);
    setNewPrefProgramId("");
    setNewPrefWeight("");
    setAddingGeo(false);
    setNewGeoMode("select");
    setNewGeoSelect("");
    setNewGeoManual("");
    setNewGeoCities("");
  }, [selectedDonorId]);

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

  const uniqueGeographies = useMemo(() =>
    Array.from(new Set(programs.map(p => p.geography))).sort(),
    []
  );

  const citiesByGeography = useMemo(() =>
    programs.reduce<Record<string, string[]>>((acc, p) => {
      acc[p.geography] = [...new Set([...(acc[p.geography] || []), ...p.cities])];
      return acc;
    }, {}),
    []
  );

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
        {effectiveDonors.map((donor) => (
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
              {effectiveDonors.map((donor) => (
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
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={metricOverrides[selectedDonor.id]?.totalWeight ?? donorDetailData.totalWeight}
                    onChange={(e) => setMetric(selectedDonor.id, { totalWeight: Number(e.target.value) })}
                    className="increment-input"
                    aria-label="Total preference weight"
                  />
                </div>
                <div className="detail-row">
                  <span>Unallocated weight</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={metricOverrides[selectedDonor.id]?.unallocatedWeight ?? donorDetailData.unallocatedWeight}
                    onChange={(e) => setMetric(selectedDonor.id, { unallocatedWeight: Number(e.target.value) })}
                    className="increment-input"
                    aria-label="Unallocated weight"
                  />
                </div>
                <div className="detail-row">
                  <span>Top preference</span>
                  <input
                    type="text"
                    value={metricOverrides[selectedDonor.id]?.topPreference ?? `${donorDetailData.topPreference.programName} (${formatPercent(donorDetailData.topPreference.weight)})`}
                    onChange={(e) => setMetric(selectedDonor.id, { topPreference: e.target.value })}
                    style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      background: 'var(--panel)',
                      color: 'var(--ink)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      minWidth: '140px',
                    }}
                    aria-label="Top preference"
                  />
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDonor.preferences.map((pref, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            value={pref.programId}
                            onChange={(e) => {
                              const updated = [...selectedDonor.preferences];
                              updated[index] = { ...updated[index], programId: e.target.value };
                              setPreferences(selectedDonor.id, updated);
                            }}
                            style={selectStyle}
                            aria-label="Program"
                          >
                            {programs.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={pref.weight}
                            onChange={(e) => {
                              const updated = [...selectedDonor.preferences];
                              updated[index] = { ...updated[index], weight: Number(e.target.value) };
                              setPreferences(selectedDonor.id, updated);
                            }}
                            className="increment-input"
                            aria-label="Weight"
                          />
                        </td>
                        <td>
                          {selectedDonor.preferences.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreferences(
                                  selectedDonor.id,
                                  selectedDonor.preferences.filter((_, i) => i !== index)
                                );
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--ink-muted)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                              }}
                              aria-label="Remove preference"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {addingPref ? (
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'center',
                  marginTop: 'var(--space-sm)',
                  flexWrap: 'wrap',
                }}>
                  <select
                    value={newPrefProgramId}
                    onChange={(e) => setNewPrefProgramId(e.target.value)}
                    style={selectStyle}
                    aria-label="Select program"
                  >
                    <option value="">Select program…</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Weight"
                    value={newPrefWeight}
                    onChange={(e) => setNewPrefWeight(e.target.value)}
                    className="increment-input"
                    aria-label="Weight"
                  />
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => {
                      const w = Number(newPrefWeight);
                      if (newPrefProgramId && w > 0) {
                        setPreferences(selectedDonor.id, [
                          ...selectedDonor.preferences,
                          { programId: newPrefProgramId, weight: w },
                        ]);
                        setNewPrefProgramId("");
                        setNewPrefWeight("");
                        setAddingPref(false);
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
                    onClick={() => { setAddingPref(false); setNewPrefProgramId(""); setNewPrefWeight(""); }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setAddingPref(true)}
                  style={{ marginTop: 'var(--space-sm)', fontSize: '0.8125rem', padding: 'var(--space-xs) var(--space-md)' }}
                >
                  + Add Preference
                </button>
              )}
            </section>

            <section className="detail-card">
              <h2>Geography Preferences</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Geography</th>
                      <th>Cities</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorDetailData.geographyPreferences.map((pref) => (
                      <tr key={pref.geography}>
                        <td>{pref.geography}</td>
                        <td>{pref.cities.join(", ")}</td>
                        <td></td>
                      </tr>
                    ))}
                    {(geoAdditions[selectedDonor.id] || []).map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.geography}</td>
                        <td>{entry.cities.join(", ")}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeGeoEntry(selectedDonor.id, entry.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--ink-muted)',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                            aria-label={`Remove ${entry.geography}`}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {addingGeo ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                  marginTop: 'var(--space-sm)',
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', minWidth: '50px' }}>Mode</label>
                    <button
                      type="button"
                      className={newGeoMode === "select" ? "tab active" : "tab"}
                      onClick={() => setNewGeoMode("select")}
                      style={{ fontSize: '0.75rem', padding: 'var(--space-xs) var(--space-sm)' }}
                    >
                      Dropdown
                    </button>
                    <button
                      type="button"
                      className={newGeoMode === "manual" ? "tab active" : "tab"}
                      onClick={() => setNewGeoMode("manual")}
                      style={{ fontSize: '0.75rem', padding: 'var(--space-xs) var(--space-sm)' }}
                    >
                      Manual
                    </button>
                  </div>

                  {newGeoMode === "select" ? (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={newGeoSelect}
                        onChange={(e) => {
                          setNewGeoSelect(e.target.value);
                          setNewGeoCities(citiesByGeography[e.target.value]?.join(", ") || "");
                        }}
                        style={selectStyle}
                        aria-label="Select geography"
                      >
                        <option value="">Select geography…</option>
                        {uniqueGeographies.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Cities (comma-separated)"
                        value={newGeoCities}
                        onChange={(e) => setNewGeoCities(e.target.value)}
                        style={{
                          flex: 1, minWidth: '120px',
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'var(--panel)', color: 'var(--ink)',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                        }}
                        aria-label="Cities"
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Geography name"
                        value={newGeoManual}
                        onChange={(e) => setNewGeoManual(e.target.value)}
                        style={{
                          flex: 1, minWidth: '120px',
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'var(--panel)', color: 'var(--ink)',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                        }}
                        aria-label="Geography name"
                      />
                      <input
                        type="text"
                        placeholder="Cities (comma-separated)"
                        value={newGeoCities}
                        onChange={(e) => setNewGeoCities(e.target.value)}
                        style={{
                          flex: 1, minWidth: '120px',
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'var(--panel)', color: 'var(--ink)',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                        }}
                        aria-label="Cities"
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                      type="button"
                      className="table-action"
                      onClick={() => {
                        const geo = newGeoMode === "select" ? newGeoSelect : newGeoManual.trim();
                        const cities = newGeoCities.split(",").map(c => c.trim()).filter(Boolean);
                        if (geo && cities.length > 0) {
                          addGeoEntry(selectedDonor.id, {
                            id: `geo-${Date.now()}`,
                            geography: geo,
                            cities,
                          });
                          setNewGeoSelect(""); setNewGeoManual(""); setNewGeoCities("");
                          setAddingGeo(false);
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
                        setAddingGeo(false); setNewGeoSelect(""); setNewGeoManual(""); setNewGeoCities("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setAddingGeo(true)}
                  style={{ marginTop: 'var(--space-sm)', fontSize: '0.8125rem', padding: 'var(--space-xs) var(--space-md)' }}
                >
                  + Add Geography
                </button>
              )}
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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergedEmployees.length > 0 ? (
                      mergedEmployees.map((row) => (
                        <tr key={row.employee.id}>
                          <td>
                            <div className="table-cell-title">
                              {row.employee.name}
                            </div>
                            <div className="table-cell-subtitle">
                              {row.employee.role} · {row.programName}
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={row.allocationPercent}
                              onChange={(e) => setAllocation(row.employee.id, selectedDonor.id, Number(e.target.value))}
                              className="increment-input"
                              aria-label={`Allocation for ${row.employee.name}`}
                            />
                          </td>
                          <td>
                            {row.isManual && (
                              <button
                                type="button"
                                onClick={() => removeAllocation(row.employee.id, selectedDonor.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--ink-muted)',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                }}
                                aria-label={`Remove ${row.employee.name}`}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>No employees allocated to this donor.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {addingEmployee ? (
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'center',
                  marginTop: 'var(--space-sm)',
                  flexWrap: 'wrap',
                }}>
                  <select
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    style={{
                      background: 'var(--panel)',
                      color: 'var(--ink)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-xs) var(--space-sm)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minWidth: '140px',
                    }}
                    aria-label="Select employee"
                  >
                    <option value="">Select employee…</option>
                    {employees
                      .filter(e => !mergedEmployees.some(m => m.employee.id === e.id))
                      .map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="%"
                    value={newEmployeePercent}
                    onChange={(e) => setNewEmployeePercent(e.target.value)}
                    className="increment-input"
                    aria-label="Allocation percentage"
                  />
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => {
                      const pct = Number(newEmployeePercent);
                      if (newEmployeeId && pct > 0) {
                        setAllocation(newEmployeeId, selectedDonor.id, pct);
                        setNewEmployeeId("");
                        setNewEmployeePercent("");
                        setAddingEmployee(false);
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
                      setAddingEmployee(false);
                      setNewEmployeeId("");
                      setNewEmployeePercent("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setAddingEmployee(true)}
                  style={{ marginTop: 'var(--space-sm)', fontSize: '0.8125rem', padding: 'var(--space-xs) var(--space-md)' }}
                >
                  + Add Employee
                </button>
              )}
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
