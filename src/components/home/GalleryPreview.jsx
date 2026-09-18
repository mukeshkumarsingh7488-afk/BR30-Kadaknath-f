import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Camera, Egg, Leaf, MapPin } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    title: "Our Farm",
    label: "Farm Life",
    icon: Leaf,
    className: "gallery-item-large",
    images: [
      "/images/gallery-farm.png",
      "/images/gallery-farm2.png",
      "/images/gallery-farm3.png",
      "/images/gallery-farm4.png",
      "/images/gallery-farm5.png",
      "/images/gallery-farm6.png",
      "/images/gallery-farm7.png",
      "/images/gallery-farm8.png",
      "/images/gallery-farm9.png",
      "/images/gallery-farm10.png",
    ],
    alt: "BR30 Kadaknath Farms farm environment",
  },
  {
    id: 2,
    title: "Kadaknath Birds",
    label: "Our Birds",
    icon: Leaf,
    className: "gallery-item-tall",
    images: [
      "/images/gallery-birds.png",
      "/images/gallery-birds2.png",
      "/images/gallery-birds3.png",
      "/images/gallery-birds4.png",
      "/images/gallery-birds5.png",
      "/images/gallery-birds6.png",
      "/images/gallery-birds7.png",
      "/images/gallery-birds8.png",
      "/images/gallery-birds9.png",
      "/images/gallery-birds10.png",
    ],
    alt: "Kadaknath birds at BR30 Kadaknath Farms",
  },
  {
    id: 3,
    title: "Farm Fresh Eggs",
    label: "Fresh Products",
    icon: Egg,
    className: "gallery-item-small",
    images: [
      "/images/gallery-eggs.png",
      "/images/gallery-eggs2.png",
      "/images/gallery-eggs3.png",
      "/images/gallery-eggs4.png",
      "/images/gallery-eggs5.png",
      "/images/gallery-eggs6.png",
      "/images/gallery-eggs7.png",
      "/images/gallery-eggs8.png",
      "/images/gallery-eggs9.png",
      "/images/gallery-eggs10.png",
    ],
    alt: "Fresh Kadaknath eggs from BR30 Kadaknath Farms",
  },
  {
    id: 4,
    title: "Daily Farm Care",
    label: "Farm Routine",
    icon: Leaf,
    className: "gallery-item-small",
    images: [
      "/images/gallery-farm-care.png",
      "/images/gallery-farm-care2.png",
      "/images/gallery-farm-care3.png",
      "/images/gallery-farm-care4.png",
      "/images/gallery-farm-care5.png",
      "/images/gallery-farm-care6.png",
      "/images/gallery-farm-care7.png",
      "/images/gallery-farm-care8.png",
      "/images/gallery-farm-care9.png",
      "/images/gallery-farm-care10.png",
    ],
    alt: "Daily farm care at BR30 Kadaknath Farms",
  },
];

