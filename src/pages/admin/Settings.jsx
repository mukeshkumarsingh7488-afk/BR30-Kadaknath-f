import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Bell, BellRing, Check, ChevronDown, ChevronRight, CircleUserRound, ClipboardList, Database, DatabaseBackup, FileWarning, LockKeyhole, Palette, Plug, RotateCcw, Save, Settings as SettingsIcon, Settings2, ShieldCheck, SlidersHorizontal, UsersRound, Wrench, X } from "lucide-react";

import apiRequest from "../../api/api";
import { showConfirm, showError, showSuccess } from "../../utils/sweetAlert";

const roleList = [
  {
    key: "staff",
    label: "Staff",
    description: "Farm operations and assigned administrative pages.",
  },
  {
    key: "fm",
    label: "Farm Manager",
    description: "Farm management and operational pages.",
  },
  {
    key: "security",
    label: "Security",
    description: "Security and visitor-related pages.",
  },
];

const accessRoleList = [
  { key: "admin", label: "Admin" },
  { key: "staff", label: "Staff" },
  { key: "fm", label: "FM" },
  { key: "security", label: "Security" },
];

const permissionList = [
  { key: "dashboard", label: "Dashboard", section: "Main" },
  { key: "orders", label: "Orders", section: "Main" },
  { key: "refunds", label: "Refunds", section: "Main" },
  { key: "products", label: "Products", section: "Main" },
  { key: "customers-staff", label: "Customers & Staff", section: "Main" },

  { key: "farm-dashboard", label: "Farm Dashboard", section: "Farm OS" },
  { key: "farms", label: "Create Farm", section: "Farm OS" },
  { key: "sheds", label: "Shed Management", section: "Farm OS" },
  {
    key: "shed-maintenance",
    label: "Shed Maintenance",
    section: "Farm OS",
  },
  { key: "batches", label: "Batches", section: "Farm OS" },
  { key: "chicks-inward", label: "Chicks Inward", section: "Farm OS" },
  { key: "bird-stock", label: "Bird Stock", section: "Farm OS" },
  { key: "mortality", label: "Farm Mortality", section: "Farm OS" },
  { key: "weight-growth", label: "Weight & Growth", section: "Farm OS" },
  { key: "egg-collection", label: "Egg Collection", section: "Farm OS" },
  { key: "feed-inventory", label: "Feed Inventory", section: "Farm OS" },
  { key: "feed-consumption", label: "Feed Consumption", section: "Farm OS" },
  {
    key: "medicine-vaccine",
    label: "Medicine & Vaccine",
    section: "Farm OS",
  },
  {
    key: "vaccination-schedule",
    label: "Vaccination Schedule",
    section: "Farm OS",
  },
  {
    key: "veterinary-logs",
    label: "Veterinary Logs",
    section: "Farm OS",
  },
  { key: "water-quality", label: "Water Quality", section: "Farm OS" },
  {
    key: "staff-attendance",
    label: "Staff Attendance",
    section: "Farm OS",
  },
  { key: "tasks", label: "Farm Tasks", section: "Farm OS" },
  { key: "payroll", label: "Payroll", section: "Farm OS" },
  { key: "biosecurity", label: "Biosecurity", section: "Farm OS" },
  { key: "sales", label: "Sales & Billing", section: "Farm OS" },
  { key: "farm-reports", label: "Farm Reports", section: "Farm OS" },
  { key: "farm-expenses", label: "Farm Expenses", section: "Farm OS" },

  { key: "staff-control", label: "Staff Control", section: "Management" },
  { key: "settings", label: "Settings", section: "Management" },
];

const defaultPermissions = {
  staff: ["dashboard"],
  fm: ["dashboard", "farm-dashboard"],
  security: ["dashboard", "biosecurity"],
};

