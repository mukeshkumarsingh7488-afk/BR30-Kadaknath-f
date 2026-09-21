import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Eye, FileSpreadsheet, FileText, Filter, Pencil, Plus, RefreshCw, Search, Trash2, UserCheck, Users, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const initialForm = {
  farm: "",
  staff: "",
  date: "",
  status: "PRESENT",
  checkIn: "",
  checkOut: "",
  workLocation: "",
  remarks: "",
};

const getArray = (response) => {
  const root = response?.data ?? response;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  return [];
};

const getData = (response) => {
  const root = response?.data ?? response;
  if (root?.data && !Array.isArray(root.data)) return root.data;
  return root;
};

const pad = (value) => String(value).padStart(2, "0");

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatHours = (value) => {
  const hours = Number(value || 0);
  return `${hours.toFixed(2)} hrs`;
};

const getStatusLabel = (status) => {
  const labels = {
    PRESENT: "Present",
    ABSENT: "Absent",
    HALF_DAY: "Half Day",
    LEAVE: "Leave",
    WEEK_OFF: "Week Off",
  };
  return labels[status] || status || "—";
};

const getStatusClass = (status) => {
  const classes = {
    PRESENT: "status-present",
    ABSENT: "status-absent",
    HALF_DAY: "status-half",
    LEAVE: "status-leave",
    WEEK_OFF: "status-weekoff",
  };
  return classes[status] || "";
};

const getStaffId = (staff) => staff?._id || staff || "";

const getFarmId = (farm) => farm?._id || farm || "";

