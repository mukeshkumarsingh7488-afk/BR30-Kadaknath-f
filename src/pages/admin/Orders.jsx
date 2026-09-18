import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Eye, Loader2, Mail, MapPin, Package, Phone, RefreshCw, Search, ShoppingBag, Truck, User, X, CheckCircle2, XCircle } from "lucide-react";

import apiRequest from "../../api/api";
import { showError, showSuccess } from "../../utils/sweetAlert";

const ORDER_STATUSES = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["ALL", "PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"];
const ADMIN_UPDATE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusLabel = (status) => {
  const labels = {
    PENDING: "Order Placed",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return labels[status] || status || "Unknown";
};

const paymentStatusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  };

  return labels[status] || status || "Unknown";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getOrderStatusClass = (status) => {
  const classes = {
    PENDING: "status-pending",
    CONFIRMED: "status-confirmed",
    PROCESSING: "status-processing",
    SHIPPED: "status-shipped",
    DELIVERED: "status-delivered",
    CANCELLED: "status-cancelled",
  };

  return classes[status] || "status-pending";
};

const getPaymentStatusClass = (status) => {
  const classes = {
    PENDING: "payment-pending",
    PROCESSING: "payment-processing",
    PAID: "payment-paid",
    FAILED: "payment-failed",
    REFUNDED: "payment-refunded",
  };

  return classes[status] || "payment-pending";
};

const getStatusIcon = (status) => {
  if (status === "DELIVERED") {
    return <CheckCircle2 size={15} />;
  }

  if (status === "SHIPPED") {
    return <Truck size={15} />;
  }

  if (status === "CANCELLED") {
    return <XCircle size={15} />;
  }

  if (status === "PROCESSING") {
    return <Package size={15} />;
  }

  return <Clock3 size={15} />;
};

