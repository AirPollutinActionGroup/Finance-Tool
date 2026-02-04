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
};

export const ADMIN_RATE_BY_TYPE: Record<Donor["type"], number> = {
  International: 0.18,
  India: 0.12,
  CSR: 0.15,
  HNI: 0.1,
};

export const OPERATIONAL_OVERHEAD = 250000;

export const calculateAdminRate = (donorType: Donor["type"]) =>
  ADMIN_RATE_BY_TYPE[donorType];

export const calculateDonorNet = (donor: Donor) => {
  const adminPercent = calculateAdminRate(donor.type);
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
    (sum, employee) => sum + employee.monthlyCost,
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

  return {
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
};
