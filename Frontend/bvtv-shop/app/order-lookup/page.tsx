"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Header from "@/components/Header";
import { Search, Package, MapPin, Phone, Calendar, CreditCard, AlertCircle, ArrowRight } from "lucide-react";

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
        const msg =
          err.response.data.message ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tra cứu đơn hàng</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Nhập mã đơn hàng của bạn để theo dõi trạng thái vận chuyển và thông tin chi tiết.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập mã đơn hàng (Ví dụ: ORD-2025...)"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Tra cứu
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Result Card */}
          {order && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Mã đơn hàng</div>
                  <div className="text-xl font-bold text-gray-900 font-mono">{order.orderNo}</div>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Thông tin giao hàng
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Người nhận</span>
                        <span className="font-medium text-gray-900">{order.deliveryName || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Số điện thoại</span>
                        <span className="font-medium text-gray-900">{order.deliveryPhone || "-"}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-500 block mb-1">Địa chỉ</span>
                        <span className="font-medium text-gray-900">{order.deliveryAddress || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Thông tin thanh toán
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phương thức</span>
                        <span className="font-medium text-gray-900">{order.paymentMethod?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ngày đặt</span>
                        <span className="font-medium text-gray-900">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-gray-500">Tổng tiền</span>
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Chi tiết sản phẩm
                  </h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3">Sản phẩm</th>
                          <th className="px-4 py-3 text-center">SL</th>
                          <th className="px-4 py-3 text-right">Đơn giá</th>
                          <th className="px-4 py-3 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {order.items?.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {item.productUnit?.name || `Sản phẩm #${item.productUnitId}`}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
