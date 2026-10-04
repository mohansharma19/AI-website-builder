
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerPageStyles as s } from "../assets/dummyStyles";
import AuthShell from "../components/AuthShell";
import { apiError, register } from "../utils/api";

const RegisterPages = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // for change
  function update(field) {
    return (e) => {
      setForm((f) => ({
        ...f,
        [field]: e.target.value,
      }));

      setErrors((er) => ({
        ...er,
        [field]: undefined,
      }));

      setSubmitError("");
    };
  }

  // to submit the data to the server and send OTP
  async function handleSubmit(e) {
    e.preventDefault();

    const er = {};

    if (form.name.trim().length < 2) {
      er.name = "Enter your name";
    }

    if (!form.email.includes("@")) {
      er.email = "Enter a valid email";
    }

    if (form.password.length < 6) {
      er.password = "At least 6 characters";
    }

    setErrors(er);

    if (Object.keys(er).length) {
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      console.log("REGISTER DATA:", form);

      const result = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      console.log("REGISTER RESPONSE:", result);

      const params = new URLSearchParams({
        email: result.email,
      });

      navigate(`/verify-email?${params.toString()}`);
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      console.log("REGISTER RESPONSE ERROR:", err.response?.data);

      setSubmitError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Enter your information to create an account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className={s.signInLink}>
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={s.form}>
        <Input
          label="Name"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={update("name")}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          autoComplete="new-password"
        />

        {submitError && (
          <p className={s.submitError}>{submitError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={s.submitButton}
        >
          {loading ? "Sending code..." : "Send verification code"}
        </button>

        <div className={s.infoBox}>
          <div className={s.infoRow}>
            <span className={s.infoDotIndigo}></span>
            We'll email you a 6-digit code. Enter it to verify, then sign in.
          </div>

          <div className={s.infoRow}>
            <span className={s.infoDotEmerald}></span>
            You get{" "}
            <span className={s.infoHighlight}>20 free credits</span> on first
            login.
          </div>
        </div>
      </form>
    </AuthShell>
  );
};

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}) => {
  return (
    <div>
      <label htmlFor={name} className={s.label}>
        {label} :
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={s.input}
      />

      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default RegisterPages;
