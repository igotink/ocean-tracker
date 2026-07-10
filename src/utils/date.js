export const SUPPORTED_MONTHS = [
  { label: "July", value: "2026-07" },
  { label: "August", value: "2026-08" },
  { label: "September", value: "2026-09" },
];

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function clampToSupportedDate(key) {
  if (key >= "2026-07-01" && key <= "2026-09-30") {
    return key;
  }

  return "2026-07-09";
}

export function getDaysForMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const days = new Date(year, month, 0).getDate();

  return Array.from({ length: days }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return `${monthKey}-${day}`;
  });
}

export function formatDayLabel(dateKey, options = {}) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: options.short ? "short" : "long",
    day: "numeric",
    month: options.short ? "short" : "long",
  }).format(date);
}

export function formatMonthTitle(monthKey) {
  const date = new Date(`${monthKey}-01T12:00:00`);
  return new Intl.DateTimeFormat("en-ZA", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "data unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "data unavailable";

  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateInput(dateKey) {
  return dateKey.slice(0, 7);
}
