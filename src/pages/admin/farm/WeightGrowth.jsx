import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Filter, Pencil, Plus, RefreshCw, Search, Target, Trash2, TrendingUp, Users, X, Weight } from "lucide-react";

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

const initialForm = {
  farm: "",
  shed: "",
  batch: "",
  date: new Date().toISOString().slice(0, 10),
  ageInDays: "",
  sampleSize: "",
  averageWeightKg: "",
  minimumWeightKg: "",
  maximumWeightKg: "",
  maleAverageWeightKg: "",
  femaleAverageWeightKg: "",
  totalSampleWeightKg: "",
  measurementMethod: "SAMPLE_AVERAGE",
  targetWeightKg: "",
  notes: "",
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

  return number.toFixed(digits);
};

const getId = (item) => item?._id || item?.id || "";

const getName = (item) => {
  return item?.name || item?.batchName || item?.batchNumber || "";
};

const getBatchNumber = (batch) => {
  if (!batch) return "-";

  return batch.batchNumber || batch.batchName || "-";
};

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export default function WeightGrowth() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dependencyLoading, setDependencyLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterFarm, setFilterFarm] = useState("");
  const [filterShed, setFilterShed] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [form, setForm] = useState(initialForm);

  const loadDependencies = async () => {
    setDependencyLoading(true);

    try {
      const [farmResponse, shedResponse, batchResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds"), apiRequest("/batches")]);

      setFarms(getArray(farmResponse, ["farms", "data", "items"]));
      setSheds(getArray(shedResponse, ["sheds", "data", "items"]));
      setBatches(getArray(batchResponse, ["batches", "data", "items"]));
    } catch (err) {
      showError(err?.message || "Failed to load farms, sheds and batches");
    } finally {
      setDependencyLoading(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filterFarm) params.set("farm", filterFarm);
      if (filterShed) params.set("shed", filterShed);
      if (filterBatch) params.set("batch", filterBatch);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const query = params.toString();

      const response = await apiRequest(query ? `/weight-growth?${query}` : "/weight-growth");

      const root = getObject(response);

      setRecords(Array.isArray(root?.records) ? root.records : getArray(response, ["records", "data", "items"]));
    } catch (err) {
      const message = err?.message || "Failed to load weight and growth records";

      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [filterFarm, filterShed, filterBatch, fromDate, toDate]);

  const availableSheds = useMemo(() => {
    if (!form.farm) return sheds;

    return sheds.filter((shed) => {
      const shedFarm = shed?.farm?._id || shed?.farm?.id || shed?.farm || shed?.farmId || "";

      return String(shedFarm) === String(form.farm);
    });
  }, [sheds, form.farm]);

  const availableBatches = useMemo(() => {
    return batches.filter((batch) => {
      const batchFarm = batch?.farm?._id || batch?.farm?.id || batch?.farm || batch?.farmId || "";

      const batchShed = batch?.shed?._id || batch?.shed?.id || batch?.shed || batch?.shedId || "";

      const farmMatch = form.farm ? String(batchFarm) === String(form.farm) : true;

      const shedMatch = form.shed ? String(batchShed) === String(form.shed) : true;

      return farmMatch && shedMatch;
    });
  }, [batches, form.farm, form.shed]);

  const filterSheds = useMemo(() => {
    if (!filterFarm) return sheds;

    return sheds.filter((shed) => {
      const shedFarm = shed?.farm?._id || shed?.farm?.id || shed?.farm || shed?.farmId || "";

      return String(shedFarm) === String(filterFarm);
    });
  }, [sheds, filterFarm]);

  const filterBatches = useMemo(() => {
    return batches.filter((batch) => {
      const batchFarm = batch?.farm?._id || batch?.farm?.id || batch?.farm || batch?.farmId || "";

      const batchShed = batch?.shed?._id || batch?.shed?.id || batch?.shed || batch?.shedId || "";

      const farmMatch = filterFarm ? String(batchFarm) === String(filterFarm) : true;

      const shedMatch = filterShed ? String(batchShed) === String(filterShed) : true;

      return farmMatch && shedMatch;
    });
  }, [batches, filterFarm, filterShed]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return records;

    return records.filter((record) => {
      const searchable = [record?.farm?.name, record?.farm?.code, record?.shed?.name, record?.shed?.code, record?.batch?.batchNumber, record?.batch?.batchName, record?.batch?.breed, record?.measurementMethod, record?.notes, record?.measuredBy?.name, record?.measuredBy?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [records, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterFarm, filterShed, filterBatch, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const summary = useMemo(() => {
    const totalRecords = filteredRecords.length;

    const totalSample = filteredRecords.reduce((sum, item) => sum + Number(item?.sampleSize || 0), 0);

    const averageWeights = filteredRecords.map((item) => Number(item?.averageWeightKg || 0)).filter((value) => Number.isFinite(value));

    const averageWeight = averageWeights.length > 0 ? averageWeights.reduce((sum, value) => sum + value, 0) / averageWeights.length : 0;

    const averageGain = filteredRecords.map((item) => Number(item?.averageDailyGainKg || 0)).filter((value) => Number.isFinite(value));

    const avgDailyGain = averageGain.length > 0 ? averageGain.reduce((sum, value) => sum + value, 0) / averageGain.length : 0;

    const achievedTargets = filteredRecords.filter((item) => Number(item?.targetAchievementPercentage || 0) >= 100).length;

    return {
      totalRecords,
      totalSample,
      averageWeight,
      avgDailyGain,
      achievedTargets,
    };
  }, [filteredRecords]);

  const handleRefresh = async () => {
    await Promise.all([loadDependencies(), loadRecords()]);
  };

  const exportExcel = () => {
    if (!filteredRecords.length) {
      showError("No weight records available to export");
      return;
    }

    const headers = [
      "Date",
      "Farm",
      "Shed",
      "Batch",
      "Breed",
      "Age (Days)",
      "Sample Size",
      "Average Weight (kg)",
      "Minimum Weight (kg)",
      "Maximum Weight (kg)",
      "Male Average Weight (kg)",
      "Female Average Weight (kg)",
      "Total Sample Weight (kg)",
      "Daily Gain (kg)",
      "Previous Gain (kg)",
      "Target Weight (kg)",
      "Target Achievement (%)",
      "Measurement Method",
      "Measured By",
      "Notes",
    ];

    const rows = filteredRecords.map((record) => [
      formatDate(record?.date),
      record?.farm?.name || record?.farm?.code || "-",
      record?.shed?.name || record?.shed?.code || "-",
      record?.batch?.batchNumber || record?.batch?.batchName || "-",
      record?.batch?.breed || "-",
      record?.ageInDays ?? 0,
      record?.sampleSize ?? 0,
      formatNumber(record?.averageWeightKg),
      formatNumber(record?.minimumWeightKg),
      formatNumber(record?.maximumWeightKg),
      formatNumber(record?.maleAverageWeightKg),
      formatNumber(record?.femaleAverageWeightKg),
      formatNumber(record?.totalSampleWeightKg),
      formatNumber(record?.averageDailyGainKg, 3),
      formatNumber(record?.weightGainFromPreviousKg, 3),
      formatNumber(record?.targetWeightKg),
      formatNumber(record?.targetAchievementPercentage, 1),
      (record?.measurementMethod || "SAMPLE_AVERAGE")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      record?.measuredBy?.name || record?.measuredBy?.email || "-",
      record?.notes || "",
    ]);

    const csv = [headers.map(escapeCsvValue).join(","), ...rows.map((row) => row.map(escapeCsvValue).join(","))].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `weight-growth-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showSuccess("Weight & Growth data exported successfully");
  };

  const exportPDF = () => {
    if (!filteredRecords.length) {
      showError("No weight records available to export");
      return;
    }

    const rows = filteredRecords
      .map((record) => {
        const method = (record?.measurementMethod || "SAMPLE_AVERAGE")
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (letter) => letter.toUpperCase());

        return `
          <tr>
            <td>${formatDate(record?.date)}</td>
            <td>${record?.farm?.name || record?.farm?.code || "-"}</td>
            <td>${record?.shed?.name || record?.shed?.code || "-"}</td>
            <td>${record?.batch?.batchNumber || record?.batch?.batchName || "-"}</td>
            <td>${record?.ageInDays ?? 0} days</td>
            <td>${record?.sampleSize ?? 0}</td>
            <td>${formatNumber(record?.averageWeightKg)} kg</td>
            <td>${formatNumber(record?.averageDailyGainKg, 3)} kg</td>
            <td>${formatNumber(record?.targetAchievementPercentage, 1)}%</td>
            <td>${method}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weight & Growth Report</title>
          <style>
            *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:30px;color:#172033;background:#fff}h1{margin:0 0 6px;font-size:24px}p{margin:0 0 20px;color:#64748b;font-size:13px}.report-meta{display:flex;gap:25px;margin-bottom:18px;font-size:12px;color:#475569}.report-meta strong{color:#172033}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#f1f5f9;color:#334155;font-weight:700;text-align:left;padding:9px 7px;border:1px solid #cbd5e1}td{padding:8px 7px;border:1px solid #cbd5e1;vertical-align:top}tr:nth-child(even){background:#f8fafc}.footer{margin-top:20px;font-size:10px;color:#64748b}@media print{body{margin:12px}button{display:none}}
          </style>
        </head>
        <body>
          <h1>Weight & Growth Report</h1>
          <p>Bird weight, growth performance and target achievement report.</p>

          <div class="report-meta">
            <span><strong>Total Records:</strong> ${filteredRecords.length}</span>
            <span><strong>Total Sample:</strong> ${summary.totalSample}</span>
            <span><strong>Avg. Weight:</strong> ${formatNumber(summary.averageWeight)} kg</span>
            <span><strong>Avg. Daily Gain:</strong> ${formatNumber(summary.avgDailyGain, 3)} kg</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Farm</th>
                <th>Shed</th>
                <th>Batch</th>
                <th>Age</th>
                <th>Sample</th>
                <th>Avg. Weight</th>
                <th>Daily Gain</th>
                <th>Target</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            Generated on ${new Date().toLocaleString("en-IN")}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const openCreateModal = () => {
    setEditingRecord(null);

    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });

    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);

    setForm({
      farm: getId(record?.farm),
      shed: getId(record?.shed),
      batch: getId(record?.batch),
      date: record?.date ? new Date(record.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      ageInDays: record?.ageInDays ?? "",
      sampleSize: record?.sampleSize ?? "",
      averageWeightKg: record?.averageWeightKg ?? "",
      minimumWeightKg: record?.minimumWeightKg ?? "",
      maximumWeightKg: record?.maximumWeightKg ?? "",
      maleAverageWeightKg: record?.maleAverageWeightKg ?? "",
      femaleAverageWeightKg: record?.femaleAverageWeightKg ?? "",
      totalSampleWeightKg: record?.totalSampleWeightKg ?? "",
      measurementMethod: record?.measurementMethod || "SAMPLE_AVERAGE",
      targetWeightKg: record?.targetWeightKg ?? "",
      notes: record?.notes || "",
    });

    setModalOpen(true);
  };

  const openViewModal = async (record) => {
    try {
      const id = getId(record);

      if (!id) {
        setViewingRecord(record);
        setViewOpen(true);
        return;
      }

      const response = await apiRequest(`/weight-growth/${id}`);
      const root = getObject(response);

      setViewingRecord(root?.record || record);
      setViewOpen(true);
    } catch (err) {
      setViewingRecord(record);
      setViewOpen(true);
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingRecord(null);
    setForm(initialForm);
  };

  const handleFarmChange = (value) => {
    setForm((prev) => ({
      ...prev,
      farm: value,
      shed: "",
      batch: "",
    }));
  };

  const handleShedChange = (value) => {
    setForm((prev) => ({
      ...prev,
      shed: value,
      batch: "",
    }));
  };

  const calculateTotalSampleWeight = () => {
    const average = Number(form.averageWeightKg);
    const sample = Number(form.sampleSize);

    if (Number.isFinite(average) && Number.isFinite(sample) && average >= 0 && sample > 0) {
      return (average * sample).toFixed(3);
    }

    return "";
  };

  const handleAverageWeightChange = (value) => {
    setForm((prev) => ({
      ...prev,
      averageWeightKg: value,
      totalSampleWeightKg: value !== "" && prev.sampleSize !== "" ? (Number(value) * Number(prev.sampleSize)).toFixed(3) : "",
    }));
  };

  const handleSampleSizeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      sampleSize: value,
      totalSampleWeightKg: value !== "" && prev.averageWeightKg !== "" ? (Number(value) * Number(prev.averageWeightKg)).toFixed(3) : "",
    }));
  };

  const validateForm = () => {
    if (!editingRecord && !form.farm) {
      showError("Please select a farm");
      return false;
    }

    if (!editingRecord && !form.shed) {
      showError("Please select a shed");
      return false;
    }

    if (!editingRecord && !form.batch) {
      showError("Please select a batch");
      return false;
    }

    if (!form.date) {
      showError("Please select measurement date");
      return false;
    }

    const age = Number(form.ageInDays);
    const sampleSize = Number(form.sampleSize);
    const averageWeight = Number(form.averageWeightKg);
    const minimumWeight = form.minimumWeightKg === "" ? 0 : Number(form.minimumWeightKg);
    const maximumWeight = form.maximumWeightKg === "" ? 0 : Number(form.maximumWeightKg);
    const maleWeight = form.maleAverageWeightKg === "" ? 0 : Number(form.maleAverageWeightKg);
    const femaleWeight = form.femaleAverageWeightKg === "" ? 0 : Number(form.femaleAverageWeightKg);
    const targetWeight = form.targetWeightKg === "" ? 0 : Number(form.targetWeightKg);

    if (!Number.isFinite(age) || age < 0) {
      showError("Age cannot be negative");
      return false;
    }

    if (!Number.isFinite(sampleSize) || sampleSize < 1) {
      showError("Sample size must be at least 1");
      return false;
    }

    if (!Number.isFinite(averageWeight) || averageWeight < 0) {
      showError("Average weight cannot be negative");
      return false;
    }

    if (!Number.isFinite(minimumWeight) || minimumWeight < 0) {
      showError("Minimum weight cannot be negative");
      return false;
    }

    if (!Number.isFinite(maximumWeight) || maximumWeight < 0) {
      showError("Maximum weight cannot be negative");
      return false;
    }

    if (!Number.isFinite(maleWeight) || maleWeight < 0) {
      showError("Male average weight cannot be negative");
      return false;
    }

    if (!Number.isFinite(femaleWeight) || femaleWeight < 0) {
      showError("Female average weight cannot be negative");
      return false;
    }

    if (!Number.isFinite(targetWeight) || targetWeight < 0) {
      showError("Target weight cannot be negative");
      return false;
    }

    if (minimumWeight > averageWeight) {
      showError("Minimum weight cannot exceed average weight");
      return false;
    }

    if (maximumWeight > 0 && maximumWeight < averageWeight) {
      showError("Maximum weight cannot be lower than average weight");
      return false;
    }

    if (maximumWeight > 0 && minimumWeight > maximumWeight) {
      showError("Minimum weight cannot exceed maximum weight");
      return false;
    }

    const selectedBatch = batches.find((batch) => String(getId(batch)) === String(form.batch));

    if (selectedBatch && !editingRecord) {
      const currentQuantity = Number(selectedBatch?.currentQuantity || 0);

      if (sampleSize > currentQuantity) {
        showError(`Sample size cannot exceed current batch birds (${currentQuantity})`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        date: form.date,
        ageInDays: Number(form.ageInDays),
        sampleSize: Number(form.sampleSize),
        averageWeightKg: Number(form.averageWeightKg),
        minimumWeightKg: form.minimumWeightKg === "" ? 0 : Number(form.minimumWeightKg),
        maximumWeightKg: form.maximumWeightKg === "" ? 0 : Number(form.maximumWeightKg),
        maleAverageWeightKg: form.maleAverageWeightKg === "" ? 0 : Number(form.maleAverageWeightKg),
        femaleAverageWeightKg: form.femaleAverageWeightKg === "" ? 0 : Number(form.femaleAverageWeightKg),
        totalSampleWeightKg: form.totalSampleWeightKg === "" ? Number(form.averageWeightKg) * Number(form.sampleSize) : Number(form.totalSampleWeightKg),
        measurementMethod: form.measurementMethod || "SAMPLE_AVERAGE",
        targetWeightKg: form.targetWeightKg === "" ? 0 : Number(form.targetWeightKg),
        notes: form.notes || "",
      };

      if (!editingRecord) {
        payload.farm = form.farm;
        payload.shed = form.shed;
        payload.batch = form.batch;
      }

      const response = editingRecord
        ? await apiRequest(`/weight-growth/${getId(editingRecord)}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest("/weight-growth", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const root = getObject(response);

      showSuccess(root?.message || (editingRecord ? "Weight and growth record updated successfully" : "Weight and growth record created successfully"));

      closeModal();
      await loadRecords();
    } catch (err) {
      showError(err?.message || "Failed to save weight and growth record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    const id = getId(record);

    if (!id) return;

    const result = await showConfirm({
      title: "Delete Weight & Growth Record?",
      text: `Delete weight & growth record for ${formatDate(record?.date)}?\n\nIf a newer record exists for the same batch, the backend will prevent deletion.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/weight-growth/${id}`, {
        method: "DELETE",
      });

      const root = getObject(response);

      showSuccess(root?.message || "Weight and growth record deleted successfully");

      await loadRecords();
    } catch (err) {
      showError(err?.message || "Failed to delete weight and growth record");
    }
  };

  const getTargetClass = (percentage) => {
    const value = Number(percentage || 0);

    if (value >= 100) return "target-good";
    if (value >= 75) return "target-mid";

    return "target-low";
  };

  return (
    <div className="weight-growth-page">
      <div className="wg-header">
        <div>
          <div className="wg-eyebrow">
            <Activity size={16} />
            Farm Operations
          </div>

          <h1>Weight & Growth</h1>

          <p>Track bird weight, growth performance, daily gain and target achievement.</p>
        </div>

        <div className="wg-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || dependencyLoading} title="Refresh">
            <RefreshCw size={17} className={loading || dependencyLoading ? "spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreateModal}>
            <Plus size={18} />
            Record Weight
          </button>
        </div>
      </div>

      <div className="wg-stats">
        <div className="wg-stat-card">
          <div className="wg-stat-icon blue">
            <ClipboardIcon />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{summary.totalRecords}</strong>
          </div>
        </div>

        <div className="wg-stat-card">
          <div className="wg-stat-icon green">
            <Users size={20} />
          </div>

          <div>
            <span>Total Sample Birds</span>
            <strong>{summary.totalSample}</strong>
          </div>
        </div>

        <div className="wg-stat-card">
          <div className="wg-stat-icon orange">
            <Weight size={20} />
          </div>

          <div>
            <span>Avg. Weight</span>
            <strong>{formatNumber(summary.averageWeight)} kg</strong>
          </div>
        </div>

        <div className="wg-stat-card">
          <div className="wg-stat-icon purple">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Avg. Daily Gain</span>
            <strong>{formatNumber(summary.avgDailyGain, 3)} kg</strong>
          </div>
        </div>

        <div className="wg-stat-card">
          <div className="wg-stat-icon teal">
            <Target size={20} />
          </div>

          <div>
            <span>Target Achieved</span>
            <strong>{summary.achievedTargets}</strong>
          </div>
        </div>
      </div>

      <div className="wg-panel">
        <div className="wg-filter-title">
          <div>
            <Filter size={17} />
            Filters
          </div>
        </div>

        <div className="wg-filters">
          <div className="wg-search-box">
            <Search size={17} />

            <input type="text" placeholder="Search batch, farm, shed, breed..." value={search} onChange={(e) => setSearch(e.target.value)} />

            {search && (
              <button type="button" onClick={() => setSearch("")} title="Clear Search">
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={filterFarm}
            onChange={(e) => {
              setFilterFarm(e.target.value);
              setFilterShed("");
              setFilterBatch("");
            }}>
            <option value="">All Farms</option>

            {farms.map((farm) => (
              <option key={getId(farm)} value={getId(farm)}>
                {getName(farm) || farm?.code || "Farm"}
              </option>
            ))}
          </select>

          <select
            value={filterShed}
            onChange={(e) => {
              setFilterShed(e.target.value);
              setFilterBatch("");
            }}>
            <option value="">All Sheds</option>

            {filterSheds.map((shed) => (
              <option key={getId(shed)} value={getId(shed)}>
                {getName(shed) || shed?.code || "Shed"}
              </option>
            ))}
          </select>

          <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
            <option value="">All Batches</option>

            {filterBatches.map((batch) => (
              <option key={getId(batch)} value={getId(batch)}>
                {getBatchNumber(batch)}
              </option>
            ))}
          </select>

          <div className="wg-date-row">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="Start Date" />

            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} title="End Date" />

            {(fromDate || toDate) && (
              <button
                type="button"
                className="wg-date-clear-btn"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                title="Clear dates">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="wg-panel">
        <div className="wg-table-head">
          <div>
            <h2>Weight Records</h2>
            <span>{filteredRecords.length} records found</span>
          </div>

          {filteredRecords.length > 0 && (
            <div className="wg-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                <ChevronLeft size={17} />
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="wg-state">
            <RefreshCw size={28} className="spin" />
            <h3>Loading records...</h3>
            <p>Please wait while weight records are loaded.</p>
          </div>
        ) : error ? (
          <div className="wg-state wg-error-state">
            <Activity size={30} />
            <h3>Unable to load records</h3>
            <p>{error}</p>

            <button type="button" className="wg-btn wg-btn-primary" onClick={loadRecords}>
              Try Again
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="wg-state">
            <Weight size={34} />
            <h3>No weight records found</h3>
            <p>Start recording bird weight and growth measurements for your batches.</p>

            <button type="button" className="wg-btn wg-btn-primary" onClick={openCreateModal}>
              <Plus size={17} />
              Record Weight
            </button>
          </div>
        ) : (
          <div className="wg-table-wrap">
            <table className="wg-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farm / Shed</th>
                  <th>Batch</th>
                  <th>Age</th>
                  <th>Sample</th>
                  <th>Avg. Weight</th>
                  <th>Daily Gain</th>
                  <th>Target</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRecords.map((record) => {
                  const targetPercentage = Number(record?.targetAchievementPercentage || 0);

                  return (
                    <tr key={getId(record)}>
                      <td>
                        <div className="wg-date-main">
                          <CalendarDays size={15} />
                          {formatDate(record?.date)}
                        </div>
                      </td>

                      <td>
                        <div className="wg-location">
                          <strong>{record?.farm?.name || "-"}</strong>
                          <span>{record?.shed?.name || record?.shed?.code || "-"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="wg-batch">
                          <strong>{record?.batch?.batchNumber || record?.batch?.batchName || "-"}</strong>

                          <span>{record?.batch?.breed || "-"}</span>
                        </div>
                      </td>

                      <td>
                        <strong>{record?.ageInDays ?? 0}</strong>
                        <span className="wg-unit"> days</span>
                      </td>

                      <td>
                        <div className="wg-sample">
                          <Users size={14} />
                          {record?.sampleSize ?? 0}
                        </div>
                      </td>

                      <td>
                        <strong className="wg-weight-value">{formatNumber(record?.averageWeightKg)} kg</strong>
                      </td>

                      <td>
                        <span className={Number(record?.averageDailyGainKg || 0) > 0 ? "gain-positive" : "gain-neutral"}>+{formatNumber(record?.averageDailyGainKg, 3)} kg</span>
                      </td>

                      <td>
                        <span className={`wg-target-badge ${getTargetClass(targetPercentage)}`}>{formatNumber(targetPercentage, 1)}%</span>
                      </td>

                      <td>
                        <span className="wg-method">
                          {(record?.measurementMethod || "SAMPLE_AVERAGE")
                            .replaceAll("_", " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </span>
                      </td>

                      <td>
                        <div className="wg-actions">
                          <button type="button" className="wg-icon-btn view" title="View" onClick={() => openViewModal(record)}>
                            <Eye size={16} />
                          </button>

                          <button type="button" className="wg-icon-btn edit" title="Edit" onClick={() => openEditModal(record)}>
                            <Pencil size={16} />
                          </button>

                          <button type="button" className="wg-icon-btn delete" title="Delete" onClick={() => handleDelete(record)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="wg-modal-overlay" onMouseDown={closeModal}>
          <div className="wg-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="wg-modal-header">
              <div>
                <h2>{editingRecord ? "Edit Weight Record" : "Record Weight & Growth"}</h2>

                <p>{editingRecord ? "Update the measurement details." : "Add a new bird weight measurement."}</p>
              </div>

              <button type="button" className="wg-modal-close" onClick={closeModal} disabled={submitting}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="wg-modal-body">
                <div className="wg-form-section">
                  <div className="wg-section-title">
                    <span>Farm Details</span>
                  </div>

                  <div className="wg-form-grid">
                    <label className="wg-field">
                      <span>Farm *</span>

                      <select value={form.farm} onChange={(e) => handleFarmChange(e.target.value)} disabled={!!editingRecord || dependencyLoading}>
                        <option value="">Select farm</option>

                        {farms.map((farm) => (
                          <option key={getId(farm)} value={getId(farm)}>
                            {getName(farm) || farm?.code || "Farm"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="wg-field">
                      <span>Shed *</span>

                      <select value={form.shed} onChange={(e) => handleShedChange(e.target.value)} disabled={!!editingRecord || !form.farm || dependencyLoading}>
                        <option value="">Select shed</option>

                        {availableSheds.map((shed) => (
                          <option key={getId(shed)} value={getId(shed)}>
                            {getName(shed) || shed?.code || "Shed"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="wg-field">
                      <span>Batch *</span>

                      <select
                        value={form.batch}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            batch: e.target.value,
                          }))
                        }
                        disabled={!!editingRecord || !form.shed || dependencyLoading}>
                        <option value="">Select batch</option>

                        {availableBatches.map((batch) => (
                          <option key={getId(batch)} value={getId(batch)}>
                            {getBatchNumber(batch)}
                            {batch?.batchName ? ` - ${batch.batchName}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="wg-field">
                      <span>Measurement Date *</span>

                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="wg-form-section">
                  <div className="wg-section-title">
                    <span>Measurement</span>
                  </div>

                  <div className="wg-form-grid">
                    <label className="wg-field">
                      <span>Age (Days) *</span>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.ageInDays}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            ageInDays: e.target.value,
                          }))
                        }
                        placeholder="e.g. 30"
                      />
                    </label>

                    <label className="wg-field">
                      <span>Sample Size *</span>

                      <input type="number" min="1" step="1" value={form.sampleSize} onChange={(e) => handleSampleSizeChange(e.target.value)} placeholder="e.g. 20" />
                    </label>

                    <label className="wg-field">
                      <span>Average Weight (kg) *</span>

                      <input type="number" min="0" step="0.001" value={form.averageWeightKg} onChange={(e) => handleAverageWeightChange(e.target.value)} placeholder="e.g. 0.850" />
                    </label>

                    <label className="wg-field">
                      <span>Minimum Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.minimumWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            minimumWeightKg: e.target.value,
                          }))
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <label className="wg-field">
                      <span>Maximum Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.maximumWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            maximumWeightKg: e.target.value,
                          }))
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <label className="wg-field">
                      <span>Male Avg. Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.maleAverageWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            maleAverageWeightKg: e.target.value,
                          }))
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <label className="wg-field">
                      <span>Female Avg. Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.femaleAverageWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            femaleAverageWeightKg: e.target.value,
                          }))
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <label className="wg-field">
                      <span>Total Sample Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.totalSampleWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            totalSampleWeightKg: e.target.value,
                          }))
                        }
                        placeholder={calculateTotalSampleWeight() || "Auto calculated"}
                      />
                    </label>

                    <label className="wg-field">
                      <span>Measurement Method</span>

                      <select
                        value={form.measurementMethod}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            measurementMethod: e.target.value,
                          }))
                        }>
                        <option value="SAMPLE_AVERAGE">Sample Average</option>
                        <option value="INDIVIDUAL_WEIGHT">Individual Weight</option>
                        <option value="GROUP_WEIGHT">Group Weight</option>
                        <option value="SCALE">Scale</option>
                        <option value="MANUAL">Manual</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </label>

                    <label className="wg-field">
                      <span>Target Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.targetWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            targetWeightKg: e.target.value,
                          }))
                        }
                        placeholder="Optional"
                      />
                    </label>
                  </div>
                </div>

                <div className="wg-form-section">
                  <div className="wg-section-title">
                    <span>Notes</span>
                  </div>

                  <label className="wg-field">
                    <span>Notes</span>

                    <textarea
                      rows="4"
                      value={form.notes}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Add any observation or notes..."
                    />
                  </label>
                </div>

                {editingRecord && (
                  <div className="wg-edit-info">
                    <CheckCircle2 size={17} />

                    <div>
                      <strong>Farm, shed and batch cannot be changed</strong>

                      <span>Backend update API keeps the record linked to its original batch.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="wg-modal-footer">
                <button type="button" className="wg-btn wg-btn-secondary" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="wg-btn wg-btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingRecord ? "Update Record" : "Save Record"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewOpen && viewingRecord && (
        <div className="wg-modal-overlay" onMouseDown={() => setViewOpen(false)}>
          <div className="wg-modal wg-view-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="wg-modal-header">
              <div>
                <h2>Weight Record Details</h2>
                <p>Complete measurement and growth information.</p>
              </div>

              <button type="button" className="wg-modal-close" onClick={() => setViewOpen(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="wg-modal-body">
              <div className="wg-detail-top">
                <div>
                  <span>Measurement Date</span>
                  <strong>{formatDate(viewingRecord?.date)}</strong>
                </div>

                <div>
                  <span>Batch</span>
                  <strong>{viewingRecord?.batch?.batchNumber || viewingRecord?.batch?.batchName || "-"}</strong>
                </div>

                <div>
                  <span>Age</span>
                  <strong>{viewingRecord?.ageInDays ?? 0} days</strong>
                </div>
              </div>

              <div className="wg-detail-grid">
                <div className="wg-detail-card">
                  <span>Average Weight</span>
                  <strong>{formatNumber(viewingRecord?.averageWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Minimum Weight</span>
                  <strong>{formatNumber(viewingRecord?.minimumWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Maximum Weight</span>
                  <strong>{formatNumber(viewingRecord?.maximumWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Sample Size</span>
                  <strong>{viewingRecord?.sampleSize ?? 0} birds</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Male Average</span>
                  <strong>{formatNumber(viewingRecord?.maleAverageWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Female Average</span>
                  <strong>{formatNumber(viewingRecord?.femaleAverageWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Total Sample Weight</span>
                  <strong>{formatNumber(viewingRecord?.totalSampleWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Daily Gain</span>
                  <strong>{formatNumber(viewingRecord?.averageDailyGainKg, 3)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Previous Gain</span>
                  <strong>{formatNumber(viewingRecord?.weightGainFromPreviousKg, 3)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Target Weight</span>
                  <strong>{formatNumber(viewingRecord?.targetWeightKg)} kg</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Target Achievement</span>
                  <strong className={getTargetClass(viewingRecord?.targetAchievementPercentage)}>{formatNumber(viewingRecord?.targetAchievementPercentage, 1)}%</strong>
                </div>

                <div className="wg-detail-card">
                  <span>Measurement Method</span>
                  <strong>
                    {(viewingRecord?.measurementMethod || "SAMPLE_AVERAGE")
                      .replaceAll("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </strong>
                </div>
              </div>

              <div className="wg-info-list">
                <div>
                  <span>Farm</span>
                  <strong>{viewingRecord?.farm?.name || "-"}</strong>
                </div>

                <div>
                  <span>Shed</span>
                  <strong>{viewingRecord?.shed?.name || "-"}</strong>
                </div>

                <div>
                  <span>Breed</span>
                  <strong>{viewingRecord?.batch?.breed || "-"}</strong>
                </div>

                <div>
                  <span>Measured By</span>
                  <strong>{viewingRecord?.measuredBy?.name || viewingRecord?.measuredBy?.email || "-"}</strong>
                </div>
              </div>

              {viewingRecord?.notes && (
                <div className="wg-notes-box">
                  <span>Notes</span>
                  <p>{viewingRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="wg-modal-footer">
              <button type="button" className="wg-btn wg-btn-secondary" onClick={() => setViewOpen(false)}>
                Close
              </button>

              <button
                type="button"
                className="wg-btn wg-btn-primary"
                onClick={() => {
                  setViewOpen(false);
                  openEditModal(viewingRecord);
                }}>
                <Pencil size={17} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@media(max-width:900px){.wg-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.wg-search-box{grid-column:1/-1}.wg-date-row{grid-column:1/-1}}@media(max-width:600px){.wg-filters{grid-template-columns:1fr}.wg-search-box{grid-column:auto}.wg-date-row{grid-column:auto;display:grid;grid-template-columns:1fr 1fr}.wg-date-row input{width:100%}.wg-date-clear-btn{grid-column:1/-1;width:100%}}.wg-filters{display:grid;grid-template-columns:minmax(280px,1.8fr) repeat(3,minmax(130px,1fr));gap:10px;align-items:center}.wg-date-row{grid-column:1/-1;display:flex;align-items:center;gap:9px;margin-top:1px}.wg-date-row input{width:145px;height:40px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:0 10px;font-size:13px;outline:none}.wg-date-row input:focus{border-color:var(--admin-primary)}.wg-date-clear-btn{height:40px;padding:0 14px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease}.wg-date-clear-btn:hover{border-color:var(--admin-primary);background:var(--admin-surface);color:var(--admin-primary)}.wg-date-row input[type="date"]{color-scheme:light dark}.admin-theme-light .wg-date-row input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.wg-filters input[type="date"],.wg-field input[type="date"]{color-scheme:light dark}.wg-filters input[type="date"]::-webkit-calendar-picker-indicator,.wg-field input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .wg-filters input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .wg-field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.weight-growth-page{padding:24px;color:var(--admin-text,#e8edf5);background:var(--admin-bg,#0b1220);min-height:100%;box-sizing:border-box}.wg-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.wg-eyebrow{display:flex;align-items:center;gap:7px;color:var(--admin-primary,#38bdf8);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.wg-header h1{margin:0;font-size:28px;line-height:1.2}.wg-header p{margin:7px 0 0;color:var(--admin-muted,#8b98aa);font-size:14px}.wg-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.wg-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:18px}.wg-stat-card{background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:13px;padding:16px;display:flex;align-items:center;gap:12px;min-width:0}.wg-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:0 0 40px}.wg-stat-icon.blue{background:rgba(37,99,235,.14);color:#60a5fa}.wg-stat-icon.green{background:rgba(16,185,129,.14);color:#34d399}.wg-stat-icon.orange{background:rgba(245,158,11,.14);color:#fbbf24}.wg-stat-icon.purple{background:rgba(139,92,246,.14);color:#a78bfa}.wg-stat-icon.teal{background:rgba(20,184,166,.14);color:#2dd4bf}.wg-stat-card span{display:block;color:var(--admin-muted,#8b98aa);font-size:11px;margin-bottom:4px}.wg-stat-card strong{font-size:17px;line-height:1.2}.wg-panel{background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:13px;margin-bottom:18px;overflow:hidden}.wg-filter-title{padding:14px 16px;border-bottom:1px solid var(--admin-border,#263244);display:flex;align-items:center;justify-content:flex-start;gap:10px}.wg-filter-title>div{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:800}.wg-filters{padding:14px 16px;display:grid;grid-template-columns:2fr repeat(3,1fr) 1fr 1fr;gap:10px}.wg-search-box{height:40px;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);border-radius:8px;display:flex;align-items:center;padding:0 11px;gap:8px;color:var(--admin-muted,#8b98aa)}.wg-search-box input{border:0;outline:0;background:transparent;color:var(--admin-text,#e8edf5);width:100%;font-size:13px}.wg-search-box button{border:0;background:transparent;color:var(--admin-muted,#8b98aa);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:2px}.wg-filters select,.wg-filters input{height:40px;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);color:var(--admin-text,#e8edf5);border-radius:8px;padding:0 10px;outline:0;font-size:13px;min-width:0}.wg-filters select:focus,.wg-filters input:focus,.wg-field select:focus,.wg-field input:focus,.wg-field textarea:focus{border-color:var(--admin-primary,#38bdf8)}.wg-date-field{display:flex;flex-direction:column;gap:3px}.wg-date-field span{font-size:10px;color:var(--admin-muted,#8b98aa);padding-left:2px}.wg-table-head{padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid var(--admin-border,#263244)}.wg-table-head h2{font-size:15px;margin:0 0 3px}.wg-table-head span{font-size:12px;color:var(--admin-muted,#8b98aa)}.wg-pagination{display:flex;align-items:center;gap:8px}.wg-pagination button{width:31px;height:31px;border:1px solid var(--admin-border,#263244);border-radius:7px;background:var(--admin-bg,#0b1220);color:var(--admin-text,#e8edf5);display:flex;align-items:center;justify-content:center;cursor:pointer}.wg-pagination button:disabled{opacity:.4;cursor:not-allowed}.wg-pagination span{white-space:nowrap}.wg-table-wrap{width:100%;overflow:auto}.wg-table{width:100%;border-collapse:collapse;min-width:1150px}.wg-table th{padding:11px 13px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--admin-muted,#8b98aa);font-weight:800;background:var(--admin-surface-2,#172033);border-bottom:1px solid var(--admin-border,#263244);white-space:nowrap}.wg-table td{padding:12px 13px;border-bottom:1px solid var(--admin-border,#263244);font-size:12px;vertical-align:middle}.wg-table tbody tr:hover{background:rgba(255,255,255,.018)}.wg-date-main,.wg-sample{display:flex;align-items:center;gap:6px;white-space:nowrap}.wg-date-main{color:#cbd5e1}.wg-location,.wg-batch{display:flex;flex-direction:column;gap:3px}.wg-location strong,.wg-batch strong{font-size:12px}.wg-location span,.wg-batch span{font-size:10px;color:var(--admin-muted,#8b98aa)}.wg-unit{font-size:10px;color:var(--admin-muted,#8b98aa)}.wg-weight-value{color:#e5e7eb}.gain-positive{color:#34d399;font-weight:700}.gain-neutral{color:var(--admin-muted,#8b98aa);font-weight:700}.wg-target-badge{display:inline-flex;padding:4px 7px;border-radius:6px;font-size:10px;font-weight:800}.target-good{color:#34d399;background:rgba(16,185,129,.12)}.target-mid{color:#fbbf24;background:rgba(245,158,11,.12)}.target-low{color:#f87171;background:rgba(239,68,68,.12)}.wg-method{font-size:10px;color:#cbd5e1;white-space:nowrap}.wg-actions{display:flex;align-items:center;gap:6px}.wg-icon-btn{width:31px;height:31px;border:1px solid var(--admin-border,#263244);border-radius:7px;background:var(--admin-bg,#0b1220);display:flex;align-items:center;justify-content:center;cursor:pointer}.wg-icon-btn.view{color:#60a5fa}.wg-icon-btn.edit{color:#fbbf24}.wg-icon-btn.delete{color:#f87171}.wg-icon-btn:hover{filter:brightness(1.2)}.wg-state{min-height:300px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:35px;color:var(--admin-muted,#8b98aa)}.wg-state svg{margin-bottom:10px;color:var(--admin-primary,#38bdf8)}.wg-state h3{margin:0 0 6px;color:var(--admin-text,#e8edf5);font-size:16px}.wg-state p{margin:0 0 15px;font-size:13px;max-width:480px}.wg-error-state svg{color:var(--admin-danger,#ef4444)}.wg-btn{height:40px;border:1px solid transparent;border-radius:9px;padding:0 15px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.wg-btn:disabled{opacity:.55;cursor:not-allowed}.wg-btn-primary{background:var(--admin-primary,#2563eb);color:#fff;border-color:var(--admin-primary,#2563eb)}.wg-btn-primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}.wg-btn-secondary{background:var(--admin-surface,#111827);border-color:var(--admin-border,#263244);color:var(--admin-text,#e8edf5)}.wg-btn-secondary:hover:not(:disabled){background:var(--admin-surface-2,#172033)}.wg-modal-overlay{position:fixed;inset:0;background:rgba(2,6,23,.78);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.wg-modal{width:min(900px,100%);max-height:calc(100vh - 40px);overflow:hidden;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:15px;box-shadow:0 25px 70px rgba(0,0,0,.45);display:flex;flex-direction:column}.wg-modal>form{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.wg-view-modal{width:min(820px,100%)}.wg-modal-header{padding:17px 19px;border-bottom:1px solid var(--admin-border,#263244);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.wg-modal-header h2{margin:0;font-size:18px}.wg-modal-header p{margin:5px 0 0;color:var(--admin-muted,#8b98aa);font-size:12px}.wg-modal-close{width:34px;height:34px;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);color:var(--admin-muted,#8b98aa);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.wg-modal-body{padding:18px;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}.wg-form-section{margin-bottom:21px}.wg-section-title{display:flex;align-items:center;gap:9px;margin-bottom:12px;font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--admin-primary,#38bdf8);font-weight:800}.wg-section-title:after{content:"";height:1px;background:var(--admin-border,#263244);flex:1}.wg-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.wg-field{display:flex;flex-direction:column;gap:6px}.wg-field>span{font-size:11px;color:#cbd5e1;font-weight:700}.wg-field input,.wg-field select,.wg-field textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);color:var(--admin-text,#e8edf5);border-radius:8px;padding:0 11px;outline:0;font-size:13px}.wg-field input,.wg-field select{height:40px}.wg-field textarea{padding:10px 11px;resize:vertical;min-height:90px;font-family:inherit}.wg-field select:disabled,.wg-field input:disabled{opacity:.65;cursor:not-allowed}.wg-edit-info{display:flex;align-items:flex-start;gap:9px;padding:11px 12px;border-radius:9px;background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.18);color:#60a5fa}.wg-edit-info svg{flex:0 0 auto;margin-top:1px}.wg-edit-info div{display:flex;flex-direction:column;gap:3px}.wg-edit-info strong{font-size:11px}.wg-edit-info span{font-size:10px;color:var(--admin-muted,#8b98aa)}.wg-modal-footer{padding:14px 18px;border-top:1px solid var(--admin-border,#263244);display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-shrink:0}.wg-detail-top{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}.wg-detail-top>div{padding:13px;border:1px solid var(--admin-border,#263244);border-radius:10px;background:var(--admin-bg,#0b1220);display:flex;flex-direction:column;gap:5px}.wg-detail-top span,.wg-detail-card span,.wg-info-list span,.wg-notes-box>span{font-size:10px;color:var(--admin-muted,#8b98aa);text-transform:uppercase;letter-spacing:.04em}.wg-detail-top strong{font-size:14px}.wg-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.wg-detail-card{padding:13px;border:1px solid var(--admin-border,#263244);border-radius:10px;background:var(--admin-bg,#0b1220);display:flex;flex-direction:column;gap:6px}.wg-detail-card strong{font-size:14px}.wg-info-list{margin-top:14px;border:1px solid var(--admin-border,#263244);border-radius:10px;overflow:hidden;display:grid;grid-template-columns:repeat(2,1fr)}.wg-info-list div{padding:12px;border-bottom:1px solid var(--admin-border,#263244);display:flex;justify-content:space-between;gap:10px}.wg-info-list div:nth-last-child(-n+2){border-bottom:0}.wg-info-list strong{font-size:12px;text-align:right}.wg-notes-box{margin-top:14px;padding:13px;border:1px solid var(--admin-border,#263244);border-radius:10px;background:var(--admin-bg,#0b1220)}.wg-notes-box p{margin:7px 0 0;color:#cbd5e1;font-size:12px;line-height:1.6;white-space:pre-wrap}.spin{animation:wgSpin .9s linear infinite}@keyframes wgSpin{to{transform:rotate(360deg)}}@media(max-width:1200px){.wg-stats{grid-template-columns:repeat(3,1fr)}.wg-filters{grid-template-columns:repeat(3,1fr)}.wg-search-box{grid-column:1/-1}}@media(max-width:800px){.weight-growth-page{padding:16px}.wg-header{flex-direction:column}.wg-header-actions{width:100%;display:grid;grid-template-columns:40px repeat(2,minmax(0,1fr)) minmax(0,1.35fr);gap:6px}.wg-header-actions .top-action-btn{min-width:0;padding:0 8px}.wg-header-actions .add-action-btn{padding:0 7px}.wg-stats{grid-template-columns:repeat(2,1fr)}.wg-form-grid{grid-template-columns:1fr}.wg-detail-grid{grid-template-columns:repeat(2,1fr)}.wg-detail-top{grid-template-columns:1fr}.wg-info-list{grid-template-columns:1fr}.wg-info-list div:nth-last-child(-n+2){border-bottom:1px solid var(--admin-border,#263244)}.wg-info-list div:last-child{border-bottom:0}}@media(max-width:560px){.weight-growth-page{padding:12px}.wg-stats{grid-template-columns:1fr}.wg-filters{grid-template-columns:1fr}.wg-filter-title{align-items:flex-start}.wg-table-head{align-items:flex-start;flex-direction:column}.wg-pagination{width:100%;justify-content:flex-end}.wg-detail-grid{grid-template-columns:1fr}.wg-modal-overlay{padding:10px}.wg-modal{max-height:calc(100vh - 20px)}.wg-modal-body{padding:14px}.wg-modal-footer{padding:12px 14px}.wg-modal-footer .wg-btn{flex:1}.wg-header h1{font-size:24px}.wg-header-actions{grid-template-columns:38px minmax(0,1fr) minmax(0,1fr) minmax(0,1.25fr);gap:5px}.wg-header-actions .top-action-btn{height:38px;font-size:10px;gap:4px;padding:0 5px}.wg-header-actions .top-action-btn svg{width:15px;height:15px}.wg-header-actions .refresh-action-btn{width:38px;padding:0}}`}</style>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
