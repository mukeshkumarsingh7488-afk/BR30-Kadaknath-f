import { useEffect, useMemo, useState } from "react";
import { Eye, FileSpreadsheet, FileText, Pencil, Plus, RefreshCw, Search, Trash2, X, Receipt, IndianRupee } from "lucide-react";

import apiRequest from "../../../api/api";
import { showError, showSuccess } from "../../../utils/sweetAlert";
import Swal from "sweetalert2";

const PRODUCT_TYPES = ["LIVE_BIRD", "CHICK", "EGG", "HATCHING_EGG", "BREEDING_PAIR", "DRESSED_CHICKEN", "OTHER"];

const UNITS = ["PIECE", "KG", "DOZEN", "EGG", "PAIR"];

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CARD", "CREDIT", "OTHER"];

const DELIVERY_STATUSES = ["NOT_REQUIRED", "PENDING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const PAYMENT_STATUSES = ["PENDING", "PARTIAL", "PAID"];

const STOCK_PRODUCT_TYPES = new Set(["LIVE_BIRD", "CHICK", "BREEDING_PAIR"]);

const STOCK_UNIT_RULES = {
  LIVE_BIRD: "PIECE",
  CHICK: "PIECE",
  BREEDING_PAIR: "PAIR",
};

const emptyItem = {
  productType: "LIVE_BIRD",
  productName: "",
  batch: "",
  quantity: "1",
  unit: "PIECE",
  weightKg: "",
  unitPrice: "",
  discount: "0",
};

const emptyForm = {
  farm: "",
  saleNumber: "",
  saleDate: new Date().toISOString().slice(0, 16),
  customer: {
    name: "",
    phone: "",
    email: "",
    address: "",
  },
  items: [{ ...emptyItem }],
  discount: "0",
  tax: "0",
  deliveryCharge: "0",
  paymentMethod: "CASH",
  paidAmount: "0",
  deliveryStatus: "NOT_REQUIRED",
  invoiceNumber: "",
  notes: "",
};

const getArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  const source = response?.data ?? response;

  if (Array.isArray(source)) return source;

  for (const key of keys) {
    if (Array.isArray(source?.[key])) {
      return source[key];
    }
  }

  if (Array.isArray(source?.data)) {
    return source.data;
  }

  return [];
};

