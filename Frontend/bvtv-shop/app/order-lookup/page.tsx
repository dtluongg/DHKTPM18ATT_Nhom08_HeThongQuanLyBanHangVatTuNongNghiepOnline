"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function OrderLookupPage() {
  const [orderNo, setOrderNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setOrder(null);
    const code = (orderNo || "").trim();
    if (!code) {
      setError("Vui lòng nhập mã đơn hàng");
      return;
    }
    setLoading(true);
    try {
      const resp = await api.get(`/orders/lookup/${encodeURIComponent(code)}`);
      setOrder(resp.data);
    } catch (err: any) {
      console.error("Lookup error", err);
      if (err.response && err.response.status === 404) {
        setError("Không tìm thấy đơn hàng");
      } else if (err.response && err.response.data) {
        // backend may return runtime exception message
        const msg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
        setError(String(msg));
      } else {
        setError("Lỗi khi tìm kiếm, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return "-";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-800">Tra cứu đơn hàng</h1>
          <div>
            <Link href="/" className="text-sm text-gray-600 hover:text-green-600">← Về trang chủ</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Nhập mã đơn hàng (ví dụ: P...)"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          {order && (
            <div className="mt-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600">Mã đơn hàng</div>
                <div className="font-mono font-semibold text-lg">{order.orderNo}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Người nhận</div>
                  <div className="font-semibold">{order.deliveryName || '-'}</div>
                  <div className="text-sm text-gray-600">{order.deliveryPhone || '-'}</div>
                  <div className="text-sm text-gray-600">{order.deliveryAddress || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phương thức thanh toán</div>
                  <div className="font-semibold">{order.paymentMethod?.name || '-'}</div>
                  <div className="text-sm text-gray-600 mt-2">Trạng thái: {order.status}</div>
                </div>
              </div>

              <div className="border rounded mb-4">
                <div className="p-4 border-b bg-gray-50 font-semibold">Chi tiết sản phẩm</div>
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <div>
                            <div className="font-medium">{it.productUnit?.name || `Sản phẩm ${it.productUnit?.id || ''}`}</div>
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

              <div className="flex justify-end">
                <div className="w-full md:w-1/3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
