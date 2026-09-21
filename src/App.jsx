import { Routes, Route, useLocation } from "react-router-dom";

// =========================
// COMMON LAYOUT COMPONENTS
// =========================
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";

// =========================
// CUSTOMER WEBSITE PAGES
// =========================
import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutFarm from "./pages/AboutFarm";
import OwnerAbout from "./pages/OwnerAbout";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";

// =========================
// CUSTOMER AUTH PAGES
// =========================
import Register from "./pages/customer/Register";
import VerifyEmail from "./pages/customer/VerifyEmail";
import Login from "./pages/customer/Login";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";
import Profile from "./pages/customer/Profile";

// =========================
// CUSTOMER ORDER PAGES
// =========================
import MyOrders from "./pages/customer/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/customer/TrackOrder";
import OrderDetails from "./pages/customer/OrderDetails";
import FAQ from "./pages/customer/FAQ";

// =========================
// LEGAL PAGES
// =========================
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ShippingPolicy from "./pages/legal/ShippingPolicy";

// =========================
// ADMIN LAYOUT
// =========================
import AdminLayout from "./components/admin/AdminLayout";

// =========================
// ADMIN PANEL PAGES
// =========================
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import CustomersStaff from "./pages/admin/CustomersStaff";
import AdminRefunds from "./pages/admin/AdminRefunds";

// =========================
// FARM OS PAGES
// =========================
import FarmDashboard from "./pages/admin/farm/FarmDashboard";
import Batches from "./pages/admin/farm/Batches";
import ChicksInward from "./pages/admin/farm/ChicksInward";
import BirdStock from "./pages/admin/farm/BirdStock";
import Mortality from "./pages/admin/farm/Mortality";
import WeightGrowth from "./pages/admin/farm/WeightGrowth";
import EggCollection from "./pages/admin/farm/EggCollection";
import FeedInventory from "./pages/admin/farm/FeedInventory";
import FeedConsumption from "./pages/admin/farm/FeedConsumption";
import MedicineVaccine from "./pages/admin/farm/MedicineVaccine";
import VaccinationSchedule from "./pages/admin/farm/VaccinationSchedule";
import VeterinaryLogs from "./pages/admin/farm/VeterinaryLogs";
import WaterQuality from "./pages/admin/farm/WaterQuality";
import StaffAttendance from "./pages/admin/farm/StaffAttendance";
import FarmTasks from "./pages/admin/farm/FarmTasks";
import Payroll from "./pages/admin/farm/Payroll";
import Biosecurity from "./pages/admin/farm/Biosecurity";
import ShedManagement from "./pages/admin/farm/ShedManagement";
import Sheds from "./pages/admin/farm/Sheds";
import SalesBilling from "./pages/admin/farm/SalesBilling";
import FarmReports from "./pages/admin/farm/FarmReports";
import FarmExpenses from "./pages/admin/farm/FarmExpenses";
import CreateFarms from "./pages/admin/farm/CreateFarms";
import Settings from "./pages/admin/Settings";

