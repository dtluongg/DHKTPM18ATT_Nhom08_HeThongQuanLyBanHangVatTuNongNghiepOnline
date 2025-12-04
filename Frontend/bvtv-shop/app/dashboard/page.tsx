"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Package, Calendar, MapPin, Phone, CreditCard, ChevronRight, Clock, CheckCircle2, XCircle, Truck, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, checkAuth } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

    useEffect(() => {
        const initDashboard = async () => {
            await checkAuth();
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
            if ((error as { response?: { status?: number } }).response?.status === 401) {
                logout();
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
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
        const styles = {
            PENDING: "bg-amber-100 text-amber-700 border-amber-200",
            CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
            PROCESSING: "bg-indigo-100 text-indigo-700 border-indigo-200",
            SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
            DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
            CANCELLED: "bg-red-100 text-red-700 border-red-200",
        };

        const labels: { [key: string]: string } = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            PROCESSING: "Đang xử lý",
            SHIPPED: "Đang giao hàng",
            DELIVERED: "Đã giao hàng",
            CANCELLED: "Đã hủy",
        };

        const icons: { [key: string]: any } = {
            PENDING: Clock,
            CONFIRMED: CheckCircle2,
            PROCESSING: Package,
            SHIPPED: Truck,
            DELIVERED: CheckCircle2,
            CANCELLED: XCircle,
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                <Icon className="w-3.5 h-3.5" />
                {labels[status] || status}
            </span>
        );
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === "orders" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h2>
                                    <div className="text-sm text-gray-500">
                                        Tổng số: <span className="font-semibold text-emerald-600">{orders.length} đơn hàng</span>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Package className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                                        <p className="text-gray-500 max-w-sm mb-6">Bạn chưa thực hiện đơn hàng nào. Hãy khám phá các sản phẩm chất lượng của chúng tôi ngay!</p>
                                        <Link
                                            href="/product-units"
                                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                        >
                                            Bắt đầu mua sắm
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                {/* Order Header */}
                                                <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                                            #{order.id}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-0.5">
                                                                <Calendar className="w-4 h-4" />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                            <div className="font-semibold text-gray-900">
                                                                {order.items?.length} sản phẩm
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(order.status)}
                                                </div>

                                                {/* Order Items */}
                                                <div className="p-4 sm:p-6">
                                                    <div className="space-y-4 mb-6">
                                                        {order.items?.map((item: any, index: number) => (
                                                            <div key={index} className="flex items-start justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                        {item.productUnit?.image ? (
                                                                            <img src={item.productUnit.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                                                        ) : (
                                                                            <Package className="w-6 h-6 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.productUnit.name}</h4>
                                        
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                                                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Order Footer */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                                <span className="line-clamp-1">{order.deliveryAddress}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Phone className="w-4 h-4 text-gray-400" />
                                                                <span>{order.deliveryPhone}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end gap-3">
                                                            <span className="text-sm text-gray-500">Tổng tiền:</span>
                                                            <span className="text-xl font-bold text-emerald-600">{formatCurrency(order.totalAmount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin tài khoản</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                                            {user.name}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                                            {user.email}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                                            {user.phone || "Chưa cập nhật"}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Vai trò</label>
                                        <div className="flex">
                                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium min-h-[80px]">
                                            {user.address || "Chưa cập nhật"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 opacity-50 cursor-not-allowed">
                                        Cập nhật thông tin (Đang phát triển)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
