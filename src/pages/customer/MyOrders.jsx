import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, ChevronRight, Clock3, LoaderCircle, Package, ShoppingBag, Truck } from "lucide-react";

import apiRequest from "../../api/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await apiRequest("/orders");

        if (!mounted) return;

        if (!response?.success) {
          throw new Error(response?.message || "Unable to load your orders.");
        }

        setOrders(Array.isArray(response.orders) ? response.orders : []);
      } catch (error) {
        if (!mounted) return;

        setErrorMessage(error?.message || "Unable to load your orders.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

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

  const getStatusIcon = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "DELIVERED") {
      return <CheckCircle2 size={18} />;
    }

    if (normalizedStatus === "SHIPPED") {
      return <Truck size={18} />;
    }

    if (normalizedStatus === "CONFIRMED" || normalizedStatus === "PROCESSING") {
      return <Package size={18} />;
    }

    if (normalizedStatus === "CANCELLED") {
      return <AlertCircle size={18} />;
    }

    return <Clock3 size={18} />;
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "DELIVERED") {
      return "status-delivered";
    }

    if (normalizedStatus === "SHIPPED") {
      return "status-shipped";
    }

    if (normalizedStatus === "CONFIRMED" || normalizedStatus === "PROCESSING") {
      return "status-processing";
    }

    if (normalizedStatus === "CANCELLED") {
      return "status-cancelled";
    }

    return "status-pending";
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "All") {
      return orders;
    }

    return orders.filter((order) => String(order.orderStatus || "").toUpperCase() === activeTab);
  }, [orders, activeTab]);

  const tabs = [
    { label: "All", value: "All" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="orders-loading">
            <div className="orders-loading-icon">
              <LoaderCircle size={38} />
            </div>

            <h1>Loading Your Orders</h1>

            <p>Please wait while we securely fetch your order history.</p>
          </div>
        </div>

        <style>{`.my-orders-page{min-height:100vh;background:#fffdf8;padding:110px 20px 60px}.my-orders-container{width:min(1100px,100%);margin:0 auto}.orders-loading{max-width:520px;margin:80px auto;text-align:center}.orders-loading-icon{display:grid;place-items:center;width:82px;height:82px;margin:0 auto 22px;border-radius:50%;background:#f5eadf;color:#8a5a32}.orders-loading-icon svg{animation:ordersSpin 1s linear infinite}.orders-loading h1{margin:0 0 10px;color:#2f241d;font-size:30px}.orders-loading p{margin:0;color:#766b63;font-size:14px;line-height:1.7}@keyframes ordersSpin{to{transform:rotate(360deg)}}@media (max-width:575px){.my-orders-page{padding:95px 14px 40px}.orders-loading{margin:50px auto}.orders-loading h1{font-size:25px}}`}</style>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="orders-error">
            <div className="orders-error-icon">
              <AlertCircle size={42} />
            </div>

            <span className="orders-eyebrow">ORDER HISTORY</span>

            <h1>Unable to Load Orders</h1>

            <p>{errorMessage}</p>

            <Link to="/products" className="shop-now-btn">
              Shop Products
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        <style>{`.my-orders-page{min-height:100vh;background:#fffdf8;padding:110px 20px 60px}.my-orders-container{width:min(1100px,100%);margin:0 auto}.orders-error{max-width:620px;margin:70px auto;text-align:center}.orders-error-icon{display:grid;place-items:center;width:90px;height:90px;margin:0 auto 22px;border-radius:50%;background:rgba(180,60,45,.1);color:#b43c2d}.orders-eyebrow{display:block;margin-bottom:9px;color:#8a5a32;font-size:12px;font-weight:700;letter-spacing:1.5px}.orders-error h1{margin:0 0 12px;color:#2f241d;font-size:clamp(28px,5vw,40px)}.orders-error p{max-width:540px;margin:0 auto 25px;color:#766b63;font-size:14px;line-height:1.7}.shop-now-btn{display:inline-flex;align-items:center;gap:5px;padding:11px 16px;border-radius:9px;background:#8a5a32;color:#fff;text-decoration:none;font-size:13px;font-weight:700}`}</style>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        <div className="orders-header">
          <div>
            <p className="orders-eyebrow">BR30 KADAKNATH FARMS</p>

            <h1>My Orders</h1>

            <p className="orders-subtitle">View your orders, products and delivery status.</p>
          </div>

          <div className="orders-header-icon">
            <ShoppingBag size={26} />
          </div>
        </div>

        {orders.length > 0 && (
          <div className="orders-tabs">
            {tabs.map((tab) => (
              <button key={tab.value} type="button" className={`orders-tab ${activeTab === tab.value ? "active" : ""}`} onClick={() => setActiveTab(tab.value)}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <Package size={42} />

              <h3>{orders.length === 0 ? "No orders yet" : "No orders found"}</h3>

              <p>{orders.length === 0 ? "Your completed orders will appear here." : "You do not have any orders in this category yet."}</p>

              <Link to="/products" className="shop-now-btn">
                Shop Products
                <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderStatus = String(order.orderStatus || "PENDING").toUpperCase();

              const paymentStatus = String(order.paymentStatus || "PENDING").toUpperCase();

              const items = Array.isArray(order.items) ? order.items : [];

              const canTrack = orderStatus !== "DELIVERED" && orderStatus !== "CANCELLED";

              return (
                <div className="order-card" key={order._id || order.orderNumber}>
                  <div className="order-card-header">
                    <div>
                      <p className="order-number">Order #{order.orderNumber}</p>

                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className={`order-status ${getStatusClass(orderStatus)}`}>
                      {getStatusIcon(orderStatus)}

                      <span>{getStatusLabel(orderStatus)}</span>
                    </div>
                  </div>

                  <div className="order-products">
                    {items.length > 0 ? (
                      items.map((item, index) => {
                        const itemTotal = Number(item.total || Number(item.price || 0) * Number(item.quantity || 0));

                        return (
                          <div className="order-product" key={`${order._id || order.orderNumber}-${item.productId || item.slug || index}`}>
                            <div className="order-product-image">{item.image ? <img src={item.image} alt={item.name || "Product"} className="order-product-image-img" loading="lazy" /> : <Package size={22} />}</div>

                            <div className="order-product-info">
                              <h3>{item.name}</h3>

                              <p>
                                Qty: {Number(item.quantity || 0)}
                                {item.unit ? ` · ${item.unit}` : ""}
                              </p>
                            </div>

                            <div className="order-product-price">{formatPrice(itemTotal)}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="order-no-items">
                        <Package size={20} />
                        <span>Product details are unavailable for this order.</span>
                      </div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span>Total</span>

                      <strong>{formatPrice(order.total)}</strong>
                    </div>

                    <div className="order-meta">
                      <span className={`payment-status payment-${paymentStatus.toLowerCase()}`}>Payment: {paymentStatus}</span>
                    </div>

                    <div className="order-actions">
                      {canTrack && (
                        <Link to={`/track-order/${order._id}`} className="track-order-btn">
                          Track Order
                          <ChevronRight size={17} />
                        </Link>
                      )}

                      <Link to={`/order-details/${order._id}`} className="view-order-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`.my-orders-page{min-height:100vh;background:#fffdf8;padding:110px 20px 60px}.my-orders-container{width:min(1100px,100%);margin:0 auto}.orders-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:30px}.orders-eyebrow{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#8a5a32}.orders-header h1{margin:0;color:#2f241d;font-size:clamp(30px,5vw,42px);line-height:1.15}.orders-subtitle{margin:10px 0 0;color:#766b63;font-size:15px}.orders-header-icon{width:54px;height:54px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:16px;background:#f5eadf;color:#8a5a32}.orders-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:5px;margin-bottom:22px;scrollbar-width:none}.orders-tabs::-webkit-scrollbar{display:none}.orders-tab{border:1px solid #eadfd5;background:#fff;color:#6d625a;padding:10px 16px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:.2s ease}.orders-tab:hover{border-color:#c9a27c}.orders-tab.active{background:#8a5a32;border-color:#8a5a32;color:#fff}.orders-list{display:grid;gap:18px}.order-card{background:#fff;border:1px solid #eee4db;border-radius:18px;overflow:hidden;box-shadow:0 8px 25px rgba(70,45,25,.05)}.order-card-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:18px 20px;border-bottom:1px solid #f0e8e1}.order-number{margin:0;color:#332820;font-size:14px;font-weight:700;word-break:break-word}.order-date{margin:5px 0 0;color:#887c73;font-size:12px}.order-status{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}.status-delivered{background:#eaf7ed;color:#2f7a43}.status-shipped{background:#fff4df;color:#9a6817}.status-processing{background:#f1eefb;color:#6851a5}.status-pending{background:#fff4df;color:#9a6817}.status-cancelled{background:#fdeceb;color:#b43c2d}.order-products{padding:6px 20px}.order-product{display:flex;align-items:center;gap:13px;padding:14px 0;border-bottom:1px solid #f2ebe5}.order-product:last-child{border-bottom:0}.order-product-image{width:48px;height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:11px;background:#f8efe7;color:#8a5a32}.order-product-image-img{width:100%;height:100%;display:block;object-fit:contain;object-position:center;border-radius:11px}.order-product-info{min-width:0;flex:1}.order-product-info h3{margin:0;color:#332820;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.order-product-info p{margin:5px 0 0;color:#887c73;font-size:12px}.order-product-price{color:#332820;font-size:14px;font-weight:700;white-space:nowrap}.order-no-items{display:flex;align-items:center;gap:9px;padding:17px 0;color:#887c73;font-size:13px}.order-no-items svg{flex-shrink:0;color:#8a5a32}.order-card-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:16px 20px;background:#fcf9f5;border-top:1px solid #f0e8e1}.order-total{display:flex;align-items:center;gap:9px}.order-total span{color:#887c73;font-size:13px}.order-total strong{color:#332820;font-size:18px}.order-meta{margin-left:auto}.payment-status{display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.03em}.payment-paid{background:#eaf7ed;color:#2f7a43}.payment-failed{background:#fdeceb;color:#b43c2d}.payment-pending,.payment-processing{background:#fff4df;color:#9a6817}.payment-initiated{background:#f1eefb;color:#6851a5}.order-actions{display:flex;align-items:center;gap:9px}.track-order-btn,.view-order-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:38px;padding:0 13px;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;transition:.2s ease}.track-order-btn{border:1px solid #8a5a32;background:#8a5a32;color:#fff}.track-order-btn:hover{background:#744925;border-color:#744925}.view-order-btn{border:1px solid #dfd1c5;background:#fff;color:#6d5140}.view-order-btn:hover{border-color:#b99778}.empty-orders{padding:60px 20px;text-align:center;background:#fff;border:1px solid #eee4db;border-radius:18px;color:#8a5a32}.empty-orders h3{margin:14px 0 6px;color:#332820;font-size:20px}.empty-orders p{margin:0 0 20px;color:#887c73;font-size:14px}.shop-now-btn{display:inline-flex;align-items:center;gap:5px;padding:11px 16px;border-radius:9px;background:#8a5a32;color:#fff;text-decoration:none;font-size:13px;font-weight:700}@media (max-width:800px){.order-card-footer{align-items:flex-start;flex-wrap:wrap}.order-meta{margin-left:0}.order-actions{margin-left:auto}}@media (max-width:700px){.my-orders-page{padding:95px 14px 40px}.orders-header{align-items:flex-start}.orders-header-icon{width:46px;height:46px;border-radius:13px}.order-card-header{align-items:flex-start;flex-direction:column}.order-status{align-self:flex-start}.order-card-footer{align-items:flex-start;flex-direction:column}.order-meta{margin-left:0}.order-actions{width:100%;margin-left:0}.track-order-btn,.view-order-btn{flex:1}}@media (max-width:430px){.order-product-price{font-size:13px}.order-product-image{width:44px;height:44px}.order-actions{flex-direction:column}.track-order-btn,.view-order-btn{width:100%}}`}</style>
    </div>
  );
};

export default MyOrders;
