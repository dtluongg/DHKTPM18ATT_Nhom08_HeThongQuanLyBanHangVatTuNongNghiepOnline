"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Leaf, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            router.push("/product-units");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."
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
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-50"
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
                            Đồng hành cùng <br />
                            <span className="text-emerald-400">Nông nghiệp Việt</span>
                        </h1>
                        <p className="text-lg text-emerald-100/80 leading-relaxed">
                            Cung cấp vật tư nông nghiệp chất lượng cao, giải pháp canh tác bền vững và hiệu quả cho bà con nông dân.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-emerald-200/60">
                        <span>© 2024 Sáu Hiệp Store</span>
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        <span>Privacy Policy</span>
                        <div className="h-1 w-1 rounded-full bg-emerald-500" />
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Chào mừng trở lại! 👋
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Nhập thông tin đăng nhập để truy cập hệ thống quản lý.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground" htmlFor="email">
                                    Email
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
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground" htmlFor="password">
                                        Mật khẩu
                                    </label>
                                    <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                        Quên mật khẩu?
                                    </a>
                                </div>
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
                                        placeholder="••••••••"
                                    />
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
                                        Đăng nhập
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Hoặc
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Chưa có tài khoản?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                        {/* Demo Credentials */}
                        <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm">
                            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                Tài khoản Demo
                            </p>
                            <div className="space-y-2 text-xs text-muted-foreground font-mono">
                                <div className="flex items-center justify-between p-2 rounded bg-background border border-border/50">
                                    <span>Admin</span>
                                    <span className="text-foreground">admin@sauhiep.vn / 123</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-background border border-border/50">
                                    <span>Staff</span>
                                    <span className="text-foreground">nhanvien@sauhiep.vn / 123</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-background border border-border/50">
                                    <span>Customer</span>
                                    <span className="text-foreground">khachhang_demo@sauhiep.vn / 123</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
