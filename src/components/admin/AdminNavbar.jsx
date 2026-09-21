import { Bell, Menu, Moon, Sun, ChevronDown, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const AdminNavbar = ({ theme, onToggleTheme, onMenuClick, sidebarMode = "normal" }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const showMenuButton = sidebarMode === "hamburger";

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button type="button" className={`admin-menu-button ${showMenuButton ? "admin-menu-button-visible" : ""}`} onClick={onMenuClick} aria-label="Open menu" title="Open menu">
          <Menu size={21} />
        </button>

        <div className="admin-page-context">
          <ShieldCheck size={18} />
          <span>Administration</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        <button type="button" className="admin-icon-button" title="Notifications">
          <Bell size={19} />
          <span className="admin-notification-dot" />
        </button>

        {/* 
<button
  type="button"
  className="admin-theme-button"
  onClick={onToggleTheme}
  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
>
  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}

  <span>{theme === "dark" ? "Light" : "Dark"}</span>
</button>
*/}

        <button type="button" className="admin-navbar-user" onClick={() => navigate("/profile")} title="View Profile">
          <div className="admin-navbar-avatar">{user?.name?.charAt(0)?.toUpperCase() || "A"}</div>

          <div className="admin-navbar-user-info">
            <strong>{user?.name || "Admin"}</strong>
            <span>{user?.role || "admin"}</span>
          </div>

          <ChevronDown size={15} />
        </button>
      </div>

      <style>{`
        .admin-navbar{height:76px;padding:0 28px;position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:20px;background:color-mix(in srgb,var(--admin-surface) 92%,transparent);border-bottom:1px solid var(--admin-border);backdrop-filter:blur(16px)}
        .admin-navbar-left,.admin-navbar-right{display:flex;align-items:center}
        .admin-navbar-left{gap:12px}
        .admin-navbar-right{gap:10px}
        .admin-menu-button{display:none;width:40px;height:40px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2);color:var(--admin-text);cursor:pointer}
        .admin-menu-button-visible{display:grid;place-items:center}
        .admin-page-context{display:flex;align-items:center;gap:9px;color:var(--admin-muted);font-size:13px;font-weight:600}
        .admin-page-context svg{color:var(--admin-primary)}
        .admin-icon-button,.admin-theme-button{position:relative;height:40px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2);color:var(--admin-text);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s ease}
        .admin-icon-button{width:40px}
        .admin-icon-button:hover,.admin-theme-button:hover{border-color:var(--admin-primary);color:var(--admin-primary)}
        .admin-theme-button{padding:0 12px;gap:7px;font-size:12px;font-weight:700}
        .admin-notification-dot{position:absolute;top:8px;right:8px;width:6px;height:6px;border-radius:50%;background:var(--admin-danger)}
        .admin-navbar-user{display:flex;align-items:center;gap:9px;margin-left:4px;padding:0 0 0 12px;border:0;border-left:1px solid var(--admin-border);background:transparent;color:var(--admin-text);font:inherit;cursor:pointer;text-align:left}
        .admin-navbar-user:hover .admin-navbar-user-info strong{color:var(--admin-primary)}
        .admin-navbar-user:hover .admin-navbar-avatar{background:var(--admin-primary-soft)}
        .admin-navbar-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--admin-primary-soft);color:var(--admin-primary);font-size:13px;font-weight:800}
        .admin-navbar-user-info{display:flex;flex-direction:column;min-width:75px}
        .admin-navbar-user-info strong{font-size:12px}
        .admin-navbar-user-info span{margin-top:2px;color:var(--admin-muted);font-size:10px;text-transform:capitalize}
        @media(max-width:900px){
          .admin-navbar{padding:0 16px}
          .admin-menu-button{display:grid;place-items:center}
        }
        @media(max-width:600px){
          .admin-navbar{height:68px}
          .admin-page-context{display:none}
          .admin-theme-button span,.admin-navbar-user-info,.admin-navbar-user>svg{display:none}
          .admin-theme-button{width:40px;padding:0}
          .admin-navbar-user{border-left:0;padding-left:0}
        }
      `}</style>
    </header>
  );
};

export default AdminNavbar;
