import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";

import { useCart } from "../../context/CartContext";
import { showSuccess, showError } from "../../utils/sweetAlert";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) {
    return null;
  }

  const { id, slug, name, shortDescription, description, price, unit, image, badge, category, stock = 0, isActive = true } = product;

  const productSlug = slug || id;
  const available = Boolean(isActive) && Number(stock) > 0;

  const handleAddToCart = () => {
    if (!available) {
      showError("Out of Stock", `${name} is currently out of stock.`);
      return;
    }

    addToCart(product, 1);

    showSuccess("Added to Cart!", `${name} has been added to your cart.`);
  };

  return (
    <article className="product-card">
      <Link to={`/products/${productSlug}`} className="product-image-wrapper" aria-label={`View ${name}`}>
        {image ? (
          <img src={image} alt={name} className="product-image" loading="lazy" />
        ) : (
          <div className="product-image-placeholder">
            <span>BR30</span>
            <small>Farm Fresh</small>
          </div>
        )}

        {badge && <span className="product-badge">{badge}</span>}
      </Link>

      <div className="product-content">
        {category && <span className="product-category">{category}</span>}

        <Link to={`/products/${productSlug}`} className="product-title-link">
          <h3>{name}</h3>
        </Link>

        <p className="product-description">{shortDescription || description}</p>

        <div className="product-bottom">
          <div className="product-price">
            <strong>₹{Number(price || 0).toLocaleString("en-IN")}</strong>

            {unit && <span> / {unit}</span>}
          </div>

          {!available && <span className="product-unavailable">Out of Stock</span>}

          <Link to={`/products/${productSlug}`} className="product-view-button" aria-label={`View ${name}`}>
            <span>View</span>
            <ArrowRight size={17} />
          </Link>
        </div>

        <button type="button" className="product-cart-button" disabled={!available} onClick={handleAddToCart}>
          <ShoppingCart size={17} />
          {available ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      <style>{`.product-card{display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);transition:transform var(--transition-normal),box-shadow var(--transition-normal),border-color var(--transition-normal)}.product-card:hover{transform:translateY(-5px);border-color:var(--color-border-dark);box-shadow:var(--shadow-md)}.product-image-wrapper{position:relative;display:block;aspect-ratio:4 / 3;overflow:hidden;background:var(--color-green-pale)}.product-image{width:100%;height:100%;object-fit:cover;transition:transform var(--transition-slow)}.product-card:hover .product-image{transform:scale(1.04)}.product-image-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:var(--color-primary);background:radial-gradient(circle at 30% 30%,rgba(111,143,69,.18),transparent 40%),var(--color-green-pale)}.product-image-placeholder span{font-size:1.8rem;font-weight:900;letter-spacing:.08em}.product-image-placeholder small{margin-top:4px;color:#1a120c;font-size:.72rem;font-weight:700}.product-badge{position:absolute;top:14px;left:14px;padding:6px 11px;color:var(--color-primary);background:var(--color-gold);border-radius:var(--radius-pill);font-size:.7rem;font-weight:800}.product-content{display:flex;flex:1;flex-direction:column;padding:23px}.product-category{display:inline-block;margin-bottom:7px;color:var(--color-green);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.product-title-link{color:var(--color-primary)}.product-title-link h3{margin-bottom:9px;font-size:1.2rem;transition:color var(--transition-fast)}.product-title-link:hover h3{color:var(--color-green)}.product-description{display:-webkit-box;margin-bottom:20px;overflow:hidden;color:#1a120c;font-size:.86rem;line-height:1.65;-webkit-box-orient:vertical;-webkit-line-clamp:2}.product-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;margin-bottom:15px}.product-price{display:flex;align-items:baseline;gap:3px;white-space:nowrap}.product-price strong{color:var(--color-primary);font-size:1.2rem}.product-price span{color:#1a120c;font-size:.75rem}.product-unavailable{display:inline-flex;align-items:center;justify-content:center;padding:6px 9px;color:#b42318;background:#fff0ee;border:1px solid #f5c2bd;border-radius:var(--radius-pill);font-size:.7rem;font-weight:800;text-align:center;white-space:nowrap}.product-view-button{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-size:.8rem;font-weight:800;white-space:nowrap}.product-view-button:hover{color:var(--color-primary)}.product-cart-button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:43px;padding:0 15px;color:var(--color-white);background:var(--color-green);border:1px solid var(--color-green);border-radius:var(--radius-pill);font-size:.82rem;font-weight:800;transition:background var(--transition-fast),transform var(--transition-fast),box-shadow var(--transition-fast)}.product-cart-button:hover:not(:disabled){background:var(--color-primary);border-color:var(--color-primary);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.product-cart-button:disabled{cursor:not-allowed;opacity:.55}@media (max-width:575px){.product-content{padding:20px}.product-title-link h3{font-size:1.1rem}.product-bottom{align-items:center;gap:8px}.product-unavailable{font-size:.65rem;padding:5px 7px}.product-view-button{font-size:.75rem}}`}</style>
    </article>
  );
};

export default ProductCard;
