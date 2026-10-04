
import { signToken } from "../middleware/auth.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import {
    generateOtp,
    saveOtp,
    sendOtpEmail,
    verifyOtp
} from "../utils/services.js";

// Issue OTP and send it via email
async function issueAndSend(email, name, status, res, code = 201) {
    const otp = generateOtp();

    saveOtp(email, otp);

    await sendOtpEmail({
        to: email,
        name,
        code: otp,
        purpose: status
    });

    return res.status(code).json({
        ok: true,
        email
    });
}

// Register user
export async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (name.length < 2) {
            return res.status(400).json({
                error: "Name must be at least 2 characters"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password length must be at least 6 characters"
            });
        }

        const existing = await User.findOne({ email });

        if (existing) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const passwordHash = await User.hashPassword(password);

        const user = await User.create({
            name,
            email,
            passwordHash,
            emailVerified: false
        });

        return issueAndSend(
            user.email,
            user.name,
            "signup",
            res,
            201
        );

    } catch (error) {
        next(error);
    }
}

// Verify the OTP and make user verified
export async function verifyRegister(req, res, next) {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                error: "Email and code are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "NO account Found with that email."
            });
        }

        if (user.emailVerified) {
            return res.json({
                ok: true,
                alreadyVerified: true
            });
        }

        const result = verifyOtp(email, code);

        if (!result.ok) {
            return res.status(400).json({
                error: result.res
            });
        }

        user.emailVerified = true;

        await user.save();

        return res.json({
            ok: true
        });

    } catch (err) {
        next(err);
    }
}

// to resend the top or if user register but forgot to verify
// we can reverify them
export async function resendRegister(req, res, next) {
    try {
        const email = (req.body.email || "").trim().toLowerCase();

        if (!email)
            return res.status(400).json({
                error: "Email is required."
            });

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                error: "NO account found with that email"
            });

        if (user.emailVerified)
            return res.status(400).json({
                error: "This email is already verified - just sign in"
            });

        return issueAndSend(user.email, user.name, "signup", res, 200);

    } catch (err) {
        next(err);
    }
}

// to login

export async function login(req, res, next) {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and Password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const ok = await user.verifyPassword(password);

        if (!ok) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                error: "Please verify your email first. Check your inbox for the 6-digit code.",
                needsVerification: true,
                email: user.email
            });
        }

        const token = signToken(user._id.toString());

        res.json({
            token,
            user: user.toClient()
        });

    } catch (err) {
        next(err);
    }
}

// to get logged-in user Profile
export function me(req, res) {
    res.json({
        user: req.user.toClient()
    });
}

// to get contibution count
// just like github graph
export async function contributions(req, res, next) {
    try {
        const oneYearAgo = new Date();

        oneYearAgo.setUTCHours(0, 0, 0, 0);
        oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() - 364);

        const projects = await Project.find({
            user: req.user._id,
            "messages.createdAt": {
                $gte: oneYearAgo
            },
        }).select("messages");

        const counts = {};

        const key = (d) =>
            new Date(d).toISOString().slice(0, 10);

        for (const p of projects) {
            for (const m of p.messages || []) {
                if (
                    m.role === "user" &&
                    m.createdAt &&
                    m.createdAt >= oneYearAgo
                ) {
                    const k = key(m.createdAt);
                    counts[k] = (counts[k] || 0) + 1;
                }
            }
        }

        const days = Object.entries(counts)
            .map(([date, count]) => ({
                date,
                count
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const total = days.reduce(
            (s, d) => s + d.count,
            0
        );

        res.json({
            days,
            total,
            from: key(oneYearAgo),
            to: key(new Date())
        });

    } catch (err) {
        next(err);
    }
}

// to update Profile
export async function updateProfile(req, res, next) {
    try {
        const name =
            req.body.name !== undefined
                ? String(req.body.name).trim()
                : undefined;

        if (name === undefined)
            return res.status(400).json({
                error: "Nothing to update"
            });

        if (name.length < 2 || name.length > 32)
            return res.status(400).json({
                error: "Name must be of 2-32 character."
            });

        req.user.name = name;

        await req.user.save();

        res.json({
            user: req.user.toClient()
        });

    } catch (err) {
        next(err);
    }
}

// to change the current Password for logged-in user
export async function changePassword(req, res, next) {
    try {
        const { current, nextPw } = req.body;

        if (!current || !nextPw || nextPw.length < 6)
            return res.status(400).json({
                error: "New Password must be atleast 6 characters."
            });

        const ok = await req.user.verifyPassword(current);

        if (!ok)
            return res.status(400).json({
                error: "Current Password is incorrect "
            });

        req.user.passwordHash =
            await User.hashPassword(nextPw);

        await req.user.save();

        res.json({
            ok: true
        });

    } catch (err) {
        next(err);
    }
}

// to remove the logged-in user's account
export async function deleteAccount(req, res, next) {
    try {
        await Project.deleteMany({ user: req.user._id });
        await req.user.deleteOne();
        res.json({ ok: true });
    }
    catch (err) {
        next(err)
    }
}
