import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("br30-admin-theme") || "dark";
  });

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("br30-admin-theme", nextTheme);
      return nextTheme;
    });
  };

  return (
    <div className={`admin-shell admin-theme-${theme}`}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <AdminNavbar theme={theme} onToggleTheme={toggleTheme} onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        *{box-sizing:border-box}
        .admin-shell{--admin-bg:#080b12;--admin-surface:#0f141d;--admin-surface-2:#151b26;--admin-border:rgba(255,255,255,0.08);--admin-text:#f5f7fa;--admin-muted:#8e99a9;--admin-primary:#79d34a;--admin-primary-soft:rgba(121,211,74,0.12);--admin-danger:#ff5d6c;--admin-warning:#f6b73c;--admin-info:#5ba7ff;min-height:100vh;display:flex;background:var(--admin-bg);color:var(--admin-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .admin-theme-light{--admin-bg:#f5f7fa;--admin-surface:#ffffff;--admin-surface-2:#f1f4f8;--admin-border:rgba(15,23,42,0.09);--admin-text:#101828;--admin-muted:#667085;--admin-primary:#3f9d22;--admin-primary-soft:rgba(63,157,34,0.10);--admin-danger:#dc3545;--admin-warning:#b77900;--admin-info:#1671d9}
        .admin-main{min-width:0;flex:1;margin-left:270px}
        .admin-content{min-height:calc(100vh - 76px);padding:28px;background:var(--admin-bg);color:var(--admin-text)}
        .admin-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:18px}
        .admin-button{border:0;cursor:pointer;border-radius:10px;transition:.2s ease;font:inherit}
        .admin-button:disabled{opacity:.55;cursor:not-allowed}
        @media (max-width:900px){.admin-main{margin-left:0}.admin-content{padding:20px 16px}}
        @media (max-width:600px){.admin-content{padding:16px 12px}}
      `}</style>
    </div>
  );
};

export default AdminLayout;
