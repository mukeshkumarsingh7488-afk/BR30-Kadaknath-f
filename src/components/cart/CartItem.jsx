import { Minus, Plus, Trash2 } from "lucide-react";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  if (!item) {
    return null;
  }

  const quantity = Number(item.quantity || 0);
  const price = Number(item.price || 0);
  const stock = Number(item.stock || 0);

  const itemTotal = price * quantity;

  const isActive = item.isActive !== false;
  const hasStock = stock > 0;
  const isAvailable = isActive && hasStock;
  const isMaxQuantity = quantity >= stock;

  return (
    <article className="cart-item">
      <div className="cart-item-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="cart-image-placeholder">
            <strong>BR30</strong>
            <span>Kadaknath</span>
          </div>
        )}
      </div>

      <div className="cart-item-content">
        <div className="cart-item-main">
          <div>
            {item.category && <span className="cart-item-category">{item.category}</span>}

            <h2>{item.name}</h2>

            {item.unit && <span className="cart-item-unit">{item.unit}</span>}

            {!isAvailable && <span className="cart-item-unavailable">Currently Unavailable</span>}

            {isAvailable && (
              <span className="cart-item-stock">
                {stock} {item.unit || "units"} available
              </span>
            )}
          </div>

          <button type="button" className="cart-remove-button" onClick={() => onRemove(item)} aria-label={`Remove ${item.name}`}>
            <Trash2 size={18} />
          </button>
        </div>

        <div className="cart-item-bottom">
          <div className="cart-quantity">
            <button type="button" onClick={() => onDecrease(item.id)} disabled={quantity <= 1} aria-label={`Decrease ${item.name} quantity`}>
              <Minus size={16} />
            </button>

            <span>{quantity}</span>

            <button type="button" onClick={() => onIncrease(item.id)} disabled={!isAvailable || isMaxQuantity} aria-label={`Increase ${item.name} quantity`}>
              <Plus size={16} />
            </button>
          </div>

          <div className="cart-item-price">
            <span>
              ₹{price.toLocaleString("en-IN")} × {quantity}
            </span>

            <strong>₹{itemTotal.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>

      <style>{`.cart-item{display:grid;grid-template-columns:150px minmax(0,1fr);gap:22px;padding:20px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-white);box-shadow:var(--shadow-sm)}.cart-item-image{min-height:150px;overflow:hidden;border-radius:var(--radius-md);background:radial-gradient(circle at 50% 30%,rgba(111,143,69,.2),transparent 50%),var(--color-green-pale)}.cart-item-image img{width:100%;height:100%;min-height:150px;object-fit:cover}.cart-image-placeholder{display:flex;width:100%;height:100%;min-height:150px;flex-direction:column;align-items:center;justify-content:center;text-align:center}.cart-image-placeholder strong{color:var(--color-primary);font-size:2rem;font-weight:900;letter-spacing:-.05em}.cart-image-placeholder span{margin-top:5px;color:var(--color-green);font-size:.72rem;font-weight:800;text-transform:uppercase}.cart-item-content{min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:25px}.cart-item-main{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.cart-item-category{display:block;margin-bottom:7px;color:var(--color-green);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.cart-item-main h2{margin-bottom:5px;color:var(--color-primary);font-size:1.2rem}.cart-item-unit{display:block;color:#1a120c;font-size:.82rem}.cart-item-stock{display:block;margin-top:6px;color:var(--color-green);font-size:.74rem;font-weight:800}.cart-item-unavailable{display:inline-block;margin-top:7px;padding:5px 9px;color:var(--color-primary);background:var(--color-gold);border-radius:var(--radius-pill);font-size:.7rem;font-weight:800}.cart-remove-button{display:grid;width:38px;height:38px;flex-shrink:0;place-items:center;border:1px solid var(--color-border);border-radius:50%;background:transparent;color:var(--color-text-soft);transition:background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast)}.cart-remove-button:hover{border-color:var(--color-danger);background:rgba(179,58,50,.08);color:var(--color-danger)}.cart-item-bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.cart-quantity{display:inline-flex;align-items:center;overflow:hidden;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);background:var(--color-white)}.cart-quantity button{display:grid;width:38px;height:38px;place-items:center;border:0;background:transparent;color:var(--color-primary);transition:background var(--transition-fast),color var(--transition-fast),opacity var(--transition-fast)}.cart-quantity button:hover:not(:disabled){background:var(--color-green-pale);color:var(--color-green)}.cart-quantity button:disabled{cursor:not-allowed;opacity:.35}.cart-quantity span{min-width:38px;text-align:center;color:var(--color-primary);font-weight:800}.cart-item-price{display:flex;flex-direction:column;align-items:flex-end;gap:3px}.cart-item-price span{color:#1a120c;font-size:.76rem}.cart-item-price strong{color:var(--color-primary);font-size:1.25rem}@media(max-width:575px){.cart-item{grid-template-columns:95px minmax(0,1fr);gap:14px;padding:14px}.cart-item-image,.cart-item-image img,.cart-image-placeholder{min-height:95px}.cart-image-placeholder strong{font-size:1.4rem}.cart-item-content{gap:18px}.cart-item-main h2{font-size:1rem}.cart-item-bottom{align-items:flex-start;flex-direction:column}.cart-item-price{align-items:flex-start}.cart-remove-button{width:34px;height:34px}}`}</style>
    </article>
  );
};

export default CartItem;
