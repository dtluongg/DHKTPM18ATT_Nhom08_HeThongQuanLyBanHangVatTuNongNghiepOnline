"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

const menuItems = [
    {
        label: "Sản phẩm",
        href: "/dashboard/admin/product-units",
        icon: "📦",
    },
    {
        label: "Danh mục",
        href: "/dashboard/admin/categories",
        icon: "📁",
    },
    {
        label: "Mã giảm giá",
        href: "/dashboard/admin/coupons",
        icon: "🎟️",
    },
    {
        label: "Khu vực",
        href: "/dashboard/admin/areas",
        icon: "📍",
    },
    {
        label: "Khách hàng",
        href: "/dashboard/admin/profiles",
        icon: "👥",
    },
    {
        label: "Đơn hàng",
        href: "/dashboard/admin/orders",
        icon: "🛒",
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    useEffect(() => {
        // Check if user is STAFF or ADMIN
        if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-2xl font-bold text-green-700"
                            >
                                🏥 BVTV Admin
                            </Link>
                            <span className="text-sm text-gray-500">
                                {user.role === "ADMIN"
                                    ? "Quản trị viên"
                                    : "Nhân viên"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-green-600"
                            >
                                ← Về Dashboard
                            </Link>
                            <div className="text-sm">
                                <div className="font-semibold">
                                    {user.fullName}
                                </div>
                                <div className="text-gray-500">
                                    {user.email}
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)] sticky top-[73px]">
                    <nav className="p-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-green-50 text-green-700 font-semibold"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="text-xl">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
