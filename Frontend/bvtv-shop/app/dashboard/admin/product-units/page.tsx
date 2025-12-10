"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ProductUnit, Category } from "@/types";

export default function ProductUnitsAdminPage() {
    const [products, setProducts] = useState<ProductUnit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductUnit | null>(
        null
    );
    const [formData, setFormData] = useState({
        name: "",
        shortName: "",
        brandName: "",
        description: "",
        categoryId: "",
        price: "",
        creditPrice: "",
        vatRate: "",
        sku: "",
        barcode: "",
        stock: "",
        isSelling: true,
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/product-units");
            setProducts(response.data);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                alert("Chỉ chấp nhận file ảnh");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Kích thước file không được vượt quá 5MB");
                return;
            }
            setSelectedImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (productId: number) => {
        if (!selectedImage) return null;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", selectedImage);

            const response = await api.post(
                `/product-units/${productId}/upload-image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data.imageUrl;
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                shortName: formData.shortName,
                brandName: formData.brandName,
                description: formData.description,
                category: formData.categoryId
                    ? { id: parseInt(formData.categoryId) }
                    : null,
                price: parseFloat(formData.price),
                creditPrice: parseFloat(formData.creditPrice),
                vatRate: parseFloat(formData.vatRate),
                sku: formData.sku,
                barcode: formData.barcode,
                stock: parseInt(formData.stock),
                isSelling: formData.isSelling,
                isActive: true,
            };

            let savedProduct;
            if (editingProduct) {
                savedProduct = await api.put(
                    `/product-units/${editingProduct.id}`,
                    payload
                );
            } else {
                savedProduct = await api.post("/product-units", payload);
            }

            // Upload ảnh nếu có
            if (selectedImage && savedProduct.data) {
                await uploadImage(savedProduct.data.id);
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert("Có lỗi xảy ra khi lưu sản phẩm");
        }
    };

    const handleEdit = (product: ProductUnit) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            shortName: product.shortName || "",
            brandName: product.brandName || "",
            description: product.description || "",
            categoryId: product.category?.id?.toString() || "",
            price: product.price?.toString() || "",
            creditPrice: product.creditPrice?.toString() || "",
            vatRate: product.vatRate?.toString() || "",
            sku: product.sku || "",
            barcode: product.barcode || "",
            stock: product.stock?.toString() || "",
            isSelling: product.isSelling ?? true,
        });
        // Set image preview nếu có
        if (product.imageUrl) {
            setImagePreview(product.imageUrl);
        }
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

        try {
            await api.delete(`/product-units/${id}`);
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            shortName: "",
            brandName: "",
            description: "",
            categoryId: "",
            price: "",
            creditPrice: "",
            vatRate: "",
            sku: "",
            barcode: "",
            stock: "",
            isSelling: true,
        });
        setEditingProduct(null);
        setSelectedImage(null);
        setImagePreview("");
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Quản lý sản phẩm
                </h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    + Thêm sản phẩm
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, SKU, barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p className="text-lg font-medium text-gray-900 mb-1">
                            Không tìm thấy sản phẩm nào
                        </p>
                        <p className="text-sm">
                            Thử thay đổi từ khóa tìm kiếm hoặc thêm sản phẩm mới
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        SKU / Barcode
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Danh mục
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Giá bán
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Tồn kho
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {product.sku}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                {product.barcode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={
                                                                product.imageUrl
                                                            }
                                                            alt=""
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <span className="text-xl">
                                                            📦
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div
                                                        className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]"
                                                        title={product.name}
                                                    >
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.shortName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {product.category?.name ||
                                                    "Chưa phân loại"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-emerald-600">
                                                {product.price?.toLocaleString()}
                                                đ
                                            </div>
                                            {product.creditPrice && (
                                                <div className="text-xs text-gray-400">
                                                    Công nợ:{" "}
                                                    {product.creditPrice.toLocaleString()}
                                                    đ
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className={`text-sm font-medium ${
                                                    (product.stock || 0) < 10
                                                        ? "text-red-600"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {product.stock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.isSelling
                                                        ? "bg-green-50 text-green-700 border border-green-100"
                                                        : "bg-red-50 text-red-700 border border-red-100"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        product.isSelling
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                    }`}
                                                ></span>
                                                {product.isSelling
                                                    ? "Đang kinh doanh"
                                                    : "Ngừng kinh doanh"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(product)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {editingProduct
                                ? "Sửa sản phẩm"
                                : "Thêm sản phẩm mới"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên sản phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên ngắn
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.shortName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                shortName: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thương hiệu
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brandName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                brandName: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                categoryId: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giá bán *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giá công nợ
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.creditPrice}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                creditPrice: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        VAT (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.vatRate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                vatRate: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tồn kho
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                stock: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                sku: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barcode
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                barcode: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            {/* Upload ảnh */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hình ảnh sản phẩm
                                </label>
                                <div className="flex items-start gap-4">
                                    {/* Preview ảnh */}
                                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <svg
                                                    className="w-12 h-12 mx-auto mb-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <p className="text-xs">
                                                    Chưa có ảnh
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload button */}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                                        >
                                            📸 Chọn ảnh
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Chấp nhận: JPG, PNG, GIF, WEBP
                                            <br />
                                            Kích thước tối đa: 5MB
                                        </p>
                                        {selectedImage && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ✓ Đã chọn: {selectedImage.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isSelling"
                                    checked={formData.isSelling}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            isSelling: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                                <label
                                    htmlFor="isSelling"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Đang kinh doanh
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Đang upload...
                                        </>
                                    ) : editingProduct ? (
                                        "Cập nhật"
                                    ) : (
                                        "Thêm mới"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
