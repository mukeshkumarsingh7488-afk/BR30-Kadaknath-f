import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import WhatsNewMedia from "./WhatsNewMedia";

const WhatsNewCard = ({ feature, onExplore, onCta, onOpen, compact = false }) => {
  if (!feature) return null;

  const { _id, title = "New Feature", shortDescription = "", description = "", version = "", media = {}, cta = {}, tracking = {} } = feature;

  const handleExplore = async () => {
    if (onExplore) {
      await onExplore(feature);
    }
  };

  const handleCta = async () => {
    if (onCta) {
      await onCta(feature);
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen(feature);
    }
  };

  const isNew = !tracking?.viewed && !tracking?.explored;

  return (
    <article className={`whats-new-card ${compact ? "whats-new-card-compact" : ""} ${isNew ? "whats-new-card-is-new" : ""}`}>
      <button type="button" className="whats-new-card-open" onClick={handleOpen} aria-label={`Open ${title}`}>
        <div className="whats-new-card-media">
          <WhatsNewMedia media={media} title={title} />

          <div className="whats-new-card-media-overlay" />

          <div className="whats-new-card-topbar">
            {isNew && (
              <span className="whats-new-new-badge">
                <span className="whats-new-new-dot" />
                NEW
              </span>
            )}

            {version && <span className="whats-new-version">v{version}</span>}
          </div>

          <div className="whats-new-card-media-label">
            <Sparkles size={14} strokeWidth={2.2} />
            <span>What's New</span>
          </div>
        </div>
      </button>

      <div className="whats-new-card-content">
        <div className="whats-new-card-heading">
          <div className="whats-new-card-icon">
            <Sparkles size={18} strokeWidth={2.1} />
          </div>

          <div className="whats-new-card-title-wrap">
            <h3>{title}</h3>

            {shortDescription && <p className="whats-new-short-description">{shortDescription}</p>}
          </div>
        </div>

        {description && <div className="whats-new-description">{description}</div>}

        <div className="whats-new-card-footer">
          <div className={`whats-new-status ${tracking?.explored ? "is-explored" : tracking?.viewed ? "is-viewed" : "is-new"}`}>
            {tracking?.explored ? (
              <>
                <span className="whats-new-status-icon">
                  <CheckCircle2 size={14} />
                </span>
                <span>Explored</span>
              </>
            ) : tracking?.viewed ? (
              <>
                <span className="whats-new-status-icon">
                  <CheckCircle2 size={14} />
                </span>
                <span>Viewed</span>
              </>
            ) : (
              <>
                <span className="whats-new-status-dot" />
                <span>New update</span>
              </>
            )}
          </div>

          <div className="whats-new-card-actions">
            {cta?.enabled && cta?.text && cta?.route && (
              <button type="button" className="whats-new-cta-btn" onClick={handleCta}>
                <span>{cta.text}</span>
                <ArrowRight size={15} />
              </button>
            )}

            {!tracking?.explored && (
              <button type="button" className="whats-new-explore-btn" onClick={handleExplore}>
                <span>Mark Explored</span>
                <CheckCircle2 size={14} />
              </button>
            )}

            {tracking?.explored && (
              <button type="button" className="whats-new-open-btn" onClick={handleOpen}>
                <span>Open</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .whats-new-card{
          position:relative;
          width:100%;
          overflow:hidden;
          background:var(--admin-surface,#fff);
          border:1px solid var(--admin-border,#e2e8f0);
          border-radius:18px;
          box-shadow:0 8px 24px rgba(15,23,42,.06);
          transition:transform .24s ease,box-shadow .24s ease,border-color .24s ease;
        }

        .whats-new-card:hover{
          transform:translateY(-5px);
          border-color:rgba(37,99,235,.24);
          box-shadow:0 18px 42px rgba(15,23,42,.12);
        }

        .whats-new-card-is-new{
          border-color:rgba(37,99,235,.2);
        }

        .whats-new-card-open{
          position:relative;
          display:block;
          width:100%;
          padding:0;
          border:0;
          background:transparent;
          text-align:left;
          cursor:pointer;
        }

        .whats-new-card-media{
          position:relative;
          width:100%;
          aspect-ratio:16/9;
          overflow:hidden;
          background:#0f172a;
        }

        .whats-new-card-media .whats-new-media{
          width:100%;
          height:100%;
          min-height:100%;
          border-radius:0;
        }

        .whats-new-card-media .whats-new-media-image,
        .whats-new-card-media .whats-new-media-video,
        .whats-new-card-media .whats-new-media-youtube{
          width:100%;
          height:100%;
          min-height:100%;
          border-radius:0;
          object-fit:cover;
          transition:transform .45s ease;
        }

        .whats-new-card:hover .whats-new-media-image,
        .whats-new-card:hover .whats-new-media-video{
          transform:scale(1.035);
        }

        .whats-new-card-media-overlay{
          position:absolute;
          inset:0;
          pointer-events:none;
          background:linear-gradient(
            180deg,
            rgba(15,23,42,.48) 0%,
            rgba(15,23,42,0) 38%,
            rgba(15,23,42,.18) 100%
          );
        }

        .whats-new-card-topbar{
          position:absolute;
          top:13px;
          left:13px;
          right:13px;
          z-index:3;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
        }

        .whats-new-new-badge{
          min-height:27px;
          padding:0 10px;
          display:inline-flex;
          align-items:center;
          gap:6px;
          border:1px solid rgba(255,255,255,.28);
          border-radius:999px;
          background:rgba(37,99,235,.9);
          color:#fff;
          font-size:10px;
          font-weight:850;
          letter-spacing:.08em;
          box-shadow:0 5px 16px rgba(15,23,42,.2);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }

        .whats-new-new-dot{
          width:6px;
          height:6px;
          border-radius:50%;
          background:#fff;
          box-shadow:0 0 0 3px rgba(255,255,255,.16);
        }

        .whats-new-version{
          margin-left:auto;
          min-height:27px;
          padding:0 9px;
          display:inline-flex;
          align-items:center;
          border:1px solid rgba(255,255,255,.2);
          border-radius:999px;
          background:rgba(15,23,42,.72);
          color:#fff;
          font-size:10px;
          font-weight:750;
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }

        .whats-new-card-media-label{
          position:absolute;
          left:13px;
          bottom:12px;
          z-index:3;
          min-height:29px;
          padding:0 10px;
          display:inline-flex;
          align-items:center;
          gap:6px;
          border:1px solid rgba(255,255,255,.18);
          border-radius:999px;
          background:rgba(15,23,42,.58);
          color:rgba(255,255,255,.94);
          font-size:10px;
          font-weight:700;
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }

        .whats-new-card-content{
          padding:18px 18px 16px;
        }

        .whats-new-card-heading{
          display:flex;
          align-items:flex-start;
          gap:11px;
        }

        .whats-new-card-icon{
          position:relative;
          width:37px;
          height:37px;
          flex:0 0 37px;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(37,99,235,.13);
          border-radius:11px;
          background:linear-gradient(135deg,rgba(37,99,235,.13),rgba(59,130,246,.05));
          color:#2563eb;
        }

        .whats-new-card-icon::after{
          content:"";
          position:absolute;
          inset:-4px;
          border:1px solid rgba(37,99,235,.07);
          border-radius:14px;
          pointer-events:none;
        }

        .whats-new-card-title-wrap{
          min-width:0;
          flex:1;
        }

        .whats-new-card-title-wrap h3{
          margin:0;
          color:var(--admin-text,#0f172a);
          font-size:17px;
          font-weight:800;
          line-height:1.35;
          letter-spacing:-.01em;
        }

        .whats-new-short-description{
          margin:5px 0 0;
          color:var(--admin-muted,#64748b);
          font-size:12.5px;
          line-height:1.55;
        }

        .whats-new-description{
          margin-top:13px;
          padding:11px 12px;
          border:1px solid var(--admin-border,#e2e8f0);
          border-radius:10px;
          background:var(--admin-surface-2,#f8fafc);
          color:var(--admin-text-secondary,#475569);
          font-size:13px;
          line-height:1.6;
          white-space:pre-line;
        }

        .whats-new-card-footer{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-top:17px;
          padding-top:13px;
          border-top:1px solid var(--admin-border,#e2e8f0);
        }

        .whats-new-status{
          min-width:0;
          display:flex;
          align-items:center;
          gap:6px;
          color:var(--admin-muted,#64748b);
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
        }

        .whats-new-status.is-new{
          color:#2563eb;
        }

        .whats-new-status.is-viewed{
          color:#64748b;
        }

        .whats-new-status.is-explored{
          color:#16a34a;
        }

        .whats-new-status-icon{
          width:24px;
          height:24px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:50%;
          background:rgba(22,163,74,.1);
          color:#16a34a;
        }

        .whats-new-status-dot{
          width:7px;
          height:7px;
          flex:0 0 7px;
          border-radius:50%;
          background:#2563eb;
          box-shadow:0 0 0 3px rgba(37,99,235,.1);
        }

        .whats-new-card-actions{
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:7px;
          min-width:0;
        }

        .whats-new-cta-btn,
        .whats-new-explore-btn,
        .whats-new-open-btn{
          min-height:35px;
          padding:0 11px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          border-radius:9px;
          font-size:11px;
          font-weight:750;
          cursor:pointer;
          transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease;
        }

        .whats-new-cta-btn{
          border:1px solid #2563eb;
          background:#2563eb;
          color:#fff;
          box-shadow:0 5px 14px rgba(37,99,235,.18);
        }

        .whats-new-cta-btn:hover{
          background:#1d4ed8;
          border-color:#1d4ed8;
          transform:translateY(-1px);
          box-shadow:0 7px 18px rgba(37,99,235,.25);
        }

        .whats-new-explore-btn{
          border:1px solid var(--admin-border,#cbd5e1);
          background:var(--admin-surface-2,#f8fafc);
          color:var(--admin-text,#334155);
        }

        .whats-new-explore-btn:hover{
          border-color:rgba(37,99,235,.28);
          background:rgba(37,99,235,.06);
          color:#2563eb;
          transform:translateY(-1px);
        }

        .whats-new-open-btn{
          border:1px solid rgba(37,99,235,.25);
          background:rgba(37,99,235,.06);
          color:#2563eb;
        }

        .whats-new-open-btn:hover{
          border-color:#2563eb;
          background:rgba(37,99,235,.1);
          transform:translateY(-1px);
        }

        .whats-new-card-compact .whats-new-card-content{
          padding:15px 15px 14px;
        }

        .whats-new-card-compact .whats-new-card-title-wrap h3{
          font-size:16px;
        }

        .whats-new-card-compact .whats-new-description{
          margin-top:11px;
          padding:9px 10px;
          font-size:12px;
        }

        .whats-new-card-compact .whats-new-card-footer{
          margin-top:13px;
          padding-top:11px;
        }

        .whats-new-card-compact .whats-new-card-icon{
          width:34px;
          height:34px;
          flex-basis:34px;
        }

        @media(max-width:768px){
          .whats-new-card-footer{
            align-items:flex-start;
            flex-direction:column;
          }

          .whats-new-card-actions{
            width:100%;
            justify-content:flex-start;
            flex-wrap:wrap;
          }

          .whats-new-status{
            width:100%;
          }

          .whats-new-cta-btn,
          .whats-new-explore-btn,
          .whats-new-open-btn{
            flex:0 0 auto;
          }
        }

        @media(max-width:480px){
          .whats-new-card{
            border-radius:14px;
          }

          .whats-new-card-content,
          .whats-new-card-compact .whats-new-card-content{
            padding:13px;
          }

          .whats-new-card-topbar{
            top:10px;
            left:10px;
            right:10px;
          }

          .whats-new-card-media-label{
            left:10px;
            bottom:9px;
          }

          .whats-new-card-title-wrap h3,
          .whats-new-card-compact .whats-new-card-title-wrap h3{
            font-size:15px;
          }

          .whats-new-short-description{
            font-size:12px;
          }

          .whats-new-description,
          .whats-new-card-compact .whats-new-description{
            font-size:12px;
          }

          .whats-new-card-actions{
            gap:6px;
          }

          .whats-new-cta-btn,
          .whats-new-explore-btn,
          .whats-new-open-btn{
            min-height:34px;
            padding:0 9px;
            font-size:10.5px;
          }
        }
      `}</style>
    </article>
  );
};

export default WhatsNewCard;