const notificationPages = [
  {
    key: "dashboard",
    title: "Dashboard",
    description: "Notifications related to admin dashboard activity.",
  },
  {
    key: "orders",
    title: "Orders",
    description: "New order and order status notifications.",
  },
  {
    key: "refunds",
    title: "Refunds",
    description: "Refund request and refund status notifications.",
  },
  {
    key: "products",
    title: "Products",
    description: "Product stock and product management notifications.",
  },
  {
    key: "customers-staff",
    title: "Customers & Staff",
    description: "Customer and staff activity notifications.",
  },

  {
    key: "farm-dashboard",
    title: "Farm Dashboard",
    description: "Farm overview and important farm alerts.",
  },
  {
    key: "farms",
    title: "Create Farm",
    description: "Farm creation and farm management notifications.",
  },
  {
    key: "sheds",
    title: "Shed Management",
    description: "Shed activity and management notifications.",
  },
  {
    key: "shed-maintenance",
    title: "Shed Maintenance",
    description: "Shed maintenance reminders and alerts.",
  },
  {
    key: "batches",
    title: "Batches",
    description: "Batch creation, updates and batch activity notifications.",
  },
  {
    key: "chicks-inward",
    title: "Chicks Inward",
    description: "Chicks inward and stock entry notifications.",
  },
  {
    key: "bird-stock",
    title: "Bird Stock",
    description: "Bird stock and inventory notifications.",
  },
  {
    key: "mortality",
    title: "Farm Mortality",
    description: "Bird mortality entry and alert notifications.",
  },
  {
    key: "weight-growth",
    title: "Weight & Growth",
    description: "Weight and growth tracking notifications.",
  },
  {
    key: "egg-collection",
    title: "Egg Collection",
    description: "Egg collection and production notifications.",
  },
  {
    key: "feed-inventory",
    title: "Feed Inventory",
    description: "Feed stock and inventory alerts.",
  },
  {
    key: "feed-consumption",
    title: "Feed Consumption",
    description: "Feed consumption and usage notifications.",
  },
  {
    key: "medicine-vaccine",
    title: "Medicine & Vaccine",
    description: "Medicine and vaccine stock notifications.",
  },
  {
    key: "vaccination-schedule",
    title: "Vaccination Schedule",
    description: "Upcoming and due vaccination notifications.",
  },
  {
    key: "veterinary-logs",
    title: "Veterinary Logs",
    description: "Veterinary activity and health log notifications.",
  },
  {
    key: "water-quality",
    title: "Water Quality",
    description: "Water quality check and alert notifications.",
  },
  {
    key: "staff-attendance",
    title: "Staff Attendance",
    description: "Staff attendance and absence notifications.",
  },
  {
    key: "tasks",
    title: "Farm Tasks",
    description: "Task assignment, due and overdue notifications.",
  },
  {
    key: "payroll",
    title: "Payroll",
    description: "Payroll processing and payment notifications.",
  },
  {
    key: "biosecurity",
    title: "Biosecurity",
    description: "Biosecurity alerts and important farm warnings.",
  },
  {
    key: "sales",
    title: "Sales & Billing",
    description: "Sales, billing and payment notifications.",
  },
  {
    key: "farm-reports",
    title: "Farm Reports",
    description: "Farm report generation and report activity notifications.",
  },
  {
    key: "farm-expenses",
    title: "Farm Expenses",
    description: "Expense entry and expense-related notifications.",
  },

  {
    key: "staff-control",
    title: "Staff Control",
    description: "Staff management and access activity notifications.",
  },
  {
    key: "settings",
    title: "Settings",
    description: "Important admin settings and configuration notifications.",
  },
];

const defaultNotifications = notificationPages.reduce((acc, page) => {
  acc[page.key] = false;
  return acc;
}, {});

const defaultSettings = {
  theme: "system",
  sidebarMode: "normal",
  defaultDashboard: "farm",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  currency: "INR",
  itemsPerPage: "10",
  notifications: defaultNotifications,
  emailNotifications: true,
};

const sidebarStyles = [
  {
    key: "normal",
    label: "Normal Sidebar",
    description: "Full sidebar stays visible on desktop.",
  },
  {
    key: "hamburger",
    label: "Hamburger Sidebar",
    description: "Sidebar opens from the menu button.",
  },
  {
    key: "hover",
    label: "Hover Expand",
    description: "Icon rail expands when you hover.",
  },
  {
    key: "compact",
    label: "Compact Icons",
    description: "Permanent icon-only sidebar.",
  },
];

