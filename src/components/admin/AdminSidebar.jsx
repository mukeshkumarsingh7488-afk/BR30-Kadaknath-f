import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Plus,
  Package,
  Sparkles,
  ShoppingBag,
  Users,
  UserCog,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  RotateCcw,
  Bird,
  Boxes,
  Egg,
  Scale,
  Wheat,
  Pill,
  Syringe,
  Stethoscope,
  Droplets,
  ClipboardCheck,
  ClipboardList,
  WalletCards,
  Shield,
  Warehouse,
  Wrench,
  Receipt,
  BarChart3,
  Baby,
  Skull,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const getStoredUser = () => {
  try {
    const value = localStorage.getItem("br30_user") || localStorage.getItem("user") || localStorage.getItem("authUser") || localStorage.getItem("currentUser");

    if (!value) return null;

    const parsed = JSON.parse(value);

    return parsed?.user || parsed;
  } catch {
    return null;
  }
};

const AdminSidebar = ({ isOpen, onClose, sidebarMode = "normal" }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 900 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isAdmin = user?.role === "admin";

  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];

  const hasPermission = (permission) => {
    if (isAdmin) return true;

    return userPermissions.includes(permission);
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
      permission: "dashboard",
    },
    {
      label: "What's New",
      path: "/admin/whats-new",
      icon: Sparkles,
      permission: "what's New",
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
      permission: "orders",
    },
    {
      label: "Refunds",
      path: "/admin/refunds",
      icon: RotateCcw,
      permission: "refunds",
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
      permission: "products",
    },
    {
      label: "Customers & Staff",
      path: "/admin/customers",
      icon: Users,
      permission: "customers-staff",
    },
  ];

  const farmOsItems = [
    {
      label: "Farm Dashboard",
      path: "/admin/farm-dashboard",
      icon: LayoutDashboard,
      end: true,
      permission: "farm-dashboard",
    },
    {
      label: "Create Farm",
      path: "/admin/farm/create-farm",
      icon: Plus,
      permission: "farms",
    },
    {
      label: "Shed Management",
      path: "/admin/farm/sheds",
      icon: Warehouse,
      permission: "sheds",
    },
    {
      label: "Shed Maintenance",
      path: "/admin/farm/shed-maintenance",
      icon: Wrench,
      permission: "shed-maintenance",
    },
    {
      label: "Batches",
      path: "/admin/farm/batches",
      icon: Bird,
      permission: "batches",
    },
    {
      label: "Chicks Inward",
      path: "/admin/farm/chicks-inward",
      icon: Baby,
      permission: "chicks-inward",
    },
    {
      label: "Bird Stock",
      path: "/admin/farm/bird-stock",
      icon: Boxes,
      permission: "bird-stock",
    },
    {
      label: "Farm Mortality",
      path: "/admin/farm/mortality",
      icon: Skull,
      permission: "mortality",
    },
    {
      label: "Weight & Growth",
      path: "/admin/farm/weight-growth",
      icon: Scale,
      permission: "weight-growth",
    },
    {
      label: "Egg Collection",
      path: "/admin/farm/egg-collection",
      icon: Egg,
      permission: "egg-collection",
    },
    {
      label: "Feed Inventory",
      path: "/admin/farm/feed-inventory",
      icon: Wheat,
      permission: "feed-inventory",
    },
    {
      label: "Feed Consumption",
      path: "/admin/farm/feed-consumption",
      icon: ClipboardCheck,
      permission: "feed-consumption",
    },
    {
      label: "Medicine & Vaccine",
      path: "/admin/farm/medicine-vaccine",
      icon: Pill,
      permission: "medicine-vaccine",
    },
    {
      label: "Vaccination Schedule",
      path: "/admin/farm/vaccination-schedule",
      icon: Syringe,
      permission: "vaccination-schedule",
    },
    {
      label: "Veterinary Logs",
      path: "/admin/farm/veterinary-logs",
      icon: Stethoscope,
      permission: "veterinary-logs",
    },
    {
      label: "Water Quality",
      path: "/admin/farm/water-quality",
      icon: Droplets,
      permission: "water-quality",
    },
    {
      label: "Staff Attendance",
      path: "/admin/farm/staff-attendance",
      icon: UserCog,
      permission: "staff-attendance",
    },
    {
      label: "Farm Tasks",
      path: "/admin/farm/tasks",
      icon: ClipboardList,
      permission: "tasks",
    },
    {
      label: "Payroll",
      path: "/admin/farm/payroll",
      icon: WalletCards,
      permission: "payroll",
    },
    {
      label: "Biosecurity",
      path: "/admin/farm/biosecurity",
      icon: Shield,
      permission: "biosecurity",
    },
    {
      label: "Sales & Billing",
      path: "/admin/farm/sales",
      icon: Receipt,
      permission: "sales",
    },
    {
      label: "Farm Reports",
      path: "/admin/farm/reports",
      icon: BarChart3,
      permission: "farm-reports",
    },
    {
      label: "Farm Expenses",
      path: "/admin/farm/expenses",
      icon: Receipt,
      permission: "farm-expenses",
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));

  const visibleFarmOsItems = farmOsItems.filter((item) => hasPermission(item.permission));

  const showStaffControl = hasPermission("staff-control");

  const isNormal = sidebarMode === "normal";
  const isHamburger = sidebarMode === "hamburger";
  const isHover = sidebarMode === "hover";
  const isCompact = sidebarMode === "compact";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be signed out from the admin panel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Stay",
      reverseButtons: true,
      background: "#11161f",
      color: "#fff",
      confirmButtonColor: "#79d34a",
      cancelButtonColor: "#475467",
    });

    if (!result.isConfirmed) return;

    localStorage.removeItem("br30_access_token");
    localStorage.removeItem("br30_user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("authUser");
    localStorage.removeItem("currentUser");

    await Swal.fire({
      title: "Logged out",
      text: "You have been logged out successfully.",
      icon: "success",
      timer: 1300,
      showConfirmButton: false,
      background: "#11161f",
      color: "#fff",
    });

    navigate("/login", { replace: true });
  };

  const handleLinkClick = () => {
    if (isHamburger || isMobile) {
      onClose?.();
    }
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink key={item.path} to={item.path} end={item.end} onClick={handleLinkClick} title={!isNormal && !isHover ? item.label : ""} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
        <Icon size={19} />

        <span className="admin-nav-link-label">{item.label}</span>

        {!isNormal && !isHover && <span className="admin-nav-tooltip">{item.label}</span>}
      </NavLink>
    );
  };

  const renderSection = (title, items) => {
    if (!items.length) return null;

    return (
      <div className="admin-nav-section">
        <div className="admin-nav-title">{title}</div>

        <nav className="admin-nav">{items.map(renderNavItem)}</nav>
      </div>
    );
  };

  return (
    <>
      {(isHamburger || isMobile) && isOpen && <div className="admin-sidebar-overlay" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""} ${isNormal ? "admin-sidebar-normal" : isHamburger ? "admin-sidebar-hamburger" : isHover ? "admin-sidebar-hover" : "admin-sidebar-compact"}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <ShieldCheck size={24} />
          </div>

          <div className="admin-brand-text">
            <div className="admin-brand-title">BR30</div>

            <div className="admin-brand-subtitle">ADMIN PANEL</div>
          </div>

          <button type="button" className="admin-mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <button type="button" className="admin-user-mini" onClick={() => navigate("/admin")} title="Go to Admin Dashboard">
          <div className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase() || "A"}</div>

          <div className="admin-user-mini-info">
            <strong>{user?.name || "Admin"}</strong>
            <span>{user?.role || "admin"}</span>
          </div>
        </button>

        <div className="admin-sidebar-scroll">
          {renderSection("MAIN MENU", visibleMenuItems)}

          {renderSection("FARM OS", visibleFarmOsItems)}

          {showStaffControl && (
            <div className="admin-nav-section">
              <div className="admin-nav-title">MANAGEMENT</div>

              <nav className="admin-nav">
                <NavLink to="/admin/staff" onClick={handleLinkClick} title={!isNormal && !isHover ? "Staff Control" : ""} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
                  <UserCog size={19} />

                  <span className="admin-nav-link-label">Staff Control</span>

                  {!isNormal && !isHover && <span className="admin-nav-tooltip">Staff Control</span>}
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        <div className="admin-sidebar-bottom">
          {hasPermission("settings") && (
            <NavLink to="/admin/settings" onClick={handleLinkClick} title={!isNormal && !isHover ? "Settings" : ""} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
              <Settings size={19} />

              <span className="admin-nav-link-label">Settings</span>

              {!isNormal && !isHover && <span className="admin-nav-tooltip">Settings</span>}
            </NavLink>
          )}

          <button type="button" className="admin-logout-button" onClick={handleLogout} title={!isNormal && !isHover ? "Logout" : ""}>
            <LogOut size={19} />

            <span className="admin-nav-link-label">Logout</span>

            {!isNormal && !isHover && <span className="admin-nav-tooltip">Logout</span>}
          </button>
        </div>

        <style>{`
          .admin-sidebar{position:fixed;z-index:100;inset:0 auto 0 0;width:270px;background:var(--admin-surface);border-right:1px solid var(--admin-border);display:flex;flex-direction:column;padding:22px 16px;color:var(--admin-text);transition:width .25s ease,transform .25s ease,box-shadow .25s ease;overflow:visible}
          .admin-sidebar-normal{width:270px}
          .admin-sidebar-hamburger{width:270px;transform:translateX(-100%);box-shadow:20px 0 50px rgba(0,0,0,.25)}
          .admin-sidebar-hamburger.admin-sidebar-open{transform:translateX(0)}
          .admin-sidebar-hover{width:76px;padding:22px 10px}
          .admin-sidebar-hover:hover{width:270px;box-shadow:20px 0 50px rgba(0,0,0,.22)}
          .admin-sidebar-compact{width:76px;padding:22px 10px}
          .admin-brand{display:flex;align-items:center;gap:12px;padding:4px 8px 24px;flex-shrink:0;min-width:0}
          .admin-brand-mark{width:42px;height:42px;min-width:42px;border-radius:12px;display:grid;place-items:center;background:var(--admin-primary-soft);color:var(--admin-primary)}
          .admin-brand-text{min-width:0;overflow:hidden;transition:opacity .18s ease,width .18s ease}
          .admin-brand-title{font-size:18px;font-weight:800;letter-spacing:.5px}
          .admin-brand-subtitle{margin-top:2px;font-size:9px;letter-spacing:1.8px;color:var(--admin-muted);font-weight:700;white-space:nowrap}
          .admin-mobile-close{display:none;margin-left:auto;border:0;background:transparent;color:var(--admin-muted);cursor:pointer}
          .admin-user-mini{width:100%;display:flex;align-items:center;gap:11px;padding:13px;margin-bottom:18px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface-2);flex-shrink:0;min-width:0;overflow:hidden;color:var(--admin-text);font:inherit;text-align:left;cursor:pointer;transition:.2s ease}.admin-user-mini:hover{border-color:var(--admin-primary);background:var(--admin-primary-soft)}
          .admin-avatar{width:38px;height:38px;min-width:38px;border-radius:50%;display:grid;place-items:center;background:var(--admin-primary);color:#071006;font-weight:800}
          .admin-user-mini-info{min-width:0;display:flex;flex-direction:column;overflow:hidden}
          .admin-user-mini-info strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .admin-user-mini-info span{margin-top:3px;font-size:11px;color:var(--admin-primary);text-transform:capitalize}
          .admin-sidebar-scroll{min-height:0;overflow-y:auto;overflow-x:hidden;padding-right:3px;scrollbar-width:thin}
          .admin-sidebar-scroll::-webkit-scrollbar{width:5px}
          .admin-sidebar-scroll::-webkit-scrollbar-thumb{background:var(--admin-border);border-radius:10px}
          .admin-nav-section{margin-bottom:24px}
          .admin-nav-title{padding:0 10px 9px;color:var(--admin-muted);font-size:10px;font-weight:800;letter-spacing:1.3px;white-space:nowrap;overflow:hidden}
          .admin-nav{display:grid;gap:5px}
          .admin-nav-link,.admin-logout-button{position:relative;min-height:44px;padding:0 12px;border-radius:11px;display:flex;align-items:center;gap:12px;color:var(--admin-muted);text-decoration:none;border:0;background:transparent;cursor:pointer;font:inherit;font-size:13px;font-weight:600;transition:.2s ease;min-width:0}
          .admin-nav-link svg,.admin-logout-button svg{flex:0 0 auto}
          .admin-nav-link:hover,.admin-logout-button:hover{color:var(--admin-text);background:var(--admin-surface-2)}
          .admin-nav-link.active{color:var(--admin-primary);background:var(--admin-primary-soft)}
          .admin-nav-link-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity .15s ease}
          .admin-sidebar-bottom{margin-top:auto;padding-top:14px;display:grid;gap:5px;border-top:1px solid var(--admin-border);flex-shrink:0}
          .admin-logout-button{width:100%;color:var(--admin-danger)}
          .admin-sidebar-overlay{display:block;position:fixed;z-index:90;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}
          .admin-nav-tooltip{position:absolute;left:calc(100% + 12px);top:50%;transform:translateY(-50%) translateX(-4px);padding:7px 10px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);color:var(--admin-text);font-size:11px;font-weight:650;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:.15s ease;z-index:300}
          .admin-sidebar-compact .admin-nav-link:hover .admin-nav-tooltip,.admin-sidebar-compact .admin-logout-button:hover .admin-nav-tooltip{opacity:1;transform:translateY(-50%) translateX(0)}
          .admin-sidebar-compact .admin-brand,.admin-sidebar-hover .admin-brand{justify-content:center;padding-left:0;padding-right:0}
          .admin-sidebar-compact .admin-brand-text,.admin-sidebar-hover:not(:hover) .admin-brand-text{width:0;opacity:0}
          .admin-sidebar-compact .admin-user-mini,.admin-sidebar-hover:not(:hover) .admin-user-mini{justify-content:center;padding:8px}
          .admin-sidebar-compact .admin-user-mini-info,.admin-sidebar-hover:not(:hover) .admin-user-mini-info{width:0;opacity:0}
          .admin-sidebar-compact .admin-nav-title,.admin-sidebar-hover:not(:hover) .admin-nav-title{height:0;padding:0;margin:0;opacity:0}
          .admin-sidebar-compact .admin-nav-link,.admin-sidebar-hover:not(:hover) .admin-nav-link,.admin-sidebar-compact .admin-logout-button,.admin-sidebar-hover:not(:hover) .admin-logout-button{justify-content:center;padding-left:0;padding-right:0}
          .admin-sidebar-compact .admin-nav-link-label,.admin-sidebar-hover:not(:hover) .admin-nav-link-label{width:0;opacity:0}
          .admin-sidebar-hover:hover .admin-brand-text,.admin-sidebar-hover:hover .admin-user-mini-info,.admin-sidebar-hover:hover .admin-nav-link-label{width:auto;opacity:1}
          .admin-sidebar-hover:hover .admin-brand{justify-content:flex-start;padding-left:8px;padding-right:8px}
          .admin-sidebar-hover:hover .admin-user-mini{justify-content:flex-start;padding:13px}
          .admin-sidebar-hover:hover .admin-nav-title{height:auto;padding:0 10px 9px;margin:0;opacity:1}
          .admin-sidebar-hover:hover .admin-nav-link,.admin-sidebar-hover:hover .admin-logout-button{justify-content:flex-start;padding-left:12px;padding-right:12px}
          .admin-sidebar-compact .admin-sidebar-scroll,.admin-sidebar-hover:not(:hover) .admin-sidebar-scroll{overflow-y:auto;overflow-x:hidden}
          @media(max-width:900px){
            .admin-sidebar-normal,.admin-sidebar-hover,.admin-sidebar-compact{transform:translateX(-100%);box-shadow:20px 0 50px rgba(0,0,0,.25);width:270px;padding:22px 16px}
            .admin-sidebar-normal.admin-sidebar-open,.admin-sidebar-hover.admin-sidebar-open,.admin-sidebar-compact.admin-sidebar-open{transform:translateX(0)}
            .admin-sidebar-hover:hover{width:270px}
            .admin-sidebar-hover .admin-brand-text,.admin-sidebar-compact .admin-brand-text{width:auto;opacity:1}
            .admin-sidebar-hover .admin-user-mini-info,.admin-sidebar-compact .admin-user-mini-info{width:auto;opacity:1}
            .admin-sidebar-hover .admin-nav-title,.admin-sidebar-compact .admin-nav-title{height:auto;padding:0 10px 9px;opacity:1}
            .admin-sidebar-hover .admin-nav-link,.admin-sidebar-compact .admin-nav-link,.admin-sidebar-hover .admin-logout-button,.admin-sidebar-compact .admin-logout-button{justify-content:flex-start;padding-left:12px;padding-right:12px}
            .admin-sidebar-hover .admin-nav-link-label,.admin-sidebar-compact .admin-nav-link-label{width:auto;opacity:1}
            .admin-sidebar-hover .admin-brand,.admin-sidebar-compact .admin-brand{justify-content:flex-start;padding-left:8px;padding-right:8px}
            .admin-sidebar-hover .admin-user-mini,.admin-sidebar-compact .admin-user-mini{justify-content:flex-start;padding:13px}
            .admin-mobile-close{display:grid;place-items:center}
            .admin-sidebar-hamburger{width:270px}
          }
        `}</style>
      </aside>
    </>
  );
};

export default AdminSidebar;
