import { ArrowRight, CheckCircle2, ChevronRight, FileCheck2, FileText, Mail, ShieldCheck, ShoppingBag, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const lastUpdated = "17 September 2026";
  const effectiveFrom = "17 September 2026";

  const sections = [
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "about", label: "About Our Services" },
    { id: "eligibility", label: "Eligibility" },
    { id: "accounts", label: "Customer Accounts" },
    { id: "products", label: "Products & Availability" },
    { id: "orders", label: "Orders" },
    { id: "pricing", label: "Pricing & Payments" },
    { id: "delivery", label: "Delivery" },
    { id: "returns", label: "Returns & Refunds" },
    { id: "conduct", label: "Customer Conduct" },
    { id: "intellectual", label: "Intellectual Property" },
    { id: "liability", label: "Liability" },
    { id: "changes", label: "Changes to Terms" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <main className="legal-page terms-page">
      <section className="legal-hero">
        <div className="container">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={15} />
            <span>Terms of Service</span>
          </div>

          <div className="legal-hero-grid">
            <div className="legal-hero-content">
              <div className="legal-icon">
                <FileCheck2 size={30} />
              </div>

              <span className="legal-eyebrow">LEGAL & CUSTOMER TERMS</span>

              <h1>Terms of Service</h1>

              <p>These Terms of Service explain the rules and conditions that apply when you access the BR30 Kadaknath Farms website, create an account, purchase products, or use our services.</p>

              <div className="legal-meta">
                <div>
                  <span>Last Updated</span>
                  <strong>{lastUpdated}</strong>
                </div>

                <div>
                  <span>Effective From</span>
                  <strong>{effectiveFrom}</strong>
                </div>

                <div>
                  <span>Version</span>
                  <strong>1.0</strong>
                </div>
              </div>
            </div>

            <div className="legal-trust-card">
              <div className="trust-card-icon">
                <UserCheck size={24} />
              </div>

              <h2>Clear terms for a better experience.</h2>

              <p>Our goal is to make ordering from BR30 Kadaknath Farms straightforward, transparent, and easy to understand.</p>

              <div className="trust-points">
                <div>
                  <CheckCircle2 size={17} />
                  <span>Clear product and order information</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Transparent customer responsibilities</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Fair and structured service terms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="legal-content-section">
        <div className="container legal-layout">
          <aside className="legal-sidebar">
            <div className="legal-sidebar-inner">
              <div className="sidebar-title">
                <FileText size={18} />
                <span>On This Page</span>
              </div>

              <nav>
                {sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    {section.label}
                    <ArrowRight size={13} />
                  </a>
                ))}
              </nav>

              <div className="sidebar-help">
                <Mail size={18} />

                <div>
                  <strong>Have a question?</strong>
                  <span>Our team is here to help.</span>
                </div>

                <Link to="/contact">Contact Us</Link>
              </div>
            </div>
          </aside>

          <article className="legal-document">
            <div className="legal-notice">
              <ShieldCheck size={21} />

              <div>
                <strong>Please read these terms carefully</strong>

                <p>By accessing our website or using our services, you agree to follow these Terms of Service and the policies referenced within them.</p>
              </div>
            </div>

            <section id="acceptance" className="legal-section">
              <div className="section-number">01</div>

              <div>
                <h2>Acceptance of Terms</h2>

                <p>These Terms of Service ("Terms") govern your access to and use of the BR30 Kadaknath Farms website and related services.</p>

                <p>By accessing the website, creating an account, placing an order, or otherwise using our services, you agree to be bound by these Terms.</p>

                <p>If you do not agree with these Terms, please do not use our website or services.</p>
              </div>
            </section>

            <section id="about" className="legal-section">
              <div className="section-number">02</div>

              <div>
                <h2>About Our Services</h2>

                <p>BR30 Kadaknath Farms provides information about our farm and offers Kadaknath-related products through our online platform.</p>

                <div className="terms-feature-grid">
                  <div className="terms-feature">
                    <ShoppingBag size={21} />
                    <h3>Farm Products</h3>
                    <p>Eggs, chicken, chicks, hatching eggs, breeding products, and other products offered from time to time.</p>
                  </div>

                  <div className="terms-feature">
                    <FileText size={21} />
                    <h3>Online Services</h3>
                    <p>Product browsing, customer accounts, order management, delivery information, and customer support.</p>
                  </div>
                </div>

                <p>Product availability, pricing, delivery areas, and other service details may change from time to time.</p>
              </div>
            </section>

            <section id="eligibility" className="legal-section">
              <div className="section-number">03</div>

              <div>
                <h2>Eligibility</h2>

                <p>You must be legally capable of entering into a binding transaction under applicable law to place an order through our website.</p>

                <p>If you are using the website on behalf of another person or organisation, you confirm that you are authorised to act on their behalf.</p>
              </div>
            </section>

            <section id="accounts" className="legal-section">
              <div className="section-number">04</div>

              <div>
                <h2>Customer Accounts</h2>

                <p>Certain features may require you to create an account. You are responsible for providing accurate information and keeping your account information reasonably up to date.</p>

                <ul className="legal-list">
                  <li>Keep your login credentials confidential and secure.</li>
                  <li>Do not share your password or OTP with another person.</li>
                  <li>Notify us if you believe your account has been accessed without permission.</li>
                  <li>Do not create an account using false or misleading information.</li>
                </ul>

                <p>We may restrict or suspend an account where reasonably necessary to protect our services, customers, or legal interests.</p>
              </div>
            </section>

            <section id="products" className="legal-section">
              <div className="section-number">05</div>

              <div>
                <h2>Products & Availability</h2>

                <p>We make reasonable efforts to display product names, descriptions, images, quantities, prices, and availability accurately.</p>

                <p>Natural farm products may vary in appearance, size, weight, colour, or other characteristics. Images displayed on the website may therefore be illustrative.</p>

                <div className="legal-callout">
                  <strong>Availability can change.</strong>

                  <span>Products, quantities, breeding stock, chicks, eggs, live birds, and other farm items may be subject to current farm availability.</span>
                </div>

                <p>We reserve the right to limit quantities, discontinue products, or correct obvious product information errors.</p>
              </div>
            </section>

            <section id="orders" className="legal-section">
              <div className="section-number">06</div>

              <div>
                <h2>Orders</h2>

                <p>Adding a product to your cart does not by itself guarantee availability or create a completed purchase.</p>

                <p>An order is submitted when you complete the applicable checkout process. Order acceptance may depend on product availability, delivery feasibility, payment status, and other applicable checks.</p>

                <p>If we cannot fulfil an order, we may contact you regarding cancellation, substitution where appropriate, or refund of an amount already paid.</p>

                <div className="process-card">
                  <div>
                    <span>01</span>
                    <strong>Order Submitted</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>02</span>
                    <strong>Order Confirmed</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>03</span>
                    <strong>Prepared & Delivered</strong>
                  </div>
                </div>
              </div>
            </section>

            <section id="pricing" className="legal-section">
              <div className="section-number">07</div>

              <div>
                <h2>Pricing & Payments</h2>

                <p>Product prices displayed on the website are shown in Indian Rupees unless stated otherwise.</p>

                <p>Applicable delivery charges, taxes, fees, or other charges will be displayed during the ordering process where applicable.</p>

                <p>Payment may be processed through third-party payment providers. Your use of such payment services may also be subject to the provider's own terms and policies.</p>

                <div className="security-banner">
                  <ShieldCheck size={23} />

                  <div>
                    <strong>Payment security</strong>
                    <span>We do not ask customers to share card PINs, UPI PINs, passwords, or OTPs with our staff.</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="delivery" className="legal-section">
              <div className="section-number">08</div>

              <div>
                <h2>Delivery</h2>

                <p>Delivery is available only in areas currently served by BR30 Kadaknath Farms or its delivery partners.</p>

                <p>Estimated delivery timelines may vary based on product type, location, farm availability, order volume, weather, logistics, and other circumstances.</p>

                <p>Customers are responsible for providing a correct and complete delivery address and reachable contact information.</p>

                <ul className="legal-list">
                  <li>Someone should be available to receive the delivery where required.</li>
                  <li>Customers should inspect applicable products promptly after delivery.</li>
                  <li>Delivery may be delayed or unavailable in certain locations or circumstances.</li>
                </ul>
              </div>
            </section>

            <section id="returns" className="legal-section">
              <div className="section-number">09</div>

              <div>
                <h2>Returns & Refunds</h2>

                <p>Returns, cancellations, replacements, and refunds are governed by our separate Refund Policy.</p>

                <p>Because certain farm products may be perishable, live, or time-sensitive, eligibility and applicable timelines may differ by product.</p>

                <p>
                  Please review the{" "}
                  <Link className="inline-link" to="/refund-policy">
                    Refund Policy
                  </Link>{" "}
                  before placing an order.
                </p>
              </div>
            </section>

            <section id="conduct" className="legal-section">
              <div className="section-number">10</div>

              <div>
                <h2>Customer Conduct</h2>

                <p>You agree not to misuse our website, services, systems, or customer support channels.</p>

                <ul className="legal-list">
                  <li>Do not attempt unauthorised access to accounts, systems, or data.</li>
                  <li>Do not submit fraudulent orders or intentionally provide false information.</li>
                  <li>Do not interfere with the operation or security of the website.</li>
                  <li>Do not use automated methods to abuse, scrape, or overload our services without permission.</li>
                  <li>Do not use our services for unlawful activities.</li>
                </ul>

                <p>We may take appropriate action where misuse or unlawful activity is identified.</p>
              </div>
            </section>

            <section id="intellectual" className="legal-section">
              <div className="section-number">11</div>

              <div>
                <h2>Intellectual Property</h2>

                <p>Unless otherwise stated, the website and its content, including branding, logos, text, graphics, photographs, layouts, designs, and software, are owned by or licensed to BR30 Kadaknath Farms or the relevant rights holder.</p>

                <p>You may access the website for personal and lawful purposes. You may not reproduce, distribute, modify, sell, or commercially exploit website content without appropriate permission.</p>
              </div>
            </section>

            <section id="liability" className="legal-section">
              <div className="section-number">12</div>

              <div>
                <h2>Liability & Service Limitations</h2>

                <p>We make reasonable efforts to maintain accurate information and reliable services, but we do not guarantee that the website will always be uninterrupted, error-free, or available at every time.</p>

                <p>
                  To the extent permitted by applicable law, we are not responsible for losses resulting from circumstances beyond our reasonable control, including certain technical failures, third-party service interruptions, extraordinary weather events, logistics disruptions, or other unforeseen
                  events.
                </p>

                <p>Nothing in these Terms is intended to exclude or limit any consumer rights or liability that cannot lawfully be excluded or limited under applicable law.</p>
              </div>
            </section>

            <section id="changes" className="legal-section">
              <div className="section-number">13</div>

              <div>
                <h2>Changes to These Terms</h2>

                <p>We may update these Terms from time to time to reflect changes in our services, business practices, technology, or applicable legal requirements.</p>

                <p>Updated Terms will be published on this page with a revised "Last Updated" and, where appropriate, "Effective From" date.</p>

                <div className="date-card">
                  <div>
                    <span>Current Version</span>
                    <strong>Version 1.0</strong>
                  </div>

                  <div>
                    <span>Last Updated</span>
                    <strong>{lastUpdated}</strong>
                  </div>

                  <div>
                    <span>Effective From</span>
                    <strong>{effectiveFrom}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section id="contact" className="legal-section">
              <div className="section-number">14</div>

              <div>
                <h2>Contact Us</h2>

                <p>If you have questions about these Terms of Service, your order, or our services, please contact BR30 Kadaknath Farms.</p>

                <div className="contact-legal-card">
                  <div className="contact-legal-icon">
                    <Mail size={22} />
                  </div>

                  <div>
                    <span>Customer Support</span>
                    <strong>BR30 Kadaknath Farms</strong>
                    <p>Our Contact page can be used for questions and support requests.</p>
                  </div>

                  <Link to="/contact">
                    Contact Us
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </section>

            <div className="legal-footer-note">
              <ShieldCheck size={18} />

              <p>These Terms should be read together with our Privacy Policy, Refund Policy, and Shipping Policy, where applicable.</p>
            </div>
          </article>
        </div>
      </section>

      <style>{`.legal-page{background:#fbfaf5;color:var(--color-text)}.legal-hero{padding:38px 0 72px;background:radial-gradient(circle at 85% 20%,rgba(201,154,61,.11),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}.legal-breadcrumb{display:flex;align-items:center;gap:7px;margin-bottom:42px;color:var(--color-text-soft);font-size:.82rem}.legal-breadcrumb a{color:var(--color-green);font-weight:700}.legal-hero-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);align-items:center;gap:60px}.legal-icon{display:grid;place-items:center;width:64px;height:64px;margin-bottom:20px;border:1px solid rgba(63,107,53,.16);border-radius:18px;background:var(--color-green-pale);color:var(--color-green)}.legal-eyebrow{display:block;margin-bottom:10px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em}.legal-hero-content h1{margin-bottom:18px;color:var(--color-primary);font-size:clamp(2.7rem,5vw,4.5rem);letter-spacing:-.05em}.legal-hero-content>p{max-width:750px;color:#1a120c;font-size:1.02rem;line-height:1.8}.legal-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.legal-meta>div{min-width:175px;padding:13px 16px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:rgba(255,253,247,.78)}.legal-meta span{display:block;margin-bottom:3px;color:var(--color-text-soft);font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.legal-meta strong{color:var(--color-primary);font-size:.84rem}.legal-trust-card{padding:28px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.trust-card-icon{display:grid;place-items:center;width:50px;height:50px;margin-bottom:18px;border-radius:15px;background:var(--color-primary);color:var(--color-gold-light)}.legal-trust-card h2{margin-bottom:10px;color:var(--color-primary);font-size:1.35rem}.legal-trust-card>p{color:#1a120c;font-size:.86rem;line-height:1.7}.trust-points{display:grid;gap:11px;margin-top:20px;padding-top:18px;border-top:1px solid var(--color-border)}.trust-points div{display:flex;align-items:center;gap:9px;color:#1a120c;font-size:.8rem}.trust-points svg{flex-shrink:0;color:var(--color-green)}.legal-content-section{padding:75px 0 100px}.legal-layout{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start;gap:55px}.legal-sidebar{position:sticky;top:105px}.legal-sidebar-inner{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.sidebar-title{display:flex;align-items:center;gap:9px;padding:17px 18px;border-bottom:1px solid var(--color-border);color:var(--color-primary);font-size:.83rem;font-weight:800}.sidebar-title svg{color:var(--color-green)}.legal-sidebar nav{padding:8px}.legal-sidebar nav a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-radius:8px;color:var(--color-text);font-size:.76rem;transition:background var(--transition-fast),color var(--transition-fast)}.legal-sidebar nav a:hover{background:var(--color-green-pale);color:var(--color-green)}.sidebar-help{display:grid;grid-template-columns:auto 1fr;gap:9px;margin:8px;padding:14px;border-radius:var(--radius-md);background:var(--color-cream)}.sidebar-help>svg{color:var(--color-green)}.sidebar-help div{display:grid;gap:2px}.sidebar-help strong{color:var(--color-primary);font-size:.76rem}.sidebar-help span{color:#1a120c;font-size:.68rem;line-height:1.4}.sidebar-help a{grid-column:1/-1;margin-top:3px;color:var(--color-green);font-size:.72rem;font-weight:800}.legal-document{min-width:0}.legal-notice{display:flex;gap:14px;margin-bottom:50px;padding:20px 22px;border:1px solid rgba(63,107,53,.18);border-radius:var(--radius-lg);background:var(--color-green-pale)}.legal-notice>svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.legal-notice strong{display:block;margin-bottom:5px;color:var(--color-primary);font-size:.9rem}.legal-notice p{color:#1a120c;font-size:.8rem;line-height:1.65}.legal-section{display:grid;grid-template-columns:48px minmax(0,1fr);gap:20px;padding:0 0 48px;margin-bottom:48px;border-bottom:1px solid var(--color-border);scroll-margin-top:110px}.section-number{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--color-primary);color:var(--color-gold-light);font-size:.68rem;font-weight:800}.legal-section h2{margin-bottom:16px;color:var(--color-primary);font-size:clamp(1.45rem,2vw,1.85rem);letter-spacing:-.025em}.legal-section p{margin-bottom:14px;color:#1a120c;font-size:.9rem;line-height:1.85}.legal-list{display:grid;gap:10px;margin:17px 0}.legal-list li{position:relative;padding-left:22px;color:#1a120c;font-size:.88rem;line-height:1.65}.legal-list li::before{content:"";position:absolute;left:4px;top:.7em;width:6px;height:6px;border-radius:50%;background:var(--color-green)}.terms-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:22px 0}.terms-feature{padding:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white)}.terms-feature>svg{margin-bottom:13px;color:var(--color-green)}.terms-feature h3{margin-bottom:7px;color:var(--color-primary);font-size:.92rem}.terms-feature p{margin-bottom:0;color:#1a120c;font-size:.77rem;line-height:1.65}.legal-callout{display:grid;gap:5px;margin-top:20px;padding:17px 18px;border-left:3px solid var(--color-gold);border-radius:0 var(--radius-md) var(--radius-md) 0;background:var(--color-cream)}.legal-callout strong{color:var(--color-primary);font-size:.82rem}.legal-callout span{color:#1a120c;font-size:.78rem;line-height:1.6}.process-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:22px;padding:17px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.process-card div{display:grid;gap:4px}.process-card span{color:var(--color-green);font-size:.66rem;font-weight:900}.process-card strong{color:var(--color-primary);font-size:.72rem}.process-card>svg{flex-shrink:0;color:var(--color-text-soft)}.security-banner{display:flex;align-items:flex-start;gap:13px;margin-top:22px;padding:18px;border-radius:var(--radius-lg);background:var(--color-primary);color:var(--color-white)}.security-banner>svg{flex-shrink:0;color:var(--color-gold-light)}.security-banner div{display:grid;gap:4px}.security-banner strong{font-size:.82rem}.security-banner span{color:rgba(255,255,255,.85);font-size:.75rem;line-height:1.6}.inline-link{color:var(--color-green);font-weight:750}.date-card{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.date-card>div{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-cream)}.date-card span{display:block;margin-bottom:4px;color:var(--color-text-soft);font-size:.65rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.date-card strong{color:var(--color-primary);font-size:.77rem}.contact-legal-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin-top:22px;padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.contact-legal-icon{display:grid;place-items:center;width:45px;height:45px;border-radius:13px;background:var(--color-green-pale);color:var(--color-green)}.contact-legal-card div:nth-child(2) span{display:block;margin-bottom:2px;color:#1a120c;font-size:.68rem}.contact-legal-card div:nth-child(2) strong{color:var(--color-primary);font-size:.83rem}.contact-legal-card div:nth-child(2) p{margin:3px 0 0;color:#1a120c;font-size:.72rem}.contact-legal-card>a{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-size:.76rem;font-weight:800;white-space:nowrap}.legal-footer-note{display:flex;align-items:flex-start;gap:10px;padding:20px;border-radius:var(--radius-lg);background:var(--color-cream)}.legal-footer-note svg{flex-shrink:0;color:var(--color-green)}.legal-footer-note p{margin:0;color:#1a120c;font-size:.76rem;line-height:1.65}@media (max-width:991px){.legal-hero-grid{grid-template-columns:1fr;gap:35px}.legal-trust-card{max-width:650px}.legal-layout{grid-template-columns:1fr;gap:35px}.legal-sidebar{position:static}.legal-sidebar nav{display:grid;grid-template-columns:repeat(2,1fr)}.sidebar-help{grid-column:1/-1}}@media (max-width:767px){.legal-hero{padding:28px 0 55px}.legal-breadcrumb{margin-bottom:30px}.legal-content-section{padding:55px 0 75px}.legal-sidebar nav{grid-template-columns:1fr}.legal-section{grid-template-columns:1fr;gap:12px;padding-bottom:38px;margin-bottom:38px}.section-number{width:34px;height:34px}.terms-feature-grid{grid-template-columns:1fr}.date-card{grid-template-columns:1fr}.process-card{align-items:stretch;flex-direction:column}.process-card>svg{transform:rotate(90deg);align-self:center}}@media (max-width:575px){.legal-meta{display:grid}.legal-meta>div{min-width:0}.legal-trust-card{padding:22px}.legal-notice{padding:16px}.legal-section p{font-size:.86rem}.contact-legal-card{grid-template-columns:auto 1fr}.contact-legal-card>a{grid-column:1/-1;justify-content:center;min-height:42px;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white)}}`}</style>
    </main>
  );
};

export default TermsOfService;
