"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiArrowLeft, FiSave, FiLoader, FiEye, FiEyeOff,
    FiShield,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function CreateUserContent() {
    const router = useRouter();
    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [f, setF] = useState({
        firstName: "", lastName: "", email: "", phone: "", password: "",
        status: "active", role: "admin",
    });
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!f.firstName.trim()) return toast.error("Name is required");
        if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("A valid email is required");
        if (!f.phone.trim()) return toast.error("Phone number is required");
        if (f.password.length < 6) return toast.error("Password must be at least 6 characters");

        const payload = {
            firstName: f.firstName.trim(),
            lastName: f.lastName.trim(),
            email: f.email.trim().toLowerCase(),
            phone: f.phone.trim(),
            password: f.password,
            status: f.status,
            role: f.role,
        };

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/users/admin/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || data.errorSources?.[0]?.message || "Failed to create");
            toast.success("Admin created!");
            router.push("/dashboard/admin/users");
        } catch (err) {
            toast.error(err.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const label = "text-[13px] font-bold text-gray-500 block mb-1.5";

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 max-w-3xl mx-auto">
                <button onClick={() => router.back()} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                    <FiArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <FiShield className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add Admin</h1>
                        <p className="text-sm text-gray-500">Create an admin account with full access to the platform</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={label}>First Name *</label>
                            <div className="relative">
                                <input value={f.firstName} onChange={(e) => set("firstName", e.target.value)} className="input" placeholder="First name" required />
                            </div>
                        </div>
                        <div>
                            <label className={label}>Last Name</label>
                            <input value={f.lastName} onChange={(e) => set("lastName", e.target.value)} className="input" placeholder="Last name" />
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={label}>Email Address *</label>
                            <div className="relative">
                                <input type="email" name="account-email" autoComplete="off" value={f.email} onChange={(e) => set("email", e.target.value)} className="input" placeholder="user@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className={label}>Phone Number *</label>
                            <div className="relative">
                                <input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} className="input" placeholder="01XXXXXXXXX" required />
                            </div>
                        </div>
                    </div>

                    {/* Password & Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={label}>Password *</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} name="account-new-password" autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} className="input pr-12" placeholder="Min 6 characters" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={label}>Role *</label>
                            <select value={f.role} onChange={(e) => set("role", e.target.value)} className="input appearance-none bg-white">
                                <option value="admin">Admin (Full Access)</option>
                                <option value="manager">Manager (Restricted Access)</option>
                            </select>
                        </div>
                    </div>

                                        {/* Status */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">Account Status</p>
                            <p className="text-sm text-gray-500">Active accounts can log in and use the platform</p>
                        </div>
                        <button type="button" onClick={() => set("status", f.status === "active" ? "blocked" : "active")}
                            className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${f.status === "active" ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"}`}>
                            <div className="w-6 h-6 bg-white rounded-full shadow" />
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 mt-6 max-w-3xl">
                    <Link href="/dashboard/admin/users" className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm text-center hover:bg-gray-50 transition">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition hover:opacity-90" style={{ background: "#E64266" }}>
                        {loading ? <FiLoader className="animate-spin" /> : <FiSave />} Create Admin
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function CreateUserPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
            <CreateUserContent />
        </Suspense>
    );
}
