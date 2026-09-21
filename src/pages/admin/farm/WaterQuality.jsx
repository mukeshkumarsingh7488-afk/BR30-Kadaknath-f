import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Droplets, Eye, FileSpreadsheet, FileText, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const initialForm = {
  farm: "",
  shed: "",
  testDate: "",
  sampleLocation: "",
  source: "",
  ph: "",
  tdsPpm: "",
  hardnessPpm: "",
  ammoniaPpm: "",
  nitratePpm: "",
  chlorinePpm: "",
  temperatureCelsius: "",
  microbialTested: false,
  microbialResult: "NOT_TESTED",
  microbialDetails: "",
  overallStatus: "SAFE",
  treatmentApplied: false,
  treatmentDetails: "",
  nextTestDate: "",
  notes: "",
};

const getArray = (response) => {
  const root = response?.data ?? response;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.farms)) return root.farms;
  if (Array.isArray(root?.sheds)) return root.sheds;

  return [];
};

const getPayload = (response) => response?.data ?? response;

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.code || "";
};

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

const numberValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const statusClass = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "SAFE") return "status-success";
  if (value === "ACCEPTABLE") return "status-info";
  if (value === "NEEDS_TREATMENT") return "status-warning";
  if (value === "UNSAFE") return "status-danger";

  return "status-neutral";
};

const extractErrorMessage = (error) => {
  if (!error) return "Something went wrong";

  if (typeof error === "string") return error;

  return error?.response?.data?.message || error?.data?.message || error?.message || "Something went wrong";
};

