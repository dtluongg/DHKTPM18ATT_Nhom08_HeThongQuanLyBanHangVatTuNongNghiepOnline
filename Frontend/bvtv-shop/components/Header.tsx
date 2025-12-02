"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart, User, Search, Menu, LogOut, Leaf } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const { user, logout } = useAuthStore();
    const { items } = useCartStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-emerald-900/95 backdrop-blur supports-[backdrop-filter]:bg-emerald-900/80 text-white shadow-lg">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        <Leaf className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Sáu Hiệp</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/product-units"
                        className="text-sm font-medium text-emerald-100 hover:text-white transition-colors"
                    >
                        Sản phẩm
                    </Link>
                    <Link
                        href="/order-lookup"
                        className="text-sm font-medium text-emerald-100 hover:text-white transition-colors"
                    >
                        Tra cứu đơn hàng
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search (Mobile hidden for now) */}
                    <button className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Cart */}
                    <Link href="/cart" className="relative p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors group">
                        <ShoppingCart className="w-5 h-5" />
                        {cartItemCount > 0 && (
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm group-hover:scale-110 transition-transform">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>

                    {/* User Menu */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold shadow-inner">
                                    {user.sortName?.charAt(0) || user.name?.charAt(0)}
                                </div>
                                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                                    {user.sortName}
                                </span>
                            </button>

                            {/* Dropdown */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                    <div className="py-1">
                                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600">
                                            <User className="w-4 h-4" />
                                            Tài khoản
                                        </Link>
                                        {(user.role === "STAFF" || user.role === "ADMIN") && (
                                            <Link href="/dashboard/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600">
                                                <Menu className="w-4 h-4" />
                                                Quản trị
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => logout()}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5"
                        >
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
