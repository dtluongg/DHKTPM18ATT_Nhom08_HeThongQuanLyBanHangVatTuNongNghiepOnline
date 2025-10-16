# Link sơ đồ class 10 bảng:

https://mermaid.live/edit#pako:eNqlV81y2jAQfhWPjm3CQAiEcOilufQBeukwoxHWYmsqS468oiGZvHvX2KaykRtKfTDW_mj_vl2JN5ZaCWzNUi2q6kmJzIliYxJ6jpSkdHanNFTJW0Otn8_fv397SpQMKHvh0ly4BAqhdIRuRAERckkmflkneS6qPMKvcuuQjynn1oR0hBdMhJQOqirmgsVQug2MO6shqV8Bb2tpLUyiKi5SVPueFVVAhaIo8TWhDCHXNlOGCxyRSR0IBHkSeN-YML-_hIPc-mqQ4a2iTTGe40E6zsMemEjJfmadut7EqRzaZ0PLEqrUqRKVNVHrlGfpU-TeKLzagVa0jeTAozpbJ4wcgsX4ApxKk71A7gTCpSCLx9bbsqRXdL-fPuYd_VKrBRyKCDIgebTpz4iGKkQG3Dt9BTI_QB21HLjLq3EU58YGLO-VTLb-QPSeSpcctCg0F4X1BkfZexHjSVWltRo_CgUCjRsUIvoqaX7OAyjFoQBSLgBzK_vOdTCyvrSmz-rUEFyRhIt48q3RysRGBiizt4QL7uDZKwfyPwrEFULxcZVaWqsS4YQt2BfoIPjshUGFhwtQflal0RpHWi5khXqD6CmHlP660Qu7h7oUF2dhPNZW4DRwh5kYmuR4KCGpX5clrGsWBzuOYqsj86tmqSsR0cf19ZO0xenOunEQD6bL8Dw5ts_lHgzGXkf-0-b9FJ8BbC-0jwkUdOw2oB8OCkmJTOClVFRO2UdgV0Bf1cNVq0LF001D2QGvAFGZ7PJYG7WR41NDRkNvhDl2c_rHWw6KlyjsJeyE18hH4N8UyjsHJo2BWttU6EsPmzMBX9ZViCD7z81kw2YbltzefqGv6WTyiRa9m0OjcLqNRsSbM62VGzTLB-Idoo_Mv0q2B2e43yyQaib2ydfg4jPmwT9pROZioxncIq9Wi4Xe7wJ2wzKnJFuj83DDqAsJs7Rkx-7YMMxp8w1b02cLtw3bmHdSK4X5YW3RaTrrs5ytd0JXtGrQ0f73OFEJiZSer_UEYOvZw_y4CVu_sRe2vpsuJ8vparp6nN7Nl8vlanHDDmw9X0zu5w_3y8Xj_cPybr6Yvd-w16PZ6WT1sJgGz-z9N_TgCQg

# Database Schema Documentation

**Hệ thống quản lý bán hàng vật tư nông nghiệp (BVTV)**

## 📋 Tổng quan

Cơ sở dữ liệu gồm **20 bảng chính** được tổ chức thành 7 migration files, quản lý đầy đủ quy trình:

-   Bán hàng (Sales)
-   Quản lý kho (Inventory)
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


**1 Bảng:**

-   `profiles`: Lưu tất cả người dùng (khách hàng, NCC, admin, nhân viên)

---

### **V2\_\_product_cate_coupons.sql** - Danh mục & Tham chiếu

**7 Bảng:**

-   `categories`: Danh mục sản phẩm
-   `product_units`: Đơn vị bán (bao 50kg, chai 1L...) - có giá, SKU, tồn kho
-   `payment_methods`: Phương thức thanh toán
-   `coupons`: Mã giảm giá

**Lưu ý:**

-   `product_units.vat_rate`: % VAT của sản phẩm (0, 5, 8, 10)
-   `product_units.price`: Giá đã bao gồm VAT
-   `product_units.short_name`: Tên gọi tắt (VD: "Con Rồng to", "Thuốc gầy nhỏ")

---

### **V3\_\_orders_warehouse.sql** - Đơn hàng

**5 Bảng:**

-   `orders`: Đơn hàng bán (có total_vat riêng)
-   `order_items`: Chi tiết đơn hàng (snapshot vat_rate và vat_amount)

**VAT Tracking:**

-   `order_items.vat_rate`: Snapshot từ `product_units.vat_rate` tại thời điểm bán
-   `order_items.vat_amount`: Tiền VAT tách ra từ giá đã bao gồm VAT
-   `orders.total_vat`: Tổng VAT của đơn hàng (sum từ order_items)

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

---

## 🔗 Mối quan hệ chính
