"use client";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
        useCartStore();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            alert("Giỏ hàng trống");
            return;
        }
        router.push("/checkout");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-green-800">
                            Giỏ hàng
                        </h1>
                        <Link
                            href="/product-units"
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                        >
                            ← Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-500 text-lg mb-6">
                            Giỏ hàng của bạn đang trống
                        </p>
                        <Link
                            href="/product-units"
                            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                        >
                            Bắt đầu mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.productUnit.id}
                                    className="bg-white rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {item.productUnit.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Tên ngắn:{" "}
                                                {item.productUnit.shortName}
                                            </p>
                                            <p className="text-green-600 font-semibold mt-2">
                                                {formatCurrency(
                                                    item.productUnit.price
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productUnit.id,
                                                            Math.max(
                                                                1,
                                                                item.quantity -
                                                                    1
                                                            )
                                                        )
                                                    }
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-1 border-x border-gray-300">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productUnit.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="w-32 text-right">
                                                <p className="text-lg font-bold text-gray-800">
                                                    {formatCurrency(
                                                        item.productUnit.price *
                                                            item.quantity
                                                    )}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() =>
                                                    removeItem(
                                                        item.productUnit.id
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={clearCart}
                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                            >
                                Xóa toàn bộ giỏ hàng
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Tổng đơn hàng
                                </h2>

                                <div className="space-y-3 mb-6">
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
                                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                                        <span>Tổng cộng:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(getTotalPrice())}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-3"
                                >
                                    Thanh toán
                                </button>

                                <Link
                                    href="/product-units"
                                    className="block w-full text-center border border-green-600 text-green-600 py-3 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                                >
                                    Tiếp tục mua sắm
                                </Link>

                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-600">
                                        📞 Hotline hỗ trợ: 0522714563
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
