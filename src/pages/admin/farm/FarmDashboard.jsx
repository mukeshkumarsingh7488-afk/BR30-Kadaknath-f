import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bird,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Droplets,
  Egg,
  Factory,
  FileText,
  IndianRupee,
  LayoutDashboard,
  Package,
  Pill,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Syringe,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  Wheat,
  Wrench,
  XCircle,
} from "lucide-react";

import apiRequest from "../../../api/api";
import { showError } from "../../../utils/sweetAlert";

const STORAGE_KEY = "br30_selected_farm";

const emptyDashboard = {
  dashboardDate: null,

  farm: null,

  birds: {
    totalActiveBirds: 0,
    maleBirds: 0,
    femaleBirds: 0,
    activeBatches: 0,
    todayMortality: 0,
    monthlyMortality: 0,
  },

  sheds: {
    active: 0,
    maintenance: 0,
  },

  eggs: {
    today: {
      totalCollected: 0,
      goodEggs: 0,
      damagedEggs: 0,
      crackedEggs: 0,
    },
    monthly: {
      totalCollected: 0,
      goodEggs: 0,
      damagedEggs: 0,
      crackedEggs: 0,
    },
  },

  feed: {
    totalStockKg: 0,
    totalReceivedKg: 0,
    totalUsedKg: 0,
    lowStockItems: 0,
    todayConsumptionKg: 0,
    todayCost: 0,
    monthlyConsumptionKg: 0,
    monthlyCost: 0,
  },

  medicine: {
    totalStock: 0,
    lowStockItems: 0,
  },

  vaccination: {
    today: 0,
    upcoming: 0,
    overdue: 0,
  },

  sales: {
    today: {
      orders: 0,
      total: 0,
      paid: 0,
      due: 0,
    },
    monthly: {
      orders: 0,
      total: 0,
      paid: 0,
      due: 0,
    },
  },

  expenses: {
    today: {
      total: 0,
      paid: 0,
      due: 0,
    },
    monthly: {
      total: 0,
      paid: 0,
      due: 0,
    },
  },

  profitability: {
    today: {
      revenue: 0,
      expense: 0,
      profit: 0,
    },
    monthly: {
      revenue: 0,
      expense: 0,
      profit: 0,
      profitMarginPercentage: 0,
    },
  },

  tasks: {
    today: 0,
    pending: 0,
    overdue: 0,
  },

  maintenance: {
    pending: 0,
    overdue: 0,
  },

  waterQuality: {
    latest: null,
  },
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value, maximumFractionDigits = 0) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(safeNumber(value));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
};

