"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, checkAuth } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

    useEffect(() => {
        const initDashboard = async () => {
            // Verify session with backend
            await checkAuth();

            // Re-check user after checkAuth
            const currentUser = useAuthStore.getState().user;
            if (!currentUser) {
                router.push("/login");
                return;
            }

            fetchOrders();
        };

        initDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get("/orders/my-orders");
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
            if (
                (error as { response?: { status?: number } }).response
                    ?.status === 401
            ) {
                // Session expired, redirect to login
                logout();
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            PENDING: "bg-yellow-100 text-yellow-800",
            CONFIRMED: "bg-blue-100 text-blue-800",
            PROCESSING: "bg-purple-100 text-purple-800",
            SHIPPED: "bg-indigo-100 text-indigo-800",
            DELIVERED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
        };

        const statusLabels: { [key: string]: string } = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            PROCESSING: "Đang xử lý",
            SHIPPED: "Đang giao hàng",
            DELIVERED: "Đã giao hàng",
            CANCELLED: "Đã hủy",
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                    statusColors[status] || "bg-gray-100 text-gray-800"
                }`}
            >
                {statusLabels[status] || status}
            </span>
        );
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-green-800">
                            Tài khoản của tôi
                        </h1>
                        <div className="flex gap-4">
                            {(user.role === "STAFF" ||
                                user.role === "ADMIN") && (
                                <Link
                                    href="/dashboard/admin"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    🔧 Quản trị
                                </Link>
                            )}
                            <Link
                                href="/product-units"
                                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                            >
                                Tiếp tục mua sắm
                            </Link>
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

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-2xl font-bold text-green-600">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {user.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {user.email}
                                </p>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab("orders")}
                                    className={`w-full text-left px-4 py-2 rounded-md ${
                                        activeTab === "orders"
                                            ? "bg-green-100 text-green-800 font-semibold"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Đơn hàng của tôi
                                </button>
                                <button
                                    onClick={() => setActiveTab("profile")}
                                    className={`w-full text-left px-4 py-2 rounded-md ${
                                        activeTab === "profile"
                                            ? "bg-green-100 text-green-800 font-semibold"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Thông tin tài khoản
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === "orders" && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Đơn hàng của tôi
                                </h2>

                                {loading ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Đang tải đơn hàng...
                                    </p>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">
                                            Bạn chưa có đơn hàng nào
                                        </p>
                                        <Link
                                            href="/product-units"
                                            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Bắt đầu mua sắm
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Mã đơn hàng: #
                                                            {order.id}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(
                                                                order.orderDate
                                                            )}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(
                                                        order.status
                                                    )}
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    {order.orderItems?.map(
                                                        (
                                                            item: {
                                                                productUnit?: {
                                                                    product?: {
                                                                        name?: string;
                                                                    };
                                                                };
                                                                quantity: number;
                                                                unitPrice: number;
                                                            },
                                                            index: number
                                                        ) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-between text-sm"
                                                            >
                                                                <span className="text-gray-600">
                                                                    {
                                                                        item
                                                                            .productUnit
                                                                            ?.product
                                                                            ?.name
                                                                    }{" "}
                                                                    x
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <span className="font-semibold">
                                                                    {formatCurrency(
                                                                        item.unitPrice *
                                                                            item.quantity
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t">
                                                    <span className="font-semibold text-gray-800">
                                                        Tổng cộng:
                                                    </span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        {formatCurrency(
                                                            order.totalAmount
                                                        )}
                                                    </span>
                                                </div>

                                                {order.deliveryAddress && (
                                                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                                        <p>
                                                            <strong>
                                                                Giao đến:
                                                            </strong>{" "}
                                                            {
                                                                order.deliveryAddress
                                                            }
                                                        </p>
                                                        <p>
                                                            <strong>
                                                                SĐT:
                                                            </strong>{" "}
                                                            {
                                                                order.deliveryPhone
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Thông tin tài khoản
                                </h2>

                                <div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên
                                        </label>
                                        <p className="text-gray-900">
                                            {user.name}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <p className="text-gray-900">
                                            {user.email}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại
                                        </label>
                                        <p className="text-gray-900">
                                            {user.phone || "Chưa cập nhật"}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ
                                        </label>
                                        <p className="text-gray-900">
                                            {user.address || "Chưa cập nhật"}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vai trò
                                        </label>
                                        <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
