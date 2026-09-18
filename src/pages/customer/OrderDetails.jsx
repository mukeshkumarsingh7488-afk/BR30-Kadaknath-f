import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Package, Truck, XCircle, MapPin, Phone, Mail, CalendarDays, CreditCard, Receipt, ShoppingBag, ChevronRight } from "lucide-react";

import apiRequest from "../../api/api";

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getStatusClass = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return "delivered";
    case "SHIPPED":
      return "shipped";
    case "PROCESSING":
      return "processing";
    case "CONFIRMED":
      return "confirmed";
    case "PENDING":
      return "pending";
    case "CANCELLED":
      return "cancelled";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return <CheckCircle2 size={18} />;
    case "SHIPPED":
      return <Truck size={18} />;
    case "CANCELLED":
      return <XCircle size={18} />;
    case "PROCESSING":
    case "CONFIRMED":
    case "PENDING":
      return <Clock3 size={18} />;
    default:
      return <Package size={18} />;
  }
};

const getPaymentStatusClass = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
    case "SUCCESS":
      return "paid";
    case "FAILED":
      return "failed";
    case "REFUNDED":
      return "refunded";
    default:
      return "payment-pending";
  }
};

const getPaymentStatusLabel = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
    case "SUCCESS":
      return "Paid";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    case "PENDING":
      return "Pending";
    default:
      return status || "Pending";
  }
};