const getSaleData = (response) => {
  const source = response?.data ?? response;
  return source?.sale ?? source?.data ?? null;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const toInputDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const money = (value) => {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getProductUnit = (productType) => {
  return STOCK_PRODUCT_TYPES.has(productType) ? STOCK_UNIT_RULES[productType] : "PIECE";
};

const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.data?.message || error?.message || "Something went wrong";
};

const getStatusClass = (status) => {
  if (status === "PAID" || status === "DELIVERED") return "success";
  if (status === "PARTIAL" || status === "OUT_FOR_DELIVERY") return "warning";
  if (status === "CANCELLED") return "danger";
  return "muted";
};

const getPaymentClass = (status) => {
  if (status === "PAID") return "success";
  if (status === "PARTIAL") return "warning";
  return "danger";
};

export default function SalesBilling() {
  const [sales, setSales] = useState([]);
  const [farms, setFarms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterFarm, setFilterFarm] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);

  const [form, setForm] = useState({ ...emptyForm });

  const selectedFarmBatches = useMemo(() => {
    if (!form.farm) return batches;

    return batches.filter((batch) => {
      const batchFarm = batch?.farm?._id || batch?.farm?.id || batch?.farm || "";

      return String(batchFarm) === String(form.farm);
    });
  }, [batches, form.farm]);

  const formTotals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => {
      const quantity = toNumber(item.quantity);
      const unitPrice = toNumber(item.unitPrice);
      const itemDiscount = toNumber(item.discount);

      const gross = quantity * unitPrice;
      const total = Math.max(0, gross - itemDiscount);

      return sum + total;
    }, 0);

    const saleDiscount = Math.max(0, toNumber(form.discount));
    const tax = Math.max(0, toNumber(form.tax));
    const deliveryCharge = Math.max(0, toNumber(form.deliveryCharge));

    const grandTotal = Math.max(0, subtotal - saleDiscount + tax + deliveryCharge);

    const paidAmount = Math.max(0, toNumber(form.paidAmount));
    const dueAmount = Math.max(0, grandTotal - paidAmount);

    let paymentStatus = "PENDING";

    if (paidAmount === 0) {
      paymentStatus = "PENDING";
    } else if (paidAmount < grandTotal) {
      paymentStatus = "PARTIAL";
    } else {
      paymentStatus = "PAID";
    }

    return {
      subtotal,
      saleDiscount,
      tax,
      deliveryCharge,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentStatus,
    };
  }, [form]);

  const stats = useMemo(() => {
    const current = sales.reduce(
      (result, sale) => {
        result.total += toNumber(sale.grandTotal);
        result.paid += toNumber(sale.paidAmount);
        result.due += toNumber(sale.dueAmount);

        if (sale.paymentStatus === "PAID") {
          result.paidSales += 1;
        }

        if (sale.paymentStatus === "PARTIAL") {
          result.partialSales += 1;
        }

        if (sale.paymentStatus === "PENDING") {
          result.pendingSales += 1;
        }

        return result;
      },
      {
        total: 0,
        paid: 0,
        due: 0,
        paidSales: 0,
        partialSales: 0,
        pendingSales: 0,
      }
    );

    return current;
  }, [sales]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      setOptionsError("");

      const [farmResponse, batchResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/batches")]);

      const farmList = getArray(farmResponse, ["farms"]);
      const batchList = getArray(batchResponse, ["batches"]);

      setFarms(farmList);
      setBatches(batchList);
    } catch (err) {
      const message = getErrorMessage(err);
      setOptionsError(message);
      showError(message);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadSales = async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(targetPage));
      params.set("limit", "20");

      if (filterFarm) {
        params.set("farm", filterFarm);
      }

      if (filterPaymentStatus) {
        params.set("paymentStatus", filterPaymentStatus);
      }

      if (filterDeliveryStatus) {
        params.set("deliveryStatus", filterDeliveryStatus);
      }

      if (filterStartDate) {
        params.set("startDate", filterStartDate);
      }

      if (filterEndDate) {
        params.set("endDate", filterEndDate);
      }

      if (search.trim()) {
        params.set("customer", search.trim());
      }

      const response = await apiRequest(`/sales?${params.toString()}`);

      const source = response?.data ?? response;

      const saleList = Array.isArray(source?.sales) ? source.sales : getArray(response, ["sales"]);

      setSales(saleList);

      setTotalSales(Number(source?.total || saleList.length || 0));
      setTotalPages(Math.max(1, Number(source?.totalPages || 1)));

      if (Number(source?.page) && Number(source.page) !== page) {
        setPage(Number(source.page));
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadSales(page);
  }, [page, filterFarm, filterPaymentStatus, filterDeliveryStatus, filterStartDate, filterEndDate, search]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      saleDate: new Date().toISOString().slice(0, 16),
      farm: farms[0]?._id || "",
      items: [{ ...emptyItem }],
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModal("form");
  };

  const openEdit = async (sale) => {
    try {
      setSaving(true);

      const response = await apiRequest(`/sales/${sale._id}`);
      const detail = getSaleData(response) || sale;

      setEditingId(detail._id);

      setForm({
        farm: detail?.farm?._id || detail?.farm || "",
        saleNumber: detail.saleNumber || "",
        saleDate: toInputDateTime(detail.saleDate),
        customer: {
          name: detail?.customer?.name || "",
          phone: detail?.customer?.phone || "",
          email: detail?.customer?.email || "",
          address: detail?.customer?.address || "",
        },
        items:
          Array.isArray(detail.items) && detail.items.length > 0
            ? detail.items.map((item) => ({
                productType: item.productType || "LIVE_BIRD",
                productName: item.productName || "",
                batch: item?.batch?._id || item?.batch || "",
                quantity: String(item.quantity ?? 1),
                unit: item.unit || getProductUnit(item.productType),
                weightKg: item.weightKg !== undefined && item.weightKg !== null ? String(item.weightKg) : "",
                unitPrice: String(item.unitPrice ?? ""),
                discount: String(item.discount ?? 0),
              }))
            : [{ ...emptyItem }],
        discount: String(detail.discount ?? 0),
        tax: String(detail.tax ?? 0),
        deliveryCharge: String(detail.deliveryCharge ?? 0),
        paymentMethod: detail.paymentMethod || "CASH",
        paidAmount: String(detail.paidAmount ?? 0),
        deliveryStatus: detail.deliveryStatus || "NOT_REQUIRED",
        invoiceNumber: detail.invoiceNumber || "",
        notes: detail.notes || "",
      });

      setModal("form");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openView = async (sale) => {
    try {
      setSelectedSale(sale);

      const response = await apiRequest(`/sales/${sale._id}`);
      const detail = getSaleData(response);

      if (detail) {
        setSelectedSale(detail);
      }

      setModal("view");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const updateCustomer = (field, value) => {
    setForm((previous) => ({
      ...previous,
      customer: {
        ...previous.customer,
        [field]: value,
      },
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((previous) => {
      const items = [...previous.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      if (field === "productType" && STOCK_PRODUCT_TYPES.has(value)) {
        items[index].unit = STOCK_UNIT_RULES[value];
        items[index].batch = "";
      }

      return {
        ...previous,
        items,
      };
    });
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index) => {
    setForm((previous) => {
      if (previous.items.length === 1) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const validateForm = () => {
    if (!form.farm) {
      showError("Please select a farm");
      return false;
    }

    if (!form.saleDate) {
      showError("Sale date is required");
      return false;
    }

    if (!form.customer.name.trim()) {
      showError("Customer name is required");
      return false;
    }

    if (form.customer.name.trim().length > 150) {
      showError("Customer name cannot exceed 150 characters");
      return false;
    }

    if (form.customer.phone.length > 20) {
      showError("Customer phone cannot exceed 20 characters");
      return false;
    }

    if (form.customer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (form.customer.email.length > 150 || !emailRegex.test(form.customer.email)) {
        showError("Please enter a valid customer email");
        return false;
      }
    }

    if (form.customer.address.length > 500) {
      showError("Customer address cannot exceed 500 characters");
      return false;
    }

    if (!form.items.length) {
      showError("At least one sale item is required");
      return false;
    }

    for (let index = 0; index < form.items.length; index += 1) {
      const item = form.items[index];

      if (!item.productType) {
        showError(`Select product type for item ${index + 1}`);
        return false;
      }

      if (!item.productName.trim()) {
        showError(`Product name is required for item ${index + 1}`);
        return false;
      }

      if (item.productName.trim().length > 150) {
        showError(`Product name cannot exceed 150 characters for item ${index + 1}`);
        return false;
      }

      if (!item.unit) {
        showError(`Unit is required for item ${index + 1}`);
        return false;
      }

      const quantity = toNumber(item.quantity);

      if (quantity <= 0) {
        showError(`Quantity must be greater than 0 for item ${index + 1}`);
        return false;
      }

      if (STOCK_PRODUCT_TYPES.has(item.productType)) {
        if (!Number.isInteger(quantity)) {
          showError(`Quantity must be a whole number for ${formatLabel(item.productType)}`);
          return false;
        }

        if (item.unit !== STOCK_UNIT_RULES[item.productType]) {
          showError(`${formatLabel(item.productType)} must use ${STOCK_UNIT_RULES[item.productType]} unit`);
          return false;
        }

        if (!item.batch) {
          showError(`Batch is required for ${formatLabel(item.productType)} sale`);
          return false;
        }
      }

      if (toNumber(item.weightKg) < 0) {
        showError(`Weight cannot be negative for item ${index + 1}`);
        return false;
      }

      if (toNumber(item.unitPrice) < 0) {
        showError(`Unit price cannot be negative for item ${index + 1}`);
        return false;
      }

      if (toNumber(item.discount) < 0) {
        showError(`Item discount cannot be negative for item ${index + 1}`);
        return false;
      }

      const gross = quantity * toNumber(item.unitPrice);

      if (toNumber(item.discount) > gross) {
        showError(`Item discount cannot be greater than item amount for item ${index + 1}`);
        return false;
      }
    }

    if (formTotals.saleDiscount > formTotals.subtotal) {
      showError("Sale discount cannot be greater than subtotal");
      return false;
    }

    if (formTotals.paidAmount > formTotals.grandTotal) {
      showError("Paid amount cannot be greater than grand total");
      return false;
    }

    if (form.notes.length > 1000) {
      showError("Notes cannot exceed 1000 characters");
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    const payload = {
      farm: form.farm,
      saleDate: form.saleDate,
      customer: {
        name: form.customer.name.trim(),
        phone: form.customer.phone.trim(),
        email: form.customer.email.trim().toLowerCase(),
        address: form.customer.address.trim(),
      },
      items: form.items.map((item) => ({
        productType: item.productType,
        productName: item.productName.trim(),
        batch: item.batch || null,
        quantity: toNumber(item.quantity),
        unit: item.unit,
        weightKg: item.weightKg === "" ? 0 : toNumber(item.weightKg),
        unitPrice: toNumber(item.unitPrice),
        discount: toNumber(item.discount),
      })),
      discount: toNumber(form.discount),
      tax: toNumber(form.tax),
      deliveryCharge: toNumber(form.deliveryCharge),
      paymentMethod: form.paymentMethod,
      paidAmount: toNumber(form.paidAmount),
      deliveryStatus: form.deliveryStatus,
      invoiceNumber: form.invoiceNumber.trim(),
      notes: form.notes.trim(),
    };

    if (form.saleNumber.trim()) {
      payload.saleNumber = form.saleNumber.trim();
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = buildPayload();

      let response;

      if (editingId) {
        response = await apiRequest(`/sales/${editingId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        response = await apiRequest("/sales", {
          method: "POST",
          body: payload,
        });
      }

      const message = response?.data?.message || response?.message || (editingId ? "Sale updated successfully" : "Sale created successfully");

      showSuccess(message);

      setModal(null);
      setEditingId(null);
      resetForm();

      await loadSales(page);
      await loadOptions();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sale) => {
    const result = await Swal.fire({
      title: "Delete Sale?",
      html: `Sale <strong>${sale.saleNumber || "-"}</strong> will be deleted and its stock will be restored.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);

      const response = await apiRequest(`/sales/${sale._id}`, {
        method: "DELETE",
      });

      showSuccess(response?.data?.message || response?.message || "Sale deleted successfully");

      if (sales.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadSales(page);
      }

      await loadOptions();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const exportExcel = () => {
    if (!sales.length) {
      showError("No sales data available to export");
      return;
    }

    const headers = ["Sale Number", "Sale Date", "Customer", "Phone", "Product", "Quantity", "Unit", "Amount", "Payment Method", "Payment Status", "Delivery Status"];

    const rows = sales.map((sale) => [
      sale.saleNumber || "-",
      sale.saleDate ? new Date(sale.saleDate).toLocaleString() : "-",
      sale.customer?.name || sale.customerName || "-",
      sale.customer?.phone || sale.phone || "-",
      sale.productName || sale.product?.name || sale.productType || "-",
      sale.quantity ?? 0,
      sale.unit || "-",
      sale.totalAmount ?? sale.amount ?? 0,
      sale.paymentMethod || "-",
      sale.paymentStatus || "-",
      sale.deliveryStatus || "-",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess("Sales exported successfully");
  };

  const exportPDF = () => {
    if (!sales.length) {
      showError("No sales data available to export");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF");
      return;
    }

    const rows = sales
      .map(
        (sale) => `
        <tr>
          <td>${sale.saleNumber || "-"}</td>
          <td>${sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : "-"}</td>
          <td>${sale.customer?.name || sale.customerName || "-"}</td>
          <td>${sale.productName || sale.product?.name || sale.productType || "-"}</td>
          <td>${sale.quantity ?? 0} ${sale.unit || ""}</td>
          <td>₹${Number(sale.totalAmount ?? sale.amount ?? 0).toLocaleString("en-IN")}</td>
          <td>${sale.paymentStatus || "-"}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body{font-family:Arial,sans-serif;padding:30px;color:#222}
          h1{margin:0 0 6px;font-size:24px}
          p{margin:0 0 20px;color:#666;font-size:13px}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th,td{border:1px solid #ddd;padding:8px;text-align:left}
          th{background:#f3f4f6;font-weight:700}
          .total{margin-top:18px;font-weight:700;font-size:14px}
          @media print{body{padding:10px}}
        </style>
      </head>
      <body>
        <h1>Sales & Billing Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>

        <table>
          <thead>
            <tr>
              <th>Sale Number</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="total">
          Total Sales: ${sales.length}
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  const handleFarmChange = (value) => {
    setForm((previous) => ({
      ...previous,
      farm: value,
      items: previous.items.map((item) => ({
        ...item,
        batch: "",
      })),
    }));
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Receipt size={15} />
            Farm Operations
          </div>

          <h1>Sales & Billing</h1>

          <p>Manage farm sales, customer billing, payments and stock-linked transactions.</p>
        </div>

        <div className="header-actions">
          <button
            className="top-action-btn refresh-action-btn"
            type="button"
            title="Refresh"
            onClick={async () => {
              await loadSales(page);
              await loadOptions();
            }}
            disabled={loading || loadingOptions}>
            <RefreshCw size={17} className={loading || loadingOptions ? "spin" : ""} />
          </button>

          <button className="top-action-btn excel-action-btn" type="button" title="Export Excel" onClick={exportExcel}>
            <FileSpreadsheet size={17} />
            <span>Excel</span>
          </button>

          <button className="top-action-btn pdf-action-btn" type="button" title="Export PDF" onClick={exportPDF}>
            <FileText size={17} />
            <span>PDF</span>
          </button>

          <button className="top-action-btn add-action-btn" type="button" onClick={openCreate} disabled={loadingOptions}>
            <Plus size={18} />
            <span>Add Sale</span>
          </button>
        </div>
      </div>

      {optionsError ? (
        <div className="error-banner">
          <span>{optionsError}</span>
          <button type="button" onClick={loadOptions}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Receipt size={20} />
          </div>
          <div>
            <span>Total Sales</span>
            <strong>{totalSales}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <span>Page Revenue</span>
            <strong>{money(stats.total)}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <span>Received</span>
            <strong>{money(stats.paid)}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <span>Due</span>
            <strong>{money(stats.due)}</strong>
          </div>
        </div>
      </div>

      <div className="filter-card">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search customer..."
          />
          {search ? (
            <button
              type="button"
              className="search-clear"
              title="Clear search"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}>
              <X size={16} />
            </button>
          ) : null}
        </div>

        <select
          value={filterFarm}
          onChange={(event) => {
            setFilterFarm(event.target.value);
            setPage(1);
          }}>
          <option value="">All Farms</option>
          {farms.map((farm) => (
            <option key={farm._id} value={farm._id}>
              {farm.name || farm.code || "Farm"}
            </option>
          ))}
        </select>

        <select
          value={filterPaymentStatus}
          onChange={(event) => {
            setFilterPaymentStatus(event.target.value);
            setPage(1);
          }}>
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={filterDeliveryStatus}
          onChange={(event) => {
            setFilterDeliveryStatus(event.target.value);
            setPage(1);
          }}>
          <option value="">All Delivery</option>
          {DELIVERY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterStartDate}
          onChange={(event) => {
            setFilterStartDate(event.target.value);
            setPage(1);
          }}
          title="Start date"
        />

        <input
          type="date"
          value={filterEndDate}
          onChange={(event) => {
            setFilterEndDate(event.target.value);
            setPage(1);
          }}
          title="End date"
        />
        {filterStartDate || filterEndDate ? (
          <button
            type="button"
            className="date-filter-clear"
            onClick={() => {
              setFilterStartDate("");
              setFilterEndDate("");
              setPage(1);
            }}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="table-card">
        <div className="table-head">
          <div>
            <h2>Sales Records</h2>
            <span>
              Showing {sales.length} of {totalSales} sales
            </span>
          </div>

          <div className="table-head-actions">
            <div className="mini-summary">
              <span className="summary-pill success-pill">Paid {stats.paidSales}</span>
              <span className="summary-pill warning-pill">Partial {stats.partialSales}</span>
              <span className="summary-pill danger-pill">Pending {stats.pendingSales}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="state-box">
            <RefreshCw className="spin" size={25} />
            <span>Loading sales...</span>
          </div>
        ) : error ? (
          <div className="state-box error-state">
            <strong>Unable to load sales</strong>
            <span>{error}</span>
            <button className="btn btn-secondary" type="button" onClick={() => loadSales(page)}>
              Retry
            </button>
          </div>
        ) : sales.length === 0 ? (
          <div className="state-box empty-sales-state">
            <Receipt size={34} />
            <strong>No sales found</strong>

            <div className="empty-sales-action">
              <span>Create your first sale or change the filters.</span>

              <button className="btn btn-primary btn-small" type="button" onClick={openCreate} disabled={loadingOptions}>
                <Plus size={16} />
                Add Sale
              </button>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Farm</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <div className="primary-cell">
                        <strong>{sale.saleNumber || "-"}</strong>
                        {sale.invoiceNumber ? <span>Invoice: {sale.invoiceNumber}</span> : null}
                      </div>
                    </td>

                    <td>{formatDate(sale.saleDate)}</td>

                    <td>
                      <div className="primary-cell">
                        <strong>{sale?.customer?.name || "-"}</strong>
                        {sale?.customer?.phone ? <span>{sale.customer.phone}</span> : null}
                      </div>
                    </td>

                    <td>{sale?.farm?.name || sale?.farm?.code || "-"}</td>

                    <td>
                      <span className="item-count">{Array.isArray(sale.items) ? sale.items.length : 0}</span>
                    </td>

                    <td>
                      <strong>{money(sale.grandTotal)}</strong>
                      <span className="table-subtext">Due {money(sale.dueAmount)}</span>
                    </td>

                    <td>
                      <span className={`status-badge ${getPaymentClass(sale.paymentStatus)}`}>{formatLabel(sale.paymentStatus)}</span>
                    </td>

                    <td>
                      <span className={`status-badge ${getStatusClass(sale.deliveryStatus)}`}>{formatLabel(sale.deliveryStatus)}</span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" type="button" title="View" onClick={() => openView(sale)}>
                          <Eye size={17} />
                        </button>

                        <button className="icon-btn" type="button" title="Edit" onClick={() => openEdit(sale)}>
                          <Pencil size={17} />
                        </button>

                        <button className="icon-btn danger-btn" type="button" title="Delete" onClick={() => handleDelete(sale)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 ? (
          <div className="pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((previous) => previous - 1)}>
              Previous
            </button>

            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button type="button" disabled={page >= totalPages} onClick={() => setPage((previous) => previous + 1)}>
              Next
            </button>
          </div>
        ) : null}
      </div>

      {modal === "form" ? (
        <div className="modal-backdrop">
          <div className="modal modal-large">
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  <Receipt size={15} />
                  {editingId ? "Update Sale" : "New Sale"}
                </div>
                <h2>{editingId ? "Edit Sale" : "Create New Sale"}</h2>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  if (!saving) {
                    setModal(null);
                    setEditingId(null);
                  }
                }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="section-title">Sale Information</div>

                <div className="form-grid four">
                  <label>
                    <span>Farm *</span>
                    <select value={form.farm} onChange={(event) => handleFarmChange(event.target.value)} disabled={Boolean(editingId)}>
                      <option value="">Select farm</option>
                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                          {farm.name || farm.code || "Farm"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Sale Number</span>
                    <input
                      value={form.saleNumber}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          saleNumber: event.target.value,
                        }))
                      }
                      placeholder="Auto generated if blank"
                      maxLength={50}
                    />
                  </label>

                  <label>
                    <span>Sale Date *</span>
                    <input
                      type="datetime-local"
                      value={form.saleDate}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          saleDate: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Invoice Number</span>
                    <input
                      value={form.invoiceNumber}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          invoiceNumber: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                      maxLength={100}
                    />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Customer Details</div>

                <div className="form-grid four">
                  <label>
                    <span>Name *</span>
                    <input value={form.customer.name} onChange={(event) => updateCustomer("name", event.target.value)} placeholder="Customer name" maxLength={150} />
                  </label>

                  <label>
                    <span>Phone</span>
                    <input value={form.customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} placeholder="Phone number" maxLength={20} />
                  </label>

                  <label>
                    <span>Email</span>
                    <input type="email" value={form.customer.email} onChange={(event) => updateCustomer("email", event.target.value)} placeholder="customer@email.com" maxLength={150} />
                  </label>

                  <label>
                    <span>Address</span>
                    <input value={form.customer.address} onChange={(event) => updateCustomer("address", event.target.value)} placeholder="Customer address" maxLength={500} />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="section-heading-row">
                  <div>
                    <div className="section-title">Sale Items</div>
                    <span className="section-help">Bird stock items require a valid batch.</span>
                  </div>

                  <button type="button" className="btn btn-secondary btn-small" onClick={addItem}>
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>

                <div className="items-list">
                  {form.items.map((item, index) => {
                    const requiresBatch = STOCK_PRODUCT_TYPES.has(item.productType);

                    const itemGross = toNumber(item.quantity) * toNumber(item.unitPrice);

                    const itemTotal = Math.max(0, itemGross - toNumber(item.discount));

                    return (
                      <div className="item-card" key={`${index}-${item.productType}`}>
                        <div className="item-card-header">
                          <strong>Item {index + 1}</strong>

                          {form.items.length > 1 ? (
                            <button type="button" className="remove-item" onClick={() => removeItem(index)}>
                              <Trash2 size={15} />
                              Remove
                            </button>
                          ) : null}
                        </div>

                        <div className="form-grid four">
                          <label>
                            <span>Product Type *</span>
                            <select value={item.productType} onChange={(event) => updateItem(index, "productType", event.target.value)}>
                              {PRODUCT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {formatLabel(type)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Product Name *</span>
                            <input value={item.productName} onChange={(event) => updateItem(index, "productName", event.target.value)} placeholder="Product name" maxLength={150} />
                          </label>

                          <label>
                            <span>Quantity *</span>
                            <input type="number" min="0" step={STOCK_PRODUCT_TYPES.has(item.productType) ? "1" : "0.01"} value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
                          </label>

                          <label>
                            <span>Unit *</span>
                            <select value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} disabled={requiresBatch}>
                              {UNITS.map((unit) => (
                                <option key={unit} value={unit}>
                                  {formatLabel(unit)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Batch {requiresBatch ? "*" : ""}</span>
                            <select value={item.batch} onChange={(event) => updateItem(index, "batch", event.target.value)} disabled={!form.farm}>
                              <option value="">{requiresBatch ? "Select batch" : "Optional batch"}</option>

                              {selectedFarmBatches.map((batch) => (
                                <option key={batch._id} value={batch._id}>
                                  {batch.batchNumber || batch.batchName || batch._id}
                                  {batch.currentQuantity !== undefined ? ` — Stock: ${batch.currentQuantity}` : ""}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Weight (KG)</span>
                            <input type="number" min="0" step="0.01" value={item.weightKg} onChange={(event) => updateItem(index, "weightKg", event.target.value)} placeholder="Optional" />
                          </label>

                          <label>
                            <span>Unit Price *</span>
                            <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} placeholder="0.00" />
                          </label>

                          <label>
                            <span>Item Discount</span>
                            <input type="number" min="0" step="0.01" value={item.discount} onChange={(event) => updateItem(index, "discount", event.target.value)} placeholder="0.00" />
                          </label>
                        </div>

                        <div className="item-total">
                          <span>Item Total</span>
                          <strong>{money(itemTotal)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Billing & Payment</div>

                <div className="form-grid four">
                  <label>
                    <span>Sale Discount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          discount: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Tax</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.tax}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          tax: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Delivery Charge</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.deliveryCharge}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          deliveryCharge: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Payment Method</span>
                    <select
                      value={form.paymentMethod}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          paymentMethod: event.target.value,
                        }))
                      }>
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {formatLabel(method)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Paid Amount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.paidAmount}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          paidAmount: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Delivery Status</span>
                    <select
                      value={form.deliveryStatus}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          deliveryStatus: event.target.value,
                        }))
                      }>
                      {DELIVERY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="totals-box">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(formTotals.subtotal)}</strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>- {money(formTotals.saleDiscount)}</strong>
                  </div>

                  <div>
                    <span>Tax</span>
                    <strong>{money(formTotals.tax)}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>{money(formTotals.deliveryCharge)}</strong>
                  </div>

                  <div className="grand-total">
                    <span>Grand Total</span>
                    <strong>{money(formTotals.grandTotal)}</strong>
                  </div>

                  <div>
                    <span>Paid</span>
                    <strong>{money(formTotals.paidAmount)}</strong>
                  </div>

                  <div className="due-total">
                    <span>Due</span>
                    <strong>{money(formTotals.dueAmount)}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong className={`status-text ${getPaymentClass(formTotals.paymentStatus)}`}>{formatLabel(formTotals.paymentStatus)}</strong>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Notes</div>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional sale notes..."
                  maxLength={1000}
                  rows={4}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!saving) {
                      setModal(null);
                      setEditingId(null);
                    }
                  }}
                  disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="spin" size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Receipt size={17} />
                      {editingId ? "Update Sale" : "Create Sale"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {modal === "view" && selectedSale ? (
        <div className="modal-backdrop">
          <div className="modal modal-view">
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  <Receipt size={15} />
                  Sale Details
                </div>
                <h2>{selectedSale.saleNumber || "-"}</h2>
              </div>

              <button type="button" className="close-btn" onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="view-body">
              <div className="view-summary-grid">
                <div className="view-summary-card">
                  <span>Sale Date</span>
                  <strong>{formatDateTime(selectedSale.saleDate)}</strong>
                </div>

                <div className="view-summary-card">
                  <span>Customer</span>
                  <strong>{selectedSale?.customer?.name || "-"}</strong>
                </div>

                <div className="view-summary-card">
                  <span>Grand Total</span>
                  <strong>{money(selectedSale.grandTotal)}</strong>
                </div>

                <div className="view-summary-card">
                  <span>Due Amount</span>
                  <strong>{money(selectedSale.dueAmount)}</strong>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">Customer</div>

                <div className="detail-grid">
                  <div>
                    <span>Name</span>
                    <strong>{selectedSale?.customer?.name || "-"}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{selectedSale?.customer?.phone || "-"}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{selectedSale?.customer?.email || "-"}</strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>{selectedSale?.customer?.address || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">Items</div>

                <div className="view-items">
                  {Array.isArray(selectedSale.items) && selectedSale.items.length > 0 ? (
                    selectedSale.items.map((item, index) => (
                      <div className="view-item" key={`${item._id || index}`}>
                        <div>
                          <strong>{item.productName || "Product"}</strong>
                          <span>
                            {formatLabel(item.productType)} • {item.quantity} {formatLabel(item.unit)}
                          </span>

                          {item?.batch?.batchNumber ? <span>Batch: {item.batch.batchNumber}</span> : null}
                        </div>

                        <strong>{money(item.totalAmount)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="empty-inline">No items.</div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">Billing</div>

                <div className="billing-detail">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(selectedSale.subtotal)}</strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>- {money(selectedSale.discount)}</strong>
                  </div>

                  <div>
                    <span>Tax</span>
                    <strong>{money(selectedSale.tax)}</strong>
                  </div>

                  <div>
                    <span>Delivery Charge</span>
                    <strong>{money(selectedSale.deliveryCharge)}</strong>
                  </div>

                  <div className="billing-total">
                    <span>Grand Total</span>
                    <strong>{money(selectedSale.grandTotal)}</strong>
                  </div>

                  <div>
                    <span>Paid</span>
                    <strong>{money(selectedSale.paidAmount)}</strong>
                  </div>

                  <div className="billing-due">
                    <span>Due</span>
                    <strong>{money(selectedSale.dueAmount)}</strong>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">Status</div>

                <div className="status-row">
                  <span className={`status-badge ${getPaymentClass(selectedSale.paymentStatus)}`}>Payment: {formatLabel(selectedSale.paymentStatus)}</span>

                  <span className={`status-badge ${getStatusClass(selectedSale.deliveryStatus)}`}>Delivery: {formatLabel(selectedSale.deliveryStatus)}</span>

                  <span className="status-badge muted">Method: {formatLabel(selectedSale.paymentMethod)}</span>
                </div>
              </div>

              {selectedSale.invoiceNumber ? (
                <div className="detail-section">
                  <div className="section-title">Invoice</div>
                  <p className="notes-text">{selectedSale.invoiceNumber}</p>
                </div>
              ) : null}

              {selectedSale.notes ? (
                <div className="detail-section">
                  <div className="section-title">Notes</div>
                  <p className="notes-text">{selectedSale.notes}</p>
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                Close
              </button>

              <button type="button" className="btn btn-primary" onClick={() => openEdit(selectedSale)}>
                <Pencil size={17} />
                Edit Sale
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`.date-filter-clear{height:40px;flex:0 0 auto;padding:0 11px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;text-decoration:none!important;display:flex;align-items:center;justify-content:center;transition:.18s ease}.date-filter-clear:hover{background:var(--admin-border);color:var(--admin-text);text-decoration:none!important}.sales-page{padding:24px;color:var(--admin-text);min-width:0}.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:22px}.eyebrow{display:flex;align-items:center;gap:7px;color:var(--admin-primary);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.page-header h1{margin:0;font-size:27px;line-height:1.2}.page-header p{margin:7px 0 0;color:var(--admin-muted);font-size:14px}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.btn{border:1px solid transparent;border-radius:10px;min-height:40px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:750;cursor:pointer;transition:.18s ease}.btn:disabled{opacity:.55;cursor:not-allowed}.btn-primary{background:var(--admin-primary);color:#fff}.btn-primary:hover:not(:disabled){filter:brightness(1.06);transform:translateY(-1px)}.btn-secondary{background:var(--admin-surface);border-color:var(--admin-border);color:var(--admin-text)}.btn-secondary:hover:not(:disabled){background:var(--admin-surface-2)}.btn-small{min-height:36px;padding:0 11px}.error-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.25);color:#ef4444;border-radius:12px;padding:11px 14px;margin-bottom:18px;font-size:13px}.error-banner button{border:0;background:transparent;color:inherit;font-weight:800;cursor:pointer}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.stat-card{display:flex;align-items:center;gap:13px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:17px;min-width:0}.stat-icon{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:11px;background:rgba(59,130,246,.11);color:var(--admin-primary);flex:0 0 auto}.danger-icon{background:rgba(239,68,68,.1);color:var(--admin-danger)}.stat-card span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:4px}.stat-card strong{font-size:19px}.filter-card{display:flex;align-items:center;gap:9px;flex-wrap:wrap;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:13px;margin-bottom:18px}.search-box{display:flex;align-items:center;gap:8px;flex:1 1 220px;min-width:200px;height:40px;border:1px solid var(--admin-border);border-radius:9px;padding:0 11px;color:var(--admin-muted)}.search-box input{border:0;outline:0;background:transparent;color:var(--admin-text);width:100%;font:inherit}.filter-card select,.filter-card input{height:40px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);padding:0 10px;outline:0;font:inherit;font-size:13px}.search-clear{width:26px;height:26px;flex:0 0 auto;border:0;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;padding:0}.search-clear:hover{color:var(--admin-text);background:var(--admin-surface-2)}.filter-card input[type="date"],.form-grid input[type="datetime-local"]{color-scheme:light dark}.admin-theme-light .filter-card input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .form-grid input[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;overflow:hidden}.table-head{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 18px;border-bottom:1px solid var(--admin-border)}.table-head h2{font-size:16px;margin:0 0 4px}.table-head span{font-size:12px;color:var(--admin-muted)}.mini-summary{display:flex;gap:7px;flex-wrap:wrap}.summary-pill{font-size:11px!important;font-weight:800!important;padding:6px 9px;border-radius:999px}.table-head-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.success-pill{background:rgba(34,197,94,.1);color:#22c55e}.warning-pill{background:rgba(245,158,11,.1);color:#f59e0b}.danger-pill{background:rgba(239,68,68,.1);color:#ef4444}.table-wrap{width:100%;overflow:auto}table{width:100%;border-collapse:collapse;min-width:1100px}th,td{text-align:left;padding:13px 14px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--admin-muted);background:var(--admin-surface-2);font-weight:800}tbody tr:hover{background:rgba(127,127,127,.035)}tbody tr:last-child td{border-bottom:0}.primary-cell{display:flex;flex-direction:column;gap:3px}.primary-cell strong{font-size:13px}.primary-cell span,.table-subtext{font-size:11px;color:var(--admin-muted)}.item-count{display:inline-flex;min-width:27px;height:27px;padding:0 7px;align-items:center;justify-content:center;border-radius:8px;background:var(--admin-surface-2);font-weight:800}.status-badge{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:850}.status-badge.success{background:rgba(34,197,94,.11);color:#22c55e}.status-badge.warning{background:rgba(245,158,11,.11);color:#f59e0b}.status-badge.danger{background:rgba(239,68,68,.11);color:#ef4444}.status-badge.muted{background:var(--admin-surface-2);color:var(--admin-muted)}.row-actions{display:flex;align-items:center;gap:6px}.icon-btn{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-muted);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.icon-btn:hover{color:var(--admin-text);background:var(--admin-surface-2)}.danger-btn:hover{color:#ef4444;border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.07)}.state-box{min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;color:var(--admin-muted);padding:30px;text-align:center}.state-box strong{color:var(--admin-text);font-size:15px}.empty-sales-action{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}.empty-sales-action>span{font-size:13px;color:var(--admin-muted)}.error-state{color:#ef4444}.error-state span{max-width:600px;font-size:13px}.pagination{display:flex;align-items:center;justify-content:center;gap:14px;padding:15px;border-top:1px solid var(--admin-border)}.pagination button{height:35px;padding:0 12px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-bg);color:var(--admin-text);cursor:pointer;font-size:12px;font-weight:700}.pagination button:disabled{opacity:.45;cursor:not-allowed}.pagination span{font-size:12px;color:var(--admin-muted)}.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999}.modal{width:min(760px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:17px;box-shadow:0 24px 80px rgba(0,0,0,.35)}.modal-large{width:min(1120px,100%)}.modal-view{width:min(900px,100%)}.modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:19px 20px;border-bottom:1px solid var(--admin-border);position:sticky;top:0;background:var(--admin-surface);z-index:2}.modal-header h2{margin:0;font-size:20px}.close-btn{width:36px;height:36px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.close-btn:hover{color:var(--admin-text)}form{padding:0 20px}.form-section{padding:20px 0;border-bottom:1px solid var(--admin-border)}.section-title{font-size:14px;font-weight:850;margin-bottom:13px}.section-help{font-size:11px;color:var(--admin-muted)}.form-grid{display:grid;gap:12px}.form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.form-grid label{display:flex;flex-direction:column;gap:6px;min-width:0}.form-grid label span{font-size:11px;color:var(--admin-muted);font-weight:750}.form-grid input,.form-grid select,textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);padding:10px 11px;outline:0;font:inherit;font-size:13px}.form-grid input:focus,.form-grid select:focus,textarea:focus{border-color:var(--admin-primary)}.form-grid select:disabled{opacity:.6}.section-heading-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.items-list{display:flex;flex-direction:column;gap:12px}.item-card{border:1px solid var(--admin-border);border-radius:13px;background:var(--admin-bg);padding:13px}.item-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.item-card-header strong{font-size:13px}.remove-item{border:0;background:transparent;color:#ef4444;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:800;cursor:pointer}.item-total{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:12px;padding-top:10px;border-top:1px dashed var(--admin-border);font-size:12px;color:var(--admin-muted)}.item-total strong{color:var(--admin-text);font-size:14px}.totals-box{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--admin-border);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden;margin-top:15px}.totals-box>div{background:var(--admin-surface);padding:12px}.totals-box span{display:block;font-size:10px;color:var(--admin-muted);margin-bottom:4px}.totals-box strong{font-size:13px}.totals-box .grand-total{background:rgba(59,130,246,.06)}.totals-box .grand-total strong{font-size:16px;color:var(--admin-primary)}.totals-box .due-total{background:rgba(239,68,68,.06)}.totals-box .due-total strong{color:#ef4444}.status-text.success{color:#22c55e}.status-text.warning{color:#f59e0b}.status-text.danger{color:#ef4444}textarea{resize:vertical;min-height:90px}.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:16px 20px;border-top:1px solid var(--admin-border);position:sticky;bottom:0;background:var(--admin-surface);z-index:2}.view-body{padding:20px}.view-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:20px}.view-summary-card{padding:14px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-bg)}.view-summary-card span,.detail-grid span,.billing-detail span{display:block;font-size:10px;color:var(--admin-muted);margin-bottom:5px}.view-summary-card strong{font-size:14px}.detail-section{padding:18px 0;border-top:1px solid var(--admin-border)}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.detail-grid>div{padding:11px 12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-bg)}.detail-grid strong{font-size:12px;word-break:break-word}.view-items{display:flex;flex-direction:column;gap:8px}.view-item{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-bg)}.view-item>div{display:flex;flex-direction:column;gap:3px}.view-item strong{font-size:13px}.view-item span{font-size:11px;color:var(--admin-muted)}.empty-inline{padding:18px;text-align:center;color:var(--admin-muted);font-size:12px}.billing-detail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--admin-border);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden}.billing-detail>div{padding:12px;background:var(--admin-surface)}.billing-total{background:rgba(59,130,246,.06)!important}.billing-total strong{color:var(--admin-primary);font-size:15px}.billing-due{background:rgba(239,68,68,.06)!important}.billing-due strong{color:#ef4444}.status-row{display:flex;gap:8px;flex-wrap:wrap}.notes-text{margin:0;padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-bg);font-size:13px;line-height:1.6;color:var(--admin-muted);white-space:pre-wrap}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.form-grid.four{grid-template-columns:repeat(2,minmax(0,1fr))}.view-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.billing-detail{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.sales-page{padding:15px}.page-header{flex-direction:column}.header-actions{width:100%;justify-content:flex-start;gap:8px}.header-actions .top-action-btn{flex:1}.header-actions .refresh-action-btn{flex:0 0 40px}.stats-grid{grid-template-columns:1fr}.filter-card{align-items:stretch}.search-box{flex-basis:100%}.filter-card select,.filter-card input{width:100%}.table-head{align-items:flex-start;flex-direction:column}.mini-summary{width:100%}.table-head-actions{width:100%;justify-content:space-between}.table-head-actions .btn{flex:0 0 auto}.form-grid.four{grid-template-columns:1fr}.section-heading-row{align-items:flex-start;flex-direction:column}.section-heading-row .btn{width:100%}.totals-box{grid-template-columns:repeat(2,minmax(0,1fr))}.view-summary-grid{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}.billing-detail{grid-template-columns:1fr}.modal-backdrop{padding:8px}.modal{max-height:96vh;border-radius:13px}.modal-header{padding:15px}.modal-footer{padding:13px 15px}.view-body{padding:15px}form{padding:0 15px}}`}</style>
    </div>
  );
}
