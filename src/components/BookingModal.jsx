import React, { useEffect, useMemo, useState } from "react";
import { Clock, X, ChevronRight, ChevronLeft, ShieldCheck, QrCode } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";
import { fetchTakenSlots, createSessionRequest } from "../lib/data";
import { TIMES, DAY_COUNT, getDays, toISODate, fmtDayLong } from "../lib/dates";

const STEP_LABELS = ["Session", "Schedule", "Notes", "Payment"];

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

export default function BookingModal({ onClose, initialType }) {
  const { session, profile } = useAuth();
  const days = useMemo(() => getDays(DAY_COUNT), []);

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(null);
  const [sessionType, setSessionType] = useState(initialType || null);
  const [dayIdx, setDayIdx] = useState(null);
  const [timeIdx, setTimeIdx] = useState(null);
  const [notes, setNotes] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [taken, setTaken] = useState({}); // "iso-time" -> true
  const [loadingSlots, setLoadingSlots] = useState(false);

  const visibleDays = sessionType === "urgent" ? days.slice(0, 2) : days;
  const amount = sessionType === "urgent" ? 4500 : 1500;

  useEffect(() => {
    if (step !== 2) return;
    setLoadingSlots(true);
    const from = toISODate(days[0]);
    const to = toISODate(days[days.length - 1]);
    fetchTakenSlots(from, to)
      .then((rows) => {
        const map = {};
        rows.forEach((r) => {
          map[`${r.session_date}-${r.time_slot}`] = true;
        });
        setTaken(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [step, days]);

  function isTaken(idx, timeLabel) {
    return !!taken[`${toISODate(visibleDays[idx])}-${timeLabel}`];
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const b = await createSessionRequest({
        patientId: session.user.id,
        type: sessionType,
        sessionDate: toISODate(visibleDays[dayIdx]),
        timeSlot: TIMES[timeIdx],
        amount,
        txnRef,
        clientNotes: notes,
      });
      setDone(b);
    } catch (e) {
      setError(e.message || "Something went wrong submitting your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cs-modal">
        <div className="cs-modal-head">
          <Logo size={34} />
          <button className="cs-modal-close" onClick={onClose} aria-label="Close">
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
          {error && <div className="cs-error-box">{error}</div>}

          {!done && step === 1 && (
            <>
              <h3 className="cs-modal-title">Choose your session</h3>
              <p className="cs-modal-sub">Booking as {profile?.full_name || session?.user?.email}.</p>

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
                {loadingSlots
                  ? "Checking live availability…"
                  : sessionType === "urgent"
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
                    const takenSlot = isTaken(dayIdx, t);
                    return (
                      <div
                        key={t}
                        className={`cs-time-slot ${timeIdx === i ? "selected" : ""} ${takenSlot ? "booked" : ""}`}
                        onClick={() => !takenSlot && setTimeIdx(i)}
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
              <h3 className="cs-modal-title">Anything you'd like to share?</h3>
              <p className="cs-modal-sub">Optional — a line or two is enough. This goes to Munira's team ahead of your session.</p>
              <div className="cs-field">
                <label>Notes for this session (optional)</label>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What's on your mind lately?" />
              </div>
              <div className="cs-modal-nav">
                <button className="cs-btn cs-btn-ghost" onClick={() => setStep(2)}>
                  <ChevronLeft size={15} style={{ verticalAlign: "-2px" }} /> Back
                </button>
                <button className="cs-btn cs-btn-amber" onClick={() => setStep(4)}>
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
                <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <QrCode size={13} /> Demo QR — replace with Munira's real UPI QR
                </div>
              </div>
              <div className="cs-field">
                <label>UPI transaction / reference ID (optional)</label>
                <input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} placeholder="e.g. 402883XXXXXX" />
              </div>
              <label className="cs-check-row">
                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                <span>I've completed this payment via the QR code above.</span>
              </label>
              <div className="cs-note-box">
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Your slot is held once you submit. Munira's team verifies the payment manually and confirms your
                  session — usually within a few hours (faster for urgent requests).
                </span>
              </div>
              <div className="cs-modal-nav">
                <button className="cs-btn cs-btn-ghost" onClick={() => setStep(3)}>
                  <ChevronLeft size={15} style={{ verticalAlign: "-2px" }} /> Back
                </button>
                <button className="cs-btn cs-btn-amber" disabled={!paid || submitting} onClick={submit}>
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
              </div>
            </>
          )}

          {done && (
            <>
              <div className="cs-confirm-badge">
                <Clock size={14} /> Pending verification
              </div>
              <h3 className="cs-modal-title">Request sent.</h3>
              <p className="cs-modal-sub">
                Munira's team will verify your payment and confirm this slot. You'll see the status update in
                "My sessions".
              </p>
              <div className="cs-summary-card">
                <div className="cs-summary-row">
                  <span>Session type</span>
                  <span>{done.type === "urgent" ? "Urgent" : "Regular"}</span>
                </div>
                <div className="cs-summary-row">
                  <span>Date</span>
                  <span>{fmtDayLong(done.session_date)}</span>
                </div>
                <div className="cs-summary-row">
                  <span>Time</span>
                  <span>{done.time_slot}</span>
                </div>
                <div className="cs-summary-row">
                  <span>Amount</span>
                  <span>₹{done.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="cs-modal-nav">
                <button className="cs-btn cs-btn-ghost" onClick={onClose}>
                  Close
                </button>
                <a className="cs-btn cs-btn-amber" href="/dashboard" style={{ textDecoration: "none", textAlign: "center" }}>
                  Go to my sessions
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}