const GalleryPreview = () => {
  const [currentImages, setCurrentImages] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const handleNextImage = (galleryId, totalImages) => {
    setCurrentImages((prev) => ({
      ...prev,
      [galleryId]: (prev[galleryId] + 1) % totalImages,
    }));
  };
  return (
    <section className="gallery-preview section" id="farm-gallery">
      <div className="container">
        <div className="gallery-header">
          <div className="section-heading">
            <span className="section-eyebrow">
              <Camera size={15} />
              Farm Gallery
            </span>

            <h2>
              A Glimpse Into
              <span> Our Farm.</span>
            </h2>

            <p>Take a look at the people, birds, products and everyday moments behind BR30 Kadaknath Farms.</p>
          </div>

          <div className="gallery-location">
            <span className="gallery-location-icon">
              <MapPin size={17} />
            </span>

            <div>
              <strong>BR30 Kadaknath Farms</strong>
              <span>Our farm. Our work. Our story.</span>
            </div>
          </div>
        </div>

        <div className="gallery-grid">
          {galleryItems.map((item) => {
            const currentIndex = currentImages[item.id];

            return (
              <div className={`gallery-item ${item.className}`} key={item.id}>
                <div className="gallery-art">
                  <img src={item.images[currentIndex]} alt={item.alt} className="gallery-image" />

                  <div className="gallery-overlay" />
                </div>

                <div className="gallery-caption">
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                  </div>

                  <button type="button" className="gallery-arrow" onClick={() => handleNextImage(item.id, item.images.length)} aria-label={`Next ${item.title} image`}>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="gallery-bottom">
          <div className="gallery-bottom-text">
            <Camera size={19} />

            <span>More farm moments will be added as we grow.</span>
          </div>

          <Link to="/about-farm" className="gallery-link">
            Explore Our Farm
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <style>{`.gallery-preview{position:relative;overflow:hidden;background:var(--bg-soft)}.gallery-header{display:flex;align-items:flex-end;justify-content:space-between;gap:35px;margin-bottom:45px}.gallery-header .section-heading{margin-bottom:0}.gallery-header .section-eyebrow{display:inline-flex;align-items:center;gap:7px}.gallery-header h2 span{color:var(--color-green)}.gallery-header .section-heading p{color:#1a120c}.gallery-location{min-width:270px;display:flex;align-items:center;gap:11px;padding:13px 15px;border:1px solid var(--color-border);border-radius:15px;background:var(--color-white);box-shadow:var(--shadow-sm)}.gallery-location-icon{width:38px;height:38px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:11px;background:var(--color-green-pale);color:var(--color-green)}.gallery-location>div{display:flex;flex-direction:column}.gallery-location strong{color:var(--color-primary);font-size:.76rem}.gallery-location span:last-child{margin-top:2px;color:#1a120c;font-size:.66rem}.gallery-grid{display:grid;grid-template-columns:1.25fr .75fr .75fr;grid-template-rows:245px 245px;gap:18px}.gallery-item{position:relative;overflow:hidden;min-width:0;border:1px solid rgba(23,32,21,.08);border-radius:22px;background:var(--color-green-pale);box-shadow:var(--shadow-sm)}.gallery-item-large{grid-row:1/3}.gallery-item-tall{grid-row:1/3}.gallery-art{position:absolute;inset:0;overflow:hidden;background:var(--color-green-pale);transition:transform var(--transition-slow)}.gallery-image{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover;object-position:center;transform:none;transition:transform var(--transition-slow)}.gallery-overlay{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(to top,rgba(23,32,21,.72) 0%,rgba(23,32,21,.22) 35%,transparent 65%)}.gallery-caption{position:absolute;z-index:5;left:17px;right:17px;bottom:15px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px}.gallery-caption>div{display:flex;flex-direction:column}.gallery-caption span:first-child{color:rgba(255,255,255,.85);font-size:.59rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.gallery-caption strong{margin-top:3px;color:var(--color-white);font-size:.88rem}.gallery-arrow{width:34px;height:34px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:0;border:none;cursor:pointer;border-radius:50%;background:rgba(255,255,255,.9);color:var(--color-primary);transition:transform var(--transition-fast),background var(--transition-fast)}.gallery-item:hover .gallery-image{transform:scale(1.025)}.gallery-item:hover .gallery-arrow{transform:translateX(3px);background:var(--color-gold-light)}.gallery-bottom{margin-top:25px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white)}.gallery-bottom-text{display:inline-flex;align-items:center;gap:9px;color:#1a120c;font-size:.74rem}.gallery-bottom-text svg{color:var(--color-green)}.gallery-link{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;min-height:43px;padding:0 17px;border-radius:var(--radius-pill);background:var(--color-primary);color:var(--color-white);font-size:.78rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast)}.gallery-link:hover{transform:translateY(-2px);background:var(--color-green)}@media (max-width:900px){.gallery-header{align-items:flex-start;flex-direction:column}.gallery-location{min-width:0}.gallery-grid{grid-template-columns:1fr 1fr;grid-template-rows:250px 250px 250px}.gallery-item-large{grid-column:1/3;grid-row:auto}.gallery-item-tall{grid-column:auto;grid-row:auto}.gallery-item-small{grid-column:auto;grid-row:auto}}@media (max-width:575px){.gallery-header{margin-bottom:32px}.gallery-grid{grid-template-columns:1fr;grid-template-rows:repeat(4,245px);gap:13px}.gallery-item-large,.gallery-item-tall,.gallery-item-small{grid-column:auto;grid-row:auto}.gallery-location{width:100%}.gallery-bottom{align-items:stretch;flex-direction:column}.gallery-link{width:100%;justify-content:center}}`}</style>
    </section>
  );
};

export default GalleryPreview;
