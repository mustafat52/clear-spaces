import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  Ban,
  Users,
  Phone,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import Logo from "../components/Logo";
import RescheduleModal from "../components/RescheduleModal";
import ManualBookingModal from "../components/ManualBookingModal";
import { useAuth } from "../lib/auth";
import {
  fetchAllSessions,
  updateSessionStatus,
  updateSharedNotes,
  fetchClinicalNotes,
  upsertClinicalNotes,
  fetchBlockedSlots,
  addBlockedSlot,
  removeBlockedSlot,
  fetchPatients,
  fetchPatientSessions,
} from "../lib/data";
import {
  TIMES,
  DAY_COUNT,
  getDays,
  toISODate,
  fmtDayLong,
  STATUS_LABEL,
  getMonthGrid,
  addMonths,
  monthLabel,
} from "../lib/dates";
import { buildWaLink, buildConfirmMessage, buildDeclineMessage } from "../lib/whatsapp";
import { tierLabel } from "../lib/pricing";

// A session either has a real patient (website booking) or manual_name /
// manual_phone (staff-created, from an Instagram/WhatsApp conversation).
// These two helpers pick whichever applies so the rest of the UI doesn't
// need to know which case it's looking at.
function patientName(b) {
  return b.patient?.full_name || b.manual_name || "Unknown";
}
function patientPhone(b) {
  return b.patient?.phone || b.manual_phone || "";
}

