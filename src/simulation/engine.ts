import type { Donor, Employee, Program } from "../types";

export type AllocationLine = {
  donorId: string;
  programId: string;
  weight: number;
  amount: number;
};

export type DonorAllocationSummary = {
  donorId: string;
  donorName: string;
  donorType: Donor["type"];
  contributionAmount: number;
  adminPercent: number;
  adminAmount: number;
  netAmount: number;
  allocatedAmount: number;
  generalFundAmount: number;
};

export type GeographyAllocation = {
  geography: Program["geography"];
  amount: number;
};

export type DonorScore = {
  donorId: string;
  donorName: string;
  adminScore: number; // 0-100, higher is better (lower admin%)
  preferenceScore: number; // 0-100, based on preference match
  balanceScore: number; // 0-100, based on available funds
  fcraBonus: number; // Bonus points for FCRA flexibility
  totalScore: number; // Combined score
  ranking: number; // Overall rank
};

export type DonorRunway = {
  donorId: string;
  donorName: string;
  availableFunds: number;
  monthlyAllocation: number;
  runwayMonths: number;
  depletionDate: string; // Estimated depletion date
  status: 'healthy' | 'warning' | 'critical';
};

export type AllocationStrategy = {
  scenarioName: string;
  description: string;
  donorOrder: string[]; // Order to use donors
  expectedAdminCost: number;
  expectedRunway: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
};

export type SimulationResult = {
  totalContributions: number;
  totalAdminCost: number;
  totalNetFunding: number;
  totalAllocated: number;
  generalFundTotal: number;
  allocations: AllocationLine[];
  donorSummaries: DonorAllocationSummary[];
  geographyAllocations: GeographyAllocation[];
  monthlyBurn: number;
  runwayMonths: number;
  donorScores?: DonorScore[];
  donorRunways?: DonorRunway[];
  allocationStrategies?: AllocationStrategy[];
};

export const ADMIN_RATE_BY_TYPE: Record<Donor["type"], number> = {
  International: 0.18,
  National: 0.12,
  CSR: 0.15,
  HNI: 0.1,
};

export const OPERATIONAL_OVERHEAD = 250000;

export const calculateAdminRate = (donor: Donor) => {
  if (donor.adminOverheadPercent > 0) {
    return donor.adminOverheadPercent / 100;
  }

  return ADMIN_RATE_BY_TYPE[donor.type];
};

export const calculateDonorNet = (donor: Donor) => {
  const adminPercent = calculateAdminRate(donor);
  const adminAmount = donor.contributionAmount * adminPercent;
  const netAmount = donor.contributionAmount - adminAmount;

  return { adminPercent, adminAmount, netAmount };
};

export const calculateAllocationLines = (
  donor: Donor,
  netAmount: number
): AllocationLine[] => {
  return donor.preferences.map((preference) => ({
    donorId: donor.id,
    programId: preference.programId,
    weight: preference.weight,
    amount: netAmount * (preference.weight / 100),
  }));
};

export const calculateGeneralFund = (
  donor: Donor,
  netAmount: number
): number => {
  const totalWeight = donor.preferences.reduce(
    (sum, preference) => sum + preference.weight,
    0
  );
  const remainder = Math.max(0, 100 - totalWeight);

  return netAmount * (remainder / 100);
};

export const calculateGeographyAllocations = (
  programs: Program[],
  allocations: AllocationLine[]
): GeographyAllocation[] => {
  const totals = new Map<Program["geography"], number>();

  allocations.forEach((allocation) => {
    const program = programs.find((item) => item.id === allocation.programId);
    if (!program) {
      return;
    }

    const current = totals.get(program.geography) ?? 0;
    totals.set(program.geography, current + allocation.amount);
  });

  return Array.from(totals.entries()).map(([geography, amount]) => ({
    geography,
    amount,
  }));
};

export const calculateMonthlyBurn = (
  employees: Employee[],
  operationalOverhead: number
) => {
  const payroll = employees.reduce(
    (sum, employee) =>
      sum +
      employee.monthlySalary +
      employee.pfContribution +
      employee.tdsDeduction,
    0
  );

  return payroll + operationalOverhead;
};

export const calculateRunwayMonths = (
  totalMonthlyFunding: number,
  monthlyBurn: number
) => {
  if (monthlyBurn <= 0) {
    return 0;
  }

  return totalMonthlyFunding / monthlyBurn;
};

