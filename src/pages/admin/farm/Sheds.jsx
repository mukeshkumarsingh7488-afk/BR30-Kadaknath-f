import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, FileText, Plus, RefreshCw, Search, Pencil, Trash2, X, Warehouse } from "lucide-react";
import Swal from "sweetalert2";

import apiRequest from "../../../api/api";
import { showError, showSuccess } from "../../../utils/sweetAlert";

const EMPTY_FORM = {
  farm: "",
  name: "",
  code: "",
  type: "MIXED",
  capacity: "",
  currentBirds: 0,
  location: "",
  description: "",
  status: "ACTIVE",
  lastSanitizedAt: "",
  nextSanitizationAt: "",
  notes: "",
};

const SHED_TYPES = ["BROODING", "GROWER", "LAYER", "BREEDER", "HATCHING", "QUARANTINE", "MIXED"];

const SHED_STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"];

const getData = (response) => response?.data?.data ?? response?.data ?? response ?? [];

const getId = (item) => item?._id ?? item?.id ?? "";

const normalizeFarms = (response) => {
  const data = getData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.farms)) return data.farms;

  return [];
};

const normalizeSheds = (response) => {
  const data = getData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.sheds)) return data.sheds;

  return [];
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

const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getStatusLabel = (status) => {
  if (status === "ACTIVE") return "Active";
  if (status === "INACTIVE") return "Inactive";
  if (status === "MAINTENANCE") return "Maintenance";

  return status || "-";
};

