import { useEffect, useMemo, useState } from "react";
import { Eye, FileSpreadsheet, FileText, Pencil, Plus, RefreshCw, Search, Stethoscope, Trash2, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const initialForm = {
  farm: "",
  shed: "",
  batch: "",
  date: "",
  visitType: "",
  diseaseName: "",
  symptoms: "",
  affectedBirds: "",
  severity: "",
  diagnosis: "",
  treatmentMedicine: "",
  treatmentDetails: "",
  veterinarian: "",
  visitCost: "",
  medicineCost: "",
  recoveryStatus: "",
  followUpDate: "",
  notes: "",
};

const getArray = (response) => {
  const root = response?.data ?? response;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.farms)) return root.farms;
  if (Array.isArray(root?.sheds)) return root.sheds;
  if (Array.isArray(root?.batches)) return root.batches;
  if (Array.isArray(root?.medicines)) return root.medicines;
  return [];
};

const getPayload = (response) => response?.data ?? response;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.batchName || value.batchNumber || "";
};

const statusClass = (value) => {
  const status = String(value || "").toUpperCase();

  if (status === "RECOVERED" || status === "NORMAL" || status === "HEALTHY") {
    return "status-success";
  }

  if (status === "CRITICAL" || status === "SEVERE" || status === "DEAD") {
    return "status-danger";
  }

  if (status === "IMPROVING" || status === "UNDER_TREATMENT") {
    return "status-warning";
  }

  return "status-neutral";
};

const extractErrorMessage = (error) => {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;
  return error?.response?.data?.message || error?.data?.message || error?.message || "Something went wrong";
};

