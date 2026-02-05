export const formatCurrency = (value: number) =>
  `INR ${value.toLocaleString("en-IN")}`;

export const formatPercent = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
};

export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const calculateProjectedSalary = (
  currentSalary: number,
  incrementPercent: number
): number => {
  return Math.round(currentSalary * (1 + incrementPercent / 100));
};

export const calculateProjectedCTC = (
  monthlySalary: number,
  incrementPercent: number
): { salary: number; pf: number; ctc: number } => {
  const projectedSalary = calculateProjectedSalary(monthlySalary, incrementPercent);
  const projectedPF = Math.round(projectedSalary * 0.12);
  const projectedCTC = (projectedSalary + projectedPF) * 12;
  
  return {
    salary: projectedSalary * 12,
    pf: projectedPF * 12,
    ctc: projectedCTC,
  };
};
