import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Edit3, Eye, FileSpreadsheet, FileText, Filter, IndianRupee, PackageOpen, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const MEDICINE_TYPES = ["MEDICINE", "VACCINE", "ANTIBIOTIC", "VITAMIN", "SUPPLEMENT", "DISINFECTANT", "OTHER"];

const MEDICINE_UNITS = ["ML", "LITRE", "GRAM", "KG", "TABLET", "DOSE", "VIAL", "BOTTLE", "PACK", "PIECE"];

const STATUS_OPTIONS = ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "EXPIRED"];

const getArray = (response, keys = []) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) {
    return root;
  }

  for (const key of keys) {
    if (Array.isArray(root?.[key])) {
      return root[key];
    }
  }

  return [];
};

const getResponseRoot = (response) => response?.data ?? response ?? {};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
};

const emptyForm = () => ({
  farm: "",
  name: "",
  type: "MEDICINE",
  brand: "",
  composition: "",
  batchNumber: "",
  supplier: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  unit: "ML",
  quantityReceived: "",
  quantityUsed: "0",
  reorderLevel: "0",
  unitCost: "",
  totalPurchaseCost: "",
  invoiceNumber: "",
  storageLocation: "",
  storageTemperature: "",
  notes: "",
});

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const getStatusClass = (status) => {
  if (status === "AVAILABLE") return "status-available";
  if (status === "LOW_STOCK") return "status-low";
  if (status === "OUT_OF_STOCK") return "status-out";
  if (status === "EXPIRED") return "status-expired";

  return "status-default";
};

const getTypeClass = (type) => {
  if (type === "VACCINE") return "type-vaccine";
  if (type === "ANTIBIOTIC") return "type-antibiotic";
  if (type === "VITAMIN") return "type-vitamin";
  if (type === "SUPPLEMENT") return "type-supplement";
  if (type === "DISINFECTANT") return "type-disinfectant";

  return "type-default";
};

