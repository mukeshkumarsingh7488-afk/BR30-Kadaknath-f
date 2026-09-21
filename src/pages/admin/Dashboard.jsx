import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Users, UserCog, ShoppingBag, Package, IndianRupee, Clock3, Truck, CheckCircle2, XCircle, ArrowUpRight, ShieldCheck } from "lucide-react";

import apiRequest from "../../api/api";
import { showError } from "../../utils/sweetAlert";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const welcomeName = user?.role === "admin" ? "Admin" : user?.name || "User";

  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    users: {
      total: 0,
      customers: 0,
      staff: 0,
      admins: 0,
      blocked: 0,
    },
    orders: {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      paid: 0,
    },
    products: {
      total: 0,
      active: 0,
      lowStock: 0,
    },
    revenue: 0,
    recentOrders: [],
    admin: null,
  });

  useEffect(() => {
    document.title = "Admin Dashboard | BR30 Kadaknath Farms";
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await apiRequest("/admin/dashboard");

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load dashboard");
      }

      setDashboard(response.data || {});
    } catch (error) {
      console.error("Admin dashboard error:", error);

      if (error?.status === 401 || error?.status === 403) {
        await showError("Access Denied", "You are not authorized to access the admin dashboard.");
        navigate("/login", { replace: true });
        return;
      }

      await showError("Dashboard Error", error?.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "delivered") return "status delivered";
    if (value === "shipped") return "status shipped";
    if (value === "processing") return "status processing";
    if (value === "cancelled") return "status cancelled";

    return "status pending";
  };

  const stats = [
    {
      title: "Total Users",
      value: dashboard.users?.total || 0,
      icon: Users,
      className: "blue",
    },
    {
      title: "Customers",
      value: dashboard.users?.customers || 0,
      icon: Users,
      className: "green",
    },
    {
      title: "Staff Members",
      value: dashboard.users?.staff || 0,
      icon: UserCog,
      className: "purple",
    },
    {
      title: "Blocked Users",
      value: dashboard.users?.blocked || 0,
      icon: ShieldCheck,
      className: "red",
    },
    {
      title: "Total Orders",
      value: dashboard.orders?.total || 0,
      icon: ShoppingBag,
      className: "orange",
    },
    {
      title: "Paid Orders",
      value: dashboard.orders?.paid || 0,
      icon: CheckCircle2,
      className: "cyan",
    },
    {
      title: "Products",
      value: dashboard.products?.total || 0,
      icon: Package,
      className: "pink",
    },
    {
      title: "Revenue",
      value: formatCurrency(dashboard.revenue || 0),
      icon: IndianRupee,
      className: "gold",
    },
  ];

  const orderStatus = [
    {
      title: "Pending",
      value: dashboard.orders?.pending || 0,
      icon: Clock3,
    },
    {
      title: "Processing",
      value: dashboard.orders?.processing || 0,
      icon: Package,
    },
    {
      title: "Shipped",
      value: dashboard.orders?.shipped || 0,
      icon: Truck,
    },
    {
      title: "Delivered",
      value: dashboard.orders?.delivered || 0,
      icon: CheckCircle2,
    },
    {
      title: "Cancelled",
      value: dashboard.orders?.cancelled || 0,
      icon: XCircle,
    },
  ];

  if (loading) {
    return (
      <>
        <div className="admin-dashboard-loading">
          <div className="dashboard-loader" />
          <span>Loading dashboard...</span>
        </div>

        <style>{`
          .admin-dashboard-loading{min-height:calc(100vh - 132px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--admin-muted);font-size:13px}
          .dashboard-loader{width:36px;height:36px;border:3px solid var(--admin-border);border-top-color:var(--admin-primary);border-radius:50%;animation:dashboard-spin .8s linear infinite}
          @keyframes dashboard-spin{to{transform:rotate(360deg)}}
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="admin-dashboard">
        <div className="welcome-card">
          <div>
            <h2>Welcome back, {welcomeName} 👋</h2>
            <p>Here's what's happening with your store today.</p>
          </div>

          <div className="admin-badge">
            <ShieldCheck size={16} />
            ADMIN ACCESS
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="stat-card" key={stat.title}>
                <div className={`stat-icon ${stat.className}`}>
                  <Icon size={21} />
                </div>

                <div>
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Recent Orders</h3>

              <button type="button" className="view-btn" onClick={() => navigate("/admin/orders")}>
                View All
                <ArrowUpRight size={13} />
              </button>
            </div>

            {dashboard.recentOrders?.length > 0 ? (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-number">{order.orderNumber || "-"}</span>
                        </td>

                        <td>
                          <span className="customer-name">{order.user?.name || order.shippingAddress?.fullName || "Customer"}</span>

                          {order.user?.email && <span className="customer-email">{order.user.email}</span>}
                        </td>

                        <td>{formatDate(order.createdAt)}</td>

                        <td>
                          <strong>{formatCurrency(order.total || 0)}</strong>
                        </td>

                        <td>
                          <span className={statusClass(order.orderStatus)}>{order.orderStatus || "PENDING"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No orders found.</div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Order Overview</h3>
            </div>

            <div className="status-grid">
              {orderStatus.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="status-card" key={item.title}>
                    <div className="status-card-left">
                      <div className="status-card-icon">
                        <Icon size={16} />
                      </div>

                      <span>{item.title}</span>
                    </div>

                    <strong>{item.value}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel quick-management-panel">
          <div className="panel-header">
            <h3>Quick Management</h3>
          </div>

          <div className="quick-management-body">
            <div className="quick-actions">
              <button type="button" className="quick-btn" onClick={() => navigate("/admin/orders")}>
                <ShoppingBag size={21} />

                <div>
                  <strong>Manage Orders</strong>
                  <span>View and update customer orders</span>
                </div>
              </button>

              <button type="button" className="quick-btn" onClick={() => navigate("/admin/customers")}>
                <UserCog size={21} />

                <div>
                  <strong>Customers & Staff</strong>
                  <span>Manage roles and blocked users</span>
                </div>
              </button>

              <button type="button" className="quick-btn" onClick={() => navigate("/admin/products")}>
                <Package size={21} />

                <div>
                  <strong>Products</strong>
                  <span>Manage products and inventory</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard{width:100%;min-height:calc(100vh - 132px);color:var(--admin-text)}
        .welcome-card{border-radius:18px;padding:24px;margin-bottom:24px;background:linear-gradient(135deg,#14532d,#166534,#15803d);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:20px;overflow:hidden;position:relative;box-shadow:0 15px 35px rgba(21,128,61,.18)}
        .welcome-card:after{content:"";position:absolute;width:230px;height:230px;right:-80px;top:-100px;border-radius:50%;background:rgba(255,255,255,.08)}
        .welcome-card h2{margin:0 0 7px;font-size:24px}
        .welcome-card p{margin:0;color:#dcfce7;font-size:13px}
        .admin-badge{position:relative;z-index:2;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);font-size:12px;font-weight:700}
        .stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:24px}
        .stat-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:15px;padding:18px;display:flex;align-items:center;gap:14px;transition:.2s ease;color:var(--admin-text)}
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(15,23,42,.08)}
        .stat-icon{width:46px;height:46px;flex:0 0 46px;border-radius:12px;display:flex;align-items:center;justify-content:center}
        .blue{background:#dbeafe;color:#2563eb}
        .green{background:#dcfce7;color:#16a34a}
        .purple{background:#f3e8ff;color:#9333ea}
        .red{background:#fee2e2;color:#dc2626}
        .orange{background:#ffedd5;color:#ea580c}
        .cyan{background:#cffafe;color:#0891b2}
        .pink{background:#fce7f3;color:#db2777}
        .gold{background:#fef3c7;color:#d97706}
        .admin-theme-light .stat-card:hover{box-shadow:0 10px 25px rgba(15,23,42,.08)}
        .admin-theme-dark .stat-card:hover{box-shadow:0 10px 25px rgba(0,0,0,.25)}
        .stat-title{font-size:12px;color:var(--admin-muted);margin-bottom:4px}
        .stat-value{font-size:21px;font-weight:800;color:var(--admin-text)}
        .dashboard-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;margin-bottom:20px}
        .panel{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:16px;overflow:hidden;color:var(--admin-text)}
        .panel-header{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--admin-border)}
        .panel-header h3{margin:0;font-size:15px;font-weight:800;color:var(--admin-text)}
        .view-btn{border:0;background:transparent;color:var(--admin-primary);font-size:12px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:4px}
        .view-btn:hover{opacity:.8}
        .orders-table-wrapper{width:100%;overflow-x:auto}
        .orders-table{width:100%;border-collapse:collapse}
        .orders-table th{text-align:left;padding:12px 20px;font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:var(--admin-muted);background:var(--admin-surface-2);white-space:nowrap}
        .orders-table td{padding:13px 20px;border-top:1px solid var(--admin-border);font-size:12px;color:var(--admin-text);white-space:nowrap}
        .order-number{font-weight:800}
        .customer-name{font-weight:600}
        .customer-email{display:block;color:var(--admin-muted);font-size:10px;margin-top:2px}
        .status{display:inline-flex;padding:5px 8px;border-radius:7px;font-size:10px;font-weight:800}
        .status.delivered{background:#dcfce7;color:#15803d}
        .status.shipped{background:#dbeafe;color:#1d4ed8}
        .status.processing{background:#fef3c7;color:#a16207}
        .status.cancelled{background:#fee2e2;color:#b91c1c}
        .status.pending{background:var(--admin-surface-2);color:var(--admin-muted)}
        .status-grid{padding:20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .status-card{padding:15px;border:1px solid var(--admin-border);border-radius:12px;display:flex;align-items:center;justify-content:space-between}
        .status-card-left{display:flex;align-items:center;gap:10px}
        .status-card-icon{width:34px;height:34px;border-radius:9px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;color:var(--admin-muted)}
        .status-card span{font-size:11px;color:var(--admin-muted)}
        .status-card strong{font-size:18px;color:var(--admin-text)}
        .quick-management-panel{margin-bottom:20px}
        .quick-management-body{padding:20px}
        .quick-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .quick-btn{padding:17px;border-radius:13px;border:1px solid var(--admin-border);background:var(--admin-surface-2);color:var(--admin-text);cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;transition:.2s ease}
        .quick-btn:hover{transform:translateY(-2px);border-color:var(--admin-primary);color:var(--admin-text)}
        .quick-btn strong{display:block;font-size:13px}
        .quick-btn span{display:block;color:var(--admin-muted);font-size:10px;margin-top:3px}
        .empty-state{padding:35px 20px;text-align:center;color:var(--admin-muted);font-size:12px}
        @media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:1fr}}
        @media(max-width:700px){.admin-dashboard{min-height:auto}.welcome-card{align-items:flex-start;flex-direction:column}.quick-actions{grid-template-columns:1fr}}
        @media(max-width:520px){.stats-grid{grid-template-columns:1fr}.status-grid{grid-template-columns:1fr}.orders-table th:nth-child(3),.orders-table td:nth-child(3){display:none}.welcome-card{padding:20px}.welcome-card h2{font-size:20px}.panel-header{padding:16px}.status-grid,.quick-management-body{padding:16px}}
      `}</style>
    </>
  );
};

export default AdminDashboard;
