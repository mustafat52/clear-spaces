import React, { useState, useMemo } from "react";
import {
  Clock,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  QrCode,
  MessageCircle,
  Youtube,
  Instagram,
  LayoutDashboard,
  Ban,
  CalendarClock,
  Phone,
  ArrowLeft,
} from "lucide-react";

/* ---------------------------------------------------------
   ClearSpaces — Munira's counselling portfolio + booking demo
   Includes an admin module for the manager to confirm/decline
   requests and block out Munira's calendar.
   All client data, testimonials and the QR code are dummy.
--------------------------------------------------------- */

const TIMES = [
  "9:00 AM",
  "10:30 AM",
  "12:00 PM",
  "2:00 PM",
  "3:30 PM",
  "5:00 PM",
  "6:30 PM",
  "8:00 PM",
];
const DAY_COUNT = 7;
const LOGO = "/logo.png";

function getDays(count) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}

const slotKey = (d, t) => `${d}-${t}`;
const fmtDay = (d) =>
  d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });

let idCounter = 100;
const nextId = () => ++idCounter;

function Logo({ size = 38 }) {
  return <img src={LOGO} alt="ClearSpaces" width={size} height={size} />;
}

function QRDemo() {
  const cells = useMemo(() => {
    const grid = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const inFinder = (r < 4 && c < 4) || (r < 4 && c > 10) || (r > 10 && c < 4);
        if (inFinder) continue;
        if ((r * 13 + c * 7 + r * c) % 3 === 0) grid.push([r, c]);
      }
    }
    return grid;
  }, []);
  const Finder = ({ x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <rect width="4" height="4" fill="#0c2b59" />
      <rect x="0.6" y="0.6" width="2.8" height="2.8" fill="#fff" />
      <rect x="1.3" y="1.3" width="1.4" height="1.4" fill="#0c2b59" />
    </g>
  );
  return (
    <svg viewBox="0 0 15 15" width="168" height="168" style={{ display: "block" }}>
      <rect width="15" height="15" fill="#fff" />
      <Finder x={0} y={0} />
      <Finder x={11} y={0} />
      <Finder x={0} y={11} />
      {cells.map(([r, c], i) => (
        <rect key={i} x={c} y={r} width="1" height="1" fill="#0c2b59" />
      ))}
    </svg>
  );
}

const STEP_LABELS = ["Session", "Schedule", "Details", "Payment"];

function seedBookings() {
  return [
    {
      id: nextId(),
      name: "Aisha Rahman",
      phone: "+91 98765 43210",
      email: "aisha@email.com",
      type: "regular",
      dayIdx: 1,
      timeIdx: 2,
      amount: 1500,
      txnRef: "402883771122",
      notes: "Following up from last week's session.",
      status: "pending",
    },
    {
      id: nextId(),
      name: "Karan Verma",
      phone: "+91 90210 11223",
      email: "",
      type: "urgent",
      dayIdx: 0,
      timeIdx: 5,
      amount: 4500,
      txnRef: "",
      notes: "Had a difficult night, would like to talk soon.",
      status: "pending",
    },
    {
      id: nextId(),
      name: "Priya Nair",
      phone: "+91 99887 66554",
      email: "priya@email.com",
      type: "regular",
      dayIdx: 3,
      timeIdx: 0,
      amount: 1500,
      txnRef: "883921004411",
      notes: "",
      status: "confirmed",
    },
  ];
}

