import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { showError, showSuccess } from "../../utils/sweetAlert";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailChange = (event) => {
    const value = event.target.value.replace(/\s/g, "");

    setEmail(value);

    if (error) {
      setError("");
    }
  };

  const validateEmail = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail()) {
      await showError("Check Your Email", "Please enter a valid email address.");

      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await forgotPassword(normalizedEmail);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to send password reset OTP.");
      }

      if (!response?.resetToken) {
        throw new Error("Password reset session could not be created. Please try again.");
      }

      /*
       * Save the temporary reset token.
       *
       * ResetPassword.jsx will use this token
       * to verify the OTP first.
       */
      sessionStorage.setItem("br30_reset_token", response.resetToken);

      /*
       * Save email so ResetPassword.jsx can
       * display which email received the OTP.
       */
      sessionStorage.setItem("br30_reset_email", normalizedEmail);

      await showSuccess("OTP Sent!", "A password reset OTP has been sent to your registered email address.");

      /*
       * OTP verification and new password creation
       * are both handled inside ResetPassword.jsx.
       */
      navigate("/reset-password", {
        replace: true,
      });
    } catch (error) {
      console.error("Forgot password failed:", error);

      const message = error?.message || "Unable to send reset OTP. Please try again.";

      setError(message);

      await showError("Request Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`.forgot-page{min-height:calc(100vh - 80px);padding:70px 24px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top right,rgba(111,143,69,.10),transparent 34%),var(--color-cream)}.forgot-wrapper{width:min(100%,1050px);min-height:590px;display:grid;grid-template-columns:.9fr 1.1fr;overflow:hidden;border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-lg)}.forgot-side{position:relative;display:flex;align-items:center;justify-content:center;padding:50px;overflow:hidden;background:radial-gradient(circle at 80% 20%,rgba(111,143,69,.22),transparent 35%),linear-gradient(145deg,var(--color-primary),#24321f);color:var(--color-white)}.forgot-side::before{content:"";position:absolute;width:300px;height:300px;right:-150px;top:-125px;border:1px solid rgba(228,199,123,.18);border-radius:50%}.forgot-side::after{content:"";position:absolute;width:380px;height:380px;left:-250px;bottom:-220px;border:1px solid rgba(228,199,123,.12);border-radius:50%}.forgot-side-content{position:relative;z-index:1;width:100%;transform:translateY(-45px)}.forgot-brand-mark{width:58px;height:58px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:rgba(228,199,123,.14);border:1px solid rgba(228,199,123,.28);color:var(--color-gold-light)}.forgot-side-content h1{margin-bottom:16px;color:var(--color-white);font-size:clamp(2rem,4vw,3rem);line-height:1.1}.forgot-side-content>p{max-width:420px;margin-bottom:30px;color:rgba(255,255,255,.85);font-size:1rem;line-height:1.75}.forgot-trust-list{display:grid;gap:14px}.forgot-trust-item{display:flex;align-items:center;gap:11px;color:rgba(255,255,255,.88);font-size:.94rem}.forgot-trust-item svg{flex-shrink:0;color:var(--color-gold-light)}.forgot-form-panel{display:flex;align-items:center;padding:55px clamp(30px,5vw,70px);background:var(--color-white)}.forgot-form-content{width:100%;max-width:470px;margin-inline:auto}.forgot-heading{margin-bottom:32px}.forgot-heading span{display:inline-block;margin-bottom:9px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.forgot-heading h2{margin-bottom:10px;color:var(--color-primary);font-size:clamp(1.9rem,4vw,2.5rem)}.forgot-heading p{color:#1a120c;font-size:.95rem;line-height:1.7}.forgot-form{display:grid;gap:20px}.forgot-field{display:grid;gap:8px}.forgot-field label{color:var(--color-primary);font-size:.9rem;font-weight:700}.forgot-input-wrap{position:relative}.forgot-input-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--color-text-soft);pointer-events:none}.forgot-input{width:100%;height:52px;padding:0 16px 0 46px;border:1px solid var(--color-border);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-text);transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.forgot-input::placeholder{color:var(--color-text-soft)}.forgot-input:focus{border-color:var(--color-green);box-shadow:0 0 0 4px rgba(63,107,53,.10)}.forgot-input.has-error{border-color:var(--color-danger)}.forgot-error{color:var(--color-danger);font-size:.8rem;line-height:1.4}.forgot-submit{width:100%;min-height:52px;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:var(--radius-md);background:var(--color-green);color:var(--color-white);font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.forgot-submit:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.forgot-submit:disabled{cursor:not-allowed;opacity:.65}.forgot-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:var(--color-white);border-radius:50%;animation:forgotSpin .75s linear infinite}@keyframes forgotSpin{to{transform:rotate(360deg)}}.forgot-info{display:flex;align-items:flex-start;gap:11px;margin-top:23px;padding:14px 15px;border-radius:var(--radius-md);background:var(--color-green-pale);color:#1a120c;font-size:.83rem;line-height:1.55}.forgot-info svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.forgot-links{margin-top:27px;padding-top:23px;border-top:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;gap:15px}.forgot-back-login{display:inline-flex;align-items:center;gap:7px;color:var(--color-green);font-size:.88rem;font-weight:800}.forgot-back-login:hover{color:var(--color-primary)}.forgot-register{color:#1a120c;font-size:.88rem}.forgot-register a{color:var(--color-green);font-weight:800}.forgot-register a:hover{color:var(--color-primary);text-decoration:underline}@media (max-width:900px){.forgot-page{padding:45px 20px}.forgot-wrapper{grid-template-columns:1fr;max-width:600px}.forgot-side{min-height:330px}.forgot-side-content{transform:translateY(-15px)}.forgot-side-content h1{font-size:2.2rem}.forgot-form-panel{padding:45px 30px 50px}}@media (max-width:575px){.forgot-page{min-height:calc(100vh - 70px);padding:25px 16px 40px}.forgot-wrapper{border-radius:var(--radius-lg)}.forgot-side{min-height:300px;padding:38px 25px}.forgot-side-content{transform:translateY(-8px)}.forgot-brand-mark{width:52px;height:52px;margin-bottom:19px}.forgot-side-content h1{font-size:1.9rem}.forgot-side-content>p{margin-bottom:22px;font-size:.9rem}.forgot-trust-item{font-size:.85rem}.forgot-form-panel{padding:38px 20px 42px}.forgot-heading{margin-bottom:27px}.forgot-heading h2{font-size:1.85rem}.forgot-links{align-items:flex-start;flex-direction:column}}`}</style>

      <section className="forgot-page">
        <div className="forgot-wrapper">
          <aside className="forgot-side">
            <div className="forgot-side-content">
              <div className="forgot-brand-mark">
                <KeyRound size={28} />
              </div>

              <h1>Secure Your Account</h1>

              <p>Forgot your password? No problem. Enter your registered email address and we'll help you get back into your BR30 Kadaknath Farms account.</p>

              <div className="forgot-trust-list">
                <div className="forgot-trust-item">
                  <ShieldCheck size={19} />
                  <span>Secure account recovery</span>
                </div>

                <div className="forgot-trust-item">
                  <ShieldCheck size={19} />
                  <span>Email-based verification</span>
                </div>

                <div className="forgot-trust-item">
                  <CheckCircle2 size={19} />
                  <span>Simple and secure process</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="forgot-form-panel">
            <div className="forgot-form-content">
              <div className="forgot-heading">
                <span>Account Recovery</span>

                <h2>Forgot Password?</h2>

                <p>Enter the email address associated with your account. We'll send a password reset OTP to your registered email address.</p>
              </div>

              <form className="forgot-form" onSubmit={handleSubmit} noValidate>
                <div className="forgot-field">
                  <label htmlFor="forgot-email">Email Address</label>

                  <div className="forgot-input-wrap">
                    <Mail className="forgot-input-icon" size={19} />

                    <input id="forgot-email" type="email" name="email" value={email} onChange={handleEmailChange} placeholder="you@example.com" autoComplete="email" className={`forgot-input ${error ? "has-error" : ""}`} disabled={submitting} />
                  </div>

                  {error && <span className="forgot-error">{error}</span>}
                </div>

                <button type="submit" className="forgot-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="forgot-spinner" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send Reset OTP
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-info">
                <ShieldCheck size={18} />

                <span>For your security, password recovery will only be completed through the email address registered with your BR30 Farms account.</span>
              </div>

              <div className="forgot-links">
                <Link to="/login" className="forgot-back-login">
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>

                <div className="forgot-register">
                  New customer? <Link to="/register">Create Account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
