import { Navigate, Outlet, useLocation } from "react-router-dom";

const getStoredUser = () => {
  try {
    const possibleKeys = ["user", "authUser", "currentUser"];

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

const AdminRoute = () => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!["admin", "staff"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.isBlocked) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
