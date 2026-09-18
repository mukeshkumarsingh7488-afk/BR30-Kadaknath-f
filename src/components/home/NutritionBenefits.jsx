import { Egg, HeartPulse, Dumbbell, Leaf, ShieldCheck, Zap } from "lucide-react";

const nutritionStats = [
  {
    value: "25%",
    label: "Protein",
    note: "Approx. protein content in Kadaknath meat",
    icon: Dumbbell,
  },
  {
    value: "0.73–1.03%",
    label: "Fat",
    note: "Reported fat range in Kadaknath meat",
    icon: HeartPulse,
  },
  {
    value: "18+",
    label: "Amino Acids",
    note: "Kadaknath meat contains a broad amino acid profile",
    icon: Zap,
  },
  {
    value: "Low-Fat",
    label: "Lean Meat",
    note: "Known for its comparatively lean meat profile",
    icon: Leaf,
  },
];

const benefits = [
  {
    icon: Dumbbell,
    title: "Protein Rich",
    text: "Kadaknath meat is naturally protein-rich, making it a nutritious choice for protein-conscious diets.",
  },
  {
    icon: HeartPulse,
    title: "Lean Meat",
    text: "Research reports relatively low fat content compared with commercial broiler meat.",
  },
  {
    icon: Egg,
    title: "Nutritious Eggs",
    text: "Kadaknath eggs provide protein and a range of fatty acids and minerals as part of a balanced diet.",
  },
  {
    icon: Leaf,
    title: "Traditional Indian Breed",
    text: "Kadaknath is an indigenous Indian chicken breed known for its distinctive black meat and traditional food value.",
  },
];

