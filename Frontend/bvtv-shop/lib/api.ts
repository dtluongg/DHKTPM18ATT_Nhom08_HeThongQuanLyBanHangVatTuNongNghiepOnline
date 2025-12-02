import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_BASE}`,
    withCredentials: true, // Gửi cookies (cho session auth)
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor cho request
api.interceptors.request.use(
    (config) => {
        // Có thể thêm token vào header nếu cần
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response
api.interceptors.response.use(
    (response) => {
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        if (typeof window !== "undefined") {
            if (error.response?.status === 401) {
                // Unauthorized - Chưa đăng nhập
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
            } else if (error.response?.status === 403) {
                // Forbidden - Không có quyền truy cập
                alert("Bạn không có quyền thực hiện thao tác này!");
                // Có thể redirect về dashboard
                if (window.location.pathname.includes("/dashboard/admin")) {
                    window.location.href = "/dashboard";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
