import apiRequest from "./api";

const LOGIN_SESSION_KEY = "br30_login_session";

const getLoginSessionId = () => {
  return localStorage.getItem(LOGIN_SESSION_KEY) || "";
};

const whatsNewApi = {
  getAvailable: async () => {
    const sessionId = getLoginSessionId();

    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";

    return apiRequest(`/whats-new${query}`);
  },

  markViewed: async (id) =>
    apiRequest(`/whats-new/${id}/view`, {
      method: "POST",
      body: JSON.stringify({
        sessionId: getLoginSessionId(),
      }),
    }),

  markExplored: async (id) =>
    apiRequest(`/whats-new/${id}/explore`, {
      method: "POST",
      body: JSON.stringify({
        sessionId: getLoginSessionId(),
      }),
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
