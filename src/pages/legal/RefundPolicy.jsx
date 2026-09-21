import { AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Clock3, FileText, Mail, RefreshCcw, ShieldCheck, ShoppingBag, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
  const lastUpdated = "17 September 2026";
  const effectiveFrom = "17 September 2026";

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "cancellation", label: "Order Cancellation" },
    { id: "eligible", label: "Refund Eligibility" },
    { id: "perishable", label: "Perishable Products" },
    { id: "live-products", label: "Live Products" },
    { id: "wrong-damaged", label: "Wrong or Damaged Items" },
    { id: "non-refundable", label: "Non-Refundable Situations" },
    { id: "process", label: "Refund Process" },
    { id: "timeline", label: "Refund Timeline" },
    { id: "payment", label: "Payment Reversal" },
    { id: "changes", label: "Policy Changes" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <main className="legal-page refund-page">
      <section className="legal-hero">
        <div className="container">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={15} />
            <span>Refund Policy</span>
          </div>

          <div className="legal-hero-grid">
            <div className="legal-hero-content">
              <div className="legal-icon">
                <RefreshCcw size={30} />
              </div>

              <span className="legal-eyebrow">ORDERS & REFUNDS</span>

              <h1>Refund Policy</h1>

              <p>This Refund Policy explains when an order may be cancelled, returned, replaced, or refunded when purchasing products from BR30 Kadaknath Farms.</p>

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
                <RefreshCcw size={24} />
              </div>

              <h2>Fair, clear & product-aware refunds.</h2>

              <p>We understand that farm products require special handling. Refund and replacement decisions may therefore depend on the product type, condition, delivery status, and reason for the request.</p>

              <div className="trust-points">
                <div>
                  <CheckCircle2 size={17} />
                  <span>Clear cancellation conditions</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Special handling for perishable products</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Structured refund review process</span>
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
                  <span>Contact us about your order.</span>
                </div>

                <Link to="/contact">Contact Us</Link>
              </div>
            </div>
          </aside>

          <article className="legal-document">
            <div className="legal-notice">
              <AlertCircle size={21} />

              <div>
                <strong>Please check the product type before requesting a refund</strong>

                <p>Some BR30 Farms products may be perishable, live, or time-sensitive. Such products may have different cancellation, replacement, and refund conditions.</p>
              </div>
            </div>

            <section id="overview" className="legal-section">
              <div className="section-number">01</div>

              <div>
                <h2>Overview</h2>

                <p>BR30 Kadaknath Farms aims to provide customers with a clear and fair process for cancellations, replacements, and refunds.</p>

                <p>This policy applies to products purchased through our website unless a product-specific condition is clearly stated at the time of purchase.</p>

                <p>Refund requests are reviewed based on the circumstances of the order and applicable consumer rights and laws.</p>
              </div>
            </section>

            <section id="cancellation" className="legal-section">
              <div className="section-number">02</div>

              <div>
                <h2>Order Cancellation</h2>

                <p>Customers may request cancellation before an order has been prepared, dispatched, or otherwise entered the fulfilment stage.</p>

                <div className="refund-status-grid">
                  <div className="status-card status-positive">
                    <CheckCircle2 size={21} />
                    <strong>Before Processing</strong>
                    <span>Cancellation may generally be requested before the order enters preparation or dispatch.</span>
                  </div>

                  <div className="status-card status-warning">
                    <Clock3 size={21} />
                    <strong>After Processing</strong>
                    <span>Cancellation may not be possible once preparation or dispatch has started.</span>
                  </div>

                  <div className="status-card status-negative">
                    <XCircle size={21} />
                    <strong>After Delivery</strong>
                    <span>Product-specific return and refund conditions will apply.</span>
                  </div>
                </div>

                <p>If an eligible cancellation is approved and payment has already been collected, the applicable refund will be initiated through the relevant payment method.</p>
              </div>
            </section>

            <section id="eligible" className="legal-section">
              <div className="section-number">03</div>

              <div>
                <h2>Refund Eligibility</h2>

                <p>Depending on the product and circumstances, a refund or replacement may be considered when:</p>

                <ul className="legal-list">
                  <li>the order was cancelled before fulfilment and the cancellation was accepted;</li>
                  <li>an incorrect product was delivered;</li>
                  <li>the delivered product was materially damaged before or during delivery;</li>
                  <li>the order could not be fulfilled by BR30 Farms after payment was received;</li>
                  <li>another refund situation is required under applicable law or has been specifically approved by our team.</li>
                </ul>

                <div className="legal-callout">
                  <strong>Refunds are reviewed case by case.</strong>

                  <span>A request does not automatically guarantee a refund. We may request order details, photographs, delivery information, or other reasonable evidence before making a decision.</span>
                </div>
              </div>
            </section>

            <section id="perishable" className="legal-section">
              <div className="section-number">04</div>

              <div>
                <h2>Perishable Products</h2>

                <p>Products such as fresh eggs, fresh chicken, and other perishable farm products require timely handling and appropriate storage.</p>

                <p>Because of their nature, these products may not be eligible for ordinary change-of-mind returns after delivery.</p>

                <p>If you receive a product that appears materially damaged, incorrect, spoiled, or otherwise unsuitable at delivery, please contact us as soon as reasonably possible with your order details and supporting photographs.</p>

                <div className="product-warning">
                  <AlertCircle size={22} />

                  <div>
                    <strong>Important for fresh products</strong>
                    <span>Please inspect your delivery promptly and follow appropriate storage and handling instructions after receiving the product.</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="live-products" className="legal-section">
              <div className="section-number">05</div>

              <div>
                <h2>Live Products</h2>

                <p>Live chicks, live birds, breeding stock, and other live products require special transportation, handling, and care.</p>

                <p>Due to the nature of live products, ordinary change-of-mind returns may not be available after dispatch or delivery.</p>

                <p>If a live product arrives in a condition that may qualify for a replacement or refund, contact us promptly with the order number and relevant photographs or other evidence.</p>

                <div className="live-product-card">
                  <ShoppingBag size={23} />

                  <div>
                    <strong>Special handling applies</strong>
                    <span>Eligibility may depend on dispatch condition, delivery circumstances, timing of the complaint, and applicable product terms.</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="wrong-damaged" className="legal-section">
              <div className="section-number">06</div>

              <div>
                <h2>Wrong or Damaged Items</h2>

                <p>If you receive a product that is materially different from what you ordered or appears to have been damaged during fulfilment or delivery, please contact us promptly.</p>

                <p>To help us investigate the issue, we may request:</p>

                <ul className="legal-list">
                  <li>Order ID or order confirmation details.</li>
                  <li>Photographs of the product received.</li>
                  <li>Photographs of the packaging where relevant.</li>
                  <li>A brief description of the issue.</li>
                  <li>Any other information reasonably necessary to review the claim.</li>
                </ul>

                <p>Depending on the circumstances, we may offer a replacement, refund, partial resolution, or another appropriate remedy.</p>
              </div>
            </section>

            <section id="non-refundable" className="legal-section">
              <div className="section-number">07</div>

              <div>
                <h2>Non-Refundable Situations</h2>

                <p>Subject to applicable law and the circumstances of a particular order, a refund may not be available where:</p>

                <ul className="legal-list">
                  <li>the customer changes their mind after fulfilment of a perishable or live product;</li>
                  <li>the product was damaged after delivery due to improper handling or storage;</li>
                  <li>incorrect or incomplete delivery information was provided by the customer and the resulting delivery could not be completed;</li>
                  <li>the customer refuses an eligible delivery without a qualifying reason;</li>
                  <li>a claim is submitted without sufficient information to reasonably verify the issue;</li>
                  <li>the issue results from circumstances outside the scope of our responsibility.</li>
                </ul>

                <p>Nothing in this section is intended to remove any rights that cannot legally be excluded under applicable law.</p>
              </div>
            </section>

            <section id="process" className="legal-section">
              <div className="section-number">08</div>

              <div>
                <h2>Refund Process</h2>

                <p>To request a refund or replacement, please contact us through the available customer support channel and provide your order information.</p>

                <div className="process-card">
                  <div>
                    <span>01</span>
                    <strong>Request</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>02</span>
                    <strong>Review</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>03</span>
                    <strong>Decision</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>04</span>
                    <strong>Refund</strong>
                  </div>
                </div>

                <p>Once a request has been reviewed, we will communicate the applicable outcome and any additional steps required from the customer.</p>
              </div>
            </section>

            <section id="timeline" className="legal-section">
              <div className="section-number">09</div>

              <div>
                <h2>Refund Timeline</h2>

                <p>Once a refund has been approved, we will initiate the refund through the applicable payment method or process.</p>

                <div className="timeline-card">
                  <div>
                    <Clock3 size={21} />

                    <div>
                      <strong>Review</strong>
                      <span>Your request is checked against the order and applicable policy.</span>
                    </div>
                  </div>

                  <div>
                    <RefreshCcw size={21} />

                    <div>
                      <strong>Refund Initiated</strong>
                      <span>An approved refund is submitted through the applicable payment channel.</span>
                    </div>
                  </div>

                  <div>
                    <CheckCircle2 size={21} />

                    <div>
                      <strong>Credit to Customer</strong>
                      <span>The final credit timing may depend on the payment provider or financial institution.</span>
                    </div>
                  </div>
                </div>

                <p>Actual crediting time may vary depending on the payment provider, bank, card network, UPI provider, or other financial institution involved.</p>
              </div>
            </section>

            <section id="payment" className="legal-section">
              <div className="section-number">10</div>

              <div>
                <h2>Payment Reversal</h2>

                <p>Where an order is cancelled or a refund is approved after payment has been received, the amount will generally be returned through the original payment method or another appropriate method permitted by the payment provider.</p>

                <p>We cannot control the exact processing time of third-party banks, payment gateways, card networks, or financial institutions.</p>

                <div className="security-banner">
                  <ShieldCheck size={23} />

                  <div>
                    <strong>Important security reminder</strong>
                    <span>BR30 Farms will never ask you to share your UPI PIN, card PIN, password, or OTP to process a legitimate refund.</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="changes" className="legal-section">
              <div className="section-number">11</div>

              <div>
                <h2>Changes to This Policy</h2>

                <p>We may update this Refund Policy when our products, payment methods, delivery practices, business processes, or applicable legal requirements change.</p>

                <p>The updated policy will be published on this page with a revised "Last Updated" and, where appropriate, "Effective From" date.</p>

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
              <div className="section-number">12</div>

              <div>
                <h2>Contact Us</h2>

                <p>For cancellation, refund, replacement, or order-related questions, please contact BR30 Kadaknath Farms with your order information.</p>

                <div className="contact-legal-card">
                  <div className="contact-legal-icon">
                    <Mail size={22} />
                  </div>

                  <div>
                    <span>Refund & Order Support</span>
                    <strong>BR30 Kadaknath Farms</strong>
                    <p>Include your Order ID when contacting our support team.</p>
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

              <p>This Refund Policy should be read together with our Terms of Service and Shipping Policy. Nothing in this policy is intended to limit rights available under applicable law.</p>
            </div>
          </article>
        </div>
      </section>

      <style>{`.legal-page{background:#fbfaf5;color:var(--color-text)}.legal-hero{padding:38px 0 72px;background:radial-gradient(circle at 85% 20%,rgba(201,154,61,.11),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}.legal-breadcrumb{display:flex;align-items:center;gap:7px;margin-bottom:42px;color:#1a120c;font-size:.82rem}.legal-breadcrumb a{color:var(--color-green);font-weight:700}.legal-hero-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);align-items:center;gap:60px}.legal-icon{display:grid;place-items:center;width:64px;height:64px;margin-bottom:20px;border:1px solid rgba(63,107,53,.16);border-radius:18px;background:var(--color-green-pale);color:var(--color-green)}.legal-eyebrow{display:block;margin-bottom:10px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em}.legal-hero-content h1{margin-bottom:18px;color:var(--color-primary);font-size:clamp(2.7rem,5vw,4.5rem);letter-spacing:-.05em}.legal-hero-content>p{max-width:750px;color:#1a120c;font-size:1.02rem;line-height:1.8}.legal-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.legal-meta>div{min-width:175px;padding:13px 16px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:rgba(255,253,247,.78)}.legal-meta span{display:block;margin-bottom:3px;color:#1a120c;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.legal-meta strong{color:var(--color-primary);font-size:.84rem}.legal-trust-card{padding:28px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.trust-card-icon{display:grid;place-items:center;width:50px;height:50px;margin-bottom:18px;border-radius:15px;background:var(--color-primary);color:var(--color-gold-light)}.legal-trust-card h2{margin-bottom:10px;color:var(--color-primary);font-size:1.35rem}.legal-trust-card>p{color:#1a120c;font-size:.86rem;line-height:1.7}.trust-points{display:grid;gap:11px;margin-top:20px;padding-top:18px;border-top:1px solid var(--color-border)}.trust-points div{display:flex;align-items:center;gap:9px;color:#1a120c;font-size:.8rem}.trust-points svg{flex-shrink:0;color:var(--color-green)}.legal-content-section{padding:75px 0 100px}.legal-layout{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start;gap:55px}.legal-sidebar{position:sticky;top:105px}.legal-sidebar-inner{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.sidebar-title{display:flex;align-items:center;gap:9px;padding:17px 18px;border-bottom:1px solid var(--color-border);color:var(--color-primary);font-size:.83rem;font-weight:800}.sidebar-title svg{color:var(--color-green)}.legal-sidebar nav{padding:8px}.legal-sidebar nav a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-radius:8px;color:#1a120c;font-size:.76rem;transition:background var(--transition-fast),color var(--transition-fast)}.legal-sidebar nav a:hover{background:var(--color-green-pale);color:var(--color-green)}.sidebar-help{display:grid;grid-template-columns:auto 1fr;gap:9px;margin:8px;padding:14px;border-radius:var(--radius-md);background:var(--color-cream)}.sidebar-help>svg{color:var(--color-green)}.sidebar-help div{display:grid;gap:2px}.sidebar-help strong{color:var(--color-primary);font-size:.76rem}.sidebar-help span{color:#1a120c;font-size:.68rem;line-height:1.4}.sidebar-help a{grid-column:1/-1;margin-top:3px;color:var(--color-green);font-size:.72rem;font-weight:800}.legal-document{min-width:0}.legal-notice{display:flex;gap:14px;margin-bottom:50px;padding:20px 22px;border:1px solid rgba(180,122,29,.22);border-radius:var(--radius-lg);background:#fbf5e7}.legal-notice>svg{flex-shrink:0;margin-top:2px;color:var(--color-warning)}.legal-notice strong{display:block;margin-bottom:5px;color:var(--color-primary);font-size:.9rem}.legal-notice p{color:#1a120c;font-size:.8rem;line-height:1.65}.legal-section{display:grid;grid-template-columns:48px minmax(0,1fr);gap:20px;padding:0 0 48px;margin-bottom:48px;border-bottom:1px solid var(--color-border);scroll-margin-top:110px}.section-number{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--color-primary);color:var(--color-gold-light);font-size:.68rem;font-weight:800}.legal-section h2{margin-bottom:16px;color:var(--color-primary);font-size:clamp(1.45rem,2vw,1.85rem);letter-spacing:-.025em}.legal-section p{margin-bottom:14px;color:#1a120c;font-size:.9rem;line-height:1.85}.legal-list{display:grid;gap:10px;margin:17px 0}.legal-list li{position:relative;padding-left:22px;color:#1a120c;font-size:.88rem;line-height:1.65}.legal-list li::before{content:"";position:absolute;left:4px;top:.7em;width:6px;height:6px;border-radius:50%;background:var(--color-green)}.refund-status-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0}.status-card{display:flex;flex-direction:column;padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white)}.status-card svg{margin-bottom:13px}.status-card strong{margin-bottom:6px;color:var(--color-primary);font-size:.82rem}.status-card span{color:#1a120c;font-size:.73rem;line-height:1.6}.status-positive svg{color:var(--color-success)}.status-warning svg{color:var(--color-warning)}.status-negative svg{color:var(--color-danger)}.legal-callout{display:grid;gap:5px;margin-top:20px;padding:17px 18px;border-left:3px solid var(--color-gold);border-radius:0 var(--radius-md) var(--radius-md) 0;background:var(--color-cream)}.legal-callout strong{color:var(--color-primary);font-size:.82rem}.legal-callout span{color:#1a120c;font-size:.78rem;line-height:1.6}.product-warning,.live-product-card{display:flex;align-items:flex-start;gap:13px;margin-top:22px;padding:18px;border-radius:var(--radius-lg);background:var(--color-cream)}.product-warning>svg{flex-shrink:0;color:var(--color-warning)}.live-product-card{background:var(--color-green-pale)}.live-product-card>svg{flex-shrink:0;color:var(--color-green)}.product-warning div,.live-product-card div{display:grid;gap:4px}.product-warning strong,.live-product-card strong{color:var(--color-primary);font-size:.82rem}.product-warning span,.live-product-card span{color:#1a120c;font-size:.75rem;line-height:1.6}.process-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:22px;padding:17px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.process-card div{display:grid;gap:4px}.process-card span{color:var(--color-green);font-size:.66rem;font-weight:900}.process-card strong{color:var(--color-primary);font-size:.72rem}.process-card>svg{flex-shrink:0;color:var(--color-text-soft)}.timeline-card{display:grid;gap:0;margin-top:22px;padding:4px 18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white)}.timeline-card>div{position:relative;display:flex;gap:13px;padding:16px 0}.timeline-card>div:not(:last-child){border-bottom:1px solid var(--color-border)}.timeline-card svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.timeline-card div div{display:grid;gap:4px}.timeline-card strong{color:var(--color-primary);font-size:.8rem}.timeline-card span{color:#1a120c;font-size:.74rem;line-height:1.55}.security-banner{display:flex;align-items:flex-start;gap:13px;margin-top:22px;padding:18px;border-radius:var(--radius-lg);background:var(--color-primary);color:var(--color-white)}.security-banner>svg{flex-shrink:0;color:var(--color-gold-light)}.security-banner div{display:grid;gap:4px}.security-banner strong{font-size:.82rem}.security-banner span{color:rgba(255,255,255,.85);font-size:.75rem;line-height:1.6}.date-card{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.date-card>div{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-cream)}.date-card span{display:block;margin-bottom:4px;color:#1a120c;font-size:.65rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.date-card strong{color:var(--color-primary);font-size:.77rem}.contact-legal-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin-top:22px;padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.contact-legal-icon{display:grid;place-items:center;width:45px;height:45px;border-radius:13px;background:var(--color-green-pale);color:var(--color-green)}.contact-legal-card div:nth-child(2) span{display:block;margin-bottom:2px;color:#1a120c;font-size:.68rem}.contact-legal-card div:nth-child(2) strong{color:var(--color-primary);font-size:.83rem}.contact-legal-card div:nth-child(2) p{margin:3px 0 0;color:#1a120c;font-size:.72rem}.contact-legal-card>a{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-size:.76rem;font-weight:800;white-space:nowrap}.legal-footer-note{display:flex;align-items:flex-start;gap:10px;padding:20px;border-radius:var(--radius-lg);background:var(--color-cream)}.legal-footer-note svg{flex-shrink:0;color:var(--color-green)}.legal-footer-note p{margin:0;color:#1a120c;font-size:.76rem;line-height:1.65}@media (max-width:991px){.legal-hero-grid{grid-template-columns:1fr;gap:35px}.legal-trust-card{max-width:650px}.legal-layout{grid-template-columns:1fr;gap:35px}.legal-sidebar{position:static}.legal-sidebar nav{display:grid;grid-template-columns:repeat(2,1fr)}.sidebar-help{grid-column:1/-1}.refund-status-grid{grid-template-columns:1fr}}@media (max-width:767px){.legal-hero{padding:28px 0 55px}.legal-breadcrumb{margin-bottom:30px}.legal-content-section{padding:55px 0 75px}.legal-sidebar nav{grid-template-columns:1fr}.legal-section{grid-template-columns:1fr;gap:12px;padding-bottom:38px;margin-bottom:38px}.section-number{width:34px;height:34px}.date-card{grid-template-columns:1fr}.process-card{align-items:stretch;flex-direction:column}.process-card>svg{transform:rotate(90deg);align-self:center}}@media (max-width:575px){.legal-meta{display:grid}.legal-meta>div{min-width:0}.legal-trust-card{padding:22px}.legal-notice{padding:16px}.legal-section p{font-size:.86rem}.contact-legal-card{grid-template-columns:auto 1fr}.contact-legal-card>a{grid-column:1/-1;justify-content:center;min-height:42px;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white)}}`}</style>
    </main>
  );
};

export default RefundPolicy;
