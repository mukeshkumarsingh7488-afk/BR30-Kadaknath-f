import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWhatsNew } from "../../context/WhatsNewContext";
import WhatsNewMedia from "./WhatsNewMedia";

const WhatsNewOverlay = () => {
  const navigate = useNavigate();

  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const swipePointerId = useRef(null);

  const { popupFeatures, currentFeature, currentIndex, totalFeatures, isOpen, closeWhatsNew, nextFeature, previousFeature, goToFeature, markExplored } = useWhatsNew();

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

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !currentFeature) {
    return null;
  }

  const { _id, title = "What's New", shortDescription = "", description = "", version = "", media = {}, cta = {}, tracking = {} } = currentFeature;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalFeatures - 1;

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      closeWhatsNew();
    }
  };

  const handlePointerDown = (event) => {
    if (!isOpen || !currentFeature) return;

    swipePointerId.current = event.pointerId;
    swipeStartX.current = event.clientX;
    swipeStartY.current = event.clientY;
  };

  const handlePointerUp = (event) => {
    if (!isOpen || !currentFeature) return;
    if (swipePointerId.current !== event.pointerId) return;

    const deltaX = event.clientX - swipeStartX.current;
    const deltaY = event.clientY - swipeStartY.current;

    swipePointerId.current = null;

    const swipeThreshold = 60;

    if (Math.abs(deltaX) < swipeThreshold) return;
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Left → Next
    if (deltaX < 0 && !isLast) {
      nextFeature();
      return;
    }

    // Right → Previous
    if (deltaX > 0 && !isFirst) {
      previousFeature();
    }
  };

  const handleExplore = async () => {
    if (!_id) return;

    const success = await markExplored(_id);

    if (!success) return;

    if (isLast) {
      closeWhatsNew();
      return;
    }

    nextFeature();
  };

  const handleCta = async () => {
    if (_id) {
      await markExplored(_id);
    }

    if (!cta?.enabled || !cta?.route) {
      return;
    }

    closeWhatsNew();
    navigate(cta.route);
  };

  return (
    <>
      <div className="whats-new-overlay" role="dialog" aria-modal="true" aria-labelledby="whats-new-title" onMouseDown={handleOverlayMouseDown}>
        <div className="whats-new-window" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          {/* TOP BAR */}
          <div className="whats-new-window-top">
            <div className="whats-new-brand">
              <img src="/favicon-32x32.png" alt="BR30" className="whats-new-brand-logo" />

              <div className="whats-new-brand-text">
                <strong>{isCustomer ? "Your Order Journey" : "What's New"}</strong>
                <span>{isCustomer ? "BR30 Kadaknath Farms" : "BR30 Farm OS"}</span>
              </div>
            </div>

            <div className="whats-new-top-center">
              {version && <span className="whats-new-version">{version.startsWith("v") ? version : `v${version}`}</span>}

              <span className="whats-new-top-counter">
                {currentIndex + 1} / {totalFeatures}
              </span>
            </div>

            <button type="button" className="whats-new-close" onClick={closeWhatsNew} aria-label="Close What's New" title="Close">
              <X size={20} />
            </button>
          </div>

          {/* MAIN FEATURE AREA */}
          <div className="whats-new-feature-area">
            {/* LEFT CONTENT */}
            <section className="whats-new-content-panel">
              <div className="whats-new-content-inner">
                <div className="whats-new-content-label">
                  <span className="whats-new-content-label-dot" />
                  <span>{isCustomer ? "ORDER JOURNEY" : "NEW FEATURE"}</span>
                </div>

                <h1 id="whats-new-title">{title}</h1>

                {shortDescription && <p className="whats-new-short-description">{shortDescription}</p>}

                {description && <div className="whats-new-description">{description}</div>}

                {tracking?.explored && (
                  <div className="whats-new-explored">
                    <span className="whats-new-explored-icon">
                      <Check size={15} />
                    </span>

                    <div>
                      <strong>Explored</strong>
                      <span>You have already explored this feature.</span>
                    </div>
                  </div>
                )}

                {cta?.enabled && cta?.text && cta?.route && (
                  <button type="button" className="whats-new-cta" onClick={handleCta}>
                    <span>{cta.text}</span>
                    <ExternalLink size={17} />
                  </button>
                )}
              </div>

              {/* BOTTOM NAVIGATION */}
              <div className="whats-new-content-navigation">
                <div className="whats-new-navigation-left">
                  <span>
                    {currentIndex + 1} / {totalFeatures}
                  </span>
                </div>

                <div className="whats-new-navigation-buttons">
                  <button type="button" className="whats-new-nav-button" onClick={previousFeature} disabled={isFirst} aria-label="Previous feature" title="Previous">
                    <ArrowLeft size={19} />
                  </button>

                  <button type="button" className="whats-new-nav-button whats-new-nav-next" onClick={nextFeature} disabled={isLast} aria-label="Next feature" title="Next">
                    <ArrowRight size={19} />
                  </button>
                </div>
              </div>
            </section>

            {/* RIGHT IMAGE / VIDEO */}
            <section className="whats-new-media-panel">
              <div className="whats-new-media-frame">
                <WhatsNewMedia media={media} title={title} />

                <div className="whats-new-media-shade" />

                <div className="whats-new-media-badge">
                  <span />
                  {isCustomer ? "ORDER JOURNEY" : "FEATURE"}
                </div>

                {version && <span className="whats-new-media-version">{version.startsWith("v") ? version : `v${version}`}</span>}
              </div>
            </section>
          </div>

          {/* FEATURE CARDS */}
          <div className="whats-new-cards-section">
            <div className="whats-new-cards-header">
              <span>{isCustomer ? "Your Order Journey" : "What's New"}</span>
              <span>
                {totalFeatures} {isCustomer ? "Steps" : "Updates"}
              </span>
            </div>

            <div className="whats-new-cards-scroll">
              {popupFeatures.map((feature, index) => {
                const selected = index === currentIndex;

                return (
                  <button key={feature._id || index} type="button" className={`whats-new-feature-card ${selected ? "selected" : ""}`} onClick={() => goToFeature(index)}>
                    <span className="whats-new-card-number">{String(index + 1).padStart(2, "0")}</span>

                    <span className="whats-new-card-content">
                      <strong>{feature.title || `Feature ${index + 1}`}</strong>

                      {feature.shortDescription && <small>{feature.shortDescription}</small>}
                    </span>

                    {feature.tracking?.explored && (
                      <span className="whats-new-card-check">
                        <Check size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOBILE EXPLORE */}
          {!tracking?.explored && (
            <div className="whats-new-mobile-explore">
              <button type="button" onClick={handleExplore}>
                {isLast ? "Done" : "Explore Next"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
  .whats-new-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:9px;background:rgba(15,23,42,.72);backdrop-filter:blur(7px);animation:whatsNewOverlayIn .18s ease}

  .whats-new-window{position:relative;width:calc(100vw - 18px);height:calc(100vh - 18px);max-width:1900px;min-height:620px;display:flex;flex-direction:column;overflow:hidden;background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#dbe2ea);border-radius:16px;box-shadow:0 28px 90px rgba(15,23,42,.4);animation:whatsNewWindowIn .24s ease}
.whats-new-window{touch-action:pan-y}
  .whats-new-window-top{height:64px;min-height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid var(--admin-border,#e2e8f0);background:var(--admin-surface,#fff)}

  .whats-new-brand{display:flex;align-items:center;gap:10px;min-width:220px}

  .whats-new-brand-logo{width:32px;height:32px;display:block;border-radius:8px;object-fit:cover}

  .whats-new-brand-text{display:flex;flex-direction:column;gap:1px}

  .whats-new-brand-text strong{color:var(--admin-text,#0f172a);font-size:14px;font-weight:750;line-height:1.2}

  .whats-new-brand-text span{color:var(--admin-muted,#64748b);font-size:10px;line-height:1.2}

  .whats-new-top-center{display:flex;align-items:center;gap:9px}

  .whats-new-version{padding:6px 10px;border-radius:999px;background:var(--admin-surface-2,#f1f5f9);border:1px solid var(--admin-border,#e2e8f0);color:var(--admin-muted,#64748b);font-size:10px;font-weight:750}

  .whats-new-top-counter{min-width:48px;text-align:center;color:var(--admin-text,#334155);font-size:11px;font-weight:750}

  .whats-new-close{width:37px;height:37px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--admin-muted,#64748b);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.18s ease}

  .whats-new-close:hover{background:var(--admin-surface-2,#f1f5f9);border-color:var(--admin-border,#e2e8f0);color:var(--admin-text,#0f172a)}

  .whats-new-feature-area{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(400px,43%);overflow:hidden}

  .whats-new-content-panel{min-width:0;min-height:0;display:flex;flex-direction:column;background:var(--admin-surface,#fff)}

  .whats-new-content-inner{flex:1;min-height:0;overflow:auto;padding:clamp(42px,6vw,90px) clamp(32px,5vw,85px) 30px}

  .whats-new-content-label{display:flex;align-items:center;gap:8px;margin-bottom:20px;color:#2563eb;font-size:10px;font-weight:800;letter-spacing:.13em}

  .whats-new-content-label-dot{width:7px;height:7px;border-radius:50%;background:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.1)}

  .whats-new-content-inner h1{max-width:850px;margin:0;color:var(--admin-text,#0f172a);font-size:clamp(34px,4vw,60px);font-weight:800;line-height:1.08;letter-spacing:-.035em}

  .whats-new-short-description{max-width:760px;margin:20px 0 0;color:var(--admin-muted,#64748b);font-size:clamp(16px,1.35vw,21px);font-weight:500;line-height:1.55}

  .whats-new-description{max-width:800px;margin-top:25px;color:var(--admin-text-secondary,#475569);font-size:clamp(14px,1vw,17px);line-height:1.8;white-space:pre-line}

  .whats-new-explored{width:max-content;max-width:100%;margin-top:27px;padding:10px 13px;display:flex;align-items:center;gap:9px;border:1px solid rgba(22,163,74,.18);border-radius:10px;background:rgba(22,163,74,.06)}

  .whats-new-explored-icon{width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#dcfce7;color:#16a34a}

  .whats-new-explored div{display:flex;flex-direction:column;gap:2px}

  .whats-new-explored strong{color:#15803d;font-size:11px;font-weight:750}

  .whats-new-explored span{color:#4b7c5b;font-size:9px}

  .whats-new-cta{margin-top:30px;height:44px;padding:0 17px;border:1px solid #2563eb;border-radius:9px;background:#2563eb;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:12px;font-weight:750;cursor:pointer;transition:.18s ease;box-shadow:0 6px 18px rgba(37,99,235,.2)}

  .whats-new-cta:hover{background:#1d4ed8;border-color:#1d4ed8;transform:translateY(-1px)}

  .whats-new-content-navigation{min-height:68px;padding:11px 28px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--admin-border,#e2e8f0);background:var(--admin-surface,#fff)}

  .whats-new-navigation-left{color:var(--admin-muted,#64748b);font-size:12px;font-weight:750}

  .whats-new-navigation-buttons{display:flex;align-items:center;gap:7px}

  .whats-new-nav-button{width:38px;height:38px;border:1px solid var(--admin-border,#dbe2ea);border-radius:9px;background:var(--admin-surface,#fff);color:var(--admin-text,#334155);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.18s ease}

  .whats-new-nav-button:hover:not(:disabled){background:var(--admin-surface-2,#f1f5f9);border-color:#cbd5e1}

  .whats-new-nav-button:disabled{opacity:.3;cursor:not-allowed}

  .whats-new-nav-next{background:#2563eb;border-color:#2563eb;color:#fff}

  .whats-new-nav-next:hover:not(:disabled){background:#1d4ed8;border-color:#1d4ed8}

  .whats-new-media-panel{min-width:0;min-height:0;padding:24px;display:flex;align-items:stretch;justify-content:center;background:var(--admin-surface,#fff);border-left:1px solid var(--admin-border,#e2e8f0)}

  .whats-new-media-frame{position:relative;width:100%;height:100%;min-height:300px;overflow:hidden;border-radius:13px;background:#0f172a;box-shadow:0 12px 35px rgba(15,23,42,.14)}

  .whats-new-media-frame .whats-new-media{width:100%;height:100%;min-height:100%;border-radius:0;background:#0f172a}

  .whats-new-media-frame .whats-new-media-image,.whats-new-media-frame .whats-new-media-video{width:100%;height:100%;min-height:100%;border-radius:0;object-fit:cover}

  .whats-new-media-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(15,23,42,.25),transparent 35%,transparent 68%,rgba(15,23,42,.35))}

  .whats-new-media-badge{position:absolute;top:16px;left:16px;display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:rgba(15,23,42,.7);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:9px;font-weight:800;letter-spacing:.09em;backdrop-filter:blur(8px)}

  .whats-new-media-badge span{width:6px;height:6px;border-radius:50%;background:#60a5fa}

  .whats-new-media-version{position:absolute;top:16px;right:16px;padding:6px 9px;border-radius:999px;background:rgba(15,23,42,.7);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:9px;font-weight:750;backdrop-filter:blur(8px)}

  .whats-new-cards-section{height:116px;min-height:116px;padding:10px 15px 12px;border-top:1px solid var(--admin-border,#e2e8f0);background:var(--admin-surface,#fff)}

  .whats-new-cards-header{height:20px;display:flex;align-items:center;justify-content:space-between;padding:0 3px 6px;color:var(--admin-muted,#64748b);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}

  .whats-new-cards-header span:last-child{color:var(--admin-text,#475569);font-size:9px;text-transform:none;letter-spacing:0}

  .whats-new-cards-scroll{height:74px;display:flex;align-items:stretch;gap:8px;overflow-x:auto;overflow-y:hidden;padding:0 2px 3px}

  .whats-new-cards-scroll::-webkit-scrollbar{height:5px}

  .whats-new-cards-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:20px}

  .whats-new-feature-card{position:relative;min-width:205px;max-width:250px;flex:1;height:68px;padding:8px 10px;display:flex;align-items:center;gap:9px;border:1px solid var(--admin-border,#e2e8f0);border-radius:9px;background:var(--admin-surface,#fff);text-align:left;cursor:pointer;transition:.18s ease}

  .whats-new-feature-card:hover{background:var(--admin-surface-2,#f8fafc);border-color:#cbd5e1}

  .whats-new-feature-card.selected{border-color:#2563eb;background:rgba(37,99,235,.055);box-shadow:inset 0 0 0 1px rgba(37,99,235,.1)}

  .whats-new-card-number{width:27px;height:27px;min-width:27px;display:flex;align-items:center;justify-content:center;border-radius:7px;background:var(--admin-surface-2,#f1f5f9);color:var(--admin-muted,#64748b);font-size:9px;font-weight:800}

  .whats-new-feature-card.selected .whats-new-card-number{background:#2563eb;color:#fff}

  .whats-new-card-content{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}

  .whats-new-card-content strong{overflow:hidden;color:var(--admin-text,#334155);font-size:10px;font-weight:750;white-space:nowrap;text-overflow:ellipsis}

  .whats-new-card-content small{overflow:hidden;color:var(--admin-muted,#64748b);font-size:8px;line-height:1.3;white-space:nowrap;text-overflow:ellipsis}

  .whats-new-card-check{width:21px;height:21px;min-width:21px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#dcfce7;color:#16a34a}

  .whats-new-mobile-explore{display:none}

  @keyframes whatsNewOverlayIn{from{opacity:0}to{opacity:1}}

  @keyframes whatsNewWindowIn{from{opacity:0;transform:scale(.987) translateY(7px)}to{opacity:1;transform:scale(1) translateY(0)}}

  @media(max-width:1100px){
    .whats-new-feature-area{grid-template-columns:minmax(0,1fr) minmax(350px,42%)}

    .whats-new-content-inner{padding:45px 45px 25px}

    .whats-new-content-inner h1{font-size:42px}

    .whats-new-media-panel{padding:24px}
  }

  @media(max-width:800px){
    .whats-new-overlay{padding:6px}

    .whats-new-window{width:calc(100vw - 12px);height:calc(100vh - 12px);min-height:0;border-radius:12px}

    .whats-new-window-top{height:55px;min-height:55px;padding:0 10px}

    .whats-new-brand{min-width:0}

    .whats-new-brand-logo{width:29px;height:29px}

    .whats-new-brand-text strong{font-size:12px}

    .whats-new-brand-text span{font-size:9px}

    .whats-new-top-center{gap:5px}

    .whats-new-version{padding:5px 7px;font-size:8px}

    .whats-new-top-counter{font-size:10px;min-width:40px}

    .whats-new-close{width:33px;height:33px}

    .whats-new-feature-area{display:flex;flex-direction:column;overflow:auto}

    .whats-new-media-panel{order:1;height:280px;min-height:280px;padding:12px;border-left:0;border-bottom:1px solid var(--admin-border,#e2e8f0)}

    .whats-new-content-panel{order:2;min-height:430px}

    .whats-new-content-inner{padding:30px 22px 22px;overflow:visible}

    .whats-new-content-inner h1{font-size:31px}

    .whats-new-short-description{font-size:15px}

    .whats-new-description{font-size:13px;line-height:1.7}

    .whats-new-content-navigation{min-height:62px;padding:10px 15px}

    .whats-new-cards-section{height:106px;min-height:106px;padding:9px 10px}

    .whats-new-feature-card{min-width:180px;height:63px}

    .whats-new-cards-scroll{height:68px}

    .whats-new-mobile-explore{display:block;padding:0 14px 14px}

    .whats-new-mobile-explore button{width:100%;height:39px;border:1px solid #2563eb;border-radius:9px;background:#2563eb;color:#fff;font-size:12px;font-weight:750;cursor:pointer}
  }

  @media(max-width:480px){
    .whats-new-media-panel{height:220px;min-height:220px;padding:12px}

    .whats-new-content-inner{padding:25px 16px 20px}

    .whats-new-content-inner h1{font-size:26px}

    .whats-new-short-description{font-size:13px}

    .whats-new-description{font-size:12px}

    .whats-new-feature-card{min-width:165px}

    .whats-new-navigation-left{font-size:10px}

    .whats-new-nav-button{width:34px;height:34px}
  }
`}</style>
    </>
  );
};

export default WhatsNewOverlay;
