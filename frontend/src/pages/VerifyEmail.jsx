import React, { useState } from "react";
import { verifyEmailPageStyles as s } from "../assets/dummyStyles";
import { useNavigate, useSearchParams } from "react-router-dom";

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyEmail = () => {
  const navigate = useNavigate();

  const [params] = useSearchParams();

  const email = (params.get("email") || "").toLowerCase();

  const [otp, setOtp] = useState("");
  const [error, setErrors] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  return( 
  <div>


  </div>);
};

export default VerifyEmail;