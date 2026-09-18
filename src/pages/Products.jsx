import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import ProductCard from "../components/products/ProductCard";
import { getProducts } from "../api/productApi";

const categories = [
  { label: "All", value: "" },
  { label: "Eggs", value: "Eggs" },
  { label: "Chicken", value: "Chicken" },
  { label: "Chicks", value: "Chicks" },
  { label: "Hatching", value: "Hatching Eggs" },
  { label: "Breeding", value: "Breeding Pair" },
  { label: "Live Birds", value: "Live Birds" },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          limit: 100,
        });

        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          throw new Error(data.message || "Unable to load products");
        }
      } catch (error) {
        console.error("Products fetch error:", error);

        setProducts([]);
        setError(error.message || "Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const selectedCategory = categories.find((category) => category.label === activeCategory);

    if (selectedCategory?.value) {
      result = result.filter((product) => product.category === selectedCategory.value);
    }

    if (search.trim()) {
      const searchValue = search.toLowerCase().trim();

      result = result.filter((product) => {
        return product.name?.toLowerCase().includes(searchValue) || product.category?.toLowerCase().includes(searchValue) || product.shortDescription?.toLowerCase().includes(searchValue) || product.description?.toLowerCase().includes(searchValue);
      });
    }

    if (sortBy === "low-high") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, activeCategory, search, sortBy]);

  const clearFilters = () => {
    setActiveCategory("All");
    setSearch("");
    setSortBy("default");
  };

  const retryProducts = () => {
    window.location.reload();
  };

  return (
    <section className="products-page">
      <div className="container">
        <div className="products-hero">
          <span className="section-eyebrow">Our Products</span>

          <h1>Farm Fresh Kadaknath Products.</h1>

          <p>Explore our range of Kadaknath eggs, chicken, chicks and other farm products, raised and handled with care.</p>
        </div>

        {loading ? (
          <div className="products-loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="products-error">
            <div className="error-icon">
              <X size={25} />
            </div>

            <h2>Unable to load products</h2>

            <p>{error}</p>

            <button type="button" className="empty-button" onClick={retryProducts}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="products-toolbar">
              <div className="search-box">
                <Search size={19} />

                <input type="search" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} />

                {search && (
                  <button type="button" className="clear-search" onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={17} />
                  </button>
                )}
              </div>

              <div className="sort-box">
                <SlidersHorizontal size={18} />

                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort products">
                  <option value="default">Sort by</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            <div className="category-list">
              {categories.map((category) => (
                <button type="button" key={category.label} className={`category-button ${activeCategory === category.label ? "active" : ""}`} onClick={() => setActiveCategory(category.label)}>
                  {category.label}
                </button>
              ))}
            </div>

            <div className="products-result-info">
              <div>
                <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"} found
              </div>

              {(activeCategory !== "All" || search || sortBy !== "default") && (
                <button type="button" className="reset-button" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-products">
                <div className="empty-icon">
                  <Search size={25} />
                </div>

                <h2>No products found</h2>

                <p>Try another search or select a different product category.</p>

                <button type="button" className="empty-button" onClick={clearFilters}>
                  View All Products
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`.products-page{padding:80px 0 100px;background:var(--bg-page)}.products-hero{max-width:760px;margin:0 auto 48px;text-align:center}.products-hero h1{margin-bottom:16px;color:var(--color-primary);font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.1}.products-hero p{color:#1a120c;font-size:1.05rem;line-height:1.8}.products-toolbar{display:grid;grid-template-columns:1fr 220px;gap:14px;margin-bottom:18px}.search-box,.sort-box{display:flex;align-items:center;min-height:50px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-md)}.search-box{padding:0 16px;color:var(--color-text-soft)}.search-box input{width:100%;height:48px;padding:0 12px;color:var(--color-text);background:transparent;border:0;outline:0;font-size:.9rem}.search-box input::placeholder{color:var(--color-text-soft)}.clear-search{display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;color:var(--color-text-soft);background:transparent;border:0;border-radius:50%}.clear-search:hover{color:var(--color-primary);background:var(--color-green-pale)}.sort-box{gap:9px;padding:0 14px;color:var(--color-text-soft)}.sort-box select{width:100%;height:48px;color:var(--color-text);background:transparent;border:0;outline:0;cursor:pointer;font-size:.86rem}.category-list{display:flex;align-items:center;gap:9px;padding:4px 0 22px;overflow-x:auto;scrollbar-width:none}.category-list::-webkit-scrollbar{display:none}.category-button{flex:0 0 auto;min-height:38px;padding:0 16px;color:var(--color-text-soft);background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-pill);font-size:.8rem;font-weight:700;transition:background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast)}.category-button:hover{color:var(--color-green);border-color:var(--color-green-light)}.category-button.active{color:var(--color-white);background:var(--color-green);border-color:var(--color-green)}.products-result-info{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px;color:#1a120c;font-size:.82rem}.products-result-info strong{color:var(--color-primary)}.reset-button{padding:0;color:var(--color-green);background:transparent;border:0;font-size:.8rem;font-weight:800}.reset-button:hover{color:var(--color-primary)}.products-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.empty-products,.products-error,.products-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:320px;padding:40px 20px;text-align:center;background:var(--bg-soft);border:1px solid var(--color-border);border-radius:var(--radius-lg)}.empty-icon,.error-icon{display:flex;align-items:center;justify-content:center;width:54px;height:54px;margin-bottom:18px;color:var(--color-green);background:var(--color-green-pale);border-radius:50%}.empty-products h2,.products-error h2{margin-bottom:7px;color:var(--color-primary);font-size:1.35rem}.empty-products p,.products-error p,.products-loading p{margin-bottom:20px;color:#1a120c;font-size:.88rem}.empty-button{min-height:44px;padding:0 19px;color:var(--color-white);background:var(--color-green);border:0;border-radius:var(--radius-pill);font-size:.82rem;font-weight:800}.empty-button:hover{background:var(--color-primary)}.loading-spinner{width:38px;height:38px;margin-bottom:16px;border:3px solid var(--color-border);border-top-color:var(--color-green);border-radius:50%;animation:productsSpin .8s linear infinite}@keyframes productsSpin{to{transform:rotate(360deg)}}@media(max-width:991px){.products-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:767px){.products-page{padding:60px 0 75px}.products-hero{margin-bottom:34px}.products-hero h1{font-size:2.25rem}.products-toolbar{grid-template-columns:1fr}.products-grid{grid-template-columns:1fr;gap:18px}}`}</style>
    </section>
  );
};

export default Products;