const getTypeLabel = (type) => {
  if (!type) return "-";

  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Sheds() {
  const [farms, setFarms] = useState([]);
  const [sheds, setSheds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingShed, setEditingShed] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = async () => {
    try {
      setLoading(true);

      const [farmResponse, shedResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/sheds")]);

      setFarms(normalizeFarms(farmResponse));
      setSheds(normalizeSheds(shedResponse));
    } catch (error) {
      console.error("Load sheds error:", error);
      showError(error?.message || "Failed to load sheds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSheds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sheds.filter((shed) => {
      const farmId = typeof shed.farm === "object" ? getId(shed.farm) : shed.farm;

      const matchesFarm = !farmFilter || String(farmId) === String(farmFilter);

      const matchesStatus = !statusFilter || shed.status === statusFilter;

      const matchesSearch = !query || shed.name?.toLowerCase().includes(query) || shed.code?.toLowerCase().includes(query) || shed.location?.toLowerCase().includes(query) || shed.farm?.name?.toLowerCase().includes(query);

      return matchesFarm && matchesStatus && matchesSearch;
    });
  }, [sheds, search, farmFilter, statusFilter]);

  const activeCount = sheds.filter((shed) => shed.status === "ACTIVE").length;

  const maintenanceCount = sheds.filter((shed) => shed.status === "MAINTENANCE").length;

  const totalCapacity = sheds.reduce((total, shed) => total + Number(shed.capacity || 0), 0);

  const totalBirds = sheds.reduce((total, shed) => total + Number(shed.currentBirds || 0), 0);

  const openCreateModal = () => {
    setEditingShed(null);

    setForm({
      ...EMPTY_FORM,
      farm: farmFilter || (farms.length === 1 ? getId(farms[0]) : ""),
    });

    setShowModal(true);
  };

  const openEditModal = (shed) => {
    setEditingShed(shed);

    setForm({
      farm: getId(shed.farm),
      name: shed.name || "",
      code: shed.code || "",
      type: shed.type || "MIXED",
      capacity: shed.capacity ?? "",
      currentBirds: shed.currentBirds ?? 0,
      location: shed.location || "",
      description: shed.description || "",
      status: shed.status || "ACTIVE",
      lastSanitizedAt: formatDateTimeLocal(shed.lastSanitizedAt),
      nextSanitizationAt: formatDateTimeLocal(shed.nextSanitizationAt),
      notes: shed.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingShed(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.farm) {
      showError("Please select a farm");
      return;
    }

    if (!form.name.trim()) {
      showError("Shed name is required");
      return;
    }

    if (!form.code.trim()) {
      showError("Shed code is required");
      return;
    }

    if (form.capacity === "" || Number(form.capacity) < 0) {
      showError("Please enter a valid capacity");
      return;
    }

    if (form.currentBirds === "" || Number(form.currentBirds) < 0) {
      showError("Please enter valid current birds");
      return;
    }

    if (Number(form.currentBirds) > Number(form.capacity)) {
      showError("Current birds cannot exceed shed capacity");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        farm: form.farm,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        type: form.type,
        capacity: Number(form.capacity),
        currentBirds: Number(form.currentBirds || 0),
        location: form.location.trim(),
        description: form.description.trim(),
        status: form.status,
        lastSanitizedAt: form.lastSanitizedAt ? new Date(form.lastSanitizedAt).toISOString() : null,
        nextSanitizationAt: form.nextSanitizationAt ? new Date(form.nextSanitizationAt).toISOString() : null,
        notes: form.notes.trim(),
      };

      if (editingShed) {
        await apiRequest(`/sheds/${getId(editingShed)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        showSuccess("Shed updated successfully");
      } else {
        await apiRequest("/sheds", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess("Shed created successfully");
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error("Save shed error:", error);
      showError(error?.message || "Failed to save shed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (shed) => {
    const result = await Swal.fire({
      title: "Delete Shed?",
      html: `
        <div style="text-align:center;">
          <strong>${shed.name || "This shed"}</strong>
          <br />
          <span style="color:#64748b;">
            ${shed.code || ""}
          </span>
          <br /><br />
          <span>This action cannot be undone.</span>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(getId(shed));

      await apiRequest(`/sheds/${getId(shed)}`, {
        method: "DELETE",
      });

      showSuccess("Shed deleted successfully");
      await loadData();
    } catch (error) {
      console.error("Delete shed error:", error);
      showError(error?.message || "Failed to delete shed");
    } finally {
      setDeletingId("");
    }
  };

  const exportExcel = () => {
    if (!filteredSheds.length) return;

    const headers = ["Shed Name", "Code", "Farm", "Type", "Capacity", "Current Birds", "Status", "Location", "Last Sanitized", "Next Sanitization"];

    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredSheds.map((shed) => [shed.name, shed.code, shed.farm?.name || "", getTypeLabel(shed.type), shed.capacity ?? 0, shed.currentBirds ?? 0, getStatusLabel(shed.status), shed.location || "", formatDate(shed.lastSanitizedAt), formatDate(shed.nextSanitizationAt)]);

    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");

    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sheds.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!filteredSheds.length) return;

    const rows = filteredSheds
      .map(
        (shed) => `
          <tr>
            <td>${shed.name || "-"}</td>
            <td>${shed.code || "-"}</td>
            <td>${shed.farm?.name || "-"}</td>
            <td>${getTypeLabel(shed.type)}</td>
            <td>${shed.capacity ?? 0}</td>
            <td>${shed.currentBirds ?? 0}</td>
            <td>${getStatusLabel(shed.status)}</td>
            <td>${shed.location || "-"}</td>
            <td>${formatDate(shed.lastSanitizedAt)}</td>
            <td>${formatDate(shed.nextSanitizationAt)}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      showError("Please allow pop-ups to export PDF");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sheds Report</title>
          <style>
            body{font-family:Arial,sans-serif;padding:25px;color:#111}
            h1{margin:0 0 6px;font-size:24px}
            p{margin:0 0 20px;color:#666}
            table{width:100%;border-collapse:collapse;font-size:11px}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background:#f1f5f9}
          </style>
        </head>
        <body>
          <h1>Shed Management Report</h1>
          <p>BR30 Kadaknath Farms</p>
          <table>
            <thead>
              <tr>
                <th>Shed</th>
                <th>Code</th>
                <th>Farm</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Birds</th>
                <th>Status</th>
                <th>Location</th>
                <th>Last Sanitized</th>
                <th>Next Sanitization</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
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
    <div className="sheds-page">
      <div className="sheds-container">
        <div className="sheds-header">
          <div>
            <div className="sheds-title-row">
              <div className="sheds-title-icon">
                <Warehouse size={22} />
              </div>

              <div>
                <h1>Shed Management</h1>
                <p>Manage farm sheds, capacity, birds and sanitization details.</p>
              </div>
            </div>
          </div>

          <div className="sheds-header-actions">
            <button type="button" className="top-action-btn refresh-action-btn" onClick={loadData} disabled={loading} title="Refresh" aria-label="Refresh">
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>

            <button type="button" className="top-action-btn excel-action-btn" onClick={exportExcel} disabled={!filteredSheds.length} title="Export Excel">
              <FileSpreadsheet size={17} />
              Excel
            </button>

            <button type="button" className="top-action-btn pdf-action-btn" onClick={exportPdf} disabled={!filteredSheds.length} title="Export PDF">
              <FileText size={17} />
              PDF
            </button>

            <button type="button" className="top-action-btn add-action-btn" onClick={openCreateModal}>
              <Plus size={18} />
              Create Shed
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span>Total Sheds</span>
            <strong>{sheds.length}</strong>
          </div>

          <div className="summary-card">
            <span>Active Sheds</span>
            <strong>{activeCount}</strong>
          </div>

          <div className="summary-card">
            <span>Maintenance</span>
            <strong>{maintenanceCount}</strong>
          </div>

          <div className="summary-card">
            <span>Total Capacity</span>
            <strong>{totalCapacity}</strong>
          </div>

          <div className="summary-card">
            <span>Current Birds</span>
            <strong>{totalBirds}</strong>
          </div>
        </div>

        <div className="filters-card">
          <div className="search-box">
            <Search size={17} />

            <input type="text" placeholder="Search shed, code, location..." value={search} onChange={(event) => setSearch(event.target.value)} />

            {search && (
              <button type="button" className="search-clear-btn" onClick={() => setSearch("")} title="Clear search" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <select value={farmFilter} onChange={(event) => setFarmFilter(event.target.value)}>
            <option value="">All Farms</option>

            {farms.map((farm) => (
              <option key={getId(farm)} value={getId(farm)}>
                {farm.name} {farm.code ? `(${farm.code})` : ""}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All Status</option>

            {SHED_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="table-card">
          <div className="table-top">
            <div>
              <h2>Sheds</h2>
              <span>
                Showing {filteredSheds.length} of {sheds.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <p>Loading sheds...</p>
            </div>
          ) : filteredSheds.length === 0 ? (
            <div className="empty-state">
              <Warehouse size={38} />
              <h3>No sheds found</h3>
              <p>Create your first shed to start managing farm capacity.</p>

              <button type="button" className="primary-btn" onClick={openCreateModal}>
                <Plus size={17} />
                Create Shed
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Shed</th>
                    <th>Farm</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Birds</th>
                    <th>Status</th>
                    <th>Sanitization</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSheds.map((shed) => (
                    <tr key={getId(shed)}>
                      <td>
                        <div className="shed-name">
                          <strong>{shed.name}</strong>
                          <span>{shed.code}</span>
                        </div>
                      </td>

                      <td>
                        <div className="farm-name">
                          <strong>{shed.farm?.name || "-"}</strong>
                          <span>{shed.farm?.code || ""}</span>
                        </div>
                      </td>

                      <td>{getTypeLabel(shed.type)}</td>

                      <td>{shed.capacity ?? 0}</td>

                      <td>
                        <div className="bird-count">
                          <strong>{shed.currentBirds ?? 0}</strong>
                          <span>/ {shed.capacity ?? 0}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`status-badge status-${String(shed.status || "").toLowerCase()}`}>{getStatusLabel(shed.status)}</span>
                      </td>

                      <td>
                        <div className="sanitization-cell">
                          <span>Last: {formatDate(shed.lastSanitizedAt)}</span>

                          <span>Next: {formatDate(shed.nextSanitizationAt)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button type="button" className="icon-btn edit-btn" title="Edit Shed" onClick={() => openEditModal(shed)}>
                            <Pencil size={16} />
                          </button>

                          <button type="button" className="icon-btn delete-btn" title="Delete Shed" disabled={deletingId === getId(shed)} onClick={() => handleDelete(shed)}>
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
      </div>

      {showModal && (
        <div className="shed-modal-overlay">
          <div className="shed-modal">
            <div className="shed-modal-header">
              <div>
                <h2>{editingShed ? "Edit Shed" : "Create Shed"}</h2>

                <p>{editingShed ? "Update shed information" : "Add a new shed to your farm"}</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal} disabled={saving}>
                <X size={20} />
              </button>
            </div>

            <form className="shed-form" onSubmit={handleSubmit}>
              <div className="shed-modal-body">
                <div className="form-section">
                  <h3>Basic Information</h3>

                  <div className="form-grid">
                    <div className="form-group full">
                      <label>
                        Farm <span>*</span>
                      </label>

                      <select name="farm" value={form.farm} onChange={handleChange} required>
                        <option value="">Select Farm</option>

                        {farms.map((farm) => (
                          <option key={getId(farm)} value={getId(farm)}>
                            {farm.name} {farm.code ? `(${farm.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Shed Name <span>*</span>
                      </label>

                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Example: Shed 01" maxLength={100} required />
                    </div>

                    <div className="form-group">
                      <label>
                        Shed Code <span>*</span>
                      </label>

                      <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="Example: SHD-001" maxLength={30} required />
                    </div>

                    <div className="form-group">
                      <label>Shed Type</label>

                      <select name="type" value={form.type} onChange={handleChange}>
                        {SHED_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {getTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status</label>

                      <select name="status" value={form.status} onChange={handleChange}>
                        {SHED_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Capacity & Birds</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Capacity <span>*</span>
                      </label>

                      <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="0" placeholder="Example: 500" required />
                    </div>

                    <div className="form-group">
                      <label>Current Birds</label>

                      <input type="number" name="currentBirds" value={form.currentBirds} onChange={handleChange} min="0" placeholder="Example: 100" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Location & Description</h3>

                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Location</label>

                      <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Example: North side of farm" maxLength={150} />
                    </div>

                    <div className="form-group full">
                      <label>Description</label>

                      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter shed description..." rows="3" maxLength={500} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Sanitization</h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Last Sanitized</label>

                      <input type="datetime-local" name="lastSanitizedAt" value={form.lastSanitizedAt} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label>Next Sanitization</label>

                      <input type="datetime-local" name="nextSanitizationAt" value={form.nextSanitizationAt} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Notes</h3>

                  <div className="form-group">
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Add any additional notes..." rows="4" maxLength={500} />
                  </div>
                </div>
              </div>

              <div className="shed-modal-footer">
                <button type="button" className="secondary-btn" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Saving..." : editingShed ? "Update Shed" : "Create Shed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.sheds-page{width:100%;min-height:100%;background:var(--admin-bg);color:var(--admin-text);padding:24px;box-sizing:border-box}.sheds-container{width:100%;max-width:1500px;margin:0 auto;padding-bottom:50px}.sheds-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:24px}.sheds-title-row{display:flex;align-items:center;gap:13px}.sheds-title-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(34,197,94,.12);color:#22c55e;flex:0 0 auto}.sheds-header h1{margin:0;font-size:25px;line-height:1.2}.sheds-header p{margin:6px 0 0;color:var(--admin-muted);font-size:14px}.sheds-header-actions{display:flex;align-items:center;gap:7px;position:relative;z-index:3}.top-action-btn{height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-border,#e4e8ef);border-radius:9px;padding:0 12px;background:var(--admin-surface-2,var(--admin-bg));color:var(--admin-text,#172033);font-size:12px;font-weight:700;cursor:pointer;transition:.2s ease;white-space:nowrap}.top-action-btn:hover{transform:translateY(-1px)}.top-action-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.refresh-action-btn{width:40px;padding:0;color:var(--admin-text,#172033);border-color:var(--admin-border,#e4e8ef);background:var(--admin-surface-2,var(--admin-bg))}.refresh-action-btn:hover:not(:disabled){background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.excel-action-btn{color:#65a30d;border-color:#84cc16;background:var(--admin-surface-2,var(--admin-bg))}.excel-action-btn:hover{background:var(--admin-surface-2,var(--admin-bg));border-color:#166534;color:#166534}.pdf-action-btn{color:#ef4444;border-color:#f87171;background:var(--admin-surface-2,var(--admin-bg))}.pdf-action-btn:hover{background:var(--admin-surface-2,var(--admin-bg));border-color:#b91c1c;color:#b91c1c}.add-action-btn{background:var(--admin-primary,#4f46e5);border-color:var(--admin-primary,#4f46e5);color:#fff}.add-action-btn:hover{background:#4338ca;border-color:#4338ca;color:#fff}.spin{animation:shedSpin 1s linear infinite}.primary-btn,.secondary-btn{height:42px;padding:0 16px;border-radius:9px;border:1px solid transparent;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:600;cursor:pointer;transition:.2s}.primary-btn{background:#22c55e;color:#fff;border-color:#22c55e}.primary-btn:hover{background:#16a34a;border-color:#16a34a}.primary-btn:disabled,.secondary-btn:disabled{opacity:.6;cursor:not-allowed}.secondary-btn{background:var(--admin-surface);color:var(--admin-text);border-color:var(--admin-border)}.secondary-btn:hover{background:var(--admin-bg)}.summary-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-bottom:20px}.summary-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;padding:18px;min-width:0}.summary-card span{display:block;color:var(--admin-muted);font-size:13px;margin-bottom:8px}.summary-card strong{font-size:24px;line-height:1}.filters-card{display:flex;align-items:center;gap:12px;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;padding:14px;margin-bottom:18px}.search-box{height:42px;flex:1;min-width:220px;display:flex;align-items:center;gap:9px;padding:0 10px 0 12px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-muted)}.search-box input{width:100%;border:0;outline:0;background:transparent;color:var(--admin-text);font-size:14px;padding:0}.search-clear-btn{width:28px;height:28px;flex:0 0 28px;border:0;border-radius:7px;background:transparent;color:var(--admin-muted);display:grid;place-items:center;cursor:pointer;padding:0;transition:.2s ease}.search-clear-btn:hover{background:var(--admin-border);color:var(--admin-text)}.filters-card select{height:42px;min-width:160px;padding:0 12px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-bg);color:var(--admin-text);outline:0}.table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden}.table-top{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--admin-border)}.table-top h2{margin:0;font-size:17px}.table-top span{display:block;margin-top:4px;color:var(--admin-muted);font-size:12px}.table-wrapper{width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:1050px}th{padding:13px 16px;text-align:left;font-size:12px;font-weight:700;color:var(--admin-muted);background:var(--admin-bg);border-bottom:1px solid var(--admin-border);white-space:nowrap}td{padding:14px 16px;border-bottom:1px solid var(--admin-border);font-size:13px;vertical-align:middle}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:rgba(127,127,127,.04)}.shed-name,.farm-name{display:flex;flex-direction:column;gap:3px}.shed-name strong,.farm-name strong{font-size:13px}.shed-name span,.farm-name span{font-size:11px;color:var(--admin-muted)}.bird-count{display:flex;align-items:baseline;gap:3px}.bird-count span{font-size:11px;color:var(--admin-muted)}.status-badge{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}.status-active{background:rgba(34,197,94,.12);color:#16a34a}.status-inactive{background:rgba(100,116,139,.14);color:#64748b}.status-maintenance{background:rgba(245,158,11,.14);color:#d97706}.sanitization-cell{display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--admin-muted);white-space:nowrap}.action-buttons{display:flex;align-items:center;gap:7px}.icon-btn{width:34px;height:34px;border:1px solid var(--admin-border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--admin-bg)}.edit-btn{color:#2563eb}.delete-btn{color:#dc2626}.icon-btn:hover{background:var(--admin-surface)}.icon-btn:disabled{opacity:.5;cursor:not-allowed}.empty-state{min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;color:var(--admin-muted)}.empty-state h3{margin:12px 0 5px;color:var(--admin-text);font-size:17px}.empty-state p{margin:0 0 18px;font-size:13px}.loader{width:28px;height:28px;border:3px solid var(--admin-border);border-top-color:#22c55e;border-radius:50%;animation:shedSpin .8s linear infinite}@keyframes shedSpin{to{transform:rotate(360deg)}}.shed-modal-overlay{position:fixed;inset:0;z-index:9999;padding:20px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);overflow-y:auto;box-sizing:border-box}.shed-modal{width:100%;max-width:780px;height:calc(100vh - 40px);max-height:calc(100vh - 40px);display:flex;flex-direction:column;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden;box-shadow:0 20px 70px rgba(0,0,0,.35);box-sizing:border-box}.shed-modal-header{flex:0 0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:20px;border-bottom:1px solid var(--admin-border)}.shed-modal-header h2{margin:0;font-size:19px}.shed-modal-header p{margin:5px 0 0;color:var(--admin-muted);font-size:12px}.modal-close{width:36px;height:36px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-bg);color:var(--admin-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto}.shed-form{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden}.shed-modal-body{flex:1 1 auto;min-height:0;padding:20px;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;-webkit-overflow-scrolling:touch}.form-section{padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--admin-border)}.form-section:last-child{padding-bottom:0;margin-bottom:0;border-bottom:0}.form-section h3{margin:0 0 14px;font-size:14px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.form-group{display:flex;flex-direction:column;gap:7px;min-width:0}.form-group.full{grid-column:1/-1}.form-group label{font-size:12px;font-weight:600;color:var(--admin-muted)}.form-group label span{color:#ef4444}.form-group input,.form-group select,.form-group textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-bg);color:var(--admin-text);outline:0;font-size:13px;padding:10px 11px;font-family:inherit}.form-group input,.form-group select{height:42px}.form-group textarea{resize:vertical;min-height:90px}.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.1)}.form-group input[type="datetime-local"],.form-group input[type="date"]{color-scheme:light dark}.form-group input[type="datetime-local"]::-webkit-calendar-picker-indicator,.form-group input[type="date"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.9}.admin-theme-light .form-group input[type="datetime-local"]::-webkit-calendar-picker-indicator,.admin-theme-light .form-group input[type="date"]::-webkit-calendar-picker-indicator{filter:brightness(0) saturate(100%) invert(55%);opacity:.9}.shed-modal-footer{flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid var(--admin-border);background:var(--admin-surface)}@media (max-width:1000px){.summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:700px){.sheds-page{padding:15px}.sheds-header{align-items:flex-start;flex-direction:column}.sheds-header-actions{width:100%;display:grid;grid-template-columns:40px 1fr 1fr}.sheds-header-actions .add-action-btn{grid-column:1/-1;width:100%}.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters-card{flex-direction:column;align-items:stretch}.search-box{min-width:0}.filters-card select{width:100%}.form-grid{grid-template-columns:1fr}.form-group.full{grid-column:auto}.shed-modal-overlay{padding:10px}.shed-modal{height:calc(100vh - 20px);max-height:calc(100vh - 20px)}.shed-modal-header,.shed-modal-body{padding:15px}.shed-modal-footer{padding:12px 15px}.shed-modal-footer .primary-btn,.shed-modal-footer .secondary-btn{flex:1}}@media (max-width:430px){.summary-grid{grid-template-columns:1fr}.sheds-title-row{align-items:flex-start}.sheds-header h1{font-size:21px}.sheds-header-actions{grid-template-columns:40px 1fr}.sheds-header-actions .pdf-action-btn{grid-column:2}.sheds-header-actions .add-action-btn{grid-column:1/-1}}`}</style>
    </div>
  );
}
