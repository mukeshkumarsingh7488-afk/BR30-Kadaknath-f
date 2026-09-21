import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const getSavedSettings = () => {
  try {
    const value = localStorage.getItem("br30-admin-settings");

    if (!value) return {};

    const parsed = JSON.parse(value);

    return parsed || {};
  } catch {
    return {};
  }
};

const getDeviceTheme = () => {
  if (typeof window === "undefined") return "dark";

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

const AdminLayout = () => {
  const savedSettings = getSavedSettings();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return savedSettings.theme || localStorage.getItem("br30-admin-theme") || "dark";
  });

  const [systemTheme, setSystemTheme] = useState(getDeviceTheme);

  const [sidebarMode, setSidebarMode] = useState(() => {
    return savedSettings.sidebarMode || localStorage.getItem("br30-admin-sidebar-mode") || "normal";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateDeviceTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    updateDeviceTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateDeviceTheme);

      return () => {
        mediaQuery.removeEventListener("change", updateDeviceTheme);
      };
    }

    mediaQuery.addListener(updateDeviceTheme);

    return () => {
      mediaQuery.removeListener(updateDeviceTheme);
    };
  }, []);

  const appliedTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      localStorage.setItem("br30-admin-theme", nextTheme);

      try {
        const currentSettings = JSON.parse(localStorage.getItem("br30-admin-settings") || "{}");

        localStorage.setItem(
          "br30-admin-settings",
          JSON.stringify({
            ...currentSettings,
            theme: nextTheme,
          })
        );
      } catch {
        localStorage.setItem(
          "br30-admin-settings",
          JSON.stringify({
            theme: nextTheme,
            sidebarMode,
          })
        );
      }

      return nextTheme;
    });
  };

  const updateSidebarMode = (mode) => {
    const validModes = ["normal", "hamburger", "hover", "compact"];

    const nextMode = validModes.includes(mode) ? mode : "normal";

    setSidebarMode(nextMode);
    setSidebarOpen(false);
  };

  const isFullSidebarMode = sidebarMode === "normal";

  const isRailSidebarMode = sidebarMode === "hover" || sidebarMode === "compact";

  return (
    <div className={`admin-shell admin-theme-${appliedTheme} admin-sidebar-mode-${sidebarMode}`}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} sidebarMode={sidebarMode} />

      <div className={`admin-main ${isFullSidebarMode ? "admin-main-full-sidebar" : isRailSidebarMode ? "admin-main-rail-sidebar" : "admin-main-no-sidebar"}`}>
        <AdminNavbar theme={appliedTheme} onToggleTheme={toggleTheme} onMenuClick={() => setSidebarOpen(true)} sidebarMode={sidebarMode} />

        <main className="admin-content">
          <Outlet
            context={{
              theme,
              setTheme,
              sidebarMode,
              setSidebarMode: updateSidebarMode,
            }}
          />
        </main>
      </div>

      <style>{`
        *{box-sizing:border-box}
        .admin-shell{--admin-bg:#080b12;--admin-surface:#0f141d;--admin-surface-2:#151b26;--admin-border:rgba(255,255,255,0.08);--admin-text:#f5f7fa;--admin-muted:#8e99a9;--admin-primary:#79d34a;--admin-primary-soft:rgba(121,211,74,0.12);--admin-danger:#ff5d6c;--admin-warning:#f6b73c;--admin-info:#5ba7ff;min-height:100vh;display:flex;background:var(--admin-bg);color:var(--admin-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .admin-theme-light{--admin-bg:#f5f7fa;--admin-surface:#ffffff;--admin-surface-2:#f1f4f8;--admin-border:rgba(15,23,42,0.09);--admin-text:#101828;--admin-muted:#667085;--admin-primary:#3f9d22;--admin-primary-soft:rgba(63,157,34,0.10);--admin-danger:#dc3545;--admin-warning:#b77900;--admin-info:#1671d9}
        .admin-main{min-width:0;flex:1;transition:margin-left .25s ease}
        .admin-main-full-sidebar{margin-left:270px}
        .admin-main-rail-sidebar{margin-left:76px}
        .admin-main-no-sidebar{margin-left:0}
        .admin-content{min-height:calc(100vh - 76px);padding:28px;background:var(--admin-bg);color:var(--admin-text)}
        .admin-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:18px}
        .admin-button{border:0;cursor:pointer;border-radius:10px;transition:.2s ease;font:inherit}
        .admin-button:disabled{opacity:.55;cursor:not-allowed}
        @media (max-width:900px){
          .admin-main-full-sidebar,.admin-main-rail-sidebar,.admin-main-no-sidebar{margin-left:0}
          .admin-content{padding:20px 16px}
        }
        @media (max-width:600px){
          .admin-content{padding:16px 12px}
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
