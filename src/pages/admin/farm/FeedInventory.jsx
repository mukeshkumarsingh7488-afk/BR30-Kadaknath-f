import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Eye, FileSpreadsheet, FileText, Filter, IndianRupee, Leaf, Package, Pencil, Plus, RefreshCw, Search, Scale, Trash2, Warehouse, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const getArray = (response, keys = []) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;

  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
  }

  return [];
};

const getObject = (response) => {
  return response?.data ?? response;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  farm: "",
  feedName: "",
  feedType: "STARTER",
  brand: "",
  batchNumber: "",
  supplierName: "",
  supplierPhone: "",
  supplierAddress: "",
  purchaseDate: today,
  quantityReceivedKg: "",
  quantityUsedKg: "0",
  reorderLevelKg: "0",
  unitCostPerKg: "",
  totalPurchaseCost: "",
  invoiceNumber: "",
  expiryDate: "",
  storageLocation: "",
  notes: "",
};

const feedTypeOptions = [
  { value: "STARTER", label: "Starter" },
  { value: "GROWER", label: "Grower" },
  { value: "FINISHER", label: "Finisher" },
  { value: "LAYER", label: "Layer" },
  { value: "BREEDER", label: "Breeder" },
  { value: "BROILER", label: "Broiler" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "EXPIRED", label: "Expired" },
];

const getId = (item) => item?._id || item?.id || "";

const getFarmName = (item) => {
  if (!item?.farm) return "-";

  if (typeof item.farm === "string") return item.farm;

  return item.farm.name || item.farm.code || "-";
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

const formatNumber = (value, digits = 2) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const getStatusLabel = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "LOW_STOCK":
      return "Low Stock";
    case "OUT_OF_STOCK":
      return "Out of Stock";
    case "EXPIRED":
      return "Expired";
    default:
      return status || "-";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "status-available";
    case "LOW_STOCK":
      return "status-low";
    case "OUT_OF_STOCK":
      return "status-out";
    case "EXPIRED":
      return "status-expired";
    default:
      return "status-default";
  }
};

