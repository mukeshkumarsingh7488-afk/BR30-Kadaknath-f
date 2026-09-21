import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, MapPin, Phone, ShoppingBag, User } from "lucide-react";

import { useCart } from "../context/CartContext";
import { showConfirm, showError } from "../utils/sweetAlert";
import apiRequest from "../api/api";

const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, cartCount, subtotal, deliveryCharge, total, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    instructions: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const paytmScriptRef = useRef(null);
  const paymentStartedRef = useRef(false);

  const unavailableItems = cartItems.filter((item) => {
    const stock = Number(item?.stock || 0);
    const quantity = Number(item?.quantity || 0);

    return item?.isActive === false || stock <= 0 || quantity > stock;
  });

  const canPlaceOrder = unavailableItems.length === 0;

  /*
  |--------------------------------------------------------------------------
  | Cleanup Paytm script
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (paytmScriptRef.current) {
        paytmScriptRef.current.remove();
        paytmScriptRef.current = null;
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Form Validation
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Please enter your delivery address.";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "Please enter your city.";
    }

    if (!formData.state.trim()) {
      nextErrors.state = "Please enter your state.";
    }

    if (!formData.pincode.trim()) {
      nextErrors.pincode = "Please enter your pincode.";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      nextErrors.pincode = "Please enter a valid 6-digit pincode.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | Stock Validation
  |--------------------------------------------------------------------------
  */

  const validateStock = async () => {
    if (canPlaceOrder) {
      return true;
    }

    await showError("Stock Update Required", "One or more products are unavailable or have insufficient stock. Please go back to your cart and update it.");

    return false;
  };

  /*
  |--------------------------------------------------------------------------
  | Load Paytm Checkout JS
  |--------------------------------------------------------------------------
  */

  const loadPaytmScript = (mid, environment = "staging") => {
    return new Promise((resolve, reject) => {
      if (!mid) {
        reject(new Error("Paytm merchant ID is missing."));
        return;
      }

      if (window.Paytm && window.Paytm.CheckoutJS) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[data-paytm-checkout="true"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });

        existingScript.addEventListener("error", () => reject(new Error("Unable to load Paytm Checkout.")), { once: true });

        return;
      }

      const host = environment === "production" ? "https://securegw.paytm.in" : "https://securegw-stage.paytm.in";

      const script = document.createElement("script");

      script.type = "application/javascript";
      script.src = `${host}/merchantpgpui/checkoutjs/merchants/${encodeURIComponent(mid)}.js`;

      script.crossOrigin = "anonymous";
      script.dataset.paytmCheckout = "true";

      script.onload = () => {
        paytmScriptRef.current = script;

        if (window.Paytm && window.Paytm.CheckoutJS) {
          resolve();
        } else {
          reject(new Error("Paytm CheckoutJS failed to initialize."));
        }
      };

      script.onerror = () => {
        reject(new Error("Unable to load Paytm Checkout script."));
      };

      document.body.appendChild(script);
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Verify Payment With Backend
  |--------------------------------------------------------------------------
  */

  const verifyPayment = async (orderId) => {
    const response = await apiRequest(`/orders/${orderId}/verify-payment`, {
      method: "POST",
    });

    if (!response?.success) {
      throw new Error(response?.message || "Unable to verify payment.");
    }

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | Open Paytm Checkout
  |--------------------------------------------------------------------------
  */

  const openPaytmCheckout = async ({ orderId, txnToken, mid, amount, backendOrderId }) => {
    if (paymentStartedRef.current) {
      return;
    }

    paymentStartedRef.current = true;
    setPaymentLoading(true);

    try {
      const environment = import.meta.env.VITE_PAYTM_ENV || "staging";

      await loadPaytmScript(mid, environment);

      const CheckoutJS = window.Paytm?.CheckoutJS;

      if (!CheckoutJS) {
        throw new Error("Paytm Checkout is not available.");
      }

      const config = {
        root: "",
        flow: "DEFAULT",
        data: {
          orderId: String(orderId),
          token: String(txnToken),
          tokenType: "TXN_TOKEN",
          amount: Number(amount).toFixed(2),
        },
        handler: {
          notifyMerchant: async (eventName, data) => {
            console.log("Paytm event:", eventName, data);

            const paymentEvents = ["APP_CLOSED", "SESSION_EXPIRED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "TRANSACTION_COMPLETE"];

            if (!paymentEvents.includes(eventName)) {
              return;
            }

            try {
              const verification = await verifyPayment(backendOrderId);

              if (verification?.paid === true && verification?.order) {
                clearCart();

                navigate(`/order-confirmation/${backendOrderId}`, {
                  replace: true,
                  state: {
                    order: verification.order,
                    paymentVerified: true,
                  },
                });

                return;
              }

              if (verification?.order?.paymentStatus === "FAILED") {
                await showError("Payment Failed", verification?.message || "Your payment could not be completed.");

                paymentStartedRef.current = false;
                setPaymentLoading(false);

                return;
              }

              await showError("Payment Pending", "Your payment status is still being processed. Please wait a moment and check your order status.");

              paymentStartedRef.current = false;
              setPaymentLoading(false);
            } catch (error) {
              console.error("Payment verification error:", error);

              await showError("Payment Verification Failed", error?.message || "We could not verify your payment. Please check your order status before trying again.");

              paymentStartedRef.current = false;
              setPaymentLoading(false);
            }
          },
        },
      };

      await CheckoutJS.onLoad(async () => {});

      await CheckoutJS.init(config);

      CheckoutJS.invoke();
    } catch (error) {
      console.error("Paytm checkout error:", error);

      paymentStartedRef.current = false;
      setPaymentLoading(false);

      await showError("Payment Checkout Error", error?.message || "Unable to open Paytm payment checkout. Please try again.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Create Order + Start Paytm
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      await showError("Check Your Details", "Please correct the highlighted fields before placing your order.");

      return;
    }

    const stockValid = await validateStock();

    if (!stockValid) {
      return;
    }

    const result = await showConfirm({
      title: "Confirm Your Order?",
      text: `Your order total is ₹${total.toLocaleString("en-IN")}. Do you want to continue?`,
      confirmText: "Continue to Payment",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    setSubmitting(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      | Only productId + quantity are sent.
      | Backend gets the real price from MongoDB.
      */

      const payload = {
        shippingAddress: {
          fullName: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },

        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity),
        })),
      };

      /*
      |--------------------------------------------------------------------------
      | Create Order
      |--------------------------------------------------------------------------
      */

      const response = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response?.success || !response?.order || !response?.payment) {
        throw new Error(response?.message || "Unable to create order.");
      }

      const { order, payment } = response;

      if (!payment?.txnToken) {
        throw new Error("Paytm transaction token was not generated.");
      }

      if (!payment?.mid) {
        throw new Error("Paytm merchant ID was not received from the server.");
      }

      setSubmitting(false);

      /*
      |--------------------------------------------------------------------------
      | Start Paytm
      |--------------------------------------------------------------------------
      */

      await openPaytmCheckout({
        orderId: payment.orderId || order.orderNumber,
        txnToken: payment.txnToken,
        mid: payment.mid,
        amount: order.total,
        backendOrderId: order.id,
      });
    } catch (error) {
      console.error("Create order error:", error);

      setSubmitting(false);
      paymentStartedRef.current = false;

      await showError("Unable to Continue", error?.message || "We could not create your order. Please try again.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Empty Cart
  |--------------------------------------------------------------------------
  */

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              <ShoppingBag size={34} />
            </div>

            <span className="section-eyebrow">Checkout</span>

            <h1>Your Cart Is Empty.</h1>

            <p>Add some Kadaknath farm products to your cart before proceeding to checkout.</p>

            <Link to="/products" className="btn btn-primary">
              Explore Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <style>{`.checkout-page{min-height:70vh;padding:75px 0;background:var(--bg-page)}.checkout-empty{max-width:620px;margin:40px auto;text-align:center}.checkout-empty-icon{display:grid;width:82px;height:82px;margin:0 auto 25px;place-items:center;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.checkout-empty h1{margin-bottom:14px;color:var(--color-primary);font-size:clamp(2.2rem,5vw,3.5rem)}.checkout-empty p{max-width:500px;margin:0 auto 30px;color:#1a120c;line-height:1.75}`}</style>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Checkout UI
  |--------------------------------------------------------------------------
  */

  return (
    <section className="checkout-page">
      <div className="container">
        <Link to="/cart" className="checkout-back-link">
          <ArrowLeft size={17} />
          Back to Cart
        </Link>

        <div className="checkout-heading">
          <span className="section-eyebrow">Secure Checkout</span>

          <h1>Complete Your Order.</h1>

          <p>Enter your delivery details and review your order before making payment.</p>
        </div>

        {!canPlaceOrder && (
          <div className="checkout-stock-warning">
            <strong>Some products are no longer available.</strong>

            <span>Please return to your cart and update the affected products before continuing.</span>

            <Link to="/cart">
              Go Back to Cart
              <ArrowLeft size={16} />
            </Link>
          </div>
        )}

        <div className="checkout-layout">
          <div className="checkout-form-card">
            <div className="checkout-card-header">
              <div className="checkout-header-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>Delivery Details</h2>

                <p>Where should we deliver your order?</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full">
                  <label htmlFor="name">Full Name</label>

                  <div className="input-wrapper">
                    <User size={18} />

                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" />
                  </div>

                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>

                  <div className="input-wrapper">
                    <Mail size={18} />

                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" autoComplete="email" />
                  </div>

                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>

                  <div className="input-wrapper">
                    <Phone size={18} />

                    <input id="phone" name="phone" type="tel" inputMode="numeric" maxLength="10" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" autoComplete="tel" />
                  </div>

                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>

                  <div className="input-wrapper">
                    <MapPin size={18} />

                    <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} placeholder="Enter your city" autoComplete="address-level2" />
                  </div>

                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>

                  <div className="input-wrapper">
                    <MapPin size={18} />

                    <input id="state" name="state" type="text" value={formData.state} onChange={handleChange} placeholder="Enter your state" autoComplete="address-level1" />
                  </div>

                  {errors.state && <span className="form-error">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>

                  <div className="input-wrapper">
                    <MapPin size={18} />

                    <input id="pincode" name="pincode" type="text" inputMode="numeric" maxLength="6" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" autoComplete="postal-code" />
                  </div>

                  {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                </div>

                <div className="form-group full">
                  <label htmlFor="address">Full Delivery Address</label>

                  <textarea id="address" name="address" rows="4" value={formData.address} onChange={handleChange} placeholder="House/Flat No., Street, Area" autoComplete="street-address" />

                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>

                <div className="form-group full">
                  <label htmlFor="instructions">
                    Delivery Instructions
                    <span>Optional</span>
                  </label>

                  <textarea id="instructions" name="instructions" rows="3" value={formData.instructions} onChange={handleChange} placeholder="Any helpful instructions for delivery?" />
                </div>
              </div>

              <div className="delivery-note">
                <CheckCircle2 size={19} />

                <div>
                  <strong>Secure Paytm Payment</strong>

                  <p>Your payment will be processed securely through Paytm. The order is confirmed only after payment is verified by our server.</p>
                </div>
              </div>

              <button type="submit" className="place-order-button" disabled={submitting || paymentLoading || !canPlaceOrder}>
                {submitting ? (
                  "Creating Order..."
                ) : paymentLoading ? (
                  "Opening Paytm..."
                ) : (
                  <>
                    Continue to Paytm
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="secure-note">
                <Lock size={15} />

                <span>Your information and payment are handled securely.</span>
              </div>
            </form>
          </div>

          <aside className="checkout-summary">
            <div className="summary-top">
              <div>
                <span className="summary-label">Your Order</span>

                <h2>Order Summary</h2>
              </div>

              <div className="summary-count">{cartCount}</div>
            </div>

            <div className="checkout-products">
              {cartItems.map((item) => (
                <div className="checkout-product" key={item.id}>
                  <div className="checkout-product-image">{item.image ? <img src={item.image} alt={item.name} /> : <span>BR30</span>}</div>

                  <div className="checkout-product-info">
                    <h3>{item.name}</h3>

                    <span>
                      {item.unit} × {item.quantity}
                    </span>
                  </div>

                  <strong>₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>Subtotal</span>

              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>Delivery</span>

              <strong>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge.toLocaleString("en-IN")}`}</strong>
            </div>

            <div className="checkout-total">
              <span>Total</span>

              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <div className="checkout-trust">
              <div>
                <CheckCircle2 size={17} />
                <span>Farm-focused products</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Secure Paytm payment</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Server-verified order</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`.checkout-page{min-height:70vh;padding:48px 0 90px;background:var(--bg-page)}.checkout-back-link{display:inline-flex;align-items:center;gap:7px;margin-bottom:34px;color:var(--color-text-soft);font-size:.92rem;font-weight:700;transition:color var(--transition-fast),transform var(--transition-fast)}.checkout-back-link:hover{color:var(--color-green);transform:translateX(-3px)}.checkout-heading{max-width:700px;margin-bottom:42px}.checkout-heading h1{margin-bottom:12px;color:var(--color-primary);font-size:clamp(2.4rem,5vw,4rem);letter-spacing:-.04em}.checkout-heading p{color:#1a120c;font-size:1rem}.checkout-stock-warning{display:flex;align-items:center;gap:12px;margin-bottom:25px;padding:15px 18px;border:1px solid var(--color-gold);border-radius:var(--radius-md);background:var(--color-gold-light);color:var(--color-primary)}.checkout-stock-warning strong{font-size:.82rem}.checkout-stock-warning span{color:#1a120c;font-size:.76rem}.checkout-stock-warning a{display:inline-flex;align-items:center;gap:5px;margin-left:auto;color:var(--color-green);font-size:.76rem;font-weight:800;white-space:nowrap}.checkout-layout{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:32px;align-items:start}.checkout-form-card,.checkout-summary{border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-sm)}.checkout-form-card{padding:30px}.checkout-card-header{display:flex;align-items:center;gap:14px;margin-bottom:30px;padding-bottom:24px;border-bottom:1px solid var(--color-border)}.checkout-header-icon{display:grid;width:48px;height:48px;flex-shrink:0;place-items:center;border-radius:14px;background:var(--color-green-pale);color:var(--color-green)}.checkout-card-header h2{margin-bottom:3px;color:var(--color-primary);font-size:1.2rem}.checkout-card-header p{color:#1a120c;font-size:.82rem}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.form-group{min-width:0}.form-group.full{grid-column:1/-1}.form-group label{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;color:var(--color-primary);font-size:.84rem;font-weight:800}.form-group label span{color:#1a120c;font-size:.72rem;font-weight:600}.input-wrapper{position:relative}.input-wrapper svg{position:absolute;top:50%;left:15px;color:var(--color-text-soft);transform:translateY(-50%);pointer-events:none}.input-wrapper input{width:100%;height:50px;padding:0 15px 0 45px;border:1px solid var(--color-border-dark);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-primary);transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.input-wrapper input:focus,.form-group textarea:focus{border-color:var(--color-green);box-shadow:0 0 0 3px rgba(63,107,53,.1)}.form-group textarea{width:100%;min-height:105px;padding:14px 15px;resize:vertical;border:1px solid var(--color-border-dark);border-radius:var(--radius-md);outline:none;background:var(--color-white);color:var(--color-primary);line-height:1.6;transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.form-group textarea::placeholder,.input-wrapper input::placeholder{color:var(--color-text-soft)}.form-error{display:block;margin-top:6px;color:var(--color-danger);font-size:.74rem;font-weight:600}.delivery-note{display:flex;align-items:flex-start;gap:11px;margin-top:24px;padding:16px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--bg-soft)}.delivery-note>svg{flex-shrink:0;margin-top:2px;color:var(--color-green)}.delivery-note strong{display:block;margin-bottom:3px;color:var(--color-primary);font-size:.84rem}.delivery-note p{color:#1a120c;font-size:.76rem;line-height:1.6}.place-order-button{display:flex;width:100%;min-height:54px;margin-top:20px;align-items:center;justify-content:center;gap:8px;border:0;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.place-order-button:hover:not(:disabled){transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.place-order-button:disabled{cursor:not-allowed;opacity:.55}.secure-note{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:13px;color:#1a120c;font-size:.72rem}.checkout-summary{position:sticky;top:110px;padding:24px}.summary-top{display:flex;align-items:center;justify-content:space-between;gap:15px;padding-bottom:20px}.summary-label{display:block;margin-bottom:4px;color:var(--color-green);font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.summary-top h2{color:var(--color-primary);font-size:1.15rem}.summary-count{display:grid;width:34px;height:34px;place-items:center;border-radius:50%;background:var(--color-green-pale);color:var(--color-green);font-size:.8rem;font-weight:800}.checkout-products{display:grid;gap:14px}.checkout-product{display:grid;grid-template-columns:55px minmax(0,1fr) auto;gap:11px;align-items:center}.checkout-product-image{display:grid;width:55px;height:55px;overflow:hidden;place-items:center;border-radius:10px;background:var(--color-green-pale);color:var(--color-green);font-size:.75rem;font-weight:900}.checkout-product-image img{width:100%;height:100%;object-fit:cover}.checkout-product-info{min-width:0}.checkout-product-info h3{overflow:hidden;margin-bottom:3px;color:var(--color-primary);font-size:.82rem;text-overflow:ellipsis;white-space:nowrap}.checkout-product-info span{color:#1a120c;font-size:.7rem}.checkout-product>strong{color:var(--color-primary);font-size:.8rem;white-space:nowrap}.checkout-summary-divider{height:1px;margin:20px 0 12px;background:var(--color-border)}.checkout-summary-row{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:8px 0}.checkout-summary-row span{color:#1a120c;font-size:.82rem}.checkout-summary-row strong{color:var(--color-primary);font-size:.82rem;text-align:right}.checkout-total{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:10px;padding-top:16px;border-top:1px solid var(--color-border)}.checkout-total span{color:var(--color-primary);font-weight:800}.checkout-total strong{color:var(--color-primary);font-size:1.45rem}.checkout-trust{display:grid;gap:9px;margin-top:20px;padding-top:18px;border-top:1px solid var(--color-border)}.checkout-trust div{display:flex;align-items:center;gap:8px;color:#1a120c;font-size:.75rem}.checkout-trust svg{flex-shrink:0;color:var(--color-green)}@media(max-width:991px){.checkout-layout{grid-template-columns:1fr}.checkout-summary{position:static}.checkout-stock-warning{align-items:flex-start;flex-wrap:wrap}.checkout-stock-warning a{margin-left:0}}@media(max-width:575px){.checkout-page{padding:32px 0 65px}.checkout-heading{margin-bottom:30px}.checkout-heading h1{font-size:2.4rem}.checkout-form-card{padding:20px}.form-grid{grid-template-columns:1fr;gap:17px}.form-group.full{grid-column:auto}.checkout-summary{padding:20px}}`}</style>
    </section>
  );
};

export default Checkout;
