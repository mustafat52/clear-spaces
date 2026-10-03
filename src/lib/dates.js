export const TIMES = [
  "9:00 AM",
  "10:30 AM",
  "12:00 PM",
  "2:00 PM",
  "3:30 PM",
  "5:00 PM",
  "6:30 PM",
  "8:00 PM",
];

// Extended from 7 to 45 days: with lead-time pricing, the cheapest tier
// (26+ days out) would be unreachable on a 7-day calendar. 45 gives a
// patient real room to land well inside the standard tier, not just
// barely cross the line.
export const DAY_COUNT = 45;

// Local-timezone-safe YYYY-MM-DD (avoids the UTC-shift bug of toISOString)
export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDays(count) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}

export function fmtDayLong(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}

export function fmtDayShort(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// Builds a flat array of calendar cells (length is always a multiple of 7)
// for a month grid: leading/trailing days from adjacent months are
// included so every week row is full, marked inMonth: false so they can
// be rendered dimmed.
export function getMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: new Date(year, month, i - startWeekday + 1), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  return cells;
}

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export const STATUS_LABEL = {
  pending: "Pending verification",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
};