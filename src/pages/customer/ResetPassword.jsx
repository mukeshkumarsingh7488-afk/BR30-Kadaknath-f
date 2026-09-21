import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock, MailCheck, ShieldCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { showError, showSuccess } from "../../utils/sweetAlert";

const OTP_LENGTH = 6;

const RESET_TOKEN_KEY = "br30_reset_token";
const RESET_EMAIL_KEY = "br30_reset_email";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { verifyResetOtp, resetPassword } = useAuth();

  const inputRefs = useRef([]);

  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(RESET_TOKEN_KEY);
    const storedEmail = sessionStorage.getItem(RESET_EMAIL_KEY);

    if (!storedToken) {
      showError("Reset Session Missing", "Your password reset session is missing or expired. Please request a new OTP.").then(() => {
        navigate("/forgot-password", { replace: true });
      });

      return;
    }

    setResetToken(storedToken);
    setEmail(storedEmail || "");
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });

      setOtpError("");
      return;
    }

    const digit = numericValue.slice(-1);

    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    setOtpError("");

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

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
    setOtpError("");

    const nextFocusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);

    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    const otpValue = otp.join("");

    if (!resetToken) {
      await showError("Reset Session Missing", "Your password reset session is missing. Please request a new OTP.");

      navigate("/forgot-password", { replace: true });

      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      setOtpError("Please enter the complete 6-digit OTP.");

      await showError("Incomplete OTP", "Please enter all 6 digits of the OTP.");

      return;
    }

    setVerifyingOtp(true);
    setOtpError("");

    try {
      const response = await verifyResetOtp({
        resetToken,
        otp: otpValue,
      });

      if (!response?.success || !response?.resetToken) {
        throw new Error(response?.message || "OTP verification failed.");
      }

      const verifiedResetToken = response.resetToken;

      setResetToken(verifiedResetToken);

      sessionStorage.setItem(RESET_TOKEN_KEY, verifiedResetToken);

      setOtpVerified(true);

      await showSuccess("OTP Verified!", "Your identity has been verified. You can now create a new password.");
    } catch (error) {
      console.error("Reset OTP verification failed:", error);

      const message = error?.message || "Invalid or expired OTP. Please try again.";

      setOtpError(message);

      await showError("OTP Verification Failed", message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name] || errors.general) {
      setErrors((current) => ({
        ...current,
        [name]: "",
        general: "",
      }));
    }

    if (name === "password" && errors.confirmPassword) {
      setErrors((current) => ({
        ...current,
        confirmPassword: "",
      }));
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Please enter a new password.";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  const validateForm = () => {
    const nextErrors = {};

    const passwordError = validatePassword(formData.password);

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!otpVerified) {
      await showError("Verify OTP First", "Please verify the OTP before creating a new password.");

      return;
    }

    if (!validateForm()) {
      await showError("Check Your Password", "Please correct the highlighted fields before continuing.");

      return;
    }

    if (!resetToken) {
      await showError("Reset Session Missing", "Your password reset session is missing or expired.");

      navigate("/forgot-password", { replace: true });

      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await resetPassword({
        resetToken,
        newPassword: formData.password,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to reset your password.");
      }

      sessionStorage.removeItem(RESET_TOKEN_KEY);
      sessionStorage.removeItem(RESET_EMAIL_KEY);

      await showSuccess("Password Reset Successfully!", "Your new password has been saved. Please login with your new password.");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Password reset failed:", error);

      const message = error?.message || "Unable to reset password. Please try again.";

      setErrors({
        general: message,
      });

      await showError("Password Reset Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`.reset-page{min-height:calc(100vh - 80px);padding:70px 24px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at bottom left,rgba(111,143,69,.10),transparent 34%),var(--color-cream)}.reset-wrapper{width:min(100%,1050px);min-height:620px;display:grid;grid-template-columns:.9fr 1.1fr;overflow:hidden;border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-lg)}.reset-side{position:relative;display:flex;align-items:center;justify-content:center;padding:50px;overflow:hidden;background:radial-gradient(circle at 20% 20%,rgba(111,143,69,.22),transparent 35%),linear-gradient(145deg,var(--color-primary),#24321f);color:var(--color-white)}.reset-side::before{content:"";position:absolute;width:300px;height:300px;right:-145px;top:-125px;border:1px solid rgba(228,199,123,.18);border-radius:50%}.reset-side::after{content:"";position:absolute;width:380px;height:380px;left:-250px;bottom:-220px;border:1px solid rgba(228,199,123,.12);border-radius:50%}.reset-side-content{position:relative;z-index:1;width:100%;transform:translateY(-45px)}.reset-brand-mark{width:58px;height:58px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:rgba(228,199,123,.14);border:1px solid rgba(228,199,123,.28);color:var(--color-gold-light)}.reset-side-content h1{margin-bottom:16px;color:var(--color-white);font-size:clamp(2rem,4vw,3rem);line-height:1.1}.reset-side-content>p{max-width:420px;margin-bottom:30px;color:rgba(255,255,255,.85);font-size:1rem;line-height:1.75}.reset-trust-list{display:grid;gap:14px}.reset-trust-item{display:flex;align-items:center;gap:11px;color:rgba(255,255,255,.88);font-size:.94rem}.reset-trust-item svg{flex-shrink:0;color:var(--color-gold-light)}.reset-form-panel{display:flex;align-items:center;padding:55px clamp(30px,5vw,70px);background:var(--color-white)}.reset-form-content{width:100%;max-width:470px;margin-inline:auto}.reset-heading{margin-bottom:27px}.reset-heading span{display:inline-block;margin-bottom:9px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.reset-heading h2{margin-bottom:10px;color:var(--color-primary);font-size:clamp(1.9rem,4vw,2.5rem)}.reset-heading p{color:#1a120c;font-size:.95rem;line-height:1.7}.reset-email{display:inline-flex;align-items:center;gap:7px;max-width:100%;margin-top:13px;padding:8px 13px;border-radius:var(--radius-pill);background:var(--color-green-pale);color:var(--color-green);font-size:.85rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.reset-otp-section{display:grid;gap:10px;margin-bottom:24px}.reset-otp-label{color:var(--color-primary);font-size:.9rem;font-weight:700;text-align:center}.reset-otp-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.reset-otp-input{width:100%;height:54px;border:1px solid var(--color-border);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-primary);font-size:1.3rem;font-weight:800;text-align:center;transition:border-color var(--transition-fast),box-shadow var(--transition-fast),background var(--transition-fast)}.reset-otp-input:focus{border-color:var(--color-green);background:var(--color-green-pale);box-shadow:0 0 0 4px rgba(63,107,53,.10)}.reset-otp-input.has-error{border-color:var(--color-danger)}.reset-otp-error{color:var(--color-danger);font-size:.8rem;line-height:1.4;text-align:center}.reset-otp-button{width:100%;min-height:48px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--color-green);border-radius:var(--radius-md);background:var(--color-white);color:var(--color-green);font-weight:800;transition:background var(--transition-fast),color var(--transition-fast),transform var(--transition-fast)}.reset-otp-button:hover:not(:disabled){background:var(--color-green);color:var(--color-white);transform:translateY(-1px)}.reset-otp-button:disabled{cursor:not-allowed;opacity:.6}.reset-verified{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:24px;padding:12px 14px;border-radius:var(--radius-md);background:var(--color-green-pale);color:var(--color-green);font-size:.85rem;font-weight:800}.reset-form{display:grid;gap:20px}.reset-field{display:grid;gap:8px}.reset-field label{color:var(--color-primary);font-size:.9rem;font-weight:700}.reset-input-wrap{position:relative}.reset-input-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--color-text-soft);pointer-events:none}.reset-input{width:100%;height:52px;padding:0 52px 0 46px;border:1px solid var(--color-border);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-text);transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.reset-input::placeholder{color:var(--color-text-soft)}.reset-input:focus{border-color:var(--color-green);box-shadow:0 0 0 4px rgba(63,107,53,.10)}.reset-input.has-error{border-color:var(--color-danger)}.reset-input:disabled{background:#f5f5f5;cursor:not-allowed}.reset-password-toggle{position:absolute;right:7px;top:50%;width:40px;height:40px;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;border:0;border-radius:10px;background:transparent;color:var(--color-text-soft)}.reset-password-toggle:hover{background:var(--color-green-pale);color:var(--color-green)}.reset-password-toggle:disabled{cursor:not-allowed}.reset-error{color:var(--color-danger);font-size:.8rem;line-height:1.4}.reset-general-error{padding:12px 14px;border-radius:var(--radius-md);background:rgba(220,53,69,.08);color:var(--color-danger);font-size:.84rem;line-height:1.5}.reset-submit{width:100%;min-height:52px;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:var(--radius-md);background:var(--color-green);color:var(--color-white);font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.reset-submit:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.reset-submit:disabled{cursor:not-allowed;opacity:.65}.reset-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:var(--color-white);border-radius:50%;animation:resetSpin .75s linear infinite}@keyframes resetSpin{to{transform:rotate(360deg)}}.reset-info{display:flex;align-items:flex-start;gap:11px;margin-top:22px;padding:14px 15px;border-radius:var(--radius-md);background:var(--color-green-pale);color:#1a120c;font-size:.83rem;line-height:1.55}.reset-info svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.reset-back{margin-top:25px;padding-top:22px;border-top:1px solid var(--color-border);text-align:center}.reset-back a{display:inline-flex;align-items:center;gap:7px;color:var(--color-green);font-size:.88rem;font-weight:800}.reset-back a:hover{color:var(--color-primary)}@media (max-width:900px){.reset-page{padding:45px 20px}.reset-wrapper{grid-template-columns:1fr;max-width:600px}.reset-side{min-height:330px}.reset-side-content{transform:translateY(-15px)}.reset-side-content h1{font-size:2.2rem}.reset-form-panel{padding:45px 30px 50px}}@media (max-width:575px){.reset-page{min-height:calc(100vh - 70px);padding:25px 16px 40px}.reset-wrapper{border-radius:var(--radius-lg)}.reset-side{min-height:300px;padding:38px 25px}.reset-side-content{transform:translateY(-8px)}.reset-brand-mark{width:52px;height:52px;margin-bottom:19px}.reset-side-content h1{font-size:1.9rem}.reset-side-content>p{margin-bottom:22px;font-size:.9rem}.reset-trust-item{font-size:.85rem}.reset-form-panel{padding:38px 20px 42px}.reset-heading{margin-bottom:24px}.reset-heading h2{font-size:1.85rem}.reset-otp-grid{gap:5px}.reset-otp-input{height:50px;font-size:1.15rem}}@media (max-width:360px){.reset-otp-grid{gap:4px}.reset-otp-input{height:47px;font-size:1.05rem}}`}</style>

      <section className="reset-page">
        <div className="reset-wrapper">
          <aside className="reset-side">
            <div className="reset-side-content">
              <div className="reset-brand-mark">
                <KeyRound size={28} />
              </div>

              <h1>Secure Your Account</h1>

              <p>Verify your email with the OTP we sent you, then create a strong new password for your BR30 Kadaknath Farms account.</p>

              <div className="reset-trust-list">
                <div className="reset-trust-item">
                  <ShieldCheck size={19} />
                  <span>Secure account recovery</span>
                </div>

                <div className="reset-trust-item">
                  <ShieldCheck size={19} />
                  <span>6-digit email verification</span>
                </div>

                <div className="reset-trust-item">
                  <CheckCircle2 size={19} />
                  <span>Protected password reset</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="reset-form-panel">
            <div className="reset-form-content">
              <div className="reset-heading">
                <span>Account Recovery</span>

                <h2>{otpVerified ? "Create New Password" : "Verify OTP"}</h2>

                <p>{otpVerified ? "Your OTP has been verified. Create a new password for your account." : "Enter the 6-digit OTP sent to your registered email address."}</p>

                {email && (
                  <div className="reset-email">
                    <MailCheck size={16} />
                    {email}
                  </div>
                )}
              </div>

              {!otpVerified ? (
                <form className="reset-form" onSubmit={handleVerifyOtp} noValidate>
                  <div className="reset-otp-section">
                    <label className="reset-otp-label">Password Reset OTP</label>

                    <div className="reset-otp-grid" onPaste={handleOtpPaste}>
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
                          className={`reset-otp-input ${otpError ? "has-error" : ""}`}
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                        />
                      ))}
                    </div>

                    {otpError && <span className="reset-otp-error">{otpError}</span>}
                  </div>

                  <button type="submit" className="reset-otp-button" disabled={verifyingOtp || otp.join("").length !== OTP_LENGTH}>
                    {verifyingOtp ? (
                      <>
                        <span className="reset-spinner" />
                        Verifying OTP...
                      </>
                    ) : (
                      <>
                        Verify OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <>
                  <div className="reset-verified">
                    <CheckCircle2 size={18} />
                    OTP verified successfully
                  </div>

                  <form className="reset-form" onSubmit={handleSubmit} noValidate>
                    <div className="reset-field">
                      <label htmlFor="reset-password">New Password</label>

                      <div className="reset-input-wrap">
                        <Lock className="reset-input-icon" size={19} />

                        <input
                          id="reset-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Example: Pan@kaj10"
                          autoComplete="new-password"
                          className={`reset-input ${errors.password ? "has-error" : ""}`}
                          disabled={submitting}
                        />

                        <button type="button" className="reset-password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} disabled={submitting}>
                          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>

                      {errors.password && <span className="reset-error">{errors.password}</span>}
                    </div>

                    <div className="reset-field">
                      <label htmlFor="reset-confirm-password">Confirm New Password</label>

                      <div className="reset-input-wrap">
                        <Lock className="reset-input-icon" size={19} />

                        <input
                          id="reset-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter your new password"
                          autoComplete="new-password"
                          className={`reset-input ${errors.confirmPassword ? "has-error" : ""}`}
                          disabled={submitting}
                        />

                        <button type="button" className="reset-password-toggle" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} disabled={submitting}>
                          {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>

                      {errors.confirmPassword && <span className="reset-error">{errors.confirmPassword}</span>}
                    </div>

                    {errors.general && <div className="reset-general-error">{errors.general}</div>}

                    <button type="submit" className="reset-submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="reset-spinner" />
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          Reset Password
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              <div className="reset-info">
                <ShieldCheck size={18} />

                <span>Your OTP and password reset session are verified by the server. Never share your OTP or password with anyone.</span>
              </div>

              <div className="reset-back">
                <Link to="/login">
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;
