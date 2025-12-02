"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import BankTransferModal from "./checkQR/BankTransferModal";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import Header from "@/components/Header";
import {
  CreditCard,
  MapPin,
  Phone,
  User,
  FileText,
  Ticket,
  ArrowRight,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Banknote
} from "lucide-react";

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

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");

  function generatePaymentCode() {
    const ts = Date.now().toString(36).toUpperCase(); // dựa trên thời gian
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4 ký tự random
    return `P${ts}${rand}`; // ví dụ: PMB7F3K2A1Z
  }

  const [paymentCode] = useState(generatePaymentCode());

  useEffect(() => {
    try {
      sessionStorage.setItem("currentPaymentCode", paymentCode);
    } catch (e) { }
  }, [paymentCode]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get("/payment-methods/online");
      setPaymentMethods(response.data);

      if (response.data.length > 0) {
        const offline = response.data.find((m: any) => m.forOnline === false);
        const defaultMethod = response.data[0];
        setFormData((prev) => ({
          ...prev,
          paymentMethodId: defaultMethod.id.toString(),
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

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value.toUpperCase().trim());
    setCouponError("");
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const amount = getTotalPrice();
      const resp = await api.get(`/coupons/validate/${encodeURIComponent(couponCode)}?amount=${amount}`);
      const data = resp.data;
      if (data && data.valid) {
        setAppliedCoupon(data);
      } else {
        setAppliedCoupon(null);
        setCouponError(data?.message || "Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      console.error("Apply coupon error:", err);
      setCouponError("Lỗi khi kiểm tra mã giảm giá");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankPaymentModal, setShowBankPaymentModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const method = paymentMethods.find(
        (m) => m.id === Number(formData.paymentMethodId)
      );

      const itemsPayload = items.map((i) => ({
        productUnit: { id: i.productUnit.id },
        quantity: i.quantity,
        price: i.productUnit.price,
        discountAmount: 0,
        vatRate: 0,
        vatAmount: 0,
      }));

      const totalAmount = getTotalPrice();

      const payload = {
        deliveryName: formData.deliveryName,
        deliveryPhone: formData.deliveryPhone,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
        totalAmount,
        totalVat: 0,
        discountTotal: appliedCoupon?.discountAmount || 0,
        coupon: appliedCoupon?.coupon ? { id: appliedCoupon.coupon.id } : undefined,
        paymentMethod: { id: Number(formData.paymentMethodId) },
        paymentTerm: method?.forOnline ? "PREPAID" : "COD",
        isOnline: !!method?.forOnline,
        items: itemsPayload,
      };

      if (method?.id === 2) {
        setShowBankPaymentModal(true);
        try {
          sessionStorage.setItem("pendingOrderPayload", JSON.stringify(payload));
        } catch (e) {
          console.warn("Cannot write pendingOrderPayload to sessionStorage", e);
        }
        return;
      }

      const resp = await api.post("/orders", payload);
      const created = resp.data;

      try {
        sessionStorage.setItem("lastOrder", JSON.stringify(created));
      } catch (e) {
        console.warn("Cannot write lastOrder to sessionStorage", e);
      }

      router.push(`/checkout/success`);
    } catch (err) {
      console.error("Create order error:", err);
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createOrderFromPending = async () => {
    setIsCreatingOrder(true);
    setError("");
    try {
      let payload: any = null;
      try {
        const raw = sessionStorage.getItem("pendingOrderPayload");
        if (raw) payload = JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to read pendingOrderPayload", e);
      }

      if (!payload) {
        const method = paymentMethods.find(
          (m) => m.id === Number(formData.paymentMethodId)
        );
        const itemsPayload = items.map((i) => ({
          productUnit: { id: i.productUnit.id },
          quantity: i.quantity,
          price: i.productUnit.price,
          discountAmount: 0,
          vatRate: 0,
          vatAmount: 0,
        }));
        payload = {
          deliveryName: formData.deliveryName,
          deliveryPhone: formData.deliveryPhone,
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes,
          totalAmount: getTotalPrice(),
          totalVat: 0,
          discountTotal: appliedCoupon?.discountAmount || 0,
          coupon: appliedCoupon?.coupon ? { id: appliedCoupon.coupon.id } : undefined,
          paymentMethod: { id: Number(formData.paymentMethodId) },
          paymentTerm: method?.forOnline ? "PREPAID" : "COD",
          isOnline: !!method?.forOnline,
          items: itemsPayload,
        };
      }

      const resp = await api.post("/orders", payload);
      const created = resp.data;

      try {
        sessionStorage.setItem("lastOrder", JSON.stringify(created));
        sessionStorage.removeItem("pendingOrderPayload");
      } catch (e) {
        console.warn("Cannot write lastOrder to sessionStorage", e);
      }

      return created;
    } catch (err) {
      console.error("Create order after bank transfer error:", err);
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      throw err;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const viewOrderDetails = () => {
    try {
      sessionStorage.removeItem("pendingOrderPayload");
    } catch (e) { }
    setShowBankPaymentModal(false);
    router.push("/checkout/success");
  };

  const buildDescription = () => {
    const phone = (formData.deliveryPhone || "").toString();
    const name = (formData.deliveryName || "").toString();
    const raw = `${paymentCode} ${phone} ${name}`.trim();
    const normalized = raw.normalize("NFKD").replace(/\p{Diacritic}/gu, "");
    const cleaned = normalized.replace(/[^0-9a-zA-Z\s]/g, "");
    return cleaned.replace(/\s+/g, " ").trim();
  };

  const transferDescription = buildDescription();
  const payableAmount = getTotalPrice() - Number(appliedCoupon?.discountAmount || 0);

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
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Thanh toán
          </h1>
          <p className="text-slate-500 mt-1">
            Hoàn tất thông tin để đặt hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Thông tin giao hàng
                </h2>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="deliveryName"
                        required
                        value={formData.deliveryName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Nhập họ và tên người nhận"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="deliveryPhone"
                        required
                        value={formData.deliveryPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Nhập số điện thoại liên hệ"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Địa chỉ nhận hàng
                    </label>
                    <textarea
                      name="deliveryAddress"
                      required
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                      placeholder="Ví dụ: Giao hàng trong giờ hành chính, gọi trước khi giao..."
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      Phương thức thanh toán
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethodId === method.id.toString()
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                            }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethodId"
                            value={method.id}
                            checked={formData.paymentMethodId === method.id.toString()}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.paymentMethodId === method.id.toString()
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-slate-300"
                              }`}>
                              {formData.paymentMethodId === method.id.toString() && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium text-slate-900">{method.name}</span>
                          </div>
                          {method.id === 2 && (
                            <Banknote className="w-5 h-5 text-emerald-600 absolute right-4 opacity-50" />
                          )}
                          {method.id === 1 && (
                            <Truck className="w-5 h-5 text-emerald-600 absolute right-4 opacity-50" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-600" />
                Đơn hàng của bạn
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div
                    key={item.productUnit.id}
                    className="flex gap-4 py-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.productUnit.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.productUnit.shortName} x {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatCurrency(item.productUnit.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6 pt-4 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={handleCouponChange}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Đã áp dụng mã: {appliedCoupon.coupon.code}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 pl-4">
                      {appliedCoupon.coupon.discountType === 'percent'
                        ? `Giảm ${appliedCoupon.coupon.discountValue}%`
                        : `Giảm ${formatCurrency(Number(appliedCoupon.discountAmount || 0))}`
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-600 font-medium">Miễn phí</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{formatCurrency(Number(appliedCoupon?.discountAmount || 0))}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                  <span className="text-slate-900 font-bold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(payableAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Đặt hàng ngay
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Bảo mật thanh toán 100%
              </div>
            </div>
          </div>
        </div>
      </main>

      <BankTransferModal
        open={showBankPaymentModal}
        onClose={() => {
          setShowBankPaymentModal(false);
          try {
            sessionStorage.removeItem("pendingOrderPayload");
          } catch (e) { }
        }}
        onConfirm={createOrderFromPending}
        onViewDetails={viewOrderDetails}
        amount={payableAmount}
        description={transferDescription}
        isCreating={isCreatingOrder}
        bankName={process.env.NEXT_PUBLIC_BANK_NAME || ""}
        bankAccount={process.env.NEXT_PUBLIC_BANK_ACCOUNT || ""}
        bankOwner={process.env.NEXT_PUBLIC_BANK_OWNER || ""}
      />
    </div>
  );
}
