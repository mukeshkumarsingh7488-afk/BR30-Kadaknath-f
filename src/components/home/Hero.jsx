import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";

const Hero = () => {
  const heroImages = [
    "/images/kadaknath-hero.png",
    "/images/kadaknath-hero2.png",
    "/images/kadaknath-hero3.png",
    "/images/kadaknath-hero4.png",
    "/images/kadaknath-hero5.png",
    "/images/kadaknath-hero6.png",
    "/images/kadaknath-hero7.png",
    "/images/kadaknath-hero8.png",
    "/images/kadaknath-hero9.png",
    "/images/kadaknath-hero10.png",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  const handleNextImage = () => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  };

  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
      </div>
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <Leaf size={16} />
            BR30 Kadaknath Farms
          </span>

          <h1>
            Pure Kadaknath.
            <span>Naturally Raised.</span>
          </h1>

          <p className="hero-description">Naturally raised Kadaknath eggs, chicken and farm products — brought from our farm to your table with care.</p>

          <div className="hero-actions">
            <Link to="/products" className="hero-primary-btn">
              Shop Products
              <ArrowRight size={18} />
            </Link>

            <a href="#why-kadaknath" className="hero-secondary-btn">
              Explore Kadaknath
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <span className="hero-trust-icon">
                <Leaf size={17} />
              </span>

              <span>
                <strong>Farm Raised</strong>
                <small>Naturally cared for</small>
              </span>
            </div>

            <div className="hero-trust-item">
              <span className="hero-trust-icon">
                <ShieldCheck size={17} />
              </span>

              <span>
                <strong>Quality Focused</strong>
                <small>Carefully selected</small>
              </span>
            </div>

            <div className="hero-trust-item">
              <span className="hero-trust-icon">
                <Truck size={17} />
              </span>

              <span>
                <strong>Farm to Table</strong>
                <small>Fresh delivery</small>
              </span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-top">
              <span>FROM OUR FARM</span>

              <span className="hero-card-dot" />
            </div>

            <div className="hero-farm-visual">
              <div className="hero-sun" />

              <div className="hero-hill hero-hill-back" />
              <div className="hero-hill hero-hill-front" />

              <div className="hero-bird hero-bird-one">
                <span />
                <span />
              </div>

              <div className="hero-bird hero-bird-two">
                <span />
                <span />
              </div>

              <div className="hero-chicken">
                <img src={heroImages[currentImage]} alt="Kadaknath chicken from BR30 Kadaknath Farms" className="hero-chicken-image" />
              </div>

              <div className="hero-grass">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="hero-card-bottom">
              <div>
                <strong>Kadaknath</strong>
                <span>From our farm to you</span>
              </div>

              <button type="button" className="hero-card-arrow" onClick={handleNextImage} aria-label="Next Kadaknath farm image">
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-bottom-shape" />

      <style>{`
html{scroll-behavior:smooth;scroll-padding-top:80px}.hero-card-top>span,.hero-card-bottom>div>span{color:rgba(255,255,255,.85)}.hero-card-top>span{color:rgba(255,255,255,.85)!important}.hero-card-arrow{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;cursor:pointer;border-radius:50%;background:var(--color-gold);color:var(--color-primary)}.hero{position:relative;min-height:calc(100vh - 76px);display:flex;align-items:center;overflow:hidden;background:linear-gradient(135deg,var(--color-primary) 0%,var(--color-primary-soft) 58%,#30452a 100%);color:var(--color-white)}.hero-background{position:absolute;inset:0;pointer-events:none}.hero-glow{position:absolute;border-radius:50%;filter:blur(2px);opacity:.35}.hero-glow-one{width:500px;height:500px;top:-220px;right:-120px;background:rgba(201,154,61,.18)}.hero-glow-two{width:420px;height:420px;bottom:-260px;left:-180px;background:rgba(111,143,69,.2)}.hero-container{position:relative;z-index:2;width:min(100% - (var(--container-padding) * 2),var(--container-width));margin-inline:auto;padding:85px 0;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(420px,.95fr);align-items:center;gap:70px}.hero-content{max-width:650px}.hero-eyebrow{width:fit-content;display:inline-flex;align-items:center;gap:8px;margin-bottom:22px;padding:8px 13px;border:1px solid rgba(228,199,123,.25);border-radius:var(--radius-pill);background:rgba(255,255,255,.055);color:var(--color-gold-light);font-size:.76rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.hero-content h1{max-width:700px;margin-bottom:22px;color:var(--color-white);font-size:clamp(3.1rem,6vw,5.5rem);font-weight:850;letter-spacing:-.045em;line-height:.98}.hero-content h1 span{display:block;color:var(--color-gold-light)}.hero-description{max-width:590px;margin-bottom:30px;color:rgba(255,255,255,.85);font-size:1.08rem;line-height:1.8}.hero-actions{display:flex;align-items:center;gap:12px;margin-bottom:42px}.hero-primary-btn,.hero-secondary-btn{min-height:50px;padding:0 21px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--radius-pill);font-size:.9rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast)}.hero-primary-btn{background:var(--color-gold);color:var(--color-primary)}.hero-primary-btn:hover{background:var(--color-gold-light);transform:translateY(-2px)}.hero-secondary-btn{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.04);color:var(--color-white)}.hero-secondary-btn:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.09);transform:translateY(-2px)}.hero-trust{display:flex;flex-wrap:wrap;gap:20px}.hero-trust-item{display:inline-flex;align-items:center;gap:9px}.hero-trust-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,.08);color:var(--color-gold-light)}.hero-trust-item>span:last-child{display:flex;flex-direction:column}.hero-trust-item strong{color:var(--color-white);font-size:.75rem;font-weight:750}.hero-trust-item small{margin-top:2px;color:rgba(255,255,255,.85);font-size:.68rem}.hero-visual{width:100%;display:flex;justify-content:center;align-items:center}.hero-card{width:min(100%,480px);padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:rgba(255,255,255,.075);box-shadow:0 30px 80px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transform:none}.hero-card-top{min-height:36px;padding:0 8px;display:flex;align-items:center;justify-content:space-between}.hero-card-top>span:first-child{color:rgba(255,255,255,.85);font-size:.62rem;font-weight:800;letter-spacing:.13em}.hero-card-dot{width:7px;height:7px;border-radius:50%;background:var(--color-gold)}.hero-farm-visual{position:relative;width:calc(100% - 55px);height:380px;margin-inline:auto;overflow:hidden;border-radius:20px;background:linear-gradient(180deg,#8aa46a 0%,#b7c88c 45%,#d9c994 100%)}.hero-sun{position:absolute;width:92px;height:92px;top:42px;right:58px;border-radius:50%;background:var(--color-gold-light);box-shadow:0 0 50px rgba(228,199,123,.5)}.hero-hill{position:absolute;left:-10%;width:120%;border-radius:50% 50% 0 0}.hero-hill-back{height:180px;bottom:100px;background:#71895c;transform:rotate(-3deg)}.hero-hill-front{height:170px;bottom:35px;background:#4e693e;transform:rotate(4deg)}.hero-bird{position:absolute;width:30px;height:18px;opacity:.4}.hero-bird span{position:absolute;width:17px;height:8px;top:5px;border-top:2px solid rgba(23,32,21,.65);border-radius:50%}.hero-bird span:first-child{left:0;transform:rotate(12deg)}.hero-bird span:last-child{right:0;transform:rotate(-12deg)}.hero-bird-one{top:92px;left:65px}.hero-bird-two{top:125px;left:112px;transform:scale(.7)}.hero-chicken{position:absolute;inset:0;z-index:4;width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;pointer-events:none}.hero-chicken-image{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;object-position:center bottom;margin:0;padding:0;transform:none;animation:none;filter:drop-shadow(0 18px 22px rgba(0,0,0,.22)) drop-shadow(0 5px 8px rgba(0,0,0,.12))}.hero-grass{position:absolute;z-index:5;left:0;right:0;bottom:0;height:58px;display:flex;align-items:flex-end;justify-content:space-around;pointer-events:none}.hero-grass span{width:3px;height:35px;border-radius:5px;background:#354d2e;transform-origin:bottom}.hero-grass span:nth-child(1){transform:rotate(-17deg)}.hero-grass span:nth-child(2){height:45px;transform:rotate(8deg)}.hero-grass span:nth-child(3){height:28px;transform:rotate(-7deg)}.hero-grass span:nth-child(4){height:50px;transform:rotate(13deg)}.hero-grass span:nth-child(5){height:33px;transform:rotate(-12deg)}.hero-grass span:nth-child(6){height:43px;transform:rotate(6deg)}.hero-card-bottom{min-height:70px;padding:8px 7px 3px;display:flex;align-items:center;justify-content:space-between}.hero-card-bottom>div{display:flex;flex-direction:column}.hero-card-bottom strong{color:var(--color-white);font-size:.95rem}.hero-card-bottom span{margin-top:2px;color:rgba(255,255,255,.85);font-size:.7rem}.hero-card-arrow{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--color-gold);color:var(--color-primary)}.hero-bottom-shape{position:absolute;z-index:3;left:-5%;right:-5%;bottom:-45px;height:90px;border-radius:50% 50% 0 0;background:var(--color-white)}@media(max-width:991px){.hero{min-height:auto}.hero-container{grid-template-columns:1fr;padding:75px 0 90px;gap:55px}.hero-content{max-width:760px;margin-inline:auto;text-align:center}.hero-eyebrow{margin-inline:auto}.hero-description{margin-inline:auto}.hero-actions,.hero-trust{justify-content:center}.hero-visual{width:100%}.hero-card{width:min(100%,520px)}.hero-farm-visual{height:400px}}@media(max-width:575px){.hero-container{padding:55px 0 75px;gap:42px}.hero-content h1{font-size:clamp(2.7rem,13vw,4rem)}.hero-description{font-size:.96rem}.hero-actions{flex-direction:column;align-items:stretch;margin-bottom:32px}.hero-primary-btn,.hero-secondary-btn{width:100%}.hero-trust{display:grid;grid-template-columns:1fr;justify-items:start;width:fit-content;margin-inline:auto;gap:13px}.hero-card{width:100%;padding:9px;border-radius:22px;transform:none}.hero-card-top{min-height:34px}.hero-farm-visual{width:calc(100% - 24px);height:330px;margin-inline:auto;border-radius:16px}.hero-sun{width:68px;height:68px;top:32px;right:35px}.hero-chicken{width:100%;height:100%;bottom:0}.hero-chicken-image{width:100%;height:100%;object-fit:contain;object-position:center bottom}.hero-grass{height:48px}.hero-bottom-shape{bottom:-30px;height:60px}}
`}</style>
    </section>
  );
};

export default Hero;
