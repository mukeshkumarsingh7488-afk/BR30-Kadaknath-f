import apiRequest from "./api";

const whatsNewApi = {
  getAvailable: async () => apiRequest("/whats-new"),

  markViewed: async (id) =>
    apiRequest(`/whats-new/${id}/view`, {
      method: "POST",
    }),

  markExplored: async (id) =>
    apiRequest(`/whats-new/${id}/explore`, {
      method: "POST",
    }),

  getAdminAll: async (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const query = searchParams.toString();

    return apiRequest(`/whats-new/admin/all${query ? `?${query}` : ""}`);
  },

  getAdminStats: async () => apiRequest("/whats-new/admin/stats"),

  getAdminOne: async (id) => apiRequest(`/whats-new/admin/${id}`),

  create: async (payload) =>
    apiRequest("/whats-new/admin", {
      method: "POST",
      body: payload,
    }),

  update: async (id, payload) =>
    apiRequest(`/whats-new/admin/${id}`, {
      method: "PUT",
      body: payload,
    }),

  remove: async (id) =>
    apiRequest(`/whats-new/admin/${id}`, {
      method: "DELETE",
    }),

  publish: async (id) =>
    apiRequest(`/whats-new/admin/${id}/publish`, {
      method: "PATCH",
    }),

  unpublish: async (id) =>
    apiRequest(`/whats-new/admin/${id}/unpublish`, {
      method: "PATCH",
    }),

  updateOrder: async (items) =>
    apiRequest("/whats-new/admin/order", {
      method: "PATCH",
      body: { items },
    }),
};

export default whatsNewApi;
