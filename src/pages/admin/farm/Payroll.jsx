import { useEffect, useMemo, useState } from "react";
import { Banknote, CalendarDays, CheckCircle2, Clock3, CreditCard, Edit3, Eye, FileSpreadsheet, FileText, IndianRupee, Plus, RefreshCw, Search, Trash2, UserRound, WalletCards, X, AlertCircle, Users, TrendingUp } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const PAYMENT_TYPES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "DAILY_WAGE", label: "Daily Wage" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "HOURLY", label: "Hourly" },
  { value: "CONTRACT", label: "Contract" },
];

const PAYMENT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
];

const emptyForm = {
  farm: "",
  staff: "",
  payrollMonth: new Date().toISOString().slice(0, 7),
  paymentType: "MONTHLY",
  workingDays: 26,
  presentDays: 0,
  absentDays: 0,
  halfDays: 0,
  leaveDays: 0,
  overtimeHours: 0,
  basicSalary: 0,
  dailyRate: 0,
  hourlyRate: 0,
  overtimeAmount: 0,
  bonus: 0,
  allowances: 0,
  advanceAmount: 0,
  deductions: 0,
  paymentStatus: "PENDING",
  paidAmount: 0,
  paymentDate: "",
  paymentMethod: "",
  transactionReference: "",
  notes: "",
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getStaffName = (staff) => {
  if (!staff) return "Unknown Staff";
  return staff.name || staff.email || "Unknown Staff";
};

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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

const getPaymentStatusClass = (status) => {
  switch (status) {
    case "PAID":
      return "status paid";
    case "PARTIALLY_PAID":
      return "status partial";
    case "CANCELLED":
      return "status cancelled";
    default:
      return "status pending";
  }
};

const getPaymentTypeLabel = (value) => {
  return PAYMENT_TYPES.find((item) => item.value === value)?.label || value || "-";
};

const calculateSalary = (form) => {
  const basicSalary = Number(form.basicSalary || 0);
  const dailyRate = Number(form.dailyRate || 0);
  const hourlyRate = Number(form.hourlyRate || 0);

  const presentDays = Number(form.presentDays || 0);
  const halfDays = Number(form.halfDays || 0);

  const overtimeAmount = Number(form.overtimeAmount || 0);
  const bonus = Number(form.bonus || 0);
  const allowances = Number(form.allowances || 0);

  const advanceAmount = Number(form.advanceAmount || 0);
  const deductions = Number(form.deductions || 0);

  let calculatedBasicSalary = basicSalary;

  if (form.paymentType === "DAILY_WAGE" && dailyRate > 0) {
    calculatedBasicSalary = presentDays * dailyRate + halfDays * dailyRate * 0.5;
  }

  if (form.paymentType === "HOURLY" && hourlyRate > 0) {
    calculatedBasicSalary = presentDays * hourlyRate * 8;
  }

  const grossSalary = calculatedBasicSalary + overtimeAmount + bonus + allowances;

  const netSalary = grossSalary - advanceAmount - deductions;

  return {
    basicSalary: Number(calculatedBasicSalary.toFixed(2)),
    grossSalary: Number(grossSalary.toFixed(2)),
    netSalary: Number(netSalary.toFixed(2)),
  };
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [farms, setFarms] = useState([]);
  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    farm: "",
    staff: "",
    payrollMonth: "",
    paymentType: "",
    paymentStatus: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingPayroll, setViewingPayroll] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const salaryPreview = useMemo(() => {
    return calculateSalary(form);
  }, [form]);

  const filteredPayrolls = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return payrolls;

    return payrolls.filter((item) => {
      const staffName = item.staff?.name || "";
      const staffEmail = item.staff?.email || "";
      const farmName = item.farm?.name || "";
      const month = item.payrollMonth || "";
      const type = getPaymentTypeLabel(item.paymentType);

      return [staffName, staffEmail, farmName, month, type].join(" ").toLowerCase().includes(keyword);
    });
  }, [payrolls, search]);

  const summary = useMemo(() => {
    const total = payrolls.length;

    const paid = payrolls.filter((item) => item.paymentStatus === "PAID").length;

    const pending = payrolls.filter((item) => item.paymentStatus === "PENDING").length;

    const partial = payrolls.filter((item) => item.paymentStatus === "PARTIALLY_PAID").length;

    const cancelled = payrolls.filter((item) => item.paymentStatus === "CANCELLED").length;

    const totalNet = payrolls.reduce((sum, item) => sum + Number(item.netSalary || 0), 0);

    const totalPaid = payrolls.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);

    return {
      total,
      paid,
      pending,
      partial,
      cancelled,
      totalNet,
      totalPaid,
    };
  }, [payrolls]);

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");

      if (response?.success) {
        setFarms(response.farms || response.data || []);
      } else {
        throw new Error(response?.message || "Failed to load farms");
      }
    } catch (err) {
      showError(err.message || "Failed to load farms");
    }
  };

  const loadStaff = async () => {
    try {
      const response = await apiRequest("/admin/users/staff");

      if (response?.success) {
        setStaff(response.users || response.data || []);
      } else {
        setStaff([]);
      }
    } catch (err) {
      setStaff([]);
      console.error("Staff loading error:", err);
    }
  };

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.farm) params.append("farm", filters.farm);
      if (filters.staff) params.append("staff", filters.staff);
      if (filters.payrollMonth) {
        params.append("payrollMonth", filters.payrollMonth);
      }
      if (filters.paymentType) {
        params.append("paymentType", filters.paymentType);
      }
      if (filters.paymentStatus) {
        params.append("paymentStatus", filters.paymentStatus);
      }

      const query = params.toString();
      const response = await apiRequest(query ? `/payroll?${query}` : "/payroll");

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load payrolls");
      }

      setPayrolls(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load payrolls");
      showError(err.message || "Failed to load payrolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
    loadStaff();
  }, []);

  useEffect(() => {
    loadPayrolls();
  }, [filters.farm, filters.staff, filters.payrollMonth, filters.paymentType, filters.paymentStatus]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      farm: farms.length === 1 ? farms[0]._id : "",
      staff: "",
      payrollMonth: new Date().toISOString().slice(0, 7),
    });

    setIsModalOpen(true);
  };

  const openEditModal = (payroll) => {
    setEditingId(payroll._id);

    setForm({
      farm: getId(payroll.farm),
      staff: getId(payroll.staff),
      payrollMonth: payroll.payrollMonth || "",
      paymentType: payroll.paymentType || "MONTHLY",
      workingDays: payroll.workingDays ?? 0,
      presentDays: payroll.presentDays ?? 0,
      absentDays: payroll.absentDays ?? 0,
      halfDays: payroll.halfDays ?? 0,
      leaveDays: payroll.leaveDays ?? 0,
      overtimeHours: payroll.overtimeHours ?? 0,
      basicSalary: payroll.basicSalary ?? 0,
      dailyRate: payroll.dailyRate ?? 0,
      hourlyRate: payroll.hourlyRate ?? 0,
      overtimeAmount: payroll.overtimeAmount ?? 0,
      bonus: payroll.bonus ?? 0,
      allowances: payroll.allowances ?? 0,
      advanceAmount: payroll.advanceAmount ?? 0,
      deductions: payroll.deductions ?? 0,
      paymentStatus: payroll.paymentStatus || "PENDING",
      paidAmount: payroll.paidAmount ?? 0,
      paymentDate: payroll.paymentDate ? new Date(payroll.paymentDate).toISOString().slice(0, 10) : "",
      paymentMethod: payroll.paymentMethod || "",
      transactionReference: payroll.transactionReference || "",
      notes: payroll.notes || "",
    });

    setIsModalOpen(true);
  };

  const openViewModal = async (payroll) => {
    try {
      const response = await apiRequest(`/payroll/${payroll._id}`);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load payroll");
      }

      setViewingPayroll(response.data);
      setIsViewOpen(true);
    } catch (err) {
      showError(err.message || "Failed to load payroll details");
    }
  };

  const validateForm = () => {
    if (!form.farm) {
      showError("Please select a farm");
      return false;
    }

    if (!form.staff) {
      showError("Please select staff");
      return false;
    }

    if (!form.payrollMonth) {
      showError("Payroll month is required");
      return false;
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(form.payrollMonth)) {
      showError("Payroll month must be in YYYY-MM format");
      return false;
    }

    const workingDays = Number(form.workingDays || 0);
    const presentDays = Number(form.presentDays || 0);
    const absentDays = Number(form.absentDays || 0);
    const halfDays = Number(form.halfDays || 0);
    const leaveDays = Number(form.leaveDays || 0);

    if (presentDays > workingDays) {
      showError("Present days cannot be greater than working days");
      return false;
    }

    if (absentDays > workingDays) {
      showError("Absent days cannot be greater than working days");
      return false;
    }

    if (halfDays > workingDays) {
      showError("Half days cannot be greater than working days");
      return false;
    }

    if (leaveDays > workingDays) {
      showError("Leave days cannot be greater than working days");
      return false;
    }

    const attendanceTotal = presentDays + absentDays + halfDays * 0.5 + leaveDays;

    if (attendanceTotal > workingDays) {
      showError("Attendance days cannot exceed working days");
      return false;
    }

    if (salaryPreview.netSalary < 0) {
      showError("Net salary cannot be negative");
      return false;
    }

    const paidAmount = Number(form.paidAmount || 0);

    if (paidAmount > salaryPreview.netSalary) {
      showError("Paid amount cannot be greater than net salary");
      return false;
    }

    if (form.paymentStatus === "PAID" && paidAmount < salaryPreview.netSalary) {
      showError("PAID status requires full net salary payment");
      return false;
    }

    if (form.paymentStatus === "PARTIALLY_PAID" && (paidAmount <= 0 || paidAmount >= salaryPreview.netSalary)) {
      showError("PARTIALLY_PAID requires paid amount between 0 and net salary");
      return false;
    }

    if (form.paymentStatus === "PENDING" && paidAmount > 0) {
      showError("PENDING status cannot have a paid amount");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        farm: form.farm,
        staff: form.staff,
        payrollMonth: form.payrollMonth,
        paymentType: form.paymentType,

        workingDays: Number(form.workingDays || 0),
        presentDays: Number(form.presentDays || 0),
        absentDays: Number(form.absentDays || 0),
        halfDays: Number(form.halfDays || 0),
        leaveDays: Number(form.leaveDays || 0),

        overtimeHours: Number(form.overtimeHours || 0),

        basicSalary: Number(form.basicSalary || 0),
        dailyRate: Number(form.dailyRate || 0),
        hourlyRate: Number(form.hourlyRate || 0),

        overtimeAmount: Number(form.overtimeAmount || 0),
        bonus: Number(form.bonus || 0),
        allowances: Number(form.allowances || 0),

        advanceAmount: Number(form.advanceAmount || 0),
        deductions: Number(form.deductions || 0),

        paymentStatus: form.paymentStatus,
        paidAmount: Number(form.paidAmount || 0),

        paymentDate: form.paymentStatus === "PENDING" || form.paymentStatus === "CANCELLED" ? null : form.paymentDate || null,

        paymentMethod: form.paymentStatus === "PENDING" || form.paymentStatus === "CANCELLED" ? null : form.paymentMethod || null,

        transactionReference: form.transactionReference.trim(),
        notes: form.notes.trim(),
      };

      const response = editingId
        ? await apiRequest(`/payroll/${editingId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiRequest("/payroll", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      if (!response?.success) {
        throw new Error(response?.message || `Failed to ${editingId ? "update" : "create"} payroll`);
      }

      showSuccess(response.message || `Payroll ${editingId ? "updated" : "created"} successfully`);

      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadPayrolls();
    } catch (err) {
      showError(err.message || "Failed to save payroll");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (payroll) => {
    const staffName = getStaffName(payroll.staff);

    const result = await showConfirm({
      title: "Delete Payroll?",
      text: `${staffName} - ${payroll.payrollMonth} payroll will be permanently deleted.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/payroll/${payroll._id}`, {
        method: "DELETE",
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete payroll");
      }

      showSuccess(response.message || "Payroll deleted successfully");

      await loadPayrolls();
    } catch (err) {
      showError(err.message || "Failed to delete payroll");
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadFarms(), loadStaff(), loadPayrolls()]);
  };

  const exportExcel = () => {
    const headers = ["Staff", "Email", "Farm", "Payroll Month", "Payment Type", "Gross Salary", "Net Salary", "Paid Amount", "Payment Status", "Payment Date", "Payment Method", "Transaction Reference"];

    const rows = filteredPayrolls.map((item) => [
      getStaffName(item.staff),
      item.staff?.email || "",
      item.farm?.name || "",
      item.payrollMonth || "",
      getPaymentTypeLabel(item.paymentType),
      Number(item.grossSalary || 0),
      Number(item.netSalary || 0),
      Number(item.paidAmount || 0),
      item.paymentStatus?.replaceAll("_", " ") || "PENDING",
      formatDate(item.paymentDate),
      item.paymentMethod || "",
      item.transactionReference || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `payroll-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredPayrolls
      .map(
        (item) => `
          <tr>
            <td>${getStaffName(item.staff)}</td>
            <td>${item.farm?.name || "-"}</td>
            <td>${item.payrollMonth || "-"}</td>
            <td>${getPaymentTypeLabel(item.paymentType)}</td>
            <td>${formatMoney(item.grossSalary)}</td>
            <td>${formatMoney(item.netSalary)}</td>
            <td>${formatMoney(item.paidAmount)}</td>
            <td>${item.paymentStatus?.replaceAll("_", " ") || "PENDING"}</td>
            <td>${formatDate(item.paymentDate)}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Payroll Report</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#172033}
            h1{margin:0 0 6px;font-size:22px}
            p{margin:0 0 18px;color:#667085;font-size:12px}
            table{width:100%;border-collapse:collapse;font-size:11px}
            th,td{border:1px solid #dfe4ec;padding:8px;text-align:left}
            th{background:#f8fafc}
          </style>
        </head>
        <body>
          <h1>Payroll Report</h1>
          <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Farm</th>
                <th>Month</th>
                <th>Type</th>
                <th>Gross</th>
                <th>Net Salary</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Payment Date</th>
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

  return (
    <div className="payroll-page">
      <style>{`.field input[type="date"],.field input[type="month"]{color-scheme:light dark}.admin-theme-light .field input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .field input[type="month"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.search-clear-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--admin-muted);display:flex;align-items:center;justify-content:center;padding:2px;cursor:pointer}.search-clear-btn:hover{color:var(--admin-text);background:transparent}.search-field input{padding-right:34px}.empty-add-btn{margin:14px auto 0;width:auto}.payroll-page{padding:24px;color:var(--admin-text)}.payroll-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}.payroll-title{display:flex;align-items:center;gap:12px}.payroll-title-icon{width:46px;height:46px;border-radius:14px;background:rgba(34,197,94,.12);display:flex;align-items:center;justify-content:center;color:var(--admin-primary)}.payroll-title h1{margin:0;font-size:26px}.payroll-title p{margin:5px 0 0;color:var(--admin-muted);font-size:14px}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.primary-btn{border:0;background:var(--admin-primary);color:#fff;border-radius:10px;padding:11px 16px;display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer;transition:.18s ease}.primary-btn:hover:not(:disabled){background:var(--admin-primary);border-color:var(--admin-primary);color:#fff;filter:brightness(1.06);transform:translateY(-1px)}.primary-btn:disabled{opacity:.6;cursor:not-allowed}.summary-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px;margin-bottom:20px}.summary-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px}.summary-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.summary-icon{width:38px;height:38px;border-radius:10px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;color:var(--admin-primary)}.summary-label{font-size:12px;color:var(--admin-muted);font-weight:600}.summary-value{font-size:22px;font-weight:800;margin-top:10px}.summary-money{font-size:17px}.filter-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:16px;margin-bottom:20px}.filter-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.field{display:flex;flex-direction:column;gap:6px}.field label{font-size:12px;font-weight:700;color:var(--admin-muted)}.field input,.field select,.field textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:10px 11px;outline:none;font-size:14px}.field textarea{min-height:88px;resize:vertical}.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--admin-primary)}.search-field{position:relative}.search-field svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--admin-muted)}.search-field input{padding-left:36px}.filter-actions{display:flex;align-items:flex-end;gap:8px}.secondary-btn{border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:9px;padding:10px 13px;cursor:pointer;font-weight:600}.table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden}.table-wrap{width:100%;overflow-x:auto}.payroll-table{width:100%;border-collapse:collapse;min-width:1100px}.payroll-table th,.payroll-table td{padding:13px 14px;text-align:left;border-bottom:1px solid var(--admin-border);white-space:nowrap}.payroll-table th{font-size:12px;color:var(--admin-muted);font-weight:800;background:var(--admin-surface-2)}.payroll-table td{font-size:13px}.staff-cell{display:flex;align-items:center;gap:10px}.avatar{width:34px;height:34px;border-radius:50%;background:rgba(34,197,94,.12);color:var(--admin-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0}.staff-name{font-weight:700}.staff-email{font-size:11px;color:var(--admin-muted);margin-top:2px}.status{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}.status.paid{background:rgba(34,197,94,.13);color:#22c55e}.status.partial{background:rgba(245,158,11,.13);color:#f59e0b}.status.pending{background:rgba(59,130,246,.13);color:#3b82f6}.status.cancelled{background:rgba(239,68,68,.13);color:#ef4444}.action-group{display:flex;align-items:center;gap:6px}.icon-btn{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.icon-btn:hover{border-color:var(--admin-primary);color:var(--admin-primary)}.icon-btn.danger:hover{border-color:var(--admin-danger);color:var(--admin-danger)}.empty-state,.loading-state,.error-state{padding:48px 20px;text-align:center;color:var(--admin-muted)}.empty-icon{width:50px;height:50px;border-radius:14px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}.error-state{color:var(--admin-danger)}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000}.modal{width:min(980px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35)}.modal.small{width:min(760px,100%)}.modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid var(--admin-border);position:sticky;top:0;background:var(--admin-surface);z-index:2}.modal-header h2{margin:0;font-size:19px}.close-btn{width:34px;height:34px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer}.modal-body{padding:20px}.form-section{margin-bottom:22px}.form-section-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;margin-bottom:12px;color:var(--admin-text)}.form-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.form-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.form-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.full-field{grid-column:1/-1}.salary-preview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.salary-box{border:1px solid var(--admin-border);background:var(--admin-surface-2);border-radius:11px;padding:14px}.salary-box span{display:block;color:var(--admin-muted);font-size:11px;font-weight:700}.salary-box strong{display:block;font-size:18px;margin-top:5px}.salary-box.net{border-color:rgba(34,197,94,.35)}.modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 20px;border-top:1px solid var(--admin-border);position:sticky;bottom:0;background:var(--admin-surface)}.view-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.detail-box{border:1px solid var(--admin-border);background:var(--admin-surface-2);border-radius:10px;padding:13px}.detail-box.full{grid-column:1/-1}.detail-label{font-size:11px;color:var(--admin-muted);font-weight:700;margin-bottom:5px}.detail-value{font-size:14px;font-weight:700;word-break:break-word}.loading-spinner{width:25px;height:25px;border:3px solid var(--admin-border);border-top-color:var(--admin-primary);border-radius:50%;animation:payroll-spin .8s linear infinite;margin:0 auto 10px}@keyframes payroll-spin{to{transform:rotate(360deg)}}@media(max-width:1200px){.summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.filter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.payroll-page{padding:15px}.payroll-header{align-items:flex-start;flex-direction:column}.header-actions{width:100%;justify-content:flex-start;gap:8px}.payroll-title h1{font-size:22px}.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.filter-grid,.form-grid,.form-grid.two,.form-grid.three,.view-grid{grid-template-columns:1fr}.salary-preview{grid-template-columns:1fr}.full-field,.detail-box.full{grid-column:auto}.modal-overlay{padding:10px}.modal-body{padding:14px}.modal-footer{padding:12px 14px}}`}</style>

      <div className="payroll-header">
        <div className="payroll-title">
          <div className="payroll-title-icon">
            <WalletCards size={24} />
          </div>
          <div>
            <h1>Payroll</h1>
            <p>Manage staff salary, payments and payroll records.</p>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="top-action-btn refresh-action-btn" onClick={handleRefresh} disabled={loading} title="Refresh">
            <RefreshCw size={17} className={loading ? "spin" : ""} />
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
            <Plus size={17} />
            Add Payroll
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Total Payroll</span>
            <div className="summary-icon">
              <FileText size={18} />
            </div>
          </div>
          <div className="summary-value">{summary.total}</div>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Paid</span>
            <div className="summary-icon">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="summary-value">{summary.paid}</div>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Pending</span>
            <div className="summary-icon">
              <Clock3 size={18} />
            </div>
          </div>
          <div className="summary-value">{summary.pending}</div>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Partial</span>
            <div className="summary-icon">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="summary-value">{summary.partial}</div>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Net Salary</span>
            <div className="summary-icon">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="summary-value summary-money">{formatMoney(summary.totalNet)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Paid Amount</span>
            <div className="summary-icon">
              <Banknote size={18} />
            </div>
          </div>
          <div className="summary-value summary-money">{formatMoney(summary.totalPaid)}</div>
        </div>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div className="field">
            <label>Farm</label>
            <select
              value={filters.farm}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  farm: event.target.value,
                }))
              }>
              <option value="">All Farms</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                  {farm.code ? ` (${farm.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Staff</label>
            <select
              value={filters.staff}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  staff: event.target.value,
                }))
              }>
              <option value="">All Staff</option>
              {staff.map((item) => (
                <option key={item._id} value={item._id}>
                  {getStaffName(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Payroll Month</label>
            <input
              type="month"
              value={filters.payrollMonth}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  payrollMonth: event.target.value,
                }))
              }
            />
          </div>

          <div className="field">
            <label>Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  paymentType: event.target.value,
                }))
              }>
              <option value="">All Types</option>
              {PAYMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  paymentStatus: event.target.value,
                }))
              }>
              <option value="">All Status</option>
              {PAYMENT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Search</label>
            <div className="search-field">
              <Search size={16} />

              <input type="text" placeholder="Search staff, farm..." value={search} onChange={(event) => setSearch(event.target.value)} />

              {(search || filters.payrollMonth) && (
                <button
                  type="button"
                  className="search-clear-btn"
                  title="Clear search and payroll month"
                  onClick={() => {
                    setSearch("");
                    setFilters((previous) => ({
                      ...previous,
                      payrollMonth: "",
                    }));
                  }}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            Loading payroll records...
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={30} style={{ marginBottom: "8px" }} />
            <div>{error}</div>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <WalletCards size={25} />
            </div>

            <strong>No payroll records found</strong>

            <div style={{ marginTop: "5px" }}>Create a payroll record to get started.</div>

            <button type="button" className="primary-btn empty-add-btn" onClick={openCreateModal}>
              <Plus size={17} />
              Add Payroll
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Farm</th>
                  <th>Month</th>
                  <th>Type</th>
                  <th>Gross</th>
                  <th>Net Salary</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayrolls.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="staff-cell">
                        <div className="avatar">
                          <UserRound size={16} />
                        </div>

                        <div>
                          <div className="staff-name">{getStaffName(item.staff)}</div>

                          <div className="staff-email">{item.staff?.email || "-"}</div>
                        </div>
                      </div>
                    </td>

                    <td>{item.farm?.name || "-"}</td>

                    <td>{item.payrollMonth || "-"}</td>

                    <td>{getPaymentTypeLabel(item.paymentType)}</td>

                    <td>{formatMoney(item.grossSalary)}</td>

                    <td>
                      <strong>{formatMoney(item.netSalary)}</strong>
                    </td>

                    <td>{formatMoney(item.paidAmount)}</td>

                    <td>
                      <span className={getPaymentStatusClass(item.paymentStatus)}>{item.paymentStatus?.replaceAll("_", " ") || "PENDING"}</span>
                    </td>

                    <td>{formatDate(item.paymentDate)}</td>

                    <td>
                      <div className="action-group">
                        <button className="icon-btn" title="View" onClick={() => openViewModal(item)}>
                          <Eye size={16} />
                        </button>

                        <button className="icon-btn" title="Edit" onClick={() => openEditModal(item)}>
                          <Edit3 size={16} />
                        </button>

                        <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(item)}>
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

      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setIsModalOpen(false);
            }
          }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Payroll" : "Add Payroll"}</h2>
              </div>

              <button className="close-btn" disabled={saving} onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <div className="form-section-title">
                    <Users size={16} />
                    Staff & Payroll
                  </div>

                  <div className="form-grid three">
                    <div className="field">
                      <label>Farm *</label>
                      <select name="farm" value={form.farm} onChange={handleFormChange} required disabled={Boolean(editingId)}>
                        <option value="">Select Farm</option>
                        {farms.map((farm) => (
                          <option key={farm._id} value={farm._id}>
                            {farm.name}
                            {farm.code ? ` (${farm.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Staff *</label>
                      <select name="staff" value={form.staff} onChange={handleFormChange} required disabled={Boolean(editingId)}>
                        <option value="">Select Staff</option>
                        {staff.map((item) => (
                          <option key={item._id} value={item._id}>
                            {getStaffName(item)}
                            {item.role ? ` - ${item.role}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Payroll Month *</label>
                      <input type="month" name="payrollMonth" value={form.payrollMonth} onChange={handleFormChange} required disabled={Boolean(editingId)} />
                    </div>

                    <div className="field">
                      <label>Payment Type *</label>
                      <select name="paymentType" value={form.paymentType} onChange={handleFormChange} required>
                        {PAYMENT_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <CalendarDays size={16} />
                    Attendance
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Working Days</label>
                      <input type="number" min="0" step="1" name="workingDays" value={form.workingDays} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Present Days</label>
                      <input type="number" min="0" step="1" name="presentDays" value={form.presentDays} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Absent Days</label>
                      <input type="number" min="0" step="1" name="absentDays" value={form.absentDays} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Half Days</label>
                      <input type="number" min="0" step="1" name="halfDays" value={form.halfDays} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Leave Days</label>
                      <input type="number" min="0" step="1" name="leaveDays" value={form.leaveDays} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Overtime Hours</label>
                      <input type="number" min="0" step="0.5" name="overtimeHours" value={form.overtimeHours} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <IndianRupee size={16} />
                    Salary Details
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Basic Salary</label>
                      <input type="number" min="0" step="0.01" name="basicSalary" value={form.basicSalary} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Daily Rate</label>
                      <input type="number" min="0" step="0.01" name="dailyRate" value={form.dailyRate} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Hourly Rate</label>
                      <input type="number" min="0" step="0.01" name="hourlyRate" value={form.hourlyRate} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Overtime Amount</label>
                      <input type="number" min="0" step="0.01" name="overtimeAmount" value={form.overtimeAmount} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Bonus</label>
                      <input type="number" min="0" step="0.01" name="bonus" value={form.bonus} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Allowances</label>
                      <input type="number" min="0" step="0.01" name="allowances" value={form.allowances} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Advance Amount</label>
                      <input type="number" min="0" step="0.01" name="advanceAmount" value={form.advanceAmount} onChange={handleFormChange} />
                    </div>

                    <div className="field">
                      <label>Deductions</label>
                      <input type="number" min="0" step="0.01" name="deductions" value={form.deductions} onChange={handleFormChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <CreditCard size={16} />
                    Salary Preview
                  </div>

                  <div className="salary-preview">
                    <div className="salary-box">
                      <span>Calculated Basic</span>
                      <strong>{formatMoney(salaryPreview.basicSalary)}</strong>
                    </div>

                    <div className="salary-box">
                      <span>Gross Salary</span>
                      <strong>{formatMoney(salaryPreview.grossSalary)}</strong>
                    </div>

                    <div className="salary-box net">
                      <span>Net Salary</span>
                      <strong>{formatMoney(salaryPreview.netSalary)}</strong>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <Banknote size={16} />
                    Payment Details
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>Payment Status *</label>
                      <select name="paymentStatus" value={form.paymentStatus} onChange={handleFormChange} required>
                        {PAYMENT_STATUSES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Paid Amount</label>
                      <input type="number" min="0" step="0.01" name="paidAmount" value={form.paidAmount} onChange={handleFormChange} disabled={form.paymentStatus === "PENDING" || form.paymentStatus === "CANCELLED"} />
                    </div>

                    <div className="field">
                      <label>Payment Date</label>
                      <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleFormChange} disabled={form.paymentStatus === "PENDING" || form.paymentStatus === "CANCELLED"} />
                    </div>

                    <div className="field">
                      <label>Payment Method</label>
                      <select name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange} disabled={form.paymentStatus === "PENDING" || form.paymentStatus === "CANCELLED"}>
                        <option value="">Select Method</option>
                        {PAYMENT_METHODS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field full-field">
                      <label>Transaction Reference</label>
                      <input type="text" name="transactionReference" value={form.transactionReference} onChange={handleFormChange} placeholder="UPI / bank / transaction reference" />
                    </div>

                    <div className="field full-field">
                      <label>Notes</label>
                      <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Add payroll notes..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" disabled={saving} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Payroll" : "Create Payroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewOpen && viewingPayroll && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsViewOpen(false);
            }
          }}>
          <div className="modal small">
            <div className="modal-header">
              <div>
                <h2>Payroll Details</h2>
              </div>

              <button className="close-btn" onClick={() => setIsViewOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="view-grid">
                <div className="detail-box">
                  <div className="detail-label">Staff</div>
                  <div className="detail-value">{getStaffName(viewingPayroll.staff)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Farm</div>
                  <div className="detail-value">{viewingPayroll.farm?.name || "-"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Payroll Month</div>
                  <div className="detail-value">{viewingPayroll.payrollMonth || "-"}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Payment Type</div>
                  <div className="detail-value">{getPaymentTypeLabel(viewingPayroll.paymentType)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Working Days</div>
                  <div className="detail-value">{viewingPayroll.workingDays ?? 0}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Present Days</div>
                  <div className="detail-value">{viewingPayroll.presentDays ?? 0}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Absent Days</div>
                  <div className="detail-value">{viewingPayroll.absentDays ?? 0}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Half Days</div>
                  <div className="detail-value">{viewingPayroll.halfDays ?? 0}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Leave Days</div>
                  <div className="detail-value">{viewingPayroll.leaveDays ?? 0}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Overtime Hours</div>
                  <div className="detail-value">{viewingPayroll.overtimeHours ?? 0}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Basic Salary</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.basicSalary)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Overtime Amount</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.overtimeAmount)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Bonus</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.bonus)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Allowances</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.allowances)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Gross Salary</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.grossSalary)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Advance</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.advanceAmount)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Deductions</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.deductions)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Net Salary</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.netSalary)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Payment Status</div>
                  <div className="detail-value">
                    <span className={getPaymentStatusClass(viewingPayroll.paymentStatus)}>{viewingPayroll.paymentStatus?.replaceAll("_", " ") || "PENDING"}</span>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Paid Amount</div>
                  <div className="detail-value">{formatMoney(viewingPayroll.paidAmount)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Payment Date</div>
                  <div className="detail-value">{formatDate(viewingPayroll.paymentDate)}</div>
                </div>

                <div className="detail-box">
                  <div className="detail-label">Payment Method</div>
                  <div className="detail-value">{viewingPayroll.paymentMethod || "-"}</div>
                </div>

                <div className="detail-box full">
                  <div className="detail-label">Transaction Reference</div>
                  <div className="detail-value">{viewingPayroll.transactionReference || "-"}</div>
                </div>

                <div className="detail-box full">
                  <div className="detail-label">Notes</div>
                  <div className="detail-value">{viewingPayroll.notes || "-"}</div>
                </div>

                <div className="detail-box full">
                  <div className="detail-label">Processed By</div>
                  <div className="detail-value">{viewingPayroll.processedBy?.name || viewingPayroll.processedBy?.email || "-"}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setIsViewOpen(false)}>
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() => {
                  setIsViewOpen(false);
                  openEditModal(viewingPayroll);
                }}>
                <Edit3 size={16} />
                Edit Payroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
