import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, ChevronDown, Clock3, Eye, FileSpreadsheet, FileText, Filter, ListTodo, Pencil, Plus, RefreshCw, Search, Trash2, UserRound, X, XCircle, Zap } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const categories = ["FEEDING", "CLEANING", "EGG_COLLECTION", "VACCINATION", "MEDICINE", "WATER", "BIOSECURITY", "MAINTENANCE", "BIRD_CHECK", "STOCK_CHECK", "OTHER"];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const frequencies = ["DAILY", "WEEKLY", "MONTHLY"];

const emptyForm = {
  farm: "",
  shed: "",
  batch: "",
  title: "",
  description: "",
  category: "OTHER",
  priority: "MEDIUM",
  assignedTo: "",
  startDate: "",
  dueDate: "",
  status: "PENDING",
  completionNote: "",
  recurringEnabled: false,
  recurringFrequency: "DAILY",
  notes: "",
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
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

const toInputDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const labelize = (value) => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getPriorityClass = (priority) => {
  if (priority === "URGENT") return "priority urgent";
  if (priority === "HIGH") return "priority high";
  if (priority === "LOW") return "priority low";
  return "priority medium";
};

const getStatusClass = (status) => {
  if (status === "COMPLETED") return "status completed";
  if (status === "CANCELLED") return "status cancelled";
  if (status === "IN_PROGRESS") return "status progress";
  if (status === "OVERDUE") return "status overdue";
  return "status pending";
};

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.data?.message || error?.message || fallback;
};

