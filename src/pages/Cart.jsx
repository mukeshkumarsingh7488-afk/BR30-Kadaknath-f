import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ShoppingBag, Truck } from "lucide-react";

import CartItem from "../components/cart/CartItem";
import { useCart } from "../context/CartContext";
import { showConfirm, showError, showSuccess } from "../utils/sweetAlert";

const Cart = () => {
  const { cartItems, cartCount, subtotal, deliveryCharge, total, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();

  const handleRemoveItem = async (item) => {
    const result = await showConfirm({
      title: "Remove Product?",
      text: `${item.name} will be removed from your cart.`,
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    removeFromCart(item.id);

    await showSuccess("Product Removed!", `${item.name} has been removed from your cart.`);
  };

  const handleClearCart = async () => {
    const result = await showConfirm({
      title: "Clear Cart?",
      text: "All products will be removed from your cart.",
      confirmText: "Clear Cart",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    clearCart();

    await showSuccess("Cart Cleared!", "All products have been removed from your cart.");
  };

  const unavailableItems = cartItems.filter((item) => item?.isActive === false || Number(item?.stock || 0) <= 0 || Number(item?.quantity || 0) > Number(item?.stock || 0));

  const canCheckout = unavailableItems.length === 0;

  const handleCheckout = (event) => {
    if (!canCheckout) {
      event.preventDefault();

      showError("Cart Update Required", "One or more products are unavailable or have insufficient stock. Please update your cart before checkout.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={34} />
            </div>

            <span className="section-eyebrow">Your Cart</span>

            <h1>Your Cart Is Empty.</h1>

            <p>Looks like you haven't added any farm products yet. Explore our Kadaknath products and find something you like.</p>

            <Link to="/products" className="btn btn-primary">
              Explore Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <style>{`.cart-page{min-height:70vh;padding:75px 0;background:var(--bg-page)}.empty-cart{max-width:650px;margin:40px auto;text-align:center}.empty-cart-icon{display:grid;width:82px;height:82px;margin:0 auto 25px;place-items:center;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.empty-cart .section-eyebrow{margin-bottom:10px}.empty-cart h1{margin-bottom:14px;color:var(--color-primary);font-size:clamp(2.2rem,5vw,3.5rem)}.empty-cart p{max-width:520px;margin:0 auto 30px;color:var(--color-text-soft);font-size:1rem;line-height:1.75}`}</style>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <Link to="/products" className="cart-back-link">
          <ArrowLeft size={17} />
          Continue Shopping
        </Link>

        <div className="cart-heading">
          <div>
            <span className="section-eyebrow">Shopping Cart</span>

            <h1>Your Farm Cart.</h1>

            <p>Review your selected products before moving to checkout.</p>
          </div>

          <div className="cart-count">
            <ShoppingBag size={18} />

            <span>
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        <div className="cart-layout">
          <div className="cart-items-column">
            <div className="cart-items-header">
              <h2>Selected Products</h2>

              <button type="button" onClick={handleClearCart} className="clear-cart-button">
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} onIncrease={increaseQuantity} onDecrease={decreaseQuantity} onRemove={handleRemoveItem} />
              ))}
            </div>

            {unavailableItems.length > 0 && (
              <div className="cart-stock-warning">
                <strong>Some products need attention.</strong>

                <span>Please check product availability and stock before checkout.</span>
              </div>
            )}
          </div>

          <aside className="cart-summary">
            <div className="summary-header">
              <span>Order Summary</span>
              <ShoppingBag size={20} />
            </div>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>

              <strong>{deliveryCharge === 0 ? "Calculated at checkout" : `₹${deliveryCharge.toLocaleString("en-IN")}`}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <Link to="/checkout" className={`checkout-button ${!canCheckout ? "checkout-disabled" : ""}`} onClick={handleCheckout} aria-disabled={!canCheckout}>
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            <div className="summary-features">
              <div>
                <CheckCircle2 size={17} />
                <span>Farm-focused quality</span>
              </div>

              <div>
                <Truck size={17} />
                <span>Careful local delivery</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`.cart-page{min-height:70vh;padding:48px 0 90px;background:var(--bg-page)}.cart-back-link{display:inline-flex;align-items:center;gap:7px;margin-bottom:34px;color:var(--color-text-soft);font-size:.92rem;font-weight:700;transition:color var(--transition-fast),transform var(--transition-fast)}.cart-back-link:hover{color:var(--color-green);transform:translateX(-3px)}.cart-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:42px}.cart-heading h1{margin-bottom:12px;color:var(--color-primary);font-size:clamp(2.4rem,5vw,4rem);letter-spacing:-.04em}.cart-heading p{color:#1a120c;font-size:1rem}.cart-count{display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border:1px solid var(--color-border);border-radius:var(--radius-pill);background:var(--color-green-pale);color:var(--color-green);font-size:.85rem;font-weight:800;white-space:nowrap}.cart-layout{display:grid;grid-template-columns:minmax(0,1fr) 370px;gap:32px;align-items:start}.cart-items-column{min-width:0}.cart-items-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px}.cart-items-header h2{color:var(--color-primary);font-size:1.2rem}.clear-cart-button{border:0;background:transparent;color:var(--color-danger);font-size:.82rem;font-weight:800}.clear-cart-button:hover{text-decoration:underline}.cart-items-list{display:grid;gap:15px}.cart-stock-warning{display:flex;flex-direction:column;gap:4px;margin-top:15px;padding:14px 16px;border:1px solid var(--color-gold);border-radius:var(--radius-md);background:var(--color-gold-light)}.cart-stock-warning strong{color:var(--color-primary);font-size:.84rem}.cart-stock-warning span{color:#1a120c;font-size:.78rem;line-height:1.5}.cart-summary{position:sticky;top:110px;padding:24px;border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-md)}.summary-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;color:var(--color-primary);font-size:1.05rem;font-weight:800}.summary-header svg{color:var(--color-green)}.summary-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:10px 0}.summary-row span{color:#1a120c;font-size:.88rem}.summary-row strong{color:var(--color-primary);font-size:.9rem;text-align:right}.summary-divider{height:1px;margin:14px 0;background:var(--color-border)}.summary-total{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}.summary-total span{color:var(--color-primary);font-weight:800}.summary-total strong{color:var(--color-primary);font-size:1.5rem}.checkout-button{display:flex;min-height:52px;align-items:center;justify-content:center;gap:8px;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.checkout-button:hover{transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.checkout-button.checkout-disabled{opacity:.55;cursor:not-allowed}.summary-features{display:grid;gap:10px;margin-top:20px;padding-top:18px;border-top:1px solid var(--color-border)}.summary-features div{display:flex;align-items:center;gap:8px;color:#1a120c;font-size:.78rem}.summary-features svg{flex-shrink:0;color:var(--color-green)}.empty-cart{max-width:650px;margin:40px auto;text-align:center}.empty-cart-icon{display:grid;width:82px;height:82px;margin:0 auto 25px;place-items:center;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.empty-cart .section-eyebrow{margin-bottom:10px}.empty-cart h1{margin-bottom:14px;color:var(--color-primary);font-size:clamp(2.2rem,5vw,3.5rem)}.empty-cart p{max-width:520px;margin:0 auto 30px;color:#1a120c;font-size:1rem;line-height:1.75}@media(max-width:991px){.cart-layout{grid-template-columns:1fr}.cart-summary{position:static}}@media(max-width:575px){.cart-page{padding:32px 0 65px}.cart-heading{align-items:flex-start;flex-direction:column;margin-bottom:30px}.cart-heading h1{font-size:2.4rem}.cart-summary{padding:20px}}`}</style>
    </section>
  );
};

export default Cart;
