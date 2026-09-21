import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Edit3, Eye, FileSpreadsheet, FileText, Filter, IndianRupee, PackageOpen, Plus, RefreshCw, Search, Syringe, Trash2, Users, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

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

const getRoot = (response) => response?.data ?? response ?? {};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

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
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const formatNumber = (value, digits = 2) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
};

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "COMPLETED":
      return "status-success";
    case "PARTIALLY_COMPLETED":
      return "status-warning";
    case "MISSED":
      return "status-danger";
    case "CANCELLED":
      return "status-muted";
    default:
      return "status-info";
  }
};

const getStockClass = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "stock-available";
    case "LOW_STOCK":
      return "stock-low";
    case "OUT_OF_STOCK":
      return "stock-out";
    case "EXPIRED":
      return "stock-expired";
    default:
      return "stock-muted";
  }
};

const initialForm = () => ({
  farm: "",
  shed: "",
  batch: "",
  medicine: "",
  vaccineName: "",
  vaccinationDate: "",
  scheduledDate: new Date().toISOString().slice(0, 10),
  ageInDays: "",
  diseaseTarget: "",
  dosePerBird: "",
  doseUnit: "ML",
  birdsScheduled: "",
  birdsVaccinated: "",
  vaccineQuantityUsed: "",
  administrationRoute: "DRINKING_WATER",
  administeredBy: "",
  veterinarian: "",
  nextDueDate: "",
  adverseReaction: "NO",
  reactionDetails: "",
  notes: "",
  status: "SCHEDULED",
});

const statusOptions = ["SCHEDULED", "COMPLETED", "PARTIALLY_COMPLETED", "MISSED", "CANCELLED"];

const doseUnits = ["ML", "L", "GRAM", "KG", "DOSE", "VIAL"];

const administrationRoutes = ["DRINKING_WATER", "INJECTION", "ORAL", "SPRAY", "EYE_DROP", "OTHER"];

const adverseReactionOptions = ["NO", "YES"];

