import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import siteConfig from "../../config/siteConfig";
import { useWhatsNew } from "../../context/WhatsNewContext";
import WhatsNewCard from "../whatsNew/WhatsNewCard";

const Footer = () => {
  const navigate = useNavigate();
  const whatsNewGridRef = useRef(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const { features, openFeature, markExplored } = useWhatsNew();

  /*
   * What's New is only for internal Farm OS roles.
   * Customers should never see this section.
   */
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("br30_user");

      if (!storedUser) return null;

      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  const user = getStoredUser();

  const isCustomer = user?.role === "customer";

  const allowedWhatsNewRoles = ["admin", "staff", "fm", "security", "customer"];

  const canViewWhatsNew = user?.role && allowedWhatsNewRoles.includes(user.role);

  const handleOpenFeature = (feature) => {
    if (!feature?._id) return;

    openFeature(feature._id);
  };

  const handleExploreFeature = async (feature) => {
    if (!feature?._id) return;

    await markExplored(feature._id);
  };

  const handleFeatureCta = async (feature) => {
    if (!feature?._id) return;

    await markExplored(feature._id);

    if (feature?.cta?.enabled && feature?.cta?.route) {
      navigate(feature.cta.route);
    }
  };

  const updateScrollButtons = () => {
    const container = whatsNewGridRef.current;

    if (!container) return;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);

    setCanScrollPrev(container.scrollLeft > 10);
    setCanScrollNext(container.scrollLeft < maxScrollLeft - 2);
  };

  const scrollWhatsNew = (direction) => {
    const container = whatsNewGridRef.current;

    if (!container) return;

    const card = container.querySelector(".whats-new-card");

    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;

    const styles = window.getComputedStyle(container);

    const gap = parseFloat(styles.columnGap || styles.gap || "22") || 22;

    const scrollAmount = cardWidth + gap;

    if (direction === "prev" && !canScrollPrev) return;
    if (direction === "next" && !canScrollNext) return;

    container.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!canViewWhatsNew) return;

    const container = whatsNewGridRef.current;

    if (!container) return;

    updateScrollButtons();

    const handleScroll = () => {
      updateScrollButtons();
    };

    const handleResize = () => {
      updateScrollButtons();
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtons();
    });

    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [features.length, canViewWhatsNew]);

  return (
    <>
      {canViewWhatsNew && features.length > 0 && (
        <section className="whats-new-footer-section">
          <div className="whats-new-footer-container">
            <div className="whats-new-footer-heading">
              <div className="whats-new-footer-heading-left">
                {isCustomer ? (
                  <>
                    <span className="whats-new-footer-label">YOUR ORDER JOURNEY</span>

                    <h2>Track Your Order Journey</h2>

                    <p>Follow your Kadaknath order from order placement to doorstep delivery.</p>
                  </>
                ) : (
                  <>
                    <span className="whats-new-footer-label">WHAT'S NEW</span>

                    <h2>Latest Updates & Features</h2>

                    <p>Discover the latest updates, improvements and new features available in BR30 Kadaknath Farms.</p>
                  </>
                )}
              </div>

              <div className="whats-new-footer-controls">
                <button type="button" className="whats-new-footer-nav-btn" onClick={() => scrollWhatsNew("prev")} disabled={!canScrollPrev} aria-label="Previous features" title="Previous">
                  <ChevronLeft size={20} strokeWidth={2.2} />
                </button>

                <button type="button" className="whats-new-footer-nav-btn" onClick={() => scrollWhatsNew("next")} disabled={!canScrollNext} aria-label="Next features" title="Next">
                  <ChevronRight size={20} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            <div className="whats-new-footer-grid" ref={whatsNewGridRef}>
              {features.map((feature) => (
                <WhatsNewCard key={feature._id} feature={feature} compact onOpen={handleOpenFeature} onExplore={handleExploreFeature} onCta={handleFeatureCta} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link to="/#home" className="footer-logo" aria-label="BR30 Kadaknath Farms Home">
              <span className="footer-logo-mark">
                <img src="/favicon-32x32.png" alt="BR30 Kadaknath Farms" />
              </span>

              <span className="footer-logo-name">Kadaknath Farms</span>
            </Link>

            <p className="footer-description">Naturally raised Kadaknath farm products, brought from our farm to your table.</p>
          </div>

          <div className="footer-links">
            <Link to="/products">Products</Link>

            <Link to="/about-farm">About Farm</Link>

            <Link to="/contact">Contact</Link>

            <Link to="/faq">FAQ</Link>
          </div>

          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>

            <Link to="/terms-of-service">Terms of Service</Link>

            <Link to="/refund-policy">Refund Policy</Link>

            <Link to="/shipping-policy">Shipping Policy</Link>
          </div>

          <div className="footer-social">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
              <FaYoutube size={19} />
              <span>YouTube</span>
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
              <FaFacebookF size={18} />
              <span>Facebook</span>
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
              <FaInstagram size={19} />
              <span>Instagram</span>
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
              <FaWhatsapp size={19} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <p>
              © {new Date().getFullYear()} {siteConfig.footer.copyright}
            </p>

            <p>{siteConfig.footer.credit}</p>
          </div>
        </div>
      </footer>

      <style>{`
.whats-new-footer-section{width:100%;padding:58px 0 62px;background:var(--admin-surface-2,#f8fafc);border-top:1px solid var(--admin-border,#e2e8f0)}
.whats-new-footer-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));margin-inline:auto}
.whats-new-footer-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:28px}
.whats-new-footer-heading-left{max-width:720px;min-width:0}
.whats-new-footer-label{display:inline-flex;align-items:center;margin-bottom:8px;color:#2563eb;font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.whats-new-footer-heading h2{margin:0;color:var(--admin-text,#0f172a);font-size:28px;font-weight:800;line-height:1.25}
.whats-new-footer-heading p{margin:9px 0 0;color:var(--admin-muted,#64748b);font-size:14px;line-height:1.6}
.whats-new-footer-controls{display:flex;align-items:center;gap:8px;flex:0 0 auto}
.whats-new-footer-nav-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--admin-border,#dbe3ec);border-radius:10px;background:var(--admin-surface,#fff);color:var(--admin-text,#334155);box-shadow:0 4px 12px rgba(15,23,42,.06);cursor:pointer;transition:all .2s ease}
.whats-new-footer-nav-btn:hover:not(:disabled){border-color:#2563eb;background:#2563eb;color:#fff;transform:translateY(-2px);box-shadow:0 7px 18px rgba(37,99,235,.2)}
.whats-new-footer-nav-btn:active:not(:disabled){transform:translateY(0)}
.whats-new-footer-nav-btn:focus{outline:none}
.whats-new-footer-nav-btn:focus-visible:not(:disabled){outline:2px solid rgba(37,99,235,.28);outline-offset:2px}
.whats-new-footer-nav-btn:disabled{opacity:.45;cursor:not-allowed;background:var(--admin-surface-2,#f8fafc)!important;color:var(--admin-muted,#94a3b8)!important;border-color:var(--admin-border,#e2e8f0)!important;box-shadow:none!important;transform:none!important;pointer-events:none}
.whats-new-footer-nav-btn:disabled:hover,.whats-new-footer-nav-btn:disabled:active{background:var(--admin-surface-2,#f8fafc)!important;color:var(--admin-muted,#94a3b8)!important;border-color:var(--admin-border,#e2e8f0)!important;box-shadow:none!important;transform:none!important}
.whats-new-footer-nav-btn:disabled svg{opacity:.7!important;color:var(--admin-muted,#94a3b8)!important;visibility:visible!important;display:block!important}
.whats-new-footer-grid{display:flex;align-items:stretch;gap:22px;width:100%;overflow-x:auto;overflow-y:hidden;padding:3px 3px 14px;scroll-behavior:smooth;scroll-snap-type:x mandatory;scrollbar-width:none}
.whats-new-footer-grid::-webkit-scrollbar{display:none}
.whats-new-footer-grid .whats-new-card{height:auto;min-width:calc((100% - 44px) / 3);max-width:calc((100% - 44px) / 3);display:flex;flex:0 0 calc((100% - 44px) / 3);flex-direction:column;scroll-snap-align:start}
.whats-new-footer-grid .whats-new-card-content{flex:1;display:flex;flex-direction:column}
.whats-new-footer-grid .whats-new-card-footer{margin-top:auto;padding-top:13px}
.whats-new-footer-grid .whats-new-card-open{overflow:hidden}
.whats-new-footer-grid .whats-new-card-open:hover .whats-new-media-image{transform:scale(1.025)}
.whats-new-footer-grid .whats-new-media-image{transition:transform .3s ease}

.footer{background:var(--color-primary);color:var(--color-white)}
.footer-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));margin-inline:auto;padding:60px 0 45px;display:grid;grid-template-columns:1.5fr 1fr 1.2fr 1fr;gap:45px}
.footer-brand{max-width:390px}
.footer-logo{display:inline-flex;align-items:center;gap:11px}
.footer-logo-mark{width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border-radius:12px;background:var(--color-white)}
.footer-logo-mark img{width:100%;height:100%;display:block;object-fit:cover}
.footer-logo-name{color:var(--color-white);font-size:1rem;font-weight:800}
.footer-description{margin-top:18px;color:rgba(255,255,255,.68);font-size:.92rem;line-height:1.75}
.footer-links,.footer-legal,.footer-social{display:flex;flex-direction:column;align-items:flex-start;gap:11px;transform:translateX(1in)}
.footer-links::before,.footer-legal::before,.footer-social::before{margin-bottom:6px;color:var(--color-gold-light);font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.footer-links::before{content:"Explore"}
.footer-legal::before{content:"Legal"}
.footer-social::before{content:"Follow Us"}
.footer-links a,.footer-legal a{color:rgba(255,255,255,.7);font-size:.88rem;font-weight:600;transition:color var(--transition-fast),transform var(--transition-fast)}
.footer-links a:hover,.footer-legal a:hover{color:var(--color-white);transform:translateX(3px)}
.footer-social a{display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.7);font-size:.88rem;font-weight:600;text-decoration:none;transition:color var(--transition-fast),transform var(--transition-fast)}
.footer-social a svg{flex-shrink:0}
.footer-social a:hover{color:var(--color-white);transform:translateX(3px)}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1)}
.footer-bottom-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));min-height:65px;margin-inline:auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
.footer-bottom p{color:rgba(255,255,255,.48);font-size:.78rem}

@media(max-width:1000px){
.whats-new-footer-grid .whats-new-card{min-width:calc((100% - 22px) / 2);max-width:calc((100% - 22px) / 2);flex-basis:calc((100% - 22px) / 2)}
.footer-container{grid-template-columns:1.4fr 1fr 1fr 1fr;gap:28px}
.footer-links,.footer-legal,.footer-social{transform:translateX(.45in)}
}

@media(max-width:800px){
.whats-new-footer-section{padding:48px 0 52px}
.whats-new-footer-heading{margin-bottom:22px}
.whats-new-footer-heading h2{font-size:24px}
.whats-new-footer-grid{gap:18px}
.whats-new-footer-grid .whats-new-card{min-width:calc((100% - 18px) / 2);max-width:calc((100% - 18px) / 2);flex-basis:calc((100% - 18px) / 2)}
.footer-container{grid-template-columns:1fr 1fr 1fr;gap:28px 20px}
.footer-brand{grid-column:1/-1;max-width:600px}
.footer-links,.footer-legal,.footer-social{transform:none}
}

@media(max-width:600px){
.whats-new-footer-section{padding:40px 0 44px}
.whats-new-footer-heading{align-items:flex-end;gap:14px;margin-bottom:19px}
.whats-new-footer-heading-left{max-width:calc(100% - 86px)}
.whats-new-footer-heading h2{font-size:21px}
.whats-new-footer-heading p{font-size:13px}
.whats-new-footer-controls{gap:6px}
.whats-new-footer-nav-btn{width:36px;height:36px;border-radius:9px}
.whats-new-footer-grid{gap:15px;padding-bottom:12px}
.whats-new-footer-grid .whats-new-card{min-width:88%;max-width:88%;flex-basis:88%}
.footer-container{grid-template-columns:repeat(3,minmax(0,1fr));padding:42px 0 32px;gap:28px 12px}
.footer-brand{grid-column:1/-1;max-width:100%;margin-bottom:4px}
.footer-links,.footer-legal,.footer-social{gap:10px;transform:translateX(-0.08in)}
.footer-links::before,.footer-legal::before,.footer-social::before{font-size:.68rem;letter-spacing:.08em}
.footer-links a,.footer-legal a,.footer-social a{font-size:.75rem;line-height:1.35}
.footer-social a{gap:6px}
.footer-social a svg{width:16px;height:16px}
.footer-bottom-container{min-height:65px;padding:14px 0;flex-direction:row;align-items:center;justify-content:space-between;gap:12px}
.footer-bottom p{font-size:.72rem;line-height:1.5}
}

@media(max-width:380px){
.whats-new-footer-heading h2{font-size:19px}
.whats-new-footer-heading p{font-size:12px}
.whats-new-footer-heading-left{max-width:calc(100% - 78px)}
.whats-new-footer-nav-btn{width:34px;height:34px}
.footer-bottom p{font-size:.68rem;line-height:1.4;white-space:nowrap}
.footer-container{grid-template-columns:repeat(3,minmax(0,1fr));gap:25px 8px}
.footer-links,.footer-legal,.footer-social{transform:none}
.footer-links a,.footer-legal a,.footer-social a{font-size:.7rem}
.footer-social a{gap:5px}
.footer-bottom-container{gap:8px}
.footer-bottom p{font-size:.62rem}
.footer-social a svg{width:15px;height:15px}
}
      `}</style>
    </>
  );
};

export default Footer;