function App() {
  const location = useLocation();

  // =========================
  // ADMIN ROUTE CHECK
  // =========================
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* =========================
          CUSTOMER NAVBAR
      ========================= */}
      {!isAdminRoute && <Navbar />}

      <ScrollToTop />

      <main>
        <Routes>
          {/* =====================================================
              CUSTOMER WEBSITE
          ===================================================== */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/products/:slug" element={<ProductDetails />} />

          <Route path="/about-farm" element={<AboutFarm />} />

          <Route path="/owner-farm" element={<OwnerAbout />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/contact" element={<Contact />} />

          {/* =====================================================
              CUSTOMER AUTHENTICATION
          ===================================================== */}

          <Route path="/register" element={<Register />} />

          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/login" element={<Login />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/profile" element={<Profile />} />

          {/* =====================================================
              CUSTOMER ORDERS
          ===================================================== */}

          <Route path="/my-orders" element={<MyOrders />} />

          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          <Route path="/track-order" element={<TrackOrder />} />

          <Route path="/track-order/:id" element={<TrackOrder />} />

          <Route path="/order-details/:id" element={<OrderDetails />} />

          <Route path="/faq" element={<FAQ />} />

          {/* =====================================================
              LEGAL PAGES
          ===================================================== */}

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/terms-of-service" element={<TermsOfService />} />

          <Route path="/refund-policy" element={<RefundPolicy />} />

          <Route path="/shipping-policy" element={<ShippingPolicy />} />

          {/* =====================================================
              ADMIN PANEL
          ===================================================== */}

          <Route path="/admin" element={<AdminLayout />}>
            {/* =========================
                ADMIN MAIN
            ========================= */}

            <Route index element={<Dashboard />} />

            {/* =========================
                ADMIN ORDERS
            ========================= */}

            <Route path="orders" element={<Orders />} />

            {/* =========================
                ADMIN PRODUCTS
            ========================= */}

            <Route path="products" element={<AdminProducts />} />

            {/* =========================
                ADMIN CUSTOMERS & STAFF
            ========================= */}

            <Route path="customers" element={<CustomersStaff />} />

            {/* =========================
                ADMIN REFUNDS
            ========================= */}

            <Route path="refunds" element={<AdminRefunds />} />

            {/* =================================================
                FARM OS
            ================================================= */}

            {/* =========================
                FARM DASHBOARD
            ========================= */}

            <Route path="farm-dashboard" element={<FarmDashboard />} />

            {/* =========================
                BATCH MANAGEMENT
            ========================= */}

            <Route path="farm/batches" element={<Batches />} />

            {/* =========================
                CHICKS INWARD
            ========================= */}

            <Route path="farm/chicks-inward" element={<ChicksInward />} />

            {/* =========================
                BIRD STOCK
            ========================= */}

            <Route path="farm/bird-stock" element={<BirdStock />} />

            {/* =========================
                MORTALITY
            ========================= */}

            <Route path="farm/mortality" element={<Mortality />} />

            {/* =========================
                WEIGHT & GROWTH
            ========================= */}

            <Route path="farm/weight-growth" element={<WeightGrowth />} />

            {/* =========================
                EGG COLLECTION
            ========================= */}

            <Route path="farm/egg-collection" element={<EggCollection />} />

            {/* =========================
                FEED INVENTORY
            ========================= */}

            <Route path="farm/feed-inventory" element={<FeedInventory />} />

            {/* =========================
                FEED CONSUMPTION
            ========================= */}

            <Route path="farm/feed-consumption" element={<FeedConsumption />} />

            {/* =========================
                MEDICINE & VACCINE
            ========================= */}

            <Route path="farm/medicine-vaccine" element={<MedicineVaccine />} />

            {/* =========================
                VACCINATION SCHEDULE
            ========================= */}

            <Route path="farm/vaccination-schedule" element={<VaccinationSchedule />} />

            {/* =========================
                VETERINARY LOGS
            ========================= */}

            <Route path="farm/veterinary-logs" element={<VeterinaryLogs />} />

            {/* =========================
                WATER QUALITY
            ========================= */}

            <Route path="farm/water-quality" element={<WaterQuality />} />

            {/* =========================
                STAFF ATTENDANCE
            ========================= */}

            <Route path="farm/staff-attendance" element={<StaffAttendance />} />

            {/* =========================
                FARM TASKS
            ========================= */}

            <Route path="farm/tasks" element={<FarmTasks />} />

            {/* =========================
                PAYROLL
            ========================= */}

            <Route path="farm/payroll" element={<Payroll />} />

            {/* =========================
                BIOSECURITY
            ========================= */}

            <Route path="farm/biosecurity" element={<Biosecurity />} />

            {/* =========================
                SHED MANAGEMENT
            ========================= */}

            <Route path="farm/sheds" element={<Sheds />} />
            <Route path="farm/shed-maintenance" element={<ShedManagement />} />

            {/* =========================
                SALES & BILLING
            ========================= */}

            <Route path="farm/sales" element={<SalesBilling />} />

            {/* =========================
                FARM REPORTS
            ========================= */}

            <Route path="farm/reports" element={<FarmReports />} />

            {/* =========================
                FARM EXPENSSES
            ========================= */}

            <Route path="/admin/farm/expenses" element={<FarmExpenses />} />

            {/* =========================
                FARM CREATE 
            ========================= */}

            <Route path="farm/create-farm" element={<CreateFarms />} />

            {/* =========================
                SETTING
            ========================= */}

            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </main>

      {/* =========================
          CUSTOMER FOOTER
      ========================= */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
