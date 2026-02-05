import { useState, useEffect } from "react";

const STORAGE_KEY = "fundflow-employee-increments";

export const useEmployeeIncrements = () => {
  const [increments, setIncrements] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(increments));
  }, [increments]);

  const setIncrement = (employeeId: string, increment: number) => {
    setIncrements(prev => ({
      ...prev,
      [employeeId]: Math.max(0, Math.min(100, increment)),
    }));
  };

  const getIncrement = (employeeId: string): number => {
    return increments[employeeId] || 0;
  };

  const resetAll = () => {
    setIncrements({});
  };

  const resetEmployee = (employeeId: string) => {
    setIncrements(prev => {
      const updated = { ...prev };
      delete updated[employeeId];
      return updated;
    });
  };

  const hasAnyIncrements = Object.values(increments).some(inc => inc > 0);

  return {
    increments,
    setIncrement,
    getIncrement,
    resetAll,
    resetEmployee,
    hasAnyIncrements,
  };
};
