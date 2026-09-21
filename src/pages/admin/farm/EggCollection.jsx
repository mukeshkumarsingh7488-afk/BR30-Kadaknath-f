import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Droplets, Edit3, Eye, FileSpreadsheet, FileText, Filter, Gauge, Plus, RefreshCw, Search, Trash2, Users, X, Egg } from "lucide-react";

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

const getRoot = (response) => response?.data ?? response;

const getId = (item) => item?._id || item?.id || "";

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

const initialForm = {
  farm: "",
  shed: "",
  batch: "",
  collectionDate: new Date().toISOString().slice(0, 10),
  collectionSession: "MORNING",
  eggType: "TABLE_EGG",
  quantity: "",
  goodEggs: "",
  damagedEggs: "",
  crackedEggs: "",
  dirtyEggs: "",
  averageWeightGram: "",
  totalWeightKg: "",
  notes: "",
};

export default function EggCollection() {
  const [collections, setCollections] = useState([]);
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
  const [filterEggType, setFilterEggType] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingCollection, setEditingCollection] = useState(null);
  const [viewingCollection, setViewingCollection] = useState(null);

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

  const loadCollections = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filterFarm) params.set("farm", filterFarm);
      if (filterShed) params.set("shed", filterShed);
      if (filterBatch) params.set("batch", filterBatch);
      if (filterEggType) params.set("eggType", filterEggType);
      if (filterSession) params.set("session", filterSession);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const query = params.toString();

      const response = await apiRequest(query ? `/egg-collections?${query}` : "/egg-collections");

      const root = getRoot(response);

      setCollections(Array.isArray(root?.collections) ? root.collections : getArray(response, ["collections", "data", "items"]));
    } catch (err) {
      const message = err?.message || "Failed to load egg collections";
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
    loadCollections();
  }, [filterFarm, filterShed, filterBatch, filterEggType, filterSession, fromDate, toDate]);

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

  const filteredCollections = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return collections;

    return collections.filter((item) => {
      const searchable = [item?.farm?.name, item?.farm?.code, item?.shed?.name, item?.shed?.code, item?.batch?.batchNumber, item?.batch?.batchName, item?.batch?.breed, item?.eggType, item?.collectionSession, item?.notes, item?.collectedBy?.name, item?.collectedBy?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [collections, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterFarm, filterShed, filterBatch, filterEggType, filterSession, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredCollections.length / pageSize));

  const paginatedCollections = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredCollections.slice(start, start + pageSize);
  }, [filteredCollections, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleRefresh = async () => {
    await Promise.all([loadCollections(), loadDependencies()]);
  };

  const exportExcel = () => {
    const headers = ["Date", "Farm", "Shed", "Batch", "Breed", "Session", "Egg Type", "Total Eggs", "Good Eggs", "Damaged Eggs", "Cracked Eggs", "Dirty Eggs", "Average Weight Gram", "Total Weight Kg", "Collected By", "Notes"];

    const rows = filteredCollections.map((item) => [
      formatDate(item?.collectionDate),
      item?.farm?.name || "",
      item?.shed?.name || item?.shed?.code || "",
      item?.batch?.batchNumber || item?.batch?.batchName || "",
      item?.batch?.breed || "",
      item?.collectionSession || "",
      item?.eggType || "",
      Number(item?.quantity || 0),
      Number(item?.goodEggs || 0),
      Number(item?.damagedEggs || 0),
      Number(item?.crackedEggs || 0),
      Number(item?.dirtyEggs || 0),
      Number(item?.averageWeightGram || 0),
      Number(item?.totalWeightKg || 0),
      item?.collectedBy?.name || item?.collectedBy?.email || "",
      item?.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `egg-collection-${new Date().toISOString().slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredCollections
      .map(
        (item) => `
        <tr>
          <td>${formatDate(item?.collectionDate)}</td>
          <td>${item?.farm?.name || "-"}</td>
          <td>${item?.shed?.name || item?.shed?.code || "-"}</td>
          <td>${item?.batch?.batchNumber || item?.batch?.batchName || "-"}</td>
          <td>${item?.collectionSession || "-"}</td>
          <td>${item?.eggType || "-"}</td>
          <td>${Number(item?.quantity || 0)}</td>
          <td>${Number(item?.goodEggs || 0)}</td>
          <td>${Number(item?.damagedEggs || 0)}</td>
          <td>${Number(item?.crackedEggs || 0)}</td>
          <td>${Number(item?.dirtyEggs || 0)}</td>
          <td>${formatNumber(item?.totalWeightKg)} kg</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Egg Collection Report</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#172033}
          h1{margin:0 0 6px;font-size:22px}
          p{margin:0 0 18px;color:#667085;font-size:12px}
          table{width:100%;border-collapse:collapse;font-size:9px}
          th,td{border:1px solid #dfe4ec;padding:7px;text-align:left}
          th{background:#f8fafc;font-weight:700}
          @media print{
            body{padding:10px}
            table{font-size:8px}
          }
        </style>
      </head>

      <body>
        <h1>Egg Collection Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Farm</th>
              <th>Shed</th>
              <th>Batch</th>
              <th>Session</th>
              <th>Egg Type</th>
              <th>Total</th>
              <th>Good</th>
              <th>Damaged</th>
              <th>Cracked</th>
              <th>Dirty</th>
              <th>Weight</th>
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

  const summary = useMemo(() => {
    const totalQuantity = filteredCollections.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);

    const goodEggs = filteredCollections.reduce((sum, item) => sum + Number(item?.goodEggs || 0), 0);

    const damagedEggs = filteredCollections.reduce((sum, item) => sum + Number(item?.damagedEggs || 0), 0);

    const crackedEggs = filteredCollections.reduce((sum, item) => sum + Number(item?.crackedEggs || 0), 0);

    const dirtyEggs = filteredCollections.reduce((sum, item) => sum + Number(item?.dirtyEggs || 0), 0);

    const totalWeight = filteredCollections.reduce((sum, item) => sum + Number(item?.totalWeightKg || 0), 0);

    return {
      records: filteredCollections.length,
      totalQuantity,
      goodEggs,
      damagedEggs,
      crackedEggs,
      dirtyEggs,
      totalWeight,
    };
  }, [filteredCollections]);

  const openCreateModal = () => {
    setEditingCollection(null);

    setForm({
      ...initialForm,
      collectionDate: new Date().toISOString().slice(0, 10),
    });

    setModalOpen(true);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);

    setForm({
      farm: getId(collection?.farm),
      shed: getId(collection?.shed),
      batch: getId(collection?.batch),
      collectionDate: collection?.collectionDate ? new Date(collection.collectionDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      collectionSession: collection?.collectionSession || "MORNING",
      eggType: collection?.eggType || "TABLE_EGG",
      quantity: collection?.quantity ?? "",
      goodEggs: collection?.goodEggs ?? "",
      damagedEggs: collection?.damagedEggs ?? "",
      crackedEggs: collection?.crackedEggs ?? "",
      dirtyEggs: collection?.dirtyEggs ?? "",
      averageWeightGram: collection?.averageWeightGram ?? "",
      totalWeightKg: collection?.totalWeightKg ?? "",
      notes: collection?.notes || "",
    });

    setModalOpen(true);
  };

  const openViewModal = async (collection) => {
    try {
      const id = getId(collection);

      if (!id) {
        setViewingCollection(collection);
        setViewOpen(true);
        return;
      }

      const response = await apiRequest(`/egg-collections/${id}`);
      const root = getRoot(response);

      setViewingCollection(root?.collection || collection);
      setViewOpen(true);
    } catch {
      setViewingCollection(collection);
      setViewOpen(true);
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingCollection(null);
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

  const updateQualityField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const autoCalculateQuality = (quantity) => {
    const number = Number(quantity);

    if (!Number.isInteger(number) || number < 1) return;

    setForm((prev) => {
      const previousTotal = Number(prev.goodEggs || 0) + Number(prev.damagedEggs || 0) + Number(prev.crackedEggs || 0) + Number(prev.dirtyEggs || 0);

      if (previousTotal === 0) {
        return {
          ...prev,
          quantity,
          goodEggs: quantity,
          damagedEggs: "0",
          crackedEggs: "0",
          dirtyEggs: "0",
        };
      }

      return {
        ...prev,
        quantity,
      };
    });
  };

  const handleAverageWeightChange = (value) => {
    setForm((prev) => {
      const quantity = Number(prev.quantity);
      const averageWeight = Number(value);

      const totalWeight = Number.isFinite(quantity) && quantity > 0 && Number.isFinite(averageWeight) && averageWeight >= 0 ? ((quantity * averageWeight) / 1000).toFixed(3) : "";

      return {
        ...prev,
        averageWeightGram: value,
        totalWeightKg: totalWeight,
      };
    });
  };

  const handleQuantityChange = (value) => {
    setForm((prev) => {
      const quantity = Number(value);
      const averageWeight = Number(prev.averageWeightGram);

      const totalWeight = Number.isFinite(quantity) && quantity > 0 && Number.isFinite(averageWeight) && averageWeight >= 0 ? ((quantity * averageWeight) / 1000).toFixed(3) : "";

      return {
        ...prev,
        quantity: value,
        totalWeightKg: totalWeight,
      };
    });
  };

  const validateForm = () => {
    if (!editingCollection && !form.farm) {
      showError("Please select a farm");
      return false;
    }

    if (!editingCollection && !form.shed) {
      showError("Please select a shed");
      return false;
    }

    if (!editingCollection && !form.batch) {
      showError("Please select a batch");
      return false;
    }

    if (!form.collectionDate) {
      showError("Please select collection date");
      return false;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      showError("Egg quantity must be a whole number greater than 0");
      return false;
    }

    const good = Number(form.goodEggs || 0);
    const damaged = Number(form.damagedEggs || 0);
    const cracked = Number(form.crackedEggs || 0);
    const dirty = Number(form.dirtyEggs || 0);

    if (!Number.isFinite(good) || good < 0 || !Number.isFinite(damaged) || damaged < 0 || !Number.isFinite(cracked) || cracked < 0 || !Number.isFinite(dirty) || dirty < 0) {
      showError("Good, damaged, cracked and dirty egg quantities cannot be negative");
      return false;
    }

    const qualityTotal = good + damaged + cracked + dirty;

    if (qualityTotal !== 0 && qualityTotal !== quantity) {
      showError("Good, damaged, cracked and dirty eggs must equal total quantity");
      return false;
    }

    if (form.averageWeightGram !== "") {
      const averageWeight = Number(form.averageWeightGram);

      if (!Number.isFinite(averageWeight) || averageWeight < 0) {
        showError("Average egg weight cannot be negative");
        return false;
      }
    }

    if (form.totalWeightKg !== "") {
      const totalWeight = Number(form.totalWeightKg);

      if (!Number.isFinite(totalWeight) || totalWeight < 0) {
        showError("Total egg weight cannot be negative");
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
        collectionDate: form.collectionDate,
        collectionSession: form.collectionSession || "MORNING",
        eggType: form.eggType || "TABLE_EGG",
        quantity: Number(form.quantity),
        goodEggs: form.goodEggs === "" ? 0 : Number(form.goodEggs),
        damagedEggs: form.damagedEggs === "" ? 0 : Number(form.damagedEggs),
        crackedEggs: form.crackedEggs === "" ? 0 : Number(form.crackedEggs),
        dirtyEggs: form.dirtyEggs === "" ? 0 : Number(form.dirtyEggs),
        averageWeightGram: form.averageWeightGram === "" ? 0 : Number(form.averageWeightGram),
        totalWeightKg: form.totalWeightKg === "" ? 0 : Number(form.totalWeightKg),
        notes: form.notes || "",
      };

      if (!editingCollection) {
        payload.farm = form.farm;
        payload.shed = form.shed;
        payload.batch = form.batch;
      }

      const response = editingCollection
        ? await apiRequest(`/egg-collections/${getId(editingCollection)}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest("/egg-collections", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const root = getRoot(response);

      showSuccess(root?.message || (editingCollection ? "Egg collection updated successfully" : "Egg collection recorded successfully"));

      closeModal();
      await loadCollections();
    } catch (err) {
      showError(err?.message || "Failed to save egg collection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (collection) => {
    const id = getId(collection);

    if (!id) return;

    const result = await showConfirm({
      title: "Delete Egg Collection?",
      text: `Delete egg collection record of ${formatDate(collection?.collectionDate)}?\n\nIf a dependent Farm Report exists, the backend will prevent deletion.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/egg-collections/${id}`, {
        method: "DELETE",
      });

      const root = getRoot(response);

      showSuccess(root?.message || "Egg collection deleted successfully");

      await loadCollections();
    } catch (err) {
      showError(err?.message || "Failed to delete egg collection");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterFarm("");
    setFilterShed("");
    setFilterBatch("");
    setFilterEggType("");
    setFilterSession("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const qualityPercentage = (value, total) => {
    const amount = Number(value || 0);
    const quantity = Number(total || 0);

    if (!quantity) return 0;

    return (amount / quantity) * 100;
  };

  return (
    <div className="egg-collection-page">
      <div className="ec-header">
        <div>
          <div className="ec-eyebrow">
            <Egg size={16} />
            Farm Operations
          </div>

          <h1>Egg Collection</h1>

          <p>Track daily egg collection, quality breakdown, weight and collection sessions.</p>
        </div>

        <div className="ec-header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || dependencyLoading} title="Refresh">
            <RefreshCw size={17} className={loading || dependencyLoading ? "ec-refresh-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreateModal} disabled={dependencyLoading}>
            <Plus size={18} />
            Record Collection
          </button>
        </div>
      </div>

      <div className="ec-stats">
        <div className="ec-stat-card">
          <div className="ec-stat-icon blue">
            <ClipboardList size={20} />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{summary.records}</strong>
          </div>
        </div>

        <div className="ec-stat-card">
          <div className="ec-stat-icon green">
            <Egg size={20} />
          </div>

          <div>
            <span>Total Eggs</span>
            <strong>{summary.totalQuantity.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="ec-stat-card">
          <div className="ec-stat-icon teal">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Good Eggs</span>
            <strong>{summary.goodEggs.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="ec-stat-card">
          <div className="ec-stat-icon orange">
            <Gauge size={20} />
          </div>

          <div>
            <span>Damaged / Cracked</span>
            <strong>{(summary.damagedEggs + summary.crackedEggs).toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="ec-stat-card">
          <div className="ec-stat-icon purple">
            <Droplets size={20} />
          </div>

          <div>
            <span>Total Weight</span>
            <strong>{formatNumber(summary.totalWeight)} kg</strong>
          </div>
        </div>
      </div>

      <div className="ec-panel">
        <div className="ec-filter-title">
          <div>
            <Filter size={17} />
            Filters
          </div>

          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="ec-filters">
          <div className="ec-search">
            <Search size={17} />

            <input type="text" placeholder="Search farm, shed, batch, breed..." value={search} onChange={(e) => setSearch(e.target.value)} />

            {search && (
              <button type="button" onClick={() => setSearch("")}>
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
                {farm?.name || farm?.code || "Farm"}
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
                {shed?.name || shed?.code || "Shed"}
              </option>
            ))}
          </select>

          <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
            <option value="">All Batches</option>

            {filterBatches.map((batch) => (
              <option key={getId(batch)} value={getId(batch)}>
                {batch?.batchNumber || batch?.batchName || "Batch"}
              </option>
            ))}
          </select>

          <select value={filterEggType} onChange={(e) => setFilterEggType(e.target.value)}>
            <option value="">All Egg Types</option>
            <option value="TABLE_EGG">Table Egg</option>
            <option value="HATCHING_EGG">Hatching Egg</option>
            <option value="BREEDING_EGG">Breeding Egg</option>
            <option value="OTHER">Other</option>
          </select>

          <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            <option value="MORNING">Morning</option>
            <option value="AFTERNOON">Afternoon</option>
            <option value="EVENING">Evening</option>
            <option value="NIGHT">Night</option>
          </select>

          <label className="ec-date-field">
            <span>From</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>

          <label className="ec-date-field">
            <span>To</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="ec-panel">
        <div className="ec-table-head">
          <div>
            <h2>Collection Records</h2>
            <span>{filteredCollections.length} records found</span>
          </div>

          {filteredCollections.length > 0 && (
            <div className="ec-pagination">
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
          <div className="ec-state">
            <RefreshCw size={29} className="ec-spin" />
            <h3>Loading egg collections...</h3>
            <p>Please wait while collection records are loaded.</p>
          </div>
        ) : error ? (
          <div className="ec-state ec-error">
            <Egg size={32} />
            <h3>Unable to load collections</h3>
            <p>{error}</p>

            <button type="button" className="ec-btn ec-btn-primary" onClick={loadCollections}>
              Try Again
            </button>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="ec-state">
            <Egg size={35} />
            <h3>No egg collection records found</h3>
            <p>Start recording daily egg collection for your farm batches.</p>

            <button type="button" className="ec-btn ec-btn-primary" onClick={openCreateModal}>
              <Plus size={17} />
              Record Collection
            </button>
          </div>
        ) : (
          <div className="ec-table-wrap">
            <table className="ec-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farm / Shed</th>
                  <th>Batch</th>
                  <th>Session</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Good</th>
                  <th>Damaged</th>
                  <th>Cracked</th>
                  <th>Dirty</th>
                  <th>Weight</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCollections.map((item) => (
                  <tr key={getId(item)}>
                    <td>
                      <div className="ec-date">
                        <CalendarDays size={14} />
                        {formatDate(item?.collectionDate)}
                      </div>
                    </td>

                    <td>
                      <div className="ec-location">
                        <strong>{item?.farm?.name || "-"}</strong>
                        <span>{item?.shed?.name || item?.shed?.code || "-"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="ec-batch">
                        <strong>{item?.batch?.batchNumber || item?.batch?.batchName || "-"}</strong>
                        <span>{item?.batch?.breed || "-"}</span>
                      </div>
                    </td>

                    <td>
                      <span className="ec-session">
                        {(item?.collectionSession || "MORNING")
                          .replaceAll("_", " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </span>
                    </td>

                    <td>
                      <span className="ec-type">
                        {(item?.eggType || "TABLE_EGG")
                          .replaceAll("_", " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </span>
                    </td>

                    <td>
                      <strong className="ec-total">{Number(item?.quantity || 0).toLocaleString("en-IN")}</strong>
                    </td>

                    <td>
                      <div className="ec-quality good">
                        <strong>{item?.goodEggs ?? 0}</strong>
                        <span>{formatNumber(qualityPercentage(item?.goodEggs, item?.quantity), 0)}%</span>
                      </div>
                    </td>

                    <td>
                      <div className="ec-quality damaged">
                        <strong>{item?.damagedEggs ?? 0}</strong>
                        <span>{formatNumber(qualityPercentage(item?.damagedEggs, item?.quantity), 0)}%</span>
                      </div>
                    </td>

                    <td>
                      <div className="ec-quality cracked">
                        <strong>{item?.crackedEggs ?? 0}</strong>
                        <span>{formatNumber(qualityPercentage(item?.crackedEggs, item?.quantity), 0)}%</span>
                      </div>
                    </td>

                    <td>
                      <div className="ec-quality dirty">
                        <strong>{item?.dirtyEggs ?? 0}</strong>
                        <span>{formatNumber(qualityPercentage(item?.dirtyEggs, item?.quantity), 0)}%</span>
                      </div>
                    </td>

                    <td>
                      <div className="ec-weight">
                        <strong>{formatNumber(item?.totalWeightKg)} kg</strong>
                        {Number(item?.averageWeightGram || 0) > 0 && <span>{formatNumber(item?.averageWeightGram, 1)} g/egg</span>}
                      </div>
                    </td>

                    <td>
                      <div className="ec-actions">
                        <button type="button" className="ec-icon-btn view" title="View" onClick={() => openViewModal(item)}>
                          <Eye size={16} />
                        </button>

                        <button type="button" className="ec-icon-btn edit" title="Edit" onClick={() => openEditModal(item)}>
                          <Edit3 size={16} />
                        </button>

                        <button type="button" className="ec-icon-btn delete" title="Delete" onClick={() => handleDelete(item)}>
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

      {modalOpen && (
        <div className="ec-modal-overlay" onMouseDown={closeModal}>
          <div className="ec-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ec-modal-header">
              <div>
                <h2>{editingCollection ? "Edit Egg Collection" : "Record Egg Collection"}</h2>

                <p>{editingCollection ? "Update the collection record." : "Add a new egg collection record."}</p>
              </div>

              <button type="button" className="ec-close" onClick={closeModal} disabled={submitting}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ec-modal-body">
                <div className="ec-section">
                  <div className="ec-section-title">
                    <span>Farm Details</span>
                  </div>

                  <div className="ec-form-grid">
                    <label className="ec-field">
                      <span>Farm *</span>

                      <select value={form.farm} onChange={(e) => handleFarmChange(e.target.value)} disabled={!!editingCollection || dependencyLoading}>
                        <option value="">Select farm</option>

                        {farms.map((farm) => (
                          <option key={getId(farm)} value={getId(farm)}>
                            {farm?.name || farm?.code || "Farm"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="ec-field">
                      <span>Shed *</span>

                      <select value={form.shed} onChange={(e) => handleShedChange(e.target.value)} disabled={!!editingCollection || !form.farm || dependencyLoading}>
                        <option value="">Select shed</option>

                        {availableSheds.map((shed) => (
                          <option key={getId(shed)} value={getId(shed)}>
                            {shed?.name || shed?.code || "Shed"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="ec-field">
                      <span>Batch *</span>

                      <select
                        value={form.batch}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            batch: e.target.value,
                          }))
                        }
                        disabled={!!editingCollection || !form.shed || dependencyLoading}>
                        <option value="">Select batch</option>

                        {availableBatches.map((batch) => (
                          <option key={getId(batch)} value={getId(batch)}>
                            {batch?.batchNumber || batch?.batchName || "Batch"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="ec-field">
                      <span>Collection Date *</span>

                      <input
                        type="date"
                        value={form.collectionDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            collectionDate: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="ec-section">
                  <div className="ec-section-title">
                    <span>Collection Details</span>
                  </div>

                  <div className="ec-form-grid">
                    <label className="ec-field">
                      <span>Collection Session</span>

                      <select
                        value={form.collectionSession}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            collectionSession: e.target.value,
                          }))
                        }>
                        <option value="MORNING">Morning</option>
                        <option value="AFTERNOON">Afternoon</option>
                        <option value="EVENING">Evening</option>
                        <option value="NIGHT">Night</option>
                      </select>
                    </label>

                    <label className="ec-field">
                      <span>Egg Type</span>

                      <select
                        value={form.eggType}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            eggType: e.target.value,
                          }))
                        }>
                        <option value="TABLE_EGG">Table Egg</option>
                        <option value="HATCHING_EGG">Hatching Egg</option>
                        <option value="BREEDING_EGG">Breeding Egg</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </label>

                    <label className="ec-field">
                      <span>Total Quantity *</span>

                      <input type="number" min="1" step="1" value={form.quantity} onChange={(e) => handleQuantityChange(e.target.value)} placeholder="e.g. 250" />
                    </label>

                    <label className="ec-field">
                      <span>Average Egg Weight (gram)</span>

                      <input type="number" min="0" step="0.1" value={form.averageWeightGram} onChange={(e) => handleAverageWeightChange(e.target.value)} placeholder="e.g. 45" />
                    </label>

                    <label className="ec-field">
                      <span>Total Egg Weight (kg)</span>

                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={form.totalWeightKg}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            totalWeightKg: e.target.value,
                          }))
                        }
                        placeholder="Auto calculated"
                      />
                    </label>
                  </div>
                </div>

                <div className="ec-section">
                  <div className="ec-section-title">
                    <span>Egg Quality Breakdown</span>
                  </div>

                  <div className="ec-quality-grid">
                    <label className="ec-quality-field good">
                      <span>Good Eggs</span>

                      <input type="number" min="0" step="1" value={form.goodEggs} onChange={(e) => updateQualityField("goodEggs", e.target.value)} placeholder="0" />
                    </label>

                    <label className="ec-quality-field damaged">
                      <span>Damaged Eggs</span>

                      <input type="number" min="0" step="1" value={form.damagedEggs} onChange={(e) => updateQualityField("damagedEggs", e.target.value)} placeholder="0" />
                    </label>

                    <label className="ec-quality-field cracked">
                      <span>Cracked Eggs</span>

                      <input type="number" min="0" step="1" value={form.crackedEggs} onChange={(e) => updateQualityField("crackedEggs", e.target.value)} placeholder="0" />
                    </label>

                    <label className="ec-quality-field dirty">
                      <span>Dirty Eggs</span>

                      <input type="number" min="0" step="1" value={form.dirtyEggs} onChange={(e) => updateQualityField("dirtyEggs", e.target.value)} placeholder="0" />
                    </label>
                  </div>

                  <div className="ec-quality-summary">
                    <span>
                      Quality Total: <strong>{Number(form.goodEggs || 0) + Number(form.damagedEggs || 0) + Number(form.crackedEggs || 0) + Number(form.dirtyEggs || 0)}</strong>
                    </span>

                    <span>
                      Required: <strong>{Number(form.quantity || 0)}</strong>
                    </span>
                  </div>
                </div>

                <div className="ec-section">
                  <div className="ec-section-title">
                    <span>Notes</span>
                  </div>

                  <label className="ec-field">
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
                      placeholder="Add collection notes..."
                    />
                  </label>
                </div>

                {editingCollection && (
                  <div className="ec-edit-info">
                    <CheckCircle2 size={17} />

                    <div>
                      <strong>Farm, shed and batch cannot be changed</strong>

                      <span>The backend update API keeps this collection linked to its original farm, shed and batch.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="ec-modal-footer">
                <button type="button" className="ec-btn ec-btn-secondary" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="ec-btn ec-btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={17} className="ec-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingCollection ? "Update Record" : "Save Record"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewOpen && viewingCollection && (
        <div className="ec-modal-overlay" onMouseDown={() => setViewOpen(false)}>
          <div className="ec-modal ec-view-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ec-modal-header">
              <div>
                <h2>Egg Collection Details</h2>
                <p>Complete collection and quality information.</p>
              </div>

              <button type="button" className="ec-close" onClick={() => setViewOpen(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="ec-modal-body">
              <div className="ec-detail-top">
                <div>
                  <span>Collection Date</span>
                  <strong>{formatDate(viewingCollection?.collectionDate)}</strong>
                </div>

                <div>
                  <span>Session</span>
                  <strong>
                    {(viewingCollection?.collectionSession || "MORNING")
                      .replaceAll("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </strong>
                </div>

                <div>
                  <span>Total Quantity</span>
                  <strong>{viewingCollection?.quantity ?? 0} Eggs</strong>
                </div>
              </div>

              <div className="ec-detail-grid">
                <div className="ec-detail-card good">
                  <span>Good Eggs</span>
                  <strong>{viewingCollection?.goodEggs ?? 0}</strong>
                  <small>{formatNumber(qualityPercentage(viewingCollection?.goodEggs, viewingCollection?.quantity), 1)}%</small>
                </div>

                <div className="ec-detail-card damaged">
                  <span>Damaged Eggs</span>
                  <strong>{viewingCollection?.damagedEggs ?? 0}</strong>
                  <small>{formatNumber(qualityPercentage(viewingCollection?.damagedEggs, viewingCollection?.quantity), 1)}%</small>
                </div>

                <div className="ec-detail-card cracked">
                  <span>Cracked Eggs</span>
                  <strong>{viewingCollection?.crackedEggs ?? 0}</strong>
                  <small>{formatNumber(qualityPercentage(viewingCollection?.crackedEggs, viewingCollection?.quantity), 1)}%</small>
                </div>

                <div className="ec-detail-card dirty">
                  <span>Dirty Eggs</span>
                  <strong>{viewingCollection?.dirtyEggs ?? 0}</strong>
                  <small>{formatNumber(qualityPercentage(viewingCollection?.dirtyEggs, viewingCollection?.quantity), 1)}%</small>
                </div>
              </div>

              <div className="ec-info-grid">
                <div>
                  <span>Farm</span>
                  <strong>{viewingCollection?.farm?.name || "-"}</strong>
                </div>

                <div>
                  <span>Shed</span>
                  <strong>{viewingCollection?.shed?.name || viewingCollection?.shed?.code || "-"}</strong>
                </div>

                <div>
                  <span>Batch</span>
                  <strong>{viewingCollection?.batch?.batchNumber || viewingCollection?.batch?.batchName || "-"}</strong>
                </div>

                <div>
                  <span>Breed</span>
                  <strong>{viewingCollection?.batch?.breed || "-"}</strong>
                </div>

                <div>
                  <span>Egg Type</span>
                  <strong>
                    {(viewingCollection?.eggType || "TABLE_EGG")
                      .replaceAll("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </strong>
                </div>

                <div>
                  <span>Average Egg Weight</span>
                  <strong>{formatNumber(viewingCollection?.averageWeightGram, 1)} gram</strong>
                </div>

                <div>
                  <span>Total Weight</span>
                  <strong>{formatNumber(viewingCollection?.totalWeightKg)} kg</strong>
                </div>

                <div>
                  <span>Collected By</span>
                  <strong>{viewingCollection?.collectedBy?.name || viewingCollection?.collectedBy?.email || "-"}</strong>
                </div>
              </div>

              {viewingCollection?.notes && (
                <div className="ec-notes">
                  <span>Notes</span>
                  <p>{viewingCollection.notes}</p>
                </div>
              )}
            </div>

            <div className="ec-modal-footer">
              <button type="button" className="ec-btn ec-btn-secondary" onClick={() => setViewOpen(false)}>
                Close
              </button>

              <button
                type="button"
                className="ec-btn ec-btn-primary"
                onClick={() => {
                  setViewOpen(false);
                  openEditModal(viewingCollection);
                }}>
                <Edit3 size={17} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.ec-date-field input[type="date"],.ec-field input[type="date"]{color-scheme:light dark}.ec-date-field input[type="date"]::-webkit-calendar-picker-indicator,.ec-field input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .ec-date-field input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .ec-field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.egg-collection-page{padding:24px;color:var(--admin-text,#e8edf5);background:var(--admin-bg,#0b1220);min-height:100%;box-sizing:border-box}.ec-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.ec-eyebrow{display:flex;align-items:center;gap:7px;color:var(--admin-primary,#38bdf8);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.ec-header h1{margin:0;font-size:28px;line-height:1.2}.ec-header p{margin:7px 0 0;color:var(--admin-muted,#8b98aa);font-size:14px}.ec-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.ec-btn{height:40px;border:1px solid transparent;border-radius:9px;padding:0 15px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.ec-btn:disabled{opacity:.55;cursor:not-allowed}.ec-btn-primary{background:var(--admin-primary,#2563eb);color:#fff}.ec-btn-primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}.ec-btn-secondary{background:var(--admin-surface,#111827);border-color:var(--admin-border,#263244);color:var(--admin-text,#e8edf5)}.ec-btn-secondary:hover:not(:disabled){background:var(--admin-surface-2,#172033)}.ec-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:18px}.ec-stat-card{background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:13px;padding:16px;display:flex;align-items:center;gap:12px;min-width:0}.ec-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:0 0 40px}.ec-stat-icon.blue{background:rgba(37,99,235,.14);color:#60a5fa}.ec-stat-icon.green{background:rgba(16,185,129,.14);color:#34d399}.ec-stat-icon.teal{background:rgba(20,184,166,.14);color:#2dd4bf}.ec-stat-icon.orange{background:rgba(245,158,11,.14);color:#fbbf24}.ec-stat-icon.purple{background:rgba(139,92,246,.14);color:#a78bfa}.ec-stat-card span{display:block;color:var(--admin-muted,#8b98aa);font-size:11px;margin-bottom:4px}.ec-stat-card strong{font-size:17px;line-height:1.2}.ec-panel{background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:13px;margin-bottom:18px;overflow:hidden}.ec-filter-title{padding:14px 16px;border-bottom:1px solid var(--admin-border,#263244);display:flex;align-items:center;justify-content:space-between;gap:10px}.ec-filter-title>div{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:800}.ec-filter-title button{border:0;background:transparent;color:var(--admin-primary,#38bdf8);font-size:12px;font-weight:700;cursor:pointer}.ec-filters{padding:14px 16px;display:grid;grid-template-columns:2fr repeat(5,1fr) 1fr 1fr;gap:10px}.ec-search{height:40px;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);border-radius:8px;display:flex;align-items:center;padding:0 11px;gap:8px;color:var(--admin-muted,#8b98aa)}.ec-search input{border:0;outline:0;background:transparent;color:var(--admin-text,#e8edf5);width:100%;font-size:13px}.ec-search button{border:0;background:transparent;color:var(--admin-muted,#8b98aa);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.ec-search button:hover{color:var(--admin-text,#e8edf5)}.ec-filters select,.ec-filters input{height:40px;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);color:var(--admin-text,#e8edf5);border-radius:8px;padding:0 10px;outline:0;font-size:13px;min-width:0}.ec-filters select:focus,.ec-filters input:focus,.ec-field select:focus,.ec-field input:focus,.ec-field textarea:focus,.ec-quality-field input:focus{border-color:var(--admin-primary,#38bdf8)}.ec-date-field{display:flex;flex-direction:column;gap:3px}.ec-date-field span{font-size:10px;color:var(--admin-muted,#8b98aa);padding-left:2px}.ec-table-head{padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid var(--admin-border,#263244)}.ec-table-head h2{font-size:15px;margin:0 0 3px}.ec-table-head>div>span{font-size:12px;color:var(--admin-muted,#8b98aa)}.ec-pagination{display:flex;align-items:center;gap:8px}.ec-pagination button{width:31px;height:31px;border:1px solid var(--admin-border,#263244);border-radius:7px;background:var(--admin-bg,#0b1220);color:var(--admin-text,#e8edf5);display:flex;align-items:center;justify-content:center;cursor:pointer}.ec-pagination button:disabled{opacity:.4;cursor:not-allowed}.ec-pagination span{white-space:nowrap;font-size:12px;color:var(--admin-muted,#8b98aa)}.ec-table-wrap{width:100%;overflow-x:auto;overflow-y:auto;max-height:calc(100vh - 360px)}.ec-table{width:100%;border-collapse:collapse;min-width:1450px}.ec-table th{padding:11px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--admin-muted,#8b98aa);font-weight:800;background:var(--admin-surface-2,#172033);border-bottom:1px solid var(--admin-border,#263244);white-space:nowrap}.ec-table td{padding:12px;border-bottom:1px solid var(--admin-border,#263244);font-size:12px;vertical-align:middle}.ec-table tbody tr:hover{background:rgba(255,255,255,.018)}.ec-date{display:flex;align-items:center;gap:6px;white-space:nowrap;color:#cbd5e1}.ec-location,.ec-batch{display:flex;flex-direction:column;gap:3px}.ec-location strong,.ec-batch strong{font-size:12px}.ec-location span,.ec-batch span{font-size:10px;color:var(--admin-muted,#8b98aa)}.ec-session,.ec-type{display:inline-flex;padding:5px 7px;border-radius:6px;background:rgba(56,189,248,.08);color:#7dd3fc;font-size:10px;font-weight:700;white-space:nowrap}.ec-type{background:rgba(139,92,246,.09);color:#c4b5fd}.ec-total{font-size:13px;color:#f8fafc}.ec-quality{display:flex;flex-direction:column;gap:2px}.ec-quality strong{font-size:12px}.ec-quality span{font-size:9px}.ec-quality.good strong,.ec-quality.good span{color:#34d399}.ec-quality.damaged strong,.ec-quality.damaged span{color:#fbbf24}.ec-quality.cracked strong,.ec-quality.cracked span{color:#f87171}.ec-quality.dirty strong,.ec-quality.dirty span{color:#a78bfa}.ec-weight{display:flex;flex-direction:column;gap:3px}.ec-weight strong{font-size:11px}.ec-weight span{font-size:9px;color:var(--admin-muted,#8b98aa)}.ec-actions{display:flex;align-items:center;gap:6px}.ec-icon-btn{width:31px;height:31px;border:1px solid var(--admin-border,#263244);border-radius:7px;background:var(--admin-bg,#0b1220);display:flex;align-items:center;justify-content:center;cursor:pointer}.ec-icon-btn.view{color:#60a5fa}.ec-icon-btn.edit{color:#fbbf24}.ec-icon-btn.delete{color:#f87171}.ec-icon-btn:hover{filter:brightness(1.2)}.ec-state{min-height:300px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:35px;color:var(--admin-muted,#8b98aa)}.ec-state svg{margin-bottom:10px;color:var(--admin-primary,#38bdf8)}.ec-state h3{margin:0 0 6px;color:var(--admin-text,#e8edf5);font-size:16px}.ec-state p{margin:0 0 15px;font-size:13px;max-width:480px}.ec-error svg{color:var(--admin-danger,#ef4444)}.ec-modal-overlay{position:fixed;inset:0;background:rgba(2,6,23,.78);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.ec-modal{width:min(900px,100%);max-height:calc(100vh - 40px);overflow:hidden;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:15px;box-shadow:0 25px 70px rgba(0,0,0,.45);display:flex;flex-direction:column}.ec-modal>form{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.ec-view-modal{width:min(820px,100%)}.ec-modal-header{padding:17px 19px;border-bottom:1px solid var(--admin-border,#263244);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.ec-modal-header h2{margin:0;font-size:18px}.ec-modal-header p{margin:5px 0 0;color:var(--admin-muted,#8b98aa);font-size:12px}.ec-close{width:34px;height:34px;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);color:var(--admin-muted,#8b98aa);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.ec-modal-body{padding:18px;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}.ec-section{margin-bottom:21px}.ec-section-title{display:flex;align-items:center;gap:9px;margin-bottom:12px;font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--admin-primary,#38bdf8);font-weight:800}.ec-section-title:after{content:"";height:1px;background:var(--admin-border,#263244);flex:1}.ec-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.ec-field{display:flex;flex-direction:column;gap:6px}.ec-field>span,.ec-quality-field>span{font-size:11px;color:#cbd5e1;font-weight:700}.ec-field input,.ec-field select,.ec-field textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border,#263244);background:var(--admin-bg,#0b1220);color:var(--admin-text,#e8edf5);border-radius:8px;padding:0 11px;outline:0;font-size:13px}.ec-field input,.ec-field select{height:40px}.ec-field textarea{padding:10px 11px;resize:vertical;min-height:90px;font-family:inherit}.ec-field select:disabled{opacity:.6;cursor:not-allowed}.ec-quality-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.ec-quality-field{padding:12px;border:1px solid var(--admin-border,#263244);border-radius:9px;background:var(--admin-bg,#0b1220);display:flex;flex-direction:column;gap:7px}.ec-quality-field input{height:40px;width:100%;box-sizing:border-box;border:1px solid var(--admin-border,#263244);background:var(--admin-surface,#111827);color:var(--admin-text,#e8edf5);border-radius:7px;padding:0 10px;outline:0}.ec-quality-field.good>span{color:#34d399}.ec-quality-field.damaged>span{color:#fbbf24}.ec-quality-field.cracked>span{color:#f87171}.ec-quality-field.dirty>span{color:#a78bfa}.ec-quality-summary{margin-top:10px;padding:10px 12px;border:1px dashed var(--admin-border,#263244);border-radius:8px;display:flex;justify-content:space-between;gap:10px;color:var(--admin-muted,#8b98aa);font-size:11px}.ec-quality-summary strong{color:var(--admin-text,#e8edf5)}.ec-edit-info{display:flex;align-items:flex-start;gap:9px;padding:11px 12px;border-radius:9px;background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.18);color:#60a5fa}.ec-edit-info svg{flex:0 0 auto;margin-top:1px}.ec-edit-info div{display:flex;flex-direction:column;gap:3px}.ec-edit-info strong{font-size:11px}.ec-edit-info span{font-size:10px;color:var(--admin-muted,#8b98aa)}.ec-modal-footer{padding:14px 18px;border-top:1px solid var(--admin-border,#263244);display:flex;align-items:center;justify-content:flex-end;gap:9px}.ec-detail-top{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}.ec-detail-top>div{padding:13px;border:1px solid var(--admin-border,#263244);border-radius:10px;background:var(--admin-bg,#0b1220);display:flex;flex-direction:column;gap:5px}.ec-detail-top span,.ec-detail-card span,.ec-info-grid span,.ec-notes>span{font-size:10px;color:var(--admin-muted,#8b98aa);text-transform:uppercase;letter-spacing:.04em}.ec-detail-top strong{font-size:14px}.ec-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.ec-detail-card{padding:13px;border:1px solid var(--admin-border,#263244);border-radius:10px;background:var(--admin-bg,#0b1220);display:flex;flex-direction:column;gap:5px}.ec-detail-card strong{font-size:18px}.ec-detail-card small{font-size:10px;color:var(--admin-muted,#8b98aa)}.ec-detail-card.good strong{color:#34d399}.ec-detail-card.damaged strong{color:#fbbf24}.ec-detail-card.cracked strong{color:#f87171}.ec-detail-card.dirty strong{color:#a78bfa}.ec-info-grid{border:1px solid var(--admin-border,#263244);border-radius:10px;overflow:hidden;display:grid;grid-template-columns:repeat(2,1fr)}.ec-info-grid>div{padding:12px;border-bottom:1px solid var(--admin-border,#263244);display:flex;justify-content:space-between;gap:10px}.ec-info-grid>div:nth-last-child(-n+2){border-bottom:0}.ec-info-grid strong{font-size:12px;text-align:right}.ec-notes{margin-top:14px;padding:13px;border:1px solid var(--admin-border,#263244);border-radius:10px;background:var(--admin-bg,#0b1220)}.ec-notes p{margin:7px 0 0;color:#cbd5e1;font-size:12px;line-height:1.6;white-space:pre-wrap}.ec-refresh-spin{animation:ecRefreshSpin .9s linear infinite}@keyframes ecRefreshSpin{to{transform:rotate(360deg)}}.ec-spin{animation:ecSpin .9s linear infinite}@keyframes ecSpin{to{transform:rotate(360deg)}}@media(max-width:1300px){.ec-stats{grid-template-columns:repeat(3,1fr)}.ec-filters{grid-template-columns:repeat(4,1fr)}.ec-search{grid-column:1/-1}}@media(max-width:900px){.ec-header{flex-direction:column}.ec-header-actions{width:100%;justify-content:flex-end;flex-wrap:nowrap}.ec-header-actions .top-action-btn{flex:0 0 auto}.ec-stats{grid-template-columns:repeat(2,1fr)}.ec-filters{grid-template-columns:repeat(2,1fr)}.ec-form-grid{grid-template-columns:1fr}.ec-quality-grid{grid-template-columns:repeat(2,1fr)}.ec-detail-top{grid-template-columns:1fr}.ec-detail-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.egg-collection-page{padding:16px}.ec-header-actions{width:100%;display:flex;flex-wrap:nowrap;gap:6px;justify-content:flex-end}.ec-header-actions .top-action-btn{flex:0 0 auto;padding:0 9px}.ec-header-actions .refresh-action-btn{width:38px;padding:0}.ec-header-actions .top-action-btn svg{flex:0 0 auto}.ec-stats{grid-template-columns:1fr}.ec-filters{grid-template-columns:1fr}.ec-quality-grid{grid-template-columns:1fr}.ec-detail-grid{grid-template-columns:1fr}.ec-info-grid{grid-template-columns:1fr}.ec-info-grid>div:nth-last-child(-n+2){border-bottom:1px solid var(--admin-border,#263244)}.ec-info-grid>div:last-child{border-bottom:0}.ec-table-head{align-items:flex-start;flex-direction:column}.ec-pagination{width:100%;justify-content:flex-end}.ec-modal-overlay{padding:10px}.ec-modal{max-height:calc(100vh - 20px)}.ec-modal-body{padding:14px}.ec-modal-footer{padding:12px 14px}.ec-modal-footer .ec-btn{flex:1}.ec-header h1{font-size:24px}}`}</style>
    </div>
  );
}
