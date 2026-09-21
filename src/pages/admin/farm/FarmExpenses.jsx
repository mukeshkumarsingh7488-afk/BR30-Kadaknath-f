import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Filter, Pencil, Plus, RefreshCw, Search, Trash2, WalletCards, X } from "lucide-react";
import Swal from "sweetalert2";

import apiRequest from "../../../api/api";
import { showError, showSuccess } from "../../../utils/sweetAlert";

const EXPENSE_CATEGORIES = ["FEED", "MEDICINE", "VACCINE", "CHICKS", "BIRDS", "LABOR", "ELECTRICITY", "WATER", "MAINTENANCE", "TRANSPORT", "PACKAGING", "BIOSECURITY", "VETERINARY", "EQUIPMENT", "RENT", "MARKETING", "OTHER"];

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CARD", "CREDIT", "OTHER"];

const PAYMENT_STATUSES = ["PAID", "PENDING", "PARTIAL"];

const emptyForm = {
  farm: "",
  shed: "",
  batch: "",
  expenseDate: "",
  category: "FEED",
  title: "",
  description: "",
  amount: "",
  paidAmount: "",
  paymentMethod: "CASH",
  vendor: {
    name: "",
    phone: "",
    invoiceNumber: "",
  },
  receiptImage: {
    url: "",
    publicId: "",
  },
  recurring: false,
  notes: "",
};

const getList = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;

  return [];
};

const getExpense = (response) => {
  return response?.expense || response?.data?.expense || response?.data?.data || response?.data || null;
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

const formatDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getPaymentStatus = (amount, paidAmount) => {
  const total = Number(amount || 0);
  const paid = Number(paidAmount || 0);

  if (paid <= 0) return "PENDING";
  if (paid >= total) return "PAID";
  return "PARTIAL";
};

const getStatusLabel = (status) => {
  if (status === "PARTIAL") return "Partial";
  if (status === "PENDING") return "Pending";
  if (status === "PAID") return "Paid";
  return status || "-";
};

const getStatusClass = (status) => {
  if (status === "PAID") return "status-paid";
  if (status === "PARTIAL") return "status-partial";
  return "status-pending";
};

const getFarmId = (farm) => farm?._id || farm?.id || "";

const getShedId = (shed) => shed?._id || shed?.id || "";

const getBatchId = (batch) => batch?._id || batch?.id || "";

const getFarmName = (farm) => {
  if (!farm) return "-";
  return farm.name || farm.farmName || farm.code || "-";
};

const getShedName = (shed) => {
  if (!shed) return "-";
  return shed.name || shed.code || "-";
};

const getBatchName = (batch) => {
  if (!batch) return "-";
  return batch.batchName || batch.batchNumber || "-";
};

const getId = (item) => item?._id || item?.id || "";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return error?.response?.data?.message || error?.message || error?.data?.message || fallback;
};

