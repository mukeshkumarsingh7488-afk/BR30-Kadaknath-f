import { ArrowRight, HeartPulse, Leaf, ShieldCheck, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: HeartPulse,
    title: "Naturally Distinct",
    description: "Kadaknath is a distinctive Indian chicken breed known for its naturally dark skin and meat.",
  },
  {
    icon: Leaf,
    title: "Traditional Breed",
    description: "A traditional Indian breed with a long history of rearing in different parts of the country.",
  },
  {
    icon: ShieldCheck,
    title: "Care Matters",
    description: "Good farm practices, cleanliness and responsible handling are important at every stage.",
  },
  {
    icon: Sparkles,
    title: "A Unique Choice",
    description: "Its distinctive appearance and traditional identity make Kadaknath different from common poultry breeds.",
  },
];

const WhyKadaknath = () => {
  return (
    <section className="why-kadaknath section" id="why-kadaknath">
      <div className="why-kadaknath-pattern" />

      <div className="container">
        <div className="why-kadaknath-header">
          <div className="section-heading center">
            <span className="section-eyebrow">Why Kadaknath</span>

            <h2>
              A Breed With a<span> Story of Its Own.</span>
            </h2>

            <p>Kadaknath is one of India's distinctive native chicken breeds. Discover what makes it different and why responsible farming matters.</p>
          </div>
        </div>

        <div className="why-kadaknath-grid">
          {/* LEFT VISUAL */}
          <div className="why-kadaknath-visual">
            <div className="kadaknath-circle kadaknath-circle-one" />
            <div className="kadaknath-circle kadaknath-circle-two" />

            <div className="kadaknath-card">
              <div className="kadaknath-card-top">
                <span>INDIAN NATIVE BREED</span>

                <span className="kadaknath-status">
                  <span />
                  DISTINCT
                </span>
              </div>

              <div className="kadaknath-image-wrap">
                <img src="/images/kadaknath-why.png" alt="Kadaknath chicken - BR30 Kadaknath Farms" className="kadaknath-image" />
              </div>

              <div className="kadaknath-card-bottom">
                <div>
                  <strong>Kadaknath</strong>
                  <span>Native Indian Poultry Breed</span>
                </div>

                <Leaf size={20} />
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="why-kadaknath-content">
            <div className="why-kadaknath-benefits">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div className="why-benefit" key={benefit.title}>
                    <div className="why-benefit-number">0{index + 1}</div>

                    <div className="why-benefit-icon">
                      <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <div className="why-benefit-text">
                      <h3>{benefit.title}</h3>

                      <p>{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="why-kadaknath-note">
              <div className="why-note-icon">
                <Leaf size={20} />
              </div>

              <div>
                <strong>Our focus is responsible farming.</strong>

                <p>We believe the quality of a farm product starts with how the birds are cared for, handled and raised.</p>
              </div>
            </div>

            <a href="#how-we-farm" className="why-kadaknath-link">
              See How We Farm
              <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </div>

      <style>{`.why-kadaknath{position:relative;overflow:hidden;background:var(--color-primary);color:var(--color-white)}.why-kadaknath-pattern{position:absolute;inset:0;pointer-events:none;opacity:.35;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(to bottom,black,transparent 92%);-webkit-mask-image:linear-gradient(to bottom,black,transparent 92%)}.why-kadaknath::before{content:"";position:absolute;width:500px;height:500px;top:-300px;left:-180px;border-radius:50%;background:rgba(111,143,69,.14);filter:blur(4px)}.why-kadaknath::after{content:"";position:absolute;width:450px;height:450px;right:-220px;bottom:-260px;border-radius:50%;background:rgba(201,154,61,.08)}.why-kadaknath .container{position:relative;z-index:2}.why-kadaknath-header{margin-bottom:58px}.why-kadaknath .section-heading{margin-bottom:0}.why-kadaknath .section-eyebrow{color:var(--color-gold-light)}.why-kadaknath .section-heading h2{color:var(--color-white)}.why-kadaknath .section-heading h2 span{color:var(--color-gold-light)}.why-kadaknath .section-heading p{color:rgba(255,255,255,.85)}.why-kadaknath-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);align-items:center;gap:85px}.why-kadaknath-visual{position:relative;min-height:530px;display:flex;align-items:center;justify-content:center}.kadaknath-circle{position:absolute;border-radius:50%;border:1px solid rgba(228,199,123,.14)}.kadaknath-circle-one{width:480px;height:480px}.kadaknath-circle-two{width:365px;height:365px;border-color:rgba(255,255,255,.08)}.kadaknath-card{position:relative;z-index:3;width:min(100%,430px);height:465px;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:28px;background:linear-gradient(160deg,#3e5835 0%,#24331f 62%,#192219 100%);box-shadow:0 35px 70px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.07)}.kadaknath-card::before{content:"";position:absolute;width:250px;height:250px;top:-120px;right:-80px;border-radius:50%;background:rgba(228,199,123,.09);pointer-events:none}.kadaknath-card-top{position:relative;z-index:5;min-height:60px;padding:0 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}.kadaknath-card-top>span:first-child{color:rgba(255,255,255,.85);font-size:.63rem;font-weight:800;letter-spacing:.12em}.kadaknath-status{display:inline-flex;align-items:center;gap:6px;color:var(--color-gold-light);font-size:.6rem;font-weight:800;letter-spacing:.08em}.kadaknath-status span{width:6px;height:6px;border-radius:50%;background:var(--color-gold)}.kadaknath-image-wrap{position:absolute;top:52px;left:0;right:0;bottom:70px;z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0}.kadaknath-image{display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center;border-radius:18px;filter:drop-shadow(0 20px 28px rgba(0,0,0,.28));transition:transform var(--transition-normal)}.kadaknath-card-bottom{position:absolute;z-index:5;left:0;right:0;bottom:0;min-height:78px;padding:0 22px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.12)}.kadaknath-card-bottom div{display:flex;flex-direction:column}.kadaknath-card-bottom strong{color:var(--color-white);font-size:1rem}.kadaknath-card-bottom span{margin-top:3px;color:rgba(255,255,255,.85);font-size:.68rem}.kadaknath-card-bottom>svg{color:var(--color-gold-light)}.why-kadaknath-content{max-width:620px}.why-kadaknath-benefits{display:grid;gap:12px}.why-benefit{display:grid;grid-template-columns:30px 48px 1fr;align-items:center;gap:13px;padding:17px 16px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.035);transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast)}.why-benefit:hover{border-color:rgba(228,199,123,.2);background:rgba(255,255,255,.06);transform:translateX(4px)}.why-benefit-number{color:rgba(255,255,255,.27);font-size:.65rem;font-weight:800}.why-benefit-icon{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:rgba(201,154,61,.1);color:var(--color-gold-light)}.why-benefit-text h3{margin-bottom:4px;color:var(--color-white);font-size:.9rem;font-weight:800}.why-benefit-text p{color:rgba(255,255,255,.85);font-size:.75rem;line-height:1.6}.why-kadaknath-note{margin-top:25px;padding:17px;display:flex;align-items:flex-start;gap:12px;border:1px solid rgba(111,143,69,.25);border-radius:16px;background:rgba(111,143,69,.08)}.why-note-icon{width:38px;height:38px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:11px;background:rgba(111,143,69,.16);color:var(--color-green-light)}.why-kadaknath-note strong{display:block;margin-bottom:3px;color:var(--color-white);font-size:.78rem}.why-kadaknath-note p{color:rgba(255,255,255,.85);font-size:.7rem;line-height:1.6}.why-kadaknath-link{width:fit-content;margin-top:25px;display:inline-flex;align-items:center;gap:8px;min-height:45px;padding:0 18px;border:1px solid rgba(255,255,255,.18);border-radius:var(--radius-pill);color:var(--color-white);font-size:.8rem;font-weight:800;transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast)}.why-kadaknath-link:hover{border-color:var(--color-gold);background:rgba(201,154,61,.1);transform:translateY(-2px)}@media (max-width:991px){.why-kadaknath-grid{grid-template-columns:1fr;gap:60px}.why-kadaknath-visual{min-height:520px}.why-kadaknath-content{max-width:760px;margin-inline:auto}}@media (max-width:575px){.why-kadaknath-header{margin-bottom:40px}.why-kadaknath-grid{gap:42px}.why-kadaknath-visual{min-height:390px}.kadaknath-circle-one{width:350px;height:350px}.kadaknath-circle-two{width:275px;height:275px}.kadaknath-card{width:100%;height:365px;border-radius:22px}.kadaknath-card-top{min-height:52px;padding:0 16px}.kadaknath-image-wrap{top:52px;bottom:70px;padding:3px}.kadaknath-image{border-radius:14px}.kadaknath-card-bottom{min-height:70px;padding:0 16px}.kadaknath-fact{right:-2px;bottom:18px;width:125px}.why-benefit{grid-template-columns:25px 43px 1fr;gap:9px;padding:14px 12px}.why-benefit-icon{width:43px;height:43px}.why-benefit-text p{font-size:.7rem}.why-kadaknath-link{width:100%;justify-content:center}}`}</style>
    </section>
  );
};

export default WhyKadaknath;
