"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Leaf, Mail, Lock, User, Phone, MapPin, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        phone: "",
        address: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (formData.password.length < 3) {
            setError("Mật khẩu phải có ít nhất 3 ký tự");
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Email không hợp lệ");
            return;
        }

        if (!formData.phone || formData.phone.length < 10) {
            setError("Số điện thoại phải có ít nhất 10 số");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/register", {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
            });

            if (response.data) {
                router.push("/login?registered=true");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Đăng ký thất bại. Email có thể đã được sử dụng."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-background">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex w-1/2 relative bg-emerald-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-black opacity-90 z-10" />
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-50"
                />

                <div className="relative z-20 flex flex-col justify-between p-12 text-white h-full">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                            <Leaf className="w-8 h-8 text-emerald-400" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Sáu Hiệp</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-5xl font-bold leading-tight">
                            Bắt đầu hành trình <br />
                            <span className="text-emerald-400">Canh tác thông minh</span>
                        </h1>
                        <p className="text-lg text-emerald-100/80 leading-relaxed">
                            Đăng ký tài khoản để nhận ưu đãi đặc biệt, theo dõi đơn hàng và cập nhật kiến thức nông nghiệp mới nhất.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-emerald-200/60">
                        <span>© 2024 Sáu Hiệp Store</span>
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        <span>Privacy Policy</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 my-auto">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Tạo tài khoản mới 🚀
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Nhập thông tin cá nhân để đăng ký thành viên.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="name">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="phone">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        placeholder="0912345678"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="address">
                                Địa chỉ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                    <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <textarea
                                    id="address"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                                    placeholder="Số nhà, đường, phường/xã..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="password">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        placeholder="Min 3 ký tự"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                                    Xác nhận <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground py-2.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Đăng ký ngay
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Đã có tài khoản?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                            >
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