const Settings = () => {
  const outletContext = useOutletContext();

  const theme = outletContext?.theme || "dark";
  const setTheme = outletContext?.setTheme || (() => {});
  const sidebarMode = outletContext?.sidebarMode || "normal";
  const setSidebarMode = outletContext?.setSidebarMode || (() => {});

  const settingsTabs = ["appearance", "general", "notifications", "permissions", "users", "security", "system", "farm-configuration", "alert-rules", "data-backup", "audit-logs", "integrations"];

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("br30-admin-settings-active-tab");

    return settingsTabs.includes(savedTab) ? savedTab : "appearance";
  });

  useEffect(() => {
    localStorage.setItem("br30-admin-settings-active-tab", activeTab);
  }, [activeTab]);

  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [permissions, setPermissions] = useState(defaultPermissions);
  const [savedPermissions, setSavedPermissions] = useState(defaultPermissions);
  const [permissionRole, setPermissionRole] = useState("staff");
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsSaving, setPermissionsSaving] = useState(false);

  const [expandedRoles, setExpandedRoles] = useState({
    staff: true,
    fm: false,
    security: false,
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const saveTimerRef = useRef(null);

  const currentRolePermissions = permissions[permissionRole] || [];

  const groupedPermissions = useMemo(() => {
    return permissionList.reduce((groups, item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }

      groups[item.section].push(item);
      return groups;
    }, {});
  }, []);

  useEffect(() => {
    try {
      const storedSettings = JSON.parse(localStorage.getItem("br30-admin-settings") || "{}");

      const savedTheme = storedSettings.theme || localStorage.getItem("br30-admin-theme") || "dark";

      const savedSidebarMode = storedSettings.sidebarMode || localStorage.getItem("br30-admin-sidebar-mode") || "normal";

      const mergedSettings = {
        ...defaultSettings,
        ...storedSettings,
        theme: savedTheme,
        sidebarMode: savedSidebarMode,
      };

      setSettings(mergedSettings);

      if (savedTheme !== theme) {
        setTheme(savedTheme);
      }

      if (savedSidebarMode !== sidebarMode) {
        setSidebarMode(savedSidebarMode);
      }
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true);

      const response = await apiRequest("/admin/permissions", {
        method: "GET",
      });

      const serverPermissions = response?.permissions;

      if (serverPermissions && typeof serverPermissions === "object") {
        const mergedPermissions = {
          ...defaultPermissions,
          ...serverPermissions,
        };

        setPermissions(mergedPermissions);
        setSavedPermissions(mergedPermissions);
      }
    } catch (err) {
      console.error("Permissions fetch error:", err);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSaved(false);
    setError("");

    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleNotification = (key) => {
    setSaved(false);
    setError("");

    setSettings((current) => ({
      ...current,
      notifications: {
        ...(current.notifications || defaultNotifications),
        [key]: !(current.notifications?.[key] ?? false),
      },
    }));
  };

  const handleSave = async () => {
    const result = await showConfirm({
      title: "Save Settings?",
      text: "Are you sure you want to save these admin settings?",
      confirmText: "Yes, Save",
      cancelText: "Cancel",
    });

    if (!result?.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const settingsToSave = {
        ...settings,
        theme: settings.theme || "dark",
        sidebarMode: settings.sidebarMode || "normal",
      };

      localStorage.setItem("br30-admin-settings", JSON.stringify(settingsToSave));

      localStorage.setItem("br30-admin-theme", settingsToSave.theme);
      localStorage.setItem("br30-admin-sidebar-mode", settingsToSave.sidebarMode);

      setTheme(settingsToSave.theme);
      setSidebarMode(settingsToSave.sidebarMode);

      setSettings(settingsToSave);
      setSaved(true);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        setSaved(false);
      }, 2500);

      showSuccess("Settings saved successfully.");
    } catch (err) {
      console.error("Settings save error:", err);

      setError("Unable to save settings.");
      showError("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const result = await showConfirm({
      title: "Reset Admin Settings?",
      text: "All admin settings will be restored to their default values.",
      confirmText: "Reset",
      cancelText: "Cancel",
    });

    if (!result?.isConfirmed) {
      return;
    }

    const resetTheme = "system";
    const resetSidebarMode = "normal";

    const resetSettings = {
      ...defaultSettings,
      theme: resetTheme,
      sidebarMode: resetSidebarMode,
    };

    setSettings(resetSettings);
    setTheme(resetTheme);
    setSidebarMode(resetSidebarMode);
    setSaved(false);
    setError("");

    localStorage.setItem("br30-admin-theme", resetTheme);
    localStorage.setItem("br30-admin-sidebar-mode", resetSidebarMode);
    localStorage.setItem("br30-admin-settings", JSON.stringify(resetSettings));

    showSuccess("Admin settings reset successfully.");
  };

  const toggleRole = (role) => {
    setExpandedRoles((current) => ({
      ...current,
      [role]: !current[role],
    }));
  };

  const togglePermission = (permission) => {
    if (permissionRole === "admin") {
      return;
    }

    setPermissions((current) => {
      const existing = current[permissionRole] || [];

      const updated = existing.includes(permission) ? existing.filter((item) => item !== permission) : [...existing, permission];

      return {
        ...current,
        [permissionRole]: updated,
      };
    });
  };

  const selectAllPermissions = () => {
    if (permissionRole === "admin") {
      return;
    }

    setPermissions((current) => ({
      ...current,
      [permissionRole]: permissionList.map((item) => item.key),
    }));
  };

  const clearAllPermissions = () => {
    if (permissionRole === "admin") {
      return;
    }

    setPermissions((current) => ({
      ...current,
      [permissionRole]: [],
    }));
  };

  const savePermissions = async () => {
    if (permissionRole === "admin") {
      return;
    }

    const oldPermissions = Array.isArray(savedPermissions[permissionRole]) ? savedPermissions[permissionRole] : [];

    const newPermissions = Array.isArray(currentRolePermissions) ? currentRolePermissions : [];

    const addedPermissions = newPermissions.filter((permission) => !oldPermissions.includes(permission));

    const removedPermissions = oldPermissions.filter((permission) => !newPermissions.includes(permission));

    const result = await showConfirm({
      title: "Save Permissions?",
      text: `Save ${permissionRole.toUpperCase()} permission changes?`,
      confirmText: "Yes, Save",
      cancelText: "Cancel",
    });

    if (!result?.isConfirmed) {
      return;
    }

    try {
      setPermissionsSaving(true);

      await apiRequest(`/admin/permissions/${permissionRole}`, {
        method: "PUT",
        body: {
          permissions: newPermissions,
        },
      });

      setSavedPermissions((current) => ({
        ...current,
        [permissionRole]: [...newPermissions],
      }));

      const roleLabel = permissionRole === "fm" ? "FM" : permissionRole.charAt(0).toUpperCase() + permissionRole.slice(1);

      await showSuccess("Permissions Saved Successfully", `${roleLabel}\n\nPreviously: ${oldPermissions.length} permissions\nNew permissions added: ${addedPermissions.length}\nPermissions removed: ${removedPermissions.length}\nTotal permissions: ${newPermissions.length}`);

      await fetchPermissions();
    } catch (err) {
      console.error("Permissions save error:", err);

      showError(err?.data?.message || err?.message || "Unable to update permissions.");
    } finally {
      setPermissionsSaving(false);
    }
  };

  const openRoleDetails = (role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const closeRoleDetails = () => {
    setShowRoleModal(false);
    setSelectedRole(null);
  };

  const renderSidebarPreview = (mode) => {
    if (mode === "hamburger") {
      return (
        <div className="farm-preview-topbar">
          <b>☰</b>
          <span />
        </div>
      );
    }

    if (mode === "hover") {
      return (
        <>
          <div className="farm-preview-sidebar farm-preview-sidebar-small">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="farm-preview-content">
            <i />
            <i />
            <i />
          </div>
        </>
      );
    }

    if (mode === "compact") {
      return (
        <>
          <div className="farm-preview-sidebar farm-preview-sidebar-small">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="farm-preview-content">
            <i />
            <i />
            <i />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="farm-preview-sidebar">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="farm-preview-content">
          <i />
          <i />
          <i />
        </div>
      </>
    );
  };

  return (
    <section className="farm-settings-page">
      <div className="farm-settings-header">
        <div>
          <div className="farm-settings-title-row">
            <div className="farm-settings-title-icon">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h1>Admin Settings</h1>
              <p>Manage dashboard appearance, notifications, permissions and system preferences.</p>
            </div>
          </div>
        </div>

        <div className="farm-settings-actions">
          <button type="button" className="farm-settings-reset" onClick={handleReset} disabled={activeTab === "permissions"}>
            <RotateCcw size={16} />
            Reset
          </button>

          <button type="button" className="farm-settings-save" onClick={handleSave} disabled={saving || activeTab === "permissions"}>
            {saving ? (
              <>
                <span className="farm-settings-spinner" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={17} />
                Saved
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && <div className="farm-settings-error">{error}</div>}

      <div className="farm-settings-layout">
        <aside className="farm-settings-nav">
          <button type="button" className={activeTab === "appearance" ? "active" : ""} onClick={() => setActiveTab("appearance")}>
            <Palette size={17} />
            <span>Appearance</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "general" ? "active" : ""} onClick={() => setActiveTab("general")}>
            <SlidersHorizontal size={17} />
            <span>General</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
            <Bell size={17} />
            <span>Notifications</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "permissions" ? "active" : ""} onClick={() => setActiveTab("permissions")}>
            <ShieldCheck size={17} />
            <span>Permissions</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            <UsersRound size={17} />
            <span>Access Roles</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>
            <LockKeyhole size={17} />
            <span>Security</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "system" ? "active" : ""} onClick={() => setActiveTab("system")}>
            <Database size={17} />
            <span>System</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "farm-configuration" ? "active" : ""} onClick={() => setActiveTab("farm-configuration")}>
            <Settings2 size={17} />
            <span>Farm Configuration</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "alert-rules" ? "active" : ""} onClick={() => setActiveTab("alert-rules")}>
            <BellRing size={17} />
            <span>Alert Rules</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "data-backup" ? "active" : ""} onClick={() => setActiveTab("data-backup")}>
            <DatabaseBackup size={17} />
            <span>Data & Backup</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "audit-logs" ? "active" : ""} onClick={() => setActiveTab("audit-logs")}>
            <ClipboardList size={17} />
            <span>Audit Logs</span>
            <ChevronRight size={15} />
          </button>

          <button type="button" className={activeTab === "integrations" ? "active" : ""} onClick={() => setActiveTab("integrations")}>
            <Plug size={17} />
            <span>Integrations</span>
            <ChevronRight size={15} />
          </button>
        </aside>

        <div className="farm-settings-content">
          {activeTab === "appearance" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <Palette size={19} />
                <div>
                  <h2>Appearance</h2>
                  <p>Customize the look and navigation of the admin panel.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-row">
                  <div>
                    <strong>Theme</strong>
                    <span>Choose the default admin panel appearance.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={settings.theme} onChange={(e) => updateSetting("theme", e.target.value)}>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">Device Default</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-sidebar-style">
                  <div className="farm-settings-sidebar-style-head">
                    <label>Sidebar Style</label>
                    <p>Choose how the admin sidebar should behave.</p>
                  </div>

                  <div className="farm-settings-sidebar-options">
                    {sidebarStyles.map((style) => {
                      const active = settings.sidebarMode === style.key;

                      return (
                        <button key={style.key} type="button" className={`farm-sidebar-option ${active ? "active" : ""}`} onClick={() => updateSetting("sidebarMode", style.key)}>
                          <div className="farm-sidebar-preview">{renderSidebarPreview(style.key)}</div>

                          <div className="farm-sidebar-option-info">
                            <strong>{style.label}</strong>
                            <span>{style.description}</span>
                          </div>

                          <span className="farm-sidebar-radio">{active ? <Check size={13} /> : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "general" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <SlidersHorizontal size={19} />
                <div>
                  <h2>General Settings</h2>
                  <p>Configure general admin panel preferences.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-row">
                  <div>
                    <strong>Default Dashboard</strong>
                    <span>Select which dashboard should open by default.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={settings.defaultDashboard} onChange={(e) => updateSetting("defaultDashboard", e.target.value)}>
                      <option value="farm">Farm Dashboard</option>
                      <option value="admin">Admin Dashboard</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Date Format</strong>
                    <span>Choose how dates are displayed.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={settings.dateFormat} onChange={(e) => updateSetting("dateFormat", e.target.value)}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Time Format</strong>
                    <span>Choose 12-hour or 24-hour format.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={settings.timeFormat} onChange={(e) => updateSetting("timeFormat", e.target.value)}>
                      <option value="12h">12 Hour</option>
                      <option value="24h">24 Hour</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Currency</strong>
                    <span>Default currency for admin records.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={settings.currency} onChange={(e) => updateSetting("currency", e.target.value)}>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Items Per Page</strong>
                    <span>Number of records displayed in admin tables.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={settings.itemsPerPage} onChange={(e) => updateSetting("itemsPerPage", e.target.value)}>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <Bell size={19} />
                <div>
                  <h2>Notifications</h2>
                  <p>Control notifications for every admin sidebar page.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                {notificationPages.map((item, index, array) => (
                  <div key={item.key}>
                    <div className="farm-settings-row">
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </div>

                      <button type="button" className={`farm-toggle ${settings.notifications?.[item.key] ? "active" : ""}`} onClick={() => toggleNotification(item.key)} aria-label={`Toggle ${item.title} notifications`} aria-pressed={settings.notifications?.[item.key] ? "true" : "false"}>
                        <span />
                      </button>
                    </div>

                    {index !== array.length - 1 && <div className="farm-settings-divider" />}
                  </div>
                ))}
              </div>

              <div className="farm-settings-card" style={{ marginTop: "14px" }}>
                <div className="farm-settings-row">
                  <div>
                    <strong>Email Notifications</strong>
                    <span>Allow notification emails from the admin system.</span>
                  </div>

                  <button type="button" className={`farm-toggle ${settings.emailNotifications ? "active" : ""}`} onClick={() => updateSetting("emailNotifications", !settings.emailNotifications)} aria-label="Toggle Email Notifications" aria-pressed={settings.emailNotifications ? "true" : "false"}>
                    <span />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <ShieldCheck size={19} />
                <div>
                  <h2>Permissions</h2>
                  <p>Control which admin pages each role can access.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-permission-role-bar">
                  <div>
                    <strong>Role</strong>
                    <span>Select a role to manage permissions.</span>
                  </div>

                  <div className="farm-settings-control">
                    <select value={permissionRole} onChange={(e) => setPermissionRole(e.target.value)}>
                      {accessRoleList.map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-permission-actions">
                  <div>
                    <strong>{accessRoleList.find((role) => role.key === permissionRole)?.label || permissionRole} Access</strong>

                    <span>{permissionRole === "admin" ? "Admin has full access to all admin pages." : `${currentRolePermissions.length} of ${permissionList.length} permissions enabled.`}</span>
                  </div>

                  {permissionRole !== "admin" && (
                    <div className="farm-permission-buttons">
                      <button type="button" onClick={selectAllPermissions}>
                        Select All
                      </button>

                      <button type="button" onClick={clearAllPermissions}>
                        Clear All
                      </button>

                      <button type="button" className="primary" onClick={savePermissions} disabled={permissionsSaving}>
                        {permissionsSaving ? "Saving..." : "Save Permissions"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="farm-permission-groups">
                  {Object.entries(groupedPermissions).map(([section, items]) => (
                    <div className="farm-permission-group" key={section}>
                      <div className="farm-permission-group-title">
                        <span>{section}</span>
                      </div>

                      <div className="farm-permission-grid">
                        {items.map((item) => {
                          const enabled = permissionRole === "admin" ? true : currentRolePermissions.includes(item.key);

                          return (
                            <button type="button" key={item.key} className={`farm-permission-item ${enabled ? "active" : ""} ${permissionRole === "admin" ? "disabled" : ""}`} onClick={() => togglePermission(item.key)} disabled={permissionRole === "admin"}>
                              <span className="farm-permission-check">{enabled ? <Check size={13} /> : null}</span>

                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {permissionsLoading && <div className="farm-settings-loading">Loading permissions...</div>}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <UsersRound size={19} />
                <div>
                  <h2>Access Roles</h2>
                  <p>Review the available admin access roles and their purpose.</p>
                </div>
              </div>

              <div className="farm-role-grid">
                {roleList.map((role) => {
                  const rolePermissions = permissions[role.key] || [];

                  return (
                    <div className="farm-role-card" key={role.key}>
                      <div className="farm-role-card-top">
                        <div className="farm-role-icon">
                          <CircleUserRound size={19} />
                        </div>

                        <div>
                          <strong>{role.label}</strong>
                          <span>{role.description}</span>
                        </div>
                      </div>

                      <div className="farm-role-card-bottom">
                        <span>{rolePermissions.length} permissions</span>

                        <button type="button" onClick={() => openRoleDetails(role)}>
                          View
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <LockKeyhole size={19} />
                <div>
                  <h2>Security</h2>
                  <p>Security-related admin preferences.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-info-box">
                  <ShieldCheck size={20} />

                  <div>
                    <strong>Admin Authentication</strong>
                    <span>Authentication and role permissions are controlled by the backend. Keep admin credentials secure.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <Database size={19} />
                <div>
                  <h2>System</h2>
                  <p>System information and configuration.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-row">
                  <div>
                    <strong>Application</strong>
                    <span>BR30 Kadaknath Farms Admin Panel</span>
                  </div>

                  <span className="farm-system-badge">Active</span>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Frontend</strong>
                    <span>React + Vite</span>
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Database</strong>
                    <span>MongoDB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "farm-configuration" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <Settings2 size={19} />
                <div>
                  <h2>Farm Configuration</h2>
                  <p>Configure farm-wide units, defaults and operational preferences.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-info-box">
                  <Wrench size={20} />

                  <div>
                    <strong>Farm Configuration</strong>
                    <span>This section will control farm units, production defaults, batch settings, mortality settings and other farm-wide configurations.</span>
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Configuration Status</strong>
                    <span>Advanced farm configuration will be available here.</span>
                  </div>

                  <span className="farm-system-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "alert-rules" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <BellRing size={19} />
                <div>
                  <h2>Alert Rules</h2>
                  <p>Define thresholds and rules for important farm alerts.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-info-box">
                  <FileWarning size={20} />

                  <div>
                    <strong>Alert Rules</strong>
                    <span>Future alert rules will manage low stock, mortality thresholds, maintenance reminders, vaccination alerts and other operational warnings.</span>
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Rule Engine</strong>
                    <span>Custom alert thresholds and automated rules will be configured here.</span>
                  </div>

                  <span className="farm-system-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data-backup" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <DatabaseBackup size={19} />
                <div>
                  <h2>Data & Backup</h2>
                  <p>Manage farm data, exports and future backup operations.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-info-box">
                  <DatabaseBackup size={20} />

                  <div>
                    <strong>Data Management</strong>
                    <span>This section will handle database backups, data exports, imports, backup history and data retention settings.</span>
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Backup System</strong>
                    <span>Automated and manual backup controls will be added here.</span>
                  </div>

                  <span className="farm-system-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit-logs" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <ClipboardList size={19} />
                <div>
                  <h2>Audit Logs</h2>
                  <p>Track important admin and farm system activities.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-info-box">
                  <ClipboardList size={20} />

                  <div>
                    <strong>Activity Tracking</strong>
                    <span>Future audit logs will record login activity, permission changes, order changes, farm data changes and important administrative actions.</span>
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Audit History</strong>
                    <span>Searchable admin activity history will be available here.</span>
                  </div>

                  <span className="farm-system-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="farm-settings-section">
              <div className="farm-settings-section-title">
                <Plug size={19} />
                <div>
                  <h2>Integrations</h2>
                  <p>Manage external services connected to Farm OS.</p>
                </div>
              </div>

              <div className="farm-settings-card">
                <div className="farm-settings-info-box">
                  <Plug size={20} />

                  <div>
                    <strong>External Integrations</strong>
                    <span>Future integrations can include email, WhatsApp, SMS, payment services, cloud storage and other external APIs.</span>
                  </div>
                </div>

                <div className="farm-settings-divider" />

                <div className="farm-settings-row">
                  <div>
                    <strong>Integration Manager</strong>
                    <span>Connected services and API configurations will be managed here.</span>
                  </div>

                  <span className="farm-system-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRoleModal && selectedRole && (
        <div className="farm-role-modal-backdrop" onClick={closeRoleDetails}>
          <div className="farm-role-modal" onClick={(e) => e.stopPropagation()}>
            <div className="farm-role-modal-head">
              <div>
                <h3>{selectedRole.label}</h3>
                <p>{selectedRole.description}</p>
              </div>

              <button type="button" onClick={closeRoleDetails} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="farm-role-modal-body">
              <div className="farm-role-modal-summary">
                <strong>{(permissions[selectedRole.key] || []).length}</strong>
                <span>Assigned permissions</span>
              </div>

              <div className="farm-role-modal-list">
                {(permissions[selectedRole.key] || []).length > 0 ? (
                  (permissions[selectedRole.key] || []).map((permission) => {
                    const found = permissionList.find((item) => item.key === permission);

                    return (
                      <div className="farm-role-modal-item" key={permission}>
                        <Check size={14} />
                        <span>{found?.label || permission}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="farm-role-modal-empty">No permissions assigned.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        *{box-sizing:border-box}
        .farm-settings-page{width:100%;max-width:1500px;margin:0 auto}
        .farm-settings-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:24px}
        .farm-settings-title-row{display:flex;align-items:center;gap:13px}
        .farm-settings-title-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--admin-primary-soft);color:var(--admin-primary);flex:0 0 auto}
        .farm-settings-title-row h1{margin:0;font-size:26px;line-height:1.2;color:var(--admin-text)}
        .farm-settings-title-row p{margin:6px 0 0;color:var(--admin-muted);font-size:13px}
        .farm-settings-actions{display:flex;align-items:center;gap:10px}
        .farm-settings-reset,.farm-settings-save{height:40px;border-radius:10px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:.2s ease}
        .farm-settings-reset{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text)}
        .farm-settings-reset:hover{border-color:var(--admin-primary);color:var(--admin-primary)}
        .farm-settings-save{border:1px solid var(--admin-primary);background:var(--admin-primary);color:#071006;min-width:135px}
        .farm-settings-save:hover{filter:brightness(1.04)}
        .farm-settings-reset:disabled,.farm-settings-save:disabled{opacity:.65;cursor:not-allowed}
        .farm-settings-spinner{width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:farm-settings-spin .7s linear infinite}
        @keyframes farm-settings-spin{to{transform:rotate(360deg)}}
        .farm-settings-error{margin-bottom:18px;padding:12px 14px;border:1px solid rgba(255,93,108,.25);background:rgba(255,93,108,.08);color:var(--admin-danger);border-radius:10px;font-size:13px}
        .farm-settings-layout{display:grid;grid-template-columns:235px minmax(0,1fr);gap:20px;align-items:start}
        .farm-settings-nav{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;padding:8px;position:sticky;top:94px}
        .farm-settings-nav button{width:100%;height:43px;border:0;background:transparent;color:var(--admin-muted);border-radius:10px;padding:0 11px;display:flex;align-items:center;gap:10px;text-align:left;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:.2s ease}
        .farm-settings-nav button svg:last-child{margin-left:auto}
        .farm-settings-nav button:hover{background:var(--admin-surface-2);color:var(--admin-text)}
        .farm-settings-nav button.active{background:var(--admin-primary-soft);color:var(--admin-primary)}
        .farm-settings-content{min-width:0}
        .farm-settings-section{width:100%}
        .farm-settings-section-title{display:flex;align-items:flex-start;gap:11px;margin-bottom:14px;color:var(--admin-primary)}
        .farm-settings-section-title>svg{margin-top:2px;flex:0 0 auto}
        .farm-settings-section-title h2{margin:0;color:var(--admin-text);font-size:18px}
        .farm-settings-section-title p{margin:4px 0 0;color:var(--admin-muted);font-size:12px}
        .farm-settings-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;padding:18px}
        .farm-settings-row{min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:20px}
        .farm-settings-row>div:first-child{min-width:0}
        .farm-settings-row strong{display:block;color:var(--admin-text);font-size:13px}
        .farm-settings-row>div:first-child span{display:block;margin-top:4px;color:var(--admin-muted);font-size:12px;line-height:1.45}
        .farm-settings-control{position:relative;min-width:190px;display:flex;align-items:center}
        .farm-settings-control select{appearance:none;width:100%;height:38px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);padding:0 34px 0 11px;font:inherit;font-size:12px;outline:none;cursor:pointer}
        .farm-settings-control select:focus{border-color:var(--admin-primary)}
        .farm-settings-control>svg{position:absolute;right:11px;pointer-events:none;color:var(--admin-muted)}
        .farm-settings-divider{height:1px;background:var(--admin-border);margin:4px 0}
        .farm-settings-sidebar-style{margin-top:24px}
        .farm-settings-sidebar-style-head{margin-bottom:14px}
        .farm-settings-sidebar-style-head label{display:block;font-size:14px;font-weight:700;color:var(--admin-text)}
        .farm-settings-sidebar-style-head p{margin:5px 0 0;color:var(--admin-muted);font-size:13px}
        .farm-settings-sidebar-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .farm-sidebar-option{position:relative;text-align:left;padding:12px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface-2);color:var(--admin-text);cursor:pointer;transition:.2s ease;font:inherit}
        .farm-sidebar-option:hover{border-color:var(--admin-primary);transform:translateY(-1px)}
        .farm-sidebar-option.active{border-color:var(--admin-primary);box-shadow:0 0 0 2px var(--admin-primary-soft)}
        .farm-sidebar-preview{height:92px;display:flex;overflow:hidden;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-bg);margin-bottom:12px}
        .farm-preview-sidebar{width:36%;min-width:36%;padding:10px 7px;background:var(--admin-surface);border-right:1px solid var(--admin-border)}
        .farm-preview-sidebar-small{width:22%;min-width:22%}
        .farm-preview-sidebar span{display:block;height:6px;border-radius:3px;background:var(--admin-muted);opacity:.55;margin-bottom:8px}
        .farm-preview-sidebar span:first-child{background:var(--admin-primary);opacity:1}
        .farm-preview-content{flex:1;padding:11px}
        .farm-toggle{position:relative;width:46px;height:25px;flex:0 0 auto;border:1px solid var(--admin-border);border-radius:999px;background:var(--admin-surface-2);padding:0;margin:0;cursor:pointer;transition:.2s ease;box-sizing:border-box;display:block}
        .farm-toggle span{display:block;position:absolute;top:50%;left:3px;width:17px;height:17px;margin:0;padding:0;border-radius:50%;background:var(--admin-muted);transform:translateY(-50%);transition:left .2s ease,background .2s ease;box-sizing:border-box}
        .farm-toggle.active{border-color:var(--admin-primary);background:var(--admin-primary)}
        .farm-toggle.active span{left:24px;margin:0;background:#fff}
        .farm-toggle:focus-visible{outline:2px solid var(--admin-primary);outline-offset:2px}
        .farm-preview-content i{display:block;height:7px;border-radius:4px;background:var(--admin-border);margin-bottom:9px}
        .farm-preview-content i:first-child{width:80%;background:var(--admin-primary-soft)}
        .farm-preview-topbar{width:100%;height:100%;padding:10px;display:flex;align-items:flex-start;gap:10px}
        .farm-preview-topbar b{font-size:15px;color:var(--admin-primary)}
        .farm-preview-topbar span{height:7px;width:55%;margin-top:4px;border-radius:4px;background:var(--admin-border)}
        .farm-sidebar-option-info{display:flex;flex-direction:column;gap:4px;padding-right:30px}
        .farm-sidebar-option-info strong{font-size:14px}
        .farm-sidebar-option-info span{font-size:12px;color:var(--admin-muted);line-height:1.4}
        .farm-sidebar-radio{position:absolute;right:13px;bottom:16px;width:22px;height:22px;border:1px solid var(--admin-border);border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;color:var(--admin-primary);background:var(--admin-surface)}
        .farm-sidebar-option.active .farm-sidebar-radio{border-color:var(--admin-primary);background:var(--admin-primary-soft)}
        .farm-permission-role-bar,.farm-permission-actions{display:flex;align-items:center;justify-content:space-between;gap:20px}
        .farm-permission-role-bar strong,.farm-permission-actions strong{display:block;color:var(--admin-text);font-size:13px}
        .farm-permission-role-bar span,.farm-permission-actions span{display:block;margin-top:4px;color:var(--admin-muted);font-size:12px}
        .farm-permission-actions{padding:15px 0}
        .farm-permission-buttons{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .farm-permission-buttons button{height:34px;padding:0 11px;border-radius:8px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);font:inherit;font-size:11px;font-weight:700;cursor:pointer}
        .farm-permission-buttons button:hover{border-color:var(--admin-primary);color:var(--admin-primary)}
        .farm-permission-buttons button.primary{background:var(--admin-primary);border-color:var(--admin-primary);color:#071006}
        .farm-permission-buttons button:disabled{opacity:.6;cursor:not-allowed}
        .farm-permission-groups{display:flex;flex-direction:column;gap:18px}
        .farm-permission-group-title{margin-bottom:9px;color:var(--admin-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
        .farm-permission-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
        .farm-permission-item{min-height:38px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-muted);border-radius:9px;padding:7px 9px;display:flex;align-items:center;gap:8px;text-align:left;font:inherit;font-size:11px;font-weight:600;cursor:pointer}
        .farm-permission-item:hover{border-color:var(--admin-primary);color:var(--admin-text)}
        .farm-permission-item.active{border-color:var(--admin-primary);background:var(--admin-primary-soft);color:var(--admin-text)}
        .farm-permission-item.disabled{cursor:default}
        .farm-permission-check{width:20px;height:20px;display:grid;place-items:center;border-radius:6px;border:1px solid var(--admin-border);flex:0 0 auto;color:var(--admin-primary)}
        .farm-permission-item.active .farm-permission-check{border-color:var(--admin-primary);background:var(--admin-primary-soft)}
        .farm-settings-loading{padding:15px 0;color:var(--admin-muted);font-size:12px}
        .farm-role-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .farm-role-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;padding:15px}
        .farm-role-card-top{display:flex;gap:11px}
        .farm-role-icon{width:38px;height:38px;border-radius:10px;background:var(--admin-primary-soft);color:var(--admin-primary);display:grid;place-items:center;flex:0 0 auto}
        .farm-role-card-top strong{display:block;color:var(--admin-text);font-size:13px}
        .farm-role-card-top span{display:block;margin-top:4px;color:var(--admin-muted);font-size:11px;line-height:1.45}
        .farm-role-card-bottom{margin-top:15px;padding-top:12px;border-top:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:10px}
        .farm-role-card-bottom>span{color:var(--admin-muted);font-size:11px}
        .farm-role-card-bottom button{border:0;background:transparent;color:var(--admin-primary);display:flex;align-items:center;gap:3px;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
        .farm-settings-info-box{display:flex;align-items:flex-start;gap:12px;padding:15px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2);color:var(--admin-primary)}
        .farm-settings-info-box div{min-width:0}
        .farm-settings-info-box strong{display:block;color:var(--admin-text);font-size:13px}
        .farm-settings-info-box span{display:block;margin-top:5px;color:var(--admin-muted);font-size:12px;line-height:1.5}
        .farm-system-badge{display:inline-flex!important;align-items:center;justify-content:center;background:var(--admin-primary-soft);color:var(--admin-primary)!important;border-radius:999px;padding:5px 9px;margin:0!important;font-size:10px!important;font-weight:800}
        .farm-role-modal-backdrop{position:fixed;z-index:500;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
        .farm-role-modal{width:min(520px,100%);max-height:80vh;overflow:auto;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.3)}
        .farm-role-modal-head{padding:17px 18px;border-bottom:1px solid var(--admin-border);display:flex;align-items:flex-start;justify-content:space-between;gap:15px}
        .farm-role-modal-head h3{margin:0;color:var(--admin-text);font-size:17px}
        .farm-role-modal-head p{margin:5px 0 0;color:var(--admin-muted);font-size:12px;line-height:1.45}
        .farm-role-modal-head button{width:32px;height:32px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted);display:grid;place-items:center;cursor:pointer}
        .farm-role-modal-body{padding:18px}
        .farm-role-modal-summary{padding:13px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2);margin-bottom:14px}
        .farm-role-modal-summary strong{display:block;color:var(--admin-primary);font-size:20px}
        .farm-role-modal-summary span{display:block;margin-top:3px;color:var(--admin-muted);font-size:11px}
        .farm-role-modal-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        .farm-role-modal-item{min-height:35px;padding:7px 9px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface-2);display:flex;align-items:center;gap:7px;color:var(--admin-text);font-size:11px}
        .farm-role-modal-item svg{color:var(--admin-primary);flex:0 0 auto}
        .farm-role-modal-empty{padding:20px;text-align:center;color:var(--admin-muted);font-size:12px;border:1px dashed var(--admin-border);border-radius:10px}
        @media(max-width:1100px){.farm-settings-layout{grid-template-columns:200px minmax(0,1fr)}.farm-permission-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.farm-role-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:850px){.farm-settings-header{align-items:flex-start;flex-direction:column}.farm-settings-actions{width:100%;justify-content:flex-end}.farm-settings-layout{grid-template-columns:1fr}.farm-settings-nav{position:static;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.farm-settings-nav button{height:40px}.farm-role-grid{grid-template-columns:1fr}}
        @media(max-width:700px){.farm-settings-sidebar-options{grid-template-columns:1fr}.farm-settings-row{align-items:flex-start;flex-direction:column;gap:10px;padding:7px 0}.farm-settings-control{width:100%;min-width:0}.farm-permission-role-bar,.farm-permission-actions{align-items:flex-start;flex-direction:column}.farm-permission-buttons{width:100%}.farm-permission-grid{grid-template-columns:1fr}.farm-role-modal-list{grid-template-columns:1fr}}
        @media(max-width:500px){.farm-settings-title-row h1{font-size:21px}.farm-settings-actions{justify-content:stretch}.farm-settings-reset,.farm-settings-save{flex:1}.farm-settings-nav{grid-template-columns:1fr}.farm-settings-card{padding:14px}}
      `}</style>
    </section>
  );
};

export default Settings;
