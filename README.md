# Link sơ đồ class:
https://mermaid.live/view#pako:eNq1WWlv4zYQ_SuEgF30SILY8dEIaIHsBigCNGix6W6BwoDASLTNRiK1PNx4g_z3DinJkWTqsK36S2wOZ0i-N5yDefFCHhHP98IYS3lL8UrgZMEQfN69Qz_3_OwUvox89IfgSxoTid6jG63WRxqz-ylsoZds0Hx-_Pz57hbRqDTyoARlK0QSTOP9YYYTsj-arjlzDOMoEkTKfYHgcXn6nzQhUuEkRaEgWJEowCoTvy7YCfiNffQRKxzzFcD3iSyJICwkJ2EI9siKi20FxN84nMkFohstGevV_mhEZChoqihntbNnK38QmEXDLxtyzZTYOpcEh4l0qDoWtSNhjkuwL3o0Gw8Gh6cspAlekUCLssN-oKtbEoIkRhusAgEbLEs5uCBmiMoAh4puDnTHCj6fGe2FUZpNd0KhwYYDCvqNBDF-JI6bKNdcqKAGYenQjKjgq9o6luKJWyMVNHTx8aT3Bx-xMLGuJLhj4AFEIKl4-NSNdB1KvE0IU_dErfnBXl6z9bCmaQozjjN2yJ38yHXKWb8VanAVK1Bpb2CgtmkDkbspGxzrhjkJZQEXERGB4hDwSpNuwYEReU4p3M2oegcKxrQ0tyemCR0k6l756HezFZOzHrDJXd_dfPr-pKhr7XXAbDPZo94CBi744UIr7UhFaeZ4gSIi2buwuSyxjuQIbTL3tOYZofWQqqDEm9SPdcJczLfM2W1hSRp8wyqD86g2MU7MQscEQcvNnSJJnxCY-WhzaDRhsCounPSrxkzRSjxrCV0uEMtHrN9jDVErISKPQn08DXyjfpLSontwWisuL2lyzzf8U0zfwK_ELK6OSlu1097EMYf0TTsDWeVO9OK2jEi2itlVNw830T_wrS8VjkvfZ0N1ioralGBZqTH-r-p04qNfOY8kVKYhgSRj46VO05iCu3-gcSxPipl_YUHWXEtySgKsVPA1suzm8733oUnmZ3Mw9W-x16rsDXlhltmQrnvQssO-EUpk0weIUfWqJD--YfZ4uIryC4wEjNfzvB2uZflBs43Cz61idy7pTKZtwa53WCsD3JdtC9ghVLd2IyUkHOmqq_y2i7UkspgyEhQkNdPT3OjYyjygAM0Q4Wvqozu2AUZNN3yPGdSQht-TYtbO4D3fkB7hv4OsttiSs1Eru1uqDXspBVkCRfYZxWnOyCMe1qv5PLJksgbPHza5zH30AEAS9ECUgp2dlkusqdxSv3QijUbgTioxWUGUOOglqeE1qvGByVyEfVeIyBLrWAXtLhFqYd6JHFfXVDA9H65qYp1Gw5H7icS2XDOlv0Tn6Mu4eOY60ubuUWvhjRYeOj__Bb79AN-KByAf-himMGU51NlbVPPsBDO9hG5fAzuZRiFr0LFPKD5aYzkoMFd5J3qkyeLBtL7prB31URrjcHfAygNGo4ZJb4-5a9XeKZp0bIcHvrOhOKcre3Vomo9tGpSQp7Pp2bhztk2TdXLLlLRpSR5DGmcFYU1g1Xsr4x1P_VDbV4U7m2vWZR26pSbHL_Ui7Ri12bBMLrnoe_xSSwMbsD9IbqB7AxVlYbw853fAuzLJu5H3J_UeTTBUmgW_KG7zVd5alQ61vA3I1SrCNs2D3dyhXHQgXXxXynzfFpgyWIqi6Gt3-JpyNVqUZW2KB5_WoZxqEUIwfjvuIC42fSvwjnevxmPsF48-UgKHT51e5tK0BYxs59qlR9mGx9ZFBwRuPkwx14xApcDz9wsl78xbCRp5vhKanHkQkqAgg5-eLQYXnlrD-ReeD19z3YW3YK-glmL2N-dJoSm4Xq09f4ljCb-ysij_R-luCmEQCz-aLsfzr6-sCc9_8Z49fzSdXMyuRpPp5WQ-H81mINx6_tX84nI2Hl9PZrP59Pon-PJ65n2zi15eXE8m4_F4Ohpdjqajy_HszCMRhdPe5_-pNX9e_wMQzskE

# Database Migration Files - Hệ thống quản lý Đại lý VTNN

## Tổng quan

Thư mục này chứa các file migration SQL để khởi tạo và quản lý cơ sở dữ liệu cho hệ thống quản lý đại lý vật tư nông nghiệp. Database được thiết kế theo mô hình chuẩn hóa với đầy đủ tính năng:

