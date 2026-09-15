# ClearSpaces — Demo Site

Portfolio + appointment booking demo for **Munira / ClearSpaces** (online counselling).

Built with React + Vite. No backend, no database — all data lives in browser memory for the
duration of a demo session.

---

## Run locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

To test a production build locally:

```bash
npm run build
npm run preview
```

---

## Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import that repo.
3. Vercel auto-detects Vite. Leave the defaults as-is:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**.

No environment variables are needed.

---

## What's in the demo

### Client-facing site
- Hero, about, specialties, fees, how-it-works, testimonials, footer.
- **Booking flow** (4 steps): session type → day & time → client details → QR payment → confirmation.
- Two session types: Regular **₹1,500**, Urgent **₹4,500** (urgent shows only same-day / next-day slots).
- Booking ends at **"Pending verification"**, not auto-confirmed — matching the manual payment-check
  workflow.

### Admin dashboard
Reached via the **"Team dashboard"** link in the site footer.

- **Requests tab** — pending bookings with name, phone, slot, amount, UPI reference and client notes.
  Confirm or decline each one. Declining frees the slot back up.
- **Availability tab** — tap any slot to block/unblock Munira's calendar. Blocked slots disappear
  from the client-facing booking screen immediately.
- A standing note reminds the team that **urgent cases go to WhatsApp first**, not through this panel.

The client site and admin share the same in-memory state, so you can book a slot on the site, then
open the dashboard and watch it appear as pending.

---

## Placeholders to replace before this goes live

| Item | Where | Notes |
|---|---|---|
| QR code | `src/App.jsx` → `QRDemo` component | Swap for an `<img>` of Munira's real UPI QR |
| Testimonials | `src/App.jsx` → testimonials section | Currently marked "placeholder testimonial" |
| Social links | `src/App.jsx` → footer | Instagram / YouTube / WhatsApp are `#` |
| Session times | `src/App.jsx` → `TIMES` | Currently 8 fixed slots per day |
| Seed bookings | `src/App.jsx` → `seedBookings()` | Dummy clients so the demo isn't empty |

---

## Known limits (by design, for the demo)

- **No persistence.** Refreshing the page resets everything. Real use needs a database.
- **No auth on the admin panel.** Anyone who finds the footer link can open it.
- **No real payment verification.** The "I've paid" checkbox is on the honour system; the team
  verifies manually.
- **Client and admin don't sync across devices** — state is per-browser-tab.

These are the pieces to decide on with Munira and her assistants before building the real thing.
