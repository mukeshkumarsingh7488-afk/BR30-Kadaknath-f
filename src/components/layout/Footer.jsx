import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

import { Link } from "react-router-dom";

import siteConfig from "../../config/siteConfig";

const Footer = () => {
  return (
    <>
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
.footer-container{grid-template-columns:1.4fr 1fr 1fr 1fr;gap:28px}
.footer-links,.footer-legal,.footer-social{transform:translateX(.45in)}
}

@media(max-width:800px){
.footer-container{grid-template-columns:1fr 1fr 1fr;gap:28px 20px}
.footer-brand{grid-column:1/-1;max-width:600px}
.footer-links,.footer-legal,.footer-social{transform:none}
}

@media(max-width:600px){
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