// Donor Scoring System
export const scoreDonor = (
  donor: Donor,
  employees: Employee[],
  programs: Program[]
): DonorScore => {
  // 1. Admin Score (0-100, lower admin% = higher score)
  const adminRate = calculateAdminRate(donor);
  const adminScore = Math.max(0, (0.25 - adminRate) / 0.25 * 100); // 0% admin = 100, 25% admin = 0

  // 2. Preference Score (how well preferences match current programs)
  const totalPreferenceWeight = donor.preferences.reduce((sum, p) => sum + p.weight, 0);
  const preferenceScore = totalPreferenceWeight; // 0-100 based on allocation coverage

  // 3. Balance Score (higher balance = more flexibility)
  const maxContribution = 30000000; // 3 crore as reference max
  const balanceScore = Math.min(100, (donor.contributionAmount / maxContribution) * 100);

  // 4. FCRA Bonus (flexibility bonus)
  const fcraBonus = donor.fcraApproved ? 10 : 0; // FCRA gives more options

  // Total Score (weighted average)
  const totalScore = (
    adminScore * 0.35 +        // 35% weight on admin efficiency
    preferenceScore * 0.30 +   // 30% weight on preference match
    balanceScore * 0.25 +      // 25% weight on available funds
    fcraBonus * 0.10           // 10% weight on flexibility
  );

  return {
    donorId: donor.id,
    donorName: donor.name,
    adminScore: Math.round(adminScore),
    preferenceScore: Math.round(preferenceScore),
    balanceScore: Math.round(balanceScore),
    fcraBonus,
    totalScore: Math.round(totalScore),
    ranking: 0, // Will be set after sorting
  };
};

// Calculate per-donor runway
export const calculateDonorRunway = (
  donor: Donor,
  monthlyBurn: number,
  donorSummary: DonorAllocationSummary
): DonorRunway => {
  const availableFunds = donorSummary.netAmount;
  const monthlyAllocation = availableFunds / 12; // Assume 1-year allocation period
  const runwayMonths = availableFunds / monthlyBurn;
  
  // Calculate estimated depletion date (assuming monthly burn)
  const today = new Date();
  const depletionDate = new Date(today);
  depletionDate.setMonth(today.getMonth() + Math.floor(runwayMonths));
  
  // Determine status
  let status: 'healthy' | 'warning' | 'critical';
  if (runwayMonths > 12) {
    status = 'healthy';
  } else if (runwayMonths > 6) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  return {
    donorId: donor.id,
    donorName: donor.name,
    availableFunds,
    monthlyAllocation,
    runwayMonths,
    depletionDate: depletionDate.toISOString().split('T')[0],
    status,
  };
};

// Generate allocation strategies
export const generateAllocationStrategies = (
  donors: Donor[],
  donorScores: DonorScore[],
  simulation: Omit<SimulationResult, 'donorScores' | 'donorRunways' | 'allocationStrategies'>
): AllocationStrategy[] => {
  const strategies: AllocationStrategy[] = [];

  // Sort donors by score for optimal strategy
  const sortedByScore = [...donorScores].sort((a, b) => b.totalScore - a.totalScore);
  
  // Sort by admin cost for conservative strategy
  const sortedByAdmin = [...donorScores].sort((a, b) => b.adminScore - a.adminScore);
  
  // Sort by preference match for preference-strict strategy
  const sortedByPreference = [...donorScores].sort((a, b) => b.preferenceScore - a.preferenceScore);

  // 1. OPTIMAL STRATEGY - Best overall score
  strategies.push({
    scenarioName: 'Optimal',
    description: 'Balanced approach optimizing cost, preferences, and flexibility',
    donorOrder: sortedByScore.map(s => s.donorId),
    expectedAdminCost: simulation.totalAdminCost,
    expectedRunway: simulation.runwayMonths,
    riskLevel: 'low',
    recommendations: [
      `Use ${sortedByScore[0].donorName} first (highest overall score: ${sortedByScore[0].totalScore}/100)`,
      `Prioritize donors with admin rates below 15%`,
      `Maintain at least 3 months reserve from general fund`,
      sortedByScore[0].adminScore > 70 
        ? `${sortedByScore[0].donorName} offers excellent admin efficiency`
        : `Consider negotiating lower admin rates with top donors`,
    ],
  });

  // 2. CONSERVATIVE STRATEGY - Minimize admin cost
  const conservativeAdminReduction = simulation.totalAdminCost * 0.10; // Estimate 10% reduction
  strategies.push({
    scenarioName: 'Conservative',
    description: 'Minimize admin overhead and maximize runway',
    donorOrder: sortedByAdmin.map(s => s.donorId),
    expectedAdminCost: simulation.totalAdminCost - conservativeAdminReduction,
    expectedRunway: simulation.runwayMonths * 1.15, // 15% better runway
    riskLevel: 'medium',
    recommendations: [
      `Start with ${sortedByAdmin[0].donorName} (lowest admin overhead)`,
      `Could save approx. ${Math.round(conservativeAdminReduction)} in admin costs`,
      `Extend runway by ~${(simulation.runwayMonths * 0.15).toFixed(1)} months`,
      `Review all donors with admin rates above 15%`,
    ],
  });

  // 3. PREFERENCE-STRICT STRATEGY - Follow donor preferences strictly
  const preferenceRisk = sortedByPreference[0].adminScore < 50 ? 'high' : 'medium';
  strategies.push({
    scenarioName: 'Preference-Strict',
    description: 'Strictly honor all donor program preferences',
    donorOrder: sortedByPreference.map(s => s.donorId),
    expectedAdminCost: simulation.totalAdminCost * 1.05, // May be 5% higher
    expectedRunway: simulation.runwayMonths * 0.95, // May reduce runway
    riskLevel: preferenceRisk,
    recommendations: [
      `Prioritize ${sortedByPreference[0].donorName} (best preference alignment)`,
      `Ensure all program preferences are met`,
      `May incur higher admin costs for better donor relations`,
      preferenceRisk === 'high' 
        ? `⚠️ Warning: This approach may reduce cost efficiency`
        : `Maintains good balance between preferences and costs`,
    ],
  });

  return strategies;
};

