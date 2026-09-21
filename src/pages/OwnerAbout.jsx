import { ArrowRight, CheckCircle2, HeartHandshake, Leaf, MapPin, ShieldCheck, Sprout, Tractor, Users } from "lucide-react";
import { Link } from "react-router-dom";

const OwnerAbout = () => {
  const farmLocation = "https://maps.app.goo.gl/UMhYowAbkZYNNg7R8";

  return (
    <>
      <main className="owner-about-page">
        {/* HERO */}
        <section className="owner-about-hero">
          <div className="container">
            <div className="owner-about-hero-grid">
              <div className="owner-about-hero-content">
                <span className="owner-about-eyebrow">About the Owner</span>

                <h1>
                  Building BR30 Kadaknath Farms
                  <span> With Care & Purpose.</span>
                </h1>

                <p>BR30 Kadaknath Farms was started in 2022 with a simple purpose — to build a dependable farm focused on Kadaknath birds, quality farm products, responsible practices, and long-term customer trust.</p>

                <div className="owner-about-actions">
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

              <div className="owner-about-image-card">
                <div className="owner-about-image-wrap">
                  <img src="/images/BR30-Kadaknath-owner.png" alt="Owner of BR30 Kadaknath Farms" />
                </div>

                <div className="owner-about-image-caption">
                  <span>BR30 Kadaknath Farms</span>

                  <strong>Since 2022</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="owner-about-intro section">
          <div className="container">
            <div className="section-heading center">
              <span className="section-eyebrow">Our Beginning</span>

              <h2>A Farm Started With a Simple Vision</h2>

              <p>BR30 Kadaknath Farms began its journey in 2022 with the aim of developing a focused Kadaknath farm built around care, quality, responsible farming, and customer trust.</p>
            </div>

            <div className="owner-about-story-grid">
              <div className="owner-about-story-card">
                <div className="owner-about-story-icon">
                  <Sprout size={23} />
                </div>

                <span className="owner-about-year">2022</span>

                <h3>Our Journey Began</h3>

                <p>BR30 Kadaknath Farms started its journey with a focus on Kadaknath farming and building a strong foundation for future growth.</p>
              </div>

              <div className="owner-about-story-card featured">
                <div className="owner-about-story-icon">
                  <HeartHandshake size={23} />
                </div>

                <span className="owner-about-year">Our Approach</span>

                <h3>Care Comes First</h3>

                <p>Proper bird care, careful handling, and responsible farm management remain important parts of our approach.</p>
              </div>

              <div className="owner-about-story-card">
                <div className="owner-about-story-icon">
                  <ShieldCheck size={23} />
                </div>

                <span className="owner-about-year">Our Promise</span>

                <h3>Trust & Quality</h3>

                <p>We aim to build long-term relationships with customers through consistent quality, clear communication, and dependable service.</p>
              </div>
            </div>
          </div>
        </section>

        {/* OWNER STORY */}
        <section className="owner-about-story section-soft section">
          <div className="container">
            <div className="owner-about-story-main">
              <div className="owner-about-story-image">
                <img src="/images/BR30-owner-idea.png" alt="BR30 Kadaknath Farms owner" />
              </div>

              <div className="owner-about-story-content">
                <span className="section-eyebrow">The Story Behind BR30 Farms</span>

                <h2>From an Idea to a Growing Farm</h2>

                <p>Starting in 2022, BR30 Kadaknath Farms was created with the intention of developing a farm dedicated to Kadaknath birds and farm products.</p>

                <p>The focus has always been on building the farm step by step — taking care of the birds, improving farm practices, maintaining product quality, and creating a reliable experience for customers.</p>

                <p>As the farm grows, the vision remains the same: develop BR30 Kadaknath Farms into a trusted farm brand while continuing to improve farming, handling, and customer service.</p>

                <div className="owner-about-check-list">
                  <div>
                    <CheckCircle2 size={19} />
                    <span>Responsible bird care</span>
                  </div>

                  <div>
                    <CheckCircle2 size={19} />
                    <span>Quality-focused farming</span>
                  </div>

                  <div>
                    <CheckCircle2 size={19} />
                    <span>Careful product handling</span>
                  </div>

                  <div>
                    <CheckCircle2 size={19} />
                    <span>Customer-first approach</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISION */}
        <section className="owner-about-vision section">
          <div className="container">
            <div className="owner-about-vision-grid">
              <div className="owner-about-vision-content">
                <span className="section-eyebrow">Owner's Vision</span>

                <h2>
                  Growing Responsibly.
                  <br />
                  Serving Honestly.
                </h2>

                <p>The vision behind BR30 Kadaknath Farms is to create a dependable farm brand where customers can confidently connect with quality Kadaknath products and understand where their products come from.</p>

                <p>We believe a strong farm is built over time through consistency, responsible management, quality practices, and trust.</p>

                <div className="owner-about-vision-points">
                  <div>
                    <Leaf size={21} />
                    <span>Responsible Farming</span>
                  </div>

                  <div>
                    <ShieldCheck size={21} />
                    <span>Quality & Trust</span>
                  </div>

                  <div>
                    <Users size={21} />
                    <span>Customer Focus</span>
                  </div>
                </div>
              </div>

              <div className="owner-about-vision-card">
                <div className="owner-about-vision-icon">
                  <Tractor size={29} />
                </div>

                <span>BR30 Kadaknath Farms</span>

                <h3>
                  Building a farm
                  <br />
                  for the long term.
                </h3>

                <p>Started in 2022 with a focus on Kadaknath farming, responsible practices, and building customer trust.</p>

                <div className="owner-about-vision-line" />
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="owner-about-values section-dark section">
          <div className="container">
            <div className="owner-about-values-header">
              <div>
                <span className="section-eyebrow">Our Values</span>

                <h2>What Guides BR30 Farms</h2>
              </div>

              <p>The farm is being developed around a few simple principles that guide our approach every day.</p>
            </div>

            <div className="owner-about-values-grid">
              <div className="owner-about-value">
                <Sprout size={25} />

                <h3>Responsible Farming</h3>

                <p>We focus on practical farming methods and responsible care of Kadaknath birds.</p>
              </div>

              <div className="owner-about-value">
                <HeartHandshake size={25} />

                <h3>Customer Trust</h3>

                <p>Clear communication, dependable service, and honest customer relationships matter to us.</p>
              </div>

              <div className="owner-about-value">
                <ShieldCheck size={25} />

                <h3>Quality</h3>

                <p>We aim to maintain quality throughout farming, handling, packing, and delivery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FARM PRODUCTS */}
        <section className="owner-about-products section">
          <div className="container">
            <div className="section-heading center">
              <span className="section-eyebrow">Our Farm</span>

              <h2>From Our Farm to Your Door</h2>

              <p>BR30 Kadaknath Farms focuses on Kadaknath products for customers as well as farming and breeding requirements.</p>
            </div>

            <div className="owner-about-products-grid">
              <Link to="/products/kadaknath-eggs" className="owner-about-product">
                <div className="owner-about-product-image">
                  <img src="/images/kadaknath-eggs.png" alt="Kadaknath Eggs" />
                </div>

                <span>01</span>

                <h3>Kadaknath Eggs</h3>

                <p>Fresh Kadaknath eggs, carefully collected from naturally raised Kadaknath birds and packed with care to maintain freshness.</p>
              </Link>

              <Link to="/products/kadaknath-chicken" className="owner-about-product">
                <div className="owner-about-product-image">
                  <img src="/images/kadaknath-chicken.png" alt="Kadaknath Chicken" />
                </div>

                <span>02</span>

                <h3>Kadaknath Chicken</h3>

                <p>Fresh Kadaknath chicken, sourced from carefully raised Kadaknath birds and handled with care for quality and freshness.</p>
              </Link>

              <Link to="/products/kadaknath-chicks" className="owner-about-product">
                <div className="owner-about-product-image">
                  <img src="/images/kadaknath-chicks.png" alt="Kadaknath Chicks" />
                </div>

                <span>03</span>

                <h3>Kadaknath Chicks</h3>

                <p>Healthy Kadaknath chicks, carefully raised with proper care and suitable for farmers, breeders, and poultry enthusiasts.</p>
              </Link>

              <Link to="/products/kadaknath-breeding-pair" className="owner-about-product">
                <div className="owner-about-product-image">
                  <img src="/images/kadaknath-breeding-pair.png" alt="Kadaknath Breeding Pair" />
                </div>

                <span>04</span>

                <h3>Kadaknath Breeding Pair</h3>

                <p>Healthy Kadaknath breeding pair, carefully selected and raised for customers looking to start or expand their Kadaknath breeding setup.</p>
              </Link>

              <Link to="/products/kadaknath-hatching-eggs" className="owner-about-product">
                <div className="owner-about-product-image">
                  <img src="/images/kadaknath-hatching-eggs.png" alt="Kadaknath Hatching Eggs" />
                </div>

                <span>05</span>

                <h3>Kadaknath Hatching Eggs</h3>

                <p>Fresh Kadaknath hatching eggs, carefully collected and handled for customers looking to hatch and raise Kadaknath chicks.</p>
              </Link>

              <Link to="/products/kadaknath-live-bird" className="owner-about-product">
                <div className="owner-about-product-image">
                  <img src="/images/kadaknath-live-birds.png" alt="Kadaknath Live Bird" />
                </div>

                <span>06</span>

                <h3>Kadaknath Live Bird</h3>

                <p>Healthy, naturally raised Kadaknath live birds, carefully maintained with proper care for quality and freshness.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* OWNER MESSAGE */}
        <section className="owner-about-message section-soft section">
          <div className="container">
            <div className="owner-about-message-card">
              <div className="owner-about-message-mark">“</div>

              <div>
                <span className="section-eyebrow">A Message From the Owner</span>

                <h2>Building BR30 Farms one step at a time.</h2>

                <p>BR30 Kadaknath Farms started in 2022 with a vision to build something meaningful around Kadaknath farming. Our journey is about learning, improving, caring for our birds, maintaining quality, and earning the trust of every customer we serve.</p>

                <p>We look forward to growing the farm responsibly and continuing this journey with our customers.</p>

                <strong>BR30 Kadaknath Farms</strong>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="owner-about-cta section">
          <div className="container">
            <div className="owner-about-cta-card">
              <div>
                <span className="section-eyebrow">Explore BR30 Farms</span>

                <h2>Discover Our Kadaknath Farm Products</h2>

                <p>Explore our available products or get in touch with us for more information about BR30 Kadaknath Farms.</p>
              </div>

              <div className="owner-about-cta-actions">
                <Link to="/products" className="btn btn-primary">
                  View Products
                  <ArrowRight size={17} />
                </Link>

                <Link to="/contact" className="btn btn-outline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
