import { ArrowRight, CheckCircle2, Clock3, Mail, MessageCircle, Phone, Send, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Headset } from "lucide-react";

import { showError, showSuccess } from "../utils/sweetAlert";

const GOOGLE_FORM_CONFIG = {
  actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd38ngLwpsc_Y9YahEZ-8yHDzX0BIZ5KUpbzQQw192hzO3DVg/formResponse",

  fields: {
    name: "entry.1741877007",
    email: "entry.1928802285",
    phone: "entry.1734529956",
    subject: "entry.996567389",
    message: "entry.1824655737",
  },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const whatsappNumber = "916200986380";

  const whatsappMessage = encodeURIComponent("Hello BR30 Kadaknath Farms,\n\nI would like to know more about your Kadaknath products and availability.\n\nPlease share the details with me.\n\nThank you.");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const emailSubject = encodeURIComponent("Inquiry - BR30 Kadaknath Farms");

  const emailBody = encodeURIComponent("Hello BR30 Kadaknath Farms,\n\nI would like to know more about your Kadaknath products and availability.\n\nPlease share the details with me.\n\nThank you.");

  const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1` + `&to=mukeshkumarsingh7488@gmail.com` + `&su=${emailSubject}` + `&body=${emailBody}`;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name) {
      showError("Name Required", "Please enter your name.");
      return;
    }

    if (!email) {
      showError("Email Required", "Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!phone) {
      showError("Phone Number Required", "Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showError("Invalid Phone Number", "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!subject) {
      showError("Subject Required", "Please enter a subject.");
      return;
    }

    if (!message) {
      showError("Message Required", "Please enter your message.");
      return;
    }

    setSubmitting(true);

    try {
      const formBody = new URLSearchParams();

      formBody.append(GOOGLE_FORM_CONFIG.fields.name, name);

      formBody.append(GOOGLE_FORM_CONFIG.fields.email, email);

      formBody.append(GOOGLE_FORM_CONFIG.fields.phone, phone);

      formBody.append(GOOGLE_FORM_CONFIG.fields.subject, subject);

      formBody.append(GOOGLE_FORM_CONFIG.fields.message, message);

      await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      });

      await showSuccess("Enquiry Sent!", "Thank you for contacting BR30 Kadaknath Farms. Our team will get back to you.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      showError("Something Went Wrong", "Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="contact-page">
        {/* HERO */}
        <section className="contact-hero">
          <div className="container">
            <div className="contact-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Contact</span>
            </div>

            <div className="contact-hero-grid">
              <div className="contact-hero-content">
                <span className="contact-eyebrow">Get In Touch</span>

                <h1>
                  We're Here to
                  <span> Help You.</span>
                </h1>

                <p>Have a question about Kadaknath eggs, chicken, chicks, breeding stock, availability, delivery or your order? Reach out to BR30 Kadaknath Farms.</p>

                <div className="contact-hero-actions">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-whatsapp-button">
                    <FaWhatsapp size={19} />
                    WhatsApp Us
                  </a>

                  <a href={emailUrl} target="_blank" rel="noopener noreferrer" className="contact-email-button">
                    <Mail size={18} />
                    Email Us
                  </a>
                </div>
              </div>

              <div className="contact-hero-card">
                <div className="contact-hero-card-icon">
                  <Headset size={29} strokeWidth={1.9} />
                </div>

                <span>BR30 Kadaknath Farms</span>

                <h2>
                  Let's talk about
                  <br />
                  your farm needs.
                </h2>

                <p>Our contact options make it easy to ask questions, discuss products or get help with an order.</p>

                <div className="contact-hero-card-line" />
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT OPTIONS */}
        <section className="contact-options-section section">
          <div className="container">
            <div className="section-heading center">
              <span className="section-eyebrow">Contact Options</span>

              <h2>Choose How You Want to Connect</h2>

              <p>Reach us directly through WhatsApp or email for product information, order assistance and general farm enquiries.</p>
            </div>

            <div className="contact-options-grid">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-option-card">
                <div className="contact-option-icon whatsapp">
                  <FaWhatsapp size={24} />
                </div>

                <div className="contact-option-content">
                  <span>Quick Response</span>

                  <h3>WhatsApp</h3>

                  <p>Chat with us about products, availability, orders and delivery.</p>

                  <strong>
                    +91 62009 86380
                    <ArrowRight size={16} />
                  </strong>
                </div>
              </a>

              <a href={emailUrl} className="contact-option-card">
                <div className="contact-option-icon">
                  <Mail size={24} />
                </div>

                <div className="contact-option-content">
                  <span>Send an Enquiry</span>
                  <h3>Email</h3>

                  <p>Send us your detailed enquiry and we'll get back to you.</p>

                  <strong>
                    mukeshkumarsingh7488@gmail.com
                    <ArrowRight size={16} />
                  </strong>
                </div>
              </a>
              <div className="contact-option-card">
                <div className="contact-option-icon">
                  <Phone size={24} />
                </div>

                <div className="contact-option-content">
                  <span>Order & Support</span>
                  <h3>Phone</h3>

                  <p>For direct assistance with your enquiry or order-related questions.</p>

                  <strong>+91 62009 86380</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="contact-form-section section-soft section">
          <div className="container">
            <div className="contact-form-grid">
              <div className="contact-form-intro">
                <span className="section-eyebrow">Send An Enquiry</span>

                <h2>Tell Us How We Can Help.</h2>

                <p>Fill out the form and share your question with us. This form is currently frontend-only and will be connected to our enquiry system later.</p>

                <div className="contact-form-points">
                  <div>
                    <CheckCircle2 size={18} />
                    <span>Product & availability enquiries</span>
                  </div>

                  <div>
                    <CheckCircle2 size={18} />
                    <span>Order assistance</span>
                  </div>

                  <div>
                    <CheckCircle2 size={18} />
                    <span>Delivery-related questions</span>
                  </div>

                  <div>
                    <CheckCircle2 size={18} />
                    <span>Farm & breeding enquiries</span>
                  </div>
                </div>
              </div>

              <form className="contact-form-card" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Full Name</label>

                    <input id="contact-name" name="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} disabled={submitting} />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-email">Email Address</label>

                    <input id="contact-email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={submitting} />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-phone">Mobile Number</label>

                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength="10"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "");

                        setFormData((current) => ({
                          ...current,
                          phone: value.slice(0, 10),
                        }));
                      }}
                      disabled={submitting}
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-subject">Subject</label>

                    <input id="contact-subject" name="subject" type="text" placeholder="What can we help with?" value={formData.subject} onChange={handleChange} disabled={submitting} />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-message">Message</label>

                  <textarea id="contact-message" name="message" rows="6" placeholder="Write your enquiry here..." value={formData.message} onChange={handleChange} disabled={submitting} />
                </div>

                <button type="submit" className="contact-submit-button" disabled={submitting}>
                  <Send size={17} />

                  {submitting ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ORDER HELP */}
        <section className="contact-help-section section">
          <div className="container">
            <div className="section-heading center">
              <span className="section-eyebrow">Need Help?</span>

              <h2>We're Here for Your Farm & Order Questions</h2>

              <p>Find quick help for orders, delivery and frequently asked questions.</p>
            </div>

            <div className="contact-help-grid">
              <div className="contact-help-card">
                <div className="contact-help-icon">
                  <ShoppingBag size={23} />
                </div>

                <div>
                  <h3>Order Help</h3>

                  <p>Need help with an existing order or want to discuss a product before ordering?</p>

                  <Link to="/my-orders">
                    My Orders
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="contact-help-card">
                <div className="contact-help-icon">
                  <Clock3 size={23} />
                </div>

                <div>
                  <h3>Track Your Order</h3>

                  <p>Already placed an order? Use your order ID to check its current status.</p>

                  <Link to="/track-order">
                    Track Order
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="contact-help-card">
                <div className="contact-help-icon">
                  <CheckCircle2 size={23} />
                </div>

                <div>
                  <h3>Frequently Asked Questions</h3>

                  <p>Find answers about products, delivery, ordering and other common questions.</p>

                  <Link to="/faq">
                    Visit FAQ
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="contact-final-section section">
          <div className="container">
            <div className="contact-final-card">
              <div>
                <span className="section-eyebrow">BR30 Kadaknath Farms</span>

                <h2>Looking for Kadaknath Products?</h2>

                <p>Explore our available products or contact us directly for more information.</p>
              </div>

              <div className="contact-final-actions">
                <Link to="/products" className="btn btn-primary">
                  Explore Products
                  <ArrowRight size={17} />
                </Link>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <FaWhatsapp size={18} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`.contact-page{background:var(--bg-page);color:var(--color-text)}.contact-hero{padding:38px 0 85px;background:radial-gradient(circle at 85% 20%,rgba(201,154,61,.12),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}.contact-breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:55px;color:var(--color-text-soft);font-size:.8rem}.contact-breadcrumb a{color:var(--color-green);font-weight:700}.contact-hero-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);align-items:center;gap:70px}.contact-eyebrow{display:inline-block;margin-bottom:13px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.contact-hero-content h1{max-width:700px;margin-bottom:20px;color:var(--color-primary);font-size:clamp(2.8rem,5vw,4.7rem);line-height:1.08;letter-spacing:-.055em}.contact-hero-content h1 span{display:block;color:var(--color-green)}.contact-hero-content>p{max-width:680px;margin-bottom:28px;color:#1a120c;font-size:1rem;line-height:1.85}.contact-hero-actions{display:flex;flex-wrap:wrap;gap:10px}.contact-whatsapp-button,.contact-email-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 20px;border-radius:var(--radius-pill);font-size:.86rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast),box-shadow var(--transition-fast)}.contact-whatsapp-button{color:var(--color-white);background:var(--color-green)}.contact-whatsapp-button:hover{background:var(--color-primary);transform:translateY(-2px);box-shadow:var(--shadow-md)}.contact-email-button{color:var(--color-primary);background:var(--color-white);border:1px solid var(--color-border-dark)}.contact-email-button:hover{color:var(--color-white);background:var(--color-primary);border-color:var(--color-primary);transform:translateY(-2px)}.contact-hero-card{position:relative;padding:38px;overflow:hidden;border-radius:var(--radius-xl);background:var(--color-primary);box-shadow:var(--shadow-lg)}.contact-hero-card::before{content:\"\";position:absolute;width:210px;height:210px;top:-100px;right:-80px;border:1px solid rgba(255,255,255,.1);border-radius:50%}.contact-hero-card-icon{position:relative;display:grid;place-items:center;width:62px;height:62px;margin-bottom:23px;border-radius:17px;background:rgba(201,154,61,.16);color:var(--color-gold-light)}.contact-hero-card>span{position:relative;color:var(--color-gold-light);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.contact-hero-card h2{position:relative;margin:12px 0 15px;color:var(--color-white);font-size:clamp(1.8rem,3vw,2.45rem);letter-spacing:-.04em}.contact-hero-card p{position:relative;color:rgba(255,255,255,.85);font-size:.86rem;line-height:1.75}.contact-hero-card-line{position:relative;width:70px;height:3px;margin-top:28px;border-radius:999px;background:var(--color-gold)}.contact-options-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.contact-option-card{display:flex;gap:18px;padding:27px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm);transition:transform var(--transition-normal),box-shadow var(--transition-normal),border-color var(--transition-normal)}.contact-option-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-md);border-color:var(--color-border-dark)}.contact-option-icon{display:grid;place-items:center;flex-shrink:0;width:50px;height:50px;border-radius:14px;background:var(--color-green-pale);color:var(--color-green)}.contact-option-icon.whatsapp{background:var(--color-green-pale)}.contact-option-content{min-width:0}.contact-option-content>span{color:#1a120c;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.contact-option-content h3{margin:5px 0 8px;color:var(--color-primary);font-size:1.15rem}.contact-option-content p{margin-bottom:15px;color:#1a120c;font-size:.8rem;line-height:1.65}.contact-option-content strong{display:flex;align-items:center;gap:7px;color:var(--color-green);font-size:.75rem;word-break:break-word}.contact-form-grid{display:grid;grid-template-columns:.75fr 1.25fr;align-items:start;gap:65px}.contact-form-intro h2{max-width:500px;margin-bottom:16px;color:var(--color-primary);font-size:clamp(2rem,4vw,3rem);letter-spacing:-.04em}.contact-form-intro>p{max-width:520px;color:#1a120c;font-size:.9rem;line-height:1.8}.contact-form-points{display:grid;gap:12px;margin-top:27px}.contact-form-points div{display:flex;align-items:center;gap:9px;color:#1a120c;font-size:.8rem;font-weight:700}.contact-form-points svg{flex-shrink:0;color:var(--color-green)}.contact-form-card{padding:32px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.contact-form-row{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.contact-field{display:grid;gap:7px;margin-bottom:17px}.contact-field label{color:var(--color-primary);font-size:.76rem;font-weight:800}.contact-field input,.contact-field textarea{width:100%;padding:12px 14px;border:1px solid var(--color-border-dark);border-radius:10px;outline:none;background:var(--color-white);color:var(--color-text);font-size:.82rem;transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.contact-field input{min-height:46px}.contact-field textarea{min-height:135px;resize:vertical;line-height:1.6}.contact-field input::placeholder,.contact-field textarea::placeholder{color:var(--color-text-soft)}.contact-field input:focus,.contact-field textarea:focus{border-color:var(--color-green);box-shadow:0 0 0 3px rgba(63,107,53,.1)}.contact-field input:disabled,.contact-field textarea:disabled{cursor:not-allowed;opacity:.65}.contact-submit-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin-top:3px;border:0;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-size:.85rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.contact-submit-button:hover:not(:disabled){background:var(--color-primary);transform:translateY(-2px);box-shadow:var(--shadow-md)}.contact-submit-button:disabled{cursor:not-allowed;opacity:.65}.contact-help-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.contact-help-card{display:grid;grid-template-columns:auto 1fr;gap:17px;padding:27px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.contact-help-icon{display:grid;place-items:center;width:47px;height:47px;border-radius:13px;background:var(--color-green-pale);color:var(--color-green)}.contact-help-card h3{margin-bottom:8px;color:var(--color-primary);font-size:1rem}.contact-help-card p{margin-bottom:14px;color:#1a120c;font-size:.78rem;line-height:1.7}.contact-help-card a{display:inline-flex;align-items:center;gap:6px;color:var(--color-green);font-size:.76rem;font-weight:800}.contact-help-card a:hover{color:var(--color-primary)}.contact-final-section{padding-top:20px}.contact-final-card{display:flex;align-items:center;justify-content:space-between;gap:35px;padding:40px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-cream)}.contact-final-card h2{margin:5px 0 9px;color:var(--color-primary);font-size:clamp(1.7rem,3vw,2.35rem);letter-spacing:-.035em}.contact-final-card p{color:#1a120c;font-size:.84rem}.contact-final-actions{display:flex;flex-shrink:0;flex-wrap:wrap;gap:10px}@media (max-width:991px){.contact-hero-grid{grid-template-columns:1fr;gap:40px}.contact-hero-card{max-width:620px}.contact-options-grid{grid-template-columns:1fr}.contact-form-grid{grid-template-columns:1fr;gap:40px}.contact-help-grid{grid-template-columns:1fr}.contact-final-card{align-items:flex-start;flex-direction:column}}@media (max-width:767px){.contact-hero{padding:28px 0 65px}.contact-breadcrumb{margin-bottom:40px}.contact-hero-content h1{font-size:clamp(2.4rem,11vw,3.5rem)}.contact-hero-content>p{font-size:.92rem}.contact-hero-actions{flex-direction:column;align-items:stretch}.contact-whatsapp-button,.contact-email-button{width:100%}.contact-hero-card{padding:28px}.contact-option-card{padding:22px}.contact-form-row{grid-template-columns:1fr;gap:0}.contact-form-card{padding:23px 19px}.contact-final-card{padding:30px 24px}.contact-final-actions{width:100%;flex-direction:column}.contact-final-actions .btn{width:100%}}`}</style>
    </>
  );
};

export default Contact;