const NutritionBenefits = () => {
  return (
    <section className="nutrition-section" id="nutrition">
      <div className="container">
        <div className="nutrition-heading">
          <div className="nutrition-heading-text">
            <span className="eyebrow">Nutrition & Wellness</span>

            <h2 className="display">
              Naturally rich.
              <br />
              <span>Simply nutritious.</span>
            </h2>

            <p className="lead">Kadaknath chicken and eggs are valued for their distinctive nutritional profile. From protein-rich meat to nutritious eggs, every product brings the natural goodness of this indigenous Indian breed to your table.</p>
          </div>

          <div className="nutrition-badge">
            <ShieldCheck size={19} />
            <div>
              <strong>Nutrition Focused</strong>
              <span>Natural food from our farm</span>
            </div>
          </div>
        </div>

        <div className="nutrition-stats">
          {nutritionStats.map((item) => {
            const Icon = item.icon;

            return (
              <div className="nutrition-stat-card" key={item.label}>
                <div className="nutrition-stat-icon">
                  <Icon size={19} />
                </div>

                <div className="nutrition-stat-value">{item.value}</div>

                <div className="nutrition-stat-label">{item.label}</div>

                <p>{item.note}</p>
              </div>
            );
          })}
        </div>

        <div className="nutrition-content">
          <div className="nutrition-content-image">
            <img src="/images/kadaknath-nutrition.png" alt="Fresh Kadaknath chicken and eggs" />

            <div className="nutrition-image-tag">
              <Egg size={16} />
              <span>Farm Fresh Nutrition</span>
            </div>
          </div>

          <div className="nutrition-benefits">
            <span className="eyebrow">Why Kadaknath?</span>

            <h3>
              Good food starts
              <br />
              with <span>good nutrition.</span>
            </h3>

            <div className="benefit-list">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div className="benefit-item" key={benefit.title}>
                    <div className="benefit-icon">
                      <Icon size={18} />
                    </div>

                    <div>
                      <h4>{benefit.title}</h4>
                      <p>{benefit.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="nutrition-note">
          <strong>Nutrition note:</strong>
          <span>Nutritional values can vary depending on breed characteristics, age, feed, cut of meat and cooking method. The figures shown here are approximate/reference values and are not medical claims.</span>
        </div>
      </div>

      <style>{`.nutrition-section{padding:110px 0;background:#f8f5ef;overflow:hidden}.nutrition-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin-bottom:55px}.nutrition-heading-text{max-width:760px}.nutrition-heading .lead{max-width:680px;margin-top:20px;color:#1a120c}.nutrition-heading .display span{color:var(--color-gold)}.nutrition-badge{display:flex;align-items:center;gap:11px;min-width:220px;padding:14px 17px;border:1px solid rgba(26,18,12,.14);background:#fff;border-radius:7px}.nutrition-badge svg{color:var(--color-gold);flex:0 0 auto}.nutrition-badge strong{display:block;color:#1a120c;font-size:.76rem;font-weight:850}.nutrition-badge span{display:block;margin-top:3px;color:#1a120c;font-size:.64rem}.nutrition-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:70px}.nutrition-stat-card{padding:27px 23px;border:1px solid rgba(26,18,12,.12);border-radius:8px;background:#fff;transition:transform .2s ease,box-shadow .2s ease}.nutrition-stat-card:hover{transform:translateY(-4px);box-shadow:6px 6px 0 #1a120c}.nutrition-stat-icon{width:38px;height:38px;display:flex;align-items:center;justify-content:center;margin-bottom:22px;border-radius:50%;background:#f2eadb;color:#7a5a20}.nutrition-stat-value{color:#1a120c;font-size:1.65rem;font-weight:900;letter-spacing:-.04em}.nutrition-stat-label{margin-top:3px;color:#7a5a20;font-size:.72rem;font-weight:850;text-transform:uppercase;letter-spacing:.07em}.nutrition-stat-card p{margin:13px 0 0;color:#1a120c;font-size:.72rem;line-height:1.55}.nutrition-content{display:grid;grid-template-columns:1.05fr .95fr;gap:65px;align-items:center}.nutrition-content-image{position:relative;min-height:480px;overflow:hidden;border-radius:8px;background:#ded8ce;border:2px solid #1a120c;box-shadow:9px 9px 0 #1a120c}.nutrition-content-image img{width:100%;height:100%;min-height:480px;display:block;object-fit:cover}.nutrition-image-tag{position:absolute;left:20px;bottom:20px;display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:5px;background:rgba(255,255,255,.94);color:#1a120c;font-size:.7rem;font-weight:800}.nutrition-image-tag svg{color:#7a5a20}.nutrition-benefits{max-width:570px}.nutrition-benefits h3{margin:12px 0 30px;color:#1a120c;font-size:clamp(2rem,4vw,3.3rem);line-height:1.02;letter-spacing:-.045em}.nutrition-benefits h3 span{color:var(--color-gold)}.benefit-list{display:flex;flex-direction:column;gap:22px}.benefit-item{display:flex;align-items:flex-start;gap:14px}.benefit-icon{width:39px;height:39px;flex:0 0 39px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#1a120c;color:#fff}.benefit-item h4{margin:0;color:#1a120c;font-size:.85rem;font-weight:850}.benefit-item p{margin:5px 0 0;color:#1a120c;font-size:.75rem;line-height:1.65}.nutrition-note{display:flex;gap:8px;margin-top:55px;padding-top:18px;border-top:1px solid rgba(26,18,12,.12);color:#1a120c;font-size:.67rem;line-height:1.6}.nutrition-note strong{color:#1a120c;white-space:nowrap}@media (max-width:1000px){.nutrition-heading{align-items:flex-start;flex-direction:column}.nutrition-stats{grid-template-columns:repeat(2,1fr)}.nutrition-content{grid-template-columns:1fr;gap:55px}.nutrition-benefits{max-width:none}}@media (max-width:600px){.nutrition-section{padding:80px 0}.nutrition-stats{grid-template-columns:1fr}.nutrition-stat-card:hover{transform:none;box-shadow:none}.nutrition-content-image,.nutrition-content-image img{min-height:340px}.nutrition-content-image{box-shadow:6px 6px 0 #1a120c}.nutrition-note{flex-direction:column}}`}</style>
    </section>
  );
};

export default NutritionBenefits;
