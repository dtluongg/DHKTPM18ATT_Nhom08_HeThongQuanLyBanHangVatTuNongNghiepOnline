import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types";
import api from "@/lib/api";

interface AuthStore {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    // Login với JSON payload
                    const response = await api.post("/auth/login", {
                        email,
                        password,
                    });
                    // Backend trả về { token, ...user }
                    const storageKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "jwt_token";
                    const { token, ...userData } = response.data || {};
                    console.log("Login successful:", response.data);

                    if (typeof window !== "undefined" && token) {
                        localStorage.setItem(storageKey, token);
                    }

                    set({
                        user: userData as AuthUser,
                        token: token || null,
                        isAuthenticated: !!token,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.post("/auth/logout");
                } finally {
                    const storageKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "jwt_token";
                    if (typeof window !== "undefined") {
                        localStorage.removeItem(storageKey);
                    }
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            checkAuth: async () => {
                try {
                    const storageKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "jwt_token";
                    const token = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

                    if (!token) {
                        set({ user: null, token: null, isAuthenticated: false });
                        return;
                    }

                    const userResponse = await api.get("/auth/me");
                    set({
                        user: userResponse.data,
                        token,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    const storageKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "jwt_token";
                    if (typeof window !== "undefined") {
                        localStorage.removeItem(storageKey);
                    }
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
