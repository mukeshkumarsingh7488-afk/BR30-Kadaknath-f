import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Loader2, Package, Plus, RefreshCw, Search, Trash2, X, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

import apiRequest from "../../api/api";

const CATEGORIES = ["Eggs", "Chicken", "Chicks", "Hatching Eggs", "Breeding Pair", "Live Birds"];

const PRODUCT_IMAGES = {
  Eggs: "/images/kadaknath-eggs.png",
  Chicken: "/images/kadaknath-chicken.png",
  Chicks: "/images/kadaknath-chicks.png",
  "Hatching Eggs": "/images/kadaknath-hatching-eggs.png",
  "Breeding Pair": "/images/kadaknath-breeding-pair.png",
  "Live Birds": "/images/kadaknath-live-birds.png",
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "Eggs",
  shortDescription: "",
  description: "",
  price: "",
  comparePrice: "",
  unit: "piece",
  stock: "",
  image: "",
  isActive: true,
};

const getProductId = (product) => {
  return product?._id || product?.id || "";
};

const generateSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingProductId, setTogglingProductId] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiRequest("/products/admin/all");

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load products.");
      }

      setProducts(Array.isArray(response.products) ? response.products : []);
    } catch (error) {
      console.error("Admin products fetch error:", error);

      const message = error?.data?.message || error?.response?.data?.message || error?.message || "Unable to load products.";

      Swal.fire({
        icon: "error",
        title: "Products Error",
        text: message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const searchableText = [product?.name, product?.slug, product?.category, product?.shortDescription, product?.description].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesCategory = category === "ALL" || String(product?.category || "") === category;
      const matchesStatus = status === "ALL" || (status === "ACTIVE" ? product?.isActive !== false : product?.isActive === false);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const statistics = useMemo(() => {
    const total = products.length;
    const active = products.filter((product) => product?.isActive !== false).length;
    const inactive = products.filter((product) => product?.isActive === false).length;
    const lowStock = products.filter((product) => Number(product?.stock || 0) <= 5).length;

    return {
      total,
      active,
      inactive,
      lowStock,
    };
  }, [products]);

  const clearFilters = () => {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product?.name || "",
      slug: product?.slug || "",
      category: product?.category || "Eggs",
      shortDescription: product?.shortDescription || "",
      description: product?.description || "",
      price: product?.price ?? "",
      comparePrice: product?.comparePrice ?? "",
      unit: product?.unit || "piece",
      stock: product?.stock ?? "",
      image: product?.image || PRODUCT_IMAGES[product?.category] || "",
      isActive: product?.isActive !== false,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name" && !editingProduct) {
        next.slug = generateSlug(value);
      }

      if (name === "category" && !editingProduct && !current.image) {
        next.image = PRODUCT_IMAGES[value] || "";
      }

      return next;
    });
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Product Name Required",
        text: "Please enter a product name.",
      });
      return;
    }

    if (!form.category) {
      Swal.fire({
        icon: "warning",
        title: "Category Required",
        text: "Please select a category.",
      });
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Price",
        text: "Please enter a valid product price.",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        slug: generateSlug(form.slug || form.name),
        category: form.category,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        comparePrice: form.comparePrice === "" ? undefined : Number(form.comparePrice),
        unit: form.unit.trim() || "piece",
        stock: form.stock === "" ? 0 : Number(form.stock),
        image: form.image || PRODUCT_IMAGES[form.category] || "",
        isActive: Boolean(form.isActive),
      };

      const productId = getProductId(editingProduct);

      const response = await apiRequest(productId ? `/products/admin/${productId}` : "/products/admin", {
        method: productId ? "PUT" : "POST",
        body: payload,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to save product.");
      }

      await fetchProducts(true);

      closeModal();

      Swal.fire({
        icon: "success",
        title: productId ? "Product Updated" : "Product Created",
        text: productId ? "Product has been updated successfully." : "Product has been created successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Admin product save error:", error);

      const message = error?.data?.message || error?.response?.data?.message || error?.message || "Unable to save product.";

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: message,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleProductStatus = async (product) => {
    const productId = getProductId(product);

    if (!productId) {
      return;
    }

    const nextStatus = product?.isActive === false;

    const result = await Swal.fire({
      icon: nextStatus ? "question" : "warning",
      title: nextStatus ? "Activate Product?" : "Deactivate Product?",
      text: nextStatus ? `${product?.name || "This product"} will become visible to customers.` : `${product?.name || "This product"} will no longer be available to customers.`,
      showCancelButton: true,
      confirmButtonText: nextStatus ? "Activate" : "Deactivate",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setTogglingProductId(productId);

      const response = await apiRequest(`/products/admin/${productId}`, {
        method: "PUT",
        body: {
          isActive: nextStatus,
        },
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update product status.");
      }

      setProducts((current) =>
        current.map((item) =>
          String(getProductId(item)) === String(productId)
            ? {
                ...item,
                isActive: nextStatus,
              }
            : item
        )
      );

      Swal.fire({
        icon: "success",
        title: nextStatus ? "Product Activated" : "Product Deactivated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Admin product status update error:", error);

      const message = error?.data?.message || error?.response?.data?.message || error?.message || "Unable to update product status.";

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: message,
      });
    } finally {
      setTogglingProductId(null);
    }
  };

  const deleteProduct = async (product) => {
    const productId = getProductId(product);

    if (!productId) {
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Product?",
      html: `Are you sure you want to delete <strong>${escapeHtml(product?.name || "this product")}</strong>?<br/>This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await apiRequest(`/products/admin/${productId}`, {
        method: "DELETE",
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to delete product.");
      }

      setProducts((current) => current.filter((item) => String(getProductId(item)) !== String(productId)));

      Swal.fire({
        icon: "success",
        title: "Product Deleted",
        text: "Product has been deleted successfully.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Admin product delete error:", error);

      const message = error?.data?.message || error?.response?.data?.message || error?.message || "Unable to delete product.";

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: message,
      });
    }
  };

  return (
    <main className="admin-products-page">
      <div className="admin-products-container">
        <section className="admin-products-header">
          <div className="admin-products-title-row">
            <div className="admin-products-title-icon">
              <Package size={22} />
            </div>

            <div>
              <h1>Products</h1>
              <p>Manage your products, pricing, stock and availability.</p>
            </div>
          </div>

          <div className="admin-products-header-actions">
            <button type="button" className="admin-products-refresh-btn" onClick={() => fetchProducts(true)} disabled={loading || refreshing}>
              <RefreshCw size={17} className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button type="button" className="admin-products-add-btn" onClick={openCreateModal}>
              <Plus size={17} />
              Add Product
            </button>
          </div>
        </section>

        <section className="admin-products-stats">
          <div className="admin-product-stat-card">
            <div className="admin-product-stat-icon">
              <Package size={19} />
            </div>
            <div>
              <span>Total Products</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="admin-product-stat-card">
            <div className="admin-product-stat-icon">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <span>Active Products</span>
              <strong>{statistics.active}</strong>
            </div>
          </div>

          <div className="admin-product-stat-card">
            <div className="admin-product-stat-icon">
              <XCircle size={19} />
            </div>
            <div>
              <span>Inactive Products</span>
              <strong>{statistics.inactive}</strong>
            </div>
          </div>

          <div className="admin-product-stat-card">
            <div className="admin-product-stat-icon">
              <Package size={19} />
            </div>
            <div>
              <span>Low Stock</span>
              <strong>{statistics.lowStock}</strong>
            </div>
          </div>
        </section>

        <section className="admin-products-toolbar">
          <div className="admin-products-search">
            <Search size={18} />

            <input type="text" placeholder="Search product name, category, slug..." value={search} onChange={(event) => setSearch(event.target.value)} />

            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-products-filter">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="admin-products-filter">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown size={16} />
          </div>

          {(search || category !== "ALL" || status !== "ALL") && (
            <button type="button" className="admin-products-clear-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </section>

        {loading ? (
          <section className="admin-products-state">
            <Loader2 size={34} className="spin" />
            <h3>Loading products...</h3>
            <p>Please wait while we fetch the latest products.</p>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="admin-products-state">
            <Package size={40} />
            <h3>{products.length === 0 ? "No products yet" : "No matching products"}</h3>
            <p>{products.length === 0 ? "Create your first product to get started." : "Try changing your search or filters."}</p>

            {products.length === 0 ? (
              <button type="button" className="admin-products-retry-btn" onClick={openCreateModal}>
                <Plus size={16} />
                Add Product
              </button>
            ) : (
              <button type="button" className="admin-products-retry-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </section>
        ) : (
          <section className="admin-products-table-card">
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const productId = getProductId(product);
                    const active = product?.isActive !== false;
                    const image = product?.image || PRODUCT_IMAGES[product?.category] || "";
                    const stock = Number(product?.stock || 0);

                    return (
                      <tr key={productId}>
                        <td>
                          <div className="admin-product-info">
                            <div className="admin-product-image">{image ? <img src={image} alt={product?.name || "Product"} /> : <Package size={22} />}</div>

                            <div>
                              <strong>{product?.name || "Unnamed Product"}</strong>
                              <span>{product?.slug || "—"}</span>
                              {product?.shortDescription && <small>{product.shortDescription}</small>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-product-category">{product?.category || "—"}</span>
                        </td>

                        <td>
                          <div className="admin-product-price">
                            <strong>₹{Number(product?.price || 0).toLocaleString("en-IN")}</strong>
                            {product?.comparePrice && Number(product.comparePrice) > Number(product.price || 0) && <span>₹{Number(product.comparePrice).toLocaleString("en-IN")}</span>}
                            <small>per {product?.unit || "unit"}</small>
                          </div>
                        </td>

                        <td>
                          <span className={`admin-product-stock ${stock <= 5 ? "low" : ""}`}>{stock}</span>
                        </td>

                        <td>
                          <button type="button" className={`admin-product-status ${active ? "active" : "inactive"}`} onClick={() => toggleProductStatus(product)} disabled={String(togglingProductId) === String(productId)}>
                            {String(togglingProductId) === String(productId) ? <Loader2 size={13} className="spin" /> : active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {active ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td>
                          <div className="admin-product-actions">
                            <button type="button" className="admin-product-action-btn view" onClick={() => openEditModal(product)} title="View / Edit Product">
                              <Eye size={15} />
                            </button>

                            <button type="button" className="admin-product-action-btn edit" onClick={() => openEditModal(product)} title="Edit Product">
                              <Edit3 size={15} />
                            </button>

                            <button type="button" className="admin-product-action-btn delete" onClick={() => deleteProduct(product)} title="Delete Product">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-products-table-footer">
              <span>
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </section>
        )}
      </div>

      {modalOpen && (
        <div
          className="admin-product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}>
          <div className="admin-product-modal">
            <div className="admin-product-modal-header">
              <div>
                <span>{editingProduct ? "Edit Product" : "Create Product"}</span>
                <h2>{editingProduct ? editingProduct.name || "Product" : "Add New Product"}</h2>
              </div>

              <button type="button" onClick={closeModal} aria-label="Close product modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="admin-product-modal-body">
                <div className="admin-product-form-grid">
                  <div className="admin-product-form-group admin-product-form-full">
                    <label>Product Name</label>
                    <input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter product name" />
                  </div>

                  <div className="admin-product-form-group">
                    <label>Slug</label>
                    <input name="slug" value={form.slug} onChange={handleFormChange} placeholder="product-slug" />
                  </div>

                  <div className="admin-product-form-group">
                    <label>Category</label>
                    <div className="admin-product-form-select">
                      <select name="category" value={form.category} onChange={handleFormChange}>
                        {CATEGORIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </div>

                  <div className="admin-product-form-group">
                    <label>Price</label>
                    <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleFormChange} placeholder="0" />
                  </div>

                  <div className="admin-product-form-group">
                    <label>Compare Price</label>
                    <input type="number" min="0" step="0.01" name="comparePrice" value={form.comparePrice} onChange={handleFormChange} placeholder="Optional" />
                  </div>

                  <div className="admin-product-form-group">
                    <label>Unit</label>
                    <input name="unit" value={form.unit} onChange={handleFormChange} placeholder="piece, dozen, kg..." />
                  </div>

                  <div className="admin-product-form-group">
                    <label>Stock</label>
                    <input type="number" min="0" name="stock" value={form.stock} onChange={handleFormChange} placeholder="0" />
                  </div>

                  <div className="admin-product-form-group admin-product-form-full">
                    <label>Image URL</label>
                    <input name="image" value={form.image} onChange={handleFormChange} placeholder="/images/product.png" />
                  </div>

                  <div className="admin-product-form-group admin-product-form-full">
                    <label>Short Description</label>
                    <input name="shortDescription" value={form.shortDescription} onChange={handleFormChange} placeholder="Short product description" />
                  </div>

                  <div className="admin-product-form-group admin-product-form-full">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleFormChange} rows="4" placeholder="Enter full product description" />
                  </div>

                  <label className="admin-product-active-toggle">
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} />
                    <span className="admin-product-toggle-box">{form.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}</span>
                    <span>
                      <strong>Product Active</strong>
                      <small>Active products can be shown to customers.</small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="admin-product-modal-footer">
                <button type="button" className="admin-product-cancel-btn" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" className="admin-product-save-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={15} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProduct ? <Edit3 size={15} /> : <Plus size={15} />}
                      {editingProduct ? "Update Product" : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-products-page{min-height:100vh;background:var(--admin-bg);padding:32px 20px 60px;color:var(--admin-text)}
        .admin-products-container{max-width:1500px;margin:0 auto}
        .admin-products-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}
        .admin-products-title-row{display:flex;align-items:center;gap:14px}
        .admin-products-title-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--admin-primary);color:#fff}
        .admin-products-header h1{margin:0;font-size:28px;line-height:1.2;color:var(--admin-text)}
        .admin-products-header p{margin:6px 0 0;color:var(--admin-muted);font-size:14px}
        .admin-products-header-actions{display:flex;align-items:center;gap:9px}
        .admin-products-refresh-btn,.admin-products-add-btn,.admin-products-retry-btn{border:0;border-radius:10px;padding:11px 16px;color:#fff;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}
        .admin-products-refresh-btn{background:var(--admin-surface);border:1px solid var(--admin-border);color:var(--admin-text)}
        .admin-products-add-btn,.admin-products-retry-btn{background:var(--admin-primary)}
        .admin-products-refresh-btn:disabled{opacity:.6;cursor:not-allowed}
        .admin-products-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
        .admin-product-stat-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:18px;display:flex;align-items:center;gap:13px;box-shadow:0 3px 12px rgba(15,23,42,.04)}
        .admin-product-stat-icon{width:40px;height:40px;border-radius:11px;background:var(--admin-surface-2);color:var(--admin-text);display:flex;align-items:center;justify-content:center;flex:none}
        .admin-product-stat-card span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:4px}
        .admin-product-stat-card strong{display:block;color:var(--admin-text);font-size:18px}
        .admin-products-toolbar{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:center;margin-bottom:18px;box-shadow:0 3px 12px rgba(15,23,42,.04)}
        .admin-products-search{height:42px;flex:1;min-width:240px;display:flex;align-items:center;gap:9px;border:1px solid var(--admin-border);border-radius:10px;padding:0 12px;color:var(--admin-muted)}
        .admin-products-search input{border:0;outline:0;width:100%;font-size:14px;color:var(--admin-text);background:transparent}
        .admin-products-search input::placeholder{color:var(--admin-muted)}
        .admin-products-search button{border:0;background:transparent;color:var(--admin-muted);cursor:pointer;padding:3px}
        .admin-products-filter{position:relative;min-width:180px}
        .admin-products-filter select{appearance:none;width:100%;height:42px;border:1px solid var(--admin-border);border-radius:10px;padding:0 35px 0 12px;background:var(--admin-surface);color:var(--admin-text);outline:0;font-size:13px;cursor:pointer}
        .admin-products-filter svg{position:absolute;right:12px;top:13px;pointer-events:none;color:var(--admin-muted)}
        .admin-products-clear-btn{height:42px;border:1px solid var(--admin-border);border-radius:10px;background:var(--admin-surface);padding:0 14px;color:var(--admin-text);font-weight:700;cursor:pointer}
        .admin-products-table-card{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;overflow:hidden;box-shadow:0 3px 12px rgba(15,23,42,.04)}
        .admin-products-table-wrapper{overflow-x:auto}
        .admin-products-table{width:100%;border-collapse:collapse;min-width:1050px}
        .admin-products-table th{text-align:left;background:var(--admin-surface-2);color:var(--admin-muted);font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding:14px 16px;border-bottom:1px solid var(--admin-border);white-space:nowrap}
        .admin-products-table td{padding:14px 16px;border-bottom:1px solid var(--admin-border);vertical-align:middle;color:var(--admin-text)}
        .admin-products-table tbody tr:hover{background:var(--admin-surface-2)}
        .admin-product-info{display:flex;align-items:center;gap:11px;min-width:280px}
        .admin-product-image{width:52px;height:52px;border-radius:10px;background:#fff;border:1px solid var(--admin-border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;color:var(--admin-muted)}
        .admin-product-image img{width:100%;height:100%;object-fit:cover}
        .admin-product-info strong{display:block;color:var(--admin-text);font-size:13px}
        .admin-product-info span{display:block;color:var(--admin-muted);font-size:10px;margin-top:3px}
        .admin-product-info small{display:block;color:var(--admin-muted);font-size:10px;margin-top:3px;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .admin-product-category{display:inline-flex;align-items:center;border:1px solid var(--admin-border);border-radius:999px;padding:6px 9px;color:var(--admin-text);background:var(--admin-surface-2);font-size:11px;font-weight:700;white-space:nowrap}
        .admin-product-price strong{display:block;color:var(--admin-text);font-size:14px}
        .admin-product-price span{display:block;color:var(--admin-muted);font-size:10px;text-decoration:line-through;margin-top:2px}
        .admin-product-price small{display:block;color:var(--admin-muted);font-size:10px;margin-top:2px}
        .admin-product-stock{display:inline-flex;align-items:center;justify-content:center;min-width:38px;padding:6px 9px;border-radius:8px;background:var(--admin-surface-2);color:var(--admin-text);font-size:12px;font-weight:800}
        .admin-product-stock.low{color:var(--admin-danger);background:rgba(220,38,38,.08)}
        .admin-product-status{border:0;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:5px;cursor:pointer}
        .admin-product-status.active{background:#ecfdf5;color:#047857}
        .admin-product-status.inactive{background:#fef2f2;color:#b91c1c}
        .admin-product-status:disabled{opacity:.6;cursor:not-allowed}
        .admin-product-actions{display:flex;align-items:center;gap:6px}
        .admin-product-action-btn{width:32px;height:32px;border:1px solid var(--admin-border);border-radius:8px;background:var(--admin-surface);display:flex;align-items:center;justify-content:center;cursor:pointer}
        .admin-product-action-btn.view{color:var(--admin-text)}
        .admin-product-action-btn.edit{color:#2563eb}
        .admin-product-action-btn.delete{color:#dc2626}
        .admin-product-action-btn:hover{background:var(--admin-surface-2)}
        .admin-products-table-footer{padding:14px 16px;color:var(--admin-muted);font-size:12px}
        .admin-products-state{background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:14px;min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;color:var(--admin-muted)}
        .admin-products-state svg{margin-bottom:12px}
        .admin-products-state h3{margin:0 0 7px;color:var(--admin-text);font-size:18px}
        .admin-products-state p{margin:0 0 18px;font-size:13px}
        .admin-product-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:1000;padding:20px;display:flex;align-items:center;justify-content:center;overflow:auto}
        .admin-product-modal{width:min(760px,100%);max-height:92vh;overflow:auto;background:var(--admin-surface);border-radius:18px;box-shadow:0 24px 70px rgba(15,23,42,.25)}
        .admin-product-modal-header{padding:20px 22px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;gap:15px}
        .admin-product-modal-header span{display:block;color:var(--admin-muted);font-size:12px;margin-bottom:4px}
        .admin-product-modal-header h2{margin:0;color:var(--admin-text);font-size:20px}
        .admin-product-modal-header button{width:36px;height:36px;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface);display:flex;align-items:center;justify-content:center;color:var(--admin-muted);cursor:pointer}
        .admin-product-modal-body{padding:22px}
        .admin-product-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}
        .admin-product-form-full{grid-column:1/-1}
        .admin-product-form-group label{display:block;color:var(--admin-text);font-size:11px;font-weight:800;margin-bottom:6px}
        .admin-product-form-group input,.admin-product-form-group textarea{width:100%;box-sizing:border-box;border:1px solid var(--admin-border);border-radius:9px;background:var(--admin-surface-2);color:var(--admin-text);outline:0;padding:10px 11px;font-size:12px;font-family:inherit}
        .admin-product-form-group input::placeholder,.admin-product-form-group textarea::placeholder{color:var(--admin-muted)}
        .admin-product-form-group input:focus,.admin-product-form-group textarea:focus{border-color:var(--admin-primary)}
        .admin-product-form-group textarea{resize:vertical;min-height:95px}
        .admin-product-form-select{position:relative}
        .admin-product-form-select select{appearance:none;width:100%;height:39px;border:1px solid var(--admin-border);border-radius:9px;padding:0 32px 0 11px;background:var(--admin-surface-2);color:var(--admin-text);outline:0;font-size:12px;cursor:pointer}
        .admin-product-form-select svg{position:absolute;right:10px;top:12px;color:var(--admin-muted);pointer-events:none}
        .admin-product-active-toggle{grid-column:1/-1;display:flex;align-items:center;gap:10px;border:1px solid var(--admin-border);border-radius:10px;padding:11px;background:var(--admin-surface-2);cursor:pointer}
        .admin-product-active-toggle input{display:none}
        .admin-product-toggle-box{width:28px;height:28px;border-radius:8px;background:var(--admin-surface);border:1px solid var(--admin-border);display:flex;align-items:center;justify-content:center;color:var(--admin-primary);flex:none}
        .admin-product-active-toggle strong{display:block;color:var(--admin-text);font-size:12px}
        .admin-product-active-toggle small{display:block;color:var(--admin-muted);font-size:10px;margin-top:2px}
        .admin-product-modal-footer{border-top:1px solid var(--admin-border);padding:14px 22px;display:flex;justify-content:flex-end;gap:8px}
        .admin-product-cancel-btn,.admin-product-save-btn{border-radius:9px;padding:10px 15px;font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}
        .admin-product-cancel-btn{border:1px solid var(--admin-border);background:var(--admin-surface);color:var(--admin-text)}
        .admin-product-save-btn{border:0;background:var(--admin-primary);color:#fff}
        .admin-product-cancel-btn:disabled,.admin-product-save-btn:disabled{opacity:.6;cursor:not-allowed}
        .spin{animation:adminProductsSpin 1s linear infinite}
        @keyframes adminProductsSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media(max-width:1000px){.admin-products-stats{grid-template-columns:repeat(2,1fr)}.admin-products-toolbar{flex-wrap:wrap}.admin-products-search{flex-basis:100%}}
        @media(max-width:700px){.admin-products-page{padding:20px 12px 40px}.admin-products-header{align-items:flex-start;flex-direction:column}.admin-products-header-actions{width:100%}.admin-products-refresh-btn,.admin-products-add-btn{flex:1}.admin-products-title-row{align-items:flex-start}.admin-products-header h1{font-size:23px}.admin-products-header p{font-size:12px}.admin-products-stats{grid-template-columns:repeat(2,1fr)}.admin-product-stat-card{padding:13px}.admin-products-filter{flex:1;min-width:145px}.admin-products-clear-btn{flex:none}.admin-product-modal-overlay{padding:10px}.admin-product-modal-body{padding:15px}.admin-product-form-grid{grid-template-columns:1fr}.admin-product-form-full,.admin-product-active-toggle{grid-column:1}.admin-product-modal-footer{padding:13px 15px}.admin-product-cancel-btn,.admin-product-save-btn{flex:1}}
      `}</style>
    </main>
  );
};

export default Products;
