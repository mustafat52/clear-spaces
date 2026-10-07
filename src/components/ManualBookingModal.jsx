import React, { useEffect, useMemo, useState } from "react";
import { X, Clock } from "lucide-react";
import { fetchTakenSlots, createManualSession } from "../lib/data";
import { TIMES, DAY_COUNT, getDays, toISODate } from "../lib/dates";
import { computeTier, compactAmount } from "../lib/pricing";

const SOURCES = [
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "phone", label: "Phone call" },
  { key: "other", label: "Other" },
];

export default function ManualBookingModal({ onClose, onSaved }) {
  const days = useMemo(() => getDays(DAY_COUNT), []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("instagram");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [dayIdx, setDayIdx] = useState(null);
  const [timeIdx, setTimeIdx] = useState(null);
  const [amount, setAmount] = useState(null);
  const [taken, setTaken] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const from = toISODate(days[0]);
      const to = toISODate(days[days.length - 1]);
      const rows = await fetchTakenSlots(from, to);
      const map = {};
      rows.forEach((r) => {
        map[`${r.session_date}-${r.time_slot}`] = true;
      });
      setTaken(map);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function isTaken(idx, timeLabel) {
    return !!taken[`${toISODate(days[idx])}-${timeLabel}`];
  }

  const selectedIso = dayIdx !== null ? toISODate(days[dayIdx]) : null;
  const suggestedTier = selectedIso ? computeTier(selectedIso) : null;
  const effectiveAmount = amount !== null ? amount : suggestedTier?.amount ?? "";

  function selectDay(i) {
    setDayIdx(i);
    setTimeIdx(null);
    setError("");
    setAmount(null); // reset to the new date's suggested price unless staff overrides again
  }

  const canSave = name.trim() && phone.trim() && dayIdx !== null && timeIdx !== null && !saving;

  async function save() {
    setSaving(true);
    setError("");
    try {
      await createManualSession({
        manualName: name.trim(),
        manualPhone: phone.trim(),
        source,
        type: suggestedTier.key,
        sessionDate: selectedIso,
        timeSlot: TIMES[timeIdx],
        amount: Number(effectiveAmount),
        clientNotes: notes,
        status,
      });
      onSaved();
      onClose();
    } catch (e) {
      if (e.code === "23505") {
        setError("That slot was just taken by another booking. Pick a different time.");
        setTimeIdx(null);
        load();
      } else {
        setError(e.message || "Couldn't create the appointment.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cs-modal">
        <div className="cs-modal-head">
          <h3 className="cs-modal-title" style={{ marginBottom: 0 }}>
            New appointment
          </h3>
          <button className="cs-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="cs-modal-body">
          <p className="cs-modal-sub">
            For a booking arranged outside the site — over Instagram, WhatsApp, or a call. This holds the slot on
            the same calendar everyone else books from, so it can't clash with anything else.
          </p>

          {error && <div className="cs-error-box">{error}</div>}

          <div className="cs-field">
            <label>Patient name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="cs-field">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" />
          </div>
          <div className="cs-field">
            <label>Where did this come from?</label>
            <div className="cs-radio-row">
              {SOURCES.map((s) => (
                <div
                  key={s.key}
                  className={`cs-radio-opt ${source === s.key ? "selected" : ""}`}
                  onClick={() => setSource(s.key)}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          <p className="cs-modal-sub" style={{ marginTop: 18, marginBottom: 10 }}>
            {loading ? "Checking live availability…" : "Pick the day and time already agreed with the patient."}
          </p>

          <div className="cs-day-strip">
            {days.map((d, i) => {
              const dTier = computeTier(toISODate(d));
              return (
                <div
                  key={i}
                  className={`cs-day-pill ${dayIdx === i ? "selected" : ""}`}
                  onClick={() => selectDay(i)}
                >
                  <span className="dow">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <span className="dom">{d.getDate()}</span>
                  <span className="cs-day-price">{compactAmount(dTier.amount)}</span>
                </div>
              );
            })}
          </div>

          {dayIdx !== null && (
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
          )}

          <div className="cs-field" style={{ marginTop: 16 }}>
            <label>Amount (₹) — defaults to the usual price for this date</label>
            <input type="number" value={effectiveAmount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="cs-field">
            <label>Notes (optional)</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth flagging" />
          </div>

          <div className="cs-field">
            <label>Status</label>
            <div className="cs-radio-row">
              <div className={`cs-radio-opt ${status === "confirmed" ? "selected" : ""}`} onClick={() => setStatus("confirmed")}>
                Confirmed
              </div>
              <div className={`cs-radio-opt ${status === "pending" ? "selected" : ""}`} onClick={() => setStatus("pending")}>
                Still pending
              </div>
            </div>
          </div>

          <div className="cs-modal-nav" style={{ justifyContent: "flex-end" }}>
            <button className="cs-btn cs-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="cs-btn cs-btn-blue" disabled={!canSave} onClick={save}>
              {saving ? "Saving…" : "Create appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}