export default function FarmTasks() {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [selectedFarm, setSelectedFarm] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [showFilters, setShowFilters] = useState(false);

  const loadFarms = async () => {
    try {
      const response = await apiRequest("/farms");

      const farmList = Array.isArray(response?.farms) ? response.farms : Array.isArray(response?.data) ? response.data : [];

      setFarms(farmList);

      if (!selectedFarm && farmList.length > 0) {
        setSelectedFarm(getId(farmList[0]));
      }
    } catch (error) {
      setFarms([]);
      showError(getErrorMessage(error, "Failed to load farms"));
    }
  };

  const loadOptions = async (farmId) => {
    if (!farmId) {
      setSheds([]);
      setBatches([]);
      setUsers([]);
      return;
    }

    setLoadingOptions(true);

    try {
      const [shedResponse, batchResponse, userResponse] = await Promise.allSettled([apiRequest(`/sheds?farm=${farmId}`), apiRequest(`/batches?farm=${farmId}`), apiRequest("/admin/users/staff")]);

      if (shedResponse.status === "fulfilled") {
        const data = shedResponse.value;

        const list = Array.isArray(data?.sheds) ? data.sheds : Array.isArray(data?.data) ? data.data : [];

        setSheds(list);
      } else {
        setSheds([]);
      }

      if (batchResponse.status === "fulfilled") {
        const data = batchResponse.value;

        const list = Array.isArray(data?.batches) ? data.batches : Array.isArray(data?.data) ? data.data : [];

        setBatches(list);
      } else {
        setBatches([]);
      }

      if (userResponse.status === "fulfilled") {
        const data = userResponse.value;

        const list = Array.isArray(data?.users) ? data.users : Array.isArray(data?.data) ? data.data : [];

        setUsers(list.filter((user) => user?.role === "staff" || user?.role === "admin"));
      } else {
        setUsers([]);
      }
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadTasks = async () => {
    if (!selectedFarm) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("farm", selectedFarm);

      if (categoryFilter) params.set("category", categoryFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (assignedFilter) params.set("assignedTo", assignedFilter);

      const response = await apiRequest(`/tasks?${params.toString()}`);

      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response?.tasks) ? response.tasks : [];

      setTasks(list);
    } catch (error) {
      setTasks([]);
      setError(getErrorMessage(error, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadFarms(), loadTasks()]);
  };

  const exportExcel = () => {
    const headers = ["Task", "Category", "Priority", "Status", "Due Date", "Assigned To", "Farm", "Shed", "Batch"];

    const rows = filteredTasks.map((task) => [
      task.title || "",
      labelize(task.category),
      labelize(task.priority),
      labelize(task.status),
      formatDate(task.dueDate),
      task.assignedTo?.name || "Unassigned",
      task.farm?.name || "",
      task.shed?.name || "",
      task.batch?.batchName || task.batch?.batchNumber || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `farm-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF.");
      return;
    }

    const rows = filteredTasks
      .map(
        (task) => `
        <tr>
          <td>${task.title || "-"}</td>
          <td>${labelize(task.category)}</td>
          <td>${labelize(task.priority)}</td>
          <td>${labelize(task.status)}</td>
          <td>${formatDate(task.dueDate)}</td>
          <td>${task.assignedTo?.name || "Unassigned"}</td>
          <td>${task.farm?.name || "-"}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Farm Tasks</title>
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
        <h1>Farm Tasks Report</h1>
        <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Assigned To</th>
              <th>Farm</th>
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
    loadFarms();
  }, []);

  useEffect(() => {
    if (!selectedFarm) return;

    loadOptions(selectedFarm);
  }, [selectedFarm]);

  useEffect(() => {
    loadTasks();
  }, [selectedFarm, categoryFilter, priorityFilter, statusFilter, assignedFilter]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) => {
      const values = [task?.title, task?.description, task?.category, task?.priority, task?.status, task?.farm?.name, task?.farm?.code, task?.shed?.name, task?.shed?.code, task?.batch?.batchNumber, task?.batch?.batchName, task?.assignedTo?.name, task?.assignedTo?.email];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [tasks, search]);

  const summary = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "PENDING").length,
      progress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      completed: tasks.filter((task) => task.status === "COMPLETED").length,
      overdue: tasks.filter((task) => task.status === "OVERDUE").length,
      urgent: tasks.filter((task) => task.priority === "URGENT").length,
    };
  }, [tasks]);

  const selectedFarmObject = farms.find((farm) => getId(farm) === selectedFarm);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      farm: selectedFarm || "",
    });
    setEditingTask(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);

    setForm({
      farm: getId(task.farm) || selectedFarm || "",
      shed: getId(task.shed),
      batch: getId(task.batch),
      title: task.title || "",
      description: task.description || "",
      category: task.category || "OTHER",
      priority: task.priority || "MEDIUM",
      assignedTo: getId(task.assignedTo),
      startDate: toInputDate(task.startDate),
      dueDate: toInputDate(task.dueDate),
      status: task.status === "OVERDUE" ? "PENDING" : task.status || "PENDING",
      completionNote: task.completionNote || "",
      recurringEnabled: Boolean(task.recurring?.enabled),
      recurringFrequency: task.recurring?.frequency || "DAILY",
      notes: task.notes || "",
    });

    setShowModal(true);
  };

  const openView = (task) => {
    setViewingTask(task);
    setShowViewModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitTask = async (event) => {
    event.preventDefault();

    if (!form.farm) {
      showError("Please select a farm");
      return;
    }

    if (!form.title.trim()) {
      showError("Task title is required");
      return;
    }

    if (!form.dueDate) {
      showError("Due date is required");
      return;
    }

    if (form.startDate && form.dueDate < form.startDate) {
      showError("Due date cannot be before start date");
      return;
    }

    setSaving(true);

    const payload = {
      farm: form.farm,
      shed: form.shed || null,
      batch: form.batch || null,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      assignedTo: form.assignedTo || null,
      startDate: form.startDate || null,
      dueDate: form.dueDate,
      status: form.status,
      completionNote: form.completionNote.trim(),
      recurring: {
        enabled: form.recurringEnabled,
        ...(form.recurringEnabled ? { frequency: form.recurringFrequency } : {}),
      },
      notes: form.notes.trim(),
    };

    try {
      if (editingTask) {
        const response = await apiRequest(`/tasks/${getId(editingTask)}`, {
          method: "PUT",
          body: payload,
        });

        showSuccess(response?.message || "Task updated successfully");
      } else {
        const response = await apiRequest("/tasks", {
          method: "POST",
          body: payload,
        });

        showSuccess(response?.message || "Task created successfully");
      }

      setShowModal(false);
      resetForm();
      await loadTasks();
    } catch (error) {
      showError(getErrorMessage(error, "Failed to save task"));
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (task) => {
    const result = await showConfirm({
      title: "Delete Task?",
      text: `"${task.title}" will be permanently deleted.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiRequest(`/tasks/${getId(task)}`, {
        method: "DELETE",
      });

      showSuccess(response?.message || "Task deleted successfully");

      await loadTasks();
    } catch (error) {
      showError(getErrorMessage(error, "Failed to delete task"));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setAssignedFilter("");
  };

  const renderTaskRow = (task) => (
    <tr key={getId(task)}>
      <td>
        <div className="task-title-cell">
          <div className="task-icon">
            <ListTodo size={17} />
          </div>

          <div>
            <strong>{task.title}</strong>

            {task.description && <span className="task-description">{task.description.length > 75 ? `${task.description.slice(0, 75)}...` : task.description}</span>}
          </div>
        </div>
      </td>

      <td>
        <span className="category-badge">{labelize(task.category)}</span>
      </td>

      <td>
        <span className={getPriorityClass(task.priority)}>{labelize(task.priority)}</span>
      </td>

      <td>
        <span className={getStatusClass(task.status)}>{labelize(task.status)}</span>
      </td>

      <td>
        <div className="date-cell">
          <CalendarDays size={14} />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </td>

      <td>
        {task.assignedTo ? (
          <div className="assigned-cell">
            <div className="user-avatar">
              <UserRound size={14} />
            </div>

            <div>
              <strong>{task.assignedTo.name || "User"}</strong>
              <span>{task.assignedTo.role || "—"}</span>
            </div>
          </div>
        ) : (
          <span className="muted-text">Unassigned</span>
        )}
      </td>

      <td>
        <div className="row-actions">
          <button type="button" className="icon-btn view" title="View" onClick={() => openView(task)}>
            <Eye size={16} />
          </button>

          <button type="button" className="icon-btn edit" title="Edit" onClick={() => openEdit(task)}>
            <Pencil size={16} />
          </button>

          <button type="button" className="icon-btn delete" title="Delete" onClick={() => deleteTask(task)}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="farm-tasks-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Zap size={15} />
            FARM OPERATIONS
          </div>

          <h1>Farm Tasks</h1>

          <p>Create, assign and track daily farm activities.</p>
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

          <button type="button" className="top-action-btn add-action-btn" onClick={openCreate}>
            <Plus size={17} />
            New Task
          </button>
        </div>
      </div>

      <div className="control-bar">
        <div className="farm-selector">
          <label>Farm</label>

          <div className="select-wrap">
            <select value={selectedFarm} onChange={(event) => setSelectedFarm(event.target.value)}>
              <option value="">Select Farm</option>

              {farms.map((farm) => (
                <option key={getId(farm)} value={getId(farm)}>
                  {farm.name} {farm.code ? `(${farm.code})` : ""}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="search-box">
          <Search size={17} />

          <input type="text" placeholder="Search tasks..." value={search} onChange={(event) => setSearch(event.target.value)} />

          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}
        </div>

        <button type="button" className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters((value) => !value)}>
          <Filter size={17} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-field">
            <label>Category</label>

            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {labelize(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Priority</label>

            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option value="">All Priorities</option>

              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {labelize(priority)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Status</label>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All Statuses</option>

              {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "OVERDUE"].map((status) => (
                <option key={status} value={status}>
                  {labelize(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Assigned To</label>

            <select value={assignedFilter} onChange={(event) => setAssignedFilter(event.target.value)}>
              <option value="">Everyone</option>

              {users.map((user) => (
                <option key={getId(user)} value={getId(user)}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="clear-filter-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      <div className="summary-grid">
        <div className="summary-card total">
          <div className="summary-icon">
            <ListTodo size={20} />
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="summary-card progress-card">
          <div className="summary-icon">
            <RefreshCw size={20} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{summary.progress}</strong>
          </div>
        </div>

        <div className="summary-card completed-card">
          <div className="summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
          </div>
        </div>

        <div className="summary-card overdue-card">
          <div className="summary-icon">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Overdue</span>
            <strong>{summary.overdue}</strong>
          </div>
        </div>

        <div className="summary-card urgent-card">
          <div className="summary-icon">
            <Zap size={20} />
          </div>

          <div>
            <span>Urgent</span>
            <strong>{summary.urgent}</strong>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Task List</h2>

            <span>
              {filteredTasks.length} task
              {filteredTasks.length !== 1 ? "s" : ""} shown
              {selectedFarmObject ? ` · ${selectedFarmObject.name}` : ""}
            </span>
          </div>

          <div className="table-meta">{loadingOptions && <span className="loading-small">Loading options...</span>}</div>
        </div>

        {loading ? (
          <div className="state-box">
            <RefreshCw className="spin" size={28} />
            <strong>Loading tasks...</strong>
            <span>Please wait.</span>
          </div>
        ) : error ? (
          <div className="state-box error-state">
            <AlertCircle size={30} />
            <strong>Unable to load tasks</strong>
            <span>{error}</span>

            <button type="button" className="primary-btn small" onClick={loadTasks}>
              Try Again
            </button>
          </div>
        ) : !selectedFarm ? (
          <div className="state-box">
            <ListTodo size={32} />
            <strong>Select a farm</strong>
            <span>Select a farm above to view its tasks.</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="state-box">
            <ListTodo size={34} />
            <strong>No tasks found</strong>
            <span>Create a new task or change your filters.</span>

            <button type="button" className="primary-btn small" onClick={openCreate}>
              <Plus size={16} />
              Create Task
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>{filteredTasks.map(renderTaskRow)}</tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">TASK MANAGEMENT</span>

                <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>

                <p>{editingTask ? "Update task information and assignment." : "Add a new farm operation task."}</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal} disabled={saving}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitTask}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>
                      Farm <span>*</span>
                    </label>

                    <select value={form.farm} onChange={(event) => handleFormChange("farm", event.target.value)} required>
                      <option value="">Select Farm</option>

                      {farms.map((farm) => (
                        <option key={getId(farm)} value={getId(farm)}>
                          {farm.name} {farm.code ? `(${farm.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Task Title *</label>

                    <input type="text" value={form.title} maxLength={150} onChange={(event) => handleFormChange("title", event.target.value)} placeholder="Enter task title" required />
                  </div>

                  <div className="form-group">
                    <label>Category</label>

                    <select value={form.category} onChange={(event) => handleFormChange("category", event.target.value)}>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {labelize(category)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>

                    <select value={form.priority} onChange={(event) => handleFormChange("priority", event.target.value)}>
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {labelize(priority)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select value={form.status} onChange={(event) => handleFormChange("status", event.target.value)}>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {labelize(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Shed</label>

                    <select value={form.shed} onChange={(event) => handleFormChange("shed", event.target.value)}>
                      <option value="">No Shed</option>

                      {sheds.map((shed) => (
                        <option key={getId(shed)} value={getId(shed)}>
                          {shed.name}
                          {shed.code ? ` (${shed.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Batch</label>

                    <select value={form.batch} onChange={(event) => handleFormChange("batch", event.target.value)}>
                      <option value="">No Batch</option>

                      {batches.map((batch) => (
                        <option key={getId(batch)} value={getId(batch)}>
                          {batch.batchName || batch.batchNumber || "Batch"}
                          {batch.batchNumber && batch.batchName ? ` (${batch.batchNumber})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned To</label>

                    <select value={form.assignedTo} onChange={(event) => handleFormChange("assignedTo", event.target.value)}>
                      <option value="">Unassigned</option>

                      {users.map((user) => (
                        <option key={getId(user)} value={getId(user)}>
                          {user.name || user.email}
                          {user.role ? ` · ${user.role}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Start Date</label>

                    <input type="date" value={form.startDate} onChange={(event) => handleFormChange("startDate", event.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Due Date *</label>

                    <input type="date" value={form.dueDate} onChange={(event) => handleFormChange("dueDate", event.target.value)} required />
                  </div>

                  <div className="form-group full">
                    <label>Description</label>

                    <textarea value={form.description} maxLength={1000} rows={3} onChange={(event) => handleFormChange("description", event.target.value)} placeholder="Describe the task..." />
                  </div>

                  <div className="form-group full recurring-box">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={form.recurringEnabled} onChange={(event) => handleFormChange("recurringEnabled", event.target.checked)} />

                      <span>Make this a recurring task</span>
                    </label>

                    {form.recurringEnabled && (
                      <select value={form.recurringFrequency} onChange={(event) => handleFormChange("recurringFrequency", event.target.value)}>
                        {frequencies.map((frequency) => (
                          <option key={frequency} value={frequency}>
                            {labelize(frequency)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {form.status === "COMPLETED" && (
                    <div className="form-group full">
                      <label>Completion Note</label>

                      <textarea value={form.completionNote} maxLength={1000} rows={3} onChange={(event) => handleFormChange("completionNote", event.target.value)} placeholder="Add completion details..." />
                    </div>
                  )}

                  <div className="form-group full">
                    <label>Notes</label>

                    <textarea value={form.notes} maxLength={1000} rows={3} onChange={(event) => handleFormChange("notes", event.target.value)} placeholder="Additional notes..." />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={closeModal} disabled={saving}>
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
                      <CheckCircle2 size={17} />
                      {editingTask ? "Update Task" : "Create Task"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingTask && (
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">TASK DETAILS</span>

                <h2>{viewingTask.title}</h2>

                <p>Created {formatDateTime(viewingTask.createdAt)}</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTask(null);
                }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-status-row">
                <span className={getStatusClass(viewingTask.status)}>{labelize(viewingTask.status)}</span>

                <span className={getPriorityClass(viewingTask.priority)}>{labelize(viewingTask.priority)}</span>

                <span className="category-badge">{labelize(viewingTask.category)}</span>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span>Farm</span>
                  <strong>{viewingTask.farm?.name || "—"}</strong>
                </div>

                <div className="detail-item">
                  <span>Farm Code</span>
                  <strong>{viewingTask.farm?.code || "—"}</strong>
                </div>

                <div className="detail-item">
                  <span>Shed</span>
                  <strong>{viewingTask.shed?.name || "—"}</strong>
                </div>

                <div className="detail-item">
                  <span>Batch</span>
                  <strong>{viewingTask.batch?.batchName || viewingTask.batch?.batchNumber || "—"}</strong>
                </div>

                <div className="detail-item">
                  <span>Start Date</span>
                  <strong>{formatDate(viewingTask.startDate)}</strong>
                </div>

                <div className="detail-item">
                  <span>Due Date</span>
                  <strong>{formatDate(viewingTask.dueDate)}</strong>
                </div>

                <div className="detail-item">
                  <span>Assigned To</span>
                  <strong>{viewingTask.assignedTo?.name || "Unassigned"}</strong>
                </div>

                <div className="detail-item">
                  <span>Assigned By</span>
                  <strong>{viewingTask.assignedBy?.name || "—"}</strong>
                </div>

                <div className="detail-item">
                  <span>Recurring</span>
                  <strong>{viewingTask.recurring?.enabled ? labelize(viewingTask.recurring.frequency) : "No"}</strong>
                </div>

                <div className="detail-item">
                  <span>Completed At</span>
                  <strong>{formatDateTime(viewingTask.completedAt)}</strong>
                </div>
              </div>

              {viewingTask.description && (
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{viewingTask.description}</p>
                </div>
              )}

              {viewingTask.completionNote && (
                <div className="detail-section">
                  <h3>Completion Note</h3>
                  <p>{viewingTask.completionNote}</p>
                </div>
              )}

              {viewingTask.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p>{viewingTask.notes}</p>
                </div>
              )}

              {Array.isArray(viewingTask.attachments) && viewingTask.attachments.length > 0 && (
                <div className="detail-section">
                  <h3>Attachments</h3>

                  <div className="attachments-list">
                    {viewingTask.attachments.map((attachment, index) => (
                      <a key={`${attachment.publicId || "attachment"}-${index}`} href={attachment.url} target="_blank" rel="noreferrer">
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTask(null);
                }}>
                Close
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setShowViewModal(false);
                  openEdit(viewingTask);
                }}>
                <Pencil size={17} />
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.form-group input[type="date"]{color-scheme:light dark}.admin-theme-light .form-group input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9;cursor:pointer}.farm-tasks-page{padding:24px;min-height:100%;background:var(--admin-bg,#0b1120);color:var(--admin-text,#f8fafc)}.page-header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:22px}.eyebrow{display:inline-flex;align-items:center;gap:7px;color:var(--admin-primary,#60a5fa);font-size:11px;font-weight:800;letter-spacing:.12em;margin-bottom:7px}.page-header h1{margin:0;font-size:28px;font-weight:800;letter-spacing:-.03em}.page-header p{margin:7px 0 0;color:var(--admin-muted,#94a3b8);font-size:14px}.header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,#f8fafc);color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,#f8fafc)}.refresh-action-btn:hover{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,#f8fafc)}.excel-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,#f8fafc)}.pdf-action-btn:hover{background:var(--admin-surface-2,#f8fafc);border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.primary-btn,.secondary-btn,.filter-btn,.clear-filter-btn{height:40px;border-radius:9px;border:1px solid var(--admin-border,#1e293b);display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 14px;font-size:13px;font-weight:700;cursor:pointer;transition:.2s}.primary-btn{background:var(--admin-primary,#2563eb);border-color:var(--admin-primary,#2563eb);color:#fff}.primary-btn:hover{filter:brightness(1.08)}.primary-btn:disabled,.secondary-btn:disabled{opacity:.55;cursor:not-allowed}.secondary-btn{background:var(--admin-surface,#111827);color:var(--admin-text,#f8fafc)}.secondary-btn:hover,.filter-btn:hover{background:var(--admin-surface-2,#172033)}.primary-btn.small{height:36px;padding:0 13px}.control-bar{display:flex;align-items:flex-end;gap:12px;padding:14px;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#1e293b);border-radius:12px;margin-bottom:18px}.farm-selector{width:240px}.farm-selector label,.filter-field label{display:block;font-size:11px;font-weight:700;color:var(--admin-muted,#94a3b8);margin-bottom:6px}.select-wrap{position:relative}.select-wrap select,.filter-field select,.form-group select,.form-group input,.form-group textarea{width:100%;border:1px solid var(--admin-border,#263244);background:var(--admin-surface-2,#172033);color:var(--admin-text,#f8fafc);border-radius:8px;outline:none;font-size:13px}.select-wrap select,.filter-field select,.form-group select,.form-group input{height:40px;padding:0 12px}.select-wrap select{-webkit-appearance:none;appearance:none;padding-right:35px}.select-wrap svg{position:absolute;right:11px;top:12px;pointer-events:none;color:var(--admin-muted,#94a3b8)}.search-box{height:40px;flex:1;display:flex;align-items:center;gap:9px;border:1px solid var(--admin-border,#263244);background:var(--admin-surface-2,#172033);border-radius:8px;padding:0 11px;color:var(--admin-muted,#94a3b8)}.search-box input{flex:1;border:0;outline:0;background:transparent;color:var(--admin-text,#f8fafc);font-size:13px}.search-box input::placeholder{color:#64748b}.search-box button{border:0;background:transparent;color:#64748b;cursor:pointer;padding:2px}.filter-btn{background:var(--admin-surface-2,#172033);color:var(--admin-text,#f8fafc)}.filter-btn.active{border-color:var(--admin-primary,#2563eb);color:#93c5fd}.filters-panel{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:12px;padding:15px;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#1e293b);border-radius:12px;margin-top:-7px;margin-bottom:18px}.filter-field select{height:38px}.clear-filter-btn{align-self:end;height:38px;background:transparent;color:#fca5a5;border-color:#7f1d1d}.summary-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:18px}.summary-card{min-height:92px;border:1px solid var(--admin-border,#1e293b);background:var(--admin-surface,#111827);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px}.summary-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--admin-surface-2,#172033);color:#93c5fd}.summary-card span{display:block;color:var(--admin-muted,#94a3b8);font-size:11px;font-weight:700;margin-bottom:5px}.summary-card strong{display:block;font-size:23px;line-height:1}.pending .summary-icon{color:#fbbf24}.progress-card .summary-icon{color:#60a5fa}.completed-card .summary-icon{color:#4ade80}.overdue-card .summary-icon{color:#f87171}.urgent-card .summary-icon{color:#fb7185}.table-card{border:1px solid var(--admin-border,#1e293b);background:var(--admin-surface,#111827);border-radius:12px;overflow:hidden}.table-header{display:flex;align-items:center;justify-content:space-between;padding:17px 18px;border-bottom:1px solid var(--admin-border,#1e293b)}.table-header h2{margin:0;font-size:16px}.table-header span{display:block;color:var(--admin-muted,#94a3b8);font-size:12px;margin-top:4px}.loading-small{margin:0!important;color:#60a5fa!important}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:1050px}th{padding:12px 14px;text-align:left;font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:#64748b;background:rgba(255,255,255,.015);border-bottom:1px solid var(--admin-border,#1e293b);white-space:nowrap}td{padding:14px;border-bottom:1px solid rgba(148,163,184,.08);vertical-align:middle;font-size:13px}.task-title-cell{display:flex;align-items:flex-start;gap:10px;min-width:220px}.task-icon{width:32px;height:32px;flex:none;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(37,99,235,.12);color:#60a5fa}.task-title-cell strong{display:block;font-size:13px;color:#f8fafc}.task-description{display:block;color:#64748b;font-size:11px;line-height:1.45;margin-top:3px}.category-badge,.priority,.status{display:inline-flex;align-items:center;justify-content:center;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap}.category-badge{background:rgba(148,163,184,.1);color:#cbd5e1}.priority.low{background:rgba(34,197,94,.1);color:#86efac}.priority.medium{background:rgba(59,130,246,.1);color:#93c5fd}.priority.high{background:rgba(249,115,22,.1);color:#fdba74}.priority.urgent{background:rgba(239,68,68,.12);color:#fca5a5}.status.pending{background:rgba(245,158,11,.1);color:#fcd34d}.status.progress{background:rgba(59,130,246,.1);color:#93c5fd}.status.completed{background:rgba(34,197,94,.1);color:#86efac}.status.cancelled{background:rgba(148,163,184,.1);color:#cbd5e1}.status.overdue{background:rgba(239,68,68,.12);color:#fca5a5}.date-cell{display:flex;align-items:center;gap:6px;color:#cbd5e1;white-space:nowrap}.assigned-cell{display:flex;align-items:center;gap:8px}.user-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(96,165,250,.1);color:#93c5fd}.assigned-cell strong{display:block;font-size:12px}.assigned-cell span{display:block;color:#64748b;font-size:10px;margin-top:2px}.muted-text{color:#64748b;font-size:12px}.row-actions{display:flex;align-items:center;gap:6px}.icon-btn{width:32px;height:32px;border-radius:7px;border:1px solid var(--admin-border,#263244);background:var(--admin-surface-2,#172033);display:flex;align-items:center;justify-content:center;cursor:pointer}.icon-btn.view{color:#93c5fd}.icon-btn.edit{color:#fbbf24}.icon-btn.delete{color:#f87171}.icon-btn:hover{filter:brightness(1.18)}.state-box{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;color:#64748b;padding:30px;text-align:center}.state-box strong{color:#cbd5e1;font-size:14px}.state-box span{font-size:12px}.error-state svg{color:#f87171}.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(2,6,23,.76);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px}.modal{width:min(850px,100%);max-height:92vh;background:var(--admin-surface,#111827);border:1px solid var(--admin-border,#263244);border-radius:15px;box-shadow:0 25px 70px rgba(0,0,0,.45);display:flex;flex-direction:column;overflow:hidden;min-height:0}.view-modal{width:min(780px,100%)}.modal-header{display:flex;justify-content:space-between;gap:20px;padding:20px;border-bottom:1px solid var(--admin-border,#1e293b)}.modal-eyebrow{font-size:10px;letter-spacing:.1em;font-weight:800;color:#60a5fa}.modal-header h2{margin:5px 0 0;font-size:20px}.modal-header p{margin:5px 0 0;color:#64748b;font-size:12px}.modal-close{width:34px;height:34px;border-radius:8px;border:1px solid var(--admin-border,#263244);background:var(--admin-surface-2,#172033);color:#94a3b8;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}.modal-body{padding:20px;overflow-y:auto;overflow-x:hidden;flex:1;min-height:0}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.form-group.full{grid-column:1/-1}.form-group label{display:block;margin-bottom:7px;color:#cbd5e1;font-size:12px;font-weight:700}.form-group label span{color:#f87171}.form-group input,.form-group select{box-sizing:border-box}.form-group textarea{display:block;padding:11px 12px;resize:vertical;min-height:85px}.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}.recurring-box{padding:13px;border:1px solid var(--admin-border,#263244);border-radius:9px;background:rgba(255,255,255,.015)}.checkbox-label{display:flex!important;align-items:center;gap:9px;cursor:pointer;margin:0!important}.checkbox-label input{width:16px;height:16px;accent-color:#2563eb}.recurring-box select{margin-top:10px}.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--admin-border,#1e293b)}.modal>form{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.detail-status-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;border:1px solid var(--admin-border,#263244);border-radius:10px;overflow:hidden;background:var(--admin-border,#263244)}.detail-item{background:var(--admin-surface-2,#172033);padding:13px}.detail-item span{display:block;color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}.detail-item strong{font-size:13px;color:#e2e8f0}.detail-section{margin-top:18px;padding:14px;border:1px solid var(--admin-border,#263244);border-radius:9px;background:rgba(255,255,255,.015)}.detail-section h3{margin:0 0 7px;font-size:12px;color:#94a3b8}.detail-section p{margin:0;color:#cbd5e1;font-size:13px;line-height:1.6;white-space:pre-wrap}.attachments-list{display:flex;flex-wrap:wrap;gap:8px}.attachments-list a{display:inline-flex;padding:7px 10px;border-radius:7px;background:rgba(59,130,246,.1);color:#93c5fd;text-decoration:none;font-size:11px;font-weight:700}.spin{animation:taskSpin 1s linear infinite}@keyframes taskSpin{to{transform:rotate(360deg)}}@media(max-width:1200px){.summary-grid{grid-template-columns:repeat(3,1fr)}.filters-panel{grid-template-columns:repeat(2,1fr)}}@media(max-width:800px){.farm-tasks-page{padding:16px}.page-header{align-items:flex-start;flex-direction:column}.header-actions{width:100%}.header-actions button{flex:1}.control-bar{flex-wrap:wrap}.farm-selector{width:100%}.search-box{width:100%;flex:none}.filter-btn{width:100%}.filters-panel{grid-template-columns:1fr}.summary-grid{grid-template-columns:repeat(2,1fr)}.form-grid{grid-template-columns:1fr}.form-group.full{grid-column:auto}.modal-overlay{padding:10px}.modal-header,.modal-body{padding:16px}}@media(max-width:520px){.summary-grid{grid-template-columns:1fr}.page-header h1{font-size:23px}.header-actions{flex-direction:column}.header-actions button{width:100%}.table-header{align-items:flex-start;flex-direction:column;gap:8px}.modal-footer{flex-direction:column-reverse}.modal-footer button{width:100%}.detail-grid{grid-template-columns:1fr}}`}</style>
    </div>
  );
}
