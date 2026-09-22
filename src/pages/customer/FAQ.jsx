import { useMemo, useState } from "react";
import { ChevronDown, Search, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const faqData = [
  {
    category: "Products",
    questions: [
      {
        question: "What is Kadaknath chicken?",
        answer: "Kadaknath is a distinctive Indian chicken breed known for its naturally dark plumage and traditional farming heritage. At BR30 Kadaknath Farms, we focus on careful farm handling and responsible raising practices.",
      },
      {
        question: "What Kadaknath products do you offer?",
        answer: "Our product range includes Kadaknath eggs, Kadaknath chicken, Kadaknath chicks, hatching eggs, breeding pairs, and live birds, subject to current farm availability.",
      },
      {
        question: "Are all products available throughout the year?",
        answer: "Availability can vary depending on farm stock, breeding cycles, seasonal conditions, and fresh inventory. Products shown as unavailable cannot currently be ordered.",
      },
      {
        question: "Can I buy Kadaknath chicks for farming?",
        answer: "Yes. Kadaknath chicks are available for customers interested in starting or expanding a Kadaknath farming setup, subject to current stock.",
      },
    ],
  },
  {
    category: "Orders",
    questions: [
      {
        question: "How can I place an order?",
        answer: "Browse our Products page, select the product you want, add it to your cart, review your order, and continue to checkout. Enter your delivery details and submit the order.",
      },
      {
        question: "Do I need an account to place an order?",
        answer: "Yes. You need to create an account and log in to place an order on BR30 Kadaknath Farms. This helps us securely manage your orders, payments, delivery updates, and order history.",
      },
      {
        question: "Can I change my order after placing it?",
        answer: "Order changes depend on the order status and whether the farm has already started processing the order. Please contact us as soon as possible if you need to make a change.",
      },
      {
        question: "Where can I see my order details?",
        answer: "If you have an account, you can use the My Orders section to view your orders. You can also use the Track Order page when you have a valid order ID.",
      },
    ],
  },
  {
    category: "Delivery",
    questions: [
      {
        question: "Where do you deliver?",
        answer: "Delivery availability depends on the product, current farm operations, and delivery location. Your delivery details are checked during the ordering process.",
      },
      {
        question: "How long does delivery take?",
        answer: "Delivery time can vary based on your location, product type, stock availability, and order processing. The expected delivery information will be provided with your order.",
      },
      {
        question: "Is delivery free?",
        answer: "Delivery charges may depend on your delivery location, order type, and applicable delivery arrangements. The final delivery charge will be shown during checkout when applicable.",
      },
      {
        question: "Can I track my order?",
        answer: "Yes. Once your order has been processed, you can use the Track Order page with your order ID to check its current status.",
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        question: "What payment methods are available?",
        answer: "Available payment methods are shown during checkout. Payment options may change depending on the current payment setup of BR30 Kadaknath Farms.",
      },
      {
        question: "Is online payment secure?",
        answer: "Payments are processed through the payment system integrated with the website. Never share your card PIN, OTP, CVV, or banking password with anyone.",
      },
      {
        question: "What happens if my payment fails?",
        answer: "If a payment fails, first check your payment method and try again. If money was deducted but the order was not successfully placed, please contact us with the relevant transaction details.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        question: "Can I cancel my order?",
        answer: "Order cancellation depends on the current processing status of the order. Please contact BR30 Kadaknath Farms as early as possible if you need to cancel an order.",
      },
      {
        question: "Can I return a product?",
        answer: "Return eligibility depends on the type and condition of the product. Please review our Refund Policy for the applicable rules before placing an order.",
      },
      {
        question: "What should I do if I receive a damaged or incorrect order?",
        answer: "Please contact us as soon as possible with your order ID and clear photographs or other relevant details so that the issue can be reviewed.",
      },
      {
        question: "How are refunds processed?",
        answer: "Approved refunds are processed according to the applicable refund policy and payment method used for the order. Processing time can vary depending on the payment provider.",
      },
    ],
  },
  {
    category: "Chicks & Breeding",
    questions: [
      {
        question: "Do you provide breeding pairs?",
        answer: "Yes. Kadaknath breeding pairs may be available depending on current farm stock and selection.",
      },
      {
        question: "Do you sell hatching eggs?",
        answer: "Yes. Selected Kadaknath hatching eggs may be available depending on current farm production and stock.",
      },
      {
        question: "Can I get guidance for starting Kadaknath farming?",
        answer: "We can share general information about our products and farming approach. For specific veterinary, incubation, nutrition, or commercial farming decisions, consult a qualified poultry or veterinary professional.",
      },
    ],
  },
  {
    category: "Farm & Quality",
    questions: [
      {
        question: "How are your Kadaknath birds raised?",
        answer: "We focus on responsible farm management, careful handling, suitable feeding practices, clean surroundings, and regular attention to bird welfare and farm hygiene.",
      },
      {
        question: "Where do your products come from?",
        answer: "Our Kadaknath products are sourced from BR30 Kadaknath Farms and are subject to current farm production and availability.",
      },
      {
        question: "Can I visit the farm?",
        answer: "Farm visits depend on availability and prior arrangements. Please contact us before planning a visit so we can confirm whether a visit can be accommodated.",
      },
    ],
  },
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return faqData;
    }

    return faqData
      .map((category) => ({
        ...category,
        questions: category.questions.filter((item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query) || category.category.toLowerCase().includes(query)),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchTerm]);

  const toggleItem = (category, question) => {
    const key = `${category}-${question}`;

    setActiveItem((current) => (current === key ? null : key));
  };

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="container">
          <div className="faq-hero-content">
            <span className="faq-eyebrow">HELP & SUPPORT</span>

            <h1>Frequently Asked Questions</h1>

            <p>Find quick answers about our Kadaknath products, orders, delivery, payments, and farm services.</p>

            <div className="faq-search">
              <Search size={20} />

              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search your question..." aria-label="Search frequently asked questions" />
            </div>
          </div>
        </div>
      </section>

      <section className="faq-content section">
        <div className="container">
          {filteredCategories.length > 0 ? (
            <div className="faq-list">
              {filteredCategories.map((category) => (
                <div className="faq-category" key={category.category}>
                  <div className="faq-category-heading">
                    <span>{category.category}</span>
                  </div>

                  <div className="faq-items">
                    {category.questions.map((item) => {
                      const itemKey = `${category.category}-${item.question}`;
                      const isOpen = activeItem === itemKey;

                      return (
                        <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.question}>
                          <button type="button" className="faq-question" onClick={() => toggleItem(category.category, item.question)} aria-expanded={isOpen}>
                            <span>{item.question}</span>

                            <ChevronDown size={20} className="faq-chevron" />
                          </button>

                          <div className={`faq-answer ${isOpen ? "faq-answer-open" : ""}`}>
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="faq-empty">
              <div className="faq-empty-icon">
                <Search size={26} />
              </div>

              <h2>No questions found</h2>

              <p>We couldn't find anything matching "{searchTerm}".</p>

              <button type="button" className="btn btn-primary" onClick={() => setSearchTerm("")}>
                View All Questions
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="faq-help section-soft">
        <div className="container">
          <div className="faq-help-card">
            <div className="faq-help-icon">
              <MessageCircle size={28} />
            </div>

            <div className="faq-help-content">
              <span className="section-eyebrow">STILL NEED HELP?</span>

              <h2>Can't find your answer?</h2>

              <p>Our team can help you with products, orders, delivery, availability, and other farm-related questions.</p>
            </div>

            <div className="faq-help-actions">
              <Link to="/contact" className="btn btn-primary">
                Contact Us
              </Link>

              <a href="tel:" className="faq-phone-button">
                <Phone size={18} />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`.faq-page{background:var(--bg-page)}.faq-hero{position:relative;overflow:hidden;padding:105px 0 95px;background:radial-gradient(circle at 80% 20%,rgba(111,143,69,.18),transparent 34%),linear-gradient(135deg,var(--color-primary) 0%,var(--color-primary-soft) 100%);color:var(--color-white)}.faq-hero::before{content:"";position:absolute;width:360px;height:360px;right:-120px;top:-150px;border:1px solid rgba(228,199,123,.2);border-radius:50%}.faq-hero::after{content:"";position:absolute;width:220px;height:220px;left:-110px;bottom:-130px;border:1px solid rgba(111,143,69,.25);border-radius:50%}.faq-hero-content{position:relative;z-index:1;max-width:780px;margin:0 auto;text-align:center}.faq-eyebrow{display:inline-block;margin-bottom:14px;color:var(--color-gold-light);font-size:.8rem;font-weight:800;letter-spacing:.14em}.faq-hero h1{margin-bottom:18px;font-size:clamp(2.4rem,5vw,4rem);letter-spacing:-.03em}.faq-hero p{max-width:650px;margin:0 auto;color:rgba(255,255,255,.85);font-size:1.05rem}.faq-search{display:flex;align-items:center;gap:12px;width:min(100%,620px);min-height:58px;margin:32px auto 0;padding:0 20px;border:1px solid rgba(255,255,255,.18);border-radius:var(--radius-pill);background:rgba(255,255,255,.1);backdrop-filter:blur(12px);color:rgba(255,255,255,.85)}.faq-search:focus-within{border-color:var(--color-gold-light);box-shadow:0 0 0 3px rgba(228,199,123,.12)}.faq-search input{width:100%;border:0;outline:0;background:transparent;color:var(--color-white);font-size:1rem}.faq-search input::placeholder{color:rgba(255,255,255,.78)}.faq-search input::-webkit-search-cancel-button{filter:brightness(0) invert(1)}.faq-content{background:var(--bg-page)}.faq-list{display:grid;gap:44px;max-width:900px;margin:0 auto}.faq-category-heading{margin-bottom:16px}.faq-category-heading span{display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border-radius:var(--radius-pill);background:var(--color-green-pale);color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.faq-items{overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.faq-item+.faq-item{border-top:1px solid var(--color-border)}.faq-question{display:flex;align-items:center;justify-content:space-between;gap:24px;width:100%;padding:22px 24px;border:0;background:transparent;color:var(--color-primary);text-align:left;font-size:1rem;font-weight:750}.faq-question:hover{background:var(--color-green-pale)}.faq-chevron{flex:0 0 auto;color:var(--color-green);transition:transform var(--transition-normal)}.faq-item.is-open .faq-chevron{transform:rotate(180deg)}.faq-answer{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--transition-normal),padding var(--transition-normal);padding:0 24px}.faq-answer p{overflow:hidden;margin:0;color:#1a120c;font-size:.96rem;line-height:1.75}.faq-answer-open{grid-template-rows:1fr;padding-bottom:22px}.faq-empty{max-width:620px;margin:0 auto;padding:70px 24px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-sm);text-align:center}.faq-empty-icon{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 18px;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.faq-empty h2{margin-bottom:8px;color:var(--color-primary)}.faq-empty p{margin-bottom:24px;color:#1a120c}.faq-help{padding:70px 0}.faq-help-card{display:flex;align-items:center;gap:24px;padding:34px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.faq-help-icon{display:grid;place-items:center;flex:0 0 auto;width:62px;height:62px;border-radius:18px;background:var(--color-green-pale);color:var(--color-green)}.faq-help-content{flex:1}.faq-help-content .section-eyebrow{margin-bottom:6px}.faq-help-content h2{margin-bottom:7px;color:var(--color-primary);font-size:1.65rem}.faq-help-content p{max-width:650px;color:#1a120c}.faq-help-actions{display:flex;align-items:center;gap:12px;flex:0 0 auto}.faq-phone-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);color:var(--color-primary);font-weight:700;transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast)}.faq-phone-button:hover{transform:translateY(-2px);border-color:var(--color-green);background:var(--color-green-pale)}@media (max-width:767px){.faq-hero{padding:78px 0 70px}.faq-hero h1{font-size:2.35rem}.faq-search{min-height:54px;padding:0 17px}.faq-list{gap:32px}.faq-question{padding:19px 18px;font-size:.96rem}.faq-answer{padding-left:18px;padding-right:18px}.faq-answer-open{padding-bottom:19px}.faq-help{padding:55px 0}.faq-help-card{flex-direction:column;align-items:flex-start;padding:26px 22px}.faq-help-actions{width:100%;flex-direction:column}.faq-help-actions .btn,.faq-phone-button{width:100%}}@media (max-width:480px){.faq-hero h1{font-size:2rem}.faq-hero p{font-size:.95rem}.faq-category-heading span{font-size:.72rem}.faq-empty{padding:55px 18px}}`}</style>
    </div>
  );
};

export default FAQ;
