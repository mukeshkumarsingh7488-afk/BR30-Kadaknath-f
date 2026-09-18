import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";

import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutFarm from "./pages/AboutFarm";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Register from "./pages/customer/Register";
import VerifyEmail from "./pages/customer/VerifyEmail";
import Login from "./pages/customer/Login";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";
import Profile from "./pages/customer/Profile";
import MyOrders from "./pages/customer/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/customer/TrackOrder";
import OrderDetails from "./pages/customer/OrderDetails";
import FAQ from "./pages/customer/FAQ";

import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ShippingPolicy from "./pages/legal/ShippingPolicy";

import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import CustomersStaff from "./pages/admin/CustomersStaff";

function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <ScrollToTop />

      <main>
        <Routes>
          {/* ================= CUSTOMER WEBSITE ================= */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/products/:slug" element={<ProductDetails />} />

          <Route path="/about-farm" element={<AboutFarm />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/register" element={<Register />} />

          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/login" element={<Login />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/my-orders" element={<MyOrders />} />

          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          <Route path="/track-order" element={<TrackOrder />} />

          <Route path="/track-order/:id" element={<TrackOrder />} />

          <Route path="/order-details/:id" element={<OrderDetails />} />

          <Route path="/faq" element={<FAQ />} />

          {/* ================= LEGAL ================= */}

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/terms-of-service" element={<TermsOfService />} />

          <Route path="/refund-policy" element={<RefundPolicy />} />

          <Route path="/shipping-policy" element={<ShippingPolicy />} />

          {/* ================= ADMIN PANEL ================= */}

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />

            <Route path="orders" element={<Orders />} />

            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<CustomersStaff />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
