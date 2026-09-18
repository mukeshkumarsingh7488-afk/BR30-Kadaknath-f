import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, HeartHandshake, Leaf, ShieldCheck, Sprout } from "lucide-react";

const farmSteps = [
  {
    number: "01",
    icon: Sprout,
    title: "Healthy Farm Environment",
    description: "We focus on maintaining a clean and suitable environment where birds can be cared for properly.",
  },
  {
    number: "02",
    icon: Leaf,
    title: "Daily Care & Feeding",
    description: "Regular feeding, clean water and daily observation are part of responsible farm routines.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Clean Handling",
    description: "We pay attention to cleanliness and careful handling throughout the farm process.",
  },
  {
    number: "04",
    icon: HeartHandshake,
    title: "Careful Delivery",
    description: "Our goal is to handle farm products responsibly from preparation to customer delivery.",
  },
];

const HowWeFarm = () => {
  return (
    <section className="how-we-farm section" id="how-we-farm">
      <div className="container">
        <div className="how-we-farm-header">
          <div className="section-heading">
            <span className="section-eyebrow">Our Farm Process</span>

            <h2>
              How We
              <span> Farm With Care.</span>
            </h2>

            <p>Responsible farming is about consistency. From the farm environment to handling our products, we focus on doing the important things carefully.</p>
          </div>

          <div className="how-we-farm-header-note">
            <span className="how-note-icon">
              <CheckCircle2 size={19} />
            </span>

            <div>
              <strong>Care at Every Step</strong>
              <p>Simple, consistent and responsible farm routines.</p>
            </div>
          </div>
        </div>

        <div className="how-we-farm-layout">
          <div className="how-we-farm-steps">
            {farmSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div className="farm-step" key={step.number}>
                  <div className="farm-step-number">{step.number}</div>

                  <div className="farm-step-icon">
                    <Icon size={22} strokeWidth={1.7} />
                  </div>

                  <div className="farm-step-content">
                    <h3>{step.title}</h3>

                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="how-we-farm-visual">
            <div className="farm-process-card">
              <div className="farm-process-top">
                <div>
                  <span>BR30 FARM</span>
                  <strong>From Farm to Table</strong>
                </div>

                <div className="farm-process-leaf">
                  <Leaf size={19} />
                </div>
              </div>

              <div className="farm-process-image-wrap">
                <img src="/images/kadaknath-farm-process.png" alt="Kadaknath chickens in a natural farm environment" className="farm-process-image" />
              </div>

              <div className="farm-process-bottom">
                <div>
                  <strong>Responsible Farming</strong>
                  <span>Careful routines. Thoughtful handling.</span>
                </div>

                <div className="farm-process-check">
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="how-we-farm-footer">
          <div className="how-footer-content">
            <span className="how-footer-icon">
              <HeartHandshake size={21} />
            </span>

            <div>
              <strong>We believe good farming starts with care.</strong>

              <p>Our focus is to build a farm customers can understand, trust and connect with.</p>
            </div>
          </div>

          <Link to="/about-farm" className="how-footer-link">
            Know More About Us
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <style>{`.how-we-farm{position:relative;overflow:hidden;background:var(--color-white)}.how-we-farm::before{content:"";position:absolute;width:520px;height:520px;left:-270px;top:180px;border-radius:50%;background:rgba(111,143,69,.07);pointer-events:none}.how-we-farm-header{position:relative;z-index:2;display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin-bottom:52px}.how-we-farm-header .section-heading{margin-bottom:0}.how-we-farm-header h2 span{color:var(--color-green)}.how-we-farm-header .section-heading p{color:#1a120c}.how-we-farm-header-note{min-width:265px;padding:14px 16px;display:flex;align-items:center;gap:11px;border:1px solid var(--color-border);border-radius:15px;background:var(--bg-soft)}.how-note-icon{width:38px;height:38px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:11px;background:var(--color-green-pale);color:var(--color-green)}.how-we-farm-header-note>div{display:flex;flex-direction:column}.how-we-farm-header-note strong{color:var(--color-primary);font-size:.78rem}.how-we-farm-header-note p{margin-top:2px;color:#1a120c;font-size:.68rem}.how-we-farm-layout{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,.9fr);align-items:center;gap:75px}.how-we-farm-steps{position:relative}.how-we-farm-steps::before{content:"";position:absolute;left:21px;top:34px;bottom:34px;width:1px;background:var(--color-border)}.farm-step{position:relative;display:grid;grid-template-columns:43px 54px 1fr;align-items:center;gap:15px;min-height:105px;padding:14px 0}.farm-step-number{position:relative;z-index:2;width:43px;height:43px;display:flex;align-items:center;justify-content:center;border:1px solid var(--color-border);border-radius:50%;background:var(--color-white);color:var(--color-green);font-size:.66rem;font-weight:850}.farm-step-icon{width:54px;height:54px;display:flex;align-items:center;justify-content:center;border-radius:15px;background:var(--color-green-pale);color:var(--color-green);transition:transform var(--transition-fast),background var(--transition-fast)}.farm-step:hover .farm-step-icon{transform:translateY(-2px);background:#dfe9d4}.farm-step-content h3{margin-bottom:5px;color:var(--color-primary);font-size:.95rem;font-weight:800}.farm-step-content p{max-width:430px;color:#1a120c;font-size:.78rem;line-height:1.65}.how-we-farm-visual{display:flex;justify-content:center}.farm-process-card{width:min(100%,480px);overflow:hidden;border:1px solid var(--color-border);border-radius:27px;background:var(--color-white);box-shadow:var(--shadow-lg)}.farm-process-top{min-height:67px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}.farm-process-top>div:first-child{display:flex;flex-direction:column}.farm-process-top span{color:#1a120c;font-size:.6rem;font-weight:850;letter-spacing:.12em}.farm-process-top strong{margin-top:3px;color:var(--color-primary);font-size:.93rem}.farm-process-leaf{width:39px;height:39px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--color-green-pale);color:var(--color-green)}.farm-process-image-wrap{position:relative;width:100%;height:345px;overflow:hidden;margin:0;padding:0;display:block;background:var(--color-green-pale)}.farm-process-image{display:block;width:100%;height:100%;margin:0;padding:0;max-width:none;max-height:none;object-fit:fill;object-position:center;transform:none}.farm-process-bottom{min-height:75px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:15px;border-top:1px solid var(--color-border)}.farm-process-bottom>div:first-child{display:flex;flex-direction:column}.farm-process-bottom strong{color:var(--color-primary);font-size:.82rem}.farm-process-bottom span{margin-top:3px;color:#1a120c;font-size:.67rem}.farm-process-check{width:34px;height:34px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.how-we-farm-footer{position:relative;z-index:2;margin-top:38px;padding:17px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--bg-soft)}.how-footer-content{display:flex;align-items:center;gap:12px}.how-footer-icon{width:42px;height:42px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--color-white);color:var(--color-green);box-shadow:var(--shadow-sm)}.how-footer-content>div{display:flex;flex-direction:column}.how-footer-content strong{color:var(--color-primary);font-size:.82rem}.how-footer-content p{margin-top:2px;color:#1a120c;font-size:.69rem}.how-footer-link{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;min-height:43px;padding:0 17px;border:1px solid var(--color-primary);border-radius:var(--radius-pill);color:var(--color-primary);font-size:.78rem;font-weight:800;transition:background var(--transition-fast),color var(--transition-fast),transform var(--transition-fast)}.how-footer-link:hover{background:var(--color-primary);color:var(--color-white);transform:translateY(-2px)}@media (max-width:991px){.how-we-farm-header{align-items:flex-start;flex-direction:column}.how-we-farm-header-note{min-width:0}.how-we-farm-layout{grid-template-columns:1fr;gap:50px}.how-we-farm-steps{max-width:760px}.how-we-farm-visual{width:100%}.how-we-farm-footer{align-items:flex-start;flex-direction:column}.how-footer-link{width:100%;justify-content:center}}@media (max-width:575px){.how-we-farm-header{margin-bottom:38px}.farm-step{grid-template-columns:35px 46px 1fr;gap:9px;min-height:95px}.farm-step-number{width:35px;height:35px;font-size:.58rem}.how-we-farm-steps::before{left:17px}.farm-process-image{width:100%;height:100%;margin:0;padding:0;object-fit:fill;object-position:center;transform:none}.farm-step-icon{width:46px;height:46px;border-radius:12px}.farm-step-content h3{font-size:.82rem}.farm-step-content p{font-size:.69rem}.farm-process-card{border-radius:22px}.farm-process-image-wrap{width:100%;height:285px;margin:0;padding:0}.farm-process-bottom{min-height:70px;padding:0 16px}.how-we-farm-footer{padding:15px}.how-footer-content{align-items:flex-start}}`}</style>
    </section>
  );
};

export default HowWeFarm;
