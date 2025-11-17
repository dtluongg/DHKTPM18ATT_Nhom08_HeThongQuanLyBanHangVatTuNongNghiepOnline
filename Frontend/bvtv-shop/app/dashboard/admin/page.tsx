"use client";

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Trang quản trị
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Tổng sản phẩm
                            </p>
                            <p className="text-3xl font-bold text-gray-800">
                                --
                            </p>
                        </div>
                        <div className="text-4xl">📦</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Tổng đơn hàng
                            </p>
                            <p className="text-3xl font-bold text-gray-800">
                                --
                            </p>
                        </div>
                        <div className="text-4xl">🛒</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Tổng khách hàng
                            </p>
                            <p className="text-3xl font-bold text-gray-800">
                                --
                            </p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Hướng dẫn sử dụng
                </h2>
                <ul className="space-y-2 text-gray-600">
                    <li>
                        📦 <strong>Sản phẩm:</strong> Quản lý thông tin sản
                        phẩm, giá, tồn kho
                    </li>
                    <li>
                        📁 <strong>Danh mục:</strong> Quản lý danh mục sản phẩm
                    </li>
                    <li>
                        🎟️ <strong>Mã giảm giá:</strong> Tạo và quản lý mã giảm
                        giá
                    </li>
                    <li>
                        📍 <strong>Khu vực:</strong> Quản lý thông tin khu vực
                        giao hàng
                    </li>
                    <li>
                        👥 <strong>Khách hàng:</strong> Xem thông tin khách hàng
                    </li>
                    <li>
                        🛒 <strong>Đơn hàng:</strong> Xem và cập nhật trạng thái
                        đơn hàng
                    </li>
                </ul>
            </div>
        </div>
    );
}
