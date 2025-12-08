"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface Coupon {
    id: number;
    code: string;
    discountType: string; // "percent" or "fixed"
    discountValue: number;
    minOrderTotal?: number;
    expiryDate: string;
    usageLimit?: number;
    isActive: boolean;
}

export default function CouponsAdminPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "ADMIN";

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percent" as "percent" | "fixed",
        discountValue: "",
        minOrderTotal: "",
        expiryDate: "",
        usageLimit: "",
        isActive: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await api.get("/coupons");
            setCoupons(response.data);
        } catch (error) {
            console.error("Lỗi khi tải mã giảm giá:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                code: formData.code.toUpperCase(),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                minOrderTotal: formData.minOrderTotal
                    ? parseFloat(formData.minOrderTotal)
                    : undefined,
                expiryDate: formData.expiryDate || undefined,
                usageLimit: formData.usageLimit
                    ? parseInt(formData.usageLimit)
                    : undefined,
                isActive: formData.isActive,
            };

            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon.id}`, payload);
            } else {
                await api.post("/coupons", payload);
            }

            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error("Lỗi khi lưu mã giảm giá:", error);
            alert("Có lỗi xảy ra khi lưu mã giảm giá");
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType || "percent",
            discountValue: coupon.discountValue?.toString() || "",
            minOrderTotal: coupon.minOrderTotal?.toString() || "",
            expiryDate: coupon.expiryDate?.split("T")[0] || "",
            usageLimit: coupon.usageLimit?.toString() || "",
            isActive: coupon.isActive ?? true,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) {
            alert("Chỉ ADMIN mới có quyền xóa mã giảm giá");
            return;
        }

        if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;

        try {
            await api.delete(`/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error("Lỗi khi xóa mã giảm giá:", error);
            alert("Có lỗi xảy ra khi xóa mã giảm giá");
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            discountType: "percent",
            discountValue: "",
            minOrderTotal: "",
            expiryDate: "",
            usageLimit: "",
            isActive: true,
        });
        setEditingCoupon(null);
    };

    const filteredCoupons = coupons.filter((coupon) =>
        coupon.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Quản lý mã giảm giá
                </h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    + Thêm mã giảm giá
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm mã giảm giá..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        Đang tải...
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Không tìm thấy mã giảm giá nào
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Mã code
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Loại giảm
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Giá trị
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Hạn sử dụng
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Giới hạn
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map((coupon) => (
                                    <tr
                                        key={coupon.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-blue-600">
                                                {coupon.code}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {coupon.discountType === "percent"
                                                ? "Phần trăm"
                                                : "Số tiền"}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                            {coupon.discountType === "percent"
                                                ? `${coupon.discountValue}%`
                                                : `${coupon.discountValue.toLocaleString()}đ`}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div>
                                                Hết hạn:{" "}
                                                {formatDate(coupon.expiryDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {coupon.usageLimit || "∞"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                    isExpired(coupon.expiryDate)
                                                        ? "bg-red-100 text-red-700"
                                                        : coupon.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {isExpired(coupon.expiryDate)
                                                    ? "Hết hạn"
                                                    : coupon.isActive
                                                    ? "Hoạt động"
                                                    : "Đã ẩn"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(coupon)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Sửa
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                coupon.id
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
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
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingCoupon
                                ? "Sửa mã giảm giá"
                                : "Thêm mã giảm giá"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Mã code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        placeholder="VD: SUMMER2024"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Loại giảm giá *
                                    </label>
                                    <select
                                        required
                                        value={formData.discountType}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discountType: e.target.value as
                                                    | "percent"
                                                    | "fixed",
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="percent">
                                            Phần trăm (%)
                                        </option>
                                        <option value="fixed">
                                            Số tiền cố định
                                        </option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Giá trị giảm *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={formData.discountValue}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                discountValue: e.target.value,
                                            })
                                        }
                                        placeholder={
                                            formData.discountType === "percent"
                                                ? "10"
                                                : "50000"
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Giá trị đơn hàng tối thiểu
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.minOrderTotal}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minOrderTotal: e.target.value,
                                            })
                                        }
                                        placeholder="100000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Số lần sử dụng
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                usageLimit: e.target.value,
                                            })
                                        }
                                        placeholder="100 (để trống = không giới hạn)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Ngày hết hạn *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                expiryDate: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isActive: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">
                                        Kích hoạt
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingCoupon ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
