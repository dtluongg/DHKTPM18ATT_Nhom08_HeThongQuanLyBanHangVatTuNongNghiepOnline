"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

type OrderItem = {
    id?: number;
    productUnit: { id: number; name?: string; shortName?: string; price?: number };
    quantity: number;
    price: number;
    discountAmount?: number;
    vatRate?: number;
    vatAmount?: number;
};

type Order = {
    id?: number;
    orderNo?: string;
    deliveryName?: string;
    deliveryPhone?: string;
    deliveryAddress?: string;
    notes?: string;
    totalAmount?: number;
    totalVat?: number;
    discountTotal?: number;
    totalPay?: number;
    paymentMethod?: { id?: number; name?: string };
    paymentTerm?: string;
    isOnline?: boolean;
    status?: string;
    items?: OrderItem[];
};

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [copied, setCopied] = useState(false);

    const clearCart = useCartStore((s) => s.clearCart);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("lastOrder");
            if (!raw) {
                // nothing saved -> go home
                router.replace("/");
                return;
            }
            const parsed: Order = JSON.parse(raw);
            setOrder(parsed);

            // now that we're on the invoice page, it's safe to clear the cart
            try {
                clearCart();
            } catch (e) {
                console.warn("Failed to clear cart on success page", e);
            }
        } catch (e) {
            console.error("Failed to read lastOrder", e);
            router.replace("/");
        }
    }, [router, clearCart]);

    const formatCurrency = (amount?: number) => {
        if (!amount && amount !== 0) return "-";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    const handleContinue = () => {
        try {
            sessionStorage.removeItem("lastOrder");
        } catch (e) {
            // ignore
        }
        router.push("/");
    };

    const copyOrderNo = async () => {
        try {
            await navigator.clipboard.writeText(order?.orderNo || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    if (!order) return null;

    const paymentName = typeof order.paymentMethod === "object" ? order.paymentMethod?.name : "";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-green-800">Hoá đơn đặt hàng</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-sm text-gray-600">Mã đơn hàng</div>
                            <div className="font-mono font-semibold text-lg">{order.orderNo}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Trạng thái</div>
                            <div className="font-semibold text-green-700">{order.status}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <div className="text-sm text-gray-600">Người nhận</div>
                            <div className="font-semibold">{order.deliveryName}</div>
                            <div className="text-sm text-gray-600">{order.deliveryPhone}</div>
                            <div className="text-sm text-gray-600">{order.deliveryAddress}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Phương thức thanh toán</div>
                            <div className="font-semibold">{paymentName}</div>
                            <div className="text-sm text-gray-600 mt-2">Ghi chú: {order.notes || '-'}</div>
                        </div>
                    </div>

                    <div className="border rounded mb-6">
                        <div className="p-4 border-b bg-gray-50 font-semibold">Chi tiết sản phẩm</div>
                        <div className="p-4">
                            <div className="space-y-3">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <div>
                                                <div className="font-medium">{it.productUnit?.name || `Sản phẩm ${it.productUnit?.id}`}</div>
                                                <div className="text-sm text-gray-600">{it.productUnit?.shortName || ''}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm">{it.quantity} x {formatCurrency(it.price)}</div>
                                                <div className="font-semibold">{formatCurrency(it.price * it.quantity)}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-600">Không có sản phẩm</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mb-6">
                        <div className="w-full md:w-1/3">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-600">Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Giảm</span>
                                <span className="text-green-600">{formatCurrency(order.discountTotal)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Tổng cộng</span>
                                <span className="text-green-600">{formatCurrency(order.totalPay ?? order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleContinue} className="px-4 py-2 bg-green-600 text-white rounded">Tiếp tục</button>
                        <button onClick={copyOrderNo} className="px-4 py-2 border rounded">{copied ? 'Đã sao chép' : 'Sao chép mã'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}