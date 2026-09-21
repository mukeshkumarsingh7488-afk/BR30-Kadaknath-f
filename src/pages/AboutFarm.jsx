import { ArrowRight, CheckCircle2, HeartHandshake, Leaf, MapPin, ShieldCheck, Sprout, Tractor, Users } from "lucide-react";
import { Link } from "react-router-dom";

const AboutFarm = () => {
  const farmLocation = "https://maps.app.goo.gl/UMhYowAbkZYNNg7R8";

  return (
    <>
      <main className="about-farm-page">
        {/* Hero */}
        <section className="about-farm-hero">
          <div className="container">
            <div className="about-farm-hero-grid">
              <div className="about-farm-hero-content">
                <span className="about-farm-eyebrow">Our Farm</span>

                <h1>
                  Raising Kadaknath
                  <span> With Care & Purpose.</span>
                </h1>

                <p>BR30 Kadaknath Farms is focused on naturally raised Kadaknath birds and quality farm products, with an emphasis on responsible farming, careful handling, and customer trust.</p>

                <div className="about-farm-actions">
                  <Link to="/products" className="btn btn-primary">
                    Explore Products
                    <ArrowRight size={17} />
                  </Link>

                  <Link to="/contact" className="btn btn-outline">
                    Contact Our Farm
                  </Link>

                  <a href={farmLocation} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    Visit Our Farm
                    <MapPin size={17} />
                  </a>
                </div>
              </div>

              <div className="about-farm-hero-card">
                <div className="about-farm-icon-large">
                  <Sprout size={34} />
                </div>

                <span>BR30 Kadaknath Farms</span>

                <h2>
                  Farm-raised.
                  <br />
                  Naturally focused.
                </h2>

                <p>Building a farm brand around quality, responsible practices, and long-term trust.</p>

                <div className="about-farm-card-line" />
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="about-farm-intro section">
          <div className="container">
            <div className="section-heading center">
              <span className="section-eyebrow">Who We Are</span>

              <h2>A Farm Built With a Simple Purpose</h2>

              <p>Our goal is to make quality Kadaknath products accessible while building a farm that values responsible care and transparent practices.</p>
            </div>

            <div className="about-farm-story-grid">
              <div className="about-farm-story-card">
                <div className="about-farm-story-icon">
                  <HeartHandshake size={23} />
                </div>

                <h3>Care Comes First</h3>

                <p>We believe good farm products begin with proper care. Responsible handling and attention to the birds are an important part of our approach.</p>
              </div>

              <div className="about-farm-story-card featured">
                <div className="about-farm-story-icon">
                  <Leaf size={23} />
                </div>

                <h3>Natural Farming Focus</h3>

                <p>Our farming approach is centered around naturally raised Kadaknath birds and maintaining a healthy, practical farm environment.</p>
              </div>

              <div className="about-farm-story-card">
                <div className="about-farm-story-icon">
                  <ShieldCheck size={23} />
                </div>

                <h3>Quality & Trust</h3>

                <p>From farm handling to customer delivery, we aim to maintain consistent quality and build relationships based on trust.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="about-farm-approach section-soft section">
          <div className="container">
            <div className="about-farm-approach-grid">
              <div className="about-farm-approach-content">
                <span className="section-eyebrow">Our Approach</span>

                <h2>More Than Just a Farm</h2>

                <p>BR30 Kadaknath Farms is being developed with a long-term vision: create a dependable farm brand that customers can trust for Kadaknath eggs, chicken, chicks, breeding stock, hatching eggs, and other farm products.</p>

                <p>We focus on practical farming, careful management, and continuously improving how we raise, handle, and deliver our products.</p>

                <ul className="about-farm-check-list">
                  <li>
                    <CheckCircle2 size={19} />
                    Responsible bird care
                  </li>

                  <li>
                    <CheckCircle2 size={19} />
                    Careful product handling
                  </li>

                  <li>
                    <CheckCircle2 size={19} />
                    Quality-focused farm practices
                  </li>

                  <li>
                    <CheckCircle2 size={19} />
                    Customer-first service
                  </li>
                </ul>
              </div>

              <div className="about-farm-visual-card">
                <div className="about-farm-visual-top">
                  <div className="about-farm-visual-icon">
                    <Tractor size={28} />
                  </div>

                  <span>Farm Vision</span>
                </div>

                <h3>
                  Growing responsibly.
                  <br />
                  Serving honestly.
                </h3>

                <p>We want every BR30 Farms customer to know where their farm products come from and feel confident about choosing them.</p>

                <div className="about-farm-visual-bottom">
                  <div>
                    <strong>Farm</strong>
                    <span>Focused</span>
                  </div>

                  <div>
                    <strong>Quality</strong>
                    <span>Driven</span>
                  </div>

                  <div>
                    <strong>Trust</strong>
                    <span>Built</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="about-farm-products section">
          <div className="container">
            <div className="section-heading center">
              <span className="section-eyebrow">What We Offer</span>

              <h2>From Our Farm to Your Door</h2>

              <p>Our product range is designed for customers looking for Kadaknath food products as well as farming and breeding stock.</p>
            </div>

            <div className="about-farm-offer-grid">
              <Link to="/products/kadaknath-eggs" className="about-farm-offer-item">
                <div className="about-farm-offer-image">
                  <img src="/images/kadaknath-eggs.png" alt="Kadaknath Eggs" />
                </div>

                <span>01</span>

                <h3>Kadaknath Eggs</h3>

                <p>Fresh Kadaknath eggs, carefully collected from naturally raised Kadaknath birds and packed with care to maintain freshness.</p>

                <strong>
                  View Product
                  <ArrowRight size={15} />
                </strong>
              </Link>

              <Link to="/products/kadaknath-chicken" className="about-farm-offer-item">
                <div className="about-farm-offer-image">
                  <img src="/images/kadaknath-chicken.png" alt="Kadaknath Chicken" />
                </div>

                <span>02</span>

                <h3>Kadaknath Chicken</h3>

                <p>Fresh Kadaknath chicken, sourced from carefully raised Kadaknath birds and handled with care for quality and freshness.</p>

                <strong>
                  View Product
                  <ArrowRight size={15} />
                </strong>
              </Link>

              <Link to="/products/kadaknath-chicks" className="about-farm-offer-item">
                <div className="about-farm-offer-image">
                  <img src="/images/kadaknath-chicks.png" alt="Kadaknath Chicks" />
                </div>

                <span>03</span>

                <h3>Kadaknath Chicks</h3>

                <p>Healthy Kadaknath chicks, carefully raised with proper care and suitable for farmers, breeders, and poultry enthusiasts.</p>

                <strong>
                  View Product
                  <ArrowRight size={15} />
                </strong>
              </Link>

              <Link to="/products/kadaknath-breeding-pair" className="about-farm-offer-item">
                <div className="about-farm-offer-image">
                  <img src="/images/kadaknath-breeding-pair.png" alt="Kadaknath Breeding Pair" />
                </div>

                <span>04</span>

                <h3>Kadaknath Breeding Pair</h3>

                <p>Healthy Kadaknath breeding pair, carefully selected and raised for customers looking to start or expand their Kadaknath breeding setup.</p>

                <strong>
                  View Product
                  <ArrowRight size={15} />
                </strong>
              </Link>

              <Link to="/products/kadaknath-hatching-eggs" className="about-farm-offer-item">
                <div className="about-farm-offer-image">
                  <img src="/images/kadaknath-hatching-eggs.png" alt="Kadaknath Hatching Eggs" />
                </div>

                <span>05</span>

                <h3>Kadaknath Hatching Eggs</h3>

                <p>Fresh Kadaknath hatching eggs, carefully collected and handled for customers looking to hatch and raise Kadaknath chicks.</p>

                <strong>
                  View Product
                  <ArrowRight size={15} />
                </strong>
              </Link>

              <Link to="/products/kadaknath-live-bird" className="about-farm-offer-item">
                <div className="about-farm-offer-image">
                  <img src="/images/kadaknath-live-birds.png" alt="Kadaknath Live Bird" />
                </div>

                <span>06</span>

                <h3>Kadaknath Live Bird</h3>

                <p>Healthy, naturally raised Kadaknath live birds, carefully maintained with proper care for quality and freshness.</p>

                <strong>
                  View Product
                  <ArrowRight size={15} />
                </strong>
              </Link>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about-farm-values section-dark section">
          <div className="container">
            <div className="about-farm-values-header">
              <div>
                <span className="section-eyebrow">Our Values</span>

                <h2>What We Stand For</h2>
              </div>

              <p>A strong farm is built over time through consistency, care, and trust.</p>
            </div>

            <div className="about-farm-values-grid">
              <div className="about-farm-value">
                <Users size={25} />

                <h3>Customer Trust</h3>

                <p>Clear communication and dependable service are important to us.</p>
              </div>

              <div className="about-farm-value">
                <Leaf size={25} />

                <h3>Responsible Farming</h3>

                <p>We focus on practical farming practices and responsible bird care.</p>
              </div>

              <div className="about-farm-value">
                <ShieldCheck size={25} />

                <h3>Quality</h3>

                <p>We aim to maintain quality throughout farming, handling, and delivery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-farm-cta section">
          <div className="container">
            <div className="about-farm-cta-card">
              <div>
                <span className="section-eyebrow">Explore BR30 Farms</span>

                <h2>Ready to Explore Our Farm Products?</h2>

                <p>Discover our available Kadaknath products and choose what suits your needs.</p>
              </div>

              <div className="about-farm-cta-actions">
                <Link to="/products" className="btn btn-primary">
                  View Products
                  <ArrowRight size={17} />
                </Link>

                <Link to="/contact" className="btn btn-outline">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`.about-farm-page{background:var(--bg-page);color:var(--color-text)}.about-farm-hero{padding:85px 0 95px;background:radial-gradient(circle at 85% 20%,rgba(201,154,61,.12),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}.about-farm-hero-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);align-items:center;gap:70px}.about-farm-eyebrow{display:inline-block;margin-bottom:14px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.about-farm-hero-content h1{max-width:760px;margin-bottom:22px;color:var(--color-primary);font-size:clamp(2.7rem,5vw,4.8rem);letter-spacing:-.055em}.about-farm-hero-content h1 span{display:block;color:var(--color-green)}.about-farm-hero-content>p{max-width:700px;margin-bottom:30px;color:#1a120c;font-size:1.05rem;line-height:1.85}.about-farm-actions{display:flex;flex-wrap:wrap;gap:12px}.about-farm-hero-card{position:relative;padding:38px;overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-primary);box-shadow:var(--shadow-lg)}.about-farm-hero-card::before{content:"";position:absolute;width:190px;height:190px;top:-80px;right:-70px;border-radius:50%;background:rgba(201,154,61,.13)}.about-farm-icon-large{position:relative;display:grid;place-items:center;width:66px;height:66px;margin-bottom:24px;border-radius:18px;background:rgba(111,143,69,.18);color:var(--color-gold-light)}.about-farm-hero-card>span{position:relative;color:var(--color-gold-light);font-size:.75rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.about-farm-hero-card h2{position:relative;margin:13px 0 15px;color:var(--color-white);font-size:clamp(1.8rem,3vw,2.5rem);letter-spacing:-.035em}.about-farm-hero-card p{position:relative;color:rgba(255,255,255,.85);font-size:.9rem;line-height:1.75}.about-farm-card-line{position:relative;width:70px;height:3px;margin-top:30px;border-radius:999px;background:var(--color-gold)}.about-farm-story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.about-farm-story-card{padding:30px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm);transition:transform var(--transition-normal),box-shadow var(--transition-normal)}.about-farm-story-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-md)}.about-farm-story-card.featured{background:var(--color-green-pale);border-color:rgba(63,107,53,.16)}.about-farm-story-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:20px;border-radius:14px;background:var(--color-cream);color:var(--color-green)}.about-farm-story-card.featured .about-farm-story-icon{background:var(--color-white)}.about-farm-story-card h3{margin-bottom:10px;color:var(--color-primary);font-size:1.15rem}.about-farm-story-card p{color:#1a120c;font-size:.88rem;line-height:1.75}.about-farm-approach-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(350px,.8fr);align-items:center;gap:70px}.about-farm-approach-content h2{margin-bottom:18px;color:var(--color-primary);font-size:clamp(2rem,4vw,3rem);letter-spacing:-.04em}.about-farm-approach-content p{margin-bottom:16px;color:#1a120c;font-size:.94rem;line-height:1.85}.about-farm-check-list{display:grid;gap:12px;margin-top:26px}.about-farm-check-list li{display:flex;align-items:center;gap:10px;color:var(--color-primary);font-size:.88rem;font-weight:700}.about-farm-check-list svg{flex-shrink:0;color:var(--color-green)}.about-farm-visual-card{padding:35px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.about-farm-visual-top{display:flex;align-items:center;gap:13px;margin-bottom:28px}.about-farm-visual-icon{display:grid;place-items:center;width:52px;height:52px;border-radius:15px;background:var(--color-green-pale);color:var(--color-green)}.about-farm-visual-top span{color:var(--color-text-soft);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.about-farm-visual-card h3{margin-bottom:14px;color:var(--color-primary);font-size:1.9rem;letter-spacing:-.035em}.about-farm-visual-card>p{color:#1a120c;font-size:.88rem;line-height:1.75}.about-farm-visual-bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:30px;padding-top:22px;border-top:1px solid var(--color-border)}.about-farm-visual-bottom div{display:grid;gap:2px}.about-farm-visual-bottom strong{color:var(--color-primary);font-size:.8rem}.about-farm-visual-bottom span{color:var(--color-text-soft);font-size:.68rem}.about-farm-offer-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}.about-farm-offer-item{display:block;padding:15px 13px;border-top:3px solid var(--color-green);border-radius:0 0 var(--radius-lg) var(--radius-lg);background:var(--color-cream);text-decoration:none;transition:transform var(--transition-normal),box-shadow var(--transition-normal)}.about-farm-offer-item:hover{transform:translateY(-5px);box-shadow:var(--shadow-md)}.about-farm-offer-image{width:100%;aspect-ratio:1/1;overflow:hidden;margin-bottom:14px;border-radius:12px;background:var(--color-white)}.about-farm-offer-image img{width:100%;height:100%;display:block;object-fit:cover;transition:transform var(--transition-normal)}.about-farm-offer-item:hover .about-farm-offer-image img{transform:scale(1.05)}.about-farm-offer-item>span{display:block;margin-bottom:7px;color:var(--color-gold);font-size:.66rem;font-weight:900;letter-spacing:.1em}.about-farm-offer-item h3{margin-bottom:8px;color:var(--color-primary);font-size:.88rem;line-height:1.25}.about-farm-offer-item p{margin-bottom:13px;color:#1a120c;font-size:.7rem;line-height:1.55}.about-farm-offer-item strong{display:flex;align-items:center;gap:6px;color:var(--color-green);font-size:.7rem;font-weight:800}.about-farm-offer-item strong svg{flex-shrink:0}.about-farm-values-header{display:flex;align-items:end;justify-content:space-between;gap:40px;margin-bottom:45px}.about-farm-values-header .section-eyebrow{color:var(--color-gold-light)}.about-farm-values-header h2{color:var(--color-white);font-size:clamp(2rem,4vw,3rem);letter-spacing:-.04em}.about-farm-values-header>p{max-width:390px;color:rgba(255,255,255,.85);font-size:.9rem;line-height:1.7}.about-farm-values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.about-farm-value{padding:28px;border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-lg);background:rgba(255,255,255,.04)}.about-farm-value>svg{margin-bottom:20px;color:var(--color-gold-light)}.about-farm-value h3{margin-bottom:9px;color:var(--color-white);font-size:1.05rem}.about-farm-value p{color:rgba(255,255,255,.85);font-size:.82rem;line-height:1.7}.about-farm-cta-card{display:flex;align-items:center;justify-content:space-between;gap:40px;padding:42px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-cream)}.about-farm-cta-card h2{margin-bottom:10px;color:var(--color-primary);font-size:clamp(1.7rem,3vw,2.4rem);letter-spacing:-.035em}.about-farm-cta-card p{color:#1a120c;font-size:.88rem}.about-farm-cta-actions{display:flex;flex-shrink:0;flex-wrap:wrap;gap:10px}@media (max-width:991px){.about-farm-hero{padding:70px 0 80px}.about-farm-hero-grid{grid-template-columns:1fr;gap:40px}.about-farm-hero-card{max-width:620px}.about-farm-story-grid{grid-template-columns:repeat(2,1fr)}.about-farm-story-card:last-child{grid-column:1/-1}.about-farm-approach-grid{grid-template-columns:1fr;gap:40px}.about-farm-offer-grid{grid-template-columns:repeat(3,1fr)}.about-farm-values-header{align-items:start;flex-direction:column;gap:15px}.about-farm-values-grid{grid-template-columns:1fr}}@media (max-width:767px){.about-farm-hero-content h1{font-size:clamp(2.4rem,11vw,3.4rem)}.about-farm-hero-content>p{font-size:.95rem}.about-farm-actions{flex-direction:column;align-items:stretch}.about-farm-actions .btn{width:100%}.about-farm-hero-card{padding:28px}.about-farm-story-grid{grid-template-columns:1fr}.about-farm-story-card:last-child{grid-column:auto}.about-farm-visual-card{padding:28px}.about-farm-offer-grid{grid-template-columns:1fr}.about-farm-cta-card{align-items:stretch;flex-direction:column;padding:30px 25px}.about-farm-cta-actions{flex-direction:column}.about-farm-cta-actions .btn{width:100%}}@media (max-width:575px){.about-farm-hero{padding:55px 0 65px}.about-farm-visual-bottom{grid-template-columns:1fr;gap:13px}}`}</style>
    </>
  );
};

export default AboutFarm;
