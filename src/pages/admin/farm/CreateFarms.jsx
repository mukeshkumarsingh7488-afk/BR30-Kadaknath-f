import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Edit3, MapPin, Plus, RefreshCw, Search, Trash2, UserRound, X } from "lucide-react";

import apiRequest from "../../../api/api";
import { showConfirm, showError, showSuccess } from "../../../utils/sweetAlert";

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  manager: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  status: "active",
};

const normalizeFarms = (response) => {
  if (!response) return [];

  const possibleData = response?.data?.farms || response?.data?.items || response?.farms || response?.items;

  if (Array.isArray(possibleData)) {
    return possibleData;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const normalizeManagers = (response) => {
  if (!response) return [];

  const possibleData = response?.data?.users || response?.data?.staff || response?.data?.items || response?.users || response?.staff || response?.items;

  if (Array.isArray(possibleData)) {
    return possibleData;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const getId = (item) => item?._id || item?.id || "";

const getManagerName = (manager) => {
  if (!manager) return "Not assigned";

  if (typeof manager === "string") {
    return manager;
  }

  return manager.name || manager.email || "Not assigned";
};

const getStatusLabel = (status) => {
  if (!status) return "Active";

  return String(status).charAt(0).toUpperCase() + String(status).slice(1);
};

export default function Farms() {
  const navigate = useNavigate();

  const [farms, setFarms] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = async () => {
    try {
      setLoading(true);

      const [farmResponse, managerResponse] = await Promise.all([apiRequest("/farms"), apiRequest("/admin/users/staff")]);

      setFarms(normalizeFarms(farmResponse));
      setManagers(normalizeManagers(managerResponse));
    } catch (error) {
      console.error("Farm load error:", error);
      showError(error?.message || "Unable to load farms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Farm Management | BR30 Kadaknath Farms";
    loadData();
  }, []);

  const filteredFarms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return farms.filter((farm) => {
      const matchesSearch =
        !keyword ||
        String(farm?.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(farm?.code || "")
          .toLowerCase()
          .includes(keyword) ||
        String(farm?.city || "")
          .toLowerCase()
          .includes(keyword) ||
        String(farm?.state || "")
          .toLowerCase()
          .includes(keyword);

      const farmStatus = String(farm?.status || "active").toLowerCase();

      const matchesStatus = statusFilter === "all" || farmStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [farms, search, statusFilter]);

  const openCreateModal = () => {
    setEditingFarm(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);

    setForm({
      name: farm?.name || "",
      code: farm?.code || "",
      description: farm?.description || "",
      manager: typeof farm?.manager === "object" ? farm?.manager?._id || "" : farm?.manager || "",
      address: farm?.address || "",
      city: farm?.city || "",
      state: farm?.state || "",
      pincode: farm?.pincode || "",
      latitude: farm?.latitude !== undefined && farm?.latitude !== null ? String(farm.latitude) : "",
      longitude: farm?.longitude !== undefined && farm?.longitude !== null ? String(farm.longitude) : "",
      status: farm?.status || "active",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingFarm(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showError("Farm name is required.");
      return;
    }

    if (!form.code.trim()) {
      showError("Farm code is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
        manager: form.manager || null,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        status: form.status || "active",
      };

      if (form.latitude !== "") {
        payload.latitude = Number(form.latitude);
      }

      if (form.longitude !== "") {
        payload.longitude = Number(form.longitude);
      }

      if (editingFarm) {
        const farmId = getId(editingFarm);

        await apiRequest(`/farms/${farmId}`, {
          method: "PUT",
          body: payload,
        });

        showSuccess("Farm updated successfully.");
      } else {
        await apiRequest("/farms", {
          method: "POST",
          body: payload,
        });

        showSuccess("Farm created successfully.");
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error("Farm save error:", error);
      showError(error?.message || "Unable to save farm.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (farm) => {
    const farmId = getId(farm);

    if (!farmId) {
      showError("Farm ID not found.");
      return;
    }

    const result = await showConfirm({
      title: "Delete Farm?",
      text: `Are you sure you want to delete "${farm?.name || "this farm"}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(`/farms/${farmId}`, {
        method: "DELETE",
      });

      showSuccess("Farm deleted successfully.");
      await loadData();
    } catch (error) {
      console.error("Farm delete error:", error);
      showError(error?.message || "Unable to delete farm.");
    }
  };

  return (
    <div className="farms-page">
      <div className="farms-container">
        <div className="farms-header">
          <div className="farms-header-left">
            <button type="button" className="icon-button" onClick={() => navigate("/admin/farm-dashboard")} title="Back to Farm Dashboard">
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="page-title-row">
                <Building2 size={22} />
                <h1>Farm Management</h1>
              </div>

              <p>Create and manage your BR30 Kadaknath Farms locations.</p>
            </div>
          </div>

          <div className="farms-header-actions">
            <button type="button" className="secondary-button" onClick={loadData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              Refresh
            </button>

            <button type="button" className="primary-button" onClick={openCreateModal}>
              <Plus size={17} />
              Create Farm
            </button>
          </div>
        </div>

        <div className="farm-summary-grid">
          <div className="summary-card">
            <span>Total Farms</span>
            <strong>{farms.length}</strong>
          </div>

          <div className="summary-card">
            <span>Active</span>
            <strong>{farms.filter((farm) => String(farm?.status || "active").toLowerCase() === "active").length}</strong>
          </div>

          <div className="summary-card">
            <span>Inactive</span>
            <strong>{farms.filter((farm) => String(farm?.status || "active").toLowerCase() === "inactive").length}</strong>
          </div>

          <div className="summary-card">
            <span>Showing</span>
            <strong>{filteredFarms.length}</strong>
          </div>
        </div>

        <div className="farms-toolbar">
          <div className="search-box">
            <Search size={17} />

            <input type="text" placeholder="Search farm, code, city..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>

          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="farms-card">
          {loading ? (
            <div className="farms-empty">
              <RefreshCw size={26} className="spin" />
              <strong>Loading farms...</strong>
              <span>Please wait.</span>
            </div>
          ) : filteredFarms.length === 0 ? (
            <div className="farms-empty">
              <Building2 size={34} />

              <strong>{farms.length === 0 ? "No Farm Created Yet" : "No Farm Found"}</strong>

              <span>{farms.length === 0 ? "Create your first farm to start using Farm OS." : "Try changing your search or status filter."}</span>

              {farms.length === 0 && (
                <button type="button" className="primary-button" onClick={openCreateModal}>
                  <Plus size={17} />
                  Create First Farm
                </button>
              )}
            </div>
          ) : (
            <div className="farm-table-wrap">
              <table className="farm-table">
                <thead>
                  <tr>
                    <th>Farm</th>
                    <th>Code</th>
                    <th>Manager</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFarms.map((farm) => {
                    const farmId = getId(farm);
                    const status = String(farm?.status || "active").toLowerCase();

                    return (
                      <tr key={farmId}>
                        <td>
                          <div className="farm-name-cell">
                            <div className="farm-icon">
                              <Building2 size={18} />
                            </div>

                            <div>
                              <strong>{farm?.name || "Unnamed Farm"}</strong>

                              {farm?.description && <span>{farm.description}</span>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge">{farm?.code || "-"}</span>
                        </td>

                        <td>
                          <div className="manager-cell">
                            <UserRound size={15} />
                            <span>{getManagerName(farm?.manager)}</span>
                          </div>
                        </td>

                        <td>
                          <div className="location-cell">
                            <MapPin size={15} />

                            <span>{[farm?.city, farm?.state].filter(Boolean).join(", ") || "Not specified"}</span>
                          </div>
                        </td>

                        <td>
                          <span className={`status-badge ${status === "active" ? "status-active" : "status-inactive"}`}>{getStatusLabel(status)}</span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button type="button" className="table-action edit" onClick={() => openEditModal(farm)} title="Edit Farm">
                              <Edit3 size={15} />
                            </button>

                            <button type="button" className="table-action delete" onClick={() => handleDelete(farm)} title="Delete Farm">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="farm-modal-overlay" onMouseDown={closeModal}>
          <div className="farm-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="farm-modal-header">
              <div>
                <h2>{editingFarm ? "Edit Farm" : "Create Farm"}</h2>

                <p>{editingFarm ? "Update farm information." : "Add a new farm to Farm OS."}</p>
              </div>

              <button type="button" className="modal-close" onClick={closeModal} disabled={saving}>
                <X size={19} />
              </button>
            </div>

            <form className="farm-form" onSubmit={handleSubmit}>
              <div className="farm-modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      Farm Name <span>*</span>
                    </label>

                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. BR30 Main Farm" required />
                  </div>

                  <div className="form-field">
                    <label>
                      Farm Code <span>*</span>
                    </label>

                    <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="e.g. BR30-MAIN" required />
                  </div>

                  <div className="form-field full-width">
                    <label>Description</label>

                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description about this farm..." rows={3} />
                  </div>

                  <div className="form-field">
                    <label>Manager</label>

                    <select name="manager" value={form.manager} onChange={handleChange}>
                      <option value="">No Manager</option>

                      {managers.map((manager) => {
                        const managerId = getId(manager);

                        return (
                          <option key={managerId} value={managerId}>
                            {manager?.name || manager?.email || "Staff"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Status</label>

                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-field full-width">
                    <label>Address</label>

                    <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Farm address" />
                  </div>

                  <div className="form-field">
                    <label>City</label>

                    <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" />
                  </div>

                  <div className="form-field">
                    <label>State</label>

                    <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="State" />
                  </div>

                  <div className="form-field">
                    <label>Pincode</label>

                    <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />
                  </div>

                  <div className="form-field">
                    <label>Latitude</label>

                    <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} placeholder="e.g. 23.2599" />
                  </div>

                  <div className="form-field">
                    <label>Longitude</label>

                    <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} placeholder="e.g. 77.4126" />
                  </div>
                </div>
              </div>

              <div className="farm-modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      {editingFarm ? "Update Farm" : "Create Farm"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
.farms-page { width: 100%; min-height: 100%; background: var(--admin-bg); color: var(--admin-text); padding: 24px; box-sizing: border-box; }
.farms-container { width: 100%; max-width: 1500px; margin: 0 auto; padding-bottom: 50px; }
.farms-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.farms-header-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.page-title-row { display: flex; align-items: center; gap: 9px; }
.page-title-row svg { color: var(--admin-primary); flex-shrink: 0; }
.page-title-row h1 { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 750; }
.farms-header p { margin: 6px 0 0; color: var(--admin-muted); font-size: 13px; }
.icon-button, .modal-close { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--admin-border); background: var(--admin-surface); color: var(--admin-text); cursor: pointer; transition: 0.2s ease; }
.icon-button { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; }
.icon-button:hover, .modal-close:hover { border-color: var(--admin-primary); color: var(--admin-primary); }
.farms-header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.primary-button, .secondary-button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 9px; padding: 0 14px; font-size: 13px; font-weight: 650; cursor: pointer; transition: 0.2s ease; white-space: nowrap; }
.primary-button { border: 1px solid var(--admin-primary); background: var(--admin-primary); color: #fff; }
.primary-button:hover { opacity: 0.9; transform: translateY(-1px); }
.secondary-button { border: 1px solid var(--admin-border); background: var(--admin-surface); color: var(--admin-text); }
.secondary-button:hover { border-color: var(--admin-primary); color: var(--admin-primary); }
.primary-button:disabled, .secondary-button:disabled, .modal-close:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.farm-summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.summary-card { border: 1px solid var(--admin-border); background: var(--admin-surface); border-radius: 12px; padding: 17px; }
.summary-card span { display: block; color: var(--admin-muted); font-size: 12px; margin-bottom: 7px; }
.summary-card strong { display: block; font-size: 23px; line-height: 1; }
.farms-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.search-box { flex: 1; max-width: 520px; height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--admin-border); background: var(--admin-surface); border-radius: 9px; box-sizing: border-box; }
.search-box svg { color: var(--admin-muted); flex-shrink: 0; }
.search-box input { width: 100%; height: 100%; border: 0; outline: 0; background: transparent; color: var(--admin-text); font-size: 13px; }
.search-box input::placeholder { color: var(--admin-muted); }
.filter-select, .form-field select, .form-field input, .form-field textarea { border: 1px solid var(--admin-border); background: var(--admin-surface); color: var(--admin-text); outline: none; transition: 0.2s ease; }
.filter-select { height: 40px; min-width: 140px; border-radius: 9px; padding: 0 11px; font-size: 13px; box-sizing: border-box; }
.filter-select:focus, .form-field select:focus, .form-field input:focus, .form-field textarea:focus, .search-box:focus-within { border-color: var(--admin-primary); }
.farms-card { border: 1px solid var(--admin-border); background: var(--admin-surface); border-radius: 13px; overflow: hidden; }
.farm-table-wrap { width: 100%; overflow-x: auto; }
.farm-table { width: 100%; min-width: 900px; border-collapse: collapse; }
.farm-table th { padding: 13px 16px; text-align: left; background: var(--admin-surface-2); color: var(--admin-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.farm-table td { padding: 14px 16px; border-top: 1px solid var(--admin-border); vertical-align: middle; font-size: 13px; }
.farm-table tbody tr:hover { background: var(--admin-surface-2); }
.farm-name-cell { display: flex; align-items: center; gap: 11px; min-width: 220px; }
.farm-icon { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 9px; background: var(--admin-surface-2); color: var(--admin-primary); flex-shrink: 0; }
.farm-name-cell strong { display: block; font-size: 13px; font-weight: 700; }
.farm-name-cell span { display: block; max-width: 260px; margin-top: 3px; color: var(--admin-muted); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.code-badge { display: inline-flex; align-items: center; padding: 5px 8px; border-radius: 6px; background: var(--admin-surface-2); color: var(--admin-text); font-size: 11px; font-weight: 700; }
.manager-cell, .location-cell { display: flex; align-items: center; gap: 7px; color: var(--admin-muted); white-space: nowrap; }
.manager-cell svg, .location-cell svg { color: var(--admin-primary); flex-shrink: 0; }
.status-badge { display: inline-flex; align-items: center; padding: 5px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.status-active { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
.status-inactive { background: rgba(239, 68, 68, 0.12); color: var(--admin-danger); }
.action-buttons { display: flex; align-items: center; gap: 7px; }
.table-action { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--admin-border); background: var(--admin-surface); cursor: pointer; transition: 0.2s ease; }
.table-action.edit { color: var(--admin-primary); }
.table-action.delete { color: var(--admin-danger); }
.table-action:hover { background: var(--admin-surface-2); transform: translateY(-1px); }
.farms-empty { min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 30px; text-align: center; color: var(--admin-muted); }
.farms-empty svg { color: var(--admin-primary); }
.farms-empty strong { color: var(--admin-text); font-size: 15px; }
.farms-empty span { font-size: 12px; }
.farms-empty .primary-button { margin-top: 8px; }

.farm-modal-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0,0,0,0.65); overflow-y: auto; box-sizing: border-box; }

.farm-modal { width: 100%; max-width: 760px; height: calc(100vh - 40px); max-height: calc(100vh - 40px); margin: 0; display: flex; flex-direction: column; border: 1px solid var(--admin-border); border-radius: 14px; background: var(--admin-surface); box-shadow: 0 20px 70px rgba(0,0,0,0.35); overflow: hidden; box-sizing: border-box; }

.farm-modal-header { flex: 0 0 auto; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 20px; border-bottom: 1px solid var(--admin-border); }
.farm-modal-header h2 { margin: 0; font-size: 18px; }
.farm-modal-header p { margin: 5px 0 0; color: var(--admin-muted); font-size: 12px; }
.modal-close { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; }

.farm-form { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }

.farm-modal-body { flex: 1 1 auto; min-height: 0; padding: 20px; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; -webkit-overflow-scrolling: touch; }

.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 15px; }
.form-field { min-width: 0; }
.form-field.full-width { grid-column: 1 / -1; }
.form-field label { display: block; margin-bottom: 6px; color: var(--admin-text); font-size: 12px; font-weight: 650; }
.form-field label span { color: var(--admin-danger); }
.form-field input, .form-field select { width: 100%; height: 40px; border-radius: 8px; padding: 0 11px; font-size: 13px; box-sizing: border-box; }
.form-field textarea { width: 100%; resize: vertical; min-height: 80px; border-radius: 8px; padding: 10px 11px; font-size: 13px; font-family: inherit; box-sizing: border-box; }

.farm-modal-footer { flex: 0 0 auto; display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--admin-border); }

.spin { animation: farms-spin 0.9s linear infinite; }
@keyframes farms-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 900px) {
.farms-page { padding: 18px; }
.farms-header { align-items: flex-start; flex-direction: column; }
.farms-header-actions { width: 100%; }
.farms-header-actions .primary-button, .farms-header-actions .secondary-button { flex: 1; }
.farm-summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}

@media (max-width: 640px) {
.farms-page { padding: 12px; }
.farms-container { padding-bottom: 30px; }
.page-title-row h1 { font-size: 19px; }
.farms-header p { font-size: 11px; }
.farms-toolbar { align-items: stretch; flex-direction: column; }
.search-box { max-width: none; }
.filter-select { width: 100%; }
.farm-summary-grid { gap: 9px; }
.summary-card { padding: 13px; }
.summary-card strong { font-size: 19px; }
.form-grid { grid-template-columns: 1fr; }
.form-field.full-width { grid-column: auto; }
.farm-modal-overlay { padding: 10px; align-items: center; }
.farm-modal { height: calc(100vh - 20px); max-height: calc(100vh - 20px); }
.farm-modal-header { padding: 15px; }
.farm-modal-body { padding: 15px; }
.farm-modal-footer { padding: 12px 15px; }
}

@media (max-height: 650px) {
.farm-modal { height: calc(100vh - 20px); max-height: calc(100vh - 20px); }
.farm-modal-overlay { padding: 10px; }
}
`}</style>
    </div>
  );
}
