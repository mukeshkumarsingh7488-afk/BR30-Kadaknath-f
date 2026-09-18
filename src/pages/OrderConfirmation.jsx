import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Home, LoaderCircle, PackageCheck, ShoppingBag, Truck } from "lucide-react";

import apiRequest from "../api/api";

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      if (!id) {
        if (mounted) {
          setErrorMessage("Order information is missing.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const response = await apiRequest(`/orders/${encodeURIComponent(id)}`);

        if (!mounted) return;

        if (!response?.success || !response?.order) {
          throw new Error(response?.message || "Unable to load order details.");
        }

        setOrder(response.order);
      } catch (error) {
        if (!mounted) return;

        setErrorMessage(error?.message || "Unable to load your order details.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const paymentStatus = String(order?.paymentStatus || "").toUpperCase();
  const orderStatus = String(order?.orderStatus || "").toUpperCase();

  const isPaid = paymentStatus === "PAID";
  const isFailed = paymentStatus === "FAILED";
  const isProcessingPayment = paymentStatus === "PROCESSING" || paymentStatus === "PENDING";

  const isConfirmed = orderStatus === "CONFIRMED" || orderStatus === "PROCESSING" || orderStatus === "SHIPPED" || orderStatus === "DELIVERED";

  const customerName = order?.shippingAddress?.fullName || "Customer";

  const items = Array.isArray(order?.items) ? order.items : [];

  const subtotal = Number(order?.subtotal || 0);
  const deliveryCharge = Number(order?.deliveryCharge || 0);
  const total = Number(order?.total || subtotal + deliveryCharge);

  const deliveryAddress = order?.shippingAddress || null;

  const statusInfo = useMemo(() => {
    if (isPaid && isConfirmed) {
      return {
        eyebrow: "ORDER CONFIRMED",
        title: `Thank You, ${customerName}!`,
        description: "Your payment has been successfully verified and your order has been confirmed with BR30 Kadaknath Farms.",
      };
    }

    if (isFailed) {
      return {
        eyebrow: "PAYMENT FAILED",
        title: "Payment Was Not Completed",
        description: "Your payment could not be completed. Please check your payment status before trying again.",
      };
    }

    if (isProcessingPayment) {
      return {
        eyebrow: "PAYMENT PROCESSING",
        title: `Thank You, ${customerName}!`,
        description: "Your order has been received and the payment is still being processed. Please check your order status for the latest update.",
      };
    }

    return {
      eyebrow: "ORDER RECEIVED",
      title: `Thank You, ${customerName}!`,
      description: "Your order has been received. The latest order and payment status is shown below.",
    };
  }, [customerName, isConfirmed, isFailed, isPaid, isProcessingPayment]);

  const currentStep = useMemo(() => {
    if (orderStatus === "DELIVERED") return 4;
    if (orderStatus === "SHIPPED") return 3;
    if (orderStatus === "PROCESSING") return 2;
    if (orderStatus === "CONFIRMED") return 1;
    return 0;
  }, [orderStatus]);

  if (loading) {
    return (
      <section className="order-confirmation-page">
        <div className="container">
          <div className="order-loading-state">
            <div className="loading-icon">
              <LoaderCircle size={38} />
            </div>

            <h1>Loading Your Order</h1>

            <p>Please wait while we securely fetch your order details.</p>
          </div>
        </div>

        <style>{`.order-confirmation-page{min-height:75vh;padding:70px 0 95px;background:radial-gradient(circle at 50% 0%,rgba(111,143,69,.08),transparent 34%),var(--bg-page)}.order-loading-state{max-width:520px;margin:80px auto;text-align:center}.loading-icon{display:grid;place-items:center;width:82px;height:82px;margin:0 auto 22px;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.loading-icon svg{animation:orderSpin 1s linear infinite}@keyframes orderSpin{to{transform:rotate(360deg)}}.order-loading-state h1{margin-bottom:10px;color:var(--color-primary);font-size:2rem}.order-loading-state p{color:#1a120c;line-height:1.7}@media (max-width:575px){.order-confirmation-page{padding:50px 0 70px}.order-loading-state{margin:50px auto}}`}</style>
      </section>
    );
  }

  if (errorMessage || !order) {
    return (
      <section className="order-confirmation-page">
        <div className="container">
          <div className="order-error-state">
            <div className="error-icon">
              <AlertCircle size={42} />
            </div>

            <span className="section-eyebrow">ORDER NOT FOUND</span>

            <h1>We Couldn't Load Your Order</h1>

            <p>{errorMessage || "The requested order could not be found or you may not have permission to view it."}</p>

            <div className="error-actions">
              <Link to="/my-orders" className="btn btn-primary">
                View My Orders
                <ArrowRight size={17} />
              </Link>

              <Link to="/products" className="secondary-action">
                Continue Shopping
              </Link>

              <Link to="/" className="home-action">
                <Home size={16} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <style>{`.order-confirmation-page{min-height:75vh;padding:70px 0 95px;background:radial-gradient(circle at 50% 0%,rgba(111,143,69,.08),transparent 34%),var(--bg-page)}.order-error-state{max-width:620px;margin:70px auto;text-align:center}.error-icon{display:grid;place-items:center;width:90px;height:90px;margin:0 auto 22px;border-radius:50%;background:rgba(180,60,45,.1);color:#b43c2d}.order-error-state .section-eyebrow{display:block;margin-bottom:10px}.order-error-state h1{margin-bottom:13px;color:var(--color-primary);font-size:clamp(2rem,5vw,3rem);letter-spacing:-.04em}.order-error-state>p{max-width:540px;margin:0 auto;color:#1a120c;font-size:.95rem;line-height:1.7}.error-actions{display:grid;gap:10px;max-width:360px;margin:30px auto 0}.error-actions .btn{width:100%}.secondary-action,.home-action{display:flex;align-items:center;justify-content:center;gap:7px;min-height:45px;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);color:var(--color-primary);font-size:.85rem;font-weight:750;transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast)}.secondary-action:hover,.home-action:hover{transform:translateY(-1px);border-color:var(--color-green);background:var(--color-green-pale)}.home-action{border:0;color:#1a120c}`}</style>
      </section>
    );
  }

  return (
    <section className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-wrapper">
          <div className={`confirmation-success ${isFailed ? "confirmation-failed" : ""}`}>
            <div className="confirmation-icon">{isFailed ? <AlertCircle size={52} /> : isProcessingPayment ? <LoaderCircle size={52} className="processing-icon" /> : <CheckCircle2 size={52} />}</div>

            <span className="section-eyebrow">{statusInfo.eyebrow}</span>

            <h1>{statusInfo.title}</h1>

            <p>{statusInfo.description}</p>

            <div className="order-number">
              <span>Order ID</span>
              <strong>{order.orderNumber}</strong>
            </div>
          </div>

          <div className="confirmation-grid">
            <div className="confirmation-main">
              <div className="confirmation-card">
                <div className="card-heading">
                  <div>
                    <span className="card-eyebrow">ORDER DETAILS</span>
                    <h2>Your Order</h2>
                  </div>

                  <ShoppingBag size={22} />
                </div>

                {items.length > 0 ? (
                  <div className="confirmation-items">
                    {items.map((item, index) => {
                      const itemTotal = Number(item.total || Number(item.price || 0) * Number(item.quantity || 0));

                      const itemKey = item.productId || `${item.slug || item.name || "product"}-${index}`;

                      return (
                        <div className="confirmation-item" key={itemKey}>
                          <div className="confirmation-item-image">{item.image ? <img src={item.image} alt={item.name || "Product"} loading="lazy" /> : <ShoppingBag size={24} />}</div>

                          <div className="confirmation-item-info">
                            <h3>{item.name}</h3>

                            <span>
                              {item.unit ? `${item.unit} • ` : ""}
                              Qty: {Number(item.quantity || 0)}
                            </span>
                          </div>

                          <strong>{formatPrice(itemTotal)}</strong>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-order-items">
                    <ShoppingBag size={20} />

                    <p>No product items are available for this order.</p>
                  </div>
                )}

                <div className="confirmation-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>{deliveryCharge > 0 ? formatPrice(deliveryCharge) : "Free"}</strong>
                  </div>

                  <div className="confirmation-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                </div>
              </div>

              <div className="confirmation-card">
                <div className="card-heading">
                  <div>
                    <span className="card-eyebrow">PAYMENT</span>
                    <h2>Payment Information</h2>
                  </div>

                  <CheckCircle2 size={22} />
                </div>

                <div className="payment-info">
                  <div>
                    <span>Payment Method</span>
                    <strong>{order.paymentMethod || "PAYTM"}</strong>
                  </div>

                  <div>
                    <span>Payment Status</span>

                    <strong className={`status-badge status-${paymentStatus.toLowerCase()}`}>{paymentStatus || "UNKNOWN"}</strong>
                  </div>

                  <div>
                    <span>Order Status</span>

                    <strong className={`status-badge order-status-${orderStatus.toLowerCase()}`}>{orderStatus || "PENDING"}</strong>
                  </div>

                  {order.paidAt && (
                    <div>
                      <span>Paid On</span>

                      <strong>
                        {new Date(order.paidAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </strong>
                    </div>
                  )}
                </div>

                {isFailed && (
                  <div className="payment-notice payment-failed-notice">
                    <AlertCircle size={18} />

                    <p>Payment was not completed successfully. Please check your order/payment status before taking further action.</p>
                  </div>
                )}

                {isProcessingPayment && (
                  <div className="payment-notice payment-processing-notice">
                    <LoaderCircle size={18} />

                    <p>Your payment is currently being processed. Please do not submit the payment again unless the latest status confirms that it failed.</p>
                  </div>
                )}

                {isPaid && (
                  <div className="payment-notice payment-success-notice">
                    <CheckCircle2 size={18} />

                    <p>Payment has been successfully verified for this order.</p>
                  </div>
                )}
              </div>

              {deliveryAddress && (
                <div className="confirmation-card">
                  <div className="card-heading">
                    <div>
                      <span className="card-eyebrow">DELIVERY</span>
                      <h2>Delivery Address</h2>
                    </div>

                    <Truck size={22} />
                  </div>

                  <div className="delivery-address">
                    <strong>{deliveryAddress.fullName}</strong>

                    <p>{deliveryAddress.address}</p>

                    <p>
                      {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                    </p>

                    {deliveryAddress.phone && <p>Phone: {deliveryAddress.phone}</p>}

                    {deliveryAddress.email && <p>Email: {deliveryAddress.email}</p>}
                  </div>
                </div>
              )}

              <div className="confirmation-card">
                <div className="card-heading">
                  <div>
                    <span className="card-eyebrow">ORDER STATUS</span>

                    <h2>Order Process</h2>
                  </div>

                  <PackageCheck size={22} />
                </div>

                <div className="order-steps">
                  <div className={`order-step ${currentStep >= 1 ? "active" : ""}`}>
                    <div className="step-icon">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <strong>Order Confirmed</strong>
                      <span>{currentStep >= 1 ? "Your order has been confirmed." : "Your order will be confirmed after successful payment."}</span>
                    </div>
                  </div>

                  <div className={`order-step ${currentStep >= 2 ? "active" : ""}`}>
                    <div className="step-icon">
                      <PackageCheck size={18} />
                    </div>

                    <div>
                      <strong>Order Processing</strong>
                      <span>{currentStep >= 2 ? "Our farm team is preparing your order." : "Our farm team will prepare your order after confirmation."}</span>
                    </div>
                  </div>

                  <div className={`order-step ${currentStep >= 3 ? "active" : ""}`}>
                    <div className="step-icon">
                      <Truck size={18} />
                    </div>

                    <div>
                      <strong>Shipped</strong>
                      <span>{currentStep >= 3 ? "Your order has been handed over for delivery." : "Your order will be shipped after processing."}</span>
                    </div>
                  </div>

                  <div className={`order-step ${currentStep >= 4 ? "active" : ""}`}>
                    <div className="step-icon">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <strong>Delivered</strong>
                      <span>{currentStep >= 4 ? "Your order has been delivered successfully." : "Your order will be marked delivered after successful delivery."}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="confirmation-sidebar">
              <div className="confirmation-help-card">
                <div className="help-icon">
                  <PackageCheck size={28} />
                </div>

                <h2>Keep Your Order ID</h2>

                <p>
                  Save your order ID <strong>{order.orderNumber}</strong> to track your order later.
                </p>

                <Link to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} className="track-order-button">
                  Track Your Order
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="confirmation-actions">
                <Link to="/my-orders" className="btn btn-primary">
                  View My Orders
                  <ArrowRight size={17} />
                </Link>

                <Link to="/products" className="secondary-action">
                  Continue Shopping
                </Link>

                <Link to="/" className="home-action">
                  <Home size={16} />
                  Back to Home
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`.order-confirmation-page{min-height:75vh;padding:70px 0 95px;background:radial-gradient(circle at 50% 0%,rgba(111,143,69,.08),transparent 34%),var(--bg-page)}.confirmation-wrapper{max-width:1080px;margin:0 auto}.confirmation-success{max-width:720px;margin:0 auto 48px;text-align:center}.confirmation-icon{display:grid;place-items:center;width:96px;height:96px;margin:0 auto 22px;border-radius:50%;background:var(--color-green-pale);color:var(--color-success)}.confirmation-icon .processing-icon{animation:orderSpin 1s linear infinite}.confirmation-failed .confirmation-icon{background:rgba(180,60,45,.1);color:#b43c2d}.confirmation-success .section-eyebrow{margin-bottom:10px}.confirmation-success h1{margin-bottom:13px;color:var(--color-primary);font-size:clamp(2.2rem,5vw,3.5rem);letter-spacing:-.04em}.confirmation-success>p{max-width:620px;margin:0 auto;color:#1a120c;font-size:1rem;line-height:1.7}.order-number{display:inline-flex;align-items:center;gap:10px;margin-top:22px;padding:10px 16px;border:1px solid var(--color-border);border-radius:var(--radius-pill);background:var(--color-white);box-shadow:var(--shadow-sm)}.order-number span{color:var(--color-text-soft);font-size:.78rem;font-weight:700}.order-number strong{color:var(--color-green);font-size:.88rem;letter-spacing:.04em}.confirmation-grid{display:grid;grid-template-columns:minmax(0,1fr) 310px;align-items:start;gap:26px}.confirmation-main{display:grid;gap:20px;min-width:0}.confirmation-card,.confirmation-help-card{border:1px solid var(--color-border);border-radius:var(--radius-xl);background:var(--color-white);box-shadow:var(--shadow-sm)}.confirmation-card{padding:26px}.card-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:19px;border-bottom:1px solid var(--color-border)}.card-heading svg{flex-shrink:0;color:var(--color-green)}.card-eyebrow{display:block;margin-bottom:5px;color:var(--color-green);font-size:.72rem;font-weight:800;letter-spacing:.1em}.card-heading h2{color:var(--color-primary);font-size:1.3rem}.confirmation-items{display:grid}.confirmation-item{display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1px solid var(--color-border)}.confirmation-item:last-child{border-bottom:0}.confirmation-item-image{display:grid;place-items:center;flex:0 0 58px;width:58px;height:58px;overflow:hidden;border-radius:var(--radius-md);background:var(--color-green-pale);color:var(--color-green)}.confirmation-item-image img{width:100%;height:100%;object-fit:cover}.confirmation-item-info{flex:1;min-width:0}.confirmation-item-info h3{margin-bottom:3px;color:var(--color-primary);font-size:.94rem}.confirmation-item-info span{color:#1a120c;font-size:.78rem}.confirmation-item>strong{color:var(--color-primary);font-size:.92rem}.empty-order-items{display:flex;align-items:center;gap:10px;padding:20px 0;color:#1a120c}.empty-order-items svg{flex-shrink:0;color:var(--color-green)}.empty-order-items p{font-size:.88rem}.confirmation-summary{padding-top:17px}.confirmation-summary>div{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:7px 0}.confirmation-summary span{color:#1a120c;font-size:.86rem}.confirmation-summary strong{color:var(--color-primary);font-size:.88rem}.confirmation-summary .confirmation-total{margin-top:10px;padding-top:16px;border-top:1px solid var(--color-border)}.confirmation-total span{color:var(--color-primary);font-weight:800}.confirmation-total strong{font-size:1.35rem}.payment-info{display:grid;gap:0;padding-top:8px}.payment-info>div{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 0;border-bottom:1px solid var(--color-border)}.payment-info>div:last-child{border-bottom:0}.payment-info span{color:#1a120c;font-size:.86rem}.payment-info>div>strong{color:var(--color-primary);font-size:.88rem;text-align:right}.status-badge{display:inline-flex!important;align-items:center;justify-content:center;padding:5px 10px;border-radius:var(--radius-pill);font-size:.7rem!important;font-weight:800!important;letter-spacing:.04em}.status-paid,.order-status-confirmed,.order-status-processing,.order-status-shipped,.order-status-delivered{background:var(--color-green-pale);color:var(--color-green)!important}.status-failed,.order-status-cancelled{background:rgba(180,60,45,.1);color:#b43c2d!important}.status-pending,.status-processing,.order-status-pending{background:rgba(190,145,50,.12);color:#956d16!important}.payment-notice{display:flex;align-items:flex-start;gap:10px;margin-top:18px;padding:13px 14px;border-radius:var(--radius-md)}.payment-notice svg{flex-shrink:0;margin-top:1px}.payment-notice p{font-size:.8rem;line-height:1.55}.payment-success-notice{background:var(--color-green-pale);color:var(--color-green)}.payment-processing-notice{background:rgba(190,145,50,.1);color:#956d16}.payment-failed-notice{background:rgba(180,60,45,.08);color:#b43c2d}.delivery-address{padding-top:20px}.delivery-address strong{display:block;margin-bottom:7px;color:var(--color-primary)}.delivery-address p{margin-bottom:4px;color:#1a120c;font-size:.88rem;line-height:1.6}.order-steps{display:grid;gap:0;padding-top:20px}.order-step{position:relative;display:flex;gap:13px;min-height:72px}.order-step:not(:last-child)::before{content:"";position:absolute;left:16px;top:34px;bottom:0;width:1px;background:var(--color-border-dark)}.step-icon{position:relative;z-index:1;display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border:1px solid var(--color-border-dark);border-radius:50%;background:var(--color-white);color:var(--color-text-soft)}.order-step.active .step-icon{border-color:var(--color-green);background:var(--color-green-pale);color:var(--color-green)}.order-step strong{display:block;margin:5px 0 3px;color:var(--color-primary);font-size:.9rem}.order-step span{color:#1a120c;font-size:.78rem;line-height:1.45}.confirmation-sidebar{position:sticky;top:105px;display:grid;gap:16px}.confirmation-help-card{padding:25px;text-align:center}.help-icon{display:grid;place-items:center;width:62px;height:62px;margin:0 auto 17px;border-radius:18px;background:var(--color-green-pale);color:var(--color-green)}.confirmation-help-card h2{margin-bottom:8px;color:var(--color-primary);font-size:1.2rem}.confirmation-help-card p{margin-bottom:20px;color:#1a120c;font-size:.84rem;line-height:1.65}.confirmation-help-card p strong{color:var(--color-green)}.track-order-button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:47px;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-size:.86rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.track-order-button:hover{transform:translateY(-2px);background:var(--color-primary);box-shadow:var(--shadow-md)}.confirmation-actions{display:grid;gap:10px}.confirmation-actions .btn{width:100%}.secondary-action,.home-action{display:flex;align-items:center;justify-content:center;gap:7px;min-height:45px;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);color:var(--color-primary);font-size:.85rem;font-weight:750;transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast)}.secondary-action:hover,.home-action:hover{transform:translateY(-1px);border-color:var(--color-green);background:var(--color-green-pale)}.home-action{border:0;color:#1a120c}@keyframes orderSpin{to{transform:rotate(360deg)}}@media (max-width:991px){.confirmation-grid{grid-template-columns:1fr}.confirmation-sidebar{position:static}.confirmation-help-card{max-width:520px;margin:0 auto}.confirmation-actions{max-width:520px;width:100%;margin:0 auto}}@media (max-width:575px){.order-confirmation-page{padding:50px 0 70px}.confirmation-success{margin-bottom:35px}.confirmation-icon{width:82px;height:82px}.confirmation-success h1{font-size:2.25rem}.order-number{flex-direction:column;gap:3px;border-radius:var(--radius-md)}.confirmation-card{padding:20px}.confirmation-item{gap:10px}.confirmation-item-image{flex-basis:50px;width:50px;height:50px}.confirmation-item-info h3{font-size:.86rem}.confirmation-item>strong{font-size:.84rem}.payment-info>div{align-items:flex-start;flex-direction:column;gap:6px}.payment-info>div>strong{text-align:left}}`}</style>
    </section>
  );
};

export default OrderConfirmation;
