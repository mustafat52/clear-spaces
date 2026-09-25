import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";

export default function SiteNav({ onBook }) {
  const { session, isStaff, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <nav className="cs-nav">
      <Link to="/" className="cs-nav-brand" style={{ textDecoration: "none" }}>
        <Logo size={44} />
        <div className="cs-nav-brand-text">
          <b>ClearSpaces</b>
          <span>Munira · Online Counselling</span>
        </div>
      </Link>

      <div className="cs-nav-links">
        <a href="/#about">About</a>
        <a href="/#specialties">Specialties</a>
        <a href="/#fees">Sessions &amp; fees</a>
        <a href="/#how">How it works</a>
        {session && !isStaff && <Link to="/dashboard">My sessions</Link>}
        {isStaff && <Link to="/staff">Staff dashboard</Link>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {session ? (
          <button className="cs-btn cs-btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <Link to="/login" className="cs-btn cs-btn-ghost" style={{ textDecoration: "none" }}>
            Log in
          </Link>
        )}
        <button className="cs-btn cs-btn-amber" onClick={onBook}>
          Book a session
        </button>
        <button className="cs-hamburger" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="cs-mobile-menu">
          <a href="/#about" onClick={() => setOpen(false)}>About</a>
          <a href="/#specialties" onClick={() => setOpen(false)}>Specialties</a>
          <a href="/#fees" onClick={() => setOpen(false)}>Sessions &amp; fees</a>
          <a href="/#how" onClick={() => setOpen(false)}>How it works</a>
          {session && !isStaff && (
            <Link to="/dashboard" onClick={() => setOpen(false)}>My sessions</Link>
          )}
          {isStaff && (
            <Link to="/staff" onClick={() => setOpen(false)}>Staff dashboard</Link>
          )}
          {session ? (
            <button onClick={() => { setOpen(false); handleLogout(); }}>Log out</button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
          )}
        </div>
      )}
    </nav>
  );
}