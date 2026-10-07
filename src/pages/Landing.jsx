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

  function openBooking() {
    if (!session) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    setShowBooking(true);
  }

  return (
    <>
      <SiteNav onBook={openBooking} />

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
              <button className="cs-btn cs-btn-amber" onClick={openBooking}>
                Book a session
              </button>
              <a href="#fees" className="cs-btn cs-btn-ghost-light">
                See pricing
              </a>
            </div>
            <div className="cs-hero-credentials">
              <span>Integrative Counselling</span>
              <span>Trauma &amp; Addiction</span>
              <span>Marriage &amp; Couple</span>
              <span>Children &amp; Teenage</span>
              <span>Family &amp; Relationship</span>
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
              I work with individuals, couples, and families navigating trauma, addiction, and the quieter
              patterns that shape how we relate to ourselves and each other — anxiety loops, people-pleasing,
              shutdown, self-sabotage. Whether it's a marriage finding its footing again, a teenager working
              through something hard to put into words, or a family untangling old patterns, sessions are
              paced to what that moment actually calls for.
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
                <span>Areas of focus</span>
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
              t: "Marriage & couple counselling",
              d: "A space for partners to be heard without it turning into a courtroom — working through conflict, trust, and distance together.",
            },
            {
              t: "Children & teenage counselling",
              d: "Age-appropriate support for younger clients navigating big feelings, school pressure, identity, or change at home.",
            },
            {
              t: "Family & relationship counselling",
              d: "Untangling long-standing roles and dynamics within a family, so old patterns stop repeating themselves.",
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
          <h2 className="cs-h2">One simple rule: the sooner you need it, the more it costs</h2>
          <p className="cs-body-text" style={{ marginBottom: 28 }}>
            Every session is 50 minutes with Munira. Price is set automatically by how far out your chosen
            date is — book further ahead and it costs less.
          </p>
          <div className="cs-fee-grid cs-fee-grid-3">
            <div className="cs-fee-card urgent">
              <div>Urgent</div>
              <div className="price">₹4,500</div>
              <div className="cs-fee-sub">Within the next 10 days</div>
              <ul>
                <li>
                  <Check size={15} color="#fcc85e" /> For when things feel like they can't wait
                </li>
                <li>
                  <Check size={15} color="#fcc85e" /> Reviewed by the team in real time
                </li>
              </ul>
            </div>
            <div className="cs-fee-card">
              <div>Priority</div>
              <div className="price">₹2,500</div>
              <div className="cs-fee-sub">11–25 days out</div>
              <ul>
                <li>
                  <Check size={15} color="#0146c7" /> A good middle ground for planning ahead
                </li>
                <li>
                  <Check size={15} color="#0146c7" /> Still gets priority scheduling attention
                </li>
              </ul>
            </div>
            <div className="cs-fee-card">
              <div>Standard</div>
              <div className="price">₹1,500</div>
              <div className="cs-fee-sub">26+ days out</div>
              <ul>
                <li>
                  <Check size={15} color="#0146c7" /> The most affordable way to book
                </li>
                <li>
                  <Check size={15} color="#0146c7" /> Ideal for ongoing, planned sessions
                </li>
              </ul>
            </div>
          </div>
          <button className="cs-btn cs-btn-amber" style={{ marginTop: 24 }} onClick={openBooking}>
            Book a session
          </button>
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
                d: "Pick an open date and time — your price is shown right there — then scan the QR code at checkout. No card details, no gateway.",
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
                q: "Therapy helped me feel understood and supported. I now handle stress much better.",
                a: "Zainab",
              },
              {
                q: "Counseling gave me the tools to manage my anxiety. I'm much happier now.",
                a: "Shabbir",
              },
              {
                q: "Talking to my psychologist changed my life. I finally feel at peace.",
                a: "Nafisa",
              },
              {
                q: "I learned how to cope with my emotions through therapy. It's made a big difference.",
                a: "Aarti",
              },
              {
                q: "Therapy gave me hope and helped me find my way again.",
                a: "Sarah B.",
              },
            ].map((t) => (
              <div className="cs-quote" key={t.a}>
                <p>{t.q}</p>
                <span>{t.a}</span>
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
              <a href="https://www.instagram.com/counsellor__munira/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
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
            <a className="cs-team-link" href="/manager/login">
              <LayoutDashboard size={13} /> Team login
            </a>
          </div>
          <div className="cs-demo-tag">
            Demo build — booking data is real (Supabase); payment is arranged directly over WhatsApp after
            confirmation.
          </div>
        </div>
      </footer>

      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
    </>
  );
}