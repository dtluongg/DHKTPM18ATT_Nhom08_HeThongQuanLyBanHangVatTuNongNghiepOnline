"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { ProductUnit } from "@/types";
import { useCartStore } from "@/store/cart-store";
import Header from "@/components/Header";
import { Search, Filter, ShoppingCart, Tag, Leaf } from "lucide-react";

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductUnit[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { addItem } = useCartStore();
    const [notify, setNotify] = useState<{ text: string } | null>(null);
    const Toast = dynamic(() => import("@/components/Toast"), { ssr: false });

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
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Notification toast */}
                {notify && (
                    <Toast
                        message={notify.text}
                        duration={2200}
                        onClose={() => setNotify(null)}
                    />
                )}

                {/* Hero / Filters Section */}
                <div className="mb-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Sản phẩm
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Danh sách vật tư nông nghiệp chất lượng cao
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Search */}
                            <div className="md:col-span-8 relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm theo tên sản phẩm, mô tả..."
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="md:col-span-4 relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">Tất cả danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-[380px] animate-pulse">
                                <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
                                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                                <div className="mt-auto h-10 bg-slate-200 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Không tìm thấy sản phẩm</h3>
                        <p className="text-slate-500 mt-1">Thử thay đổi từ khóa hoặc bộ lọc danh mục</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Image Placeholder */}
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50/50">
                                            <Leaf className="w-12 h-12 text-emerald-200" />
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-emerald-700 shadow-sm backdrop-blur-sm">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {product.category?.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[2.5em]">
                                            {product.description || "Chưa có mô tả sản phẩm"}
                                        </p>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-sm text-slate-400 font-medium">Giá bán</p>
                                                <p className="text-xl font-bold text-emerald-600">
                                                    {formatCurrency(product.price)}
                                                </p>
                                            </div>
                                            {product.creditPrice && (
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400">Giá công nợ</p>
                                                    <p className="text-sm font-semibold text-slate-600">
                                                        {formatCurrency(product.creditPrice)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 active:scale-95"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
