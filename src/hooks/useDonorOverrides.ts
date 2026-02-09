import { useState, useEffect } from "react";

const PREF_KEY = "fundflow-donor-pref-overrides";
const GEO_KEY = "fundflow-donor-geo-additions";
const METRIC_KEY = "fundflow-donor-metric-overrides";

export type DonorPrefOverride = {
  programId: string;
  weight: number;
};

export type GeographyAddition = {
  id: string;
  geography: string;
  cities: string[];
};

export type MetricOverride = {
  totalWeight?: number;
  unallocatedWeight?: number;
  topPreference?: string;
};

export const useDonorOverrides = () => {
  const [preferenceOverrides, setPrefOverrides] = useState<Record<string, DonorPrefOverride[]>>(() => {
    const stored = localStorage.getItem(PREF_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [geoAdditions, setGeoAdditions] = useState<Record<string, GeographyAddition[]>>(() => {
    const stored = localStorage.getItem(GEO_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [metricOverrides, setMetricOverrides] = useState<Record<string, MetricOverride>>(() => {
    const stored = localStorage.getItem(METRIC_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(PREF_KEY, JSON.stringify(preferenceOverrides));
  }, [preferenceOverrides]);

  useEffect(() => {
    localStorage.setItem(GEO_KEY, JSON.stringify(geoAdditions));
  }, [geoAdditions]);

  useEffect(() => {
    localStorage.setItem(METRIC_KEY, JSON.stringify(metricOverrides));
  }, [metricOverrides]);

  // Cross-tab synchronization
  useEffect(() => {
    const handle = (e: StorageEvent) => {
      try {
        if (e.key === PREF_KEY && e.newValue) setPrefOverrides(JSON.parse(e.newValue));
        if (e.key === GEO_KEY && e.newValue) setGeoAdditions(JSON.parse(e.newValue));
        if (e.key === METRIC_KEY && e.newValue) setMetricOverrides(JSON.parse(e.newValue));
      } catch (error) {
        console.error("Failed to parse donor overrides from storage:", error);
      }
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  const setPreferences = (donorId: string, prefs: DonorPrefOverride[]) => {
    setPrefOverrides((prev) => ({ ...prev, [donorId]: prefs }));
  };

  const addGeoEntry = (donorId: string, entry: GeographyAddition) => {
    setGeoAdditions((prev) => ({
      ...prev,
      [donorId]: [...(prev[donorId] || []), entry],
    }));
  };

  const removeGeoEntry = (donorId: string, entryId: string) => {
    setGeoAdditions((prev) => ({
      ...prev,
      [donorId]: (prev[donorId] || []).filter((e) => e.id !== entryId),
    }));
  };

  const setMetric = (donorId: string, metric: Partial<MetricOverride>) => {
    setMetricOverrides((prev) => ({
      ...prev,
      [donorId]: { ...prev[donorId], ...metric },
    }));
  };

  return {
    preferenceOverrides,
    geoAdditions,
    metricOverrides,
    setPreferences,
    addGeoEntry,
    removeGeoEntry,
    setMetric,
  };
};

/**
 * Apply preference overrides to a donor array.
 * When overrides exist for a donor, replaces their preferences entirely.
 */
export function applyDonorPreferenceOverrides<
  T extends { id: string; preferences: Array<{ programId: string; weight: number }> }
>(donors: T[], preferenceOverrides: Record<string, DonorPrefOverride[]>): T[] {
  return donors.map((donor) => {
    const override = preferenceOverrides[donor.id];
    if (!override || override.length === 0) return donor;
    return {
      ...donor,
      preferences: override.map((p) => ({ programId: p.programId, weight: p.weight })),
    };
  });
}