const MedicineVaccine = () => {
  const [medicines, setMedicines] = useState([]);
  const [farms, setFarms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dependencyLoading, setDependencyLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    farm: "",
    type: "",
    status: "",
    expiry: "",
    lowStock: false,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [form, setForm] = useState(emptyForm());

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");

      const items = getArray(response, ["farms", "data", "items"]);

      setFarms(items);
    } catch (requestError) {
      showError(getErrorMessage(requestError, "Failed to load farms"));
    }
  };

  const loadMedicines = async (currentPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.farm) {
        params.set("farm", filters.farm);
      }

      if (filters.type) {
        params.set("type", filters.type);
      }

      if (filters.status) {
        params.set("status", filters.status);
      }

      if (filters.expiry) {
        params.set("expiry", filters.expiry);
      }

      if (filters.lowStock) {
        params.set("lowStock", "true");
      }

      params.set("page", String(currentPage));
      params.set("limit", String(limit));

      const response = await apiRequest(`/medicine?${params.toString()}`);

      const root = getResponseRoot(response);

      const items = getArray(response, ["data", "medicines", "items"]);

      setMedicines(items);

      setPagination(
        root?.pagination || {
          page: currentPage,
          limit,
          total: items.length,
          totalPages: 1,
        }
      );
    } catch (requestError) {
      const message = getErrorMessage(requestError, "Failed to load medicine inventory");

      setError(message);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadDependencies(), loadMedicines(page)]);
  };

  const exportExcel = () => {
    const headers = [
      "Medicine",
      "Brand",
      "Type",
      "Farm",
      "Batch Number",
      "Supplier",
      "Unit",
      "Quantity Received",
      "Quantity Used",
      "Current Stock",
      "Reorder Level",
      "Unit Cost",
      "Total Purchase Cost",
      "Status",
      "Purchase Date",
      "Expiry Date",
      "Invoice Number",
      "Storage Location",
      "Storage Temperature",
      "Composition",
      "Notes",
    ];

    const rows = filteredMedicines.map((item) => [
      item?.name || "",
      item?.brand || "",
      item?.type || "",
      farmName(item),
      item?.batchNumber || "",
      item?.supplier || "",
      item?.unit || "",
      Number(item?.quantityReceived || 0),
      Number(item?.quantityUsed || 0),
      Number(item?.currentStock || 0),
      Number(item?.reorderLevel || 0),
      Number(item?.unitCost || 0),
      Number(item?.totalPurchaseCost || 0),
      item?.status?.replaceAll("_", " ") || "",
      formatDate(item?.purchaseDate),
      formatDate(item?.expiryDate),
      item?.invoiceNumber || "",
      item?.storageLocation || "",
      item?.storageTemperature || "",
      item?.composition || "",
      item?.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `medicine-vaccine-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredMedicines
      .map(
        (item) => `
          <tr>
            <td>${item?.name || "-"}</td>
            <td>${item?.type || "-"}</td>
            <td>${farmName(item)}</td>
            <td>${item?.batchNumber || "-"}</td>
            <td>${formatNumber(item?.currentStock)} ${item?.unit || ""}</td>
            <td>${formatDate(item?.expiryDate)}</td>
            <td>${formatMoney(item?.unitCost)}</td>
            <td>${item?.status?.replaceAll("_", " ") || "-"}</td>
            <td>${item?.supplier || "-"}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Medicine & Vaccine Inventory</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#172033}
            h1{margin:0 0 6px;font-size:22px}
            p{margin:0 0 18px;color:#667085;font-size:12px}
            table{width:100%;border-collapse:collapse;font-size:9px}
            th,td{border:1px solid #dfe4ec;padding:7px;text-align:left}
            th{background:#f8fafc;font-weight:700}
            @media print{body{padding:10px}table{font-size:8px}}
          </style>
        </head>
        <body>
          <h1>Medicine & Vaccine Inventory Report</h1>
          <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Type</th>
                <th>Farm</th>
                <th>Batch</th>
                <th>Current Stock</th>
                <th>Expiry</th>
                <th>Unit Cost</th>
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

  const loadDependencies = async () => {
    try {
      setDependencyLoading(true);

      await Promise.all([loadFarms()]);
    } finally {
      setDependencyLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    loadMedicines(page);
  }, [page, filters.farm, filters.type, filters.status, filters.expiry, filters.lowStock]);

  const filteredMedicines = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return medicines;
    }

    return medicines.filter((item) => {
      const searchableText = [item?.name, item?.type, item?.brand, item?.composition, item?.batchNumber, item?.supplier, item?.invoiceNumber, item?.storageLocation, item?.farm?.name, item?.farm?.code, item?.status].filter(Boolean).join(" ").toLowerCase();

      return searchableText.includes(value);
    });
  }, [medicines, search]);

  const summary = useMemo(() => {
    const totalRecords = filteredMedicines.length;

    const totalStock = filteredMedicines.reduce((sum, item) => sum + Number(item?.currentStock || 0), 0);

    const totalPurchaseValue = filteredMedicines.reduce((sum, item) => sum + Number(item?.totalPurchaseCost || 0), 0);

    const lowStockCount = filteredMedicines.filter((item) => item?.status === "LOW_STOCK").length;

    const expiredCount = filteredMedicines.filter((item) => item?.status === "EXPIRED").length;

    const outOfStockCount = filteredMedicines.filter((item) => item?.status === "OUT_OF_STOCK").length;

    return {
      totalRecords,
      totalStock,
      totalPurchaseValue,
      lowStockCount,
      expiredCount,
      outOfStockCount,
    };
  }, [filteredMedicines]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();

    if (filters.farm) {
      setForm((previous) => ({
        ...previous,
        farm: filters.farm,
      }));
    }

    setShowFormModal(true);
  };

  const openEditModal = async (item) => {
    try {
      setSaving(true);

      const response = await apiRequest(`/medicine/${item._id}`);

      const root = getResponseRoot(response);
      const medicine = root?.data || item;

      setEditingId(medicine._id);

      setForm({
        farm: medicine?.farm?._id || medicine?.farm || "",
        name: medicine?.name || "",
        type: medicine?.type || "MEDICINE",
        brand: medicine?.brand || "",
        composition: medicine?.composition || "",
        batchNumber: medicine?.batchNumber || "",
        supplier: medicine?.supplier || "",
        purchaseDate: medicine?.purchaseDate ? new Date(medicine.purchaseDate).toISOString().slice(0, 10) : "",
        expiryDate: medicine?.expiryDate ? new Date(medicine.expiryDate).toISOString().slice(0, 10) : "",
        unit: medicine?.unit || "ML",
        quantityReceived: String(medicine?.quantityReceived ?? ""),
        quantityUsed: String(medicine?.quantityUsed ?? "0"),
        reorderLevel: String(medicine?.reorderLevel ?? "0"),
        unitCost: String(medicine?.unitCost ?? ""),
        totalPurchaseCost: String(medicine?.totalPurchaseCost ?? ""),
        invoiceNumber: medicine?.invoiceNumber || "",
        storageLocation: medicine?.storageLocation || "",
        storageTemperature: medicine?.storageTemperature || "",
        notes: medicine?.notes || "",
      });

      setShowFormModal(true);
    } catch (requestError) {
      showError(getErrorMessage(requestError, "Failed to load medicine"));
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = async (item) => {
    try {
      const response = await apiRequest(`/medicine/${item._id}`);

      const root = getResponseRoot(response);

      setSelectedMedicine(root?.data || item);
      setShowViewModal(true);
    } catch (requestError) {
      showError(getErrorMessage(requestError, "Failed to load medicine details"));
    }
  };

  const validateForm = () => {
    if (!form.farm) {
      return "Please select a farm";
    }

    if (!form.name.trim()) {
      return "Medicine name is required";
    }

    if (!form.type) {
      return "Medicine type is required";
    }

    if (!form.unit) {
      return "Medicine unit is required";
    }

    const quantityReceived = Number(form.quantityReceived);
    const quantityUsed = Number(form.quantityUsed || 0);
    const reorderLevel = Number(form.reorderLevel || 0);
    const unitCost = Number(form.unitCost || 0);

    if (!Number.isFinite(quantityReceived) || quantityReceived <= 0) {
      return "Quantity received must be greater than 0";
    }

    if (!Number.isFinite(quantityUsed) || quantityUsed < 0) {
      return "Quantity used must be a valid number";
    }

    if (quantityUsed > quantityReceived) {
      return "Quantity used cannot exceed quantity received";
    }

    if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
      return "Reorder level cannot be negative";
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      return "Unit cost cannot be negative";
    }

    if (form.purchaseDate && form.expiryDate && new Date(form.expiryDate) < new Date(form.purchaseDate)) {
      return "Expiry date cannot be before purchase date";
    }

    if (form.totalPurchaseCost !== "" && (!Number.isFinite(Number(form.totalPurchaseCost)) || Number(form.totalPurchaseCost) < 0)) {
      return "Total purchase cost must be a valid non-negative number";
    }

    return null;
  };

  const buildPayload = () => {
    const payload = {
      farm: form.farm,
      name: form.name.trim(),
      type: form.type,
      brand: form.brand.trim(),
      composition: form.composition.trim(),
      batchNumber: form.batchNumber.trim(),
      supplier: form.supplier.trim(),
      purchaseDate: form.purchaseDate || null,
      expiryDate: form.expiryDate || null,
      unit: form.unit,
      quantityReceived: Number(form.quantityReceived),
      quantityUsed: Number(form.quantityUsed || 0),
      reorderLevel: Number(form.reorderLevel || 0),
      unitCost: Number(form.unitCost || 0),
      invoiceNumber: form.invoiceNumber.trim(),
      storageLocation: form.storageLocation.trim(),
      storageTemperature: form.storageTemperature.trim(),
      notes: form.notes.trim(),
    };

    if (form.totalPurchaseCost !== "") {
      payload.totalPurchaseCost = Number(form.totalPurchaseCost);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      if (editingId) {
        const response = await apiRequest(`/medicine/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const root = getResponseRoot(response);

        showSuccess(root?.message || "Medicine inventory updated successfully");
      } else {
        const response = await apiRequest("/medicine", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const root = getResponseRoot(response);

        showSuccess(root?.message || "Medicine inventory added successfully");
      }

      setShowFormModal(false);
      resetForm();

      await loadMedicines(page);
    } catch (requestError) {
      showError(getErrorMessage(requestError, "Failed to save medicine inventory"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await showConfirm({
      title: "Delete Medicine Inventory?",
      text: `Delete "${item?.name || "this medicine"}" inventory?\n\nThis cannot be deleted if vaccination, veterinary or used-stock dependencies exist.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(item._id);

      const response = await apiRequest(`/medicine/${item._id}`, {
        method: "DELETE",
      });

      const root = getResponseRoot(response);

      showSuccess(root?.message || "Medicine inventory deleted successfully");

      if (medicines.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadMedicines(page);
      }
    } catch (requestError) {
      showError(getErrorMessage(requestError, "Medicine cannot be deleted because dependent records exist"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setPage(1);

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setPage(1);

    setFilters({
      farm: "",
      type: "",
      status: "",
      expiry: "",
      lowStock: false,
    });

    setSearch("");
  };

  const handleLowStockToggle = () => {
    setPage(1);

    setFilters((previous) => ({
      ...previous,
      lowStock: !previous.lowStock,
    }));
  };

  const goPrevious = () => {
    if (page > 1) {
      setPage((previous) => previous - 1);
    }
  };

  const goNext = () => {
    if (page < Number(pagination.totalPages || 1)) {
      setPage((previous) => previous + 1);
    }
  };

  const farmName = (item) => {
    return item?.farm?.name || item?.farm?.code || "-";
  };

  return (
    <div className="medicine-page">
      <div className="medicine-header">
        <div>
          <div className="medicine-eyebrow">
            <PackageOpen size={16} />
            Farm OS
          </div>

          <h1>Medicine & Vaccine</h1>

          <p>Manage medicine, vaccine and healthcare inventory with stock, expiry and reorder tracking.</p>
        </div>

        <div className="medicine-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || dependencyLoading} title="Refresh">
            <RefreshCw size={17} className={loading || dependencyLoading ? "medicine-header-refresh-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openAddModal}>
            <Plus size={17} />
            Add Medicine
          </button>
        </div>
      </div>

      <div className="medicine-summary-grid">
        <div className="medicine-summary-card">
          <div className="summary-icon summary-blue">
            <PackageOpen size={20} />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{pagination.total || summary.totalRecords}</strong>
          </div>
        </div>

        <div className="medicine-summary-card">
          <div className="summary-icon summary-green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Current Stock</span>
            <strong>{formatNumber(summary.totalStock)}</strong>
          </div>
        </div>

        <div className="medicine-summary-card">
          <div className="summary-icon summary-orange">
            <IndianRupee size={20} />
          </div>

          <div>
            <span>Purchase Value</span>
            <strong>{formatMoney(summary.totalPurchaseValue)}</strong>
          </div>
        </div>

        <div className="medicine-summary-card">
          <div className="summary-icon summary-red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Low / Expired</span>
            <strong>
              {summary.lowStockCount} / {summary.expiredCount}
            </strong>
          </div>
        </div>
      </div>

      <div className="medicine-toolbar">
        <div className="medicine-search">
          <Search size={18} />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicine, brand, batch, supplier..." />

          {search && (
            <button type="button" className="search-clear" onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}
        </div>

        <button type="button" className={`medicine-filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters((previous) => !previous)}>
          <Filter size={17} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="medicine-filter-panel">
          <div className="filter-field">
            <label>Farm</label>

            <select name="farm" value={filters.farm} onChange={handleFilterChange}>
              <option value="">All Farms</option>

              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                  {farm.code ? ` (${farm.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Type</label>

            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>

              {MEDICINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Status</label>

            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Expiry</label>

            <select name="expiry" value={filters.expiry} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="valid">Valid</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button type="button" className={`low-stock-toggle ${filters.lowStock ? "active" : ""}`} onClick={handleLowStockToggle}>
            <AlertTriangle size={16} />
            Low Stock Only
          </button>

          <button type="button" className="clear-filter-btn" onClick={clearFilters}>
            Clear
          </button>
        </div>
      )}

      {error && (
        <div className="medicine-error">
          <AlertTriangle size={18} />
          <span>{error}</span>

          <button type="button" onClick={() => loadMedicines(page)}>
            Retry
          </button>
        </div>
      )}

      <div className="medicine-content-card">
        <div className="medicine-table-head">
          <div>
            <h2>Medicine Inventory</h2>
            <span>
              {filteredMedicines.length} record
              {filteredMedicines.length === 1 ? "" : "s"} on this page
            </span>
          </div>

          {dependencyLoading && <span className="loading-small">Loading farms...</span>}
        </div>

        {loading ? (
          <div className="medicine-loading">
            <RefreshCw size={30} className="spin" />
            <span>Loading medicine inventory...</span>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="medicine-empty">
            <PackageOpen size={42} />
            <h3>No medicine inventory found</h3>
            <p>Add your first medicine or vaccine inventory to start tracking stock.</p>

            <button type="button" className="medicine-btn medicine-btn-primary" onClick={openAddModal}>
              <Plus size={17} />
              Add Medicine
            </button>
          </div>
        ) : (
          <div className="medicine-table-wrap">
            <table className="medicine-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Farm</th>
                  <th>Type</th>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                  <th>Unit Cost</th>
                  <th>Status</th>
                  <th className="action-col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMedicines.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="medicine-name-cell">
                        <div className="medicine-product-icon">
                          <PackageOpen size={18} />
                        </div>

                        <div>
                          <strong>{item.name || "-"}</strong>

                          {item.brand && <small>{item.brand}</small>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="farm-cell">
                        <strong>{farmName(item)}</strong>

                        {item?.farm?.code && item?.farm?.name && <small>{item.farm.code}</small>}
                      </div>
                    </td>

                    <td>
                      <span className={`type-badge ${getTypeClass(item.type)}`}>{item.type || "-"}</span>
                    </td>

                    <td>
                      <span className="muted-text">{item.batchNumber || "-"}</span>
                    </td>

                    <td>
                      <div className="stock-cell">
                        <strong>{formatNumber(item.currentStock)}</strong>

                        <small>{item.unit || ""}</small>
                      </div>
                    </td>

                    <td>
                      <div className="date-cell">
                        <CalendarDays size={15} />
                        {formatDate(item.expiryDate)}
                      </div>
                    </td>

                    <td>
                      <strong>{formatMoney(item.unitCost)}</strong>
                      <small className="cost-unit">/ {item.unit || "unit"}</small>
                    </td>

                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status?.replaceAll("_", " ") || "-"}</span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-btn view" title="View" onClick={() => openViewModal(item)}>
                          <Eye size={16} />
                        </button>

                        <button type="button" className="icon-btn edit" title="Edit" onClick={() => openEditModal(item)}>
                          <Edit3 size={16} />
                        </button>

                        <button type="button" className="icon-btn delete" title="Delete" disabled={deletingId === item._id} onClick={() => handleDelete(item)}>
                          {deletingId === item._id ? <RefreshCw size={16} className="spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="medicine-pagination">
            <span>
              Page <strong>{pagination.page || page}</strong> of <strong>{pagination.totalPages}</strong>
            </span>

            <div className="pagination-buttons">
              <button type="button" onClick={goPrevious} disabled={page <= 1}>
                <ChevronLeft size={17} />
                Previous
              </button>

              <button type="button" onClick={goNext} disabled={page >= Number(pagination.totalPages)}>
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showFormModal && (
        <div
          className="medicine-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (!saving) {
                setShowFormModal(false);
              }
            }
          }}>
          <div className="medicine-modal medicine-form-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">{editingId ? "Update Inventory" : "New Inventory"}</span>

                <h2>{editingId ? "Edit Medicine / Vaccine" : "Add Medicine / Vaccine"}</h2>
              </div>

              <button type="button" className="modal-close" onClick={() => !saving && setShowFormModal(false)} disabled={saving}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="section-title">Basic Information</div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      Farm <span>*</span>
                    </label>

                    <select name="farm" value={form.farm} onChange={handleChange} required>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                          {farm.name}
                          {farm.code ? ` (${farm.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      Medicine Name <span>*</span>
                    </label>

                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Enrofloxacin" required />
                  </div>

                  <div className="form-field">
                    <label>
                      Type <span>*</span>
                    </label>

                    <select name="type" value={form.type} onChange={handleChange} required>
                      {MEDICINE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      Unit <span>*</span>
                    </label>

                    <select name="unit" value={form.unit} onChange={handleChange} required>
                      {MEDICINE_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Brand</label>

                    <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" />
                  </div>

                  <div className="form-field">
                    <label>Composition</label>

                    <input type="text" name="composition" value={form.composition} onChange={handleChange} placeholder="Active composition" />
                  </div>

                  <div className="form-field">
                    <label>Batch Number</label>

                    <input type="text" name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="Medicine batch number" />
                  </div>

                  <div className="form-field">
                    <label>Supplier</label>

                    <input type="text" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Stock & Cost</div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      Quantity Received <span>*</span>
                    </label>

                    <input type="number" name="quantityReceived" value={form.quantityReceived} onChange={handleChange} min="0" step="0.01" placeholder="0" required />
                  </div>

                  <div className="form-field">
                    <label>Quantity Used</label>

                    <input type="number" name="quantityUsed" value={form.quantityUsed} onChange={handleChange} min="0" step="0.01" placeholder="0" />

                    <small className="field-help">For vaccines, completed vaccination usage cannot be reduced.</small>
                  </div>

                  <div className="form-field">
                    <label>Reorder Level</label>

                    <input type="number" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} min="0" step="0.01" placeholder="0" />
                  </div>

                  <div className="form-field">
                    <label>Unit Cost</label>

                    <input type="number" name="unitCost" value={form.unitCost} onChange={handleChange} min="0" step="0.01" placeholder="0" />
                  </div>

                  <div className="form-field">
                    <label>Total Purchase Cost</label>

                    <input type="number" name="totalPurchaseCost" value={form.totalPurchaseCost} onChange={handleChange} min="0" step="0.01" placeholder="Auto calculated if blank" />

                    <small className="field-help">Leave blank to calculate quantity × unit cost.</small>
                  </div>

                  <div className="form-field">
                    <label>Invoice Number</label>

                    <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="Invoice number" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Dates & Storage</div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Purchase Date</label>

                    <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
                  </div>

                  <div className="form-field">
                    <label>Expiry Date</label>

                    <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
                  </div>

                  <div className="form-field">
                    <label>Storage Location</label>

                    <input type="text" name="storageLocation" value={form.storageLocation} onChange={handleChange} placeholder="e.g. Medicine Room A" />
                  </div>

                  <div className="form-field">
                    <label>Storage Temperature</label>

                    <input type="text" name="storageTemperature" value={form.storageTemperature} onChange={handleChange} placeholder="e.g. 2-8°C" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Notes</div>

                <div className="form-field">
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes..." rows="4" />
                </div>
              </div>

              <div className="form-preview">
                <div>
                  <span>Estimated Current Stock</span>
                  <strong>
                    {formatNumber(Number(form.quantityReceived || 0) - Number(form.quantityUsed || 0))} {form.unit || ""}
                  </strong>
                </div>

                <div>
                  <span>Purchase Value</span>
                  <strong>{formatMoney(form.totalPurchaseCost !== "" ? form.totalPurchaseCost : Number(form.quantityReceived || 0) * Number(form.unitCost || 0))}</strong>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="medicine-btn medicine-btn-secondary" onClick={() => setShowFormModal(false)} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="medicine-btn medicine-btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingId ? "Update Inventory" : "Save Inventory"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedMedicine && (
        <div
          className="medicine-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowViewModal(false);
            }
          }}>
          <div className="medicine-modal view-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">Inventory Details</span>

                <h2>{selectedMedicine.name}</h2>
              </div>

              <button type="button" className="modal-close" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="view-status-row">
              <span className={`status-badge ${getStatusClass(selectedMedicine.status)}`}>{selectedMedicine.status?.replaceAll("_", " ")}</span>

              <span className={`type-badge ${getTypeClass(selectedMedicine.type)}`}>{selectedMedicine.type}</span>
            </div>

            <div className="view-grid">
              <div className="view-item">
                <span>Farm</span>
                <strong>{farmName(selectedMedicine)}</strong>
              </div>

              <div className="view-item">
                <span>Unit</span>
                <strong>{selectedMedicine.unit || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Brand</span>
                <strong>{selectedMedicine.brand || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Composition</span>
                <strong>{selectedMedicine.composition || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Batch Number</span>
                <strong>{selectedMedicine.batchNumber || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Supplier</span>
                <strong>{selectedMedicine.supplier || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Quantity Received</span>
                <strong>
                  {formatNumber(selectedMedicine.quantityReceived)} {selectedMedicine.unit || ""}
                </strong>
              </div>

              <div className="view-item">
                <span>Quantity Used</span>
                <strong>
                  {formatNumber(selectedMedicine.quantityUsed)} {selectedMedicine.unit || ""}
                </strong>
              </div>

              <div className="view-item highlight">
                <span>Current Stock</span>
                <strong>
                  {formatNumber(selectedMedicine.currentStock)} {selectedMedicine.unit || ""}
                </strong>
              </div>

              <div className="view-item">
                <span>Reorder Level</span>
                <strong>
                  {formatNumber(selectedMedicine.reorderLevel)} {selectedMedicine.unit || ""}
                </strong>
              </div>

              <div className="view-item">
                <span>Unit Cost</span>
                <strong>{formatMoney(selectedMedicine.unitCost)}</strong>
              </div>

              <div className="view-item">
                <span>Total Purchase Cost</span>
                <strong>{formatMoney(selectedMedicine.totalPurchaseCost)}</strong>
              </div>

              <div className="view-item">
                <span>Purchase Date</span>
                <strong>{formatDate(selectedMedicine.purchaseDate)}</strong>
              </div>

              <div className="view-item">
                <span>Expiry Date</span>
                <strong>{formatDate(selectedMedicine.expiryDate)}</strong>
              </div>

              <div className="view-item">
                <span>Invoice Number</span>
                <strong>{selectedMedicine.invoiceNumber || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Storage Location</span>
                <strong>{selectedMedicine.storageLocation || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Storage Temperature</span>
                <strong>{selectedMedicine.storageTemperature || "-"}</strong>
              </div>

              <div className="view-item">
                <span>Added By</span>
                <strong>{selectedMedicine?.addedBy?.name || selectedMedicine?.addedBy?.email || "-"}</strong>
              </div>
            </div>

            {selectedMedicine.notes && (
              <div className="view-notes">
                <span>Notes</span>
                <p>{selectedMedicine.notes}</p>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="medicine-btn medicine-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>

              <button
                type="button"
                className="medicine-btn medicine-btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedMedicine);
                }}>
                <Edit3 size={17} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.medicine-header-refresh-spin{animation:medicine-header-refresh 1s linear infinite}@keyframes medicine-header-refresh{to{transform:rotate(360deg)}}.form-field input[type="date"]{color-scheme:light dark}.form-field input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .form-field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.medicine-page{padding:24px;color:var(--admin-text,#e5e7eb);background:var(--admin-bg,#0b1120);min-height:100%}.medicine-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.medicine-eyebrow{display:flex;align-items:center;gap:7px;color:var(--admin-primary,#60a5fa);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.medicine-header h1{margin:0;font-size:28px;line-height:1.2}.medicine-header p{margin:7px 0 0;color:var(--admin-muted,#94a3b8);font-size:14px}.medicine-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap}.medicine-btn{border:1px solid transparent;border-radius:10px;padding:10px 15px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.medicine-btn:disabled{opacity:.55;cursor:not-allowed}.medicine-btn-primary{background:var(--admin-primary,#2563eb);color:#fff}.medicine-btn-primary:hover:not(:disabled){filter:brightness(1.08)}.medicine-btn-secondary{background:var(--admin-surface,#111827);color:var(--admin-text,#e5e7eb);border-color:var(--admin-border,#243244)}.medicine-btn-secondary:hover:not(:disabled){background:var(--admin-surface-2,#172033)}.medicine-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.medicine-summary-card{background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#243244);border-radius:14px;padding:17px;display:flex;align-items:center;gap:13px}.summary-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center}.summary-blue{background:rgba(37,99,235,.14);color:#60a5fa}.summary-green{background:rgba(16,185,129,.14);color:#34d399}.summary-orange{background:rgba(245,158,11,.14);color:#fbbf24}.summary-red{background:rgba(239,68,68,.14);color:#f87171}.medicine-summary-card span{display:block;color:var(--admin-muted,#94a3b8);font-size:12px;margin-bottom:4px}.medicine-summary-card strong{font-size:20px}.medicine-toolbar{display:flex;gap:10px;align-items:center;margin-bottom:14px}.medicine-search{position:relative;flex:1;display:flex;align-items:center;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#243244);border-radius:11px;color:var(--admin-muted,#94a3b8);padding:0 13px}.medicine-search input{width:100%;border:0;outline:0;background:transparent;color:var(--admin-text,#e5e7eb);padding:12px 34px 12px 9px;font-size:13px}.medicine-search input::placeholder{color:#64748b}.search-clear{position:absolute;right:8px;border:0;background:transparent;color:#64748b;cursor:pointer}.medicine-filter-btn{border:1px solid var(--admin-border,#243244);background:var(--admin-surface,#111827);color:var(--admin-text,#e5e7eb);border-radius:11px;padding:11px 15px;display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer}.medicine-filter-btn.active{border-color:var(--admin-primary,#2563eb);color:#60a5fa}.medicine-filter-panel{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#243244);border-radius:14px;padding:14px;margin-bottom:15px}.filter-field label,.form-field label{display:block;font-size:12px;font-weight:700;color:var(--admin-muted,#94a3b8);margin-bottom:7px}.filter-field select,.form-field input,.form-field select,.form-field textarea{width:100%;box-sizing:border-box;background:var(--admin-surface-2,#172033);border:1px solid var(--admin-border,#243244);border-radius:9px;color:var(--admin-text,#e5e7eb);outline:none;padding:10px 11px;font-size:13px}.filter-field select:focus,.form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--admin-primary,#2563eb)}.low-stock-toggle,.clear-filter-btn{align-self:end;min-height:39px;border:1px solid var(--admin-border,#243244);border-radius:9px;background:var(--admin-surface-2,#172033);color:var(--admin-text,#e5e7eb);font-weight:700;cursor:pointer;padding:0 12px;display:flex;align-items:center;justify-content:center;gap:7px}.low-stock-toggle.active{border-color:#f59e0b;color:#fbbf24;background:rgba(245,158,11,.08)}.clear-filter-btn:hover{border-color:var(--admin-primary,#2563eb);color:#60a5fa}.medicine-error{display:flex;align-items:center;gap:10px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.3);color:#fca5a5;border-radius:11px;padding:12px 14px;margin-bottom:15px;font-size:13px}.medicine-error span{flex:1}.medicine-error button{border:0;background:transparent;color:#fca5a5;text-decoration:underline;font-weight:700;cursor:pointer}.medicine-content-card{background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#243244);border-radius:15px;overflow:hidden}.medicine-table-head{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 18px;border-bottom:1px solid var(--admin-border,#243244)}.medicine-table-head h2{margin:0;font-size:16px}.medicine-table-head span{display:block;color:var(--admin-muted,#94a3b8);font-size:12px;margin-top:4px}.loading-small{margin:0!important}.medicine-table-wrap{overflow-x:auto}.medicine-table{width:100%;border-collapse:collapse;min-width:1120px}.medicine-table th{padding:12px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--admin-muted,#94a3b8);background:var(--admin-surface-2,#172033);white-space:nowrap}.medicine-table td{padding:13px 14px;border-top:1px solid var(--admin-border,#243244);font-size:13px;vertical-align:middle}.medicine-table tbody tr:hover{background:rgba(255,255,255,.018)}.medicine-name-cell{display:flex;align-items:center;gap:10px;min-width:190px}.medicine-product-icon{width:36px;height:36px;border-radius:9px;background:rgba(37,99,235,.12);color:#60a5fa;display:flex;align-items:center;justify-content:center;flex:none}.medicine-name-cell strong{display:block;font-size:13px}.medicine-name-cell small,.farm-cell small{display:block;color:var(--admin-muted,#94a3b8);font-size:11px;margin-top:3px}.farm-cell strong{font-size:12px}.type-badge,.status-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.02em;white-space:nowrap}.type-default{background:rgba(148,163,184,.12);color:#cbd5e1}.type-vaccine{background:rgba(139,92,246,.13);color:#c4b5fd}.type-antibiotic{background:rgba(239,68,68,.12);color:#fca5a5}.type-vitamin{background:rgba(16,185,129,.12);color:#6ee7b7}.type-supplement{background:rgba(245,158,11,.12);color:#fcd34d}.type-disinfectant{background:rgba(6,182,212,.12);color:#67e8f9}.status-available{background:rgba(16,185,129,.12);color:#6ee7b7}.status-low{background:rgba(245,158,11,.13);color:#fcd34d}.status-out{background:rgba(239,68,68,.13);color:#fca5a5}.status-expired{background:rgba(168,85,247,.13);color:#d8b4fe}.status-default{background:rgba(148,163,184,.12);color:#cbd5e1}.stock-cell strong{font-size:13px}.stock-cell small,.cost-unit{color:var(--admin-muted,#94a3b8);font-size:10px;margin-left:3px}.date-cell{display:flex;align-items:center;gap:5px;color:var(--admin-muted,#94a3b8);white-space:nowrap}.muted-text{color:var(--admin-muted,#94a3b8)}.action-col{text-align:right}.row-actions{display:flex;justify-content:flex-end;gap:6px}.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--admin-border,#243244);background:var(--admin-surface-2,#172033);display:flex;align-items:center;justify-content:center;cursor:pointer}.icon-btn.view{color:#60a5fa}.icon-btn.edit{color:#fbbf24}.icon-btn.delete{color:#f87171}.icon-btn:hover{filter:brightness(1.15)}.icon-btn:disabled{opacity:.5;cursor:not-allowed}.medicine-loading{min-height:330px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--admin-muted,#94a3b8);font-size:13px}.medicine-empty{min-height:330px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;color:var(--admin-muted,#94a3b8);padding:30px}.medicine-empty svg{color:#475569;margin-bottom:8px}.medicine-empty h3{margin:4px 0;color:var(--admin-text,#e5e7eb);font-size:16px}.medicine-empty p{margin:0 0 16px;font-size:13px}.medicine-pagination{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;border-top:1px solid var(--admin-border,#243244);font-size:12px;color:var(--admin-muted,#94a3b8)}.pagination-buttons{display:flex;gap:7px}.pagination-buttons button{display:flex;align-items:center;gap:5px;border:1px solid var(--admin-border,#243244);background:var(--admin-surface-2,#172033);color:var(--admin-text,#e5e7eb);border-radius:8px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer}.pagination-buttons button:disabled{opacity:.4;cursor:not-allowed}.medicine-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(5px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.medicine-modal{width:min(900px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#243244);border-radius:17px;box-shadow:0 25px 80px rgba(0,0,0,.45)}.view-modal{width:min(780px,100%)}.modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:19px 20px;border-bottom:1px solid var(--admin-border,#243244);position:sticky;top:0;background:var(--admin-surface,#111827);z-index:2}.modal-eyebrow{display:block;text-transform:uppercase;letter-spacing:.07em;color:#60a5fa;font-size:10px;font-weight:800;margin-bottom:5px}.modal-header h2{margin:0;font-size:20px}.modal-close{width:34px;height:34px;border:1px solid var(--admin-border,#243244);background:var(--admin-surface-2,#172033);color:var(--admin-muted,#94a3b8);border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer}.form-section{padding:18px 20px;border-bottom:1px solid var(--admin-border,#243244)}.section-title{font-size:13px;font-weight:800;margin-bottom:14px;color:var(--admin-text,#e5e7eb)}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.form-field label span{color:#f87171}.field-help{display:block;margin-top:5px;color:#64748b;font-size:10px;line-height:1.4}.form-field textarea{resize:vertical;min-height:90px}.form-preview{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px 20px;background:var(--admin-surface-2,#172033)}.form-preview div{border:1px solid var(--admin-border,#243244);border-radius:10px;padding:11px 13px}.form-preview span{display:block;color:var(--admin-muted,#94a3b8);font-size:11px;margin-bottom:4px}.form-preview strong{font-size:15px}.modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:9px;padding:15px 20px}.view-status-row{display:flex;gap:8px;padding:16px 20px 0}.view-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:16px 20px}.view-item{border:1px solid var(--admin-border,#243244);background:var(--admin-surface-2,#172033);border-radius:10px;padding:11px 12px}.view-item span{display:block;color:var(--admin-muted,#94a3b8);font-size:10px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}.view-item strong{font-size:13px;word-break:break-word}.view-item.highlight{border-color:rgba(37,99,235,.4);background:rgba(37,99,235,.07)}.view-notes{margin:0 20px 5px;border:1px solid var(--admin-border,#243244);background:var(--admin-surface-2,#172033);border-radius:10px;padding:12px}.view-notes span{display:block;color:var(--admin-muted,#94a3b8);font-size:10px;text-transform:uppercase;margin-bottom:5px}.view-notes p{margin:0;font-size:13px;line-height:1.55;white-space:pre-wrap}.spin{animation:medicine-spin .8s linear infinite}@keyframes medicine-spin{to{transform:rotate(360deg)}}@media(max-width:1000px){.medicine-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.medicine-filter-panel{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.medicine-page{padding:15px}.medicine-header{flex-direction:column}.medicine-header-actions{width:100%;display:flex;flex-wrap:nowrap;gap:8px}.medicine-header-actions .top-action-btn{flex:0 0 auto}.medicine-header-actions .add-action-btn{flex:0 0 auto}.medicine-header h1{font-size:23px}.medicine-summary-grid{grid-template-columns:1fr 1fr}.medicine-toolbar{flex-direction:column;align-items:stretch}.medicine-filter-panel{grid-template-columns:1fr}.form-grid,.view-grid,.form-preview{grid-template-columns:1fr}.medicine-pagination{flex-direction:column;align-items:stretch;gap:10px}.pagination-buttons button{flex:1;justify-content:center}.medicine-modal-overlay{padding:8px}.medicine-modal{max-height:96vh;border-radius:13px}.modal-header,.form-section,.modal-footer{padding-left:14px;padding-right:14px}.view-grid{padding-left:14px;padding-right:14px}.view-status-row{padding-left:14px;padding-right:14px}.view-notes{margin-left:14px;margin-right:14px}.medicine-summary-card{padding:13px}.medicine-summary-card strong{font-size:17px}.summary-icon{width:35px;height:35px;min-width:35px}.medicine-summary-card span{font-size:10px}}@media(max-width:560px){.medicine-page{padding:12px}.medicine-header h1{font-size:22px}.medicine-header-actions{gap:6px}.medicine-header-actions .top-action-btn{padding:0 9px}.medicine-header-actions .refresh-action-btn{width:38px;padding:0}.medicine-header-actions .top-action-btn svg{width:16px;height:16px}.medicine-header-actions .add-action-btn{padding:0 10px}.medicine-summary-grid{grid-template-columns:1fr}.medicine-header-actions .top-action-btn{flex:0 0 auto}.medicine-filter-panel{grid-template-columns:1fr}.form-grid,.view-grid,.form-preview{grid-template-columns:1fr}.medicine-toolbar{gap:8px}.medicine-pagination{padding:11px 12px}.medicine-modal-overlay{padding:6px}.medicine-modal{max-height:calc(100vh - 12px)}}@media(max-width:430px){.medicine-header-actions{flex-direction:row;flex-wrap:nowrap;width:100%}.medicine-header-actions .top-action-btn{flex:0 0 auto}.medicine-header-actions .add-action-btn{flex:0 0 auto;padding:0 9px}.medicine-header-actions .top-action-btn{font-size:11px}.medicine-header-actions .top-action-btn svg{width:15px;height:15px}.medicine-header-actions .refresh-action-btn{width:38px}.medicine-header-actions{gap:5px}}`}</style>
    </div>
  );
};

export default MedicineVaccine;
