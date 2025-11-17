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
        isActive: true,
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                shortName: formData.shortName,
                brandName: formData.brandName,
                description: formData.description,
                categoryId: parseInt(formData.categoryId),
                price: parseFloat(formData.price),
                creditPrice: parseFloat(formData.creditPrice),
                vatRate: parseFloat(formData.vatRate),
                sku: formData.sku,
                barcode: formData.barcode,
                stock: parseInt(formData.stock),
                isActive: formData.isActive,
            };

            if (editingProduct) {
                await api.put(`/product-units/${editingProduct.id}`, payload);
            } else {
                await api.post("/product-units", payload);
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
            isActive: product.isActive ?? true,
        });
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
            isActive: true,
        });
        setEditingProduct(null);
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        Đang tải...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Không tìm thấy sản phẩm nào
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        SKU
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Tên sản phẩm
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Danh mục
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Giá
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Tồn kho
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            {product.sku}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">
                                                {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {product.shortName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.category?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.price?.toLocaleString()}đ
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.stock}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                    product.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {product.isActive
                                                    ? "Hoạt động"
                                                    : "Ngưng bán"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Xóa
                                            </button>
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

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            isActive: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                                <label
                                    htmlFor="isActive"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Đang hoạt động
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    {editingProduct ? "Cập nhật" : "Thêm mới"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