export default function App() {
  const days = useMemo(() => getDays(DAY_COUNT), []);
  const [view, setView] = useState("site");
  const [bookings, setBookings] = useState(seedBookings);
  const [blocked, setBlocked] = useState({ "2-6": true, "2-7": true, "4-1": true });

  const isTaken = (d, t) =>
    !!blocked[slotKey(d, t)] ||
    bookings.some((b) => b.dayIdx === d && b.timeIdx === t && b.status !== "declined");

  const addBooking = (b) => setBookings((prev) => [...prev, { ...b, id: nextId(), status: "pending" }]);

  const setBookingStatus = (id, status) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  const toggleBlocked = (d, t) => {
    const key = slotKey(d, t);
    setBlocked((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  return view === "site" ? (
    <SiteView days={days} isTaken={isTaken} addBooking={addBooking} goAdmin={() => setView("admin")} />
  ) : (
    <AdminView
      days={days}
      bookings={bookings}
      blocked={blocked}
      setBookingStatus={setBookingStatus}
      toggleBlocked={toggleBlocked}
      goSite={() => setView("site")}
    />
  );
}

/* =====================  CLIENT SITE  ===================== */

function SiteView({ days, isTaken, addBooking, goAdmin }) {
  const [showBooking, setShowBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(null);
  const [sessionType, setSessionType] = useState(null);
  const [dayIdx, setDayIdx] = useState(null);
  const [timeIdx, setTimeIdx] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", returning: "", notes: "" });
  const [txnRef, setTxnRef] = useState("");
  const [paid, setPaid] = useState(false);

  const visibleDays = sessionType === "urgent" ? days.slice(0, 2) : days;
  const amount = sessionType === "urgent" ? 4500 : 1500;

  function openBooking(type) {
    setStep(1);
    setDone(null);
    setSessionType(type || null);
    setDayIdx(null);
    setTimeIdx(null);
    setForm({ name: "", phone: "", email: "", returning: "", notes: "" });
    setTxnRef("");
    setPaid(false);
    setShowBooking(true);
  }

  function submit() {
    const b = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      type: sessionType,
      dayIdx,
      timeIdx,
      amount,
      txnRef,
      notes: form.notes,
    };
    addBooking(b);
    setDone(b);
  }

  return (
    <>
      <nav className="cs-nav">
        <div className="cs-nav-brand">
          <Logo size={44} />
          <div className="cs-nav-brand-text">
            <b>ClearSpaces</b>
            <span>Munira · Online Counselling</span>
          </div>
        </div>
        <div className="cs-nav-links">
          <a href="#about">About</a>
          <a href="#specialties">Specialties</a>
          <a href="#fees">Sessions &amp; fees</a>
          <a href="#how">How it works</a>
        </div>
        <button className="cs-btn cs-btn-amber" onClick={() => openBooking(null)}>
          Book a session
        </button>
      </nav>

      <header className="cs-hero">
        <div className="cs-hero-inner">
          <div>
            <div className="cs-eyebrow">
              <Sparkles size={14} /> Trusted by a community of 14.8K+
            </div>
            <h1>A space to feel clear again.</h1>
            <p className="lead">
              Integrative, trauma-informed counselling for the patterns that keep repeating — in your
              relationships, your habits, your nervous system. Sessions are online, private, and paced
              to you.
            </p>
            <div className="cs-hero-ctas">
              <button className="cs-btn cs-btn-amber" onClick={() => openBooking("regular")}>
                Book a session — ₹1,500
              </button>
              <button className="cs-btn cs-btn-ghost-light" onClick={() => openBooking("urgent")}>
                Need urgent support?
              </button>
            </div>
            <div className="cs-hero-credentials">
              <span>Integrative Counselling</span>
              <span>Trauma &amp; Addiction</span>
              <span>REBT</span>
              <span>Applied TA</span>
              <span>Polyvagal Therapy</span>
            </div>
          </div>
          <div className="cs-hero-logo">
            <img src={LOGO} alt="ClearSpaces — Witnessed Holistic Healing" />
          </div>
        </div>
      </header>

      <section className="cs-section" id="about">
        <div className="cs-container cs-about-grid">
          <div className="cs-portrait">
            <img src={LOGO} alt="ClearSpaces" />
          </div>
          <div>
            <div className="cs-kicker">About Munira</div>
            <h2 className="cs-h2">Counselling that treats the pattern, not just the moment.</h2>
            <p className="cs-body-text">
              I work with clients navigating trauma, addiction, and the quieter patterns that shape how
              we relate to ourselves and others — anxiety loops, people-pleasing, shutdown,
              self-sabotage. My approach blends REBT, Applied Transactional Analysis, and
              Polyvagal-informed practice, so sessions move between talking, reflection, and body-based
              regulation depending on what a session calls for.
            </p>
            <p className="cs-body-text" style={{ marginTop: 14 }}>
              Every session is held online, one-on-one, with full confidentiality. Whether you're here
              for the first time or coming back after a while — there's no pressure to have the "right"
              words ready.
            </p>
            <div className="cs-stat-row">
              <div className="cs-stat">
                <b>354</b>
                <span>Posts &amp; resources shared</span>
              </div>
              <div className="cs-stat">
                <b>14.8K</b>
                <span>Followers on Instagram</span>
              </div>
              <div className="cs-stat">
                <b>4</b>
                <span>Modalities practiced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-soft" id="specialties">
        <div className="cs-container">
          <div className="cs-kicker">Areas of focus</div>
          <h2 className="cs-h2">What we can work on together</h2>
          {[
            {
              t: "Trauma & addiction",
              d: "Working through past experiences and dependency patterns at a pace your nervous system can actually handle.",
            },
            {
              t: "REBT",
              d: "Rational Emotive Behaviour Therapy — identifying and reshaping the beliefs that drive distress.",
            },
            {
              t: "Applied Transactional Analysis",
              d: "Understanding recurring roles and dynamics in your relationships, and where they were learned.",
            },
            {
              t: "Polyvagal-informed practice",
              d: "Nervous-system-aware techniques to help you move out of anxiety, shutdown, or overwhelm.",
            },
          ].map((s) => (
            <div className="cs-specialty-row" key={s.t}>
              <div className="cs-specialty-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cs-section" id="fees">
        <div className="cs-container">
          <div className="cs-kicker">Sessions &amp; fees</div>
          <h2 className="cs-h2">Straightforward pricing, two ways to book</h2>
          <div className="cs-fee-grid">
            <div className="cs-fee-card">
              <div>Regular session</div>
              <div className="price">₹1,500</div>
              <div className="cs-fee-sub">Per 50-minute session</div>
              <ul>
                <li>
                  <Check size={15} color="#0146c7" /> Pick any open slot in the next 7 days
                </li>
                <li>
                  <Check size={15} color="#0146c7" /> Confirmed once payment is verified
                </li>
                <li>
                  <Check size={15} color="#0146c7" /> Ideal for ongoing or first-time sessions
                </li>
              </ul>
              <button className="cs-btn cs-btn-ghost cs-btn-full" onClick={() => openBooking("regular")}>
                Book a regular session
              </button>
            </div>
            <div className="cs-fee-card urgent">
              <div>Urgent session</div>
              <div className="price">₹4,500</div>
              <div className="cs-fee-sub">Priority, same-day where possible</div>
              <ul>
                <li>
                  <Check size={15} color="#fcc85e" /> Limited slots, reviewed by the team in real time
                </li>
                <li>
                  <Check size={15} color="#fcc85e" /> For when things feel like they can't wait
                </li>
                <li>
                  <Check size={15} color="#fcc85e" /> Fastest possible confirmation turnaround
                </li>
              </ul>
              <button className="cs-btn cs-btn-amber cs-btn-full" onClick={() => openBooking("urgent")}>
                Book an urgent session
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-soft" id="how">
        <div className="cs-container">
          <div className="cs-kicker">How booking works</div>
          <h2 className="cs-h2">Simple by design — no payment gateway, no back-and-forth</h2>
          <div className="cs-steps">
            {[
              {
                n: "1",
                t: "Pick your slot",
                d: "Choose regular or urgent, then a day and time that's actually open — availability is kept current by Munira's team.",
              },
              {
                n: "2",
                t: "Pay by QR",
                d: "Scan the QR code shown at checkout and pay directly — no card details, no third-party gateway involved.",
              },
              {
                n: "3",
                t: "Get confirmed",
                d: "Once your payment is verified by the team, you'll receive confirmation with the session link.",
              },
            ].map((s) => (
              <div className="cs-step-card" key={s.n}>
                <div className="cs-step-num">{s.n}</div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cs-section">
        <div className="cs-container">
          <div className="cs-kicker">From past sessions</div>
          <h2 className="cs-h2">What clients have shared</h2>
          <div className="cs-quote-grid">
            {[
              {
                q: "I came in expecting advice and instead learned to actually notice my own patterns. That shift changed everything.",
                a: "R., 27",
              },
              {
                q: "The urgent session option genuinely helped on a night I didn't think I could get through alone.",
                a: "S., 31",
              },
              {
                q: "It's rare to find someone who blends the psychology with the body-based side of healing this well.",
                a: "A., 24",
              },
            ].map((t) => (
              <div className="cs-quote" key={t.a}>
                <p>{t.q}</p>
                <span>{t.a} · placeholder testimonial</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="cs-footer">
        <div className="cs-container">
          <div className="cs-footer-top">
            <div>
              <div className="cs-nav-brand">
                <Logo size={46} />
                <div className="cs-nav-brand-text">
                  <b style={{ color: "#fff" }}>ClearSpaces</b>
                  <span style={{ color: "#7d97b8" }}>Witnessed Holistic Healing</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#7d97b8", maxWidth: 320, marginTop: 14, lineHeight: 1.6 }}>
                Online counselling sessions with Munira. Confidential, trauma-informed, one session at a
                time.
              </p>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <a href="#" aria-label="Instagram">
                <Instagram size={19} />
              </a>
              <a href="#" aria-label="YouTube">
                <Youtube size={19} />
              </a>
              <a href="#" aria-label="WhatsApp">
                <MessageCircle size={19} />
              </a>
            </div>
          </div>
          <div className="cs-footer-bottom">
            <span>© {new Date().getFullYear()} ClearSpaces. All rights reserved.</span>
            <button className="cs-team-link" onClick={goAdmin}>
              <LayoutDashboard size={13} /> Team dashboard
            </button>
          </div>
          <div className="cs-demo-tag">
            Presentation demo — testimonials, client data and the QR code are placeholders.
          </div>
        </div>
      </footer>

      {showBooking && (
        <div className="cs-overlay" onClick={(e) => e.target === e.currentTarget && setShowBooking(false)}>
          <div className="cs-modal">
            <div className="cs-modal-head">
              <Logo size={34} />
              <button className="cs-modal-close" onClick={() => setShowBooking(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {!done && (
              <>
                <div className="cs-progress">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className={`cs-progress-dot ${step >= n ? "active" : ""}`} />
                  ))}
                </div>
                <div className="cs-progress-labels">
                  {STEP_LABELS.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </>
            )}

            <div className="cs-modal-body">
              {!done && step === 1 && (
                <>
                  <h3 className="cs-modal-title">Choose your session</h3>
                  <p className="cs-modal-sub">This decides which time slots you'll see next.</p>
                  <div
                    className={`cs-type-card ${sessionType === "regular" ? "selected" : ""}`}
                    onClick={() => setSessionType("regular")}
                  >
                    <div className="cs-type-card-top">
                      <b>Regular session</b>
                      <span className="amt">₹1,500</span>
                    </div>
                    <p>50-minute session. Choose any open slot over the next 7 days.</p>
                  </div>
                  <div
                    className={`cs-type-card ${sessionType === "urgent" ? "selected" : ""}`}
                    onClick={() => setSessionType("urgent")}
                  >
                    <div className="cs-type-card-top">
                      <b>Urgent session</b>
                      <span className="amt">₹4,500</span>
                    </div>
                    <p>Priority booking with limited same-day / next-day slots, reviewed by the team.</p>
                  </div>
                  <div className="cs-modal-nav" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="cs-btn cs-btn-amber"
                      disabled={!sessionType}
                      onClick={() => {
                        setDayIdx(null);
                        setTimeIdx(null);
                        setStep(2);
                      }}
                    >
                      Continue <ChevronRight size={15} style={{ verticalAlign: "-2px" }} />
                    </button>
                  </div>
                </>
              )}

              {!done && step === 2 && (
                <>
                  <h3 className="cs-modal-title">Pick a day &amp; time</h3>
                  <p className="cs-modal-sub">
                    {sessionType === "urgent"
                      ? "Urgent slots are limited — the team confirms based on real-time availability."
                      : "Grayed-out times are already booked or unavailable."}
                  </p>
                  <div className="cs-day-strip">
                    {visibleDays.map((d, i) => (
                      <div
                        key={i}
                        className={`cs-day-pill ${dayIdx === i ? "selected" : ""}`}
                        onClick={() => {
                          setDayIdx(i);
                          setTimeIdx(null);
                        }}
                      >
                        <span className="dow">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                        <span className="dom">{d.getDate()}</span>
                      </div>
                    ))}
                  </div>
                  {dayIdx !== null && (
                    <div className="cs-time-grid">
                      {TIMES.map((t, i) => {
                        const taken = isTaken(dayIdx, i);
                        return (
                          <div
                            key={t}
                            className={`cs-time-slot ${timeIdx === i ? "selected" : ""} ${taken ? "booked" : ""}`}
                            onClick={() => !taken && setTimeIdx(i)}
                          >
                            <Clock size={12} style={{ verticalAlign: "-1px", marginRight: 5 }} />
                            {t}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="cs-modal-nav">
                    <button className="cs-btn cs-btn-ghost" onClick={() => setStep(1)}>
                      <ChevronLeft size={15} style={{ verticalAlign: "-2px" }} /> Back
                    </button>
                    <button
                      className="cs-btn cs-btn-amber"
                      disabled={dayIdx === null || timeIdx === null}
                      onClick={() => setStep(3)}
                    >
                      Continue <ChevronRight size={15} style={{ verticalAlign: "-2px" }} />
                    </button>
                  </div>
                </>
              )}

              {!done && step === 3 && (
                <>
                  <h3 className="cs-modal-title">Your details</h3>
                  <p className="cs-modal-sub">This is what the team will use to confirm your session.</p>
                  <div className="cs-field">
                    <label>Full name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="cs-field">
                    <label>Phone (WhatsApp preferred)</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91"
                    />
                  </div>
                  <div className="cs-field">
                    <label>Email (optional)</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                    />
                  </div>
                  <div className="cs-field">
                    <label>Have we worked together before?</label>
                    <div className="cs-radio-row">
                      <div
                        className={`cs-radio-opt ${form.returning === "yes" ? "selected" : ""}`}
                        onClick={() => setForm({ ...form, returning: "yes" })}
                      >
                        Returning client
                      </div>
                      <div
                        className={`cs-radio-opt ${form.returning === "no" ? "selected" : ""}`}
                        onClick={() => setForm({ ...form, returning: "no" })}
                      >
                        First time
                      </div>
                    </div>
                  </div>
                  <div className="cs-field">
                    <label>Anything you'd like to share beforehand? (optional)</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="A line or two is enough"
                    />
                  </div>
                  <div className="cs-modal-nav">
                    <button className="cs-btn cs-btn-ghost" onClick={() => setStep(2)}>
                      <ChevronLeft size={15} style={{ verticalAlign: "-2px" }} /> Back
                    </button>
                    <button
                      className="cs-btn cs-btn-amber"
                      disabled={!form.name.trim() || !form.phone.trim() || !form.returning}
                      onClick={() => setStep(4)}
                    >
                      Continue to payment <ChevronRight size={15} style={{ verticalAlign: "-2px" }} />
                    </button>
                  </div>
                </>
              )}

              {!done && step === 4 && (
                <>
                  <h3 className="cs-modal-title">Complete payment</h3>
                  <p className="cs-modal-sub">Scan the QR code below and pay the amount shown.</p>
                  <div className="cs-pay-box">
                    <div className="cs-pay-amt">
                      Amount due<b>₹{amount.toLocaleString("en-IN")}</b>
                    </div>
                    <div className="cs-qr-frame">
                      <QRDemo />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <QrCode size={13} /> Demo QR — replace with Munira's real UPI QR
                    </div>
                  </div>
                  <div className="cs-field">
                    <label>UPI transaction / reference ID (optional)</label>
                    <input
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      placeholder="e.g. 402883XXXXXX"
                    />
                  </div>
                  <label className="cs-check-row">
                    <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                    <span>I've completed this payment via the QR code above.</span>
                  </label>
                  <div className="cs-note-box">
                    <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      Your slot is held once you submit. Munira's team verifies the payment manually and
                      confirms your session — usually within a few hours (faster for urgent requests).
                    </span>
                  </div>
                  <div className="cs-modal-nav">
                    <button className="cs-btn cs-btn-ghost" onClick={() => setStep(3)}>
                      <ChevronLeft size={15} style={{ verticalAlign: "-2px" }} /> Back
                    </button>
                    <button className="cs-btn cs-btn-amber" disabled={!paid} onClick={submit}>
                      Submit request
                    </button>
                  </div>
                </>
              )}

              {done && (
                <>
                  <div className="cs-confirm-badge">
                    <Clock size={14} /> Pending verification
                  </div>
                  <h3 className="cs-modal-title">Request sent, {done.name.split(" ")[0] || "there"}.</h3>
                  <p className="cs-modal-sub">
                    Munira's team will verify your payment and confirm this slot on WhatsApp or email.
                  </p>
                  <div className="cs-summary-card">
                    <div className="cs-summary-row">
                      <span>Session type</span>
                      <span>{done.type === "urgent" ? "Urgent" : "Regular"}</span>
                    </div>
                    <div className="cs-summary-row">
                      <span>Date</span>
                      <span>{fmtDay(days[done.dayIdx])}</span>
                    </div>
                    <div className="cs-summary-row">
                      <span>Time</span>
                      <span>{TIMES[done.timeIdx]}</span>
                    </div>
                    <div className="cs-summary-row">
                      <span>Amount</span>
                      <span>₹{done.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="cs-summary-row">
                      <span>Contact</span>
                      <span>{done.phone}</span>
                    </div>
                  </div>
                  <div className="cs-modal-nav">
                    <button className="cs-btn cs-btn-ghost" onClick={() => setShowBooking(false)}>
                      Close
                    </button>
                    <button className="cs-btn cs-btn-amber" onClick={() => openBooking(null)}>
                      Book another session
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =====================  ADMIN DASHBOARD  ===================== */

function AdminView({ days, bookings, blocked, setBookingStatus, toggleBlocked, goSite }) {
  const [tab, setTab] = useState("requests");
  const [dayIdx, setDayIdx] = useState(0);

  const bySlot = (a, b) => a.dayIdx - b.dayIdx || a.timeIdx - b.timeIdx;
  const pending = bookings.filter((b) => b.status === "pending").sort(bySlot);
  const decided = bookings.filter((b) => b.status !== "pending").sort(bySlot);
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  const bookingAt = (d, t) =>
    bookings.find((b) => b.dayIdx === d && b.timeIdx === t && b.status !== "declined");

  return (
    <div className="cs-admin">
      <div className="cs-admin-top">
        <div>
          <button className="cs-back-link" onClick={goSite}>
            <ArrowLeft size={15} /> Back to site
          </button>
          <div className="cs-nav-brand" style={{ marginTop: 10 }}>
            <Logo size={40} />
            <div className="cs-nav-brand-text">
              <b>Team dashboard</b>
              <span>Managing Munira's calendar</span>
            </div>
          </div>
        </div>
        <div className="cs-admin-stats">
          <div className="cs-admin-stat">
            <b>{pending.length}</b>
            <span>Pending requests</span>
          </div>
          <div className="cs-admin-stat">
            <b>{confirmedCount}</b>
            <span>Confirmed sessions</span>
          </div>
          <div className="cs-admin-stat">
            <b>{Object.keys(blocked).length}</b>
            <span>Blocked slots</span>
          </div>
        </div>
      </div>

      <div className="cs-urgent-note">
        <Phone size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          This dashboard is for routine confirmations and scheduling. If a client needs an urgent
          response, reach them directly on WhatsApp first — don't wait on this panel for time-sensitive
          situations.
        </span>
      </div>

      <div className="cs-admin-tabs">
        <button
          className={`cs-admin-tab ${tab === "requests" ? "active" : ""}`}
          onClick={() => setTab("requests")}
        >
          <CalendarClock size={15} /> Requests
        </button>
        <button
          className={`cs-admin-tab ${tab === "availability" ? "active" : ""}`}
          onClick={() => setTab("availability")}
        >
          <Ban size={15} /> Availability
        </button>
      </div>

      {tab === "requests" && (
        <div>
          <h4 className="cs-admin-section-title">Needs a decision ({pending.length})</h4>
          {pending.length === 0 && <p className="cs-admin-empty">Nothing pending right now.</p>}
          {pending.map((b) => (
            <div className="cs-req-card" key={b.id}>
              <div className="cs-req-top">
                <div>
                  <b>{b.name}</b>
                  <span className={`cs-type-pill ${b.type}`}>
                    {b.type === "urgent" ? "Urgent" : "Regular"}
                  </span>
                </div>
                <span className="cs-req-amt">₹{b.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="cs-req-meta">
                {fmtDay(days[b.dayIdx])} · {TIMES[b.timeIdx]} · {b.phone}
                {b.email ? ` · ${b.email}` : ""}
              </div>
              {b.txnRef && <div className="cs-req-meta">Txn ref: {b.txnRef}</div>}
              {b.notes && <div className="cs-req-notes">"{b.notes}"</div>}
              <div className="cs-req-actions">
                <button className="cs-btn cs-btn-light" onClick={() => setBookingStatus(b.id, "declined")}>
                  Decline
                </button>
                <button className="cs-btn cs-btn-blue" onClick={() => setBookingStatus(b.id, "confirmed")}>
                  Confirm session
                </button>
              </div>
            </div>
          ))}

          <h4 className="cs-admin-section-title" style={{ marginTop: 28 }}>
            Already decided
          </h4>
          {decided.length === 0 && <p className="cs-admin-empty">No history yet.</p>}
          {decided.map((b) => (
            <div className="cs-req-card quiet" key={b.id}>
              <div className="cs-req-top">
                <div>
                  <b>{b.name}</b>
                  <span className={`cs-type-pill ${b.type}`}>
                    {b.type === "urgent" ? "Urgent" : "Regular"}
                  </span>
                </div>
                <span className={`cs-status-pill ${b.status}`}>
                  {b.status === "confirmed" ? "Confirmed" : "Declined"}
                </span>
              </div>
              <div className="cs-req-meta">
                {fmtDay(days[b.dayIdx])} · {TIMES[b.timeIdx]} · {b.phone}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "availability" && (
        <div>
          <p className="cs-admin-sub">
            Tap a time to mark Munira busy or open it back up. Slots with a session already on them can't
            be blocked — decline the session first.
          </p>
          <div className="cs-day-strip">
            {days.map((d, i) => (
              <div
                key={i}
                className={`cs-day-pill ${dayIdx === i ? "selected" : ""}`}
                onClick={() => setDayIdx(i)}
              >
                <span className="dow">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className="dom">{d.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="cs-time-grid admin">
            {TIMES.map((t, i) => {
              const existing = bookingAt(dayIdx, i);
              const isBlocked = !!blocked[slotKey(dayIdx, i)];
              let cls = "cs-time-slot";
              if (existing) cls += " has-booking";
              else if (isBlocked) cls += " selected";
              return (
                <div
                  key={t}
                  className={cls}
                  onClick={() => !existing && toggleBlocked(dayIdx, i)}
                  title={
                    existing
                      ? `Booked — ${existing.name}`
                      : isBlocked
                      ? "Tap to open this slot"
                      : "Tap to block this slot"
                  }
                >
                  <Clock size={12} style={{ verticalAlign: "-1px", marginRight: 5 }} />
                  {t}
                  {existing && <div className="cs-slot-sub">{existing.name}</div>}
                  {!existing && isBlocked && <div className="cs-slot-sub">Blocked</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
