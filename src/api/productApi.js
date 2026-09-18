import apiRequest from "./api";

export const getProducts = async (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.featured !== undefined) {
    searchParams.set("featured", String(params.featured));
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();

  return apiRequest(`/products${query ? `?${query}` : ""}`);
};

export const getProductBySlug = async (slug) => {
  if (!slug) {
    throw new Error("Product slug is required");
  }

  return apiRequest(`/products/slug/${encodeURIComponent(slug)}`);
};
