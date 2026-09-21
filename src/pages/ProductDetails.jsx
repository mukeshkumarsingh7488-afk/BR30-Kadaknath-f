import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductDetailsComponent from "../components/products/ProductDetails";
import { useCart } from "../context/CartContext";
import { getProductBySlug } from "../api/productApi";

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const data = await getProductBySlug(slug);

        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          throw new Error(data.message || "Product not found");
        }
      } catch (error) {
        console.error("Product details fetch error:", error);

        setProduct(null);
        setError(error.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = (cartItem) => {
    addToCart(cartItem, cartItem.quantity || 1);
  };

  if (loading) {
    return (
      <section className="product-details-state">
        <div className="product-details-spinner"></div>
        <p>Loading product...</p>

        <style>{`.product-details-state{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:60px 20px;text-align:center;color:var(--color-text-soft)}.product-details-spinner{width:40px;height:40px;border:3px solid var(--color-border);border-top-color:var(--color-green);border-radius:50%;animation:productDetailsSpin .8s linear infinite}@keyframes productDetailsSpin{to{transform:rotate(360deg)}}`}</style>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-details-state">
        <h2>Product not found</h2>
        <p>{error || "The product you are looking for is not available."}</p>

        <style>{`.product-details-state{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:60px 20px;text-align:center}.product-details-state h2{margin:0;color:var(--color-primary);font-size:1.6rem}.product-details-state p{margin:0;color:var(--color-text-soft);font-size:.9rem}`}</style>
      </section>
    );
  }

  return <ProductDetailsComponent product={product} onAddToCart={handleAddToCart} />;
};

export default ProductDetailsPage;
