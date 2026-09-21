import { useEffect, useMemo, useState } from "react";
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye, X, Bird, Warehouse, Users, UserRound, Scale, Clock3, CheckCircle2, CircleDot, Loader2, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, CalendarDays } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const emptyForm = {
  farm: "",
  shed: "",
  batchNumber: "",
  batchName: "",
  birdType: "CHICKS",
  breed: "Kadaknath",
  sourceName: "",
  sourceContact: "",
  arrivalDate: "",
  initialQuantity: "",
  currentQuantity: "",
  initialMaleCount: "",
  initialFemaleCount: "",
  currentMaleCount: "",
  currentFemaleCount: "",
  expectedSaleAgeDays: "120",
  targetWeightKg: "1.5",
  status: "ACTIVE",
  notes: "",
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.farmName || value.title || "";
};

const normalizeFarms = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.farms)) return data.farms;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(response?.farms)) return response.farms;
  if (Array.isArray(response?.items)) return response.items;

  return [];
};

const normalizeSheds = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.sheds)) return data.sheds;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(response?.sheds)) return response.sheds;
  if (Array.isArray(response?.items)) return response.items;

  return [];
};

const normalizeBatches = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.batches)) return data.batches;
  if (Array.isArray(response?.batches)) return response.batches;

  return [];
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateInput = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStatusClass = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "SOLD":
      return "sold";
    default:
      return "default";
  }
};

