// Click-to-chat link for the manager's WhatsApp line, where appointments are booked.
// WhatsApp links need digits only: country code + number, no +, spaces or dashes.
export const MANAGER_WHATSAPP = "917019317134";

const BOOKING_MESSAGE = "Hello, I'd like to book a session with Munira at Clearspaces.";

// Optionally pass a custom opening message (e.g. for a specific plan).
export const managerBookingLink = (message = BOOKING_MESSAGE) =>
  `https://wa.me/${MANAGER_WHATSAPP}?text=${encodeURIComponent(message)}`;