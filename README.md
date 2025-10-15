# Link sơ đồ class:

https://mermaid.live/view#pako:eNqtWdtyozgQ_RWKx61MyvY4N153X_cHtlylkpGMNQMS0cUTJ5V_3wYkDEJc7CQPsVF3S92nr8IfcSoIjZM4zbFS_zCcSVzseAR_9UpUSnFgOVXRR7Na_RnDSMTIZeGEZXrEMqIFZvllWdM3HZWwyx8hCTpidRyKcFzQ4aoSUqMwqTwKTr0zMCGSKnVZtVojKXIaVf88AS50Z2kvgAPziCmEU81OXW5WUKVxUer3CPDQKBcZ4wjrMEsqKdaUtPTPHe-CmQIxE5L14dyzTFHJcB7EdASg3GSeTYSqVLJSM8GDh-8l5uSbD3arqTBcy3PwXPAFMalecDKsMq4dSmcUoNVGoO_FqaWwAmcUGdkJYW4K0DOF_TSS-IagmYkICw4ynF2BkJMK4VDtFMCBvVOU4z3NA7TjMNuc3Zxq9KrPgWNEMeQu4V_ICb_NcHEPn1B6LgQwjGYUuLVIf8_i7OOIzwXlGhVUH8VtUe7tqI6sLBnPvrLl4tyE_CkFv-KMPnRulTBVZyLS5zLgzJZ8wrkJ0AuobFCpqURaaNyJFAIhHNG3kkFSkl4WOKcZVaVOzgoWjvN62wX21a1lb86gQ3fZaVjrhXBRWTFGPWE9YbpnWWMuJKs24PL6Y5BtXiSEylI__EIcjYd7FCekqSx6D8HgFzxnPFB_KOMnAWmHJH01TFJyUx1qcGCaFsurkJUZL09VKerRXbS8Gsw165aVkQoycN-Y64f1uUvpSvmZZ6DeACeyDlgao8A-EqO-ihaUQGg4n4-EX9d9JWakN3W045AUJ1an7Fs_ugJzzjWTigcLwnkuoDGzRVXKy4pFsdPC1xxUqbbAa5j8gq_XOG5YXOZV8jzqsAcIVW-IWI7vHyzpURhFv9ZXeoOvd0QmoGtBVUgpNJ6l6ChTljkLA9Tq3I-zjtH1YSfaj1QvEKe0vLIAtVJfLkF-73co7Fmefwm6dtqBjRAXXkutV0mwbCmz91rVXCtruyB-GyUF2-d8D5usRHZ0zvqD8xW50EP7yhBoRK7w__gVwIE0bE6TM299wkjbqjo2cv4Ke2r0UlGPwTUaQdCg64OzqltSIU50YQGcA2cy0Ycn1mNm1J81x1v8pWoekMb77p28zefDaNjNxVCN1lXdYNLYbyjxvkpXRnZX8Ib6RtjhcLm5DVWTFCmqNYy1C1Sqk6YRCjShnGZQVQKE0Kua0CuiweuberXKjoDlhB6wyTUK-625HBkpKU_Pvp4wV-QLxyGfbkoy4uvLK51dvN7F0Y8f8OUv-NK-90iiI7bG2Xcw45wF5uYA91wDgDQiLTEsZN8cJHDB4BozbqVa2eblnSdrb2NJVOY4dQfZxRCrDV3_kL4Kk4L1E-DHLGyD2_WYhhWjQieG7ZHePX_UsKpL7W0EuNv1GDOu-w-BrrkEvOGNoTrubDEZUmfEe5N10hl_HVRhv8xsYycxtQi1kEUN61V4dKtvYusX2HEQcpEhfXFJc0BBLfSJN-smbqaw9nem7TlBB1yb6R7HlPwtaRLeoB2kXRBMm-_Nq0k9Fil0kG5g8RimxG8xIrxBaaoeqjpWzMThwIxeFi_QIzQUQSiLLpLjsRCWbm-juqvG-C7DSaSTC26TIdPMLjd5ZWyPVp1-dE3a1J0XkmETju_iTDISJ1oaehdDPkOfh8e4ni12sT4CoLs4ga9Wdhfv-CeIlZj_J0ThJKUw2dE9NF3X_irVclAOdeTvaqSOk_V6U28RJx_xGzz-XN1vnx5eHler7Wb1_Pz0eBefYXl7__yy3j5s1-vV-nn9tNp83sXv9anr-83z6ulh-_Ph5WHzuNmu72JKGNj7r_1drPr4_B_lfLaa

# Database Schema Documentation

**Hệ thống quản lý bán hàng vật tư nông nghiệp (BVTV)**

## 📋 Tổng quan

Cơ sở dữ liệu gồm **20 bảng chính** được tổ chức thành 7 migration files, quản lý đầy đủ quy trình:

-   Bán hàng (Sales) & Công nợ phải thu (AR)
-   Mua hàng (Purchase) & Thanh toán nhà cung cấp (AP)
-   Quản lý kho (Inventory) với tracking đầy đủ
-   Báo cáo và In ấn

---

## 🗂️ Cấu trúc Files

