"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import BankTransferModal from "./checkQR/BankTransferModal";
import CheckTransactionsDebug from "./checkQR/CheckTransactionsDebug";
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
  const { items, getTotalPrice, clearCart } = useCartStore();
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

  function generatePaymentCode() {
    const ts = Date.now().toString(36).toUpperCase(); // dựa trên thời gian
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4 ký tự random
    return `P${ts}${rand}`; // ví dụ: PMB7F3K2A1Z
  }

  const [paymentCode] = useState(generatePaymentCode());

  useEffect(() => {
    try {
      sessionStorage.setItem("currentPaymentCode", paymentCode);
    } catch (e) {}
  }, [paymentCode]);

  const fetchPaymentMethods = async () => {
    try {
      // Fetch ALL payment methods (online + offline).
      // Previously we called `/payment-methods/online` which returned only online methods,
      // causing the default selection to be an online method -> `isOnline=true` and
      // `paymentTerm=PREPAID` when creating orders. That made COD orders saved incorrectly.
      const response = await api.get("/payment-methods/online");
      setPaymentMethods(response.data);

      if (response.data.length > 0) {
        // Prefer an offline/COD method as default when available
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

      // build payload (but do not send yet if bank transfer)
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
        discountTotal: 0,
        paymentMethod: { id: Number(formData.paymentMethodId) },
        paymentTerm: method?.forOnline ? "PREPAID" : "COD",
        isOnline: !!method?.forOnline,
        items: itemsPayload,
      };

      // If payment method id === 2 (bank transfer), show QR / wait for confirmation
      if (method?.id === 2) {
        setShowBankPaymentModal(true);
        // keep payload in sessionStorage temporarily so creation step can reuse it if needed
        try {
          sessionStorage.setItem(
            "pendingOrderPayload",
            JSON.stringify(payload)
          );
        } catch (e) {
          console.warn("Cannot write pendingOrderPayload to sessionStorage", e);
        }
        return;
      }

      // otherwise create order immediately
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

  // Create order after bank transfer verification succeeds.
  // This will create the order and save `lastOrder` in sessionStorage, but
  // will NOT navigate — the modal will show success and user can click
  // "Xem chi tiết đơn hàng" to go to the success page.
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
        // fallback: build payload from current state
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
          discountTotal: 0,
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

      // keep modal open and let user click "Xem chi tiết đơn hàng"
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
    } catch (e) {}
    setShowBankPaymentModal(false);
    router.push("/checkout/success");
  };

  const selectedMethod = paymentMethods.find(
    (m) => m.id === Number(formData.paymentMethodId)
  );

  // Build a sanitized description for bank transfer: phone + name, no special chars
  const buildDescription = () => {
    const phone = (formData.deliveryPhone || "").toString();
    const name = (formData.deliveryName || "").toString();
    const raw = `${paymentCode} ${phone} ${name}`.trim();
    // remove diacritics and non-alphanumeric characters except spaces
    // normalize to NFKD to remove accents, then strip non-alphanum/spaces
    const normalized = raw.normalize("NFKD").replace(/\p{Diacritic}/gu, "");
    const cleaned = normalized.replace(/[^0-9a-zA-Z\s]/g, "");
    // collapse multiple spaces
    return cleaned.replace(/\s+/g, " ").trim();
  };

  const transferDescription = buildDescription();

  // NOTE: QR generation / display moved to the success page after order creation

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
          <h1 className="text-3xl font-bold text-green-800">Thanh toán</h1>
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
                    Họ và tên người nhận <span className="text-red-500">*</span>
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
                    Số điện thoại <span className="text-red-500">*</span>
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
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
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
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* QR will be displayed on the order success page if bank transfer is selected */}

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
                    Xác nhận đặt hàng
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
                      {item.productUnit.name} ({item.productUnit.shortName}) x
                      {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(item.productUnit.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>
              {/* Debug tool (dev only) to fetch transactions from Casso */}
              {/* {process.env.NODE_ENV !== 'production' && (
                                <div className="mt-4">
                                    <CheckTransactionsDebug />
                                </div>
                            )} */}
            </div>
          </div>
        </div>
      </div>
      <BankTransferModal
        open={showBankPaymentModal}
        onClose={() => {
          setShowBankPaymentModal(false);
          try {
            sessionStorage.removeItem("pendingOrderPayload");
          } catch (e) {}
        }}
        onConfirm={createOrderFromPending}
        onViewDetails={viewOrderDetails}
        amount={getTotalPrice()}
        description={transferDescription}
        isCreating={isCreatingOrder}
        bankName={process.env.NEXT_PUBLIC_BANK_NAME || ""}
        bankAccount={process.env.NEXT_PUBLIC_BANK_ACCOUNT || ""}
        bankOwner={process.env.NEXT_PUBLIC_BANK_OWNER || ""}
      />
    </div>
  );
}
