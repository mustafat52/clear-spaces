import React, { useEffect, useMemo, useState } from "react";
import { X, Clock } from "lucide-react";
import { fetchTakenSlots, rescheduleSession } from "../lib/data";
import { TIMES, DAY_COUNT, getDays, toISODate, fmtDayLong } from "../lib/dates";
import { computeTier, compactAmount } from "../lib/pricing";

export default function RescheduleModal({ booking, onClose, onSaved }) {
  const days = useMemo(() => getDays(DAY_COUNT), []);

  const [dayIdx, setDayIdx] = useState(() => {
    const idx = days.findIndex((d) => toISODate(d) === booking.session_date);
    return idx >= 0 ? idx : null;
  });
  const [timeIdx, setTimeIdx] = useState(() => {
    const idx = TIMES.indexOf(booking.time_slot);
    return idx >= 0 ? idx : null;
  });
  const [amount, setAmount] = useState(booking.amount);
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
      // This appointment's own current slot shouldn't block re-selecting it.
      delete map[`${booking.session_date}-${booking.time_slot}`];
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
  const newTier = selectedIso ? computeTier(selectedIso) : null;
  const dateChanged =
    selectedIso !== booking.session_date || (timeIdx !== null && TIMES[timeIdx] !== booking.time_slot);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await rescheduleSession(booking.id, {
        sessionDate: selectedIso,
        timeSlot: TIMES[timeIdx],
        amount: Number(amount),
      });
      onSaved();
      onClose();
    } catch (e) {
      if (e.code === "23505") {
        setError("That slot was just taken by another booking. Pick a different time.");
        setTimeIdx(null);
        load();
      } else {
        setError(e.message || "Couldn't save the change.");
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
            Reschedule
          </h3>
          <button className="cs-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="cs-modal-body">
          <p className="cs-modal-sub">
            {booking.patient?.full_name || "This patient"}'s current slot: {fmtDayLong(booking.session_date)} at{" "}
            {booking.time_slot}.
          </p>

          {error && <div className="cs-error-box">{error}</div>}

          <p className="cs-modal-sub" style={{ marginBottom: 10 }}>
            {loading ? "Checking live availability…" : "Pick a new day and time. Prices shown are per date."}
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

          {dateChanged && newTier && (
            <div className="cs-tier-hint">
              The new date falls under <b>{newTier.label}</b> pricing (₹{newTier.amount.toLocaleString("en-IN")}).
              The amount below won't change automatically — update it yourself if that's what you want to charge.
            </div>
          )}

          <div className="cs-field" style={{ marginTop: 16 }}>
            <label>Amount (₹) — only changes if you edit it</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="cs-modal-nav" style={{ justifyContent: "flex-end" }}>
            <button className="cs-btn cs-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="cs-btn cs-btn-blue"
              disabled={dayIdx === null || timeIdx === null || saving}
              onClick={save}
            >
              {saving ? "Saving…" : "Save new slot"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}