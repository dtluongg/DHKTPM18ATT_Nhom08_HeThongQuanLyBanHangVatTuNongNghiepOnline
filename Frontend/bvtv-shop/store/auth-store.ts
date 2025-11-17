import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types";
import api from "@/lib/api";

interface AuthStore {
    user: AuthUser | null;
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

                    // Backend trả về thông tin user ngay trong response
                    set({
                        user: response.data,
                        isAuthenticated: true,
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
                    set({ user: null, isAuthenticated: false });
                }
            },

            checkAuth: async () => {
                try {
                    const response = await api.get("/auth/status");
                    if (response.data.authenticated) {
                        const userResponse = await api.get("/auth/me");
                        set({
                            user: userResponse.data,
                            isAuthenticated: true,
                        });
                    } else {
                        set({ user: null, isAuthenticated: false });
                    }
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
