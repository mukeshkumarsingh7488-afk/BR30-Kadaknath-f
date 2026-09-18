import { LayoutDashboard, Package, ShoppingBag, Users, UserCog, Settings, LogOut, X, ShieldCheck } from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const getStoredUser = () => {
  try {
    const value = localStorage.getItem("user") || localStorage.getItem("authUser") || localStorage.getItem("currentUser");

    if (!value) return null;

    const parsed = JSON.parse(value);

    return parsed?.user || parsed;
  } catch {
    return null;
  }
};

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const isAdmin = user?.role === "admin";

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Customers & Staff",
      path: "/admin/customers",
      icon: Users,
    },
  ];

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

  return (
    <>
      {isOpen && <div className="admin-sidebar-overlay" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <ShieldCheck size={24} />
          </div>

          <div>
            <div className="admin-brand-title">BR30</div>
            <div className="admin-brand-subtitle">ADMIN PANEL</div>
          </div>

          <button type="button" className="admin-mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="admin-user-mini">
          <div className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase() || "A"}</div>

          <div className="admin-user-mini-info">
            <strong>{user?.name || "Admin"}</strong>
            <span>{user?.role || "admin"}</span>
          </div>
        </div>

        <div className="admin-nav-section">
          <div className="admin-nav-title">MAIN MENU</div>

          <nav className="admin-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.path} to={item.path} end={item.end} onClick={onClose} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div className="admin-nav-section">
            <div className="admin-nav-title">MANAGEMENT</div>

            <nav className="admin-nav">
              <NavLink to="/admin/staff" onClick={onClose} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
                <UserCog size={19} />
                <span>Staff Control</span>
              </NavLink>
            </nav>
          </div>
        )}

        <div className="admin-sidebar-bottom">
          <NavLink to="/admin/settings" onClick={onClose} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <button type="button" className="admin-logout-button" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>

        <style>{`
          .admin-sidebar{position:fixed;z-index:100;inset:0 auto 0 0;width:270px;background:var(--admin-surface);border-right:1px solid var(--admin-border);display:flex;flex-direction:column;padding:22px 16px;color:var(--admin-text)}
          .admin-brand{display:flex;align-items:center;gap:12px;padding:4px 8px 24px}
          .admin-brand-mark{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--admin-primary-soft);color:var(--admin-primary)}
          .admin-brand-title{font-size:18px;font-weight:800;letter-spacing:.5px}
          .admin-brand-subtitle{margin-top:2px;font-size:9px;letter-spacing:1.8px;color:var(--admin-muted);font-weight:700}
          .admin-mobile-close{display:none;margin-left:auto;border:0;background:transparent;color:var(--admin-muted);cursor:pointer}
          .admin-user-mini{display:flex;align-items:center;gap:11px;padding:13px;margin-bottom:24px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface-2)}
          .admin-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--admin-primary);color:#071006;font-weight:800}
          .admin-user-mini-info{min-width:0;display:flex;flex-direction:column}
          .admin-user-mini-info strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .admin-user-mini-info span{margin-top:3px;font-size:11px;color:var(--admin-primary);text-transform:capitalize}
          .admin-nav-section{margin-bottom:24px}
          .admin-nav-title{padding:0 10px 9px;color:var(--admin-muted);font-size:10px;font-weight:800;letter-spacing:1.3px}
          .admin-nav{display:grid;gap:5px}
          .admin-nav-link,.admin-logout-button{min-height:44px;padding:0 12px;border-radius:11px;display:flex;align-items:center;gap:12px;color:var(--admin-muted);text-decoration:none;border:0;background:transparent;cursor:pointer;font:inherit;font-size:13px;font-weight:600;transition:.2s ease}
          .admin-nav-link:hover,.admin-logout-button:hover{color:var(--admin-text);background:var(--admin-surface-2)}
          .admin-nav-link.active{color:var(--admin-primary);background:var(--admin-primary-soft)}
          .admin-sidebar-bottom{margin-top:auto;display:grid;gap:5px}
          .admin-logout-button{width:100%;color:var(--admin-danger)}
          .admin-sidebar-overlay{display:none}
          @media (max-width:900px){.admin-sidebar{transform:translateX(-100%);transition:transform .25s ease;box-shadow:20px 0 50px rgba(0,0,0,.25)}.admin-sidebar.admin-sidebar-open{transform:translateX(0)}.admin-mobile-close{display:grid;place-items:center}.admin-sidebar-overlay{display:block;position:fixed;z-index:90;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}}
        `}</style>
      </aside>
    </>
  );
};

export default AdminSidebar;