### **V1\_\_enums_and_profiles.sql** - Enums & Người dùng

**7 ENUMs:**

-   `profile_role`: customer, agent, supplier, admin, staff
-   `order_status`: pending, confirmed, shipped, completed, cancelled
-   `payment_term`: prepaid, cod, credit
-   `payment_status`: pending, success, failed, void
-   `inventory_movement_type`: purchase, sale, return_in/out, adjustment_pos/neg, transfer_in/out, conversion_in/out
-   `bill_status`: open, partially_paid, paid, void (chưa dùng - thanh toán NCC đơn giản)

**1 Bảng:**

-   `profiles`: Lưu tất cả người dùng (khách hàng, NCC, admin, nhân viên)

---

### **V2\_\_catalog_and_reference.sql** - Danh mục & Tham chiếu

**7 Bảng:**

-   `categories`: Danh mục sản phẩm
-   `brands`: Thương hiệu
-   `products`: Sản phẩm (có VAT rate)
-   `product_units`: Đơn vị bán (bao 50kg, chai 1L...) - có giá, SKU, tồn kho
-   `payment_methods`: Phương thức thanh toán
-   `shipping_methods`: Phương thức vận chuyển
-   `coupons`: Mã giảm giá

**Lưu ý:**

-   `products.vat_rate`: % VAT của sản phẩm (0, 5, 8, 10)
-   `product_units.price`: Giá đã bao gồm VAT
-   `product_units.short_name`: Tên gọi tắt (VD: "Con Rồng to", "Thuốc gầy nhỏ")

---

### **V3\_\_sales_orders_and_AR.sql** - Đơn hàng & Công nợ phải thu

**5 Bảng:**

-   `orders`: Đơn hàng bán (có total_vat riêng)
-   `order_items`: Chi tiết đơn hàng (snapshot vat_rate và vat_amount)
-   `customer_payments`: Phiếu thu tiền từ khách
-   `customer_payment_allocations`: Phân bổ payment cho order (1 payment → nhiều orders)
-   `customer_adjustments`: Điều chỉnh công nợ (trả hàng, giảm giá thêm...)

**VAT Tracking:**

-   `order_items.vat_rate`: Snapshot từ `products.vat_rate` tại thời điểm bán
-   `order_items.vat_amount`: Tiền VAT tách ra từ giá đã bao gồm VAT
-   `orders.total_vat`: Tổng VAT của đơn hàng (sum từ order_items)

---

### **V4\_\_AP_goods_receipts_and_bills.sql** - Nhập hàng & Hóa đơn NCC

**5 Bảng:**

-   `warehouses`: Kho hàng
-   `goods_receipts`: Phiếu nhập hàng từ NCC
-   `goods_receipt_items`: Chi tiết phiếu nhập
-   `supplier_bills`: Hóa đơn NCC (thanh toán ngay và đủ)
-   `supplier_bill_items`: Chi tiết hóa đơn (hàng hóa + chi phí khác)

**Model đơn giản:**

-   Không cần Purchase Order
-   Thanh toán NCC ngay khi nhận hóa đơn (`paid_at` not null)
-   Không quản lý công nợ NCC phức tạp

---

### **V5\_\_inventory_movements_and_triggers.sql** - Xuất nhập tồn & Triggers

**3 Bảng:**

-   `inventory_movements`: Sổ xuất nhập tồn (mọi giao dịch)
-   `stock_adjustments`: Phiếu điều chỉnh tồn kho
-   `stock_adjustment_items`: Chi tiết điều chỉnh

**5 Triggers tự động:**

1. `trg_movements_after_ins`: Cập nhật stock khi INSERT movement
2. `trg_movements_after_upd`: Hoàn nguyên OLD + áp dụng NEW
3. `trg_movements_after_del`: Hoàn nguyên stock khi DELETE movement
4. `trg_gr_items_after_ins`: Tạo movement type='purchase' từ goods_receipt_items
5. `trg_sai_after_ins`: Tạo movement type='adjustment_pos/neg' từ stock_adjustment_items

**Logic cập nhật stock:**

-   **TĂNG tồn:** purchase, return_in, adjustment_pos, conversion_in
-   **GIẢM tồn:** sale, return_out, adjustment_neg, conversion_out

---

### **V7\_\_storeSettings_views_and_reports.sql** - Cài đặt & Báo cáo

**1 Bảng:**

-   `store_settings`: Thông tin cửa hàng (tên, địa chỉ, MST, kho mặc định...)

**8 Views:**

1. `stock_on_hand`: Tồn kho hiện tại (theo product_unit + warehouse)
2. `ar_balance_per_customer`: Công nợ phải thu từng khách hàng
3. `invoice_print_header`: Header hóa đơn bán (để in)
4. `invoice_print_lines`: Chi tiết hóa đơn bán
5. `goods_issue_print_header`: Header phiếu xuất kho
6. `goods_issue_print_lines`: Chi tiết phiếu xuất kho
7. `gr_print_header`: Header phiếu nhập kho
8. `gr_print_lines`: Chi tiết phiếu nhập kho

---

## 🔗 Mối quan hệ chính
