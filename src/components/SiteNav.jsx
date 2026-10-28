import React, { useState } from "react";
import { Menu, X, Instagram, MessageCircle } from "lucide-react";
import { managerBookingLink } from "../lib/whatsapp";
import Logo from "./Logo";

const INSTAGRAM_URL = "https://www.instagram.com/counsellor__munira/";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="cs-nav">
      <a href="#" className="cs-nav-brand" style={{ textDecoration: "none" }}>
        <Logo size={44} />
        <div className="cs-nav-brand-text">
          <b>Clearspaces</b>
          <span>Munira · Online Counselling</span>
        </div>
      </a>

      <div className="cs-nav-links">
        <a href="#about">About</a>
        <a href="#specialties">Specialties</a>
        <a href="#experience">Experience</a>
        <a href="#fees">Sessions &amp; fees</a>
        <a href="#book">Book a session</a>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Clearspaces on Instagram"
          className="cs-nav-insta"
        >
          <Instagram size={19} />
        </a>
        <a
          className="cs-btn cs-btn-amber cs-nav-wa"
          href={managerBookingLink()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} /> Book on WhatsApp
        </a>
        <button className="cs-hamburger" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="cs-mobile-menu">
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#specialties" onClick={() => setOpen(false)}>Specialties</a>
          <a href="#experience" onClick={() => setOpen(false)}>Experience</a>
          <a href="#fees" onClick={() => setOpen(false)}>Sessions &amp; fees</a>
          <a href="#book" onClick={() => setOpen(false)}>Book a session</a>
          <a href={managerBookingLink()} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <MessageCircle size={16} style={{ verticalAlign: "-3px", marginRight: 8 }} />
            Book on WhatsApp
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <Instagram size={16} style={{ verticalAlign: "-3px", marginRight: 8 }} />
            Instagram
          </a>
        </div>
      )}
    </nav>
  );
}