export default function VaccinationSchedule() {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dependenciesLoading, setDependenciesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    medicine: "",
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [form, setForm] = useState(initialForm());

  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadDependencies = async () => {
    setDependenciesLoading(true);

    try {
      const [farmsResponse, shedsResponse, batchesResponse, vaccineResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds?limit=100"), apiRequest("/batches?limit=100"), apiRequest("/medicine?type=VACCINE&limit=100")]);

      setFarms(getArray(farmsResponse, ["farms", "data"]));
      setSheds(getArray(shedsResponse, ["sheds", "data"]));
      setBatches(getArray(batchesResponse, ["batches", "data"]));
      setVaccines(getArray(vaccineResponse, ["data", "medicines"]));
    } catch (err) {
      showError(err?.message || err?.response?.data?.message || "Failed to load vaccination dependencies");
    } finally {
      setDependenciesLoading(false);
    }
  };

  const loadVaccinations = async () => {
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

      if (filters.batch) {
        params.set("batch", filters.batch);
      }

      if (filters.medicine) {
        params.set("medicine", filters.medicine);
      }

      if (filters.status) {
        params.set("status", filters.status);
      }

      if (filters.startDate) {
        params.set("startDate", filters.startDate);
      }

      if (filters.endDate) {
        params.set("endDate", filters.endDate);
      }

      params.set("page", page);
      params.set("limit", limit);

      const response = await apiRequest(`/vaccinations?${params.toString()}`);

      const root = getRoot(response);

      setRecords(getArray(response, ["data", "vaccinations"]));

      setPagination(
        root?.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || "Failed to load vaccination records";

      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadVaccinations(), loadDependencies()]);
  };

  const exportExcel = () => {
    const headers = [
      "Schedule Date",
      "Vaccination Date",
      "Vaccine",
      "Disease Target",
      "Farm",
      "Shed",
      "Batch",
      "Birds Scheduled",
      "Birds Vaccinated",
      "Vaccine Quantity",
      "Dose Unit",
      "Total Cost",
      "Status",
      "Next Due Date",
      "Administration Route",
      "Administered By",
      "Veterinarian",
      "Adverse Reaction",
      "Reaction Details",
      "Notes",
    ];

    const rows = visibleRecords.map((record) => [
      formatDate(record?.scheduledDate),
      formatDate(record?.vaccinationDate),
      record?.vaccineName || "",
      record?.diseaseTarget || "",
      farmName(record?.farm),
      shedName(record?.shed),
      batchName(record?.batch),
      Number(record?.birdsScheduled || 0),
      Number(record?.birdsVaccinated || 0),
      Number(record?.vaccineQuantityUsed || 0),
      record?.doseUnit || "",
      Number(record?.totalCost || 0),
      record?.status?.replaceAll("_", " ") || "",
      formatDate(record?.nextDueDate),
      record?.administrationRoute?.replaceAll("_", " ") || "",
      record?.administeredBy || "",
      record?.veterinarian?.name || record?.veterinarian || "",
      record?.adverseReaction || "",
      record?.reactionDetails || "",
      record?.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `vaccination-schedule-${new Date().toISOString().slice(0, 10)}.csv`;
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
          <td>${formatDate(record?.scheduledDate)}</td>
          <td>${record?.vaccineName || "-"}</td>
          <td>${record?.diseaseTarget || "-"}</td>
          <td>${farmName(record?.farm)}</td>
          <td>${shedName(record?.shed)}</td>
          <td>${batchName(record?.batch)}</td>
          <td>${Number(record?.birdsVaccinated || 0).toLocaleString("en-IN")} / ${Number(record?.birdsScheduled || 0).toLocaleString("en-IN")}</td>
          <td>${Number(record?.vaccineQuantityUsed || 0).toLocaleString("en-IN")} ${record?.doseUnit || ""}</td>
          <td>${formatCurrency(record?.totalCost)}</td>
          <td>${record?.status?.replaceAll("_", " ") || "-"}</td>
          <td>${formatDate(record?.nextDueDate)}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Vaccination Schedule</title>
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
        <h1>Vaccination Schedule Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

        <table>
          <thead>
            <tr>
              <th>Schedule</th>
              <th>Vaccine</th>
              <th>Disease</th>
              <th>Farm</th>
              <th>Shed</th>
              <th>Batch</th>
              <th>Birds</th>
              <th>Vaccine Qty</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Next Due</th>
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
    loadVaccinations();
  }, [page, filters.farm, filters.shed, filters.batch, filters.medicine, filters.status, filters.startDate, filters.endDate]);

  const filteredSheds = useMemo(() => {
    if (!form.farm) {
      return sheds;
    }

    return sheds.filter((item) => String(item?.farm?._id || item?.farm || "") === String(form.farm));
  }, [sheds, form.farm]);

  const filteredBatches = useMemo(() => {
    return batches.filter((item) => {
      const farmMatches = !form.farm || String(item?.farm?._id || item?.farm || "") === String(form.farm);

      const shedMatches = !form.shed || String(item?.shed?._id || item?.shed || "") === String(form.shed);

      return farmMatches && shedMatches;
    });
  }, [batches, form.farm, form.shed]);

  const filteredFilterSheds = useMemo(() => {
    if (!filters.farm) {
      return sheds;
    }

    return sheds.filter((item) => String(item?.farm?._id || item?.farm || "") === String(filters.farm));
  }, [sheds, filters.farm]);

  const filteredFilterBatches = useMemo(() => {
    return batches.filter((item) => {
      const farmMatches = !filters.farm || String(item?.farm?._id || item?.farm || "") === String(filters.farm);

      const shedMatches = !filters.shed || String(item?.shed?._id || item?.shed || "") === String(filters.shed);

      return farmMatches && shedMatches;
    });
  }, [batches, filters.farm, filters.shed]);

  const selectedVaccine = useMemo(() => {
    return vaccines.find((item) => String(item?._id || item?.id) === String(form.medicine));
  }, [vaccines, form.medicine]);

  const calculatedCost = useMemo(() => {
    const birds = Number(form.birdsVaccinated || 0);
    const dose = Number(form.dosePerBird || 0);
    const quantity = Number(form.vaccineQuantityUsed || 0);
    const unitCost = Number(selectedVaccine?.unitCost || 0);

    if (quantity > 0 && unitCost > 0) {
      return quantity * unitCost;
    }

    return birds * dose * unitCost;
  }, [form.birdsVaccinated, form.dosePerBird, form.vaccineQuantityUsed, selectedVaccine]);

  const summary = useMemo(() => {
    const total = records.length;

    const completed = records.filter((item) => item.status === "COMPLETED").length;

    const scheduled = records.filter((item) => item.status === "SCHEDULED").length;

    const upcoming = records.filter((item) => {
      if (item.status !== "SCHEDULED") {
        return false;
      }

      const date = item.scheduledDate ? new Date(item.scheduledDate) : null;

      return date && !Number.isNaN(date.getTime()) && date >= new Date();
    }).length;

    const totalBirds = records.reduce((sum, item) => sum + Number(item?.birdsVaccinated || 0), 0);

    const totalCost = records.reduce((sum, item) => sum + Number(item?.totalCost || 0), 0);

    return {
      total,
      completed,
      scheduled,
      upcoming,
      totalBirds,
      totalCost,
    };
  }, [records]);

  const visibleRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (!search) {
      return records;
    }

    return records.filter((item) => {
      const text = [item?.vaccineName, item?.diseaseTarget, item?.farm?.name, item?.farm?.code, item?.shed?.name, item?.shed?.code, item?.batch?.batchNumber, item?.batch?.batchName, item?.medicine?.name, item?.administeredBy, item?.veterinarian, item?.status].filter(Boolean).join(" ").toLowerCase();

      return text.includes(search);
    });
  }, [records, filters.search]);

  const resetFilters = () => {
    setFilters({
      farm: "",
      shed: "",
      batch: "",
      medicine: "",
      status: "",
      startDate: "",
      endDate: "",
      search: "",
    });

    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setPage(1);

    setFilters((previous) => {
      const next = {
        ...previous,
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

  const handleFormChange = (field, value) => {
    setForm((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      if (field === "farm") {
        next.shed = "";
        next.batch = "";
        next.medicine = "";
      }

      if (field === "shed") {
        next.batch = "";
      }

      if (field === "medicine") {
        const vaccine = vaccines.find((item) => String(item?._id || item?.id) === String(value));

        if (vaccine) {
          next.vaccineName = vaccine.name || previous.vaccineName;
        }
      }

      if (field === "status" && value === "SCHEDULED") {
        next.vaccinationDate = "";
      }

      return next;
    });
  };

  const openCreateModal = () => {
    setEditingId(null);

    setForm(initialForm());

    setModal("form");
  };

  const openEditModal = async (record) => {
    try {
      setSubmitting(true);

      const response = await apiRequest(`/vaccinations/${record._id}`);

      const item = getRoot(response);

      const data = item?.data || record;

      setEditingId(data._id);

      setForm({
        farm: data?.farm?._id || data?.farm || "",
        shed: data?.shed?._id || data?.shed || "",
        batch: data?.batch?._id || data?.batch || "",
        medicine: data?.medicine?._id || data?.medicine || "",
        vaccineName: data?.vaccineName || "",
        vaccinationDate: formatDateInput(data?.vaccinationDate),
        scheduledDate: formatDateInput(data?.scheduledDate),
        ageInDays: data?.ageInDays !== undefined && data?.ageInDays !== null ? String(data.ageInDays) : "",
        diseaseTarget: data?.diseaseTarget || "",
        dosePerBird: data?.dosePerBird !== undefined && data?.dosePerBird !== null ? String(data.dosePerBird) : "",
        doseUnit: data?.doseUnit || "ML",
        birdsScheduled: data?.birdsScheduled !== undefined && data?.birdsScheduled !== null ? String(data.birdsScheduled) : "",
        birdsVaccinated: data?.birdsVaccinated !== undefined && data?.birdsVaccinated !== null ? String(data.birdsVaccinated) : "",
        vaccineQuantityUsed: data?.vaccineQuantityUsed !== undefined && data?.vaccineQuantityUsed !== null ? String(data.vaccineQuantityUsed) : "",
        administrationRoute: data?.administrationRoute || "DRINKING_WATER",
        administeredBy: data?.administeredBy || "",
        veterinarian: data?.veterinarian?._id || data?.veterinarian || "",
        nextDueDate: formatDateInput(data?.nextDueDate),
        adverseReaction: data?.adverseReaction || "NO",
        reactionDetails: data?.reactionDetails || "",
        notes: data?.notes || "",
        status: data?.status || "SCHEDULED",
      });

      setModal("form");
    } catch (err) {
      showError(err?.message || err?.response?.data?.message || "Failed to load vaccination record");
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = async (record) => {
    try {
      const response = await apiRequest(`/vaccinations/${record._id}`);

      const root = getRoot(response);

      setSelectedRecord(root?.data || record);
      setModal("view");
    } catch (err) {
      setSelectedRecord(record);
      setModal("view");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.farm) {
      showError("Farm is required");
      return;
    }

    if (!form.vaccineName.trim()) {
      showError("Vaccine name is required");
      return;
    }

    if (!form.diseaseTarget.trim()) {
      showError("Disease target is required");
      return;
    }

    const scheduled = Number(form.birdsScheduled || 0);
    const vaccinated = Number(form.birdsVaccinated || 0);
    const dose = Number(form.dosePerBird || 0);
    const quantity = Number(form.vaccineQuantityUsed || 0);
    const age = form.ageInDays === "" ? undefined : Number(form.ageInDays);

    if (!Number.isFinite(scheduled) || scheduled < 0) {
      showError("Scheduled bird count must be a valid non-negative number");
      return;
    }

    if (!Number.isFinite(vaccinated) || vaccinated < 0) {
      showError("Vaccinated bird count must be a valid non-negative number");
      return;
    }

    if (scheduled > 0 && vaccinated > scheduled) {
      showError("Vaccinated birds cannot exceed scheduled birds");
      return;
    }

    if (!Number.isFinite(dose) || dose < 0) {
      showError("Dose per bird must be a valid non-negative number");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      showError("Vaccine quantity must be a valid non-negative number");
      return;
    }

    if (age !== undefined && (!Number.isFinite(age) || age < 0)) {
      showError("Age in days must be a valid non-negative number");
      return;
    }

    if (form.batch) {
      const batch = batches.find((item) => String(item?._id || item?.id) === String(form.batch));

      if (batch && vaccinated > Number(batch.currentQuantity || 0)) {
        showError(`Vaccinated birds cannot exceed current batch quantity (${Number(batch.currentQuantity || 0)})`);
        return;
      }
    }

    if (form.status === "COMPLETED" && !form.vaccinationDate) {
      showError("Vaccination date is required for completed vaccination");
      return;
    }

    if (form.status === "COMPLETED" && vaccinated <= 0) {
      showError("Vaccinated bird count must be greater than 0 for completed vaccination");
      return;
    }

    if (form.status === "COMPLETED" && form.medicine && quantity <= 0) {
      showError("Vaccine quantity used must be greater than 0 for completed vaccination");
      return;
    }

    if (form.medicine && selectedVaccine && form.status === "COMPLETED") {
      const stock = Number(selectedVaccine.currentStock || 0);

      if (!editingId && quantity > stock) {
        showError(`Insufficient vaccine stock. Available stock: ${formatNumber(stock)}`);
        return;
      }
    }

    const payload = {
      farm: form.farm,
      shed: form.shed || null,
      batch: form.batch || null,
      medicine: form.medicine || null,
      vaccineName: form.vaccineName.trim(),
      vaccinationDate: form.vaccinationDate || null,
      scheduledDate: form.scheduledDate || null,
      ageInDays: age,
      diseaseTarget: form.diseaseTarget.trim(),
      dosePerBird: dose,
      doseUnit: form.doseUnit,
      birdsScheduled: scheduled,
      birdsVaccinated: vaccinated,
      vaccineQuantityUsed: quantity,
      administrationRoute: form.administrationRoute,
      administeredBy: form.administeredBy.trim(),
      veterinarian: form.veterinarian || null,
      nextDueDate: form.nextDueDate || null,
      adverseReaction: form.adverseReaction,
      reactionDetails: form.reactionDetails.trim(),
      notes: form.notes.trim(),
      status: form.status,
    };

    setSubmitting(true);

    try {
      if (editingId) {
        const response = await apiRequest(`/vaccinations/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showSuccess(response?.message || "Vaccination record updated successfully");
      } else {
        const response = await apiRequest("/vaccinations", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess(response?.message || "Vaccination record created successfully");
      }

      setModal(null);
      setEditingId(null);
      setForm(initialForm());

      await Promise.all([loadVaccinations(), loadDependencies()]);
    } catch (err) {
      showError(err?.message || err?.response?.data?.message || "Failed to save vaccination record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    const vaccineName = record?.vaccineName || "this vaccination";

    const result = await showConfirm({
      title: "Delete Vaccination?",
      text: `Delete ${vaccineName}? If this is a completed vaccination, its vaccine stock will be restored automatically.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiRequest(`/vaccinations/${record._id}`, {
        method: "DELETE",
      });

      showSuccess(response?.message || "Vaccination record deleted and vaccine stock restored successfully");

      await Promise.all([loadVaccinations(), loadDependencies()]);
    } catch (err) {
      showError(err?.message || err?.response?.data?.message || "Failed to delete vaccination record");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > Number(pagination.totalPages || 1)) {
      return;
    }

    setPage(nextPage);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModal(null);
    setEditingId(null);
    setSelectedRecord(null);
    setForm(initialForm());
  };

  const farmName = (farm) => farm?.name || farm?.code || "-";

  const shedName = (shed) => shed?.name || shed?.code || "-";

  const batchName = (batch) => batch?.batchNumber || batch?.batchName || "-";

  return (
    <div className="vaccination-page">
      <div className="vaccination-header">
        <div>
          <div className="page-kicker">
            <Syringe size={16} />
            Farm OS
          </div>

          <h1>Vaccination Schedule</h1>

          <p>Schedule, record and track farm vaccination activities with vaccine stock control.</p>
        </div>

        <div className="header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || dependenciesLoading} title="Refresh">
            <RefreshCw size={17} className={loading || dependenciesLoading ? "vaccination-refresh-spin" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreateModal} disabled={dependenciesLoading}>
            <Plus size={17} />
            Add Vaccination
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon blue">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{pagination.total || summary.total}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Scheduled</span>
            <strong>{summary.scheduled}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">
            <Users size={21} />
          </div>

          <div>
            <span>Birds Vaccinated</span>
            <strong>{formatNumber(summary.totalBirds)}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon red">
            <IndianRupee size={21} />
          </div>

          <div>
            <span>Total Cost</span>
            <strong>{formatCurrency(summary.totalCost)}</strong>
          </div>
        </div>
      </div>

      <div className="filter-card">
        <div className="filter-title">
          <div>
            <Filter size={18} />
            Filters
          </div>
        </div>

        <div className="filter-grid">
          <div className="field">
            <label>Farm</label>
            <select value={filters.farm} onChange={(event) => handleFilterChange("farm", event.target.value)}>
              <option value="">All Farms</option>

              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farmName(farm)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Shed</label>
            <select value={filters.shed} onChange={(event) => handleFilterChange("shed", event.target.value)}>
              <option value="">All Sheds</option>

              {filteredFilterSheds.map((shed) => (
                <option key={shed._id} value={shed._id}>
                  {shedName(shed)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Batch</label>
            <select value={filters.batch} onChange={(event) => handleFilterChange("batch", event.target.value)}>
              <option value="">All Batches</option>

              {filteredFilterBatches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batchName(batch)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Vaccine</label>
            <select value={filters.medicine} onChange={(event) => handleFilterChange("medicine", event.target.value)}>
              <option value="">All Vaccines</option>

              {vaccines.map((vaccine) => (
                <option key={vaccine._id} value={vaccine._id}>
                  {vaccine.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Status</label>
            <select value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
              <option value="">All Status</option>

              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Start Date</label>
            <input type="date" value={filters.startDate} onChange={(event) => handleFilterChange("startDate", event.target.value)} />
          </div>

          <div className="field">
            <label>End Date</label>
            <input type="date" value={filters.endDate} onChange={(event) => handleFilterChange("endDate", event.target.value)} />
          </div>

          <div className="field search-field">
            <label>Search</label>

            <div className="search-box">
              <Search size={17} />

              <input
                type="text"
                placeholder="Vaccine, disease, batch..."
                value={filters.search}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    search: event.target.value,
                  }))
                }
              />

              {(filters.search || filters.startDate || filters.endDate) && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() =>
                    setFilters((previous) => ({
                      ...previous,
                      search: "",
                      startDate: "",
                      endDate: "",
                    }))
                  }
                  title="Clear search and date filters"
                  aria-label="Clear search and date filters">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Vaccination Records</h2>
            <span>
              {pagination.total || 0} record
              {Number(pagination.total || 0) === 1 ? "" : "s"}
            </span>
          </div>

          {summary.upcoming > 0 && (
            <div className="upcoming-badge">
              <CalendarDays size={15} />
              {summary.upcoming} upcoming
            </div>
          )}
        </div>

        {loading ? (
          <div className="state-box">
            <RefreshCw size={26} className="spin" />
            <p>Loading vaccination records...</p>
          </div>
        ) : error ? (
          <div className="state-box error-state">
            <p>{error}</p>

            <button type="button" className="secondary-btn" onClick={loadVaccinations}>
              Try Again
            </button>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="state-box">
            <Syringe size={34} />
            <h3>No vaccination records found</h3>
            <p>Add a vaccination schedule or change the filters.</p>

            <button type="button" className="primary-btn" onClick={openCreateModal}>
              <Plus size={17} />
              Add Vaccination
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Schedule</th>
                    <th>Vaccine</th>
                    <th>Farm / Shed</th>
                    <th>Batch</th>
                    <th>Birds</th>
                    <th>Vaccine Qty</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Next Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <div className="date-cell">
                          <strong>{formatDate(record.scheduledDate || record.vaccinationDate)}</strong>

                          {record.vaccinationDate && <span>Done: {formatDate(record.vaccinationDate)}</span>}
                        </div>
                      </td>

                      <td>
                        <div className="main-cell">
                          <strong>{record.vaccineName || "-"}</strong>

                          <span>{record.diseaseTarget || "-"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="main-cell">
                          <strong>{farmName(record.farm)}</strong>

                          <span>{record.shed ? shedName(record.shed) : "No shed"}</span>
                        </div>
                      </td>

                      <td>
                        <span className="batch-chip">{batchName(record.batch)}</span>
                      </td>

                      <td>
                        <div className="number-cell">
                          <strong>{formatNumber(record.birdsVaccinated)}</strong>

                          <span>/ {formatNumber(record.birdsScheduled)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="number-cell">
                          <strong>{formatNumber(record.vaccineQuantityUsed)}</strong>

                          <span>{record.doseUnit || ""}</span>
                        </div>
                      </td>

                      <td>
                        <strong>{formatCurrency(record.totalCost)}</strong>
                      </td>

                      <td>
                        <span className={`status-badge ${getStatusClass(record.status)}`}>{record.status?.replaceAll("_", " ")}</span>
                      </td>

                      <td>{formatDate(record.nextDueDate)}</td>

                      <td>
                        <div className="action-buttons">
                          <button type="button" className="icon-btn" title="View" onClick={() => openViewModal(record)}>
                            <Eye size={16} />
                          </button>

                          <button type="button" className="icon-btn" title="Edit" onClick={() => openEditModal(record)}>
                            <Edit3 size={16} />
                          </button>

                          <button type="button" className="icon-btn danger" title="Delete" onClick={() => handleDelete(record)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                Page {pagination.page || page} of {pagination.totalPages || 1}
              </span>

              <div>
                <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                  <ChevronLeft size={17} />
                </button>

                <button type="button" className="pagination-btn" disabled={page >= Number(pagination.totalPages || 1)} onClick={() => handlePageChange(page + 1)}>
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modal === "form" && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="modal-kicker">
                  <Syringe size={15} />
                  Vaccination
                </span>

                <h2>{editingId ? "Edit Vaccination" : "Record Vaccination"}</h2>

                <p>Schedule or record a farm vaccination activity.</p>
              </div>

              <button type="button" className="close-btn" onClick={closeModal} disabled={submitting}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Farm & Vaccine</h3>

                <div className="form-grid">
                  <div className="field">
                    <label>
                      Farm <span>*</span>
                    </label>

                    <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} required>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                          {farmName(farm)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Shed</label>

                    <select value={form.shed} onChange={(event) => handleFormChange("shed", event.target.value)}>
                      <option value="">Select Shed</option>

                      {filteredSheds.map((shed) => (
                        <option key={shed._id} value={shed._id}>
                          {shedName(shed)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Batch</label>

                    <select value={form.batch} onChange={(event) => handleFormChange("batch", event.target.value)}>
                      <option value="">Select Batch</option>

                      {filteredBatches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batchName(batch)} {batch.currentQuantity !== undefined ? `(${batch.currentQuantity} birds)` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Vaccine Inventory</label>

                    <select value={form.medicine} onChange={(event) => handleFormChange("medicine", event.target.value)}>
                      <option value="">Select Vaccine</option>

                      {vaccines.map((vaccine) => (
                        <option key={vaccine._id} value={vaccine._id}>
                          {vaccine.name} {vaccine.currentStock !== undefined ? `- Stock: ${formatNumber(vaccine.currentStock)}` : ""}
                        </option>
                      ))}
                    </select>

                    {selectedVaccine && (
                      <div className="stock-info">
                        <PackageOpen size={15} />

                        <span>
                          Stock: <strong>{formatNumber(selectedVaccine.currentStock)}</strong>
                        </span>

                        <span className={`stock-badge ${getStockClass(selectedVaccine.status)}`}>{selectedVaccine.status || "UNKNOWN"}</span>
                      </div>
                    )}
                  </div>

                  <div className="field">
                    <label>
                      Vaccine Name <span>*</span>
                    </label>

                    <input type="text" value={form.vaccineName} onChange={(event) => handleFormChange("vaccineName", event.target.value)} placeholder="e.g. ND Lasota" required />
                  </div>

                  <div className="field">
                    <label>
                      Disease Target <span>*</span>
                    </label>

                    <input type="text" value={form.diseaseTarget} onChange={(event) => handleFormChange("diseaseTarget", event.target.value)} placeholder="e.g. Newcastle Disease" required />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Schedule & Status</h3>

                <div className="form-grid">
                  <div className="field">
                    <label>Scheduled Date</label>

                    <input type="date" value={form.scheduledDate} onChange={(event) => handleFormChange("scheduledDate", event.target.value)} />
                  </div>

                  <div className="field">
                    <label>Vaccination Date</label>

                    <input type="date" value={form.vaccinationDate} onChange={(event) => handleFormChange("vaccinationDate", event.target.value)} />
                  </div>

                  <div className="field">
                    <label>Next Due Date</label>

                    <input type="date" value={form.nextDueDate} onChange={(event) => handleFormChange("nextDueDate", event.target.value)} />
                  </div>

                  <div className="field">
                    <label>Status</label>

                    <select value={form.status} onChange={(event) => handleFormChange("status", event.target.value)}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Age in Days</label>

                    <input type="number" min="0" value={form.ageInDays} onChange={(event) => handleFormChange("ageInDays", event.target.value)} placeholder="e.g. 14" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Birds & Dose</h3>

                <div className="form-grid">
                  <div className="field">
                    <label>Birds Scheduled</label>

                    <input type="number" min="0" value={form.birdsScheduled} onChange={(event) => handleFormChange("birdsScheduled", event.target.value)} placeholder="0" />
                  </div>

                  <div className="field">
                    <label>Birds Vaccinated</label>

                    <input type="number" min="0" value={form.birdsVaccinated} onChange={(event) => handleFormChange("birdsVaccinated", event.target.value)} placeholder="0" />
                  </div>

                  <div className="field">
                    <label>Dose Per Bird</label>

                    <input type="number" min="0" step="0.01" value={form.dosePerBird} onChange={(event) => handleFormChange("dosePerBird", event.target.value)} placeholder="0" />
                  </div>

                  <div className="field">
                    <label>Dose Unit</label>

                    <select value={form.doseUnit} onChange={(event) => handleFormChange("doseUnit", event.target.value)}>
                      {doseUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Vaccine Quantity Used</label>

                    <input type="number" min="0" step="0.01" value={form.vaccineQuantityUsed} onChange={(event) => handleFormChange("vaccineQuantityUsed", event.target.value)} placeholder="0" />

                    {selectedVaccine && (
                      <small className="field-help">
                        Available: {formatNumber(selectedVaccine.currentStock)} {selectedVaccine.unit || ""}
                      </small>
                    )}
                  </div>

                  <div className="field">
                    <label>Estimated Total Cost</label>

                    <div className="calculated-box">
                      <IndianRupee size={17} />
                      <strong>{formatCurrency(calculatedCost)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Administration</h3>

                <div className="form-grid">
                  <div className="field">
                    <label>Administration Route</label>

                    <select value={form.administrationRoute} onChange={(event) => handleFormChange("administrationRoute", event.target.value)}>
                      {administrationRoutes.map((route) => (
                        <option key={route} value={route}>
                          {route.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Administered By</label>

                    <input type="text" value={form.administeredBy} onChange={(event) => handleFormChange("administeredBy", event.target.value)} placeholder="Staff name" />
                  </div>

                  <div className="field">
                    <label>Veterinarian</label>

                    <input type="text" value={form.veterinarian} onChange={(event) => handleFormChange("veterinarian", event.target.value)} placeholder="Veterinarian name / ID" />
                  </div>

                  <div className="field">
                    <label>Adverse Reaction</label>

                    <select value={form.adverseReaction} onChange={(event) => handleFormChange("adverseReaction", event.target.value)}>
                      {adverseReactionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field field-full">
                    <label>Reaction Details</label>

                    <textarea rows="3" value={form.reactionDetails} onChange={(event) => handleFormChange("reactionDetails", event.target.value)} placeholder="Describe any adverse reaction..." />
                  </div>

                  <div className="field field-full">
                    <label>Notes</label>

                    <textarea rows="3" value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Additional notes..." />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingId ? "Update Vaccination" : "Save Vaccination"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedRecord && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}>
          <div className="modal view-modal">
            <div className="modal-header">
              <div>
                <span className="modal-kicker">
                  <Eye size={15} />
                  Vaccination Details
                </span>

                <h2>{selectedRecord.vaccineName || "Vaccination"}</h2>

                <p>{selectedRecord.diseaseTarget || "Vaccination record"}</p>
              </div>

              <button type="button" className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="view-status-row">
              <span className={`status-badge ${getStatusClass(selectedRecord.status)}`}>{selectedRecord.status?.replaceAll("_", " ")}</span>

              {selectedRecord.medicine && <span className={`stock-badge ${getStockClass(selectedRecord.medicine.status)}`}>Stock: {formatNumber(selectedRecord.medicine.currentStock)}</span>}
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <span>Farm</span>
                <strong>{farmName(selectedRecord.farm)}</strong>
              </div>

              <div className="detail-card">
                <span>Shed</span>
                <strong>{shedName(selectedRecord.shed)}</strong>
              </div>

              <div className="detail-card">
                <span>Batch</span>
                <strong>{batchName(selectedRecord.batch)}</strong>
              </div>

              <div className="detail-card">
                <span>Vaccine Inventory</span>
                <strong>{selectedRecord.medicine?.name || "Not linked"}</strong>
              </div>

              <div className="detail-card">
                <span>Scheduled Date</span>
                <strong>{formatDate(selectedRecord.scheduledDate)}</strong>
              </div>

              <div className="detail-card">
                <span>Vaccination Date</span>
                <strong>{formatDate(selectedRecord.vaccinationDate)}</strong>
              </div>

              <div className="detail-card">
                <span>Next Due Date</span>
                <strong>{formatDate(selectedRecord.nextDueDate)}</strong>
              </div>

              <div className="detail-card">
                <span>Age</span>
                <strong>{selectedRecord.ageInDays !== undefined && selectedRecord.ageInDays !== null ? `${formatNumber(selectedRecord.ageInDays)} days` : "-"}</strong>
              </div>

              <div className="detail-card">
                <span>Birds Scheduled</span>
                <strong>{formatNumber(selectedRecord.birdsScheduled)}</strong>
              </div>

              <div className="detail-card">
                <span>Birds Vaccinated</span>
                <strong>{formatNumber(selectedRecord.birdsVaccinated)}</strong>
              </div>

              <div className="detail-card">
                <span>Dose Per Bird</span>
                <strong>
                  {formatNumber(selectedRecord.dosePerBird)} {selectedRecord.doseUnit || ""}
                </strong>
              </div>

              <div className="detail-card">
                <span>Vaccine Quantity Used</span>
                <strong>{formatNumber(selectedRecord.vaccineQuantityUsed)}</strong>
              </div>

              <div className="detail-card">
                <span>Total Cost</span>
                <strong>{formatCurrency(selectedRecord.totalCost)}</strong>
              </div>

              <div className="detail-card">
                <span>Administration</span>
                <strong>{selectedRecord.administrationRoute?.replaceAll("_", " ") || "-"}</strong>
              </div>

              <div className="detail-card">
                <span>Administered By</span>
                <strong>{selectedRecord.administeredBy || "-"}</strong>
              </div>

              <div className="detail-card">
                <span>Veterinarian</span>
                <strong>{selectedRecord.veterinarian?.name || selectedRecord.veterinarian || "-"}</strong>
              </div>

              <div className="detail-card">
                <span>Adverse Reaction</span>
                <strong>{selectedRecord.adverseReaction || "NO"}</strong>
              </div>
            </div>

            {selectedRecord.reactionDetails && (
              <div className="detail-text">
                <span>Reaction Details</span>
                <p>{selectedRecord.reactionDetails}</p>
              </div>
            )}

            {selectedRecord.notes && (
              <div className="detail-text">
                <span>Notes</span>
                <p>{selectedRecord.notes}</p>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={closeModal}>
                Close
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const record = selectedRecord;

                  closeModal();

                  setTimeout(() => {
                    openEditModal(record);
                  }, 0);
                }}>
                <Edit3 size={17} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.vaccination-refresh-spin{animation:vaccinationHeaderSpin 1s linear infinite}@keyframes vaccinationHeaderSpin{to{transform:rotate(360deg)}}.field input[type="date"]{color-scheme:light dark}.field input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .field input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.vaccination-page{padding:24px;min-height:100%;background:var(--admin-bg);color:var(--admin-text)}.vaccination-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.page-kicker{display:flex;align-items:center;gap:7px;color:var(--admin-primary);font-size:13px;font-weight:700;margin-bottom:7px}.vaccination-header h1{margin:0;font-size:28px;line-height:1.2}.vaccination-header p{margin:7px 0 0;color:var(--admin-muted);font-size:14px}.header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.primary-btn,.secondary-btn,.reset-btn,.icon-btn,.pagination-btn,.close-btn{border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;font:inherit;transition:.2s}.primary-btn{background:var(--admin-primary);color:#fff;padding:11px 16px;border-radius:10px;font-size:14px;font-weight:700}.primary-btn:hover{filter:brightness(.95);transform:translateY(-1px)}.secondary-btn{background:var(--admin-surface);border:1px solid var(--admin-border);color:var(--admin-text);padding:10px 14px;border-radius:10px;font-size:14px;font-weight:600}.secondary-btn:hover{background:var(--admin-surface-2)}.primary-btn:disabled,.secondary-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.summary-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:18px}.summary-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:17px;display:flex;align-items:center;gap:13px;min-width:0}.summary-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}.summary-icon.blue{background:rgba(59,130,246,.12);color:#3b82f6}.summary-icon.green{background:rgba(34,197,94,.12);color:#22c55e}.summary-icon.orange{background:rgba(249,115,22,.12);color:#f97316}.summary-icon.purple{background:rgba(168,85,247,.12);color:#a855f7}.summary-icon.red{background:rgba(239,68,68,.12);color:#ef4444}.summary-card span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:5px}.summary-card strong{display:block;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.filter-card,.table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;margin-bottom:18px}.filter-card{padding:17px}.filter-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.filter-title>div{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700}.reset-btn{background:transparent;color:var(--admin-muted);font-size:13px;padding:5px}.reset-btn:hover{color:var(--admin-text)}.filter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.field{min-width:0}.field label{display:block;font-size:12px;color:var(--admin-muted);font-weight:600;margin-bottom:6px}.field label span{color:var(--admin-danger)}.field input,.field select,.field textarea{width:100%;box-sizing:border-box;background:var(--admin-surface-2);border:1px solid var(--admin-border);color:var(--admin-text);border-radius:9px;padding:10px 11px;outline:none;font:inherit;font-size:13px}.field textarea{resize:vertical;min-height:82px}.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px rgba(59,130,246,.08)}.search-field{grid-column:span 1}.search-box{display:flex;align-items:center;gap:8px;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:9px;padding:0 11px;color:var(--admin-muted)}.search-box{position:relative}.search-box input{padding-right:34px}.search-clear-btn{position:absolute;right:7px;top:50%;transform:translateY(-50%);width:26px;height:26px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.search-clear-btn:hover{background:var(--admin-surface);color:var(--admin-text)}.search-box input{border:0;background:transparent;padding:10px 0;box-shadow:none}.search-box input:focus{box-shadow:none}.table-card{overflow:hidden}.table-header{padding:17px 18px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:12px}.table-header h2{font-size:16px;margin:0 0 4px}.table-header span{font-size:12px;color:var(--admin-muted)}.upcoming-badge{display:flex;align-items:center;gap:6px;background:rgba(59,130,246,.1);color:#3b82f6;padding:7px 10px;border-radius:8px;font-size:12px;font-weight:700}.table-wrap{overflow-x:auto}.table-wrap table{width:100%;border-collapse:collapse;min-width:1250px}.table-wrap th{background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;text-transform:uppercase;letter-spacing:.04em;font-weight:700;padding:11px 12px;text-align:left;border-bottom:1px solid var(--admin-border);white-space:nowrap}.table-wrap td{padding:12px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.table-wrap tbody tr:last-child td{border-bottom:0}.table-wrap tbody tr:hover{background:rgba(127,127,127,.035)}.date-cell,.main-cell,.number-cell{display:flex;flex-direction:column;gap:3px}.date-cell strong,.main-cell strong,.number-cell strong{font-size:13px}.date-cell span,.main-cell span,.number-cell span{font-size:11px;color:var(--admin-muted)}.batch-chip{display:inline-flex;align-items:center;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:7px;padding:5px 8px;font-size:11px;white-space:nowrap}.status-badge,.stock-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:7px;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.03em;white-space:nowrap}.status-success{background:rgba(34,197,94,.12);color:#22c55e}.status-warning{background:rgba(234,179,8,.13);color:#ca8a04}.status-danger{background:rgba(239,68,68,.12);color:#ef4444}.status-muted{background:rgba(127,127,127,.12);color:var(--admin-muted)}.status-info{background:rgba(59,130,246,.12);color:#3b82f6}.stock-available{background:rgba(34,197,94,.12);color:#22c55e}.stock-low{background:rgba(234,179,8,.13);color:#ca8a04}.stock-out,.stock-expired{background:rgba(239,68,68,.12);color:#ef4444}.stock-muted{background:rgba(127,127,127,.12);color:var(--admin-muted)}.action-buttons{display:flex;align-items:center;gap:6px}.icon-btn{width:32px;height:32px;border-radius:8px;background:var(--admin-surface-2);border:1px solid var(--admin-border);color:var(--admin-muted)}.icon-btn:hover{color:var(--admin-text);border-color:var(--admin-primary)}.icon-btn.danger:hover{color:var(--admin-danger);border-color:var(--admin-danger)}.pagination{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-top:1px solid var(--admin-border);font-size:12px;color:var(--admin-muted)}.pagination>div{display:flex;gap:6px}.pagination-btn{width:32px;height:32px;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:8px;color:var(--admin-text)}.pagination-btn:disabled{opacity:.4;cursor:not-allowed}.state-box{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--admin-muted);padding:30px;text-align:center}.state-box h3{margin:0;color:var(--admin-text);font-size:16px}.state-box p{margin:0;font-size:13px}.error-state{color:var(--admin-danger)}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}.modal{width:min(920px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.3)}.view-modal{width:min(850px,100%)}.modal-header{padding:18px 20px;border-bottom:1px solid var(--admin-border);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.modal-kicker{display:flex;align-items:center;gap:6px;color:var(--admin-primary);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.modal-header h2{margin:5px 0 4px;font-size:20px}.modal-header p{margin:0;color:var(--admin-muted);font-size:12px}.close-btn{width:34px;height:34px;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:9px;color:var(--admin-muted);flex:0 0 auto}.close-btn:hover{color:var(--admin-text)}.form-section{padding:18px 20px;border-bottom:1px solid var(--admin-border)}.form-section h3{font-size:14px;margin:0 0 14px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field-full{grid-column:1/-1}.stock-info{margin-top:7px;display:flex;align-items:center;gap:7px;color:var(--admin-muted);font-size:11px}.stock-info strong{color:var(--admin-text)}.field-help{display:block;color:var(--admin-muted);font-size:10px;margin-top:5px}.calculated-box{height:39px;box-sizing:border-box;display:flex;align-items:center;gap:7px;padding:0 11px;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:9px;color:var(--admin-primary)}.calculated-box strong{font-size:14px}.modal-footer{padding:15px 20px;display:flex;align-items:center;justify-content:flex-end;gap:9px}.view-status-row{padding:14px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--admin-border)}.detail-grid{padding:18px 20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.detail-card{background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:10px;padding:12px}.detail-card span,.detail-text span{display:block;color:var(--admin-muted);font-size:11px;margin-bottom:5px}.detail-card strong{display:block;font-size:13px;word-break:break-word}.detail-text{margin:0 20px 12px;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-radius:10px;padding:12px}.detail-text p{margin:0;color:var(--admin-text);font-size:13px;line-height:1.5;white-space:pre-wrap}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1100px){.summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.filter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.vaccination-page{padding:16px}.vaccination-header{flex-direction:column}.header-actions{width:100%;display:flex;flex-wrap:nowrap;gap:8px}.header-actions .top-action-btn{flex:0 0 auto}.header-actions .add-action-btn{flex:0 0 auto}.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.vaccination-page{padding:12px}.vaccination-header h1{font-size:23px}.header-actions{gap:6px}.header-actions .top-action-btn{padding:0 9px}.header-actions .refresh-action-btn{width:38px;padding:0}.header-actions .top-action-btn svg{width:16px;height:16px}.header-actions .add-action-btn{padding:0 10px}.summary-grid{grid-template-columns:1fr}.filter-grid,.form-grid,.detail-grid{grid-template-columns:1fr}.field-full{grid-column:auto}.modal-overlay{padding:8px}.modal{max-height:calc(100vh - 16px);border-radius:12px}.modal-header,.form-section,.modal-footer,.view-status-row{padding-left:14px;padding-right:14px}.detail-text{margin-left:14px;margin-right:14px}.table-header{align-items:flex-start;flex-direction:column}.pagination{padding:11px 12px}}`}</style>
    </div>
  );
}
