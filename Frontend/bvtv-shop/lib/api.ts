import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_BASE}`,
    // JWT không dùng cookies/session
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor cho request - thêm JWT từ localStorage
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const storageKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "jwt_token";
            const token = localStorage.getItem(storageKey);
            if (token) {
                config.headers = config.headers || {};
                (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho response - xử lý 401/403
api.interceptors.response.use(
    (response) => {
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        if (typeof window !== "undefined") {
            const status = error.response?.status;
            if (status === 401) {
                const storageKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "jwt_token";
                localStorage.removeItem(storageKey);
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            } else if (status === 403) {
                alert("Bạn không có quyền thực hiện thao tác này!");
                if (window.location.pathname.includes("/dashboard/admin")) {
                    window.location.href = "/dashboard";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
