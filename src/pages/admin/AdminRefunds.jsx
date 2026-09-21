import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Eye, Image as ImageIcon, IndianRupee, Plus, RefreshCw, Search, Upload, UserRound, X } from "lucide-react";

import apiRequest from "../../api/api";
import { showError, showSuccess } from "../../utils/sweetAlert";

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const [orderNumber, setOrderNumber] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [reason, setReason] = useState("");
  const [damageImage, setDamageImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRefunds = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiRequest("/refunds/admin/all", {
        method: "GET",
      });

      const data = response?.data || [];

      setRefunds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch refunds error:", error);

      showError(error?.data?.message || error?.message || "Failed to load refund records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const filteredRefunds = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesStatus = statusFilter === "ALL" || refund?.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const searchableText = [refund?.orderNumber, refund?.customer?.name, refund?.customer?.email, refund?.customer?.phone, refund?.product?.name, refund?.refundMethod, refund?.transactionId, refund?.reason].filter(Boolean).join(" ").toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [refunds, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRefunds.length / itemsPerPage));

  const currentPage = Math.min(page, totalPages);

  const paginatedRefunds = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredRefunds.slice(start, start + itemsPerPage);
  }, [filteredRefunds, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const totalRefunds = refunds.length;

    const refundedAmount = refunds.reduce((sum, item) => sum + Number(item?.refundAmount || 0), 0);

    const today = new Date();

    const todayRefunds = refunds.filter((item) => {
      if (!item?.refundedAt && !item?.createdAt) {
        return false;
      }

      const date = new Date(item.refundedAt || item.createdAt);

      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    const partialRefunds = refunds.filter((item) => {
      const productAmount = Number(item?.product?.productAmount || 0);
      const amount = Number(item?.refundAmount || 0);

      return productAmount > amount;
    }).length;

    return {
      totalRefunds,
      refundedAmount,
      todayRefunds,
      partialRefunds,
    };
  }, [refunds]);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case "NET_BANKING":
        return "Net Banking";
      case "BANK_TRANSFER":
        return "Bank Transfer";
      case "UPI":
        return "UPI";
      case "OTHER":
        return "Other";
      default:
        return method || "-";
    }
  };

  const resetRefundForm = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setOrderNumber("");
    setOrderData(null);
    setSelectedProductId("");
    setRefundAmount("");
    setRefundMethod("UPI");
    setTransactionId("");
    setReason("");
    setDamageImage(null);
    setImagePreview("");
    setOrderLoading(false);
    setSubmitting(false);
  };

  const closeAddModal = () => {
    if (submitting || orderLoading) {
      return;
    }

    setShowAddModal(false);
    resetRefundForm();
  };

  const handleFindOrder = async () => {
    const trimmedOrderNumber = orderNumber.trim();

    if (!trimmedOrderNumber) {
      showError("Please enter an Order ID.");
      return;
    }

    try {
      setOrderLoading(true);
      setOrderData(null);
      setSelectedProductId("");
      setRefundAmount("");
      setTransactionId("");

      const response = await apiRequest(`/refunds/admin/order/${encodeURIComponent(trimmedOrderNumber)}`, {
        method: "GET",
      });

      const data = response?.data;

      if (!data) {
        showError("Order details not found.");
        return;
      }

      setOrderData(data);

      if (data?.payment?.transactionId) {
        setTransactionId(data.payment.transactionId);
      } else {
        setTransactionId("");
      }

      if (Array.isArray(data?.products) && data.products.length === 1) {
        setSelectedProductId(String(data.products[0]?.productId?._id || data.products[0]?.productId || ""));
      }

      showSuccess("Order details loaded.");
    } catch (error) {
      console.error("Find refund order error:", error);

      showError(error?.data?.message || error?.message || "Unable to find this order. Please check the Order ID.");
    } finally {
      setOrderLoading(false);
    }
  };

  const selectedProduct = useMemo(() => {
    if (!orderData?.products || !selectedProductId) {
      return null;
    }

    return orderData.products.find((product) => String(product?.productId?._id || product?.productId || "") === String(selectedProductId)) || null;
  }, [orderData, selectedProductId]);

  const selectedProductAmount = Number(selectedProduct?.productAmount || 0);

  const handleProductChange = (event) => {
    const value = event.target.value;

    setSelectedProductId(value);
    setRefundAmount("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showError("Only JPG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setDamageImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmitRefund = async (event) => {
    event.preventDefault();

    if (!orderData) {
      showError("Please find the order first.");
      return;
    }

    if (!selectedProductId) {
      showError("Please select a product.");
      return;
    }

    const amount = Number(refundAmount);

    if (!amount || amount <= 0) {
      showError("Please enter a valid refund amount.");
      return;
    }

    if (amount > selectedProductAmount) {
      showError(`Refund amount cannot exceed ${formatCurrency(selectedProductAmount)}.`);
      return;
    }

    if (!refundMethod) {
      showError("Please select a refund method.");
      return;
    }

    if (!transactionId.trim()) {
      showError("Please enter the original transaction ID.");
      return;
    }

    if (!reason.trim()) {
      showError("Please enter the refund reason.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("orderNumber", orderData.orderNumber || orderNumber);
      formData.append("productId", selectedProductId);
      formData.append("refundAmount", amount);
      formData.append("refundMethod", refundMethod);
      formData.append("transactionId", transactionId.trim());
      formData.append("reason", reason.trim());

      if (damageImage) {
        formData.append("damageImage", damageImage);
      }

      await apiRequest("/refunds/admin", {
        method: "POST",
        body: formData,
      });

      showSuccess("Refund created successfully.");

      setShowAddModal(false);
      resetRefundForm();

      await fetchRefunds(true);
    } catch (error) {
      console.error("Create refund error:", error);

      showError(error?.data?.message || error?.message || "Failed to create refund.");
    } finally {
      setSubmitting(false);
    }
  };

  const openImage = (image) => {
    if (!image) {
      return;
    }

    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImage = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  return (
    <div className="admin-refunds-page">
      <div className="admin-refunds-container">
        <div className="admin-refunds-header">
          <div>
            <div className="admin-refunds-title-row">
              <div className="admin-refunds-title-icon">
                <IndianRupee size={22} />
              </div>

              <div>
                <h1>Refunds</h1>
                <p>Manage customer refunds and refund records.</p>
              </div>
            </div>
          </div>

          <div className="admin-refunds-header-actions">
            <button type="button" className="admin-refunds-refresh-btn" onClick={() => fetchRefunds(true)} disabled={refreshing}>
              <RefreshCw size={17} className={refreshing ? "admin-refunds-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              className="admin-refunds-add-btn"
              onClick={() => {
                resetRefundForm();
                setShowAddModal(true);
              }}>
              <Plus size={18} />
              Add Refund
            </button>
          </div>
        </div>

        <div className="admin-refunds-stats">
          <div className="admin-refund-stat-card">
            <div className="admin-refund-stat-icon">
              <IndianRupee size={19} />
            </div>

            <div>
              <span>Total Refunds</span>
              <strong>{stats.totalRefunds}</strong>
            </div>
          </div>

          <div className="admin-refund-stat-card">
            <div className="admin-refund-stat-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Refunded Amount</span>
              <strong>{formatCurrency(stats.refundedAmount)}</strong>
            </div>
          </div>

          <div className="admin-refund-stat-card">
            <div className="admin-refund-stat-icon">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>Today's Refunds</span>
              <strong>{stats.todayRefunds}</strong>
            </div>
          </div>

          <div className="admin-refund-stat-card">
            <div className="admin-refund-stat-icon">
              <AlertCircle size={19} />
            </div>

            <div>
              <span>Partial Refunds</span>
              <strong>{stats.partialRefunds}</strong>
            </div>
          </div>
        </div>

        <div className="admin-refunds-toolbar">
          <div className="admin-refunds-search">
            <Search size={18} />

            <input type="text" placeholder="Search order, customer, product..." value={search} onChange={(event) => setSearch(event.target.value)} />

            {search && (
              <button type="button" onClick={() => setSearch("")} className="admin-refunds-clear-search">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-refunds-filter">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All Status</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        <div className="admin-refunds-table-card">
          <div className="admin-refunds-table-header">
            <div>
              <h2>Refund History</h2>

              <span>
                {filteredRefunds.length} {filteredRefunds.length === 1 ? "record" : "records"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="admin-refunds-state">
              <RefreshCw size={28} className="admin-refunds-spin" />
              <p>Loading refund records...</p>
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="admin-refunds-state">
              <div className="admin-refunds-empty-icon">
                <IndianRupee size={27} />
              </div>

              <h3>No refund records found</h3>

              <p>{search || statusFilter !== "ALL" ? "Try changing your search or filter." : "No refunds have been created yet."}</p>
            </div>
          ) : (
            <>
              <div className="admin-refunds-table-wrap">
                <table className="admin-refunds-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Product Amount</th>
                      <th>Refund Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Image</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRefunds.map((refund) => (
                      <tr key={refund._id}>
                        <td>
                          <div className="admin-refund-order-number">#{refund.orderNumber || "-"}</div>
                        </td>

                        <td>
                          <div className="admin-refund-customer">
                            <strong>{refund.customer?.name || "-"}</strong>

                            <span>{refund.customer?.email || "-"}</span>

                            {refund.customer?.phone && <small>{refund.customer.phone}</small>}
                          </div>
                        </td>

                        <td>
                          <div className="admin-refund-product">
                            {refund.product?.image ? (
                              <img src={refund.product.image} alt={refund.product.name || "Product"} />
                            ) : (
                              <div className="admin-refund-product-placeholder">
                                <ImageIcon size={18} />
                              </div>
                            )}

                            <div>
                              <strong>{refund.product?.name || "-"}</strong>

                              <span>
                                Qty: {refund.product?.quantity || 0} {refund.product?.unit || ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>{formatCurrency(refund.product?.productAmount || 0)}</strong>
                        </td>

                        <td>
                          <strong className="admin-refund-amount">{formatCurrency(refund.refundAmount)}</strong>
                        </td>

                        <td>
                          <span className="admin-refund-method">{getMethodLabel(refund.refundMethod)}</span>
                        </td>

                        <td>
                          <span className="admin-refund-status">
                            <CheckCircle2 size={14} />
                            {refund.status || "REFUNDED"}
                          </span>
                        </td>

                        <td>
                          <span className="admin-refund-date">{formatDate(refund.refundedAt || refund.createdAt)}</span>
                        </td>

                        <td>
                          {refund.damageImage ? (
                            <button type="button" className="admin-refund-image-btn" onClick={() => openImage(refund.damageImage)}>
                              <Eye size={16} />
                              View
                            </button>
                          ) : (
                            <span className="admin-refund-no-image">No Image</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-refunds-pagination">
                <span>
                  Showing {filteredRefunds.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRefunds.length)} of {filteredRefunds.length}
                </span>

                <div className="admin-refunds-page-buttons">
                  <button type="button" disabled={currentPage <= 1} onClick={() => setPage((previous) => Math.max(1, previous - 1))}>
                    <ChevronLeft size={17} />
                  </button>

                  <div className="admin-refunds-page-number">
                    {currentPage} / {totalPages}
                  </div>

                  <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}>
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showAddModal && (
        <div
          className="admin-refunds-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}>
          <div className="admin-refunds-modal">
            <div className="admin-refunds-modal-header">
              <div>
                <h2>Add Refund</h2>
                <p>Create a refund record for a customer order.</p>
              </div>

              <button type="button" onClick={closeAddModal} disabled={submitting || orderLoading}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund}>
              <div className="admin-refunds-modal-body">
                <div className="admin-refund-form-section">
                  <div className="admin-refund-section-title">
                    <span className="admin-refund-section-number">1</span>

                    <div>
                      <h3>Find Order</h3>
                      <p>Enter the customer's Order ID.</p>
                    </div>
                  </div>

                  <div className="admin-refund-order-search">
                    <div className="admin-refund-input-wrap">
                      <Search size={17} />

                      <input type="text" placeholder="Enter Order ID" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} disabled={orderLoading || submitting} />
                    </div>

                    <button type="button" className="admin-refund-find-btn" onClick={handleFindOrder} disabled={orderLoading || submitting}>
                      {orderLoading ? (
                        <>
                          <RefreshCw size={16} className="admin-refunds-spin" />
                          Finding...
                        </>
                      ) : (
                        <>
                          <Search size={16} />
                          Find Order
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {orderData && (
                  <>
                    <div className="admin-refund-form-section">
                      <div className="admin-refund-section-title">
                        <span className="admin-refund-section-number">2</span>

                        <div>
                          <h3>Customer Details</h3>
                          <p>Customer information from the order.</p>
                        </div>
                      </div>

                      <div className="admin-refund-customer-box">
                        <div className="admin-refund-customer-avatar">
                          <UserRound size={20} />
                        </div>

                        <div>
                          <strong>{orderData?.customer?.name || orderData?.shippingAddress?.fullName || "-"}</strong>

                          <span>{orderData?.customer?.email || orderData?.shippingAddress?.email || "-"}</span>

                          <small>{orderData?.customer?.phone || orderData?.shippingAddress?.phone || "-"}</small>
                        </div>
                      </div>
                    </div>

                    <div className="admin-refund-form-section">
                      <div className="admin-refund-section-title">
                        <span className="admin-refund-section-number">3</span>

                        <div>
                          <h3>Select Product</h3>
                          <p>Select the product for which refund is being issued.</p>
                        </div>
                      </div>

                      <div className="admin-refund-product-select-wrap">
                        <select value={selectedProductId} onChange={handleProductChange} disabled={submitting}>
                          <option value="">Select Product</option>

                          {(orderData?.products || []).map((product) => {
                            const productId = String(product?.productId?._id || product?.productId || "");

                            return (
                              <option key={productId} value={productId}>
                                {product?.name || "Product"} — Qty {product?.quantity || 0} — {formatCurrency(product?.productAmount || 0)}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {selectedProduct && (
                        <div className="admin-refund-selected-product">
                          {selectedProduct.image ? (
                            <img src={selectedProduct.image} alt={selectedProduct.name || "Product"} />
                          ) : (
                            <div className="admin-refund-selected-placeholder">
                              <ImageIcon size={20} />
                            </div>
                          )}

                          <div className="admin-refund-selected-product-info">
                            <strong>{selectedProduct.name}</strong>

                            <span>
                              {selectedProduct.quantity} {selectedProduct.unit || ""}
                            </span>

                            <div>
                              <span>Product Amount</span>

                              <strong>{formatCurrency(selectedProduct.productAmount)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="admin-refund-form-section">
                      <div className="admin-refund-section-title">
                        <span className="admin-refund-section-number">4</span>

                        <div>
                          <h3>Refund Details</h3>
                          <p>Enter refund amount and payment information.</p>
                        </div>
                      </div>

                      <div className="admin-refund-form-grid">
                        <div className="admin-refund-field">
                          <label>
                            Product Amount <span>*</span>
                          </label>

                          <div className="admin-refund-readonly-amount">{formatCurrency(selectedProductAmount)}</div>
                        </div>

                        <div className="admin-refund-field">
                          <label>
                            Refund Amount <span>*</span>
                          </label>

                          <div className="admin-refund-money-input">
                            <span>₹</span>

                            <input type="number" min="0" max={selectedProductAmount || undefined} step="0.01" placeholder="Enter refund amount" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} disabled={!selectedProduct || submitting} />
                          </div>
                        </div>

                        <div className="admin-refund-field">
                          <label>
                            Refund Method <span>*</span>
                          </label>

                          <select value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)} disabled={submitting}>
                            <option value="UPI">UPI</option>
                            <option value="NET_BANKING">Net Banking</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div className="admin-refund-field">
                          <label>
                            Original Transaction ID <span>*</span>
                          </label>

                          <input type="text" placeholder="Original payment transaction ID" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} disabled={submitting} />
                        </div>
                      </div>

                      {selectedProduct && (
                        <div className="admin-refund-amount-info">
                          <span>Maximum refundable product amount</span>

                          <strong>{formatCurrency(selectedProductAmount)}</strong>
                        </div>
                      )}

                      <div className="admin-refund-field admin-refund-reason-field">
                        <label>
                          Refund Reason <span>*</span>
                        </label>

                        <textarea rows="4" placeholder="Enter refund reason..." value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} disabled={submitting} />

                        <small>{reason.length}/500</small>
                      </div>
                    </div>

                    <div className="admin-refund-form-section">
                      <div className="admin-refund-section-title">
                        <span className="admin-refund-section-number">5</span>

                        <div>
                          <h3>Damage / Supporting Image</h3>
                          <p>Optional image for damaged or affected product.</p>
                        </div>
                      </div>

                      <label className="admin-refund-upload-box">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={submitting} />

                        {imagePreview ? (
                          <div className="admin-refund-upload-preview">
                            <img src={imagePreview} alt="Refund preview" />

                            <div>
                              <strong>{damageImage?.name}</strong>

                              <span>Click to replace image</span>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-refund-upload-content">
                            <div className="admin-refund-upload-icon">
                              <Upload size={20} />
                            </div>

                            <div>
                              <strong>Upload Image</strong>

                              <span>JPG, PNG or WebP · Max 5 MB</span>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="admin-refunds-modal-footer">
                <button type="button" className="admin-refund-cancel-btn" onClick={closeAddModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="admin-refund-submit-btn" disabled={submitting || orderLoading || !orderData || !selectedProduct}>
                  {submitting ? (
                    <>
                      <RefreshCw size={17} className="admin-refunds-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Add Refund
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImageModal && selectedImage && (
        <div
          className="admin-refunds-image-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeImage();
            }
          }}>
          <div className="admin-refunds-image-modal">
            <div className="admin-refunds-image-modal-header">
              <strong>Refund Image</strong>

              <button type="button" onClick={closeImage}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-refunds-image-modal-body">
              <img src={selectedImage} alt="Refund supporting image" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-refunds-page{min-height:100%;background:var(--admin-bg);color:var(--admin-text);padding:28px 24px 40px}.admin-refunds-container{width:100%;max-width:1600px;margin:0 auto}.admin-refunds-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:24px}.admin-refunds-title-row{display:flex;align-items:center;gap:14px}.admin-refunds-title-icon{width:46px;height:46px;border-radius:12px;background:color-mix(in srgb,var(--admin-primary) 13%,transparent);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.admin-refunds-header h1{margin:0;font-size:25px;line-height:1.2;font-weight:750;letter-spacing:-.3px}.admin-refunds-header p{margin:5px 0 0;color:var(--admin-muted);font-size:13px}.admin-refunds-header-actions{display:flex;align-items:center;gap:10px}.admin-refunds-refresh-btn,.admin-refunds-add-btn{height:40px;border-radius:9px;padding:0 14px;border:1px solid var(--admin-border);display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:650;cursor:pointer;transition:.2s}.admin-refunds-refresh-btn{background:var(--admin-surface);color:var(--admin-text)}.admin-refunds-refresh-btn:hover{background:var(--admin-surface-2)}.admin-refunds-add-btn{border-color:var(--admin-primary);background:var(--admin-primary);color:#fff}.admin-refunds-add-btn:hover{filter:brightness(.95)}.admin-refunds-refresh-btn:disabled,.admin-refunds-add-btn:disabled{opacity:.6;cursor:not-allowed}.admin-refunds-spin{animation:adminRefundSpin 1s linear infinite}@keyframes adminRefundSpin{to{transform:rotate(360deg)}}.admin-refunds-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}.admin-refund-stat-card{min-height:92px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;padding:17px;display:flex;align-items:center;gap:13px;box-shadow:0 2px 8px rgba(0,0,0,.025)}.admin-refund-stat-icon{width:40px;height:40px;flex:0 0 40px;border-radius:10px;background:color-mix(in srgb,var(--admin-primary) 12%,transparent);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.admin-refund-stat-card span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:5px}.admin-refund-stat-card strong{font-size:20px;line-height:1.1}.admin-refunds-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;padding:12px;margin-bottom:14px}.admin-refunds-search{height:40px;max-width:480px;flex:1;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-muted)}.admin-refunds-search input{width:100%;border:0;outline:0;background:transparent;color:var(--admin-text);font-size:13px}.admin-refunds-search input::placeholder{color:var(--admin-muted)}.admin-refunds-clear-search{border:0;background:transparent;color:var(--admin-muted);padding:3px;display:flex;align-items:center;justify-content:center;cursor:pointer}.admin-refunds-filter select,.admin-refund-product-select-wrap select,.admin-refund-field select{height:40px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);padding:0 12px;outline:0;font-size:13px;cursor:pointer}.admin-refunds-table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden}.admin-refunds-table-header{padding:16px 18px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between}.admin-refunds-table-header h2{margin:0;font-size:16px;font-weight:700}.admin-refunds-table-header span{display:block;color:var(--admin-muted);font-size:12px;margin-top:4px}.admin-refunds-table-wrap{width:100%;overflow-x:auto}.admin-refunds-table{width:100%;border-collapse:collapse;min-width:1150px}.admin-refunds-table th{padding:12px 14px;text-align:left;background:var(--admin-surface-2);border-bottom:1px solid var(--admin-border);color:var(--admin-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.35px;white-space:nowrap}.admin-refunds-table td{padding:13px 14px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.admin-refunds-table tbody tr:last-child td{border-bottom:0}.admin-refunds-table tbody tr:hover{background:color-mix(in srgb,var(--admin-primary) 3%,transparent)}.admin-refund-order-number{font-weight:700;color:var(--admin-primary);white-space:nowrap}.admin-refund-customer{display:flex;flex-direction:column;gap:3px;min-width:170px}.admin-refund-customer strong{font-size:13px}.admin-refund-customer span,.admin-refund-customer small{font-size:11px;color:var(--admin-muted);white-space:nowrap}.admin-refund-product{display:flex;align-items:center;gap:10px;min-width:210px}.admin-refund-product img,.admin-refund-product-placeholder{width:42px;height:42px;flex:0 0 42px;border-radius:8px;object-fit:cover;border:1px solid var(--admin-border)}.admin-refund-product-placeholder{display:flex;align-items:center;justify-content:center;color:var(--admin-muted);background:var(--admin-surface-2)}.admin-refund-product>div:last-child{display:flex;flex-direction:column;gap:3px}.admin-refund-product strong{font-size:12px}.admin-refund-product span{font-size:11px;color:var(--admin-muted)}.admin-refund-amount{color:var(--admin-primary);white-space:nowrap}.admin-refund-method{display:inline-flex;padding:5px 8px;border-radius:7px;background:var(--admin-surface-2);font-size:11px;white-space:nowrap}.admin-refund-status{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:7px;background:color-mix(in srgb,var(--admin-primary) 10%,transparent);color:var(--admin-primary);font-size:11px;font-weight:700;white-space:nowrap}.admin-refund-date{font-size:11px;color:var(--admin-muted);white-space:nowrap}.admin-refund-image-btn{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);height:32px;padding:0 9px;border-radius:7px;display:inline-flex;align-items:center;gap:5px;font-size:11px;cursor:pointer}.admin-refund-image-btn:hover{border-color:var(--admin-primary);color:var(--admin-primary)}.admin-refund-no-image{font-size:11px;color:var(--admin-muted)}.admin-refunds-state{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;color:var(--admin-muted)}.admin-refunds-state h3{margin:12px 0 5px;color:var(--admin-text);font-size:15px}.admin-refunds-state p{margin:0;font-size:12px}.admin-refunds-empty-icon{width:52px;height:52px;border-radius:14px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center}.admin-refunds-pagination{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:13px 16px;border-top:1px solid var(--admin-border);color:var(--admin-muted);font-size:11px}.admin-refunds-page-buttons{display:flex;align-items:center;gap:7px}.admin-refunds-page-buttons button{width:32px;height:32px;border:1px solid var(--admin-border);border-radius:7px;background:var(--admin-surface);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer}.admin-refunds-page-buttons button:hover:not(:disabled){border-color:var(--admin-primary);color:var(--admin-primary)}.admin-refunds-page-buttons button:disabled{opacity:.4;cursor:not-allowed}.admin-refunds-page-number{min-width:65px;height:32px;padding:0 8px;border:1px solid var(--admin-border);border-radius:7px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;font-size:11px}.admin-refunds-modal-overlay,.admin-refunds-image-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.admin-refunds-modal{width:min(900px,100%);height:min(92vh,900px);max-height:92vh;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.2)}.admin-refunds-modal-header{padding:18px 20px;border-bottom:1px solid var(--admin-border);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.admin-refunds-modal-header h2{margin:0;font-size:18px}.admin-refunds-modal-header p{margin:5px 0 0;color:var(--admin-muted);font-size:12px}.admin-refunds-modal-header>button,.admin-refunds-image-modal-header button{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.admin-refunds-modal-header>button:hover,.admin-refunds-image-modal-header button:hover{color:var(--admin-text);background:var(--admin-surface-2)}.admin-refunds-modal form{min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden}.admin-refunds-modal-body{min-height:0;flex:1;overflow-y:auto;padding:20px}.admin-refund-form-section{padding:18px 0;border-bottom:1px solid var(--admin-border)}.admin-refund-form-section:first-child{padding-top:0}.admin-refund-form-section:last-child{border-bottom:0;padding-bottom:0}.admin-refund-section-title{display:flex;align-items:flex-start;gap:10px;margin-bottom:15px}.admin-refund-section-number{width:27px;height:27px;flex:0 0 27px;border-radius:8px;background:color-mix(in srgb,var(--admin-primary) 12%,transparent);color:var(--admin-primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}.admin-refund-section-title h3{margin:0;font-size:14px}.admin-refund-section-title p{margin:3px 0 0;color:var(--admin-muted);font-size:11px}.admin-refund-order-search{display:flex;gap:9px}.admin-refund-input-wrap{height:42px;flex:1;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-muted)}.admin-refund-input-wrap input{width:100%;border:0;outline:0;background:transparent;color:var(--admin-text);font-size:13px}.admin-refund-find-btn{height:42px;padding:0 15px;border:0;border-radius:9px;background:var(--admin-primary);color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;font-weight:700;cursor:pointer}.admin-refund-find-btn:disabled{opacity:.6;cursor:not-allowed}.admin-refund-customer-box{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.admin-refund-customer-avatar{width:40px;height:40px;flex:0 0 40px;border-radius:10px;background:color-mix(in srgb,var(--admin-primary) 12%,transparent);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.admin-refund-customer-box>div:last-child{display:flex;flex-direction:column;gap:3px}.admin-refund-customer-box strong{font-size:13px}.admin-refund-customer-box span,.admin-refund-customer-box small{font-size:11px;color:var(--admin-muted)}.admin-refund-product-select-wrap select{width:100%;height:42px}.admin-refund-selected-product{display:flex;align-items:center;gap:12px;margin-top:12px;padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.admin-refund-selected-product img,.admin-refund-selected-placeholder{width:60px;height:60px;flex:0 0 60px;border-radius:9px;object-fit:cover;border:1px solid var(--admin-border)}.admin-refund-selected-placeholder{display:flex;align-items:center;justify-content:center;color:var(--admin-muted)}.admin-refund-selected-product-info{flex:1;display:flex;flex-direction:column;gap:4px}.admin-refund-selected-product-info>strong{font-size:13px}.admin-refund-selected-product-info>span{font-size:11px;color:var(--admin-muted)}.admin-refund-selected-product-info>div{margin-top:3px;display:flex;align-items:center;justify-content:space-between;gap:15px}.admin-refund-selected-product-info>div span{font-size:11px;color:var(--admin-muted)}.admin-refund-selected-product-info>div strong{font-size:14px;color:var(--admin-primary)}.admin-refund-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.admin-refund-field{display:flex;flex-direction:column;gap:6px}.admin-refund-field label{font-size:11px;font-weight:700;color:var(--admin-muted)}.admin-refund-field label span{color:var(--admin-danger)}.admin-refund-field input,.admin-refund-field textarea,.admin-refund-field select{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);outline:0;font-size:13px;padding:0 11px}.admin-refund-field input,.admin-refund-field select{height:42px}.admin-refund-field textarea{padding:11px;resize:vertical;min-height:90px}.admin-refund-field input:focus,.admin-refund-field textarea:focus,.admin-refund-field select:focus,.admin-refund-input-wrap:focus-within{border-color:var(--admin-primary)}.admin-refund-money-input{height:42px;display:flex;align-items:center;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);overflow:hidden}.admin-refund-money-input>span{padding-left:12px;color:var(--admin-muted);font-size:13px}.admin-refund-money-input input{height:100%;border:0!important;background:transparent!important;border-radius:0!important}.admin-refund-readonly-amount{height:42px;box-sizing:border-box;padding:0 11px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);display:flex;align-items:center;color:var(--admin-primary);font-size:14px;font-weight:750}.admin-refund-amount-info{margin-top:12px;padding:10px 12px;border-radius:8px;background:color-mix(in srgb,var(--admin-primary) 7%,transparent);display:flex;align-items:center;justify-content:space-between;gap:10px}.admin-refund-amount-info span{font-size:11px;color:var(--admin-muted)}.admin-refund-amount-info strong{font-size:13px;color:var(--admin-primary)}.admin-refund-reason-field{margin-top:14px;position:relative}.admin-refund-reason-field small{position:absolute;right:8px;bottom:7px;color:var(--admin-muted);font-size:10px}.admin-refund-upload-box{min-height:88px;border:1px dashed var(--admin-border);border-radius:10px;background:var(--admin-bg);display:flex;align-items:center;padding:12px;cursor:pointer;transition:.2s}.admin-refund-upload-box:hover{border-color:var(--admin-primary);background:color-mix(in srgb,var(--admin-primary) 3%,transparent)}.admin-refund-upload-box input{display:none}.admin-refund-upload-content{display:flex;align-items:center;gap:12px}.admin-refund-upload-icon{width:42px;height:42px;border-radius:10px;background:color-mix(in srgb,var(--admin-primary) 11%,transparent);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.admin-refund-upload-content strong,.admin-refund-upload-preview strong{display:block;font-size:12px}.admin-refund-upload-content span,.admin-refund-upload-preview span{display:block;color:var(--admin-muted);font-size:11px;margin-top:3px}.admin-refund-upload-preview{display:flex;align-items:center;gap:12px}.admin-refund-upload-preview img{width:58px;height:58px;border-radius:8px;object-fit:cover;border:1px solid var(--admin-border)}.admin-refunds-modal-footer{flex-shrink:0;padding:14px 20px;border-top:1px solid var(--admin-border);display:flex;align-items:center;justify-content:flex-end;gap:9px;background:var(--admin-surface)}.admin-refund-cancel-btn,.admin-refund-submit-btn{height:40px;padding:0 14px;border-radius:9px;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}.admin-refund-cancel-btn{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text)}.admin-refund-submit-btn{border:1px solid var(--admin-primary);background:var(--admin-primary);color:#fff}.admin-refund-cancel-btn:disabled,.admin-refund-submit-btn:disabled{opacity:.55;cursor:not-allowed}.admin-refunds-image-modal{width:min(850px,100%);max-height:90vh;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden}.admin-refunds-image-modal-header{height:54px;padding:0 15px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--admin-border)}.admin-refunds-image-modal-header strong{font-size:14px}.admin-refunds-image-modal-body{padding:15px;max-height:calc(90vh - 54px);display:flex;align-items:center;justify-content:center;overflow:auto}.admin-refunds-image-modal-body img{display:block;max-width:100%;max-height:75vh;object-fit:contain;border-radius:9px}.admin-refunds-image-modal-header button{width:32px;height:32px}@media(max-width:1100px){.admin-refunds-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-refunds-table{min-width:1050px}}@media(max-width:700px){.admin-refunds-page{padding:18px 12px 30px}.admin-refunds-header{align-items:flex-start;flex-direction:column}.admin-refunds-header-actions{width:100%}.admin-refunds-refresh-btn,.admin-refunds-add-btn{flex:1}.admin-refunds-toolbar{align-items:stretch;flex-direction:column}.admin-refunds-search{max-width:none}.admin-refunds-filter select{width:100%}.admin-refunds-stats{grid-template-columns:1fr 1fr;gap:10px}.admin-refund-stat-card{padding:13px;min-height:78px}.admin-refund-stat-card strong{font-size:17px}.admin-refund-stat-icon{width:34px;height:34px;flex-basis:34px}.admin-refunds-pagination{align-items:flex-start;flex-direction:column}.admin-refunds-modal-overlay{padding:10px}.admin-refunds-modal{max-height:95vh;border-radius:12px}.admin-refunds-modal-body{padding:15px}.admin-refund-order-search{flex-direction:column}.admin-refund-find-btn{width:100%}.admin-refund-form-grid{grid-template-columns:1fr}.admin-refunds-modal-footer{padding:12px 15px}.admin-refund-cancel-btn,.admin-refund-submit-btn{flex:1}.admin-refunds-header h1{font-size:22px}.admin-refunds-title-icon{width:42px;height:42px}.admin-refund-selected-product-info>div{align-items:flex-start;flex-direction:column;gap:2px}}@media(max-width:430px){.admin-refunds-stats{grid-template-columns:1fr}.admin-refunds-title-row{align-items:flex-start}.admin-refund-upload-content,.admin-refund-upload-preview{align-items:flex-start}.admin-refunds-header-actions{flex-direction:column}.admin-refunds-refresh-btn,.admin-refunds-add-btn{width:100%}}
      `}</style>
    </div>
  );
};

export default AdminRefunds;
