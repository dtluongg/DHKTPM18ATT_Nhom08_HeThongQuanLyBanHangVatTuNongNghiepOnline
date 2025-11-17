"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface OrderItem {
    id: number;
    productUnit?: {
        id: number;
        name: string;
    };
    quantity: number;
    price: number;
    discountAmount?: number;
    vatRate?: number;
    vatAmount?: number;
}

interface Order {
    id: number;
    orderNo: string;
    buyer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    deliveryName?: string;
    deliveryPhone?: string;
    deliveryAddress?: string;
    totalAmount: number;
    totalVat: number;
    discountTotal: number;
    status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
    paymentTerm: "PREPAID" | "COD" | "CREDIT";
    isOnline: boolean;
    notes?: string;
    createdAt: string;
    items?: OrderItem[];
}

export default function OrdersAdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState<Order["status"]>("PENDING");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get("/orders");
            setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (order: Order) => {
        try {
            const response = await api.get(`/orders/${order.id}`);
            setSelectedOrder(response.data);
            setNewStatus(response.data.status);
            setShowModal(true);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", error);
            alert("Có lỗi xảy ra khi tải chi tiết đơn hàng");
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        try {
            await api.put(`/orders/${selectedOrder.id}`, {
                ...selectedOrder,
                status: newStatus,
            });

            setShowModal(false);
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            alert("Có lỗi xảy ra khi cập nhật trạng thái");
        }
    };

    // Bỏ function handleDelete - không cho phép xóa đơn hàng

    const filteredOrders = orders.filter((order) => {
        const matchSearch =
            order.orderNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.buyer?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.deliveryName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.deliveryPhone
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchStatus =
            filterStatus === "ALL" || order.status === filterStatus;

        return matchSearch && matchStatus;
    });

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";
            case "CONFIRMED":
                return "bg-blue-100 text-blue-700";
            case "SHIPPED":
                return "bg-purple-100 text-purple-700";
            case "COMPLETED":
                return "bg-green-100 text-green-700";
            case "CANCELLED":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "CONFIRMED":
                return "Đã xác nhận";
            case "SHIPPED":
                return "Đang giao";
            case "COMPLETED":
                return "Hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const getPaymentTermLabel = (term: string) => {
        switch (term) {
            case "PREPAID":
                return "Trả trước";
            case "COD":
                return "COD";
            case "CREDIT":
                return "Công nợ";
            default:
                return term;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Quản lý đơn hàng
                </h1>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        Đang tải...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Không tìm thấy đơn hàng nào
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Mã đơn
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Khách hàng
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Người nhận
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Tổng tiền
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Thanh toán
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-blue-600">
                                                {order.orderNo}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.isOnline
                                                    ? "Online"
                                                    : "POS"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {order.buyer?.name ||
                                                "Khách vãng lai"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium">
                                                {order.deliveryName || "-"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.deliveryPhone || ""}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                            {order.totalAmount.toLocaleString()}
                                            đ
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {getPaymentTermLabel(
                                                order.paymentTerm
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleViewDetail(order)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Chi tiết
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            Chi tiết đơn hàng
                        </h2>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Order Info */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    Thông tin đơn hàng
                                </h3>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Mã đơn:
                                    </span>
                                    <div className="font-bold text-blue-600">
                                        {selectedOrder.orderNo}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Khách hàng:
                                    </span>
                                    <div>
                                        {selectedOrder.buyer?.name ||
                                            "Khách vãng lai"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Kênh:
                                    </span>
                                    <div>
                                        {selectedOrder.isOnline
                                            ? "Online"
                                            : "POS"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Thanh toán:
                                    </span>
                                    <div>
                                        {getPaymentTermLabel(
                                            selectedOrder.paymentTerm
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Ghi chú:
                                    </span>
                                    <div className="text-sm">
                                        {selectedOrder.notes || "-"}
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    Thông tin giao hàng
                                </h3>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Người nhận:
                                    </span>
                                    <div>
                                        {selectedOrder.deliveryName || "-"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        SĐT:
                                    </span>
                                    <div>
                                        {selectedOrder.deliveryPhone || "-"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Địa chỉ:
                                    </span>
                                    <div className="text-sm">
                                        {selectedOrder.deliveryAddress || "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        {selectedOrder.items &&
                            selectedOrder.items.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">
                                        Sản phẩm
                                    </h3>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">
                                                    Sản phẩm
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Số lượng
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Đơn giá
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    VAT
                                                </th>
                                                <th className="px-3 py-2 text-right">
                                                    Thành tiền
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item) => {
                                                // Tính tổng tiền = (giá * số lượng) - giảm giá
                                                const totalAmount =
                                                    item.price * item.quantity -
                                                    (item.discountAmount || 0);
                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="border-b"
                                                    >
                                                        <td className="px-3 py-2">
                                                            {item.productUnit
                                                                ?.name || "N/A"}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            {item.price.toLocaleString()}
                                                            đ
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            {(
                                                                item.vatAmount ||
                                                                0
                                                            ).toLocaleString()}
                                                            đ
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold">
                                                            {totalAmount.toLocaleString()}
                                                            đ
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="flex justify-between mb-2">
                                <span>Tổng VAT:</span>
                                <span className="font-semibold">
                                    {selectedOrder.totalVat.toLocaleString()}đ
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Giảm giá:</span>
                                <span className="font-semibold text-red-600">
                                    -
                                    {selectedOrder.discountTotal.toLocaleString()}
                                    đ
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Tổng cộng:</span>
                                <span className="text-green-600">
                                    {selectedOrder.totalAmount.toLocaleString()}
                                    đ
                                </span>
                            </div>
                        </div>

                        {/* Update Status */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Cập nhật trạng thái đơn hàng
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) =>
                                    setNewStatus(
                                        e.target.value as Order["status"]
                                    )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="CONFIRMED">Đã xác nhận</option>
                                <option value="SHIPPED">Đang giao</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Cập nhật trạng thái
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
