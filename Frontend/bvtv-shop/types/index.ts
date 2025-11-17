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
