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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-emerald-50/40 to-emerald-100/40 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
              🌾 Đại Lý Sáu Hiệp
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-emerald-900">
              Tra cứu đơn hàng
            </h1>
            <p className="text-sm text-emerald-800/80 mt-1">
              Nhập mã đơn để xem thông tin vận chuyển và thanh toán.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            <span className="mr-1">←</span> Về trang chủ
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Card tra cứu */}
            <div className="bg-white/90 border border-emerald-100 rounded-2xl shadow-lg shadow-emerald-100/40 p-6 md:p-8">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                    <span className="text-xl">🔎</span>
                    Nhập mã đơn hàng
                  </h2>
                  <p className="text-sm text-emerald-800/80 mt-1">
                    Mã đơn thường bắt đầu bằng <span className="font-mono">P...</span> –
                    bạn có thể xem trong SMS / Zalo hoặc email xác nhận.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-3 mt-4"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Ví dụ: ORD-20251111-0001"
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-emerald-900 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-medium shadow-sm shadow-emerald-300 hover:bg-emerald-800 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {loading && (
                    <span className="inline-block h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </button>
              </form>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-[2px]">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {!order && !error && !loading && (
                <div className="mt-5 text-xs text-emerald-700/80 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    Nếu cần hỗ trợ, bạn có thể liên hệ{" "}
                    <span className="font-medium">fanpage / số hotline</span>{" "}
                    của cửa hàng để được tra cứu giúp.
                  </span>
                </div>
              )}

              {/* Kết quả đơn hàng */}
              {order && (
                <div className="mt-8 border-t border-dashed border-emerald-100 pt-6">
                  {/* Mã đơn + trạng thái */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div>
                      <div className="text-xs font-medium tracking-[0.18em] uppercase text-emerald-500">
                        Mã đơn hàng
                      </div>
                      <div className="mt-1 font-mono text-lg md:text-xl font-semibold text-emerald-900">
                        {order.orderNo}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-800">
                        Trạng thái:&nbsp;
                        <span className="font-semibold">{order.status}</span>
                      </span>
                      {order.paymentMethod?.name && (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs font-medium text-amber-900">
                          💳 {order.paymentMethod.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thông tin người nhận & thanh toán */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <div className="text-xs font-semibold tracking-[0.16em] uppercase text-emerald-500 mb-2">
                        Thông tin người nhận
                      </div>
                      <div className="space-y-1 text-sm text-emerald-900">
                        <div className="font-semibold">
                          <span className="text-emerald-800/80">Tên người nhận: </span>
                          {order.deliveryName || "-"}
                        </div>
                        <div className="text-emerald-800">
                          <span className="text-emerald-800/80">Số điện thoại: </span>
                          {order.deliveryPhone || "-"}
                        </div>
                        <div className="text-emerald-800/90">
                          <span className="text-emerald-800/80">Địa chỉ: </span>
                          {order.deliveryAddress || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                      <div className="text-xs font-semibold tracking-[0.16em] uppercase text-emerald-500 mb-2">
                        Thông tin đơn hàng
                      </div>
                      <div className="space-y-1 text-sm text-emerald-900">
                        <div className="flex justify-between">
                          <span className="text-emerald-800/80">Thanh toán</span>
                          <span className="font-medium">
                            {order.paymentMethod?.name || "-"}
                          </span>
                        </div>
                        {order.createdAt && (
                          <div className="flex justify-between">
                            <span className="text-emerald-800/80">Ngày đặt</span>
                            <span className="font-medium">
                              {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết sản phẩm */}
                  <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 overflow-hidden">
                    <div className="px-5 py-3 border-b border-emerald-100 bg-emerald-50/80 flex items-center justify-between">
                      <div className="font-semibold text-emerald-900">
                        Chi tiết đơn hàng
                      </div>
                      <div className="text-xs text-emerald-700/80">
                        {order.items?.length || 0} sản phẩm
                      </div>
                    </div>

                    <div className="p-5">
                      {order.items && order.items.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-emerald-100/80 text-emerald-700/80">
                                <th className="py-2 pr-3 text-left font-semibold w-1/2">
                                  Sản phẩm
                                </th>
                                <th className="py-2 px-3 text-center font-semibold w-1/6">
                                  Số lượng
                                </th>
                                <th className="py-2 px-3 text-right font-semibold w-1/6 whitespace-nowrap">
                                  Đơn giá
                                </th>
                                <th className="py-2 pl-3 text-right font-semibold w-1/6 whitespace-nowrap">
                                  Thành tiền
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((it: any, idx: number) => {
                                const name =
                                  it.productUnit?.name || `Sản phẩm ${it.productUnit?.id || ""}`;
                                const lineTotal = it.price * it.quantity;

                                return (
                                  <tr key={idx} className="border-b border-emerald-100/60 last:border-b-0">
                                    <td className="py-2.5 pr-3 text-emerald-900 align-top">
                                      {name}
                                    </td>
                                    <td className="py-2.5 px-3 text-center text-emerald-900 align-top">
                                      {it.quantity}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-emerald-800/90 align-top whitespace-nowrap">
                                      {formatCurrency(it.price)}
                                    </td>
                                    <td className="py-2.5 pl-3 text-right font-semibold text-emerald-900 align-top whitespace-nowrap">
                                      {formatCurrency(lineTotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm text-emerald-700/80">
                          Không có sản phẩm trong đơn hàng này.
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Tổng tiền */}
                  <div className="flex justify-end">
                    <div className="w-full md:w-1/2 lg:w-1/3">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 space-y-2 text-sm">
                        <div className="flex justify-between text-emerald-800/90">
                          <span className="">Tổng cộng</span>
                          <span className="font-semibold text-emerald-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700/80">
                          * Số tiền đã bao gồm các ưu đãi/giảm giá (nếu có). Vui
                          lòng giữ lại mã đơn để tiện tra cứu khi cần hỗ trợ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
