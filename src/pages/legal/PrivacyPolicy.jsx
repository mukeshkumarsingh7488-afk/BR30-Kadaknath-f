import { ArrowRight, CheckCircle2, ChevronRight, Database, FileText, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const lastUpdated = "17 September 2026";
  const effectiveFrom = "17 September 2026";

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "information", label: "Information We Collect" },
    { id: "usage", label: "How We Use Information" },
    { id: "sharing", label: "Information Sharing" },
    { id: "cookies", label: "Cookies & Technologies" },
    { id: "security", label: "Data Security" },
    { id: "retention", label: "Data Retention" },
    { id: "rights", label: "Your Rights" },
    { id: "children", label: "Children's Privacy" },
    { id: "changes", label: "Policy Changes" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={15} />
            <span>Privacy Policy</span>
          </div>

          <div className="legal-hero-grid">
            <div className="legal-hero-content">
              <div className="legal-icon">
                <ShieldCheck size={30} />
              </div>

              <span className="legal-eyebrow">LEGAL & PRIVACY</span>

              <h1>Privacy Policy</h1>

              <p>Your privacy matters to us. This Privacy Policy explains how BR30 Kadaknath Farms collects, uses, protects, and handles information when you visit our website, create an account, place an order, or communicate with us.</p>

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
                <LockKeyhole size={24} />
              </div>

              <h2>Your information, handled responsibly.</h2>

              <p>We collect only the information reasonably needed to operate our services, process orders, communicate with customers, and improve your experience.</p>

              <div className="trust-points">
                <div>
                  <CheckCircle2 size={17} />
                  <span>Responsible data handling</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Order-related information protection</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Clear communication about data use</span>
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
                  <strong>Need help?</strong>
                  <span>Contact our support team.</span>
                </div>

                <Link to="/contact">Contact Us</Link>
              </div>
            </div>
          </aside>

          <article className="legal-document">
            <div className="legal-notice">
              <ShieldCheck size={21} />

              <div>
                <strong>Privacy at BR30 Kadaknath Farms</strong>

                <p>This policy is intended to explain our general privacy practices in a clear and understandable manner. Specific services, payment providers, delivery partners, or technical integrations may have additional privacy terms.</p>
              </div>
            </div>

            <section id="overview" className="legal-section">
              <div className="section-number">01</div>

              <div>
                <h2>Overview</h2>

                <p>BR30 Kadaknath Farms ("BR30 Farms", "we", "us", or "our") respects your privacy and is committed to handling personal information responsibly.</p>

                <p>This Privacy Policy applies to information collected through our website, customer accounts, orders, customer support communications, and other interactions with our services.</p>

                <p>By using our website or services, you acknowledge that you have read and understood this Privacy Policy.</p>
              </div>
            </section>

            <section id="information" className="legal-section">
              <div className="section-number">02</div>

              <div>
                <h2>Information We Collect</h2>

                <p>Depending on how you use our services, we may collect the following categories of information:</p>

                <div className="legal-info-grid">
                  <div className="info-card">
                    <UserRound size={21} />
                    <h3>Account Information</h3>
                    <p>Name, email address, mobile number, login credentials, and account-related information.</p>
                  </div>

                  <div className="info-card">
                    <FileText size={21} />
                    <h3>Order Information</h3>
                    <p>Products ordered, quantities, delivery details, order history, and related communications.</p>
                  </div>

                  <div className="info-card">
                    <Database size={21} />
                    <h3>Technical Information</h3>
                    <p>Device, browser, IP-related technical information, and website usage data where collected through standard technologies.</p>
                  </div>

                  <div className="info-card">
                    <Mail size={21} />
                    <h3>Communication Information</h3>
                    <p>Information you provide when contacting us, submitting an enquiry, or requesting customer support.</p>
                  </div>
                </div>

                <p>We do not intentionally request information that is unnecessary for providing our services.</p>
              </div>
            </section>

            <section id="usage" className="legal-section">
              <div className="section-number">03</div>

              <div>
                <h2>How We Use Your Information</h2>

                <p>We may use collected information to:</p>

                <ul className="legal-list">
                  <li>create and manage customer accounts;</li>
                  <li>process and manage orders;</li>
                  <li>arrange delivery and order fulfilment;</li>
                  <li>send order-related notifications;</li>
                  <li>respond to customer enquiries and support requests;</li>
                  <li>maintain website security and prevent misuse;</li>
                  <li>improve website functionality and customer experience;</li>
                  <li>comply with applicable legal or regulatory obligations.</li>
                </ul>
              </div>
            </section>

            <section id="sharing" className="legal-section">
              <div className="section-number">04</div>

              <div>
                <h2>Information Sharing</h2>

                <p>We do not treat your personal information as a product for sale. Information may be shared only where reasonably necessary to operate our services or comply with applicable requirements.</p>

                <p>This may include trusted service providers such as:</p>

                <ul className="legal-list">
                  <li>payment processing providers;</li>
                  <li>delivery and logistics partners;</li>
                  <li>website hosting and infrastructure providers;</li>
                  <li>email, communication, or notification providers;</li>
                  <li>technology and security service providers.</li>
                </ul>

                <p>Service providers may process information only as necessary for the services they provide and subject to their own applicable terms and privacy practices.</p>

                <div className="legal-callout">
                  <strong>We do not sell personal information.</strong>
                  <span>We may disclose information when required by law, regulation, legal process, or to protect our rights and customers.</span>
                </div>
              </div>
            </section>

            <section id="cookies" className="legal-section">
              <div className="section-number">05</div>

              <div>
                <h2>Cookies & Similar Technologies</h2>

                <p>Our website may use cookies, local storage, session technologies, analytics tools, or similar technologies to maintain functionality and improve user experience.</p>

                <p>These technologies may help us remember preferences, maintain sessions, support shopping-cart functionality, understand website usage, and improve security.</p>

                <p>You may be able to control cookies through your browser settings. Disabling certain technologies may affect some website functionality.</p>
              </div>
            </section>

            <section id="security" className="legal-section">
              <div className="section-number">06</div>

              <div>
                <h2>Data Security</h2>

                <p>We take reasonable technical and organisational measures to protect information against unauthorised access, misuse, alteration, disclosure, or destruction.</p>

                <p>However, no internet transmission, electronic storage system, or online service can be guaranteed to be completely secure. You should therefore use appropriate precautions when protecting your account credentials and devices.</p>

                <div className="security-banner">
                  <LockKeyhole size={23} />

                  <div>
                    <strong>Keep your account secure</strong>
                    <span>Never share your password, OTP, or other account authentication information with anyone.</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="retention" className="legal-section">
              <div className="section-number">07</div>

              <div>
                <h2>Data Retention</h2>

                <p>We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including order fulfilment, customer support, legal compliance, dispute resolution, security, and legitimate business requirements.</p>

                <p>Retention periods may vary depending on the type of information and the reason it was collected.</p>
              </div>
            </section>

            <section id="rights" className="legal-section">
              <div className="section-number">08</div>

              <div>
                <h2>Your Rights</h2>

                <p>Depending on applicable law and the circumstances, you may have rights relating to your personal information, including rights to:</p>

                <ul className="legal-list">
                  <li>request access to certain personal information;</li>
                  <li>request correction of inaccurate information;</li>
                  <li>request deletion where legally applicable;</li>
                  <li>raise questions or concerns about data processing;</li>
                  <li>withdraw consent where processing is based on consent.</li>
                </ul>

                <p>Requests may be subject to applicable legal requirements, identity verification, and legitimate exceptions.</p>
              </div>
            </section>

            <section id="children" className="legal-section">
              <div className="section-number">09</div>

              <div>
                <h2>Children's Privacy</h2>

                <p>Our services are intended for customers who can legally enter into transactions under applicable law. We do not knowingly seek to collect personal information from children where such collection is not legally permitted.</p>

                <p>If you believe a child has provided personal information to us improperly, please contact us so that we can review the matter and take appropriate action.</p>
              </div>
            </section>

            <section id="changes" className="legal-section">
              <div className="section-number">10</div>

              <div>
                <h2>Changes to This Policy</h2>

                <p>We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices.</p>

                <p>When we make changes, we will update the "Last Updated" and, where appropriate, the "Effective From" date shown at the beginning of this page.</p>

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
              <div className="section-number">11</div>

              <div>
                <h2>Contact Us</h2>

                <p>If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact BR30 Kadaknath Farms.</p>

                <div className="contact-legal-card">
                  <div className="contact-legal-icon">
                    <Mail size={22} />
                  </div>

                  <div>
                    <span>Privacy & Customer Support</span>
                    <strong>BR30 Kadaknath Farms</strong>
                    <p>Please use our Contact page to submit your enquiry.</p>
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

              <p>By continuing to use BR30 Kadaknath Farms services, you acknowledge that you have had an opportunity to review this Privacy Policy.</p>
            </div>
          </article>
        </div>
      </section>

      <style>{`.legal-page{background:#fbfaf5;color:var(--color-text)}.legal-hero{padding:38px 0 72px;background:radial-gradient(circle at 85% 20%,rgba(201,154,61,.11),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}.legal-breadcrumb{display:flex;align-items:center;gap:7px;margin-bottom:42px;color:var(--color-text-soft);font-size:.82rem}.legal-breadcrumb a{color:var(--color-green);font-weight:700}.legal-hero-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);align-items:center;gap:60px}.legal-icon{display:grid;place-items:center;width:64px;height:64px;margin-bottom:20px;border:1px solid rgba(63,107,53,.16);border-radius:18px;background:var(--color-green-pale);color:var(--color-green)}.legal-eyebrow{display:block;margin-bottom:10px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em}.legal-hero-content h1{margin-bottom:18px;color:var(--color-primary);font-size:clamp(2.7rem,5vw,4.5rem);letter-spacing:-.05em}.legal-hero-content>p{max-width:750px;color:#1a120c;font-size:1.02rem;line-height:1.8}.legal-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.legal-meta>div{min-width:175px;padding:13px 16px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:rgba(255,253,247,.78)}.legal-meta span{display:block;margin-bottom:3px;color:var(--color-text-soft);font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.legal-meta strong{color:var(--color-primary);font-size:.84rem}.legal-trust-card{padding:28px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.trust-card-icon{display:grid;place-items:center;width:50px;height:50px;margin-bottom:18px;border-radius:15px;background:var(--color-primary);color:var(--color-gold-light)}.legal-trust-card h2{margin-bottom:10px;color:var(--color-primary);font-size:1.35rem}.legal-trust-card>p{color:#1a120c;font-size:.86rem;line-height:1.7}.trust-points{display:grid;gap:11px;margin-top:20px;padding-top:18px;border-top:1px solid var(--color-border)}.trust-points div{display:flex;align-items:center;gap:9px;color:#1a120c;font-size:.8rem}.trust-points svg{flex-shrink:0;color:var(--color-green)}.legal-content-section{padding:75px 0 100px}.legal-layout{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start;gap:55px}.legal-sidebar{position:sticky;top:105px}.legal-sidebar-inner{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.sidebar-title{display:flex;align-items:center;gap:9px;padding:17px 18px;border-bottom:1px solid var(--color-border);color:var(--color-primary);font-size:.83rem;font-weight:800}.sidebar-title svg{color:var(--color-green)}.legal-sidebar nav{padding:8px}.legal-sidebar nav a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-radius:8px;color:var(--color-text);font-size:.76rem;transition:background var(--transition-fast),color var(--transition-fast)}.legal-sidebar nav a:hover{background:var(--color-green-pale);color:var(--color-green)}.sidebar-help{display:grid;grid-template-columns:auto 1fr;gap:9px;margin:8px;padding:14px;border-radius:var(--radius-md);background:var(--color-cream)}.sidebar-help>svg{color:var(--color-green)}.sidebar-help div{display:grid;gap:2px}.sidebar-help strong{color:var(--color-primary);font-size:.76rem}.sidebar-help span{color:#1a120c;font-size:.68rem;line-height:1.4}.sidebar-help a{grid-column:1/-1;margin-top:3px;color:var(--color-green);font-size:.72rem;font-weight:800}.legal-document{min-width:0}.legal-notice{display:flex;gap:14px;margin-bottom:50px;padding:20px 22px;border:1px solid rgba(63,107,53,.18);border-radius:var(--radius-lg);background:var(--color-green-pale)}.legal-notice>svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.legal-notice strong{display:block;margin-bottom:5px;color:var(--color-primary);font-size:.9rem}.legal-notice p{color:#1a120c;font-size:.8rem;line-height:1.65}.legal-section{display:grid;grid-template-columns:48px minmax(0,1fr);gap:20px;padding:0 0 48px;margin-bottom:48px;border-bottom:1px solid var(--color-border);scroll-margin-top:110px}.section-number{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--color-primary);color:var(--color-gold-light);font-size:.68rem;font-weight:800}.legal-section h2{margin-bottom:16px;color:var(--color-primary);font-size:clamp(1.45rem,2vw,1.85rem);letter-spacing:-.025em}.legal-section p{margin-bottom:14px;color:#1a120c;font-size:.9rem;line-height:1.85}.legal-list{display:grid;gap:10px;margin:17px 0}.legal-list li{position:relative;padding-left:22px;color:#1a120c;font-size:.88rem;line-height:1.65}.legal-list li::before{content:"";position:absolute;left:4px;top:.7em;width:6px;height:6px;border-radius:50%;background:var(--color-green)}.legal-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:22px 0}.info-card{padding:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white)}.info-card>svg{margin-bottom:13px;color:var(--color-green)}.info-card h3{margin-bottom:7px;color:var(--color-primary);font-size:.92rem}.info-card p{margin-bottom:0;font-size:.77rem;line-height:1.65}.legal-callout{display:grid;gap:5px;margin-top:20px;padding:17px 18px;border-left:3px solid var(--color-gold);border-radius:0 var(--radius-md) var(--radius-md) 0;background:var(--color-cream)}.legal-callout strong{color:var(--color-primary);font-size:.82rem}.legal-callout span{color:#1a120c;font-size:.78rem;line-height:1.6}.security-banner{display:flex;align-items:flex-start;gap:13px;margin-top:22px;padding:18px;border-radius:var(--radius-lg);background:var(--color-primary);color:var(--color-white)}.security-banner>svg{flex-shrink:0;color:var(--color-gold-light)}.security-banner div{display:grid;gap:4px}.security-banner strong{font-size:.82rem}.security-banner span{color:rgba(255,255,255,.85);font-size:.75rem;line-height:1.6}.date-card{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.date-card>div{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-cream)}.date-card span{display:block;margin-bottom:4px;color:var(--color-text-soft);font-size:.65rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.date-card strong{color:var(--color-primary);font-size:.77rem}.contact-legal-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin-top:22px;padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.contact-legal-icon{display:grid;place-items:center;width:45px;height:45px;border-radius:13px;background:var(--color-green-pale);color:var(--color-green)}.contact-legal-card div:nth-child(2) span{display:block;margin-bottom:2px;color:#1a120c;font-size:.68rem}.contact-legal-card div:nth-child(2) strong{color:var(--color-primary);font-size:.83rem}.contact-legal-card div:nth-child(2) p{margin:3px 0 0;color:#1a120c;font-size:.72rem}.contact-legal-card>a{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-size:.76rem;font-weight:800;white-space:nowrap}.legal-footer-note{display:flex;align-items:flex-start;gap:10px;padding:20px;border-radius:var(--radius-lg);background:var(--color-cream)}.legal-footer-note svg{flex-shrink:0;color:var(--color-green)}.legal-footer-note p{margin:0;color:#1a120c;font-size:.76rem;line-height:1.65}@media (max-width:991px){.legal-hero-grid{grid-template-columns:1fr;gap:35px}.legal-trust-card{max-width:650px}.legal-layout{grid-template-columns:1fr;gap:35px}.legal-sidebar{position:static}.legal-sidebar-inner{max-width:100%}.legal-sidebar nav{display:grid;grid-template-columns:repeat(2,1fr)}.sidebar-help{grid-column:1/-1}}@media (max-width:767px){.legal-hero{padding:28px 0 55px}.legal-breadcrumb{margin-bottom:30px}.legal-content-section{padding:55px 0 75px}.legal-sidebar nav{grid-template-columns:1fr}.legal-section{grid-template-columns:1fr;gap:12px;padding-bottom:38px;margin-bottom:38px}.section-number{width:34px;height:34px}.legal-info-grid{grid-template-columns:1fr}.date-card{grid-template-columns:1fr}}@media (max-width:575px){.legal-meta{display:grid}.legal-meta>div{min-width:0}.legal-trust-card{padding:22px}.legal-notice{padding:16px}.legal-section p{font-size:.86rem}.contact-legal-card{grid-template-columns:auto 1fr}.contact-legal-card>a{grid-column:1/-1;justify-content:center;min-height:42px;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white)}}`}</style>
    </main>
  );
};

export default PrivacyPolicy;
