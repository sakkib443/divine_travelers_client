"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { LuPlane, LuGlobe, LuShieldCheck, LuHeadphones } from "react-icons/lu";
import { setCredentials } from "@/redux/features/authSlice";
import { authService } from "@/services/api";
import Logo from "@/components/shared/Logo";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);

            if (response.success) {
                dispatch(setCredentials({
                    user: response.data.user,
                    token: response.data.tokens.accessToken,
                }));

                toast.success("Login successful!");

                router.push("/dashboard/admin");
            }
        } catch (error) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Left Side - Branding Panel */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #021E14 0%, #06342a 55%, #01150e 100%)' }}>
                {/* Soft brand glows for depth */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(239,140,44,0.13)' }} />
                <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full blur-[130px] pointer-events-none" style={{ background: 'rgba(53,144,207,0.10)' }} />
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Floating Elements */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-16 w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239,140,44,0.15)' }}
                >
                    <LuPlane size={24} style={{ color: '#E64266' }} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-44 left-12 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239,140,44,0.1)' }}
                >
                    <LuGlobe size={22} style={{ color: '#E64266' }} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-32 right-20 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239,140,44,0.12)' }}
                >
                    <LuShieldCheck size={20} style={{ color: '#E64266' }} />
                </motion.div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
                    {/* Logo */}
                    <Link href="/" className="mb-16 block">
                        <Logo dark className="h-16 w-auto" />
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl xl:text-5xl font-black uppercase tracking-tight mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>
                            Your Journey<br />
                            Starts <span style={{ color: '#E64266' }}>Here</span>
                        </h2>
                        <p className="text-sm font-normal leading-relaxed mb-10 max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Sign in to manage your bookings and website content.
                        </p>
                    </motion.div>

                    {/* Feature Cards */}
                    <div className="space-y-3">
                        {[
                            { icon: <LuPlane size={16} />, text: "Track bookings in real-time" },
                            { icon: <LuShieldCheck size={16} />, text: "Secure & verified processing" },
                            { icon: <LuHeadphones size={16} />, text: "24/7 dedicated support team" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <span style={{ color: '#E64266' }}>{item.icon}</span>
                                <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {[
                            { val: "15K+", label: "Happy Clients" },
                            { val: "98%", label: "Success Rate" },
                            { val: "50+", label: "Countries" },
                        ].map((s, i) => (
                            <div key={i}>
                                <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)', color: '#E64266' }}>{s.val}</p>
                                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-[#F8FAFC]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[400px]"
                >
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
                        <Logo className="h-14 w-auto" />
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#021E14' }}>
                            Welcome Back
                        </h1>
                        <p className="text-sm text-gray-500 font-normal">
                            Sign in with your admin account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800
                                        placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#E64266] focus:ring-2 focus:ring-[#E64266]/15 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-[11px] mt-1.5">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })}
                                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800
                                        placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#E64266] focus:ring-2 focus:ring-[#E64266]/15 transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-[11px] mt-1.5">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 accent-[#021E14]" />
                                <span className="text-[12px] text-gray-500">Remember me</span>
                            </label>
                            <Link href="/contact" className="text-[12px] font-semibold hover:underline" style={{ color: '#E64266' }}>
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #E64266 0%, #D97A1E 100%)' }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <FiArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-gray-400 mt-8">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
