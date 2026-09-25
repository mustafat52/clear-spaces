import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MessageSquareText } from "lucide-react";
import Logo from "../components/Logo";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../lib/auth";
import { fetchMySessions } from "../lib/data";
import { fmtDayLong, STATUS_LABEL } from "../lib/dates";

export default function PatientDashboard() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!session) return;
    load();
  }, [session]);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchMySessions(session.user.id);
      setSessions(rows);
    } finally {
      setLoading(false);
    }
  }

  const completedOrConfirmed = sessions.filter((s) => s.status !== "declined");
  const upcoming = sessions.filter((s) => s.status === "pending" || s.status === "confirmed");
  const past = sessions.filter((s) => s.status === "completed" || s.status === "declined");

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
              <b>{profile?.full_name || "Your"} sessions</b>
              <span>{session?.user?.email}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="cs-admin-stat">
            <b>{completedOrConfirmed.length}</b>
            <span>Total sessions</span>
          </div>
          <button className="cs-btn cs-btn-ghost" onClick={handleLogout}>
            Log out
          </button>
          <button className="cs-btn cs-btn-amber" onClick={() => setShowBooking(true)}>
            Book a session
          </button>
        </div>
      </div>

      {loading && <p className="cs-admin-empty">Loading your sessions…</p>}

      {!loading && sessions.length === 0 && (
        <div className="cs-req-card" style={{ textAlign: "center", padding: 40 }}>
          <p className="cs-admin-empty" style={{ marginBottom: 16 }}>
            You haven't booked a session yet.
          </p>
          <button className="cs-btn cs-btn-amber" onClick={() => setShowBooking(true)}>
            Book your first session
          </button>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h4 className="cs-admin-section-title">Upcoming</h4>
          {upcoming.map((s) => (
            <SessionCard key={s.id} s={s} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <h4 className="cs-admin-section-title" style={{ marginTop: 28 }}>
            Past sessions
          </h4>
          {past.map((s) => (
            <SessionCard key={s.id} s={s} />
          ))}
        </>
      )}

      {showBooking && <BookingModal onClose={() => { setShowBooking(false); load(); }} />}
    </div>
  );
}

function SessionCard({ s }) {
  return (
    <div className="cs-req-card">
      <div className="cs-req-top">
        <div>
          <b>{fmtDayLong(s.session_date)}</b>
          <span className={`cs-type-pill ${s.type}`}>{s.type === "urgent" ? "Urgent" : "Regular"}</span>
        </div>
        <span className={`cs-status-pill ${s.status}`}>{STATUS_LABEL[s.status]}</span>
      </div>
      <div className="cs-req-meta">
        <Clock size={12} style={{ verticalAlign: "-1px", marginRight: 5 }} />
        {s.time_slot} · ₹{s.amount.toLocaleString("en-IN")}
      </div>
      {s.client_notes && <div className="cs-req-notes">Your note: "{s.client_notes}"</div>}
      {s.shared_notes && (
        <div className="cs-shared-note">
          <MessageSquareText size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {s.shared_notes}
        </div>
      )}
    </div>
  );
}