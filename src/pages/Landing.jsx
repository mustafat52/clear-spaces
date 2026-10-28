import React, { useState, useEffect } from "react";
import { Check, Sparkles, Award, ChevronLeft, ChevronRight, Ghost, Zap, CloudLightning, HelpCircle, HeartCrack, Link2, Users, Briefcase, GraduationCap, ZoomIn, X, Eye, HeartHandshake, Layers, Compass, MessageCircle, Youtube, Instagram, LayoutDashboard } from "lucide-react";
import Logo from "../components/Logo";
import SiteNav from "../components/SiteNav";
import { managerBookingLink, MANAGER_WHATSAPP_DISPLAY } from "../lib/whatsapp";

const COMMON_ISSUES = [
  { t: "Fears", Icon: Ghost },
  { t: "Panic", Icon: Zap },
  { t: "Anxiety", Icon: CloudLightning },
  { t: "Confusion", Icon: HelpCircle },
  { t: "Betrayals", Icon: HeartCrack },
  { t: "Addictions", Icon: Link2 },
  { t: "Dysfunctional Relationships", Icon: Users },
];

const CERTS = [
  {
    img: "/certs/diploma-integrative-counselling.jpg",
    title: "Diploma in Integrative Counselling",
    date: "March 2021",
    desc: "150 hours of training in an integrative approach to counselling skills, theory and practice — Carkhuff's Model, Rational Emotive Behaviour Therapy and Transactional Analysis.",
    featured: true,
  },
  {
    img: "/certs/rebt-counselling.jpg",
    title: "Certificate in Counselling",
    date: "Jan – Mar 2021",
    desc: "Advanced training in Rational Emotive Behaviour Therapy.",
  },
  {
    img: "/certs/applied-transactional-analysis.jpg",
    title: "Certificate in Applied Transactional Analysis",
    date: "Apr – Jun 2020",
    desc: "Training programme in Applied Transactional Analysis.",
  },
  {
    img: "/certs/personal-counselling.jpg",
    title: "Certificate in Personal Counselling",
    date: "Feb – Apr 2020",
    desc: "Training in personal counselling based on Robert Carkhuff's Model of Counselling.",
  },
];

const EXP_POINTS = [
  "Personalised therapy plans for individuals, couples, families, children and teenagers.",
  "Psychotherapy drawing on cognitive-behavioural, client-centred and play-therapy approaches.",
  "Trauma work using imagery and relaxation techniques to build strengthening and safe zones.",
  "Support with anxiety, depression, anger, relationship issues, substance abuse and career concerns.",
  "Workshops, presentations and outreach programmes that support personal growth and wellbeing.",
  "Over 10 years of nutrition and wellness guidance alongside counselling.",
];

const EXP_SKILLS = [
  "Trauma & PTSD",
  "Crisis counselling",
  "Family counselling",
  "Relationship issues",
  "Anxiety support",
  "Mindfulness-based therapy",
  "Emotion-focused therapy",
  "Behaviour analysis",
  "Relaxation techniques",
  "Nutrition & wellness",
];

