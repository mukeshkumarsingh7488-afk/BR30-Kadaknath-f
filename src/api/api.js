const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("br30_access_token");

  if (!API_BASE_URL) {
    const error = new Error("Backend API is not configured yet. Please try again later.");

    error.status = 503;
    error.data = {
      success: false,
      message: "Backend API is not configured yet.",
    };

    throw error;
  }

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    ...options,
    headers,
  };

  if (requestOptions.body !== undefined && requestOptions.body !== null && !isFormData) {
    if (typeof requestOptions.body === "object") {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid server response",
    };
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.errors?.[0]?.message || "Something went wrong");

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export default apiRequest;
