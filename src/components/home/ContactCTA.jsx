import { ArrowRight, CheckCircle2, Mail, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { Headset } from "lucide-react";

const ContactCTA = () => {
  const whatsappNumber = "916200986380";

  const whatsappMessage = encodeURIComponent("Hello BR30 Kadaknath Farms,\n\nI would like to know more about your Kadaknath products and availability.\n\nPlease share the details with me.\n\nThank you.");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const emailSubject = encodeURIComponent("Inquiry - BR30 Kadaknath Farms");

  const emailBody = encodeURIComponent("Hello BR30 Kadaknath Farms,\n\nI would like to know more about your Kadaknath products and availability.\n\nPlease share the details with me.\n\nThank you.");

  const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1` + `&to=mukeshkumarsingh7488@gmail.com` + `&su=${emailSubject}` + `&body=${emailBody}`;

  return (
    <section className="contact-cta-section" id="contact-cta">
      <div className="container">
        <div className="contact-cta-card">
          {/* Main Content */}
          <div className="contact-cta-content">
            <span className="section-eyebrow">Get In Touch</span>

            <h2>Have a Question About Our Farm or Products?</h2>

            <p>Whether you want to know more about Kadaknath products, availability, delivery or placing an order, our team is here to help.</p>

            {/* Contact Buttons */}
            <div className="contact-cta-actions">
              <Link to="/contact" className="contact-primary-button">
                Contact Us
                <ArrowRight size={18} />
              </Link>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-whatsapp-button">
                <FaWhatsapp size={19} />
                WhatsApp Us
              </a>

              <a href={emailUrl} target="_blank" rel="noopener noreferrer" className="contact-email-button">
                <Mail size={18} />
                Email Us
              </a>
            </div>

            <Link to="/products" className="contact-products-link">
              <ShoppingBag size={16} />
              Explore Our Products
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Contact Information Card */}
          <div className="contact-cta-side">
            <div className="contact-icon">
              <Headset size={28} />
            </div>

            <div className="contact-side-content">
              <span>We're here to help</span>
              <strong>Talk to BR30 Farms</strong>
            </div>
            {/* WhatsApp */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-info-link">
              <div className="contact-info-icon">
                <FaWhatsapp size={18} />
              </div>

              <div>
                <span>WhatsApp</span>
                <strong>+91 62009 86380</strong>
              </div>

              <ArrowRight size={16} />
            </a>

            {/* Email */}
            <a href={emailUrl} className="contact-info-link">
              <div className="contact-info-icon">
                <Mail size={17} />
              </div>

              <div>
                <span>Email</span>
                <strong>mukeshkumarsingh7488@gmail.com</strong>
              </div>

              <ArrowRight size={16} />
            </a>
            <div className="contact-line">
              <Phone size={16} />
              <span>Order & Delivery Support</span>
            </div>
          </div>
        </div>

        {/* Trust Points */}
        <div className="contact-trust-row">
          <div>
            <CheckCircle2 size={17} />
            <span>Product Information</span>
          </div>

          <div>
            <CheckCircle2 size={17} />
            <span>Order Assistance</span>
          </div>

          <div>
            <CheckCircle2 size={17} />
            <span>Delivery Support</span>
          </div>

          <div>
            <CheckCircle2 size={17} />
            <span>Farm Enquiries</span>
          </div>
        </div>
      </div>

      <style>{`.contact-cta-section{padding:90px 0;background:var(--bg-page)}.contact-cta-card{position:relative;display:grid;grid-template-columns:1.25fr .75fr;gap:50px;min-height:400px;padding:55px;overflow:hidden;background:var(--color-green);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg)}.contact-cta-card::before{content:"";position:absolute;width:330px;height:330px;top:-170px;right:180px;border:1px solid rgba(255,255,255,.1);border-radius:50%}.contact-cta-card::after{content:"";position:absolute;width:430px;height:430px;right:-230px;bottom:-260px;border:1px solid rgba(255,255,255,.08);border-radius:50%}.contact-cta-content{position:relative;z-index:1;align-self:center}.contact-cta-content .section-eyebrow{color:var(--color-gold-light)}.contact-cta-content h2{max-width:680px;margin-bottom:18px;color:var(--color-white);font-size:clamp(2rem,4vw,3.1rem);line-height:1.12;letter-spacing:-.035em}.contact-cta-content p{max-width:610px;margin-bottom:28px;color:rgba(255,255,255,.85);font-size:1rem;line-height:1.8}.contact-cta-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.contact-primary-button,.contact-whatsapp-button,.contact-email-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 19px;border-radius:var(--radius-pill);font-size:.88rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast),box-shadow var(--transition-fast)}.contact-primary-button{color:var(--color-primary);background:var(--color-gold)}.contact-primary-button:hover{background:var(--color-gold-light);transform:translateY(-2px);box-shadow:var(--shadow-md)}.contact-whatsapp-button{color:var(--color-white);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28)}.contact-whatsapp-button:hover{color:var(--color-primary);background:var(--color-white);border-color:var(--color-white);transform:translateY(-2px)}.contact-email-button{color:var(--color-white);background:transparent;border:1px solid rgba(255,255,255,.28)}.contact-email-button:hover{color:var(--color-primary);background:var(--color-white);border-color:var(--color-white);transform:translateY(-2px)}.contact-products-link{display:inline-flex;align-items:center;gap:7px;margin-top:23px;color:rgba(255,255,255,.85);font-size:.82rem;font-weight:700;transition:color var(--transition-fast),transform var(--transition-fast)}.contact-products-link:hover{color:var(--color-gold-light);transform:translateX(3px)}.contact-cta-side{position:relative;z-index:1;align-self:center;display:flex;flex-direction:column;justify-content:center;min-height:300px;padding:30px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:var(--radius-lg);backdrop-filter:blur(8px)}.contact-icon{display:flex;align-items:center;justify-content:center;width:58px;height:58px;margin-bottom:18px;color:var(--color-primary);background:var(--color-gold);border-radius:50%}.contact-side-content{display:flex;flex-direction:column;margin-bottom:20px}.contact-side-content span{margin-bottom:3px;color:rgba(255,255,255,.85);font-size:.76rem}.contact-side-content strong{color:var(--color-white);font-size:1.2rem}.contact-info-link{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;padding:12px 0;color:var(--color-white);border-top:1px solid rgba(255,255,255,.1);transition:transform var(--transition-fast)}.contact-info-link:hover{transform:translateX(4px)}.contact-info-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.09);color:var(--color-gold-light)}.contact-info-link>div:nth-child(2){min-width:0;display:flex;flex-direction:column;gap:1px}.contact-info-link span{color:rgba(255,255,255,.85);font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.contact-info-link strong{overflow:hidden;color:var(--color-white);font-size:.78rem;text-overflow:ellipsis;white-space:nowrap}.contact-info-link>svg{color:rgba(255,255,255,.75)}.contact-line{display:flex;align-items:center;gap:8px;width:100%;margin-top:8px;padding-top:15px;color:rgba(255,255,255,.85);border-top:1px solid rgba(255,255,255,.12);font-size:.78rem}.contact-line svg{flex:0 0 auto;color:var(--color-gold-light)}.contact-trust-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px}.contact-trust-row>div{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:10px 14px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-white);color:var(--color-text-soft);font-size:.76rem;font-weight:700}.contact-trust-row svg{flex-shrink:0;color:var(--color-green)}@media (max-width:991px){.contact-cta-card{grid-template-columns:1fr;gap:35px;padding:45px}.contact-cta-side{min-height:auto}.contact-trust-row{grid-template-columns:repeat(2,1fr)}}@media (max-width:767px){.contact-cta-section{padding:65px 0}.contact-cta-card{gap:30px;padding:32px 22px;border-radius:var(--radius-lg)}.contact-cta-content h2{font-size:2rem}.contact-cta-actions{flex-direction:column;align-items:stretch}.contact-primary-button,.contact-whatsapp-button,.contact-email-button{width:100%}.contact-cta-side{padding:25px 20px}.contact-trust-row{grid-template-columns:1fr}.contact-trust-row>div{justify-content:flex-start}}@media (max-width:480px){.contact-cta-card{padding:28px 18px}.contact-cta-content h2{font-size:1.8rem}.contact-info-link strong{font-size:.72rem}}`}</style>
    </section>
  );
};

export default ContactCTA;
