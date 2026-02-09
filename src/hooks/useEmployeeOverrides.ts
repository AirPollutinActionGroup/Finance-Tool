import { useState, useEffect } from "react";

const OVERRIDES_KEY = "fundflow-employee-overrides";
const CUSTOM_FIELDS_KEY = "fundflow-employee-custom-fields";
const ALLOCATIONS_KEY = "fundflow-allocation-overrides";

export type EmployeeOverride = {
  role?: string;
  cityGeo?: string; // encoded as "city|geography"
  programId?: string;
};

export type CustomCompField = {
  id: string;
  label: string;
  value: string;
};

export const useEmployeeOverrides = () => {
  const [overrides, setOverrides] = useState<Record<string, EmployeeOverride>>(() => {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [customCompFields, setCustomCompFields] = useState<Record<string, CustomCompField[]>>(() => {
    const stored = localStorage.getItem(CUSTOM_FIELDS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // allocationOverrides[employeeId][donorId] = percentage
  const [allocationOverrides, setAllocationOverrides] = useState<Record<string, Record<string, number>>>(() => {
    const stored = localStorage.getItem(ALLOCATIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  }, [overrides]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_FIELDS_KEY, JSON.stringify(customCompFields));
  }, [customCompFields]);

  useEffect(() => {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(allocationOverrides));
  }, [allocationOverrides]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === OVERRIDES_KEY && e.newValue) {
          setOverrides(JSON.parse(e.newValue));
        }
        if (e.key === CUSTOM_FIELDS_KEY && e.newValue) {
          setCustomCompFields(JSON.parse(e.newValue));
        }
        if (e.key === ALLOCATIONS_KEY && e.newValue) {
          setAllocationOverrides(JSON.parse(e.newValue));
        }
      } catch (error) {
        console.error("Failed to parse employee overrides from storage:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setOverride = (employeeId: string, override: Partial<EmployeeOverride>) => {
    setOverrides((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], ...override },
    }));
  };

  const getOverride = (employeeId: string): EmployeeOverride => {
    return overrides[employeeId] || {};
  };

  const getCustomFields = (employeeId: string): CustomCompField[] => {
    return customCompFields[employeeId] || [];
  };

  const addCustomField = (employeeId: string, field: CustomCompField) => {
    setCustomCompFields((prev) => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), field],
    }));
  };

  const removeCustomField = (employeeId: string, fieldId: string) => {
    setCustomCompFields((prev) => ({
      ...prev,
      [employeeId]: (prev[employeeId] || []).filter((f) => f.id !== fieldId),
    }));
  };

  const setAllocation = (employeeId: string, donorId: string, percent: number) => {
    setAllocationOverrides((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [donorId]: percent },
    }));
  };

  const removeAllocation = (employeeId: string, donorId: string) => {
    setAllocationOverrides((prev) => {
      const updated = { ...prev };
      if (updated[employeeId]) {
        const empAllocs = { ...updated[employeeId] };
        delete empAllocs[donorId];
        if (Object.keys(empAllocs).length === 0) {
          delete updated[employeeId];
        } else {
          updated[employeeId] = empAllocs;
        }
      }
      return updated;
    });
  };

  return {
    overrides,
    customCompFields,
    allocationOverrides,
    setOverride,
    getOverride,
    getCustomFields,
    addCustomField,
    removeCustomField,
    setAllocation,
    removeAllocation,
  };
};

/**
 * Apply profile overrides (role, location, program) to an array of employees.
 * Returns a new array with overrides merged in.
 */
export function applyEmployeeOverrides<
  T extends { id: string; role: string; city: string; geography: string; programId: string }
>(employees: T[], overrides: Record<string, EmployeeOverride>): T[] {
  return employees.map((emp) => {
    const override = overrides[emp.id];
    if (!override) return emp;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = { ...emp };
    if (override.role) updated.role = override.role;
    if (override.programId) updated.programId = override.programId;
    if (override.cityGeo) {
      const [city, geography] = override.cityGeo.split("|");
      updated.city = city;
      updated.geography = geography;
    }
    return updated as T;
  });
}
