import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Filter, Plus, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const REPORT_TYPES = ["DAILY", "WEEKLY", "MONTHLY", "BATCH", "YEARLY", "CUSTOM"];

const emptyForm = {
  farm: "",
  batch: "",
  reportType: "CUSTOM",
  periodStart: "",
  periodEnd: "",
  notes: "",
};

const getId = (item) => item?._id || item?.id || "";

const getList = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;

  return [];
};

const getReport = (response) => {
  return response?.report || response?.data?.report || response?.data?.data || response?.data || null;
};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value, maximumFractionDigits = 2) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits,
  });
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

const formatDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getReportTypeLabel = (type) => {
  if (!type) return "-";

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getFarmName = (farm) => {
  if (!farm) return "-";
  return farm.name || farm.farmName || farm.code || "-";
};

const getBatchName = (batch) => {
  if (!batch) return "-";
  return batch.batchName || batch.batchNumber || "-";
};

const getProfitClass = (value) => {
  const amount = Number(value || 0);

  if (amount > 0) return "positive";
  if (amount < 0) return "negative";
  return "neutral";
};

export default function FarmReports() {
  const [farms, setFarms] = useState([]);
  const [batches, setBatches] = useState([]);

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    farm: "",
    batch: "",
    reportType: "",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState(emptyForm);

  const filteredFormBatches = useMemo(() => {
    if (!form.farm) return batches;

    return batches.filter((batch) => String(batch.farm?._id || batch.farm?.id || batch.farm || "") === String(form.farm));
  }, [batches, form.farm]);

  const displayedReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) => {
      const searchable = [report.reportType, report.notes, getFarmName(report.farm), getBatchName(report.batch), report.generatedBy?.name, report.generatedBy?.email].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    });
  }, [reports, search]);

  const summary = useMemo(() => {
    const totalRevenue = reports.reduce((sum, report) => sum + Number(report.revenue?.totalRevenue || 0), 0);

    const totalExpenses = reports.reduce((sum, report) => sum + Number(report.expenses?.totalExpenses || 0), 0);

    const totalProfit = reports.reduce((sum, report) => sum + Number(report.profitability?.grossProfit || 0), 0);

    const totalBirds = reports.reduce((sum, report) => sum + Number(report.birdStats?.closingBirds || 0), 0);

    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      totalBirds,
    };
  }, [reports]);

  const loadMasterData = async () => {
    try {
      const [farmsResponse, batchesResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/batches")]);

      setFarms(getList(farmsResponse, ["farms", "data"]));
      setBatches(getList(batchesResponse, ["batches", "data"]));
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load farms and batches"));
    }
  };

  const loadReports = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      if (!filters.farm) {
        setReports([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();

      params.set("farm", filters.farm);
      params.set("page", requestedPage);
      params.set("limit", limit);

      if (filters.batch) {
        params.set("batch", filters.batch);
      }

      if (filters.reportType) {
        params.set("reportType", filters.reportType);
      }

      const response = await apiRequest(`/farm-reports?${params.toString()}`);

      const list = getList(response, ["reports"]);

      const pagination = response?.pagination || {};

      setReports(list);
      setTotal(Number(pagination.total || list.length));
      setTotalPages(Math.max(Number(pagination.totalPages || Math.ceil(Number(pagination.total || list.length) / limit)), 1));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to load farm reports");

      setError(message);
      setReports([]);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadReports(page);
  }, [page, filters.farm, filters.batch, filters.reportType]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      farm: filters.farm || "",
      reportType: "CUSTOM",
      periodStart: new Date().toISOString().slice(0, 10),
      periodEnd: new Date().toISOString().slice(0, 10),
    });
  };

  const openGenerateModal = () => {
    resetForm();
    setShowGenerateModal(true);
  };

  const openViewModal = async (report) => {
    try {
      setLoadingDetails(true);

      const id = getId(report);

      const response = await apiRequest(`/farm-reports/${id}`);

      const data = getReport(response) || report;

      setSelectedReport(data);
      setShowViewModal(true);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load report details"));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "farm") {
        next.batch = "";
      }

      if (field === "reportType" && value !== "BATCH") {
        next.batch = "";
      }

      return next;
    });
  };

  const validateForm = () => {
    if (!form.farm) {
      showError("Please select a farm.");
      return false;
    }

    if (!form.reportType) {
      showError("Please select report type.");
      return false;
    }

    if (!form.periodStart || !form.periodEnd) {
      showError("Please select report start and end dates.");
      return false;
    }

    if (form.periodStart > form.periodEnd) {
      showError("Period start cannot be after period end.");
      return false;
    }

    if (form.reportType === "BATCH" && !form.batch) {
      showError("Please select a batch for batch report.");
      return false;
    }

    return true;
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        farm: form.farm,
        batch: form.batch || undefined,
        reportType: form.reportType,
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        notes: form.notes.trim(),
      };

      const response = await apiRequest("/farm-reports", {
        method: "POST",
        body: payload,
      });

      const generatedReport = getReport(response);

      showSuccess("Farm report generated successfully.");

      setShowGenerateModal(false);

      if (generatedReport) {
        setSelectedReport(generatedReport);
      }

      setPage(1);

      if (page === 1) {
        await loadReports(1);
      }
    } catch (err) {
      showError(getErrorMessage(err, "Failed to generate farm report"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (report) => {
    const id = getId(report);

    const result = await showConfirm({
      title: "Delete report?",
      text: "This generated report snapshot will be permanently deleted.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);

      await apiRequest(`/farm-reports/${id}`, {
        method: "DELETE",
      });

      showSuccess("Farm report deleted successfully.");

      if (reports.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadReports(page);
      }
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete farm report"));
    } finally {
      setDeletingId("");
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadMasterData(), loadReports(page)]);
  };

  const exportExcel = () => {
    if (!displayedReports.length) {
      showError("No reports available to export.");
      return;
    }

    const headers = ["Period Start", "Period End", "Report Type", "Farm", "Batch", "Revenue", "Expenses", "Profit", "Closing Birds", "Mortality %", "Generated At", "Generated By"];

    const rows = displayedReports.map((report) => [
      formatDate(report.periodStart),
      formatDate(report.periodEnd),
      getReportTypeLabel(report.reportType),
      getFarmName(report.farm),
      getBatchName(report.batch),
      Number(report.revenue?.totalRevenue || 0),
      Number(report.expenses?.totalExpenses || 0),
      Number(report.profitability?.grossProfit || 0),
      Number(report.birdStats?.closingBirds || 0),
      Number(report.birdStats?.mortalityPercentage || 0),
      formatDateTime(report.generatedAt),
      report.generatedBy?.name || report.generatedBy?.email || "-",
    ]);

    const escapeCsv = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\r\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `farm-reports-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showSuccess("Farm reports exported successfully.");
  };

  const exportPDF = () => {
    if (!displayedReports.length) {
      showError("No reports available to export.");
      return;
    }

    const rows = displayedReports
      .map(
        (report) => `
        <tr>
          <td>${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}</td>
          <td>${getReportTypeLabel(report.reportType)}</td>
          <td>${getFarmName(report.farm)}</td>
          <td>${getBatchName(report.batch)}</td>
          <td>₹${Number(report.revenue?.totalRevenue || 0).toLocaleString("en-IN")}</td>
          <td>₹${Number(report.expenses?.totalExpenses || 0).toLocaleString("en-IN")}</td>
          <td>₹${Number(report.profitability?.grossProfit || 0).toLocaleString("en-IN")}</td>
          <td>${Number(report.birdStats?.closingBirds || 0).toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Farm Reports</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#172033}
          h1{margin:0 0 6px;font-size:22px}
          p{margin:0 0 20px;color:#697386;font-size:13px}
          table{width:100%;border-collapse:collapse;font-size:11px}
          th,td{border:1px solid #dfe4ec;padding:8px;text-align:left}
          th{background:#f5f7fa;font-weight:700}
          @media print{body{padding:10px}}
        </style>
      </head>
      <body>
        <h1>Farm Reports</h1>
        <p>Generated on ${formatDateTime(new Date())}</p>

        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Type</th>
              <th>Farm</th>
              <th>Batch</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
              <th>Closing Birds</th>
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

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <>
      <div className="farm-reports-page">
        <div className="page-header">
          <div>
            <div className="eyebrow">
              <BarChart3 size={16} />
              FARM ANALYTICS
            </div>

            <h1>Farm Reports</h1>

            <p>Generate and review farm performance snapshots for selected periods.</p>
          </div>

          <div className="header-actions">
            <button type="button" className="top-action-btn refresh-action-btn" title="Refresh" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>

            <button type="button" className="top-action-btn excel-action-btn" title="Export Excel" onClick={exportExcel}>
              <FileSpreadsheet size={17} />
              <span>Excel</span>
            </button>

            <button type="button" className="top-action-btn pdf-action-btn" title="Export PDF" onClick={exportPDF}>
              <FileText size={17} />
              <span>PDF</span>
            </button>

            <button type="button" className="top-action-btn add-action-btn" onClick={openGenerateModal}>
              <Plus size={18} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon revenue">
              <TrendingUp size={21} />
            </div>

            <div>
              <span>Revenue</span>
              <strong>{formatCurrency(summary.totalRevenue)}</strong>
              <small>Current page records</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon expense">
              <TrendingDown size={21} />
            </div>

            <div>
              <span>Expenses</span>
              <strong>{formatCurrency(summary.totalExpenses)}</strong>
              <small>Current page records</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon profit">
              <BarChart3 size={21} />
            </div>

            <div>
              <span>Gross Profit</span>
              <strong>{formatCurrency(summary.totalProfit)}</strong>
              <small>{total} total reports</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon birds">
              <FileText size={21} />
            </div>

            <div>
              <span>Closing Birds</span>
              <strong>{formatNumber(summary.totalBirds, 0)}</strong>
              <small>Current page records</small>
            </div>
          </div>
        </div>

        <div className="filters-card">
          <div className="filters-heading">
            <div>
              <h2>
                <Filter size={17} />
                Report Filters
              </h2>

              <span>Farm is required by the report API. Select it to load reports.</span>
            </div>
          </div>

          <div className="filters-grid">
            <div className="field">
              <label>Search</label>

              <div className="input-icon search-field">
                <Search size={17} />

                <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports..." />

                {search && (
                  <button type="button" className="search-clear" title="Clear search" onClick={() => setSearch("")}>
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="field">
              <label>Farm</label>

              <select
                value={filters.farm}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    farm: event.target.value,
                    batch: "",
                  }));

                  setPage(1);
                }}>
                <option value="">Select Farm</option>

                {farms.map((farm) => (
                  <option key={getId(farm)} value={getId(farm)}>
                    {getFarmName(farm)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Batch</label>

              <select
                value={filters.batch}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    batch: event.target.value,
                  }));

                  setPage(1);
                }}
                disabled={!filters.farm}>
                <option value="">All Batches</option>

                {batches
                  .filter((batch) => {
                    if (!filters.farm) return false;

                    return String(batch.farm?._id || batch.farm?.id || batch.farm || "") === String(filters.farm);
                  })
                  .map((batch) => (
                    <option key={getId(batch)} value={getId(batch)}>
                      {getBatchName(batch)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="field">
              <label>Report Type</label>

              <select
                value={filters.reportType}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    reportType: event.target.value,
                  }));

                  setPage(1);
                }}>
                <option value="">All Report Types</option>

                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getReportTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Generated Reports</h2>

              <span>{filters.farm ? `Showing ${displayedReports.length} report${displayedReports.length === 1 ? "" : "s"}` : "Select a farm to load reports"}</span>
            </div>

            {filters.farm && <div className="record-count">{total} Total</div>}
          </div>

          {!filters.farm ? (
            <div className="state-box">
              <BarChart3 size={30} />

              <strong>Select a farm</strong>

              <span>Choose a farm from the filter above to view generated reports.</span>
            </div>
          ) : loading ? (
            <div className="state-box">
              <RefreshCw size={25} className="spin" />

              <strong>Loading reports...</strong>

              <span>Please wait while reports are being loaded.</span>
            </div>
          ) : error ? (
            <div className="state-box error-state">
              <strong>Unable to load reports</strong>

              <span>{error}</span>

              <button type="button" onClick={() => loadReports(page)}>
                Try Again
              </button>
            </div>
          ) : displayedReports.length === 0 ? (
            <div className="state-box empty-reports-state">
              <FileText size={30} />
              <strong>No reports found</strong>
              <span>Generate a new report for the selected farm and period.</span>

              <button type="button" className="add-report-btn" onClick={openGenerateModal}>
                <Plus size={17} />
                Add Report
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Type</th>
                      <th>Batch</th>
                      <th>Revenue</th>
                      <th>Expenses</th>
                      <th>Profit</th>
                      <th>Closing Birds</th>
                      <th>Mortality</th>
                      <th>Generated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedReports.map((report) => {
                      const profit = Number(report.profitability?.grossProfit || 0);

                      return (
                        <tr key={getId(report)}>
                          <td>
                            <div className="period-cell">
                              <strong>{formatDate(report.periodStart)}</strong>

                              <span>to {formatDate(report.periodEnd)}</span>
                            </div>
                          </td>

                          <td>
                            <span className="type-badge">{getReportTypeLabel(report.reportType)}</span>
                          </td>

                          <td>
                            <div className="batch-cell">
                              <strong>{getBatchName(report.batch)}</strong>

                              {report.batch?.birdType && <span>{report.batch.birdType}</span>}
                            </div>
                          </td>

                          <td className="revenue-text">{formatCurrency(report.revenue?.totalRevenue)}</td>

                          <td className="expense-text">{formatCurrency(report.expenses?.totalExpenses)}</td>

                          <td>
                            <span className={`profit-value ${getProfitClass(profit)}`}>{formatCurrency(profit)}</span>
                          </td>

                          <td>
                            <strong>{formatNumber(report.birdStats?.closingBirds, 0)}</strong>
                          </td>

                          <td>
                            <span className="mortality-value">{formatNumber(report.birdStats?.mortalityPercentage)}%</span>
                          </td>

                          <td>
                            <div className="generated-cell">
                              <strong>{formatDate(report.generatedAt)}</strong>

                              <span>{report.generatedBy?.name || report.generatedBy?.email || "-"}</span>
                            </div>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button type="button" className="icon-btn view" title="View Report" onClick={() => openViewModal(report)}>
                                <Eye size={17} />
                              </button>

                              <button type="button" className="icon-btn delete" title="Delete Report" disabled={deletingId === getId(report)} onClick={() => handleDelete(report)}>
                                {deletingId === getId(report) ? <RefreshCw size={17} className="spin" /> : <Trash2 size={17} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <span>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>

                <div className="pagination-buttons">
                  <button type="button" onClick={handlePreviousPage} disabled={page <= 1}>
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <button type="button" onClick={handleNextPage} disabled={page >= totalPages}>
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showGenerateModal && (
        <div className="modal-overlay" onMouseDown={() => setShowGenerateModal(false)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-kicker">NEW REPORT</span>
                <h2>Generate Farm Report</h2>
              </div>

              <button type="button" className="close-btn" onClick={() => setShowGenerateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerate}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Report Configuration</h3>

                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Farm <em>*</em>
                      </label>

                      <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} required>
                        <option value="">Select Farm</option>

                        {farms.map((farm) => (
                          <option key={getId(farm)} value={getId(farm)}>
                            {getFarmName(farm)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Report Type <em>*</em>
                      </label>

                      <select value={form.reportType} onChange={(event) => handleFormChange("reportType", event.target.value)} required>
                        {REPORT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {getReportTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Batch
                        {form.reportType === "BATCH" && <em> *</em>}
                      </label>

                      <select value={form.batch} onChange={(event) => handleFormChange("batch", event.target.value)} disabled={!form.farm || form.reportType !== "BATCH"}>
                        <option value="">{form.reportType === "BATCH" ? "Select Batch" : "Only for Batch Report"}</option>

                        {filteredFormBatches.map((batch) => (
                          <option key={getId(batch)} value={getId(batch)}>
                            {getBatchName(batch)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field"></div>

                    <div className="field">
                      <label>
                        Period Start <em>*</em>
                      </label>

                      <div className="input-icon">
                        <CalendarDays size={17} />

                        <input type="date" value={form.periodStart} onChange={(event) => handleFormChange("periodStart", event.target.value)} required />
                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Period End <em>*</em>
                      </label>

                      <div className="input-icon">
                        <CalendarDays size={17} />

                        <input type="date" value={form.periodEnd} onChange={(event) => handleFormChange("periodEnd", event.target.value)} required />
                      </div>
                    </div>

                    <div className="field full">
                      <label>Notes</label>

                      <textarea value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Add optional notes for this report..." rows={4} />
                    </div>
                  </div>
                </div>

                <div className="info-box">
                  <BarChart3 size={18} />

                  <div>
                    <strong>Report Snapshot</strong>

                    <span>The backend will calculate revenue, expenses, bird stock, mortality, eggs, feed, weight and profitability for the selected period.</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowGenerateModal(false)} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={17} />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedReport && (
        <div className="modal-overlay" onMouseDown={() => setShowViewModal(false)}>
          <div className="modal report-view-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-kicker">REPORT SNAPSHOT</span>

                <h2>{getReportTypeLabel(selectedReport.reportType)}</h2>

                <p className="modal-period">
                  {formatDate(selectedReport.periodStart)} — {formatDate(selectedReport.periodEnd)}
                </p>
              </div>

              <button type="button" className="close-btn" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {loadingDetails ? (
                <div className="state-box">
                  <RefreshCw size={25} className="spin" />
                  <strong>Loading report...</strong>
                </div>
              ) : (
                <>
                  <div className="report-overview">
                    <div className="overview-card revenue">
                      <span>Total Revenue</span>
                      <strong>{formatCurrency(selectedReport.revenue?.totalRevenue)}</strong>
                    </div>

                    <div className="overview-card expense">
                      <span>Total Expenses</span>
                      <strong>{formatCurrency(selectedReport.expenses?.totalExpenses)}</strong>
                    </div>

                    <div className="overview-card profit">
                      <span>Gross Profit</span>
                      <strong>{formatCurrency(selectedReport.profitability?.grossProfit)}</strong>
                    </div>

                    <div className="overview-card birds">
                      <span>Closing Birds</span>
                      <strong>{formatNumber(selectedReport.birdStats?.closingBirds, 0)}</strong>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <TrendingUp size={17} />
                      Revenue
                    </h3>

                    <div className="metric-grid">
                      <div className="metric-item">
                        <span>Sales</span>
                        <strong>{formatCurrency(selectedReport.revenue?.sales)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Other Income</span>
                        <strong>{formatCurrency(selectedReport.revenue?.otherIncome)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Total Revenue</span>
                        <strong>{formatCurrency(selectedReport.revenue?.totalRevenue)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <TrendingDown size={17} />
                      Expense Breakdown
                    </h3>

                    <div className="metric-grid">
                      {[
                        ["Feed", selectedReport.expenses?.feed],
                        ["Medicine", selectedReport.expenses?.medicine],
                        ["Vaccine", selectedReport.expenses?.vaccine],
                        ["Chicks", selectedReport.expenses?.chicks],
                        ["Labor", selectedReport.expenses?.labor],
                        ["Electricity", selectedReport.expenses?.electricity],
                        ["Water", selectedReport.expenses?.water],
                        ["Maintenance", selectedReport.expenses?.maintenance],
                        ["Transport", selectedReport.expenses?.transport],
                        ["Veterinary", selectedReport.expenses?.veterinary],
                        ["Other", selectedReport.expenses?.other],
                        ["Total Expenses", selectedReport.expenses?.totalExpenses],
                      ].map(([label, value]) => (
                        <div className="metric-item" key={label}>
                          <span>{label}</span>
                          <strong>{formatCurrency(value)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <BarChart3 size={17} />
                      Profitability
                    </h3>

                    <div className="metric-grid">
                      <div className="metric-item">
                        <span>Gross Profit</span>
                        <strong className={getProfitClass(selectedReport.profitability?.grossProfit)}>{formatCurrency(selectedReport.profitability?.grossProfit)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Profit Margin</span>
                        <strong>{formatNumber(selectedReport.profitability?.profitMarginPercentage)}%</strong>
                      </div>

                      <div className="metric-item">
                        <span>Cost / Bird</span>
                        <strong>{formatCurrency(selectedReport.profitability?.costPerBird)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Revenue / Bird</span>
                        <strong>{formatCurrency(selectedReport.profitability?.revenuePerBird)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <FileText size={17} />
                      Bird Statistics
                    </h3>

                    <div className="metric-grid">
                      <div className="metric-item">
                        <span>Opening Birds</span>
                        <strong>{formatNumber(selectedReport.birdStats?.openingBirds, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Inward Birds</span>
                        <strong>{formatNumber(selectedReport.birdStats?.inwardBirds, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Mortality</span>
                        <strong>{formatNumber(selectedReport.birdStats?.mortality, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Birds Sold</span>
                        <strong>{formatNumber(selectedReport.birdStats?.birdsSold, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Closing Birds</span>
                        <strong>{formatNumber(selectedReport.birdStats?.closingBirds, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Mortality %</span>
                        <strong>{formatNumber(selectedReport.birdStats?.mortalityPercentage)}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <FileText size={17} />
                      Egg Statistics
                    </h3>

                    <div className="metric-grid">
                      <div className="metric-item">
                        <span>Total Collected</span>
                        <strong>{formatNumber(selectedReport.eggStats?.totalCollected, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Good Eggs</span>
                        <strong>{formatNumber(selectedReport.eggStats?.goodEggs, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Damaged Eggs</span>
                        <strong>{formatNumber(selectedReport.eggStats?.damagedEggs, 0)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Cracked Eggs</span>
                        <strong>{formatNumber(selectedReport.eggStats?.crackedEggs, 0)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <BarChart3 size={17} />
                      Feed Statistics
                    </h3>

                    <div className="metric-grid">
                      <div className="metric-item">
                        <span>Total Consumed</span>
                        <strong>{formatNumber(selectedReport.feedStats?.totalConsumedKg)} kg</strong>
                      </div>

                      <div className="metric-item">
                        <span>Total Feed Cost</span>
                        <strong>{formatCurrency(selectedReport.feedStats?.totalFeedCost)}</strong>
                      </div>

                      <div className="metric-item">
                        <span>Average Feed / Bird</span>
                        <strong>{formatNumber(selectedReport.feedStats?.averageFeedPerBirdGram)} g</strong>
                      </div>

                      <div className="metric-item">
                        <span>FCR</span>
                        <strong>{formatNumber(selectedReport.feedStats?.fcr)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>
                      <TrendingUp size={17} />
                      Weight & Growth
                    </h3>

                    <div className="metric-grid">
                      <div className="metric-item">
                        <span>Average Weight</span>
                        <strong>{formatNumber(selectedReport.weightStats?.averageWeightKg)} kg</strong>
                      </div>

                      <div className="metric-item">
                        <span>Weight Gain</span>
                        <strong>{formatNumber(selectedReport.weightStats?.weightGainKg)} kg</strong>
                      </div>

                      <div className="metric-item">
                        <span>Average Daily Gain</span>
                        <strong>{formatNumber(selectedReport.weightStats?.averageDailyGainKg)} kg</strong>
                      </div>
                    </div>
                  </div>

                  <div className="report-meta">
                    <div>
                      <span>Farm</span>
                      <strong>{getFarmName(selectedReport.farm)}</strong>
                    </div>

                    <div>
                      <span>Batch</span>
                      <strong>{getBatchName(selectedReport.batch)}</strong>
                    </div>

                    <div>
                      <span>Generated At</span>
                      <strong>{formatDateTime(selectedReport.generatedAt)}</strong>
                    </div>

                    <div>
                      <span>Generated By</span>
                      <strong>{selectedReport.generatedBy?.name || selectedReport.generatedBy?.email || "-"}</strong>
                    </div>
                  </div>

                  {selectedReport.notes && (
                    <div className="notes-box">
                      <span>Notes</span>
                      <p>{selectedReport.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.empty-reports-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-align:center;padding:35px 20px}.empty-reports-state>span{font-size:13px;color:var(--admin-muted,#667085)}.add-report-btn{margin-top:8px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-primary,#4f46e5);background:var(--admin-primary,#4f46e5);color:#fff;border-radius:9px;padding:9px 13px;font-size:12px;font-weight:700;cursor:pointer;transition:.2s}.add-report-btn:hover{background:var(--admin-surface,#fff);color:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5)}.farm-reports-page{padding:24px;min-height:100%;background:var(--admin-bg,#f5f7fb);color:var(--admin-text,#172033)}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}.eyebrow{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--admin-primary,#4f46e5);margin-bottom:7px}.page-header h1{margin:0;font-size:28px;line-height:1.15;font-weight:800}.page-header p{margin:7px 0 0;color:var(--admin-muted,#697386);font-size:14px}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.primary-btn,.secondary-btn,.clear-btn,.pagination-buttons button,.state-box button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:10px 15px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s;border:1px solid transparent}.primary-btn{background:var(--admin-primary,#4f46e5);color:#fff}.primary-btn:hover:not(:disabled){background:#4338ca;color:#fff}.primary-btn:disabled,.secondary-btn:disabled,.pagination-buttons button:disabled{opacity:.55;cursor:not-allowed}.secondary-btn{background:var(--admin-surface,#fff);border-color:var(--admin-border,#e4e8ef);color:var(--admin-text,#172033)}.secondary-btn:hover{background:var(--admin-surface-2,#f8fafc)}.clear-btn{background:transparent;color:var(--admin-primary,#4f46e5);padding:7px 0}.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}.summary-card{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e4e8ef);border-radius:16px;padding:18px;display:flex;align-items:center;gap:14px;box-shadow:0 5px 18px rgba(15,23,42,.035)}.summary-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:none;background:rgba(79,70,229,.1);color:var(--admin-primary,#4f46e5)}.summary-icon.revenue{background:rgba(16,185,129,.1);color:#059669}.summary-icon.expense{background:rgba(239,68,68,.1);color:#dc2626}.summary-icon.profit{background:rgba(245,158,11,.12);color:#d97706}.summary-icon.birds{background:rgba(59,130,246,.1);color:#2563eb}.summary-card span{display:block;font-size:12px;color:var(--admin-muted,#697386);margin-bottom:3px}.summary-card strong{display:block;font-size:19px;font-weight:800}.summary-card small{display:block;margin-top:3px;color:var(--admin-muted,#697386);font-size:10px}.filters-card,.table-card{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e4e8ef);border-radius:16px;box-shadow:0 5px 18px rgba(15,23,42,.035)}.filters-card{padding:18px;margin-bottom:20px}.filters-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:16px}.filters-heading h2,.table-header h2{display:flex;align-items:center;gap:8px;margin:0;font-size:15px;font-weight:800}.filters-heading span,.table-header span{display:block;color:var(--admin-muted,#697386);font-size:12px;margin-top:4px}.filters-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.field{display:flex;flex-direction:column;gap:7px;min-width:0}.field.full{grid-column:1/-1}.field label{font-size:12px;font-weight:700;color:var(--admin-text,#30394d)}.field label em{font-style:normal;color:var(--admin-danger,#ef4444)}.field input,.field select,.field textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border,#dfe4ec);background:var(--admin-surface,#fff);color:var(--admin-text,#172033);border-radius:9px;padding:10px 11px;font:inherit;font-size:13px;outline:none;transition:.2s}.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--admin-primary,#4f46e5);box-shadow:0 0 0 3px rgba(79,70,229,.08)}.field textarea{resize:vertical;min-height:90px}.field input:disabled,.field select:disabled{background:var(--admin-surface-2,#f5f7fa);cursor:not-allowed}.input-icon{position:relative}.field input[type="date"]{color-scheme:light dark}.admin-theme-light .field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.search-field{position:relative}.search-field input{padding-right:34px}.search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:24px;height:24px;border:0;background:transparent;color:var(--admin-muted,#697386);display:flex;align-items:center;justify-content:center;padding:0;border-radius:6px;cursor:pointer}.search-clear:hover{color:var(--admin-text,#172033);background:transparent}.input-icon>svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted,#697386);pointer-events:none}.input-icon input{padding-left:36px}.table-header{padding:18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--admin-border,#e4e8ef)}.record-count{padding:6px 10px;border-radius:999px;background:rgba(79,70,229,.09);color:var(--admin-primary,#4f46e5);font-size:11px;font-weight:800}.table-wrap{overflow-x:auto}.table-wrap table{width:100%;border-collapse:collapse;min-width:1250px}.table-wrap th{padding:12px 14px;text-align:left;background:var(--admin-surface-2,#f8fafc);font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--admin-muted,#697386);font-weight:800;white-space:nowrap}.table-wrap td{padding:14px;border-top:1px solid var(--admin-border,#edf0f4);font-size:12px;vertical-align:middle;white-space:nowrap}.table-wrap tbody tr:hover{background:rgba(79,70,229,.025)}.period-cell,.batch-cell,.generated-cell{display:flex;flex-direction:column;gap:3px}.period-cell strong,.batch-cell strong,.generated-cell strong{font-size:12px}.period-cell span,.batch-cell span,.generated-cell span{font-size:10px;color:var(--admin-muted,#697386)}.type-badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;background:rgba(79,70,229,.09);color:var(--admin-primary,#4f46e5);font-size:10px;font-weight:800}.revenue-text{color:#059669;font-weight:800}.expense-text{color:#dc2626;font-weight:800}.profit-value{font-weight:800}.profit-value.positive{color:#059669}.profit-value.negative{color:#dc2626}.profit-value.neutral{color:var(--admin-muted,#697386)}.mortality-value{font-weight:700;color:#d97706}.action-buttons{display:flex;align-items:center;gap:6px}.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--admin-border,#e4e8ef);background:var(--admin-surface,#fff);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}.icon-btn.view{color:#2563eb}.icon-btn.delete{color:#dc2626}.icon-btn:hover{transform:translateY(-1px);background:var(--admin-surface-2,#f8fafc)}.icon-btn:disabled{opacity:.5;cursor:not-allowed}.pagination{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 18px;border-top:1px solid var(--admin-border,#e4e8ef);font-size:12px;color:var(--admin-muted,#697386)}.pagination-buttons{display:flex;gap:8px}.pagination-buttons button{background:var(--admin-surface,#fff);border-color:var(--admin-border,#e4e8ef);color:var(--admin-text,#172033);padding:8px 11px}.state-box{min-height:260px;padding:30px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;color:var(--admin-muted,#697386)}.state-box svg{margin-bottom:4px;color:var(--admin-primary,#4f46e5)}.state-box strong{color:var(--admin-text,#172033);font-size:15px}.state-box span{font-size:12px}.error-state svg{color:var(--admin-danger,#ef4444)}.empty-reports-action{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}.empty-reports-action>span{font-size:13px;color:var(--admin-muted,#697386)}.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.62);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}.modal{width:min(820px,100%);max-height:calc(100vh - 40px);background:var(--admin-surface,#fff);border-radius:18px;overflow:hidden;box-shadow:0 25px 80px rgba(15,23,42,.25);display:flex;flex-direction:column}.report-view-modal{width:min(920px,100%)}.modal-header{padding:18px 20px;border-bottom:1px solid var(--admin-border,#e4e8ef);display:flex;align-items:center;justify-content:space-between;gap:15px;flex:none}.modal-kicker{display:block;font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--admin-primary,#4f46e5);margin-bottom:4px}.modal-header h2{margin:0;font-size:19px}.modal-period{margin:5px 0 0;font-size:11px;color:var(--admin-muted,#697386)}.close-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--admin-border,#e4e8ef);background:transparent;color:var(--admin-muted,#697386);display:flex;align-items:center;justify-content:center;cursor:pointer}.close-btn:hover{background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033)}.modal-body{padding:20px;overflow-y:auto}.form-section{padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--admin-border,#edf0f4)}.form-section h3{margin:0 0 14px;font-size:13px;font-weight:800}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field.full{grid-column:1/-1}.info-box{display:flex;gap:12px;padding:13px 14px;border:1px solid rgba(79,70,229,.15);background:rgba(79,70,229,.05);border-radius:12px;color:var(--admin-primary,#4f46e5)}.info-box svg{flex:none;margin-top:1px}.info-box strong{display:block;font-size:12px;color:var(--admin-text,#172033);margin-bottom:3px}.info-box span{display:block;font-size:11px;line-height:1.5;color:var(--admin-muted,#697386)}.modal-footer{padding:15px 20px;border-top:1px solid var(--admin-border,#e4e8ef);display:flex;justify-content:flex-end;gap:9px;flex:none}.report-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:22px}.overview-card{padding:15px;border-radius:12px;border:1px solid var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.overview-card span{display:block;font-size:10px;color:var(--admin-muted,#697386);margin-bottom:5px}.overview-card strong{display:block;font-size:18px}.overview-card.revenue strong{color:#059669}.overview-card.expense strong{color:#dc2626}.overview-card.profit strong{color:#d97706}.overview-card.birds strong{color:#2563eb}.report-section{margin-bottom:20px}.report-section h3{display:flex;align-items:center;gap:7px;font-size:13px;margin:0 0 11px;font-weight:800}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--admin-border,#e4e8ef);border-radius:12px;overflow:hidden}.metric-item{padding:12px 13px;border-right:1px solid var(--admin-border,#e4e8ef);border-bottom:1px solid var(--admin-border,#e4e8ef)}.metric-item:nth-child(4n){border-right:0}.metric-item span{display:block;font-size:10px;color:var(--admin-muted,#697386);margin-bottom:4px}.metric-item strong{font-size:12px}.metric-item strong.positive{color:#059669}.metric-item strong.negative{color:#dc2626}.metric-item strong.neutral{color:var(--admin-muted,#697386)}.report-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:8px}.report-meta>div{padding:12px;background:var(--admin-surface-2,#f8fafc);border:1px solid var(--admin-border,#e4e8ef);border-radius:10px}.report-meta span,.notes-box>span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:var(--admin-muted,#697386);margin-bottom:4px}.report-meta strong{font-size:11px}.notes-box{margin-top:14px;padding:13px;background:var(--admin-surface-2,#f8fafc);border-radius:11px}.notes-box p{margin:0;font-size:12px;line-height:1.6;white-space:pre-wrap}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1100px){.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.report-overview{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.metric-item:nth-child(4n){border-right:1px solid var(--admin-border,#e4e8ef)}.metric-item:nth-child(3n){border-right:0}.report-meta{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:800px){.farm-reports-page{padding:16px}.page-header{align-items:flex-start;flex-direction:column}.header-actions{width:100%;justify-content:flex-start;gap:8px}.header-actions .top-action-btn{flex:1}.header-actions .refresh-action-btn{flex:0 0 40px}.summary-grid{grid-template-columns:1fr 1fr}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-item:nth-child(3n){border-right:1px solid var(--admin-border,#e4e8ef)}.metric-item:nth-child(2n){border-right:0}.report-meta{grid-template-columns:1fr 1fr}}@media(max-width:560px){.farm-reports-page{padding:12px}.page-header h1{font-size:23px}.header-actions{width:100%;flex-wrap:wrap}.header-actions .top-action-btn{flex:1 1 calc(33.333% - 6px)}.header-actions .refresh-action-btn{flex:0 0 40px}.header-actions .add-action-btn{flex:1 1 100%}.summary-grid{grid-template-columns:1fr}.filters-grid{grid-template-columns:1fr}.filters-heading{align-items:flex-start;flex-direction:column}.filters-card,.table-card{border-radius:12px}.pagination{align-items:flex-start;flex-direction:column}.pagination-buttons{width:100%}.pagination-buttons button{flex:1}.modal-overlay{padding:8px}.modal{max-height:calc(100vh - 16px);border-radius:14px}.modal-header,.modal-body,.modal-footer{padding:14px}.modal-footer{flex-direction:column-reverse}.modal-footer button{width:100%}.report-overview{grid-template-columns:1fr}.metric-grid{grid-template-columns:1fr 1fr}.metric-item:nth-child(3n){border-right:1px solid var(--admin-border,#e4e8ef)}.metric-item:nth-child(2n){border-right:0}.report-meta{grid-template-columns:1fr}.filters-heading h2{font-size:14px}}`}</style>
    </>
  );
}
