import { Navigate, Outlet } from "react-router-dom";

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

const AdminOnlyRoute = () => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;
