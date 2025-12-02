"use client";

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        // Check if user is STAFF or ADMIN
        if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
            router.push("/dashboard");
        }
    }, [user, router]);

    if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <AdminSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
