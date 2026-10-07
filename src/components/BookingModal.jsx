import React, { useEffect, useMemo, useState } from "react";
import { Clock, X, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";
import { fetchTakenSlots, createSessionRequest } from "../lib/data";
import { TIMES, DAY_COUNT, getDays, toISODate, fmtDayLong } from "../lib/dates";
import { computeTier, compactAmount } from "../lib/pricing";

const STEP_LABELS = ["Schedule", "Details"];

export default function BookingModal({ onClose }) {
  const { session } = useAuth();
  const days = useMemo(() => getDays(DAY_COUNT), []);

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(null);
  const [dayIdx, setDayIdx] = useState(null);
  const [timeIdx, setTimeIdx] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [taken, setTaken] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const selectedIso = dayIdx !== null ? toISODate(days[dayIdx]) : null;
  const tier = selectedIso ? computeTier(selectedIso) : null;

  async function loadTakenSlots() {
    setLoadingSlots(true);
    const from = toISODate(days[0]);
    const to = toISODate(days[days.length - 1]);
    try {
      const rows = await fetchTakenSlots(from, to);
      const map = {};
      rows.forEach((r) => {
        map[`${r.session_date}-${r.time_slot}`] = true;
      });
      setTaken(map);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    loadTakenSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isTaken(idx, timeLabel) {
    return !!taken[`${toISODate(days[idx])}-${timeLabel}`];
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const b = await createSessionRequest({
        patientId: session.user.id,
        type: tier.key,
        sessionDate: selectedIso,
        timeSlot: TIMES[timeIdx],
        amount: tier.amount,
        clientNotes: notes,
      });
      setDone(b);
    } catch (e) {
      if (e.code === "23505") {
        setError("Someone just booked this exact slot. Pick another time below.");
        setTimeIdx(null);
        setStep(1);
        loadTakenSlots();
      } else {
        setError(e.message || "Something went wrong submitting your request.");
      }
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
              {[1, 2].map((n) => (
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
              <h3 className="cs-modal-title">Pick a day &amp; time</h3>
              <p className="cs-modal-sub">
                {loadingSlots
                  ? "Checking live availability…"
                  : "Pricing depends on how soon your session is — shown under each date. Grayed-out times are already taken."}
              </p>

              <div className="cs-day-strip">
                {days.map((d, i) => {
                  const dTier = computeTier(toISODate(d));
                  return (
                    <div
                      key={i}
                      className={`cs-day-pill ${dayIdx === i ? "selected" : ""}`}
                      onClick={() => {
                        setDayIdx(i);
                        setTimeIdx(null);
                        setError("");
                      }}
                    >
                      <span className="dow">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                      <span className="dom">{d.getDate()}</span>
                      <span className="cs-day-price">{compactAmount(dTier.amount)}</span>
                    </div>
                  );
                })}
              </div>

              {dayIdx !== null && (
                <>
                  <div className="cs-time-grid">
                    {TIMES.map((t, i) => {
                      const takenSlot = isTaken(dayIdx, t);
                      return (
                        <div
                          key={t}
                          className={`cs-time-slot ${timeIdx === i ? "selected" : ""} ${takenSlot ? "booked" : ""}`}
                          onClick={() => {
                            if (!takenSlot) {
                              setTimeIdx(i);
                              setError("");
                            }
                          }}
                        >
                          <Clock size={12} style={{ verticalAlign: "-1px", marginRight: 5 }} />
                          {t}
                        </div>
                      );
                    })}
                  </div>
                  <div className="cs-tier-hint">
                    <b>{tier.label} pricing</b> — {tier.blurb}: ₹{tier.amount.toLocaleString("en-IN")}
                  </div>
                </>
              )}

              <div className="cs-modal-nav" style={{ justifyContent: "flex-end" }}>
                <button
                  className="cs-btn cs-btn-amber"
                  disabled={dayIdx === null || timeIdx === null}
                  onClick={() => setStep(2)}
                >
                  Continue <ChevronRight size={15} style={{ verticalAlign: "-2px" }} />
                </button>
              </div>
            </>
          )}

          {!done && step === 2 && (
            <>
              <h3 className="cs-modal-title">Anything you'd like to share?</h3>
              <p className="cs-modal-sub">Optional — a line or two is enough. This goes to Munira's team ahead of your session.</p>
              <div className="cs-field">
                <label>Notes for this session (optional)</label>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What's on your mind lately?" />
              </div>

              <div className="cs-summary-card" style={{ marginBottom: 18 }}>
                <div className="cs-summary-row">
                  <span>Pricing tier</span>
                  <span>{tier?.label}</span>
                </div>
                <div className="cs-summary-row">
                  <span>Date</span>
                  <span>{selectedIso ? fmtDayLong(selectedIso) : ""}</span>
                </div>
                <div className="cs-summary-row">
                  <span>Time</span>
                  <span>{timeIdx !== null ? TIMES[timeIdx] : ""}</span>
                </div>
                <div className="cs-summary-row">
                  <span>Amount</span>
                  <span>₹{tier?.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="cs-note-box">
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Submitting holds your slot. Munira's team will review your request and reach out on WhatsApp to
                  confirm — payment is collected directly in that conversation, not on this site.
                </span>
              </div>

              <div className="cs-modal-nav">
                <button className="cs-btn cs-btn-ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={15} style={{ verticalAlign: "-2px" }} /> Back
                </button>
                <button className="cs-btn cs-btn-amber" disabled={submitting} onClick={submit}>
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
              </div>
            </>
          )}

          {done && (
            <>
              <div className="cs-confirm-badge">
                <Clock size={14} /> Pending review
              </div>
              <h3 className="cs-modal-title">Request sent.</h3>
              <p className="cs-modal-sub">
                Munira's team will review your request and message you on WhatsApp to confirm your slot and collect
                payment. You'll see the status update in "My sessions" too.
              </p>
              <div className="cs-summary-card">
                <div className="cs-summary-row">
                  <span>Pricing tier</span>
                  <span>{computeTier(done.session_date).label}</span>
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