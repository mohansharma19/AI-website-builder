import { Router } from "express";
import { User } from "../models/User.js";
import {
    generateOtp,
    peekOtp,
    saveOtp,
    sendOtpEmail,
    verifyOtp
} from "../utils/services.js";

const router = Router();

// Forgot password - step 1: request OTP
router.post("/request", async (req, res, next) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "No account found with that email."
            });
        }

        const code = generateOtp();

        saveOtp(email, code);

        await sendOtpEmail({
            to: user.email,
            name: user.name,
            code
        });

        return res.json({
            ok: true,
            email: user.email
        });

    } catch (err) {
        console.error("FORGOT PASSWORD REQUEST ERROR:", err);
        next(err);
    }
});


// Forgot password - step 2: verify OTP
router.post("/verify-code", async (req, res, next) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const code = String(req.body.code || "")
            .trim();

        if (!email || !code) {
            return res.status(400).json({
                error: "Email and code are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "No account found with that email."
            });
        }

        const result = peekOtp(email, code);

        if (!result.ok) {
            return res.status(400).json({
                error: result.reason
            });
        }

        return res.json({
            ok: true
        });

    } catch (err) {
        console.error("FORGOT PASSWORD VERIFY ERROR:", err);
        next(err);
    }
});


// Forgot password - step 3: reset password
router.post("/reset", async (req, res, next) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const code = String(req.body.code || "")
            .trim();

        const newPassword = String(req.body.newPassword || "");

        if (!email || !code) {
            return res.status(400).json({
                error: "Email and code are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: "New Password must be at least 6 characters."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "No account found with that email."
            });
        }

        const result = verifyOtp(email, code);

        if (!result.ok) {
            return res.status(400).json({
                error: result.reason
            });
        }

        // Update password
        user.passwordHash = await User.hashPassword(newPassword);

        // OTP verification also verifies the email
        user.emailVerified = true;

        await user.save();

        return res.json({
            ok: true
        });

    } catch (err) {
        console.error("FORGOT PASSWORD RESET ERROR:", err);
        next(err);
    }
});

export default router;