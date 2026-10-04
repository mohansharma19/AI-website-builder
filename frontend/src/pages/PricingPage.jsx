import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  Zap,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  getPackages,
  verifySession,
  apiError,
  createCheckoutSession,
} from "../utils/api";

import { useAuth } from "../context/AuthContext";
import { pricingPageStyles as s } from "../assets/dummyStyles";

const faqs = [
  {
    q: "What's a credit?",
    a: "One credit = one AI generation. New sites cost 5, iterations cost 2.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits you buy stay on your account forever. The 20 free signup credits also never expire.",
  },
  {
    q: "Do I need a subscription?",
    a: "No subscription, no auto-renewal. Buy a one-time pack when you need more credits. Pay only for what you use.",
  },
  {
    q: "What payment methods work?",
    a: "All major debit / credit cards (Visa, Mastercard, Amex) — handled by Stripe's secure hosted checkout.",
  },
  {
    q: "Do you offer refunds?",
    a: "Unused credits are refundable within 14 days of purchase — just email us. Already-used credits aren't refundable.",
  },
  {
    q: "What if a generation fails?",
    a: "If the AI falls back to a template (provider error, quota exhausted, etc.) we don't charge any credits. You only pay for successful generations.",
  },
];

/* =========================
   DEFAULT PACKAGES
========================= */

const DEFAULT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for trying the AI builder",
    credits: 50,
    amount: 499,
    currency: "usd",
    perCredit: "$0.10",
    highlighted: false,
  },
  {
    id: "popular",
    name: "Popular",
    tagline: "For creators building multiple projects",
    credits: 200,
    amount: 1499,
    currency: "usd",
    perCredit: "$0.07",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For serious builders and frequent use",
    credits: 500,
    amount: 2999,
    currency: "usd",
    perCredit: "$0.06",
    highlighted: false,
  },
];

/* =========================
   STRIPE RETURN BANNER
========================= */

