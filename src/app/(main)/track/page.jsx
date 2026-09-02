"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    LuSearch, LuLoader, LuPackage, LuCircleCheck, LuCircleX, LuClock,
    LuTriangleAlert, LuMapPin, LuTicket, LuHouse, LuGraduationCap, LuMoon, LuCopy
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_META = {
    pending: { en: "Pending", bn: "অপেক্ষমাণ", color: "#f59e0b", icon: LuClock },
    processing: { en: "Processing", bn: "প্রসেসিং", color: "#3b82f6", icon: LuLoader },
    confirmed: { en: "Confirmed", bn: "নিশ্চিত", color: "#10b981", icon: LuCircleCheck },
    cancelled: { en: "Cancelled", bn: "বাতিল", color: "#6b7280", icon: LuCircleX },
    rejected: { en: "Rejected", bn: "প্রত্যাখ্যাত", color: "#ef4444", icon: LuCircleX },
};

const TYPE_META = {
    tour: { en: "Tour Booking", bn: "ট্যুর বুকিং", icon: LuMapPin, color: "#10b981" },
    hajj: { en: "Hajj / Umrah", bn: "হজ্জ / উমরাহ", icon: LuMoon, color: "#8b5cf6" },
};

export default function TrackPage() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bodyFont = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";

    const [ref, setRef] = useState("");
    const [contact, setContact] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);
        if (!ref.trim() || !contact.trim()) {
            setError(isBn ? "ট্র্যাকিং আইডি এবং ইমেইল/ফোন দিন" : "Please enter your tracking ID and email/phone");
            return;
        }
        setLoading(true);
        try {
            const url = `${API_BASE}/api/bookings/track?ref=${encodeURIComponent(ref.trim())}&contact=${encodeURIComponent(contact.trim())}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Not found");
            setResult(data.data);
        } catch (err) {
            setError(
                err.message === "Not found"
                    ? (isBn ? "এই তথ্য দিয়ে কোনো বুকিং পাওয়া যায়নি" : "No booking found with these details")
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    const t = (obj) => (isBn ? obj.bn : obj.en);

    return (
        <div className="min-h-screen bg-white">
            {/* ===== HERO + SEARCH ===== */}
            <section
                className="relative overflow-hidden border-b border-gray-100"
                style={{ background: "linear-gradient(180deg, #ffffff 0%, #f3f7fc 100%)" }}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0F3C53]/10 rounded-full blur-[140px] -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-[#E64266]/10 rounded-full blur-[120px] -ml-28 -mb-24" />
                </div>

                <div className="max-w-3xl mx-auto px-6 lg:px-12 relative z-10 py-14 lg:py-20 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0F3C53]/20 bg-[#0F3C53]/5 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#E64266] opacity-60 animate-ping" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E64266]" />
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3355] font-eyebrow" style={{ fontFamily: "Poppins, sans-serif" }}>
                                {isBn ? "লাইভ ট্র্যাকিং" : "Live Tracking"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] uppercase mb-4" style={{ fontFamily: headingFont, color: "#0f172a" }}>
                            {isBn ? "আপনার আবেদন " : "TRACK YOUR "}
                            <span style={{ color: "#E64266" }}>{isBn ? "ট্র্যাক করুন" : "APPLICATION"}</span>
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto mb-9" style={{ fontFamily: bodyFont }}>
                            {isBn
                                ? "আপনার ট্র্যাকিং আইডি ও বুকিংয়ে দেওয়া ইমেইল/ফোন দিয়ে ভিসা বা বুকিংয়ের বর্তমান অবস্থা দেখুন।"
                                : "Enter your tracking ID and the email/phone used at booking to see the live status of your booking."}
                        </p>

                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 md:p-6 shadow-xl shadow-slate-200/70 border border-gray-100 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                                        {isBn ? "ট্র্যাকিং আইডি" : "Tracking ID"}
                                    </label>
                                    <input
                                        value={ref}
                                        onChange={(e) => setRef(e.target.value)}
                                        placeholder="AV-1A2B3C4D"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:bg-white focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                                        {isBn ? "ইমেইল বা ফোন" : "Email or Phone"}
                                    </label>
                                    <input
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        placeholder={isBn ? "বুকিংয়ে দেওয়া ইমেইল/ফোন" : "Email/phone used at booking"}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:bg-white focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60"
                                style={{ fontFamily: "Poppins, sans-serif", background: "linear-gradient(135deg, #E64266 0%, #d67a20 100%)" }}
                            >
                                {loading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSearch className="w-4 h-4" />}
                                {loading ? (isBn ? "খুঁজছি..." : "Searching...") : (isBn ? "ট্র্যাক করুন" : "Track Now")}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* ===== RESULT ===== */}
            <section className="py-12 md:py-16">
                <div className="max-w-3xl mx-auto px-6 lg:px-12">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700"
                        >
                            <LuTriangleAlert className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm" style={{ fontFamily: bodyFont }}>{error}</span>
                        </motion.div>
                    )}

                    {result && <ResultCard result={result} isBn={isBn} bodyFont={bodyFont} headingFont={headingFont} t={t} />}

                    {!result && !error && (
                        <div className="text-center py-8 text-gray-400">
                            <LuPackage className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                            <p className="text-sm" style={{ fontFamily: bodyFont }}>
                                {isBn ? "উপরে তথ্য দিয়ে আপনার আবেদন ট্র্যাক করুন" : "Enter your details above to track your application"}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ResultCard({ result, isBn, bodyFont, headingFont, t }) {
    const type = TYPE_META[result.type] || { en: result.type, bn: result.type, icon: LuPackage, color: "#6b7280" };
    const status = STATUS_META[result.status] || STATUS_META.pending;
    const TypeIcon = type.icon;
    const StatusIcon = status.icon;

    // Build the timeline (oldest → newest). Fall back to current status if none.
    const history = (result.statusHistory && result.statusHistory.length > 0)
        ? result.statusHistory
        : [{ status: result.status, note: "", at: result.createdAt }];

    const copyId = () => {
        if (navigator?.clipboard) navigator.clipboard.writeText(result.trackingId);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${type.color}15` }}>
                            <TypeIcon className="w-6 h-6" style={{ color: type.color }} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest font-eyebrow" style={{ color: type.color, fontFamily: "Poppins, sans-serif" }}>
                                {t(type)}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 uppercase leading-tight" style={{ fontFamily: headingFont }}>
                                {result.serviceName}
                            </h3>
                        </div>
                    </div>
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: `${status.color}15`, color: status.color, fontFamily: bodyFont }}
                    >
                        <StatusIcon className={`w-3.5 h-3.5 ${result.status === "processing" ? "animate-spin" : ""}`} />
                        {t(status)}
                    </span>
                </div>

                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontFamily: "Poppins, sans-serif" }}>
                            {isBn ? "ট্র্যাকিং আইডি" : "Tracking ID"}
                        </p>
                        <button onClick={copyId} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#0F3C53] transition-colors" title="Copy">
                            {result.trackingId} <LuCopy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {result.createdAt && (
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontFamily: "Poppins, sans-serif" }}>
                                {isBn ? "আবেদনের তারিখ" : "Applied on"}
                            </p>
                            <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: bodyFont }}>
                                {new Date(result.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5" style={{ fontFamily: bodyFont }}>
                    {isBn ? "স্ট্যাটাস টাইমলাইন" : "Status Timeline"}
                </h4>
                <div className="relative pl-2">
                    {history.map((entry, i) => {
                        const meta = STATUS_META[entry.status] || STATUS_META.pending;
                        const isLast = i === history.length - 1;
                        const Icon = meta.icon;
                        return (
                            <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                                {/* connector line */}
                                {!isLast && <span className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-100" />}
                                {/* dot */}
                                <div
                                    className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${meta.color}15`, border: `2px solid ${meta.color}` }}
                                >
                                    <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                                </div>
                                <div className="pt-1">
                                    <p className="text-sm font-bold text-gray-800" style={{ fontFamily: bodyFont }}>
                                        {isBn ? meta.bn : meta.en}
                                    </p>
                                    {entry.note && (
                                        <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: bodyFont }}>{entry.note}</p>
                                    )}
                                    {entry.at && (
                                        <p className="text-[11px] text-gray-400 mt-1" style={{ fontFamily: bodyFont }}>
                                            {new Date(entry.at).toLocaleString(isBn ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
