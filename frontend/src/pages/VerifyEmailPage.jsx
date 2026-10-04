
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { verifyEmailPageStyles as s } from "../assets/dummyStyles";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiError, registerResend, registerVerify } from "../utils/api";
import { CheckCircle2, Mail } from "lucide-react";
import AuthShell from "../components/AuthShell";

const RESEND_COOLDOWN_SECONDS = 60;

const Input = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      placeholder,
      inputMode,
      autoComplete,
      maxLength,
      error,
      className,
    },
    ref
  ) => {
    return (
      <div>
        <label htmlFor={name} className={s.label}>
          {label}
        </label>

        <input
          ref={ref}
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={className}
        />

        {error && <p className={s.error}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = (params.get("email") || "").toLowerCase();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const otpRef = useRef(null);

  useEffect(() => {
    otpRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const t = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  async function handleVerify(e) {
    e?.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code");
      return;
    }

    setLoading(true);

    try {
      await registerVerify(email, otp);

      setVerified(true);

      setTimeout(() => {
        navigate(
          `/login?email=${encodeURIComponent(email)}&verified=1`,
          {
            replace: true,
          }
        );
      }, 1400);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;

    setError("");
    setResending(true);

    try {
      await registerResend(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <AuthShell title="Verified" subtitle="">
        <div className={s.verifiedContainer}>
          <div className={s.verifiedIconWrapper}>
            <CheckCircle2 className={s.verifiedIcon} />
          </div>

          <p className={s.verifiedTitle}>Email verified</p>

          <p className={s.verifiedSub}>
            Taking you to the sign-in page...
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="text-white font-medium">{email}</span>. Enter it
          below to finish creating your account.
        </>
      }
      footer={
        <>
          Wrong email?{" "}
          <Link to="/register" className={s.signUpLink}>
            Sign up again
          </Link>
        </>
      }
    >
      <form onSubmit={handleVerify} className={s.form}>
        <Input
          ref={otpRef}
          label="Verification code"
          name="otp"
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(v);
            setError("");
          }}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          error={error}
          className={s.otpInput}
        />

        <button
          type="submit"
          className={s.submitButton}
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>

        <div className={s.resendRow}>
          <span className={s.resendLeft}>
            <Mail className={s.resendIcon} />

            Didn't get it

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className={s.resendButton}
            >
              {resending
                ? "Sending..."
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
            </button>
          </span>
        </div>
      </form>
    </AuthShell>
  );
};

export default VerifyEmailPage;