export default function FarmExpenses() {
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);

  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    farm: "",
    shed: "",
    batch: "",
    category: "",
    paymentMethod: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [form, setForm] = useState(emptyForm);

  const filteredSheds = useMemo(() => {
    if (!form.farm) return sheds;

    return sheds.filter((shed) => String(shed.farm?._id || shed.farm?.id || shed.farm || "") === String(form.farm));
  }, [sheds, form.farm]);

  const filteredBatches = useMemo(() => {
    if (!form.farm) return batches;

    return batches.filter((batch) => String(batch.farm?._id || batch.farm?.id || batch.farm || "") === String(form.farm));
  }, [batches, form.farm]);

  const formDueAmount = useMemo(() => {
    const amount = Number(form.amount || 0);
    const paidAmount = Number(form.paidAmount || 0);

    return Math.max(amount - paidAmount, 0);
  }, [form.amount, form.paidAmount]);

  const formPaymentStatus = useMemo(() => {
    return getPaymentStatus(form.amount, form.paidAmount);
  }, [form.amount, form.paidAmount]);

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const paid = expenses.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);

    const due = expenses.reduce((sum, item) => sum + Math.max(Number(item.amount || 0) - Number(item.paidAmount || 0), 0), 0);

    const paidCount = expenses.filter((item) => getPaymentStatus(item.amount, item.paidAmount) === "PAID").length;

    const dueCount = expenses.filter((item) => getPaymentStatus(item.amount, item.paidAmount) !== "PAID").length;

    return {
      total,
      paid,
      due,
      paidCount,
      dueCount,
    };
  }, [expenses]);

  const loadMasterData = async () => {
    try {
      const [farmsResponse, shedsResponse, batchesResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds"), apiRequest("/batches")]);

      setFarms(getList(farmsResponse, ["farms", "data"]));
      setSheds(getList(shedsResponse, ["sheds", "data"]));
      setBatches(getList(batchesResponse, ["batches", "data"]));
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load farm data"));
    }
  };

  const loadExpenses = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.farm) params.set("farm", filters.farm);
      if (filters.shed) params.set("shed", filters.shed);
      if (filters.batch) params.set("batch", filters.batch);
      if (filters.category) params.set("category", filters.category);
      if (filters.paymentMethod) params.set("paymentMethod", filters.paymentMethod);
      if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.minAmount !== "") params.set("minAmount", filters.minAmount);
      if (filters.maxAmount !== "") params.set("maxAmount", filters.maxAmount);

      params.set("page", requestedPage);
      params.set("limit", limit);

      const response = await apiRequest(`/farm-expenses?${params.toString()}`);

      const list = getList(response, ["expenses"]);

      setExpenses(list);
      setTotalCount(Number(response?.count || response?.total || list.length));
      setTotalPages(Math.max(Number(response?.totalPages || Math.ceil(Number(response?.count || response?.total || list.length) / limit)), 1));
    } catch (err) {
      const message = getErrorMessage(err, "Failed to load expenses");

      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadExpenses(page);
  }, [page, filters]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      expenseDate: new Date().toISOString().slice(0, 10),
    });
    setEditingId("");
    setSelectedExpense(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (expense) => {
    try {
      setSaving(true);

      const id = getId(expense);

      const response = await apiRequest(`/farm-expenses/${id}`);
      const data = getExpense(response) || expense;

      setForm({
        farm: getId(data.farm) || data.farm || "",
        shed: getId(data.shed) || data.shed || "",
        batch: getId(data.batch) || data.batch || "",
        expenseDate: formatDateInput(data.expenseDate),
        category: data.category || "FEED",
        title: data.title || "",
        description: data.description || "",
        amount: data.amount ?? "",
        paidAmount: data.paidAmount ?? "",
        paymentMethod: data.paymentMethod || "CASH",
        vendor: {
          name: data.vendor?.name || "",
          phone: data.vendor?.phone || "",
          invoiceNumber: data.vendor?.invoiceNumber || "",
        },
        receiptImage: {
          url: data.receiptImage?.url || "",
          publicId: data.receiptImage?.publicId || "",
        },
        recurring: Boolean(data.recurring),
        notes: data.notes || "",
      });

      setEditingId(id);
      setSelectedExpense(data);
      setShowModal(true);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load expense"));
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = async (expense) => {
    try {
      const id = getId(expense);

      const response = await apiRequest(`/farm-expenses/${id}`);
      const data = getExpense(response) || expense;

      setSelectedExpense(data);
      setShowViewModal(true);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load expense details"));
    }
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
      }

      if (field === "amount") {
        const amount = Number(value || 0);
        const paid = Number(prev.paidAmount || 0);

        if (paid > amount) {
          next.paidAmount = value;
        }
      }

      if (field === "paidAmount") {
        const amount = Number(prev.amount || 0);
        const paid = Number(value || 0);

        if (paid > amount) {
          next.paidAmount = amount;
        }
      }

      return next;
    });
  };

  const handleVendorChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        [field]: value,
      },
    }));
  };

  const handleReceiptChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      receiptImage: {
        ...prev.receiptImage,
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    if (!form.farm) {
      showError("Please select a farm.");
      return false;
    }

    if (!form.expenseDate) {
      showError("Please select expense date.");
      return false;
    }

    if (!form.category) {
      showError("Please select expense category.");
      return false;
    }

    if (!form.title.trim()) {
      showError("Please enter expense title.");
      return false;
    }

    if (form.title.trim().length > 150) {
      showError("Expense title cannot exceed 150 characters.");
      return false;
    }

    if (form.description.length > 1000) {
      showError("Description cannot exceed 1000 characters.");
      return false;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount < 0) {
      showError("Please enter a valid amount.");
      return false;
    }

    const paidAmount = Number(form.paidAmount || 0);

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      showError("Please enter a valid paid amount.");
      return false;
    }

    if (paidAmount > amount) {
      showError("Paid amount cannot be greater than total amount.");
      return false;
    }

    if (form.vendor.name.length > 150) {
      showError("Vendor name cannot exceed 150 characters.");
      return false;
    }

    if (form.vendor.phone.length > 20) {
      showError("Vendor phone cannot exceed 20 characters.");
      return false;
    }

    if (form.vendor.invoiceNumber.length > 100) {
      showError("Invoice number cannot exceed 100 characters.");
      return false;
    }

    if (form.notes.length > 1000) {
      showError("Notes cannot exceed 1000 characters.");
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    const amount = Number(form.amount || 0);
    const paidAmount = Number(form.paidAmount || 0);

    const payload = {
      farm: form.farm,
      shed: form.shed || undefined,
      batch: form.batch || undefined,
      expenseDate: form.expenseDate,
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      amount,
      paidAmount,
      dueAmount: Math.max(amount - paidAmount, 0),
      paymentMethod: form.paymentMethod,
      vendor: {
        name: form.vendor.name.trim(),
        phone: form.vendor.phone.trim(),
        invoiceNumber: form.vendor.invoiceNumber.trim(),
      },
      recurring: Boolean(form.recurring),
      notes: form.notes.trim(),
    };

    if (form.receiptImage.url.trim() || form.receiptImage.publicId.trim()) {
      payload.receiptImage = {
        url: form.receiptImage.url.trim(),
        publicId: form.receiptImage.publicId.trim(),
      };
    } else if (editingId) {
      payload.receiptImage = null;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = buildPayload();

      if (editingId) {
        await apiRequest(`/farm-expenses/${editingId}`, {
          method: "PUT",
          body: payload,
        });

        showSuccess("Expense updated successfully.");
      } else {
        await apiRequest("/farm-expenses", {
          method: "POST",
          body: payload,
        });

        showSuccess("Expense created successfully.");
      }

      setShowModal(false);
      resetForm();
      await loadExpenses(page);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save expense"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    const id = getId(expense);

    const result = await Swal.fire({
      title: "Delete expense?",
      text: "This expense record will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);

      await apiRequest(`/farm-expenses/${id}`, {
        method: "DELETE",
      });

      showSuccess("Expense deleted successfully.");

      if (expenses.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadExpenses(page);
      }
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete expense"));
    } finally {
      setDeletingId("");
    }
  };

  const exportExcel = () => {
    const headers = ["Date", "Expense", "Category", "Farm", "Shed", "Batch", "Amount", "Paid", "Due", "Payment Status", "Payment Method", "Vendor", "Invoice Number"];

    const rows = displayedExpenses.map((expense) => {
      const amount = Number(expense.amount || 0);
      const paid = Number(expense.paidAmount || 0);
      const due = Math.max(amount - paid, 0);
      const status = getPaymentStatus(amount, paid);

      return [
        formatDate(expense.expenseDate),
        expense.title || "",
        expense.category || "",
        getFarmName(expense.farm),
        getShedName(expense.shed),
        getBatchName(expense.batch),
        amount,
        paid,
        due,
        getStatusLabel(status),
        String(expense.paymentMethod || "CASH").replaceAll("_", " "),
        expense.vendor?.name || "",
        expense.vendor?.invoiceNumber || "",
      ];
    });

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `farm-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = displayedExpenses
      .map((expense) => {
        const amount = Number(expense.amount || 0);
        const paid = Number(expense.paidAmount || 0);
        const due = Math.max(amount - paid, 0);
        const status = getPaymentStatus(amount, paid);

        return `
        <tr>
          <td>${formatDate(expense.expenseDate)}</td>
          <td>${expense.title || "-"}</td>
          <td>${expense.category || "-"}</td>
          <td>${getFarmName(expense.farm)}</td>
          <td>${formatCurrency(amount)}</td>
          <td>${formatCurrency(paid)}</td>
          <td>${formatCurrency(due)}</td>
          <td>${getStatusLabel(status)}</td>
          <td>${expense.vendor?.name || "-"}</td>
        </tr>
      `;
      })
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Farm Expenses</title>
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
        <h1>Farm Expenses Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense</th>
              <th>Category</th>
              <th>Farm</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Vendor</th>
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

  const handleRefresh = async () => {
    await Promise.all([loadMasterData(), loadExpenses(page)]);
  };

  const displayedExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return expenses;

    return expenses.filter((expense) => {
      const searchable = [expense.title, expense.category, expense.description, expense.vendor?.name, expense.vendor?.phone, expense.vendor?.invoiceNumber, getFarmName(expense.farm), getShedName(expense.shed), getBatchName(expense.batch)].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    });
  }, [expenses, search]);

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
      <div className="farm-expenses-page">
        <div className="page-header">
          <div>
            <div className="eyebrow">
              <WalletCards size={16} />
              FARM FINANCE
            </div>
            <h1>Farm Expenses</h1>
            <p>Track farm spending, payments, vendors and outstanding dues.</p>
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
              Add Expense
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <WalletCards size={21} />
            </div>
            <div>
              <span>Total Expenses</span>
              <strong>{formatCurrency(summary.total)}</strong>
              <small>{totalCount} records</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon paid">
              <WalletCards size={21} />
            </div>
            <div>
              <span>Paid Amount</span>
              <strong>{formatCurrency(summary.paid)}</strong>
              <small>{summary.paidCount} paid records</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon due">
              <WalletCards size={21} />
            </div>
            <div>
              <span>Outstanding</span>
              <strong>{formatCurrency(summary.due)}</strong>
              <small>{summary.dueCount} pending/partial</small>
            </div>
          </div>
        </div>

        <div className="filters-card">
          <div className="filters-heading">
            <div>
              <h2>
                <Filter size={17} />
                Filters
              </h2>
              <span>Filter expenses by farm, date, category and payment.</span>
            </div>
          </div>

          <div className="filters-grid">
            <div className="field">
              <label>Search</label>
              <div className="input-icon">
                <Search size={17} />
                <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, vendor..." />

                {search && (
                  <button type="button" className="search-clear-btn" onClick={() => setSearch("")} title="Clear Search">
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
                    shed: "",
                    batch: "",
                  }));
                  setPage(1);
                }}>
                <option value="">All Farms</option>
                {farms.map((farm) => (
                  <option key={getFarmId(farm)} value={getFarmId(farm)}>
                    {getFarmName(farm)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Shed</label>
              <select
                value={filters.shed}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    shed: event.target.value,
                  }));
                  setPage(1);
                }}>
                <option value="">All Sheds</option>
                {sheds
                  .filter((shed) => {
                    if (!filters.farm) return true;

                    return String(shed.farm?._id || shed.farm?.id || shed.farm || "") === String(filters.farm);
                  })
                  .map((shed) => (
                    <option key={getShedId(shed)} value={getShedId(shed)}>
                      {getShedName(shed)}
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
                }}>
                <option value="">All Batches</option>
                {batches
                  .filter((batch) => {
                    if (!filters.farm) return true;

                    return String(batch.farm?._id || batch.farm?.id || batch.farm || "") === String(filters.farm);
                  })
                  .map((batch) => (
                    <option key={getBatchId(batch)} value={getBatchId(batch)}>
                      {getBatchName(batch)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="field">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }));
                  setPage(1);
                }}>
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    paymentMethod: event.target.value,
                  }));
                  setPage(1);
                }}>
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    paymentStatus: event.target.value,
                  }));
                  setPage(1);
                }}>
                <option value="">All Status</option>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Start Date</label>
              <div className="input-icon">
                <CalendarDays size={17} />

                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => {
                    setFilters((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }));
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label>End Date</label>
              <div className="input-icon">
                <CalendarDays size={17} />

                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => {
                    setFilters((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }));
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label>Min Amount</label>

              <input
                type="number"
                min="0"
                value={filters.minAmount}
                onChange={(event) => {
                  setFilters((prev) => ({
                    ...prev,
                    minAmount: event.target.value,
                  }));
                  setPage(1);
                }}
                placeholder="₹0"
              />
            </div>

            <div className="field">
              <label>Max Amount</label>

              <div className="amount-clear-row">
                <input
                  type="number"
                  min="0"
                  value={filters.maxAmount}
                  onChange={(event) => {
                    setFilters((prev) => ({
                      ...prev,
                      maxAmount: event.target.value,
                    }));
                    setPage(1);
                  }}
                  placeholder="₹0"
                />

                {(filters.startDate || filters.endDate || filters.minAmount !== "" || filters.maxAmount !== "") && (
                  <button
                    type="button"
                    className="amount-clear-btn"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        startDate: "",
                        endDate: "",
                        minAmount: "",
                        maxAmount: "",
                      }));
                      setPage(1);
                    }}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Expense Records</h2>
              <span>
                Showing {displayedExpenses.length} record
                {displayedExpenses.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="state-box">
              <RefreshCw size={24} className="spin" />
              <strong>Loading expenses...</strong>
              <span>Please wait while records are being loaded.</span>
            </div>
          ) : error ? (
            <div className="state-box error-state">
              <strong>Unable to load expenses</strong>
              <span>{error}</span>
              <button type="button" onClick={() => loadExpenses(page)}>
                Try Again
              </button>
            </div>
          ) : displayedExpenses.length === 0 ? (
            <div className="state-box">
              <WalletCards size={30} />
              <strong>No expenses found</strong>
              <span>Add a new expense or change the filters to see records.</span>
              <button type="button" onClick={openCreateModal}>
                <Plus size={17} />
                Add Expense
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Expense</th>
                      <th>Farm / Shed</th>
                      <th>Batch</th>
                      <th>Amount</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Payment</th>
                      <th>Vendor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedExpenses.map((expense) => {
                      const amount = Number(expense.amount || 0);
                      const paid = Number(expense.paidAmount || 0);
                      const due = Math.max(amount - paid, 0);
                      const status = getPaymentStatus(amount, paid);

                      return (
                        <tr key={getId(expense)}>
                          <td>
                            <div className="date-cell">
                              <strong>{formatDate(expense.expenseDate)}</strong>
                              {expense.recurring && <small>Recurring</small>}
                            </div>
                          </td>

                          <td>
                            <div className="expense-title">
                              <strong>{expense.title || "-"}</strong>
                              <span>{expense.category || "-"}</span>
                            </div>
                          </td>

                          <td>
                            <div className="location-cell">
                              <strong>{getFarmName(expense.farm)}</strong>
                              <span>{getShedName(expense.shed)}</span>
                            </div>
                          </td>

                          <td>{getBatchName(expense.batch)}</td>

                          <td>
                            <strong>{formatCurrency(amount)}</strong>
                          </td>

                          <td className="paid-text">{formatCurrency(paid)}</td>

                          <td className="due-text">{formatCurrency(due)}</td>

                          <td>
                            <div className="payment-cell">
                              <span className={`status-badge ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>
                              <small>{String(expense.paymentMethod || "CASH").replaceAll("_", " ")}</small>
                            </div>
                          </td>

                          <td>
                            <div className="vendor-cell">
                              <strong>{expense.vendor?.name || "-"}</strong>
                              {expense.vendor?.invoiceNumber && <small>#{expense.vendor.invoiceNumber}</small>}
                            </div>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button type="button" className="icon-btn view" title="View" onClick={() => openViewModal(expense)}>
                                <Eye size={17} />
                              </button>

                              <button type="button" className="icon-btn edit" title="Edit" onClick={() => openEditModal(expense)}>
                                <Pencil size={17} />
                              </button>

                              <button type="button" className="icon-btn delete" title="Delete" disabled={deletingId === getId(expense)} onClick={() => handleDelete(expense)}>
                                {deletingId === getId(expense) ? <RefreshCw size={17} className="spin" /> : <Trash2 size={17} />}
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

      {showModal && (
        <div className="modal-overlay" onMouseDown={() => setShowModal(false)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-kicker">{editingId ? "UPDATE RECORD" : "NEW RECORD"}</span>
                <h2>{editingId ? "Edit Expense" : "Add Farm Expense"}</h2>
              </div>

              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Expense Details</h3>

                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Farm <em>*</em>
                      </label>
                      <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} disabled={Boolean(editingId)}>
                        <option value="">Select Farm</option>
                        {farms.map((farm) => (
                          <option key={getFarmId(farm)} value={getFarmId(farm)}>
                            {getFarmName(farm)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Shed</label>
                      <select value={form.shed} onChange={(event) => handleFormChange("shed", event.target.value)}>
                        <option value="">Select Shed</option>
                        {filteredSheds.map((shed) => (
                          <option key={getShedId(shed)} value={getShedId(shed)}>
                            {getShedName(shed)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Batch</label>
                      <select value={form.batch} onChange={(event) => handleFormChange("batch", event.target.value)}>
                        <option value="">Select Batch</option>
                        {filteredBatches.map((batch) => (
                          <option key={getBatchId(batch)} value={getBatchId(batch)}>
                            {getBatchName(batch)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Expense Date <em>*</em>
                      </label>
                      <input type="date" value={form.expenseDate} onChange={(event) => handleFormChange("expenseDate", event.target.value)} required />
                    </div>

                    <div className="field">
                      <label>
                        Category <em>*</em>
                      </label>
                      <select value={form.category} onChange={(event) => handleFormChange("category", event.target.value)} required>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Payment Method <em>*</em>
                      </label>
                      <select value={form.paymentMethod} onChange={(event) => handleFormChange("paymentMethod", event.target.value)}>
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field full">
                      <label>
                        Title <em>*</em>
                      </label>
                      <input type="text" value={form.title} onChange={(event) => handleFormChange("title", event.target.value)} placeholder="Example: 50 kg Kadaknath feed purchase" maxLength={150} required />
                    </div>

                    <div className="field full">
                      <label>Description</label>
                      <textarea value={form.description} onChange={(event) => handleFormChange("description", event.target.value)} placeholder="Enter expense details..." maxLength={1000} rows={3} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Payment Details</h3>

                  <div className="form-grid">
                    <div className="field">
                      <label>
                        Total Amount <em>*</em>
                      </label>
                      <div className="amount-input">
                        <span>₹</span>
                        <input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => handleFormChange("amount", event.target.value)} placeholder="0" required />
                      </div>
                    </div>

                    <div className="field">
                      <label>Paid Amount</label>
                      <div className="amount-input">
                        <span>₹</span>
                        <input type="number" min="0" step="0.01" value={form.paidAmount} onChange={(event) => handleFormChange("paidAmount", event.target.value)} placeholder="0" />
                      </div>
                    </div>

                    <div className="field">
                      <label>Due Amount</label>
                      <div className="readonly-value">{formatCurrency(formDueAmount)}</div>
                    </div>

                    <div className="field">
                      <label>Payment Status</label>
                      <div className="status-preview">
                        <span className={`status-badge ${getStatusClass(formPaymentStatus)}`}>{getStatusLabel(formPaymentStatus)}</span>
                        <small>Auto calculated</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Vendor Details</h3>

                  <div className="form-grid">
                    <div className="field">
                      <label>Vendor Name</label>
                      <input type="text" value={form.vendor.name} onChange={(event) => handleVendorChange("name", event.target.value)} placeholder="Vendor / supplier name" maxLength={150} />
                    </div>

                    <div className="field">
                      <label>Vendor Phone</label>
                      <input type="text" value={form.vendor.phone} onChange={(event) => handleVendorChange("phone", event.target.value)} placeholder="Phone number" maxLength={20} />
                    </div>

                    <div className="field">
                      <label>Invoice Number</label>
                      <input type="text" value={form.vendor.invoiceNumber} onChange={(event) => handleVendorChange("invoiceNumber", event.target.value)} placeholder="Invoice number" maxLength={100} />
                    </div>

                    <div className="field recurring-field">
                      <label>Recurring Expense</label>
                      <label className="switch-row">
                        <input type="checkbox" checked={form.recurring} onChange={(event) => handleFormChange("recurring", event.target.checked)} />
                        <span className="switch"></span>
                        <span>{form.recurring ? "Enabled" : "Disabled"}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Receipt & Notes</h3>

                  <div className="form-grid">
                    <div className="field full">
                      <label>Receipt Image URL</label>
                      <input type="url" value={form.receiptImage.url} onChange={(event) => handleReceiptChange("url", event.target.value)} placeholder="https://..." />
                      <small className="field-help">Upload endpoint is not available in the current backend, so receipt URL can be stored manually.</small>
                    </div>

                    <div className="field full">
                      <label>Receipt Public ID</label>
                      <input type="text" value={form.receiptImage.publicId} onChange={(event) => handleReceiptChange("publicId", event.target.value)} placeholder="Cloudinary public ID" />
                    </div>

                    <div className="field full">
                      <label>Notes</label>
                      <textarea value={form.notes} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Additional notes..." maxLength={1000} rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <WalletCards size={17} />
                      {editingId ? "Update Expense" : "Save Expense"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedExpense && (
        <div className="modal-overlay" onMouseDown={() => setShowViewModal(false)}>
          <div className="modal view-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-kicker">EXPENSE DETAILS</span>
                <h2>{selectedExpense.title || "Expense"}</h2>
              </div>

              <button type="button" className="close-btn" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-highlight">
                <div>
                  <span>Total Amount</span>
                  <strong>{formatCurrency(selectedExpense.amount)}</strong>
                </div>

                <div>
                  <span>Paid</span>
                  <strong>{formatCurrency(selectedExpense.paidAmount)}</strong>
                </div>

                <div>
                  <span>Due</span>
                  <strong className="due-value">{formatCurrency(Math.max(Number(selectedExpense.amount || 0) - Number(selectedExpense.paidAmount || 0), 0))}</strong>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span>Expense Date</span>
                  <strong>{formatDate(selectedExpense.expenseDate)}</strong>
                </div>

                <div className="detail-item">
                  <span>Category</span>
                  <strong>{selectedExpense.category || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Payment Status</span>
                  <strong>
                    <span className={`status-badge ${getStatusClass(getPaymentStatus(selectedExpense.amount, selectedExpense.paidAmount))}`}>{getStatusLabel(getPaymentStatus(selectedExpense.amount, selectedExpense.paidAmount))}</span>
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Payment Method</span>
                  <strong>{String(selectedExpense.paymentMethod || "CASH").replaceAll("_", " ")}</strong>
                </div>

                <div className="detail-item">
                  <span>Farm</span>
                  <strong>{getFarmName(selectedExpense.farm)}</strong>
                </div>

                <div className="detail-item">
                  <span>Shed</span>
                  <strong>{getShedName(selectedExpense.shed)}</strong>
                </div>

                <div className="detail-item">
                  <span>Batch</span>
                  <strong>{getBatchName(selectedExpense.batch)}</strong>
                </div>

                <div className="detail-item">
                  <span>Recurring</span>
                  <strong>{selectedExpense.recurring ? "Yes" : "No"}</strong>
                </div>

                <div className="detail-item">
                  <span>Vendor</span>
                  <strong>{selectedExpense.vendor?.name || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Vendor Phone</span>
                  <strong>{selectedExpense.vendor?.phone || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Invoice Number</span>
                  <strong>{selectedExpense.vendor?.invoiceNumber || "-"}</strong>
                </div>

                <div className="detail-item">
                  <span>Created By</span>
                  <strong>{selectedExpense.createdBy?.name || selectedExpense.createdBy?.email || "-"}</strong>
                </div>
              </div>

              {selectedExpense.description && (
                <div className="detail-text">
                  <span>Description</span>
                  <p>{selectedExpense.description}</p>
                </div>
              )}

              {selectedExpense.notes && (
                <div className="detail-text">
                  <span>Notes</span>
                  <p>{selectedExpense.notes}</p>
                </div>
              )}

              {selectedExpense.receiptImage?.url && (
                <div className="receipt-section">
                  <div className="receipt-heading">
                    <span>Receipt</span>
                    <a href={selectedExpense.receiptImage.url} target="_blank" rel="noreferrer">
                      Open Receipt
                    </a>
                  </div>

                  <div className="receipt-preview">
                    <img src={selectedExpense.receiptImage.url} alt="Expense receipt" />
                  </div>

                  {selectedExpense.receiptImage.publicId && <small>Public ID: {selectedExpense.receiptImage.publicId}</small>}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedExpense);
                }}>
                <Pencil size={17} />
                Edit Expense
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.amount-clear-row{display:flex;align-items:center;gap:8px;width:100%}.amount-clear-row input{flex:1;min-width:0}.amount-clear-btn{flex:0 0 auto;height:32px;padding:0 11px;border:1px solid var(--admin-border,#dfe4ec);border-radius:8px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;justify-content:center;text-decoration:none!important;transition:.2s ease}.amount-clear-btn:hover{background:var(--admin-border,#e4e8ef);color:var(--admin-text,#172033);text-decoration:none!important}.farm-expenses-page{padding:24px;min-height:100%;background:var(--admin-bg,#f5f7fb);color:var(--admin-text,#172033)}.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}.eyebrow{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--admin-primary,#4f46e5);margin-bottom:7px}.page-header h1{margin:0;font-size:28px;line-height:1.15;font-weight:800}.page-header p{margin:7px 0 0;color:var(--admin-muted,#697386);font-size:14px}.header-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#b91c1c;border-color:#b91c1c;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover:not(:disabled){background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff}.primary-btn,.secondary-btn,.clear-btn,.pagination-buttons button,.state-box button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;padding:10px 15px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s;border:1px solid transparent}.primary-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.primary-btn:hover:not(:disabled){background:#4338ca;border-color:#4338ca;color:#fff;transform:translateY(-1px)}.primary-btn:disabled,.secondary-btn:disabled,.pagination-buttons button:disabled{opacity:.55;cursor:not-allowed;transform:none}.secondary-btn{background:var(--admin-surface,#fff);border-color:var(--admin-border,#e4e8ef);color:var(--admin-text,#172033)}.secondary-btn:hover{background:var(--admin-surface-2,#f8fafc)}.clear-btn{background:transparent;color:var(--admin-primary,#4f46e5);padding:7px 0}.summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:20px}.summary-card{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e4e8ef);border-radius:16px;padding:18px;display:flex;align-items:center;gap:14px;box-shadow:0 5px 18px rgba(15,23,42,.035)}.summary-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(79,70,229,.1);color:var(--admin-primary,#4f46e5);flex:none}.summary-icon.paid{background:rgba(16,185,129,.1);color:#059669}.summary-icon.due{background:rgba(245,158,11,.12);color:#d97706}.summary-card span{display:block;font-size:12px;color:var(--admin-muted,#697386);margin-bottom:3px}.summary-card strong{display:block;font-size:20px;font-weight:800}.summary-card small{display:block;margin-top:3px;color:var(--admin-muted,#697386);font-size:11px}.filters-card,.table-card{background:var(--admin-surface,#fff);border:1px solid var(--admin-border,#e4e8ef);border-radius:16px;box-shadow:0 5px 18px rgba(15,23,42,.035)}.filters-card{padding:18px;margin-bottom:20px}.filters-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:16px}.filters-heading h2,.table-header h2{display:flex;align-items:center;gap:8px;margin:0;font-size:15px;font-weight:800}.filters-heading span,.table-header span{display:block;color:var(--admin-muted,#697386);font-size:12px;margin-top:4px}.filters-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.field{display:flex;flex-direction:column;gap:7px;min-width:0}.field.full{grid-column:1/-1}.field label{font-size:12px;font-weight:700;color:var(--admin-text,#30394d)}.field label em{font-style:normal;color:var(--admin-danger,#ef4444)}.field input,.field select,.field textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border,#dfe4ec);background:var(--admin-surface,#fff);color:var(--admin-text,#172033);border-radius:9px;padding:10px 11px;font:inherit;font-size:13px;outline:none;transition:.2s}.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--admin-primary,#4f46e5);box-shadow:0 0 0 3px rgba(79,70,229,.08)}.field textarea{resize:vertical;min-height:80px}.field input:disabled,.field select:disabled{background:var(--admin-surface-2,#f5f7fa);cursor:not-allowed}.input-icon{position:relative;width:100%}.input-icon>svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);width:17px;height:17px;color:var(--admin-muted);pointer-events:none;z-index:2}.input-icon:has(input[type="date"])>svg{display:none}.input-icon input{width:100%;box-sizing:border-box;padding-left:36px!important;padding-right:40px!important}.input-icon:has(input[type="date"]) input[type="date"]{padding-left:11px!important;padding-right:40px!important;color-scheme:light dark}.search-clear-btn{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:26px;height:26px;padding:0;margin:0;border:0;border-radius:7px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-muted,#697386);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3}.search-clear-btn:hover{background:var(--admin-border,#e4e8ef);color:var(--admin-text,#172033)}.admin-theme-light .input-icon:has(input[type="date"]) input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.input-icon:has(input[type="date"]) input[type="date"]::-webkit-calendar-picker-indicator{opacity:.9;cursor:pointer}.field input[type="date"],.form-grid input[type="date"]{color-scheme:light dark}.admin-theme-light .field input[type="date"]::-webkit-calendar-picker-indicator,.admin-theme-light .form-grid input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.table-header{padding:18px 18px 15px;border-bottom:1px solid var(--admin-border,#e4e8ef);display:flex;align-items:center;justify-content:space-between}.table-wrap{overflow-x:auto}.table-wrap table{width:100%;border-collapse:collapse;min-width:1250px}.table-wrap th{padding:12px 14px;text-align:left;background:var(--admin-surface-2,#f8fafc);font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--admin-muted,#697386);font-weight:800;white-space:nowrap}.table-wrap td{padding:14px;border-top:1px solid var(--admin-border,#edf0f4);font-size:12px;vertical-align:middle;white-space:nowrap}.table-wrap tbody tr:hover{background:rgba(79,70,229,.025)}.date-cell,.expense-title,.location-cell,.payment-cell,.vendor-cell{display:flex;flex-direction:column;gap:3px}.date-cell strong,.expense-title strong,.location-cell strong,.vendor-cell strong{font-size:12px}.date-cell small,.expense-title span,.location-cell span,.payment-cell small,.vendor-cell small{font-size:10px;color:var(--admin-muted,#697386)}.expense-title span{font-weight:700}.paid-text{color:#059669;font-weight:700}.due-text{color:#d97706;font-weight:700}.status-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800;white-space:nowrap}.status-paid{background:rgba(16,185,129,.11);color:#047857}.status-partial{background:rgba(245,158,11,.13);color:#b45309}.status-pending{background:rgba(239,68,68,.1);color:#dc2626}.action-buttons{display:flex;align-items:center;gap:6px}.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--admin-border,#e4e8ef);background:var(--admin-surface,#fff);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}.icon-btn.view{color:#2563eb}.icon-btn.edit{color:#7c3aed}.icon-btn.delete{color:#dc2626}.icon-btn:hover{transform:translateY(-1px);background:var(--admin-surface-2,#f8fafc)}.icon-btn:disabled{opacity:.5;cursor:not-allowed}.pagination{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 18px;border-top:1px solid var(--admin-border,#e4e8ef);font-size:12px;color:var(--admin-muted,#697386)}.pagination-buttons{display:flex;gap:8px}.pagination-buttons button{background:var(--admin-surface,#fff);border-color:var(--admin-border,#e4e8ef);color:var(--admin-text,#172033);padding:8px 11px}.pagination-buttons button:hover:not(:disabled){border-color:var(--admin-primary,#4f46e5);color:var(--admin-primary,#4f46e5);background:rgba(79,70,229,.06)}.state-box{min-height:260px;padding:30px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;color:var(--admin-muted,#697386)}.state-box svg{margin-bottom:4px;color:var(--admin-primary,#4f46e5)}.state-box strong{color:var(--admin-text,#172033);font-size:15px}.state-box span{font-size:12px}.state-box button{margin-top:8px;background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.state-box button:hover{background:#4338ca;border-color:#4338ca;color:#fff}.error-state svg{color:var(--admin-danger,#ef4444)}.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.62);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}.modal{width:min(850px,100%);max-height:calc(100vh - 40px);background:var(--admin-surface,#fff);border-radius:18px;overflow:hidden;box-shadow:0 25px 80px rgba(15,23,42,.25);display:flex;flex-direction:column;min-height:0}.view-modal{width:min(800px,100%)}.modal-header{padding:18px 20px;border-bottom:1px solid var(--admin-border,#e4e8ef);display:flex;align-items:center;justify-content:space-between;gap:15px;flex:none}.modal-kicker{display:block;font-size:10px;font-weight:800;letter-spacing:.12em;color:var(--admin-primary,#4f46e5);margin-bottom:4px}.modal-header h2{margin:0;font-size:19px}.close-btn{width:34px;height:34px;border-radius:9px;border:1px solid var(--admin-border,#e4e8ef);background:transparent;color:var(--admin-muted,#697386);display:flex;align-items:center;justify-content:center;cursor:pointer}.close-btn:hover{background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033)}.modal-body{padding:20px;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}.modal>form{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.form-section{padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--admin-border,#edf0f4)}.form-section:last-child{padding-bottom:0;margin-bottom:0;border-bottom:0}.form-section h3{margin:0 0 14px;font-size:13px;font-weight:800}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.amount-input{display:flex;align-items:center;border:1px solid var(--admin-border,#dfe4ec);border-radius:9px;overflow:hidden}.amount-input:focus-within{border-color:var(--admin-primary,#4f46e5);box-shadow:0 0 0 3px rgba(79,70,229,.08)}.amount-input span{padding-left:11px;color:var(--admin-muted,#697386);font-size:13px;font-weight:700}.amount-input input{border:0!important;box-shadow:none!important}.readonly-value{min-height:39px;box-sizing:border-box;border:1px solid var(--admin-border,#dfe4ec);border-radius:9px;background:var(--admin-surface-2,#f8fafc);display:flex;align-items:center;padding:0 11px;font-size:13px;font-weight:800}.status-preview{min-height:39px;display:flex;align-items:center;gap:9px}.status-preview small{font-size:10px;color:var(--admin-muted,#697386)}.switch-row{display:flex!important;align-items:center;gap:9px;height:39px;cursor:pointer!important;font-weight:600!important}.switch-row input{position:absolute;opacity:0;pointer-events:none}.switch{width:38px;height:21px;background:#cbd5e1;border-radius:999px;position:relative;transition:.2s}.switch:after{content:"";position:absolute;width:17px;height:17px;border-radius:50%;background:#fff;top:2px;left:2px;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}.switch-row input:checked+.switch{background:var(--admin-primary,#4f46e5)}.switch-row input:checked+.switch:after{left:19px}.field-help{font-size:10px;color:var(--admin-muted,#697386);line-height:1.4}.modal-footer{padding:15px 20px;border-top:1px solid var(--admin-border,#e4e8ef);display:flex;justify-content:flex-end;gap:9px;flex:none}.detail-highlight{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:20px}.detail-highlight>div{background:var(--admin-surface-2,#f8fafc);border:1px solid var(--admin-border,#e4e8ef);border-radius:12px;padding:14px}.detail-highlight span{display:block;color:var(--admin-muted,#697386);font-size:11px;margin-bottom:5px}.detail-highlight strong{font-size:18px}.detail-highlight .due-value{color:#d97706}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--admin-border,#e4e8ef);border-radius:12px;overflow:hidden}.detail-item{padding:12px 14px;border-right:1px solid var(--admin-border,#e4e8ef);border-bottom:1px solid var(--admin-border,#e4e8ef)}.detail-item:nth-child(2n){border-right:0}.detail-item:nth-last-child(-n+2){border-bottom:0}.detail-item span,.detail-text>span,.receipt-heading span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--admin-muted,#697386);font-weight:800;margin-bottom:4px}.detail-item strong{font-size:12px}.detail-text{margin-top:18px;padding:14px;background:var(--admin-surface-2,#f8fafc);border-radius:12px}.detail-text p{margin:0;font-size:12px;line-height:1.6;white-space:pre-wrap}.receipt-section{margin-top:18px}.receipt-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}.receipt-heading a{font-size:11px;color:var(--admin-primary,#4f46e5);font-weight:700;text-decoration:none}.receipt-preview{border:1px solid var(--admin-border,#e4e8ef);border-radius:12px;overflow:hidden;background:var(--admin-surface-2,#f8fafc);display:flex;justify-content:center}.receipt-preview img{display:block;max-width:100%;max-height:360px;object-fit:contain}.receipt-section>small{display:block;margin-top:7px;color:var(--admin-muted,#697386);font-size:10px;word-break:break-all}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1100px){.filters-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.farm-expenses-page{padding:16px}.page-header{align-items:flex-start;flex-direction:column}.header-actions{width:100%;justify-content:flex-start;gap:8px}.header-actions .top-action-btn{flex:1}.header-actions .refresh-action-btn{flex:0 0 40px}.summary-grid{grid-template-columns:1fr}.filters-grid{grid-template-columns:1fr 1fr}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.detail-highlight{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}.detail-item,.detail-item:nth-child(2n){border-right:0}.detail-item:nth-last-child(-n+2){border-bottom:1px solid var(--admin-border,#e4e8ef)}.detail-item:last-child{border-bottom:0}}@media(max-width:560px){.farm-expenses-page{padding:12px}.page-header h1{font-size:23px}.header-actions{width:100%;flex-wrap:wrap}.header-actions .top-action-btn{flex:1 1 calc(33.333% - 6px)}.header-actions .refresh-action-btn{flex:0 0 40px}.header-actions .add-action-btn{flex:1 1 100%}.filters-grid{grid-template-columns:1fr}.filters-heading{align-items:flex-start;flex-direction:column}.filters-card,.table-card{border-radius:12px}.pagination{align-items:flex-start;flex-direction:column}.pagination-buttons{width:100%}.pagination-buttons button{flex:1}.modal-overlay{padding:8px}.modal{max-height:calc(100vh - 16px);border-radius:14px}.modal-header,.modal-body,.modal-footer{padding:14px}.modal-footer{flex-direction:column-reverse}.modal-footer button{width:100%}}`}</style>
    </>
  );
}
