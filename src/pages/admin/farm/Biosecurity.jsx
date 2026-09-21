import { useEffect, useMemo, useState } from "react";
import { Eye, FileSpreadsheet, FileText, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users, X } from "lucide-react";
import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const VISITOR_TYPES = ["SUPPLIER", "VETERINARIAN", "FARMER", "CUSTOMER", "STAFF", "DELIVERY", "GOVERNMENT", "TECHNICIAN", "OTHER"];
const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];

const emptyForm = {
  farm: "",
  visitorName: "",
  phone: "",
  visitorType: "SUPPLIER",
  purpose: "",
  companyName: "",
  vehicleNumber: "",
  visitDate: "",
  checkIn: "",
  checkOut: "",
  visitingShed: "",
  lastFarmVisitDate: "",
  visitedOtherPoultryFarmRecently: false,
  recentPoultryFarmDetails: "",
  biosecurityMeasures: {
    footwearDisinfection: false,
    handSanitization: false,
    protectiveClothing: false,
    vehicleDisinfection: false,
    visitorRestricted: false,
  },
  healthDeclaration: {
    fever: false,
    respiratorySymptoms: false,
    illness: false,
    fitToVisit: true,
  },
  riskLevel: "LOW",
  approvedBy: "",
  notes: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getResponseData = (response) => response?.data?.data ?? response?.data ?? [];

const Biosecurity = () => {
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterFarm, setFilterFarm] = useState("");
  const [filterVisitorType, setFilterVisitorType] = useState("");
  const [filterRiskLevel, setFilterRiskLevel] = useState("");
  const [filterShed, setFilterShed] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");
      const data = getResponseData(response);
      setFarms(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || "Failed to load farms");
    }
  };

  const loadSheds = async () => {
    try {
      const response = await apiRequest("/sheds");
      const data = getResponseData(response);
      setSheds(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || "Failed to load sheds");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiRequest("/admin/users");
      const data = getResponseData(response);
      const list = Array.isArray(data) ? data : [];
      setUsers(list.filter((user) => ["staff", "admin"].includes(user?.role) && !user?.isBlocked));
    } catch (error) {
      showError(error?.message || "Failed to load approvers");
    }
  };

  const loadVisitors = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filterFarm) params.set("farm", filterFarm);
      if (filterVisitorType) params.set("visitorType", filterVisitorType);
      if (filterRiskLevel) params.set("riskLevel", filterRiskLevel);
      if (filterShed) params.set("visitingShed", filterShed);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const query = params.toString();
      const response = await apiRequest(`/biosecurity-visitors${query ? `?${query}` : ""}`);
      const data = getResponseData(response);

      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || "Failed to load biosecurity records");
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingFormData(true);
      await Promise.all([loadFarms(), loadSheds(), loadUsers()]);
      setLoadingFormData(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    loadVisitors();
  }, [filterFarm, filterVisitorType, filterRiskLevel, filterShed, fromDate, toDate]);

  const filteredVisitors = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return visitors;

    return visitors.filter((item) => {
      const searchable = [item?.visitorName, item?.phone, item?.visitorType, item?.purpose, item?.companyName, item?.vehicleNumber, item?.farm?.name, item?.farm?.code, item?.visitingShed?.name, item?.visitingShed?.code, item?.riskLevel, item?.approvedBy?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(value);
    });
  }, [visitors, search]);

  const summary = useMemo(() => {
    return {
      total: visitors.length,
      low: visitors.filter((item) => item?.riskLevel === "LOW").length,
      medium: visitors.filter((item) => item?.riskLevel === "MEDIUM").length,
      high: visitors.filter((item) => item?.riskLevel === "HIGH").length,
    };
  }, [visitors]);

  const availableSheds = useMemo(() => {
    if (!form.farm) return sheds;
    return sheds.filter((shed) => {
      const farmId = shed?.farm?._id || shed?.farm;
      return String(farmId) === String(form.farm);
    });
  }, [sheds, form.farm]);

  const filterSheds = useMemo(() => {
    if (!filterFarm) return sheds;
    return sheds.filter((shed) => {
      const farmId = shed?.farm?._id || shed?.farm;
      return String(farmId) === String(filterFarm);
    });
  }, [sheds, filterFarm]);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateNestedForm = (section, field, value) => {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const openCreate = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      farm: farms.length === 1 ? farms[0]?._id || farms[0]?.id || "" : "",
      visitDate: new Date().toISOString().slice(0, 10),
    });

    setShowModal(true);
  };

  const openEdit = async (visitor) => {
    try {
      setEditingId(visitor?._id);
      setForm({
        farm: visitor?.farm?._id || visitor?.farm || "",
        visitorName: visitor?.visitorName || "",
        phone: visitor?.phone || "",
        visitorType: visitor?.visitorType || "SUPPLIER",
        purpose: visitor?.purpose || "",
        companyName: visitor?.companyName || "",
        vehicleNumber: visitor?.vehicleNumber || "",
        visitDate: toDateInput(visitor?.visitDate),
        checkIn: toDateTimeInput(visitor?.checkIn),
        checkOut: toDateTimeInput(visitor?.checkOut),
        visitingShed: visitor?.visitingShed?._id || visitor?.visitingShed || "",
        lastFarmVisitDate: toDateInput(visitor?.lastFarmVisitDate),
        visitedOtherPoultryFarmRecently: Boolean(visitor?.visitedOtherPoultryFarmRecently),
        recentPoultryFarmDetails: visitor?.recentPoultryFarmDetails || "",
        biosecurityMeasures: {
          footwearDisinfection: Boolean(visitor?.biosecurityMeasures?.footwearDisinfection),
          handSanitization: Boolean(visitor?.biosecurityMeasures?.handSanitization),
          protectiveClothing: Boolean(visitor?.biosecurityMeasures?.protectiveClothing),
          vehicleDisinfection: Boolean(visitor?.biosecurityMeasures?.vehicleDisinfection),
          visitorRestricted: Boolean(visitor?.biosecurityMeasures?.visitorRestricted),
        },
        healthDeclaration: {
          fever: Boolean(visitor?.healthDeclaration?.fever),
          respiratorySymptoms: Boolean(visitor?.healthDeclaration?.respiratorySymptoms),
          illness: Boolean(visitor?.healthDeclaration?.illness),
          fitToVisit: visitor?.healthDeclaration?.fitToVisit !== false,
        },
        riskLevel: visitor?.riskLevel || "LOW",
        approvedBy: visitor?.approvedBy?._id || visitor?.approvedBy || "",
        notes: visitor?.notes || "",
      });

      setShowModal(true);
    } catch (error) {
      showError(error?.message || "Unable to open record");
    }
  };

  const openView = (visitor) => {
    setSelectedVisitor(visitor);
    setShowViewModal(true);
  };

  const validateForm = () => {
    if (!form.farm) {
      showError("Please select a farm");
      return false;
    }

    if (!form.visitorName.trim()) {
      showError("Visitor name is required");
      return false;
    }

    if (!form.visitorType) {
      showError("Visitor type is required");
      return false;
    }

    if (!form.purpose.trim()) {
      showError("Visit purpose is required");
      return false;
    }

    if (!form.visitDate) {
      showError("Visit date is required");
      return false;
    }

    if (form.checkIn && form.checkOut && new Date(form.checkOut) < new Date(form.checkIn)) {
      showError("Check-out cannot be before check-in");
      return false;
    }

    if (form.visitedOtherPoultryFarmRecently && !form.recentPoultryFarmDetails.trim()) {
      showError("Recent poultry farm visit details are required");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    farm: form.farm,
    visitorName: form.visitorName.trim(),
    phone: form.phone.trim(),
    visitorType: form.visitorType,
    purpose: form.purpose.trim(),
    companyName: form.companyName.trim(),
    vehicleNumber: form.vehicleNumber.trim(),
    visitDate: form.visitDate,
    checkIn: form.checkIn || null,
    checkOut: form.checkOut || null,
    visitingShed: form.visitingShed || null,
    lastFarmVisitDate: form.lastFarmVisitDate || null,
    visitedOtherPoultryFarmRecently: Boolean(form.visitedOtherPoultryFarmRecently),
    recentPoultryFarmDetails: form.recentPoultryFarmDetails.trim(),
    biosecurityMeasures: form.biosecurityMeasures,
    healthDeclaration: form.healthDeclaration,
    riskLevel: form.riskLevel,
    approvedBy: form.approvedBy || null,
    notes: form.notes.trim(),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = buildPayload();

      if (editingId) {
        const response = await apiRequest(`/biosecurity-visitors/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showSuccess(response?.message || response?.data?.message || "Biosecurity record updated successfully");
      } else {
        const response = await apiRequest("/biosecurity-visitors", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess(response?.message || response?.data?.message || "Biosecurity visitor record created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadVisitors();
    } catch (error) {
      showError(error?.message || "Failed to save biosecurity record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (visitor) => {
    const result = await showConfirm({
      title: "Delete Visitor Record?",
      text: `${visitor?.visitorName || "This visitor record"} will be permanently deleted.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/biosecurity-visitors/${visitor?._id}`, {
        method: "DELETE",
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete visitor record");
      }

      showSuccess(response.message || "Biosecurity record deleted successfully");
      await loadVisitors();
    } catch (error) {
      showError(error?.message || "Failed to delete record");
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  const exportExcel = () => {
    if (!filteredVisitors.length) {
      showError("No visitor records available to export");
      return;
    }

    const headers = ["Visitor Name", "Phone", "Company", "Visitor Type", "Farm", "Shed", "Visit Date", "Purpose", "Risk Level", "Check In", "Check Out"];

    const rows = filteredVisitors.map((visitor) => [
      visitor?.visitorName || "",
      visitor?.phone || "",
      visitor?.companyName || "",
      visitor?.visitorType || "",
      visitor?.farm?.name || "",
      visitor?.visitingShed?.name || "",
      formatDate(visitor?.visitDate),
      visitor?.purpose || "",
      visitor?.riskLevel || "",
      formatDateTime(visitor?.checkIn),
      formatDateTime(visitor?.checkOut),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `biosecurity-visitors-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!filteredVisitors.length) {
      showError("No visitor records available to export");
      return;
    }

    window.print();
  };

  const getRiskClass = (risk) => {
    if (risk === "HIGH") return "risk-high";
    if (risk === "MEDIUM") return "risk-medium";
    return "risk-low";
  };

  return (
    <div className="biosecurity-page">
      <style>{`.date-filter-clear{align-self:end;height:40px;flex:0 0 auto;padding:0 11px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;text-decoration:none!important;display:flex;align-items:center;justify-content:center;transition:.18s ease}.date-filter-clear:hover{background:var(--admin-border);color:var(--admin-text);text-decoration:none!important}.biosecurity-page{padding:24px;color:var(--admin-text)}.bio-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}.bio-header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.bio-title-wrap{display:flex;align-items:center;gap:14px}.bio-icon{width:48px;height:48px;border-radius:14px;background:color-mix(in srgb,var(--admin-primary) 14%,transparent);color:var(--admin-primary);display:flex;align-items:center;justify-content:center}.bio-title{margin:0;font-size:24px;font-weight:800}.bio-subtitle{margin:5px 0 0;color:var(--admin-muted);font-size:13px}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.top-action-btn:disabled{opacity:.6;cursor:not-allowed}.primary-btn{border:1px solid var(--admin-primary);border-radius:10px;padding:11px 15px;background:var(--admin-primary);color:#fff;font-weight:700;display:flex;align-items:center;gap:8px;cursor:pointer;transition:.18s ease}.primary-btn:hover:not(:disabled){background:var(--admin-primary);border-color:var(--admin-primary);color:#fff;filter:brightness(1.06);transform:translateY(-1px)}.primary-btn:disabled{opacity:.6;cursor:not-allowed}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}.summary-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:17px}.summary-label{font-size:12px;color:var(--admin-muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px}.summary-value{font-size:26px;font-weight:800;margin-top:7px}.filter-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px;margin-bottom:18px}.filter-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.field{display:flex;flex-direction:column;gap:6px}.field label{font-size:12px;color:var(--admin-muted);font-weight:700}.field input,.field select,.field textarea{width:100%;box-sizing:border-box;background:var(--admin-surface-2);border:1px solid var(--admin-border);color:var(--admin-text);border-radius:9px;padding:10px 11px;outline:none;font:inherit}.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--admin-primary)}.field input[type="date"],.field input[type="month"]{color-scheme:light dark}.admin-theme-light .field input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .field input[type="month"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.field textarea{resize:vertical;min-height:90px}.search-wrap{position:relative}.search-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted)}.search-wrap input{padding-left:36px;padding-right:38px}.search-row{margin-top:14px}.search-row-inner{display:flex;align-items:end;gap:9px}.search-field{flex:1;max-width:650px}.search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:24px;height:24px;border:0;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer}.search-clear:hover{color:var(--admin-danger);background:color-mix(in srgb,var(--admin-danger) 10%,transparent)}.filter-actions{display:flex;justify-content:flex-start;margin-top:12px;gap:8px}.secondary-btn{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:9px 13px;cursor:pointer;font-weight:700}.empty-add-btn{margin:14px auto 0}.spin{animation:bioSpin 1s linear infinite}@keyframes bioSpin{to{transform:rotate(360deg)}}.table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden}.table-head{padding:15px 17px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between}.table-title{font-weight:800}.table-count{font-size:12px;color:var(--admin-muted)}.table-scroll{overflow-x:auto}.bio-table{width:100%;border-collapse:collapse;min-width:1050px}.bio-table th,.bio-table td{padding:13px 14px;text-align:left;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}.bio-table th{font-size:11px;text-transform:uppercase;color:var(--admin-muted);letter-spacing:.4px;background:var(--admin-surface-2)}.visitor-name{font-weight:800}.visitor-sub{font-size:11px;color:var(--admin-muted);margin-top:3px}.risk-badge{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}.risk-low{background:rgba(34,197,94,.12);color:#22c55e}.risk-medium{background:rgba(245,158,11,.12);color:#f59e0b}.risk-high{background:rgba(239,68,68,.12);color:#ef4444}.action-row{display:flex;gap:6px}.icon-btn{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.icon-btn:hover{border-color:var(--admin-primary);color:var(--admin-primary)}.icon-btn.delete:hover{border-color:var(--admin-danger);color:var(--admin-danger)}.loading-state,.empty-state{padding:45px 20px;text-align:center;color:var(--admin-muted)}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.modal{width:min(950px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 20px 70px rgba(0,0,0,.35)}.modal.small{width:min(720px,100%)}.modal-header{position:sticky;top:0;z-index:2;background:var(--admin-surface);display:flex;align-items:center;justify-content:space-between;padding:17px 19px;border-bottom:1px solid var(--admin-border)}.modal-title{font-size:18px;font-weight:800}.close-btn{width:34px;height:34px;border:1px solid var(--admin-border);background:transparent;color:var(--admin-text);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center}.modal-body{padding:19px}.form-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.full{grid-column:1/-1}.section-title{grid-column:1/-1;margin-top:8px;padding-bottom:8px;border-bottom:1px solid var(--admin-border);font-size:14px;font-weight:800}.check-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.check-item{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);font-size:12px}.check-item input{accent-color:var(--admin-primary)}.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 19px;border-top:1px solid var(--admin-border)}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.detail-box{padding:12px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.detail-label{font-size:11px;color:var(--admin-muted);font-weight:700;text-transform:uppercase;margin-bottom:5px}.detail-value{font-size:13px;font-weight:700;word-break:break-word}.detail-full{grid-column:1/-1}.detail-list{display:flex;flex-wrap:wrap;gap:7px}.mini-badge{padding:5px 8px;border-radius:7px;background:color-mix(in srgb,var(--admin-primary) 12%,transparent);font-size:11px;font-weight:700}.danger-note{color:#ef4444;font-weight:700}.success-note{color:#22c55e;font-weight:700}@media(max-width:1100px){.filter-grid{grid-template-columns:repeat(3,1fr)}.summary-grid{grid-template-columns:repeat(2,1fr)}.search-row-inner{align-items:end}.search-field{max-width:100%;flex:1}}@media(max-width:760px){.biosecurity-page{padding:15px}.bio-header{align-items:flex-start;flex-direction:column}.bio-header-actions{width:100%;justify-content:flex-start}.form-grid,.detail-grid{grid-template-columns:1fr}.check-grid{grid-template-columns:1fr}.full,.section-title,.detail-full{grid-column:auto}.filter-grid{grid-template-columns:1fr 1fr}.summary-grid{grid-template-columns:1fr 1fr}.search-row-inner{align-items:end}.search-field{max-width:100%;flex:1}.modal-overlay{padding:10px}.modal-body{padding:14px}}@media(max-width:500px){.filter-grid{grid-template-columns:1fr}.summary-grid{grid-template-columns:1fr}.bio-title{font-size:20px}.bio-header-actions{display:grid;grid-template-columns:40px 1fr 1fr 1fr;width:100%}.bio-header-actions .top-action-btn{width:100%}.bio-header-actions .add-action-btn{width:100%}.top-action-btn{padding:0 10px}.primary-btn{width:100%;justify-content:center}}`}</style>

      <div className="bio-header">
        <div className="bio-title-wrap">
          <div className="bio-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="bio-title">Biosecurity Visitors</h1>
            <p className="bio-subtitle">Track farm visitors, health declarations and biosecurity risks.</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="top-action-btn refresh-action-btn"
            title="Refresh"
            onClick={async () => {
              await loadVisitors();
            }}
            disabled={loading}>
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

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreate}>
            <Plus size={17} />
            Add Visitor
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Visitors</div>
          <div className="summary-value">{summary.total}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Low Risk</div>
          <div className="summary-value">{summary.low}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Medium Risk</div>
          <div className="summary-value">{summary.medium}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">High Risk</div>
          <div className="summary-value">{summary.high}</div>
        </div>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div className="field">
            <label>Farm</label>
            <select
              value={filterFarm}
              onChange={(event) => {
                setFilterFarm(event.target.value);
                setFilterShed("");
              }}>
              <option value="">All Farms</option>
              {farms.map((farm) => (
                <option key={farm?._id} value={farm?._id}>
                  {farm?.name}
                  {farm?.code ? ` (${farm.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Visitor Type</label>
            <select value={filterVisitorType} onChange={(event) => setFilterVisitorType(event.target.value)}>
              <option value="">All Types</option>
              {VISITOR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Risk Level</label>
            <select value={filterRiskLevel} onChange={(event) => setFilterRiskLevel(event.target.value)}>
              <option value="">All Risks</option>
              {RISK_LEVELS.map((risk) => (
                <option key={risk} value={risk}>
                  {risk}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Shed</label>
            <select value={filterShed} onChange={(event) => setFilterShed(event.target.value)}>
              <option value="">All Sheds</option>
              {filterSheds.map((shed) => (
                <option key={shed?._id} value={shed?._id}>
                  {shed?.name}
                  {shed?.code ? ` (${shed.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>

          <div className="field">
            <label>To Date</label>
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
        </div>

        <div className="search-row">
          <div className="search-row-inner">
            <div className="field search-field">
              <label>Search Visitor Records</label>

              <div className="search-wrap">
                <Search size={16} />

                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, phone, company, visitor type, farm..." />

                {search && (
                  <button type="button" className="search-clear" title="Clear Search" onClick={clearSearch}>
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {fromDate || toDate ? (
              <button
                type="button"
                className="date-filter-clear"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}>
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-head">
          <div className="table-title">Visitor Records</div>
          <div className="table-count">{filteredVisitors.length} record(s)</div>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div className="loading-state">Loading biosecurity records...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="empty-state">
              <Users size={35} />

              <div style={{ marginTop: 10 }}>No visitor records found.</div>

              <button className="primary-btn empty-add-btn" onClick={openCreate}>
                <Plus size={16} />
                Add Visitor
              </button>
            </div>
          ) : (
            <table className="bio-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Farm</th>
                  <th>Type</th>
                  <th>Visit Date</th>
                  <th>Purpose</th>
                  <th>Risk</th>
                  <th>Check In</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor?._id}>
                    <td>
                      <div className="visitor-name">{visitor?.visitorName || "—"}</div>
                      <div className="visitor-sub">{visitor?.phone || visitor?.companyName || "No contact"}</div>
                    </td>

                    <td>
                      <div>{visitor?.farm?.name || "—"}</div>
                      <div className="visitor-sub">{visitor?.visitingShed?.name || "No shed"}</div>
                    </td>

                    <td>{visitor?.visitorType || "—"}</td>

                    <td>{formatDate(visitor?.visitDate)}</td>

                    <td>
                      <div title={visitor?.purpose}>{visitor?.purpose?.length > 35 ? `${visitor.purpose.slice(0, 35)}...` : visitor?.purpose || "—"}</div>
                    </td>

                    <td>
                      <span className={`risk-badge ${getRiskClass(visitor?.riskLevel)}`}>{visitor?.riskLevel || "LOW"}</span>
                    </td>

                    <td>{formatDateTime(visitor?.checkIn)}</td>

                    <td>
                      <div className="action-row">
                        <button className="icon-btn" title="View" onClick={() => openView(visitor)}>
                          <Eye size={16} />
                        </button>

                        <button className="icon-btn" title="Edit" onClick={() => openEdit(visitor)}>
                          <Pencil size={16} />
                        </button>

                        <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(visitor)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingId ? "Edit Biosecurity Visitor" : "Add Biosecurity Visitor"}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {loadingFormData ? (
                  <div className="loading-state">Loading form data...</div>
                ) : (
                  <div className="form-grid">
                    <div className="section-title">Visitor Information</div>

                    <div className="field">
                      <label>Farm *</label>
                      <select
                        value={form.farm}
                        onChange={(event) => {
                          updateForm("farm", event.target.value);
                          updateForm("visitingShed", "");
                        }}
                        disabled={Boolean(editingId)}>
                        <option value="">Select Farm</option>
                        {farms.map((farm) => (
                          <option key={farm?._id} value={farm?._id}>
                            {farm?.name}
                            {farm?.code ? ` (${farm.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Visitor Name *</label>
                      <input maxLength={150} value={form.visitorName} onChange={(event) => updateForm("visitorName", event.target.value)} placeholder="Enter visitor name" />
                    </div>

                    <div className="field">
                      <label>Phone</label>
                      <input maxLength={30} value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder="Phone number" />
                    </div>

                    <div className="field">
                      <label>Visitor Type *</label>
                      <select value={form.visitorType} onChange={(event) => updateForm("visitorType", event.target.value)}>
                        {VISITOR_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Company Name</label>
                      <input value={form.companyName} onChange={(event) => updateForm("companyName", event.target.value)} placeholder="Company / organization" />
                    </div>

                    <div className="field">
                      <label>Vehicle Number</label>
                      <input value={form.vehicleNumber} onChange={(event) => updateForm("vehicleNumber", event.target.value)} placeholder="Vehicle number" />
                    </div>

                    <div className="field full">
                      <label>Visit Purpose *</label>
                      <textarea maxLength={300} value={form.purpose} onChange={(event) => updateForm("purpose", event.target.value)} placeholder="Why is the visitor coming to the farm?" />
                    </div>

                    <div className="section-title">Visit Details</div>

                    <div className="field">
                      <label>Visit Date *</label>
                      <input type="date" value={form.visitDate} onChange={(event) => updateForm("visitDate", event.target.value)} />
                    </div>

                    <div className="field">
                      <label>Check In</label>
                      <input type="datetime-local" value={form.checkIn} onChange={(event) => updateForm("checkIn", event.target.value)} />
                    </div>

                    <div className="field">
                      <label>Check Out</label>
                      <input type="datetime-local" value={form.checkOut} onChange={(event) => updateForm("checkOut", event.target.value)} />
                    </div>

                    <div className="field">
                      <label>Visiting Shed</label>
                      <select value={form.visitingShed} onChange={(event) => updateForm("visitingShed", event.target.value)}>
                        <option value="">No Specific Shed</option>
                        {availableSheds.map((shed) => (
                          <option key={shed?._id} value={shed?._id}>
                            {shed?.name}
                            {shed?.code ? ` (${shed.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Last Farm Visit</label>
                      <input type="date" value={form.lastFarmVisitDate} onChange={(event) => updateForm("lastFarmVisitDate", event.target.value)} />
                    </div>

                    <div className="field">
                      <label>Risk Level</label>
                      <select value={form.riskLevel} onChange={(event) => updateForm("riskLevel", event.target.value)}>
                        {RISK_LEVELS.map((risk) => (
                          <option key={risk} value={risk}>
                            {risk}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Approved By</label>
                      <select value={form.approvedBy} onChange={(event) => updateForm("approvedBy", event.target.value)}>
                        <option value="">No Approver</option>
                        {users.map((user) => (
                          <option key={user?._id} value={user?._id}>
                            {user?.name || user?.email} ({user?.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field full">
                      <label className="check-item">
                        <input type="checkbox" checked={form.visitedOtherPoultryFarmRecently} onChange={(event) => updateForm("visitedOtherPoultryFarmRecently", event.target.checked)} />
                        Visitor recently visited another poultry farm
                      </label>
                    </div>

                    {form.visitedOtherPoultryFarmRecently && (
                      <div className="field full">
                        <label>Recent Poultry Farm Visit Details *</label>
                        <textarea value={form.recentPoultryFarmDetails} onChange={(event) => updateForm("recentPoultryFarmDetails", event.target.value)} placeholder="Provide recent poultry farm visit details" />
                      </div>
                    )}

                    <div className="section-title">Biosecurity Measures</div>

                    <div className="check-grid full">
                      <label className="check-item">
                        <input type="checkbox" checked={form.biosecurityMeasures.footwearDisinfection} onChange={(event) => updateNestedForm("biosecurityMeasures", "footwearDisinfection", event.target.checked)} />
                        Footwear Disinfection
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.biosecurityMeasures.handSanitization} onChange={(event) => updateNestedForm("biosecurityMeasures", "handSanitization", event.target.checked)} />
                        Hand Sanitization
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.biosecurityMeasures.protectiveClothing} onChange={(event) => updateNestedForm("biosecurityMeasures", "protectiveClothing", event.target.checked)} />
                        Protective Clothing
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.biosecurityMeasures.vehicleDisinfection} onChange={(event) => updateNestedForm("biosecurityMeasures", "vehicleDisinfection", event.target.checked)} />
                        Vehicle Disinfection
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.biosecurityMeasures.visitorRestricted} onChange={(event) => updateNestedForm("biosecurityMeasures", "visitorRestricted", event.target.checked)} />
                        Visitor Restricted
                      </label>
                    </div>

                    <div className="section-title">Health Declaration</div>

                    <div className="check-grid full">
                      <label className="check-item">
                        <input type="checkbox" checked={form.healthDeclaration.fever} onChange={(event) => updateNestedForm("healthDeclaration", "fever", event.target.checked)} />
                        Fever
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.healthDeclaration.respiratorySymptoms} onChange={(event) => updateNestedForm("healthDeclaration", "respiratorySymptoms", event.target.checked)} />
                        Respiratory Symptoms
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.healthDeclaration.illness} onChange={(event) => updateNestedForm("healthDeclaration", "illness", event.target.checked)} />
                        Recent Illness
                      </label>

                      <label className="check-item">
                        <input type="checkbox" checked={form.healthDeclaration.fitToVisit} onChange={(event) => updateNestedForm("healthDeclaration", "fitToVisit", event.target.checked)} />
                        Fit To Visit
                      </label>
                    </div>

                    <div className="field full">
                      <label>Notes</label>
                      <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Additional notes..." />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={submitting || loadingFormData}>
                  {submitting ? "Saving..." : editingId ? "Update Visitor" : "Save Visitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedVisitor && (
        <div className="modal-overlay">
          <div className="modal small">
            <div className="modal-header">
              <div className="modal-title">Visitor Details</div>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-box">
                  <div className="detail-label">Visitor Name</div>
                  <div className="detail-value">{selectedVisitor?.visitorName || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{selectedVisitor?.phone || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Visitor Type</div>
                  <div className="detail-value">{selectedVisitor?.visitorType || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Risk Level</div>
                  <div className={`detail-value ${getRiskClass(selectedVisitor?.riskLevel)}`}>{selectedVisitor?.riskLevel || "LOW"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Farm</div>
                  <div className="detail-value">{selectedVisitor?.farm?.name || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Visiting Shed</div>
                  <div className="detail-value">{selectedVisitor?.visitingShed?.name || "—"}</div>
                </div>

                <div className="detail-box detail-full">
                  <div className="detail-label">Purpose</div>
                  <div className="detail-value">{selectedVisitor?.purpose || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Company</div>
                  <div className="detail-value">{selectedVisitor?.companyName || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Vehicle</div>
                  <div className="detail-value">{selectedVisitor?.vehicleNumber || "—"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Visit Date</div>
                  <div className="detail-value">{formatDate(selectedVisitor?.visitDate)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Last Farm Visit</div>
                  <div className="detail-value">{formatDate(selectedVisitor?.lastFarmVisitDate)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Check In</div>
                  <div className="detail-value">{formatDateTime(selectedVisitor?.checkIn)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Check Out</div>
                  <div className="detail-value">{formatDateTime(selectedVisitor?.checkOut)}</div>
                </div>

                <div className="detail-box detail-full">
                  <div className="detail-label">Recent Poultry Farm Visit</div>
                  <div className="detail-value">
                    {selectedVisitor?.visitedOtherPoultryFarmRecently ? (
                      <>
                        <div className="danger-note">Yes</div>
                        <div style={{ marginTop: 7 }}>{selectedVisitor?.recentPoultryFarmDetails || "Details not provided"}</div>
                      </>
                    ) : (
                      <span className="success-note">No</span>
                    )}
                  </div>
                </div>

                <div className="detail-box detail-full">
                  <div className="detail-label">Biosecurity Measures</div>
                  <div className="detail-list">
                    {Object.entries(selectedVisitor?.biosecurityMeasures || {})
                      .filter(([, value]) => value === true)
                      .map(([key]) => (
                        <span className="mini-badge" key={key}>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                        </span>
                      ))}
                    {!Object.values(selectedVisitor?.biosecurityMeasures || {}).some(Boolean) && <span>None recorded</span>}
                  </div>
                </div>

                <div className="detail-box detail-full">
                  <div className="detail-label">Health Declaration</div>
                  <div className="detail-list">
                    {Object.entries(selectedVisitor?.healthDeclaration || {})
                      .filter(([, value]) => value === true)
                      .map(([key]) => (
                        <span className="mini-badge" key={key}>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                        </span>
                      ))}
                    {!Object.values(selectedVisitor?.healthDeclaration || {}).some(Boolean) && <span>None recorded</span>}
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Approved By</div>
                  <div className="detail-value">{selectedVisitor?.approvedBy?.name || "Not approved"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Recorded By</div>
                  <div className="detail-value">{selectedVisitor?.recordedBy?.name || "—"}</div>
                </div>

                <div className="detail-box detail-full">
                  <div className="detail-label">Notes</div>
                  <div className="detail-value">{selectedVisitor?.notes || "No notes"}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button
                className="primary-btn"
                onClick={() => {
                  setShowViewModal(false);
                  openEdit(selectedVisitor);
                }}>
                <Pencil size={15} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Biosecurity;
