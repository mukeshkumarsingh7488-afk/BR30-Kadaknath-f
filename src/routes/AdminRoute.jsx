import { Navigate, Outlet, useLocation } from "react-router-dom";

const getStoredUser = () => {
  try {
    const possibleKeys = ["br30_user", "user", "authUser", "currentUser"];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed?.user) {
        return parsed.user;
      }

      return parsed;
    }

    return null;
  } catch {
    return null;
  }
};

const permissionMap = [
  { path: "/admin", permission: "dashboard" },
  { path: "/admin/orders", permission: "orders" },
  { path: "/admin/refunds", permission: "refunds" },
  { path: "/admin/products", permission: "products" },
  { path: "/admin/customers", permission: "customers-staff" },

  { path: "/admin/farm-dashboard", permission: "farm-dashboard" },
  { path: "/admin/farm/create-farm", permission: "farms" },
  { path: "/admin/farm/sheds", permission: "sheds" },
  { path: "/admin/farm/shed-maintenance", permission: "shed-maintenance" },
  { path: "/admin/farm/batches", permission: "batches" },
  { path: "/admin/farm/chicks-inward", permission: "chicks-inward" },
  { path: "/admin/farm/bird-stock", permission: "bird-stock" },
  { path: "/admin/farm/mortality", permission: "mortality" },
  { path: "/admin/farm/weight-growth", permission: "weight-growth" },
  { path: "/admin/farm/egg-collection", permission: "egg-collection" },
  { path: "/admin/farm/feed-inventory", permission: "feed-inventory" },
  { path: "/admin/farm/feed-consumption", permission: "feed-consumption" },
  { path: "/admin/farm/medicine-vaccine", permission: "medicine-vaccine" },
  { path: "/admin/farm/vaccination-schedule", permission: "vaccination-schedule" },
  { path: "/admin/farm/veterinary-logs", permission: "veterinary-logs" },
  { path: "/admin/farm/water-quality", permission: "water-quality" },
  { path: "/admin/farm/staff-attendance", permission: "staff-attendance" },
  { path: "/admin/farm/tasks", permission: "tasks" },
  { path: "/admin/farm/payroll", permission: "payroll" },
  { path: "/admin/farm/biosecurity", permission: "biosecurity" },
  { path: "/admin/farm/sales", permission: "sales" },
  { path: "/admin/farm/reports", permission: "farm-reports" },
  { path: "/admin/farm/expenses", permission: "farm-expenses" },

  { path: "/admin/staff", permission: "staff-control" },
  { path: "/admin/settings", permission: "settings" },
];

const getFirstAllowedPath = (user) => {
  if (!user || user.role === "admin") {
    return "/admin";
  }

  const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];

  const allowedRoute = permissionMap.find((item) => userPermissions.includes(item.permission));

  return allowedRoute?.path || "/";
};

const AdminRoute = () => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  if (!["admin", "staff", "fm", "security"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Admin automatically has full access.
  if (user.role === "admin") {
    return <Outlet />;
  }

  const currentPermission = permissionMap.find((item) => {
    if (item.path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  });

  // Unknown admin route is not allowed for non-admin roles.
  if (!currentPermission) {
    return <Navigate to={getFirstAllowedPath(user)} replace />;
  }

  const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];

  if (!userPermissions.includes(currentPermission.permission)) {
    return <Navigate to={getFirstAllowedPath(user)} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
