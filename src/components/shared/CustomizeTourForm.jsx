"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuMapPin,
    LuCalendar,
    LuUsers,
    LuDollarSign,
    LuCheck,
    LuLoader,
    LuArrowRight,
    LuCopy,
    LuX,
    LuSparkles,
    LuMessageSquare,
    LuGlobe,
    LuCompass,
    LuBriefcase,
    LuHeart,
    LuUser
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CATEGORY_OPTIONS = [
    { key: "adventure", en: "Adventure", bn: "অ্যাডভেঞ্চার" },
    { key: "beach", en: "Beach", bn: "সমুদ্র সৈকত" },
    { key: "city", en: "City Tour", bn: "সিটি ট্যুর" },
    { key: "nature", en: "Nature", bn: "প্রকৃতি" },
    { key: "culture", en: "Culture", bn: "সংস্কৃতি" },
    { key: "historical", en: "Historical", bn: "ঐতিহাসিক" },
    { key: "hill", en: "Hill Station", bn: "পাহাড়" },
    { key: "luxury", en: "Luxury", bn: "বিলাসবহুল" },
    { key: "corporate", en: "Corporate / Business", bn: "কর্পোরেট / বিজনেস" },
    { key: "religious", en: "Religious", bn: "ধর্মীয়" },
];

const GROUP_TYPES = [
    { key: "solo", en: "Solo / Single", bn: "একক / সিঙ্গেল", icon: LuUser },
    { key: "couple", en: "Couple", bn: "কাপল", icon: LuHeart },
    { key: "family", en: "Family", bn: "ফ্যামিলি", icon: LuUsers },
    { key: "corporate", en: "Corporate / Business", bn: "কর্পোরেট / বিজনেস", icon: LuBriefcase },
    { key: "group", en: "Friends / Group", bn: "ফ্রেন্ডস / গ্রুপ", icon: LuCompass },
];