export const runSimulation = (
  donors: Donor[],
  programs: Program[],
  employees: Employee[],
  operationalOverhead = OPERATIONAL_OVERHEAD
): SimulationResult => {
  const allocations: AllocationLine[] = [];
  const donorSummaries: DonorAllocationSummary[] = [];
  let totalContributions = 0;
  let totalAdminCost = 0;
  let totalNetFunding = 0;
  let generalFundTotal = 0;

  donors.forEach((donor) => {
    const { adminPercent, adminAmount, netAmount } = calculateDonorNet(donor);
    const donorAllocations = calculateAllocationLines(donor, netAmount);
    const generalFundAmount = calculateGeneralFund(donor, netAmount);
    const allocatedAmount = donorAllocations.reduce(
      (sum, allocation) => sum + allocation.amount,
      0
    );

    allocations.push(...donorAllocations);
    donorSummaries.push({
      donorId: donor.id,
      donorName: donor.name,
      donorType: donor.type,
      contributionAmount: donor.contributionAmount,
      adminPercent,
      adminAmount,
      netAmount,
      allocatedAmount,
      generalFundAmount,
    });

    totalContributions += donor.contributionAmount;
    totalAdminCost += adminAmount;
    totalNetFunding += netAmount;
    generalFundTotal += generalFundAmount;
  });

  const totalAllocated = allocations.reduce(
    (sum, allocation) => sum + allocation.amount,
    0
  );
  const geographyAllocations = calculateGeographyAllocations(
    programs,
    allocations
  );
  const monthlyBurn = calculateMonthlyBurn(employees, operationalOverhead);
  const totalMonthlyFunding = totalNetFunding / 12;
  const runwayMonths = calculateRunwayMonths(totalMonthlyFunding, monthlyBurn);

  // Calculate donor scores
  const donorScores = donors
    .map(donor => scoreDonor(donor, employees, programs))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((score, index) => ({ ...score, ranking: index + 1 }));

  // Calculate per-donor runways
  const donorRunways = donors.map(donor => {
    const summary = donorSummaries.find(s => s.donorId === donor.id)!;
    return calculateDonorRunway(donor, monthlyBurn, summary);
  }).sort((a, b) => b.runwayMonths - a.runwayMonths);

  // Generate allocation strategies
  const baseSimulation = {
    totalContributions,
    totalAdminCost,
    totalNetFunding,
    totalAllocated,
    generalFundTotal,
    allocations,
    donorSummaries,
    geographyAllocations,
    monthlyBurn,
    runwayMonths,
  };
  const allocationStrategies = generateAllocationStrategies(
    donors,
    donorScores,
    baseSimulation
  );

  return {
    ...baseSimulation,
    donorScores,
    donorRunways,
    allocationStrategies,
  };
};