const getOrderStatusLabel = (status) => {
  if (!status) return "Order Placed";

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await apiRequest(`/orders/${encodeURIComponent(id)}`);

        if (!response?.success || !response?.order) {
          throw new Error(response?.message || "Order details not found.");
        }

        setOrder(response.order);
      } catch (err) {
        setError(err?.data?.message || err?.message || "Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <>
        <style>{`.order-details-page{min-height:70vh;padding:42px 20px 70px;background:var(--bg-page,#f8fafc)}.order-details-container{width:min(1120px,100%);margin:0 auto}.order-details-loading{min-height:420px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;color:var(--color-muted,#64748b)}.order-details-spinner{width:42px;height:42px;border:4px solid var(--color-border,#e2e8f0);border-top-color:var(--color-primary,#111827);border-radius:50%;animation:orderDetailsSpin .8s linear infinite}@keyframes orderDetailsSpin{to{transform:rotate(360deg)}}`}</style>

        <section className="order-details-page">
          <div className="order-details-container">
            <div className="order-details-loading">
              <div className="order-details-spinner"></div>
              <span>Loading order details...</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <style>{`.order-details-page{min-height:70vh;padding:42px 20px 70px;background:var(--bg-page,#f8fafc)}.order-details-container{width:min(1120px,100%);margin:0 auto}.order-details-error{max-width:620px;margin:50px auto;padding:45px 25px;background:var(--color-surface,#fff);border:1px solid var(--color-border,#e5e7eb);border-radius:18px;text-align:center;box-shadow:0 8px 25px rgba(15,23,42,.05)}.order-details-error-icon{width:58px;height:58px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--color-red-pale,#fee2e2);color:var(--color-red,#dc2626)}.order-details-error h2{margin:0 0 8px;font-size:24px;color:var(--color-primary,#111827)}.order-details-error p{margin:0 0 24px;color:var(--color-muted,#64748b);line-height:1.6}.order-details-back-button{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:10px;background:var(--color-primary,#111827);color:#fff;text-decoration:none;font-weight:600;transition:.2s ease}.order-details-back-button:hover{background:var(--color-green,#166534)}`}</style>

        <section className="order-details-page">
          <div className="order-details-container">
            <div className="order-details-error">
              <div className="order-details-error-icon">
                <XCircle size={28} />
              </div>

              <h2>Order Not Found</h2>

              <p>{error || "We could not find this order."}</p>

              <Link to="/my-orders" className="order-details-back-button">
                <ArrowLeft size={17} />
                Back to My Orders
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const orderStatus = String(order.orderStatus || "").toUpperCase();

  const canTrack = orderStatus !== "DELIVERED" && orderStatus !== "CANCELLED";

  return (
    <>
      <style>{`.order-details-page{min-height:70vh;padding:42px 20px 70px;background:var(--bg-page,#f8fafc)}.order-details-container{width:min(1120px,100%);margin:0 auto}.order-details-topbar{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px}.order-details-back-link{display:inline-flex;align-items:center;gap:8px;color:var(--color-muted,#64748b);text-decoration:none;font-size:14px;font-weight:600}.order-details-back-link:hover{color:var(--color-primary,#111827)}.order-details-heading h1{margin:0 0 6px;color:var(--color-primary,#111827);font-size:30px;line-height:1.2}.order-details-heading p{margin:0;color:var(--color-muted,#64748b);font-size:14px}.order-details-header{padding:25px;margin-bottom:20px;background:var(--color-surface,#fff);border:1px solid var(--color-border,#e5e7eb);border-radius:18px;box-shadow:0 8px 25px rgba(15,23,42,.05)}.order-details-header-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.order-details-order-number{margin:0 0 7px;color:var(--color-primary,#111827);font-size:21px;font-weight:700}.order-details-date{display:flex;align-items:center;gap:7px;color:var(--color-muted,#64748b);font-size:14px}.order-details-status{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:999px;font-size:13px;font-weight:700;white-space:nowrap}.order-details-status.delivered{background:var(--color-green-pale,#dcfce7);color:var(--color-green,#15803d)}.order-details-status.shipped{background:#dbeafe;color:#1d4ed8}.order-details-status.processing,.order-details-status.confirmed{background:#fef3c7;color:#b45309}.order-details-status.pending{background:#f1f5f9;color:#475569}.order-details-status.cancelled{background:#fee2e2;color:#dc2626}.order-details-status.default{background:#f1f5f9;color:#475569}.order-details-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.8fr);gap:20px;align-items:start}.order-details-card{background:var(--color-surface,#fff);border:1px solid var(--color-border,#e5e7eb);border-radius:18px;box-shadow:0 8px 25px rgba(15,23,42,.05);overflow:hidden}.order-details-card-header{display:flex;align-items:center;gap:10px;padding:19px 21px;border-bottom:1px solid var(--color-border-light,#eef2f7)}.order-details-card-header-icon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--color-green-pale,#f1f5f9);color:var(--color-primary,#334155);flex-shrink:0}.order-details-card-header h2{margin:0;color:var(--color-primary,#111827);font-size:17px}.order-details-products{padding:0}.order-details-product{display:flex;gap:16px;padding:19px 21px;border-bottom:1px solid var(--color-border-light,#eef2f7)}.order-details-product:last-child{border-bottom:0}.order-details-product-image{width:82px;height:82px;border-radius:12px;object-fit:cover;background:#f1f5f9;border:1px solid var(--color-border,#e5e7eb);flex-shrink:0}.order-details-product-info{min-width:0;flex:1}.order-details-product-name{margin:0 0 6px;color:var(--color-primary,#111827);font-size:16px;font-weight:700}.order-details-product-meta{display:flex;flex-wrap:wrap;gap:7px 14px;color:var(--color-muted,#64748b);font-size:13px;line-height:1.5}.order-details-product-price{display:flex;align-items:flex-start;flex-direction:column;gap:4px;min-width:105px;text-align:right}.order-details-product-price strong{color:var(--color-primary,#111827);font-size:15px}.order-details-product-price span{color:var(--color-muted,#64748b);font-size:12px}.order-details-summary{padding:20px 21px;border-top:1px solid var(--color-border-light,#eef2f7)}.order-details-summary-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:7px 0;color:var(--color-muted,#64748b);font-size:14px}.order-details-summary-row strong{color:#334155;font-weight:600}.order-details-summary-total{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:10px;padding-top:16px;border-top:1px dashed #cbd5e1}.order-details-summary-total span{color:var(--color-primary,#111827);font-size:16px;font-weight:700}.order-details-summary-total strong{color:var(--color-primary,#111827);font-size:20px}.order-details-info{padding:20px 21px}.order-details-info-row{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9}.order-details-info-row:first-child{padding-top:0}.order-details-info-row:last-child{padding-bottom:0;border-bottom:0}.order-details-info-icon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:#475569;background:var(--color-green-pale,#f8fafc);border-radius:8px;flex-shrink:0}.order-details-info-content{min-width:0}.order-details-info-label{display:block;margin-bottom:3px;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.order-details-info-value{color:#334155;font-size:14px;line-height:1.55;word-break:break-word}.order-details-payment-status{display:inline-flex;align-items:center;padding:5px 9px;border-radius:7px;font-size:12px;font-weight:700}.order-details-payment-status.paid{background:var(--color-green-pale,#dcfce7);color:var(--color-green,#15803d)}.order-details-payment-status.failed{background:#fee2e2;color:#dc2626}.order-details-payment-status.refunded{background:#ede9fe;color:#6d28d9}.order-details-payment-status.payment-pending{background:#fef3c7;color:#b45309}.order-details-actions{display:flex;gap:10px;margin-top:20px}.order-details-action{flex:1;min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;transition:.2s ease}.order-details-action-primary{background:var(--color-primary,#111827);color:#fff}.order-details-action-primary:hover{background:var(--color-green,#166534)}.order-details-action-secondary{background:var(--color-surface,#fff);color:#334155;border:1px solid var(--color-border,#dbe2ea)}.order-details-action-secondary:hover{background:var(--color-green-pale,#f8fafc)}.order-details-cancelled{display:flex;gap:12px;align-items:flex-start;margin-bottom:20px;padding:15px 17px;background:#fff7f7;border:1px solid #fecaca;border-radius:14px;color:#991b1b}.order-details-cancelled strong{display:block;margin-bottom:3px;color:#991b1b;font-size:14px}.order-details-cancellation-reason{margin-top:8px;color:#991b1b;font-size:13px;line-height:1.5}@media(max-width:850px){.order-details-grid{grid-template-columns:1fr}}@media(max-width:650px){.order-details-page{padding:28px 14px 50px}.order-details-topbar{align-items:flex-start;flex-direction:column;margin-bottom:18px}.order-details-heading h1{font-size:25px}.order-details-header{padding:19px}.order-details-header-top{flex-direction:column;gap:13px}.order-details-product{gap:12px;padding:16px}.order-details-product-image{width:66px;height:66px}.order-details-product-price{min-width:78px}.order-details-product-name{font-size:14px}.order-details-product-meta{font-size:12px}.order-details-actions{flex-direction:column}}`}</style>

      <section className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-topbar">
            <Link to="/my-orders" className="order-details-back-link">
              <ArrowLeft size={17} />
              Back to My Orders
            </Link>

            <div className="order-details-heading">
              <h1>Order Details</h1>
              <p>Complete information about your order</p>
            </div>
          </div>

          <div className="order-details-header">
            <div className="order-details-header-top">
              <div>
                <h2 className="order-details-order-number">Order #{order.orderNumber || "—"}</h2>

                <div className="order-details-date">
                  <CalendarDays size={15} />
                  Placed on {formatDateTime(order.createdAt)}
                </div>
              </div>

              <div className={`order-details-status ${getStatusClass(order.orderStatus)}`}>
                {getStatusIcon(order.orderStatus)}
                {getOrderStatusLabel(order.orderStatus)}
              </div>
            </div>
          </div>

          {orderStatus === "CANCELLED" && (
            <div className="order-details-cancelled">
              <XCircle size={20} />

              <div>
                <strong>Order Cancelled</strong>

                <span>{order.cancelledAt ? `This order was cancelled on ${formatDateTime(order.cancelledAt)}.` : "This order has been cancelled."}</span>

                {order.cancellationReason && (
                  <div className="order-details-cancellation-reason">
                    <strong>Reason:</strong> {order.cancellationReason}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="order-details-grid">
            <div>
              <div className="order-details-card">
                <div className="order-details-card-header">
                  <div className="order-details-card-header-icon">
                    <ShoppingBag size={18} />
                  </div>

                  <h2>Products in this Order</h2>
                </div>

                <div className="order-details-products">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div className="order-details-product" key={item.productId || `${item.slug || item.name || "product"}-${index}`}>
                        {item.image ? <img src={item.image} alt={item.name || "Product"} className="order-details-product-image" /> : <div className="order-details-product-image" />}

                        <div className="order-details-product-info">
                          <h3 className="order-details-product-name">{item.name || "Product"}</h3>

                          <div className="order-details-product-meta">
                            {item.unit && <span>Unit: {item.unit}</span>}

                            <span>Quantity: {Number(item.quantity || 0)}</span>

                            <span>Price: {formatCurrency(item.price)}</span>
                          </div>
                        </div>

                        <div className="order-details-product-price">
                          <strong>{formatCurrency(item.total ?? Number(item.price || 0) * Number(item.quantity || 0))}</strong>

                          <span>Item Total</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "30px 20px",
                        textAlign: "center",
                        color: "var(--color-muted, #64748b)",
                      }}>
                      No products found for this order.
                    </div>
                  )}
                </div>

                <div className="order-details-summary">
                  <div className="order-details-summary-row">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(order.subtotal)}</strong>
                  </div>

                  <div className="order-details-summary-row">
                    <span>Delivery Charge</span>

                    <strong>{Number(order.deliveryCharge || 0) === 0 ? "Free" : formatCurrency(order.deliveryCharge)}</strong>
                  </div>

                  <div className="order-details-summary-total">
                    <span>Grand Total</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="order-details-card">
                <div className="order-details-card-header">
                  <div className="order-details-card-header-icon">
                    <MapPin size={18} />
                  </div>

                  <h2>Delivery Details</h2>
                </div>

                <div className="order-details-info">
                  <div className="order-details-info-row">
                    <div className="order-details-info-icon">
                      <MapPin size={16} />
                    </div>

                    <div className="order-details-info-content">
                      <span className="order-details-info-label">Delivery Address</span>

                      <div className="order-details-info-value">
                        {shippingAddress.fullName && (
                          <strong>
                            {shippingAddress.fullName}
                            <br />
                          </strong>
                        )}

                        {shippingAddress.address || "—"}
                        <br />

                        {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(", ")}

                        {shippingAddress.pincode && (
                          <>
                            {" - "}
                            {shippingAddress.pincode}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="order-details-info-row">
                    <div className="order-details-info-icon">
                      <Phone size={16} />
                    </div>

                    <div className="order-details-info-content">
                      <span className="order-details-info-label">Phone</span>

                      <div className="order-details-info-value">{shippingAddress.phone || "—"}</div>
                    </div>
                  </div>

                  <div className="order-details-info-row">
                    <div className="order-details-info-icon">
                      <Mail size={16} />
                    </div>

                    <div className="order-details-info-content">
                      <span className="order-details-info-label">Email</span>

                      <div className="order-details-info-value">{shippingAddress.email || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-details-card" style={{ marginTop: "20px" }}>
                <div className="order-details-card-header">
                  <div className="order-details-card-header-icon">
                    <CreditCard size={18} />
                  </div>

                  <h2>Payment Information</h2>
                </div>

                <div className="order-details-info">
                  <div className="order-details-info-row">
                    <div className="order-details-info-icon">
                      <CreditCard size={16} />
                    </div>

                    <div className="order-details-info-content">
                      <span className="order-details-info-label">Payment Method</span>

                      <div className="order-details-info-value">{order.paymentMethod || "—"}</div>
                    </div>
                  </div>

                  <div className="order-details-info-row">
                    <div className="order-details-info-icon">
                      <Receipt size={16} />
                    </div>

                    <div className="order-details-info-content">
                      <span className="order-details-info-label">Payment Status</span>

                      <div className="order-details-info-value">
                        <span className={`order-details-payment-status ${getPaymentStatusClass(order.paymentStatus)}`}>{getPaymentStatusLabel(order.paymentStatus)}</span>
                      </div>
                    </div>
                  </div>

                  {order.paidAt && (
                    <div className="order-details-info-row">
                      <div className="order-details-info-icon">
                        <CalendarDays size={16} />
                      </div>

                      <div className="order-details-info-content">
                        <span className="order-details-info-label">Paid On</span>

                        <div className="order-details-info-value">{formatDateTime(order.paidAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-details-actions">
                {canTrack && (
                  <Link to={`/track-order/${order._id}`} className="order-details-action order-details-action-primary">
                    Track Order
                    <ChevronRight size={16} />
                  </Link>
                )}

                <Link to="/my-orders" className="order-details-action order-details-action-secondary">
                  <ArrowLeft size={16} />
                  My Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default OrderDetails;