export default function CustomizeTourForm({ tours = [], onCancel }) {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const fontFamily = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        locationType: "Domestic", // Domestic | International
        destination: "",
        selectedTourId: "",
        category: "adventure",
        customCategory: "",
        groupType: "family",
        departureDate: "",
        returnDate: "",
        persons: 2,
        budget: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [successBooking, setSuccessBooking] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // When selecting an existing tour package from system
    const handleTourSelect = (e) => {
        const tourId = e.target.value;
        if (!tourId) {
            setForm((prev) => ({
                ...prev,
                selectedTourId: "",
            }));
            return;
        }

        const selected = tours.find((t) => t._id === tourId);
        if (selected) {
            setForm((prev) => ({
                ...prev,
                selectedTourId: tourId,
                destination: selected.destination || prev.destination,
                locationType: selected.locationType || prev.locationType,
                budget: selected.price ? String(selected.price) : prev.budget,
                category: selected.category || prev.category,
            }));
        }
    };

    const selectedTourObj = tours.find((t) => t._id === form.selectedTourId);
    const resolvedCategory = form.category === "other"
        ? (form.customCategory.trim() || (isBn ? "অন্যান্য" : "Other"))
        : (CATEGORY_OPTIONS.find((c) => c.key === form.category)?.[isBn ? "bn" : "en"] || form.category);

    const resolvedGroupLabel = GROUP_TYPES.find((g) => g.key === form.groupType)?.[isBn ? "bn" : "en"] || form.groupType;

    // Validate required fields
    const validate = () => {
        if (!form.name.trim()) {
            toast.error(isBn ? "আপনার সম্পূর্ণ নাম লিখুন" : "Please enter your full name");
            return false;
        }
        if (!form.phone.trim()) {
            toast.error(isBn ? "মোবাইল বা হোয়াটসঅ্যাপ নম্বর আবশ্যক" : "Phone / WhatsApp number is required");
            return false;
        }
        if (!form.destination.trim()) {
            toast.error(isBn ? "গন্তব্য বা লোকেশন লিখুন" : "Destination / Location is required");
            return false;
        }
        if (!form.departureDate) {
            toast.error(isBn ? "যাত্রার তারিখ নির্বাচন করুন" : "Please select a departure date");
            return false;
        }
        if (!form.persons || Number(form.persons) < 1) {
            toast.error(isBn ? "যাত্রী সংখ্যা কমপক্ষে ১ হতে হবে" : "Total persons must be at least 1");
            return false;
        }
        return true;
    };

    // Build formatted message for WhatsApp
    const buildWhatsAppMessage = () => {
        const lines = [
            `*✨ ${isBn ? "নতুন কাস্টমাইজ ট্যুর বুকিং রিকোয়েস্ট" : "New Customized Tour Booking Request"}*`,
            `--------------------------`,
            `👤 *${isBn ? "নাম" : "Name"}:* ${form.name}`,
            `📱 *${isBn ? "মোবাইল/হোয়াটসঅ্যাপ" : "Phone/WhatsApp"}:* ${form.phone}`,
            form.email ? `✉️ *${isBn ? "ইমেইল" : "Email"}:* ${form.email}` : null,
            `📍 *${isBn ? "লোকেশন টাইপ" : "Location Type"}:* ${form.locationType === "Domestic" ? (isBn ? "ডোমেস্টিক" : "Domestic") : (isBn ? "ইন্টারন্যাশনাল" : "International")}`,
            `🗺️ *${isBn ? "গন্তব্য / লোকেশন" : "Destination"}:* ${form.destination}`,
            selectedTourObj ? `🏷️ *${isBn ? "রেফারেন্স প্যাকেজ" : "Reference Package"}:* ${selectedTourObj.title}` : null,
            `🎯 *${isBn ? "ক্যাটাগরি" : "Category"}:* ${resolvedCategory}`,
            `👥 *${isBn ? "ট্যুর টাইপ" : "Traveler Type"}:* ${resolvedGroupLabel}`,
            `📅 *${isBn ? "যাত্রার তারিখ" : "Departure Date"}:* ${form.departureDate}${form.returnDate ? ` ${isBn ? "থেকে" : "to"} ${form.returnDate}` : ""}`,
            `👨‍👩‍👧‍👦 *${isBn ? "মোট যাত্রী" : "Total Persons"}:* ${form.persons} ${isBn ? "জন" : "Persons"}`,
            form.budget ? `💰 *${isBn ? "আনুমানিক বাজেট" : "Estimated Budget"}:* ৳${Number(form.budget).toLocaleString()}` : null,
            form.notes ? `📝 *${isBn ? "বিশেষ চাহিদা/নোট" : "Special Requests"}:* ${form.notes}` : null,
            `--------------------------`,
            isBn ? `আমি এই কাস্টমাইজ ট্যুরটি সম্পর্কে বিস্তারিত জানতে ও বুকিং করতে আগ্রহী।` : `I would like to inquire and confirm this customized tour request.`,
        ].filter(Boolean);

        return lines.join("\n");
    };

    // 1. WhatsApp Action
    const handleWhatsAppSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const message = buildWhatsAppMessage();
        const url = buildWhatsAppUrl(settings.whatsappNumber, message);
        window.open(url, "_blank");
    };

    // 2. Direct API Confirmation Action
    const handleDirectSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const body = {
                type: "custom",
                serviceName: form.destination ? `Custom Tour: ${form.destination}` : "Customized Tour",
                serviceId: form.selectedTourId || undefined,
                name: form.name.trim(),
                email: form.email.trim() || undefined,
                phone: form.phone.trim(),
                amount: form.budget ? Number(form.budget) : 0,
                details: {
                    locationType: form.locationType,
                    destination: form.destination.trim(),
                    selectedPackage: selectedTourObj ? selectedTourObj.title : (isBn ? "কাস্টম / তালিকায় নেই" : "Custom / Not Listed"),
                    category: resolvedCategory,
                    groupType: resolvedGroupLabel,
                    departureDate: form.departureDate,
                    returnDate: form.returnDate || undefined,
                    travelDates: form.returnDate ? `${form.departureDate} to ${form.returnDate}` : form.departureDate,
                    persons: Number(form.persons) || 1,
                    budget: form.budget ? `৳${Number(form.budget).toLocaleString()}` : undefined,
                    notes: form.notes.trim() || undefined,
                    bookingMethod: "Online Custom Request",
                },
            };

            const res = await fetch(`${API_BASE}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data.message || (isBn ? "বুকিং সম্পন্ন করা যায়নি" : "Failed to place booking"));
            }

            const booking = data.data?.booking || data.data;
            setSuccessBooking(booking);
            toast.success(isBn ? "আপনার কাস্টমাইজ ট্যুর রিকোয়েস্ট সফলভাবে জমা হয়েছে!" : "Custom tour request submitted successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.message || (isBn ? "একটি সমস্যা হয়েছে" : "Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    const copyTrackingId = (id) => {
        navigator?.clipboard?.writeText(id);
        setCopied(true);
        toast.success(isBn ? "ট্র্যাকিং আইডি কপি করা হয়েছে" : "Tracking ID copied!");
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="w-full bg-white rounded-2xl border border-purple-100 shadow-xl overflow-hidden" style={{ fontFamily }}>
            {/* Top Purple Gradient Header */}
            <div className="relative bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] p-6 md:p-8 text-white overflow-hidden">
                <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-black/10 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest mb-2 font-eyebrow">
                            <LuSparkles size={13} className="text-yellow-300" />
                            {isBn ? "কাস্টমাইজ ট্যুর পরিকল্পনা" : "Custom Tour Planner"}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white" style={{ fontFamily: headingFont }}>
                            {isBn ? "আপনার মনের মতো ট্যুর কাস্টমাইজ করুন" : "Customize Your Dream Tour"}
                        </h2>
                        <p className="text-xs md:text-sm text-purple-100/90 max-w-2xl mt-1">
                            {isBn
                                ? "আপনার সুবিধা ও পছন্দ অনুযায়ী যেকোনো গন্তব্য, প্যাকেজ ও তারিখ নির্ধারণ করে বুকিং রিকোয়েস্ট পাঠান। আমাদের বিশেষজ্ঞ টিম দ্রুত যোগাযোগ করবে।"
                                : "Personalize your journey with your desired location, dates, traveler count, and budget. Our travel specialists will craft the perfect itinerary for you."}
                        </p>
                    </div>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-purple-900 text-xs font-bold transition shadow-sm self-start sm:self-center"
                        >
                            <LuX size={15} />
                            {isBn ? "ট্যুর তালিকায় ফিরুন" : "Back to Tours"}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8">
                {successBooking ? (
                    /* Success Confirmation State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-10 text-center max-w-lg mx-auto"
                    >
                        <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <LuCheck size={42} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: headingFont }}>
                            {isBn ? "রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!" : "Request Submitted Successfully!"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {isBn
                                ? "আপনার কাস্টমাইজ ট্যুর বুকিং রিকোয়েস্ট আমাদের সিস্টেমে যুক্ত হয়েছে। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।"
                                : "Your customized tour booking request is saved. Our travel coordinators will review it and get in touch with you shortly."}
                        </p>

                        {successBooking.trackingId && (
                            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 mb-6 text-left">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1 font-eyebrow">
                                    {isBn ? "আপনার ট্র্যাকিং রেফারেন্স আইডি" : "Your Tracking Reference ID"}
                                </span>
                                <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-purple-200">
                                    <span className="font-mono text-lg font-black text-gray-900 tracking-wider">
                                        {successBooking.trackingId}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyTrackingId(successBooking.trackingId)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition"
                                    >
                                        <LuCopy size={13} />
                                        {copied ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "কপি করুন" : "Copy")}
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-2">
                                    {isBn
                                        ? "এই ট্র্যাকিং আইডি দিয়ে ওয়েবসাইটের 'ট্র্যাক বুকিং' পেইজে যেকোনো সময় স্ট্যাটাস দেখতে পারবেন।"
                                        : "Use this ID to check your inquiry status at any time on our Track Booking page."}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/track"
                                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-purple-600/20"
                            >
                                {isBn ? "ট্র্যাক পেইজে যান" : "Track Booking"}
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setSuccessBooking(null);
                                    if (onCancel) onCancel();
                                }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider transition"
                            >
                                {isBn ? "ট্যুর তালিকা দেখুন" : "View All Tours"}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* The Custom Tour Form */
                    <form className="space-y-7">
                        {/* 1. Contact Information */}
                        <div>
                            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-gray-100">
                                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">1</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800" style={{ fontFamily: headingFont }}>
                                    {isBn ? "আপনার তথ্য" : "Contact Information"}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "সম্পূর্ণ নাম" : "Full Name"} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder={isBn ? "উদাঃ মোঃ রহিম আহমেদ" : "e.g. John Doe"}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "মোবাইল / হোয়াটসঅ্যাপ নম্বর" : "Phone / WhatsApp"} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+880 1XXXXXXXXX"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"} <span className="text-gray-400 font-normal">({isBn ? "অপশনাল" : "Optional"})</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="user@example.com"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Destination & Package */}
                        <div>
                            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-gray-100">
                                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800" style={{ fontFamily: headingFont }}>
                                    {isBn ? "গন্তব্য ও প্যাকেজ নির্বাচন" : "Destination & Package Selection"}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Location Type */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "লোকেশন টাইপ" : "Location Type"} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Domestic", "International"].map((type) => {
                                            const active = form.locationType === type;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setForm((p) => ({ ...p, locationType: type }))}
                                                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${active
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                                                    }`}
                                                >
                                                    <LuGlobe size={13} />
                                                    {type === "Domestic" ? (isBn ? "ডোমেস্টিক" : "Domestic") : (isBn ? "ইন্টারন্যাশনাল" : "International")}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Destination */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "গন্তব্য / লোকেশন" : "Destination / Location"} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <LuMapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="destination"
                                            value={form.destination}
                                            onChange={handleChange}
                                            placeholder={isBn ? "উদাঃ সাজেক ভ্যালি, কক্সবাজার, কাশ্মীর, থাইল্যান্ড..." : "e.g. Sajek Valley, Cox's Bazar, Kashmir..."}
                                            required
                                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Reference Existing Package */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "তালিকাভুক্ত প্যাকেজ (অপশনাল)" : "Select Package (Optional)"}
                                    </label>
                                    <select
                                        value={form.selectedTourId}
                                        onChange={handleTourSelect}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition bg-white"
                                    >
                                        <option value="">{isBn ? "-- কাস্টম / তালিকায় নেই --" : "-- Custom / Not Listed --"}</option>
                                        {tours.map((t) => (
                                            <option key={t._id} value={t._id}>
                                                {t.title} {t.price ? `(৳${Number(t.price).toLocaleString()})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Category & Traveler Type */}
                        <div>
                            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-gray-100">
                                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800" style={{ fontFamily: headingFont }}>
                                    {isBn ? "ক্যাটাগরি ও ট্যুরের ধরন" : "Category & Travel Style"}
                                </h3>
                            </div>

                            {/* Category selector chips */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 mb-2">
                                    {isBn ? "ট্যুর ক্যাটাগরি" : "Tour Category"} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORY_OPTIONS.map((cat) => {
                                        const active = form.category === cat.key;
                                        return (
                                            <button
                                                key={cat.key}
                                                type="button"
                                                onClick={() => setForm((p) => ({ ...p, category: cat.key }))}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${active
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                                                }`}
                                            >
                                                {isBn ? cat.bn : cat.en}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, category: "other" }))}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${form.category === "other"
                                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                            : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                                        }`}
                                    >
                                        {isBn ? "অন্যান্য / কাস্টম" : "Other / Custom"}
                                    </button>
                                </div>

                                {form.category === "other" && (
                                    <div className="mt-2.5 max-w-sm">
                                        <input
                                            type="text"
                                            name="customCategory"
                                            value={form.customCategory}
                                            onChange={handleChange}
                                            placeholder={isBn ? "আপনার ক্যাটাগরি লিখুন..." : "Enter custom category..."}
                                            className="w-full px-3 py-2 rounded-lg border border-purple-300 text-xs focus:ring-2 focus:ring-purple-400 outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Traveler / Group Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">
                                    {isBn ? "ট্যুর টাইপ / দলের ধরন" : "Traveler / Group Type"} <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                                    {GROUP_TYPES.map((grp) => {
                                        const active = form.groupType === grp.key;
                                        const Icon = grp.icon;
                                        return (
                                            <button
                                                key={grp.key}
                                                type="button"
                                                onClick={() => setForm((p) => ({ ...p, groupType: grp.key }))}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition ${active
                                                    ? "bg-purple-50/80 border-purple-500 text-purple-900 ring-2 ring-purple-500/20"
                                                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Icon size={16} className={active ? "text-purple-600" : "text-gray-400"} />
                                                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${active ? "border-purple-600 bg-purple-600" : "border-gray-300"}`}>
                                                        {active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold leading-tight">{isBn ? grp.bn : grp.en}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 4. Schedule, Travelers & Budget */}
                        <div>
                            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-gray-100">
                                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">4</span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800" style={{ fontFamily: headingFont }}>
                                    {isBn ? "তারিখ, যাত্রী সংখ্যা ও বাজেট" : "Dates, Travelers & Budget"}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "যাত্রার তারিখ" : "Departure Date"} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="departureDate"
                                            value={form.departureDate}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "ফেরার তারিখ" : "Return Date"} <span className="text-gray-400 font-normal">({isBn ? "অপশনাল" : "Optional"})</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="returnDate"
                                            min={form.departureDate || undefined}
                                            value={form.returnDate}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "মোট যাত্রী (জন)" : "Total Travelers"} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <LuUsers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            name="persons"
                                            min="1"
                                            max="100"
                                            value={form.persons}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                        {isBn ? "আনুমানিক বাজেট (টাকা)" : "Estimated Budget (BDT)"} <span className="text-gray-400 font-normal">({isBn ? "অপশনাল" : "Optional"})</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                                        <input
                                            type="number"
                                            name="budget"
                                            value={form.budget}
                                            onChange={handleChange}
                                            placeholder={isBn ? "যেমনঃ 25000" : "e.g. 25000"}
                                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Special Notes */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                {isBn ? "বিশেষ কোনো চাহিদা বা নোট" : "Special Requirements / Notes"} <span className="text-gray-400 font-normal">({isBn ? "অপশনাল" : "Optional"})</span>
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={form.notes}
                                onChange={handleChange}
                                placeholder={isBn ? "হোটেল পছন্দ, যানবাহন, খাওয়া-দাওয়া বা বিশেষ কোনো নির্দেশনা থাকলে এখানে লিখুন..." : "Any hotel preferences, transportation needs, food requirements, or other instructions..."}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-500 outline-none transition resize-none"
                            />
                        </div>

                        {/* 6. Dual Action Buttons */}
                        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3.5">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition"
                                >
                                    {isBn ? "বাতিল করুন" : "Cancel"}
                                </button>
                            )}

                            {/* WhatsApp Inquiry Button */}
                            <button
                                type="button"
                                onClick={handleWhatsAppSubmit}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
                            >
                                <FaWhatsapp size={16} />
                                {isBn ? "হোয়াটসঅ্যাপে বুকিং / ইনকোয়ারি" : "WhatsApp Inquiry / Book"}
                            </button>

                            {/* Confirm Booking Online Button */}
                            <button
                                type="button"
                                onClick={handleDirectSubmit}
                                disabled={loading}
                                className="w-full sm:w-auto px-7 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-lg shadow-purple-600/25"
                                style={{ backgroundColor: "#8B5CF6" }}
                            >
                                {loading ? (
                                    <>
                                        <LuLoader size={16} className="animate-spin" />
                                        {isBn ? "প্রসেসিং হচ্ছে..." : "Submitting..."}
                                    </>
                                ) : (
                                    <>
                                        <LuCheck size={16} strokeWidth={3} />
                                        {isBn ? "কনফার্ম বুকিং নাও" : "Confirm Booking Now"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
