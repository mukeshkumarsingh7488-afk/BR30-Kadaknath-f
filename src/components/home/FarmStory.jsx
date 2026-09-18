import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Leaf, MapPin, Sprout } from "lucide-react";

const FarmStory = () => {
  return (
    <section className="farm-story section" id="about-farm">
      <div className="container">
        <div className="farm-story-grid">
          <div className="farm-story-visual">
            <div className="farm-story-main-card">
              {" "}
              <img src="/images/kadaknath-farm-story.png" alt="BR30 Kadaknath Farms" className="farm-story-image" />{" "}
            </div>

            <div className="farm-story-location">
              <span className="farm-story-location-icon">
                <MapPin size={17} />
              </span>

              <span>
                <strong>Our Farm</strong>
                <small>Growing with care</small>
              </span>
            </div>

            <div className="farm-story-leaf-card">
              <Leaf size={20} />
              <span>Naturally Raised</span>
            </div>
          </div>

          <div className="farm-story-content">
            <span className="section-eyebrow">
              <Sprout size={15} />
              Our Farm Story
            </span>

            <h2>
              Raised With Care.
              <span> Grown With Purpose.</span>
            </h2>

            <p className="farm-story-intro">At BR30 Kadaknath Farms, we believe good food starts with responsible farming. Our focus is on raising Kadaknath birds with care, attention and respect for their natural environment.</p>

            <p className="farm-story-text">From daily farm care to careful handling of our products, every step matters. We are building a farm that connects quality, responsible practices and honest farm-to-table products.</p>

            <div className="farm-story-points">
              <div className="farm-story-point">
                <span>
                  <CheckCircle2 size={17} />
                </span>

                <div>
                  <strong>Careful Farm Practices</strong>
                  <p>Focused on cleanliness, care and consistent daily farm routines.</p>
                </div>
              </div>

              <div className="farm-story-point">
                <span>
                  <CheckCircle2 size={17} />
                </span>

                <div>
                  <strong>Quality Focused</strong>
                  <p>We pay attention to the quality of what leaves our farm.</p>
                </div>
              </div>

              <div className="farm-story-point">
                <span>
                  <CheckCircle2 size={17} />
                </span>

                <div>
                  <strong>Farm to Customer</strong>
                  <p>Our goal is to make farm products easier to discover and order.</p>
                </div>
              </div>
            </div>

            <Link to="/about-farm" className="farm-story-link">
              Learn About Our Farm
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`.farm-story{position:relative;overflow:hidden;background:var(--bg-soft)}.farm-story::before{content:"";position:absolute;width:420px;height:420px;top:-210px;right:-160px;border-radius:50%;background:rgba(111,143,69,.08);pointer-events:none}.farm-story-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);align-items:center;gap:80px}.farm-story-visual{position:relative;min-height:535px;display:flex;align-items:center;justify-content:center}.farm-story-main-card{position:relative;width:min(100%,500px);height:500px;overflow:hidden;border:10px solid var(--color-white);border-radius:30px;background:var(--color-white);box-shadow:var(--shadow-lg);transform:rotate(-2deg)}.farm-story-image{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover;object-position:center;border-radius:20px}.farm-story-location{position:absolute;z-index:8;left:-10px;bottom:28px;display:flex;align-items:center;gap:10px;padding:11px 16px 11px 11px;border-radius:14px;background:var(--color-white);box-shadow:var(--shadow-md)}.farm-story-location-icon{width:35px;height:35px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--color-green-pale);color:var(--color-green)}.farm-story-location>span:last-child{display:flex;flex-direction:column}.farm-story-location strong{color:var(--color-primary);font-size:.78rem}.farm-story-location small{margin-top:2px;color:#1a120c;font-size:.66rem}.farm-story-leaf-card{position:absolute;z-index:8;top:45px;right:5px;display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:1px solid rgba(255,255,255,.8);border-radius:var(--radius-pill);background:rgba(255,255,255,.88);color:var(--color-green);box-shadow:var(--shadow-sm);font-size:.7rem;font-weight:800}.farm-story-content{max-width:610px}.farm-story-content .section-eyebrow{display:inline-flex;align-items:center;gap:7px}.farm-story-content h2{margin-bottom:22px;color:var(--color-primary);font-size:clamp(2.2rem,4vw,3.45rem);letter-spacing:-.035em}.farm-story-content h2 span{display:block;color:var(--color-green)}.farm-story-intro{margin-bottom:14px;color:#1a120c;font-size:1.05rem;font-weight:600;line-height:1.8}.farm-story-text{margin-bottom:27px;color:#1a120c;font-size:.94rem;line-height:1.8}.farm-story-points{display:grid;gap:17px;margin-bottom:30px}.farm-story-point{display:flex;align-items:flex-start;gap:11px}.farm-story-point>span{width:27px;height:27px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.farm-story-point strong{display:block;margin-bottom:2px;color:var(--color-primary);font-size:.86rem}.farm-story-point p{color:#1a120c;font-size:.77rem;line-height:1.6}.farm-story-link{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 19px;border-radius:var(--radius-pill);background:var(--color-primary);color:var(--color-white);font-size:.82rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.farm-story-link:hover{transform:translateY(-2px);background:var(--color-green);box-shadow:var(--shadow-md)}@media (max-width:991px){.farm-story-grid{grid-template-columns:1fr;gap:55px}.farm-story-visual{min-height:520px}.farm-story-content{max-width:760px;margin-inline:auto;text-align:center}.farm-story-content .section-eyebrow{justify-content:center}.farm-story-point{text-align:left}}@media (max-width:575px){.farm-story-grid{gap:38px}.farm-story-visual{min-height:375px}.farm-story-main-card{width:100%;height:355px;border-width:7px;border-radius:23px;transform:rotate(-1.5deg)}.farm-story-image{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:16px}.farm-story-location{left:0;bottom:6px}.farm-story-leaf-card{top:24px;right:0}.farm-story-content h2{font-size:2.15rem}.farm-story-intro{font-size:.95rem}.farm-story-link{width:100%;justify-content:center}}`}</style>
    </section>
  );
};

export default FarmStory;
