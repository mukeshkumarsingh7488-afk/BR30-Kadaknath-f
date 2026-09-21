import { useEffect, useMemo, useState } from "react";
import { Plus, Search, RefreshCw, Pencil, Trash2, X, Eye, Baby, Building2, Truck, CalendarDays, IndianRupee, PackageCheck, FileText, AlertTriangle, FileSpreadsheet } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const emptyForm = {
  farm: "",
  shed: "",
  batch: "",
  inwardNumber: "",
  inwardDate: new Date().toISOString().split("T")[0],
  birdType: "CHICKS",
  breed: "Kadaknath",
  supplierName: "",
  supplierPhone: "",
  supplierAddress: "",
  quantityReceived: "",
  transportMortalityQuantity: "0",
  transportMortalityReason: "",
  acceptedQuantity: "",
  maleCount: "0",
  femaleCount: "0",
  unitCost: "0",
  invoiceNumber: "",
  invoiceImage: "",
  vehicleNumber: "",
  notes: "",
};

const getArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN").format(number);
};

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number)}`;
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

const getFarmName = (item) => {
  if (!item?.farm) return "-";

  return item.farm.name || item.farm.code || "-";
};

const getShedName = (item) => {
  if (!item?.shed) return "-";

  return item.shed.name || item.shed.code || "-";
};

const getBatchName = (item) => {
  if (!item?.batch) return "-";

  return item.batch.batchNumber || item.batch.batchName || "-";
};

const getApiErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
};

const escapeCsv = (value) => {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function ChicksInward() {
  const [inwards, setInwards] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [shedFilter, setShedFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [invoicePreview, setInvoicePreview] = useState("");

  const loadInwards = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (farmFilter) query.set("farm", farmFilter);
      if (shedFilter) query.set("shed", shedFilter);
      if (batchFilter) query.set("batch", batchFilter);

      const url = query.toString() ? `/chicks-inward?${query.toString()}` : "/chicks-inward";

      const response = await apiRequest(url);

      const list = getArray(response, ["inwards"]);

      setInwards(list);
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to load chicks inward records"));
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      setLoadingDependencies(true);

      const [farmsResponse, shedsResponse, batchesResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds"), apiRequest("/batches")]);

      setFarms(getArray(farmsResponse, ["farms", "items"]));
      setSheds(getArray(shedsResponse, ["sheds", "items"]));
      setBatches(getArray(batchesResponse, ["batches", "items"]));
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to load farm, shed and batch data"));
    } finally {
      setLoadingDependencies(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    loadInwards();
  }, [farmFilter, shedFilter, batchFilter]);

  useEffect(() => {
    return () => {
      if (invoicePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(invoicePreview);
      }
    };
  }, [invoicePreview]);

  const filteredSheds = useMemo(() => {
    if (!form.farm) return sheds;

    return sheds.filter((item) => getId(item.farm) === form.farm);
  }, [sheds, form.farm]);

  const filteredBatches = useMemo(() => {
    let result = batches;

    if (form.farm) {
      result = result.filter((item) => getId(item.farm) === form.farm);
    }

    if (form.shed) {
      result = result.filter((item) => getId(item.shed) === form.shed);
    }

    return result;
  }, [batches, form.farm, form.shed]);

  const stats = useMemo(() => {
    const totalRecords = inwards.length;

    const totalReceived = inwards.reduce((sum, item) => sum + Number(item.quantityReceived || 0), 0);

    const totalAccepted = inwards.reduce((sum, item) => sum + Number(item.acceptedQuantity || 0), 0);

    const totalMortality = inwards.reduce((sum, item) => sum + Number(item.transportMortality?.quantity || 0), 0);

    const totalCost = inwards.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);

    return {
      totalRecords,
      totalReceived,
      totalAccepted,
      totalMortality,
      totalCost,
    };
  }, [inwards]);

  const visibleInwards = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return inwards;

    return inwards.filter((item) => {
      const values = [item.inwardNumber, item.supplier?.name, item.supplier?.phone, item.invoiceNumber, item.vehicleNumber, item.batch?.batchNumber, item.batch?.batchName, item.shed?.name, item.shed?.code, item.farm?.name, item.farm?.code];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [inwards, search]);

  const resetInvoicePreview = () => {
    setInvoicePreview((previous) => {
      if (previous?.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return "";
    });
  };

  const openCreateModal = () => {
    resetInvoicePreview();

    setEditingItem(null);

    setForm({
      ...emptyForm,
      inwardDate: new Date().toISOString().split("T")[0],
    });

    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    resetInvoicePreview();

    setEditingItem(item);

    const farmId = getId(item.farm);
    const shedId = getId(item.shed);
    const batchId = getId(item.batch);

    setForm({
      farm: farmId,
      shed: shedId,
      batch: batchId,
      inwardNumber: item.inwardNumber || "",
      inwardDate: item.inwardDate ? new Date(item.inwardDate).toISOString().split("T")[0] : "",
      birdType: item.birdType || "CHICKS",
      breed: item.breed || "Kadaknath",
      supplierName: item.supplier?.name || "",
      supplierPhone: item.supplier?.phone || "",
      supplierAddress: item.supplier?.address || "",
      quantityReceived: String(item.quantityReceived ?? ""),
      transportMortalityQuantity: String(item.transportMortality?.quantity ?? 0),
      transportMortalityReason: item.transportMortality?.reason || "",
      acceptedQuantity: String(item.acceptedQuantity ?? ""),
      maleCount: String(item.maleCount ?? 0),
      femaleCount: String(item.femaleCount ?? 0),
      unitCost: String(item.unitCost ?? 0),
      invoiceNumber: item.invoiceNumber || "",
      invoiceImage: "",
      vehicleNumber: item.vehicleNumber || "",
      notes: item.notes || "",
    });

    setIsModalOpen(true);
  };

  const openDetailsModal = (item) => {
    setViewingItem(item);
    setIsDetailsOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    resetInvoicePreview();

    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleInvoiceImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      resetInvoicePreview();

      setForm((previous) => ({
        ...previous,
        invoiceImage: "",
      }));

      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      showError("Only JPG, PNG and WebP invoice images are allowed.");
      return;
    }

    if (file.size > maxSize) {
      event.target.value = "";
      showError("Invoice image must be 5 MB or smaller.");
      return;
    }

    resetInvoicePreview();

    const previewUrl = URL.createObjectURL(file);

    setInvoicePreview(previewUrl);

    setForm((previous) => ({
      ...previous,
      invoiceImage: file,
    }));
  };

  const handleFarmChange = (event) => {
    const farm = event.target.value;

    setForm((previous) => ({
      ...previous,
      farm,
      shed: "",
      batch: "",
    }));
  };

  const handleShedChange = (event) => {
    const shed = event.target.value;

    setForm((previous) => ({
      ...previous,
      shed,
      batch: "",
    }));
  };

  const calculateAccepted = () => {
    const received = Number(form.quantityReceived || 0);
    const mortality = Number(form.transportMortalityQuantity || 0);

    if (!Number.isFinite(received) || !Number.isFinite(mortality)) {
      return "";
    }

    return Math.max(0, received - mortality);
  };

  useEffect(() => {
    if (!editingItem) {
      const accepted = calculateAccepted();

      setForm((previous) => ({
        ...previous,
        acceptedQuantity: accepted === "" ? "" : String(accepted),
      }));
    }
  }, [form.quantityReceived, form.transportMortalityQuantity, editingItem]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.farm) {
      showError("Please select a farm");
      return;
    }

    if (!form.shed) {
      showError("Please select a shed");
      return;
    }

    if (!form.batch) {
      showError("Please select a batch");
      return;
    }

    if (!form.inwardNumber.trim()) {
      showError("Inward number is required");
      return;
    }

    if (!form.inwardDate) {
      showError("Inward date is required");
      return;
    }

    if (!form.supplierName.trim()) {
      showError("Supplier name is required");
      return;
    }

    const quantityReceived = Number(form.quantityReceived || 0);

    const transportMortalityQuantity = Number(form.transportMortalityQuantity || 0);

    const acceptedQuantity = Number(form.acceptedQuantity || 0);

    const maleCount = Number(form.maleCount || 0);
    const femaleCount = Number(form.femaleCount || 0);
    const unitCost = Number(form.unitCost || 0);

    if (!Number.isFinite(quantityReceived) || quantityReceived < 1) {
      showError("Quantity received must be at least 1");
      return;
    }

    if (!Number.isFinite(transportMortalityQuantity) || transportMortalityQuantity < 0) {
      showError("Transport mortality cannot be negative");
      return;
    }

    if (transportMortalityQuantity > quantityReceived) {
      showError("Transport mortality cannot exceed quantity received");
      return;
    }

    const calculatedAccepted = quantityReceived - transportMortalityQuantity;

    if (acceptedQuantity !== calculatedAccepted) {
      showError("Accepted quantity must equal received quantity minus transport mortality");
      return;
    }

    if (maleCount < 0 || femaleCount < 0 || maleCount + femaleCount > acceptedQuantity) {
      showError("Male and female count cannot exceed accepted quantity");
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      showError("Unit cost cannot be negative");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        const formData = new FormData();

        formData.append("inwardDate", form.inwardDate);

        formData.append(
          "supplier",
          JSON.stringify({
            name: form.supplierName.trim(),
            phone: form.supplierPhone.trim(),
            address: form.supplierAddress.trim(),
          })
        );

        formData.append("quantityReceived", String(quantityReceived));

        formData.append(
          "transportMortality",
          JSON.stringify({
            quantity: transportMortalityQuantity,
            reason: form.transportMortalityReason.trim(),
          })
        );

        formData.append("acceptedQuantity", String(acceptedQuantity));

        formData.append("maleCount", String(maleCount));
        formData.append("femaleCount", String(femaleCount));
        formData.append("unitCost", String(unitCost));
        formData.append("invoiceNumber", form.invoiceNumber.trim());
        formData.append("vehicleNumber", form.vehicleNumber.trim());
        formData.append("notes", form.notes.trim());

        if (form.invoiceImage instanceof File) {
          formData.append("invoiceImage", form.invoiceImage);
        }

        const response = await apiRequest(`/chicks-inward/${editingItem._id || editingItem.id}`, {
          method: "PUT",
          body: formData,
        });

        showSuccess(response?.message || response?.data?.message || "Chicks inward updated successfully");
      } else {
        const formData = new FormData();

        formData.append("farm", form.farm);
        formData.append("shed", form.shed);
        formData.append("batch", form.batch);
        formData.append("inwardNumber", form.inwardNumber.trim());
        formData.append("inwardDate", form.inwardDate);
        formData.append("birdType", form.birdType);
        formData.append("breed", form.breed.trim() || "Kadaknath");

        formData.append(
          "supplier",
          JSON.stringify({
            name: form.supplierName.trim(),
            phone: form.supplierPhone.trim(),
            address: form.supplierAddress.trim(),
          })
        );

        formData.append("quantityReceived", String(quantityReceived));

        formData.append(
          "transportMortality",
          JSON.stringify({
            quantity: transportMortalityQuantity,
            reason: form.transportMortalityReason.trim(),
          })
        );

        formData.append("acceptedQuantity", String(acceptedQuantity));

        formData.append("maleCount", String(maleCount));
        formData.append("femaleCount", String(femaleCount));
        formData.append("unitCost", String(unitCost));
        formData.append("invoiceNumber", form.invoiceNumber.trim());
        formData.append("vehicleNumber", form.vehicleNumber.trim());
        formData.append("notes", form.notes.trim());

        if (form.invoiceImage instanceof File) {
          formData.append("invoiceImage", form.invoiceImage);
        }

        const response = await apiRequest("/chicks-inward", {
          method: "POST",
          body: formData,
        });

        showSuccess(response?.message || response?.data?.message || "Chicks inward recorded successfully");
      }

      closeModal();

      await loadInwards();
    } catch (error) {
      showError(getApiErrorMessage(error, editingItem ? "Failed to update chicks inward" : "Failed to create chicks inward"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const id = item?._id || item?.id;

    if (!id) return;

    const result = await showConfirm({
      title: "Delete Inward Record?",
      text: `Delete inward record "${item.inwardNumber}"?\n\nThis action will also reverse the accepted stock from the batch and shed if backend safety checks allow it.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/chicks-inward/${id}`, {
        method: "DELETE",
      });

      showSuccess(response?.message || response?.data?.message || "Chicks inward deleted successfully");

      await loadInwards();
    } catch (error) {
      const message = error?.response?.data?.message || error?.data?.message || error?.message || "Failed to delete chicks inward";

      const dependentRecords = error?.response?.data?.dependentRecords || error?.data?.dependentRecords;

      if (Array.isArray(dependentRecords) && dependentRecords.length > 0) {
        const summary = dependentRecords.map((item) => `${item.module || item.name}: ${item.count}`).join("\n");

        showError(`${message}\n\n${summary}`);
      } else {
        showError(message);
      }
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadInwards(), loadDependencies()]);
  };

  const exportExcel = () => {
    if (visibleInwards.length === 0) {
      showError("No chicks inward data available to export.");
      return;
    }

    const headers = [
      "Inward Number",
      "Inward Date",
      "Farm",
      "Shed",
      "Batch",
      "Bird Type",
      "Breed",
      "Supplier",
      "Supplier Phone",
      "Quantity Received",
      "Transport Mortality",
      "Accepted Quantity",
      "Male Count",
      "Female Count",
      "Unit Cost",
      "Total Cost",
      "Invoice Number",
      "Vehicle Number",
      "Mortality Reason",
      "Notes",
    ];

    const rows = visibleInwards.map((item) => [
      item.inwardNumber || "",
      formatDate(item.inwardDate),
      getFarmName(item),
      getShedName(item),
      getBatchName(item),
      item.birdType || "",
      item.breed || "",
      item.supplier?.name || "",
      item.supplier?.phone || "",
      Number(item.quantityReceived || 0),
      Number(item.transportMortality?.quantity || 0),
      Number(item.acceptedQuantity || 0),
      Number(item.maleCount || 0),
      Number(item.femaleCount || 0),
      Number(item.unitCost || 0),
      Number(item.totalCost || 0),
      item.invoiceNumber || "",
      item.vehicleNumber || "",
      item.transportMortality?.reason || "",
      item.notes || "",
    ]);

    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `chicks-inward-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (visibleInwards.length === 0) {
      showError("No chicks inward data available to export.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      showError("Please allow pop-ups in your browser to export PDF.");
      return;
    }

    const rows = visibleInwards
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.inwardNumber || "-")}</td>
            <td>${escapeHtml(formatDate(item.inwardDate))}</td>
            <td>${escapeHtml(getFarmName(item))}</td>
            <td>${escapeHtml(getShedName(item))}</td>
            <td>${escapeHtml(getBatchName(item))}</td>
            <td>${escapeHtml(item.birdType || "-")}</td>
            <td>${escapeHtml(item.supplier?.name || "-")}</td>
            <td>${escapeHtml(formatNumber(item.quantityReceived))}</td>
            <td>${escapeHtml(formatNumber(item.transportMortality?.quantity))}</td>
            <td>${escapeHtml(formatNumber(item.acceptedQuantity))}</td>
            <td>${escapeHtml(formatNumber(item.maleCount))}</td>
            <td>${escapeHtml(formatNumber(item.femaleCount))}</td>
            <td>${escapeHtml(formatCurrency(item.totalCost))}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chicks Inward Report</title>
          <meta charset="UTF-8" />

          <style>
            *{box-sizing:border-box}
            body{margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;background:#fff}
            h1{margin:0 0 5px;font-size:22px}
            .subtitle{margin:0 0 18px;color:#6b7280;font-size:12px}
            .meta{display:flex;justify-content:space-between;gap:20px;margin-bottom:15px;font-size:11px;color:#4b5563}
            table{width:100%;border-collapse:collapse;font-size:9px}
            th{background:#f3f4f6;font-weight:700;text-transform:uppercase}
            th,td{border:1px solid #d1d5db;padding:7px 6px;text-align:left;vertical-align:top}
            tbody tr:nth-child(even){background:#fafafa}
            .footer{margin-top:14px;font-size:10px;color:#6b7280}
            @page{size:landscape;margin:12mm}
            @media print{body{padding:0}}
          </style>
        </head>

        <body>
          <h1>Chicks Inward Report</h1>

          <p class="subtitle">
            BR30 Kadaknath Farms — Farm OS
          </p>

          <div class="meta">
            <span>
              Total Records: ${visibleInwards.length}
            </span>

            <span>
              Generated: ${escapeHtml(new Date().toLocaleString("en-IN"))}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Inward</th>
                <th>Date</th>
                <th>Farm</th>
                <th>Shed</th>
                <th>Batch</th>
                <th>Bird Type</th>
                <th>Supplier</th>
                <th>Received</th>
                <th>Mortality</th>
                <th>Accepted</th>
                <th>Male</th>
                <th>Female</th>
                <th>Total Cost</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            This report contains the currently loaded and filtered chicks inward records.
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const renderLoading = () => (
    <div className="farm-inward-loading">
      <RefreshCw className="spin-icon" size={28} />

      <span>Loading chicks inward records...</span>
    </div>
  );

  return (
    <div className="farm-chicks-inward">
      <style>{`.farm-form-control[type="date"]{color-scheme:light dark}.farm-form-control[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .farm-form-control[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.farm-chicks-inward{width:100%;min-height:calc(100vh - 132px);color:var(--admin-text,#172033)}.farm-inward-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px;padding:0;background:transparent;color:var(--admin-text,#172033);position:relative;overflow:visible;box-shadow:none}.farm-inward-header-content{min-width:0}.farm-inward-eyebrow{display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--admin-primary,#4f46e5)}.farm-inward-header h1{margin:0;font-size:28px;line-height:1.15;font-weight:800;color:var(--admin-text,#172033)}.farm-inward-header p{margin:7px 0 0;max-width:680px;font-size:14px;line-height:1.55;color:var(--admin-muted,#697386)}.farm-inward-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#991b1b;color:#991b1b}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.spin-icon{animation:farm-inward-spin 1s linear infinite}@keyframes farm-inward-spin{to{transform:rotate(360deg)}}.farm-inward-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:18px}.farm-inward-stat{padding:17px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface);box-shadow:0 6px 20px rgba(0,0,0,.04);display:flex;align-items:center;gap:13px;min-width:0}.farm-inward-stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex:none}.farm-inward-stat-icon.green{background:rgba(34,197,94,.12);color:#16a34a}.farm-inward-stat-icon.blue{background:rgba(59,130,246,.12);color:#2563eb}.farm-inward-stat-icon.yellow{background:rgba(234,179,8,.13);color:#ca8a04}.farm-inward-stat-icon.red{background:rgba(239,68,68,.12);color:#dc2626}.farm-inward-stat-icon.orange{background:rgba(249,115,22,.12);color:#ea580c}.farm-inward-stat-content{min-width:0}.farm-inward-stat-title{font-size:11px;color:var(--admin-muted);font-weight:600;margin-bottom:4px}.farm-inward-stat-value{font-size:21px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.farm-inward-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px;margin-bottom:18px;border:1px solid var(--admin-border);background:var(--admin-surface);border-radius:14px}.farm-search{position:relative;flex:1 1 250px;min-width:210px}.farm-search>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--admin-muted);pointer-events:none}.farm-search input,.farm-filter,.farm-form-control{width:100%;height:42px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2);color:var(--admin-text);outline:none;padding:0 12px;font:inherit;font-size:13px}.farm-search input{padding-left:39px;padding-right:38px}.farm-search input:focus,.farm-filter:focus,.farm-form-control:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px var(--admin-primary-soft)}.farm-search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:25px;height:25px;border:0;border-radius:6px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.farm-search-clear:hover{background:var(--admin-surface-2);color:var(--admin-text)}.farm-filter{width:auto;min-width:145px}.farm-inward-table-card{border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface);overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.04)}.farm-table-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 18px;border-bottom:1px solid var(--admin-border)}.farm-table-header h2{margin:0;font-size:16px}.farm-table-header span{font-size:12px;color:var(--admin-muted)}.farm-table-wrap{width:100%;overflow-x:auto}.farm-inward-table{width:100%;border-collapse:collapse;min-width:1050px}.farm-inward-table th{padding:12px 15px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--admin-muted);background:var(--admin-surface-2);border-bottom:1px solid var(--admin-border);white-space:nowrap}.farm-inward-table td{padding:14px 15px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.farm-inward-table tbody tr:last-child td{border-bottom:0}.farm-inward-table tbody tr:hover{background:var(--admin-surface-2)}.farm-inward-number{font-weight:800;color:var(--admin-text)}.farm-inward-subtext{font-size:11px;color:var(--admin-muted);margin-top:3px}.farm-location-cell{display:flex;flex-direction:column;gap:2px}.farm-location-main{font-weight:700}.farm-location-sub{font-size:11px;color:var(--admin-muted)}.farm-qty-main{font-weight:800}.farm-qty-sub{font-size:11px;color:var(--admin-muted);margin-top:3px}.farm-cost{font-weight:800}.farm-status-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(34,197,94,.11);color:#16a34a}.farm-action-buttons{display:flex;align-items:center;gap:6px}.farm-icon-btn{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}.farm-icon-btn:hover{color:var(--admin-primary);border-color:var(--admin-primary);background:var(--admin-primary-soft)}.farm-icon-btn.danger:hover{color:var(--admin-danger);border-color:var(--admin-danger);background:rgba(239,68,68,.08)}.farm-panel-empty,.farm-inward-loading{min-height:240px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--admin-muted);font-size:13px;padding:30px}.farm-empty-icon{width:48px;height:48px;border-radius:14px;background:var(--admin-primary-soft);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.farm-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.farm-modal{width:min(920px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--admin-border);border-radius:16px;background:var(--admin-surface);box-shadow:0 25px 70px rgba(0,0,0,.28)}.farm-modal.small{width:min(680px,100%)}.farm-modal-header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 20px;border-bottom:1px solid var(--admin-border);background:var(--admin-surface)}.farm-modal-title{display:flex;align-items:center;gap:11px}.farm-modal-title-icon{width:38px;height:38px;border-radius:10px;background:var(--admin-primary-soft);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.farm-modal-title h3{margin:0;font-size:17px}.farm-modal-title p{margin:3px 0 0;color:var(--admin-muted);font-size:11px}.farm-modal-close{width:35px;height:35px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.farm-modal-body{padding:20px}.farm-form-section{margin-bottom:20px}.farm-form-section:last-child{margin-bottom:0}.farm-form-section-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13px;font-weight:800;color:var(--admin-text)}.farm-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.farm-form-group{min-width:0}.farm-form-group.full{grid-column:1/-1}.farm-form-label{display:block;margin-bottom:6px;font-size:11px;font-weight:700;color:var(--admin-muted)}.farm-form-label.required:after{content:" *";color:var(--admin-danger)}.farm-form-control{height:42px}.farm-form-control.textarea{height:auto;min-height:90px;padding:11px 12px;resize:vertical}.farm-form-control:disabled{opacity:.65;cursor:not-allowed}.farm-form-help{margin-top:5px;font-size:10px;color:var(--admin-muted)}.farm-invoice-preview{margin-top:10px;padding:10px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.farm-invoice-preview-link{display:inline-flex;margin-top:7px}.farm-invoice-preview-image{display:block;width:180px;height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-surface)}.farm-invoice-preview-image:hover{opacity:.9}.farm-invoice-detail-link{display:inline-flex;margin-top:4px}.farm-invoice-detail-image{display:block;width:240px;max-width:100%;height:160px;object-fit:cover;border-radius:9px;border:1px solid var(--admin-border);background:var(--admin-surface)}.farm-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--admin-border);background:var(--admin-surface)}.farm-cancel-btn,.farm-save-btn{height:40px;border-radius:9px;padding:0 16px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.farm-cancel-btn{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text)}.farm-save-btn{border:1px solid var(--admin-primary);background:var(--admin-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:7px}.farm-save-btn:disabled,.farm-cancel-btn:disabled{opacity:.6;cursor:not-allowed}.farm-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.farm-detail-card{padding:13px;border:1px solid var(--admin-border);border-radius:11px;background:var(--admin-surface-2)}.farm-detail-label{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--admin-muted);margin-bottom:5px}.farm-detail-value{font-size:13px;font-weight:700;color:var(--admin-text);word-break:break-word}.farm-detail-value.highlight{font-size:18px}.farm-detail-section{margin-bottom:18px}.farm-detail-section:last-child{margin-bottom:0}.farm-detail-section h4{display:flex;align-items:center;gap:7px;margin:0 0 10px;font-size:13px}.farm-detail-full{grid-column:1/-1}.farm-warning-box{display:flex;gap:10px;padding:12px;border-radius:10px;background:rgba(234,179,8,.1);border:1px solid rgba(234,179,8,.22);color:#a16207;font-size:12px;line-height:1.5}.dark .farm-inward-stat-icon.green,.dark .farm-inward-stat-icon.blue,.dark .farm-inward-stat-icon.yellow,.dark .farm-inward-stat-icon.red,.dark .farm-inward-stat-icon.orange{filter:brightness(1.12)}@media(max-width:1200px){.farm-inward-stats{grid-template-columns:repeat(5,minmax(0,1fr))}.farm-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.farm-inward-header{align-items:flex-start;flex-direction:column;gap:16px}.farm-inward-actions{width:100%;justify-content:flex-start;gap:8px}.farm-inward-actions .top-action-btn{flex:1;min-width:0}.farm-inward-actions .refresh-action-btn{flex:0 0 40px;width:40px}.farm-inward-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.farm-filter{flex:1;min-width:130px}.farm-form-grid,.farm-detail-grid{grid-template-columns:1fr}.farm-form-group.full,.farm-detail-full{grid-column:auto}}@media(max-width:480px){.farm-inward-header h1{font-size:22px}.farm-inward-header p{font-size:12px}.farm-inward-stats{grid-template-columns:1fr}.farm-inward-stat{padding:14px}.farm-inward-toolbar{padding:10px}.farm-search{min-width:100%}.farm-filter{width:100%}.farm-modal-overlay{padding:10px}.farm-modal{max-height:calc(100vh - 20px)}.farm-modal-header,.farm-modal-body,.farm-modal-footer{padding-left:14px;padding-right:14px}.farm-modal-footer{flex-direction:column-reverse}.farm-cancel-btn,.farm-save-btn{width:100%}}`}</style>
      <div className="farm-inward-header">
        <div className="farm-inward-header-content">
          <div className="farm-inward-eyebrow">
            <Baby size={14} />
            FARM OS / STOCK INWARD
          </div>

          <h1>Chicks Inward</h1>

          <p>Record incoming chicks, supplier details, transport mortality and accepted farm stock.</p>
        </div>

        <div className="farm-inward-actions">
          <button type="button" className="top-action-btn refresh-action-btn" title="Refresh" aria-label="Refresh" onClick={handleRefresh} disabled={loading || loadingDependencies}>
            <RefreshCw size={17} className={loading || loadingDependencies ? "spin-icon" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" title="Export Excel" onClick={exportExcel} disabled={loading || loadingDependencies || visibleInwards.length === 0}>
            <FileSpreadsheet size={17} />
            <span>Excel</span>
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" title="Export PDF" onClick={exportPdf} disabled={loading || loadingDependencies || visibleInwards.length === 0}>
            <FileText size={17} />
            <span>PDF</span>
          </button>

          <button type="button" className="top-action-btn add-action-btn" title="Add Inward" onClick={openCreateModal} disabled={loadingDependencies}>
            <Plus size={18} />
            <span>Add Inward</span>
          </button>
        </div>
      </div>

      <div className="farm-inward-stats">
        <div className="farm-inward-stat">
          <div className="farm-inward-stat-icon green">
            <PackageCheck size={20} />
          </div>

          <div className="farm-inward-stat-content">
            <div className="farm-inward-stat-title">Total Records</div>

            <div className="farm-inward-stat-value">{formatNumber(stats.totalRecords)}</div>
          </div>
        </div>

        <div className="farm-inward-stat">
          <div className="farm-inward-stat-icon blue">
            <Truck size={20} />
          </div>

          <div className="farm-inward-stat-content">
            <div className="farm-inward-stat-title">Quantity Received</div>

            <div className="farm-inward-stat-value">{formatNumber(stats.totalReceived)}</div>
          </div>
        </div>

        <div className="farm-inward-stat">
          <div className="farm-inward-stat-icon green">
            <Baby size={20} />
          </div>

          <div className="farm-inward-stat-content">
            <div className="farm-inward-stat-title">Accepted Quantity</div>

            <div className="farm-inward-stat-value">{formatNumber(stats.totalAccepted)}</div>
          </div>
        </div>

        <div className="farm-inward-stat">
          <div className="farm-inward-stat-icon red">
            <AlertTriangle size={20} />
          </div>

          <div className="farm-inward-stat-content">
            <div className="farm-inward-stat-title">Transport Mortality</div>

            <div className="farm-inward-stat-value">{formatNumber(stats.totalMortality)}</div>
          </div>
        </div>

        <div className="farm-inward-stat">
          <div className="farm-inward-stat-icon orange">
            <IndianRupee size={20} />
          </div>

          <div className="farm-inward-stat-content">
            <div className="farm-inward-stat-title">Total Cost</div>

            <div className="farm-inward-stat-value">{formatCurrency(stats.totalCost)}</div>
          </div>
        </div>
      </div>

      <div className="farm-inward-toolbar">
        <div className="farm-search">
          <Search size={17} />

          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inward, supplier, batch, invoice..." />

          {search && (
            <button type="button" className="farm-search-clear" title="Clear search" aria-label="Clear search" onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}
        </div>

        <select
          className="farm-filter"
          value={farmFilter}
          onChange={(event) => {
            setFarmFilter(event.target.value);
            setShedFilter("");
            setBatchFilter("");
          }}>
          <option value="">All Farms</option>

          {farms.map((farm) => (
            <option key={farm._id || farm.id} value={farm._id || farm.id}>
              {farm.name || farm.code || "Farm"}
            </option>
          ))}
        </select>

        <select
          className="farm-filter"
          value={shedFilter}
          onChange={(event) => {
            setShedFilter(event.target.value);
            setBatchFilter("");
          }}>
          <option value="">All Sheds</option>

          {sheds
            .filter((shed) => !farmFilter || getId(shed.farm) === farmFilter)
            .map((shed) => (
              <option key={shed._id || shed.id} value={shed._id || shed.id}>
                {shed.name || shed.code || "Shed"}
              </option>
            ))}
        </select>

        <select className="farm-filter" value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
          <option value="">All Batches</option>

          {batches
            .filter((batch) => (!farmFilter || getId(batch.farm) === farmFilter) && (!shedFilter || getId(batch.shed) === shedFilter))
            .map((batch) => (
              <option key={batch._id || batch.id} value={batch._id || batch.id}>
                {batch.batchNumber || batch.batchName || "Batch"}
              </option>
            ))}
        </select>
      </div>

      <div className="farm-inward-table-card">
        <div className="farm-table-header">
          <div>
            <h2>Chicks Inward Records</h2>

            <span>
              Showing {formatNumber(visibleInwards.length)} of {formatNumber(inwards.length)} records
            </span>
          </div>
        </div>

        {loading ? (
          renderLoading()
        ) : visibleInwards.length === 0 ? (
          <div className="farm-panel-empty">
            <div className="farm-empty-icon">
              <Baby size={23} />
            </div>

            <strong>No chicks inward records found</strong>

            <span>Add your first inward record to start tracking incoming stock.</span>
          </div>
        ) : (
          <div className="farm-table-wrap">
            <table className="farm-inward-table">
              <thead>
                <tr>
                  <th>Inward</th>
                  <th>Date</th>
                  <th>Farm / Shed</th>
                  <th>Batch</th>
                  <th>Supplier</th>
                  <th>Received</th>
                  <th>Accepted</th>
                  <th>Cost</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {visibleInwards.map((item) => (
                  <tr key={item._id || item.id}>
                    <td>
                      <div className="farm-inward-number">{item.inwardNumber || "-"}</div>

                      {item.invoiceNumber && <div className="farm-inward-subtext">Invoice: {item.invoiceNumber}</div>}
                    </td>

                    <td>{formatDate(item.inwardDate)}</td>

                    <td>
                      <div className="farm-location-cell">
                        <span className="farm-location-main">{getFarmName(item)}</span>

                        <span className="farm-location-sub">{getShedName(item)}</span>
                      </div>
                    </td>

                    <td>
                      <div className="farm-location-cell">
                        <span className="farm-location-main">{getBatchName(item)}</span>

                        {item.batch?.breed && <span className="farm-location-sub">{item.batch.breed}</span>}
                      </div>
                    </td>

                    <td>
                      <div className="farm-location-cell">
                        <span className="farm-location-main">{item.supplier?.name || "-"}</span>

                        {item.supplier?.phone && <span className="farm-location-sub">{item.supplier.phone}</span>}
                      </div>
                    </td>

                    <td>
                      <div className="farm-qty-main">{formatNumber(item.quantityReceived)}</div>

                      {Number(item.transportMortality?.quantity || 0) > 0 && <div className="farm-qty-sub">Mortality: {formatNumber(item.transportMortality.quantity)}</div>}
                    </td>

                    <td>
                      <span className="farm-status-badge">
                        <PackageCheck size={13} />

                        {formatNumber(item.acceptedQuantity)}
                      </span>
                    </td>

                    <td>
                      <div className="farm-cost">{formatCurrency(item.totalCost)}</div>

                      <div className="farm-inward-subtext">{formatCurrency(item.unitCost)} / bird</div>
                    </td>

                    <td>
                      <div className="farm-action-buttons">
                        <button type="button" className="farm-icon-btn" title="View" onClick={() => openDetailsModal(item)}>
                          <Eye size={15} />
                        </button>

                        <button type="button" className="farm-icon-btn" title="Edit" onClick={() => openEditModal(item)}>
                          <Pencil size={15} />
                        </button>

                        <button type="button" className="farm-icon-btn danger" title="Delete" onClick={() => handleDelete(item)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="farm-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}>
          <div className="farm-modal">
            <div className="farm-modal-header">
              <div className="farm-modal-title">
                <div className="farm-modal-title-icon">
                  <Baby size={19} />
                </div>

                <div>
                  <h3>{editingItem ? "Edit Chicks Inward" : "Add Chicks Inward"}</h3>

                  <p>{editingItem ? "Update inward and stock details" : "Record new incoming chicks stock"}</p>
                </div>
              </div>

              <button type="button" className="farm-modal-close" onClick={closeModal} disabled={saving}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="farm-modal-body">
                <div className="farm-form-section">
                  <div className="farm-form-section-title">
                    <Building2 size={15} />
                    Farm & Batch
                  </div>

                  <div className="farm-form-grid">
                    <div className="farm-form-group">
                      <label className="farm-form-label required">Farm</label>

                      <select name="farm" value={form.farm} onChange={handleFarmChange} className="farm-form-control" disabled={!!editingItem || loadingDependencies} required>
                        <option value="">Select farm</option>

                        {farms.map((farm) => (
                          <option key={farm._id || farm.id} value={farm._id || farm.id}>
                            {farm.name || farm.code || "Farm"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label required">Shed</label>

                      <select name="shed" value={form.shed} onChange={handleShedChange} className="farm-form-control" disabled={!!editingItem || !form.farm || loadingDependencies} required>
                        <option value="">Select shed</option>

                        {filteredSheds.map((shed) => (
                          <option key={shed._id || shed.id} value={shed._id || shed.id}>
                            {shed.name || shed.code || "Shed"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label required">Batch</label>

                      <select name="batch" value={form.batch} onChange={handleChange} className="farm-form-control" disabled={!!editingItem || !form.shed || loadingDependencies} required>
                        <option value="">Select batch</option>

                        {filteredBatches.map((batch) => (
                          <option key={batch._id || batch.id} value={batch._id || batch.id}>
                            {batch.batchNumber || batch.batchName || "Batch"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="farm-form-section">
                  <div className="farm-form-section-title">
                    <FileText size={15} />
                    Inward Details
                  </div>

                  <div className="farm-form-grid">
                    <div className="farm-form-group">
                      <label className="farm-form-label required">Inward Number</label>

                      <input name="inwardNumber" value={form.inwardNumber} onChange={handleChange} className="farm-form-control" placeholder="e.g. INW-001" disabled={!!editingItem} required />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label required">Inward Date</label>

                      <input type="date" name="inwardDate" value={form.inwardDate} onChange={handleChange} className="farm-form-control" required />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Bird Type</label>

                      <select name="birdType" value={form.birdType} onChange={handleChange} className="farm-form-control" disabled={!!editingItem}>
                        <option value="CHICKS">Chicks</option>

                        <option value="BIRDS">Birds</option>
                      </select>
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Breed</label>

                      <input name="breed" value={form.breed} onChange={handleChange} className="farm-form-control" placeholder="Kadaknath" disabled={!!editingItem} />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Vehicle Number</label>

                      <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} className="farm-form-control" placeholder="KA01AB1234" />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Invoice Number</label>

                      <input name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} className="farm-form-control" placeholder="Invoice number" />
                    </div>
                  </div>
                </div>

                <div className="farm-form-section">
                  <div className="farm-form-section-title">
                    <Truck size={15} />
                    Supplier
                  </div>

                  <div className="farm-form-grid">
                    <div className="farm-form-group">
                      <label className="farm-form-label required">Supplier Name</label>

                      <input name="supplierName" value={form.supplierName} onChange={handleChange} className="farm-form-control" placeholder="Supplier name" required />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Supplier Phone</label>

                      <input name="supplierPhone" value={form.supplierPhone} onChange={handleChange} className="farm-form-control" placeholder="Phone number" />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Supplier Address</label>

                      <input name="supplierAddress" value={form.supplierAddress} onChange={handleChange} className="farm-form-control" placeholder="Supplier address" />
                    </div>
                  </div>
                </div>

                <div className="farm-form-section">
                  <div className="farm-form-section-title">
                    <PackageCheck size={15} />
                    Quantity & Stock
                  </div>

                  <div className="farm-form-grid">
                    <div className="farm-form-group">
                      <label className="farm-form-label required">Quantity Received</label>

                      <input type="number" min="1" name="quantityReceived" value={form.quantityReceived} onChange={handleChange} className="farm-form-control" placeholder="0" required />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Transport Mortality</label>

                      <input type="number" min="0" name="transportMortalityQuantity" value={form.transportMortalityQuantity} onChange={handleChange} className="farm-form-control" placeholder="0" />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Accepted Quantity</label>

                      <input type="number" min="0" name="acceptedQuantity" value={form.acceptedQuantity} onChange={handleChange} className="farm-form-control" placeholder="0" readOnly={!editingItem} />

                      <div className="farm-form-help">Received − transport mortality</div>
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Male Count</label>

                      <input type="number" min="0" name="maleCount" value={form.maleCount} onChange={handleChange} className="farm-form-control" placeholder="0" />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Female Count</label>

                      <input type="number" min="0" name="femaleCount" value={form.femaleCount} onChange={handleChange} className="farm-form-control" placeholder="0" />
                    </div>

                    <div className="farm-form-group">
                      <label className="farm-form-label">Unit Cost</label>

                      <input type="number" min="0" step="0.01" name="unitCost" value={form.unitCost} onChange={handleChange} className="farm-form-control" placeholder="0" />
                    </div>

                    <div className="farm-form-group full">
                      <label className="farm-form-label">Transport Mortality Reason</label>

                      <input name="transportMortalityReason" value={form.transportMortalityReason} onChange={handleChange} className="farm-form-control" placeholder="Reason if mortality occurred during transport" />
                    </div>
                  </div>
                </div>

                <div className="farm-form-section">
                  <div className="farm-form-section-title">
                    <FileText size={15} />
                    Additional Information
                  </div>

                  <div className="farm-form-grid">
                    <div className="farm-form-group full">
                      <label className="farm-form-label">Invoice Image</label>

                      <input type="file" name="invoiceImage" accept="image/jpeg,image/png,image/webp" onChange={handleInvoiceImageChange} className="farm-form-control" />

                      <div className="farm-form-help">JPG, PNG or WebP. Maximum size 5 MB.</div>

                      {editingItem?.invoiceImage && !form.invoiceImage && (
                        <div className="farm-invoice-preview">
                          <div className="farm-form-help">Current invoice image</div>

                          <a href={editingItem.invoiceImage} target="_blank" rel="noreferrer" className="farm-invoice-preview-link">
                            <img src={editingItem.invoiceImage} alt="Current invoice" className="farm-invoice-preview-image" />
                          </a>
                        </div>
                      )}

                      {form.invoiceImage instanceof File && invoicePreview && (
                        <div className="farm-invoice-preview">
                          <div className="farm-form-help">New invoice image</div>

                          <img src={invoicePreview} alt="New invoice preview" className="farm-invoice-preview-image" />
                        </div>
                      )}
                    </div>

                    <div className="farm-form-group full">
                      <label className="farm-form-label">Notes</label>

                      <textarea name="notes" value={form.notes} onChange={handleChange} className="farm-form-control textarea" placeholder="Any additional notes..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="farm-modal-footer">
                <button type="button" className="farm-cancel-btn" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="farm-save-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="spin-icon" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PackageCheck size={15} />
                      {editingItem ? "Update Inward" : "Save Inward"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && viewingItem && (
        <div
          className="farm-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsDetailsOpen(false);
              setViewingItem(null);
            }
          }}>
          <div className="farm-modal small">
            <div className="farm-modal-header">
              <div className="farm-modal-title">
                <div className="farm-modal-title-icon">
                  <Eye size={19} />
                </div>

                <div>
                  <h3>Inward Details</h3>

                  <p>{viewingItem.inwardNumber || "Inward record"}</p>
                </div>
              </div>

              <button
                type="button"
                className="farm-modal-close"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setViewingItem(null);
                }}>
                <X size={17} />
              </button>
            </div>

            <div className="farm-modal-body">
              <div className="farm-detail-section">
                <h4>
                  <CalendarDays size={15} />
                  Basic Details
                </h4>

                <div className="farm-detail-grid">
                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Inward Number</div>

                    <div className="farm-detail-value">{viewingItem.inwardNumber || "-"}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Inward Date</div>

                    <div className="farm-detail-value">{formatDate(viewingItem.inwardDate)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Farm</div>

                    <div className="farm-detail-value">{getFarmName(viewingItem)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Shed</div>

                    <div className="farm-detail-value">{getShedName(viewingItem)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Batch</div>

                    <div className="farm-detail-value">{getBatchName(viewingItem)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Breed</div>

                    <div className="farm-detail-value">{viewingItem.breed || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="farm-detail-section">
                <h4>
                  <PackageCheck size={15} />
                  Stock Details
                </h4>

                <div className="farm-detail-grid">
                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Quantity Received</div>

                    <div className="farm-detail-value highlight">{formatNumber(viewingItem.quantityReceived)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Accepted Quantity</div>

                    <div className="farm-detail-value highlight">{formatNumber(viewingItem.acceptedQuantity)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Transport Mortality</div>

                    <div className="farm-detail-value">{formatNumber(viewingItem.transportMortality?.quantity)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Male Count</div>

                    <div className="farm-detail-value">{formatNumber(viewingItem.maleCount)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Female Count</div>

                    <div className="farm-detail-value">{formatNumber(viewingItem.femaleCount)}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Unit Cost</div>

                    <div className="farm-detail-value">{formatCurrency(viewingItem.unitCost)}</div>
                  </div>

                  <div className="farm-detail-card farm-detail-full">
                    <div className="farm-detail-label">Total Cost</div>

                    <div className="farm-detail-value highlight">{formatCurrency(viewingItem.totalCost)}</div>
                  </div>
                </div>
              </div>

              <div className="farm-detail-section">
                <h4>
                  <Truck size={15} />
                  Supplier Details
                </h4>

                <div className="farm-detail-grid">
                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Supplier</div>

                    <div className="farm-detail-value">{viewingItem.supplier?.name || "-"}</div>
                  </div>

                  <div className="farm-detail-card">
                    <div className="farm-detail-label">Phone</div>

                    <div className="farm-detail-value">{viewingItem.supplier?.phone || "-"}</div>
                  </div>

                  <div className="farm-detail-card farm-detail-full">
                    <div className="farm-detail-label">Address</div>

                    <div className="farm-detail-value">{viewingItem.supplier?.address || "-"}</div>
                  </div>
                </div>
              </div>

              {(viewingItem.invoiceNumber || viewingItem.vehicleNumber || viewingItem.invoiceImage || viewingItem.transportMortality?.reason) && (
                <div className="farm-detail-section">
                  <h4>
                    <FileText size={15} />
                    Additional Details
                  </h4>

                  <div className="farm-detail-grid">
                    <div className="farm-detail-card">
                      <div className="farm-detail-label">Invoice Number</div>

                      <div className="farm-detail-value">{viewingItem.invoiceNumber || "-"}</div>
                    </div>

                    <div className="farm-detail-card">
                      <div className="farm-detail-label">Vehicle Number</div>

                      <div className="farm-detail-value">{viewingItem.vehicleNumber || "-"}</div>
                    </div>

                    {viewingItem.transportMortality?.reason && (
                      <div className="farm-detail-card farm-detail-full">
                        <div className="farm-detail-label">Mortality Reason</div>

                        <div className="farm-detail-value">{viewingItem.transportMortality.reason}</div>
                      </div>
                    )}

                    {viewingItem.invoiceImage && (
                      <div className="farm-detail-card farm-detail-full">
                        <div className="farm-detail-label">Invoice Image</div>

                        <a href={viewingItem.invoiceImage} target="_blank" rel="noreferrer" className="farm-invoice-detail-link">
                          <img src={viewingItem.invoiceImage} alt="Invoice" className="farm-invoice-detail-image" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingItem.notes && (
                <div className="farm-detail-section">
                  <h4>
                    <FileText size={15} />
                    Notes
                  </h4>

                  <div className="farm-warning-box">
                    <FileText size={16} />

                    <span>{viewingItem.notes}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="farm-modal-footer">
              <button
                type="button"
                className="farm-cancel-btn"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setViewingItem(null);
                }}>
                Close
              </button>

              <button
                type="button"
                className="farm-save-btn"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setViewingItem(null);
                  openEditModal(viewingItem);
                }}>
                <Pencil size={15} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
