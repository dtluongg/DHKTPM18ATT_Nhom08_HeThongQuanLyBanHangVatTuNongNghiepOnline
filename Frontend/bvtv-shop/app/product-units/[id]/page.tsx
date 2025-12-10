"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { ProductUnit } from "@/types";
import { useCartStore } from "@/store/cart-store";
import Header from "@/components/Header";
import {
    ArrowLeft,
    ShoppingCart,
    Tag,
    Leaf,
    Package,
    Barcode,
    Info,
} from "lucide-react";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id;
    const [product, setProduct] = useState<ProductUnit | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();
    const [notify, setNotify] = useState<{ text: string } | null>(null);
    const Toast = dynamic(() => import("@/components/Toast"), { ssr: false });

    useEffect(() => {
        if (productId) {
            fetchProductDetail();
        }
    }, [productId]);

    const fetchProductDetail = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/product-units/${productId}`);
            setProduct(response.data);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        const res = addItem(product, quantity);
        if (res.action === "added") {
            setNotify({
                text: `Đã thêm ${quantity} "${product.name}" vào giỏ hàng`,
            });
        } else {
            setNotify({
                text: `Cập nhật số lượng "${product.name}": ${res.quantity}`,
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () =>
        setQuantity((prev) => Math.max(1, prev - 1));

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-32 mb-6" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="aspect-square bg-slate-200 rounded-2xl" />
                            <div className="space-y-4">
                                <div className="h-10 bg-slate-200 rounded w-3/4" />
                                <div className="h-6 bg-slate-200 rounded w-1/4" />
                                <div className="h-24 bg-slate-200 rounded" />
                                <div className="h-12 bg-slate-200 rounded" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Không tìm thấy sản phẩm
                        </h2>
                        <p className="text-slate-500 mb-6">
                            Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa
                        </p>
                        <button
                            onClick={() => router.push("/product-units")}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại trang sản phẩm
                        </button>
                    </div>
                </main>
            </div>
        );
    }

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

                {/* Back Button */}
                <button
                    onClick={() => router.push("/product-units")}
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Quay lại</span>
                </button>

                {/* Product Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="aspect-square bg-slate-100 relative">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-50/50">
                                    <Leaf className="w-24 h-24 text-emerald-200" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Category Badge */}
                        {product.category && (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                                <Tag className="w-4 h-4 mr-1.5" />
                                {product.category.name}
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Short Name / Brand */}
                        {(product.shortName || product.brandName) && (
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                {product.shortName && (
                                    <span className="inline-flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        {product.shortName}
                                    </span>
                                )}
                                {product.brandName && (
                                    <span className="font-medium">
                                        {product.brandName}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                        Mô tả sản phẩm
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {product.description ||
                                            "Chưa có mô tả chi tiết cho sản phẩm này"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-3">
                            {product.sku && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium text-slate-900">
                                        SKU:
                                    </span>
                                    <span>{product.sku}</span>
                                </div>
                            )}
                            {product.barcode && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Barcode className="w-4 h-4" />
                                    <span className="font-medium text-slate-900">
                                        Mã vạch:
                                    </span>
                                    <span>{product.barcode}</span>
                                </div>
                            )}
                            {product.vatRate !== undefined && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium text-slate-900">
                                        VAT:
                                    </span>
                                    <span>{product.vatRate}%</span>
                                </div>
                            )}
                        </div>

                        {/* Pricing */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">
                                        Giá bán
                                    </p>
                                    <p className="text-3xl font-bold text-emerald-600">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                {product.creditPrice && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-sm text-slate-500 font-medium mb-1">
                                            Giá công nợ
                                        </p>
                                        <p className="text-xl font-semibold text-slate-700">
                                            {formatCurrency(
                                                product.creditPrice
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700">
                                Số lượng:
                            </span>
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={decrementQuantity}
                                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                            )
                                        )
                                    }
                                    className="w-16 text-center py-2 border-x border-slate-300 focus:outline-none"
                                    min="1"
                                />
                                <button
                                    onClick={incrementQuantity}
                                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Thêm vào giỏ hàng
                        </button>

                        {/* Status Badge */}
                        {product.isSelling ? (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                ✓ Đang kinh doanh
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                Ngừng kinh doanh
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