const formatKg = (value) => {
  return `${formatNumber(value, 2)} kg`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getId = (item) => {
  return item?._id || item?.id || item?.farmId || "";
};

const normalizeFarms = (response) => {
  if (!response) return [];

  const possibleData = response?.data?.farms || response?.data?.items || response?.farms || response?.items || response?.data;

  if (Array.isArray(possibleData)) {
    return possibleData;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const AdminFarmDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(emptyDashboard);

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");

  const [loading, setLoading] = useState(true);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "Farm Dashboard | BR30 Kadaknath Farms";

    loadFarms();
  }, []);

  useEffect(() => {
    if (!selectedFarmId) {
      return;
    }

    loadDashboard(selectedFarmId);
  }, [selectedFarmId]);

  const loadFarms = async () => {
    try {
      setFarmsLoading(true);
      setErrorMessage("");

      const response = await apiRequest("/farms");

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load farms.");
      }

      const farmList = normalizeFarms(response);

      setFarms(farmList);

      if (farmList.length === 0) {
        setSelectedFarmId("");
        setDashboard(emptyDashboard);
        setErrorMessage("");
        return;
      }

      const savedFarmId = localStorage.getItem(STORAGE_KEY);

      const savedFarmExists = farmList.some((farm) => String(getId(farm)) === String(savedFarmId));

      const firstFarmId = getId(farmList[0]);

      const nextFarmId = savedFarmExists ? savedFarmId : firstFarmId;

      if (nextFarmId) {
        setSelectedFarmId(String(nextFarmId));
        localStorage.setItem(STORAGE_KEY, String(nextFarmId));
      }
    } catch (error) {
      console.error("Farm list error:", error);

      if (error?.status === 401 || error?.status === 403) {
        await showError("Access Denied", "You are not authorized to access Farm OS.");

        navigate("/login", { replace: true });
        return;
      }

      setFarms([]);
      setErrorMessage(error?.message || "Unable to load farms.");

      await showError("Farm Error", error?.message || "Unable to load farms.");
    } finally {
      setFarmsLoading(false);
    }
  };

  const loadDashboard = async (farmId, options = {}) => {
    if (!farmId) {
      return;
    }

    const isRefresh = Boolean(options.refresh);

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const response = await apiRequest(`/farm-dashboard?farm=${encodeURIComponent(farmId)}`);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load farm dashboard.");
      }

      setDashboard({
        ...emptyDashboard,
        ...(response || {}),
        birds: {
          ...emptyDashboard.birds,
          ...(response?.birds || {}),
        },
        sheds: {
          ...emptyDashboard.sheds,
          ...(response?.sheds || {}),
        },
        eggs: {
          ...emptyDashboard.eggs,
          ...(response?.eggs || {}),
          today: {
            ...emptyDashboard.eggs.today,
            ...(response?.eggs?.today || {}),
          },
          monthly: {
            ...emptyDashboard.eggs.monthly,
            ...(response?.eggs?.monthly || {}),
          },
        },
        feed: {
          ...emptyDashboard.feed,
          ...(response?.feed || {}),
        },
        medicine: {
          ...emptyDashboard.medicine,
          ...(response?.medicine || {}),
        },
        vaccination: {
          ...emptyDashboard.vaccination,
          ...(response?.vaccination || {}),
        },
        sales: {
          ...emptyDashboard.sales,
          ...(response?.sales || {}),
          today: {
            ...emptyDashboard.sales.today,
            ...(response?.sales?.today || {}),
          },
          monthly: {
            ...emptyDashboard.sales.monthly,
            ...(response?.sales?.monthly || {}),
          },
        },
        expenses: {
          ...emptyDashboard.expenses,
          ...(response?.expenses || {}),
          today: {
            ...emptyDashboard.expenses.today,
            ...(response?.expenses?.today || {}),
          },
          monthly: {
            ...emptyDashboard.expenses.monthly,
            ...(response?.expenses?.monthly || {}),
          },
        },
        profitability: {
          ...emptyDashboard.profitability,
          ...(response?.profitability || {}),
          today: {
            ...emptyDashboard.profitability.today,
            ...(response?.profitability?.today || {}),
          },
          monthly: {
            ...emptyDashboard.profitability.monthly,
            ...(response?.profitability?.monthly || {}),
          },
        },
        tasks: {
          ...emptyDashboard.tasks,
          ...(response?.tasks || {}),
        },
        maintenance: {
          ...emptyDashboard.maintenance,
          ...(response?.maintenance || {}),
        },
        waterQuality: {
          ...emptyDashboard.waterQuality,
          ...(response?.waterQuality || {}),
        },
      });

      localStorage.setItem(STORAGE_KEY, String(farmId));
    } catch (error) {
      console.error("Farm dashboard error:", error);

      if (error?.status === 401 || error?.status === 403) {
        await showError("Access Denied", "You are not authorized to access the Farm Dashboard.");

        navigate("/login", { replace: true });
        return;
      }

      setErrorMessage(error?.message || "Unable to load farm dashboard.");

      if (!isRefresh) {
        await showError("Dashboard Error", error?.message || "Unable to load farm dashboard.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFarmChange = (event) => {
    const farmId = event.target.value;

    setSelectedFarmId(farmId);
    localStorage.setItem(STORAGE_KEY, farmId);
  };

  const handleRefresh = async () => {
    if (!selectedFarmId) {
      await loadFarms();
      return;
    }

    await loadDashboard(selectedFarmId, {
      refresh: true,
    });
  };

  const selectedFarm = useMemo(() => {
    return farms.find((farm) => String(getId(farm)) === String(selectedFarmId)) || dashboard.farm || null;
  }, [farms, selectedFarmId, dashboard.farm]);

  const monthlyProfitMargin = safeNumber(dashboard.profitability?.monthly?.profitMarginPercentage);

  const monthlyProfit = safeNumber(dashboard.profitability?.monthly?.profit);

  const monthlyRevenue = safeNumber(dashboard.profitability?.monthly?.revenue);

  const monthlyExpense = safeNumber(dashboard.profitability?.monthly?.expense);

  const profitPositive = monthlyProfit >= 0;

  const waterStatus = String(dashboard.waterQuality?.latest?.overallStatus || "").toUpperCase();

  const waterStatusClass = waterStatus === "GOOD" || waterStatus === "SAFE" || waterStatus === "PASS" ? "safe" : waterStatus === "CRITICAL" || waterStatus === "FAILED" || waterStatus === "DANGER" ? "danger" : "neutral";

  const topStats = [
    {
      title: "Active Birds",
      value: formatNumber(dashboard.birds?.totalActiveBirds),
      subtitle: `${formatNumber(dashboard.birds?.activeBatches)} active batches`,
      icon: Bird,
      className: "green",
    },
    {
      title: "Today's Eggs",
      value: formatNumber(dashboard.eggs?.today?.totalCollected),
      subtitle: `${formatNumber(dashboard.eggs?.today?.goodEggs)} good eggs`,
      icon: Egg,
      className: "yellow",
    },
    {
      title: "Today's Sales",
      value: formatCurrency(dashboard.sales?.today?.total),
      subtitle: `${formatNumber(dashboard.sales?.today?.orders)} sales`,
      icon: IndianRupee,
      className: "blue",
    },
    {
      title: "Today's Profit",
      value: formatCurrency(dashboard.profitability?.today?.profit),
      subtitle: safeNumber(dashboard.profitability?.today?.profit) >= 0 ? "Positive result" : "Loss today",
      icon: safeNumber(dashboard.profitability?.today?.profit) >= 0 ? TrendingUp : TrendingDown,
      className: safeNumber(dashboard.profitability?.today?.profit) >= 0 ? "green" : "red",
    },
    {
      title: "Feed Stock",
      value: formatKg(dashboard.feed?.totalStockKg),
      subtitle: `${formatNumber(dashboard.feed?.lowStockItems)} low-stock items`,
      icon: Wheat,
      className: "orange",
    },
    {
      title: "Today's Mortality",
      value: formatNumber(dashboard.birds?.todayMortality),
      subtitle: `${formatNumber(dashboard.birds?.monthlyMortality)} this month`,
      icon: Activity,
      className: "red",
    },
    {
      title: "Active Sheds",
      value: formatNumber(dashboard.sheds?.active),
      subtitle: `${formatNumber(dashboard.sheds?.maintenance)} in maintenance`,
      icon: Factory,
      className: "purple",
    },
    {
      title: "Pending Tasks",
      value: formatNumber(dashboard.tasks?.pending),
      subtitle: `${formatNumber(dashboard.tasks?.overdue)} overdue`,
      icon: ClipboardIcon,
      className: "cyan",
    },
  ];

  if (loading && farmsLoading) {
    return (
      <>
        <div className="farm-dashboard-loading">
          <div className="farm-dashboard-loader" />
          <span>Loading farm dashboard...</span>
        </div>

        <style>{`
          .farm-dashboard-loading{
            min-height:calc(100vh - 132px);
            display:flex;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            gap:12px;
            color:var(--admin-muted);
            font-size:13px;
          }

          .farm-dashboard-loader{
            width:38px;
            height:38px;
            border:3px solid var(--admin-border);
            border-top-color:var(--admin-primary);
            border-radius:50%;
            animation:farm-dashboard-spin .8s linear infinite;
          }

          @keyframes farm-dashboard-spin{
            to{transform:rotate(360deg)}
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="farm-dashboard">
        <div className="farm-dashboard-header">
          <div className="farm-dashboard-header-content">
            <div>
              <div className="farm-dashboard-eyebrow">
                <LayoutDashboard size={14} />
                FARM OS
              </div>

              <h1>{selectedFarm?.name || "Farm Dashboard"}</h1>

              <p>Monitor birds, eggs, feed, sales, expenses and daily farm operations from one place.</p>
            </div>

            <div className="farm-header-actions">
              <div className="farm-select-wrapper">
                <Factory size={16} />

                <select value={selectedFarmId} onChange={handleFarmChange} aria-label="Select farm">
                  {farms.length > 0 ? (
                    farms.map((farm) => {
                      const farmId = getId(farm);

                      return (
                        <option key={farmId} value={farmId}>
                          {farm.name || "Unnamed Farm"}
                          {farm.code ? ` (${farm.code})` : ""}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No farm available</option>
                  )}
                </select>
              </div>

              <button type="button" className="farm-refresh-btn" onClick={handleRefresh} disabled={refreshing || !selectedFarmId}>
                <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="farm-header-meta">
            <span>
              <ShieldCheck size={13} />
              {selectedFarm?.status || dashboard.farm?.status || "ACTIVE"}
            </span>

            <span>
              <CalendarDays size={13} />
              {formatDate(dashboard.dashboardDate || new Date())}
            </span>

            {selectedFarm?.code && (
              <span>
                <FileText size={13} />
                {selectedFarm.code}
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="farm-dashboard-alert error-alert">
            <AlertTriangle size={18} />

            <div>
              <strong>Unable to load dashboard</strong>
              <span>{errorMessage}</span>
            </div>

            <button type="button" onClick={() => (selectedFarmId ? loadDashboard(selectedFarmId) : loadFarms())}>
              Try Again
            </button>
          </div>
        )}

        {!farmsLoading && farms.length === 0 && (
          <div className="farm-dashboard-alert empty-farm-alert">
            <Factory size={20} />

            <div>
              <strong>No Farm Created Yet</strong>
              <span>Farm Dashboard is ready. Create your first farm to start adding batches, birds, eggs, feed, sales and other farm records.</span>
            </div>

            <button type="button" onClick={() => navigate("/admin/farm/create-farm")}>
              Create Farm
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="farm-stats-grid">
          {topStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="farm-stat-card" key={stat.title}>
                <div className={`farm-stat-icon ${stat.className}`}>
                  <Icon size={21} />
                </div>

                <div className="farm-stat-content">
                  <span className="farm-stat-title">{stat.title}</span>
                  <strong className="farm-stat-value">{stat.value}</strong>
                  <span className="farm-stat-subtitle">{stat.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="farm-main-grid">
          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Bird & Batch Overview</h2>
                <span>Current active farm stock</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/batches")}>
                Batches
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overview-grid">
              <OverviewItem icon={Bird} title="Total Active Birds" value={formatNumber(dashboard.birds?.totalActiveBirds)} />

              <OverviewItem icon={Users} title="Male Birds" value={formatNumber(dashboard.birds?.maleBirds)} />

              <OverviewItem icon={Users} title="Female Birds" value={formatNumber(dashboard.birds?.femaleBirds)} />

              <OverviewItem icon={Package} title="Active Batches" value={formatNumber(dashboard.birds?.activeBatches)} />
            </div>

            <div className="mortality-strip">
              <div>
                <span>Today's Mortality</span>
                <strong>{formatNumber(dashboard.birds?.todayMortality)}</strong>
              </div>

              <div>
                <span>Monthly Mortality</span>
                <strong>{formatNumber(dashboard.birds?.monthlyMortality)}</strong>
              </div>

              <div className="strip-action">
                <button type="button" onClick={() => navigate("/admin/farm/mortality")}>
                  View Mortality
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Shed Overview</h2>
                <span>Current shed status</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/sheds")}>
                Manage
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="shed-overview">
              <div className="shed-status-card active">
                <div className="shed-status-icon">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <span>Active Sheds</span>
                  <strong>{formatNumber(dashboard.sheds?.active)}</strong>
                </div>
              </div>

              <div className="shed-status-card maintenance">
                <div className="shed-status-icon">
                  <Wrench size={18} />
                </div>

                <div>
                  <span>Maintenance</span>
                  <strong>{formatNumber(dashboard.sheds?.maintenance)}</strong>
                </div>
              </div>
            </div>

            <div className="maintenance-summary">
              <div>
                <span>Pending Maintenance</span>
                <strong>{formatNumber(dashboard.maintenance?.pending)}</strong>
              </div>

              <div>
                <span>Overdue</span>
                <strong className="danger-number">{formatNumber(dashboard.maintenance?.overdue)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="farm-main-grid">
          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Egg Production</h2>
                <span>Today's and monthly collection</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/egg-collection")}>
                Collection
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="production-highlight">
              <div className="production-main">
                <div className="production-icon">
                  <Egg size={21} />
                </div>

                <div>
                  <span>Today's Collection</span>
                  <strong>{formatNumber(dashboard.eggs?.today?.totalCollected)}</strong>
                  <small>eggs</small>
                </div>
              </div>

              <div className="production-month">
                <span>This Month</span>
                <strong>{formatNumber(dashboard.eggs?.monthly?.totalCollected)}</strong>
              </div>
            </div>

            <div className="egg-breakdown">
              <BreakdownItem label="Good Eggs" value={dashboard.eggs?.today?.goodEggs} className="good" />

              <BreakdownItem label="Damaged" value={dashboard.eggs?.today?.damagedEggs} className="damaged" />

              <BreakdownItem label="Cracked" value={dashboard.eggs?.today?.crackedEggs} className="cracked" />
            </div>
          </div>

          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Feed Inventory</h2>
                <span>Current feed position</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/feed-inventory")}>
                Inventory
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="feed-main">
              <div className="feed-icon">
                <Wheat size={21} />
              </div>

              <div>
                <span>Available Feed</span>
                <strong>{formatKg(dashboard.feed?.totalStockKg)}</strong>
              </div>
            </div>

            <div className="feed-stats">
              <div>
                <span>Received</span>
                <strong>{formatKg(dashboard.feed?.totalReceivedKg)}</strong>
              </div>

              <div>
                <span>Used</span>
                <strong>{formatKg(dashboard.feed?.totalUsedKg)}</strong>
              </div>

              <div>
                <span>Low Stock</span>
                <strong className="danger-number">{formatNumber(dashboard.feed?.lowStockItems)}</strong>
              </div>
            </div>

            <div className="feed-consumption">
              <div>
                <span>Today's Consumption</span>
                <strong>{formatKg(dashboard.feed?.todayConsumptionKg)}</strong>
              </div>

              <div>
                <span>Today's Cost</span>
                <strong>{formatCurrency(dashboard.feed?.todayCost)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="farm-panel">
          <div className="farm-panel-header">
            <div>
              <h2>Sales, Expenses & Profitability</h2>
              <span>Current month financial overview</span>
            </div>

            <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/reports")}>
              Reports
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="finance-grid">
            <FinanceCard icon={ShoppingBag} title="Monthly Sales" value={formatCurrency(dashboard.sales?.monthly?.total)} subtitle={`${formatNumber(dashboard.sales?.monthly?.orders)} orders`} className="blue" />

            <FinanceCard icon={WalletCards} title="Monthly Expenses" value={formatCurrency(dashboard.expenses?.monthly?.total)} subtitle="Total farm expenses" className="orange" />

            <FinanceCard icon={CircleDollarSign} title="Monthly Profit" value={formatCurrency(monthlyProfit)} subtitle={`${formatNumber(monthlyProfitMargin, 2)}% profit margin`} className={profitPositive ? "green" : "red"} />

            <FinanceCard icon={WalletCards} title="Outstanding Due" value={formatCurrency(safeNumber(dashboard.sales?.monthly?.due) + safeNumber(dashboard.expenses?.monthly?.due))} subtitle="Sales due + expense due" className="purple" />
          </div>

          <div className="profit-summary">
            <div className="profit-summary-item">
              <span>Revenue</span>
              <strong>{formatCurrency(monthlyRevenue)}</strong>
            </div>

            <div className="profit-divider" />

            <div className="profit-summary-item">
              <span>Expenses</span>
              <strong>{formatCurrency(monthlyExpense)}</strong>
            </div>

            <div className="profit-divider" />

            <div className="profit-summary-item">
              <span>Net Profit</span>
              <strong className={profitPositive ? "profit" : "loss"}>{formatCurrency(monthlyProfit)}</strong>
            </div>
          </div>
        </div>

        <div className="farm-three-grid">
          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Medicine</h2>
                <span>Current stock status</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/medicine-vaccine")}>
                Manage
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="small-metric">
              <div className="small-metric-icon purple">
                <Pill size={19} />
              </div>

              <div>
                <span>Total Stock</span>
                <strong>{formatNumber(dashboard.medicine?.totalStock, 2)}</strong>
              </div>
            </div>

            <AlertRow icon={AlertTriangle} label="Low / Out of Stock" value={dashboard.medicine?.lowStockItems} danger={safeNumber(dashboard.medicine?.lowStockItems) > 0} />
          </div>

          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Vaccination</h2>
                <span>Schedule monitoring</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/vaccination-schedule")}>
                Schedule
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="vaccination-list">
              <AlertRow icon={Syringe} label="Today" value={dashboard.vaccination?.today} />

              <AlertRow icon={Clock3} label="Upcoming" value={dashboard.vaccination?.upcoming} />

              <AlertRow icon={AlertTriangle} label="Overdue" value={dashboard.vaccination?.overdue} danger={safeNumber(dashboard.vaccination?.overdue) > 0} />
            </div>
          </div>

          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Tasks</h2>
                <span>Farm work status</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/tasks")}>
                Tasks
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="task-list">
              <AlertRow icon={CalendarDays} label="Today's Tasks" value={dashboard.tasks?.today} />

              <AlertRow icon={Clock3} label="Pending" value={dashboard.tasks?.pending} />

              <AlertRow icon={AlertTriangle} label="Overdue" value={dashboard.tasks?.overdue} danger={safeNumber(dashboard.tasks?.overdue) > 0} />
            </div>
          </div>
        </div>

        <div className="farm-main-grid">
          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Water Quality</h2>
                <span>Latest available water test</span>
              </div>

              <button type="button" className="panel-link-btn" onClick={() => navigate("/admin/farm/water-quality")}>
                View
                <ArrowUpRight size={14} />
              </button>
            </div>

            {dashboard.waterQuality?.latest ? (
              <>
                <div className="water-quality-header">
                  <div className="water-quality-icon">
                    <Droplets size={20} />
                  </div>

                  <div>
                    <span>Overall Status</span>
                    <strong className={`water-status ${waterStatusClass}`}>{waterStatus || "NOT AVAILABLE"}</strong>
                  </div>

                  <div className="water-date">
                    <span>Test Date</span>
                    <strong>{formatDate(dashboard.waterQuality.latest.testDate)}</strong>
                  </div>
                </div>

                <div className="water-quality-grid">
                  <WaterMetric label="pH" value={dashboard.waterQuality.latest.ph ?? "-"} />

                  <WaterMetric label="TDS" value={dashboard.waterQuality.latest.tdsPpm != null ? `${formatNumber(dashboard.waterQuality.latest.tdsPpm, 2)} ppm` : "-"} />

                  <WaterMetric label="Location" value={dashboard.waterQuality.latest.sampleLocation || "-"} />

                  <WaterMetric label="Source" value={dashboard.waterQuality.latest.source || "-"} />
                </div>

                {dashboard.waterQuality.latest.microbialTest && (
                  <div className="microbial-row">
                    <span>Microbial Test</span>
                    <strong>{String(dashboard.waterQuality.latest.microbialTest)}</strong>
                  </div>
                )}
              </>
            ) : (
              <div className="panel-empty">
                <Droplets size={24} />
                <span>No water quality test found.</span>
              </div>
            )}
          </div>

          <div className="farm-panel">
            <div className="farm-panel-header">
              <div>
                <h2>Farm Alerts</h2>
                <span>Items that may need attention</span>
              </div>

              <AlertTriangle size={17} className="header-alert-icon" />
            </div>

            <div className="alerts-list">
              <DashboardAlert
                icon={Wheat}
                title="Feed Stock"
                message={safeNumber(dashboard.feed?.lowStockItems) > 0 ? `${formatNumber(dashboard.feed.lowStockItems)} feed item(s) need attention.` : "Feed inventory is currently normal."}
                danger={safeNumber(dashboard.feed?.lowStockItems) > 0}
                onClick={() => navigate("/admin/farm/feed-inventory")}
              />

              <DashboardAlert
                icon={Pill}
                title="Medicine Stock"
                message={safeNumber(dashboard.medicine?.lowStockItems) > 0 ? `${formatNumber(dashboard.medicine.lowStockItems)} medicine item(s) need attention.` : "Medicine inventory is currently normal."}
                danger={safeNumber(dashboard.medicine?.lowStockItems) > 0}
                onClick={() => navigate("/admin/farm/medicine-vaccine")}
              />

              <DashboardAlert
                icon={Syringe}
                title="Vaccination"
                message={safeNumber(dashboard.vaccination?.overdue) > 0 ? `${formatNumber(dashboard.vaccination.overdue)} vaccination(s) are overdue.` : "No overdue vaccination found."}
                danger={safeNumber(dashboard.vaccination?.overdue) > 0}
                onClick={() => navigate("/admin/farm/vaccination-schedule")}
              />

              <DashboardAlert
                icon={Wrench}
                title="Maintenance"
                message={safeNumber(dashboard.maintenance?.overdue) > 0 ? `${formatNumber(dashboard.maintenance.overdue)} maintenance task(s) are overdue.` : "No overdue maintenance found."}
                danger={safeNumber(dashboard.maintenance?.overdue) > 0}
                onClick={() => navigate("/admin/farm/sheds")}
              />

              <DashboardAlert
                icon={Clock3}
                title="Tasks"
                message={safeNumber(dashboard.tasks?.overdue) > 0 ? `${formatNumber(dashboard.tasks.overdue)} task(s) are overdue.` : "No overdue farm task found."}
                danger={safeNumber(dashboard.tasks?.overdue) > 0}
                onClick={() => navigate("/admin/farm/tasks")}
              />
            </div>
          </div>
        </div>

        <div className="farm-panel quick-farm-panel">
          <div className="farm-panel-header">
            <div>
              <h2>Quick Farm Management</h2>
              <span>Jump directly to common Farm OS modules</span>
            </div>
          </div>

          <div className="quick-farm-actions">
            <QuickAction icon={Bird} title="Batches" subtitle="Manage active batches" onClick={() => navigate("/admin/farm/batches")} />

            <QuickAction icon={Egg} title="Egg Collection" subtitle="Record daily eggs" onClick={() => navigate("/admin/farm/egg-collection")} />

            <QuickAction icon={Wheat} title="Feed" subtitle="Inventory & consumption" onClick={() => navigate("/admin/farm/feed-inventory")} />

            <QuickAction icon={ShoppingBag} title="Sales" subtitle="Farm sales & billing" onClick={() => navigate("/admin/farm/sales")} />

            <QuickAction icon={ReceiptIcon} title="Expenses" subtitle="Track farm expenses" onClick={() => navigate("/admin/farm/reports")} />

            <QuickAction icon={BarChartIcon} title="Reports" subtitle="View farm reports" onClick={() => navigate("/admin/farm/reports")} />
          </div>
        </div>

        <div className="farm-footer-note">
          <ShieldCheck size={14} />
          <span>Farm OS dashboard data is based on the selected farm and current backend records.</span>
          <span className="footer-update">Last dashboard date: {formatDate(dashboard.dashboardDate || new Date())}</span>
        </div>
      </div>

      <style>{`.farm-dashboard{width:100%;min-height:calc(100vh - 132px);color:var(--admin-text)}.farm-dashboard-header{margin-bottom:22px;padding:24px;border-radius:18px;background:linear-gradient(135deg,#14532d,#166534,#15803d);color:#fff;position:relative;overflow:hidden;box-shadow:0 15px 35px rgba(21,128,61,.18)}.farm-dashboard-header:after{content:"";position:absolute;width:260px;height:260px;right:-90px;top:-120px;border-radius:50%;background:rgba(255,255,255,.08)}.farm-dashboard-header:before{content:"";position:absolute;width:150px;height:150px;left:45%;bottom:-100px;border-radius:50%;background:rgba(255,255,255,.05)}.farm-dashboard-header-content{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:20px}.farm-dashboard-eyebrow{display:flex;align-items:center;gap:7px;margin-bottom:8px;font-size:10px;font-weight:800;letter-spacing:1.2px;color:#bbf7d0}.farm-dashboard-header h1{margin:0 0 7px;font-size:25px;line-height:1.2;font-weight:800}.farm-dashboard-header p{margin:0;max-width:700px;color:#dcfce7;font-size:12px;line-height:1.6}.farm-header-actions{position:relative;z-index:3;display:flex;align-items:center;gap:10px;flex-shrink:0}.farm-select-wrapper{height:40px;min-width:210px;display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:#fff}.farm-select-wrapper select{width:100%;border:0;outline:0;background:transparent;color:#fff;font-size:12px;font-weight:700;cursor:pointer}.farm-select-wrapper select option{color:#111827;background:#fff}.farm-refresh-btn{height:40px;display:flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:#fff;font-size:11px;font-weight:800;cursor:pointer;transition:.2s ease}.farm-refresh-btn:hover:not(:disabled){background:rgba(255,255,255,.18);transform:translateY(-1px)}.farm-refresh-btn:disabled{opacity:.55;cursor:not-allowed}.spin-icon{animation:farm-refresh-spin .8s linear infinite}@keyframes farm-refresh-spin{to{transform:rotate(360deg)}}.farm-header-meta{position:relative;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:18px}.farm-header-meta span{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:7px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);color:#dcfce7;font-size:10px;font-weight:700}.farm-dashboard-alert{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:13px 15px;border-radius:12px;border:1px solid var(--admin-border);background:var(--admin-surface)}.error-alert{color:#b91c1c;border-color:#fecaca;background:#fef2f2}.admin-theme-dark .error-alert{color:#fecaca;border-color:#7f1d1d;background:rgba(127,29,29,.2)}.farm-dashboard-alert>svg{flex:0 0 auto}.farm-dashboard-alert div{min-width:0;flex:1}.farm-dashboard-alert strong{display:block;margin-bottom:2px;font-size:12px}.farm-dashboard-alert span{display:block;font-size:11px;color:var(--admin-muted)}.farm-dashboard-alert button{border:0;background:transparent;color:var(--admin-primary);font-size:11px;font-weight:800;cursor:pointer}.farm-stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:20px}.farm-stat-card{min-width:0;padding:17px;display:flex;align-items:center;gap:13px;border:1px solid var(--admin-border);border-radius:15px;background:var(--admin-surface);color:var(--admin-text);transition:.2s ease}.farm-stat-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(15,23,42,.08)}.admin-theme-dark .farm-stat-card:hover{box-shadow:0 10px 25px rgba(0,0,0,.25)}.farm-stat-icon{width:45px;height:45px;flex:0 0 45px;display:flex;align-items:center;justify-content:center;border-radius:12px}.farm-stat-icon.green{background:#dcfce7;color:#16a34a}.farm-stat-icon.yellow{background:#fef3c7;color:#d97706}.farm-stat-icon.blue{background:#dbeafe;color:#2563eb}.farm-stat-icon.red{background:#fee2e2;color:#dc2626}.farm-stat-icon.orange{background:#ffedd5;color:#ea580c}.farm-stat-icon.purple{background:#f3e8ff;color:#9333ea}.farm-stat-icon.cyan{background:#cffafe;color:#0891b2}.farm-stat-content{min-width:0}.farm-stat-title{display:block;margin-bottom:3px;color:var(--admin-muted);font-size:11px}.farm-stat-value{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--admin-text);font-size:19px;font-weight:800}.farm-stat-subtitle{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--admin-muted);font-size:9px}.farm-main-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:20px;margin-bottom:20px}.farm-three-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-bottom:20px}.farm-panel{min-width:0;overflow:hidden;border:1px solid var(--admin-border);border-radius:16px;background:var(--admin-surface);color:var(--admin-text)}.farm-panel-header{min-height:69px;padding:17px 19px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--admin-border)}.farm-panel-header h2{margin:0 0 3px;color:var(--admin-text);font-size:14px;font-weight:800}.farm-panel-header span{color:var(--admin-muted);font-size:10px}.panel-link-btn{display:flex;align-items:center;gap:4px;border:0;background:transparent;color:var(--admin-primary);font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap}.panel-link-btn:hover{opacity:.8}.overview-grid{padding:19px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.overview-item{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2)}.overview-item-icon{width:34px;height:34px;flex:0 0 34px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--admin-surface);color:var(--admin-primary)}.overview-item-text{min-width:0}.overview-item-text span{display:block;color:var(--admin-muted);font-size:9px;margin-bottom:3px}.overview-item-text strong{display:block;color:var(--admin-text);font-size:17px}.mortality-strip{margin:0 19px 19px;padding:13px;display:grid;grid-template-columns:1fr 1fr auto;align-items:center;gap:15px;border-radius:12px;background:var(--admin-surface-2);border:1px solid var(--admin-border)}.mortality-strip div span{display:block;color:var(--admin-muted);font-size:9px;margin-bottom:3px}.mortality-strip div strong{color:var(--admin-text);font-size:16px}.strip-action{text-align:right}.strip-action button{display:inline-flex;align-items:center;gap:3px;border:0;background:transparent;color:var(--admin-primary);font-size:10px;font-weight:800;cursor:pointer}.shed-overview{padding:19px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.shed-status-card{padding:14px;display:flex;align-items:center;gap:10px;border-radius:12px;border:1px solid var(--admin-border)}.shed-status-card.active{background:#f0fdf4;border-color:#bbf7d0}.shed-status-card.maintenance{background:#fffbeb;border-color:#fde68a}.admin-theme-dark .shed-status-card.active{background:rgba(20,83,45,.2);border-color:#166534}.admin-theme-dark .shed-status-card.maintenance{background:rgba(120,53,15,.2);border-color:#92400e}.shed-status-icon{width:35px;height:35px;display:flex;align-items:center;justify-content:center;border-radius:9px}.shed-status-card.active .shed-status-icon{background:#dcfce7;color:#15803d}.shed-status-card.maintenance .shed-status-icon{background:#fef3c7;color:#a16207}.shed-status-card span,.maintenance-summary span{display:block;color:var(--admin-muted);font-size:9px;margin-bottom:3px}.shed-status-card strong{color:var(--admin-text);font-size:18px}.maintenance-summary{margin:0 19px 19px;padding:13px;display:grid;grid-template-columns:1fr 1fr;gap:12px;border-top:1px solid var(--admin-border)}.maintenance-summary div:last-child{border-left:1px solid var(--admin-border);padding-left:15px}.maintenance-summary strong{color:var(--admin-text);font-size:16px}.danger-number{color:#dc2626!important}.production-highlight{padding:20px 19px;display:flex;align-items:center;justify-content:space-between;gap:20px}.production-main{display:flex;align-items:center;gap:12px}.production-icon{width:45px;height:45px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:#fef3c7;color:#d97706}.production-main span,.production-month span{display:block;color:var(--admin-muted);font-size:10px;margin-bottom:3px}.production-main strong{color:var(--admin-text);font-size:24px;font-weight:800}.production-main small{margin-left:4px;color:var(--admin-muted);font-size:10px}.production-month{text-align:right}.production-month strong{color:var(--admin-text);font-size:19px}.egg-breakdown{padding:0 19px 19px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.breakdown-item{padding:12px;border-radius:10px;border:1px solid var(--admin-border);background:var(--admin-surface-2)}.breakdown-item span{display:block;color:var(--admin-muted);font-size:9px;margin-bottom:3px}.breakdown-item strong{font-size:15px;color:var(--admin-text)}.breakdown-item.good strong{color:#16a34a}.breakdown-item.damaged strong{color:#d97706}.breakdown-item.cracked strong{color:#dc2626}.feed-main{padding:19px;display:flex;align-items:center;gap:12px}.feed-icon{width:45px;height:45px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:#ffedd5;color:#ea580c}.feed-main span{display:block;color:var(--admin-muted);font-size:10px;margin-bottom:3px}.feed-main strong{color:var(--admin-text);font-size:23px}.feed-stats{padding:0 19px 15px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.feed-stats div,.feed-consumption div{min-width:0;padding:11px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface-2)}.feed-stats span,.feed-consumption span{display:block;color:var(--admin-muted);font-size:9px;margin-bottom:3px}.feed-stats strong,.feed-consumption strong{color:var(--admin-text);font-size:13px}.feed-consumption{margin:0 19px 19px;padding-top:15px;border-top:1px solid var(--admin-border);display:grid;grid-template-columns:1fr 1fr;gap:10px}.finance-grid{padding:19px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.finance-card{min-width:0;padding:14px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2)}.finance-card-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}.finance-card-icon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px}.finance-card-icon.blue{background:#dbeafe;color:#2563eb}.finance-card-icon.orange{background:#ffedd5;color:#ea580c}.finance-card-icon.green{background:#dcfce7;color:#16a34a}.finance-card-icon.red{background:#fee2e2;color:#dc2626}.finance-card-icon.purple{background:#f3e8ff;color:#9333ea}.finance-card-title{color:var(--admin-muted);font-size:9px}.finance-card-value{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--admin-text);font-size:17px;font-weight:800}.finance-card-subtitle{display:block;margin-top:3px;color:var(--admin-muted);font-size:9px}.profit-summary{margin:0 19px 19px;padding:15px;display:flex;align-items:center;justify-content:space-around;gap:15px;border-radius:12px;background:var(--admin-surface-2);border:1px solid var(--admin-border)}.profit-summary-item{min-width:0;flex:1;text-align:center}.profit-summary-item span{display:block;margin-bottom:4px;color:var(--admin-muted);font-size:9px}.profit-summary-item strong{color:var(--admin-text);font-size:16px}.profit-summary-item strong.profit{color:#16a34a}.profit-summary-item strong.loss{color:#dc2626}.profit-divider{width:1px;height:32px;background:var(--admin-border)}.small-metric{padding:19px;display:flex;align-items:center;gap:11px}.small-metric-icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:11px}.small-metric-icon.purple{background:#f3e8ff;color:#9333ea}.small-metric span{display:block;margin-bottom:3px;color:var(--admin-muted);font-size:9px}.small-metric strong{color:var(--admin-text);font-size:20px}.vaccination-list,.task-list{padding:8px 19px 19px}.alert-row{min-height:47px;display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--admin-border)}.alert-row:last-child{border-bottom:0}.alert-row-icon{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--admin-surface-2);color:var(--admin-muted)}.alert-row-text{min-width:0;flex:1}.alert-row-text span{color:var(--admin-muted);font-size:10px}.alert-row strong{color:var(--admin-text);font-size:14px}.alert-row strong.alert-danger{color:#dc2626}.water-quality-header{padding:19px;display:flex;align-items:center;gap:11px}.water-quality-icon{width:43px;height:43px;display:flex;align-items:center;justify-content:center;border-radius:11px;background:#cffafe;color:#0891b2}.water-quality-header>div:nth-child(2){flex:1;min-width:0}.water-quality-header span{display:block;color:var(--admin-muted);font-size:9px;margin-bottom:4px}.water-quality-header strong{color:var(--admin-text);font-size:12px}.water-status.safe{color:#16a34a}.water-status.danger{color:#dc2626}.water-status.neutral{color:#d97706}.water-date{text-align:right}.water-quality-grid{padding:0 19px 15px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.water-metric{padding:10px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2)}.water-metric span{display:block;color:var(--admin-muted);font-size:8px;margin-bottom:3px}.water-metric strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--admin-text);font-size:11px}.microbial-row{margin:0 19px 19px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-radius:9px;background:var(--admin-surface-2);border:1px solid var(--admin-border)}.microbial-row span{color:var(--admin-muted);font-size:9px}.microbial-row strong{color:var(--admin-text);font-size:10px}.panel-empty{min-height:180px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:var(--admin-muted);font-size:11px}.header-alert-icon{color:#d97706}.alerts-list{padding:8px 19px 19px}.dashboard-alert{min-height:61px;display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--admin-border);cursor:pointer}.dashboard-alert:last-child{border-bottom:0}.dashboard-alert-icon{width:34px;height:34px;flex:0 0 34px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--admin-surface-2);color:var(--admin-muted)}.dashboard-alert.danger .dashboard-alert-icon{background:#fee2e2;color:#dc2626}.admin-theme-dark .dashboard-alert.danger .dashboard-alert-icon{background:rgba(127,29,29,.25);color:#fca5a5}.dashboard-alert-content{min-width:0;flex:1}.dashboard-alert-content strong{display:block;margin-bottom:2px;color:var(--admin-text);font-size:10px}.dashboard-alert-content span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--admin-muted);font-size:9px}.dashboard-alert-arrow{color:var(--admin-muted)}.quick-farm-panel{margin-bottom:16px}.quick-farm-actions{padding:19px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:11px}.quick-farm-action{min-width:0;padding:14px;border:1px solid var(--admin-border);border-radius:12px;background:var(--admin-surface-2);color:var(--admin-text);text-align:left;cursor:pointer;transition:.2s ease}.quick-farm-action:hover{transform:translateY(-2px);border-color:var(--admin-primary)}.quick-farm-action-icon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;border-radius:9px;background:var(--admin-surface);color:var(--admin-primary)}.quick-farm-action strong{display:block;margin-bottom:3px;color:var(--admin-text);font-size:11px}.quick-farm-action span{display:block;color:var(--admin-muted);font-size:8px;line-height:1.4}.farm-footer-note{display:flex;align-items:center;gap:7px;flex-wrap:wrap;color:var(--admin-muted);font-size:9px;padding:2px 3px 15px}.footer-update{margin-left:auto}@media(max-width:1200px){.farm-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.quick-farm-actions{grid-template-columns:repeat(3,minmax(0,1fr))}.finance-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:1050px){.farm-dashboard-header-content{align-items:flex-start;flex-direction:column}.farm-header-actions{width:100%}.farm-select-wrapper{flex:1}.farm-main-grid{grid-template-columns:1fr}.farm-three-grid{grid-template-columns:1fr}}@media(max-width:700px){.farm-dashboard{min-height:auto}.farm-dashboard-header{padding:20px}.farm-dashboard-header h1{font-size:21px}.farm-header-actions{align-items:stretch;flex-direction:column}.farm-select-wrapper{width:100%;min-width:0}.farm-refresh-btn{width:100%}.farm-stats-grid{grid-template-columns:1fr}.overview-grid{grid-template-columns:1fr}.mortality-strip{grid-template-columns:1fr 1fr}.strip-action{grid-column:1 / -1;text-align:left}.shed-overview{grid-template-columns:1fr}.egg-breakdown{grid-template-columns:1fr}.finance-grid{grid-template-columns:1fr}.profit-summary{align-items:stretch;flex-direction:column}.profit-divider{width:100%;height:1px}.water-quality-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.quick-farm-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.footer-update{width:100%;margin-left:0}}@media(max-width:480px){.farm-panel-header{padding:15px}.farm-dashboard-header{margin-bottom:16px}.farm-header-meta{gap:5px}.farm-header-meta span{font-size:9px}.farm-stat-card{padding:15px}.production-highlight{align-items:flex-start;flex-direction:column}.production-month{width:100%;text-align:left}.feed-stats{grid-template-columns:1fr}.feed-consumption{grid-template-columns:1fr}.water-quality-header{align-items:flex-start;flex-wrap:wrap}.water-date{width:100%;text-align:left;margin-left:54px}.water-quality-grid{grid-template-columns:1fr 1fr}.quick-farm-actions{grid-template-columns:1fr}}`}</style>
    </>
  );
};

const OverviewItem = ({ icon: Icon, title, value }) => {
  return (
    <div className="overview-item">
      <div className="overview-item-icon">
        <Icon size={16} />
      </div>

      <div className="overview-item-text">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
};

const BreakdownItem = ({ label, value, className = "" }) => {
  return (
    <div className={`breakdown-item ${className}`}>
      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </div>
  );
};

const FinanceCard = ({ icon: Icon, title, value, subtitle, className = "" }) => {
  return (
    <div className="finance-card">
      <div className="finance-card-top">
        <div className={`finance-card-icon ${className}`}>
          <Icon size={16} />
        </div>

        <span className="finance-card-title">{title}</span>
      </div>

      <strong className="finance-card-value">{value}</strong>

      <span className="finance-card-subtitle">{subtitle}</span>
    </div>
  );
};

const AlertRow = ({ icon: Icon, label, value, danger = false }) => {
  return (
    <div className="alert-row">
      <div className="alert-row-icon">
        <Icon size={14} />
      </div>

      <div className="alert-row-text">
        <span>{label}</span>
      </div>

      <strong className={danger ? "alert-danger" : ""}>{formatNumber(value)}</strong>
    </div>
  );
};

const WaterMetric = ({ label, value }) => {
  return (
    <div className="water-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

const DashboardAlert = ({ icon: Icon, title, message, danger = false, onClick }) => {
  return (
    <div
      className={`dashboard-alert ${danger ? "danger" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick?.();
        }
      }}>
      <div className="dashboard-alert-icon">
        <Icon size={16} />
      </div>

      <div className="dashboard-alert-content">
        <strong>{title}</strong>
        <span>{message}</span>
      </div>

      <ChevronRight size={15} className="dashboard-alert-arrow" />
    </div>
  );
};

const QuickAction = ({ icon: Icon, title, subtitle, onClick }) => {
  return (
    <button type="button" className="quick-farm-action" onClick={onClick}>
      <div className="quick-farm-action-icon">
        <Icon size={17} />
      </div>

      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  );
};

const ClipboardIcon = (props) => {
  return <FileText {...props} />;
};

const ReceiptIcon = (props) => {
  return <WalletCards {...props} />;
};

const BarChartIcon = (props) => {
  return <TrendingUp {...props} />;
};

export default AdminFarmDashboard;
