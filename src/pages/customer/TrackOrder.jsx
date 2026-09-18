import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, MapPin, Package, Search, ShoppingBag, Truck } from "lucide-react";

import { showError } from "../../utils/sweetAlert";
import apiRequest from "../../api/api";

const trackingSteps = [
  {
    key: "PENDING",
    label: "Order Placed",
    description: "Your order has been received.",
    icon: ShoppingBag,
  },
  {
    key: "CONFIRMED",
    label: "Order Confirmed",
    description: "Your order has been confirmed by our farm.",
    icon: CheckCircle2,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    description: "Your order is being prepared.",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Your order has been handed over for delivery.",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: Check,
  },
];

const getTrackingIndex = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "DELIVERED") return 4;
  if (normalizedStatus === "SHIPPED") return 3;
  if (normalizedStatus === "PROCESSING") return 2;
  if (normalizedStatus === "CONFIRMED") return 1;

  return 0;
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return labels[String(status || "").toUpperCase()] || "Unknown";
};

const TrackOrder = () => {
  const { id } = useParams();

  const [orderId, setOrderId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(id));

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchOrderById = async (orderDatabaseId) => {
    if (!orderDatabaseId) return;

    try {
      setLoading(true);
      setSearched(false);

      const response = await apiRequest(`/orders/${encodeURIComponent(orderDatabaseId)}`);

      if (!response?.success || !response?.order) {
        throw new Error(response?.message || "Unable to load order details.");
      }

      setTrackedOrder(response.order);
      setOrderId(response.order.orderNumber || "");
      setSearched(true);
    } catch (error) {
      setTrackedOrder(null);
      setSearched(true);

      showError("Order Not Found", error?.message || "We could not find this order. Please check your order details.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setInitialLoading(false);
      return;
    }

    fetchOrderById(id);
  }, [id]);

  const handleTrack = async (event) => {
    event.preventDefault();

    const trimmedOrderId = orderId.trim();

    if (!trimmedOrderId) {
      showError("Order ID Required", "Please enter your order ID to track your order.");
      return;
    }

    try {
      setLoading(true);
      setTrackedOrder(null);
      setSearched(false);

      const response = await apiRequest("/orders");

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load your orders.");
      }

      const orders = Array.isArray(response.orders) ? response.orders : [];

      const foundOrder = orders.find((order) => String(order.orderNumber || "").toLowerCase() === trimmedOrderId.toLowerCase());

      if (!foundOrder) {
        setSearched(true);

        showError("Order Not Found", "We could not find an order with this ID. Please check the order ID and try again.");

        return;
      }

      setTrackedOrder(foundOrder);
      setOrderId(foundOrder.orderNumber || "");
      setSearched(true);
    } catch (error) {
      setTrackedOrder(null);
      setSearched(true);

      showError("Unable to Track Order", error?.message || "Something went wrong while loading your order.");
    } finally {
      setLoading(false);
    }
  };

  const orderStatus = String(trackedOrder?.orderStatus || "PENDING").toUpperCase();

  const paymentStatus = String(trackedOrder?.paymentStatus || "PENDING").toUpperCase();

  const trackingIndex = getTrackingIndex(orderStatus);

  const isCancelled = orderStatus === "CANCELLED";
  const isPaid = paymentStatus === "PAID";
  const isPaymentFailed = paymentStatus === "FAILED";
  const isPaymentProcessing = paymentStatus === "PROCESSING" || paymentStatus === "PENDING";

  const trackingHeading = useMemo(() => {
    if (isCancelled) {
      return "This order has been cancelled";
    }

    if (orderStatus === "DELIVERED") {
      return "Your order has been delivered";
    }

    if (orderStatus === "SHIPPED") {
      return "Your order is on the way";
    }

    if (orderStatus === "PROCESSING") {
      return "Your order is being prepared";
    }

    if (orderStatus === "CONFIRMED") {
      return "Your order has been confirmed";
    }

    return "Your order has been received";
  }, [isCancelled, orderStatus]);

  if (initialLoading) {
    return (
      <main className="track-order-page">
        <section className="track-order-loading">
          <div className="track-loading-icon">
            <Clock3 size={38} />
          </div>

          <h1>Loading Order</h1>

          <p>Please wait while we securely fetch your order details.</p>
        </section>

        <style>{`.track-order-page{min-height:70vh;background:var(--bg-page)}.track-order-loading{max-width:520px;margin:120px auto;padding:0 20px;text-align:center}.track-loading-icon{display:grid;place-items:center;width:82px;height:82px;margin:0 auto 22px;border-radius:50%;background:var(--color-green-pale);color:var(--color-green)}.track-order-loading h1{margin-bottom:10px;color:var(--color-primary);font-size:2rem}.track-order-loading p{color:#1a120c;font-size:.9rem;line-height:1.7}`}</style>
      </main>
    );
  }

  return (
    <main className="track-order-page">
      <section className="track-order-hero">
        <div className="track-order-container">
          <div className="track-order-hero-content">
            <span className="track-order-eyebrow">
              <Truck size={15} />
              Order Tracking
            </span>

            <h1>Track Your Order</h1>

            <p>Enter your BR30 order ID to see the latest status and delivery progress of your order.</p>
          </div>
        </div>
      </section>

      <section className="track-order-section">
        <div className="track-order-container">
          <div className="track-search-card">
            <div className="track-search-heading">
              <div className="track-search-icon">
                <Search size={22} />
              </div>

              <div>
                <h2>Find Your Order</h2>

                <p>Enter the order ID received after placing your order.</p>
              </div>
            </div>

            <form className="track-search-form" onSubmit={handleTrack}>
              <div className="track-input-wrapper">
                <Search size={18} />

                <input type="text" value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="Example: BR30-..." aria-label="Order ID" autoComplete="off" spellCheck="false" />
              </div>

              <button type="submit" className="track-search-button" disabled={loading || Boolean(id)}>
                {loading ? <Clock3 size={17} /> : <Search size={17} />}

                {loading ? "Searching..." : "Track Order"}
              </button>
            </form>
          </div>

          {searched && !trackedOrder && (
            <div className="tracking-empty">
              <div className="tracking-empty-icon">
                <Package size={30} />
              </div>

              <h3>Order Not Found</h3>

              <p>Please check your order ID and make sure it is entered correctly.</p>

              <Link to="/my-orders" className="tracking-back-link">
                View My Orders
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {trackedOrder && (
            <div className="tracking-result">
              <div className="tracking-order-header">
                <div>
                  <span>Tracking Order</span>

                  <h2>{trackedOrder.orderNumber}</h2>

                  <div className="tracking-date">
                    <CalendarDays size={14} />
                    Placed on {formatDate(trackedOrder.createdAt)}
                  </div>
                </div>

                <div className={`tracking-status-badge ${orderStatus.toLowerCase()}`}>{getStatusLabel(orderStatus)}</div>
              </div>

              {isCancelled && (
                <div className="tracking-cancelled-notice">
                  <AlertCircle size={20} />

                  <div>
                    <strong>Order Cancelled</strong>

                    <p>This order has been cancelled and will not proceed for delivery.</p>

                    {trackedOrder.cancelledAt && <span>Cancelled on {formatDate(trackedOrder.cancelledAt)}</span>}

                    {trackedOrder.cancellationReason && (
                      <div className="tracking-cancellation-reason">
                        <strong>Reason:</strong> {trackedOrder.cancellationReason}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="tracking-progress-card">
                <div className="tracking-progress-heading">
                  <div>
                    <span className="tracking-label">Delivery Progress</span>

                    <h3>{trackingHeading}</h3>
                  </div>

                  <Truck size={22} />
                </div>

                {!isCancelled ? (
                  <div className="tracking-timeline">
                    {trackingSteps.map((step, index) => {
                      const StepIcon = step.icon;

                      const isCompleted = index <= trackingIndex;
                      const isCurrent = index === trackingIndex;

                      return (
                        <div className={`tracking-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`} key={step.key}>
                          <div className="tracking-step-line">{index > 0 && <span className={index <= trackingIndex ? "filled" : ""} />}</div>

                          <div className="tracking-step-icon">
                            <StepIcon size={17} />
                          </div>

                          <div className="tracking-step-content">
                            <strong>{step.label}</strong>

                            <span>{step.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="cancelled-progress">
                    <AlertCircle size={24} />

                    <p>Delivery progress is no longer available for this cancelled order.</p>
                  </div>
                )}
              </div>

              <div className="tracking-details-grid">
                <div className="tracking-detail-card">
                  <div className="detail-card-icon">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <span>Delivery Address</span>

                    <strong>
                      {trackedOrder.shippingAddress?.address || "Not available"}
                      {trackedOrder.shippingAddress?.city ? `, ${trackedOrder.shippingAddress.city}` : ""}
                      {trackedOrder.shippingAddress?.state ? `, ${trackedOrder.shippingAddress.state}` : ""}
                      {trackedOrder.shippingAddress?.pincode ? ` - ${trackedOrder.shippingAddress.pincode}` : ""}
                    </strong>
                  </div>
                </div>

                <div className="tracking-detail-card">
                  <div className="detail-card-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <span>Order Date</span>

                    <strong>{formatDate(trackedOrder.createdAt)}</strong>
                  </div>
                </div>

                <div className="tracking-detail-card">
                  <div className="detail-card-icon">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <span>Payment Status</span>

                    <strong className={isPaid ? "tracking-paid" : isPaymentFailed ? "tracking-failed" : "tracking-payment-pending"}>{paymentStatus}</strong>
                  </div>
                </div>
              </div>

              {isPaymentProcessing && (
                <div className="tracking-payment-notice processing">
                  <Clock3 size={19} />

                  <p>
                    Payment status is currently <strong>{paymentStatus}</strong>. The latest payment status will be reflected here after verification.
                  </p>
                </div>
              )}

              {isPaymentFailed && (
                <div className="tracking-payment-notice failed">
                  <AlertCircle size={19} />

                  <p>Payment for this order was not completed successfully.</p>
                </div>
              )}

              {isPaid && (
                <div className="tracking-payment-notice success">
                  <CheckCircle2 size={19} />

                  <p>Payment has been successfully verified for this order.</p>
                </div>
              )}

              <div className="tracking-items-card">
                <div className="tracking-card-heading">
                  <div>
                    <span className="tracking-label">Order Details</span>

                    <h3>Items in Your Order</h3>
                  </div>

                  <Package size={21} />
                </div>

                <div className="tracking-items">
                  {Array.isArray(trackedOrder.items) && trackedOrder.items.length > 0 ? (
                    trackedOrder.items.map((item, index) => {
                      const itemTotal = Number(item.total || Number(item.price || 0) * Number(item.quantity || 0));

                      return (
                        <div className="tracking-item" key={`${item.productId || item.slug || item.name}-${index}`}>
                          <div className="tracking-item-icon">{item.image ? <img src={item.image} alt={item.name || "Product"} className="tracking-item-image" loading="lazy" /> : <Package size={20} />}</div>

                          <div className="tracking-item-info">
                            <strong>{item.name}</strong>

                            <span>
                              {Number(item.quantity || 0)} × {item.unit || "unit"}
                            </span>
                          </div>

                          <strong className="tracking-item-price">{formatPrice(itemTotal)}</strong>
                        </div>
                      );
                    })
                  ) : (
                    <div className="tracking-no-items">
                      <Package size={20} />

                      <span>Product details are unavailable for this order.</span>
                    </div>
                  )}
                </div>

                <div className="tracking-summary">
                  <div>
                    <span>Subtotal</span>

                    <strong>{formatPrice(trackedOrder.subtotal)}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>

                    <strong>{Number(trackedOrder.deliveryCharge || 0) > 0 ? formatPrice(trackedOrder.deliveryCharge) : "Free"}</strong>
                  </div>

                  <div className="tracking-total">
                    <span>Total Amount</span>

                    <strong>{formatPrice(trackedOrder.total)}</strong>
                  </div>
                </div>
              </div>

              <div className="tracking-actions">
                <Link to="/my-orders" className="tracking-secondary-button">
                  View My Orders
                </Link>

                <Link to={`/order-details/${trackedOrder._id}`} className="tracking-primary-button">
                  View Order Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {!trackedOrder && !searched && (
            <div className="tracking-help">
              <div className="tracking-help-icon">
                <Clock3 size={22} />
              </div>

              <div>
                <h3>Don't have your order ID?</h3>

                <p>You can find your order ID in your order confirmation or inside the My Orders section.</p>
              </div>

              <Link to="/my-orders" className="tracking-help-link">
                My Orders
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <style>{`.track-order-page{min-height:70vh;background:var(--bg-page)}.track-order-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));margin-inline:auto}.track-order-hero{padding:72px 0 68px;background:radial-gradient(circle at 85% 25%,rgba(111,143,69,.15),transparent 34%),linear-gradient(135deg,var(--color-primary),var(--color-primary-soft));color:var(--color-white)}.track-order-hero-content{max-width:720px}.track-order-eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:16px;padding:7px 12px;border:1px solid rgba(228,199,123,.35);border-radius:var(--radius-pill);background:rgba(255,255,255,.06);color:var(--color-gold-light);font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.track-order-hero h1{margin-bottom:13px;font-size:clamp(2.25rem,5vw,3.7rem);letter-spacing:-.03em}.track-order-hero p{max-width:620px;color:rgba(255,255,255,.85);font-size:1.03rem;line-height:1.75}.track-order-section{padding:65px 0 100px}.track-search-card{max-width:850px;margin:0 auto 40px;padding:28px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-md)}.track-search-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px}.track-search-icon{width:46px;height:46px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:13px;background:var(--color-green-pale);color:var(--color-green)}.track-search-heading h2{margin-bottom:3px;color:var(--color-primary);font-size:1.35rem}.track-search-heading p{color:#1a120c;font-size:.82rem}.track-search-form{display:grid;grid-template-columns:1fr auto;gap:10px}.track-input-wrapper{min-height:50px;padding:0 15px;display:flex;align-items:center;gap:9px;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);background:var(--color-white);transition:border-color var(--transition-fast),box-shadow var(--transition-fast)}.track-input-wrapper:focus-within{border-color:var(--color-green);box-shadow:0 0 0 3px rgba(63,107,53,.1)}.track-input-wrapper svg{flex-shrink:0;color:var(--color-text-soft)}.track-input-wrapper input{width:100%;border:0;outline:0;background:transparent;color:var(--color-primary);font-size:.9rem;font-weight:650}.track-input-wrapper input::placeholder{color:var(--color-text-soft)}.track-search-button{min-height:50px;padding:0 20px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-size:.84rem;font-weight:800;transition:background var(--transition-fast),transform var(--transition-fast),box-shadow var(--transition-fast)}.track-search-button:hover:not(:disabled){background:var(--color-primary);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.track-search-button:disabled{opacity:.7;cursor:not-allowed}.tracking-empty{max-width:700px;margin:0 auto;padding:45px 25px;display:flex;flex-direction:column;align-items:center;text-align:center;border:1px dashed var(--color-border-dark);border-radius:var(--radius-lg);background:var(--color-white)}.tracking-empty-icon{width:66px;height:66px;display:flex;align-items:center;justify-content:center;margin-bottom:17px;border-radius:18px;background:rgba(179,58,50,.08);color:var(--color-danger)}.tracking-empty h3{margin-bottom:7px;color:var(--color-primary);font-size:1.25rem}.tracking-empty p{margin-bottom:20px;color:#1a120c;font-size:.86rem}.tracking-back-link{display:inline-flex;align-items:center;gap:6px;color:var(--color-green);font-size:.82rem;font-weight:800}.tracking-result{display:flex;flex-direction:column;gap:18px}.tracking-order-header{padding:23px;display:flex;align-items:center;justify-content:space-between;gap:20px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}.tracking-order-header>div:first-child>span{display:block;margin-bottom:4px;color:#1a120c;font-size:.7rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.tracking-order-header h2{margin-bottom:5px;color:var(--color-primary);font-size:1.15rem}.tracking-date{display:flex;align-items:center;gap:5px;color:#1a120c;font-size:.76rem}.tracking-status-badge{min-height:32px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--radius-pill);background:var(--color-green-pale);color:var(--color-green);font-size:.74rem;font-weight:850;white-space:nowrap}.tracking-status-badge.pending{background:rgba(201,154,61,.14);color:var(--color-warning)}.tracking-status-badge.confirmed,.tracking-status-badge.processing{background:var(--color-green-pale);color:var(--color-green)}.tracking-status-badge.shipped{background:rgba(201,154,61,.14);color:var(--color-warning)}.tracking-status-badge.delivered{background:rgba(63,125,53,.12);color:var(--color-success)}.tracking-status-badge.cancelled{background:rgba(179,58,50,.1);color:var(--color-danger)}.tracking-progress-card{padding:27px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}.tracking-progress-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:35px}.tracking-progress-heading>svg{color:var(--color-green)}.tracking-label{display:block;margin-bottom:5px;color:var(--color-green);font-size:.7rem;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.tracking-progress-heading h3,.tracking-card-heading h3{color:var(--color-primary);font-size:1.15rem}.tracking-timeline{display:flex;flex-direction:column}.tracking-step{min-height:74px;position:relative;display:grid;grid-template-columns:42px 1fr;column-gap:14px}.tracking-step-line{position:absolute;top:42px;left:19px;width:3px;height:44px;background:var(--color-border)}.tracking-step:last-child .tracking-step-line{display:none}.tracking-step-line span{display:block;width:100%;height:0;background:var(--color-green);transition:height var(--transition-normal)}.tracking-step-line span.filled{height:100%}.tracking-step-icon{width:40px;height:40px;position:relative;z-index:2;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:50%;background:var(--color-white);color:var(--color-text-soft)}.tracking-step.completed .tracking-step-icon{border-color:var(--color-green);background:var(--color-green);color:var(--color-white)}.tracking-step.current .tracking-step-icon{box-shadow:0 0 0 5px rgba(63,107,53,.1)}.tracking-step-content{padding-top:3px;display:flex;flex-direction:column}.tracking-step-content strong{color:var(--color-primary);font-size:.86rem}.tracking-step-content span{margin-top:3px;color:#1a120c;font-size:.75rem;line-height:1.5}.tracking-cancelled-notice{display:flex;align-items:flex-start;gap:11px;padding:17px;border:1px solid rgba(179,58,50,.2);border-radius:var(--radius-lg);background:rgba(179,58,50,.06);color:var(--color-danger)}.tracking-cancelled-notice svg{flex-shrink:0;margin-top:1px}.tracking-cancelled-notice>div{min-width:0}.tracking-cancelled-notice strong{display:block;margin-bottom:4px;font-size:.86rem}.tracking-cancelled-notice p{color:#1a120c;font-size:.77rem;line-height:1.5}.tracking-cancelled-notice span{display:block;margin-top:5px;color:#1a120c;font-size:.7rem}.tracking-cancellation-reason{margin-top:8px;padding-top:8px;border-top:1px solid rgba(179,58,50,.14);color:#991b1b;font-size:.76rem;line-height:1.55}.tracking-cancellation-reason strong{display:inline;margin:0;font-size:.76rem;color:#991b1b}.cancelled-progress{display:flex;align-items:center;gap:10px;padding:20px;border-radius:var(--radius-md);background:rgba(179,58,50,.06);color:var(--color-danger)}.cancelled-progress p{color:#1a120c;font-size:.8rem}.tracking-details-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.tracking-detail-card{min-height:92px;padding:17px;display:flex;align-items:flex-start;gap:11px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-md)}.detail-card-icon{width:37px;height:37px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:10px;background:var(--color-green-pale);color:var(--color-green)}.tracking-detail-card>div:last-child{min-width:0;display:flex;flex-direction:column}.tracking-detail-card span{margin-bottom:4px;color:#1a120c;font-size:.68rem;font-weight:750;letter-spacing:.06em;text-transform:uppercase}.tracking-detail-card strong{color:var(--color-primary);font-size:.8rem;line-height:1.45}.tracking-paid{color:var(--color-success)!important}.tracking-failed{color:var(--color-danger)!important}.tracking-payment-pending{color:var(--color-warning)!important}.tracking-payment-notice{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border-radius:var(--radius-md)}.tracking-payment-notice svg{flex-shrink:0;margin-top:1px}.tracking-payment-notice p{font-size:.78rem;line-height:1.55}.tracking-payment-notice.success{background:var(--color-green-pale);color:var(--color-green)}.tracking-payment-notice.processing{background:rgba(201,154,61,.1);color:var(--color-warning)}.tracking-payment-notice.failed{background:rgba(179,58,50,.07);color:var(--color-danger)}.tracking-payment-notice p{color:#1a120c}.tracking-items-card{padding:25px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}.tracking-card-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.tracking-card-heading>svg{color:var(--color-green)}.tracking-items{border-top:1px solid var(--color-border)}.tracking-item{min-height:70px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--color-border)}.tracking-item-icon{width:43px;height:43px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border-radius:11px;background:var(--color-cream);color:var(--color-brown)}.tracking-item-image{width:100%;height:100%;display:block;object-fit:contain;object-position:center;border-radius:11px}.tracking-item-info{flex:1;display:flex;flex-direction:column}.tracking-item-info strong{color:var(--color-primary);font-size:.84rem}.tracking-item-info span{margin-top:2px;color:#1a120c;font-size:.74rem}.tracking-item-price{color:var(--color-primary);font-size:.84rem;white-space:nowrap}.tracking-no-items{display:flex;align-items:center;gap:9px;padding:18px 0;color:#887c73;font-size:.78rem}.tracking-no-items svg{flex-shrink:0;color:var(--color-green)}.tracking-summary{padding-top:15px}.tracking-summary>div{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:6px 0}.tracking-summary span{color:#1a120c;font-size:.8rem}.tracking-summary strong{color:var(--color-primary);font-size:.84rem}.tracking-total{margin-top:8px;padding-top:15px!important;border-top:1px solid var(--color-border)}.tracking-total span{color:var(--color-primary);font-weight:800}.tracking-total strong{font-size:1.1rem}.tracking-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px}.tracking-secondary-button,.tracking-primary-button{min-height:44px;padding:0 17px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:var(--radius-pill);font-size:.8rem;font-weight:800;transition:background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast)}.tracking-secondary-button{border:1px solid var(--color-border-dark);background:var(--color-white);color:var(--color-primary)}.tracking-secondary-button:hover{background:var(--color-green-pale);transform:translateY(-1px)}.tracking-primary-button{border:1px solid var(--color-green);background:var(--color-green);color:var(--color-white)}.tracking-primary-button:hover{border-color:var(--color-primary);background:var(--color-primary);transform:translateY(-1px)}.tracking-help{max-width:850px;margin:0 auto;padding:20px;display:flex;align-items:center;gap:13px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-cream)}.tracking-help-icon{width:43px;height:43px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:12px;background:var(--color-white);color:var(--color-green)}.tracking-help>div:nth-child(2){flex:1}.tracking-help h3{margin-bottom:2px;color:var(--color-primary);font-size:.87rem}.tracking-help p{color:#1a120c;font-size:.75rem;line-height:1.5}.tracking-help-link{display:inline-flex;align-items:center;gap:5px;color:var(--color-green);font-size:.77rem;font-weight:800;white-space:nowrap}@media (max-width:900px){.track-order-hero{padding:58px 0}.track-order-section{padding:55px 0 80px}.tracking-details-grid{grid-template-columns:1fr}}@media (max-width:575px){.track-order-hero{padding:45px 0 48px}.track-order-hero h1{font-size:2.1rem}.track-order-hero p{font-size:.92rem}.track-order-section{padding:42px 0 65px}.track-search-card{padding:20px 16px;margin-bottom:25px}.track-search-heading{align-items:flex-start}.track-search-heading h2{font-size:1.15rem}.track-search-form{grid-template-columns:1fr}.track-search-button{width:100%}.tracking-order-header{padding:18px;align-items:flex-start;flex-direction:column}.tracking-status-badge{align-self:flex-start}.tracking-progress-card{padding:20px 17px}.tracking-progress-heading{margin-bottom:28px}.tracking-progress-heading h3,.tracking-card-heading h3{font-size:1rem}.tracking-step{min-height:78px;grid-template-columns:38px 1fr;column-gap:11px}.tracking-step-line{left:17px}.tracking-step-icon{width:36px;height:36px}.tracking-step-content strong{font-size:.8rem}.tracking-step-content span{font-size:.7rem}.tracking-items-card{padding:20px 16px}.tracking-actions{display:grid;grid-template-columns:1fr}.tracking-secondary-button,.tracking-primary-button{width:100%}.tracking-help{align-items:flex-start;flex-wrap:wrap}.tracking-help-link{margin-left:56px}}`}</style>
    </main>
  );
};

export default TrackOrder;
