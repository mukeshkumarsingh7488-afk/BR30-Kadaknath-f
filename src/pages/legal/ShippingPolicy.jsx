import { ArrowRight, CheckCircle2, ChevronRight, FileCheck2, FileText, Mail, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  const lastUpdated = "17 September 2026";
  const effectiveFrom = "17 September 2026";

  const sections = [
    { id: "overview", label: "Shipping Overview" },
    { id: "areas", label: "Delivery Areas" },
    { id: "processing", label: "Order Processing" },
    { id: "dispatch", label: "Dispatch & Delivery" },
    { id: "timelines", label: "Delivery Timelines" },
    { id: "charges", label: "Shipping Charges" },
    { id: "perishable", label: "Fresh Products" },
    { id: "live-products", label: "Live Products" },
    { id: "address", label: "Delivery Address" },
    { id: "failed-delivery", label: "Failed Delivery" },
    { id: "delays", label: "Delays & Exceptions" },
    { id: "inspection", label: "Delivery Inspection" },
    { id: "tracking", label: "Order Tracking" },
    { id: "restrictions", label: "Delivery Restrictions" },
    { id: "wrong-damaged", label: "Wrong or Damaged Items" },
    { id: "changes", label: "Policy Changes" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <main className="legal-page shipping-page">
      <section className="legal-hero">
        <div className="container">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={15} />
            <span>Shipping Policy</span>
          </div>

          <div className="legal-hero-grid">
            <div className="legal-hero-content">
              <div className="legal-icon">
                <Truck size={30} />
              </div>

              <span className="legal-eyebrow">DELIVERY & SHIPPING</span>

              <h1>Shipping Policy</h1>

              <p>This Shipping Policy explains how BR30 Kadaknath Farms processes, prepares, dispatches, and delivers orders, including important considerations for fresh, perishable, live, and farm-related products.</p>

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
                <PackageCheck size={24} />
              </div>

              <h2>Careful delivery from farm to customer.</h2>

              <p>We aim to handle every order carefully while recognising that delivery conditions can vary depending on product type, location, availability, weather, and logistics.</p>

              <div className="trust-points">
                <div>
                  <CheckCircle2 size={17} />
                  <span>Careful order preparation and handling</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Delivery based on serviceability and availability</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Special care for fresh and live products</span>
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
                <strong>Please read this shipping information carefully</strong>

                <p>Delivery timelines, serviceability, charges, and handling requirements may vary depending on the product, destination, farm availability, weather, and logistics conditions.</p>
              </div>
            </div>

            <section id="overview" className="legal-section">
              <div className="section-number">01</div>

              <div>
                <h2>Shipping Overview</h2>

                <p>BR30 Kadaknath Farms aims to deliver orders safely and efficiently from our farm or designated fulfilment location to the customer's provided delivery address.</p>

                <p>Our shipping process may differ depending on whether an order contains ordinary farm products, fresh or perishable products, chicks, live birds, breeding stock, or hatching eggs.</p>

                <div className="shipping-feature-grid">
                  <div className="shipping-feature">
                    <Truck size={21} />

                    <h3>Delivery</h3>

                    <p>Orders are delivered only where our current delivery arrangements and serviceability allow.</p>
                  </div>

                  <div className="shipping-feature">
                    <PackageCheck size={21} />

                    <h3>Careful Handling</h3>

                    <p>Products are prepared and handled according to their nature and applicable delivery requirements.</p>
                  </div>
                </div>

                <p>Placing an order does not guarantee delivery to every location. Delivery feasibility may be checked before or after an order is submitted.</p>
              </div>
            </section>

            <section id="areas" className="legal-section">
              <div className="section-number">02</div>

              <div>
                <h2>Delivery Areas & Serviceability</h2>

                <p>Delivery is available only in locations currently served by BR30 Kadaknath Farms or its authorised delivery partners.</p>

                <p>Serviceability may depend on the destination, product type, current farm capacity, delivery infrastructure, and applicable logistics arrangements.</p>

                <div className="legal-callout">
                  <strong>Delivery availability may vary by location.</strong>

                  <span>A location that is serviceable today may have different availability in the future depending on product type, logistics, weather, or operational conditions.</span>
                </div>

                <p>If a requested delivery location cannot be served, we may contact the customer regarding available options.</p>
              </div>
            </section>

            <section id="processing" className="legal-section">
              <div className="section-number">03</div>

              <div>
                <h2>Order Processing</h2>

                <p>After an order is submitted, we may review product availability, delivery feasibility, customer information, payment status, and other relevant details before preparing the order.</p>

                <ul className="legal-list">
                  <li>Orders may require confirmation before preparation.</li>

                  <li>Product availability may change before an order is fulfilled.</li>

                  <li>Additional verification may be required for certain live or farm-stock products.</li>

                  <li>Orders may be cancelled or adjusted where fulfilment is not reasonably possible.</li>
                </ul>

                <p>Where an amount has already been paid for an order that cannot be fulfilled, applicable refund arrangements will be handled according to our Refund Policy.</p>
              </div>
            </section>

            <section id="dispatch" className="legal-section">
              <div className="section-number">04</div>

              <div>
                <h2>Dispatch & Delivery</h2>

                <p>Once an order is prepared and ready for dispatch, it may be handed to our delivery team or an applicable logistics partner.</p>

                <p>Dispatch timing may vary depending on product type, order volume, farm availability, destination, and logistics conditions.</p>

                <div className="process-card">
                  <div>
                    <span>01</span>
                    <strong>Order Confirmed</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>02</span>
                    <strong>Order Prepared</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>03</span>
                    <strong>Dispatched</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>04</span>
                    <strong>Delivered</strong>
                  </div>
                </div>
              </div>
            </section>

            <section id="timelines" className="legal-section">
              <div className="section-number">05</div>

              <div>
                <h2>Delivery Timelines</h2>

                <p>Delivery timelines shown or communicated during the ordering process are estimates unless expressly stated otherwise.</p>

                <p>Actual delivery time may vary based on location, product availability, order volume, weather, road conditions, logistics operations, and other circumstances.</p>

                <div className="legal-callout">
                  <strong>Estimated timelines are not guaranteed.</strong>

                  <span>Fresh and live products may require additional planning or specific delivery arrangements to support safe handling.</span>
                </div>

                <p>If an unexpected delay materially affects an order, we may contact the customer where reasonably possible.</p>
              </div>
            </section>

            <section id="charges" className="legal-section">
              <div className="section-number">06</div>

              <div>
                <h2>Shipping & Delivery Charges</h2>

                <p>Applicable delivery or shipping charges, if any, may depend on the destination, order size, product type, delivery method, and other applicable factors.</p>

                <p>Any applicable charges will be displayed or communicated during the ordering process where reasonably possible.</p>

                <p>Delivery charges may change from time to time based on operational and logistics requirements.</p>

                <div className="security-banner">
                  <Truck size={23} />

                  <div>
                    <strong>Transparent delivery information</strong>

                    <span>Please review the final order summary before completing your purchase to understand any applicable delivery charges.</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="perishable" className="legal-section">
              <div className="section-number">07</div>

              <div>
                <h2>Fresh & Perishable Products</h2>

                <p>Certain products offered by BR30 Kadaknath Farms may be fresh, perishable, or time-sensitive.</p>

                <p>Such products may require special handling and may have different delivery arrangements from non-perishable products.</p>

                <ul className="legal-list">
                  <li>Customers should provide a complete and reachable delivery address.</li>

                  <li>Customers should remain available to receive applicable deliveries.</li>

                  <li>Products should be inspected promptly after delivery.</li>

                  <li>Concerns relating to freshness, damage, or incorrect items should be reported as soon as reasonably possible.</li>
                </ul>

                <p>Please refer to our Refund Policy for applicable cancellation, replacement, and refund conditions.</p>
              </div>
            </section>

            <section id="live-products" className="legal-section">
              <div className="section-number">08</div>

              <div>
                <h2>Live Chicks, Birds & Breeding Stock</h2>

                <p>Live chicks, live birds, breeding pairs, and similar farm products require additional care and may be subject to product-specific delivery arrangements.</p>

                <p>Availability and delivery may depend on the health and condition of the stock, weather, destination, transportation conditions, and applicable farm handling requirements.</p>

                <div className="shipping-feature-grid">
                  <div className="shipping-feature">
                    <ShieldCheck size={21} />

                    <h3>Careful Handling</h3>

                    <p>Live products require appropriate transportation and handling conditions.</p>
                  </div>

                  <div className="shipping-feature">
                    <MapPin size={21} />

                    <h3>Location Check</h3>

                    <p>Delivery feasibility may be reviewed based on the destination before fulfilment.</p>
                  </div>
                </div>

                <p>We may contact customers where additional delivery coordination is required.</p>
              </div>
            </section>

            <section id="address" className="legal-section">
              <div className="section-number">09</div>

              <div>
                <h2>Delivery Address & Customer Information</h2>

                <p>Customers are responsible for providing accurate and complete delivery information at checkout.</p>

                <ul className="legal-list">
                  <li>Full and correct delivery address.</li>
                  <li>Valid mobile number and contact information.</li>
                  <li>Correct pincode or applicable location details.</li>
                  <li>Any relevant delivery instructions that may help locate the destination.</li>
                </ul>

                <p>Delays, failed deliveries, additional delivery attempts, or other consequences resulting from incorrect or incomplete information may not be attributable to BR30 Kadaknath Farms.</p>
              </div>
            </section>

            <section id="failed-delivery" className="legal-section">
              <div className="section-number">10</div>

              <div>
                <h2>Failed or Attempted Delivery</h2>

                <p>A delivery may fail or be delayed if the customer is unavailable, the address cannot be located, the customer cannot be reached, access is restricted, or other delivery conditions prevent completion.</p>

                <ul className="legal-list">
                  <li>We may attempt to contact the customer using the provided contact information.</li>

                  <li>A second delivery attempt may depend on product type and logistics feasibility.</li>

                  <li>Additional charges may apply where a new delivery attempt creates additional logistics costs.</li>

                  <li>Certain fresh or live products may not be suitable for repeated delivery attempts.</li>
                </ul>

                <p>Any resulting cancellation or refund will be considered in accordance with the applicable order and refund terms.</p>
              </div>
            </section>

            <section id="delays" className="legal-section">
              <div className="section-number">11</div>

              <div>
                <h2>Weather, Natural Events & Logistics Delays</h2>

                <p>Delivery may be affected by circumstances outside our reasonable control.</p>

                <ul className="legal-list">
                  <li>Heavy rain, storms, extreme weather, or natural events.</li>
                  <li>Road closures or transportation disruptions.</li>
                  <li>Unexpected logistics or delivery partner issues.</li>
                  <li>Local restrictions or operational interruptions.</li>
                  <li>Unusual order volume or farm-side operational issues.</li>
                </ul>

                <p>When such circumstances occur, delivery may be postponed, rescheduled, or otherwise adjusted to protect the product and support safe fulfilment.</p>

                <div className="legal-callout">
                  <strong>Product safety comes first.</strong>

                  <span>For fresh or live products, a reasonable delivery delay may sometimes be necessary where immediate transportation could create unacceptable handling or safety concerns.</span>
                </div>
              </div>
            </section>

            <section id="inspection" className="legal-section">
              <div className="section-number">12</div>

              <div>
                <h2>Inspection at Delivery</h2>

                <p>Customers are encouraged to inspect their order as soon as reasonably possible after delivery.</p>

                <p>If there is an obvious issue involving a wrong, damaged, or materially different item, customers should contact us promptly with relevant order information and supporting photographs where appropriate.</p>

                <div className="legal-callout">
                  <strong>Keep your order information available.</strong>

                  <span>Order number, delivery details, product information, and clear photographs may help us review a delivery-related concern more efficiently.</span>
                </div>
              </div>
            </section>

            <section id="tracking" className="legal-section">
              <div className="section-number">13</div>

              <div>
                <h2>Order Tracking</h2>

                <p>Where order tracking is available, customers may use the tracking facility provided through our website or the applicable delivery service.</p>

                <p>Tracking information may not update instantly and may sometimes be delayed due to operational or technical limitations.</p>

                <div className="process-card">
                  <div>
                    <span>01</span>
                    <strong>Order Placed</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>02</span>
                    <strong>Processing</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>03</span>
                    <strong>Out for Delivery</strong>
                  </div>

                  <ArrowRight size={17} />

                  <div>
                    <span>04</span>
                    <strong>Delivered</strong>
                  </div>
                </div>

                <p>
                  You may also visit our{" "}
                  <Link className="inline-link" to="/track-order">
                    Track Order
                  </Link>{" "}
                  page where applicable.
                </p>
              </div>
            </section>

            <section id="restrictions" className="legal-section">
              <div className="section-number">14</div>

              <div>
                <h2>Delivery Restrictions</h2>

                <p>Certain products may have additional delivery restrictions because of their nature, handling requirements, destination, transportation conditions, or applicable requirements.</p>

                <ul className="legal-list">
                  <li>Some live products may not be deliverable to every location.</li>

                  <li>Certain products may require advance confirmation before dispatch.</li>

                  <li>Delivery may be restricted where safe transportation cannot reasonably be arranged.</li>

                  <li>Product-specific restrictions may apply depending on current farm availability.</li>
                </ul>

                <p>If a restriction affects an existing order, we may contact the customer to discuss the available options.</p>
              </div>
            </section>

            <section id="wrong-damaged" className="legal-section">
              <div className="section-number">15</div>

              <div>
                <h2>Wrong, Missing or Damaged Items</h2>

                <p>If you receive an incorrect, missing, or visibly damaged item, please contact us promptly after delivery.</p>

                <p>We may request order information, photographs, delivery details, or other information reasonably required to review the issue.</p>

                <div className="shipping-feature-grid">
                  <div className="shipping-feature">
                    <PackageCheck size={21} />

                    <h3>Check the Order</h3>

                    <p>Compare the delivered items with your order information as soon as reasonably possible.</p>
                  </div>

                  <div className="shipping-feature">
                    <Mail size={21} />

                    <h3>Contact Support</h3>

                    <p>Report the issue promptly so that it can be reviewed under the applicable policy.</p>
                  </div>
                </div>

                <p>Any replacement or refund will be considered according to the applicable product and Refund Policy terms.</p>

                <p>
                  Please review our{" "}
                  <Link className="inline-link" to="/refund-policy">
                    Refund Policy
                  </Link>{" "}
                  for further information.
                </p>
              </div>
            </section>

            <section id="changes" className="legal-section">
              <div className="section-number">16</div>

              <div>
                <h2>Changes to This Shipping Policy</h2>

                <p>We may update this Shipping Policy from time to time to reflect changes in our delivery processes, products, logistics arrangements, technology, or applicable legal requirements.</p>

                <p>Updated versions will be published on this page with a revised "Last Updated" and, where appropriate, "Effective From" date.</p>

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
              <div className="section-number">17</div>

              <div>
                <h2>Contact Us</h2>

                <p>If you have questions about delivery, shipping, order tracking, serviceability, or a delivery-related issue, please contact BR30 Kadaknath Farms.</p>

                <div className="contact-legal-card">
                  <div className="contact-legal-icon">
                    <Mail size={22} />
                  </div>

                  <div>
                    <span>Customer Support</span>
                    <strong>BR30 Kadaknath Farms</strong>
                    <p>Our Contact page can be used for shipping questions and support requests.</p>
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

              <p>This Shipping Policy should be read together with our Terms of Service, Refund Policy, and Privacy Policy, where applicable.</p>
            </div>
          </article>
        </div>
      </section>

      <style>{`.legal-page{background:#fbfaf5;color:var(--color-text)}.legal-hero{padding:38px 0 72px;background:radial-gradient(circle at 85% 20%,rgba(201,154,61,.11),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}.legal-breadcrumb{display:flex;align-items:center;gap:7px;margin-bottom:42px;color:var(--color-text-soft);font-size:.82rem}.legal-breadcrumb a{color:var(--color-green);font-weight:700}.legal-hero-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);align-items:center;gap:60px}.legal-icon{display:grid;place-items:center;width:64px;height:64px;margin-bottom:20px;border:1px solid rgba(63,107,53,.16);border-radius:18px;background:var(--color-green-pale);color:var(--color-green)}.legal-eyebrow{display:block;margin-bottom:10px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em}.legal-hero-content h1{margin-bottom:18px;color:var(--color-primary);font-size:clamp(2.7rem,5vw,4.5rem);letter-spacing:-.05em}.legal-hero-content>p{max-width:750px;color:#1a120c;font-size:1.02rem;line-height:1.8}.legal-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.legal-meta>div{min-width:175px;padding:13px 16px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:rgba(255,253,247,.78)}.legal-meta span{display:block;margin-bottom:3px;color:var(--color-text-soft);font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.legal-meta strong{color:var(--color-primary);font-size:.84rem}.legal-trust-card{padding:28px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.trust-card-icon{display:grid;place-items:center;width:50px;height:50px;margin-bottom:18px;border-radius:15px;background:var(--color-primary);color:var(--color-gold-light)}.legal-trust-card h2{margin-bottom:10px;color:var(--color-primary);font-size:1.35rem}.legal-trust-card>p{color:#1a120c;font-size:.86rem;line-height:1.7}.trust-points{display:grid;gap:11px;margin-top:20px;padding-top:18px;border-top:1px solid var(--color-border)}.trust-points div{display:flex;align-items:center;gap:9px;color:#1a120c;font-size:.8rem}.trust-points svg{flex-shrink:0;color:var(--color-green)}.legal-content-section{padding:75px 0 100px}.legal-layout{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start;gap:55px}.legal-sidebar{position:sticky;top:105px}.legal-sidebar-inner{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.sidebar-title{display:flex;align-items:center;gap:9px;padding:17px 18px;border-bottom:1px solid var(--color-border);color:var(--color-primary);font-size:.83rem;font-weight:800}.sidebar-title svg{color:var(--color-green)}.legal-sidebar nav{padding:8px}.legal-sidebar nav a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-radius:8px;color:#1a120c;font-size:.76rem;transition:background var(--transition-fast),color var(--transition-fast)}.legal-sidebar nav a:hover{background:var(--color-green-pale);color:var(--color-green)}.sidebar-help{display:grid;grid-template-columns:auto 1fr;gap:9px;margin:8px;padding:14px;border-radius:var(--radius-md);background:var(--color-cream)}.sidebar-help>svg{color:var(--color-green)}.sidebar-help div{display:grid;gap:2px}.sidebar-help strong{color:var(--color-primary);font-size:.76rem}.sidebar-help span{color:#1a120c;font-size:.68rem;line-height:1.4}.sidebar-help a{grid-column:1/-1;margin-top:3px;color:var(--color-green);font-size:.72rem;font-weight:800}.legal-document{min-width:0}.legal-notice{display:flex;gap:14px;margin-bottom:50px;padding:20px 22px;border:1px solid rgba(63,107,53,.18);border-radius:var(--radius-lg);background:var(--color-green-pale)}.legal-notice>svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.legal-notice strong{display:block;margin-bottom:5px;color:var(--color-primary);font-size:.9rem}.legal-notice p{color:#1a120c;font-size:.8rem;line-height:1.65}.legal-section{display:grid;grid-template-columns:48px minmax(0,1fr);gap:20px;padding:0 0 48px;margin-bottom:48px;border-bottom:1px solid var(--color-border);scroll-margin-top:110px}.section-number{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--color-primary);color:var(--color-gold-light);font-size:.68rem;font-weight:800}.legal-section h2{margin-bottom:16px;color:var(--color-primary);font-size:clamp(1.45rem,2vw,1.85rem);letter-spacing:-.025em}.legal-section p{margin-bottom:14px;color:#1a120c;font-size:.9rem;line-height:1.85}.legal-list{display:grid;gap:10px;margin:17px 0}.legal-list li{position:relative;padding-left:22px;color:#1a120c;font-size:.88rem;line-height:1.65}.legal-list li::before{content:"";position:absolute;left:4px;top:.7em;width:6px;height:6px;border-radius:50%;background:var(--color-green)}.shipping-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:22px 0}.shipping-feature{padding:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white)}.shipping-feature>svg{margin-bottom:13px;color:var(--color-green)}.shipping-feature h3{margin-bottom:7px;color:var(--color-primary);font-size:.92rem}.shipping-feature p{margin-bottom:0;color:#1a120c;font-size:.77rem;line-height:1.65}.legal-callout{display:grid;gap:5px;margin-top:20px;padding:17px 18px;border-left:3px solid var(--color-gold);border-radius:0 var(--radius-md) var(--radius-md) 0;background:var(--color-cream)}.legal-callout strong{color:var(--color-primary);font-size:.82rem}.legal-callout span{color:#1a120c;font-size:.78rem;line-height:1.6}.process-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:22px;padding:17px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.process-card div{display:grid;gap:4px}.process-card span{color:var(--color-green);font-size:.66rem;font-weight:900}.process-card strong{color:var(--color-primary);font-size:.72rem}.process-card>svg{flex-shrink:0;color:var(--color-text-soft)}.security-banner{display:flex;align-items:flex-start;gap:13px;margin-top:22px;padding:18px;border-radius:var(--radius-lg);background:var(--color-primary);color:var(--color-white)}.security-banner>svg{flex-shrink:0;color:var(--color-gold-light)}.security-banner div{display:grid;gap:4px}.security-banner strong{font-size:.82rem}.security-banner span{color:rgba(255,255,255,.85);font-size:.75rem;line-height:1.6}.inline-link{color:var(--color-green);font-weight:750}.date-card{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.date-card>div{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-cream)}.date-card span{display:block;margin-bottom:4px;color:#1a120c;font-size:.65rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.date-card strong{color:var(--color-primary);font-size:.77rem}.contact-legal-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin-top:22px;padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.contact-legal-icon{display:grid;place-items:center;width:45px;height:45px;border-radius:13px;background:var(--color-green-pale);color:var(--color-green)}.contact-legal-card div:nth-child(2) span{display:block;margin-bottom:2px;color:#1a120c;font-size:.68rem}.contact-legal-card div:nth-child(2) strong{color:var(--color-primary);font-size:.83rem}.contact-legal-card div:nth-child(2) p{margin:3px 0 0;color:#1a120c;font-size:.72rem}.contact-legal-card>a{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-size:.76rem;font-weight:800;white-space:nowrap}.legal-footer-note{display:flex;align-items:flex-start;gap:10px;padding:20px;border-radius:var(--radius-lg);background:var(--color-cream)}.legal-footer-note svg{flex-shrink:0;color:var(--color-green)}.legal-footer-note p{margin:0;color:#1a120c;font-size:.76rem;line-height:1.65}@media (max-width:991px){.legal-hero-grid{grid-template-columns:1fr;gap:35px}.legal-trust-card{max-width:650px}.legal-layout{grid-template-columns:1fr;gap:35px}.legal-sidebar{position:static}.legal-sidebar nav{display:grid;grid-template-columns:repeat(2,1fr)}.sidebar-help{grid-column:1/-1}}@media (max-width:767px){.legal-hero{padding:28px 0 55px}.legal-breadcrumb{margin-bottom:30px}.legal-content-section{padding:55px 0 75px}.legal-sidebar nav{grid-template-columns:1fr}.legal-section{grid-template-columns:1fr;gap:12px;padding-bottom:38px;margin-bottom:38px}.section-number{width:34px;height:34px}.shipping-feature-grid{grid-template-columns:1fr}.date-card{grid-template-columns:1fr}.process-card{align-items:stretch;flex-direction:column}.process-card>svg{transform:rotate(90deg);align-self:center}}@media (max-width:575px){.legal-meta{display:grid}.legal-meta>div{min-width:0}.legal-trust-card{padding:22px}.legal-notice{padding:16px}.legal-section p{font-size:.86rem}.contact-legal-card{grid-template-columns:auto 1fr}.contact-legal-card>a{grid-column:1/-1;justify-content:center;min-height:42px;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white)}}`}</style>
    </main>
  );
};

export default ShippingPolicy;
