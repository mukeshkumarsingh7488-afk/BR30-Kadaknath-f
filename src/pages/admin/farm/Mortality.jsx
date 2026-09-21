import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Filter, Loader2, Pencil, Plus, RefreshCw, Search, Skull, Trash2, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showError, showSuccess, showConfirm } from "../../../utils/sweetAlert";

const initialForm = {
  farm: "",
  shed: "",
  batch: "",
  date: new Date().toISOString().slice(0, 10),
  quantity: "",
  cause: "UNKNOWN",
  causeDetails: "",
  ageInDays: "",
  maleCount: "0",
  femaleCount: "0",
  disposed: false,
  disposalMethod: "",
  disposalDate: "",
  notes: "",
};

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

const getId = (item) => item?._id || item?.id || "";

const getName = (item) => item?.name || item?.batchName || item?.batchNumber || item?.title || item?.code || "";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

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

const formatDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const getCauseLabel = (cause) => {
  const labels = {
    DISEASE: "Disease",
    WEAKNESS: "Weakness",
    INJURY: "Injury",
    PREDATOR: "Predator",
    WEATHER: "Weather",
    UNKNOWN: "Unknown",
    OTHER: "Other",
  };

  return labels[cause] || cause || "Unknown";
};

const getStatusClass = (disposed) => (disposed ? "mortality-status disposed" : "mortality-status pending");

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.data?.message || error?.message || fallback;

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function Mortality() {
  const [mortalities, setMortalities] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedShed, setSelectedShed] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [causeFilter, setCauseFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");
      const list = getArray(response, ["farms", "data"]);

      setFarms(list);
    } catch (err) {
      setFarms([]);
      showError(getErrorMessage(err, "Failed to load farms"));
    }
  };

  const loadSheds = async (farmId) => {
    if (!farmId) {
      setSheds([]);
      return;
    }

    try {
      setLoadingOptions(true);

      const response = await apiRequest(`/sheds?farm=${farmId}`);
      const list = getArray(response, ["sheds", "data"]);

      setSheds(list);
    } catch (err) {
      setSheds([]);
      showError(getErrorMessage(err, "Failed to load sheds"));
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadBatches = async (farmId, shedId = "") => {
    if (!farmId) {
      setBatches([]);
      return;
    }

    try {
      setLoadingOptions(true);

      let url = `/batches?farm=${farmId}`;

      if (shedId) {
        url += `&shed=${shedId}`;
      }

      const response = await apiRequest(url);
      const list = getArray(response, ["batches", "data"]);

      setBatches(list);
    } catch (err) {
      setBatches([]);
      showError(getErrorMessage(err, "Failed to load batches"));
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadMortalities = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (selectedFarm) {
        params.set("farm", selectedFarm);
      }

      if (selectedShed) {
        params.set("shed", selectedShed);
      }

      if (selectedBatch) {
        params.set("batch", selectedBatch);
      }

      if (causeFilter) {
        params.set("cause", causeFilter);
      }

      if (fromDate) {
        params.set("from", fromDate);
      }

      if (toDate) {
        params.set("to", toDate);
      }

      const query = params.toString();

      const response = await apiRequest(`/mortalities${query ? `?${query}` : ""}`);

      const list = getArray(response, ["mortalities", "data"]);

      setMortalities(list);
    } catch (err) {
      setMortalities([]);
      setError(getErrorMessage(err, "Failed to load mortality records"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (!selectedFarm) {
      setSheds([]);
      setBatches([]);
      setSelectedShed("");
      setSelectedBatch("");
      return;
    }

    loadSheds(selectedFarm);
    loadBatches(selectedFarm);
  }, [selectedFarm]);

  useEffect(() => {
    if (!selectedFarm) return;

    loadBatches(selectedFarm, selectedShed);
  }, [selectedShed]);

  useEffect(() => {
    loadMortalities();
  }, [selectedFarm, selectedShed, selectedBatch, causeFilter, fromDate, toDate]);

  const filteredMortalities = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return mortalities;
    }

    return mortalities.filter((item) => {
      const searchable = [item?.farm?.name, item?.farm?.code, item?.shed?.name, item?.shed?.code, item?.batch?.batchNumber, item?.batch?.batchName, item?.batch?.breed, item?.cause, item?.causeDetails, item?.notes].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(term);
    });
  }, [mortalities, search]);

  const summary = useMemo(() => {
    return filteredMortalities.reduce(
      (acc, item) => {
        acc.records += 1;
        acc.total += Number(item?.quantity || 0);
        acc.male += Number(item?.maleCount || 0);
        acc.female += Number(item?.femaleCount || 0);
        acc.disposed += item?.disposed ? Number(item?.quantity || 0) : 0;

        return acc;
      },
      {
        records: 0,
        total: 0,
        male: 0,
        female: 0,
        disposed: 0,
      }
    );
  }, [filteredMortalities]);

  const totalPages = Math.max(1, Math.ceil(filteredMortalities.length / pageSize));

  const visibleMortalities = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredMortalities.slice(start, start + pageSize);
  }, [filteredMortalities, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedFarm, selectedShed, selectedBatch, causeFilter, fromDate, toDate]);

  const handleFarmChange = (value) => {
    setSelectedFarm(value);
    setSelectedShed("");
    setSelectedBatch("");
  };

  const handleShedChange = (value) => {
    setSelectedShed(value);
    setSelectedBatch("");
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculatedQuantity = Number(form.quantity || 0);
  const calculatedMale = Number(form.maleCount || 0);
  const calculatedFemale = Number(form.femaleCount || 0);

  const openCreateModal = () => {
    setSelectedRecord(null);

    setForm({
      ...initialForm,
      farm: selectedFarm || "",
      shed: selectedShed || "",
      batch: selectedBatch || "",
      date: new Date().toISOString().slice(0, 10),
    });

    setModal("form");
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);

    setForm({
      farm: getId(record?.farm),
      shed: getId(record?.shed),
      batch: getId(record?.batch),
      date: formatDateInput(record?.date),
      quantity: String(record?.quantity ?? ""),
      cause: record?.cause || "UNKNOWN",
      causeDetails: record?.causeDetails || "",
      ageInDays: record?.ageInDays === null || record?.ageInDays === undefined ? "" : String(record.ageInDays),
      maleCount: String(record?.maleCount ?? 0),
      femaleCount: String(record?.femaleCount ?? 0),
      disposed: Boolean(record?.disposed),
      disposalMethod: record?.disposalMethod || "",
      disposalDate: formatDateInput(record?.disposalDate),
      notes: record?.notes || "",
    });

    setModal("form");
  };

  const openViewModal = async (record) => {
    try {
      setSelectedRecord(record);
      setModal("view");

      const response = await apiRequest(`/mortalities/${getId(record)}`);

      if (response?.mortality) {
        setSelectedRecord(response.mortality);
      } else if (response?.data?.mortality) {
        setSelectedRecord(response.data.mortality);
      }
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load mortality details"));
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setModal(null);
    setSelectedRecord(null);
  };

  const handleRefresh = async () => {
    await Promise.all([loadFarms(), loadMortalities()]);

    if (selectedFarm) {
      await Promise.all([loadSheds(selectedFarm), loadBatches(selectedFarm, selectedShed)]);
    }
  };

  const exportExcel = () => {
    try {
      const headers = ["Date", "Farm", "Shed", "Batch", "Breed", "Cause", "Cause Details", "Total Mortality", "Male", "Female", "Age (Days)", "Disposal Status", "Disposal Method", "Disposal Date", "Reported By", "Notes"];

      const rows = filteredMortalities.map((item) => [
        formatDate(item?.date),
        item?.farm?.name || item?.farm?.code || "",
        item?.shed?.name || item?.shed?.code || "",
        item?.batch?.batchNumber || item?.batch?.batchName || "",
        item?.batch?.breed || "",
        getCauseLabel(item?.cause),
        item?.causeDetails || "",
        item?.quantity || 0,
        item?.maleCount || 0,
        item?.femaleCount || 0,
        item?.ageInDays ?? "",
        item?.disposed ? "Disposed" : "Pending",
        item?.disposalMethod || "",
        formatDate(item?.disposalDate),
        item?.reportedBy?.name || item?.reportedBy?.email || "",
        item?.notes || "",
      ]);

      const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\r\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `mortality-${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      showSuccess("Mortality Excel file exported successfully");
    } catch (err) {
      showError("Failed to export Excel file");
    }
  };

  const exportPDF = () => {
    try {
      const printWindow = window.open("", "_blank", "width=1200,height=800");

      if (!printWindow) {
        showError("Please allow popups to export PDF");
        return;
      }

      const rows = filteredMortalities
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(formatDate(item?.date))}</td>
              <td>${escapeHtml(item?.farm?.name || item?.farm?.code || "-")}</td>
              <td>${escapeHtml(item?.shed?.name || item?.shed?.code || "-")}</td>
              <td>${escapeHtml(item?.batch?.batchNumber || item?.batch?.batchName || "-")}</td>
              <td>${escapeHtml(getCauseLabel(item?.cause))}</td>
              <td>${escapeHtml(item?.quantity || 0)}</td>
              <td>${escapeHtml(item?.maleCount || 0)}</td>
              <td>${escapeHtml(item?.femaleCount || 0)}</td>
              <td>${escapeHtml(item?.disposed ? "Disposed" : "Pending")}</td>
            </tr>
          `
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mortality Report</title>
            <meta charset="UTF-8" />
            <style>
              *{box-sizing:border-box}
              body{font-family:Arial,sans-serif;padding:28px;color:#172033}
              h1{margin:0 0 6px;font-size:24px}
              p{margin:0 0 20px;color:#64748b;font-size:13px}
              .summary{display:flex;gap:10px;margin-bottom:20px}
              .summary-box{border:1px solid #e2e8f0;padding:10px 14px;border-radius:8px}
              .summary-label{font-size:10px;color:#64748b}
              .summary-value{font-size:18px;font-weight:700;margin-top:3px}
              table{width:100%;border-collapse:collapse;font-size:10px}
              th{background:#f1f5f9;text-align:left;font-weight:700}
              th,td{border:1px solid #cbd5e1;padding:7px 6px}
              .footer{margin-top:20px;font-size:10px;color:#64748b}
              @media print{body{padding:10px}}
            </style>
          </head>
          <body>
            <h1>Mortality Report</h1>
            <p>BR30 Kadaknath Farms — Generated on ${escapeHtml(new Date().toLocaleString("en-IN"))}</p>

            <div class="summary">
              <div class="summary-box">
                <div class="summary-label">Records</div>
                <div class="summary-value">${escapeHtml(summary.records)}</div>
              </div>
              <div class="summary-box">
                <div class="summary-label">Total Mortality</div>
                <div class="summary-value">${escapeHtml(summary.total)}</div>
              </div>
              <div class="summary-box">
                <div class="summary-label">Male Loss</div>
                <div class="summary-value">${escapeHtml(summary.male)}</div>
              </div>
              <div class="summary-box">
                <div class="summary-label">Female Loss</div>
                <div class="summary-value">${escapeHtml(summary.female)}</div>
              </div>
              <div class="summary-box">
                <div class="summary-label">Disposed Birds</div>
                <div class="summary-value">${escapeHtml(summary.disposed)}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farm</th>
                  <th>Shed</th>
                  <th>Batch</th>
                  <th>Cause</th>
                  <th>Total</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Disposal</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="9">No records found</td></tr>`}
              </tbody>
            </table>

            <div class="footer">
              Total filtered records: ${escapeHtml(filteredMortalities.length)}
            </div>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (err) {
      showError("Failed to generate PDF report");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.farm || !form.shed || !form.batch) {
      showError("Farm, shed and batch are required");
      return;
    }

    if (!form.date) {
      showError("Mortality date is required");
      return;
    }

    const quantity = Number(form.quantity);
    const maleCount = Number(form.maleCount || 0);
    const femaleCount = Number(form.femaleCount || 0);

    if (!Number.isFinite(quantity) || quantity < 1) {
      showError("Mortality quantity must be at least 1");
      return;
    }

    if (maleCount < 0 || femaleCount < 0) {
      showError("Male and female mortality cannot be negative");
      return;
    }

    if (maleCount + femaleCount > quantity) {
      showError("Male + female mortality cannot exceed total mortality");
      return;
    }

    if (form.disposed && form.disposalMethod && !form.disposalDate) {
      showError("Disposal date is required when disposal method is provided");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        date: form.date,
        quantity,
        cause: form.cause || "UNKNOWN",
        causeDetails: form.causeDetails.trim(),
        ageInDays: form.ageInDays === "" ? null : Number(form.ageInDays),
        maleCount,
        femaleCount,
        disposed: Boolean(form.disposed),
        disposalMethod: form.disposalMethod || null,
        disposalDate: form.disposalDate || null,
        notes: form.notes.trim(),
      };

      if (!selectedRecord) {
        payload.farm = form.farm;
        payload.shed = form.shed;
        payload.batch = form.batch;

        await apiRequest("/mortalities", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess("Mortality recorded successfully");
      } else {
        await apiRequest(`/mortalities/${getId(selectedRecord)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showSuccess("Mortality updated successfully");
      }

      closeModal();
      await loadMortalities();
    } catch (err) {
      const message = err?.response?.data?.message || err?.data?.message || getErrorMessage(err, "Failed to save mortality record");

      if (err?.response?.data?.dependentRecords || err?.data?.dependentRecords) {
        const dependencies = err?.response?.data?.dependentRecords || err?.data?.dependentRecords || [];

        const dependencyText = dependencies.map((item) => `${item.module}: ${item.count}`).join(", ");

        showError(`${message}. ${dependencyText}`);
      } else {
        showError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    const result = await showConfirm({
      title: "Delete Mortality Record?",
      text: `Delete mortality record of ${record?.quantity || 0} birds? This action will restore the bird stock if no dependent farm records exist.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(`/mortalities/${getId(record)}`, {
        method: "DELETE",
      });

      showSuccess("Mortality deleted successfully");

      await loadMortalities();
    } catch (err) {
      const responseData = err?.response?.data || err?.data || {};

      let message = responseData?.message || getErrorMessage(err, "Failed to delete mortality");

      if (Array.isArray(responseData?.dependentRecords)) {
        const dependencyText = responseData.dependentRecords.map((item) => `${item.module}: ${item.count}`).join(", ");

        message = `${message}. ${dependencyText}`;
      }

      showError(message);
    }
  };

  const resetFilters = () => {
    setSelectedFarm("");
    setSelectedShed("");
    setSelectedBatch("");
    setCauseFilter("");
    setFromDate("");
    setToDate("");
    setSearch("");
    setPage(1);
  };

  const getBatchCurrentStock = () => {
    const selectedBatchData = batches.find((item) => getId(item) === form.batch);

    if (!selectedBatchData) return null;

    return Number(selectedBatchData.currentQuantity ?? selectedBatchData.currentBirds ?? 0);
  };

  return (
    <div className="mortality-page">
      <style>{`
.mortality-date-filter-actions{grid-column:1/-1;display:flex;align-items:center;justify-content:flex-end;margin-top:2px}.mortality-date-reset-btn{height:40px;padding:0 14px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.mortality-date-reset-btn:hover{background:var(--admin-surface-2);color:var(--admin-text);border-color:var(--admin-border)}.mortality-date-reset-btn:active{transform:translateY(1px)}.mortality-page{min-height:100%;background:var(--admin-bg);color:var(--admin-text);padding:24px}.mortality-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.mortality-header-left{min-width:0}.mortality-eyebrow{display:flex;align-items:center;gap:8px;color:var(--admin-primary);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}.mortality-header h1{margin:0;font-size:28px;line-height:1.2;font-weight:800}.mortality-header p{margin:8px 0 0;color:var(--admin-muted);font-size:14px;line-height:1.6}.mortality-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;flex-shrink:0}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.mortality-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:20px}.mortality-stat{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:17px;display:flex;align-items:center;gap:13px;box-shadow:0 5px 18px rgba(0,0,0,.04)}.mortality-stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--admin-primary-soft);color:var(--admin-primary);flex-shrink:0}.mortality-stat-icon.red{background:rgba(239,68,68,.11);color:#ef4444}.mortality-stat-icon.orange{background:rgba(249,115,22,.11);color:#f97316}.mortality-stat-icon.blue{background:rgba(59,130,246,.11);color:#3b82f6}.mortality-stat-icon.green{background:rgba(34,197,94,.11);color:#22c55e}.mortality-stat-label{font-size:12px;color:var(--admin-muted);font-weight:600;margin-bottom:4px}.mortality-stat-value{font-size:22px;font-weight:800;line-height:1.1}.mortality-toolbar{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px;margin-bottom:18px}.mortality-toolbar-top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}.mortality-search{position:relative;flex:1;max-width:360px}.mortality-search>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--admin-muted);pointer-events:none}.mortality-search input{width:100%;height:40px;box-sizing:border-box;padding:0 40px 0 38px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);outline:none;font-size:13px}.mortality-search-clear{position:absolute;right:7px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.mortality-search-clear:hover{background:var(--admin-surface-2);color:var(--admin-text)}.mortality-filter-label{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--admin-muted)}.mortality-filters{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.mortality-field{display:flex;flex-direction:column;gap:6px;min-width:0}.mortality-field label{font-size:11px;font-weight:700;color:var(--admin-muted)}.mortality-field input,.mortality-field select,.mortality-field textarea{width:100%;box-sizing:border-box;height:40px;padding:0 11px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);outline:none;font-size:13px;cursor:pointer;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease,color .2s ease}.mortality-field select{appearance:auto}.mortality-field select:disabled{opacity:.6;cursor:not-allowed}.mortality-field textarea{height:90px;padding:10px 11px;resize:vertical;cursor:text}.mortality-field input[type=number]{cursor:text}.mortality-field input[type=date],.mortality-filters input[type=date]{color-scheme:light dark}.mortality-field input[type=date]::-webkit-calendar-picker-indicator,.mortality-filters input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .mortality-field input[type=date]::-webkit-calendar-picker-indicator,.admin-theme-light .mortality-filters input[type=date]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.mortality-field input:focus,.mortality-field select:focus,.mortality-field textarea:focus,.mortality-search input:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px rgba(34,197,94,.08)}.mortality-table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden}.mortality-table-header{padding:16px 18px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:12px}.mortality-table-header h2{margin:0;font-size:16px}.mortality-table-header span{font-size:12px;color:var(--admin-muted)}.mortality-table-wrap{width:100%;overflow-x:auto}.mortality-table{width:100%;border-collapse:collapse;min-width:1100px}.mortality-table th{padding:12px 14px;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}.mortality-table td{padding:13px 14px;border-top:1px solid var(--admin-border);font-size:13px;vertical-align:middle;white-space:nowrap}.mortality-table tbody tr:hover{background:var(--admin-surface-2)}.mortality-primary-text{font-weight:750}.mortality-secondary-text{font-size:11px;color:var(--admin-muted);margin-top:3px}.mortality-number{font-weight:800}.mortality-status{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;font-size:11px;font-weight:750}.mortality-status.disposed{background:rgba(34,197,94,.11);color:#16a34a}.mortality-status.pending{background:rgba(245,158,11,.12);color:#d97706}.mortality-actions{display:flex;align-items:center;gap:6px}.mortality-btn{height:38px;border:1px solid var(--admin-border);border-radius:9px;padding:0 13px;background:var(--admin-surface);color:var(--admin-text);display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:12px;font-weight:700;cursor:pointer;transition:.2s}.mortality-btn:hover{border-color:var(--admin-primary);color:var(--admin-primary);transform:translateY(-1px)}.mortality-btn.primary{background:var(--admin-primary);border-color:var(--admin-primary);color:#fff}.mortality-btn.primary:hover{color:#fff;filter:brightness(.96)}.mortality-btn.danger{color:var(--admin-danger)}.mortality-btn.icon-only{width:38px;padding:0}.mortality-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.mortality-empty{padding:60px 20px;text-align:center}.mortality-empty-icon{width:54px;height:54px;border-radius:14px;background:var(--admin-primary-soft);color:var(--admin-primary);display:flex;align-items:center;justify-content:center;margin:0 auto 13px}.mortality-empty h3{margin:0 0 6px;font-size:16px}.mortality-empty p{margin:0;color:var(--admin-muted);font-size:13px}.mortality-loading{padding:55px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--admin-muted);font-size:13px}.mortality-error{margin:0 18px 18px;padding:13px 14px;border-radius:10px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.2);color:#dc2626;font-size:13px;display:flex;align-items:center;gap:8px}.mortality-pagination{padding:13px 16px;border-top:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:12px}.mortality-pagination-info{font-size:12px;color:var(--admin-muted)}.mortality-pagination-actions{display:flex;gap:7px}.mortality-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.mortality-modal{width:min(760px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 25px 70px rgba(0,0,0,.25)}.mortality-modal.small{width:min(620px,100%)}.mortality-modal-header{padding:18px 20px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:12px}.mortality-modal-header h2{margin:0;font-size:18px}.mortality-modal-header p{margin:4px 0 0;color:var(--admin-muted);font-size:12px}.mortality-close{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.mortality-form{padding:20px}.mortality-form-section{margin-bottom:20px}.mortality-form-section:last-child{margin-bottom:0}.mortality-form-section-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--admin-primary);margin-bottom:11px}.mortality-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.mortality-form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.mortality-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.mortality-field.full{grid-column:1/-1}.mortality-readonly{background:var(--admin-surface-2)!important}.mortality-checkbox{display:flex;align-items:center;gap:9px;min-height:40px;padding:0 2px}.mortality-checkbox input{width:17px;height:17px;accent-color:var(--admin-primary);cursor:pointer}.mortality-checkbox label{margin:0;color:var(--admin-text);font-size:13px;font-weight:650}.mortality-stock-hint{padding:10px 12px;border-radius:9px;background:var(--admin-primary-soft);color:var(--admin-primary);font-size:12px;font-weight:700}.mortality-modal-footer{padding:15px 20px;border-top:1px solid var(--admin-border);display:flex;justify-content:flex-end;gap:9px}.mortality-view-grid{padding:20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mortality-view-item{padding:13px;border:1px solid var(--admin-border);border-radius:11px;background:var(--admin-bg)}.mortality-view-label{font-size:11px;color:var(--admin-muted);margin-bottom:5px}.mortality-view-value{font-size:14px;font-weight:750;word-break:break-word}.mortality-view-full{grid-column:1/-1}.mortality-view-footer{padding:15px 20px;border-top:1px solid var(--admin-border);display:flex;justify-content:flex-end}.mortality-spinner{animation:mortality-spin 1s linear infinite}@keyframes mortality-spin{to{transform:rotate(360deg)}}@media(max-width:1200px){.mortality-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.mortality-filters{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.mortality-page{padding:17px}.mortality-header{flex-direction:column}.mortality-header-actions{width:100%;display:grid;grid-template-columns:40px repeat(2,minmax(0,1fr)) minmax(0,1.25fr);gap:6px}.mortality-header-actions .top-action-btn{min-width:0;padding:0 8px;font-size:11px}.mortality-header-actions .refresh-action-btn{width:40px}.mortality-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.mortality-toolbar-top{align-items:stretch;flex-direction:column}.mortality-search{max-width:none}.mortality-filter-label{margin-top:2px}.mortality-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.mortality-date-filter-actions{grid-column:1/-1;justify-content:flex-end}.mortality-form-grid,.mortality-form-grid.three,.mortality-form-grid.four{grid-template-columns:1fr}.mortality-view-grid{grid-template-columns:1fr}.mortality-view-full{grid-column:auto}}@media(max-width:520px){.mortality-page{padding:12px}.mortality-header h1{font-size:23px}.mortality-summary{grid-template-columns:1fr}.mortality-filters{grid-template-columns:1fr}.mortality-date-filter-actions{grid-column:auto;justify-content:flex-end}.mortality-pagination{align-items:flex-start;flex-direction:column}.mortality-pagination-actions{width:100%}.mortality-pagination-actions .mortality-btn{flex:1}.mortality-modal-overlay{padding:10px}.mortality-modal{max-height:calc(100vh - 20px)}.mortality-form,.mortality-view-grid{padding:15px}.mortality-modal-footer,.mortality-view-footer{padding:12px 15px}}
`}</style>

      <div className="mortality-header">
        <div className="mortality-header-left">
          <div className="mortality-eyebrow">
            <Skull size={15} />
            Farm OS / Mortality
          </div>

          <h1>Mortality</h1>

          <p>Track bird mortality, causes, male/female losses and disposal records across farm batches.</p>
        </div>

        <div className="mortality-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" title="Refresh" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={17} className={loading ? "mortality-spinner" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={16} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={16} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreateModal}>
            <Plus size={17} />
            Add Mortality
          </button>
        </div>
      </div>

      <div className="mortality-summary">
        <div className="mortality-stat">
          <div className="mortality-stat-icon">
            <Activity size={20} />
          </div>

          <div>
            <div className="mortality-stat-label">Records</div>
            <div className="mortality-stat-value">{formatNumber(summary.records)}</div>
          </div>
        </div>

        <div className="mortality-stat">
          <div className="mortality-stat-icon red">
            <Skull size={20} />
          </div>

          <div>
            <div className="mortality-stat-label">Total Mortality</div>
            <div className="mortality-stat-value">{formatNumber(summary.total)}</div>
          </div>
        </div>

        <div className="mortality-stat">
          <div className="mortality-stat-icon blue">
            <Activity size={20} />
          </div>

          <div>
            <div className="mortality-stat-label">Male Loss</div>
            <div className="mortality-stat-value">{formatNumber(summary.male)}</div>
          </div>
        </div>

        <div className="mortality-stat">
          <div className="mortality-stat-icon orange">
            <Activity size={20} />
          </div>

          <div>
            <div className="mortality-stat-label">Female Loss</div>
            <div className="mortality-stat-value">{formatNumber(summary.female)}</div>
          </div>
        </div>

        <div className="mortality-stat">
          <div className="mortality-stat-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <div className="mortality-stat-label">Disposed Birds</div>
            <div className="mortality-stat-value">{formatNumber(summary.disposed)}</div>
          </div>
        </div>
      </div>

      <div className="mortality-toolbar">
        <div className="mortality-toolbar-top">
          <div className="mortality-search">
            <Search size={16} />

            <input type="text" placeholder="Search batch, shed, breed, cause..." value={search} onChange={(event) => setSearch(event.target.value)} />

            {search && (
              <button type="button" className="mortality-search-clear" onClick={() => setSearch("")} title="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="mortality-filter-label">
            <Filter size={15} />
            Filters
          </div>
        </div>

        <div className="mortality-filters">
          <div className="mortality-field">
            <label>Farm</label>

            <select value={selectedFarm} onChange={(event) => handleFarmChange(event.target.value)}>
              <option value="">All Farms</option>

              {farms.map((farm) => (
                <option key={getId(farm)} value={getId(farm)}>
                  {farm.name || farm.code || "Farm"}
                </option>
              ))}
            </select>
          </div>

          <div className="mortality-field">
            <label>Shed</label>

            <select value={selectedShed} onChange={(event) => handleShedChange(event.target.value)} disabled={!selectedFarm || loadingOptions}>
              <option value="">All Sheds</option>

              {sheds.map((shed) => (
                <option key={getId(shed)} value={getId(shed)}>
                  {shed.name || shed.code || "Shed"}
                </option>
              ))}
            </select>
          </div>

          <div className="mortality-field">
            <label>Batch</label>

            <select value={selectedBatch} onChange={(event) => setSelectedBatch(event.target.value)} disabled={!selectedFarm || loadingOptions}>
              <option value="">All Batches</option>

              {batches.map((batch) => (
                <option key={getId(batch)} value={getId(batch)}>
                  {batch.batchNumber || batch.batchName || "Batch"}
                </option>
              ))}
            </select>
          </div>

          <div className="mortality-field">
            <label>Cause</label>

            <select value={causeFilter} onChange={(event) => setCauseFilter(event.target.value)}>
              <option value="">All Causes</option>
              <option value="DISEASE">Disease</option>
              <option value="WEAKNESS">Weakness</option>
              <option value="INJURY">Injury</option>
              <option value="PREDATOR">Predator</option>
              <option value="WEATHER">Weather</option>
              <option value="UNKNOWN">Unknown</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="mortality-field">
            <label>From Date</label>

            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>

          <div className="mortality-field">
            <label>To Date</label>

            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>

          {(selectedFarm || selectedShed || selectedBatch || causeFilter || fromDate || toDate) && (
            <div className="mortality-date-filter-actions">
              <button type="button" className="mortality-date-reset-btn" onClick={resetFilters} title="Reset Filters">
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mortality-table-card">
        <div className="mortality-table-header">
          <div>
            <h2>Mortality Records</h2>

            <span>
              {filteredMortalities.length} record
              {filteredMortalities.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {error && (
          <div className="mortality-error">
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="mortality-loading">
            <Loader2 size={19} className="mortality-spinner" />
            Loading mortality records...
          </div>
        ) : visibleMortalities.length === 0 ? (
          <div className="mortality-empty">
            <div className="mortality-empty-icon">
              <Skull size={24} />
            </div>

            <h3>No mortality records found</h3>

            <p>No records match the current filters. Add a mortality record to start tracking losses.</p>
          </div>
        ) : (
          <>
            <div className="mortality-table-wrap">
              <table className="mortality-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Shed</th>
                    <th>Cause</th>
                    <th>Total</th>
                    <th>Male</th>
                    <th>Female</th>
                    <th>Age</th>
                    <th>Disposal</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleMortalities.map((item) => (
                    <tr key={getId(item)}>
                      <td>
                        <div className="mortality-primary-text">{formatDate(item.date)}</div>
                      </td>

                      <td>
                        <div className="mortality-primary-text">{item?.batch?.batchNumber || "-"}</div>

                        {item?.batch?.batchName && <div className="mortality-secondary-text">{item.batch.batchName}</div>}
                      </td>

                      <td>
                        <div className="mortality-primary-text">{item?.shed?.name || item?.shed?.code || "-"}</div>

                        {item?.shed?.code && <div className="mortality-secondary-text">{item.shed.code}</div>}
                      </td>

                      <td>
                        <div className="mortality-primary-text">{getCauseLabel(item.cause)}</div>

                        {item.causeDetails && <div className="mortality-secondary-text">{item.causeDetails}</div>}
                      </td>

                      <td>
                        <span className="mortality-number">{formatNumber(item.quantity)}</span>
                      </td>

                      <td>
                        <span className="mortality-number">{formatNumber(item.maleCount)}</span>
                      </td>

                      <td>
                        <span className="mortality-number">{formatNumber(item.femaleCount)}</span>
                      </td>

                      <td>{item.ageInDays === null || item.ageInDays === undefined ? "-" : `${item.ageInDays} days`}</td>

                      <td>
                        <span className={getStatusClass(item.disposed)}>
                          {item.disposed ? (
                            <>
                              <CheckCircle2 size={12} />
                              Disposed
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} />
                              Pending
                            </>
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="mortality-actions">
                          <button type="button" className="mortality-btn icon-only" title="View" onClick={() => openViewModal(item)}>
                            <Eye size={15} />
                          </button>

                          <button type="button" className="mortality-btn icon-only" title="Edit" onClick={() => openEditModal(item)}>
                            <Pencil size={15} />
                          </button>

                          <button type="button" className="mortality-btn icon-only danger" title="Delete" onClick={() => handleDelete(item)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mortality-pagination">
              <div className="mortality-pagination-info">
                Showing {filteredMortalities.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, filteredMortalities.length)} of {filteredMortalities.length}
              </div>

              <div className="mortality-pagination-actions">
                <button type="button" className="mortality-btn icon-only" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                  <ChevronLeft size={16} />
                </button>

                <button type="button" className="mortality-btn" disabled>
                  Page {page} / {totalPages}
                </button>

                <button type="button" className="mortality-btn icon-only" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(current + 1, totalPages))}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modal === "form" && (
        <div className="mortality-modal-overlay">
          <div className="mortality-modal">
            <div className="mortality-modal-header">
              <div>
                <h2>{selectedRecord ? "Edit Mortality" : "Add Mortality"}</h2>

                <p>{selectedRecord ? "Update the mortality record and stock impact." : "Record bird mortality for a farm batch."}</p>
              </div>

              <button type="button" className="mortality-close" onClick={closeModal} disabled={submitting}>
                <X size={18} />
              </button>
            </div>

            <form className="mortality-form" onSubmit={handleSubmit}>
              <div className="mortality-form-section">
                <div className="mortality-form-section-title">Farm & Batch</div>

                <div className="mortality-form-grid three">
                  <div className="mortality-field">
                    <label>Farm *</label>

                    <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} disabled={Boolean(selectedRecord)} className={selectedRecord ? "mortality-readonly" : ""}>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={getId(farm)} value={getId(farm)}>
                          {farm.name || farm.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mortality-field">
                    <label>Shed *</label>

                    <select value={form.shed} onChange={(event) => handleFormChange("shed", event.target.value)} disabled={Boolean(selectedRecord) || !form.farm || loadingOptions} className={selectedRecord ? "mortality-readonly" : ""}>
                      <option value="">Select Shed</option>

                      {sheds.map((shed) => (
                        <option key={getId(shed)} value={getId(shed)}>
                          {shed.name || shed.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mortality-field">
                    <label>Batch *</label>

                    <select value={form.batch} onChange={(event) => handleFormChange("batch", event.target.value)} disabled={Boolean(selectedRecord) || !form.farm || loadingOptions} className={selectedRecord ? "mortality-readonly" : ""}>
                      <option value="">Select Batch</option>

                      {batches.map((batch) => (
                        <option key={getId(batch)} value={getId(batch)}>
                          {batch.batchNumber || batch.batchName || "Batch"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.batch && getBatchCurrentStock() !== null && (
                  <div style={{ marginTop: 12 }}>
                    <div className="mortality-stock-hint">Current selected batch stock: {formatNumber(getBatchCurrentStock())} birds</div>
                  </div>
                )}
              </div>

              <div className="mortality-form-section">
                <div className="mortality-form-section-title">Mortality Details</div>

                <div className="mortality-form-grid four">
                  <div className="mortality-field">
                    <label>Date *</label>

                    <input type="date" value={form.date} onChange={(event) => handleFormChange("date", event.target.value)} required />
                  </div>

                  <div className="mortality-field">
                    <label>Quantity *</label>

                    <input type="number" min="1" value={form.quantity} onChange={(event) => handleFormChange("quantity", event.target.value)} placeholder="0" required />
                  </div>

                  <div className="mortality-field">
                    <label>Male</label>

                    <input type="number" min="0" value={form.maleCount} onChange={(event) => handleFormChange("maleCount", event.target.value)} />
                  </div>

                  <div className="mortality-field">
                    <label>Female</label>

                    <input type="number" min="0" value={form.femaleCount} onChange={(event) => handleFormChange("femaleCount", event.target.value)} />
                  </div>

                  <div className="mortality-field">
                    <label>Cause</label>

                    <select value={form.cause} onChange={(event) => handleFormChange("cause", event.target.value)}>
                      <option value="DISEASE">Disease</option>
                      <option value="WEAKNESS">Weakness</option>
                      <option value="INJURY">Injury</option>
                      <option value="PREDATOR">Predator</option>
                      <option value="WEATHER">Weather</option>
                      <option value="UNKNOWN">Unknown</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="mortality-field">
                    <label>Age (Days)</label>

                    <input type="number" min="0" value={form.ageInDays} onChange={(event) => handleFormChange("ageInDays", event.target.value)} placeholder="Optional" />
                  </div>

                  <div className="mortality-field full">
                    <label>Cause Details</label>

                    <textarea value={form.causeDetails} onChange={(event) => handleFormChange("causeDetails", event.target.value)} placeholder="Describe the mortality cause or observation..." />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="mortality-stock-hint">
                    Entered mortality: {formatNumber(calculatedQuantity)} birds {" • "} Male: {formatNumber(calculatedMale)} {" • "}
                    Female: {formatNumber(calculatedFemale)}
                  </div>
                </div>
              </div>

              <div className="mortality-form-section">
                <div className="mortality-form-section-title">Disposal</div>

                <div className="mortality-form-grid three">
                  <div className="mortality-checkbox">
                    <input id="disposed" type="checkbox" checked={form.disposed} onChange={(event) => handleFormChange("disposed", event.target.checked)} />

                    <label htmlFor="disposed">Bird disposal completed</label>
                  </div>

                  <div className="mortality-field">
                    <label>Disposal Method</label>

                    <select value={form.disposalMethod} onChange={(event) => handleFormChange("disposalMethod", event.target.value)}>
                      <option value="">Select Disposal Method</option>
                      <option value="BURIAL">Burial</option>
                      <option value="INCINERATION">Incineration</option>
                      <option value="COMPOSTING">Composting</option>
                      <option value="AUTHORIZED_DISPOSAL">Authorized Disposal</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="mortality-field">
                    <label>Disposal Date</label>

                    <input type="date" value={form.disposalDate} onChange={(event) => handleFormChange("disposalDate", event.target.value)} />
                  </div>

                  <div className="mortality-field full">
                    <label>Notes</label>

                    <textarea value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Additional notes..." />
                  </div>
                </div>
              </div>
            </form>

            <div className="mortality-modal-footer">
              <button type="button" className="mortality-btn" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>

              <button type="button" className="mortality-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={16} className="mortality-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {selectedRecord ? "Update Mortality" : "Save Mortality"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "view" && selectedRecord && (
        <div className="mortality-modal-overlay">
          <div className="mortality-modal small">
            <div className="mortality-modal-header">
              <div>
                <h2>Mortality Details</h2>

                <p>Complete information about this mortality record.</p>
              </div>

              <button type="button" className="mortality-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="mortality-view-grid">
              <div className="mortality-view-item">
                <div className="mortality-view-label">Date</div>

                <div className="mortality-view-value">{formatDate(selectedRecord.date)}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Quantity</div>

                <div className="mortality-view-value">{formatNumber(selectedRecord.quantity)} birds</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Farm</div>

                <div className="mortality-view-value">{selectedRecord?.farm?.name || selectedRecord?.farm?.code || "-"}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Shed</div>

                <div className="mortality-view-value">{selectedRecord?.shed?.name || selectedRecord?.shed?.code || "-"}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Batch</div>

                <div className="mortality-view-value">{selectedRecord?.batch?.batchNumber || selectedRecord?.batch?.batchName || "-"}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Breed</div>

                <div className="mortality-view-value">{selectedRecord?.batch?.breed || "-"}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Cause</div>

                <div className="mortality-view-value">{getCauseLabel(selectedRecord.cause)}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Age</div>

                <div className="mortality-view-value">{selectedRecord.ageInDays === null || selectedRecord.ageInDays === undefined ? "-" : `${selectedRecord.ageInDays} days`}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Male Mortality</div>

                <div className="mortality-view-value">{formatNumber(selectedRecord.maleCount)}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Female Mortality</div>

                <div className="mortality-view-value">{formatNumber(selectedRecord.femaleCount)}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Disposal Status</div>

                <div className="mortality-view-value">
                  <span className={getStatusClass(selectedRecord.disposed)}>{selectedRecord.disposed ? "Disposed" : "Pending"}</span>
                </div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Disposal Method</div>

                <div className="mortality-view-value">{selectedRecord.disposalMethod || "-"}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Disposal Date</div>

                <div className="mortality-view-value">{formatDate(selectedRecord.disposalDate)}</div>
              </div>

              <div className="mortality-view-item">
                <div className="mortality-view-label">Reported By</div>

                <div className="mortality-view-value">{selectedRecord?.reportedBy?.name || selectedRecord?.reportedBy?.email || "-"}</div>
              </div>

              <div className="mortality-view-item mortality-view-full">
                <div className="mortality-view-label">Cause Details</div>

                <div className="mortality-view-value">{selectedRecord.causeDetails || "-"}</div>
              </div>

              <div className="mortality-view-item mortality-view-full">
                <div className="mortality-view-label">Notes</div>

                <div className="mortality-view-value">{selectedRecord.notes || "-"}</div>
              </div>
            </div>

            <div className="mortality-view-footer">
              <button type="button" className="mortality-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
