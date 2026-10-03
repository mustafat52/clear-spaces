// Pricing is purely a function of how far out the chosen date is — not a
// choice the patient makes. Breakpoints are inclusive: day 10 is still
// "urgent", day 11 is "priority", day 25 is still "priority", day 26+ is
// "standard". There's no upper bound on "standard" — it's just whatever's
// left once the other two ranges are excluded.
export const TIERS = [
  { key: "urgent", label: "Urgent", maxDays: 10, amount: 4500, blurb: "Within 10 days" },
  { key: "priority", label: "Priority", maxDays: 25, amount: 2500, blurb: "11–25 days out" },
  { key: "standard", label: "Standard", maxDays: Infinity, amount: 1500, blurb: "26+ days out" },
];

export function daysFromToday(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

export function computeTier(isoDate) {
  const d = daysFromToday(isoDate);
  return TIERS.find((t) => d <= t.maxDays) || TIERS[TIERS.length - 1];
}

export function tierLabel(key) {
  return TIERS.find((t) => t.key === key)?.label || key;
}

export function tierAmount(key) {
  return TIERS.find((t) => t.key === key)?.amount ?? null;
}

// Compact form for tight UI spots (day pills etc.) — ₹4,500 → ₹4.5k
export function compactAmount(amount) {
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `₹${amount}`;
}