const isOrderLocked = (status) => {
  return status === "DELIVERED" || status === "CANCELLED";
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [statusUpdates, setStatusUpdates] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [cancellationModal, setCancellationModal] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const fetchOrders = async (showRefreshLoader = false) => {
    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiRequest("/orders/admin/all");

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load orders.");
      }

      const nextOrders = Array.isArray(response.orders) ? response.orders : [];

      setOrders(nextOrders);

      setStatusUpdates((current) => {
        const next = { ...current };

        nextOrders.forEach((order) => {
          if (order?._id) {
            next[order._id] = order.orderStatus || "PENDING";
          }
        });

        return next;
      });

      setSelectedOrder((currentSelectedOrder) => {
        if (!currentSelectedOrder?._id) {
          return currentSelectedOrder;
        }

        const updatedSelectedOrder = nextOrders.find((order) => String(order._id) === String(currentSelectedOrder._id));

        return updatedSelectedOrder || currentSelectedOrder;
      });
    } catch (err) {
      console.error("Admin orders fetch error:", err);

      const message = err?.data?.message || err?.response?.data?.message || err?.message || "Unable to load orders.";

      setError(message);

      if (!showRefreshLoader) {
        showError("Orders Error", message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, nextStatus) => {
    const order = orders.find((item) => String(item._id) === String(orderId));

    if (!order) {
      return;
    }

    if (nextStatus === "CANCELLED") {
      setCancellationReason("");
      setCancellationModal(order);
      return;
    }

    setStatusUpdates((current) => ({
      ...current,
      [orderId]: nextStatus,
    }));
  };

  const updateOrderStatus = async (order, reason = "") => {
    if (!order?._id) {
      showError("Update Failed", "Order ID is missing.");
      return false;
    }

    const currentStatus = String(order.orderStatus || "").toUpperCase();
    const nextStatus = String(statusUpdates[order._id] || currentStatus).toUpperCase();

    if (isOrderLocked(currentStatus)) {
      showError("Status Locked", `${statusLabel(currentStatus)} orders cannot be changed.`);

      setStatusUpdates((current) => ({
        ...current,
        [order._id]: currentStatus,
      }));

      return false;
    }

    if (!ADMIN_UPDATE_STATUSES.includes(nextStatus)) {
      showError("Invalid Status", "Please select a valid order status.");
      return false;
    }

    if (nextStatus === currentStatus) {
      return false;
    }

    if (nextStatus === "DELIVERED") {
      const currentPaymentStatus = String(order.paymentStatus || "").toUpperCase();

      if (currentPaymentStatus !== "PAID") {
        showError("Payment Required", "An order cannot be marked as Delivered until its payment status is PAID.");

        setStatusUpdates((current) => ({
          ...current,
          [order._id]: currentStatus,
        }));

        return false;
      }
    }

    if (nextStatus === "CANCELLED") {
      const trimmedReason = String(reason || "").trim();

      if (!trimmedReason) {
        showError("Cancellation Reason Required", "Please enter a reason for cancelling this order.");
        return false;
      }
    }

    try {
      setUpdatingOrderId(order._id);

      const requestBody = {
        orderStatus: nextStatus,
      };

      if (nextStatus === "CANCELLED") {
        requestBody.cancellationReason = String(reason || "").trim();
      }

      const response = await apiRequest(`/orders/admin/${order._id}/status`, {
        method: "PUT",
        body: requestBody,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update order status.");
      }

      showSuccess("Status Updated", `Order ${order.orderNumber || ""} is now ${statusLabel(nextStatus)}.`);

      setCancellationModal(null);
      setCancellationReason("");

      await fetchOrders(true);

      return true;
    } catch (err) {
      console.error("Admin order status update error:", err);

      const message = err?.data?.message || err?.response?.data?.message || err?.message || "Unable to update order status.";

      showError("Update Failed", message);

      setStatusUpdates((current) => ({
        ...current,
        [order._id]: currentStatus,
      }));

      return false;
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationModal?._id) {
      return;
    }

    const reason = cancellationReason.trim();

    if (!reason) {
      showError("Reason Required", "Please enter a cancellation reason.");
      return;
    }

    if (reason.length > 500) {
      showError("Reason Too Long", "Cancellation reason cannot exceed 500 characters.");
      return;
    }

    setStatusUpdates((current) => ({
      ...current,
      [cancellationModal._id]: "CANCELLED",
    }));

    await updateOrderStatus(cancellationModal, reason);
  };

  const updateSelectedOrderStatus = async () => {
    if (!selectedOrder?._id) {
      return;
    }

    await updateOrderStatus(selectedOrder);
  };

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = order?.user || {};
      const shipping = order?.shippingAddress || {};

      const searchableText = [order?.orderNumber, customer?.name, customer?.email, customer?.phone, shipping?.fullName, shipping?.email, shipping?.phone, shipping?.city, shipping?.state, shipping?.pincode].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesOrderStatus = orderStatus === "ALL" || String(order?.orderStatus || "").toUpperCase() === orderStatus;
      const matchesPaymentStatus = paymentStatus === "ALL" || String(order?.paymentStatus || "").toUpperCase() === paymentStatus;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [orders, search, orderStatus, paymentStatus]);

  const statistics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((order) => order?.orderStatus === "PENDING" || order?.orderStatus === "CONFIRMED" || order?.orderStatus === "PROCESSING").length;
    const shipped = orders.filter((order) => order?.orderStatus === "SHIPPED").length;
    const delivered = orders.filter((order) => order?.orderStatus === "DELIVERED").length;
    const paidRevenue = orders.filter((order) => order?.paymentStatus === "PAID").reduce((sum, order) => sum + Number(order?.total || 0), 0);

    return { total, pending, shipped, delivered, paidRevenue };
  }, [orders]);

  const clearFilters = () => {
    setSearch("");
    setOrderStatus("ALL");
    setPaymentStatus("ALL");
  };

  const openOrder = (order) => {
    setSelectedOrder(order);

    setStatusUpdates((current) => ({
      ...current,
      [order._id]: order.orderStatus || "PENDING",
    }));
  };

  const closeOrder = () => {
    setSelectedOrder(null);
  };

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-container">
        <section className="admin-orders-header">
          <div>
            <div className="admin-orders-title-row">
              <div className="admin-orders-title-icon">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h1>Orders</h1>
                <p>Manage customer orders, payments and delivery status.</p>
              </div>
            </div>
          </div>

          <button type="button" className="admin-orders-refresh-btn" onClick={() => fetchOrders(true)} disabled={loading || refreshing || updatingOrderId !== null}>
            <RefreshCw size={17} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        <section className="admin-orders-stats">
          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon">
              <ShoppingBag size={19} />
            </div>
            <div>
              <span>Total Orders</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon">
              <Clock3 size={19} />
            </div>
            <div>
              <span>Active Orders</span>
              <strong>{statistics.pending}</strong>
            </div>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon">
              <Truck size={19} />
            </div>
            <div>
              <span>Out for Delivery</span>
              <strong>{statistics.shipped}</strong>
            </div>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <span>Delivered</span>
              <strong>{statistics.delivered}</strong>
            </div>
          </div>

          <div className="admin-order-stat-card">
            <div className="admin-order-stat-icon">
              <span>₹</span>
            </div>
            <div>
              <span>Paid Revenue</span>
              <strong>{formatCurrency(statistics.paidRevenue)}</strong>
            </div>
          </div>
        </section>

        <section className="admin-orders-toolbar">
          <div className="admin-orders-search">
            <Search size={18} />

            <input type="text" placeholder="Search order number, customer, email, phone..." value={search} onChange={(event) => setSearch(event.target.value)} />

            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-orders-filter">
            <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Order Status" : statusLabel(status)}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="admin-orders-filter">
            <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Payment Status" : paymentStatusLabel(status)}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          {(search || orderStatus !== "ALL" || paymentStatus !== "ALL") && (
            <button type="button" className="admin-orders-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </section>

        {loading ? (
          <section className="admin-orders-state">
            <Loader2 size={34} className="spin" />
            <h3>Loading orders...</h3>
            <p>Please wait while we fetch the latest orders.</p>
          </section>
        ) : error ? (
          <section className="admin-orders-state admin-orders-error-state">
            <AlertCircle size={36} />
            <h3>Unable to load orders</h3>
            <p>{error}</p>
            <button type="button" onClick={() => fetchOrders()} className="admin-orders-retry-btn">
              Try Again
            </button>
          </section>
        ) : filteredOrders.length === 0 ? (
          <section className="admin-orders-state">
            <Package size={40} />
            <h3>{orders.length === 0 ? "No orders yet" : "No matching orders"}</h3>
            <p>{orders.length === 0 ? "Customer orders will appear here after successful checkout." : "Try changing your search or filters."}</p>

            {orders.length > 0 && (
              <button type="button" onClick={clearFilters} className="admin-orders-retry-btn">
                Clear Filters
              </button>
            )}
          </section>
        ) : (
          <section className="admin-orders-table-card">
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const customer = order?.user || {};
                    const shipping = order?.shippingAddress || {};
                    const customerName = shipping?.fullName || customer?.name || "Customer";
                    const customerEmail = shipping?.email || customer?.email || "—";
                    const customerPhone = shipping?.phone || customer?.phone || "—";
                    const currentStatus = String(order?.orderStatus || "PENDING").toUpperCase();
                    const selectedStatus = statusUpdates[order._id] || currentStatus;
                    const locked = isOrderLocked(currentStatus);
                    const updating = String(updatingOrderId) === String(order._id);
                    const statusChanged = selectedStatus !== currentStatus;
                    const deliveredBlocked = selectedStatus === "DELIVERED" && String(order?.paymentStatus || "").toUpperCase() !== "PAID";

                    return (
                      <tr key={order._id}>
                        <td>
                          <div className="admin-order-number">
                            <strong>{order.orderNumber || "—"}</strong>
                            <span>{order._id ? String(order._id).slice(-8) : ""}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-order-customer">
                            <div className="admin-order-avatar">
                              <User size={16} />
                            </div>
                            <div>
                              <strong>{customerName}</strong>
                              <span>{customerEmail}</span>
                              {customerPhone !== "—" && <small>{customerPhone}</small>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-order-date">
                            <CalendarDays size={15} />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-order-items-count">
                            <Package size={15} />
                            <span>{Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0) : 0} item(s)</span>
                          </div>
                        </td>

                        <td>
                          <strong className="admin-order-total">{formatCurrency(order.total)}</strong>
                        </td>

                        <td>
                          <span className={`admin-payment-badge ${getPaymentStatusClass(order.paymentStatus)}`}>{paymentStatusLabel(order.paymentStatus)}</span>
                        </td>

                        <td>
                          <div className="admin-order-status-control">
                            <select
                              value={selectedStatus}
                              disabled={locked || updating}
                              onChange={(event) => handleStatusChange(order._id, event.target.value)}
                              aria-label={`Update status for ${order.orderNumber || "order"}`}
                              title={locked ? `${statusLabel(currentStatus)} orders are locked` : "Select order status"}>
                              {ADMIN_UPDATE_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {statusLabel(status)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} />
                          </div>

                          <div className="admin-order-status-update-row">
                            <button type="button" className="admin-order-update-btn" disabled={locked || updating || !statusChanged || deliveredBlocked} onClick={() => updateOrderStatus(order)}>
                              {updating ? (
                                <>
                                  <Loader2 size={13} className="spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update"
                              )}
                            </button>

                            {locked && <span className="admin-order-locked-text">Locked</span>}
                          </div>

                          {deliveredBlocked && !locked && statusChanged && <small className="admin-order-status-warning">Payment must be PAID</small>}
                        </td>

                        <td>
                          <button type="button" className="admin-order-view-btn" onClick={() => openOrder(order)}>
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-orders-table-footer">
              <span>
                Showing {filteredOrders.length} of {orders.length} orders
              </span>

              <div className="admin-orders-pagination">
                <button type="button" disabled>
                  <ChevronLeft size={16} />
                </button>
                <span>1</span>
                <button type="button" disabled>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {selectedOrder && (
        <div
          className="admin-order-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeOrder();
          }}>
          <div className="admin-order-modal">
            <div className="admin-order-modal-header">
              <div>
                <span>Order Details</span>
                <h2>{selectedOrder.orderNumber || "Order"}</h2>
              </div>

              <button type="button" onClick={closeOrder} aria-label="Close order details">
                <X size={20} />
              </button>
            </div>

            <div className="admin-order-modal-body">
              <div className="admin-order-detail-status-row">
                <span className={`admin-order-status-badge ${getOrderStatusClass(selectedOrder.orderStatus)}`}>
                  {getStatusIcon(selectedOrder.orderStatus)}
                  {statusLabel(selectedOrder.orderStatus)}
                </span>

                <span className={`admin-payment-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>{paymentStatusLabel(selectedOrder.paymentStatus)}</span>
              </div>

              <div className="admin-order-modal-status-editor">
                <div>
                  <span className="admin-order-modal-status-label">Update Order Status</span>
                  <small>{isOrderLocked(selectedOrder.orderStatus) ? "This order status is locked." : "Select a new status and update the order."}</small>
                </div>

                <div className="admin-order-modal-status-actions">
                  <div className="admin-orders-filter admin-order-modal-status-select">
                    <select value={statusUpdates[selectedOrder._id] || selectedOrder.orderStatus || "PENDING"} disabled={isOrderLocked(selectedOrder.orderStatus) || updatingOrderId !== null} onChange={(event) => handleStatusChange(selectedOrder._id, event.target.value)}>
                      {ADMIN_UPDATE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </div>

                  <button type="button" className="admin-order-modal-update-btn" disabled={isOrderLocked(selectedOrder.orderStatus) || updatingOrderId !== null || (statusUpdates[selectedOrder._id] || selectedOrder.orderStatus) === selectedOrder.orderStatus} onClick={updateSelectedOrderStatus}>
                    {String(updatingOrderId) === String(selectedOrder._id) ? (
                      <>
                        <Loader2 size={14} className="spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>

                {statusUpdates[selectedOrder._id] === "DELIVERED" && selectedOrder.paymentStatus !== "PAID" && selectedOrder.orderStatus !== "DELIVERED" && <small className="admin-order-status-warning modal-warning">Payment must be PAID before marking this order as Delivered.</small>}
              </div>

              <div className="admin-order-detail-grid">
                <div className="admin-order-detail-card">
                  <div className="admin-order-detail-card-title">
                    <User size={17} />
                    <h3>Customer</h3>
                  </div>

                  <p>
                    <strong>{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || "Customer"}</strong>
                  </p>

                  <p>
                    <Mail size={14} />
                    {selectedOrder.shippingAddress?.email || selectedOrder.user?.email || "—"}
                  </p>

                  <p>
                    <Phone size={14} />
                    {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "—"}
                  </p>
                </div>

                <div className="admin-order-detail-card">
                  <div className="admin-order-detail-card-title">
                    <MapPin size={17} />
                    <h3>Shipping Address</h3>
                  </div>

                  <p>{selectedOrder.shippingAddress?.address || "—"}</p>
                  <p>
                    {selectedOrder.shippingAddress?.city || "—"}, {selectedOrder.shippingAddress?.state || "—"}
                  </p>
                  <p>PIN: {selectedOrder.shippingAddress?.pincode || "—"}</p>
                </div>

                <div className="admin-order-detail-card">
                  <div className="admin-order-detail-card-title">
                    <CalendarDays size={17} />
                    <h3>Order Information</h3>
                  </div>

                  <p>
                    <span>Created:</span> {formatDateTime(selectedOrder.createdAt)}
                  </p>

                  <p>
                    <span>Payment:</span> {selectedOrder.paymentMethod || "PAYTM"}
                  </p>

                  <p>
                    <span>Paid At:</span> {formatDateTime(selectedOrder.paidAt)}
                  </p>

                  {selectedOrder.cancelledAt && (
                    <p>
                      <span>Cancelled At:</span> {formatDateTime(selectedOrder.cancelledAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-order-products-section">
                <div className="admin-order-detail-card-title">
                  <Package size={17} />
                  <h3>Order Items</h3>
                </div>

                <div className="admin-order-products-list">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div className="admin-order-product-row" key={`${item.productId || item.slug || item.name}-${index}`}>
                      <div className="admin-order-product-image">{item.image ? <img src={item.image} alt={item.name || "Product"} /> : <Package size={20} />}</div>

                      <div className="admin-order-product-info">
                        <strong>{item.name || "Product"}</strong>
                        <span>
                          Qty: {item.quantity || 0} × {item.unit || "unit"}
                        </span>
                        <small>Unit Price: {formatCurrency(item.price)}</small>
                      </div>

                      <strong className="admin-order-product-total">{formatCurrency(item.total)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-order-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(selectedOrder.subtotal)}</strong>
                </div>

                <div>
                  <span>Delivery</span>
                  <strong>{Number(selectedOrder.deliveryCharge || 0) === 0 ? "Free" : formatCurrency(selectedOrder.deliveryCharge)}</strong>
                </div>

                <div className="admin-order-summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(selectedOrder.total)}</strong>
                </div>
              </div>

              {selectedOrder.paytmOrderId && (
                <div className="admin-order-paytm-reference">
                  <span>Paytm Order ID</span>
                  <strong>{selectedOrder.paytmOrderId}</strong>
                </div>
              )}

              <div className="admin-order-created-info">
                <Clock3 size={14} />
                <span>Last updated: {formatDateTime(selectedOrder.updatedAt)}</span>
              </div>
            </div>

            <div className="admin-order-modal-footer">
              <button type="button" className="admin-order-close-btn" onClick={closeOrder}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {cancellationModal && (
        <div
          className="admin-order-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && updatingOrderId === null) {
              setCancellationModal(null);
              setCancellationReason("");
            }
          }}>
          <div className="admin-order-cancellation-modal">
            <div className="admin-order-modal-header">
              <div>
                <span>Cancel Order</span>
                <h2>{cancellationModal.orderNumber || "Order"}</h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (updatingOrderId === null) {
                    setCancellationModal(null);
                    setCancellationReason("");
                  }
                }}
                aria-label="Close cancellation modal"
                disabled={updatingOrderId !== null}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-order-cancellation-body">
              <div className="admin-order-cancellation-warning">
                <XCircle size={22} />
                <div>
                  <strong>Cancel this order?</strong>
                  <p>This action cannot be undone. Please enter the reason for cancellation.</p>
                </div>
              </div>

              <label htmlFor="cancellationReason">Cancellation Reason</label>

              <textarea id="cancellationReason" value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} placeholder="Enter the reason for cancelling this order..." maxLength={500} rows={5} disabled={updatingOrderId !== null} autoFocus />

              <div className="admin-order-cancellation-footer">
                <span>{cancellationReason.length}/500</span>

                <div>
                  <button
                    type="button"
                    className="admin-order-cancel-back-btn"
                    onClick={() => {
                      setCancellationModal(null);
                      setCancellationReason("");
                    }}
                    disabled={updatingOrderId !== null}>
                    Go Back
                  </button>

                  <button type="button" className="admin-order-confirm-cancel-btn" onClick={confirmCancellation} disabled={updatingOrderId !== null || !cancellationReason.trim()}>
                    {updatingOrderId !== null ? (
                      <>
                        <Loader2 size={14} className="spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        Cancel Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-orders-page{min-height:100vh;background:var(--admin-bg);padding:32px 20px 60px;color:var(--admin-text)}
        .admin-orders-container{max-width:1500px;margin:0 auto}
        .admin-orders-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}
        .admin-orders-title-row{display:flex;align-items:center;gap:14px}
        .admin-orders-title-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--admin-primary);color:#fff}
        .admin-orders-header h1{margin:0;font-size:28px;line-height:1.2;color:var(--admin-text)}
        .admin-orders-header p{margin:6px 0 0;color:var(--admin-muted);font-size:14px}
        .admin-orders-refresh-btn,.admin-orders-retry-btn{border:0;border-radius:10px;padding:11px 16px;background:var(--admin-primary);color:#fff;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
        .admin-orders-refresh-btn:disabled{opacity:.6;cursor:not-allowed}
        .admin-orders-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:22px}
        .admin-order-stat-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:18px;display:flex;align-items:center;gap:13px;box-shadow:0 3px 12px rgba(15,23,42,.04)}
        .admin-order-stat-icon{width:40px;height:40px;border-radius:11px;background:var(--admin-surface-2);color:var(--admin-text);display:flex;align-items:center;justify-content:center;flex:none}
        .admin-order-stat-icon span{font-weight:800;font-size:18px}
        .admin-order-stat-card span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:4px}
        .admin-order-stat-card strong{display:block;color:var(--admin-text);font-size:18px}
        .admin-orders-toolbar{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:center;margin-bottom:18px;box-shadow:0 3px 12px rgba(15,23,42,.04)}
        .admin-orders-search{height:42px;flex:1;min-width:240px;display:flex;align-items:center;gap:9px;border:1px solid var(--admin-border);border-radius:10px;padding:0 12px;color:var(--admin-muted)}
        .admin-orders-search input{border:0;outline:0;width:100%;font-size:14px;color:var(--admin-text);background:transparent}
        .admin-orders-search input::placeholder{color:var(--admin-muted)}
        .admin-orders-search button{border:0;background:transparent;color:var(--admin-muted);cursor:pointer;padding:3px}
        .admin-orders-filter{position:relative;min-width:180px}
        .admin-orders-filter select{appearance:none;width:100%;height:42px;border:1px solid var(--admin-border);border-radius:10px;padding:0 35px 0 12px;background:var(--admin-surface);color:var(--admin-text);outline:0;font-size:13px;cursor:pointer}
        .admin-orders-filter select:disabled{background:var(--admin-surface-2);color:var(--admin-muted);cursor:not-allowed}
        .admin-orders-filter svg{position:absolute;right:12px;top:13px;pointer-events:none;color:var(--admin-muted)}
        .admin-orders-clear-btn{height:42px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface);padding:0 14px;color:var(--admin-text);font-weight:700;cursor:pointer}
        .admin-orders-table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden;box-shadow:0 3px 12px rgba(15,23,42,.04)}
        .admin-orders-table-wrapper{overflow-x:auto}
        .admin-orders-table{width:100%;border-collapse:collapse;min-width:1280px}
        .admin-orders-table th{text-align:left;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding:14px 16px;border-bottom:1px solid var(--admin-border);white-space:nowrap}
        .admin-orders-table td{padding:15px 16px;border-bottom:1px solid var(--admin-border);vertical-align:middle;color:var(--admin-text)}
        .admin-orders-table tbody tr:hover{background:var(--admin-surface-2)}
        .admin-order-number strong{display:block;color:var(--admin-text);font-size:13px}
        .admin-order-number span{display:block;color:var(--admin-muted);font-size:11px;margin-top:3px}
        .admin-order-customer{display:flex;align-items:center;gap:10px;min-width:190px}
        .admin-order-avatar{width:34px;height:34px;border-radius:10px;background:var(--admin-surface-2);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;flex:none}
        .admin-order-customer strong{display:block;color:var(--admin-text);font-size:13px}
        .admin-order-customer span,.admin-order-customer small{display:block;color:var(--admin-muted);font-size:11px;margin-top:2px}
        .admin-order-date,.admin-order-items-count{display:flex;align-items:center;gap:6px;color:var(--admin-muted);font-size:12px;white-space:nowrap}
        .admin-order-total{font-size:14px;color:var(--admin-text);white-space:nowrap}
        .admin-order-status-badge,.admin-payment-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:700;white-space:nowrap}
        .status-pending{background:#fff7ed;color:#c2410c}
        .status-confirmed{background:#eff6ff;color:#1d4ed8}
        .status-processing{background:#f5f3ff;color:#6d28d9}
        .status-shipped{background:#ecfeff;color:#0f766e}
        .status-delivered{background:#ecfdf5;color:#047857}
        .status-cancelled{background:#fef2f2;color:#b91c1c}
        .payment-pending{background:#fff7ed;color:#c2410c}
        .payment-processing{background:#eff6ff;color:#1d4ed8}
        .payment-paid{background:#ecfdf5;color:#047857}
        .payment-failed{background:#fef2f2;color:#b91c1c}
        .payment-refunded{background:#f5f3ff;color:#6d28d9}
        .admin-order-status-control{position:relative;width:160px}
        .admin-order-status-control select{appearance:none;width:100%;height:34px;border:1px solid var(--admin-border);border-radius:8px;padding:0 28px 0 9px;background:var(--admin-surface);color:var(--admin-text);outline:0;font-size:11px;font-weight:700;cursor:pointer}
        .admin-order-status-control select:disabled{background:var(--admin-surface-2);color:var(--admin-muted);cursor:not-allowed}
        .admin-order-status-control svg{position:absolute;right:9px;top:10px;pointer-events:none;color:var(--admin-muted)}
        .admin-order-status-update-row{display:flex;align-items:center;gap:7px;margin-top:6px}
        .admin-order-update-btn{border:0;border-radius:7px;background:var(--admin-primary);color:#fff;padding:6px 9px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;min-width:62px}
        .admin-order-update-btn:hover{opacity:.9}
        .admin-order-update-btn:disabled{background:var(--admin-surface-2);color:var(--admin-muted);cursor:not-allowed}
        .admin-order-locked-text{font-size:9px;color:var(--admin-muted);font-weight:700}
        .admin-order-status-warning{display:block;color:var(--admin-danger);font-size:9px;margin-top:5px;font-weight:600}
        .admin-order-view-btn{border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface);color:var(--admin-text);padding:8px 11px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
        .admin-order-view-btn:hover{background:var(--admin-surface-2)}
        .admin-orders-table-footer{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;color:var(--admin-muted);font-size:12px}
        .admin-orders-pagination{display:flex;align-items:center;gap:5px}
        .admin-orders-pagination button,.admin-orders-pagination span{width:32px;height:32px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);display:flex;align-items:center;justify-content:center}
        .admin-orders-pagination span{background:var(--admin-primary);color:#fff;border-color:var(--admin-primary);font-weight:700}
        .admin-orders-pagination button{color:var(--admin-muted)}
        .admin-orders-state{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;color:var(--admin-muted)}
        .admin-orders-state svg{margin-bottom:12px}
        .admin-orders-state h3{margin:0 0 7px;color:var(--admin-text);font-size:18px}
        .admin-orders-state p{margin:0 0 18px;font-size:13px}
        .admin-orders-error-state{color:var(--admin-danger)}
        .admin-orders-error-state h3{color:var(--admin-danger)}
        .admin-order-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:1000;padding:20px;display:flex;align-items:center;justify-content:center;overflow:auto}
        .admin-order-modal{width:min(900px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface);border-radius:18px;box-shadow:0 24px 70px rgba(15,23,42,.25)}
        .admin-order-modal-header{padding:20px 22px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:15px}
        .admin-order-modal-header span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:4px}
        .admin-order-modal-header h2{margin:0;color:var(--admin-text);font-size:20px}
        .admin-order-modal-header button{width:36px;height:36px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface);display:flex;align-items:center;justify-content:center;color:var(--admin-muted);cursor:pointer}
        .admin-order-modal-body{padding:22px}
        .admin-order-modal-status-editor{border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2);padding:14px;margin-bottom:18px}
        .admin-order-modal-status-label{display:block;color:var(--admin-text);font-size:12px;font-weight:800}
        .admin-order-modal-status-editor>div:first-child small{display:block;color:var(--admin-muted);font-size:10px;margin-top:3px}
        .admin-order-modal-status-actions{display:flex;align-items:center;gap:9px;margin-top:10px}
        .admin-order-modal-status-select{min-width:190px}
        .admin-order-modal-update-btn{height:42px;border:0;border-radius:9px;background:var(--admin-primary);color:#fff;padding:0 14px;font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}
        .admin-order-modal-update-btn:hover{opacity:.9}
        .admin-order-modal-update-btn:disabled{background:var(--admin-surface-2);color:var(--admin-muted);cursor:not-allowed}
        .modal-warning{margin-top:9px;font-size:10px}
        .admin-order-detail-status-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:18px}
        .admin-order-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px}
        .admin-order-detail-card{border:1px solid var(--admin-border);border-radius:12px;padding:15px;background:var(--admin-surface-2)}
        .admin-order-detail-card-title{display:flex;align-items:center;gap:7px;color:var(--admin-text);margin-bottom:12px}
        .admin-order-detail-card-title h3{margin:0;font-size:13px}
        .admin-order-detail-card p{margin:6px 0;color:var(--admin-muted);font-size:12px;line-height:1.5}
        .admin-order-detail-card p strong{color:var(--admin-text)}
        .admin-order-detail-card p svg{vertical-align:-3px;margin-right:5px}
        .admin-order-products-section{border:1px solid var(--admin-border);border-radius:12px;padding:15px;margin-bottom:18px}
        .admin-order-products-list{display:flex;flex-direction:column;gap:10px}
        .admin-order-product-row{display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface)}
        .admin-order-product-image{width:54px;height:54px;border-radius:9px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;color:var(--admin-muted)}
        .admin-order-product-image img{width:100%;height:100%;object-fit:cover}
        .admin-order-product-info{flex:1;min-width:0}
        .admin-order-product-info strong{display:block;color:var(--admin-text);font-size:13px}
        .admin-order-product-info span,.admin-order-product-info small{display:block;color:var(--admin-muted);font-size:11px;margin-top:3px}
        .admin-order-product-total{color:var(--admin-text);font-size:13px;white-space:nowrap}
        .admin-order-summary{border:1px solid var(--admin-border);border-radius:12px;padding:14px 16px;margin-bottom:15px}
        .admin-order-summary div{display:flex;align-items:center;justify-content:space-between;padding:6px 0;color:var(--admin-muted);font-size:13px}
        .admin-order-summary strong{color:var(--admin-text)}
        .admin-order-summary-total{border-top:1px solid var(--admin-border);margin-top:5px;padding-top:12px!important;font-size:15px!important}
        .admin-order-summary-total strong{font-size:18px}
        .admin-order-paytm-reference{display:flex;align-items:center;justify-content:space-between;gap:15px;border:1px dashed var(--admin-border);border-radius:10px;padding:11px 13px;margin-bottom:12px;background:var(--admin-surface-2)}
        .admin-order-paytm-reference span{color:var(--admin-muted);font-size:11px}
        .admin-order-paytm-reference strong{font-size:11px;color:var(--admin-text);word-break:break-all}
        .admin-order-created-info{display:flex;align-items:center;gap:6px;color:var(--admin-muted);font-size:11px}
        .admin-order-modal-footer{border-top:1px solid var(--admin-border);padding:14px 22px;display:flex;justify-content:flex-end}
        .admin-order-close-btn{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);border-radius:9px;padding:9px 16px;font-weight:700;cursor:pointer}
        .spin{animation:adminOrdersSpin 1s linear infinite}
        @keyframes adminOrdersSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media(max-width:1100px){.admin-orders-stats{grid-template-columns:repeat(3,1fr)}.admin-orders-toolbar{flex-wrap:wrap}.admin-orders-search{flex-basis:100%}}
        @media(max-width:700px){.admin-orders-page{padding:20px 12px 40px}.admin-orders-header{align-items:flex-start}.admin-orders-title-row{align-items:flex-start}.admin-orders-header h1{font-size:23px}.admin-orders-header p{font-size:12px}.admin-orders-refresh-btn{padding:9px 11px;font-size:12px}.admin-orders-stats{grid-template-columns:repeat(2,1fr)}.admin-order-stat-card{padding:13px}.admin-orders-filter{flex:1;min-width:145px}.admin-orders-table-footer{gap:10px;align-items:flex-start;flex-direction:column}.admin-order-detail-grid{grid-template-columns:1fr}.admin-order-modal-overlay{padding:10px}.admin-order-modal-body{padding:15px}.admin-order-product-row{align-items:flex-start}.admin-order-product-total{margin-left:auto}.admin-order-paytm-reference{align-items:flex-start;flex-direction:column;gap:5px}.admin-order-modal-status-actions{align-items:stretch;flex-direction:column}.admin-order-modal-status-select{width:100%}.admin-order-modal-update-btn{width:100%}}
        .admin-order-cancellation-modal{width:min(520px,100%);background:var(--admin-surface);border-radius:18px;box-shadow:0 24px 70px rgba(15,23,42,.25);overflow:hidden}
.admin-order-cancellation-body{padding:22px}
.admin-order-cancellation-warning{display:flex;align-items:flex-start;gap:11px;padding:13px;border:1px solid #fecaca;border-radius:10px;background:#fef2f2;color:#b91c1c;margin-bottom:18px}
.admin-order-cancellation-warning svg{flex:none;margin-top:1px}
.admin-order-cancellation-warning strong{display:block;font-size:13px}
.admin-order-cancellation-warning p{margin:4px 0 0;font-size:11px;line-height:1.5;color:#991b1b}
.admin-order-cancellation-body label{display:block;color:var(--admin-text);font-size:12px;font-weight:800;margin-bottom:7px}
.admin-order-cancellation-body textarea{width:100%;box-sizing:border-box;resize:vertical;min-height:120px;border:1px solid var(--admin-border);border-radius:10px;padding:11px 12px;background:var(--admin-surface);color:var(--admin-text);outline:0;font-family:inherit;font-size:12px;line-height:1.5}
.admin-order-cancellation-body textarea:focus{border-color:var(--admin-primary)}
.admin-order-cancellation-body textarea:disabled{background:var(--admin-surface-2);cursor:not-allowed}
.admin-order-cancellation-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px}
.admin-order-cancellation-footer>span{color:var(--admin-muted);font-size:10px}
.admin-order-cancellation-footer>div{display:flex;align-items:center;gap:8px}
.admin-order-cancel-back-btn,.admin-order-confirm-cancel-btn{height:38px;border-radius:9px;padding:0 13px;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
.admin-order-cancel-back-btn{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text)}
.admin-order-confirm-cancel-btn{border:0;background:#dc2626;color:#fff}
.admin-order-confirm-cancel-btn:hover{background:#b91c1c}
.admin-order-cancel-back-btn:disabled,.admin-order-confirm-cancel-btn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>
    </main>
  );
};

export default Orders;
