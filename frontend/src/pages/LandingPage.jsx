import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { landingPageStyles as s } from "../assets/dummyStyles";
import { PageBackdrop } from "../assets/ui";

import {
  ArrowRight,
  ArrowUp,
  Code2,
  Globe,
  Layers,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className={s.container}>
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Footer/>
    </div>
  );
};

export default LandingPage;

/* =========================
   HERO SECTION
========================= */

function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAuthed = Boolean(user);
  const [prompt, setPrompt] = useState("");

  const handleCreate = () => {
    const trimmed = prompt.trim();

    if (isAuthed) {
      navigate(
        trimmed
          ? `/dashboard?prompt=${encodeURIComponent(trimmed)}`
          : "/dashboard"
      );
    } else {
      navigate("/register");
    }
  };

  return (
    <section className={s.heroSection}>
      <PageBackdrop grid />

      <div className={s.heroInner}>
        {/* Trial Badge */}
        <button
          type="button"
          onClick={() => navigate("/pricing")}
          className={s.trialBadge}
        >
          <span className={s.trialBadgeNew}>NEW</span>

          <span className={s.trialBadgeText}>
            Try 30 days free trial
          </span>
        </button>

        {/* Hero Title */}
        <h1 className={s.heroTitle}>
          Turn thoughts into websites
          <br />
          instantly, with{" "}
          <span className={s.heroTitleHighlight}>AI</span>
        </h1>

        {/* Hero Subtitle */}
        <p className={s.heroSub}>
          Create, customise and publish websites faster than ever
          with the mintsite site builder.
        </p>

        {/* AI Prompt Box */}
        <div className={s.heroInputWrapper}>
          <div
            className={s.heroInputGlow}
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #ff8a4c 0deg, transparent 70deg, transparent 290deg, #ff5c5c 360deg)",
            }}
          />

          <div className={s.heroInputBox}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              rows={3}
              placeholder="Describe your website in detail..."
              className={s.heroTextarea}
            />

            <div className={s.heroInputFooter}>
              <div className={s.heroInputHint}>
                <Sparkles className={s.heroInputHintIcon} />
                <span>Powered by mintsite</span>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className={s.heroCreateButton}
              >
                Create with AI
                <ArrowUp className={s.heroCreateButtonIcon} />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className={s.heroTrust}>
          <p className={s.heroTrustLabel}>
            Trusted by builders shipping with
          </p>

          <div className={s.heroTrustLogos}>
            <span className={s.heroTrustItem}>
              <span
                className={`${s.heroTrustDot} bg-rose-400`}
              />
              React
            </span>

            <span className={s.heroTrustItem}>
              <span
                className={`${s.heroTrustDot} bg-orange-400`}
              />
              Tailwind
            </span>

            <span className={s.heroTrustItem}>
              <span
                className={`${s.heroTrustDot} bg-amber-400`}
              />
              Gemini
            </span>

            <span className={s.heroTrustItem}>
              <span
                className={`${s.heroTrustDot} bg-cyan-400`}
              />
              MongoDB
            </span>

            <span className={s.heroTrustItem}>
              <span
                className={`${s.heroTrustDot} bg-violet-400`}
              />
              Stripe
            </span>

            <span className={s.heroTrustItem}>
              <span
                className={`${s.heroTrustDot} bg-emerald-400`}
              />
              GitHub
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   FEATURES DATA
========================= */

const features = [
  {
    icon: Zap,
    title: "Generate in seconds",
    desc: "Describe what you want and get a finished, working site in under three seconds.",
    tint: "from-orange-400/30 to-red-400/10",
    color: "text-orange-300",
  },
  {
    icon: Wand2,
    title: "Refine by chatting",
    desc: "Iterate on copy, sections and styling with plain-English requests. No design skills required.",
    tint: "from-violet-400/30 to-fuchsia-400/10",
    color: "text-violet-300",
  },
  {
    icon: Globe,
    title: "Publish in one click",
    desc: "Deploy to a free mintsite.app subdomain or bring your own domain when you're ready.",
    tint: "from-cyan-400/30 to-sky-400/10",
    color: "text-cyan-300",
  },
  {
    icon: Code2,
    title: "Own your code",
    desc: "Export production-ready HTML and CSS anytime. No lock-in, no proprietary file formats.",
    tint: "from-emerald-400/30 to-teal-400/10",
    color: "text-emerald-300",
  },
  {
    icon: Layers,
    title: "Component library",
    desc: "Reusable hero, pricing, and feature blocks that always stay visually consistent.",
    tint: "from-amber-400/30 to-yellow-400/10",
    color: "text-amber-300",
  },
  {
    icon: Shield,
    title: "Built-in best practices",
    desc: "Accessible, responsive, and SEO-ready output that scores top marks on Lighthouse.",
    tint: "from-pink-400/30 to-rose-400/10",
    color: "text-pink-300",
  },
];

/* =========================
   FEATURES SECTION
========================= */

function Features() {
  return (
    <section className={s.featuresSection}>
      <div className={s.featuresInner}>
        {/* Header */}
        <div className={s.featuresHeader}>
          <p className={s.featuresBadge}>Features</p>

          <h2 className={s.featureTitle}>
            Everything you need to{" "}
            <span className={s.featuresTitleHighlight}>Ship</span>
          </h2>

          <p className={s.featuresSub}>
            A complete toolkit for designing, refining, and publishing
            modern websites - without leaving your browser.
          </p>
        </div>

        {/* Cards */}
        <div className={s.featuresGrid}>
          {features.map(
            ({ icon: Icon, title, desc, tint, color }) => (
              <div
                key={title}
                className={s.featureCard}
              >
                <div
                  className={`${s.featureIconWrapper} bg-gradient-to-br ${tint}`}
                >
                  <Icon
                    className={`${s.featureIcon} ${color}`}
                  />
                </div>

                <h3 className={s.featureTitle}>
                  {title}
                </h3>

                <p className={s.featureDesc}>
                  {desc}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================
   CTA SECTION
========================= */

function CTA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthed= Boolean(user);
  const ctaHref=isAuthed ? "dashboard":"/register";
  const ctaText =isAuthed ? "Start a new site ":"Create  your first site "

  return (
    <section className={s.ctaSection}>
      <div className={s.ctaBg}  style={s.ctaBgStyle}/>
          <div className={s.ctaInner}>
            <div className={s.ctaFreeBadge}>
              <Sparkles className={s.ctaFreeBadgeIcon}/> 20 free credits on singup

            </div>
            <h2 className={s.ctaTitle}>
              Stop wireframing
              <br/>
              Start{" "}
              <span className={s.ctaTitleHighlight}>shipping</span>
            </h2>
            <p className={s.ctaSub}>
              Your first 20 credits are on us - enough for 4 new sites or 10 changes.No card required.

            </p>
            <button onClick={()=> navigate(ctaHref)} className={s.ctaButton}>
              {ctaText}<ArrowRight className={s.ctaButton}/>

            </button>

      </div>
    </section>
  );
}