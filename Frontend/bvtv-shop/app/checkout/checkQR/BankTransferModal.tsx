"use client";

import React, { useEffect, useState, useRef } from "react";
import { getVietQRImageUrl } from "./generateQR";
import { fetchTransactionsFromEnv } from "./checkCompleted";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  onViewDetails?: () => void;
  amount: number;
  description?: string;
  isCreating?: boolean;
  bankName?: string | null;
  bankAccount?: string | null;
  bankOwner?: string | null;
};

export default function BankTransferModal({
  open,
  onClose,
  onConfirm,
  onViewDetails,
  amount,
  description,
  isCreating,
  bankName,
  bankAccount,
  bankOwner,
}: Props) {
  // ❗ Hooks luôn đặt ở trên, không return trước khi tới đây
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // giữ onConfirm mới nhất để dùng trong effect mà không phải đưa vào deps
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  useEffect(() => {
    if (!open) {
      // reset state khi modal đóng
      setStatus("idle");
      setCreated(false);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    setStatus("verifying");

    const checkOnce = async () => {
      try {
        const res = await fetchTransactionsFromEnv();
        const records = res?.data?.records;
        if (Array.isArray(records) && records.length > 0) {
          // có thể cải tiến để find trong cả mảng, tạm thời giữ logic cũ
          const last = records[records.length - 1];
          const recAmount = Math.round(Number(last.amount || 0));
          const expected = Math.round(Number(amount || 0));
          const desc = (last.description || "").toString().toLowerCase();
          const fullNote = (description || "").toString().toLowerCase();
          const getPaymentCode = fullNote.split(" ")[0].toLowerCase();
          const amountMatches = recAmount === expected;
          const descMatches = fullNote ? desc.includes(getPaymentCode) : true;

          if (amountMatches && descMatches) {
            setStatus("success");
            try {
              setCreating(true);
              await onConfirmRef.current();
              setCreated(true);
            } catch (err) {
              console.error("create order after verify error", err);
            } finally {
              setCreating(false);
            }
            // dừng polling + timeout
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (timeoutRef.current) {
              window.clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error("verify fetch error", err);
      }
    };

    // check ngay lần đầu
    checkOnce();
    // sau đó 30s check 1 lần
    intervalRef.current = window.setInterval(checkOnce, 30 * 1000);
    // timeout 2 phút
    timeoutRef.current = window.setTimeout(() => {
      setStatus((prev) => (prev === "success" ? "success" : "failed"));
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // ❗ Polling chỉ start lại khi `open` đổi false -> true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ✅ Bây giờ mới được return theo `open`
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <h3 className="text-xl font-semibold mb-3">Xác nhận chuyển khoản</h3>
        <p className="text-sm text-gray-700 mb-4">
          Vui lòng quét mã QR bên dưới hoặc nhập thông tin chuyển khoản bằng tay. Hệ thống sẽ
          tự động kiểm tra giao dịch trong vòng 2 phút.
        </p>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="shrink-0">
            <img
              src={getVietQRImageUrl({ amount, addInfo: description || "Thanh toan" })}
              alt="QR chuyển khoản"
              className="w-80 h-80 md:w-96 md:h-96 object-contain rounded bg-white"
            />
          </div>

          <div className="text-sm text-gray-700">
            <div className="mt-3">
              <strong>Tên ngân hàng:</strong> {bankName || "-"}
            </div>
            <div className="mt-3">
              <strong>Số tài khoản:</strong> {bankAccount || "-"}
            </div>
            <div className="mt-1">
              <strong>Tên chủ tài khoản:</strong> {bankOwner || "-"}
            </div>
            <div className="mt-2">
              <strong>Nội dung:</strong> {description || "Thanh toan"}
            </div>
            <div>
              <strong>Số tiền:</strong>{" "}
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                amount
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Bạn có thể chụp màn hình mã QR và dùng ứng dụng ngân hàng để quét hoặc nhập thông
              tin chuyển khoản thủ công.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded disabled:opacity-60"
            disabled={creating || isCreating}
          >
            Quay lại
          </button>

          {status === "verifying" && (
            <div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded font-semibold flex items-center">
              Đang xác thực thanh toán...
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-600 text-white rounded font-semibold">
                Thanh toán thành công
              </div>
              <button
                onClick={() => {
                  if (onViewDetails) onViewDetails();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Xem chi tiết đơn hàng
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded font-semibold">
              Thanh toán không thành công
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
