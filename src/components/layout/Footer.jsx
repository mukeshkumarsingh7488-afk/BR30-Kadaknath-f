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
.footer{background:var(--color-primary);color:var(--color-white)}.footer-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));margin-inline:auto;padding:60px 0 45px;display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:50px}.footer-brand{max-width:390px}.footer-logo{display:inline-flex;align-items:center;gap:11px}.footer-logo-mark{width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border-radius:12px;background:var(--color-white)}.footer-logo-mark img{width:100%;height:100%;display:block;object-fit:cover}.footer-logo-name{color:var(--color-white);font-size:1rem;font-weight:800}.footer-description{margin-top:18px;color:rgba(255,255,255,.68);font-size:.92rem;line-height:1.75}.footer-links,.footer-legal{display:flex;flex-direction:column;align-items:flex-start;gap:11px}.footer-links::before,.footer-legal::before{margin-bottom:6px;color:var(--color-gold-light);font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.footer-links::before{content:"Explore"}.footer-legal::before{content:"Legal"}.footer-links a,.footer-legal a{color:rgba(255,255,255,.7);font-size:.88rem;font-weight:600;transition:color var(--transition-fast),transform var(--transition-fast)}.footer-links a:hover,.footer-legal a:hover{color:var(--color-white);transform:translateX(3px)}.footer-bottom{border-top:1px solid rgba(255,255,255,.1)}.footer-bottom-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));min-height:65px;margin-inline:auto;display:flex;align-items:center;justify-content:space-between;gap:20px}.footer-bottom p{color:rgba(255,255,255,.48);font-size:.78rem}@media(max-width:800px){.footer-container{grid-template-columns:1fr 1fr;gap:35px}.footer-brand{grid-column:1/-1;max-width:600px}}@media(max-width:575px){.footer-container{grid-template-columns:1fr 1fr;padding:45px 0 35px;gap:30px 22px}.footer-brand{grid-column:1/-1;max-width:100%}.footer-links,.footer-legal{gap:11px}.footer-bottom-container{min-height:auto;padding:18px 0;flex-direction:column;align-items:flex-start;gap:5px}}
`}</style>
    </>
  );
};

export default Footer;
