import { fmtDayLong } from "./dates";
import { tierLabel } from "./pricing";

// WhatsApp's click-to-chat links need digits only — no +, spaces, or dashes.
// We assume an Indian number when someone enters a bare 10-digit number with
// no country code, since that's the practice's whole patient base right now.
// Not bulletproof against every possible typo, but covers the normal case.
export function normalizePhone(raw) {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return digits;
}

// text is optional — omit it for a blank chat, pass it to pre-fill the
// message box (the person sending still has to tap Send themselves;
// WhatsApp's links never auto-send on their own).
export function buildWaLink(phone, text) {
  const number = normalizePhone(phone);
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function buildConfirmMessage(b) {
  const name = b?.patient?.full_name || b?.manual_name || "";
  const typeLabel = tierLabel(b?.type).toLowerCase();
  return [
    `Dear Mr./Ms. ${name},`,
    "",
    `Thank you for booking your appointment with ClearSpaces. Your ${typeLabel} session with Munira is scheduled for ${fmtDayLong(
      b.session_date
    )} at ${b.time_slot}.`,
    "",
    `To confirm this slot, please complete the payment of ₹${b.amount.toLocaleString("en-IN")} here — we'll send the payment details right after this message.`,
    "",
    "Looking forward to your session!",
    "",
    "— Team ClearSpaces",
  ].join("\n");
}

export function buildDeclineMessage(b) {
  const name = b?.patient?.full_name || b?.manual_name || "";
  return [
    `Dear Mr./Ms. ${name},`,
    "",
    `Thank you for reaching out to ClearSpaces. Unfortunately we're unable to confirm your requested slot on ${fmtDayLong(
      b.session_date
    )} at ${b.time_slot} at this time.`,
    "",
    "Please choose another available slot on our website, or reply to this message and we'll help you find one that works.",
    "",
    "— Team ClearSpaces",
  ].join("\n");
}