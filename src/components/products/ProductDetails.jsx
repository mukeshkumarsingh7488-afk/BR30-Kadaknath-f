import { useState } from "react";
import { Link } from "react-router-dom";
import { showSuccess, showError } from "../../utils/sweetAlert";
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Leaf } from "lucide-react";

const ProductDetails = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <section className="product-details-section">
        <div className="container">
          <div className="product-not-found">
            <span>Product Not Found</span>
            <h1>We couldn't find this product.</h1>
            <p>The product may have been removed or is currently unavailable.</p>
            <Link to="/products" className="btn btn-primary">
              <ArrowLeft size={18} />
              Back to Products
            </Link>
          </div>
        </div>
        <style>{`.product-details-section{min-height:70vh;padding:70px 0;background:var(--bg-page);display:flex;align-items:center}.product-not-found{max-width:600px;margin:0 auto;text-align:center}.product-not-found span{display:inline-block;margin-bottom:12px;color:var(--color-green);font-size:.8rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.product-not-found h1{margin-bottom:14px;color:var(--color-primary);font-size:clamp(2rem,5vw,3rem)}.product-not-found p{margin-bottom:28px;color:var(--color-text-soft)}`}</style>
      </section>
    );
  }

  const { name, shortDescription, description, price, unit, image, badge, category, stock = 0, isActive = true } = product;

  const numericStock = Number(stock || 0);
  const available = Boolean(isActive) && numericStock > 0;
  const maxQuantity = Math.max(1, numericStock);
  const totalPrice = Number(price || 0) * quantity;

  const decreaseQuantity = () => {
    if (!available) return;
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (!available) return;
    setQuantity((current) => Math.min(maxQuantity, current + 1));
  };

  const handleAddToCart = () => {
    if (!available) {
      showError("Out of Stock", "This product is currently out of stock.");
      return;
    }

    if (quantity > numericStock) {
      showError("Stock Limit", `Only ${numericStock} ${unit || "unit"} available in stock.`);
      setQuantity(Math.max(1, numericStock));
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        ...product,
        quantity,
      });

      showSuccess("Added to Cart!", `${product.name} has been added to your cart.`);
    }
  };

  return (
    <section className="product-details-section">
      <div className="container">
        <Link to="/products" className="back-products">
          <ArrowLeft size={17} />
          Back to Products
        </Link>

        <div className="product-details-layout">
          <div className="product-details-media">
            <div className="product-main-image">
              {image ? (
                <img src={image} alt={name} />
              ) : (
                <div className="product-main-placeholder">
                  <div className="placeholder-brand">BR30</div>
                  <div className="placeholder-product">Kadaknath</div>
                  <span>Farm Fresh</span>
                </div>
              )}

              {badge && <span className="details-badge">{badge}</span>}

              {!available && <span className="details-unavailable">Out of Stock</span>}
            </div>

            <div className="media-trust-row">
              <div>
                <Leaf size={18} />
                <span>Farm Raised</span>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>Quality Focused</span>
              </div>

              <div>
                <Truck size={18} />
                <span>Careful Delivery</span>
              </div>
            </div>
          </div>

          <div className="product-details-content">
            {category && <span className="details-category">{category}</span>}

            <h1>{name}</h1>

            <p className="details-short-description">{shortDescription || description}</p>

            <div className="details-price">
              <strong>₹{Number(price || 0).toLocaleString("en-IN")}</strong>

              {unit && <span> / {unit}</span>}
            </div>

            {available && (
              <div className="stock-info">
                <CheckCircle2 size={16} />
                <span>
                  {numericStock} {unit || "units"} available
                </span>
              </div>
            )}

            {!available && <div className="out-of-stock-info">Out of Stock</div>}

            <div className="details-divider" />

            <div className="details-info">
              <div className="details-info-item">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Farm Fresh</strong>
                  <span>Carefully handled at our farm</span>
                </div>
              </div>

              <div className="details-info-item">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Quality Care</strong>
                  <span>Selected with care before delivery</span>
                </div>
              </div>

              <div className="details-info-item">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Local Delivery</strong>
                  <span>Delivery available in selected areas</span>
                </div>
              </div>
            </div>

            <div className="details-purchase">
              <div className="quantity-control">
                <button type="button" onClick={decreaseQuantity} disabled={!available || quantity <= 1} aria-label="Decrease quantity">
                  <Minus size={17} />
                </button>

                <span>{quantity}</span>

                <button type="button" onClick={increaseQuantity} disabled={!available || quantity >= maxQuantity} aria-label="Increase quantity">
                  <Plus size={17} />
                </button>
              </div>

              <div className="purchase-total">
                <span>Total</span>
                <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className="details-actions">
              <button type="button" className="details-cart-button" onClick={handleAddToCart} disabled={!available}>
                <ShoppingCart size={19} />
                {available ? "Add to Cart" : "Out of Stock"}
              </button>

              <button type="button" className="details-buy-button" disabled={!available}>
                {available ? "Buy Now" : "Out of Stock"}
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="delivery-note">
              <Truck size={20} />

              <div>
                <strong>Delivery Information</strong>

                <p>Delivery availability depends on your location and current farm stock. We will confirm the order before dispatch.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="product-description-section">
          <div className="section-heading">
            <span className="section-eyebrow">Product Information</span>

            <h2>About {name}.</h2>

            <p>{description || `Learn more about our ${name} and how we carefully handle it at BR30 Kadaknath Farms.`}</p>
          </div>

          <div className="product-information-grid">
            <div className="information-card">
              <div className="information-icon">
                <Leaf size={22} />
              </div>

              <h3>Farm Focused</h3>

              <p>We focus on responsible farm practices and careful handling throughout the process.</p>
            </div>

            <div className="information-card">
              <div className="information-icon">
                <ShieldCheck size={22} />
              </div>

              <h3>Quality Care</h3>

              <p>Products are checked and prepared with attention to cleanliness and quality.</p>
            </div>

            <div className="information-card">
              <div className="information-icon">
                <Truck size={22} />
              </div>

              <h3>Careful Delivery</h3>

              <p>Orders are prepared carefully before being sent for delivery to the selected service area.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`.product-details-section{padding:48px 0 90px;background:var(--bg-page)}.back-products{display:inline-flex;align-items:center;gap:7px;margin-bottom:34px;color:#1a120c;font-size:.92rem;font-weight:700;transition:color var(--transition-fast),transform var(--transition-fast)}.back-products:hover{color:var(--color-green);transform:translateX(-3px)}.product-details-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:64px;align-items:start}.product-details-media{position:sticky;top:110px}.product-main-image{position:relative;min-height:520px;overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:radial-gradient(circle at 50% 25%,rgba(111,143,69,.2),transparent 42%),linear-gradient(145deg,var(--color-green-pale),var(--color-cream));box-shadow:var(--shadow-md)}.product-main-image img{width:100%;height:100%;min-height:520px;object-fit:cover}.product-main-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.placeholder-brand{color:var(--color-primary);font-size:clamp(4rem,8vw,7rem);font-weight:900;line-height:.95;letter-spacing:-.06em}.placeholder-product{margin-top:14px;color:var(--color-green);font-size:clamp(1.5rem,3vw,2.3rem);font-weight:800}.product-main-placeholder span{margin-top:10px;color:#1a120c;font-size:.85rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.details-badge,.details-unavailable{position:absolute;top:20px;z-index:2;padding:8px 13px;border-radius:var(--radius-pill);font-size:.78rem;font-weight:800}.details-badge{left:20px;background:var(--color-gold);color:var(--color-primary)}.details-unavailable{right:20px;background:var(--color-primary);color:var(--color-white)}.media-trust-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.media-trust-row div{display:flex;align-items:center;justify-content:center;gap:7px;min-height:46px;padding:8px 10px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-white);color:#1a120c;font-size:.78rem;font-weight:700}.media-trust-row svg{flex-shrink:0;color:var(--color-green)}.details-category{display:inline-block;margin-bottom:12px;color:var(--color-green);font-size:.8rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.product-details-content h1{max-width:650px;margin-bottom:16px;color:var(--color-primary);font-size:clamp(2.2rem,5vw,4rem);line-height:1.08;letter-spacing:-.035em}.details-short-description{max-width:650px;color:#1a120c;font-size:1.05rem;line-height:1.8}.details-price{display:flex;align-items:baseline;gap:4px;margin-top:28px}.details-price strong{color:var(--color-primary);font-size:2rem;line-height:1}.details-price span{color:#1a120c;font-size:.95rem;font-weight:600}.stock-info{display:flex;align-items:center;gap:6px;margin-top:12px;color:var(--color-green);font-size:.82rem;font-weight:800}.stock-info svg{flex-shrink:0}.out-of-stock-info{display:inline-flex;margin-top:12px;padding:7px 11px;color:var(--color-primary);background:var(--color-gold);border-radius:var(--radius-pill);font-size:.78rem;font-weight:800}.details-divider{height:1px;margin:28px 0;background:var(--color-border)}.details-info{display:grid;gap:14px}.details-info-item{display:flex;align-items:flex-start;gap:12px}.details-info-item>svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.details-info-item div{display:flex;flex-direction:column;gap:2px}.details-info-item strong{color:var(--color-primary);font-size:.92rem}.details-info-item span{color:#1a120c;font-size:.82rem}.details-purchase{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:32px;padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--bg-soft)}.quantity-control{display:inline-flex;align-items:center;overflow:hidden;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);background:var(--color-white)}.quantity-control button{display:grid;width:42px;height:42px;place-items:center;border:0;background:transparent;color:var(--color-primary)}.quantity-control button:hover:not(:disabled){background:var(--color-green-pale);color:var(--color-green)}.quantity-control button:disabled{cursor:not-allowed;opacity:.4}.quantity-control span{min-width:38px;text-align:center;color:var(--color-primary);font-weight:800}.purchase-total{display:flex;flex-direction:column;align-items:flex-end;gap:2px}.purchase-total span{color:#1a120c;font-size:.76rem;font-weight:700;text-transform:uppercase}.purchase-total strong{color:var(--color-primary);font-size:1.35rem}.details-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.details-cart-button,.details-buy-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 20px;border-radius:var(--radius-pill);font-weight:800}.details-cart-button{border:1px solid var(--color-green);background:var(--color-green);color:var(--color-white)}.details-cart-button:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.details-buy-button{border:1px solid var(--color-gold);background:var(--color-gold);color:var(--color-primary)}.details-buy-button:hover:not(:disabled){transform:translateY(-2px);background:var(--color-gold-light);box-shadow:var(--shadow-md)}.details-cart-button:disabled,.details-buy-button:disabled{cursor:not-allowed;opacity:.5}.delivery-note{display:flex;align-items:flex-start;gap:12px;margin-top:18px;padding:17px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-white)}.delivery-note>svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.delivery-note strong{display:block;margin-bottom:3px;color:var(--color-primary);font-size:.9rem}.delivery-note p{color:#1a120c;font-size:.8rem;line-height:1.6}.product-description-section{margin-top:100px;padding-top:80px;border-top:1px solid var(--color-border)}.product-information-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.information-card{padding:28px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.information-icon{display:grid;width:48px;height:48px;margin-bottom:20px;place-items:center;border-radius:14px;background:var(--color-green-pale);color:var(--color-green)}.information-card h3{margin-bottom:8px;color:var(--color-primary);font-size:1.05rem}.information-card p{color:#1a120c;font-size:.9rem;line-height:1.7}.product-not-found{max-width:600px;margin:0 auto;text-align:center}.product-not-found span{display:inline-block;margin-bottom:12px;color:var(--color-green);font-size:.8rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.product-not-found h1{margin-bottom:14px;color:var(--color-primary);font-size:clamp(2rem,5vw,3rem)}.product-not-found p{margin-bottom:28px;color:#1a120c}@media(max-width:991px){.product-details-layout{grid-template-columns:1fr;gap:42px}.product-details-media{position:static}.product-main-image,.product-main-image img{min-height:460px}}@media(max-width:767px){.product-details-section{padding:32px 0 65px}.product-main-image,.product-main-image img{min-height:360px}.media-trust-row{grid-template-columns:1fr}.media-trust-row div{justify-content:flex-start}.product-details-content h1{font-size:2.35rem}.details-purchase{align-items:flex-start}.details-actions{grid-template-columns:1fr}.product-description-section{margin-top:65px;padding-top:55px}.product-information-grid{grid-template-columns:1fr}}@media(max-width:480px){.details-purchase{flex-direction:column}.purchase-total{align-items:flex-start}.quantity-control{width:100%;justify-content:space-between}.quantity-control button{width:48px}}`}</style>
    </section>
  );
};

export default ProductDetails;