- ✅ Quản lý sản phẩm & danh mục
- ✅ Quản lý kho hàng & tồn kho
- ✅ Đơn hàng bán & công nợ khách hàng (AR)
- ✅ Nhập hàng & hóa đơn nhà cung cấp
- ✅ Tracking VAT chi tiết
- ✅ Báo cáo & in ấn chứng từ

## Cấu trúc Migration Files

### V1: Core Schema (Lõi hệ thống)
**File:** `V1__core_schema.sql`

Định nghĩa các enum types và bảng cơ bản:
- **ENUMs**: `user_role`, `order_status`, `payment_term`, `payment_status`, `movement_type`
- **Tables**: 
  - `profiles` - Người dùng (khách hàng, nhà cung cấp, nhân viên)
  - `payment_methods` - Phương thức thanh toán
  - `shipping_methods` - Phương thức vận chuyển
  - `warehouses` - Kho hàng
  - `coupons` - Mã giảm giá

### V2: Product Catalog (Danh mục sản phẩm)
**File:** `V2__product_catalog.sql`

Quản lý sản phẩm với cấu trúc phân cấp:
- **Tables**:
  - `categories` - Danh mục sản phẩm
  - `brands` - Thương hiệu
  - `products` - Sản phẩm (master data)
  - `product_units` - Đơn vị sản phẩm (SKU với giá, kích thước)

**Đặc điểm:**
- Hỗ trợ slug SEO-friendly
- Tracking VAT rate theo sản phẩm
- Multi-unit pricing (1 sản phẩm nhiều quy cách)

### V3: Sales Orders & AR (Đơn hàng & Công nợ)
**File:** `V3__sales_orders_and_AR.sql`

Quản lý bán hàng và công nợ khách hàng:
- **Tables**:
  - `orders` - Đơn hàng bán (có tracking VAT: `total_amount`, `total_vat`)
  - `order_items` - Chi tiết đơn hàng (có `vat_rate`, `vat_amount` per line)
  - `customer_payments` - Phiếu thu tiền
  - `customer_payment_allocations` - Phân bổ thanh toán
  - `customer_adjustments` - Điều chỉnh công nợ

**Payment Terms hỗ trợ:**
- `prepaid` - Trả trước (COD online)
- `cod` - Thu tiền khi giao hàng
- `net_7/15/30` - Công nợ 7/15/30 ngày

### V4: Purchases (Nhập hàng từ NCC)
**File:** `V4__purchases.sql`

Quản lý nhập hàng:
- **Tables**:
  - `goods_receipts` - Phiếu nhập kho
  - `goods_receipt_items` - Chi tiết phiếu nhập
  - `supplier_bills` - Hóa đơn nhà cung cấp (có tracking VAT)
  - `supplier_bill_items` - Chi tiết hóa đơn (có `tax_rate` per line)

**Lưu ý:** Không có AP (Accounts Payable) vì thanh toán NCC ngay khi nhận hàng.

### V5: Inventory Movements (Biến động kho)
**File:** `V5__inventory_movements.sql`

Tracking mọi giao dịch xuất/nhập kho:
- **Table**: `inventory_movements`
- **Movement Types**:
  - **TĂNG**: `purchase`, `return_in`, `adjustment_pos`, `transfer_in`, `conversion_in`
  - **GIẢM**: `sale`, `return_out`, `adjustment_neg`, `transfer_out`, `conversion_out`

**Triggers tự động:**
- Tạo movement khi nhập hàng từ `goods_receipt_items`
- Tạo movement khi bán hàng từ `order_items`
- Cập nhật `product_units.stock` realtime

### V7: Views & Reports (Báo cáo & In ấn)
**File:** `V7__storeSettings_views_and_reports.sql`

Báo cáo và views để in chứng từ:

**Báo cáo:**
- `stock_on_hand` - Tồn kho hiện tại theo sản phẩm & kho
- `ar_balance_per_customer` - Công nợ khách hàng

**Views in ấn:**
- `invoice_print_header` / `invoice_print_lines` - Hóa đơn bán hàng (có `total_vat`)
- `goods_issue_print_header` / `goods_issue_print_lines` - Phiếu xuất kho
- `gr_print_header` / `gr_print_lines` - Phiếu nhập kho

**Settings:**
- `store_settings` - Thông tin cửa hàng (tên, MST, địa chỉ...)

### V9: Seed Data (Dữ liệu mẫu)
**File:** `V9__seed_sample_catalog_and_goods_receipt.sql`

Khởi tạo dữ liệu demo:
- 2 categories (Phân bón, Thuốc BVTV)
- 3 brands (Phú Mỹ, Bayer, Syngenta)
- 4 products với 4 SKUs
- 1 supplier + 1 goods receipt (nhập 4 sản phẩm)
- 1 supplier bill (tổng tiền: 189,255,000đ bao gồm VAT 10%)

## Quan hệ chính giữa các bảng