export default function Landing() {
  const [cert, setCert] = useState(null);
  const [activeCert, setActiveCert] = useState(0);

  useEffect(() => {
    if (!cert) return;
    const onKey = (e) => e.key === "Escape" && setCert(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cert]);

  return (
    <>
      <SiteNav />

      <header className="cs-hero">
        <div className="cs-hero-inner">
          <div>
            <div className="cs-eyebrow-row">
              <div className="cs-eyebrow">
                <Sparkles size={14} /> Trusted by a community of 14.9K+
              </div>
              <div className="cs-eyebrow cs-eyebrow-amber">
                <Award size={14} /> 1500+ cases handled
              </div>
            </div>
            <h1>A space to feel clear again.</h1>
            <p className="lead">
              Integrative, trauma-informed counselling for the patterns that keep repeating — in your
              relationships, your habits, your nervous system. Sessions are online, private, and paced to you.
            </p>
            <div className="cs-hero-ctas">
              <a
                className="cs-btn cs-btn-amber"
                href={managerBookingLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={17} /> Book on WhatsApp
              </a>
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
            <img src="/munira.png" alt="Munira Shakir, Clearspaces" />
          </div>
        </div>
      </header>

      <section className="cs-section" id="about">
        <div className="cs-container cs-about-grid">
          <div className="cs-portrait">
            <img src="/logo.png" alt="Clearspaces" />
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
                <b>1500+</b>
                <span>Cases handled</span>
              </div>
              <div className="cs-stat">
                <b>14.9K</b>
                <span>Followers on Instagram</span>
              </div>
              <div className="cs-stat">
                <b>354</b>
                <span>Posts &amp; resources shared</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section cs-witness" id="witnessed">
        <div className="cs-container">
          <div className="cs-witness-head">
            <div className="cs-kicker">Our approach</div>
            <h2 className="cs-h2">Witnessed Holistic Healing</h2>
            <p className="cs-witness-lead">At Clearspaces, we see the person behind the problem.</p>
          </div>

          <div className="cs-witness-intro">
            <div className="cs-witness-eye">
              <Eye size={26} />
            </div>
            <p>
              We believe that every behaviour has a story, and every emotional struggle has a deeper context.
              At Clearspaces, our approach to therapy begins with one essential act: witnessing the person.
              We believe that healing begins when a person feels genuinely seen, heard, and understood, not
              judged by their behaviours, defined by their struggles, or reduced to a diagnosis.
            </p>
          </div>

          <div className="cs-witness-cards">
            <div className="cs-witness-card">
              <div className="cs-witness-icon"><Layers size={20} /></div>
              <p>
                Rather than focusing only on your symptoms, we explore what may lie beneath them. By
                understanding how your past experiences influence your present emotions, relationships, and
                responses, we begin to make sense of your struggles.
              </p>
            </div>
            <div className="cs-witness-card">
              <div className="cs-witness-icon"><HeartHandshake size={20} /></div>
              <p>
                Using a holistic, trauma-informed approach, we integrate nervous system regulation, childhood
                emotional healing, and parts work to help you develop deeper self-understanding and healthier
                ways of coping.
              </p>
              <div className="cs-witness-tags">
                <span>Nervous system regulation</span>
                <span>Childhood emotional healing</span>
                <span>Parts work</span>
              </div>
            </div>
            <div className="cs-witness-card">
              <div className="cs-witness-icon"><Compass size={20} /></div>
              <p>
                Every individual is unique, and so is their healing journey. We create a tailor-made therapy
                plan based on your experiences, needs, and pace.
              </p>
            </div>
          </div>

          <div className="cs-witness-ask">
            <div className="cs-witness-ask-side cs-ask-no">
              <small>We don&rsquo;t begin by asking</small>
              <p>&ldquo;What&rsquo;s wrong with you?&rdquo;</p>
            </div>
            <div className="cs-witness-ask-side cs-ask-yes">
              <small>We begin by asking</small>
              <p>&ldquo;What have you been through, and what do you need to heal?&rdquo;</p>
            </div>
          </div>

          <div className="cs-witness-close">
            <blockquote>Because healing begins when you feel seen, heard, and understood.</blockquote>
            <span>Clearspaces &mdash; A space to understand yourself, heal, and grow.</span>
          </div>
        </div>
      </section>

      <section className="cs-section cs-issues" id="issues">
        <div className="cs-container">
          <div className="cs-issues-head">
            <div className="cs-kicker">Why people reach out</div>
            <h2 className="cs-h2">The most common issues people come to Munira with</h2>
          </div>
          <div className="cs-issues-grid">
            {COMMON_ISSUES.map(({ t, Icon }) => (
              <div className="cs-issue" key={t}>
                <div className="cs-issue-icon">
                  <Icon size={22} />
                </div>
                <b>{t}</b>
              </div>
            ))}
            <div className="cs-issue cs-issue-note">
              <p>Whatever brings you here, you don&rsquo;t need the right words to begin.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-soft" id="specialties">
        <div className="cs-container">
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

      <section className="cs-section" id="experience">
        <div className="cs-container">
          <div className="cs-kicker">Experience &amp; credentials</div>
          <h2 className="cs-h2">Trained, certified and practising since 2021</h2>
          <p className="cs-body-text" style={{ marginBottom: 34 }}>
            Munira Shakir is a clinical psychologist and integrative counsellor based in Secunderabad, with
            formal training in psychology and counselling from the Institute of Human Technology and a
            background in nutrition and wellness.
          </p>

          <div className="cs-exp-grid">
            <div className="cs-exp-card">
              <div className="cs-exp-card-head">
                <div className="cs-exp-icon"><Briefcase size={20} /></div>
                <div>
                  <small>Jan 2021 &ndash; Present</small>
                  <h3>Integrative Counsellor</h3>
                  <span>Clearspaces, Secunderabad, India</span>
                </div>
              </div>
              <ul className="cs-exp-list">
                {EXP_POINTS.map((t) => (
                  <li key={t}>
                    <Check size={15} color="#0146c7" /> <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="cs-exp-skills">
                {EXP_SKILLS.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="cs-exp-card">
              <div className="cs-exp-card-head">
                <div className="cs-exp-icon"><GraduationCap size={20} /></div>
                <div>
                  <small>Education</small>
                  <h3>Qualifications</h3>
                </div>
              </div>
              <div className="cs-timeline">
                {[
                  {
                    d: "Mar 2021",
                    t: "Specialist in Psychology",
                    s: "Clinical Psychology",
                    o: "Institute of Human Technology, Mumbai",
                  },
                  {
                    d: "Mar 2021",
                    t: "Integrative Counselling",
                    s: "Counselling Psychology",
                    o: "Institute of Human Technology, Mumbai",
                  },
                  {
                    d: "Aug 2010",
                    t: "Principles of Nutrition",
                    s: "Nutrition Sciences",
                    o: "Nutrilite Health Institute, California, USA",
                  },
                ].map((e) => (
                  <div className="cs-timeline-item" key={e.t}>
                    <i />
                    <small>{e.d}</small>
                    <b>{e.t}</b>
                    <span>
                      {e.s} &middot; {e.o}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cs-certs-head">
            <div className="cs-kicker">Certifications</div>
            <h3 className="cs-certs-title">Verified training, on record</h3>
            <p className="cs-body-text">
              Issued by the Institute of Human Technology &mdash; Heart to Heart Counselling Centre, India.
              Select a certificate to view it, or tap it to open full size.
            </p>
          </div>

          <div className="cs-showcase">
            <div className="cs-stage">
              <button
                type="button"
                className="cs-stage-nav prev"
                aria-label="Previous certificate"
                onClick={() => setActiveCert((activeCert + CERTS.length - 1) % CERTS.length)}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="cs-stage-paper"
                onClick={() => setCert(CERTS[activeCert])}
                aria-label={"View " + CERTS[activeCert].title + " full size"}
              >
                <img
                  key={CERTS[activeCert].img}
                  src={CERTS[activeCert].img}
                  alt={CERTS[activeCert].title}
                  className={CERTS[activeCert].featured ? "portrait" : ""}
                />
                <span className="cs-cert-zoom"><ZoomIn size={16} /> View full size</span>
              </button>
              <button
                type="button"
                className="cs-stage-nav next"
                aria-label="Next certificate"
                onClick={() => setActiveCert((activeCert + 1) % CERTS.length)}
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="cs-cert-side">
              <div className="cs-cert-detail">
                <small><Award size={13} /> {CERTS[activeCert].date}</small>
                <h4>{CERTS[activeCert].title}</h4>
                <p>{CERTS[activeCert].desc}</p>
                <span className="cs-cert-issuer">Institute of Human Technology, India</span>
              </div>
              <div className="cs-cert-list">
                {CERTS.map((c, i) => (
                  <button
                    type="button"
                    key={c.title}
                    className={"cs-cert-item" + (i === activeCert ? " active" : "")}
                    onClick={() => setActiveCert(i)}
                  >
                    <img src={c.img} alt="" loading="lazy" />
                    <span>
                      <b>{c.title}</b>
                      <em>{c.date}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-soft" id="fees">
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
          <a
            className="cs-btn cs-btn-amber"
            style={{ marginTop: 24 }}
            href={managerBookingLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} /> Book on WhatsApp
          </a>
        </div>
      </section>

      <section className="cs-section" id="book">
        <div className="cs-container">
          <div className="cs-book">
            <div className="cs-book-icon">
              <MessageCircle size={30} />
            </div>
            <div className="cs-book-text">
              <div className="cs-kicker">Book a session</div>
              <h2 className="cs-h2">Appointments are arranged personally, over WhatsApp</h2>
              <p className="cs-body-text">
                Message Munira&rsquo;s manager to choose a time that suits you. They&rsquo;ll confirm your
                slot and guide you through the next steps.
              </p>
            </div>
            <a
              className="cs-btn cs-btn-wa"
              href={managerBookingLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
              <small>{MANAGER_WHATSAPP_DISPLAY}</small>
            </a>
          </div>
        </div>
      </section>

      <section className="cs-section cs-section-soft">
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
                  <b style={{ color: "#fff" }}>Clearspaces</b>
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
              <a href={managerBookingLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle size={19} />
              </a>
            </div>
          </div>
          <div className="cs-footer-bottom">
            <span>© {new Date().getFullYear()} Clearspaces. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {cert && (
        <div className="cs-lightbox" onClick={() => setCert(null)} role="dialog" aria-modal="true">
          <button type="button" className="cs-lightbox-close" aria-label="Close" onClick={() => setCert(null)}>
            <X size={22} />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={cert.img} alt={cert.title} />
            <figcaption>{cert.title} &middot; {cert.date}</figcaption>
          </figure>
        </div>
      )}

    </>
  );
}