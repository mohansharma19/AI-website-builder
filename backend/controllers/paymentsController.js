import { Payment } from "../models/Payment.js";
import {
  createCheckoutSession,
  isStripeConfigured,
  retrieveSession,
  sendOtpEmail,
} from "../utils/services.js";

// credits packages
export const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    amount: 499,
    currency: "usd",
    perCredit: "$0.10",
    tagline: "Try a few new projects",
  },
  {
    id: "popular",
    name: "Popular",
    credits: 200,
    amount: 1499,
    currency: "usd",
    perCredit: "$0.075",
    tagline: "Best for active creators",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    amount: 2999,
    currency: "usd",
    perCredit: "$0.06",
    tagline: "For agencies and power users",
  },
];

// to return list of package and check for stripe setup
export function listPackages(_req, res) {
  res.json({
    package: PACKAGES,
    configured: isStripeConfigured(),
  });
}

// to create a stripe checkout session
export async function createSession(req, res, next) {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        error:
          "Payment aren't configured. Add STRIPE_SECRET_KEY to backend .env",
      });
    }

    const packageId = req.body.packageId;

    if (!packageId) {
      return res.status(400).json({
        error: "PackageId is required.",
      });
    }

    const pkg = PACKAGES.find((p) => p.id === packageId);

    if (!pkg) {
      return res.status(400).json({
        error: "Unknown Package",
      });
    }

    const origin = req.headers.origin || "http://localhost:5173";

    const { id, url } = await createCheckoutSession({
      pkg,
      user: req.user,
      successUrl: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing?cancelled=1`,
    });

    await Payment.create({
      user: req.user._id,
      packageId: pkg.id,
      creditsPurchased: pkg.credits,
      amount: pkg.amount,
      currency: pkg.currency,
      stripeSessionId: id,
      status: "created",
    });

    res.json({
      url,
      sessionId: id,
    });
  } catch (err) {
    next(err);
  }
}

// to verify the session
export async function verifySession(req, res, next) {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        error: "Payments aren't configured.",
      });
    }

    const sessionId = req.body.sessionId;

    if (!sessionId || String(sessionId).length < 5) {
      return res.status(400).json({
        error: "sessionId is required",
      });
    }

    const payment = await Payment.findOne({
      stripeSessionId: sessionId,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    if (payment.status === "paid") {
      return res.json({
        ok: true,
        alreadyCredited: true,
        user: req.user.toClient(),
      });
    }

    const session = await retrieveSession(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        error: "Payment not completed yet",
      });
    }

    payment.stripePaymentIntentId = session.payment_intent;
    payment.status = "paid";

    await payment.save();

    const creditsToAdd = Number(payment.creditsPurchased);

    if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(500).json({
        error: "Invalid creditsPurchased value on payment record.",
      });
    }

    req.user.credits = (req.user.credits || 0) + creditsToAdd;

    await req.user.save();

    res.json({
      ok: true,
      creditsAdded: payment.creditsPurchased,
      user: req.user.toClient(),
    });
  } catch (err) {
    next(err);
  }
}

// to get history of payments
export async function listHistory(req, res, next) {
  try {
    const list = await Payment.find({
      user: req.user._id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      payments: list.map((p) => p.toClient()),
    });
  } catch (err) {
    next(err);
  }
}