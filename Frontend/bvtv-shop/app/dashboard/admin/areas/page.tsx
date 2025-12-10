"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface Area {
    id: number;
    name: string;
    isActive: boolean;
}

export default function AreasAdminPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "ADMIN";

    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        isActive: true,
    });

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const response = await api.get("/areas");
            setAreas(response.data);
        } catch (error) {
            console.error("Lỗi khi tải khu vực:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                isActive: formData.isActive,
            };

            if (editingArea) {
                await api.put(`/areas/${editingArea.id}`, payload);
            } else {
                await api.post("/areas", payload);
            }

            setShowModal(false);
            resetForm();
            fetchAreas();
        } catch (error) {
            console.error("Lỗi khi lưu khu vực:", error);
            alert("Có lỗi xảy ra khi lưu khu vực");
        }
    };

    const handleEdit = (area: Area) => {
        setEditingArea(area);
        setFormData({
            name: area.name,
            isActive: area.isActive ?? true,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) {
            alert("Chỉ ADMIN mới có quyền xóa khu vực");
            return;
        }

        if (!confirm("Bạn có chắc muốn xóa khu vực này?")) return;

        try {
            await api.delete(`/areas/${id}`);
            fetchAreas();
        } catch (error) {
            console.error("Lỗi khi xóa khu vực:", error);
            alert("Có lỗi xảy ra khi xóa khu vực");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            isActive: true,
        });
        setEditingArea(null);
    };

    const filteredAreas = areas.filter((area) =>
        area.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Quản lý khu vực
                </h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    + Thêm khu vực
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm khu vực..."
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
                ) : filteredAreas.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Không tìm thấy khu vực nào
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Tên khu vực
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAreas.map((area) => (
                                    <tr
                                        key={area.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {area.id}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {area.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(area)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Sửa
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                area.id
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingArea ? "Sửa khu vực" : "Thêm khu vực"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Tên khu vực *
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
                                    placeholder="VD: Miền Bắc, Miền Nam, Miền Trung"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingArea ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
