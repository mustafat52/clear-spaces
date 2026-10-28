// Click-to-chat link for the manager's WhatsApp line, where appointments are booked.
// WhatsApp links need digits only: country code + number, no +, spaces or dashes.
export const MANAGER_WHATSAPP = "917019317134";
export const MANAGER_WHATSAPP_DISPLAY = "+91 70193 17134";

const BOOKING_MESSAGE = "Hello, I'd like to book a session with Munira at Clearspaces.";

export const managerBookingLink = () =>
  `https://wa.me/${MANAGER_WHATSAPP}?text=${encodeURIComponent(BOOKING_MESSAGE)}`;