export default function WaterQuality() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dependenciesLoading, setDependenciesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    farm: "",
    shed: "",
    source: "",
    overallStatus: "",
    fromDate: "",
    toDate: "",
  });

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form, setForm] = useState(initialForm);

  const loadDependencies = async () => {
    setDependenciesLoading(true);

    try {
      const [farmResponse, shedResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds")]);

      setFarms(getArray(farmResponse));
      setSheds(getArray(shedResponse));
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setDependenciesLoading(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filters.farm) {
        params.set("farm", filters.farm);
      }

      if (filters.shed) {
        params.set("shed", filters.shed);
      }

      if (filters.source) {
        params.set("source", filters.source);
      }

      if (filters.overallStatus) {
        params.set("overallStatus", filters.overallStatus);
      }

      if (filters.fromDate) {
        params.set("fromDate", filters.fromDate);
      }

      if (filters.toDate) {
        params.set("toDate", filters.toDate);
      }

      const query = params.toString();

      const response = await apiRequest(query ? `/water-quality?${query}` : "/water-quality");

      const payload = getPayload(response);

      const data = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      setRecords(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadDependencies(), loadRecords()]);
  };

  const exportExcel = () => {
    const headers = ["Test Date", "Farm", "Shed", "Sample Location", "Source", "pH", "TDS", "Hardness", "Ammonia", "Nitrate", "Chlorine", "Temperature", "Microbial", "Microbial Result", "Overall Status", "Treatment", "Next Test Date"];

    const rows = visibleRecords.map((record) => [
      formatDate(record?.testDate),
      getName(record?.farm),
      getName(record?.shed),
      record?.sampleLocation || "",
      record?.source || "",
      record?.ph ?? "",
      record?.tdsPpm ?? "",
      record?.hardnessPpm ?? "",
      record?.ammoniaPpm ?? "",
      record?.nitratePpm ?? "",
      record?.chlorinePpm ?? "",
      record?.temperatureCelsius ?? "",
      record?.microbialTest?.tested ? "Tested" : "Not Tested",
      record?.microbialTest?.result || "NOT_TESTED",
      record?.overallStatus || "",
      record?.treatmentApplied ? "Applied" : "Not Applied",
      formatDate(record?.nextTestDate),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `water-quality-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = visibleRecords
      .map(
        (record) => `
        <tr>
          <td>${formatDate(record?.testDate)}</td>
          <td>${getName(record?.farm) || "-"}</td>
          <td>${getName(record?.shed) || "-"}</td>
          <td>${record?.sampleLocation || "-"}</td>
          <td>${record?.source || "-"}</td>
          <td>${numberValue(record?.ph)}</td>
          <td>${numberValue(record?.tdsPpm)}</td>
          <td>${record?.microbialTest?.tested ? record?.microbialTest?.result || "NOT_TESTED" : "NOT TESTED"}</td>
          <td>${record?.overallStatus || "-"}</td>
          <td>${record?.treatmentApplied ? "Applied" : "Not Applied"}</td>
          <td>${formatDate(record?.nextTestDate)}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Water Quality Report</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#172033}
          h1{margin:0 0 6px;font-size:22px}
          p{margin:0 0 18px;color:#667085;font-size:12px}
          table{width:100%;border-collapse:collapse;font-size:10px}
          th,td{border:1px solid #dfe4ec;padding:7px;text-align:left}
          th{background:#f8fafc}
        </style>
      </head>
      <body>
        <h1>Water Quality Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
        <table>
          <thead>
            <tr>
              <th>Test Date</th>
              <th>Farm</th>
              <th>Shed</th>
              <th>Sample Location</th>
              <th>Source</th>
              <th>pH</th>
              <th>TDS</th>
              <th>Microbial</th>
              <th>Status</th>
              <th>Treatment</th>
              <th>Next Test</th>
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
    loadRecords();
  }, [filters.farm, filters.shed, filters.source, filters.overallStatus, filters.fromDate, filters.toDate]);

  const filteredSheds = useMemo(() => {
    if (!form.farm) return sheds;

    return sheds.filter((shed) => String(getId(shed.farm)) === String(form.farm));
  }, [sheds, form.farm]);

  const filterSheds = useMemo(() => {
    if (!filters.farm) return sheds;

    return sheds.filter((shed) => String(getId(shed.farm)) === String(filters.farm));
  }, [sheds, filters.farm]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const searchable = [record?.sampleLocation, record?.source, record?.overallStatus, record?.treatmentDetails, record?.notes, record?.microbialTest?.result, record?.microbialTest?.details, getName(record?.farm), getName(record?.shed)].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    });
  }, [records, search]);

  const summary = useMemo(() => {
    const safe = records.filter((item) => item?.overallStatus === "SAFE").length;

    const acceptable = records.filter((item) => item?.overallStatus === "ACCEPTABLE").length;

    const needsTreatment = records.filter((item) => item?.overallStatus === "NEEDS_TREATMENT").length;

    const unsafe = records.filter((item) => item?.overallStatus === "UNSAFE").length;

    const treatmentApplied = records.filter((item) => item?.treatmentApplied).length;

    const upcomingTests = records.filter((item) => {
      if (!item?.nextTestDate) return false;

      const nextDate = new Date(item.nextTestDate);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return nextDate >= today;
    }).length;

    return {
      total: records.length,
      safe,
      acceptable,
      needsTreatment,
      unsafe,
      treatmentApplied,
      upcomingTests,
    };
  }, [records]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "farm") {
        next.shed = "";
      }

      return next;
    });
  };

  const openCreate = () => {
    setSelectedRecord(null);

    setForm({
      ...initialForm,
      testDate: new Date().toISOString().slice(0, 10),
    });

    setModal("form");
  };

  const openEdit = (record) => {
    setSelectedRecord(record);

    setForm({
      farm: getId(record?.farm),
      shed: getId(record?.shed),
      testDate: formatDateInput(record?.testDate),
      sampleLocation: record?.sampleLocation || "",
      source: record?.source || "",
      ph: record?.ph === undefined || record?.ph === null ? "" : String(record.ph),
      tdsPpm: record?.tdsPpm === undefined || record?.tdsPpm === null ? "" : String(record.tdsPpm),
      hardnessPpm: record?.hardnessPpm === undefined || record?.hardnessPpm === null ? "" : String(record.hardnessPpm),
      ammoniaPpm: record?.ammoniaPpm === undefined || record?.ammoniaPpm === null ? "" : String(record.ammoniaPpm),
      nitratePpm: record?.nitratePpm === undefined || record?.nitratePpm === null ? "" : String(record.nitratePpm),
      chlorinePpm: record?.chlorinePpm === undefined || record?.chlorinePpm === null ? "" : String(record.chlorinePpm),
      temperatureCelsius: record?.temperatureCelsius === undefined || record?.temperatureCelsius === null ? "" : String(record.temperatureCelsius),
      microbialTested: Boolean(record?.microbialTest?.tested),
      microbialResult: record?.microbialTest?.result || "NOT_TESTED",
      microbialDetails: record?.microbialTest?.details || "",
      overallStatus: record?.overallStatus || "SAFE",
      treatmentApplied: Boolean(record?.treatmentApplied),
      treatmentDetails: record?.treatmentDetails || "",
      nextTestDate: formatDateInput(record?.nextTestDate),
      notes: record?.notes || "",
    });

    setModal("form");
  };

  const openView = async (record) => {
    setSelectedRecord(record);
    setModal("view");

    try {
      const response = await apiRequest(`/water-quality/${getId(record)}`);

      const payload = getPayload(response);
      const freshRecord = payload?.data || payload;

      if (freshRecord?._id) {
        setSelectedRecord(freshRecord);
      }
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedRecord(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "farm") {
        next.shed = "";
      }

      return next;
    });
  };

  const validateForm = () => {
    if (!form.farm) return "Farm is required";
    if (!form.testDate) return "Test date is required";
    if (!form.sampleLocation.trim()) {
      return "Sample location is required";
    }
    if (!form.source) return "Water source is required";

    if (form.ph !== "") {
      const ph = Number(form.ph);

      if (!Number.isFinite(ph) || ph < 0 || ph > 14) {
        return "pH must be between 0 and 14";
      }
    }

    const numericFields = [
      ["TDS", form.tdsPpm],
      ["Hardness", form.hardnessPpm],
      ["Ammonia", form.ammoniaPpm],
      ["Nitrate", form.nitratePpm],
      ["Chlorine", form.chlorinePpm],
      ["Temperature", form.temperatureCelsius],
    ];

    for (const [label, value] of numericFields) {
      if (value === "") continue;

      const number = Number(value);

      if (!Number.isFinite(number) || number < 0) {
        return `${label} must be a valid non-negative number`;
      }
    }

    if (form.nextTestDate && form.testDate) {
      const testDate = new Date(form.testDate);
      const nextTestDate = new Date(form.nextTestDate);

      if (nextTestDate < testDate) {
        return "Next test date cannot be before test date";
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
      const microbialTest = {
        tested: Boolean(form.microbialTested),
        result: form.microbialTested ? form.microbialResult : "NOT_TESTED",
        details: form.microbialDetails.trim(),
      };

      const payload = {
        farm: form.farm,
        shed: form.shed || null,
        testDate: form.testDate,
        sampleLocation: form.sampleLocation.trim(),
        source: form.source,
        ph: form.ph === "" ? undefined : Number(form.ph),
        tdsPpm: form.tdsPpm === "" ? undefined : Number(form.tdsPpm),
        hardnessPpm: form.hardnessPpm === "" ? undefined : Number(form.hardnessPpm),
        ammoniaPpm: form.ammoniaPpm === "" ? undefined : Number(form.ammoniaPpm),
        nitratePpm: form.nitratePpm === "" ? undefined : Number(form.nitratePpm),
        chlorinePpm: form.chlorinePpm === "" ? undefined : Number(form.chlorinePpm),
        temperatureCelsius: form.temperatureCelsius === "" ? undefined : Number(form.temperatureCelsius),
        microbialTest,
        overallStatus: form.overallStatus,
        treatmentApplied: Boolean(form.treatmentApplied),
        treatmentDetails: form.treatmentDetails.trim(),
        nextTestDate: form.nextTestDate || null,
        notes: form.notes.trim(),
      };

      if (selectedRecord?._id) {
        await apiRequest(`/water-quality/${selectedRecord._id}`, {
          method: "PUT",
          body: payload,
        });

        showSuccess("Water quality record updated successfully");
      } else {
        await apiRequest("/water-quality", {
          method: "POST",
          body: payload,
        });

        showSuccess("Water quality record created successfully");
      }

      closeModal();
      await loadRecords();
    } catch (err) {
      showError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    const id = getId(record);

    if (!id) return;

    const result = await showConfirm({
      title: "Delete Water Quality Record?",
      text: `Delete water quality record from ${formatDate(record?.testDate)}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(`/water-quality/${id}`, {
        method: "DELETE",
      });

      showSuccess("Water quality record deleted successfully");

      await loadRecords();
    } catch (err) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <div className="water-quality-page">
      <div className="water-quality-header">
        <div>
          <div className="water-quality-title-row">
            <div className="water-quality-title-icon">
              <Droplets size={22} />
            </div>

            <div>
              <h1>Water Quality</h1>
              <p>Monitor farm water quality, microbial tests, treatment and upcoming testing.</p>
            </div>
          </div>
        </div>

        <div className="water-quality-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || dependenciesLoading} title="Refresh">
            <RefreshCw size={17} className={loading || dependenciesLoading ? "water-refresh-spin" : ""} />
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
            Add Water Test
          </button>
        </div>
      </div>

      <div className="water-summary-grid">
        <div className="water-summary-card">
          <span>Total Tests</span>
          <strong>{summary.total}</strong>
          <small>Matching records</small>
        </div>

        <div className="water-summary-card">
          <span>Safe</span>
          <strong>{summary.safe}</strong>
          <small>Safe water records</small>
        </div>

        <div className="water-summary-card">
          <span>Needs Treatment</span>
          <strong>{summary.needsTreatment}</strong>
          <small>Records requiring action</small>
        </div>

        <div className="water-summary-card">
          <span>Unsafe</span>
          <strong>{summary.unsafe}</strong>
          <small>Unsafe water records</small>
        </div>
      </div>

      <div className="water-filters-card">
        <div className="water-filter-heading">
          <div>
            <h2>Filters</h2>
            <p>Filter water tests by farm, shed, source, status and date.</p>
          </div>
        </div>

        <div className="water-filter-grid">
          <div className="field-group">
            <label>Search</label>

            <div className="input-icon-wrap">
              <Search size={17} />

              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Location, source, status..." />

              {search && (
                <button type="button" className="search-clear-btn" onClick={() => setSearch("")} title="Clear Search">
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
                  {farm.name || farm.code}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Shed</label>

            <select value={filters.shed} onChange={(event) => handleFilterChange("shed", event.target.value)}>
              <option value="">All Sheds</option>

              {filterSheds.map((shed) => (
                <option key={getId(shed)} value={getId(shed)}>
                  {shed.name || shed.code}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Water Source</label>

            <select value={filters.source} onChange={(event) => handleFilterChange("source", event.target.value)}>
              <option value="">All Sources</option>
              <option value="BOREWELL">Borewell</option>
              <option value="MUNICIPAL">Municipal</option>
              <option value="TANK">Tank</option>
              <option value="RIVER">River</option>
              <option value="POND">Pond</option>
              <option value="RAINWATER">Rainwater</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="field-group">
            <label>Overall Status</label>

            <select value={filters.overallStatus} onChange={(event) => handleFilterChange("overallStatus", event.target.value)}>
              <option value="">All Status</option>
              <option value="SAFE">Safe</option>
              <option value="ACCEPTABLE">Acceptable</option>
              <option value="NEEDS_TREATMENT">Needs Treatment</option>
              <option value="UNSAFE">Unsafe</option>
            </select>
          </div>

          <div className="field-group">
            <label>From Date</label>

            <input type="date" value={filters.fromDate} onChange={(event) => handleFilterChange("fromDate", event.target.value)} />
          </div>

          <div className="field-group">
            <label>To Date</label>

            <input type="date" value={filters.toDate} onChange={(event) => handleFilterChange("toDate", event.target.value)} />
          </div>

          {(filters.fromDate || filters.toDate) && (
            <button
              type="button"
              className="date-filter-clear"
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  fromDate: "",
                  toDate: "",
                }));
              }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="water-table-card">
        <div className="table-card-header">
          <div>
            <h2>Water Test Records</h2>
            <p>
              {visibleRecords.length} record
              {visibleRecords.length === 1 ? "" : "s"} shown.
            </p>
          </div>

          <div className="table-page-info">
            {summary.treatmentApplied} treated · {summary.upcomingTests} upcoming
          </div>
        </div>

        {error ? (
          <div className="water-empty">
            <Droplets size={32} />

            <strong>Unable to load water quality records</strong>

            <span>{error}</span>

            <button type="button" className="admin-btn admin-btn-secondary" onClick={loadRecords}>
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="water-empty">
            <RefreshCw className="spin-icon" size={26} />

            <strong>Loading water quality...</strong>

            <span>Please wait.</span>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="water-empty">
            <Droplets size={32} />

            <strong>No water quality records found</strong>

            <span>Add a water test or change the selected filters.</span>

            <button type="button" className="admin-btn admin-btn-primary empty-add-btn" onClick={openCreate}>
              <Plus size={16} />
              Add Water Test
            </button>
          </div>
        ) : (
          <div className="water-table-wrap">
            <table className="water-table">
              <thead>
                <tr>
                  <th>Test Date</th>
                  <th>Farm / Shed</th>
                  <th>Sample Location</th>
                  <th>Source</th>
                  <th>pH</th>
                  <th>TDS</th>
                  <th>Microbial</th>
                  <th>Status</th>
                  <th>Treatment</th>
                  <th>Next Test</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={getId(record)}>
                    <td>
                      <div className="primary-cell">{formatDate(record?.testDate)}</div>
                    </td>

                    <td>
                      <div className="stack-cell">
                        <strong>{getName(record?.farm) || "—"}</strong>

                        <span>{getName(record?.shed) || "No shed"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="location-cell">{record?.sampleLocation || "—"}</div>
                    </td>

                    <td>
                      <span className="source-badge">{record?.source || "—"}</span>
                    </td>

                    <td>
                      <strong>{numberValue(record?.ph)}</strong>
                    </td>

                    <td>
                      <span className="number-muted">{numberValue(record?.tdsPpm)}</span>
                    </td>

                    <td>
                      <div className="stack-cell">
                        <span className={`status-badge ${statusClass(record?.microbialTest?.result === "UNSAFE" ? "UNSAFE" : record?.microbialTest?.result === "BORDERLINE" ? "NEEDS_TREATMENT" : record?.microbialTest?.result === "SAFE" ? "SAFE" : "")}`}>
                          {record?.microbialTest?.tested ? record?.microbialTest?.result || "NOT_TESTED" : "NOT TESTED"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge ${statusClass(record?.overallStatus)}`}>{record?.overallStatus || "—"}</span>
                    </td>

                    <td>
                      {record?.treatmentApplied ? (
                        <span className="treatment-yes">
                          <CheckCircle2 size={14} />
                          Applied
                        </span>
                      ) : (
                        <span className="treatment-no">Not Applied</span>
                      )}
                    </td>

                    <td>
                      <span className="date-small">{formatDate(record?.nextTestDate)}</span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-btn" title="View" onClick={() => openView(record)}>
                          <Eye size={16} />
                        </button>

                        <button type="button" className="icon-btn" title="Edit" onClick={() => openEdit(record)}>
                          <Pencil size={16} />
                        </button>

                        <button type="button" className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(record)}>
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
      </div>

      {modal === "form" && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal-card modal-large" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedRecord ? "Edit Water Quality Record" : "Add Water Quality Test"}</h2>

                <p>Record water parameters and treatment information.</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <div className="form-section-title">Test Information</div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>
                        Farm <span>*</span>
                      </label>

                      <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} disabled={Boolean(selectedRecord)} required>
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
                      <label>
                        Test Date <span>*</span>
                      </label>

                      <input type="date" value={form.testDate} onChange={(event) => handleFormChange("testDate", event.target.value)} required />
                    </div>

                    <div className="field-group">
                      <label>
                        Sample Location <span>*</span>
                      </label>

                      <input type="text" value={form.sampleLocation} onChange={(event) => handleFormChange("sampleLocation", event.target.value)} placeholder="Example: Shed 1 drinking line" required />
                    </div>

                    <div className="field-group">
                      <label>
                        Water Source <span>*</span>
                      </label>

                      <select value={form.source} onChange={(event) => handleFormChange("source", event.target.value)} required>
                        <option value="">Select source</option>

                        <option value="BOREWELL">Borewell</option>

                        <option value="MUNICIPAL">Municipal</option>

                        <option value="TANK">Tank</option>

                        <option value="RIVER">River</option>

                        <option value="POND">Pond</option>

                        <option value="RAINWATER">Rainwater</option>

                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Water Parameters</div>

                  <div className="parameter-grid">
                    <div className="parameter-box">
                      <label>pH</label>

                      <input type="number" min="0" max="14" step="0.01" value={form.ph} onChange={(event) => handleFormChange("ph", event.target.value)} placeholder="0 - 14" />
                    </div>

                    <div className="parameter-box">
                      <label>TDS (PPM)</label>

                      <input type="number" min="0" step="0.01" value={form.tdsPpm} onChange={(event) => handleFormChange("tdsPpm", event.target.value)} placeholder="0" />
                    </div>

                    <div className="parameter-box">
                      <label>Hardness (PPM)</label>

                      <input type="number" min="0" step="0.01" value={form.hardnessPpm} onChange={(event) => handleFormChange("hardnessPpm", event.target.value)} placeholder="0" />
                    </div>

                    <div className="parameter-box">
                      <label>Ammonia (PPM)</label>

                      <input type="number" min="0" step="0.01" value={form.ammoniaPpm} onChange={(event) => handleFormChange("ammoniaPpm", event.target.value)} placeholder="0" />
                    </div>

                    <div className="parameter-box">
                      <label>Nitrate (PPM)</label>

                      <input type="number" min="0" step="0.01" value={form.nitratePpm} onChange={(event) => handleFormChange("nitratePpm", event.target.value)} placeholder="0" />
                    </div>

                    <div className="parameter-box">
                      <label>Chlorine (PPM)</label>

                      <input type="number" min="0" step="0.01" value={form.chlorinePpm} onChange={(event) => handleFormChange("chlorinePpm", event.target.value)} placeholder="0" />
                    </div>

                    <div className="parameter-box">
                      <label>Temperature (°C)</label>

                      <input type="number" min="0" step="0.01" value={form.temperatureCelsius} onChange={(event) => handleFormChange("temperatureCelsius", event.target.value)} placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Microbial Test</div>

                  <div className="microbial-toggle-row">
                    <label className="toggle-label">
                      <input type="checkbox" checked={form.microbialTested} onChange={(event) => handleFormChange("microbialTested", event.target.checked)} />

                      <span>Microbial test performed</span>
                    </label>
                  </div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>Microbial Result</label>

                      <select value={form.microbialResult} onChange={(event) => handleFormChange("microbialResult", event.target.value)} disabled={!form.microbialTested}>
                        <option value="NOT_TESTED">Not Tested</option>

                        <option value="SAFE">Safe</option>

                        <option value="BORDERLINE">Borderline</option>

                        <option value="UNSAFE">Unsafe</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Overall Water Status</label>

                      <select value={form.overallStatus} onChange={(event) => handleFormChange("overallStatus", event.target.value)}>
                        <option value="SAFE">Safe</option>

                        <option value="ACCEPTABLE">Acceptable</option>

                        <option value="NEEDS_TREATMENT">Needs Treatment</option>

                        <option value="UNSAFE">Unsafe</option>
                      </select>
                    </div>

                    <div className="field-group field-full">
                      <label>Microbial Test Details</label>

                      <textarea value={form.microbialDetails} onChange={(event) => handleFormChange("microbialDetails", event.target.value)} placeholder="Test result details..." rows="3" disabled={!form.microbialTested} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Treatment & Follow-up</div>

                  <div className="microbial-toggle-row">
                    <label className="toggle-label">
                      <input type="checkbox" checked={form.treatmentApplied} onChange={(event) => handleFormChange("treatmentApplied", event.target.checked)} />

                      <span>Treatment has been applied</span>
                    </label>
                  </div>

                  <div className="form-grid">
                    <div className="field-group">
                      <label>Next Test Date</label>

                      <input type="date" value={form.nextTestDate} onChange={(event) => handleFormChange("nextTestDate", event.target.value)} />
                    </div>

                    <div className="field-group field-full">
                      <label>Treatment Details</label>

                      <textarea value={form.treatmentDetails} onChange={(event) => handleFormChange("treatmentDetails", event.target.value)} placeholder="Chlorination, filtration, cleaning or other treatment..." rows="3" disabled={!form.treatmentApplied} />
                    </div>

                    <div className="field-group field-full">
                      <label>Notes</label>

                      <textarea value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Additional observations or notes..." rows="3" />
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
                      {selectedRecord ? <Pencil size={16} /> : <Plus size={16} />}

                      {selectedRecord ? "Update Record" : "Create Record"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedRecord && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal-card modal-large" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Water Quality Details</h2>

                <p>Complete water testing information.</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="view-top-card">
                <div className="view-icon">
                  <Droplets size={24} />
                </div>

                <div>
                  <strong>{selectedRecord.sampleLocation || "Water Quality Test"}</strong>

                  <span>
                    {formatDate(selectedRecord.testDate)} · {selectedRecord.source || "Unknown Source"}
                  </span>
                </div>

                <span className={`status-badge ${statusClass(selectedRecord.overallStatus)}`}>{selectedRecord.overallStatus || "—"}</span>
              </div>

              <div className="details-grid">
                <div className="detail-box">
                  <span>Farm</span>
                  <strong>{getName(selectedRecord.farm) || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Shed</span>
                  <strong>{getName(selectedRecord.shed) || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Sample Location</span>
                  <strong>{selectedRecord.sampleLocation || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>Water Source</span>
                  <strong>{selectedRecord.source || "—"}</strong>
                </div>

                <div className="detail-box">
                  <span>pH</span>
                  <strong>{numberValue(selectedRecord.ph)}</strong>
                </div>

                <div className="detail-box">
                  <span>TDS</span>
                  <strong>{numberValue(selectedRecord.tdsPpm)} PPM</strong>
                </div>

                <div className="detail-box">
                  <span>Hardness</span>
                  <strong>{numberValue(selectedRecord.hardnessPpm)} PPM</strong>
                </div>

                <div className="detail-box">
                  <span>Ammonia</span>
                  <strong>{numberValue(selectedRecord.ammoniaPpm)} PPM</strong>
                </div>

                <div className="detail-box">
                  <span>Nitrate</span>
                  <strong>{numberValue(selectedRecord.nitratePpm)} PPM</strong>
                </div>

                <div className="detail-box">
                  <span>Chlorine</span>
                  <strong>{numberValue(selectedRecord.chlorinePpm)} PPM</strong>
                </div>

                <div className="detail-box">
                  <span>Temperature</span>
                  <strong>{numberValue(selectedRecord.temperatureCelsius)} °C</strong>
                </div>

                <div className="detail-box">
                  <span>Next Test</span>
                  <strong>{formatDate(selectedRecord.nextTestDate)}</strong>
                </div>
              </div>

              <div className="view-section">
                <h3>Microbial Test</h3>

                <div className="microbial-view-grid">
                  <div>
                    <span>Tested</span>
                    <strong>{selectedRecord.microbialTest?.tested ? "Yes" : "No"}</strong>
                  </div>

                  <div>
                    <span>Result</span>

                    <strong>{selectedRecord.microbialTest?.result || "NOT_TESTED"}</strong>
                  </div>
                </div>

                <p>{selectedRecord.microbialTest?.details || "No microbial test details."}</p>
              </div>

              <div className="view-section">
                <h3>Treatment</h3>

                <div className="treatment-view-grid">
                  <div>
                    <span>Applied</span>
                    <strong>{selectedRecord.treatmentApplied ? "Yes" : "No"}</strong>
                  </div>

                  <div>
                    <span>Next Test</span>
                    <strong>{formatDate(selectedRecord.nextTestDate)}</strong>
                  </div>
                </div>

                <p>{selectedRecord.treatmentDetails || "No treatment details."}</p>
              </div>

              <div className="view-section">
                <h3>Notes</h3>

                <p>{selectedRecord.notes || "No additional notes."}</p>
              </div>

              {selectedRecord.testedBy && (
                <div className="view-section">
                  <h3>Tested By</h3>

                  <p>
                    {selectedRecord.testedBy.name || "—"} {selectedRecord.testedBy.email ? `(${selectedRecord.testedBy.email})` : ""}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                Close
              </button>

              <button type="button" className="admin-btn admin-btn-primary" onClick={() => openEdit(selectedRecord)}>
                <Pencil size={16} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.date-filter-clear{height:34px;align-self:end;padding:0 10px;border:1px solid var(--admin-border);border-radius:7px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:650;cursor:pointer;white-space:nowrap;text-decoration:none!important;display:inline-flex;align-items:center;justify-content:center;width:auto;min-width:52px;transition:.18s ease}.date-filter-clear:hover{background:var(--admin-border);color:var(--admin-text);text-decoration:none!important}.field-group input[type="date"]{color-scheme:light dark}.field-group input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .field-group input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.search-clear-btn{transition:.2s}.search-clear-btn:hover{transform:translateY(-50%) scale(1.04)}.empty-add-btn{margin-top:6px}.modal-card>form{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.water-quality-page{padding:24px;color:var(--admin-text);min-width:0}.water-quality-header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:22px}.water-quality-title-row{display:flex;align-items:center;gap:14px}.water-quality-title-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--admin-primary) 14%,transparent);color:var(--admin-primary);border:1px solid color-mix(in srgb,var(--admin-primary) 24%,var(--admin-border))}.water-quality-header h1{margin:0;font-size:25px;font-weight:800;letter-spacing:-.02em}.water-quality-header p{margin:5px 0 0;color:var(--admin-muted);font-size:13px}.water-quality-header-actions{display:flex;align-items:center;gap:10px}.admin-btn{height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--admin-border);display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.admin-btn:disabled{opacity:.55;cursor:not-allowed}.admin-btn-primary{background:var(--admin-primary);color:#fff;border-color:var(--admin-primary)}.admin-btn-primary:hover:not(:disabled){filter:brightness(.94);transform:translateY(-1px)}.admin-btn-secondary{background:var(--admin-surface);color:var(--admin-text)}.admin-btn-secondary:hover:not(:disabled){background:var(--admin-surface-2)}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.water-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.water-summary-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;padding:17px;box-shadow:0 5px 18px rgba(0,0,0,.04)}.water-summary-card span{display:block;font-size:12px;color:var(--admin-muted);font-weight:700}.water-summary-card strong{display:block;margin-top:8px;font-size:24px;font-weight:850}.water-summary-card small{display:block;margin-top:4px;color:var(--admin-muted);font-size:11px}.water-filters-card,.water-table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;box-shadow:0 5px 18px rgba(0,0,0,.04)}.water-filters-card{padding:18px;margin-bottom:18px}.water-filter-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}.water-filter-heading h2,.table-card-header h2{margin:0;font-size:16px;font-weight:800}.water-filter-heading p,.table-card-header p{margin:4px 0 0;color:var(--admin-muted);font-size:12px}.filter-reset-btn{border:0;background:transparent;color:var(--admin-primary);font-size:12px;font-weight:800;cursor:pointer}.water-filter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.field-group{display:flex;flex-direction:column;gap:7px}.field-group label{font-size:12px;font-weight:750;color:var(--admin-text)}.field-group label span{color:var(--admin-danger)}.field-group input,.field-group select,.field-group textarea,.parameter-box input{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);border-radius:9px;outline:none;font:inherit;font-size:13px;transition:.2s}.field-group input,.field-group select,.parameter-box input{height:40px;padding:0 11px}.field-group textarea{padding:10px 11px;resize:vertical;min-height:85px}.field-group input:focus,.field-group select:focus,.field-group textarea:focus,.parameter-box input:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--admin-primary) 12%,transparent)}.field-group input:disabled,.field-group select:disabled,.field-group textarea:disabled{opacity:.6;cursor:not-allowed}.input-icon-wrap{position:relative}.input-icon-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted);pointer-events:none}.input-icon-wrap input{padding-left:36px;padding-right:42px}.search-clear-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:26px;height:26px;border:0;border-radius:0;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.search-clear-btn:hover{color:var(--admin-text);background:var(--admin-border);transform:translateY(-50%) scale(1.08)}.water-table-card{overflow:hidden}.table-card-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:18px;border-bottom:1px solid var(--admin-border)}.table-page-info{font-size:12px;color:var(--admin-muted);font-weight:700}.water-table-wrap{width:100%;overflow:auto}.water-table{width:100%;min-width:1200px;border-collapse:collapse}.water-table th{padding:12px 14px;text-align:left;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--admin-border);white-space:nowrap}.water-table td{padding:13px 14px;border-bottom:1px solid var(--admin-border);font-size:12px;vertical-align:middle}.water-table tbody tr:hover{background:color-mix(in srgb,var(--admin-primary) 3%,transparent)}.primary-cell{font-weight:750;white-space:nowrap}.stack-cell{display:flex;flex-direction:column;gap:3px}.stack-cell strong{font-size:12px}.stack-cell span{font-size:10px;color:var(--admin-muted)}.location-cell{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.source-badge,.status-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;white-space:nowrap}.source-badge{background:color-mix(in srgb,var(--admin-primary) 10%,transparent);color:var(--admin-primary);border:1px solid color-mix(in srgb,var(--admin-primary) 18%,var(--admin-border))}.status-success{background:rgba(34,197,94,.12);color:#16a34a}.status-info{background:rgba(59,130,246,.12);color:#2563eb}.status-danger{background:rgba(239,68,68,.12);color:#dc2626}.status-warning{background:rgba(245,158,11,.13);color:#d97706}.status-neutral{background:var(--admin-surface-2);color:var(--admin-muted)}.number-muted{color:var(--admin-muted)}.date-small{white-space:nowrap;font-size:11px}.treatment-yes{display:inline-flex;align-items:center;gap:5px;color:#16a34a;font-weight:750;font-size:11px}.treatment-no{font-size:11px;color:var(--admin-muted)}.row-actions{display:flex;align-items:center;gap:6px}.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}.icon-btn:hover{background:var(--admin-surface-2);transform:translateY(-1px)}.icon-btn-danger{color:var(--admin-danger)}.water-empty{min-height:240px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;padding:30px;text-align:center;color:var(--admin-muted)}.water-empty strong{color:var(--admin-text);font-size:14px}.water-empty span{font-size:12px}.water-empty .admin-btn{margin-top:8px}.spin-icon{animation:waterSpin 1s linear infinite}@keyframes waterSpin{to{transform:rotate(360deg)}}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}.modal-card{width:min(680px,100%);max-height:92vh;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:17px;box-shadow:0 24px 70px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;min-height:0}.modal-large{width:min(940px,100%)}.modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:19px 20px;border-bottom:1px solid var(--admin-border)}.modal-header h2{margin:0;font-size:18px;font-weight:850}.modal-header p{margin:5px 0 0;color:var(--admin-muted);font-size:12px}.modal-close{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer}.modal-body{overflow-y:auto;overflow-x:hidden;padding:20px;flex:1;min-height:0}.form-section{padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--admin-border)}.form-section:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}.form-section-title{font-size:14px;font-weight:850;margin-bottom:14px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field-full{grid-column:1/-1}.parameter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.parameter-box{padding:12px;border:1px solid var(--admin-border);background:var(--admin-surface-2);border-radius:11px}.parameter-box label{display:block;font-size:11px;font-weight:750;margin-bottom:7px;color:var(--admin-text)}.microbial-toggle-row{margin-bottom:15px}.toggle-label{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;cursor:pointer}.toggle-label input{width:16px;height:16px;accent-color:var(--admin-primary);cursor:pointer}.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--admin-border);background:var(--admin-surface-2)}.view-top-card{display:flex;align-items:center;gap:13px;padding:15px;border:1px solid var(--admin-border);border-radius:13px;background:var(--admin-surface-2);margin-bottom:18px}.view-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--admin-primary) 13%,transparent);color:var(--admin-primary);flex:none}.view-top-card>div:nth-child(2){display:flex;flex-direction:column;gap:4px;min-width:0}.view-top-card>div:nth-child(2) strong{font-size:15px}.view-top-card>div:nth-child(2) span{font-size:11px;color:var(--admin-muted)}.view-top-card>.status-badge{margin-left:auto}.details-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-bottom:18px}.detail-box{border:1px solid var(--admin-border);border-radius:11px;padding:12px;background:var(--admin-surface-2);display:flex;flex-direction:column;gap:5px}.detail-box span{font-size:10px;color:var(--admin-muted);font-weight:700;text-transform:uppercase}.detail-box strong{font-size:13px}.view-section{padding:15px 0;border-top:1px solid var(--admin-border)}.view-section h3{margin:0 0 9px;font-size:13px;font-weight:850}.view-section p{margin:0;color:var(--admin-muted);font-size:12px;line-height:1.65;white-space:pre-wrap}.microbial-view-grid,.treatment-view-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.microbial-view-grid>div,.treatment-view-grid>div{padding:11px;border-radius:10px;background:var(--admin-surface-2);border:1px solid var(--admin-border);display:flex;flex-direction:column;gap:4px}.microbial-view-grid span,.treatment-view-grid span{font-size:10px;color:var(--admin-muted);font-weight:700}.microbial-view-grid strong,.treatment-view-grid strong{font-size:12px}@media(max-width:1100px){.water-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.water-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.parameter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.water-quality-page{padding:15px}.water-quality-header{align-items:flex-start;flex-direction:column}.water-quality-header-actions{width:100%;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.water-quality-header-actions .top-action-btn{flex:1}.water-quality-header h1{font-size:21px}.water-filter-grid{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}.field-full{grid-column:auto}.parameter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.details-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.view-top-card{align-items:flex-start;flex-wrap:wrap}.view-top-card>.status-badge{margin-left:55px}.microbial-view-grid,.treatment-view-grid{grid-template-columns:1fr}}@media(max-width:480px){.water-summary-grid{grid-template-columns:1fr}.water-quality-title-row{align-items:flex-start}.water-quality-title-icon{width:40px;height:40px}.modal-overlay{padding:8px}.modal-card{max-height:96vh;border-radius:13px}.modal-header,.modal-body,.modal-footer{padding:14px}.parameter-grid{grid-template-columns:1fr}.details-grid{grid-template-columns:1fr}.view-top-card>.status-badge{margin-left:0}.modal-footer .admin-btn{flex:1}}`}</style>
    </div>
  );
}
