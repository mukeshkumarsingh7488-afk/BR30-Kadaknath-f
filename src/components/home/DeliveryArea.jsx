import { useState } from "react";
import { MapPin, Truck, Clock, ArrowRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

const deliveryAreas = [
  "Araria",
  "Arwal",
  "Aurangabad",
  "Banka",
  "Begusarai",
  "Bhagalpur",
  "Bhojpur",
  "Buxar",
  "Darbhanga",
  "East Champaran",
  "Gaya",
  "Gopalganj",
  "Jamui",
  "Jehanabad",
  "Kaimur",
  "Katihar",
  "Khagaria",
  "Kishanganj",
  "Lakhisarai",
  "Madhepura",
  "Madhubani",
  "Munger",
  "Muzaffarpur",
  "Nalanda",
  "Nawada",
  "Patna",
  "Purnia",
  "Rohtas",
  "Saharsa",
  "Samastipur",
  "Saran",
  "Sheikhpura",
  "Sheohar",
  "Sitamarhi",
  "Siwan",
  "Supaul",
  "Vaishali",
  "West Champaran",
];

const DeliveryArea = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const areasPerPage = 8;

  const filteredAreas = deliveryAreas.filter((area) => area.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPages = Math.ceil(filteredAreas.length / areasPerPage);

  const visibleAreas = filteredAreas.slice(currentPage * areasPerPage, currentPage * areasPerPage + areasPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((page) => page + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((page) => page - 1);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const toggleSearch = () => {
    setSearchOpen((current) => !current);

    if (searchOpen) {
      setSearchTerm("");
      setCurrentPage(0);
    }
  };

  return (
    <section className="delivery-section" id="delivery-area">
      <div className="container">
        <div className="delivery-card">
          {/* =========================================
              LEFT CONTENT
          ========================================= */}

          <div className="delivery-content">
            <span className="section-eyebrow">Farm to Your Door</span>

            <h2>Fresh Farm Products, Delivered With Care.</h2>

            <p>We are building our delivery network around our farm so that your order can reach you with proper care and handling.</p>

            <div className="delivery-features">
              <div className="delivery-feature">
                <div className="delivery-feature-icon">
                  <Truck size={19} />
                </div>

                <div>
                  <strong>Careful Delivery</strong>
                  <span>Handled with attention from farm to door.</span>
                </div>
              </div>

              <div className="delivery-feature">
                <div className="delivery-feature-icon">
                  <Clock size={19} />
                </div>

                <div>
                  <strong>Planned Delivery</strong>
                  <span>Delivery slots will depend on your location.</span>
                </div>
              </div>
            </div>

            <Link to="/contact" className="delivery-button">
              Check Delivery Availability
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* =========================================
              DELIVERY LOCATION CARD
          ========================================= */}

          <div className="delivery-location-card">
            {/* Header */}

            <div className="location-header">
              <div className="location-icon">
                <MapPin size={22} />
              </div>

              <div className="location-header-content">
                <span>Current Delivery Network</span>
                <h3>Selected Bihar Areas</h3>
              </div>

              <button type="button" className="location-search-btn" onClick={toggleSearch} aria-label={searchOpen ? "Close delivery area search" : "Search delivery areas"}>
                {searchOpen ? <X size={19} /> : <Search size={19} />}
              </button>
            </div>

            {/* Search */}

            {searchOpen && (
              <div className="location-search">
                <Search size={17} />

                <input type="text" placeholder="Search district..." value={searchTerm} onChange={(event) => handleSearch(event.target.value)} autoFocus />
              </div>
            )}

            {/* Area List */}

            <div className="area-list">
              {visibleAreas.length > 0 ? (
                visibleAreas.map((area) => (
                  <div className="area-item" key={area}>
                    <span className="area-dot" />
                    <span>{area}</span>
                  </div>
                ))
              ) : (
                <div className="no-area-found">No delivery area found.</div>
              )}
            </div>

            {/* Footer / Pagination */}

            <div className="location-footer">
              <span>{filteredAreas.length > 0 ? `${currentPage * areasPerPage + 1}–${Math.min((currentPage + 1) * areasPerPage, filteredAreas.length)} of ${filteredAreas.length}` : "0 areas"}</span>

              <div className="area-pagination">
                <button type="button" onClick={previousPage} disabled={currentPage === 0} aria-label="Previous delivery areas">
                  <ChevronLeft size={17} />
                </button>

                <span className="page-number">
                  {totalPages > 0 ? currentPage + 1 : 0}/{totalPages}
                </span>

                <button type="button" onClick={nextPage} disabled={currentPage >= totalPages - 1} aria-label="Next delivery areas">
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`.delivery-section{padding:90px 0;background:var(--bg-soft)}.delivery-card{display:grid;grid-template-columns:1.15fr .85fr;gap:50px;padding:56px;overflow:hidden;background:var(--color-primary);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg)}.delivery-content{color:var(--color-white)}.delivery-content .section-eyebrow{color:var(--color-gold-light)}.delivery-content h2{max-width:620px;margin-bottom:18px;color:var(--color-white);font-size:clamp(2rem,4vw,3rem);line-height:1.15}.delivery-content>p{max-width:620px;margin-bottom:32px;color:rgba(255,255,255,.85);font-size:1rem;line-height:1.8}.delivery-features{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-bottom:34px}.delivery-feature{display:flex;align-items:flex-start;gap:12px}.delivery-feature-icon{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:40px;height:40px;color:var(--color-gold-light);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:10px}.delivery-feature strong{display:block;margin-bottom:3px;color:var(--color-white);font-size:.9rem}.delivery-feature span{display:block;color:rgba(255,255,255,.85);font-size:.78rem;line-height:1.5}.delivery-button{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:0 21px;color:var(--color-primary);background:var(--color-gold);border-radius:var(--radius-pill);font-size:.9rem;font-weight:800;transition:transform var(--transition-fast),background var(--transition-fast),box-shadow var(--transition-fast)}.delivery-button:hover{background:var(--color-gold-light);transform:translateY(-2px);box-shadow:var(--shadow-md)}.delivery-location-card{align-self:center;padding:30px;background:var(--color-white);border-radius:var(--radius-lg);box-shadow:var(--shadow-md)}.location-header{display:flex;align-items:center;gap:13px;padding-bottom:22px;border-bottom:1px solid var(--color-border)}.location-icon{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:46px;height:46px;color:var(--color-green);background:var(--color-green-pale);border-radius:50%}.location-header-content{flex:1;min-width:0}.location-header span{display:block;margin-bottom:2px;color:var(--color-text-soft);font-size:.75rem;font-weight:600}.location-header h3{color:var(--color-primary);font-size:1.05rem}.location-search-btn{width:38px;height:38px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;border:1px solid var(--color-border);border-radius:50%;background:var(--color-white);color:var(--color-primary);cursor:pointer;transition:background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast)}.location-search-btn:hover{background:var(--color-green-pale);color:var(--color-green);border-color:var(--color-green-light)}.location-search{display:flex;align-items:center;gap:9px;height:42px;margin-top:16px;padding:0 12px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-white)}.location-search svg{flex:0 0 auto;color:var(--color-text-soft)}.location-search input{width:100%;border:0;outline:none;background:transparent;color:var(--color-text);font-size:.84rem}.location-search input::placeholder{color:var(--color-text-soft)}.area-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px;min-height:118px;padding:24px 0}.area-item{display:flex;align-items:center;gap:9px;color:var(--color-text);font-size:.88rem;font-weight:600}.area-dot{width:7px;height:7px;flex:0 0 auto;background:var(--color-green);border-radius:50%}.no-area-found{grid-column:1/-1;display:flex;align-items:center;justify-content:center;min-height:70px;color:var(--color-text-soft);font-size:.82rem}.location-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:18px;border-top:1px solid var(--color-border)}.location-footer>span{color:var(--color-text-soft);font-size:.76rem}.area-pagination{display:flex;align-items:center;gap:8px}.area-pagination button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--color-border);border-radius:8px;background:var(--color-white);color:var(--color-primary);cursor:pointer;transition:background var(--transition-fast),border-color var(--transition-fast),color var(--transition-fast)}.area-pagination button:hover:not(:disabled){background:var(--color-green-pale);border-color:var(--color-green-light);color:var(--color-green)}.area-pagination button:disabled{opacity:.35;cursor:not-allowed}.area-pagination .page-number{min-width:38px;text-align:center;color:var(--color-text-soft);font-size:.75rem;font-weight:700}@media (max-width:991px){.delivery-card{grid-template-columns:1fr;gap:35px;padding:42px}.delivery-location-card{max-width:620px;width:100%;justify-self:center}}@media (max-width:767px){.delivery-section{padding:65px 0}.delivery-card{gap:30px;padding:30px 22px;border-radius:var(--radius-lg)}.delivery-content h2{font-size:2rem}.delivery-features{grid-template-columns:1fr;gap:20px}.delivery-location-card{padding:24px 20px}}@media (max-width:480px){.area-list{grid-template-columns:1fr;min-height:244px}.location-footer{align-items:flex-start}.location-footer>span{max-width:120px;line-height:1.4}.delivery-button{width:100%}}`}</style>
    </section>
  );
};

export default DeliveryArea;
