import { useEffect, useState } from "react";

const STORAGE_KEY = "ocean-tracker-daily-logs";

export const DEFAULT_LOG = {
  notes: "",
  swam: false,
  surfed: false,
  paddled: false,
  waterFeel: "normal",
  energy: "steady",
  mood: "calm",
};

function readLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function useDailyLogs() {
  const [logs, setLogs] = useState(readLogs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  function getLog(dateKey) {
    return {
      ...DEFAULT_LOG,
      ...(logs[dateKey] || {}),
    };
  }

  function updateLog(dateKey, updates) {
    setLogs((current) => ({
      ...current,
      [dateKey]: {
        ...DEFAULT_LOG,
        ...(current[dateKey] || {}),
        ...updates,
      },
    }));
  }

  return { logs, getLog, updateLog };
}
