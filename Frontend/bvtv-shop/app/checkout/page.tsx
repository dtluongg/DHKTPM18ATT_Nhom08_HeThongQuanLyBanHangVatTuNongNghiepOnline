"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

interface PaymentMethod {
    id: number;
    name: string;
    forOnline: boolean;
    isActive: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalPrice } = useCartStore();
    const { user } = useAuthStore();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        deliveryAddress: user?.address || "",
        deliveryPhone: user?.phone || "",
        deliveryName: user?.name || "",
        paymentMethodId: "",
        notes: "",
    });

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get("/payment-methods/online");
            setPaymentMethods(response.data);
            if (response.data.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    paymentMethodId: response.data[0].id.toString(),
                }));
            }
        } catch (error) {
            console.error("Lỗi khi tải phương thức thanh toán:", error);
        }
    };

    useEffect(() => {
        if (items.length === 0) {
            router.push("/cart");
            return;
        }
        fetchPaymentMethods();
    }, [items, router]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Logic đặt hàng sẽ được implement sau
        console.log("Form data:", formData);
        console.log("Cart items:", items);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-green-800">
                        Thanh toán
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                Thông tin giao hàng
                            </h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="deliveryName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Họ và tên người nhận{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="deliveryName"
                                        name="deliveryName"
                                        required
                                        value={formData.deliveryName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="deliveryPhone"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Số điện thoại{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="deliveryPhone"
                                        name="deliveryPhone"
                                        required
                                        value={formData.deliveryPhone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="deliveryAddress"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Địa chỉ giao hàng{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="deliveryAddress"
                                        name="deliveryAddress"
                                        required
                                        value={formData.deliveryAddress}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="paymentMethodId"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Phương thức thanh toán{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="paymentMethodId"
                                        name="paymentMethodId"
                                        required
                                        value={formData.paymentMethodId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {paymentMethods.map((method) => (
                                            <option
                                                key={method.id}
                                                value={method.id}
                                            >
                                                {method.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Ghi chú đơn hàng
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Đặt hàng
                                    </button>
                                    <Link
                                        href="/cart"
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50"
                                    >
                                        Quay lại
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Đơn hàng của bạn
                            </h2>

                            <div className="space-y-3 mb-6">
                                {items.map((item) => (
                                    <div
                                        key={item.productUnit.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-gray-600">
                                            {item.productUnit.name} (
                                            {item.productUnit.shortName}) x
                                            {item.quantity}
                                        </span>
                                        <span className="font-semibold">
                                            {formatCurrency(
                                                item.productUnit.price *
                                                    item.quantity
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span>
                                        {formatCurrency(getTotalPrice())}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-green-600">
                                        Miễn phí
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                                    <span>Tổng cộng:</span>
                                    <span className="text-green-600">
                                        {formatCurrency(getTotalPrice())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
