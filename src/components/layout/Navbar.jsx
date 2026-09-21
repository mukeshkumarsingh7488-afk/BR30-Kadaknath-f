import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, ShoppingCart, UserRound, UserPlus, X, LayoutDashboard } from "lucide-react";

import siteConfig from "../../config/siteConfig";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [desktopDropdown, setDesktopDropdown] = useState(null);

  const navbarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdown(null);
    setDesktopDropdown(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setDesktopDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      setDesktopDropdown(null);
      setMobileDropdown(null);
      setMobileOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleMobileDropdown = (name) => {
    setMobileDropdown((current) => (current === name ? null : name));
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setMobileDropdown(null);
    setDesktopDropdown(null);
  };

  const getFirstName = () => {
    if (!user?.name) return "Account";

    return user.name.trim().split(/\s+/)[0];
  };

  const getInitial = () => {
    const firstName = getFirstName();

    if (!firstName || firstName === "Account") {
      return "U";
    }

    return firstName.charAt(0).toUpperCase();
  };

  const renderDropdownItems = (items) =>
    items.map((item) => (
      <NavLink key={item.path} to={item.path} className={({ isActive }) => `navbar-dropdown-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
        {item.label}
      </NavLink>
    ));

  const renderDesktopDropdown = (items) => <div className="navbar-dropdown">{renderDropdownItems(items)}</div>;

  const canAccessDashboard = isAuthenticated && user && ["admin", "staff", "fm", "security"].includes(user.role);

  return (
    <>
      <header className="navbar" ref={navbarRef}>
        <div className="navbar-container">
          {/* BRAND */}

          <Link to="/#home" className="navbar-brand" onClick={closeMenus} aria-label="BR30 Kadaknath Farms Home">
            <span className="navbar-brand-icon">
              <img src="/favicon-32x32.png" alt="BR30 Kadaknath Farms" />
            </span>

            <span className="navbar-brand-text">
              <strong>BR30</strong>
              <span>Kadaknath Farms</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="navbar-desktop" aria-label="Main navigation">
            <NavLink to="/#home" end className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              Home
            </NavLink>

            <div className="navbar-dropdown-wrapper" onMouseEnter={() => setDesktopDropdown("farm")} onMouseLeave={() => setDesktopDropdown(null)}>
              <button type="button" className={`navbar-link navbar-dropdown-trigger ${desktopDropdown === "farm" ? "active" : ""}`} aria-expanded={desktopDropdown === "farm"} onClick={() => setDesktopDropdown((current) => (current === "farm" ? null : "farm"))}>
                <span>Farm</span>
                <ChevronDown size={15} />
              </button>

              {desktopDropdown === "farm" && renderDesktopDropdown(siteConfig.navigation.farm)}
            </div>

            <div className="navbar-dropdown-wrapper" onMouseEnter={() => setDesktopDropdown("products")} onMouseLeave={() => setDesktopDropdown(null)}>
              <button type="button" className={`navbar-link navbar-dropdown-trigger ${desktopDropdown === "products" ? "active" : ""}`} aria-expanded={desktopDropdown === "products"} onClick={() => setDesktopDropdown((current) => (current === "products" ? null : "products"))}>
                <span>Products</span>
                <ChevronDown size={15} />
              </button>

              {desktopDropdown === "products" && renderDesktopDropdown(siteConfig.navigation.products)}
            </div>

            <div className="navbar-dropdown-wrapper" onMouseEnter={() => setDesktopDropdown("customer")} onMouseLeave={() => setDesktopDropdown(null)}>
              <button type="button" className={`navbar-link navbar-dropdown-trigger ${desktopDropdown === "customer" ? "active" : ""}`} aria-expanded={desktopDropdown === "customer"} onClick={() => setDesktopDropdown((current) => (current === "customer" ? null : "customer"))}>
                <span>Customer</span>
                <ChevronDown size={15} />
              </button>

              {desktopDropdown === "customer" && (
                <div className="navbar-dropdown navbar-customer-dropdown">
                  {renderDropdownItems(siteConfig.navigation.customer)}

                  <div className="navbar-dropdown-divider" />

                  <NavLink to="/register" className={({ isActive }) => `navbar-dropdown-link navbar-auth-dropdown-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
                    <UserPlus size={16} />
                    <span>Create Account</span>
                  </NavLink>

                  <NavLink to="/forgot-password" className={({ isActive }) => `navbar-dropdown-link navbar-auth-dropdown-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
                    <span>Forgot Password</span>
                  </NavLink>
                </div>
              )}
            </div>

            <div className="navbar-dropdown-wrapper" onMouseEnter={() => setDesktopDropdown("legal")} onMouseLeave={() => setDesktopDropdown(null)}>
              <button type="button" className={`navbar-link navbar-dropdown-trigger ${desktopDropdown === "legal" ? "active" : ""}`} aria-expanded={desktopDropdown === "legal"} onClick={() => setDesktopDropdown((current) => (current === "legal" ? null : "legal"))}>
                <span>Legal</span>
                <ChevronDown size={15} />
              </button>

              {desktopDropdown === "legal" && renderDesktopDropdown(siteConfig.navigation.legal)}
            </div>

            <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              Contact
            </NavLink>
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="navbar-actions">
            <Link to="/cart" className="navbar-cart" aria-label="Shopping cart" onClick={closeMenus}>
              <ShoppingCart size={18} />
              <span>Cart</span>
              <span className="navbar-cart-count">{cartCount}</span>
            </Link>

            {!isAuthenticated && (
              <>
                <Link to="/login" className="navbar-login-btn" onClick={closeMenus}>
                  <UserRound size={16} />
                  <span>Login</span>
                </Link>

                <Link to="/register" className="navbar-register-btn" onClick={closeMenus}>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </Link>
              </>
            )}

            <Link to="/products" className="navbar-order-btn" onClick={closeMenus}>
              Order Now
            </Link>

            {/* CUSTOMER PROFILE - NAME FIRST */}

            {isAuthenticated && user && (
              <Link to="/profile" className={`navbar-user-profile ${location.pathname === "/profile" ? "active" : ""}`} onClick={closeMenus} aria-label="Open your profile">
                {user.profilePicture?.url ? <img src={user.profilePicture.url} alt={user.name || "Profile"} className="navbar-user-avatar" /> : <span className="navbar-user-avatar navbar-user-avatar-initial">{getInitial()}</span>}

                <span className="navbar-user-name">{getFirstName()}</span>
              </Link>
            )}

            {/* ADMIN / STAFF DASHBOARD ICON ONLY */}

            {canAccessDashboard && (
              <Link to="/admin" target="_blank" rel="noopener noreferrer" className={`navbar-admin-btn ${location.pathname.startsWith("/admin") ? "active" : ""}`} onClick={closeMenus} aria-label="Admin Dashboard" title="Admin Dashboard">
                <LayoutDashboard size={18} />
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}

          <button type="button" className="navbar-mobile-toggle" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((current) => !current)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <div className={`navbar-mobile ${mobileOpen ? "open" : ""}`}>
          <div className="navbar-mobile-inner">
            <NavLink to="/#home" end className={({ isActive }) => `navbar-mobile-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
              Home
            </NavLink>

            <div className="navbar-mobile-group">
              <button type="button" className="navbar-mobile-dropdown-trigger" aria-expanded={mobileDropdown === "farm"} onClick={() => toggleMobileDropdown("farm")}>
                <span>Farm</span>
                <ChevronDown size={18} className={mobileDropdown === "farm" ? "rotate-icon" : ""} />
              </button>

              <div className={`navbar-mobile-dropdown ${mobileDropdown === "farm" ? "open" : ""}`}>{renderDropdownItems(siteConfig.navigation.farm)}</div>
            </div>

            <div className="navbar-mobile-group">
              <button type="button" className="navbar-mobile-dropdown-trigger" aria-expanded={mobileDropdown === "products"} onClick={() => toggleMobileDropdown("products")}>
                <span>Products</span>
                <ChevronDown size={18} className={mobileDropdown === "products" ? "rotate-icon" : ""} />
              </button>

              <div className={`navbar-mobile-dropdown ${mobileDropdown === "products" ? "open" : ""}`}>{renderDropdownItems(siteConfig.navigation.products)}</div>
            </div>

            <div className="navbar-mobile-group">
              <button type="button" className="navbar-mobile-dropdown-trigger" aria-expanded={mobileDropdown === "customer"} onClick={() => toggleMobileDropdown("customer")}>
                <span>Customer</span>
                <ChevronDown size={18} className={mobileDropdown === "customer" ? "rotate-icon" : ""} />
              </button>

              <div className={`navbar-mobile-dropdown ${mobileDropdown === "customer" ? "open" : ""}`}>
                {renderDropdownItems(siteConfig.navigation.customer)}

                <div className="navbar-mobile-divider" />

                <NavLink to="/register" className={({ isActive }) => `navbar-dropdown-link navbar-mobile-auth-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </NavLink>

                <NavLink to="/forgot-password" className={({ isActive }) => `navbar-dropdown-link navbar-mobile-auth-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
                  <span>Forgot Password</span>
                </NavLink>
              </div>
            </div>

            <div className="navbar-mobile-group">
              <button type="button" className="navbar-mobile-dropdown-trigger" aria-expanded={mobileDropdown === "legal"} onClick={() => toggleMobileDropdown("legal")}>
                <span>Legal</span>
                <ChevronDown size={18} className={mobileDropdown === "legal" ? "rotate-icon" : ""} />
              </button>

              <div className={`navbar-mobile-dropdown ${mobileDropdown === "legal" ? "open" : ""}`}>{renderDropdownItems(siteConfig.navigation.legal)}</div>
            </div>

            <NavLink to="/contact" className={({ isActive }) => `navbar-mobile-link ${isActive ? "active" : ""}`} onClick={closeMenus}>
              Contact
            </NavLink>

            {/* MOBILE PROFILE */}

            {isAuthenticated && user && (
              <Link to="/profile" className={`navbar-mobile-profile ${location.pathname === "/profile" ? "active" : ""}`} onClick={closeMenus}>
                {user.profilePicture?.url ? <img src={user.profilePicture.url} alt={user.name || "Profile"} className="navbar-mobile-profile-avatar" /> : <span className="navbar-mobile-profile-avatar navbar-mobile-profile-initial">{getInitial()}</span>}

                <span className="navbar-mobile-profile-info">
                  <strong>{getFirstName()}</strong>
                  <small>View Profile</small>
                </span>
              </Link>
            )}

            {!isAuthenticated && (
              <div className="navbar-mobile-auth">
                <Link to="/login" className="navbar-mobile-login" onClick={closeMenus}>
                  <UserRound size={18} />
                  <span>Login</span>
                </Link>

                <Link to="/register" className="navbar-mobile-register" onClick={closeMenus}>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </Link>
              </div>
            )}

            <div className="navbar-mobile-actions">
              <Link to="/cart" className="navbar-mobile-cart" onClick={closeMenus}>
                <ShoppingCart size={18} />
                <span>Cart</span>
                <strong>{cartCount}</strong>
              </Link>

              <Link to="/products" className="navbar-mobile-order" onClick={closeMenus}>
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* NAVBAR STYLES */}

      <style>{`
        .navbar{position:sticky;top:0;z-index:1000;width:100%;background:rgba(255,253,247,.96);border-bottom:1px solid var(--color-border);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}.navbar-container{width:min(100% - (var(--container-padding) * 2),var(--container-width));min-height:76px;margin-inline:auto;display:flex;align-items:center;gap:24px}.navbar-brand{display:inline-flex;align-items:center;gap:10px;flex-shrink:0}.navbar-brand-icon{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border-radius:12px;background:var(--color-primary)}.navbar-brand-icon img{width:100%;height:100%;display:block;object-fit:cover}.navbar-brand-text{display:flex;flex-direction:column;line-height:1.05;white-space:nowrap}.navbar-brand-text strong{color:var(--color-primary);font-size:1rem;font-weight:850;letter-spacing:.04em}.navbar-brand-text span{margin-top:3px;color:var(--color-text-soft);font-size:.77rem;font-weight:650}.navbar-desktop{margin-left:auto;display:flex;align-items:center;gap:2px}.navbar-link{min-height:42px;padding:0 11px;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:0;border-radius:9px;background:transparent;color:var(--color-text-soft);font-size:.9rem;font-weight:700;transition:color var(--transition-fast),background var(--transition-fast)}.navbar-link:hover,.navbar-link.active{color:var(--color-primary);background:var(--color-green-pale)}.navbar-dropdown-trigger{cursor:pointer}.navbar-dropdown-wrapper{position:relative;height:76px;display:flex;align-items:center}.navbar-dropdown{position:absolute;top:100%;left:50%;min-width:225px;padding:8px;transform:translateX(-50%);display:flex;flex-direction:column;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);animation:navbarDropdownIn .16s ease-out}.navbar-dropdown-link{min-height:42px;padding:9px 12px;display:flex;align-items:center;gap:8px;border-radius:9px;color:var(--color-text-soft);font-size:.89rem;font-weight:650;transition:color var(--transition-fast),background var(--transition-fast)}.navbar-dropdown-link:hover,.navbar-dropdown-link.active{color:var(--color-primary);background:var(--color-green-pale)}.navbar-dropdown-divider{height:1px;margin:6px 4px;background:var(--color-border)}.navbar-auth-dropdown-link{font-weight:700}@keyframes navbarDropdownIn{from{opacity:0;transform:translate(-50%,-4px)}to{opacity:1;transform:translate(-50%,0)}}.navbar-actions{display:flex;align-items:center;gap:7px;flex-shrink:0}.navbar-cart{min-height:42px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;gap:6px;color:var(--color-text-soft);font-size:.87rem;font-weight:750;border-radius:9px;transition:color var(--transition-fast),background var(--transition-fast)}.navbar-cart:hover{color:var(--color-primary);background:var(--color-green-pale)}.navbar-cart-count{min-width:19px;height:19px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--radius-pill);background:var(--color-gold);color:var(--color-primary);font-size:.68rem;font-weight:850}.navbar-login-btn{min-height:42px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);background:var(--color-white);color:var(--color-primary);font-size:.84rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),border-color var(--transition-fast),color var(--transition-fast)}.navbar-login-btn:hover{background:var(--color-green-pale);border-color:var(--color-green-light);transform:translateY(-1px)}.navbar-register-btn{min-height:42px;padding:0 13px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--color-primary);border-radius:var(--radius-pill);background:var(--color-primary);color:var(--color-white);font-size:.84rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.navbar-register-btn:hover{background:var(--color-green);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.navbar-order-btn{min-height:42px;padding:0 17px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--radius-pill);background:var(--color-green);color:var(--color-white);font-size:.86rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.navbar-order-btn:hover{background:var(--color-primary);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.navbar-user-profile{min-height:42px;padding:3px 11px 3px 5px;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--color-border-dark);border-radius:var(--radius-pill);background:var(--color-white);color:var(--color-primary);font-size:.85rem;font-weight:800;transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast),box-shadow var(--transition-fast)}.navbar-user-profile:hover,.navbar-user-profile.active{background:var(--color-green-pale);border-color:var(--color-green-light);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.navbar-user-avatar{width:32px;height:32px;border-radius:50%;object-fit:cover;display:block;flex-shrink:0}.navbar-user-avatar-initial{display:flex;align-items:center;justify-content:center;background:var(--color-primary);color:var(--color-white);font-size:.78rem;font-weight:850}.navbar-user-name{max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.navbar-admin-btn{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--color-border-dark);border-radius:50%;background:var(--color-white);color:var(--color-primary);transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast),box-shadow var(--transition-fast)}.navbar-admin-btn:hover,.navbar-admin-btn.active{background:var(--color-green-pale);border-color:var(--color-green-light);color:var(--color-primary);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.navbar-mobile-toggle{display:none;width:42px;height:42px;margin-left:auto;align-items:center;justify-content:center;border:1px solid var(--color-border);border-radius:10px;background:var(--color-white);color:var(--color-primary);transition:background var(--transition-fast),border-color var(--transition-fast)}.navbar-mobile-toggle:hover{background:var(--color-green-pale);border-color:var(--color-border-dark)}.navbar-mobile{display:none}.navbar-mobile-profile{margin-top:16px;padding:10px 12px;display:flex;align-items:center;gap:11px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-white);color:var(--color-primary);transition:background var(--transition-fast),border-color var(--transition-fast)}.navbar-mobile-profile:hover,.navbar-mobile-profile.active{background:var(--color-green-pale);border-color:var(--color-green-light)}.navbar-mobile-profile-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;flex-shrink:0}.navbar-mobile-profile-initial{background:var(--color-primary);color:var(--color-white);font-size:.9rem;font-weight:850}.navbar-mobile-profile-info{display:flex;flex-direction:column;gap:2px}.navbar-mobile-profile-info strong{font-size:.9rem;font-weight:850}.navbar-mobile-profile-info small{font-size:.74rem;color:var(--color-text-soft);font-weight:600}.navbar-mobile-admin{width:42px;height:42px;margin-top:14px;display:flex;align-items:center;justify-content:center;border:1px solid var(--color-border-dark);border-radius:50%;background:var(--color-white);color:var(--color-primary);transition:background var(--transition-fast),border-color var(--transition-fast),transform var(--transition-fast),box-shadow var(--transition-fast)}.navbar-mobile-admin:hover,.navbar-mobile-admin.active{background:var(--color-green-pale);border-color:var(--color-green-light);color:var(--color-primary);transform:translateY(-1px);box-shadow:var(--shadow-sm)}@media (max-width:1100px){.navbar-container{gap:14px}.navbar-link{padding:0 8px;font-size:.84rem}.navbar-order-btn{padding:0 13px}.navbar-login-btn,.navbar-register-btn{padding:0 9px}.navbar-user-profile{padding-right:8px}.navbar-user-name{max-width:65px}}@media (max-width:900px){.navbar-desktop,.navbar-actions{display:none}.navbar-mobile-toggle{display:inline-flex}.navbar-mobile{display:block;max-height:0;overflow:hidden;background:var(--color-white);border-top:0 solid var(--color-border);transition:max-height .35s ease,border-color .25s ease}.navbar-mobile.open{max-height:calc(100vh - 76px);overflow-y:auto;border-top-width:1px}.navbar-mobile-inner{width:min(100% - (var(--container-padding) * 2),var(--container-width));margin-inline:auto;padding:10px 0 24px}.navbar-mobile-link,.navbar-mobile-dropdown-trigger{width:100%;min-height:49px;display:flex;align-items:center;justify-content:space-between;border:0;border-bottom:1px solid var(--color-border);background:transparent;color:var(--color-text);font-size:.95rem;font-weight:750;text-align:left}.navbar-mobile-link.active{color:var(--color-green)}.navbar-mobile-dropdown-trigger{cursor:pointer}.navbar-mobile-dropdown-trigger svg{transition:transform var(--transition-fast)}.rotate-icon{transform:rotate(180deg)}.navbar-mobile-dropdown{max-height:0;overflow:hidden;padding-left:10px;transition:max-height .3s ease}.navbar-mobile-dropdown.open{max-height:700px}.navbar-mobile-dropdown .navbar-dropdown-link{min-height:43px;border-bottom:1px solid rgba(227,230,220,.75);border-radius:0}.navbar-mobile-divider{height:1px;margin:6px 4px;background:var(--color-border)}.navbar-mobile-auth-link{font-weight:700}.navbar-mobile-auth{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:20px}.navbar-mobile-login,.navbar-mobile-register{min-height:46px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:var(--radius-pill);font-size:.88rem;font-weight:800}.navbar-mobile-login{border:1px solid var(--color-border-dark);background:var(--color-white);color:var(--color-primary)}.navbar-mobile-login:hover{background:var(--color-green-pale)}.navbar-mobile-register{background:var(--color-primary);color:var(--color-white)}.navbar-mobile-register:hover{background:var(--color-green)}.navbar-mobile-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:10px}.navbar-mobile-cart,.navbar-mobile-order{min-height:46px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:var(--radius-pill);font-size:.88rem;font-weight:800}.navbar-mobile-cart{border:1px solid var(--color-border-dark);background:var(--color-white);color:var(--color-primary)}.navbar-mobile-cart strong{min-width:19px;height:19px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--radius-pill);background:var(--color-gold);font-size:.68rem}.navbar-mobile-order{background:var(--color-green);color:var(--color-white)}}@media (max-width:575px){.navbar-container{min-height:68px}.navbar-brand{gap:8px}.navbar-brand-icon{width:38px;height:38px;border-radius:10px}.navbar-brand-text strong{font-size:.91rem}.navbar-brand-text span{font-size:.69rem}.navbar-mobile.open{max-height:calc(100vh - 68px)}.navbar-mobile-auth,.navbar-mobile-actions{grid-template-columns:1fr}.navbar-mobile-actions{padding-top:10px}}
      `}</style>
    </>
  );
};

export default Navbar;