const escapeCsv = (value) => {
  const stringValue = String(value ?? "");

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const Batches = () => {
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedShed, setSelectedShed] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSheds, setLoadingSheds] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [modal, setModal] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");
      const farmList = normalizeFarms(response);

      setFarms(farmList);

      if (farmList.length > 0) {
        const firstFarmId = getId(farmList[0]);

        setSelectedFarm((current) => {
          if (current && farmList.some((farm) => getId(farm) === current)) {
            return current;
          }

          return firstFarmId;
        });
      } else {
        setSelectedFarm("");
      }
    } catch (error) {
      console.error("Load farms error:", error);
      setFarms([]);
      setSelectedFarm("");
      showError(error?.message || "Failed to load farms");
    }
  };

  const loadSheds = async (farmId) => {
    if (!farmId) {
      setSheds([]);
      return;
    }

    try {
      setLoadingSheds(true);

      const response = await apiRequest(`/sheds?farm=${encodeURIComponent(farmId)}`);

      const shedList = normalizeSheds(response);

      setSheds(shedList);

      setForm((current) => {
        if (current.shed && shedList.some((shed) => getId(shed) === current.shed)) {
          return current;
        }

        return {
          ...current,
          shed: "",
        };
      });
    } catch (error) {
      console.error("Load sheds error:", error);
      setSheds([]);
      showError(error?.message || "Failed to load sheds");
    } finally {
      setLoadingSheds(false);
    }
  };

  const loadBatches = async (farmId = selectedFarm) => {
    if (!farmId) {
      setBatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("farm", farmId);

      if (selectedShed) {
        params.set("shed", selectedShed);
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await apiRequest(`/batches?${params.toString()}`);
      const batchList = normalizeBatches(response);

      setBatches(batchList);
      setPage(1);
    } catch (error) {
      console.error("Load batches error:", error);
      setBatches([]);
      showError(error?.message || "Failed to load batches");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadFarms();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!selectedFarm) {
      setSheds([]);
      setBatches([]);
      setLoading(false);
      return;
    }

    loadSheds(selectedFarm);
    loadBatches(selectedFarm);
  }, [selectedFarm]);

  useEffect(() => {
    if (!selectedFarm) return;

    loadBatches(selectedFarm);
  }, [selectedShed, statusFilter]);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return batches;

    return batches.filter((batch) => {
      const values = [batch.batchNumber, batch.batchName, batch.birdType, batch.breed, batch.status, batch.farm?.name, batch.farm?.code, batch.shed?.name, batch.shed?.code];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [batches, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));

  const paginatedBatches = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredBatches.slice(start, start + pageSize);
  }, [filteredBatches, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const active = batches.filter((batch) => String(batch.status).toUpperCase() === "ACTIVE");

    const completed = batches.filter((batch) => String(batch.status).toUpperCase() === "COMPLETED");

    const currentBirds = batches.reduce((total, batch) => total + Number(batch.currentQuantity || 0), 0);

    const initialBirds = batches.reduce((total, batch) => total + Number(batch.initialQuantity || 0), 0);

    return {
      total: batches.length,
      active: active.length,
      completed: completed.length,
      currentBirds,
      initialBirds,
    };
  }, [batches]);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      farm: selectedFarm || "",
      shed: "",
      arrivalDate: formatDateInput(new Date()),
    });

    setSelectedBatch(null);
    setModal("form");
  };

  const openEdit = (batch) => {
    const source = batch.source || {};

    setForm({
      farm: getId(batch.farm) || selectedFarm || "",
      shed: getId(batch.shed) || "",
      batchNumber: batch.batchNumber || "",
      batchName: batch.batchName || "",
      birdType: batch.birdType || "CHICKS",
      breed: batch.breed || "Kadaknath",
      sourceName: source.name || source.sourceName || "",
      sourceContact: source.contact || source.phone || source.mobile || "",
      arrivalDate: formatDateInput(batch.arrivalDate),
      initialQuantity: batch.initialQuantity !== undefined ? String(batch.initialQuantity) : "",
      currentQuantity: batch.currentQuantity !== undefined ? String(batch.currentQuantity) : "",
      initialMaleCount: batch.initialMaleCount !== undefined ? String(batch.initialMaleCount) : "",
      initialFemaleCount: batch.initialFemaleCount !== undefined ? String(batch.initialFemaleCount) : "",
      currentMaleCount: batch.currentMaleCount !== undefined ? String(batch.currentMaleCount) : "",
      currentFemaleCount: batch.currentFemaleCount !== undefined ? String(batch.currentFemaleCount) : "",
      expectedSaleAgeDays: batch.expectedSaleAgeDays !== undefined ? String(batch.expectedSaleAgeDays) : "120",
      targetWeightKg: batch.targetWeightKg !== undefined ? String(batch.targetWeightKg) : "1.5",
      status: batch.status || "ACTIVE",
      notes: batch.notes || "",
    });

    setSelectedBatch(batch);
    setModal("form");

    if (getId(batch.farm)) {
      loadSheds(getId(batch.farm));
    }
  };

  const openDetails = (batch) => {
    setSelectedBatch(batch);
    setModal("details");
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedBatch(null);
    setForm(emptyForm);
  };

  const handleFarmChange = async (farmId) => {
    setForm((current) => ({
      ...current,
      farm: farmId,
      shed: "",
    }));

    await loadSheds(farmId);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const buildSource = () => {
    const source = {};

    if (form.sourceName.trim()) {
      source.name = form.sourceName.trim();
    }

    if (form.sourceContact.trim()) {
      source.contact = form.sourceContact.trim();
    }

    return source;
  };

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

    if (!form.batchNumber.trim()) {
      showError("Batch number is required");
      return;
    }

    if (!form.arrivalDate) {
      showError("Arrival date is required");
      return;
    }

    if (form.initialQuantity === "" || Number(form.initialQuantity) < 1) {
      showError("Initial quantity must be at least 1");
      return;
    }

    if (form.currentQuantity !== "" && Number(form.currentQuantity) < 0) {
      showError("Current quantity cannot be negative");
      return;
    }

    if (Number(form.currentMaleCount || 0) + Number(form.currentFemaleCount || 0) > Number(form.currentQuantity !== "" ? form.currentQuantity : form.initialQuantity)) {
      showError("Male and female count cannot exceed current quantity");
      return;
    }

    const payload = {
      farm: form.farm,
      shed: form.shed,
      batchNumber: form.batchNumber.trim(),
      batchName: form.batchName.trim(),
      birdType: form.birdType,
      breed: form.breed.trim() || "Kadaknath",
      source: buildSource(),
      arrivalDate: form.arrivalDate,
      initialQuantity: Number(form.initialQuantity),
      currentQuantity: form.currentQuantity === "" ? undefined : Number(form.currentQuantity),
      initialMaleCount: Number(form.initialMaleCount || 0),
      initialFemaleCount: Number(form.initialFemaleCount || 0),
      currentMaleCount: form.currentMaleCount === "" ? undefined : Number(form.currentMaleCount),
      currentFemaleCount: form.currentFemaleCount === "" ? undefined : Number(form.currentFemaleCount),
      expectedSaleAgeDays: form.expectedSaleAgeDays === "" ? 120 : Number(form.expectedSaleAgeDays),
      targetWeightKg: form.targetWeightKg === "" ? 1.5 : Number(form.targetWeightKg),
      status: form.status,
      notes: form.notes.trim(),
    };

    try {
      setSaving(true);

      if (selectedBatch) {
        const updatePayload = {
          batchName: payload.batchName,
          birdType: payload.birdType,
          breed: payload.breed,
          source: payload.source,
          arrivalDate: payload.arrivalDate,
          currentQuantity: payload.currentQuantity,
          currentMaleCount: payload.currentMaleCount !== undefined ? payload.currentMaleCount : 0,
          currentFemaleCount: payload.currentFemaleCount !== undefined ? payload.currentFemaleCount : 0,
          expectedSaleAgeDays: payload.expectedSaleAgeDays,
          targetWeightKg: payload.targetWeightKg,
          status: payload.status,
          notes: payload.notes,
        };

        if (form.status === "COMPLETED") {
          updatePayload.completedAt = selectedBatch.completedAt || new Date().toISOString();
        }

        const response = await apiRequest(`/batches/${getId(selectedBatch)}`, {
          method: "PUT",
          body: JSON.stringify(updatePayload),
        });

        showSuccess(response?.message || "Batch updated successfully");
      } else {
        const response = await apiRequest("/batches", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess(response?.message || "Batch created successfully");
      }

      setModal(null);
      setSelectedBatch(null);
      setForm(emptyForm);

      await loadBatches(selectedFarm);
    } catch (error) {
      console.error("Save batch error:", error);
      showError(error?.message || "Failed to save batch");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (batch) => {
    const result = await showConfirm({
      title: `Delete Batch "${batch.batchNumber || "this batch"}"?`,
      text: "This can only be deleted when current birds are 0 and no dependent records exist.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(getId(batch));

      const response = await apiRequest(`/batches/${getId(batch)}`, {
        method: "DELETE",
      });

      showSuccess(response?.message || "Batch deleted successfully");

      await loadBatches(selectedFarm);
    } catch (error) {
      console.error("Delete batch error:", error);
      showError(error?.message || "Failed to delete batch");
    } finally {
      setDeletingId("");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (!selectedFarm) {
        await loadFarms();
        return;
      }

      await Promise.all([loadSheds(selectedFarm), loadBatches(selectedFarm)]);
    } finally {
      setRefreshing(false);
    }
  };

  const exportExcel = () => {
    if (!filteredBatches.length) {
      showError("No batch data available to export");
      return;
    }

    const headers = [
      "Batch Number",
      "Batch Name",
      "Farm",
      "Farm Code",
      "Shed",
      "Shed Code",
      "Bird Type",
      "Breed",
      "Arrival Date",
      "Initial Quantity",
      "Current Quantity",
      "Initial Male",
      "Initial Female",
      "Current Male",
      "Current Female",
      "Expected Sale Age Days",
      "Target Weight Kg",
      "Status",
      "Source Name",
      "Source Contact",
      "Notes",
    ];

    const rows = filteredBatches.map((batch) => [
      batch.batchNumber || "",
      batch.batchName || "",
      batch.farm?.name || "",
      batch.farm?.code || "",
      batch.shed?.name || "",
      batch.shed?.code || "",
      batch.birdType || "",
      batch.breed || "",
      formatDate(batch.arrivalDate),
      Number(batch.initialQuantity || 0),
      Number(batch.currentQuantity || 0),
      Number(batch.initialMaleCount || 0),
      Number(batch.initialFemaleCount || 0),
      Number(batch.currentMaleCount || 0),
      Number(batch.currentFemaleCount || 0),
      batch.expectedSaleAgeDays ?? "",
      batch.targetWeightKg ?? "",
      batch.status || "",
      batch.source?.name || batch.source?.sourceName || "",
      batch.source?.contact || batch.source?.phone || "",
      batch.notes || "",
    ]);

    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `batches-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showSuccess("Excel file exported successfully");
  };

  const exportPdf = () => {
    if (!filteredBatches.length) {
      showError("No batch data available to export");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      showError("Popup blocked. Please allow popups to export PDF.");
      return;
    }

    const farmName = farms.find((farm) => getId(farm) === selectedFarm)?.name || farms.find((farm) => getId(farm) === selectedFarm)?.farmName || "All Farms";

    const rows = filteredBatches
      .map(
        (batch) => `
          <tr>
            <td>
              <strong>${escapeHtml(batch.batchNumber || "-")}</strong>
              <small>${escapeHtml(batch.batchName || batch.birdType || "-")}</small>
            </td>
            <td>
              ${escapeHtml(batch.farm?.name || batch.farm?.code || "-")}
              <small>
                ${escapeHtml(batch.shed?.name || batch.shed?.code || "-")}
              </small>
            </td>
            <td>${Number(batch.currentQuantity || 0).toLocaleString("en-IN")}</td>
            <td>
              M: ${Number(batch.currentMaleCount || 0)}<br />
              F: ${Number(batch.currentFemaleCount || 0)}
            </td>
            <td>
              ${escapeHtml(batch.breed || "-")}
              <small>${escapeHtml(batch.birdType || "-")}</small>
            </td>
            <td>${escapeHtml(formatDate(batch.arrivalDate))}</td>
            <td>
              <span class="status ${getStatusClass(batch.status)}">
                ${escapeHtml(String(batch.status || "UNKNOWN").toLowerCase())}
              </span>
            </td>
          </tr>
        `
      )
      .join("");

    const generatedAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BR30 Kadaknath Farms - Batch Report</title>

          <style>
            *{box-sizing:border-box}
            body{margin:0;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#172033;background:#fff}
            .report-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #166534}
            .brand h1{margin:0 0 5px;font-size:22px;color:#166534}
            .brand h2{margin:0 0 5px;font-size:17px;color:#172033}
            .brand p{margin:0;color:#64748b;font-size:11px}
            .meta{text-align:right;color:#64748b;font-size:10px;line-height:1.6}
            .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px}
            .summary-box{padding:12px;border:1px solid #dbe3ea;border-radius:8px;background:#f8fafc}
            .summary-box span{display:block;color:#64748b;font-size:9px;margin-bottom:4px}
            .summary-box strong{display:block;font-size:16px;color:#172033}
            table{width:100%;border-collapse:collapse}
            th{padding:9px 8px;text-align:left;background:#166534;color:#fff;font-size:9px;white-space:nowrap}
            td{padding:9px 8px;border-bottom:1px solid #e2e8f0;font-size:9px;vertical-align:top}
            tbody tr:nth-child(even){background:#f8fafc}
            td strong{display:block;font-size:9px;margin-bottom:2px}
            td small{display:block;color:#64748b;font-size:8px;margin-top:2px}
            .status{display:inline-block;padding:4px 6px;border-radius:5px;font-size:8px;font-weight:700;text-transform:capitalize}
            .status.active{background:#dcfce7;color:#15803d}
            .status.completed{background:#dbeafe;color:#2563eb}
            .status.cancelled{background:#fee2e2;color:#dc2626}
            .status.sold{background:#f3e8ff;color:#9333ea}
            .status.default{background:#f1f5f9;color:#64748b}
            .footer{margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;color:#64748b;font-size:8px;text-align:center}
            @media print{
              body{padding:12px}
              .no-print{display:none}
              @page{size:landscape;margin:10mm}
            }
          </style>
        </head>

        <body>
          <div class="report-header">
            <div class="brand">
              <h1>BR30 Kadaknath Farms</h1>
              <h2>Batch Management Report</h2>
              <p>Farm: ${escapeHtml(farmName)}</p>
            </div>

            <div class="meta">
              <div>Generated: ${escapeHtml(generatedAt)}</div>
              <div>Total Records: ${filteredBatches.length}</div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-box">
              <span>Total Batches</span>
              <strong>${stats.total}</strong>
            </div>

            <div class="summary-box">
              <span>Active Batches</span>
              <strong>${stats.active}</strong>
            </div>

            <div class="summary-box">
              <span>Current Birds</span>
              <strong>${stats.currentBirds.toLocaleString("en-IN")}</strong>
            </div>

            <div class="summary-box">
              <span>Completed</span>
              <strong>${stats.completed}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Farm / Shed</th>
                <th>Current Birds</th>
                <th>Gender</th>
                <th>Breed</th>
                <th>Arrival</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            BR30 Kadaknath Farms • Farm OS • Batch Management
          </div>

          <script>
            window.onload = function(){
              setTimeout(function(){
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const currentFarmName = farms.find((farm) => getId(farm) === selectedFarm)?.name || farms.find((farm) => getId(farm) === selectedFarm)?.farmName || "Farm";

  return (
    <div className="farm-batches-page">
      <style>{`.farm-batches-page{width:100%;min-height:calc(100vh - 132px);color:var(--admin-text,#172033)}.batches-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:20px;padding:0 0 20px;border-bottom:1px solid var(--admin-border,#e4e8ef);background:transparent;color:var(--admin-text,#172033);position:relative}.batches-header-content{width:100%;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.batches-header-text{min-width:0}.batches-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--admin-primary,#4f46e5)}.batches-header h1{margin:0 0 7px;font-size:27px;line-height:1.2;font-weight:800;color:var(--admin-text,#172033)}.batches-header p{margin:0;max-width:680px;font-size:13px;line-height:1.6;color:var(--admin-muted,#697386)}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#991b1b;color:#991b1b}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.spin-icon{animation:batches-spin 1s linear infinite}@keyframes batches-spin{to{transform:rotate(360deg)}}.batches-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}.batches-stat{min-width:0;padding:16px;display:flex;align-items:center;gap:12px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface);transition:.2s ease}.batches-stat:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(15,23,42,.07)}.batches-stat-icon{width:43px;height:43px;flex:0 0 43px;display:flex;align-items:center;justify-content:center;border-radius:11px}.batches-stat-icon.green{background:#dcfce7;color:#16a34a}.batches-stat-icon.blue{background:#dbeafe;color:#2563eb}.batches-stat-icon.yellow{background:#fef3c7;color:#d97706}.batches-stat-icon.purple{background:#f3e8ff;color:#9333ea}.batches-stat-label{display:block;margin-bottom:3px;color:var(--admin-muted);font-size:9px}.batches-stat-value{display:block;color:var(--admin-text);font-size:19px;font-weight:800}.batches-toolbar{margin-bottom:16px;padding:14px;display:grid;grid-template-columns:minmax(230px,1.5fr) repeat(3,minmax(150px,1fr));gap:10px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface)}.batches-search{position:relative;min-width:0}.batches-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--admin-muted)}.batches-input,.batches-select{width:100%;height:39px;padding:0 11px;border:1px solid var(--admin-border);border-radius:9px;outline:0;background:var(--admin-surface-2);color:var(--admin-text);font-size:11px}.batches-search .batches-input{padding-left:36px}.batches-input:focus,.batches-select:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px var(--admin-primary-soft)}.batches-select option{background:var(--admin-surface);color:var(--admin-text)}.batches-search-clear{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--admin-muted);cursor:pointer}.batches-search-clear:hover{background:var(--admin-primary-soft);color:var(--admin-primary)}.batches-table-card{overflow:hidden;border:1px solid var(--admin-border);border-radius:16px;background:var(--admin-surface)}.batches-table-header{padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--admin-border)}.batches-table-header h2{margin:0 0 3px;color:var(--admin-text);font-size:14px}.batches-table-header span{color:var(--admin-muted);font-size:9px}.batches-table-wrap{width:100%;overflow-x:auto}.batches-table{width:100%;min-width:1050px;border-collapse:collapse}.batches-table th{padding:12px 14px;text-align:left;color:var(--admin-muted);background:var(--admin-surface-2);font-size:9px;font-weight:800;white-space:nowrap;border-bottom:1px solid var(--admin-border)}.batches-table td{padding:13px 14px;color:var(--admin-text);font-size:10px;border-bottom:1px solid var(--admin-border);vertical-align:middle}.batches-table tbody tr:last-child td{border-bottom:0}.batches-table tbody tr:hover{background:var(--admin-surface-2)}.batch-primary{display:flex;align-items:center;gap:9px;min-width:170px}.batch-avatar{width:35px;height:35px;flex:0 0 35px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:#dcfce7;color:#15803d}.batch-primary strong{display:block;margin-bottom:2px;font-size:11px}.batch-primary span{display:block;color:var(--admin-muted);font-size:9px}.batch-location{display:flex;align-items:center;gap:6px}.batch-location svg{color:var(--admin-primary)}.batch-location strong{font-size:10px}.batch-location span{display:block;color:var(--admin-muted);font-size:8px;margin-top:2px}.batch-birds{display:flex;align-items:center;gap:7px}.batch-birds-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#eff6ff;color:#2563eb}.batch-birds strong{font-size:12px}.batch-gender{display:flex;gap:6px;flex-wrap:wrap}.batch-gender span{padding:4px 6px;border-radius:6px;background:var(--admin-surface-2);color:var(--admin-muted);font-size:8px;font-weight:700}.batch-status{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:7px;font-size:8px;font-weight:800;text-transform:capitalize}.batch-status.active{background:#dcfce7;color:#15803d}.batch-status.completed{background:#dbeafe;color:#2563eb}.batch-status.cancelled{background:#fee2e2;color:#dc2626}.batch-status.sold{background:#f3e8ff;color:#9333ea}.batch-status.default{background:var(--admin-surface-2);color:var(--admin-muted)}.batch-date{white-space:nowrap;color:var(--admin-muted);font-size:9px}.batch-actions{display:flex;align-items:center;gap:5px}.batch-action-btn{width:31px;height:31px;display:flex;align-items:center;justify-content:center;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);cursor:pointer;transition:.2s ease}.batch-action-btn:hover{border-color:var(--admin-primary);color:var(--admin-primary);background:var(--admin-primary-soft)}.batch-action-btn.danger:hover{border-color:#fecaca;color:#dc2626;background:#fef2f2}.batch-action-btn:disabled{opacity:.45;cursor:not-allowed}.batches-empty{min-height:280px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;padding:30px;color:var(--admin-muted);text-align:center}.batches-empty-icon{width:50px;height:50px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:var(--admin-surface-2);color:var(--admin-muted);margin-bottom:4px}.batches-empty strong{color:var(--admin-text);font-size:13px}.batches-empty span{font-size:10px}.batches-loading{min-height:280px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--admin-muted);font-size:11px}.batches-pagination{padding:13px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--admin-border)}.batches-pagination-info{color:var(--admin-muted);font-size:9px}.batches-pagination-actions{display:flex;align-items:center;gap:5px}.pagination-btn{width:31px;height:31px;display:flex;align-items:center;justify-content:center;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);color:var(--admin-muted);cursor:pointer}.pagination-btn:hover:not(:disabled){border-color:var(--admin-primary);color:var(--admin-primary)}.pagination-btn:disabled{opacity:.4;cursor:not-allowed}.pagination-page{min-width:31px;height:31px;padding:0 8px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--admin-primary);color:#fff;font-size:9px;font-weight:800}.batches-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(4px)}.batches-modal{width:min(760px,100%);max-height:90vh;overflow:auto;border:1px solid var(--admin-border);border-radius:18px;background:var(--admin-surface);box-shadow:0 25px 70px rgba(0,0,0,.22)}.batches-modal.details-modal{width:min(680px,100%)}.batches-modal-header{position:sticky;top:0;z-index:2;padding:17px 19px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--admin-border);background:var(--admin-surface)}.batches-modal-header h2{margin:0 0 3px;color:var(--admin-text);font-size:15px}.batches-modal-header span{color:var(--admin-muted);font-size:9px}.modal-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);cursor:pointer}.modal-close:hover{color:var(--admin-text);border-color:var(--admin-primary)}.batches-form{padding:19px}.form-section{margin-bottom:20px}.form-section:last-child{margin-bottom:0}.form-section-title{display:flex;align-items:center;gap:7px;margin-bottom:11px;color:var(--admin-text);font-size:11px;font-weight:800}.form-section-title svg{color:var(--admin-primary)}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.form-group{min-width:0}.form-group.full{grid-column:1 / -1}.form-group label{display:block;margin-bottom:5px;color:var(--admin-muted);font-size:9px;font-weight:700}.form-group label em{color:#dc2626;font-style:normal}.form-control{width:100%;height:38px;padding:0 10px;border:1px solid var(--admin-border);border-radius:8px;outline:0;background:var(--admin-surface-2);color:var(--admin-text);font-size:10px}.form-control.textarea{height:78px;padding:10px;resize:vertical}.form-control:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px var(--admin-primary-soft)}.form-control option{background:var(--admin-surface);color:var(--admin-text)}.date-input-wrap{position:relative;width:100%}.date-input-wrap .date-input-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);z-index:2;color:var(--admin-primary);pointer-events:none}.date-input-wrap .form-control{padding-left:35px;padding-right:10px;color-scheme:light}.date-input-wrap .form-control::-webkit-calendar-picker-indicator{opacity:.7;cursor:pointer;filter:none}.date-input-wrap .form-control:focus::-webkit-calendar-picker-indicator{opacity:1}.batches-form-footer{padding:14px 19px;display:flex;align-items:center;justify-content:flex-end;gap:8px;border-top:1px solid var(--admin-border)}.form-cancel-btn,.form-submit-btn{height:37px;padding:0 14px;border-radius:8px;font-size:10px;font-weight:800;cursor:pointer}.form-cancel-btn{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text)}.form-submit-btn{border:1px solid var(--admin-primary);background:var(--admin-primary);color:#fff}.form-submit-btn:disabled,.form-cancel-btn:disabled{opacity:.5;cursor:not-allowed}.details-content{padding:19px}.details-hero{padding:16px;display:flex;align-items:center;gap:12px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2);margin-bottom:15px}.details-avatar{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:#dcfce7;color:#15803d}.details-hero h3{margin:0 0 3px;color:var(--admin-text);font-size:15px}.details-hero span{color:var(--admin-muted);font-size:9px}.details-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.details-item{padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.details-item span{display:block;margin-bottom:4px;color:var(--admin-muted);font-size:8px}.details-item strong{display:block;color:var(--admin-text);font-size:11px;word-break:break-word}.details-notes{margin-top:10px;padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.details-notes span{display:block;margin-bottom:5px;color:var(--admin-muted);font-size:8px}.details-notes p{margin:0;color:var(--admin-text);font-size:10px;line-height:1.5;white-space:pre-wrap}.modal-loading{padding:35px;text-align:center;color:var(--admin-muted);font-size:11px}@media(max-width:1200px){.batches-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.batches-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:800px){.batches-header{align-items:flex-start;flex-direction:column;padding-bottom:18px}.batches-header-content{align-items:flex-start;flex-direction:column;gap:16px}.header-actions{width:100%;justify-content:flex-start;gap:8px}.header-actions .top-action-btn{flex:1}.header-actions .refresh-action-btn{flex:0 0 40px}.batches-toolbar{grid-template-columns:1fr}.form-grid.three{grid-template-columns:1fr}.batches-modal{max-height:94vh}.details-grid{grid-template-columns:1fr}}@media(max-width:600px){.farm-batches-page{min-height:auto}.batches-header h1{font-size:23px}.batches-stats{grid-template-columns:1fr}.batches-stat{padding:14px}.batches-pagination{align-items:flex-start;flex-direction:column}.batches-pagination-actions{width:100%;justify-content:flex-end}.batches-form{padding:15px}.form-grid{grid-template-columns:1fr}.form-group.full{grid-column:auto}.batches-modal-header{padding:15px}.batches-form-footer{padding:12px 15px}.details-content{padding:15px}}@media(max-width:560px){.header-actions{width:100%;flex-wrap:wrap}.header-actions .top-action-btn{flex:1 1 calc(33.333% - 6px)}.header-actions .refresh-action-btn{flex:0 0 40px}.header-actions .add-action-btn{flex:1 1 100%}}@media(max-width:420px){.header-actions{gap:6px}.header-actions .top-action-btn{font-size:10px;padding:0 8px}.header-actions .refresh-action-btn{flex:0 0 40px;padding:0}.batches-toolbar{padding:11px}.batches-table-header{padding:14px}.batches-table-header h2{font-size:13px}}`}</style>

      <div className="batches-header">
        <div className="batches-header-content">
          <div className="batches-header-text">
            <div className="batches-eyebrow">
              <Bird size={14} />
              FARM OS / BATCH MANAGEMENT
            </div>

            <h1>Batch Management</h1>

            <p>Manage bird batches, stock, gender counts, arrival details and batch lifecycle from one place.</p>
          </div>

          <div className="header-actions">
            <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={refreshing || loading} title="Refresh" aria-label="Refresh">
              <RefreshCw size={17} className={refreshing ? "spin-icon" : ""} />
            </button>

            <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} disabled={loading || !filteredBatches.length} title="Export Excel" aria-label="Export Excel">
              <FileSpreadsheet size={17} />
              <span>Excel</span>
            </button>

            <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPdf} disabled={loading || !filteredBatches.length} title="Export PDF" aria-label="Export PDF">
              <FileText size={17} />
              <span>PDF</span>
            </button>

            <button type="button" className="top-action-btn add-action-btn" onClick={openCreate} disabled={!selectedFarm} title="Add Batch" aria-label="Add Batch">
              <Plus size={18} />
              <span>Add Batch</span>
            </button>
          </div>
        </div>
      </div>

      <div className="batches-stats">
        <div className="batches-stat">
          <div className="batches-stat-icon green">
            <LayersIcon />
          </div>

          <div>
            <span className="batches-stat-label">Total Batches</span>
            <strong className="batches-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="batches-stat">
          <div className="batches-stat-icon blue">
            <CircleDot size={20} />
          </div>

          <div>
            <span className="batches-stat-label">Active Batches</span>
            <strong className="batches-stat-value">{stats.active}</strong>
          </div>
        </div>

        <div className="batches-stat">
          <div className="batches-stat-icon yellow">
            <Bird size={20} />
          </div>

          <div>
            <span className="batches-stat-label">Current Birds</span>
            <strong className="batches-stat-value">{stats.currentBirds.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="batches-stat">
          <div className="batches-stat-icon purple">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span className="batches-stat-label">Completed</span>
            <strong className="batches-stat-value">{stats.completed}</strong>
          </div>
        </div>
      </div>

      <div className="batches-toolbar">
        <div className="batches-search">
          <Search size={15} />

          <input
            className="batches-input"
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search batch, breed, shed..."
          />

          {search && (
            <button
              type="button"
              className="batches-search-clear"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              title="Clear search"
              aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <select className="batches-select" value={selectedFarm} onChange={(event) => setSelectedFarm(event.target.value)}>
          <option value="">Select Farm</option>

          {farms.map((farm) => (
            <option key={getId(farm)} value={getId(farm)}>
              {getName(farm) || farm.code || "Unnamed Farm"}
              {farm.code ? ` (${farm.code})` : ""}
            </option>
          ))}
        </select>

        <select
          className="batches-select"
          value={selectedShed}
          onChange={(event) => {
            setSelectedShed(event.target.value);
            setPage(1);
          }}
          disabled={!selectedFarm || loadingSheds}>
          <option value="">{loadingSheds ? "Loading sheds..." : "All Sheds"}</option>

          {sheds.map((shed) => (
            <option key={getId(shed)} value={getId(shed)}>
              {getName(shed) || shed.code || "Unnamed Shed"}
              {shed.code ? ` (${shed.code})` : ""}
            </option>
          ))}
        </select>

        <select
          className="batches-select"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="SOLD">Sold</option>
        </select>
      </div>

      <div className="batches-table-card">
        <div className="batches-table-header">
          <div>
            <h2>{currentFarmName} Batches</h2>

            <span>
              {filteredBatches.length} batch
              {filteredBatches.length !== 1 ? "es" : ""} found
            </span>
          </div>
        </div>

        {loading ? (
          <div className="batches-loading">
            <Loader2 size={17} className="spin-icon" />
            Loading batches...
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="batches-empty">
            <div className="batches-empty-icon">
              <Bird size={23} />
            </div>

            <strong>No batches found</strong>

            <span>{selectedFarm ? "Create your first batch or change the filters." : "Select a farm to view batches."}</span>

            {selectedFarm && (
              <button
                type="button"
                className="batches-primary-btn"
                onClick={openCreate}
                style={{
                  marginTop: "6px",
                  background: "var(--admin-primary)",
                  color: "#fff",
                }}>
                <Plus size={14} />
                Add Batch
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="batches-table-wrap">
              <table className="batches-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Farm / Shed</th>
                    <th>Birds</th>
                    <th>Gender</th>
                    <th>Breed</th>
                    <th>Arrival</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedBatches.map((batch) => (
                    <tr key={getId(batch)}>
                      <td>
                        <div className="batch-primary">
                          <div className="batch-avatar">
                            <Bird size={17} />
                          </div>

                          <div>
                            <strong>{batch.batchNumber || "Unnamed Batch"}</strong>

                            <span>{batch.batchName || batch.birdType || "Batch"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="batch-location">
                          <Warehouse size={14} />

                          <div>
                            <strong>{batch.shed?.name || batch.shed?.code || "Shed"}</strong>

                            <span>{batch.farm?.name || batch.farm?.code || "Farm"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="batch-birds">
                          <div className="batch-birds-icon">
                            <Bird size={14} />
                          </div>

                          <strong>{Number(batch.currentQuantity || 0).toLocaleString("en-IN")}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="batch-gender">
                          <span>M: {Number(batch.currentMaleCount || 0)}</span>

                          <span>F: {Number(batch.currentFemaleCount || 0)}</span>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong style={{ fontSize: "10px" }}>{batch.breed || "-"}</strong>

                          <span
                            style={{
                              display: "block",
                              marginTop: "3px",
                              color: "var(--admin-muted)",
                              fontSize: "8px",
                            }}>
                            {batch.birdType || "-"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="batch-date">{formatDate(batch.arrivalDate)}</div>
                      </td>

                      <td>
                        <span className={`batch-status ${getStatusClass(batch.status)}`}>
                          {String(batch.status || "UNKNOWN").toUpperCase() === "ACTIVE" ? <CircleDot size={10} /> : <CheckCircle2 size={10} />}

                          {String(batch.status || "UNKNOWN").toLowerCase()}
                        </span>
                      </td>

                      <td>
                        <div className="batch-actions">
                          <button type="button" className="batch-action-btn" onClick={() => openDetails(batch)} title="View batch" aria-label="View batch">
                            <Eye size={14} />
                          </button>

                          <button type="button" className="batch-action-btn" onClick={() => openEdit(batch)} title="Edit batch" aria-label="Edit batch">
                            <Pencil size={14} />
                          </button>

                          <button type="button" className="batch-action-btn danger" onClick={() => handleDelete(batch)} disabled={deletingId === getId(batch)} title="Delete batch" aria-label="Delete batch">
                            {deletingId === getId(batch) ? <Loader2 size={14} className="spin-icon" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="batches-pagination">
              <span className="batches-pagination-info">
                Showing {filteredBatches.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredBatches.length)} of {filteredBatches.length}
              </span>

              <div className="batches-pagination-actions">
                <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} title="Previous page" aria-label="Previous page">
                  <ChevronLeft size={14} />
                </button>

                <span className="pagination-page">{page}</span>

                <button type="button" className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} title="Next page" aria-label="Next page">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modal === "form" && (
        <div className="batches-overlay">
          <div className="batches-modal">
            <div className="batches-modal-header">
              <div>
                <h2>{selectedBatch ? "Edit Batch" : "Create New Batch"}</h2>

                <span>{selectedBatch ? "Update current batch information" : "Add a new bird batch to your farm"}</span>
              </div>

              <button type="button" className="modal-close" onClick={closeModal} disabled={saving} title="Close" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <form className="batches-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="form-section-title">
                  <Warehouse size={14} />
                  Farm & Shed
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Farm <em>*</em>
                    </label>

                    <select name="farm" className="form-control" value={form.farm} onChange={(event) => handleFarmChange(event.target.value)} disabled={Boolean(selectedBatch)}>
                      <option value="">Select farm</option>

                      {farms.map((farm) => (
                        <option key={getId(farm)} value={getId(farm)}>
                          {getName(farm) || farm.code || "Unnamed Farm"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Shed <em>*</em>
                    </label>

                    <select name="shed" className="form-control" value={form.shed} onChange={handleChange} disabled={Boolean(selectedBatch) || !form.farm || loadingSheds}>
                      <option value="">{loadingSheds ? "Loading sheds..." : "Select shed"}</option>

                      {sheds.map((shed) => {
                        const available = Number(shed.capacity || 0) - Number(shed.currentBirds || 0);

                        return (
                          <option key={getId(shed)} value={getId(shed)}>
                            {getName(shed) || shed.code || "Unnamed Shed"}
                            {shed.capacity !== undefined ? ` • Available: ${Math.max(0, available)}` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <Bird size={14} />
                  Batch Information
                </div>

                <div className="form-grid three">
                  <div className="form-group">
                    <label>
                      Batch Number <em>*</em>
                    </label>

                    <input className="form-control" name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="e.g. BATCH-001" disabled={Boolean(selectedBatch)} />
                  </div>

                  <div className="form-group">
                    <label>Batch Name</label>

                    <input className="form-control" name="batchName" value={form.batchName} onChange={handleChange} placeholder="Optional name" />
                  </div>

                  <div className="form-group">
                    <label>Bird Type</label>

                    <select className="form-control" name="birdType" value={form.birdType} onChange={handleChange}>
                      <option value="CHICKS">Chicks</option>
                      <option value="BIRDS">Birds</option>
                      <option value="LAYERS">Layers</option>
                      <option value="BREEDERS">Breeders</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Breed</label>

                    <input className="form-control" name="breed" value={form.breed} onChange={handleChange} placeholder="Kadaknath" />
                  </div>

                  <div className="form-group">
                    <label>
                      Arrival Date <em>*</em>
                    </label>

                    <div className="date-input-wrap">
                      <CalendarDays size={15} className="date-input-icon" />

                      <input type="date" className="form-control" name="arrivalDate" value={form.arrivalDate} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="SOLD">Sold</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <Users size={14} />
                  Bird Quantity & Gender
                </div>

                <div className="form-grid three">
                  <div className="form-group">
                    <label>
                      Initial Quantity <em>*</em>
                    </label>

                    <input type="number" min="1" className="form-control" name="initialQuantity" value={form.initialQuantity} onChange={handleChange} disabled={Boolean(selectedBatch)} />
                  </div>

                  <div className="form-group">
                    <label>Current Quantity</label>

                    <input type="number" min="0" className="form-control" name="currentQuantity" value={form.currentQuantity} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Initial Male</label>

                    <input type="number" min="0" className="form-control" name="initialMaleCount" value={form.initialMaleCount} onChange={handleChange} disabled={Boolean(selectedBatch)} />
                  </div>

                  <div className="form-group">
                    <label>Initial Female</label>

                    <input type="number" min="0" className="form-control" name="initialFemaleCount" value={form.initialFemaleCount} onChange={handleChange} disabled={Boolean(selectedBatch)} />
                  </div>

                  <div className="form-group">
                    <label>Current Male</label>

                    <input type="number" min="0" className="form-control" name="currentMaleCount" value={form.currentMaleCount} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Current Female</label>

                    <input type="number" min="0" className="form-control" name="currentFemaleCount" value={form.currentFemaleCount} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <Scale size={14} />
                  Growth Targets
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Expected Sale Age (Days)</label>

                    <input type="number" min="0" className="form-control" name="expectedSaleAgeDays" value={form.expectedSaleAgeDays} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Target Weight (Kg)</label>

                    <input type="number" min="0" step="0.01" className="form-control" name="targetWeightKg" value={form.targetWeightKg} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <UserRound size={14} />
                  Source
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Source Name</label>

                    <input className="form-control" name="sourceName" value={form.sourceName} onChange={handleChange} placeholder="Hatchery / supplier" />
                  </div>

                  <div className="form-group">
                    <label>Source Contact</label>

                    <input className="form-control" name="sourceContact" value={form.sourceContact} onChange={handleChange} placeholder="Phone / contact" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <Clock3 size={14} />
                  Notes
                </div>

                <div className="form-group">
                  <textarea className="form-control textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Additional batch notes..." />
                </div>
              </div>

              <div className="batches-form-footer">
                <button type="button" className="form-cancel-btn" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="form-submit-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2
                        size={13}
                        className="spin-icon"
                        style={{
                          display: "inline-block",
                          verticalAlign: "middle",
                          marginRight: "5px",
                        }}
                      />
                      Saving...
                    </>
                  ) : selectedBatch ? (
                    "Update Batch"
                  ) : (
                    "Create Batch"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "details" && selectedBatch && (
        <div className="batches-overlay">
          <div className="batches-modal details-modal">
            <div className="batches-modal-header">
              <div>
                <h2>Batch Details</h2>

                <span>Complete information for {selectedBatch.batchNumber || "batch"}</span>
              </div>

              <button type="button" className="modal-close" onClick={closeModal} title="Close" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="details-content">
              <div className="details-hero">
                <div className="details-avatar">
                  <Bird size={23} />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}>
                  <h3>{selectedBatch.batchNumber || "-"}</h3>

                  <span>{selectedBatch.batchName || selectedBatch.breed || "Kadaknath"}</span>
                </div>

                <span className={`batch-status ${getStatusClass(selectedBatch.status)}`}>{String(selectedBatch.status || "UNKNOWN").toLowerCase()}</span>
              </div>

              <div className="details-grid">
                <div className="details-item">
                  <span>Farm</span>
                  <strong>{selectedBatch.farm?.name || selectedBatch.farm?.code || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Shed</span>
                  <strong>{selectedBatch.shed?.name || selectedBatch.shed?.code || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Bird Type</span>
                  <strong>{selectedBatch.birdType || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Breed</span>
                  <strong>{selectedBatch.breed || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Initial Quantity</span>
                  <strong>{Number(selectedBatch.initialQuantity || 0).toLocaleString("en-IN")}</strong>
                </div>

                <div className="details-item">
                  <span>Current Quantity</span>
                  <strong>{Number(selectedBatch.currentQuantity || 0).toLocaleString("en-IN")}</strong>
                </div>

                <div className="details-item">
                  <span>Current Male</span>
                  <strong>{Number(selectedBatch.currentMaleCount || 0)}</strong>
                </div>

                <div className="details-item">
                  <span>Current Female</span>
                  <strong>{Number(selectedBatch.currentFemaleCount || 0)}</strong>
                </div>

                <div className="details-item">
                  <span>Arrival Date</span>
                  <strong>{formatDate(selectedBatch.arrivalDate)}</strong>
                </div>

                <div className="details-item">
                  <span>Expected Sale Age</span>
                  <strong>{selectedBatch.expectedSaleAgeDays ?? "-"} days</strong>
                </div>

                <div className="details-item">
                  <span>Target Weight</span>
                  <strong>{selectedBatch.targetWeightKg ?? "-"} Kg</strong>
                </div>

                <div className="details-item">
                  <span>Source</span>
                  <strong>{selectedBatch.source?.name || selectedBatch.source?.sourceName || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Source Contact</span>
                  <strong>{selectedBatch.source?.contact || selectedBatch.source?.phone || "-"}</strong>
                </div>
              </div>

              <div className="details-notes">
                <span>Notes</span>

                <p>{selectedBatch.notes || "No notes added."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 2 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </svg>
);

export default Batches;