export default function VeterinaryLogs() {
  const [logs, setLogs] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dependenciesLoading, setDependenciesLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    farm: "",
    shed: "",
    batch: "",
    visitType: "",
    severity: "",
    recoveryStatus: "",
    startDate: "",
    endDate: "",
  });

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadDependencies = async () => {
    setDependenciesLoading(true);

    try {
      const [farmResponse, shedResponse, batchResponse, medicineResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds"), apiRequest("/batches"), apiRequest("/medicine?limit=100")]);

      setFarms(getArray(farmResponse));
      setSheds(getArray(shedResponse));
      setBatches(getArray(batchResponse));
      setMedicines(getArray(medicineResponse));
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setDependenciesLoading(false);
    }
  };

  const loadLogs = async (requestedPage = page) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(requestedPage));
      params.set("limit", String(limit));

      if (filters.farm) params.set("farm", filters.farm);
      if (filters.shed) params.set("shed", filters.shed);
      if (filters.batch) params.set("batch", filters.batch);
      if (filters.visitType) params.set("visitType", filters.visitType);
      if (filters.severity) params.set("severity", filters.severity);
      if (filters.recoveryStatus) {
        params.set("recoveryStatus", filters.recoveryStatus);
      }
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const response = await apiRequest(`/veterinary-health?${params.toString()}`);

      const payload = getPayload(response);
      const records = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      const pageData = payload?.pagination || response?.pagination || response?.data?.pagination || {};

      setLogs(records);
      setPagination({
        page: Number(pageData.page || requestedPage),
        limit: Number(pageData.limit || limit),
        total: Number(pageData.total || records.length),
        totalPages: Math.max(Number(pageData.totalPages || 1), 1),
      });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadDependencies(), loadLogs(page)]);
  };

  const exportExcel = () => {
    const headers = ["Date", "Visit Type", "Farm", "Shed", "Batch", "Disease", "Diagnosis", "Affected Birds", "Severity", "Recovery Status", "Veterinarian", "Visit Cost", "Medicine Cost", "Total Cost", "Follow-up Date", "Treatment Medicine", "Treatment Details", "Notes"];

    const rows = visibleLogs.map((log) => [
      formatDate(log?.date),
      log?.visitType || "",
      getName(log?.farm),
      getName(log?.shed),
      log?.batch?.batchName || log?.batch?.batchNumber || "",
      log?.diseaseName || "",
      log?.diagnosis || "",
      Number(log?.affectedBirds || 0),
      log?.severity || "",
      log?.recoveryStatus || "",
      log?.veterinarian || "",
      Number(log?.visitCost || 0),
      Number(log?.medicineCost || 0),
      Number(log?.totalCost || 0),
      formatDate(log?.followUpDate),
      getName(log?.treatment?.medicine),
      log?.treatment?.details || log?.treatment?.description || "",
      log?.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `veterinary-health-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = visibleLogs
      .map(
        (log) => `
        <tr>
          <td>${formatDate(log?.date)}</td>
          <td>${log?.visitType || "-"}</td>
          <td>${getName(log?.farm) || "-"}</td>
          <td>${getName(log?.shed) || "-"}</td>
          <td>${log?.batch?.batchName || log?.batch?.batchNumber || "-"}</td>
          <td>${log?.diseaseName || "-"}</td>
          <td>${Number(log?.affectedBirds || 0).toLocaleString("en-IN")}</td>
          <td>${log?.severity || "-"}</td>
          <td>${log?.recoveryStatus || "-"}</td>
          <td>${money(log?.totalCost)}</td>
          <td>${formatDate(log?.followUpDate)}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Veterinary Health Logs</title>
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
        <h1>Veterinary Health Logs Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Visit</th>
              <th>Farm</th>
              <th>Shed</th>
              <th>Batch</th>
              <th>Disease</th>
              <th>Affected</th>
              <th>Severity</th>
              <th>Recovery</th>
              <th>Total Cost</th>
              <th>Follow-up</th>
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

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    loadLogs(page);
  }, [page, filters.farm, filters.shed, filters.batch, filters.visitType, filters.severity, filters.recoveryStatus, filters.startDate, filters.endDate]);

  const filteredSheds = useMemo(() => {
    if (!form.farm) return sheds;
    return sheds.filter((item) => String(getId(item.farm)) === String(form.farm));
  }, [sheds, form.farm]);

  const filteredBatches = useMemo(() => {
    let result = batches;

    if (form.farm) {
      result = result.filter((item) => String(getId(item.farm)) === String(form.farm));
    }

    if (form.shed) {
      result = result.filter((item) => String(getId(item.shed)) === String(form.shed));
    }

    return result;
  }, [batches, form.farm, form.shed]);

  const filteredMedicines = useMemo(() => {
    let result = medicines;

    if (form.farm) {
      result = result.filter((item) => String(getId(item.farm)) === String(form.farm));
    }

    return result;
  }, [medicines, form.farm]);

  const filteredFilterSheds = useMemo(() => {
    if (!filters.farm) return sheds;

    return sheds.filter((item) => String(getId(item.farm)) === String(filters.farm));
  }, [sheds, filters.farm]);

  const filteredFilterBatches = useMemo(() => {
    let result = batches;

    if (filters.farm) {
      result = result.filter((item) => String(getId(item.farm)) === String(filters.farm));
    }

    if (filters.shed) {
      result = result.filter((item) => String(getId(item.shed)) === String(filters.shed));
    }

    return result;
  }, [batches, filters.farm, filters.shed]);

  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return logs;

    return logs.filter((log) => {
      const searchable = [log?.visitType, log?.diseaseName, log?.symptoms, log?.severity, log?.diagnosis, log?.veterinarian, log?.recoveryStatus, log?.notes, getName(log?.farm), getName(log?.shed), getName(log?.batch), getName(log?.treatment?.medicine)].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    });
  }, [logs, search]);

  const summary = useMemo(() => {
    const totalAffected = logs.reduce((sum, item) => sum + Number(item?.affectedBirds || 0), 0);

    const totalCost = logs.reduce((sum, item) => sum + Number(item?.totalCost || 0), 0);

    const followUps = logs.filter((item) => {
      if (!item?.followUpDate) return false;
      const followUp = new Date(item.followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return followUp >= today;
    }).length;

    return {
      total: Number(pagination.total || 0),
      affected: totalAffected,
      totalCost,
      followUps,
    };
  }, [logs, pagination.total]);

  const handleFilterChange = (field, value) => {
    setPage(1);

    setFilters((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "farm") {
        next.shed = "";
        next.batch = "";
      }

      if (field === "shed") {
        next.batch = "";
      }

      return next;
    });
  };

  const resetFilters = () => {
    setFilters({
      farm: "",
      shed: "",
      batch: "",
      visitType: "",
      severity: "",
      recoveryStatus: "",
      startDate: "",
      endDate: "",
    });
    setSearch("");
    setPage(1);
  };

  const openCreate = () => {
    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setSelectedLog(null);
    setModal("form");
  };

  const openEdit = (log) => {
    setSelectedLog(log);

    const treatment = log?.treatment || {};

    setForm({
      farm: getId(log?.farm),
      shed: getId(log?.shed),
      batch: getId(log?.batch),
      date: formatDateInput(log?.date),
      visitType: log?.visitType || "",
      diseaseName: log?.diseaseName || "",
      symptoms: log?.symptoms || "",
      affectedBirds: log?.affectedBirds === undefined || log?.affectedBirds === null ? "" : String(log.affectedBirds),
      severity: log?.severity || "",
      diagnosis: log?.diagnosis || "",
      treatmentMedicine: getId(treatment?.medicine),
      treatmentDetails: treatment?.details || treatment?.description || treatment?.name || "",
      veterinarian: log?.veterinarian || "",
      visitCost: log?.visitCost === undefined || log?.visitCost === null ? "" : String(log.visitCost),
      medicineCost: log?.medicineCost === undefined || log?.medicineCost === null ? "" : String(log.medicineCost),
      recoveryStatus: log?.recoveryStatus || "",
      followUpDate: formatDateInput(log?.followUpDate),
      notes: log?.notes || "",
    });

    setModal("form");
  };

  const openView = async (log) => {
    setSelectedLog(log);
    setModal("view");

    try {
      const response = await apiRequest(`/veterinary-health/${getId(log)}`);

      const payload = getPayload(response);
      const record = payload?.data || payload;

      if (record?._id) {
        setSelectedLog(record);
      }
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setSelectedLog(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "farm") {
        next.shed = "";
        next.batch = "";
        next.treatmentMedicine = "";
      }

      if (field === "shed") {
        next.batch = "";
      }

      if (field === "batch") {
        const selectedBatch = batches.find((item) => String(getId(item)) === String(value));

        if (selectedBatch && (prev.affectedBirds === "" || prev.affectedBirds === null)) {
          next.affectedBirds = "";
        }
      }

      return next;
    });
  };

  const validateForm = () => {
    if (!form.farm) return "Farm is required";
    if (!form.date) return "Health log date is required";
    if (!form.visitType) return "Visit type is required";

    const affectedBirds = Number(form.affectedBirds || 0);
    const visitCost = Number(form.visitCost || 0);
    const medicineCost = Number(form.medicineCost || 0);

    if (!Number.isFinite(affectedBirds) || affectedBirds < 0) {
      return "Affected birds must be a valid non-negative number";
    }

    if (!Number.isFinite(visitCost) || visitCost < 0) {
      return "Visit cost must be a valid non-negative number";
    }

    if (!Number.isFinite(medicineCost) || medicineCost < 0) {
      return "Medicine cost must be a valid non-negative number";
    }

    if (form.followUpDate && form.date) {
      const visitDate = new Date(form.date);
      const followUpDate = new Date(form.followUpDate);

      if (followUpDate < visitDate) {
        return "Follow-up date cannot be before health log date";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        farm: form.farm,
        shed: form.shed || null,
        batch: form.batch || null,
        date: form.date,
        visitType: form.visitType,
        diseaseName: form.diseaseName.trim(),
        symptoms: form.symptoms.trim(),
        affectedBirds: Number(form.affectedBirds || 0),
        severity: form.severity || undefined,
        diagnosis: form.diagnosis.trim(),
        treatment: {
          medicine: form.treatmentMedicine || null,
          details: form.treatmentDetails.trim(),
        },
        veterinarian: form.veterinarian.trim(),
        visitCost: Number(form.visitCost || 0),
        medicineCost: Number(form.medicineCost || 0),
        recoveryStatus: form.recoveryStatus || undefined,
        followUpDate: form.followUpDate || null,
        notes: form.notes.trim(),
      };

      if (selectedLog?._id) {
        await apiRequest(`/veterinary-health/${selectedLog._id}`, {
          method: "PUT",
          body: payload,
        });

        showSuccess("Veterinary health log updated successfully");
      } else {
        await apiRequest("/veterinary-health", {
          method: "POST",
          body: payload,
        });

        showSuccess("Veterinary health log created successfully");
      }

      closeModal();
      await loadLogs(page);
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (log) => {
    const id = getId(log);

    if (!id) return;

    const result = await showConfirm({
      title: "Delete Veterinary Health Log?",
      text: `Delete veterinary health log for ${formatDate(log?.date)}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(`/veterinary-health/${id}`, {
        method: "DELETE",
      });

      showSuccess("Veterinary health log deleted successfully");

      if (logs.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadLogs(page);
      }
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const selectedMedicine = useMemo(() => medicines.find((item) => String(getId(item)) === String(form.treatmentMedicine)), [medicines, form.treatmentMedicine]);

  const selectedBatch = useMemo(() => batches.find((item) => String(getId(item)) === String(form.batch)), [batches, form.batch]);

  return (
    <div className="veterinary-page">
      <div className="veterinary-header">
        <div>
          <div className="veterinary-title-row">
            <div className="veterinary-title-icon">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1>Veterinary Health Logs</h1>
              <p>Track veterinary visits, diseases, symptoms, treatments, affected birds and health follow-ups.</p>
            </div>
          </div>
        </div>

        <div className="veterinary-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || dependenciesLoading} title="Refresh">
            <RefreshCw size={17} className={loading || dependenciesLoading ? "veterinary-refresh-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreate} disabled={dependenciesLoading}>
            <Plus size={17} />
            Add Health Log
          </button>
        </div>
      </div>

      <div className="veterinary-summary-grid">
        <div className="veterinary-summary-card">
          <span>Total Logs</span>
          <strong>{summary.total}</strong>
          <small>All matching records</small>
        </div>

        <div className="veterinary-summary-card">
          <span>Affected Birds</span>
          <strong>{summary.affected.toLocaleString("en-IN")}</strong>
          <small>Current page</small>
        </div>

        <div className="veterinary-summary-card">
          <span>Follow-ups</span>
          <strong>{summary.followUps}</strong>
          <small>Upcoming follow-ups</small>
        </div>

        <div className="veterinary-summary-card">
          <span>Total Cost</span>
          <strong>{money(summary.totalCost)}</strong>
          <small>Current page</small>
        </div>
      </div>

      <div className="veterinary-filters-card">
        <div className="veterinary-filter-heading">
          <div>
            <h2>Filters</h2>
            <p>Filter veterinary health records by farm, batch and status.</p>
          </div>
        </div>

        <div className="veterinary-filter-grid">
          <div className="field-group">
            <label>Search</label>
            <div className="input-icon-wrap">
              <Search size={17} />
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Disease, vet, farm..." />
              {search && (
                <button type="button" className="search-clear-btn" onClick={() => setSearch("")} title="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="field-group">
            <label>Farm</label>
            <select value={filters.farm} onChange={(event) => handleFilterChange("farm", event.target.value)}>
              <option value="">All Farms</option>
              {farms.map((farm) => (
                <option key={getId(farm)} value={getId(farm)}>
                  {farm.name || farm.code || "Unnamed Farm"}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Shed</label>
            <select value={filters.shed} onChange={(event) => handleFilterChange("shed", event.target.value)}>
              <option value="">All Sheds</option>
              {filteredFilterSheds.map((shed) => (
                <option key={getId(shed)} value={getId(shed)}>
                  {shed.name || shed.code || "Unnamed Shed"}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Batch</label>
            <select value={filters.batch} onChange={(event) => handleFilterChange("batch", event.target.value)}>
              <option value="">All Batches</option>
              {filteredFilterBatches.map((batch) => (
                <option key={getId(batch)} value={getId(batch)}>
                  {batch.batchName || batch.batchNumber || "Unnamed Batch"}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Visit Type</label>
            <select value={filters.visitType} onChange={(event) => handleFilterChange("visitType", event.target.value)}>
              <option value="">All Visit Types</option>
              <option value="ROUTINE">Routine</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="DISEASE">Disease</option>
              <option value="INJURY">Injury</option>
              <option value="VACCINATION">Vaccination</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="field-group">
            <label>Severity</label>
            <select value={filters.severity} onChange={(event) => handleFilterChange("severity", event.target.value)}>
              <option value="">All Severity</option>
              <option value="MILD">Mild</option>
              <option value="MODERATE">Moderate</option>
              <option value="SEVERE">Severe</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="field-group">
            <label>Recovery Status</label>
            <select value={filters.recoveryStatus} onChange={(event) => handleFilterChange("recoveryStatus", event.target.value)}>
              <option value="">All Recovery Status</option>
              <option value="UNDER_TREATMENT">Under Treatment</option>
              <option value="IMPROVING">Improving</option>
              <option value="RECOVERED">Recovered</option>
              <option value="NOT_RECOVERED">Not Recovered</option>
              <option value="DEAD">Dead</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>

          <div className="field-group">
            <label>Start Date</label>
            <input type="date" value={filters.startDate} onChange={(event) => handleFilterChange("startDate", event.target.value)} />
          </div>

          <div className="field-group">
            <label>End Date</label>
            <input type="date" value={filters.endDate} onChange={(event) => handleFilterChange("endDate", event.target.value)} />
          </div>

          {(filters.startDate || filters.endDate) && (
            <button
              type="button"
              className="date-filter-clear"
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  startDate: "",
                  endDate: "",
                }));
                setPage(1);
              }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="veterinary-table-card">
        <div className="table-card-header">
          <div>
            <h2>Health Records</h2>
            <p>
              {pagination.total} record
              {pagination.total === 1 ? "" : "s"} found
              {search ? " on the current page" : ""}.
            </p>
          </div>

          <div className="table-page-info">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>

        {error ? (
          <div className="veterinary-error">
            <strong>Unable to load health records</strong>
            <span>{error}</span>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => loadLogs(page)}>
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="veterinary-empty">
            <RefreshCw className="spin-icon" size={25} />
            <strong>Loading health records...</strong>
            <span>Please wait.</span>
          </div>
        ) : visibleLogs.length === 0 ? (
          <div className="veterinary-empty">
            <Stethoscope size={32} />
            <strong>No veterinary health records found</strong>
            <span>Add a health log or change the selected filters.</span>

            <button type="button" className="admin-btn admin-btn-primary empty-add-btn" onClick={openCreate}>
              <Plus size={16} />
              Add Health Log
            </button>
          </div>
        ) : (
          <div className="veterinary-table-wrap">
            <table className="veterinary-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Visit</th>
                  <th>Farm / Shed</th>
                  <th>Batch</th>
                  <th>Disease / Diagnosis</th>
                  <th>Affected</th>
                  <th>Severity</th>
                  <th>Recovery</th>
                  <th>Total Cost</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleLogs.map((log) => (
                  <tr key={getId(log)}>
                    <td>
                      <div className="primary-cell">{formatDate(log?.date)}</div>
                    </td>

                    <td>
                      <span className="type-badge">{log?.visitType || "—"}</span>
                    </td>

                    <td>
                      <div className="stack-cell">
                        <strong>{getName(log?.farm) || "—"}</strong>
                        <span>{getName(log?.shed) || "No shed"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="stack-cell">
                        <strong>{log?.batch?.batchName || log?.batch?.batchNumber || "—"}</strong>
                        {log?.batch?.currentQuantity !== undefined && <span>Current: {Number(log.batch.currentQuantity || 0).toLocaleString("en-IN")}</span>}
                      </div>
                    </td>

                    <td>
                      <div className="stack-cell disease-cell">
                        <strong>{log?.diseaseName || "No disease"}</strong>
                        <span>{log?.diagnosis || "No diagnosis"}</span>
                      </div>
                    </td>

                    <td>
                      <strong>{Number(log?.affectedBirds || 0).toLocaleString("en-IN")}</strong>
                    </td>

                    <td>
                      <span className={`status-badge ${statusClass(log?.severity)}`}>{log?.severity || "—"}</span>
                    </td>

                    <td>
                      <span className={`status-badge ${statusClass(log?.recoveryStatus)}`}>{log?.recoveryStatus || "—"}</span>
                    </td>

                    <td>
                      <strong>{money(log?.totalCost)}</strong>
                    </td>

                    <td>{log?.followUpDate ? <span className="date-small">{formatDate(log.followUpDate)}</span> : "—"}</td>

                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-btn" title="View" onClick={() => openView(log)}>
                          <Eye size={16} />
                        </button>

                        <button type="button" className="icon-btn" title="Edit" onClick={() => openEdit(log)}>
                          <Pencil size={16} />
                        </button>

                        <button type="button" className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(log)}>
                          <Trash2 size={16} />
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
          <div className="pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
              Previous
            </button>

            <div className="pagination-pages">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, index) => {
                let pageNumber = index + 1;

                if (pagination.totalPages > 5 && page > 3) {
                  pageNumber = page - 2 + index;
                }

                if (pageNumber > pagination.totalPages) {
                  pageNumber = pagination.totalPages - (4 - index);
                }

                return (
                  <button type="button" key={pageNumber} className={pageNumber === page ? "active" : ""} onClick={() => setPage(pageNumber)}>
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}>
              Next
            </button>
          </div>
        )}
      </div>

      {modal === "form" && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal-card modal-large" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedLog ? "Edit Veterinary Health Log" : "Add Veterinary Health Log"}</h2>
                <p>Record the veterinary visit, health issue and treatment.</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <div className="form-section-title">Visit Information</div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>
                        Farm <span>*</span>
                      </label>
                      <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} disabled={Boolean(selectedLog)} required>
                        <option value="">Select farm</option>
                        {farms.map((farm) => (
                          <option key={getId(farm)} value={getId(farm)}>
                            {farm.name || farm.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Shed</label>
                      <select value={form.shed} onChange={(event) => handleFormChange("shed", event.target.value)} disabled={!form.farm}>
                        <option value="">Select shed</option>
                        {filteredSheds.map((shed) => (
                          <option key={getId(shed)} value={getId(shed)}>
                            {shed.name || shed.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Batch</label>
                      <select value={form.batch} onChange={(event) => handleFormChange("batch", event.target.value)} disabled={!form.farm}>
                        <option value="">Select batch</option>
                        {filteredBatches.map((batch) => (
                          <option key={getId(batch)} value={getId(batch)}>
                            {batch.batchName || batch.batchNumber}
                          </option>
                        ))}
                      </select>

                      {selectedBatch && <small className="field-help">Current birds: {Number(selectedBatch.currentQuantity || 0).toLocaleString("en-IN")}</small>}
                    </div>

                    <div className="field-group">
                      <label>
                        Health Log Date <span>*</span>
                      </label>
                      <input type="date" value={form.date} onChange={(event) => handleFormChange("date", event.target.value)} required />
                    </div>

                    <div className="field-group">
                      <label>
                        Visit Type <span>*</span>
                      </label>
                      <select value={form.visitType} onChange={(event) => handleFormChange("visitType", event.target.value)} required>
                        <option value="">Select visit type</option>
                        <option value="ROUTINE">Routine</option>
                        <option value="EMERGENCY">Emergency</option>
                        <option value="FOLLOW_UP">Follow-up</option>
                        <option value="DISEASE">Disease</option>
                        <option value="INJURY">Injury</option>
                        <option value="VACCINATION">Vaccination</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Severity</label>
                      <select value={form.severity} onChange={(event) => handleFormChange("severity", event.target.value)}>
                        <option value="">Select severity</option>
                        <option value="MILD">Mild</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="SEVERE">Severe</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Health Condition</div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>Disease Name</label>
                      <input type="text" value={form.diseaseName} onChange={(event) => handleFormChange("diseaseName", event.target.value)} placeholder="Example: Newcastle disease" />
                    </div>

                    <div className="field-group">
                      <label>Affected Birds</label>
                      <input type="number" min="0" step="1" value={form.affectedBirds} onChange={(event) => handleFormChange("affectedBirds", event.target.value)} placeholder="0" />
                    </div>

                    <div className="field-group field-full">
                      <label>Symptoms</label>
                      <textarea value={form.symptoms} onChange={(event) => handleFormChange("symptoms", event.target.value)} placeholder="Describe observed symptoms..." rows="3" />
                    </div>

                    <div className="field-group field-full">
                      <label>Diagnosis</label>
                      <textarea value={form.diagnosis} onChange={(event) => handleFormChange("diagnosis", event.target.value)} placeholder="Veterinarian diagnosis..." rows="3" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Treatment</div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>Treatment Medicine</label>
                      <select value={form.treatmentMedicine} onChange={(event) => handleFormChange("treatmentMedicine", event.target.value)} disabled={!form.farm}>
                        <option value="">No medicine</option>
                        {filteredMedicines.map((medicine) => (
                          <option key={getId(medicine)} value={getId(medicine)}>
                            {medicine.name}
                          </option>
                        ))}
                      </select>

                      {selectedMedicine && (
                        <small className="field-help">
                          Stock: {Number(selectedMedicine.currentStock || 0).toLocaleString("en-IN")} {selectedMedicine.unit || ""}
                        </small>
                      )}
                    </div>

                    <div className="field-group">
                      <label>Veterinarian</label>
                      <input type="text" value={form.veterinarian} onChange={(event) => handleFormChange("veterinarian", event.target.value)} placeholder="Veterinarian name" />
                    </div>

                    <div className="field-group">
                      <label>Visit Cost</label>
                      <input type="number" min="0" step="0.01" value={form.visitCost} onChange={(event) => handleFormChange("visitCost", event.target.value)} placeholder="0" />
                    </div>

                    <div className="field-group">
                      <label>Medicine Cost</label>
                      <input type="number" min="0" step="0.01" value={form.medicineCost} onChange={(event) => handleFormChange("medicineCost", event.target.value)} placeholder="0" />
                    </div>

                    <div className="field-group field-full">
                      <label>Treatment Details</label>
                      <textarea value={form.treatmentDetails} onChange={(event) => handleFormChange("treatmentDetails", event.target.value)} placeholder="Medicine dosage, treatment instructions, procedures..." rows="4" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Recovery & Follow-up</div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>Recovery Status</label>
                      <select value={form.recoveryStatus} onChange={(event) => handleFormChange("recoveryStatus", event.target.value)}>
                        <option value="">Select status</option>
                        <option value="UNDER_TREATMENT">Under Treatment</option>
                        <option value="IMPROVING">Improving</option>
                        <option value="RECOVERED">Recovered</option>
                        <option value="NOT_RECOVERED">Not Recovered</option>
                        <option value="DEAD">Dead</option>
                        <option value="UNKNOWN">Unknown</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Follow-up Date</label>
                      <input type="date" value={form.followUpDate} onChange={(event) => handleFormChange("followUpDate", event.target.value)} />
                    </div>

                    <div className="field-group field-full">
                      <label>Notes</label>
                      <textarea value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Additional notes..." rows="3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="spin-icon" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {selectedLog ? <Pencil size={16} /> : <Plus size={16} />}
                      {selectedLog ? "Update Log" : "Create Log"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedLog && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal-card modal-large" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Veterinary Health Details</h2>
                <p>Complete information for this veterinary health record.</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="view-top-card">
                <div className="view-icon">
                  <Stethoscope size={24} />
                </div>

                <div>
                  <strong>{selectedLog.diseaseName || "Veterinary Visit"}</strong>
                  <span>
                    {formatDate(selectedLog.date)} · {selectedLog.visitType || "—"}
                  </span>
                </div>

                <div className="view-statuses">
                  {selectedLog.severity && <span className={`status-badge ${statusClass(selectedLog.severity)}`}>{selectedLog.severity}</span>}

                  {selectedLog.recoveryStatus && <span className={`status-badge ${statusClass(selectedLog.recoveryStatus)}`}>{selectedLog.recoveryStatus}</span>}
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-box">
                  <span>Farm</span>
                  <strong>{getName(selectedLog.farm) || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Shed</span>
                  <strong>{getName(selectedLog.shed) || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Batch</span>
                  <strong>{selectedLog.batch?.batchName || selectedLog.batch?.batchNumber || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Affected Birds</span>
                  <strong>{Number(selectedLog.affectedBirds || 0).toLocaleString("en-IN")}</strong>
                </div>

                <div className="detail-box">
                  <span>Veterinarian</span>
                  <strong>{selectedLog.veterinarian || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Total Cost</span>
                  <strong>{money(selectedLog.totalCost)}</strong>
                </div>

                <div className="detail-box">
                  <span>Visit Cost</span>
                  <strong>{money(selectedLog.visitCost)}</strong>
                </div>

                <div className="detail-box">
                  <span>Medicine Cost</span>
                  <strong>{money(selectedLog.medicineCost)}</strong>
                </div>

                <div className="detail-box">
                  <span>Follow-up Date</span>
                  <strong>{formatDate(selectedLog.followUpDate)}</strong>
                </div>
              </div>

              <div className="view-section">
                <h3>Symptoms</h3>
                <p>{selectedLog.symptoms || "No symptoms recorded."}</p>
              </div>

              <div className="view-section">
                <h3>Diagnosis</h3>
                <p>{selectedLog.diagnosis || "No diagnosis recorded."}</p>
              </div>

              <div className="view-section">
                <h3>Treatment</h3>

                <div className="treatment-view">
                  <div>
                    <span>Medicine</span>
                    <strong>{getName(selectedLog.treatment?.medicine) || "No medicine"}</strong>
                  </div>

                  <div>
                    <span>Medicine Stock</span>
                    <strong>{selectedLog.treatment?.medicine ? `${Number(selectedLog.treatment.medicine.currentStock || 0).toLocaleString("en-IN")} ${selectedLog.treatment.medicine.unit || ""}` : "—"}</strong>
                  </div>
                </div>

                <p>{selectedLog.treatment?.details || selectedLog.treatment?.description || "No treatment details recorded."}</p>
              </div>

              <div className="view-section">
                <h3>Notes</h3>
                <p>{selectedLog.notes || "No additional notes."}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                Close
              </button>

              <button type="button" className="admin-btn admin-btn-primary" onClick={() => openEdit(selectedLog)}>
                <Pencil size={16} />
                Edit Log
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.date-filter-clear{height:34px;align-self:end;padding:0 10px;border:1px solid var(--admin-border);border-radius:7px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:650;cursor:pointer;white-space:nowrap;text-decoration:none!important;display:inline-flex;align-items:center;justify-content:center;width:auto;min-width:52px;transition:.18s ease}.date-filter-clear:hover{background:var(--admin-border);color:var(--admin-text);text-decoration:none!important}.veterinary-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.veterinary-refresh-spin{animation:vetHeaderSpin 1s linear infinite}@keyframes vetHeaderSpin{to{transform:rotate(360deg)}}@media(max-width:760px){.veterinary-header-actions{width:100%;justify-content:flex-start;flex-wrap:nowrap}.veterinary-header-actions .top-action-btn{flex:0 0 auto}.veterinary-header-actions .add-action-btn{flex:0 0 auto}}@media(max-width:480px){.veterinary-header-actions{gap:6px}.veterinary-header-actions .top-action-btn{padding:0 9px}.veterinary-header-actions .refresh-action-btn{width:38px;padding:0}.veterinary-header-actions .top-action-btn svg{width:16px;height:16px}.veterinary-header-actions .add-action-btn{padding:0 10px}}.empty-add-btn{margin-top:6px}.modal-card>form{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.veterinary-page{padding:24px;color:var(--admin-text);min-width:0}.veterinary-header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:22px}.veterinary-title-row{display:flex;align-items:center;gap:14px}.veterinary-title-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--admin-primary) 14%,transparent);color:var(--admin-primary);border:1px solid color-mix(in srgb,var(--admin-primary) 24%,var(--admin-border))}.veterinary-header h1{margin:0;font-size:25px;font-weight:800;letter-spacing:-.02em}.veterinary-header p{margin:5px 0 0;color:var(--admin-muted);font-size:13px}.veterinary-header-actions{display:flex;align-items:center;gap:10px}.admin-btn{height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--admin-border);display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.admin-btn:disabled{opacity:.55;cursor:not-allowed}.admin-btn-primary{background:var(--admin-primary);color:#fff;border-color:var(--admin-primary)}.admin-btn-primary:hover:not(:disabled){filter:brightness(.94);transform:translateY(-1px)}.admin-btn-secondary{background:var(--admin-surface);color:var(--admin-text)}.admin-btn-secondary:hover:not(:disabled){background:var(--admin-surface-2)}.veterinary-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.veterinary-summary-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;padding:17px;box-shadow:0 5px 18px rgba(0,0,0,.04)}.veterinary-summary-card span{display:block;font-size:12px;color:var(--admin-muted);font-weight:700}.veterinary-summary-card strong{display:block;margin-top:8px;font-size:24px;font-weight:850}.veterinary-summary-card small{display:block;margin-top:4px;color:var(--admin-muted);font-size:11px}.veterinary-filters-card,.veterinary-table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;box-shadow:0 5px 18px rgba(0,0,0,.04)}.veterinary-filters-card{padding:18px;margin-bottom:18px}.veterinary-filter-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}.veterinary-filter-heading h2,.table-card-header h2{margin:0;font-size:16px;font-weight:800}.veterinary-filter-heading p,.table-card-header p{margin:4px 0 0;color:var(--admin-muted);font-size:12px}.filter-reset-btn{border:0;background:transparent;color:var(--admin-primary);font-size:12px;font-weight:800;cursor:pointer}.veterinary-filter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.field-group{display:flex;flex-direction:column;gap:7px}.field-group label{font-size:12px;font-weight:750;color:var(--admin-text)}.field-group label span{color:var(--admin-danger)}.field-group input,.field-group select,.field-group textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);border-radius:9px;outline:none;font:inherit;font-size:13px;transition:.2s}.field-group input,.field-group select{height:40px;padding:0 11px}.field-group textarea{padding:10px 11px;resize:vertical;min-height:85px}.field-group input:focus,.field-group select:focus,.field-group textarea:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--admin-primary) 12%,transparent)}.field-group input:disabled,.field-group select:disabled{opacity:.6;cursor:not-allowed}.input-icon-wrap{position:relative}.search-clear-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:26px;height:26px;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.field-group input[type="date"]{color-scheme:light dark}.field-group input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .field-group input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.search-clear-btn:hover{background:var(--admin-surface-2);color:var(--admin-text)}.search-clear-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:26px;height:26px;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.search-clear-btn:hover{background:var(--admin-surface-2);color:var(--admin-text)}.input-icon-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted);pointer-events:none}.input-icon-wrap input{padding-left:36px;padding-right:40px}.field-help{font-size:11px;color:var(--admin-muted)}.veterinary-table-card{overflow:hidden}.table-card-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:18px;border-bottom:1px solid var(--admin-border)}.table-page-info{font-size:12px;color:var(--admin-muted);font-weight:700}.veterinary-table-wrap{width:100%;overflow:auto}.veterinary-table{width:100%;min-width:1250px;border-collapse:collapse}.veterinary-table th{padding:12px 14px;text-align:left;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--admin-border);white-space:nowrap}.veterinary-table td{padding:13px 14px;border-bottom:1px solid var(--admin-border);font-size:12px;vertical-align:middle}.veterinary-table tbody tr:hover{background:color-mix(in srgb,var(--admin-primary) 3%,transparent)}.primary-cell{font-weight:750;white-space:nowrap}.stack-cell{display:flex;flex-direction:column;gap:3px}.stack-cell strong{font-size:12px}.stack-cell span{font-size:10px;color:var(--admin-muted)}.disease-cell{max-width:180px}.disease-cell strong,.disease-cell span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.type-badge,.status-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;white-space:nowrap}.type-badge{background:color-mix(in srgb,var(--admin-primary) 10%,transparent);color:var(--admin-primary);border:1px solid color-mix(in srgb,var(--admin-primary) 18%,var(--admin-border))}.status-success{background:rgba(34,197,94,.12);color:#16a34a}.status-danger{background:rgba(239,68,68,.12);color:#dc2626}.status-warning{background:rgba(245,158,11,.13);color:#d97706}.status-neutral{background:var(--admin-surface-2);color:var(--admin-muted)}.date-small{white-space:nowrap;font-size:11px}.row-actions{display:flex;align-items:center;gap:6px}.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}.icon-btn:hover{background:var(--admin-surface-2);transform:translateY(-1px)}.icon-btn-danger{color:var(--admin-danger)}.veterinary-empty,.veterinary-error{min-height:230px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;padding:30px;text-align:center;color:var(--admin-muted)}.veterinary-empty strong,.veterinary-error strong{color:var(--admin-text);font-size:14px}.veterinary-empty span,.veterinary-error span{font-size:12px}.veterinary-error .admin-btn{margin-top:8px}.spin-icon{animation:vetSpin 1s linear infinite}@keyframes vetSpin{to{transform:rotate(360deg)}}.pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:15px;border-top:1px solid var(--admin-border)}.pagination>button,.pagination-pages button{height:34px;min-width:34px;padding:0 10px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer}.pagination>button:disabled{opacity:.45;cursor:not-allowed}.pagination-pages{display:flex;gap:5px}.pagination-pages button.active{background:var(--admin-primary);border-color:var(--admin-primary);color:#fff}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}.modal-card{width:min(680px,100%);height:min(92vh,900px);max-height:92vh;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:17px;box-shadow:0 24px 70px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}.modal-large{width:min(940px,100%)}.modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:19px 20px;border-bottom:1px solid var(--admin-border)}.modal-header h2{margin:0;font-size:18px;font-weight:850}.modal-header p{margin:5px 0 0;color:var(--admin-muted);font-size:12px}.modal-close{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer}.modal-body{overflow-y:auto;overflow-x:hidden;padding:20px;flex:1;min-height:0}.form-section{padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--admin-border)}.form-section:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}.form-section-title{font-size:14px;font-weight:850;margin-bottom:14px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field-full{grid-column:1/-1}.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--admin-border);background:var(--admin-surface-2)}.view-top-card{display:flex;align-items:center;gap:13px;padding:15px;border:1px solid var(--admin-border);border-radius:13px;background:var(--admin-surface-2);margin-bottom:18px}.view-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--admin-primary) 13%,transparent);color:var(--admin-primary);flex:none}.view-top-card>div:nth-child(2){display:flex;flex-direction:column;gap:4px;min-width:0}.view-top-card>div:nth-child(2) strong{font-size:15px}.view-top-card>div:nth-child(2) span{font-size:11px;color:var(--admin-muted)}.view-statuses{margin-left:auto;display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}.details-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-bottom:18px}.detail-box{border:1px solid var(--admin-border);border-radius:11px;padding:12px;background:var(--admin-surface-2);display:flex;flex-direction:column;gap:5px}.detail-box span{font-size:10px;color:var(--admin-muted);font-weight:700;text-transform:uppercase}.detail-box strong{font-size:13px}.view-section{padding:15px 0;border-top:1px solid var(--admin-border)}.view-section h3{margin:0 0 8px;font-size:13px;font-weight:850}.view-section p{margin:0;color:var(--admin-muted);font-size:12px;line-height:1.65;white-space:pre-wrap}.treatment-view{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.treatment-view>div{padding:11px;border-radius:10px;background:var(--admin-surface-2);border:1px solid var(--admin-border);display:flex;flex-direction:column;gap:4px}.treatment-view span{font-size:10px;color:var(--admin-muted);font-weight:700}.treatment-view strong{font-size:12px}@media(max-width:1100px){.veterinary-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.veterinary-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.veterinary-page{padding:15px}.veterinary-header{align-items:flex-start;flex-direction:column}.veterinary-header-actions{width:100%}.veterinary-header-actions .admin-btn{flex:1}.veterinary-header h1{font-size:21px}.veterinary-filter-grid{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}.field-full{grid-column:auto}.details-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.view-top-card{align-items:flex-start;flex-wrap:wrap}.view-statuses{margin-left:55px}.treatment-view{grid-template-columns:1fr}}@media(max-width:480px){.veterinary-summary-grid{grid-template-columns:1fr}.veterinary-title-row{align-items:flex-start}.veterinary-title-icon{width:40px;height:40px}.modal-overlay{padding:8px}.modal-card{height:96vh;max-height:96vh;border-radius:13px}.modal-header,.modal-body,.modal-footer{padding:14px}.details-grid{grid-template-columns:1fr}.view-statuses{margin-left:0;width:100%}.pagination{overflow:auto;justify-content:flex-start}.pagination-pages{flex:none}}`}</style>
    </div>
  );
}