export default function StaffDashboard() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("requests");
  const [showManual, setShowManual] = useState(false);
  // bumping this remounts whichever tab is active, so a manually-created
  // appointment shows up immediately instead of waiting for a tab switch
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="cs-admin">
      <div className="cs-admin-top">
        <div>
          <Link to="/" className="cs-back-link">
            <ArrowLeft size={15} /> Back to site
          </Link>
          <div className="cs-nav-brand" style={{ marginTop: 10 }}>
            <Logo size={40} />
            <div className="cs-nav-brand-text">
              <b>Team dashboard</b>
              <span>{profile?.full_name || session?.user?.email}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="cs-btn cs-btn-blue" onClick={() => setShowManual(true)}>
            + New appointment
          </button>
          <button className="cs-btn cs-btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="cs-urgent-note">
        <Phone size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          This dashboard is for routine confirmations, scheduling, and notes. If a client needs an urgent
          response, reach them directly on WhatsApp first — don't wait on this panel for time-sensitive
          situations.
        </span>
      </div>

      <div className="cs-admin-tabs">
        <button className={`cs-admin-tab ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>
          <CalendarClock size={15} /> Requests
        </button>
        <button className={`cs-admin-tab ${tab === "calendar" ? "active" : ""}`} onClick={() => setTab("calendar")}>
          <CalendarDays size={15} /> Calendar
        </button>
        <button className={`cs-admin-tab ${tab === "availability" ? "active" : ""}`} onClick={() => setTab("availability")}>
          <Ban size={15} /> Availability
        </button>
        <button className={`cs-admin-tab ${tab === "patients" ? "active" : ""}`} onClick={() => setTab("patients")}>
          <Users size={15} /> Patients
        </button>
      </div>

      {tab === "requests" && <RequestsTab key={`req-${refreshKey}`} />}
      {tab === "calendar" && <CalendarTab key={`cal-${refreshKey}`} />}
      {tab === "availability" && <AvailabilityTab key={`avail-${refreshKey}`} staffId={session?.user?.id} />}
      {tab === "patients" && <PatientsTab key={`pat-${refreshKey}`} staffId={session?.user?.id} />}

      {showManual && (
        <ManualBookingModal
          onClose={() => setShowManual(false)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

/* =====================  REQUESTS  ===================== */

function RequestsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  // Lifted up here (not into each card) so the editable draft and whether
  // the WhatsApp box is open survive a card moving from "Needs a decision"
  // into "Already decided" right after Confirm/Decline.
  const [drafts, setDrafts] = useState({});
  const [openIds, setOpenIds] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchAllSessions();
      setSessions(rows);
    } finally {
      setLoading(false);
    }
  }

  async function decide(b, status) {
    await updateSessionStatus(b.id, status);
    const template = status === "confirmed" ? buildConfirmMessage(b) : buildDeclineMessage(b);
    setDrafts((d) => ({ ...d, [b.id]: template }));
    setOpenIds((o) => ({ ...o, [b.id]: true }));
    // update in place rather than a full reload, so the card doesn't
    // flicker and the draft above stays attached to the right session
    setSessions((rows) => rows.map((r) => (r.id === b.id ? { ...r, status } : r)));
  }

  function toggleEditor(b) {
    setOpenIds((o) => {
      const willOpen = !o[b.id];
      if (willOpen && !drafts[b.id]) {
        const template = b.status === "confirmed" ? buildConfirmMessage(b) : buildDeclineMessage(b);
        setDrafts((d) => ({ ...d, [b.id]: template }));
      }
      return { ...o, [b.id]: willOpen };
    });
  }

  const pending = sessions.filter((s) => s.status === "pending");
  const decided = sessions.filter((s) => s.status !== "pending");

  if (loading) return <p className="cs-admin-empty">Loading requests…</p>;

  return (
    <div>
      <h4 className="cs-admin-section-title">Needs a decision ({pending.length})</h4>
      {pending.length === 0 && <p className="cs-admin-empty">Nothing pending right now.</p>}
      {pending.map((b) => (
        <RequestCard
          key={b.id}
          b={b}
          draft={drafts[b.id]}
          open={!!openIds[b.id]}
          onConfirm={() => decide(b, "confirmed")}
          onDecline={() => decide(b, "declined")}
          onToggleEditor={() => toggleEditor(b)}
          onDraftChange={(text) => setDrafts((d) => ({ ...d, [b.id]: text }))}
          onChanged={load}
        />
      ))}

      <h4 className="cs-admin-section-title" style={{ marginTop: 28 }}>
        Already decided
      </h4>
      {decided.length === 0 && <p className="cs-admin-empty">No history yet.</p>}
      {decided.map((b) => (
        <RequestCard
          key={b.id}
          b={b}
          quiet
          draft={drafts[b.id]}
          open={!!openIds[b.id]}
          onToggleEditor={() => toggleEditor(b)}
          onDraftChange={(text) => setDrafts((d) => ({ ...d, [b.id]: text }))}
          onChanged={load}
        />
      ))}
    </div>
  );
}

function RequestCard({ b, quiet, draft, open, onConfirm, onDecline, onToggleEditor, onDraftChange, onChanged }) {
  const phone = patientPhone(b);
  const plainWaLink = buildWaLink(phone);
  const [editing, setEditing] = useState(false);

  function sendViaWhatsApp() {
    window.open(buildWaLink(phone, draft || ""), "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`cs-req-card ${quiet ? "quiet" : ""}`}>
      <div className="cs-req-top">
        <div>
          <b>{patientName(b)}</b>
          <span className={`cs-type-pill ${b.type}`}>{tierLabel(b.type)}</span>
          {b.source && b.source !== "website" && <span className="cs-source-pill">via {b.source}</span>}
        </div>
        {b.status === "pending" ? (
          <span className="cs-req-amt">₹{b.amount.toLocaleString("en-IN")}</span>
        ) : (
          <span className={`cs-status-pill ${b.status}`}>{STATUS_LABEL[b.status]}</span>
        )}
      </div>
      <div className="cs-req-meta">
        {fmtDayLong(b.session_date)} · {b.time_slot} · {phone}
        {b.patient?.email ? ` · ${b.patient.email}` : ""}
      </div>
      {b.txn_ref && <div className="cs-req-meta">Txn ref: {b.txn_ref}</div>}
      {b.client_notes && <div className="cs-req-notes">"{b.client_notes}"</div>}

      <div className="cs-req-actions">
        {phone && (
          <a className="cs-btn cs-btn-light" href={plainWaLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            Message on WhatsApp
          </a>
        )}
        <button className="cs-btn cs-btn-light" onClick={() => setEditing(true)}>
          Edit
        </button>
        {b.status === "pending" && (
          <>
            <button className="cs-btn cs-btn-light" onClick={onDecline}>
              Decline
            </button>
            <button className="cs-btn cs-btn-blue" onClick={onConfirm}>
              Confirm session
            </button>
          </>
        )}
        {b.status !== "pending" && phone && (
          <button className="cs-btn cs-btn-light" onClick={onToggleEditor}>
            {open ? "Hide message" : "Prepare WhatsApp message"}
          </button>
        )}
      </div>

      {open && (
        <div className="cs-wa-box">
          <label>Edit before sending — fill in Mr./Ms. and adjust as needed</label>
          <textarea rows={7} value={draft || ""} onChange={(e) => onDraftChange(e.target.value)} />
          <button className="cs-btn cs-btn-blue" onClick={sendViaWhatsApp} disabled={!phone}>
            <MessageCircle size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            Send via WhatsApp
          </button>
        </div>
      )}

      {editing && (
        <RescheduleModal
          booking={b}
          onClose={() => setEditing(false)}
          onSaved={() => onChanged && onChanged()}
        />
      )}
    </div>
  );
}

/* =====================  AVAILABILITY  ===================== */

/* =====================  CALENDAR  ===================== */

const STATUS_DOT_CLASS = {
  pending: "cs-dot-pending",
  confirmed: "cs-dot-confirmed",
  completed: "cs-dot-completed",
  declined: "cs-dot-declined",
};

function CalendarTab() {
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [sessions, setSessions] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIso, setSelectedIso] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  const grid = useMemo(() => getMonthGrid(monthDate), [monthDate]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  async function load() {
    setLoading(true);
    try {
      const start = toISODate(grid[0].date);
      const end = toISODate(grid[grid.length - 1].date);
      const [allSessions, blocks] = await Promise.all([fetchAllSessions(), fetchBlockedSlots(start, end)]);
      setSessions(allSessions);
      setBlocked(blocks);
    } finally {
      setLoading(false);
    }
  }

  const byDay = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!map[s.session_date]) map[s.session_date] = [];
      map[s.session_date].push(s);
    });
    return map;
  }, [sessions]);

  const blockedByDay = useMemo(() => {
    const map = {};
    blocked.forEach((b) => {
      map[b.block_date] = (map[b.block_date] || 0) + 1;
    });
    return map;
  }, [blocked]);

  const today = toISODate(new Date());
  const selectedDaySessions = selectedIso ? (byDay[selectedIso] || []).sort((a, b) => a.time_slot.localeCompare(b.time_slot)) : [];

  return (
    <div>
      <div className="cs-cal-header">
        <button className="cs-btn cs-btn-light" onClick={() => setMonthDate((d) => addMonths(d, -1))}>
          <ChevronLeft size={15} />
        </button>
        <b>{monthLabel(monthDate)}</b>
        <button className="cs-btn cs-btn-light" onClick={() => setMonthDate((d) => addMonths(d, 1))}>
          <ChevronRight size={15} />
        </button>
      </div>

      {loading ? (
        <p className="cs-admin-empty">Loading calendar…</p>
      ) : (
        <>
          <div className="cs-cal-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="cs-cal-grid">
            {grid.map((cell, i) => {
              const iso = toISODate(cell.date);
              const daySessions = (byDay[iso] || []).filter((s) => s.status !== "declined");
              const isToday = iso === today;
              const isSelected = iso === selectedIso;
              const hasBlocked = !!blockedByDay[iso];
              return (
                <div
                  key={i}
                  className={`cs-cal-cell ${cell.inMonth ? "" : "dim"} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedIso(iso)}
                >
                  <span className="cs-cal-daynum">{cell.date.getDate()}</span>
                  {hasBlocked && <span className="cs-cal-blocked-mark" title="Some slots blocked">●</span>}
                  <div className="cs-cal-dots">
                    {daySessions.slice(0, 3).map((s) => (
                      <span key={s.id} className={`cs-cal-dot ${STATUS_DOT_CLASS[s.status] || ""}`} />
                    ))}
                    {daySessions.length > 3 && <span className="cs-cal-more">+{daySessions.length - 3}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cs-cal-legend">
            <span><i className="cs-cal-dot cs-dot-pending" /> Pending</span>
            <span><i className="cs-cal-dot cs-dot-confirmed" /> Confirmed</span>
            <span><i className="cs-cal-dot cs-dot-completed" /> Completed</span>
          </div>

          {selectedIso && (
            <div className="cs-cal-day-panel">
              <h4 className="cs-admin-section-title">{fmtDayLong(selectedIso)}</h4>
              {selectedDaySessions.length === 0 && <p className="cs-admin-empty">Nothing scheduled this day.</p>}
              {selectedDaySessions.map((s) => (
                <div className="cs-req-card quiet" key={s.id}>
                  <div className="cs-req-top">
                    <div>
                      <b>{patientName(s)}</b>
                      <span className={`cs-type-pill ${s.type}`}>{tierLabel(s.type)}</span>
                      {s.source && s.source !== "website" && <span className="cs-source-pill">via {s.source}</span>}
                    </div>
                    <span className={`cs-status-pill ${s.status}`}>{STATUS_LABEL[s.status]}</span>
                  </div>
                  <div className="cs-req-meta">
                    {s.time_slot} · ₹{s.amount.toLocaleString("en-IN")} · {patientPhone(s)}
                  </div>
                  <div className="cs-req-actions">
                    <button className="cs-btn cs-btn-light" onClick={() => setEditingBooking(s)}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingBooking && (
            <RescheduleModal
              booking={editingBooking}
              onClose={() => setEditingBooking(null)}
              onSaved={load}
            />
          )}
        </>
      )}
    </div>
  );
}

function AvailabilityTab({ staffId }) {
  const days = useMemo(() => getDays(DAY_COUNT), []);
  const [dayIdx, setDayIdx] = useState(0);
  const [blocked, setBlocked] = useState([]);
  const [bookedKeys, setBookedKeys] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const from = toISODate(days[0]);
      const to = toISODate(days[days.length - 1]);
      const [blocks, allSessions] = await Promise.all([fetchBlockedSlots(from, to), fetchAllSessions()]);
      setBlocked(blocks);
      const map = {};
      allSessions
        .filter((s) => s.status === "pending" || s.status === "confirmed")
        .forEach((s) => {
          map[`${s.session_date}-${s.time_slot}`] = s;
        });
      setBookedKeys(map);
    } finally {
      setLoading(false);
    }
  }

  function isBlocked(iso, t) {
    return blocked.some((b) => b.block_date === iso && b.time_slot === t);
  }

  async function toggle(iso, t) {
    const existing = blocked.find((b) => b.block_date === iso && b.time_slot === t);
    if (existing) {
      await removeBlockedSlot(iso, t);
    } else {
      await addBlockedSlot(iso, t, staffId);
    }
    load();
  }

  const activeDay = days[dayIdx];
  const activeIso = toISODate(activeDay);

  return (
    <div>
      <p className="cs-admin-sub">
        Tap a time to mark Munira busy or open it back up. Slots with a session already on them can't be
        blocked — decline the session first.
      </p>
      <div className="cs-day-strip">
        {days.map((d, i) => (
          <div key={i} className={`cs-day-pill ${dayIdx === i ? "selected" : ""}`} onClick={() => setDayIdx(i)}>
            <span className="dow">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
            <span className="dom">{d.getDate()}</span>
          </div>
        ))}
      </div>
      {loading ? (
        <p className="cs-admin-empty">Loading…</p>
      ) : (
        <div className="cs-time-grid admin">
          {TIMES.map((t) => {
            const existing = bookedKeys[`${activeIso}-${t}`];
            const blockedNow = isBlocked(activeIso, t);
            let cls = "cs-time-slot";
            if (existing) cls += " has-booking";
            else if (blockedNow) cls += " selected";
            return (
              <div
                key={t}
                className={cls}
                onClick={() => !existing && toggle(activeIso, t)}
                title={existing ? `Booked — ${patientName(existing)}` : blockedNow ? "Tap to open" : "Tap to block"}
              >
                <Clock size={12} style={{ verticalAlign: "-1px", marginRight: 5 }} />
                {t}
                {existing && <div className="cs-slot-sub">{patientName(existing)}</div>}
                {!existing && blockedNow && <div className="cs-slot-sub">Blocked</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =====================  PATIENTS  ===================== */

function PatientsTab({ staffId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return <PatientDetail patient={selected} staffId={staffId} onBack={() => setSelected(null)} />;
  }

  if (loading) return <p className="cs-admin-empty">Loading patients…</p>;
  if (patients.length === 0) return <p className="cs-admin-empty">No patients have signed up yet.</p>;

  return (
    <div>
      {patients.map((p) => (
        <div className="cs-req-card cs-patient-row" key={p.id} onClick={() => setSelected(p)}>
          <div>
            <b style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: "var(--navy)" }}>{p.full_name || "Unnamed"}</b>
            <div className="cs-req-meta">
              {p.phone} {p.email ? `· ${p.email}` : ""}
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      ))}
    </div>
  );
}

function PatientDetail({ patient, staffId, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchPatientSessions(patient.id);
      setSessions(rows);
    } finally {
      setLoading(false);
    }
  }

  const total = sessions.filter((s) => s.status !== "declined").length;

  return (
    <div>
      <button className="cs-back-link" onClick={onBack} style={{ marginBottom: 16 }}>
        <ArrowLeft size={15} /> All patients
      </button>
      <div className="cs-req-card" style={{ marginBottom: 22 }}>
        <b style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: "var(--navy)" }}>{patient.full_name}</b>
        <div className="cs-req-meta">
          {patient.phone} {patient.email ? `· ${patient.email}` : ""}
        </div>
        <div className="cs-req-meta">{total} session{total === 1 ? "" : "s"} total</div>
      </div>

      {loading && <p className="cs-admin-empty">Loading sessions…</p>}
      {!loading && sessions.length === 0 && <p className="cs-admin-empty">No sessions yet.</p>}

      {sessions.map((s) => (
        <SessionNoteEditor key={s.id} s={s} staffId={staffId} onSaved={load} />
      ))}
    </div>
  );
}

function SessionNoteEditor({ s, staffId, onSaved }) {
  const [expanded, setExpanded] = useState(false);
  const [sharedNotes, setSharedNotes] = useState(s.shared_notes || "");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [clinicalLoaded, setClinicalLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  async function open() {
    setExpanded(!expanded);
    if (!expanded && !clinicalLoaded) {
      const row = await fetchClinicalNotes(s.id);
      setClinicalNotes(row?.clinical_notes || "");
      setClinicalLoaded(true);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await updateSharedNotes(s.id, sharedNotes);
      await upsertClinicalNotes(s.id, clinicalNotes, staffId);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function markCompleted() {
    await updateSessionStatus(s.id, "completed");
    onSaved();
  }

  return (
    <div className="cs-req-card quiet">
      <div className="cs-req-top" style={{ cursor: "pointer" }} onClick={open}>
        <div>
          <b>{fmtDayLong(s.session_date)}</b>
          <span className={`cs-type-pill ${s.type}`}>{tierLabel(s.type)}</span>
        </div>
        <span className={`cs-status-pill ${s.status}`}>{STATUS_LABEL[s.status]}</span>
      </div>
      <div className="cs-req-meta">{s.time_slot} · ₹{s.amount.toLocaleString("en-IN")}</div>

      {expanded && (
        <div style={{ marginTop: 14 }}>
          <div className="cs-field">
            <label>Shared note (visible to the patient)</label>
            <textarea rows={2} value={sharedNotes} onChange={(e) => setSharedNotes(e.target.value)} placeholder="A brief reflection or homework for the patient to see" />
          </div>
          <div className="cs-field">
            <label>Clinical note (staff only — never visible to the patient)</label>
            <textarea rows={3} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Private process notes" />
          </div>
          <div className="cs-req-actions">
            <button className="cs-btn cs-btn-light" onClick={() => setEditing(true)}>
              Edit
            </button>
            {s.status === "confirmed" && (
              <button className="cs-btn cs-btn-light" onClick={markCompleted}>
                Mark completed
              </button>
            )}
            <button className="cs-btn cs-btn-blue" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <RescheduleModal booking={s} onClose={() => setEditing(false)} onSaved={onSaved} />
      )}
    </div>
  );
}