.owner-about-page{background:var(--bg-page);color:var(--color-text)}
.owner-about-hero{padding:60px 0 95px;background:radial-gradient(circle at 82% 20%,rgba(201,154,61,.12),transparent 28%),linear-gradient(180deg,var(--color-cream) 0%,var(--color-white) 100%);border-bottom:1px solid var(--color-border)}
.owner-about-hero-grid{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(330px,.88fr);align-items:center;gap:70px}
.owner-about-eyebrow{display:inline-block;margin-bottom:14px;color:var(--color-green);font-size:.78rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
.owner-about-hero-content h1{max-width:760px;margin-bottom:22px;color:var(--color-primary);font-size:clamp(2.7rem,5vw,4.6rem);line-height:1.06;letter-spacing:-.055em}
.owner-about-hero-content h1 span{display:block;color:var(--color-green)}
.owner-about-hero-content>p{max-width:700px;margin-bottom:30px;color:#1a120c;font-size:1.05rem;line-height:1.85}
.owner-about-actions{display:flex;flex-wrap:wrap;gap:12px}
.owner-about-image-card{padding:15px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-lg)}
.owner-about-image-wrap{position:relative;overflow:hidden;aspect-ratio:4/4.7;border-radius:calc(var(--radius-xl) - 8px);background:var(--color-cream)}
.owner-about-image-wrap::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(23,32,21,.22) 100%);pointer-events:none}
.owner-about-image-wrap img{width:100%;height:100%;display:block;object-fit:cover;object-position:center}
.owner-about-image-caption{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 8px 5px}
.owner-about-image-caption span{color:var(--color-primary);font-size:.82rem;font-weight:800}
.owner-about-image-caption strong{color:var(--color-green);font-size:.76rem;letter-spacing:.06em;text-transform:uppercase}
.owner-about-story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.owner-about-story-card{padding:30px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm);transition:transform var(--transition-normal),box-shadow var(--transition-normal)}
.owner-about-story-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-md)}
.owner-about-story-card.featured{background:var(--color-green-pale);border-color:rgba(63,107,53,.16)}
.owner-about-story-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:18px;border-radius:14px;background:var(--color-cream);color:var(--color-green)}
.owner-about-story-card.featured .owner-about-story-icon{background:var(--color-white)}
.owner-about-year{display:block;margin-bottom:7px;color:var(--color-gold);font-size:.68rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
.owner-about-story-card h3{margin-bottom:10px;color:var(--color-primary);font-size:1.15rem}
.owner-about-story-card p{color:#1a120c;font-size:.88rem;line-height:1.75}
.owner-about-story-main{display:grid;grid-template-columns:minmax(320px,.78fr) minmax(0,1.22fr);align-items:center;gap:70px}
.owner-about-story-image{overflow:hidden;aspect-ratio:1/1;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}
.owner-about-story-image img{width:100%;height:100%;display:block;object-fit:cover;object-position:center}
.owner-about-story-content h2{max-width:620px;margin-bottom:18px;color:var(--color-primary);font-size:clamp(2rem,4vw,3rem);letter-spacing:-.04em}
.owner-about-story-content>p{max-width:700px;margin-bottom:16px;color:#1a120c;font-size:.94rem;line-height:1.85}
.owner-about-check-list{display:grid;gap:12px;margin-top:26px}
.owner-about-check-list div{display:flex;align-items:center;gap:10px;color:var(--color-primary);font-size:.88rem;font-weight:700}
.owner-about-check-list svg{flex-shrink:0;color:var(--color-green)}
.owner-about-vision{background:var(--color-white)}
.owner-about-vision-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(350px,.75fr);align-items:center;gap:70px}
.owner-about-vision-content h2{margin-bottom:20px;color:var(--color-primary);font-size:clamp(2.1rem,4vw,3.2rem);line-height:1.08;letter-spacing:-.045em}
.owner-about-vision-content>p{max-width:700px;margin-bottom:16px;color:#1a120c;font-size:.94rem;line-height:1.85}
.owner-about-vision-points{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px}
.owner-about-vision-points div{display:flex;align-items:center;gap:9px;padding:13px;border:1px solid var(--color-border);border-radius:12px;background:var(--color-cream);color:var(--color-primary);font-size:.74rem;font-weight:800}
.owner-about-vision-points svg{flex-shrink:0;color:var(--color-green)}
.owner-about-vision-card{position:relative;padding:38px;overflow:hidden;border-radius:var(--radius-xl);background:var(--color-primary);box-shadow:var(--shadow-lg)}
.owner-about-vision-card::before{content:"";position:absolute;width:210px;height:210px;top:-105px;right:-85px;border:1px solid rgba(255,255,255,.1);border-radius:50%}
.owner-about-vision-icon{position:relative;display:grid;place-items:center;width:62px;height:62px;margin-bottom:23px;border-radius:17px;background:rgba(201,154,61,.16);color:var(--color-gold-light)}
.owner-about-vision-card>span{position:relative;color:var(--color-gold-light);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.owner-about-vision-card h3{position:relative;margin:13px 0 15px;color:var(--color-white);font-size:clamp(1.8rem,3vw,2.45rem);line-height:1.15;letter-spacing:-.04em}
.owner-about-vision-card p{position:relative;color:rgba(255,255,255,.85);font-size:.86rem;line-height:1.75}
.owner-about-vision-line{position:relative;width:70px;height:3px;margin-top:28px;border-radius:999px;background:var(--color-gold)}
.owner-about-values-header{display:flex;align-items:end;justify-content:space-between;gap:40px;margin-bottom:45px}
.owner-about-values-header .section-eyebrow{color:var(--color-gold-light)}
.owner-about-values-header h2{color:var(--color-white);font-size:clamp(2rem,4vw,3rem);letter-spacing:-.04em}
.owner-about-values-header>p{max-width:390px;color:rgba(255,255,255,.85);font-size:.9rem;line-height:1.7}
.owner-about-values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.owner-about-value{padding:28px;border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-lg);background:rgba(255,255,255,.04)}
.owner-about-value>svg{margin-bottom:20px;color:var(--color-gold-light)}
.owner-about-value h3{margin-bottom:9px;color:var(--color-white);font-size:1.05rem}
.owner-about-value p{color:rgba(255,255,255,.85);font-size:.82rem;line-height:1.7}
.owner-about-products-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}
.owner-about-product{display:block;padding:16px 14px;border-top:3px solid var(--color-green);border-radius:0 0 var(--radius-lg) var(--radius-lg);background:var(--color-cream);text-decoration:none;transition:transform var(--transition-normal),box-shadow var(--transition-normal)}
.owner-about-product:hover{transform:translateY(-5px);box-shadow:var(--shadow-md)}
.owner-about-product-image{width:100%;aspect-ratio:1/1;overflow:hidden;margin-bottom:15px;border-radius:12px;background:var(--color-white)}
.owner-about-product-image img{width:100%;height:100%;display:block;object-fit:cover;transition:transform var(--transition-normal)}
.owner-about-product:hover .owner-about-product-image img{transform:scale(1.05)}
.owner-about-product>span{display:block;margin-bottom:8px;color:var(--color-gold);font-size:.68rem;font-weight:900;letter-spacing:.1em}
.owner-about-product h3{margin-bottom:8px;color:var(--color-primary);font-size:.9rem;line-height:1.25}
.owner-about-product p{color:#1a120c;font-size:.72rem;line-height:1.6}
.owner-about-message-card{display:grid;grid-template-columns:90px minmax(0,1fr);gap:35px;padding:45px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}
.owner-about-message-mark{display:flex;align-items:flex-start;justify-content:center;color:var(--color-gold);font-family:Georgia,serif;font-size:7rem;line-height:.7}
.owner-about-message-card h2{max-width:720px;margin:7px 0 17px;color:var(--color-primary);font-size:clamp(1.9rem,4vw,2.8rem);letter-spacing:-.04em}
.owner-about-message-card p{max-width:800px;margin-bottom:14px;color:#1a120c;font-size:.92rem;line-height:1.85}
.owner-about-message-card strong{display:block;margin-top:22px;color:var(--color-green);font-size:.82rem}
.owner-about-cta{padding-top:20px}
.owner-about-cta-card{display:flex;align-items:center;justify-content:space-between;gap:40px;padding:42px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-cream)}
.owner-about-cta-card h2{margin:5px 0 10px;color:var(--color-primary);font-size:clamp(1.7rem,3vw,2.4rem);letter-spacing:-.035em}
.owner-about-cta-card p{color:#1a120c;font-size:.88rem}
.owner-about-cta-actions{display:flex;flex-shrink:0;flex-wrap:wrap;gap:10px}
@media(max-width:991px){
.owner-about-hero{padding:70px 0 80px}
.owner-about-hero-grid{grid-template-columns:1fr;gap:40px}
.owner-about-image-card{max-width:620px}
.owner-about-story-grid{grid-template-columns:repeat(2,1fr)}
.owner-about-story-card:last-child{grid-column:1/-1}
.owner-about-story-main{grid-template-columns:1fr;gap:40px}
.owner-about-story-image{max-width:620px}
.owner-about-vision-grid{grid-template-columns:1fr;gap:40px}
.owner-about-vision-card{max-width:620px}
.owner-about-values-header{align-items:start;flex-direction:column;gap:15px}
.owner-about-values-grid{grid-template-columns:1fr}
.owner-about-products-grid{grid-template-columns:repeat(3,1fr)}
.owner-about-cta-card{align-items:flex-start;flex-direction:column}}
@media(max-width:767px){
.owner-about-hero-content h1{font-size:clamp(2.4rem,11vw,3.4rem)}
.owner-about-hero-content>p{font-size:.95rem}
.owner-about-actions{flex-direction:column;align-items:stretch}
.owner-about-actions .btn{width:100%}
.owner-about-image-card{padding:10px}
.owner-about-image-caption{padding:15px 5px 5px}
.owner-about-story-grid{grid-template-columns:1fr}
.owner-about-story-card:last-child{grid-column:auto}
.owner-about-vision-points{grid-template-columns:1fr}
.owner-about-vision-card{padding:28px}
.owner-about-products-grid{grid-template-columns:1fr}
.owner-about-message-card{grid-template-columns:1fr;gap:5px;padding:30px 25px}
.owner-about-message-mark{justify-content:flex-start;height:55px;font-size:5rem}
.owner-about-cta-card{padding:30px 25px}
.owner-about-cta-actions{width:100%;flex-direction:column}
.owner-about-cta-actions .btn{width:100%}
}
@media(max-width:575px){
.owner-about-hero{padding:55px 0 65px}
.owner-about-story-image{aspect-ratio:1/1.05}
.owner-about-image-wrap{aspect-ratio:1/1.15}
.owner-about-image-caption{align-items:flex-start;flex-direction:column;gap:5px}
}
`}</style>
    </>
  );
};
export default OwnerAbout;
