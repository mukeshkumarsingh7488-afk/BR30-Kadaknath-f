import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Bird, ChevronLeft, ChevronRight, Download, Eye, FileSpreadsheet, FileText, Filter, RefreshCw, Search, ShoppingCart, Skull, Warehouse, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showError } from "../../../utils/sweetAlert";

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

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const formatDecimal = (value) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

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

const formatStatus = (value) => {
  if (!value) return "-";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClass = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE") return "active";
  if (value === "COMPLETED") return "completed";
  if (value === "CANCELLED") return "cancelled";
  if (value === "CLOSED") return "closed";

  return "neutral";
};

const escapeCsv = (value) =>
  `"${String(value ?? "")
    .replace(/"/g, '""')
    .replace(/\r?\n/g, " ")}"`;

const escapeHtml = (value) =>
  String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const BirdStock = () => {
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedFarm, setSelectedFarm] = useState("");
  const [farmsLoaded, setFarmsLoaded] = useState(false);
  const [selectedShed, setSelectedShed] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBirdType, setSelectedBirdType] = useState("");

  const [search, setSearch] = useState("");

  const [stock, setStock] = useState([]);

  const [summary, setSummary] = useState({
    totalInitialBirds: 0,
    totalCurrentBirds: 0,
    totalMaleBirds: 0,
    totalFemaleBirds: 0,
    totalTransportMortality: 0,
    totalFarmMortality: 0,
    totalMortality: 0,
    totalBirdsSold: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState("");

  const [viewingStock, setViewingStock] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");
      const farmList = getArray(response, ["farms"]);

      setFarms(farmList);

      if (!selectedFarm && farmList.length === 1) {
        setSelectedFarm(getId(farmList[0]));
      }
    } catch (err) {
      showError(err?.message || "Failed to load farms.");
    } finally {
      setFarmsLoaded(true);
    }
  };

  const loadSheds = async (farmId) => {
    if (!farmId) {
      setSheds([]);
      return;
    }

    try {
      setLoadingOptions(true);

      const response = await apiRequest(`/sheds?farm=${encodeURIComponent(farmId)}`);

      setSheds(getArray(response, ["sheds"]));
    } catch (err) {
      setSheds([]);
      showError(err?.message || "Failed to load sheds.");
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

      const params = new URLSearchParams();

      params.set("farm", farmId);

      if (shedId) {
        params.set("shed", shedId);
      }

      const response = await apiRequest(`/batches?${params.toString()}`);

      setBatches(getArray(response, ["batches"]));
    } catch (err) {
      setBatches([]);
      showError(err?.message || "Failed to load batches.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadStock = async (page = 1) => {
    if (!selectedFarm) {
      setStock([]);

      setSummary({
        totalInitialBirds: 0,
        totalCurrentBirds: 0,
        totalMaleBirds: 0,
        totalFemaleBirds: 0,
        totalTransportMortality: 0,
        totalFarmMortality: 0,
        totalMortality: 0,
        totalBirdsSold: 0,
      });

      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("farm", selectedFarm);
      params.set("page", String(page));
      params.set("limit", "20");

      if (selectedBatch) {
        params.set("batch", selectedBatch);
      }

      if (selectedShed) {
        params.set("shed", selectedShed);
      }

      if (selectedStatus) {
        params.set("status", selectedStatus);
      }

      if (selectedBirdType) {
        params.set("birdType", selectedBirdType);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await apiRequest(`/bird-stock?${params.toString()}`);

      const root = response;

      setStock(getArray(response, ["data", "stocks", "stock"]));

      setSummary(
        root?.summary || {
          totalInitialBirds: 0,
          totalCurrentBirds: 0,
          totalMaleBirds: 0,
          totalFemaleBirds: 0,
          totalTransportMortality: 0,
          totalFarmMortality: 0,
          totalMortality: 0,
          totalBirdsSold: 0,
        }
      );

      setPagination(
        root?.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      setStock([]);
      setError(err?.message || "Failed to load bird stock.");
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

    setSelectedShed("");
    setSelectedBatch("");

    loadSheds(selectedFarm);
    loadBatches(selectedFarm);
  }, [selectedFarm]);

  useEffect(() => {
    if (!selectedFarm) return;

    setSelectedBatch("");

    loadBatches(selectedFarm, selectedShed);
  }, [selectedShed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStock(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedFarm, selectedShed, selectedBatch, selectedStatus, selectedBirdType, search]);

  const selectedFarmData = useMemo(() => farms.find((farm) => getId(farm) === selectedFarm), [farms, selectedFarm]);

  const openViewModal = async (item) => {
    if (!selectedFarm || !item?.batchId) {
      showError("Farm or batch information is missing.");
      return;
    }

    try {
      setViewLoading(true);
      setViewingStock(null);

      const response = await apiRequest(`/bird-stock/${selectedFarm}/${item.batchId}`);

      const root = response;

      const detail = root?.data || root?.stock || root?.birdStock || root;

      if (!detail || typeof detail !== "object") {
        throw new Error("Bird stock details not found.");
      }

      setViewingStock(detail);
    } catch (err) {
      showError(err?.message || "Failed to load bird stock details.");
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    if (viewLoading) return;

    setViewingStock(null);
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) {
      return;
    }

    loadStock(page);
  };

  const handleRefresh = async () => {
    await Promise.all([loadFarms(), selectedFarm ? loadStock(pagination.page) : Promise.resolve()]);
  };

  const exportExcel = () => {
    if (!stock.length) {
      showError("No bird stock data available to export.");
      return;
    }

    const headers = [
      "Batch Number",
      "Batch Name",
      "Farm",
      "Shed",
      "Bird Type",
      "Breed",
      "Arrival Date",
      "Initial Birds",
      "Current Birds",
      "Initial Male",
      "Initial Female",
      "Current Male",
      "Current Female",
      "Transport Mortality",
      "Farm Mortality",
      "Total Mortality",
      "Mortality %",
      "Birds Sold",
      "Stock Utilization %",
      "Status",
    ];

    const rows = stock.map((item) => [
      item.batchNumber,
      item.batchName,
      selectedFarmData?.name || selectedFarmData?.code || "",
      item.shed?.name || item.shed?.code || "",
      formatStatus(item.birdType),
      item.breed,
      formatDate(item.arrivalDate),
      item.initialQuantity,
      item.currentQuantity,
      item.initialMale,
      item.initialFemale,
      item.currentMale,
      item.currentFemale,
      item.transportMortality,
      item.farmMortality,
      item.totalMortality,
      item.mortalityPercentage,
      item.birdsSold,
      item.stockUtilizationPercentage,
      formatStatus(item.status),
    ]);

    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `bird-stock-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!stock.length) {
      showError("No bird stock data available to export.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const farmName = selectedFarmData?.name || selectedFarmData?.code || "Farm";

    const rows = stock
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.batchNumber)}</td>
            <td>${escapeHtml(item.batchName || "-")}</td>
            <td>${escapeHtml(item.shed?.name || item.shed?.code || "-")}</td>
            <td>${escapeHtml(formatStatus(item.birdType))}</td>
            <td>${escapeHtml(item.breed || "-")}</td>
            <td>${escapeHtml(formatNumber(item.initialQuantity))}</td>
            <td>${escapeHtml(formatNumber(item.currentQuantity))}</td>
            <td>${escapeHtml(formatNumber(item.currentMale))}</td>
            <td>${escapeHtml(formatNumber(item.currentFemale))}</td>
            <td>${escapeHtml(formatNumber(item.totalMortality))}</td>
            <td>${escapeHtml(formatNumber(item.birdsSold))}</td>
            <td>${escapeHtml(formatDecimal(item.stockUtilizationPercentage))}%</td>
            <td>${escapeHtml(formatStatus(item.status))}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bird Stock Report</title>
          <style>
            *{box-sizing:border-box}
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#172033}
            h1{margin:0 0 6px;font-size:24px}
            .meta{font-size:12px;color:#64748b;margin-bottom:18px}
            .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
            .summary-box{border:1px solid #dbe1ea;border-radius:8px;padding:10px}
            .summary-label{font-size:10px;color:#64748b}
            .summary-value{font-size:17px;font-weight:700;margin-top:3px}
            table{width:100%;border-collapse:collapse;font-size:9px}
            th{background:#f1f5f9;font-weight:700;text-align:left}
            th,td{border:1px solid #dbe1ea;padding:7px}
            tr{page-break-inside:avoid}
            @media print{
              body{margin:10px}
              .no-print{display:none}
            }
          </style>
        </head>
        <body>
          <h1>Bird Stock Report</h1>
          <div class="meta">
            Farm: ${escapeHtml(farmName)}
            &nbsp; | &nbsp;
            Generated: ${escapeHtml(new Date().toLocaleString("en-IN"))}
          </div>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-label">Initial Birds</div>
              <div class="summary-value">${escapeHtml(formatNumber(summary.totalInitialBirds))}</div>
            </div>

            <div class="summary-box">
              <div class="summary-label">Current Birds</div>
              <div class="summary-value">${escapeHtml(formatNumber(summary.totalCurrentBirds))}</div>
            </div>

            <div class="summary-box">
              <div class="summary-label">Total Mortality</div>
              <div class="summary-value">${escapeHtml(formatNumber(summary.totalMortality))}</div>
            </div>

            <div class="summary-box">
              <div class="summary-label">Birds Sold</div>
              <div class="summary-value">${escapeHtml(formatNumber(summary.totalBirdsSold))}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Batch Name</th>
                <th>Shed</th>
                <th>Bird Type</th>
                <th>Breed</th>
                <th>Initial</th>
                <th>Current</th>
                <th>Male</th>
                <th>Female</th>
                <th>Mortality</th>
                <th>Sold</th>
                <th>Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="bird-stock-page">
      <style>{`
        .bird-stock-page{padding:24px;min-height:100%;background:var(--admin-bg);color:var(--admin-text)}.bird-stock-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.bird-stock-eyebrow{display:flex;align-items:center;gap:7px;color:var(--admin-primary);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}.bird-stock-header h1{margin:0;font-size:28px;line-height:1.2;font-weight:800}.bird-stock-header p{margin:7px 0 0;color:var(--admin-muted);font-size:14px;line-height:1.6}.bird-stock-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.bird-stock-stats{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:13px;margin-bottom:18px}.bird-stock-stat{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px;display:flex;align-items:center;gap:12px;min-width:0;box-shadow:0 4px 18px rgba(0,0,0,.04)}.bird-stock-stat-icon{width:42px;height:42px;flex:0 0 42px;border-radius:11px;background:var(--admin-primary-soft);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.bird-stock-stat-icon.blue{background:rgba(59,130,246,.12);color:#3b82f6}.bird-stock-stat-icon.red{background:rgba(239,68,68,.12);color:#ef4444}.bird-stock-stat-icon.orange{background:rgba(245,158,11,.12);color:#f59e0b}.bird-stock-stat-icon.purple{background:rgba(139,92,246,.12);color:#8b5cf6}.bird-stock-stat-icon.green{background:rgba(34,197,94,.12);color:#22c55e}.bird-stock-stat-icon.cyan{background:rgba(6,182,212,.12);color:#0891b2}.bird-stock-stat-label{font-size:11px;color:var(--admin-muted);font-weight:700;white-space:nowrap}.bird-stock-stat-value{margin-top:3px;font-size:21px;font-weight:800;white-space:nowrap}.bird-stock-toolbar{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:14px;margin-bottom:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.bird-stock-search{position:relative;flex:1;min-width:220px}.bird-stock-search>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--admin-muted)}.bird-stock-search input,.bird-stock-filter{height:40px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);outline:none;font-size:13px}.bird-stock-search input{width:100%;padding:0 38px 0 38px}.bird-stock-search-clear{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.bird-stock-search-clear:hover{background:var(--admin-primary-soft);color:var(--admin-primary)}.bird-stock-filter{min-width:145px;padding:0 11px}.bird-stock-search input:focus,.bird-stock-filter:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px var(--admin-primary-soft)}.bird-stock-filter:disabled{opacity:.55;cursor:not-allowed}.bird-stock-filter-label{display:inline-flex;align-items:center;gap:6px;color:var(--admin-muted);font-size:12px;font-weight:700}.bird-stock-table-wrap{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:auto;box-shadow:0 4px 18px rgba(0,0,0,.04)}.bird-stock-table{width:100%;border-collapse:collapse;min-width:1450px}.bird-stock-table th{padding:13px 14px;text-align:left;background:var(--admin-surface-2);border-bottom:1px solid var(--admin-border);color:var(--admin-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}.bird-stock-table td{padding:14px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.bird-stock-table tbody tr:last-child td{border-bottom:0}.bird-stock-table tbody tr:hover{background:var(--admin-surface-2)}.bird-stock-main{font-weight:800;color:var(--admin-text)}.bird-stock-sub{margin-top:3px;color:var(--admin-muted);font-size:11px}.bird-stock-number{font-size:15px;font-weight:800}.bird-stock-gender{display:flex;align-items:center;gap:6px}.bird-stock-gender-badge{min-width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900}.bird-stock-gender-badge.male{background:rgba(59,130,246,.12);color:#3b82f6}.bird-stock-gender-badge.female{background:rgba(236,72,153,.12);color:#ec4899}.bird-stock-total{font-size:16px;font-weight:900}.bird-stock-mortality-cell{display:flex;flex-direction:column;gap:3px;min-width:110px}.bird-stock-mortality-line{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:var(--admin-muted)}.bird-stock-mortality-line strong{font-size:12px;color:var(--admin-text)}.bird-stock-mortality-line.total{padding-top:4px;margin-top:2px;border-top:1px dashed var(--admin-border);color:var(--admin-text)}.bird-stock-mortality-line.total strong{font-size:14px}.bird-stock-mortality-percent{margin-top:3px;font-size:10px;color:var(--admin-muted)}.bird-stock-status{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap}.bird-stock-status.active{background:rgba(34,197,94,.12);color:#22c55e}.bird-stock-status.completed{background:rgba(59,130,246,.12);color:#3b82f6}.bird-stock-status.cancelled{background:rgba(239,68,68,.12);color:#ef4444}.bird-stock-status.closed{background:rgba(107,114,128,.12);color:#6b7280}.bird-stock-status.neutral{background:var(--admin-primary-soft);color:var(--admin-primary)}.bird-stock-progress{width:95px;height:6px;border-radius:99px;background:var(--admin-border);overflow:hidden;margin-top:6px}.bird-stock-progress span{display:block;height:100%;border-radius:inherit;background:var(--admin-primary)}.bird-stock-percent{font-size:10px;color:var(--admin-muted)}.bird-stock-action{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-bg);color:var(--admin-muted);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.bird-stock-action:hover{border-color:var(--admin-primary);color:var(--admin-primary)}.bird-stock-state{padding:58px 20px;text-align:center;color:var(--admin-muted)}.bird-stock-state svg{margin-bottom:10px}.bird-stock-state h3{margin:0 0 5px;color:var(--admin-text);font-size:16px}.bird-stock-state p{margin:0;font-size:13px;line-height:1.5}.bird-stock-error{margin-bottom:18px;padding:12px 14px;border:1px solid rgba(239,68,68,.25);border-radius:10px;background:rgba(239,68,68,.08);color:#ef4444;font-size:13px}.bird-stock-pagination{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 16px;border-top:1px solid var(--admin-border);background:var(--admin-surface)}.bird-stock-pagination-info{font-size:12px;color:var(--admin-muted)}.bird-stock-pagination-actions{display:flex;align-items:center;gap:7px}.bird-stock-page-btn{width:35px;height:35px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-bg);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer}.bird-stock-page-btn:hover:not(:disabled){border-color:var(--admin-primary);color:var(--admin-primary)}.bird-stock-page-btn:disabled{opacity:.45;cursor:not-allowed}.bird-stock-page-number{height:35px;min-width:35px;padding:0 9px;border:1px solid var(--admin-primary);border-radius:8px;background:var(--admin-primary-soft);color:var(--admin-primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}.bird-stock-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000}.bird-stock-modal{width:min(820px,100%);max-height:90vh;overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.3)}.bird-stock-modal-header{padding:18px 20px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:15px}.bird-stock-modal-header h2{margin:0;font-size:18px}.bird-stock-modal-header p{margin:5px 0 0;color:var(--admin-muted);font-size:12px}.bird-stock-close{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-bg);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.bird-stock-close:hover{color:var(--admin-text);border-color:var(--admin-primary)}.bird-stock-detail-top{padding:20px;display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.bird-stock-detail-stat{padding:15px;border:1px solid var(--admin-border);border-radius:11px;background:var(--admin-bg);text-align:center}.bird-stock-detail-stat strong{display:block;font-size:21px;font-weight:900}.bird-stock-detail-stat span{display:block;margin-top:4px;font-size:11px;color:var(--admin-muted);font-weight:700}.bird-stock-detail-grid{padding:0 20px 20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.bird-stock-detail-item{padding:13px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-bg)}.bird-stock-detail-label{font-size:11px;color:var(--admin-muted);font-weight:700;margin-bottom:5px}.bird-stock-detail-value{font-size:14px;font-weight:800;color:var(--admin-text);word-break:break-word}.bird-stock-detail-full{grid-column:1/-1}.bird-stock-modal-footer{padding:14px 20px;border-top:1px solid var(--admin-border);display:flex;justify-content:flex-end}.bird-stock-loading-detail{padding:55px 20px;text-align:center;color:var(--admin-muted)}@keyframes bird-stock-spin{to{transform:rotate(360deg)}}.bird-stock-spin{animation:bird-stock-spin .8s linear infinite}@media(max-width:1450px){.bird-stock-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:1250px){.bird-stock-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:850px){.bird-stock-page{padding:17px}.bird-stock-header{flex-direction:column}.bird-stock-actions{width:100%}.bird-stock-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.bird-stock-toolbar{align-items:stretch}.bird-stock-search{min-width:100%}.bird-stock-filter{flex:1;min-width:130px}.bird-stock-detail-top{grid-template-columns:repeat(3,1fr)}}@media(max-width:560px){.bird-stock-page{padding:14px}.bird-stock-header h1{font-size:23px}.bird-stock-header p{font-size:13px}.bird-stock-actions{width:100%;display:grid;grid-template-columns:40px minmax(0,1fr) minmax(0,1fr);gap:6px}.bird-stock-actions .top-action-btn{min-width:0;padding:0 8px;font-size:11px}.bird-stock-actions .refresh-action-btn{width:40px;padding:0}.bird-stock-stats{grid-template-columns:1fr}.bird-stock-stat{padding:14px}.bird-stock-toolbar{flex-direction:column}.bird-stock-search{width:100%;min-width:0}.bird-stock-filter{width:100%}.bird-stock-pagination{flex-direction:column;align-items:flex-start}.bird-stock-pagination-actions{width:100%;justify-content:space-between}.bird-stock-detail-top,.bird-stock-detail-grid{grid-template-columns:1fr}.bird-stock-detail-full{grid-column:auto}.bird-stock-modal-footer .bird-stock-btn{width:100%}}
      `}</style>

      <div className="bird-stock-header">
        <div>
          <div className="bird-stock-eyebrow">
            <Bird size={14} />
            Farm OS
          </div>

          <h1>Bird Stock</h1>

          <p>Live batch-wise bird stock, mortality, sales and current availability.</p>
        </div>

        <div className="bird-stock-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || !selectedFarm} title="Refresh">
            <RefreshCw size={17} className={loading ? "bird-stock-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} disabled={loading || !stock.length} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} disabled={loading || !stock.length} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>
        </div>
      </div>

      {farmsLoaded && !selectedFarm && <div className="bird-stock-error">Please select a farm to view bird stock.</div>}

      {error && <div className="bird-stock-error">{error}</div>}

      <div className="bird-stock-stats">
        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon">
            <Bird size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Initial Birds</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalInitialBirds)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon green">
            <Activity size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Current Birds</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalCurrentBirds)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon blue">
            <Bird size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Male Birds</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalMaleBirds)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon purple">
            <Bird size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Female Birds</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalFemaleBirds)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon cyan">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Transport Mortality</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalTransportMortality)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon orange">
            <Skull size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Farm Mortality</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalFarmMortality)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon red">
            <Skull size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Total Mortality</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalMortality)}</div>
          </div>
        </div>

        <div className="bird-stock-stat">
          <div className="bird-stock-stat-icon orange">
            <ShoppingCart size={20} />
          </div>
          <div>
            <div className="bird-stock-stat-label">Birds Sold</div>
            <div className="bird-stock-stat-value">{formatNumber(summary.totalBirdsSold)}</div>
          </div>
        </div>
      </div>

      <div className="bird-stock-toolbar">
        <div className="bird-stock-filter-label">
          <Filter size={15} />
          Filters
        </div>

        <select className="bird-stock-filter" value={selectedFarm} onChange={(event) => setSelectedFarm(event.target.value)}>
          <option value="">Select Farm</option>

          {farms.map((farm) => (
            <option key={getId(farm)} value={getId(farm)}>
              {farm?.name || farm?.code || "Farm"}
            </option>
          ))}
        </select>

        <select className="bird-stock-filter" value={selectedShed} onChange={(event) => setSelectedShed(event.target.value)} disabled={!selectedFarm || loadingOptions}>
          <option value="">All Sheds</option>

          {sheds.map((shed) => (
            <option key={getId(shed)} value={getId(shed)}>
              {shed?.name || shed?.code || "Shed"}
            </option>
          ))}
        </select>

        <select className="bird-stock-filter" value={selectedBatch} onChange={(event) => setSelectedBatch(event.target.value)} disabled={!selectedFarm || loadingOptions}>
          <option value="">All Batches</option>

          {batches.map((batch) => (
            <option key={getId(batch)} value={getId(batch)}>
              {batch?.batchNumber || batch?.batchName || "Batch"}
            </option>
          ))}
        </select>

        <select className="bird-stock-filter" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} disabled={!selectedFarm}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select className="bird-stock-filter" value={selectedBirdType} onChange={(event) => setSelectedBirdType(event.target.value)} disabled={!selectedFarm}>
          <option value="">All Bird Types</option>
          <option value="CHICKS">Chicks</option>
          <option value="BIRD">Bird</option>
          <option value="KADAKNATH">Kadaknath</option>
        </select>

        <div className="bird-stock-search">
          <Search size={16} />

          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search batch, breed..." disabled={!selectedFarm} />

          {search && (
            <button type="button" className="bird-stock-search-clear" onClick={() => setSearch("")} title="Clear search">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="bird-stock-table-wrap">
        {!farmsLoaded ? (
          <div className="bird-stock-state">
            <RefreshCw size={30} className="bird-stock-spin" />
            <h3>Loading farms...</h3>
            <p>Preparing bird stock...</p>
          </div>
        ) : !selectedFarm ? (
          <div className="bird-stock-state">
            <Warehouse size={36} />
            <h3>Select a farm</h3>
            <p>Choose a farm above to load its live bird stock.</p>
          </div>
        ) : loading ? (
          <div className="bird-stock-state">
            <RefreshCw size={30} className="bird-stock-spin" />
            <h3>Loading bird stock...</h3>
            <p>Fetching live stock information from the farm.</p>
          </div>
        ) : stock.length === 0 ? (
          <div className="bird-stock-state">
            <Bird size={36} />
            <h3>No bird stock found</h3>
            <p>No batches match the selected filters.</p>
          </div>
        ) : (
          <>
            <table className="bird-stock-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Farm / Shed</th>
                  <th>Bird Type</th>
                  <th>Initial</th>
                  <th>Current</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Mortality</th>
                  <th>Sold</th>
                  <th>Utilization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {stock.map((item) => (
                  <tr key={String(item.batchId)}>
                    <td>
                      <div className="bird-stock-main">{item.batchNumber || "-"}</div>

                      {item.batchName && <div className="bird-stock-sub">{item.batchName}</div>}

                      <div className="bird-stock-sub">Arrived: {formatDate(item.arrivalDate)}</div>
                    </td>

                    <td>
                      <div className="bird-stock-main">{selectedFarmData?.name || selectedFarmData?.code || "-"}</div>

                      <div className="bird-stock-sub">{item.shed?.name || item.shed?.code || "No shed"}</div>
                    </td>

                    <td>
                      <div className="bird-stock-main">{formatStatus(item.birdType)}</div>

                      <div className="bird-stock-sub">{item.breed || "-"}</div>
                    </td>

                    <td>
                      <span className="bird-stock-number">{formatNumber(item.initialQuantity)}</span>
                    </td>

                    <td>
                      <span className="bird-stock-total">{formatNumber(item.currentQuantity)}</span>
                    </td>

                    <td>
                      <div className="bird-stock-gender">
                        <span className="bird-stock-gender-badge male">M</span>
                        {formatNumber(item.currentMale)}
                      </div>
                    </td>

                    <td>
                      <div className="bird-stock-gender">
                        <span className="bird-stock-gender-badge female">F</span>
                        {formatNumber(item.currentFemale)}
                      </div>
                    </td>

                    <td>
                      <div className="bird-stock-mortality-cell">
                        <div className="bird-stock-mortality-line">
                          <span>Transport</span>
                          <strong>{formatNumber(item.transportMortality)}</strong>
                        </div>

                        <div className="bird-stock-mortality-line">
                          <span>Farm</span>
                          <strong>{formatNumber(item.farmMortality)}</strong>
                        </div>

                        <div className="bird-stock-mortality-line total">
                          <span>Total</span>
                          <strong>{formatNumber(item.totalMortality)}</strong>
                        </div>

                        <div className="bird-stock-mortality-percent">{formatDecimal(item.mortalityPercentage)}%</div>
                      </div>
                    </td>

                    <td>
                      <span className="bird-stock-number">{formatNumber(item.birdsSold)}</span>
                    </td>

                    <td>
                      <div className="bird-stock-percent">{formatDecimal(item.stockUtilizationPercentage)}%</div>

                      <div className="bird-stock-progress">
                        <span
                          style={{
                            width: `${Math.min(Math.max(Number(item.stockUtilizationPercentage || 0), 0), 100)}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className={`bird-stock-status ${getStatusClass(item.status)}`}>{formatStatus(item.status)}</span>
                    </td>

                    <td>
                      <button type="button" className="bird-stock-action" title="View batch stock" onClick={() => openViewModal(item)}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination.total > 0 && (
              <div className="bird-stock-pagination">
                <div className="bird-stock-pagination-info">
                  Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> - <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong>{pagination.total}</strong> batches
                </div>

                <div className="bird-stock-pagination-actions">
                  <button type="button" className="bird-stock-page-btn" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1 || loading}>
                    <ChevronLeft size={16} />
                  </button>

                  <span className="bird-stock-page-number">
                    {pagination.page} / {pagination.totalPages || 1}
                  </span>

                  <button type="button" className="bird-stock-page-btn" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || loading}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(viewLoading || viewingStock) && (
        <div className="bird-stock-overlay">
          <div className="bird-stock-modal">
            <div className="bird-stock-modal-header">
              <div>
                <h2>Bird Stock Details</h2>

                <p>{viewingStock?.batchNumber || "Batch"} — complete stock details</p>
              </div>

              <button type="button" className="bird-stock-close" onClick={closeViewModal} disabled={viewLoading}>
                <X size={18} />
              </button>
            </div>

            {viewLoading ? (
              <div className="bird-stock-loading-detail">
                <RefreshCw size={28} className="bird-stock-spin" />
                <p>Loading details...</p>
              </div>
            ) : viewingStock ? (
              <>
                <div className="bird-stock-detail-top">
                  <div className="bird-stock-detail-stat">
                    <strong>{formatNumber(viewingStock.initialQuantity)}</strong>
                    <span>Initial Birds</span>
                  </div>

                  <div className="bird-stock-detail-stat">
                    <strong>{formatNumber(viewingStock.currentQuantity)}</strong>
                    <span>Current Birds</span>
                  </div>

                  <div className="bird-stock-detail-stat">
                    <strong>{formatNumber(viewingStock.transportMortality)}</strong>
                    <span>Transport Mortality</span>
                  </div>

                  <div className="bird-stock-detail-stat">
                    <strong>{formatNumber(viewingStock.farmMortality)}</strong>
                    <span>Farm Mortality</span>
                  </div>

                  <div className="bird-stock-detail-stat">
                    <strong>{formatNumber(viewingStock.totalMortality)}</strong>
                    <span>Total Mortality</span>
                  </div>

                  <div className="bird-stock-detail-stat">
                    <strong>{formatNumber(viewingStock.birdsSold)}</strong>
                    <span>Birds Sold</span>
                  </div>
                </div>

                <div className="bird-stock-detail-grid">
                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Batch Number</div>
                    <div className="bird-stock-detail-value">{viewingStock.batchNumber || "-"}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Batch Name</div>
                    <div className="bird-stock-detail-value">{viewingStock.batchName || "-"}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Bird Type</div>
                    <div className="bird-stock-detail-value">{formatStatus(viewingStock.birdType)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Breed</div>
                    <div className="bird-stock-detail-value">{viewingStock.breed || "-"}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Shed</div>
                    <div className="bird-stock-detail-value">{viewingStock.shed?.name || viewingStock.shed?.code || "-"}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Shed Capacity</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.shed?.capacity)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Arrival Date</div>
                    <div className="bird-stock-detail-value">{formatDate(viewingStock.arrivalDate)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Status</div>
                    <div className="bird-stock-detail-value">{formatStatus(viewingStock.status)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Initial Male</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.initialMale)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Initial Female</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.initialFemale)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Current Male</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.currentMale)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Current Female</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.currentFemale)}</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Transport Mortality</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.transportMortality)} birds</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Farm Mortality</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.farmMortality)} birds</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Total Mortality</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.totalMortality)} birds</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Mortality %</div>
                    <div className="bird-stock-detail-value">{formatDecimal(viewingStock.mortalityPercentage)}%</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Expected Sale Age</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.expectedSaleAgeDays)} days</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Target Weight</div>
                    <div className="bird-stock-detail-value">{formatDecimal(viewingStock.targetWeightKg)} kg</div>
                  </div>

                  <div className="bird-stock-detail-item">
                    <div className="bird-stock-detail-label">Available Stock</div>
                    <div className="bird-stock-detail-value">{formatNumber(viewingStock.availableStock)}</div>
                  </div>

                  <div className="bird-stock-detail-item bird-stock-detail-full">
                    <div className="bird-stock-detail-label">Notes</div>
                    <div className="bird-stock-detail-value">{viewingStock.notes || "No notes available."}</div>
                  </div>
                </div>

                <div className="bird-stock-modal-footer">
                  <button type="button" className="bird-stock-btn" onClick={closeViewModal}>
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default BirdStock;