const StaffAttendance = () => {
  const [records, setRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    farm: "",
    staff: "",
    status: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedFarm = useMemo(() => {
    return farms.find((farm) => farm._id === form.farm);
  }, [farms, form.farm]);

  const filteredStaffUsers = useMemo(() => {
    if (!form.farm) return staffUsers;
    return staffUsers;
  }, [staffUsers, form.farm]);

  const loadDependencies = async () => {
    setLoadingDependencies(true);

    try {
      const [farmResponse, userResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/admin/users/staff")]);

      setFarms(getArray(farmResponse));

      const users = getArray(userResponse);
      const validUsers = users.filter((user) => user && !user.isBlocked && ["staff", "admin"].includes(user.role));

      setStaffUsers(validUsers);
    } catch (err) {
      const message = err?.message || "Unable to load farms and staff users.";
      setError(message);
      showError(message);
    } finally {
      setLoadingDependencies(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filters.farm) params.set("farm", filters.farm);
      if (filters.staff) params.set("staff", filters.staff);
      if (filters.status) params.set("status", filters.status);
      if (filters.fromDate) params.set("fromDate", filters.fromDate);
      if (filters.toDate) params.set("toDate", filters.toDate);

      const query = params.toString();
      const response = await apiRequest(`/staff-attendance${query ? `?${query}` : ""}`);

      setRecords(getArray(response));
    } catch (err) {
      const message = err?.message || "Unable to load staff attendance records.";
      setError(message);
      setRecords([]);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadDependencies(), loadRecords()]);
  };

  const exportExcel = () => {
    const headers = ["Date", "Staff", "Email", "Phone", "Farm", "Farm Code", "Status", "Check In", "Check Out", "Total Hours", "Overtime", "Work Location", "Remarks"];

    const rows = filteredRecords.map((record) => [
      formatDate(record.date),
      record.staff?.name || "",
      record.staff?.email || "",
      record.staff?.phone || "",
      record.farm?.name || "",
      record.farm?.code || "",
      getStatusLabel(record.status),
      formatDateTime(record.checkIn),
      formatDateTime(record.checkOut),
      Number(record.totalHours || 0).toFixed(2),
      Number(record.overtimeHours || 0).toFixed(2),
      record.workLocation || "",
      record.remarks || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `staff-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredRecords
      .map(
        (record) => `
        <tr>
          <td>${formatDate(record.date)}</td>
          <td>${record.staff?.name || "-"}</td>
          <td>${record.farm?.name || "-"}</td>
          <td>${getStatusLabel(record.status)}</td>
          <td>${formatDateTime(record.checkIn)}</td>
          <td>${formatDateTime(record.checkOut)}</td>
          <td>${formatHours(record.totalHours)}</td>
          <td>${formatHours(record.overtimeHours)}</td>
          <td>${record.workLocation || "-"}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Staff Attendance</title>
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
        <h1>Staff Attendance Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Staff</th>
              <th>Farm</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th>Overtime</th>
              <th>Work Location</th>
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
  }, [filters.farm, filters.staff, filters.status, filters.fromDate, filters.toDate]);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (!search) return records;

    return records.filter((record) => {
      const staffName = record.staff?.name || "";
      const staffEmail = record.staff?.email || "";
      const staffPhone = record.staff?.phone || "";
      const farmName = record.farm?.name || "";
      const farmCode = record.farm?.code || "";
      const location = record.workLocation || "";
      const remarks = record.remarks || "";
      const status = getStatusLabel(record.status);

      return [staffName, staffEmail, staffPhone, farmName, farmCode, location, remarks, status].join(" ").toLowerCase().includes(search);
    });
  }, [records, filters.search]);

  const summary = useMemo(() => {
    const total = records.length;
    const present = records.filter((item) => item.status === "PRESENT").length;
    const absent = records.filter((item) => item.status === "ABSENT").length;
    const halfDay = records.filter((item) => item.status === "HALF_DAY").length;
    const leave = records.filter((item) => item.status === "LEAVE").length;
    const weekOff = records.filter((item) => item.status === "WEEK_OFF").length;

    const totalHours = records.reduce((sum, item) => sum + Number(item.totalHours || 0), 0);

    const overtimeHours = records.reduce((sum, item) => sum + Number(item.overtimeHours || 0), 0);

    return {
      total,
      present,
      absent,
      halfDay,
      leave,
      weekOff,
      totalHours,
      overtimeHours,
    };
  }, [records]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      farm: filters.farm || "",
      staff: "",
    });
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      ...initialForm,
      farm: filters.farm || "",
      staff: filters.staff || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);

    setForm({
      farm: getFarmId(record.farm),
      staff: getStaffId(record.staff),
      date: toDateInput(record.date),
      status: record.status || "PRESENT",
      checkIn: toDateTimeInput(record.checkIn),
      checkOut: toDateTimeInput(record.checkOut),
      workLocation: record.workLocation || "",
      remarks: record.remarks || "",
    });

    setModalOpen(true);
  };

  const openViewModal = (record) => {
    setViewingRecord(record);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingRecord(null);
    resetForm();
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!form.farm) {
      showError("Please select a farm.");
      return false;
    }

    if (!form.staff) {
      showError("Please select a staff member.");
      return false;
    }

    if (!form.date) {
      showError("Attendance date is required.");
      return false;
    }

    if (!form.status) {
      showError("Attendance status is required.");
      return false;
    }

    if (form.checkIn && form.checkOut) {
      const start = new Date(form.checkIn);
      const end = new Date(form.checkOut);

      if (end <= start) {
        showError("Check-out time must be after check-in time.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        farm: form.farm,
        staff: form.staff,
        date: form.date,
        status: form.status,
        checkIn: form.checkIn ? new Date(form.checkIn).toISOString() : null,
        checkOut: form.checkOut ? new Date(form.checkOut).toISOString() : null,
        workLocation: form.workLocation.trim(),
        remarks: form.remarks.trim(),
      };

      if (editingRecord) {
        delete payload.farm;
        delete payload.staff;

        const response = await apiRequest(`/staff-attendance/${editingRecord._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const data = getData(response);

        setRecords((prev) => prev.map((item) => (item._id === editingRecord._id ? data : item)));

        showSuccess("Staff attendance updated successfully.");
      } else {
        const response = await apiRequest("/staff-attendance", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const data = getData(response);

        setRecords((prev) => [data, ...prev]);

        showSuccess("Staff attendance created successfully.");
      }

      setModalOpen(false);
      setEditingRecord(null);
      resetForm();
    } catch (err) {
      showError(err?.message || `Unable to ${editingRecord ? "update" : "create"} attendance.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = await window.Swal?.fire({
      title: "Delete attendance?",
      text: `Attendance for ${record.staff?.name || "this staff member"} on ${formatDate(record.date)} will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmed?.isConfirmed) return;

    try {
      await apiRequest(`/staff-attendance/${record._id}`, {
        method: "DELETE",
      });

      setRecords((prev) => prev.filter((item) => item._id !== record._id));

      showSuccess("Staff attendance deleted successfully.");
    } catch (err) {
      showError(err?.message || "Unable to delete attendance.");
    }
  };

  const handleFarmFilterChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      farm: event.target.value,
      staff: "",
    }));
  };

  const handleFormFarmChange = (event) => {
    setForm((prev) => ({
      ...prev,
      farm: event.target.value,
      staff: "",
    }));
  };

  const selectedFilterFarm = farms.find((farm) => farm._id === filters.farm);

  return (
    <div className="staff-attendance-page">
      <style>{`.sa-field input[type="date"],.sa-field input[type="datetime-local"]{color-scheme:light dark}.sa-field input[type="date"]::-webkit-calendar-picker-indicator,.sa-field input[type="datetime-local"]::-webkit-calendar-picker-indicator{cursor:pointer}.admin-theme-light .sa-field input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .sa-field input[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.sa-search-wrap .sa-input{padding-right:38px}.sa-search-clear{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:24px;height:24px;padding:0;border:0;background:transparent;color:var(--admin-muted,#667085);display:flex;align-items:center;justify-content:center;cursor:pointer}.sa-search-clear:hover{background:transparent;color:var(--admin-text,#172033);transform:translateY(-50%) scale(1.08)}.sa-empty-actions{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px}.staff-attendance-page{padding:24px;min-height:100%;background:var(--admin-bg,#f5f7fb);color:var(--admin-text,#172033)}.sa-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:22px}.sa-title-wrap{display:flex;gap:14px;align-items:flex-start}.sa-title-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--admin-primary,#2563eb);color:#fff;flex:none}.sa-title{margin:0;font-size:26px;font-weight:800;line-height:1.2}.sa-description{margin:7px 0 0;color:var(--admin-muted,#667085);font-size:14px;line-height:1.5;max-width:760px}.sa-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.sa-btn{border:1px solid var(--admin-border,#e5e7eb);background:var(--admin-surface,#fff);color:var(--admin-text,#172033);height:42px;padding:0 14px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:700;cursor:pointer;transition:.2s}.sa-btn:hover{transform:translateY(-1px);border-color:#cbd5e1}.sa-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.sa-btn-primary{background:var(--admin-primary,#2563eb);border-color:var(--admin-primary,#2563eb);color:#fff}.sa-btn-danger{color:var(--admin-danger,#dc2626)}.sa-btn-icon{width:38px;padding:0}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.sa-summary{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:20px}.sa-stat{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e5e7eb);border-radius:14px;padding:16px;min-width:0}.sa-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.sa-stat-label{font-size:12px;color:var(--admin-muted,#667085);font-weight:700}.sa-stat-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--admin-surface-2,#f8fafc);color:var(--admin-primary,#2563eb)}.sa-stat-value{font-size:24px;font-weight:800;margin-top:9px}.sa-stat-sub{font-size:11px;color:var(--admin-muted,#667085);margin-top:3px}.sa-filters{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e5e7eb);border-radius:14px;padding:16px;margin-bottom:20px}.sa-filter-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.sa-filter-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800}.sa-filter-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.sa-field{display:flex;flex-direction:column;gap:6px}.sa-field label{font-size:12px;font-weight:700;color:var(--admin-muted,#667085)}.sa-input,.sa-select,.sa-textarea{width:100%;border:1px solid var(--admin-border,#dfe3e8);background:var(--admin-surface,#fff);color:var(--admin-text,#172033);border-radius:9px;outline:none;font-size:14px;transition:.2s;box-sizing:border-box}.sa-input,.sa-select{height:40px;padding:0 11px}.sa-textarea{padding:10px 11px;min-height:88px;resize:vertical}.sa-input:focus,.sa-select:focus,.sa-textarea:focus{border-color:var(--admin-primary,#2563eb);box-shadow:0 0 0 3px rgba(37,99,235,.1)}.sa-search-wrap{position:relative}.sa-search-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted,#667085)}.sa-search-wrap .sa-input{padding-left:36px}.sa-filter-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px}.sa-result-count{font-size:13px;color:var(--admin-muted,#667085)}.sa-table-card{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e5e7eb);border-radius:14px;overflow:hidden}.sa-table-wrap{overflow:auto}.sa-table{width:100%;border-collapse:collapse;min-width:1120px}.sa-table th{background:var(--admin-surface-2,#f8fafc);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--admin-muted,#667085);font-weight:800;text-align:left;padding:13px 14px;border-bottom:1px solid var(--admin-border,#e5e7eb);white-space:nowrap}.sa-table td{padding:14px;border-bottom:1px solid var(--admin-border,#eef0f3);font-size:13px;vertical-align:middle}.sa-table tbody tr:last-child td{border-bottom:0}.sa-table tbody tr:hover{background:rgba(148,163,184,.045)}.sa-primary-text{font-weight:750;color:var(--admin-text,#172033)}.sa-muted{color:var(--admin-muted,#667085)}.sa-staff{display:flex;align-items:center;gap:10px;min-width:180px}.sa-avatar{width:36px;height:36px;border-radius:10px;background:var(--admin-surface-2,#f1f5f9);display:flex;align-items:center;justify-content:center;color:var(--admin-primary,#2563eb);font-weight:800;flex:none}.sa-farm{min-width:130px}.sa-badge{display:inline-flex;align-items:center;justify-content:center;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}.status-present{background:#dcfce7;color:#166534}.status-absent{background:#fee2e2;color:#991b1b}.status-half{background:#fef3c7;color:#92400e}.status-leave{background:#dbeafe;color:#1d4ed8}.status-weekoff{background:#ede9fe;color:#6d28d9}.sa-actions-cell{display:flex;gap:6px}.sa-empty,.sa-loading,.sa-error{padding:48px 20px;text-align:center}.sa-empty-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:14px;background:var(--admin-surface-2,#f8fafc);display:flex;align-items:center;justify-content:center;color:var(--admin-primary,#2563eb)}.sa-empty-title{font-weight:800;font-size:15px}.sa-empty-text{font-size:13px;color:var(--admin-muted,#667085);margin-top:5px}.sa-error{color:var(--admin-danger,#dc2626)}.sa-loading-spinner{animation:sa-spin 1s linear infinite}@keyframes sa-spin{to{transform:rotate(360deg)}}.sa-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000}.sa-modal{width:min(760px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--admin-surface,#fff);border-radius:16px;border:1px solid var(--admin-border,#e5e7eb);box-shadow:0 24px 70px rgba(15,23,42,.22)}.sa-modal-large{width:min(850px,100%)}.sa-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid var(--admin-border,#e5e7eb);position:sticky;top:0;background:var(--admin-surface,#fff);z-index:2}.sa-modal-title{margin:0;font-size:18px;font-weight:800}.sa-modal-subtitle{margin:4px 0 0;font-size:12px;color:var(--admin-muted,#667085)}.sa-modal-body{padding:20px}.sa-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sa-form-full{grid-column:1/-1}.sa-section-title{font-size:13px;font-weight:800;margin:4px 0 -2px;padding-bottom:8px;border-bottom:1px solid var(--admin-border,#e5e7eb);grid-column:1/-1}.sa-checkbox{display:flex;align-items:center;gap:9px;min-height:40px;padding:9px 11px;border:1px solid var(--admin-border,#dfe3e8);border-radius:9px}.sa-checkbox input{width:16px;height:16px;accent-color:var(--admin-primary,#2563eb)}.sa-checkbox label{margin:0!important;color:var(--admin-text,#172033)!important;font-size:13px!important}.sa-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 20px;border-top:1px solid var(--admin-border,#e5e7eb);position:sticky;bottom:0;background:var(--admin-surface,#fff)}.sa-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sa-detail{border:1px solid var(--admin-border,#e5e7eb);border-radius:11px;padding:12px}.sa-detail-label{font-size:11px;color:var(--admin-muted,#667085);font-weight:700;margin-bottom:5px}.sa-detail-value{font-size:14px;font-weight:700;word-break:break-word}.sa-detail-full{grid-column:1/-1}.sa-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.sa-metric{background:var(--admin-surface-2,#f8fafc);border-radius:10px;padding:12px}.sa-metric-label{font-size:11px;color:var(--admin-muted,#667085)}.sa-metric-value{font-size:18px;font-weight:800;margin-top:4px}.sa-loading-line{display:inline-flex;align-items:center;gap:8px;color:var(--admin-muted,#667085)}@media(max-width:1200px){.sa-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.sa-filter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.staff-attendance-page{padding:16px}.sa-header{flex-direction:column}.sa-actions{width:100%;justify-content:flex-end;display:flex;flex-wrap:nowrap;gap:8px}.sa-actions .top-action-btn{flex:0 0 auto}.sa-actions .sa-btn:not(.top-action-btn){flex:0 0 auto}.sa-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sa-form-grid,.sa-detail-grid{grid-template-columns:1fr}.sa-form-full,.sa-detail-full{grid-column:auto}.sa-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.sa-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.sa-filter-grid{grid-template-columns:1fr}.sa-filter-footer{align-items:flex-start;flex-direction:column}.sa-actions{flex-direction:row;width:100%;flex-wrap:nowrap;gap:6px}.sa-actions .top-action-btn{flex:0 0 auto;width:auto}.sa-actions .sa-btn:not(.top-action-btn){width:auto;flex:0 0 auto}.sa-modal-overlay{padding:10px}.sa-modal{max-height:calc(100vh - 20px)}.sa-modal-body{padding:15px}.sa-modal-header{padding:15px}.sa-modal-footer{padding:13px 15px}.sa-modal-footer .sa-btn{flex:1}}`}</style>
      <div className="sa-header">
        <div className="sa-title-wrap">
          <div className="sa-title-icon">
            <UserCheck size={23} />
          </div>
          <div>
            <h1 className="sa-title">Staff Attendance</h1>
            <p className="sa-description">Track staff presence, check-in/check-out time, working hours, overtime, leave and weekly off records across your farms.</p>
          </div>
        </div>

        <div className="sa-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading || loadingDependencies} title="Refresh">
            <RefreshCw size={17} className={loading || loadingDependencies ? "sa-loading-spinner" : ""} />
          </button>

          <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} title="Export Excel">
            <FileSpreadsheet size={17} />
            Excel
          </button>

          <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPDF} title="Export PDF">
            <FileText size={17} />
            PDF
          </button>

          <button type="button" className="top-action-btn add-action-btn" onClick={openAddModal} disabled={loadingDependencies}>
            <Plus size={17} />
            Add Attendance
          </button>
        </div>
      </div>

      <div className="sa-summary">
        <div className="sa-stat">
          <div className="sa-stat-top">
            <span className="sa-stat-label">Total Records</span>
            <div className="sa-stat-icon">
              <Users size={17} />
            </div>
          </div>
          <div className="sa-stat-value">{summary.total}</div>
          <div className="sa-stat-sub">Loaded attendance</div>
        </div>

        <div className="sa-stat">
          <div className="sa-stat-top">
            <span className="sa-stat-label">Present</span>
            <div className="sa-stat-icon">
              <UserCheck size={17} />
            </div>
          </div>
          <div className="sa-stat-value">{summary.present}</div>
          <div className="sa-stat-sub">Full day present</div>
        </div>

        <div className="sa-stat">
          <div className="sa-stat-top">
            <span className="sa-stat-label">Absent</span>
            <div className="sa-stat-icon">
              <Users size={17} />
            </div>
          </div>
          <div className="sa-stat-value">{summary.absent}</div>
          <div className="sa-stat-sub">Absent records</div>
        </div>

        <div className="sa-stat">
          <div className="sa-stat-top">
            <span className="sa-stat-label">Half Day</span>
            <div className="sa-stat-icon">
              <Clock3 size={17} />
            </div>
          </div>
          <div className="sa-stat-value">{summary.halfDay}</div>
          <div className="sa-stat-sub">Half day records</div>
        </div>

        <div className="sa-stat">
          <div className="sa-stat-top">
            <span className="sa-stat-label">Leave / Off</span>
            <div className="sa-stat-icon">
              <CalendarDays size={17} />
            </div>
          </div>
          <div className="sa-stat-value">{summary.leave + summary.weekOff}</div>
          <div className="sa-stat-sub">
            {summary.leave} leave · {summary.weekOff} off
          </div>
        </div>

        <div className="sa-stat">
          <div className="sa-stat-top">
            <span className="sa-stat-label">Total Hours</span>
            <div className="sa-stat-icon">
              <Clock3 size={17} />
            </div>
          </div>
          <div className="sa-stat-value">{summary.totalHours.toFixed(1)}</div>
          <div className="sa-stat-sub">Overtime {summary.overtimeHours.toFixed(1)} hrs</div>
        </div>
      </div>

      <div className="sa-filters">
        <div className="sa-filter-head">
          <div className="sa-filter-title">
            <Filter size={17} />
            Attendance Filters
          </div>
        </div>

        <div className="sa-filter-grid">
          <div className="sa-field">
            <label htmlFor="filter-farm">Farm</label>
            <select id="filter-farm" className="sa-select" value={filters.farm} onChange={handleFarmFilterChange}>
              <option value="">All Farms</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                  {farm.code ? ` (${farm.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="sa-field">
            <label htmlFor="filter-staff">Staff</label>
            <select
              id="filter-staff"
              className="sa-select"
              value={filters.staff}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  staff: event.target.value,
                }))
              }>
              <option value="">All Staff</option>
              {staffUsers.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name || staff.email}
                </option>
              ))}
            </select>
          </div>

          <div className="sa-field">
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className="sa-select"
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }>
              <option value="">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">Leave</option>
              <option value="WEEK_OFF">Week Off</option>
            </select>
          </div>

          <div className="sa-field">
            <label htmlFor="filter-from">From Date</label>
            <input
              id="filter-from"
              type="date"
              className="sa-input"
              value={filters.fromDate}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  fromDate: event.target.value,
                }))
              }
            />
          </div>

          <div className="sa-field">
            <label htmlFor="filter-to">To Date</label>
            <input
              id="filter-to"
              type="date"
              className="sa-input"
              value={filters.toDate}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  toDate: event.target.value,
                }))
              }
            />
          </div>

          <div className="sa-field">
            <label htmlFor="filter-search">Search</label>
            <div className="sa-search-wrap">
              <Search size={16} />

              <input
                id="filter-search"
                type="text"
                className="sa-input"
                placeholder="Staff, farm, location..."
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
              />

              {filters.search || filters.fromDate || filters.toDate ? (
                <button
                  type="button"
                  className="sa-search-clear"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      search: "",
                      fromDate: "",
                      toDate: "",
                    }))
                  }
                  title="Clear search and date filters">
                  <X size={15} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="sa-filter-footer">
          <div className="sa-result-count">
            Showing {filteredRecords.length} of {records.length} records
          </div>

          {selectedFilterFarm ? (
            <div className="sa-result-count">
              Farm: <strong>{selectedFilterFarm.name}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div className="sa-table-card">
        {loading ? (
          <div className="sa-loading">
            <div className="sa-loading-line">
              <RefreshCw size={18} className="sa-loading-spinner" />
              Loading attendance records...
            </div>
          </div>
        ) : error && records.length === 0 ? (
          <div className="sa-error">
            <div>{error}</div>
            <button type="button" className="sa-btn" style={{ marginTop: 12 }} onClick={loadRecords}>
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">
              <UserCheck size={22} />
            </div>
            <div className="sa-empty-title">No attendance records found</div>
            <div className="sa-empty-text">Add a new attendance record or change your filters.</div>
            <button type="button" className="sa-btn sa-btn-primary" style={{ marginTop: 14 }} onClick={openAddModal}>
              <Plus size={15} />
              Add Attendance
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff</th>
                  <th>Farm</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Overtime</th>
                  <th>Work Location</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div className="sa-primary-text">{formatDate(record.date)}</div>
                    </td>

                    <td>
                      <div className="sa-staff">
                        <div className="sa-avatar">{(record.staff?.name || "S").charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="sa-primary-text">{record.staff?.name || "Unknown Staff"}</div>
                          <div className="sa-muted">{record.staff?.email || "—"}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="sa-farm">
                        <div className="sa-primary-text">{record.farm?.name || "—"}</div>
                        <div className="sa-muted">{record.farm?.code || ""}</div>
                      </div>
                    </td>

                    <td>
                      <span className={`sa-badge ${getStatusClass(record.status)}`}>{getStatusLabel(record.status)}</span>
                    </td>

                    <td>{formatDateTime(record.checkIn)}</td>
                    <td>{formatDateTime(record.checkOut)}</td>

                    <td>
                      <div className="sa-primary-text">{formatHours(record.totalHours)}</div>
                    </td>

                    <td>
                      <div className="sa-primary-text">{formatHours(record.overtimeHours)}</div>
                    </td>

                    <td>
                      <div className="sa-muted">{record.workLocation || "—"}</div>
                    </td>

                    <td>
                      <div className="sa-actions-cell">
                        <button type="button" className="sa-btn sa-btn-icon" title="View" onClick={() => openViewModal(record)}>
                          <Eye size={16} />
                        </button>

                        <button type="button" className="sa-btn sa-btn-icon" title="Edit" onClick={() => openEditModal(record)}>
                          <Pencil size={16} />
                        </button>

                        <button type="button" className="sa-btn sa-btn-icon sa-btn-danger" title="Delete" onClick={() => handleDelete(record)}>
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

      {modalOpen ? (
        <div
          className="sa-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}>
          <div className="sa-modal">
            <div className="sa-modal-header">
              <div>
                <h2 className="sa-modal-title">{editingRecord ? "Edit Attendance" : "Add Staff Attendance"}</h2>
                <p className="sa-modal-subtitle">{editingRecord ? "Update attendance details and working hours." : "Create a daily attendance record for staff."}</p>
              </div>

              <button type="button" className="sa-btn sa-btn-icon" onClick={closeModal} disabled={submitting}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                <div className="sa-form-grid">
                  <div className="sa-field">
                    <label htmlFor="form-farm">Farm *</label>
                    <select id="form-farm" name="farm" className="sa-select" value={form.farm} onChange={handleFormFarmChange} disabled={Boolean(editingRecord) || submitting} required>
                      <option value="">Select Farm</option>
                      {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                          {farm.name}
                          {farm.code ? ` (${farm.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sa-field">
                    <label htmlFor="form-staff">Staff *</label>
                    <select id="form-staff" name="staff" className="sa-select" value={form.staff} onChange={handleFormChange} disabled={Boolean(editingRecord) || submitting} required>
                      <option value="">Select Staff</option>
                      {filteredStaffUsers.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name || staff.email}
                          {staff.role ? ` (${staff.role})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sa-field">
                    <label htmlFor="form-date">Attendance Date *</label>
                    <input id="form-date" name="date" type="date" className="sa-input" value={form.date} onChange={handleFormChange} disabled={submitting} required />
                  </div>

                  <div className="sa-field">
                    <label htmlFor="form-status">Status *</label>
                    <select id="form-status" name="status" className="sa-select" value={form.status} onChange={handleFormChange} disabled={submitting} required>
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="LEAVE">Leave</option>
                      <option value="WEEK_OFF">Week Off</option>
                    </select>
                  </div>

                  <div className="sa-section-title">Working Time</div>

                  <div className="sa-field">
                    <label htmlFor="form-check-in">Check In</label>
                    <input id="form-check-in" name="checkIn" type="datetime-local" className="sa-input" value={form.checkIn} onChange={handleFormChange} disabled={submitting} />
                  </div>

                  <div className="sa-field">
                    <label htmlFor="form-check-out">Check Out</label>
                    <input id="form-check-out" name="checkOut" type="datetime-local" className="sa-input" value={form.checkOut} onChange={handleFormChange} disabled={submitting} />
                  </div>

                  <div className="sa-field">
                    <label htmlFor="form-location">Work Location</label>
                    <input id="form-location" name="workLocation" type="text" className="sa-input" value={form.workLocation} onChange={handleFormChange} placeholder="Shed / Farm / Office" maxLength={150} disabled={submitting} />
                  </div>

                  <div className="sa-field">
                    <label htmlFor="form-remarks">Remarks</label>
                    <input id="form-remarks" name="remarks" type="text" className="sa-input" value={form.remarks} onChange={handleFormChange} placeholder="Optional remarks" maxLength={500} disabled={submitting} />
                  </div>
                </div>
              </div>

              <div className="sa-modal-footer">
                <button type="button" className="sa-btn" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className="sa-btn sa-btn-primary" disabled={submitting || loadingDependencies}>
                  {submitting ? (
                    <>
                      <RefreshCw size={15} className="sa-loading-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} />
                      {editingRecord ? "Update Attendance" : "Save Attendance"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewModalOpen && viewingRecord ? (
        <div
          className="sa-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewModalOpen(false);
              setViewingRecord(null);
            }
          }}>
          <div className="sa-modal sa-modal-large">
            <div className="sa-modal-header">
              <div>
                <h2 className="sa-modal-title">Attendance Details</h2>
                <p className="sa-modal-subtitle">Complete attendance and working-hours information.</p>
              </div>

              <button
                type="button"
                className="sa-btn sa-btn-icon"
                onClick={() => {
                  setViewModalOpen(false);
                  setViewingRecord(null);
                }}>
                <X size={18} />
              </button>
            </div>

            <div className="sa-modal-body">
              <div className="sa-detail-grid">
                <div className="sa-detail">
                  <div className="sa-detail-label">Staff</div>
                  <div className="sa-detail-value">{viewingRecord.staff?.name || "—"}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Staff Email</div>
                  <div className="sa-detail-value">{viewingRecord.staff?.email || "—"}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Phone</div>
                  <div className="sa-detail-value">{viewingRecord.staff?.phone || "—"}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Role</div>
                  <div className="sa-detail-value">{viewingRecord.staff?.role || "—"}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Farm</div>
                  <div className="sa-detail-value">
                    {viewingRecord.farm?.name || "—"}
                    {viewingRecord.farm?.code ? ` (${viewingRecord.farm.code})` : ""}
                  </div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Attendance Date</div>
                  <div className="sa-detail-value">{formatDate(viewingRecord.date)}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Status</div>
                  <div className="sa-detail-value">
                    <span className={`sa-badge ${getStatusClass(viewingRecord.status)}`}>{getStatusLabel(viewingRecord.status)}</span>
                  </div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Work Location</div>
                  <div className="sa-detail-value">{viewingRecord.workLocation || "—"}</div>
                </div>
              </div>

              <div className="sa-metric-grid">
                <div className="sa-metric">
                  <div className="sa-metric-label">Check In</div>
                  <div className="sa-metric-value">{formatDateTime(viewingRecord.checkIn)}</div>
                </div>

                <div className="sa-metric">
                  <div className="sa-metric-label">Check Out</div>
                  <div className="sa-metric-value">{formatDateTime(viewingRecord.checkOut)}</div>
                </div>

                <div className="sa-metric">
                  <div className="sa-metric-label">Total Hours</div>
                  <div className="sa-metric-value">{formatHours(viewingRecord.totalHours)}</div>
                </div>

                <div className="sa-metric">
                  <div className="sa-metric-label">Overtime</div>
                  <div className="sa-metric-value">{formatHours(viewingRecord.overtimeHours)}</div>
                </div>
              </div>

              <div className="sa-detail-grid">
                <div className="sa-detail sa-detail-full">
                  <div className="sa-detail-label">Remarks</div>
                  <div className="sa-detail-value">{viewingRecord.remarks || "No remarks"}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Marked By</div>
                  <div className="sa-detail-value">{viewingRecord.markedBy?.name || viewingRecord.markedBy?.email || "—"}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Created At</div>
                  <div className="sa-detail-value">{formatDateTime(viewingRecord.createdAt)}</div>
                </div>

                <div className="sa-detail">
                  <div className="sa-detail-label">Updated At</div>
                  <div className="sa-detail-value">{formatDateTime(viewingRecord.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="sa-modal-footer">
              <button
                type="button"
                className="sa-btn"
                onClick={() => {
                  setViewModalOpen(false);
                  setViewingRecord(null);
                }}>
                Close
              </button>

              <button
                type="button"
                className="sa-btn sa-btn-primary"
                onClick={() => {
                  setViewModalOpen(false);
                  setViewingRecord(null);
                  openEditModal(viewingRecord);
                }}>
                <Pencil size={15} />
                Edit Attendance
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StaffAttendance;
