import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../api/api";
import { showError, showSuccess } from "../../utils/sweetAlert";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

const REGISTRATION_TOKEN_KEY = "br30_registration_token";
const REGISTRATION_EMAIL_KEY = "br30_registration_email";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const inputRefs = useRef([]);

  const [registrationToken, setRegistrationToken] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));

  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  /* --------------------------------
     LOAD REGISTRATION SESSION
  -------------------------------- */

  useEffect(() => {
    const storedToken = sessionStorage.getItem(REGISTRATION_TOKEN_KEY);
    const storedEmail = sessionStorage.getItem(REGISTRATION_EMAIL_KEY);

    if (!storedToken) {
      showError("Verification Session Missing", "Your registration session is missing or expired. Please register again.").then(() => {
        navigate("/register", { replace: true });
      });

      return;
    }

    setRegistrationToken(storedToken);
    setEmail(storedEmail || "");
  }, [navigate]);

  /* --------------------------------
     OTP EXPIRY COUNTDOWN
  -------------------------------- */

  useEffect(() => {
    if (timeLeft <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* --------------------------------
     RESEND COUNTDOWN
  -------------------------------- */

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* --------------------------------
     FORMAT TIME
  -------------------------------- */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  /* --------------------------------
     OTP INPUT
  -------------------------------- */

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });

      setError("");
      return;
    }

    const digit = numericValue.slice(-1);

    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    setError("");

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* --------------------------------
     BACKSPACE / ARROWS
  -------------------------------- */

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* --------------------------------
     PASTE OTP
  -------------------------------- */

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextOtp = Array(OTP_LENGTH).fill("");

    pastedValue.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    setError("");

    const nextFocusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);

    inputRefs.current[nextFocusIndex]?.focus();
  };

  /* --------------------------------
     VERIFY OTP
  -------------------------------- */

  const handleVerify = async (event) => {
    event.preventDefault();

    const otpValue = otp.join("");

    if (!registrationToken) {
      await showError("Verification Session Missing", "Your registration session is missing. Please register again.");

      navigate("/register", { replace: true });

      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");

      await showError("Incomplete OTP", "Please enter all 6 digits of the OTP.");

      return;
    }

    if (timeLeft <= 0) {
      setError("This OTP has expired. Please request a new OTP.");

      await showError("OTP Expired", "Your OTP has expired. Please request a new OTP.");

      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await verifyEmail({
        registrationToken,
        otp: otpValue,
      });

      if (!response?.success || !response?.accessToken || !response?.user) {
        throw new Error(response?.message || "Email verification failed.");
      }

      sessionStorage.removeItem(REGISTRATION_TOKEN_KEY);
      sessionStorage.removeItem(REGISTRATION_EMAIL_KEY);

      await showSuccess("Email Verified!", "Your BR30 Kadaknath Farms account has been created successfully.");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Email verification failed:", error);

      setError(error?.message || "Invalid or expired OTP. Please try again.");

      await showError("Verification Failed", error?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  /* --------------------------------
     RESEND OTP
  -------------------------------- */

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) {
      return;
    }

    if (!registrationToken) {
      await showError("Verification Session Missing", "Your registration session is missing. Please register again.");

      navigate("/register", { replace: true });

      return;
    }

    setResending(true);
    setError("");

    try {
      const response = await apiRequest("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({
          registrationToken,
        }),
      });

      if (!response?.success || !response?.registrationToken) {
        throw new Error(response?.message || "Unable to resend OTP.");
      }

      const newRegistrationToken = response.registrationToken;

      setRegistrationToken(newRegistrationToken);

      sessionStorage.setItem(REGISTRATION_TOKEN_KEY, newRegistrationToken);

      setOtp(Array(OTP_LENGTH).fill(""));

      setTimeLeft(OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);

      setError("");

      inputRefs.current[0]?.focus();

      await showSuccess("New OTP Sent!", "A new verification code has been sent to your email.");
    } catch (error) {
      console.error("Resend OTP failed:", error);

      setError(error?.message || "Unable to resend OTP. Please try again.");

      await showError("Resend Failed", error?.message || "Unable to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <style>{`.verify-page{min-height:calc(100vh - 80px);padding:70px 24px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,rgba(111,143,69,.10),transparent 34%),var(--color-cream)}.verify-wrapper{width:min(100%,1050px);min-height:600px;display:grid;grid-template-columns:.9fr 1.1fr;overflow:hidden;border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-lg)}.verify-side{position:relative;display:flex;align-items:center;justify-content:center;padding:50px;overflow:hidden;background:radial-gradient(circle at 80% 20%,rgba(111,143,69,.22),transparent 35%),linear-gradient(145deg,var(--color-primary),#24321f);color:var(--color-white)}.verify-side::before{content:"";position:absolute;width:300px;height:300px;right:-145px;top:-125px;border:1px solid rgba(228,199,123,.18);border-radius:50%}.verify-side::after{content:"";position:absolute;width:380px;height:380px;left:-250px;bottom:-220px;border:1px solid rgba(228,199,123,.12);border-radius:50%}.verify-side-content{position:relative;z-index:1;width:100%;transform:translateY(-45px)}.verify-brand-mark{width:58px;height:58px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:rgba(228,199,123,.14);border:1px solid rgba(228,199,123,.28);color:var(--color-gold-light)}.verify-side-content h1{margin-bottom:16px;color:var(--color-white);font-size:clamp(2rem,4vw,3rem);line-height:1.1}.verify-side-content>p{max-width:420px;margin-bottom:30px;color:rgba(255,255,255,.85);font-size:1rem;line-height:1.75}.verify-trust-list{display:grid;gap:14px}.verify-trust-item{display:flex;align-items:center;gap:11px;color:rgba(255,255,255,.88);font-size:.94rem}.verify-trust-item svg{flex-shrink:0;color:var(--color-gold-light)}.verify-form-panel{display:flex;align-items:center;padding:55px clamp(30px,5vw,70px);background:var(--color-white)}.verify-form-content{width:100%;max-width:470px;margin-inline:auto}.verify-heading{margin-bottom:30px;text-align:center}.verify-heading span{display:inline-block;margin-bottom:9px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.verify-heading h2{margin-bottom:11px;color:var(--color-primary);font-size:clamp(1.9rem,4vw,2.5rem)}.verify-heading p{color:#1a120c;font-size:.95rem;line-height:1.7}.verify-email{display:inline-flex;align-items:center;gap:7px;max-width:100%;margin-top:13px;padding:8px 13px;border-radius:var(--radius-pill);background:var(--color-green-pale);color:var(--color-green);font-size:.85rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.verify-form{display:grid;gap:20px}.verify-otp-label{display:block;margin-bottom:10px;color:var(--color-primary);font-size:.9rem;font-weight:700;text-align:center}.verify-otp-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.verify-otp-input{width:100%;height:58px;border:1px solid var(--color-border);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-primary);font-size:1.35rem;font-weight:800;text-align:center;transition:border-color var(--transition-fast),box-shadow var(--transition-fast),background var(--transition-fast)}.verify-otp-input:focus{border-color:var(--color-green);background:var(--color-green-pale);box-shadow:0 0 0 4px rgba(63,107,53,.10)}.verify-otp-input.has-error{border-color:var(--color-danger)}.verify-error{display:block;margin-top:9px;color:var(--color-danger);font-size:.8rem;line-height:1.4;text-align:center}.verify-timer{display:flex;align-items:center;justify-content:center;gap:7px;color:#1a120c;font-size:.86rem}.verify-timer strong{color:var(--color-green);font-variant-numeric:tabular-nums}.verify-timer.expired strong{color:var(--color-danger)}.verify-submit{width:100%;min-height:52px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:var(--radius-md);background:var(--color-green);color:var(--color-white);font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.verify-submit:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.verify-submit:disabled{cursor:not-allowed;opacity:.6}.verify-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:var(--color-white);border-radius:50%;animation:verifySpin .75s linear infinite}@keyframes verifySpin{to{transform:rotate(360deg)}}.verify-resend{display:flex;align-items:center;justify-content:center;gap:5px;color:#1a120c;font-size:.87rem}.verify-resend button{display:inline-flex;align-items:center;gap:5px;padding:0;border:0;background:transparent;color:var(--color-green);font-weight:800}.verify-resend button:hover:not(:disabled){color:var(--color-primary);text-decoration:underline}.verify-resend button:disabled{cursor:not-allowed;color:var(--color-text-soft)}.verify-info{display:flex;align-items:flex-start;gap:11px;margin-top:2px;padding:14px 15px;border-radius:var(--radius-md);background:var(--color-green-pale);color:#1a120c;font-size:.82rem;line-height:1.55}.verify-info svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.verify-back{margin-top:24px;padding-top:22px;border-top:1px solid var(--color-border);text-align:center}.verify-back a{display:inline-flex;align-items:center;gap:7px;color:var(--color-green);font-size:.88rem;font-weight:800}.verify-back a:hover{color:var(--color-primary)}@media (max-width:900px){.verify-page{padding:45px 20px}.verify-wrapper{grid-template-columns:1fr;max-width:600px}.verify-side{min-height:330px}.verify-side-content{transform:translateY(-15px)}.verify-side-content h1{font-size:2.2rem}.verify-form-panel{padding:45px 30px 50px}}@media (max-width:575px){.verify-page{min-height:calc(100vh - 70px);padding:25px 16px 40px}.verify-wrapper{border-radius:var(--radius-lg)}.verify-side{min-height:300px;padding:38px 25px}.verify-side-content{transform:translateY(-8px)}.verify-brand-mark{width:52px;height:52px;margin-bottom:19px}.verify-side-content h1{font-size:1.9rem}.verify-side-content>p{margin-bottom:22px;font-size:.9rem}.verify-trust-item{font-size:.85rem}.verify-form-panel{padding:38px 20px 42px}.verify-heading{margin-bottom:27px}.verify-heading h2{font-size:1.85rem}.verify-otp-grid{gap:6px}.verify-otp-input{height:52px;border-radius:11px;font-size:1.2rem}.verify-email{max-width:100%}}@media (max-width:360px){.verify-otp-grid{gap:4px}.verify-otp-input{height:48px;font-size:1.05rem}}`}</style>

      <section className="verify-page">
        <div className="verify-wrapper">
          <aside className="verify-side">
            <div className="verify-side-content">
              <div className="verify-brand-mark">
                <MailCheck size={28} />
              </div>

              <h1>Verify Your Email</h1>

              <p>One quick step to secure your BR30 Kadaknath Farms account. Enter the verification code sent to your registered email address.</p>

              <div className="verify-trust-list">
                <div className="verify-trust-item">
                  <ShieldCheck size={19} />
                  <span>Secure email verification</span>
                </div>

                <div className="verify-trust-item">
                  <ShieldCheck size={19} />
                  <span>6-digit verification code</span>
                </div>

                <div className="verify-trust-item">
                  <CheckCircle2 size={19} />
                  <span>Protect your customer account</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="verify-form-panel">
            <div className="verify-form-content">
              <div className="verify-heading">
                <span>Email Verification</span>

                <h2>Enter OTP</h2>

                <p>We've sent a 6-digit verification code to</p>

                {email ? (
                  <div className="verify-email">
                    <MailCheck size={16} />
                    {email}
                  </div>
                ) : (
                  <p>your registered email address.</p>
                )}
              </div>

              <form className="verify-form" onSubmit={handleVerify}>
                <div>
                  <label className="verify-otp-label">Verification Code</label>

                  <div className="verify-otp-grid" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        aria-label={`OTP digit ${index + 1}`}
                        className={`verify-otp-input ${error ? "has-error" : ""}`}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                      />
                    ))}
                  </div>

                  {error && <span className="verify-error">{error}</span>}
                </div>

                <div className={`verify-timer ${timeLeft <= 0 ? "expired" : ""}`}>
                  {timeLeft > 0 ? (
                    <>
                      OTP expires in
                      <strong>{formatTime(timeLeft)}</strong>
                    </>
                  ) : (
                    <>OTP has expired.</>
                  )}
                </div>

                <button type="submit" className="verify-submit" disabled={verifying || otp.join("").length !== OTP_LENGTH || timeLeft <= 0}>
                  {verifying ? (
                    <>
                      <span className="verify-spinner" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="verify-resend">
                  <span>Didn't receive the code?</span>

                  <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || resending}>
                    <RefreshCw size={14} className={resending ? "verify-refresh-spin" : ""} />

                    {resending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="verify-info">
                  <ShieldCheck size={18} />

                  <span>Never share your verification code with anyone. Our team will never ask you for your OTP.</span>
                </div>
              </form>

              <div className="verify-back">
                <Link to="/register">
                  <ArrowLeft size={16} />
                  Back to Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default VerifyEmail;
