"use client";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus, CreditCard, Phone } from "lucide-react";

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
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Giỏ hàng của bạn
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Kiểm tra lại danh sách sản phẩm trước khi thanh toán
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Giỏ hàng đang trống
                        </h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy dạo một vòng cửa hàng để tìm những sản phẩm ưng ý nhé!
                        </p>
                        <Link
                            href="/product-units"
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-600/20"
                        >
                            <ArrowRight className="w-5 h-5 rotate-180" />
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 space-y-6">
                                    {items.map((item) => (
                                        <div
                                            key={item.productUnit.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                                        >
                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-800 truncate">
                                                    {item.productUnit.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                        {item.productUnit.shortName}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                                        {formatCurrency(item.productUnit.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                {/* Quantity */}
                                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productUnit.id,
                                                                Math.max(1, item.quantity - 1)
                                                            )
                                                        }
                                                        className="p-2 hover:bg-white hover:text-emerald-600 transition-colors rounded-l-lg"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-semibold text-slate-700">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productUnit.id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        className="p-2 hover:bg-white hover:text-emerald-600 transition-colors rounded-r-lg"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="text-right min-w-[100px]">
                                                    <p className="text-lg font-bold text-emerald-600">
                                                        {formatCurrency(
                                                            item.productUnit.price * item.quantity
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Remove */}
                                                <button
                                                    onClick={() => removeItem(item.productUnit.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa sản phẩm"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                                    <Link
                                        href="/product-units"
                                        className="text-sm font-medium text-slate-600 hover:text-emerald-600 flex items-center gap-1"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                        Tiếp tục mua sắm
                                    </Link>
                                    <button
                                        onClick={clearCart}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">
                                    Tổng đơn hàng
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Tạm tính</span>
                                        <span className="font-medium">
                                            {formatCurrency(getTotalPrice())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-emerald-600 font-medium">
                                            Miễn phí
                                        </span>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                                        <span className="text-slate-900 font-bold">Tổng cộng</span>
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {formatCurrency(getTotalPrice())}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Tiến hành thanh toán
                                </button>

                                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-500 mb-2">
                                        Cần hỗ trợ? Liên hệ ngay
                                    </p>
                                    <a href="tel:0522714563" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                                        <Phone className="w-4 h-4" />
                                        0522714563
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
