import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, ChevronDown, Edit3, Mail, Phone, RefreshCw, Search, ShieldCheck, Trash2, UserCheck, Users, X } from "lucide-react";

import apiRequest from "../../api/api";
import { showConfirm, showError, showSuccess } from "../../utils/sweetAlert";

const CustomersStaff = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, customers: 0, staff: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const fetchUsers = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        params.set("role", roleFilter);
        params.set("status", statusFilter);

        const query = params.toString();
        const data = await apiRequest(`/admin/users${query ? `?${query}` : ""}`);

        setUsers(Array.isArray(data?.users) ? data.users : []);
        setStats(
          data?.stats || {
            total: 0,
            customers: 0,
            staff: 0,
            blocked: 0,
          }
        );
      } catch (err) {
        const message = err?.message || "Failed to load customers and staff";

        setError(message);

        await showError("Unable to Load Users", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, roleFilter, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => users, [users]);

  const openEditModal = (user) => {
    setSelectedUser(user);

    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      fullName: user?.address?.fullName || "",
      addressLine1: user?.address?.addressLine1 || "",
      addressLine2: user?.address?.addressLine2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
      landmark: user?.address?.landmark || "",
    });

    setEditOpen(true);
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditOpen(false);
    setSelectedUser(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!selectedUser) return;

    const cleanName = editForm.name.trim();
    const cleanEmail = editForm.email.trim().toLowerCase();
    const cleanPhone = editForm.phone.trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      await showError("Invalid Name", "Name must be between 2 and 80 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      await showError("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!cleanPhone || cleanPhone.length > 20) {
      await showError("Invalid Phone", "Please enter a valid phone number.");
      return;
    }

    try {
      setSaving(true);

      const data = await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...editForm,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      if (data?.user) {
        setUsers((prev) => prev.map((user) => (user.id === data.user.id ? data.user : user)));
      }

      await showSuccess(data?.message || "User details updated successfully");

      setEditOpen(false);
      setSelectedUser(null);

      await fetchUsers(true);
    } catch (err) {
      await showError("Update Failed", err?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (!newRole || newRole === user.role) return;

    const currentRole = user.role;
    const currentRoleLabel = currentRole === "staff" ? "Staff" : "Customer";
    const newRoleLabel = newRole === "staff" ? "Staff" : "Customer";

    const result = await showConfirm({
      title: "Change User Role?",
      text: `Change ${user.name}'s role from ${currentRoleLabel} to ${newRoleLabel}?`,
      confirmText: "Yes, Change",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) {
      setUsers((prev) => [...prev]);
      return;
    }

    try {
      const data = await apiRequest(`/admin/users/${user.id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });

      if (data?.user) {
        setUsers((prev) => prev.map((item) => (item.id === data.user.id ? data.user : item)));
      }

      await showSuccess(data?.message || `User role changed to ${newRoleLabel}`);

      await fetchUsers(true);
    } catch (err) {
      await showError("Role Change Failed", err?.message || "Failed to change user role");
      await fetchUsers(true);
    }
  };

  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";

    const result = await showConfirm({
      title: user.isBlocked ? "Unblock User?" : "Block User?",
      text: `Are you sure you want to ${action} ${user.name}?`,
      confirmText: user.isBlocked ? "Yes, Unblock" : "Yes, Block",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const data = await apiRequest(`/admin/users/${user.id}/block`, {
        method: "PUT",
      });

      if (data?.user) {
        setUsers((prev) => prev.map((item) => (item.id === data.user.id ? data.user : item)));
      }

      await showSuccess(data?.message || `User ${action}ed successfully`);

      await fetchUsers(true);
    } catch (err) {
      await showError("Account Status Failed", err?.message || `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await showConfirm({
      title: "Delete User?",
      text: `Delete ${user.name} permanently? This action cannot be undone.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const data = await apiRequest(`/admin/users/${user.id}`, {
        method: "DELETE",
      });

      setUsers((prev) => prev.filter((item) => item.id !== user.id));

      await showSuccess(data?.message || "User deleted successfully");

      await fetchUsers(true);
    } catch (err) {
      await showError("Delete Failed", err?.message || "Failed to delete user");
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "U";

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="customers-staff-page">
      <style>{`
        .customers-staff-page{min-height:100%;padding:24px;color:var(--admin-text);background:var(--admin-bg)}
        .customers-staff-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:24px}
        .customers-staff-title-wrap h1{margin:0;font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:var(--admin-text)}
        .customers-staff-title-wrap p{margin:7px 0 0;color:var(--admin-muted);font-size:14px}
        .refresh-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 15px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface);color:var(--admin-text);font-size:13px;font-weight:700;cursor:pointer;transition:.2s}
        .refresh-btn:hover{background:var(--admin-surface-2);border-color:var(--admin-primary)}
        .refresh-btn:disabled{opacity:.6;cursor:not-allowed}
        .refresh-spin{animation:customersStaffSpin 1s linear infinite}
        @keyframes customersStaffSpin{to{transform:rotate(360deg)}}
        .customers-stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:22px}
        .customers-stat-card{position:relative;overflow:hidden;padding:18px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface);box-shadow:0 8px 24px rgba(15,23,42,.04)}
        .customers-stat-card:after{content:"";position:absolute;right:-35px;top:-35px;width:100px;height:100px;border-radius:50%;background:rgba(59,130,246,.05)}
        .customers-stat-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .customers-stat-icon{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;background:var(--admin-surface-2);color:var(--admin-primary)}
        .customers-stat-value{margin-top:13px;font-size:25px;font-weight:800;color:var(--admin-text)}
        .customers-stat-label{margin-top:3px;font-size:12px;color:var(--admin-muted)}
        .customers-stat-card.staff .customers-stat-icon{color:#8b5cf6;background:rgba(139,92,246,.1)}
        .customers-stat-card.blocked .customers-stat-icon{color:var(--admin-danger);background:rgba(220,38,38,.08)}
        .customers-stat-card.customers .customers-stat-icon{color:#10b981;background:rgba(16,185,129,.1)}
        .customers-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:15px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface);margin-bottom:18px}
        .customers-search{position:relative;flex:1;min-width:220px}
        .customers-search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--admin-muted)}
        .customers-search input{width:100%;height:42px;padding:0 40px;border:1px solid var(--admin-border);border-radius:10px;outline:none;background:var(--admin-surface-2);color:var(--admin-text);font-size:13px;box-sizing:border-box}
        .customers-search input:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px rgba(59,130,246,.1)}
        .customers-search input::placeholder{color:var(--admin-muted)}
        .customers-filter{position:relative}
        .customers-filter select{height:42px;min-width:145px;padding:0 36px 0 13px;border:1px solid var(--admin-border);border-radius:10px;outline:none;background:var(--admin-surface);color:var(--admin-text);font-size:13px;cursor:pointer;appearance:none}
        .customers-filter select:focus{border-color:var(--admin-primary)}
        .customers-filter .filter-chevron{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--admin-muted)}
        .customers-table-wrap{overflow:hidden;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface);box-shadow:0 10px 30px rgba(15,23,42,.04)}
        .customers-table-scroll{overflow-x:auto}
        .customers-table{width:100%;min-width:1050px;border-collapse:collapse}
        .customers-table th{padding:14px 16px;text-align:left;border-bottom:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;white-space:nowrap}
        .customers-table td{padding:15px 16px;border-bottom:1px solid var(--admin-border);color:var(--admin-text);font-size:13px;vertical-align:middle}
        .customers-table tbody tr:last-child td{border-bottom:0}
        .customers-table tbody tr:hover{background:var(--admin-surface-2)}
        .user-cell{display:flex;align-items:center;gap:11px;min-width:190px}
        .user-avatar{width:38px;height:38px;flex:0 0 38px;display:flex;align-items:center;justify-content:center;border-radius:11px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:800;overflow:hidden;border:1px solid var(--admin-border)}
        .user-avatar img{width:100%;height:100%;object-fit:cover}
        .user-name{font-weight:700;color:var(--admin-text);white-space:nowrap}
        .user-created{margin-top:3px;color:var(--admin-muted);font-size:11px}
        .contact-cell{display:flex;flex-direction:column;gap:5px}
        .contact-line{display:flex;align-items:center;gap:6px;color:var(--admin-text);white-space:nowrap}
        .contact-line svg{color:var(--admin-muted);flex-shrink:0}
        .role-badge,.status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}
        .role-badge.customer{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}
        .role-badge.staff{background:#f5f3ff;color:#6d28d9;border:1px solid #ddd6fe}
        .status-badge.active{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}
        .status-badge.blocked{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
        .actions-cell{display:flex;align-items:center;gap:7px}
        .action-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface);color:var(--admin-muted);cursor:pointer;transition:.2s}
        .action-btn:hover{background:var(--admin-surface-2);color:var(--admin-text);border-color:var(--admin-primary)}
        .action-btn.edit:hover{color:#2563eb;border-color:#2563eb}
        .action-btn.block:hover{color:#d97706;border-color:#d97706}
        .action-btn.unblock:hover{color:#059669;border-color:#059669}
        .action-btn.delete:hover{color:var(--admin-danger);border-color:var(--admin-danger)}
        .role-select-wrap{position:relative;display:inline-flex;align-items:center}
        .role-select{height:34px;min-width:108px;padding:0 30px 0 10px;border:1px solid var(--admin-border);border-radius:9px;outline:none;background:var(--admin-surface);color:var(--admin-text);font-size:11px;font-weight:800;cursor:pointer;appearance:none}
        .role-select:hover{background:var(--admin-surface-2);border-color:#8b5cf6;color:var(--admin-text)}
        .role-select:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.1)}
        .role-select-wrap .role-select-chevron{position:absolute;right:9px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--admin-muted)}
        .empty-state{padding:60px 20px;text-align:center}
        .empty-icon{display:flex;align-items:center;justify-content:center;width:54px;height:54px;margin:0 auto 13px;border-radius:15px;background:var(--admin-surface-2);color:var(--admin-muted)}
        .empty-state h3{margin:0;color:var(--admin-text);font-size:16px}
        .empty-state p{margin:7px 0 0;color:var(--admin-muted);font-size:13px}
        .table-loading{padding:50px;text-align:center;color:var(--admin-muted)}
        .loader{width:28px;height:28px;margin:0 auto 12px;border:3px solid var(--admin-border);border-top-color:var(--admin-primary);border-radius:50%;animation:customersStaffSpin .8s linear infinite}
        .error-state{padding:40px 20px;text-align:center}
        .error-state p{margin:0 0 15px;color:var(--admin-danger);font-size:13px}
        .retry-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border:1px solid rgba(220,38,38,.3);border-radius:9px;background:rgba(220,38,38,.08);color:var(--admin-danger);font-weight:700;cursor:pointer}
        .modal-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,6,23,.55);backdrop-filter:blur(7px)}
        .user-modal{width:min(720px,100%);max-height:calc(100vh - 40px);overflow-y:auto;border:1px solid var(--admin-border);border-radius:16px;background:var(--admin-surface);box-shadow:0 25px 80px rgba(15,23,42,.25)}
        .modal-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:19px 20px;border-bottom:1px solid var(--admin-border)}
        .modal-title-wrap h2{margin:0;color:var(--admin-text);font-size:18px}
        .modal-title-wrap p{margin:4px 0 0;color:var(--admin-muted);font-size:12px}
        .modal-close{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface);color:var(--admin-muted);cursor:pointer}
        .modal-close:hover{color:var(--admin-text);background:var(--admin-surface-2)}
        .modal-body{padding:20px}
        .form-section-title{display:flex;align-items:center;gap:8px;margin:0 0 13px;color:var(--admin-text);font-size:13px;font-weight:800}
        .form-section-title:not(:first-child){margin-top:22px}
        .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
        .form-field.full{grid-column:1/-1}
        .form-field label{display:block;margin-bottom:6px;color:var(--admin-muted);font-size:11px;font-weight:700}
        .form-field input{width:100%;height:41px;padding:0 12px;border:1px solid var(--admin-border);border-radius:9px;outline:none;background:var(--admin-surface-2);color:var(--admin-text);font-size:13px;box-sizing:border-box}
        .form-field input:focus{border-color:var(--admin-primary);box-shadow:0 0 0 3px rgba(59,130,246,.1)}
        .form-field input::placeholder{color:var(--admin-muted)}
        .modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:16px 20px;border-top:1px solid var(--admin-border)}
        .modal-btn{height:40px;padding:0 15px;border-radius:9px;font-size:13px;font-weight:800;cursor:pointer}
        .modal-btn.cancel{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text)}
        .modal-btn.cancel:hover{background:var(--admin-surface-2)}
        .modal-btn.save{border:0;background:var(--admin-primary);color:#fff}
        .modal-btn:hover{filter:brightness(1.08)}
        .modal-btn:disabled{opacity:.55;cursor:not-allowed}
        .modal-save-loading{display:inline-flex;align-items:center;gap:7px}
        .mini-loader{width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:customersStaffSpin .8s linear infinite}
        @media(max-width:900px){.customers-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.customers-staff-header{align-items:center}}
        @media(max-width:600px){.customers-staff-page{padding:16px}.customers-staff-header{flex-direction:column;align-items:stretch}.refresh-btn{justify-content:center}.customers-stats-grid{grid-template-columns:1fr 1fr;gap:10px}.customers-stat-card{padding:14px}.customers-stat-value{font-size:21px}.customers-toolbar{padding:11px}.customers-search{min-width:100%}.customers-filter{flex:1}.customers-filter select{width:100%;min-width:0}.form-grid{grid-template-columns:1fr}.form-field.full{grid-column:auto}.modal-backdrop{padding:10px}.user-modal{max-height:calc(100vh - 20px)}}
      `}</style>

      <div className="customers-staff-header">
        <div className="customers-staff-title-wrap">
          <h1>Customers & Staff</h1>
          <p>Manage customer and staff accounts, access, and account status.</p>
        </div>

        <button type="button" className="refresh-btn" onClick={() => fetchUsers(true)} disabled={loading || refreshing}>
          <RefreshCw size={15} className={refreshing ? "refresh-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="customers-stats-grid">
        <div className="customers-stat-card">
          <div className="customers-stat-top">
            <span className="customers-stat-label">Total Users</span>
            <div className="customers-stat-icon">
              <Users size={19} />
            </div>
          </div>
          <div className="customers-stat-value">{stats.total}</div>
        </div>

        <div className="customers-stat-card customers">
          <div className="customers-stat-top">
            <span className="customers-stat-label">Customers</span>
            <div className="customers-stat-icon">
              <UserCheck size={19} />
            </div>
          </div>
          <div className="customers-stat-value">{stats.customers}</div>
        </div>

        <div className="customers-stat-card staff">
          <div className="customers-stat-top">
            <span className="customers-stat-label">Staff</span>
            <div className="customers-stat-icon">
              <ShieldCheck size={19} />
            </div>
          </div>
          <div className="customers-stat-value">{stats.staff}</div>
        </div>

        <div className="customers-stat-card blocked">
          <div className="customers-stat-top">
            <span className="customers-stat-label">Blocked</span>
            <div className="customers-stat-icon">
              <Ban size={19} />
            </div>
          </div>
          <div className="customers-stat-value">{stats.blocked}</div>
        </div>
      </div>

      <div className="customers-toolbar">
        <div className="customers-search">
          <Search size={17} />
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        <div className="customers-filter">
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="customer">Customers</option>
            <option value="staff">Staff</option>
          </select>
          <ChevronDown className="filter-chevron" size={15} />
        </div>

        <div className="customers-filter">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <ChevronDown className="filter-chevron" size={15} />
        </div>
      </div>

      <div className="customers-table-wrap">
        {loading ? (
          <div className="table-loading">
            <div className="loader" />
            Loading customers and staff...
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={() => fetchUsers()}>
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={24} />
            </div>
            <h3>No users found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="customers-table-scroll">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{user?.profilePicture?.url ? <img src={user.profilePicture.url} alt={user.name || "User"} /> : getInitials(user.name)}</div>

                        <div>
                          <div className="user-name">{user.name || "Unnamed User"}</div>
                          <div className="user-created">Joined {formatDate(user.createdAt)}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="contact-cell">
                        <div className="contact-line">
                          <Mail size={13} />
                          {user.email || "—"}
                        </div>

                        <div className="contact-line">
                          <Phone size={13} />
                          {user.phone || "—"}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === "staff" ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                        {user.role === "staff" ? "Staff" : "Customer"}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${user.isBlocked ? "blocked" : "active"}`}>
                        {user.isBlocked ? <Ban size={12} /> : <CheckCircle2 size={12} />}
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <div className="actions-cell">
                        <button type="button" className="action-btn edit" title="Edit user" onClick={() => openEditModal(user)}>
                          <Edit3 size={15} />
                        </button>

                        <div className="role-select-wrap">
                          <select className="role-select" value={user.role} onChange={(event) => handleRoleChange(user, event.target.value)} title="Change user role">
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                          </select>
                          <ChevronDown className="role-select-chevron" size={13} />
                        </div>

                        <button type="button" className={`action-btn ${user.isBlocked ? "unblock" : "block"}`} title={user.isBlocked ? "Unblock user" : "Block user"} onClick={() => handleToggleBlock(user)}>
                          {user.isBlocked ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                        </button>

                        <button type="button" className="action-btn delete" title="Delete user" onClick={() => handleDeleteUser(user)}>
                          <Trash2 size={15} />
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

      {editOpen && selectedUser && (
        <div className="modal-backdrop" onMouseDown={closeEditModal}>
          <div className="user-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h2>Edit User</h2>
                <p>Update {selectedUser.name || "user"} account details.</p>
              </div>

              <button type="button" className="modal-close" onClick={closeEditModal} disabled={saving}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} noValidate>
              <div className="modal-body">
                <div className="form-section-title">
                  <UserCheck size={15} />
                  Account Details
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" value={editForm.name} onChange={handleFormChange} maxLength={80} />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="text" value={editForm.phone} onChange={handleFormChange} maxLength={20} />
                  </div>

                  <div className="form-field full">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="text" inputMode="email" value={editForm.email} onChange={handleFormChange} />
                  </div>
                </div>

                <div className="form-section-title">
                  <Mail size={15} />
                  Delivery Address
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" name="fullName" type="text" value={editForm.fullName} onChange={handleFormChange} maxLength={80} />
                  </div>

                  <div className="form-field">
                    <label htmlFor="pincode">Pincode</label>
                    <input id="pincode" name="pincode" type="text" value={editForm.pincode} onChange={handleFormChange} maxLength={10} />
                  </div>

                  <div className="form-field full">
                    <label htmlFor="addressLine1">Address Line 1</label>
                    <input id="addressLine1" name="addressLine1" type="text" value={editForm.addressLine1} onChange={handleFormChange} maxLength={200} />
                  </div>

                  <div className="form-field full">
                    <label htmlFor="addressLine2">Address Line 2</label>
                    <input id="addressLine2" name="addressLine2" type="text" value={editForm.addressLine2} onChange={handleFormChange} maxLength={200} />
                  </div>

                  <div className="form-field">
                    <label htmlFor="city">City</label>
                    <input id="city" name="city" type="text" value={editForm.city} onChange={handleFormChange} maxLength={80} />
                  </div>

                  <div className="form-field">
                    <label htmlFor="state">State</label>
                    <input id="state" name="state" type="text" value={editForm.state} onChange={handleFormChange} maxLength={80} />
                  </div>

                  <div className="form-field full">
                    <label htmlFor="landmark">Landmark</label>
                    <input id="landmark" name="landmark" type="text" value={editForm.landmark} onChange={handleFormChange} maxLength={120} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn cancel" onClick={closeEditModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="modal-btn save" disabled={saving}>
                  {saving ? (
                    <span className="modal-save-loading">
                      <span className="mini-loader" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersStaff;
