import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

import products from "../../data/products";

const previewProducts = [
  {
    id: "kadaknath-eggs",
    description: "Farm-fresh Kadaknath eggs, carefully collected and packed for your table.",
    priceLabel: "Fresh Farm Product",
    className: "product-card-eggs",
  },
  {
    id: "kadaknath-chicken",
    description: "Naturally raised Kadaknath chicken from our farm, prepared with care.",
    priceLabel: "Farm Raised",
    className: "product-card-chicken",
  },
  {
    id: "kadaknath-chicks",
    description: "Healthy Kadaknath chicks for farmers, breeders and backyard poultry.",
    priceLabel: "Available Soon",
    className: "product-card-chicks",
  },
];

const ProductsPreview = () => {
  const featuredProducts = previewProducts
    .map((previewProduct) => {
      const product = products.find((item) => item.id === previewProduct.id);

      if (!product) return null;

      return {
        ...product,
        description: previewProduct.description,
        priceLabel: previewProduct.priceLabel,
        className: previewProduct.className,
        path: `/products/${product.slug}`,
      };
    })
    .filter(Boolean);

  return (
    <section className="products-preview section" id="products">
      <div className="container">
        <div className="section-heading products-heading">
          <span className="section-eyebrow">Our Farm Products</span>

          <h2>
            From Our Farm,
            <span> To Your Table.</span>
          </h2>

          <p>Explore our range of naturally raised Kadaknath products, prepared with care and brought to you from our farm.</p>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product) => (
            <Link to={product.path} className={`product-card ${product.className}`} key={product.id} aria-label={`Explore ${product.name}`}>
              <div className="product-card-visual">
                <div className="product-image-wrap1">
                  <img src={product.image} alt={product.name} className="product-image" />
                </div>

                <span className="product-badge">{product.priceLabel}</span>
              </div>

              <div className="product-card-content">
                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <span className="product-card-link">
                  Explore Product
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="products-bottom">
          <div className="products-bottom-info">
            <span className="products-bottom-icon">
              <ShoppingBag size={20} />
            </span>

            <div>
              <strong>Looking for something specific?</strong>

              <span>Explore our complete range of farm products.</span>
            </div>
          </div>

          <Link to="/products" className="products-all-link">
            View All Products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <style>{`.products-preview{position:relative;overflow:hidden;background:var(--color-white)}.products-heading{max-width:720px}.products-heading h2 span{color:var(--color-green)}.products-heading p{color:#1a120c}.products-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.product-card{position:relative;min-width:0;overflow:hidden;display:flex;flex-direction:column;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-sm);color:inherit;text-decoration:none;transition:transform var(--transition-normal),box-shadow var(--transition-normal),border-color var(--transition-normal)}.product-card:hover{transform:translateY(-7px);border-color:var(--color-border-dark);box-shadow:var(--shadow-lg)}.product-card-visual{position:relative;width:100%;height:265px;flex:0 0 265px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:var(--radius-xl) var(--radius-xl) 0 0}.product-card-eggs .product-card-visual{background:linear-gradient(145deg,#f5ecd9 0%,#e8d7ad 100%)}.product-card-chicken .product-card-visual{background:linear-gradient(145deg,#dce7d2 0%,#aebf96 100%)}.product-card-chicks .product-card-visual{background:linear-gradient(145deg,#f1e8d8 0%,#d8c8ad 100%)}.product-image-wrap1{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}.product-image{display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;object-position:center;margin:0 auto;transition:transform var(--transition-normal),filter var(--transition-normal)}.product-card:hover .product-image{transform:scale(1.035);filter:drop-shadow(0 18px 22px rgba(23,32,21,.16))}.product-badge{position:absolute;top:17px;left:17px;z-index:4;display:inline-flex;align-items:center;justify-content:center;min-height:30px;padding:0 11px;border-radius:var(--radius-pill);background:rgba(23,32,21,.84);color:var(--color-white);font-size:.67rem;font-weight:800;letter-spacing:.02em;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);pointer-events:none}.product-card-content{flex:1;display:flex;flex-direction:column;padding:24px 24px 26px}.product-card-content h3{margin-bottom:9px;color:var(--color-primary);font-size:1.3rem;font-weight:800;line-height:1.25}.product-card-content p{min-height:72px;margin-bottom:19px;color:#1a120c;font-size:.89rem;line-height:1.7}.product-card-link{width:fit-content;display:inline-flex;align-items:center;gap:7px;margin-top:auto;color:var(--color-green);font-size:.84rem;font-weight:800;transition:gap var(--transition-fast),color var(--transition-fast)}.product-card:hover .product-card-link{gap:11px;color:var(--color-primary)}.products-bottom{margin-top:32px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--bg-soft)}.products-bottom-info{display:flex;align-items:center;gap:12px}.products-bottom-icon{width:42px;height:42px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:12px;background:var(--color-white);color:var(--color-green);box-shadow:var(--shadow-sm)}.products-bottom-info>div{display:flex;flex-direction:column}.products-bottom-info strong{color:var(--color-primary);font-size:.86rem}.products-bottom-info span{margin-top:2px;color:#1a120c;font-size:.75rem}.products-all-link{flex:0 0 auto;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 17px;border:1px solid var(--color-primary);border-radius:var(--radius-pill);color:var(--color-primary);font-size:.8rem;font-weight:800;transition:background var(--transition-fast),color var(--transition-fast),transform var(--transition-fast)}.products-all-link:hover{background:var(--color-primary);color:var(--color-white);transform:translateY(-2px)}@media (max-width:900px){.products-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.product-card:last-child{grid-column:1/-1;width:min(100%,430px);margin-inline:auto}}@media (max-width:575px){.products-grid{grid-template-columns:1fr;gap:18px}.product-card-visual{height:235px;flex-basis:235px;border-radius:var(--radius-xl) var(--radius-xl) 0 0}.product-image{max-width:100%;max-height:100%;object-fit:contain;object-position:center}.product-card-content{padding:21px 20px 24px}.product-card-content h3{font-size:1.18rem}.product-card-content p{min-height:auto}.product-card:last-child{grid-column:auto;width:100%}.products-bottom{flex-direction:column;align-items:stretch}.products-bottom-info{align-items:flex-start}.products-all-link{width:100%;justify-content:center}}`}</style>
    </section>
  );
};

export default ProductsPreview;
