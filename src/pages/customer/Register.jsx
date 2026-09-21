import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { showError, showSuccess } from "../../utils/sweetAlert";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let nextValue = value;

    // Name: only letters and spaces
    if (name === "name") {
      nextValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    // Phone: only digits, maximum 10 digits
    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Email: remove spaces
    if (name === "email") {
      nextValue = value.replace(/\s/g, "");
    }

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : nextValue,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Name validation
    if (!name) {
      nextErrors.name = "Please enter your full name.";
    } else if (name.length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      nextErrors.name = "Name can contain only letters and spaces.";
    }

    // Email validation
    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    // Phone validation
    if (!phone) {
      nextErrors.phone = "Please enter your mobile number.";
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      nextErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    // Strong password validation
    if (!password) {
      nextErrors.password = "Please create a password.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password = "Password must contain an uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      nextErrors.password = "Password must contain a lowercase letter.";
    } else if (!/\d/.test(password)) {
      nextErrors.password = "Password must contain a number.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      nextErrors.password = "Password must contain a special character.";
    }

    // Confirm password
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    // Terms
    if (!formData.agreeTerms) {
      nextErrors.agreeTerms = "Please accept the Terms of Service and Privacy Policy.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      await showError("Check Your Details", "Please correct the highlighted fields before creating your account.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (!response?.success || !response?.registrationToken) {
        throw new Error(response?.message || "Unable to start registration.");
      }

      sessionStorage.setItem("br30_registration_token", response.registrationToken);

      sessionStorage.setItem("br30_registration_email", formData.email.trim().toLowerCase());

      await showSuccess("OTP Sent!", "A verification OTP has been sent to your email address.");

      navigate("/verify-email");
    } catch (error) {
      console.error("Registration failed:", error);

      await showError("Registration Failed", error?.message || "Something went wrong while creating your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="register-page">
      <div className="register-container">
        {/* LEFT FARM PANEL */}
        <div className="register-side">
          <div className="register-side-content">
            <span className="register-side-eyebrow">BR30 Kadaknath Farms</span>

            <h2>
              Your Farm.
              <br />
              Your Orders.
              <br />
              One Account.
            </h2>

            <p>Create your customer account and keep your BR30 Kadaknath Farms orders connected in one place.</p>

            <div className="register-benefits">
              <div className="register-benefit">
                <CheckCircle2 size={19} />
                <span>Easy order management</span>
              </div>

              <div className="register-benefit">
                <CheckCircle2 size={19} />
                <span>Track your farm orders</span>
              </div>

              <div className="register-benefit">
                <CheckCircle2 size={19} />
                <span>Faster future checkout</span>
              </div>
            </div>
          </div>

          <div className="register-side-decoration">BR30</div>
        </div>

        {/* RIGHT REGISTER FORM */}
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon">
              <UserPlus size={24} />
            </div>

            <span className="register-eyebrow">Customer Account</span>

            <h1>Create Your Account</h1>

            <p>Register with BR30 Kadaknath Farms to manage your orders and enjoy a smoother shopping experience.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* FULL NAME */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <div className={`input-wrapper ${errors.name ? "input-error" : ""}`}>
                <User size={18} />

                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" maxLength={60} />
              </div>

              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className={`input-wrapper ${errors.email ? "input-error" : ""}`}>
                <Mail size={18} />

                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" autoComplete="email" />
              </div>

              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* MOBILE */}
            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>

              <div className={`input-wrapper ${errors.phone ? "input-error" : ""}`}>
                <Phone size={18} />

                <span className="phone-prefix">+91</span>

                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} autoComplete="tel" />
              </div>

              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className={`input-wrapper ${errors.password ? "input-error" : ""}`}>
                <Lock size={18} />

                <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Example: Pan@kaj10" autoComplete="new-password" />

                <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className={`input-wrapper ${errors.confirmPassword ? "input-error" : ""}`}>
                <Lock size={18} />

                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" autoComplete="new-password" />

                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            {/* TERMS */}
            <div className="terms-group">
              <label className="checkbox-label">
                <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />

                <span className="custom-checkbox">{formData.agreeTerms && <CheckCircle2 size={16} />}</span>

                <span className="checkbox-text">
                  I agree to the <Link to="/terms-of-service">Terms of Service</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.
                </span>
              </label>

              {errors.agreeTerms && <span className="form-error">{errors.agreeTerms}</span>}
            </div>

            {/* SUBMIT */}
            <button type="submit" className="register-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="register-spinner" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="register-login">
            <span>Already have an account?</span>

            <Link to="/login">
              Login to your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`.register-page{min-height:calc(100vh - 80px);padding:70px 24px;background:radial-gradient(circle at 10% 10%,rgba(111,143,69,.12),transparent 32%),radial-gradient(circle at 90% 90%,rgba(201,154,61,.10),transparent 30%),var(--bg-soft)}.register-container{width:min(100%,1080px);margin:0 auto;display:grid;grid-template-columns:.95fr 1.05fr;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-lg)}.register-side{position:relative;min-height:100%;display:flex;align-items:center;overflow:hidden;padding:48px;background:radial-gradient(circle at 80% 15%,rgba(228,199,123,.18),transparent 28%),linear-gradient(145deg,var(--color-primary),var(--color-primary-soft));color:var(--color-white)}.register-side-content{position:relative;z-index:2;max-width:410px;transform:translateY(-70px)}.register-side-eyebrow{display:block;margin-bottom:12px;color:var(--color-gold-light);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.register-side h2{margin-bottom:18px;color:var(--color-white);font-size:clamp(2.1rem,4vw,3.2rem);line-height:1.08}.register-side p{max-width:390px;color:rgba(255,255,255,.85);font-size:.95rem}.register-benefits{display:flex;flex-direction:column;gap:14px;margin-top:28px}.register-benefit{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.9);font-size:.88rem;font-weight:600}.register-benefit svg{flex:0 0 auto;color:var(--color-gold-light)}.register-side-decoration{position:absolute;right:-50px;bottom:-65px;width:250px;height:250px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(228,199,123,.18);border-radius:50%;color:rgba(228,199,123,.12);font-size:4rem;font-weight:900;transform:rotate(-12deg)}.register-card{padding:48px}.register-header{max-width:540px;margin-bottom:30px}.register-icon{width:50px;height:50px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:18px;border-radius:14px;background:var(--color-green-pale);color:var(--color-green)}.register-eyebrow{display:block;margin-bottom:8px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.register-header h1{margin-bottom:12px;color:var(--color-primary);font-size:clamp(2rem,4vw,2.7rem);line-height:1.15}.register-header p{color:#1a120c;font-size:.98rem}.register-form{display:flex;flex-direction:column;gap:19px}.form-group{display:flex;flex-direction:column;gap:7px}.form-group label{color:var(--color-primary);font-size:.9rem;font-weight:700}.input-wrapper{min-height:52px;display:flex;align-items:center;gap:11px;padding:0 15px;border:1px solid var(--color-border-dark);border-radius:var(--radius-md);background:var(--color-white);color:var(--color-text-soft);transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.input-wrapper:focus-within{border-color:var(--color-green);box-shadow:0 0 0 3px rgba(63,107,53,.10)}.input-wrapper.input-error{border-color:var(--color-danger)}.input-wrapper input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--color-text);font-size:.95rem}.input-wrapper input::placeholder{color:var(--color-text-soft)}.phone-prefix{padding-right:10px;border-right:1px solid var(--color-border);color:var(--color-text);font-size:.9rem;font-weight:700}.password-toggle{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;padding:3px;border:0;background:transparent;color:var(--color-text-soft)}.password-toggle:hover{color:var(--color-green)}.form-error{color:var(--color-danger);font-size:.78rem;font-weight:600}.terms-group{margin-top:2px}.checkbox-label{display:flex;align-items:flex-start;gap:10px;cursor:pointer}.checkbox-label input{position:absolute;opacity:0;pointer-events:none}.custom-checkbox{width:19px;height:19px;flex:0 0 19px;display:inline-flex;align-items:center;justify-content:center;margin-top:1px;border:1px solid var(--color-border-dark);border-radius:5px;background:var(--color-white);color:var(--color-white)}.checkbox-label input:checked+.custom-checkbox{border-color:var(--color-green);background:var(--color-green)}.checkbox-text{color:#1a120c;font-size:.82rem;line-height:1.5}.checkbox-text a{color:var(--color-green);font-weight:700}.checkbox-text a:hover{text-decoration:underline}.register-submit{width:100%;min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;padding:0 20px;border:0;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-size:.95rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.register-submit:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.register-submit:disabled{cursor:not-allowed;opacity:.7}.register-spinner{width:17px;height:17px;border:2px solid rgba(255,255,255,.35);border-top-color:var(--color-white);border-radius:50%;animation:registerSpin .7s linear infinite}.register-login{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;margin-top:24px;padding-top:22px;border-top:1px solid var(--color-border);color:#1a120c;font-size:.86rem}.register-login a{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-weight:800}.register-login a:hover{color:var(--color-primary)}@keyframes registerSpin{to{transform:rotate(360deg)}}@media (max-width:900px){.register-container{grid-template-columns:1fr;max-width:650px}.register-side{min-height:300px;order:1}.register-card{order:2}.register-side-content{transform:translateY(-25px)}}@media (max-width:575px){.register-page{padding:35px 16px}.register-card{padding:30px 20px}.register-side{min-height:auto;padding:32px 24px}.register-side-content{transform:translateY(-15px)}.register-side h2{font-size:2rem}.register-side-decoration{width:180px;height:180px;right:-60px;bottom:-60px;font-size:2.7rem}}`}</style>
    </section>
  );
};

export default Register;
