import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, MessageCircle, Youtube, Instagram, LayoutDashboard } from "lucide-react";
import Logo from "../components/Logo";
import SiteNav from "../components/SiteNav";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../lib/auth";

export default function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [pendingType, setPendingType] = useState(null);

  function openBooking(type) {
    setPendingType(type || null);
    if (!session) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    setShowBooking(true);
  }

  return (
    <>
      <SiteNav onBook={() => openBooking(null)} />

      <header className="cs-hero">
        <div className="cs-hero-inner">
          <div>
            <div className="cs-eyebrow">
              <Sparkles size={14} /> Trusted by a community of 14.8K+
            </div>
            <h1>A space to feel clear again.</h1>
            <p className="lead">
              Integrative, trauma-informed counselling for the patterns that keep repeating — in your
              relationships, your habits, your nervous system. Sessions are online, private, and paced to you.
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
            <img src="/logo.png" alt="ClearSpaces — Witnessed Holistic Healing" />
          </div>
        </div>
      </header>

      <section className="cs-section" id="about">
        <div className="cs-container cs-about-grid">
          <div className="cs-portrait">
            <img src="/logo.png" alt="ClearSpaces" />
          </div>
          <div>
            <div className="cs-kicker">About Munira</div>
            <h2 className="cs-h2">Counselling that treats the pattern, not just the moment.</h2>
            <p className="cs-body-text">
              I work with clients navigating trauma, addiction, and the quieter patterns that shape how we
              relate to ourselves and others — anxiety loops, people-pleasing, shutdown, self-sabotage. My
              approach blends REBT, Applied Transactional Analysis, and Polyvagal-informed practice, so
              sessions move between talking, reflection, and body-based regulation depending on what a session
              calls for.
            </p>
            <p className="cs-body-text" style={{ marginTop: 14 }}>
              Every session is held online, one-on-one, with full confidentiality. Whether you're here for the
              first time or coming back after a while — there's no pressure to have the "right" words ready.
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
                t: "Create your account",
                d: "A quick sign-up with your name, phone and email — this is how your session history stays yours across visits.",
              },
              {
                n: "2",
                t: "Pick a slot & pay by QR",
                d: "Choose regular or urgent, pick an open time, then scan the QR code shown at checkout — no card details, no gateway.",
              },
              {
                n: "3",
                t: "Get confirmed",
                d: "Once your payment is verified by the team, your session is confirmed and logged in your dashboard.",
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
                Online counselling sessions with Munira. Confidential, trauma-informed, one session at a time.
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
            <a className="cs-team-link" href="/staff/login">
              <LayoutDashboard size={13} /> Team login
            </a>
          </div>
          <div className="cs-demo-tag">
            Demo build — testimonials and the QR code are placeholders. Booking data is real (Supabase).
          </div>
        </div>
      </footer>

      {showBooking && <BookingModal onClose={() => setShowBooking(false)} initialType={pendingType} />}
    </>
  );
}