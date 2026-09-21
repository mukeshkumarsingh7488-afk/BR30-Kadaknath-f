import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Droplets, Eye, FileSpreadsheet, FileText, Filter, Leaf, Package, Pencil, Plus, RefreshCw, Search, Trash2, X, IndianRupee, Warehouse, Users, Scale } from "lucide-react";
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

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  farm: "",
  shed: "",
  batch: "",
  feedInventory: "",
  consumptionDate: today,
  feedType: "STARTER",
  quantityKg: "",
  birdCountAtConsumption: "",
  costPerKg: "",
  feedingSession: "MORNING",
  notes: "",
};

const feedTypeOptions = [
  { value: "STARTER", label: "Starter" },
  { value: "GROWER", label: "Grower" },
  { value: "FINISHER", label: "Finisher" },
  { value: "LAYER", label: "Layer" },
  { value: "BREEDER", label: "Breeder" },
  { value: "BROILER", label: "Broiler" },
  { value: "OTHER", label: "Other" },
];

const sessionOptions = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night" },
  { value: "OTHER", label: "Other" },
];

const getFeedTypeLabel = (value) => {
  if (!value) return "-";

  return value
    .toString()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSessionLabel = (value) => {
  if (!value) return "-";

  return value
    .toString()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const getFarmName = (item) => {
  if (!item?.farm) return "-";

  if (typeof item.farm === "string") {
    return item.farm;
  }

  return item.farm.name || item.farm.code || "-";
};

const getShedName = (item) => {
  if (!item?.shed) return "-";

  if (typeof item.shed === "string") {
    return item.shed;
  }

  return item.shed.name || item.shed.code || "-";
};

const getBatchName = (item) => {
  if (!item?.batch) return "-";

  if (typeof item.batch === "string") {
    return item.batch;
  }

  return item.batch.batchNumber || item.batch.batchName || "-";
};

const getFeedName = (item) => {
  if (!item?.feedInventory) return "-";

  if (typeof item.feedInventory === "string") {
    return item.feedInventory;
  }

  return item.feedInventory.feedName || "-";
};

const extractErrorMessage = (error, fallback = "Something went wrong") => {
  return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
};

const buildFormFromItem = (item) => {
  return {
    farm: getId(item.farm),
    shed: getId(item.shed),
    batch: getId(item.batch),
    feedInventory: getId(item.feedInventory),
    consumptionDate: item.consumptionDate ? new Date(item.consumptionDate).toISOString().slice(0, 10) : today,
    feedType: item.feedType || "STARTER",
    quantityKg: item.quantityKg !== undefined ? String(item.quantityKg) : "",
    birdCountAtConsumption: item.birdCountAtConsumption !== undefined ? String(item.birdCountAtConsumption) : "",
    costPerKg: item.costPerKg !== undefined ? String(item.costPerKg) : "",
    feedingSession: item.feedingSession || "MORNING",
    notes: item.notes || "",
  };
};

export default function FeedConsumption() {
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);
  const [feedInventory, setFeedInventory] = useState([]);

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [shedFilter, setShedFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [feedTypeFilter, setFeedTypeFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadDependencies = async () => {
    try {
      setLoadingDependencies(true);

      const [farmsResponse, shedsResponse, batchesResponse, inventoryResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds"), apiRequest("/batches"), apiRequest("/feed-inventory?limit=100")]);

      setFarms(getArray(farmsResponse, ["farms", "data", "items"]));

      setSheds(getArray(shedsResponse, ["sheds", "data", "items"]));

      setBatches(getArray(batchesResponse, ["batches", "data", "items"]));

      setFeedInventory(getArray(inventoryResponse, ["data", "items", "feedInventories"]));
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to load feed consumption dependencies"));
    } finally {
      setLoadingDependencies(false);
    }
  };

  const loadConsumptions = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (farmFilter) params.set("farm", farmFilter);
      if (shedFilter) params.set("shed", shedFilter);
      if (batchFilter) params.set("batch", batchFilter);
      if (feedTypeFilter) params.set("feedType", feedTypeFilter);
      if (sessionFilter) {
        params.set("feedingSession", sessionFilter);
      }
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      params.set("page", String(requestedPage));
      params.set("limit", "20");

      const query = params.toString();

      const response = await apiRequest(`/feed-consumption${query ? `?${query}` : ""}`);

      const root = getRoot(response);

      const list = getArray(response, ["data", "items", "consumptions"]);

      setItems(list);

      setPagination(
        root?.pagination || {
          page: requestedPage,
          limit: 20,
          total: list.length,
          totalPages: Math.max(Math.ceil(list.length / 20), 1),
        }
      );
    } catch (err) {
      const message = extractErrorMessage(err, "Failed to load feed consumption");

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
    loadConsumptions(page);
  }, [page, farmFilter, shedFilter, batchFilter, feedTypeFilter, sessionFilter, startDate, endDate]);

  const selectedFarmSheds = useMemo(() => {
    if (!form.farm) return sheds;

    return sheds.filter((shed) => String(getId(shed.farm)) === String(form.farm));
  }, [sheds, form.farm]);

  const selectedFarmBatches = useMemo(() => {
    return batches.filter((batch) => {
      const sameFarm = !form.farm || String(getId(batch.farm)) === String(form.farm);

      const sameShed = !form.shed || String(getId(batch.shed)) === String(form.shed);

      return sameFarm && sameShed;
    });
  }, [batches, form.farm, form.shed]);

  const selectedFarmInventory = useMemo(() => {
    return feedInventory.filter((item) => {
      if (!form.farm) return true;

      return String(getId(item.farm)) === String(form.farm);
    });
  }, [feedInventory, form.farm]);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) => {
      const searchable = [getFarmName(item), getShedName(item), getBatchName(item), getFeedName(item), item.feedType, item.feedingSession, item.notes].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(value);
    });
  }, [items, search]);

  const summary = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        const quantity = Number(item.quantityKg || 0);
        const cost = Number(item.totalCost || 0);
        const birds = Number(item.birdCountAtConsumption || 0);

        acc.records += 1;
        acc.quantity += quantity;
        acc.totalCost += cost;
        acc.birds += birds;

        if (birds > 0) {
          acc.feedPerBird += Number(item.feedPerBirdGram || 0);
        }

        return acc;
      },
      {
        records: 0,
        quantity: 0,
        totalCost: 0,
        birds: 0,
        feedPerBird: 0,
      }
    );
  }, [filteredItems]);

  const averageFeedPerBird = useMemo(() => {
    if (!summary.records) return 0;

    const valid = filteredItems.filter((item) => Number(item.feedPerBirdGram || 0) > 0);

    if (!valid.length) return 0;

    const total = valid.reduce((sum, item) => sum + Number(item.feedPerBirdGram || 0), 0);

    return total / valid.length;
  }, [filteredItems, summary.records]);

  const openCreate = () => {
    setSelectedItem(null);

    setForm({
      ...emptyForm,
      farm: farmFilter || "",
      shed: "",
      batch: "",
      feedInventory: "",
    });

    setModal("form");
  };

  const handleRefresh = async () => {
    await Promise.all([loadConsumptions(page), loadDependencies()]);
  };

  const exportExcel = () => {
    const headers = ["Date", "Feed", "Feed Type", "Farm", "Shed", "Batch", "Feeding Session", "Quantity Kg", "Bird Count", "Feed Per Bird Gram", "Cost Per Kg", "Total Cost", "Notes"];

    const rows = filteredItems.map((item) => [
      formatDate(item?.consumptionDate),
      getFeedName(item),
      getFeedTypeLabel(item?.feedType),
      getFarmName(item),
      getShedName(item),
      getBatchName(item),
      getSessionLabel(item?.feedingSession),
      Number(item?.quantityKg || 0),
      Number(item?.birdCountAtConsumption || 0),
      Number(item?.feedPerBirdGram || 0),
      Number(item?.costPerKg || 0),
      Number(item?.totalCost || 0),
      item?.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `feed-consumption-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredItems
      .map(
        (item) => `
        <tr>
          <td>${formatDate(item?.consumptionDate)}</td>
          <td>${getFeedName(item)}</td>
          <td>${getFeedTypeLabel(item?.feedType)}</td>
          <td>${getFarmName(item)}</td>
          <td>${getShedName(item)}</td>
          <td>${getBatchName(item)}</td>
          <td>${getSessionLabel(item?.feedingSession)}</td>
          <td>${formatNumber(item?.quantityKg)} kg</td>
          <td>${formatNumber(item?.birdCountAtConsumption, 0)}</td>
          <td>${formatNumber(item?.feedPerBirdGram)} g</td>
          <td>₹${formatNumber(item?.totalCost)}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Feed Consumption Report</title>
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
        <h1>Feed Consumption Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Feed</th>
              <th>Feed Type</th>
              <th>Farm</th>
              <th>Shed</th>
              <th>Batch</th>
              <th>Session</th>
              <th>Quantity</th>
              <th>Birds</th>
              <th>g / Bird</th>
              <th>Total Cost</th>
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

  const openEdit = async (item) => {
    try {
      setSelectedItem(item);
      setForm(buildFormFromItem(item));
      setModal("form");

      const response = await apiRequest(`/feed-consumption/${getId(item)}`);

      const root = getRoot(response);

      if (root?.data) {
        setSelectedItem(root.data);
        setForm(buildFormFromItem(root.data));
      }
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to load consumption details"));
    }
  };

  const openView = async (item) => {
    try {
      setSelectedItem(item);
      setModal("view");

      const response = await apiRequest(`/feed-consumption/${getId(item)}`);

      const root = getRoot(response);

      if (root?.data) {
        setSelectedItem(root.data);
      }
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to load consumption details"));
    }
  };

  const closeModal = () => {
    if (submitting) return;

    setModal(null);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFarmChange = (event) => {
    const farm = event.target.value;

    setForm((current) => ({
      ...current,
      farm,
      shed: "",
      batch: "",
      feedInventory: "",
    }));
  };

  const handleShedChange = (event) => {
    const shed = event.target.value;

    setForm((current) => ({
      ...current,
      shed,
      batch: "",
    }));
  };

  const handleFeedInventoryChange = (event) => {
    const feedInventoryId = event.target.value;

    const inventory = feedInventory.find((item) => String(getId(item)) === String(feedInventoryId));

    setForm((current) => ({
      ...current,
      feedInventory: feedInventoryId,
      feedType: inventory?.feedType || current.feedType,
      costPerKg: inventory?.unitCostPerKg !== undefined ? String(inventory.unitCostPerKg) : current.costPerKg,
    }));
  };

  const selectedInventory = useMemo(() => {
    return feedInventory.find((item) => String(getId(item)) === String(form.feedInventory));
  }, [feedInventory, form.feedInventory]);

  const selectedBatch = useMemo(() => {
    return batches.find((item) => String(getId(item)) === String(form.batch));
  }, [batches, form.batch]);

  const quantity = Number(form.quantityKg || 0);
  const birdCount = Number(form.birdCountAtConsumption || 0);
  const costPerKg = Number(form.costPerKg || 0);

  const calculatedFeedPerBirdGram = birdCount > 0 ? (quantity * 1000) / birdCount : 0;

  const calculatedTotalCost = quantity * costPerKg;

  const availableStock = Number(selectedInventory?.currentStockKg || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.farm) {
      showError("Please select a farm");
      return;
    }

    if (!form.feedInventory) {
      showError("Please select feed inventory");
      return;
    }

    if (!form.feedType) {
      showError("Feed type is required");
      return;
    }

    if (!form.quantityKg || Number(form.quantityKg) <= 0) {
      showError("Quantity consumed must be greater than 0");
      return;
    }

    if (!form.birdCountAtConsumption || Number(form.birdCountAtConsumption) <= 0) {
      showError("Bird count must be greater than 0");
      return;
    }

    if (Number(form.costPerKg || 0) < 0) {
      showError("Cost per kg cannot be negative");
      return;
    }

    if (selectedBatch && Number(form.birdCountAtConsumption) > Number(selectedBatch.currentQuantity || 0)) {
      showError("Bird count cannot exceed current batch quantity");
      return;
    }

    if (!selectedItem && availableStock < Number(form.quantityKg)) {
      showError(`Insufficient feed stock. Available stock: ${availableStock} kg`);
      return;
    }

    const payload = {
      farm: form.farm,
      shed: form.shed || null,
      batch: form.batch || null,
      feedInventory: form.feedInventory,
      consumptionDate: form.consumptionDate || undefined,
      feedType: form.feedType,
      quantityKg: Number(form.quantityKg),
      birdCountAtConsumption: Number(form.birdCountAtConsumption),
      costPerKg: Number(form.costPerKg || 0),
      feedingSession: form.feedingSession || undefined,
      notes: form.notes.trim(),
    };

    try {
      setSubmitting(true);

      if (selectedItem) {
        await apiRequest(`/feed-consumption/${getId(selectedItem)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showSuccess("Feed consumption updated successfully");
      } else {
        await apiRequest("/feed-consumption", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess("Feed consumption recorded successfully");
      }

      closeModal();

      await Promise.all([loadConsumptions(page), loadDependencies()]);
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to save feed consumption"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await showConfirm({
      title: "Delete Feed Consumption?",
      text: `${formatNumber(item.quantityKg)} kg of ${getFeedName(item)} will be restored to inventory.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(getId(item));

      await apiRequest(`/feed-consumption/${getId(item)}`, {
        method: "DELETE",
      });

      showSuccess("Feed consumption deleted and feed stock restored successfully");

      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await Promise.all([loadConsumptions(page), loadDependencies()]);
      }
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to delete feed consumption"));
    } finally {
      setDeletingId("");
    }
  };

  const changePage = (nextPage) => {
    if (nextPage < 1) return;

    if (pagination.totalPages && nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <div className="consumption-page">
      <style>{`.consumption-search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:27px;height:27px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.consumption-search-clear:hover{background:var(--admin-surface-2);color:var(--admin-text)}.consumption-input-wrap .consumption-input{padding-left:38px;padding-right:40px}.consumption-input[type="date"],.consumption-field input[type="date"]{color-scheme:light dark}.consumption-input[type="date"]::-webkit-calendar-picker-indicator,.consumption-field input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .consumption-input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .consumption-field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.consumption-page{min-height:100%;padding:24px;background:var(--admin-bg);color:var(--admin-text)}.consumption-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}.consumption-title-wrap{display:flex;align-items:flex-start;gap:13px}.consumption-title-icon{width:44px;height:44px;border:1px solid var(--admin-border);border-radius:13px;background:var(--admin-surface);display:flex;align-items:center;justify-content:center;color:var(--admin-primary);flex-shrink:0}.consumption-title{margin:0;font-size:25px;font-weight:800;letter-spacing:-.4px}.consumption-subtitle{margin:5px 0 0;color:var(--admin-muted);font-size:13px;line-height:1.5}.consumption-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:nowrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.consumption-refresh-spin{animation:consumptionHeaderSpin 1s linear infinite}@keyframes consumptionHeaderSpin{to{transform:rotate(360deg)}}.consumption-btn{height:40px;padding:0 14px;border-radius:10px;border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text);display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.consumption-btn:hover{transform:translateY(-1px);border-color:var(--admin-primary)}.consumption-btn-primary{background:var(--admin-primary);color:#fff;border-color:var(--admin-primary)}.consumption-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.consumption-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:13px;margin-bottom:18px}.consumption-stat{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px}.consumption-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.consumption-stat-label{font-size:12px;color:var(--admin-muted);font-weight:600}.consumption-stat-icon{width:34px;height:34px;border-radius:10px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;color:var(--admin-primary)}.consumption-stat-value{font-size:22px;font-weight:800;line-height:1.1}.consumption-stat-meta{font-size:11px;color:var(--admin-muted);margin-top:5px}.consumption-filters{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:15px;margin-bottom:18px}.consumption-filter-row{display:grid;grid-template-columns:minmax(300px,2fr) repeat(5,minmax(125px,1fr));gap:9px;align-items:center}.consumption-input-wrap{position:relative}.consumption-input-wrap svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--admin-muted);pointer-events:none}.consumption-input,.consumption-select{width:100%;height:40px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:0 11px;font-size:13px;outline:none}.consumption-input-wrap .consumption-input{padding-left:38px;padding-right:40px}.consumption-input:focus,.consumption-select:focus{border-color:var(--admin-primary)}.consumption-date-row{display:flex;align-items:center;gap:9px;margin-top:10px}.consumption-date-row .consumption-date-group{display:flex;gap:9px;width:289px}.consumption-date-row .consumption-input{width:140px;min-width:0}.consumption-date-clear{height:40px;padding:0 13px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-muted);display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.consumption-date-clear:hover{border-color:var(--admin-primary);background:var(--admin-surface);color:var(--admin-primary)}.consumption-table-wrap{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden}.consumption-table-scroll{overflow-x:auto}.consumption-table{width:100%;border-collapse:collapse;min-width:1250px}.consumption-table th{padding:13px 14px;text-align:left;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;text-transform:uppercase;letter-spacing:.4px;font-weight:800;border-bottom:1px solid var(--admin-border);white-space:nowrap}.consumption-table td{padding:14px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.consumption-table tbody tr:last-child td{border-bottom:0}.consumption-table tbody tr:hover{background:var(--admin-surface-2)}.consumption-main{font-weight:800}.consumption-muted{font-size:11px;color:var(--admin-muted);margin-top:3px}.consumption-number{font-weight:750;white-space:nowrap}.consumption-session{display:inline-flex;padding:5px 9px;border-radius:999px;background:var(--admin-surface-2);font-size:11px;font-weight:800;white-space:nowrap}.consumption-actions-cell{display:flex;gap:6px}.consumption-icon-btn{width:32px;height:32px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-muted);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.consumption-icon-btn:hover{color:var(--admin-primary);border-color:var(--admin-primary)}.consumption-icon-btn.delete:hover{color:var(--admin-danger);border-color:var(--admin-danger)}.consumption-empty{padding:55px 20px;text-align:center}.consumption-empty-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:14px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;color:var(--admin-muted)}.consumption-empty h3{margin:0 0 5px;font-size:16px}.consumption-empty p{margin:0;color:var(--admin-muted);font-size:13px}.consumption-loading{padding:45px;text-align:center;color:var(--admin-muted);font-size:13px}.consumption-error{padding:22px;text-align:center;color:var(--admin-danger);font-size:13px}.consumption-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border-top:1px solid var(--admin-border)}.consumption-page-info{font-size:12px;color:var(--admin-muted)}.consumption-page-actions{display:flex;gap:7px}.consumption-page-btn{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer}.consumption-page-btn:disabled{opacity:.4;cursor:not-allowed}.consumption-page-btn:hover:not(:disabled){border-color:var(--admin-primary);color:var(--admin-primary)}.consumption-mobile-list{display:none}.consumption-mobile-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:13px;padding:14px}.consumption-mobile-top{display:flex;justify-content:space-between;gap:10px}.consumption-mobile-name{font-size:14px;font-weight:800}.consumption-mobile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:13px}.consumption-mobile-label{font-size:10px;color:var(--admin-muted);text-transform:uppercase}.consumption-mobile-value{font-size:12px;font-weight:700;margin-top:3px;word-break:break-word}.consumption-mobile-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--admin-border)}.consumption-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.consumption-modal{width:min(860px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 25px 80px rgba(0,0,0,.3)}.consumption-modal-header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 19px;background:var(--admin-surface);border-bottom:1px solid var(--admin-border)}.consumption-modal-title{font-size:17px;font-weight:800}.consumption-modal-subtitle{font-size:11px;color:var(--admin-muted);margin-top:3px}.consumption-close{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.consumption-form{padding:19px}.consumption-section{margin-bottom:20px}.consumption-section-title{display:flex;align-items:center;gap:8px;margin:0 0 12px;font-size:13px;font-weight:800}.consumption-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.consumption-field{display:flex;flex-direction:column;gap:6px}.consumption-field.full{grid-column:1/-1}.consumption-field label{font-size:11px;color:var(--admin-muted);font-weight:700}.consumption-field input,.consumption-field select,.consumption-field textarea{width:100%;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:10px 11px;font-size:13px;outline:none}.consumption-field input,.consumption-field select{height:40px}.consumption-field textarea{min-height:82px;resize:vertical}.consumption-field input:focus,.consumption-field select:focus,.consumption-field textarea:focus{border-color:var(--admin-primary)}.consumption-stock-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.consumption-stock-card{border:1px solid var(--admin-border);background:var(--admin-surface-2);border-radius:10px;padding:11px}.consumption-stock-label{font-size:10px;color:var(--admin-muted);text-transform:uppercase;letter-spacing:.3px}.consumption-stock-value{font-size:16px;font-weight:800;margin-top:4px}.consumption-form-actions{display:flex;justify-content:flex-end;gap:9px;padding-top:5px}.consumption-view-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--admin-border);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden;margin:19px}.consumption-view-item{background:var(--admin-surface);padding:13px}.consumption-view-full{grid-column:1/-1}.consumption-view-label{font-size:10px;color:var(--admin-muted);text-transform:uppercase;letter-spacing:.35px;font-weight:700}.consumption-view-value{font-size:13px;font-weight:750;margin-top:4px;word-break:break-word}.consumption-view-actions{display:flex;justify-content:flex-end;gap:9px;padding:0 19px 19px}@media(max-width:1250px){.consumption-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.consumption-filter-row{grid-template-columns:repeat(3,minmax(0,1fr))}.consumption-input-wrap{grid-column:1/-1}.consumption-date-row{margin-top:10px}.consumption-date-row .consumption-date-group{width:289px}.consumption-date-row .consumption-input{width:140px}}@media(max-width:850px){.consumption-page{padding:16px}.consumption-header{flex-direction:column}.consumption-actions{width:100%;justify-content:flex-end;display:flex;flex-wrap:nowrap;gap:8px}.consumption-actions .top-action-btn{flex:0 0 auto}.consumption-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.consumption-table-wrap{display:none}.consumption-mobile-list{display:grid;gap:10px}.consumption-form-grid{grid-template-columns:1fr}.consumption-field.full{grid-column:auto}.consumption-stock-info{grid-template-columns:1fr}.consumption-view-grid{grid-template-columns:1fr}.consumption-view-full{grid-column:auto}.consumption-date-row{align-items:flex-start}.consumption-date-row .consumption-date-group{width:289px}}@media(max-width:560px){.consumption-summary{grid-template-columns:1fr}.consumption-filter-row{grid-template-columns:1fr}.consumption-input-wrap{grid-column:auto}.consumption-date-row{display:grid;grid-template-columns:1fr;gap:8px}.consumption-date-row .consumption-date-group{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:8px}.consumption-date-row .consumption-input{width:100%}.consumption-date-clear{width:100%}.consumption-pagination{flex-direction:column;align-items:stretch}.consumption-page-actions{justify-content:center}.consumption-overlay{padding:10px}.consumption-modal{max-height:calc(100vh - 20px)}.consumption-modal-header{padding:14px}.consumption-form{padding:14px}.consumption-view-grid{margin:14px}.consumption-view-actions{padding:0 14px 14px}.consumption-form-actions{flex-direction:column-reverse}.consumption-form-actions .consumption-btn{width:100%}.consumption-actions{gap:6px}.consumption-actions .top-action-btn{height:38px;padding:0 8px;font-size:11px;gap:5px}.consumption-actions .refresh-action-btn{width:38px;padding:0}.consumption-actions .top-action-btn svg{width:16px;height:16px}.consumption-actions .add-action-btn{padding:0 9px}}`}</style>
      <div className="consumption-header">
        <div className="consumption-title-wrap">
          <div className="consumption-title-icon">
            <Leaf size={22} />
          </div>

          <div>
            <h1 className="consumption-title">Feed Consumption</h1>

            <p className="consumption-subtitle">Track daily feed usage, bird consumption, cost and inventory stock movement.</p>
          </div>
        </div>

        <div className="consumption-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || loadingDependencies} title="Refresh">
            <RefreshCw size={17} className={loading || loadingDependencies ? "consumption-refresh-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreate} disabled={loadingDependencies}>
            <Plus size={17} />
            Record Consumption
          </button>
        </div>
      </div>

      <div className="consumption-summary">
        <div className="consumption-stat">
          <div className="consumption-stat-top">
            <div className="consumption-stat-label">Records</div>

            <div className="consumption-stat-icon">
              <ClipboardList size={17} />
            </div>
          </div>

          <div className="consumption-stat-value">{summary.records}</div>

          <div className="consumption-stat-meta">Current page records</div>
        </div>

        <div className="consumption-stat">
          <div className="consumption-stat-top">
            <div className="consumption-stat-label">Feed Used</div>

            <div className="consumption-stat-icon">
              <Scale size={17} />
            </div>
          </div>

          <div className="consumption-stat-value">{formatNumber(summary.quantity)} kg</div>

          <div className="consumption-stat-meta">Total consumption</div>
        </div>

        <div className="consumption-stat">
          <div className="consumption-stat-top">
            <div className="consumption-stat-label">Birds Covered</div>

            <div className="consumption-stat-icon">
              <Users size={17} />
            </div>
          </div>

          <div className="consumption-stat-value">{formatNumber(summary.birds, 0)}</div>

          <div className="consumption-stat-meta">Bird count snapshots</div>
        </div>

        <div className="consumption-stat">
          <div className="consumption-stat-top">
            <div className="consumption-stat-label">Feed Cost</div>

            <div className="consumption-stat-icon">
              <IndianRupee size={17} />
            </div>
          </div>

          <div className="consumption-stat-value">₹{formatNumber(summary.totalCost)}</div>

          <div className="consumption-stat-meta">Total consumption cost</div>
        </div>

        <div className="consumption-stat">
          <div className="consumption-stat-top">
            <div className="consumption-stat-label">Avg / Bird</div>

            <div className="consumption-stat-icon">
              <Droplets size={17} />
            </div>
          </div>

          <div className="consumption-stat-value">{formatNumber(averageFeedPerBird)} g</div>

          <div className="consumption-stat-meta">Average feed per bird</div>
        </div>
      </div>

      <div className="consumption-filters">
        <div className="consumption-filter-row">
          <div className="consumption-input-wrap">
            <Search size={16} />

            <input className="consumption-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search farm, shed, batch, feed..." />

            {search && (
              <button type="button" className="consumption-search-clear" onClick={() => setSearch("")} title="Clear search" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="consumption-select"
            value={farmFilter}
            onChange={(event) => {
              setFarmFilter(event.target.value);
              setShedFilter("");
              setBatchFilter("");
              setPage(1);
            }}>
            <option value="">All Farms</option>

            {farms.map((farm) => (
              <option key={getId(farm)} value={getId(farm)}>
                {farm.name || farm.code || "Farm"}
              </option>
            ))}
          </select>

          <select
            className="consumption-select"
            value={shedFilter}
            onChange={(event) => {
              setShedFilter(event.target.value);
              setBatchFilter("");
              setPage(1);
            }}>
            <option value="">All Sheds</option>

            {sheds
              .filter((shed) => !farmFilter || String(getId(shed.farm)) === String(farmFilter))
              .map((shed) => (
                <option key={getId(shed)} value={getId(shed)}>
                  {shed.name || shed.code || "Shed"}
                </option>
              ))}
          </select>

          <select
            className="consumption-select"
            value={batchFilter}
            onChange={(event) => {
              setBatchFilter(event.target.value);
              setPage(1);
            }}>
            <option value="">All Batches</option>

            {batches
              .filter((batch) => {
                const sameFarm = !farmFilter || String(getId(batch.farm)) === String(farmFilter);

                const sameShed = !shedFilter || String(getId(batch.shed)) === String(shedFilter);

                return sameFarm && sameShed;
              })
              .map((batch) => (
                <option key={getId(batch)} value={getId(batch)}>
                  {batch.batchNumber || batch.batchName || "Batch"}
                </option>
              ))}
          </select>

          <select
            className="consumption-select"
            value={feedTypeFilter}
            onChange={(event) => {
              setFeedTypeFilter(event.target.value);
              setPage(1);
            }}>
            <option value="">All Feed Types</option>

            {feedTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="consumption-select"
            value={sessionFilter}
            onChange={(event) => {
              setSessionFilter(event.target.value);
              setPage(1);
            }}>
            <option value="">All Sessions</option>

            {sessionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="consumption-date-row">
          <div className="consumption-date-group">
            <input
              type="date"
              className="consumption-input"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              title="Start date"
            />

            <input
              type="date"
              className="consumption-input"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              title="End date"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              className="consumption-date-clear"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              title="Clear date filters"
              aria-label="Clear date filters">
              Clear
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="consumption-table-wrap">
          <div className="consumption-error">
            <AlertTriangle size={18} />
            <div style={{ marginTop: 8 }}>{error}</div>
          </div>
        </div>
      ) : loading ? (
        <div className="consumption-table-wrap">
          <div className="consumption-loading">Loading feed consumption...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="consumption-table-wrap">
          <div className="consumption-empty">
            <div className="consumption-empty-icon">
              <Leaf size={22} />
            </div>

            <h3>No feed consumption found</h3>

            <p>Record your first feed consumption entry or change the filters.</p>

            <div style={{ marginTop: 15 }}>
              <button type="button" className="consumption-btn consumption-btn-primary" onClick={openCreate}>
                <Plus size={15} />
                Record Consumption
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="consumption-table-wrap">
            <div className="consumption-table-scroll">
              <table className="consumption-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Feed</th>
                    <th>Farm / Shed</th>
                    <th>Batch</th>
                    <th>Session</th>
                    <th>Quantity</th>
                    <th>Birds</th>
                    <th>g / Bird</th>
                    <th>Cost / Kg</th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={getId(item)}>
                      <td>
                        <div className="consumption-main">{formatDate(item.consumptionDate)}</div>
                      </td>

                      <td>
                        <div className="consumption-main">{getFeedName(item)}</div>

                        <div className="consumption-muted">{getFeedTypeLabel(item.feedType)}</div>
                      </td>

                      <td>
                        <div className="consumption-main">{getFarmName(item)}</div>

                        <div className="consumption-muted">{getShedName(item)}</div>
                      </td>

                      <td>
                        <div className="consumption-main">{getBatchName(item)}</div>
                      </td>

                      <td>
                        <span className="consumption-session">{getSessionLabel(item.feedingSession)}</span>
                      </td>

                      <td className="consumption-number">{formatNumber(item.quantityKg)} kg</td>

                      <td className="consumption-number">{formatNumber(item.birdCountAtConsumption, 0)}</td>

                      <td className="consumption-number">{formatNumber(item.feedPerBirdGram)} g</td>

                      <td className="consumption-number">₹{formatNumber(item.costPerKg)}</td>

                      <td className="consumption-number">₹{formatNumber(item.totalCost)}</td>

                      <td>
                        <div className="consumption-actions-cell">
                          <button type="button" className="consumption-icon-btn" title="View" onClick={() => openView(item)}>
                            <Eye size={15} />
                          </button>

                          <button type="button" className="consumption-icon-btn" title="Edit" onClick={() => openEdit(item)}>
                            <Pencil size={15} />
                          </button>

                          <button type="button" className="consumption-icon-btn delete" title="Delete" disabled={deletingId === getId(item)} onClick={() => handleDelete(item)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="consumption-pagination">
              <div className="consumption-page-info">
                Page {pagination.page || page} of {pagination.totalPages || 1} · {pagination.total || filteredItems.length} total records
              </div>

              <div className="consumption-page-actions">
                <button type="button" className="consumption-page-btn" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)}>
                  <ChevronLeft size={16} />
                </button>

                <button type="button" className="consumption-page-btn" disabled={loading || page >= (pagination.totalPages || 1)} onClick={() => changePage(page + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="consumption-mobile-list">
            {filteredItems.map((item) => (
              <div className="consumption-mobile-card" key={getId(item)}>
                <div className="consumption-mobile-top">
                  <div>
                    <div className="consumption-mobile-name">{getFeedName(item)}</div>

                    <div className="consumption-muted">
                      {formatDate(item.consumptionDate)} · {getSessionLabel(item.feedingSession)}
                    </div>
                  </div>

                  <span className="consumption-session">{getFeedTypeLabel(item.feedType)}</span>
                </div>

                <div className="consumption-mobile-grid">
                  <div>
                    <div className="consumption-mobile-label">Quantity</div>
                    <div className="consumption-mobile-value">{formatNumber(item.quantityKg)} kg</div>
                  </div>

                  <div>
                    <div className="consumption-mobile-label">Birds</div>
                    <div className="consumption-mobile-value">{formatNumber(item.birdCountAtConsumption, 0)}</div>
                  </div>

                  <div>
                    <div className="consumption-mobile-label">Per Bird</div>
                    <div className="consumption-mobile-value">{formatNumber(item.feedPerBirdGram)} g</div>
                  </div>

                  <div>
                    <div className="consumption-mobile-label">Total Cost</div>
                    <div className="consumption-mobile-value">₹{formatNumber(item.totalCost)}</div>
                  </div>

                  <div>
                    <div className="consumption-mobile-label">Farm</div>
                    <div className="consumption-mobile-value">{getFarmName(item)}</div>
                  </div>

                  <div>
                    <div className="consumption-mobile-label">Batch</div>
                    <div className="consumption-mobile-value">{getBatchName(item)}</div>
                  </div>
                </div>

                <div className="consumption-mobile-actions">
                  <button type="button" className="consumption-icon-btn" onClick={() => openView(item)}>
                    <Eye size={15} />
                  </button>

                  <button type="button" className="consumption-icon-btn" onClick={() => openEdit(item)}>
                    <Pencil size={15} />
                  </button>

                  <button type="button" className="consumption-icon-btn delete" disabled={deletingId === getId(item)} onClick={() => handleDelete(item)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modal === "form" && (
        <div className="consumption-overlay" onMouseDown={closeModal}>
          <div className="consumption-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="consumption-modal-header">
              <div>
                <div className="consumption-modal-title">{selectedItem ? "Edit Feed Consumption" : "Record Feed Consumption"}</div>

                <div className="consumption-modal-subtitle">{selectedItem ? "Update consumption record and stock allocation" : "Record feed usage against farm stock"}</div>
              </div>

              <button type="button" className="consumption-close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <form className="consumption-form" onSubmit={handleSubmit}>
              <div className="consumption-section">
                <div className="consumption-section-title">
                  <Warehouse size={15} />
                  Farm & Stock Selection
                </div>

                <div className="consumption-form-grid">
                  <div className="consumption-field">
                    <label>Farm *</label>

                    <select name="farm" value={form.farm} onChange={handleFarmChange} disabled={Boolean(selectedItem)} required>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={getId(farm)} value={getId(farm)}>
                          {farm.name || farm.code || "Farm"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="consumption-field">
                    <label>Shed</label>

                    <select name="shed" value={form.shed} onChange={handleShedChange} disabled={!form.farm}>
                      <option value="">Select Shed</option>

                      {selectedFarmSheds.map((shed) => (
                        <option key={getId(shed)} value={getId(shed)}>
                          {shed.name || shed.code || "Shed"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="consumption-field">
                    <label>Batch</label>

                    <select name="batch" value={form.batch} onChange={handleFormChange} disabled={!form.farm}>
                      <option value="">Select Batch</option>

                      {selectedFarmBatches.map((batch) => (
                        <option key={getId(batch)} value={getId(batch)}>
                          {batch.batchNumber || batch.batchName || "Batch"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="consumption-field full">
                    <label>Feed Inventory *</label>

                    <select name="feedInventory" value={form.feedInventory} onChange={handleFeedInventoryChange} disabled={!form.farm} required>
                      <option value="">Select Feed Inventory</option>

                      {selectedFarmInventory.map((inventory) => (
                        <option key={getId(inventory)} value={getId(inventory)}>
                          {inventory.feedName} — {formatNumber(inventory.currentStockKg)} kg available
                          {inventory.status ? ` · ${inventory.status}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedInventory && (
                  <div className="consumption-stock-info">
                    <div className="consumption-stock-card">
                      <div className="consumption-stock-label">Available Stock</div>

                      <div className="consumption-stock-value">{formatNumber(selectedInventory.currentStockKg)} kg</div>
                    </div>

                    <div className="consumption-stock-card">
                      <div className="consumption-stock-label">Unit Cost</div>

                      <div className="consumption-stock-value">₹{formatNumber(selectedInventory.unitCostPerKg)}</div>
                    </div>

                    <div className="consumption-stock-card">
                      <div className="consumption-stock-label">Feed Status</div>

                      <div className="consumption-stock-value">{selectedInventory.status || "AVAILABLE"}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="consumption-section">
                <div className="consumption-section-title">
                  <CalendarDays size={15} />
                  Consumption Details
                </div>

                <div className="consumption-form-grid">
                  <div className="consumption-field">
                    <label>Consumption Date</label>

                    <input type="date" name="consumptionDate" value={form.consumptionDate} onChange={handleFormChange} />
                  </div>

                  <div className="consumption-field">
                    <label>Feed Type *</label>

                    <select name="feedType" value={form.feedType} onChange={handleFormChange} required>
                      {feedTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="consumption-field">
                    <label>Feeding Session</label>

                    <select name="feedingSession" value={form.feedingSession} onChange={handleFormChange}>
                      {sessionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="consumption-field">
                    <label>Quantity Consumed (Kg) *</label>

                    <input type="number" min="0.001" step="0.001" name="quantityKg" value={form.quantityKg} onChange={handleFormChange} placeholder="0" required />
                  </div>

                  <div className="consumption-field">
                    <label>Bird Count *</label>

                    <input type="number" min="1" step="1" name="birdCountAtConsumption" value={form.birdCountAtConsumption} onChange={handleFormChange} placeholder="Number of birds" required />
                  </div>

                  <div className="consumption-field">
                    <label>Cost / Kg</label>

                    <input type="number" min="0" step="0.01" name="costPerKg" value={form.costPerKg} onChange={handleFormChange} placeholder="₹ 0" />
                  </div>

                  <div className="consumption-field full">
                    <label>Notes</label>

                    <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Additional notes..." />
                  </div>
                </div>

                <div className="consumption-stock-info">
                  <div className="consumption-stock-card">
                    <div className="consumption-stock-label">Feed / Bird</div>

                    <div className="consumption-stock-value">{formatNumber(calculatedFeedPerBirdGram)} g</div>
                  </div>

                  <div className="consumption-stock-card">
                    <div className="consumption-stock-label">Total Cost</div>

                    <div className="consumption-stock-value">₹{formatNumber(calculatedTotalCost)}</div>
                  </div>

                  <div className="consumption-stock-card">
                    <div className="consumption-stock-label">Stock After Entry</div>

                    <div className="consumption-stock-value">{formatNumber(Math.max(availableStock - quantity, 0))} kg</div>
                  </div>
                </div>
              </div>

              <div className="consumption-form-actions">
                <button type="button" className="consumption-btn" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="consumption-btn consumption-btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={15} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      {selectedItem ? "Update Consumption" : "Save Consumption"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedItem && (
        <div className="consumption-overlay" onMouseDown={closeModal}>
          <div className="consumption-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="consumption-modal-header">
              <div>
                <div className="consumption-modal-title">Feed Consumption Details</div>

                <div className="consumption-modal-subtitle">Complete consumption record</div>
              </div>

              <button type="button" className="consumption-close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <div className="consumption-view-grid">
              <div className="consumption-view-item">
                <div className="consumption-view-label">Date</div>

                <div className="consumption-view-value">{formatDate(selectedItem.consumptionDate)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Feeding Session</div>

                <div className="consumption-view-value">{getSessionLabel(selectedItem.feedingSession)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Farm</div>

                <div className="consumption-view-value">{getFarmName(selectedItem)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Shed</div>

                <div className="consumption-view-value">{getShedName(selectedItem)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Batch</div>

                <div className="consumption-view-value">{getBatchName(selectedItem)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Feed Inventory</div>

                <div className="consumption-view-value">{getFeedName(selectedItem)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Feed Type</div>

                <div className="consumption-view-value">{getFeedTypeLabel(selectedItem.feedType)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Quantity</div>

                <div className="consumption-view-value">{formatNumber(selectedItem.quantityKg)} kg</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Bird Count</div>

                <div className="consumption-view-value">{formatNumber(selectedItem.birdCountAtConsumption, 0)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Feed Per Bird</div>

                <div className="consumption-view-value">{formatNumber(selectedItem.feedPerBirdGram)} g</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Cost Per Kg</div>

                <div className="consumption-view-value">₹{formatNumber(selectedItem.costPerKg)}</div>
              </div>

              <div className="consumption-view-item">
                <div className="consumption-view-label">Total Cost</div>

                <div className="consumption-view-value">₹{formatNumber(selectedItem.totalCost)}</div>
              </div>

              <div className="consumption-view-item consumption-view-full">
                <div className="consumption-view-label">Notes</div>

                <div className="consumption-view-value">{selectedItem.notes || "-"}</div>
              </div>

              <div className="consumption-view-item consumption-view-full">
                <div className="consumption-view-label">Recorded By</div>

                <div className="consumption-view-value">{selectedItem.recordedBy?.name || selectedItem.recordedBy?.email || "-"}</div>
              </div>
            </div>

            <div className="consumption-view-actions">
              <button type="button" className="consumption-btn" onClick={closeModal}>
                Close
              </button>

              <button type="button" className="consumption-btn consumption-btn-primary" onClick={() => openEdit(selectedItem)}>
                <Pencil size={15} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