function StripeReturnBanner() {
  const [params, setParams] = useSearchParams();

  const sessionId = params.get("session_id");
  const cancelled = params.get("cancelled");

  const { setUser } = useAuth();

  const [status, setStatus] = useState(
    sessionId
      ? "verifying"
      : cancelled
        ? "cancelled"
        : "idle"
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

    verifySession(sessionId)
      .then((response) => {
        if (!mounted) return;

        if (response?.user) {
          setUser(response.user);
        }

        setResult(response);
        setStatus("success");
      })
      .catch((err) => {
        if (!mounted) return;

        setError(apiError(err));
        setStatus("error");
      })
      .finally(() => {
        if (!mounted) return;

        const next = new URLSearchParams(params);

        next.delete("session_id");
        next.delete("cancelled");

        setParams(next, {
          replace: true,
        });
      });

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  if (status === "idle") {
    return null;
  }

  const banner = {
    cancelled: {
      className: `${s.bannerBase} ${s.bannerCancelled}`,
      icon: <AlertTriangle className={s.bannerIcon} />,
      body: "Payment cancelled — no credits were charged.",
    },

    verifying: {
      className: `${s.bannerBase} ${s.bannerVerifying}`,
      icon: <Loader2 className={s.bannerIcon} />,
      body: "Verifying your payment with Stripe…",
    },

    error: {
      className: `${s.bannerBase} ${s.bannerError}`,
      icon: <AlertTriangle className={s.bannerIcon} />,
      body: (
        <>
          Couldn't verify the payment: {error}. If you were charged,
          refresh — the webhook usually credits you within a minute.
        </>
      ),
    },

    success: {
      className: `${s.bannerBase} ${s.bannerSuccess}`,
      icon: (
        <CheckCircle2 className={s.bannerIconSuccess} />
      ),
      body: (
        <div>
          <p className={s.bannerBodySuccess}>
            Payment received —{" "}
            {result?.creditsAdded || 0} credits added!
          </p>

          <p className={s.bannerBodySuccessSub}>
            Your new balance:{" "}
            {result?.user?.credits ?? "(refresh to see)"} credits.
          </p>
        </div>
      ),
    },
  }[status];

  return (
    <div className={banner.className}>
      {banner.icon}
      {banner.body}
    </div>
  );
}

/* =========================
   PRICING PAGE
========================= */

export default function PricingPage() {
  return (
    <div className={s.container}>
      <Navbar />

      <section className={s.hero}>
        <div
          className={s.heroBg}
          style={s.heroBgStyle}
        />

        <div className={s.heroInner}>
          <p className={s.heroBadge}>
            Pricing
          </p>

          <h1 className={s.heroTitle}>
            Start free.
            <br className={s.heroTitleBr} />
            Pay when you grow.
          </h1>

          <p className={s.heroSub}>
            No credit card to start. Cancel anytime.
            Built to scale with you.
          </p>
        </div>
      </section>

      <StripeReturnBanner />

      <Pricing standalone />

      <section className={s.faqSection}>
        <div className={s.faqContainer}>
          <h2 className={s.faqHeading}>
            Frequently asked questions
          </h2>

          <div className={s.faqList}>
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className={s.faqItem}
              >
                <summary className={s.faqSummary}>
                  {faq.q}

                  <span className={s.faqPlus}>
                    +
                  </span>
                </summary>

                <p className={s.faqAnswer}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* =========================
   STRIPE CHECKOUT
========================= */

function useStripeCheckout() {
  const [purchasingId, setPurchasingId] =
    useState(null);

  const [error, setError] = useState("");

  async function buy(pkg) {
    setError("");
    setPurchasingId(pkg.id);

    try {
      const response =
        await createCheckoutSession(pkg.id);

      const url = response?.url;

      if (!url) {
        throw new Error(
          "Stripe didn't return a checkout URL"
        );
      }

      window.location.assign(url);
    } catch (err) {
      setError(apiError(err));
      setPurchasingId(null);
    }
  }

  return {
    buy,
    purchasingId,
    error,
  };
}

/* =========================
   PRICING SECTION
========================= */

function Pricing({ standalone = false }) {
  const navigate = useNavigate();

  const { user } = useAuth();

  const isAuthed = Boolean(user);

  const {
    buy,
    purchasingId,
    error,
  } = useStripeCheckout();

  const [packages, setPackages] =
    useState(DEFAULT_PACKAGES);

  const [configured, setConfigured] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState(null);

  /* =========================
     LOAD PACKAGES
  ========================= */

  useEffect(() => {
    let mounted = true;

    async function loadPackages() {
      try {
        setLoading(true);
        setLoadError(null);

        const data = await getPackages();

        if (!mounted) return;

        console.log(
          "Pricing API response:",
          data
        );

        /*
         * Backend response:
         *
         * {
         *   packages: [...],
         *   configured: true
         * }
         */

        if (
          data &&
          Array.isArray(data.packages) &&
          data.packages.length > 0
        ) {
          setPackages(data.packages);
        } else if (Array.isArray(data) && data.length > 0) {
          setPackages(data);
        } else {
          /*
           * If backend returns no packages,
           * keep the default pricing cards visible.
           */
          setPackages(DEFAULT_PACKAGES);
        }

        if (
          typeof data?.configured === "boolean"
        ) {
          setConfigured(data.configured);
        }
      } catch (err) {
        if (!mounted) return;

        console.error(
          "Pricing packages error:",
          err
        );

        /*
         * Keep cards visible even if API fails.
         */
        setPackages(DEFAULT_PACKAGES);

        setLoadError(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPackages();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     BUY
  ========================= */

  function handleBuy(pkg) {
    if (!isAuthed) {
      navigate("/register");
      return;
    }

    if (!configured) {
      return;
    }

    buy(pkg);
  }

  const sectionClass = `${s.pricingSection} ${
    !standalone
      ? s.pricingSectionWithBorder
      : ""
  }`;

  return (
    <section className={sectionClass}>
      <div className={s.pricingContainer}>

        {!standalone && (
          <div className={s.pricingHeader}>
            <p className={s.pricingHeaderBadge}>
              Pricing
            </p>

            <h2 className={s.pricingHeaderTitle}>
              Simple. No subscriptions. Just credits.
            </h2>

            <p className={s.pricingHeaderSub}>
              One credit = one AI generation.
              Buy what you need, when you need it.
              Credits never expire.
            </p>
          </div>
        )}

        <FreeBanner
          onCta={() =>
            navigate(
              isAuthed
                ? "/dashboard"
                : "/register"
            )
          }
          authed={isAuthed}
        />

        {!loading && !configured && (
          <div className={s.configWarning}>
            <AlertTriangle
              className={s.configWarningIcon}
            />

            <span>
              <strong
                className={s.configWarningStrong}
              >
                Payments not configured.
              </strong>{" "}
              Set{" "}
              <code
                className={s.configWarningCode}
              >
                STRIPE_SECRET_KEY
              </code>{" "}
              in{" "}
              <code
                className={s.configWarningCode}
              >
                backend/.env
              </code>
              , then restart the backend.
            </span>
          </div>
        )}

        {error && (
          <div className={s.errorBox}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={s.loadingWrapper}>
            <Loader2
              className={s.loadingSpinner}
            />

            Loading packages...
          </div>
        ) : (
          <>
            {/* PRICING CARDS */}

            <div className={s.packageGrid}>
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onBuy={() => handleBuy(pkg)}
                  purchasing={
                    purchasingId === pkg.id
                  }
                  disabled={
                    Boolean(purchasingId) ||
                    (!configured && isAuthed)
                  }
                  authed={isAuthed}
                />
              ))}
            </div>

            {loadError && (
              <div className={s.loadError}>
                Using default pricing packages.
              </div>
            )}
          </>
        )}

        <p className={s.packageFooter}>
          Secure payments by Stripe · One-time purchase
          · Cards accepted worldwide
        </p>
      </div>
    </section>
  );
}

/* =========================
   FREE BANNER
========================= */

function FreeBanner({ onCta, authed }) {
  if (authed) {
    return null;
  }

  return (
    <div className={s.freeBanner}>
      <div className={s.freeBannerLeft}>
        <div className={s.freeBannerIconBox}>
          <Sparkles
            className={s.freeBannerIcon}
          />
        </div>

        <div>
          <p className={s.freeBannerTitle}>
            Get 20 free credits when you sign up
          </p>

          <p className={s.freeBannerSub}>
            No card needed. Try the full builder
            before buying anything.
          </p>
        </div>
      </div>

      <button
        onClick={onCta}
        className={s.freeBannerButton}
      >
        Sign up free
      </button>
    </div>
  );
}

/* =========================
   PRICE FORMAT
========================= */

function formatPrice(pkg) {
  const currency = (
    pkg.currency || "usd"
  ).toUpperCase();

  return new Intl.NumberFormat(
    undefined,
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(
    Number(pkg.amount || 0) / 100
  );
}

/* =========================
   CARD FEATURES
========================= */

const CARD_FEATURES = [
  "Unlimited project edits",
  "Publish to Community",
  "Export HTML",
  "Credits never expire",
];

/* =========================
   PACKAGE CARD
========================= */

function PackageCard({
  pkg,
  onBuy,
  purchasing,
  disabled,
  authed,
}) {
  const price = formatPrice(pkg);

  const buttonLabel = !authed
    ? "Sign up to buy"
    : purchasing
      ? "Processing..."
      : `Buy ${pkg.credits} credits`;

  const isHighlighted =
    Boolean(pkg.highlighted);

  const cardClass = `${s.cardBase} ${
    isHighlighted
      ? s.cardHighlighted
      : s.cardNormal
  }`;

  const buttonClass = `${s.buyButton} ${
    isHighlighted
      ? s.buyButtonHighlighted
      : s.buyButtonNormal
  }`;

  return (
    <div className={cardClass}>

      {isHighlighted && (
        <span className={s.popularBadge}>
          Popular
        </span>
      )}

      <h3 className={s.packageName}>
        {pkg.name}
      </h3>

      <p className={s.packageTagline}>
        {pkg.tagline}
      </p>

      <div className={s.priceRow}>
        <span className={s.price}>
          {price}
        </span>

        <span className={s.priceSuffix}>
          one-time
        </span>
      </div>

      <p className={s.perCredit}>
        {pkg.perCredit} / credit
      </p>

      <ul className={s.featureList}>

        <li className={s.featureItem}>
          <Zap
            className={s.featureIcon}
          />

          <span>
            <span className={s.featureText}>
              {pkg.credits}
            </span>{" "}
            AI generations
          </span>
        </li>

        {CARD_FEATURES.map((feature) => (
          <li
            key={feature}
            className={s.featureItem}
          >
            <Check
              className={s.featureIcon}
            />

            {feature}
          </li>
        ))}

      </ul>

      <button
        onClick={onBuy}
        disabled={
          disabled || purchasing
        }
        className={buttonClass}
      >
        {purchasing && (
          <Loader2
            className={s.buySpinner}
          />
        )}

        {buttonLabel}
      </button>
    </div>
  );
}