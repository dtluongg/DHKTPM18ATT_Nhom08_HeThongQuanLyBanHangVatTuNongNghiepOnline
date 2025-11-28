"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import api from "@/lib/api";
import { ProductUnit } from "@/types";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductUnit[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { addItem } = useCartStore();
    const [notify, setNotify] = useState<{ text: string } | null>(null);
    const Toast = dynamic(() => import("@/components/Toast"), { ssr: false });
    const { user } = useAuthStore();

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get("/product-units");
            setProducts(response.data);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategory === "all" ||
            product.category?.id === parseInt(selectedCategory);
        const matchesSearch =
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (product: ProductUnit) => {
        const res = addItem(product, 1);
        if (res.action === "added") {
            setNotify({ text: `Đã thêm “${product.name}” vào giỏ hàng` });
        } else {
            setNotify({ text: `Cập nhật số lượng “${product.name}”: ${res.quantity}` });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-green-800">
                            Đại lý BVTV Sáu Hiệp
                        </h1>
                        <div className="flex gap-4">
                            <Link
                                href="/order-lookup"
                                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                            >
                                🔎 Tra cứu đơn hàng
                            </Link>
                            <Link
                                href="/cart"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                🛒 Giỏ hàng
                            </Link>
                            {user ? (
                                <>
                                    {(user.role === "STAFF" ||
                                        user.role === "ADMIN") && (
                                        <Link
                                            href="/dashboard/admin"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            🔧 Quản trị
                                        </Link>
                                    )}
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                                    >
                                        👤 {user.sortName}
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                                >
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Notification toast */}
                {notify && (
                    <Toast
                        message={notify.text}
                        duration={2200}
                        onClose={() => setNotify(null)}
                    />
                )}
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm tên sản phẩm..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Đang tải sản phẩm...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            Không tìm thấy sản phẩm nào
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                                            {product.category?.name}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">
                                            Tên ngắn: {product.shortName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Thương hiệu: {product.brandName}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xl font-bold text-green-600">
                                                {formatCurrency(product.price)}
                                            </p>
                                            {product.creditPrice && (
                                                <p className="text-sm text-gray-500">
                                                    Giá công nợ:{" "}
                                                    {formatCurrency(
                                                        product.creditPrice
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
