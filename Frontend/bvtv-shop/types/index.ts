// ============================================================
// Product Types
// ============================================================
export interface Category {
    id: number;
    name: string;
    slug?: string;
    description?: string;
}

export interface ProductUnit {
    id: number;
    name: string;
    category?: Category;
    brandName?: string;
    description?: string;
    imageUrl?: string;
    vatRate: number;
    shortName?: string;
    price: number;
    creditPrice?: number;
    sku: string;
    barcode?: string;
    stock: number;
    isActive: boolean;
    createdAt?: string;
}

// ============================================================
// Order Types
// ============================================================
export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    SHIPPED = "shipped",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export enum PaymentTerm {
    PREPAID = "prepaid",
    COD = "cod",
    CREDIT = "credit",
}

export interface Order {
    id: number;
    orderNo: string;
    buyerId?: string;
    totalAmount: number;
    totalVat: number;
    discountTotal: number;
    status: OrderStatus;
    paymentMethodId: number;
    couponId?: number;
    paymentTerm: PaymentTerm;
    isOnline: boolean;
    einvoiceRequired: boolean;
    createdAt: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    orderId: number;
    productUnitId: number;
    quantity: number;
    price: number;
    discountAmount: number;
    vatRate: number;
    vatAmount: number;
    productUnit?: ProductUnit;
}

// ============================================================
// Cart Types
// ============================================================
export interface CartItem {
    productUnit: ProductUnit;
    quantity: number;
}

// ============================================================
// User/Profile Types
// ============================================================
export enum ProfileRole {
    CUSTOMER = "CUSTOMER",
    AGENT = "AGENT",
    SUPPLIER = "SUPPLIER",
    ADMIN = "ADMIN",
    STAFF = "STAFF",
}

export interface Profile {
    id: string;
    email?: string;
    name: string;
    sortName?: string;
    phone?: string;
    address?: string;
    areaId?: number;
    role: ProfileRole;
    note?: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    sortName?: string;
    phone?: string;
    address?: string;
    role: ProfileRole;
    isActive: boolean;
}

// ============================================================
// Payment & Coupon Types
// ============================================================
export interface PaymentMethod {
    id: number;
    name: string;
    forOnline: boolean;
    isActive: boolean;
}

export interface Coupon {
    id: number;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderTotal: number;
    expiryDate: string;
    usageLimit?: number;
}

// ============================================================
// Area Types
// ============================================================
export interface Area {
    id: number;
    name: string;
    createdAt: string;
}

// ============================================================
// Store Settings
// ============================================================
export interface StoreSetting {
    id: number;
    storeName: string;
    legalName?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
    defaultWarehouseId?: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// Warehouse & Inventory Types
// ============================================================
export interface Warehouse {
    id: number;
    name: string;
    location?: string;
    isActive: boolean;
    createdAt: string;
}

export enum InventoryMovementType {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    RETURN_IN = "RETURN_IN",
    RETURN_OUT = "RETURN_OUT",
}

export interface InventoryMovement {
    id: number;
    productUnit: ProductUnit;
    warehouse: Warehouse;
    type: InventoryMovementType;
    quantity: number;
    refTable?: string;
    refId?: number;
    createdAt: string;
}

// ============================================================
// Warehouse Documents Types
// ============================================================
export enum DocumentStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    APPROVED = "APPROVED",
    IN_TRANSIT = "IN_TRANSIT",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
    UNPAID = "UNPAID",
    PARTIAL = "PARTIAL",
    PAID = "PAID",
}

export interface Profile {
    id: number;
    name: string;
    phone?: string;
    email?: string;
}

// Phiếu Nhập Hàng (PNH)
export interface GoodsReceiptItem {
    id?: number;
    productUnit: ProductUnit;
    quantity: number;
    unitCost: number; // Changed from unitPrice to match backend
    lineTotal?: number; // Changed from totalPrice to match backend
}

export interface GoodsReceipt {
    id?: number;
    receiptNo?: string;
    warehouse: Warehouse;
    supplier?: Profile;
    status: DocumentStatus;
    paymentStatus: PaymentStatus;
    notes?: string;
    items: GoodsReceiptItem[];
    totalAmount?: number;
    totalVat?: number;
    grandTotal?: number;
    createdAt?: string;
}

// Phiếu Trả Hàng (PTH)
export interface CustomerReturnItem {
    id?: number;
    orderItemId?: number;
    productUnit: ProductUnit;
    quantity: number;
    refundAmount: number;
}

export interface CustomerReturn {
    id?: number;
    returnNo?: string;
    order?: any;
    customer?: Profile;
    warehouse: Warehouse;
    totalRefund?: number;
    reason?: string;
    status: DocumentStatus;
    approvedBy?: Profile;
    createdBy?: Profile;
    createdAt?: string;
    items: CustomerReturnItem[];
}

// Phiếu Trả Hàng NCC (PTHNCC)
export interface SupplierReturnItem {
    id?: number;
    productUnit?: ProductUnit;
    receiptItem?: { id: number };
    quantity: number;
    returnAmount: number;
}

export interface SupplierReturn {
    id: number;
    returnNo?: string;
    warehouse?: Warehouse;
    supplier?: Profile;
    receipt?: { id: number; receiptNo?: string };
    status: DocumentStatus;
    reason?: string;
    items?: SupplierReturnItem[];
    totalReturn?: number;
    totalVat?: number;
    approvedBy?: Profile;
    createdBy?: Profile;
    createdAt: string;
}

// ============================================================
// API Response Types
// ============================================================
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
