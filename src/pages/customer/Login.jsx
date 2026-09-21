import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { showError, showSuccess } from "../../utils/sweetAlert";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name] || errors.general) {
      setErrors((current) => ({
        ...current,
        [name]: "",
        general: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      await showError("Check Your Details", "Please enter your email and password correctly.");

      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!response?.success || !response?.accessToken || !response?.user) {
        throw new Error(response?.message || "Login failed.");
      }

      await showSuccess("Login Successful!", `Welcome back, ${response.user.name}.`);

      window.dispatchEvent(new Event("br30-auth-changed"));

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      const message = error?.message || "Invalid email or password. Please try again.";

      setErrors({
        general: message,
      });

      await showError("Login Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`.login-page{min-height:calc(100vh - 80px);padding:70px 24px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,rgba(111,143,69,.10),transparent 32%),var(--color-cream)}.login-wrapper{width:min(100%,1050px);min-height:620px;display:grid;grid-template-columns:.9fr 1.1fr;overflow:hidden;border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-lg)}.login-side{position:relative;display:flex;align-items:center;justify-content:center;padding:50px;overflow:hidden;background:radial-gradient(circle at 20% 20%,rgba(111,143,69,.22),transparent 35%),linear-gradient(145deg,var(--color-primary),#24321f);color:var(--color-white)}.login-side::before{content:"";position:absolute;width:280px;height:280px;right:-130px;top:-120px;border:1px solid rgba(228,199,123,.18);border-radius:50%}.login-side::after{content:"";position:absolute;width:380px;height:380px;left:-250px;bottom:-220px;border:1px solid rgba(228,199,123,.12);border-radius:50%}.login-side-content{position:relative;z-index:1;width:100%;transform:translateY(-50px)}.login-brand-mark{width:58px;height:58px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:rgba(228,199,123,.14);border:1px solid rgba(228,199,123,.28);color:var(--color-gold-light)}.login-side-content h1{margin-bottom:16px;font-size:clamp(2rem,4vw,3rem);line-height:1.1;color:var(--color-white)}.login-side-content>p{max-width:420px;margin-bottom:30px;color:rgba(255,255,255,.85);font-size:1rem;line-height:1.75}.login-trust-list{display:grid;gap:14px}.login-trust-item{display:flex;align-items:center;gap:11px;color:rgba(255,255,255,.88);font-size:.94rem}.login-trust-item svg{flex-shrink:0;color:var(--color-gold-light)}.login-form-panel{display:flex;align-items:center;padding:55px clamp(30px,5vw,70px);background:var(--color-white)}.login-form-content{width:100%;max-width:470px;margin-inline:auto}.login-heading{margin-bottom:32px}.login-heading span{display:inline-block;margin-bottom:9px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.login-heading h2{margin-bottom:9px;color:var(--color-primary);font-size:clamp(1.9rem,4vw,2.5rem)}.login-heading p{color:#1a120c;font-size:.95rem}.login-form{display:grid;gap:20px}.login-field{display:grid;gap:8px}.login-field label{color:var(--color-primary);font-size:.9rem;font-weight:700}.login-input-wrap{position:relative}.login-input-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--color-text-soft);pointer-events:none}.login-input{width:100%;height:52px;padding:0 16px 0 46px;border:1px solid var(--color-border);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-text);transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.login-input::placeholder{color:var(--color-text-soft)}.login-input:focus{border-color:var(--color-green);box-shadow:0 0 0 4px rgba(63,107,53,.10)}.login-input.has-error{border-color:var(--color-danger)}.login-password-input{padding-right:50px}.login-password-toggle{position:absolute;right:7px;top:50%;width:40px;height:40px;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;border:0;border-radius:10px;background:transparent;color:var(--color-text-soft)}.login-password-toggle:hover{background:var(--color-green-pale);color:var(--color-green)}.login-error{color:var(--color-danger);font-size:.8rem;line-height:1.4}.login-general-error{padding:12px 14px;border-radius:var(--radius-md);background:rgba(220,53,69,.08);color:var(--color-danger);font-size:.84rem;line-height:1.5}.login-options{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:-3px}.login-remember{display:inline-flex;align-items:center;gap:9px;color:#1a120c;font-size:.87rem;cursor:pointer;user-select:none}.login-remember input{width:16px;height:16px;accent-color:var(--color-green);cursor:pointer}.login-forgot{color:var(--color-green);font-size:.87rem;font-weight:700}.login-forgot:hover{color:var(--color-primary);text-decoration:underline}.login-submit{width:100%;min-height:52px;margin-top:4px;border:0;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;gap:9px;background:var(--color-green);color:var(--color-white);font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.login-submit:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.login-submit:disabled{cursor:not-allowed;opacity:.65}.login-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:var(--color-white);border-radius:50%;animation:loginSpin .75s linear infinite}@keyframes loginSpin{to{transform:rotate(360deg)}}.login-register{margin-top:26px;padding-top:23px;border-top:1px solid var(--color-border);text-align:center;color:#1a120c;font-size:.9rem}.login-register a{color:var(--color-green);font-weight:800}.login-register a:hover{color:var(--color-primary);text-decoration:underline}@media (max-width:900px){.login-page{padding:45px 20px}.login-wrapper{grid-template-columns:1fr;max-width:600px}.login-side{min-height:330px}.login-side-content{transform:translateY(-15px)}.login-side-content h1{font-size:2.2rem}.login-form-panel{padding:45px 30px 50px}}@media (max-width:575px){.login-page{min-height:calc(100vh - 70px);padding:25px 16px 40px}.login-wrapper{border-radius:var(--radius-lg)}.login-side{min-height:300px;padding:38px 25px}.login-side-content{transform:translateY(-8px)}.login-brand-mark{width:52px;height:52px;margin-bottom:19px}.login-side-content h1{font-size:1.9rem}.login-side-content>p{margin-bottom:22px;font-size:.9rem}.login-trust-item{font-size:.85rem}.login-form-panel{padding:38px 20px 42px}.login-heading{margin-bottom:27px}.login-heading h2{font-size:1.85rem}.login-options{align-items:flex-start;flex-direction:column;gap:12px}}`}</style>

      <section className="login-page">
        <div className="login-wrapper">
          <aside className="login-side">
            <div className="login-side-content">
              <div className="login-brand-mark">
                <LogIn size={28} />
              </div>

              <h1>Welcome Back!</h1>

              <p>Sign in to your BR30 Kadaknath Farms account and manage your orders, deliveries and customer details with ease.</p>

              <div className="login-trust-list">
                <div className="login-trust-item">
                  <ShieldCheck size={19} />
                  <span>Secure customer account</span>
                </div>

                <div className="login-trust-item">
                  <ShieldCheck size={19} />
                  <span>Easy order management</span>
                </div>

                <div className="login-trust-item">
                  <ShieldCheck size={19} />
                  <span>Stay connected with our farm</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="login-form-panel">
            <div className="login-form-content">
              <div className="login-heading">
                <span>Customer Account</span>

                <h2>Sign In</h2>

                <p>Enter your account details to continue.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="login-field">
                  <label htmlFor="login-email">Email Address</label>

                  <div className="login-input-wrap">
                    <Mail className="login-input-icon" size={19} />

                    <input id="login-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" className={`login-input ${errors.email ? "has-error" : ""}`} />
                  </div>

                  {errors.email && <span className="login-error">{errors.email}</span>}
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">Password</label>

                  <div className="login-input-wrap">
                    <Lock className="login-input-icon" size={19} />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`login-input login-password-input ${errors.password ? "has-error" : ""}`}
                    />

                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  {errors.password && <span className="login-error">{errors.password}</span>}
                </div>

                <div className="login-options">
                  <label className="login-remember">
                    <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />

                    <span>Remember me</span>
                  </label>

                  <Link to="/forgot-password" className="login-forgot">
                    Forgot Password?
                  </Link>
                </div>

                {errors.general && <div className="login-general-error">{errors.general}</div>}

                <button type="submit" className="login-submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="login-spinner" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="login-register">
                Don't have an account? <Link to="/register">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