const getFeedTypeLabel = (type) => {
  if (!type) return "-";

  return type
    .toString()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeSupplier = (supplier) => {
  if (!supplier) {
    return {
      supplierName: "",
      supplierPhone: "",
      supplierAddress: "",
    };
  }

  if (typeof supplier === "string") {
    return {
      supplierName: supplier,
      supplierPhone: "",
      supplierAddress: "",
    };
  }

  return {
    supplierName: supplier.name || supplier.supplierName || "",
    supplierPhone: supplier.phone || supplier.mobile || supplier.supplierPhone || "",
    supplierAddress: supplier.address || supplier.supplierAddress || "",
  };
};

const buildFormFromItem = (item) => {
  const supplier = normalizeSupplier(item.supplier);

  return {
    farm: getId(item.farm),
    feedName: item.feedName || "",
    feedType: item.feedType || "STARTER",
    brand: item.brand || "",
    batchNumber: item.batchNumber || "",
    supplierName: supplier.supplierName,
    supplierPhone: supplier.supplierPhone,
    supplierAddress: supplier.supplierAddress,
    purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().slice(0, 10) : "",
    quantityReceivedKg: item.quantityReceivedKg !== undefined ? String(item.quantityReceivedKg) : "",
    quantityUsedKg: item.quantityUsedKg !== undefined ? String(item.quantityUsedKg) : "0",
    reorderLevelKg: item.reorderLevelKg !== undefined ? String(item.reorderLevelKg) : "0",
    unitCostPerKg: item.unitCostPerKg !== undefined ? String(item.unitCostPerKg) : "",
    totalPurchaseCost: item.totalPurchaseCost !== undefined ? String(item.totalPurchaseCost) : "",
    invoiceNumber: item.invoiceNumber || "",
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : "",
    storageLocation: item.storageLocation || "",
    notes: item.notes || "",
  };
};

const extractErrorMessage = (error, fallback = "Something went wrong") => {
  return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
};

export default function FeedInventory() {
  const [farms, setFarms] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [feedTypeFilter, setFeedTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadFarms = async () => {
    try {
      setLoadingFarms(true);

      const response = await apiRequest("/farms");

      const farmList = getArray(response, ["farms", "data", "items"]);

      setFarms(farmList);
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to load farms"));
    } finally {
      setLoadingFarms(false);
    }
  };

  const loadFeedInventory = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (farmFilter) {
        params.set("farm", farmFilter);
      }

      if (feedTypeFilter) {
        params.set("feedType", feedTypeFilter);
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (expiryFilter) {
        params.set("expiry", expiryFilter);
      }

      if (lowStockFilter) {
        params.set("lowStock", "true");
      }

      params.set("page", String(requestedPage));
      params.set("limit", "20");

      const query = params.toString();

      const response = await apiRequest(`/feed-inventory${query ? `?${query}` : ""}`);

      const root = getObject(response);

      const list = getArray(response, ["data", "items", "feedInventories"]);

      setItems(list);

      setPagination(
        root?.pagination || {
          page: requestedPage,
          limit: 20,
          total: list.length,
          totalPages: Math.max(Math.ceil(list.length / 20), 1),
        }
      );
    } catch (err) {
      const message = extractErrorMessage(err, "Failed to load feed inventory");

      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    loadFeedInventory(page);
  }, [page, farmFilter, feedTypeFilter, statusFilter, expiryFilter, lowStockFilter]);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) => {
      const searchable = [item.feedName, item.feedType, item.brand, item.batchNumber, item.invoiceNumber, item.storageLocation, getFarmName(item), item.supplier?.name, item.supplier?.phone].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(value);
    });
  }, [items, search]);

  const summary = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.totalItems += 1;
        acc.received += Number(item.quantityReceivedKg || 0);
        acc.used += Number(item.quantityUsedKg || 0);
        acc.current += Number(item.currentStockKg || 0);
        acc.value += Number(item.currentStockKg || 0) * Number(item.unitCostPerKg || 0);

        if (item.status === "LOW_STOCK") {
          acc.low += 1;
        }

        if (item.status === "OUT_OF_STOCK") {
          acc.out += 1;
        }

        if (item.status === "EXPIRED") {
          acc.expired += 1;
        }

        return acc;
      },
      {
        totalItems: 0,
        received: 0,
        used: 0,
        current: 0,
        value: 0,
        low: 0,
        out: 0,
        expired: 0,
      }
    );
  }, [filteredItems]);

  const resetFilters = () => {
    setSearch("");
    setFarmFilter("");
    setFeedTypeFilter("");
    setStatusFilter("");
    setExpiryFilter("");
    setLowStockFilter(false);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handleRefresh = async () => {
    await Promise.all([loadFarms(), loadFeedInventory(page)]);
  };

  const exportExcel = () => {
    const headers = [
      "Feed",
      "Farm",
      "Farm Code",
      "Feed Type",
      "Brand",
      "Batch Number",
      "Supplier",
      "Supplier Phone",
      "Supplier Address",
      "Purchase Date",
      "Quantity Received (Kg)",
      "Quantity Used (Kg)",
      "Current Stock (Kg)",
      "Reorder Level (Kg)",
      "Unit Cost / Kg",
      "Total Purchase Cost",
      "Invoice Number",
      "Expiry Date",
      "Storage Location",
      "Status",
      "Notes",
    ];

    const rows = filteredItems.map((item) => {
      const supplier = normalizeSupplier(item?.supplier);

      return [
        item?.feedName || "",
        item?.farm?.name || item?.farm?.code || getFarmName(item),
        item?.farm?.code || "",
        getFeedTypeLabel(item?.feedType),
        item?.brand || "",
        item?.batchNumber || "",
        supplier.supplierName || "",
        supplier.supplierPhone || "",
        supplier.supplierAddress || "",
        formatDate(item?.purchaseDate),
        Number(item?.quantityReceivedKg || 0),
        Number(item?.quantityUsedKg || 0),
        Number(item?.currentStockKg || 0),
        Number(item?.reorderLevelKg || 0),
        Number(item?.unitCostPerKg || 0),
        Number(item?.totalPurchaseCost || 0),
        item?.invoiceNumber || "",
        formatDate(item?.expiryDate),
        item?.storageLocation || "",
        getStatusLabel(item?.status),
        item?.notes || "",
      ];
    });

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `feed-inventory-${new Date().toISOString().slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredItems
      .map((item) => {
        const supplier = normalizeSupplier(item?.supplier);

        return `
          <tr>
            <td>${item?.feedName || "-"}</td>
            <td>${getFarmName(item)}</td>
            <td>${getFeedTypeLabel(item?.feedType)}</td>
            <td>${item?.brand || "-"}</td>
            <td>${item?.batchNumber || "-"}</td>
            <td>${formatDate(item?.purchaseDate)}</td>
            <td>${formatNumber(item?.quantityReceivedKg)} kg</td>
            <td>${formatNumber(item?.quantityUsedKg)} kg</td>
            <td>${formatNumber(item?.currentStockKg)} kg</td>
            <td>₹${formatNumber(item?.unitCostPerKg)}</td>
            <td>${formatDate(item?.expiryDate)}</td>
            <td>${getStatusLabel(item?.status)}</td>
            <td>${supplier.supplierName || "-"}</td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Feed Inventory Report</title>

          <style>
            body{
              font-family:Arial,sans-serif;
              padding:24px;
              color:#172033;
            }

            h1{
              margin:0 0 6px;
              font-size:22px;
            }

            p{
              margin:0 0 18px;
              color:#667085;
              font-size:12px;
            }

            table{
              width:100%;
              border-collapse:collapse;
              font-size:9px;
            }

            th,td{
              border:1px solid #dfe4ec;
              padding:7px;
              text-align:left;
            }

            th{
              background:#f8fafc;
              font-weight:700;
            }

            @media print{
              body{
                padding:10px;
              }

              table{
                font-size:8px;
              }
            }
          </style>
        </head>

        <body>
          <h1>Feed Inventory Report</h1>

          <p>
            Generated on ${new Date().toLocaleString("en-IN")}
          </p>

          <table>
            <thead>
              <tr>
                <th>Feed</th>
                <th>Farm</th>
                <th>Type</th>
                <th>Brand</th>
                <th>Batch</th>
                <th>Purchase Date</th>
                <th>Received</th>
                <th>Used</th>
                <th>Current Stock</th>
                <th>Unit Cost</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Supplier</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const openCreate = () => {
    setSelectedItem(null);

    setForm({
      ...emptyForm,
      farm: farmFilter || "",
    });

    setModal("form");
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setModal("form");
  };

  const openView = async (item) => {
    try {
      setSelectedItem(item);
      setModal("view");

      const response = await apiRequest(`/feed-inventory/${getId(item)}`);

      const data = response?.data ?? response;

      if (data?.data) {
        setSelectedItem(data.data);
      }
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to load feed details"));
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setModal(null);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const received = Number(form.quantityReceivedKg || 0);

  const used = Number(form.quantityUsedKg || 0);

  const unitCost = Number(form.unitCostPerKg || 0);

  const calculatedStock = Math.max(received - used, 0);

  const calculatedPurchaseCost = form.totalPurchaseCost !== "" ? Number(form.totalPurchaseCost || 0) : received * unitCost;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.farm) {
      showError("Please select a farm");
      return;
    }

    if (!form.feedName.trim()) {
      showError("Feed name is required");
      return;
    }

    if (!form.feedType) {
      showError("Feed type is required");
      return;
    }

    if (!form.quantityReceivedKg || Number(form.quantityReceivedKg) <= 0) {
      showError("Quantity received must be greater than 0");
      return;
    }

    if (Number(form.quantityUsedKg || 0) < 0) {
      showError("Quantity used cannot be negative");
      return;
    }

    if (Number(form.quantityUsedKg || 0) > Number(form.quantityReceivedKg)) {
      showError("Quantity used cannot exceed quantity received");
      return;
    }

    if (Number(form.reorderLevelKg || 0) < 0) {
      showError("Reorder level cannot be negative");
      return;
    }

    if (Number(form.unitCostPerKg || 0) < 0) {
      showError("Unit cost cannot be negative");
      return;
    }

    if (form.totalPurchaseCost !== "" && Number(form.totalPurchaseCost) < 0) {
      showError("Total purchase cost cannot be negative");
      return;
    }

    const supplier = {
      name: form.supplierName.trim(),
      phone: form.supplierPhone.trim(),
      address: form.supplierAddress.trim(),
    };

    const payload = {
      farm: form.farm,
      feedName: form.feedName.trim(),
      feedType: form.feedType,
      brand: form.brand.trim(),
      batchNumber: form.batchNumber.trim(),
      supplier,
      purchaseDate: form.purchaseDate || undefined,
      quantityReceivedKg: Number(form.quantityReceivedKg),
      quantityUsedKg: Number(form.quantityUsedKg || 0),
      reorderLevelKg: Number(form.reorderLevelKg || 0),
      unitCostPerKg: Number(form.unitCostPerKg || 0),
      totalPurchaseCost: form.totalPurchaseCost !== "" ? Number(form.totalPurchaseCost) : undefined,
      invoiceNumber: form.invoiceNumber.trim(),
      expiryDate: form.expiryDate || undefined,
      storageLocation: form.storageLocation.trim(),
      notes: form.notes.trim(),
    };

    try {
      setSubmitting(true);

      if (selectedItem) {
        await apiRequest(`/feed-inventory/${getId(selectedItem)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showSuccess("Feed inventory updated successfully");
      } else {
        await apiRequest("/feed-inventory", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess("Feed inventory added successfully");
      }

      closeModal();

      await loadFeedInventory(page);
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to save feed inventory"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await showConfirm({
      title: "Delete Feed Inventory?",
      text: `Delete "${item.feedName || "this feed inventory"}"?\n\nIf Feed Consumption records exist, the backend will block deletion.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(getId(item));

      await apiRequest(`/feed-inventory/${getId(item)}`, {
        method: "DELETE",
      });

      showSuccess("Feed inventory deleted successfully");

      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadFeedInventory(page);
      }
    } catch (err) {
      const responseData = err?.response?.data || err?.data || {};

      let message = extractErrorMessage(err, "Failed to delete feed inventory");

      if (Array.isArray(responseData.dependentRecords)) {
        const dependencyText = responseData.dependentRecords.map((record) => `${record.type || "Record"}: ${record.count || 0}`).join(", ");

        if (dependencyText) {
          message += ` (${dependencyText})`;
        }
      }

      showError(message);
    } finally {
      setDeletingId("");
    }
  };

  const changePage = (nextPage) => {
    if (nextPage < 1) return;

    if (pagination.totalPages && nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <div className="feed-page">
      <style>{`.feed-field input[type="date"]{color-scheme:light dark}.feed-field input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .feed-field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.feed-page{min-height:100%;padding:24px;background:var(--admin-bg);color:var(--admin-text)}.feed-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}.feed-title-wrap{display:flex;align-items:flex-start;gap:13px}.feed-title-icon{width:44px;height:44px;border:1px solid var(--admin-border);border-radius:13px;background:var(--admin-surface);display:flex;align-items:center;justify-content:center;color:var(--admin-primary);flex-shrink:0}.feed-title{margin:0;font-size:25px;font-weight:800;letter-spacing:-.4px}.feed-subtitle{margin:5px 0 0;color:var(--admin-muted);font-size:13px;line-height:1.5}.feed-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.feed-refresh-spin{animation:feed-header-spin 1s linear infinite}@keyframes feed-header-spin{to{transform:rotate(360deg)}}.feed-btn{height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.feed-btn:hover{transform:translateY(-1px);border-color:var(--admin-primary)}.feed-btn-primary{background:var(--admin-primary);color:#fff;border-color:var(--admin-primary)}.feed-btn-danger{color:var(--admin-danger)}.feed-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.feed-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:13px;margin-bottom:18px}.feed-stat{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px;min-width:0}.feed-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.feed-stat-icon{width:34px;height:34px;border-radius:10px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;color:var(--admin-primary)}.feed-stat-label{font-size:12px;color:var(--admin-muted);font-weight:600}.feed-stat-value{font-size:22px;font-weight:800;line-height:1.1}.feed-stat-meta{font-size:11px;color:var(--admin-muted);margin-top:5px}.feed-filters{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:15px;margin-bottom:18px}.feed-filter-row{display:grid;grid-template-columns:minmax(220px,1.5fr) repeat(5,minmax(130px,1fr));gap:10px;align-items:center}.feed-input-wrap{position:relative}.feed-input-wrap>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--admin-muted);pointer-events:none}.feed-input-wrap .feed-search-clear{position:absolute;left:auto;right:8px;top:50%;transform:translateY(-50%);width:27px;height:27px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s ease}.feed-input-wrap .feed-search-clear:hover{background:var(--admin-surface-2);color:var(--admin-text)}.feed-input{width:100%;height:40px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:0 40px 0 38px;font-size:13px;outline:none}.feed-select{width:100%;height:40px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:0 11px;font-size:13px;outline:none}.feed-input:focus,.feed-select:focus{border-color:var(--admin-primary)}.feed-check{height:40px;border:1px solid var(--admin-border);border-radius:9px;padding:0 10px;display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;white-space:nowrap;color:var(--admin-text);background:var(--admin-surface-2)}.feed-check input{accent-color:var(--admin-primary)}.feed-table-wrap{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden}.feed-table-scroll{overflow-x:auto}.feed-table{width:100%;border-collapse:collapse;min-width:1180px}.feed-table th{padding:13px 14px;text-align:left;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;text-transform:uppercase;letter-spacing:.4px;font-weight:800;border-bottom:1px solid var(--admin-border);white-space:nowrap}.feed-table td{padding:14px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.feed-table tbody tr:last-child td{border-bottom:0}.feed-table tbody tr:hover{background:var(--admin-surface-2)}.feed-name{font-weight:800}.feed-muted{color:var(--admin-muted);font-size:11px;margin-top:3px}.feed-number{font-weight:750;white-space:nowrap}.feed-status{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:800;white-space:nowrap}.status-available{background:rgba(34,197,94,.12);color:#22c55e}.status-low{background:rgba(245,158,11,.12);color:#f59e0b}.status-out{background:rgba(239,68,68,.12);color:#ef4444}.status-expired{background:rgba(239,68,68,.12);color:#ef4444}.status-default{background:var(--admin-surface-2);color:var(--admin-muted)}.feed-actions{display:flex;gap:6px}.feed-icon-btn{width:32px;height:32px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-muted);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.feed-icon-btn:hover{color:var(--admin-primary);border-color:var(--admin-primary)}.feed-icon-btn.delete:hover{color:var(--admin-danger);border-color:var(--admin-danger)}.feed-empty{padding:55px 20px;text-align:center}.feed-empty-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:14px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;color:var(--admin-muted)}.feed-empty h3{margin:0 0 5px;font-size:16px}.feed-empty p{margin:0;color:var(--admin-muted);font-size:13px}.feed-loading{padding:45px;text-align:center;color:var(--admin-muted);font-size:13px}.feed-error{padding:18px;text-align:center;color:var(--admin-danger);font-size:13px}.feed-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border-top:1px solid var(--admin-border)}.feed-page-info{font-size:12px;color:var(--admin-muted)}.feed-page-actions{display:flex;gap:7px}.feed-page-btn{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer}.feed-page-btn:disabled{opacity:.4;cursor:not-allowed}.feed-page-btn:hover:not(:disabled){border-color:var(--admin-primary);color:var(--admin-primary)}.feed-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.feed-modal{width:min(850px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 25px 80px rgba(0,0,0,.3)}.feed-modal-header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 19px;background:var(--admin-surface);border-bottom:1px solid var(--admin-border)}.feed-modal-title{font-size:17px;font-weight:800}.feed-modal-subtitle{font-size:11px;color:var(--admin-muted);margin-top:3px}.feed-close{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.feed-form{padding:19px}.feed-section-title{display:flex;align-items:center;gap:8px;margin:0 0 12px;font-size:13px;font-weight:800}.feed-form-section{margin-bottom:20px}.feed-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.feed-field{display:flex;flex-direction:column;gap:6px}.feed-field.full{grid-column:1/-1}.feed-field label{font-size:11px;color:var(--admin-muted);font-weight:700}.feed-field input,.feed-field select,.feed-field textarea{width:100%;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:10px 11px;font-size:13px;outline:none}.feed-field input,.feed-field select{height:40px}.feed-field textarea{min-height:82px;resize:vertical}.feed-field input:focus,.feed-field select:focus,.feed-field textarea:focus{border-color:var(--admin-primary)}.feed-calc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.feed-calc-card{border:1px solid var(--admin-border);background:var(--admin-surface-2);border-radius:10px;padding:11px}.feed-calc-label{font-size:10px;color:var(--admin-muted);text-transform:uppercase;letter-spacing:.3px}.feed-calc-value{font-size:16px;font-weight:800;margin-top:4px}.feed-form-actions{display:flex;justify-content:flex-end;gap:9px;padding-top:5px}.feed-view-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--admin-border);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden;margin:19px}.feed-view-item{background:var(--admin-surface);padding:13px}.feed-view-label{font-size:10px;color:var(--admin-muted);text-transform:uppercase;letter-spacing:.35px;font-weight:700}.feed-view-value{font-size:13px;font-weight:750;margin-top:4px;word-break:break-word}.feed-view-full{grid-column:1/-1}.feed-view-actions{display:flex;justify-content:flex-end;gap:9px;padding:0 19px 19px}.feed-mobile-list{display:none}@media(max-width:1200px){.feed-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.feed-filter-row{grid-template-columns:repeat(3,minmax(0,1fr))}.feed-filter-row .feed-input-wrap{grid-column:1/-1}}@media(max-width:800px){.feed-page{padding:16px}.feed-header{flex-direction:column}.feed-header-actions{width:100%;justify-content:flex-end;display:flex;flex-wrap:nowrap;gap:8px}.feed-header-actions .top-action-btn{flex:0 0 auto}.feed-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.feed-form-grid{grid-template-columns:1fr}.feed-field.full{grid-column:auto}.feed-calc{grid-template-columns:1fr}.feed-view-grid{grid-template-columns:1fr}.feed-view-full{grid-column:auto}.feed-table-wrap{display:none}.feed-mobile-list{display:grid;gap:10px}.feed-mobile-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:13px;padding:14px}.feed-mobile-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.feed-mobile-name{font-weight:800;font-size:14px}.feed-mobile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:13px}.feed-mobile-item{min-width:0}.feed-mobile-label{font-size:10px;color:var(--admin-muted);text-transform:uppercase}.feed-mobile-value{font-size:12px;font-weight:700;margin-top:3px;word-break:break-word}.feed-mobile-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--admin-border)}}@media(max-width:520px){.feed-summary{grid-template-columns:1fr}.feed-filter-row{grid-template-columns:1fr}.feed-filter-row .feed-input-wrap{grid-column:auto}.feed-pagination{flex-direction:column;align-items:stretch}.feed-page-actions{justify-content:center}.feed-modal{max-height:calc(100vh - 20px)}.feed-overlay{padding:10px}.feed-modal-header{padding:14px}.feed-form{padding:14px}.feed-view-grid{margin:14px}.feed-view-actions{padding:0 14px 14px}.feed-form-actions{flex-direction:column-reverse}.feed-form-actions .feed-btn{width:100%}}@media(max-width:430px){.feed-header-actions{gap:6px}.feed-header-actions .top-action-btn{height:38px;padding:0 8px;font-size:11px;gap:5px}.feed-header-actions .refresh-action-btn{width:38px;padding:0}.feed-header-actions .top-action-btn svg{width:16px;height:16px}.feed-header-actions .add-action-btn{padding:0 9px}}`}</style>

      <div className="feed-header">
        <div className="feed-title-wrap">
          <div className="feed-title-icon">
            <Leaf size={22} />
          </div>

          <div>
            <h1 className="feed-title">Feed Inventory</h1>

            <p className="feed-subtitle">Manage feed stock, purchases, consumption-linked quantity and expiry status.</p>
          </div>
        </div>

        <div className="feed-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || loadingFarms} title="Refresh">
            <RefreshCw size={17} className={loading || loadingFarms ? "feed-refresh-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreate}>
            <Plus size={17} />
            Add Feed
          </button>
        </div>
      </div>

      <div className="feed-summary">
        <div className="feed-stat">
          <div className="feed-stat-top">
            <div className="feed-stat-label">Feed Items</div>

            <div className="feed-stat-icon">
              <Package size={17} />
            </div>
          </div>

          <div className="feed-stat-value">{summary.totalItems}</div>

          <div className="feed-stat-meta">Current page records</div>
        </div>

        <div className="feed-stat">
          <div className="feed-stat-top">
            <div className="feed-stat-label">Received</div>

            <div className="feed-stat-icon">
              <Scale size={17} />
            </div>
          </div>

          <div className="feed-stat-value">{formatNumber(summary.received)} kg</div>

          <div className="feed-stat-meta">Total received on this page</div>
        </div>

        <div className="feed-stat">
          <div className="feed-stat-top">
            <div className="feed-stat-label">Used</div>

            <div className="feed-stat-icon">
              <Leaf size={17} />
            </div>
          </div>

          <div className="feed-stat-value">{formatNumber(summary.used)} kg</div>

          <div className="feed-stat-meta">Consumption-linked quantity</div>
        </div>

        <div className="feed-stat">
          <div className="feed-stat-top">
            <div className="feed-stat-label">Current Stock</div>

            <div className="feed-stat-icon">
              <Warehouse size={17} />
            </div>
          </div>

          <div className="feed-stat-value">{formatNumber(summary.current)} kg</div>

          <div className="feed-stat-meta">
            {summary.low} low · {summary.out} out
          </div>
        </div>

        <div className="feed-stat">
          <div className="feed-stat-top">
            <div className="feed-stat-label">Stock Value</div>

            <div className="feed-stat-icon">
              <IndianRupee size={17} />
            </div>
          </div>

          <div className="feed-stat-value">₹{formatNumber(summary.value)}</div>

          <div className="feed-stat-meta">{summary.expired} expired item(s)</div>
        </div>
      </div>

      <div className="feed-filters">
        <div className="feed-filter-row">
          <div className="feed-input-wrap">
            <Search size={16} />

            <input className="feed-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search feed, brand, batch..." />

            {search && (
              <button type="button" className="feed-search-clear" onClick={clearSearch} title="Clear search" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="feed-select"
            value={farmFilter}
            onChange={(event) => {
              setFarmFilter(event.target.value);
              setPage(1);
            }}
            disabled={loadingFarms}>
            <option value="">All Farms</option>

            {farms.map((farm) => (
              <option key={getId(farm)} value={getId(farm)}>
                {farm.name || farm.code || "Farm"}
              </option>
            ))}
          </select>

          <select
            className="feed-select"
            value={feedTypeFilter}
            onChange={(event) => {
              setFeedTypeFilter(event.target.value);
              setPage(1);
            }}>
            <option value="">All Feed Types</option>

            {feedTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="feed-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="feed-select"
            value={expiryFilter}
            onChange={(event) => {
              setExpiryFilter(event.target.value);
              setPage(1);
            }}>
            <option value="">All Expiry</option>

            <option value="valid">Valid</option>

            <option value="expired">Expired</option>
          </select>

          <label className="feed-check">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(event) => {
                setLowStockFilter(event.target.checked);
                setPage(1);
              }}
            />
            Low Stock
          </label>
        </div>
      </div>

      {error ? (
        <div className="feed-table-wrap">
          <div className="feed-error">
            <AlertTriangle size={17} />

            <div style={{ marginTop: 8 }}>{error}</div>
          </div>
        </div>
      ) : loading ? (
        <div className="feed-table-wrap">
          <div className="feed-loading">Loading feed inventory...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="feed-table-wrap">
          <div className="feed-empty">
            <div className="feed-empty-icon">
              <Package size={22} />
            </div>

            <h3>No feed inventory found</h3>

            <p>Add your first feed inventory record or change the filters.</p>

            <div style={{ marginTop: 15 }}>
              <button type="button" className="feed-btn feed-btn-primary" onClick={openCreate}>
                <Plus size={15} />
                Add Feed
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="feed-table-wrap">
            <div className="feed-table-scroll">
              <table className="feed-table">
                <thead>
                  <tr>
                    <th>Feed</th>
                    <th>Farm</th>
                    <th>Type</th>
                    <th>Purchase Date</th>
                    <th>Received</th>
                    <th>Used</th>
                    <th>Current Stock</th>
                    <th>Unit Cost</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={getId(item)}>
                      <td>
                        <div className="feed-name">{item.feedName || "-"}</div>

                        {item.brand && <div className="feed-muted">{item.brand}</div>}

                        {item.batchNumber && <div className="feed-muted">Batch: {item.batchNumber}</div>}
                      </td>

                      <td>
                        <div className="feed-number">{getFarmName(item)}</div>

                        {item.farm?.code && <div className="feed-muted">{item.farm.code}</div>}
                      </td>

                      <td>{getFeedTypeLabel(item.feedType)}</td>

                      <td>{formatDate(item.purchaseDate)}</td>

                      <td className="feed-number">{formatNumber(item.quantityReceivedKg)} kg</td>

                      <td className="feed-number">{formatNumber(item.quantityUsedKg)} kg</td>

                      <td className="feed-number">
                        {formatNumber(item.currentStockKg)} kg
                        {Number(item.reorderLevelKg || 0) > 0 && <div className="feed-muted">Reorder: {formatNumber(item.reorderLevelKg)} kg</div>}
                      </td>

                      <td className="feed-number">₹{formatNumber(item.unitCostPerKg)}</td>

                      <td>
                        <span className={`feed-status ${getStatusClass(item.status)}`}>
                          {item.status === "AVAILABLE" && <CheckCircle2 size={12} />}

                          {(item.status === "LOW_STOCK" || item.status === "OUT_OF_STOCK" || item.status === "EXPIRED") && <AlertTriangle size={12} />}

                          {getStatusLabel(item.status)}
                        </span>
                      </td>

                      <td>{item.expiryDate ? formatDate(item.expiryDate) : "No expiry"}</td>

                      <td>
                        <div className="feed-actions">
                          <button type="button" className="feed-icon-btn" title="View" onClick={() => openView(item)}>
                            <Eye size={15} />
                          </button>

                          <button type="button" className="feed-icon-btn" title="Edit" onClick={() => openEdit(item)}>
                            <Pencil size={15} />
                          </button>

                          <button type="button" className="feed-icon-btn delete" title="Delete" onClick={() => handleDelete(item)} disabled={deletingId === getId(item)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="feed-pagination">
              <div className="feed-page-info">
                Page {pagination.page || page} of {pagination.totalPages || 1} · {pagination.total || filteredItems.length} total records
              </div>

              <div className="feed-page-actions">
                <button type="button" className="feed-page-btn" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)}>
                  <ChevronLeft size={16} />
                </button>

                <button type="button" className="feed-page-btn" disabled={loading || page >= (pagination.totalPages || 1)} onClick={() => changePage(page + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="feed-mobile-list">
            {filteredItems.map((item) => (
              <div className="feed-mobile-card" key={getId(item)}>
                <div className="feed-mobile-top">
                  <div>
                    <div className="feed-mobile-name">{item.feedName || "-"}</div>

                    <div className="feed-muted">
                      {getFarmName(item)} · {getFeedTypeLabel(item.feedType)}
                    </div>
                  </div>

                  <span className={`feed-status ${getStatusClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                </div>

                <div className="feed-mobile-grid">
                  <div className="feed-mobile-item">
                    <div className="feed-mobile-label">Received</div>

                    <div className="feed-mobile-value">{formatNumber(item.quantityReceivedKg)} kg</div>
                  </div>

                  <div className="feed-mobile-item">
                    <div className="feed-mobile-label">Used</div>

                    <div className="feed-mobile-value">{formatNumber(item.quantityUsedKg)} kg</div>
                  </div>

                  <div className="feed-mobile-item">
                    <div className="feed-mobile-label">Stock</div>

                    <div className="feed-mobile-value">{formatNumber(item.currentStockKg)} kg</div>
                  </div>

                  <div className="feed-mobile-item">
                    <div className="feed-mobile-label">Unit Cost</div>

                    <div className="feed-mobile-value">₹{formatNumber(item.unitCostPerKg)}</div>
                  </div>

                  <div className="feed-mobile-item">
                    <div className="feed-mobile-label">Purchase</div>

                    <div className="feed-mobile-value">{formatDate(item.purchaseDate)}</div>
                  </div>

                  <div className="feed-mobile-item">
                    <div className="feed-mobile-label">Expiry</div>

                    <div className="feed-mobile-value">{item.expiryDate ? formatDate(item.expiryDate) : "No expiry"}</div>
                  </div>
                </div>

                <div className="feed-mobile-actions">
                  <button type="button" className="feed-icon-btn" onClick={() => openView(item)}>
                    <Eye size={15} />
                  </button>

                  <button type="button" className="feed-icon-btn" onClick={() => openEdit(item)}>
                    <Pencil size={15} />
                  </button>

                  <button type="button" className="feed-icon-btn delete" onClick={() => handleDelete(item)} disabled={deletingId === getId(item)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modal === "form" && (
        <div className="feed-overlay" onMouseDown={closeModal}>
          <div className="feed-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="feed-modal-header">
              <div>
                <div className="feed-modal-title">{selectedItem ? "Edit Feed Inventory" : "Add Feed Inventory"}</div>

                <div className="feed-modal-subtitle">{selectedItem ? "Update inventory details" : "Record new feed stock purchase"}</div>
              </div>

              <button type="button" className="feed-close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <form className="feed-form" onSubmit={handleSubmit}>
              <div className="feed-form-section">
                <div className="feed-section-title">
                  <Warehouse size={15} />
                  Farm & Feed Details
                </div>

                <div className="feed-form-grid">
                  <div className="feed-field">
                    <label>Farm *</label>

                    <select name="farm" value={form.farm} onChange={handleFormChange} disabled={Boolean(selectedItem) || loadingFarms} required>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={getId(farm)} value={getId(farm)}>
                          {farm.name || farm.code || "Farm"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="feed-field">
                    <label>Feed Name *</label>

                    <input name="feedName" value={form.feedName} onChange={handleFormChange} placeholder="e.g. Kadaknath Starter Feed" required />
                  </div>

                  <div className="feed-field">
                    <label>Feed Type *</label>

                    <select name="feedType" value={form.feedType} onChange={handleFormChange} required>
                      {feedTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="feed-field">
                    <label>Brand</label>

                    <input name="brand" value={form.brand} onChange={handleFormChange} placeholder="Brand name" />
                  </div>

                  <div className="feed-field">
                    <label>Feed Batch Number</label>

                    <input name="batchNumber" value={form.batchNumber} onChange={handleFormChange} placeholder="Feed batch number" />
                  </div>

                  <div className="feed-field">
                    <label>Storage Location</label>

                    <input name="storageLocation" value={form.storageLocation} onChange={handleFormChange} placeholder="e.g. Feed Store Room" />
                  </div>
                </div>
              </div>

              <div className="feed-form-section">
                <div className="feed-section-title">
                  <CalendarDays size={15} />
                  Purchase & Stock
                </div>

                <div className="feed-form-grid">
                  <div className="feed-field">
                    <label>Purchase Date</label>

                    <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleFormChange} />
                  </div>

                  <div className="feed-field">
                    <label>Quantity Received (Kg) *</label>

                    <input type="number" min="0.001" step="0.001" name="quantityReceivedKg" value={form.quantityReceivedKg} onChange={handleFormChange} placeholder="0" required />
                  </div>

                  <div className="feed-field">
                    <label>Quantity Used (Kg)</label>

                    <input type="number" min="0" step="0.001" name="quantityUsedKg" value={form.quantityUsedKg} onChange={handleFormChange} disabled={Boolean(selectedItem)} />

                    {selectedItem && <div className="feed-muted">Consumption-linked quantity is protected.</div>}
                  </div>

                  <div className="feed-field">
                    <label>Reorder Level (Kg)</label>

                    <input type="number" min="0" step="0.001" name="reorderLevelKg" value={form.reorderLevelKg} onChange={handleFormChange} />
                  </div>

                  <div className="feed-field">
                    <label>Unit Cost / Kg</label>

                    <input type="number" min="0" step="0.01" name="unitCostPerKg" value={form.unitCostPerKg} onChange={handleFormChange} placeholder="₹ 0" />
                  </div>

                  <div className="feed-field">
                    <label>Total Purchase Cost</label>

                    <input type="number" min="0" step="0.01" name="totalPurchaseCost" value={form.totalPurchaseCost} onChange={handleFormChange} placeholder="Auto calculated" />
                  </div>

                  <div className="feed-field">
                    <label>Expiry Date</label>

                    <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleFormChange} />
                  </div>

                  <div className="feed-field">
                    <label>Invoice Number</label>

                    <input name="invoiceNumber" value={form.invoiceNumber} onChange={handleFormChange} placeholder="Invoice number" />
                  </div>
                </div>

                <div className="feed-calc">
                  <div className="feed-calc-card">
                    <div className="feed-calc-label">Current Stock</div>

                    <div className="feed-calc-value">{formatNumber(calculatedStock)} kg</div>
                  </div>

                  <div className="feed-calc-card">
                    <div className="feed-calc-label">Purchase Cost</div>

                    <div className="feed-calc-value">₹{formatNumber(calculatedPurchaseCost)}</div>
                  </div>

                  <div className="feed-calc-card">
                    <div className="feed-calc-label">Reorder Level</div>

                    <div className="feed-calc-value">{formatNumber(form.reorderLevelKg)} kg</div>
                  </div>
                </div>
              </div>

              <div className="feed-form-section">
                <div className="feed-section-title">
                  <ClipboardList size={15} />
                  Supplier Details
                </div>

                <div className="feed-form-grid">
                  <div className="feed-field">
                    <label>Supplier Name</label>

                    <input name="supplierName" value={form.supplierName} onChange={handleFormChange} placeholder="Supplier name" />
                  </div>

                  <div className="feed-field">
                    <label>Supplier Phone</label>

                    <input name="supplierPhone" value={form.supplierPhone} onChange={handleFormChange} placeholder="Phone number" />
                  </div>

                  <div className="feed-field">
                    <label>Supplier Address</label>

                    <input name="supplierAddress" value={form.supplierAddress} onChange={handleFormChange} placeholder="Supplier address" />
                  </div>

                  <div className="feed-field full">
                    <label>Notes</label>

                    <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Additional notes..." />
                  </div>
                </div>
              </div>

              <div className="feed-form-actions">
                <button type="button" className="feed-btn" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="feed-btn feed-btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={15} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      {selectedItem ? "Update Feed" : "Save Feed"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedItem && (
        <div className="feed-overlay" onMouseDown={closeModal}>
          <div className="feed-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="feed-modal-header">
              <div>
                <div className="feed-modal-title">{selectedItem.feedName || "Feed Inventory"}</div>

                <div className="feed-modal-subtitle">Complete inventory details</div>
              </div>

              <button type="button" className="feed-close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <div className="feed-view-grid">
              <div className="feed-view-item">
                <div className="feed-view-label">Farm</div>

                <div className="feed-view-value">{getFarmName(selectedItem)}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Feed Type</div>

                <div className="feed-view-value">{getFeedTypeLabel(selectedItem.feedType)}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Brand</div>

                <div className="feed-view-value">{selectedItem.brand || "-"}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Batch Number</div>

                <div className="feed-view-value">{selectedItem.batchNumber || "-"}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Purchase Date</div>

                <div className="feed-view-value">{formatDate(selectedItem.purchaseDate)}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Expiry Date</div>

                <div className="feed-view-value">{selectedItem.expiryDate ? formatDate(selectedItem.expiryDate) : "No expiry"}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Quantity Received</div>

                <div className="feed-view-value">{formatNumber(selectedItem.quantityReceivedKg)} kg</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Quantity Used</div>

                <div className="feed-view-value">{formatNumber(selectedItem.quantityUsedKg)} kg</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Current Stock</div>

                <div className="feed-view-value">{formatNumber(selectedItem.currentStockKg)} kg</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Reorder Level</div>

                <div className="feed-view-value">{formatNumber(selectedItem.reorderLevelKg)} kg</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Unit Cost / Kg</div>

                <div className="feed-view-value">₹{formatNumber(selectedItem.unitCostPerKg)}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Purchase Cost</div>

                <div className="feed-view-value">₹{formatNumber(selectedItem.totalPurchaseCost)}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Invoice Number</div>

                <div className="feed-view-value">{selectedItem.invoiceNumber || "-"}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Storage Location</div>

                <div className="feed-view-value">{selectedItem.storageLocation || "-"}</div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Status</div>

                <div className="feed-view-value">
                  <span className={`feed-status ${getStatusClass(selectedItem.status)}`}>{getStatusLabel(selectedItem.status)}</span>
                </div>
              </div>

              <div className="feed-view-item">
                <div className="feed-view-label">Supplier</div>

                <div className="feed-view-value">
                  {normalizeSupplier(selectedItem.supplier).supplierName}

                  {!normalizeSupplier(selectedItem.supplier).supplierName && "-"}
                </div>
              </div>

              <div className="feed-view-item feed-view-full">
                <div className="feed-view-label">Supplier Contact</div>

                <div className="feed-view-value">
                  {normalizeSupplier(selectedItem.supplier).supplierPhone || "-"}

                  {normalizeSupplier(selectedItem.supplier).supplierAddress ? ` · ${normalizeSupplier(selectedItem.supplier).supplierAddress}` : ""}
                </div>
              </div>

              <div className="feed-view-item feed-view-full">
                <div className="feed-view-label">Notes</div>

                <div className="feed-view-value">{selectedItem.notes || "-"}</div>
              </div>
            </div>

            <div className="feed-view-actions">
              <button type="button" className="feed-btn" onClick={closeModal}>
                Close
              </button>

              <button
                type="button"
                className="feed-btn feed-btn-primary"
                onClick={() => {
                  openEdit(selectedItem);
                }}>
                <Pencil size={15} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
