"use client";

// ===================================================================
// Admin & Manager Dashboard — Photo & Video Gallery Manager
// Route: /dashboard/admin/gallery
// Fully dynamic editor for the 8-card mosaic gallery on the About page.
// Supports photo upload/delete and YouTube video integration with preview.
// ===================================================================

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSave,
    FiLoader,
    FiRefreshCw,
    FiExternalLink,
    FiImage,
    FiVideo,
    FiTrash2,
    FiPlay,
    FiCheck,
    FiInfo,
} from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";
import { extractYouTubeId } from "@/components/sections/AboutGallery";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Slot layout positions description
const SLOT_DESCRIPTIONS = [
    { slot: 1, column: "Left Column", position: "Top", height: "Standard", desc: "বামের কলামের উপরের কার্ড" },
    { slot: 2, column: "Left Column", position: "Middle", height: "Standard", desc: "বামের কলামের মাঝের কার্ড" },
    { slot: 3, column: "Left Column", position: "Bottom", height: "Standard", desc: "বামের কলামের নিচের কার্ড" },
    { slot: 4, column: "Center Column", position: "Top (Large)", height: "Tall / 400px", desc: "মাঝের কলামের উপরের বড় কার্ড" },
    { slot: 5, column: "Center Column", position: "Bottom (Large)", height: "Tall / 400px", desc: "মাঝের কলামের নিচের বড় কার্ড" },
    { slot: 6, column: "Right Column", position: "Top", height: "Standard", desc: "ডানের কলামের উপরের কার্ড" },
    { slot: 7, column: "Right Column", position: "Middle", height: "Standard", desc: "ডানের কলামের মাঝের কার্ড" },
    { slot: 8, column: "Right Column", position: "Bottom", height: "Standard / Taller", desc: "ডানের কলামের নিচের কার্ড" },
];

export default function GalleryAdminPage() {
    const token = useSelector(selectToken);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(1);
    const [previewVideoId, setPreviewVideoId] = useState(null);

    // Form state
    const [galleryData, setGalleryData] = useState({
        isActive: true,
        eyebrow: { en: "Photo & Video Gallery", bn: "ফটো ও ভিডিও গ্যালারি" },
        heading: { en: "Moments Captured Around The World", bn: "বিশ্বজুড়ে আমাদের স্মরণীয় মুহূর্তগুলো" },
        description: {
            en: "Explore our journey through captivating moments and real traveler experiences.",
            bn: "মনোমুগ্ধকর মুহূর্ত এবং ভ্রমণকারীদের বাস্তব অভিজ্ঞতার মধ্য দিয়ে আমাদের যাত্রা ঘুরে দেখুন।",
        },
        items: [],
    });

    // Fetch existing gallery data from database
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content/gallery`);
            const json = await res.json();
            if (json.success && json.data?.data) {
                const fetched = json.data.data;
                // Ensure 8 slots exist
                const itemsMap = {};
                (fetched.items || []).forEach((it) => {
                    if (it && it.slot) itemsMap[it.slot] = it;
                });

                const normalizedItems = SLOT_DESCRIPTIONS.map((s) => {
                    return (
                        itemsMap[s.slot] || {
                            slot: s.slot,
                            type: "image",
                            imageUrl: "",
                            youtubeUrl: "",
                            title: { en: "", bn: "" },
                        }
                    );
                });

                setGalleryData({
                    isActive: fetched.isActive !== false,
                    eyebrow: fetched.eyebrow || { en: "", bn: "" },
                    heading: fetched.heading || { en: "", bn: "" },
                    description: fetched.description || { en: "", bn: "" },
                    items: normalizedItems,
                });
            }
        } catch (err) {
            toast.error("গ্যালারির তথ্য লোড করতে সমস্যা হয়েছে");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Update item field in array
    const updateItem = (slotNum, field, value) => {
        setGalleryData((prev) => {
            const updatedItems = prev.items.map((it) => {
                if (it.slot === slotNum) {
                    return { ...it, [field]: value };
                }
                return it;
            });
            return { ...prev, items: updatedItems };
        });
    };

    // Save changes to database
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content/gallery`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(galleryData),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "সংরক্ষণ করতে সমস্যা হয়েছে");
            }
            toast.success("ফটো ও ভিডিও গ্যালারি সফলভাবে আপডেট হয়েছে!");
        } catch (err) {
            toast.error(err.message || "সংরক্ষণ ব্যর্থ হয়েছে");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="w-8 h-8 text-[#0F3C53] animate-spin" />
            </div>
        );
    }

    const currentItem = galleryData.items.find((it) => it.slot === selectedSlot) || {
        slot: selectedSlot,
        type: "image",
        imageUrl: "",
        youtubeUrl: "",
        title: { en: "", bn: "" },
    };

    const currentSlotMeta = SLOT_DESCRIPTIONS.find((s) => s.slot === selectedSlot) || SLOT_DESCRIPTIONS[0];
    const detectedYouTubeId = extractYouTubeId(currentItem.youtubeUrl);

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* ─── Top Header Bar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-gray-700 font-medium">Gallery</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        Photo & Video Gallery Manager
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        অ্যাবাউট পেজের ৮-কার্ড মোজাইক গ্যালারির ছবি, ইউটিউব ভিডিও এবং টেক্সট ডায়নামিকভাবে ম্যানেজ করুন।
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <a
                        href="/about"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FiExternalLink size={13} />
                        <span>ওয়েবসাইটে দেখুন</span>
                    </a>
                    <button
                        type="button"
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <FiRefreshCw size={13} />
                        <span>রিফ্রেশ</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0F3C53] hover:bg-[#154d68] disabled:bg-gray-300 rounded-lg shadow-sm transition cursor-pointer"
                    >
                        {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                        <span>{saving ? "সংরক্ষণ হচ্ছে..." : "Save Gallery"}</span>
                    </button>
                </div>
            </div>

            {/* ─── Section Visibility Toggle ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between gap-4 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">ওয়েবসাইটে গ্যালারি সেকশন প্রদর্শন করুন</span>
                        <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                galleryData.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                            }`}
                        >
                            {galleryData.isActive ? "Active" : "Hidden"}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        এটি বন্ধ করলে কন্টেন্ট না মুছেও অ্যাবাউট পেজে গ্যালারি লুকানো থাকবে।
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setGalleryData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-14 h-8 rounded-full transition-all flex items-center p-1 cursor-pointer shrink-0 ${
                        galleryData.isActive ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"
                    }`}
                >
                    <span className="w-6 h-6 rounded-full bg-white shadow-md" />
                </button>
            </div>

            {/* ─── Visual Layout Map (Exact 3-Column Mosaic) ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span>Interactive Layout Map</span>
                            <span className="text-xs font-normal text-gray-400">
                                (যেকোনো কার্ডে ক্লিক করে সরাসরি এডিট করুন)
                            </span>
                        </h2>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E64266]" /> Selected
                        </span>
                        <span className="flex items-center gap-1">
                            <FiVideo size={12} className="text-red-500" /> Video
                        </span>
                        <span className="flex items-center gap-1">
                            <FiImage size={12} className="text-blue-500" /> Photo
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-[6px] bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {/* Left Column (Slots 1, 2, 3) */}
                    <div className="flex flex-col gap-[6px]">
                        {[1, 2, 3].map((sNum) => {
                            const it = galleryData.items.find((x) => x.slot === sNum) || { slot: sNum };
                            const isSel = selectedSlot === sNum;
                            const isVid = it.type === "video" || Boolean(it.youtubeUrl);
                            const img = it.imageUrl || (isVid && it.youtubeUrl ? `https://img.youtube.com/vi/${extractYouTubeId(it.youtubeUrl)}/hqdefault.jpg` : "");

                            return (
                                <button
                                    key={sNum}
                                    type="button"
                                    onClick={() => setSelectedSlot(sNum)}
                                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left group ${
                                        isSel
                                            ? "border-[#E64266] ring-2 ring-[#E64266]/30 shadow-md"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {img ? (
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                             <FiImage size={16} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="absolute top-1.5 left-2 flex items-center gap-1">
                                        <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                                            #{sNum}
                                        </span>
                                        {isVid && (
                                            <span className="p-0.5 rounded bg-red-600 text-white">
                                                <FiVideo size={9} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 left-2 right-2 truncate text-white text-[10px] font-medium">
                                        {it.title?.bn || it.title?.en || `Card #${sNum}`}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Center Column (Slots 4, 5 — Tall) */}
                    <div className="flex flex-col gap-[6px]">
                        {[4, 5].map((sNum) => {
                            const it = galleryData.items.find((x) => x.slot === sNum) || { slot: sNum };
                            const isSel = selectedSlot === sNum;
                            const isVid = it.type === "video" || Boolean(it.youtubeUrl);
                            const img = it.imageUrl || (isVid && it.youtubeUrl ? `https://img.youtube.com/vi/${extractYouTubeId(it.youtubeUrl)}/hqdefault.jpg` : "");

                            return (
                                <button
                                    key={sNum}
                                    type="button"
                                    onClick={() => setSelectedSlot(sNum)}
                                    className={`relative h-[126px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left group ${
                                        isSel
                                            ? "border-[#E64266] ring-2 ring-[#E64266]/30 shadow-md"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {img ? (
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            <FiImage size={18} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="absolute top-1.5 left-2 flex items-center gap-1">
                                        <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                                            #{sNum} (Tall)
                                        </span>
                                        {isVid && (
                                            <span className="p-0.5 rounded bg-red-600 text-white">
                                                <FiVideo size={9} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 left-2 right-2 truncate text-white text-[10px] font-medium">
                                        {it.title?.bn || it.title?.en || `Card #${sNum}`}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column (Slots 6, 7, 8) */}
                    <div className="flex flex-col gap-[6px]">
                        {[6, 7, 8].map((sNum) => {
                            const it = galleryData.items.find((x) => x.slot === sNum) || { slot: sNum };
                            const isSel = selectedSlot === sNum;
                            const isVid = it.type === "video" || Boolean(it.youtubeUrl);
                            const img = it.imageUrl || (isVid && it.youtubeUrl ? `https://img.youtube.com/vi/${extractYouTubeId(it.youtubeUrl)}/hqdefault.jpg` : "");

                            return (
                                <button
                                    key={sNum}
                                    type="button"
                                    onClick={() => setSelectedSlot(sNum)}
                                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left group ${
                                        isSel
                                            ? "border-[#E64266] ring-2 ring-[#E64266]/30 shadow-md"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    {img ? (
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            <FiImage size={16} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="absolute top-1.5 left-2 flex items-center gap-1">
                                        <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                                            #{sNum}
                                        </span>
                                        {isVid && (
                                            <span className="p-0.5 rounded bg-red-600 text-white">
                                                <FiVideo size={9} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 left-2 right-2 truncate text-white text-[10px] font-medium">
                                        {it.title?.bn || it.title?.en || `Card #${sNum}`}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── Selected Card Detailed Editor ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-[#E64266] text-white text-xs font-black">
                                CARD #{selectedSlot}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">
                                {currentSlotMeta.column} — {currentSlotMeta.position}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {currentSlotMeta.desc} · সাইজ রিকমেন্ডেশন: {currentSlotMeta.height}
                        </p>
                    </div>

                    {/* Slot Quick Selector Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {SLOT_DESCRIPTIONS.map((s) => (
                            <button
                                key={s.slot}
                                type="button"
                                onClick={() => setSelectedSlot(s.slot)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    selectedSlot === s.slot
                                        ? "bg-[#0F3C53] text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {s.slot}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Type Selector */}
                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        কন্টেন্টের ধরন (Media Type)
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                        <button
                            type="button"
                            onClick={() => updateItem(selectedSlot, "type", "image")}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                                currentItem.type !== "video"
                                    ? "border-[#0F3C53] bg-[#0F3C53]/5 text-[#0F3C53]"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                        >
                            <FiImage size={16} />
                            <span>Photo (ছবি)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => updateItem(selectedSlot, "type", "video")}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                                currentItem.type === "video"
                                    ? "border-red-500 bg-red-50 text-red-600"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                        >
                            <FiVideo size={16} />
                            <span>YouTube Video (ভিডিও)</span>
                        </button>
                    </div>
                </div>

                {/* Media Input Form */}
                <div className="space-y-6">
                    {currentItem.type === "video" ? (
                        /* ─── Video Configuration ─── */
                        <div className="p-5 rounded-2xl bg-red-50/40 border border-red-100 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                    ইউটিউব ভিডিও লিংক (YouTube URL) *
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={currentItem.youtubeUrl || ""}
                                        onChange={(e) => updateItem(selectedSlot, "youtubeUrl", e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                                        className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-white"
                                    />
                                    {currentItem.youtubeUrl && (
                                        <button
                                            type="button"
                                            onClick={() => updateItem(selectedSlot, "youtubeUrl", "")}
                                            className="px-3 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                            title="মুছুন"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    যেকোনো স্ট্যান্ডার্ড YouTube, YouTube Shorts অথবা youtu.be লিংক দিন।
                                </p>
                            </div>

                            {/* YouTube Preview Box */}
                            {detectedYouTubeId ? (
                                <div className="p-4 rounded-xl bg-white border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative w-36 h-24 rounded-lg overflow-hidden bg-black shrink-0">
                                        <img
                                            src={`https://img.youtube.com/vi/${detectedYouTubeId}/hqdefault.jpg`}
                                            alt="Video preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <FiPlay className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                            <FiCheck size={14} /> ভিডিও শনাক্ত হয়েছে (ID: {detectedYouTubeId})
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-1">
                                            ওয়েবসাইটে কার্ডে ক্লিক করলে একটি সুন্দর ভিডিও পপআপে এটি প্লে হবে।
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewVideoId(detectedYouTubeId)}
                                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-black transition cursor-pointer"
                                        >
                                            <FiPlay size={11} /> টেস্ট প্লে দেখুন
                                        </button>
                                    </div>
                                </div>
                            ) : currentItem.youtubeUrl ? (
                                <p className="text-xs text-amber-600">
                                    সতর্কতা: ইউটিউব ভিডিও আইডি খুঁজে পাওয়া যায়নি, অনুগ্রহ করে সঠিক লিংক দিন।
                                </p>
                            ) : null}

                            {/* Optional Custom Cover for Video */}
                            <div className="pt-3 border-t border-red-100">
                                <ImageInput
                                    label="কাস্টম থাম্বনেইল / পোস্টার ছবি (ঐচ্ছিক)"
                                    value={currentItem.imageUrl}
                                    onChange={(url) => updateItem(selectedSlot, "imageUrl", url)}
                                    placeholder="খালি রাখলে ইউটিউবের নিজস্ব থাম্বনেইল ব্যবহৃত হবে"
                                    hint="যদি ইউটিউবের ডিফল্ট থাম্বনেইল না চান, তবে নিজস্ব ছবি আপলোড করতে পারেন"
                                />
                            </div>
                        </div>
                    ) : (
                        /* ─── Photo Configuration ─── */
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                    ছবি আপলোড বা লিংক (Photo Upload / URL) *
                                </label>
                                <ImageInput
                                    label=""
                                    value={currentItem.imageUrl}
                                    onChange={(url) => updateItem(selectedSlot, "imageUrl", url)}
                                    placeholder="ছবি আপলোড করতে বা লিংক বসাতে পারেন"
                                    hint="সরাসরি কম্পিউটার থেকে ছবি আপলোড করতে 'Upload' চাপুন"
                                />
                            </div>

                            {currentItem.imageUrl && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={currentItem.imageUrl}
                                            alt=""
                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">ছবি যুক্ত করা হয়েছে</p>
                                            <p className="text-[11px] text-gray-400 truncate max-w-xs">
                                                {currentItem.imageUrl}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateItem(selectedSlot, "imageUrl", "")}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                                    >
                                        <FiTrash2 size={12} /> মুছে ফেলুন
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bilingual Captions / Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                ক্যাপশন / শিরোনাম (English)
                            </label>
                            <input
                                type="text"
                                value={currentItem.title?.en || ""}
                                onChange={(e) =>
                                    updateItem(selectedSlot, "title", {
                                        ...(currentItem.title || {}),
                                        en: e.target.value,
                                    })
                                }
                                placeholder="e.g. Mountain Sunset Journey"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                ক্যাপশন / শিরোনাম (বাংলা)
                            </label>
                            <input
                                type="text"
                                value={currentItem.title?.bn || ""}
                                onChange={(e) =>
                                    updateItem(selectedSlot, "title", {
                                        ...(currentItem.title || {}),
                                        bn: e.target.value,
                                    })
                                }
                                placeholder="যেমন: পাহাড়চূড়ার রোমাঞ্চকর সূর্যাস্ত"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Section Header Text Editor ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                    Section Header Content (সেকশনের শিরোনাম ও টেক্সট)
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                    গ্যালারির উপরে প্রদর্শিত ছোট ট্যাগ, মূল হেডলাইন এবং বিবরণ কাস্টমাইজ করুন।
                </p>

                <div className="space-y-4">
                    {/* Eyebrow */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Eyebrow Tag (English)
                            </label>
                            <input
                                type="text"
                                value={galleryData.eyebrow?.en || ""}
                                onChange={(e) =>
                                    setGalleryData((prev) => ({
                                        ...prev,
                                        eyebrow: { ...prev.eyebrow, en: e.target.value },
                                    }))
                                }
                                placeholder="Photo & Video Gallery"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Eyebrow Tag (বাংলা)
                            </label>
                            <input
                                type="text"
                                value={galleryData.eyebrow?.bn || ""}
                                onChange={(e) =>
                                    setGalleryData((prev) => ({
                                        ...prev,
                                        eyebrow: { ...prev.eyebrow, bn: e.target.value },
                                    }))
                                }
                                placeholder="ফটো ও ভিডিও গ্যালারি"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] bg-white"
                            />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Main Heading (English)
                            </label>
                            <input
                                type="text"
                                value={galleryData.heading?.en || ""}
                                onChange={(e) =>
                                    setGalleryData((prev) => ({
                                        ...prev,
                                        heading: { ...prev.heading, en: e.target.value },
                                    }))
                                }
                                placeholder="Moments Captured Around The World"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Main Heading (বাংলা)
                            </label>
                            <input
                                type="text"
                                value={galleryData.heading?.bn || ""}
                                onChange={(e) =>
                                    setGalleryData((prev) => ({
                                        ...prev,
                                        heading: { ...prev.heading, bn: e.target.value },
                                    }))
                                }
                                placeholder="বিশ্বজুড়ে আমাদের স্মরণীয় মুহূর্তগুলো"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] bg-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Description (English)
                            </label>
                            <textarea
                                rows={3}
                                value={galleryData.description?.en || ""}
                                onChange={(e) =>
                                    setGalleryData((prev) => ({
                                        ...prev,
                                        description: { ...prev.description, en: e.target.value },
                                    }))
                                }
                                placeholder="Explore our journey through captivating moments..."
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] bg-white resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Description (বাংলা)
                            </label>
                            <textarea
                                rows={3}
                                value={galleryData.description?.bn || ""}
                                onChange={(e) =>
                                    setGalleryData((prev) => ({
                                        ...prev,
                                        description: { ...prev.description, bn: e.target.value },
                                    }))
                                }
                                placeholder="মনোমুগ্ধকর মুহূর্ত এবং ভ্রমণকারীদের বাস্তব অভিজ্ঞতার মধ্য দিয়ে..."
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] bg-white resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Bottom Sticky Save Bar ─── */}
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <FiInfo size={14} className="text-blue-500" />
                    <span>পরিবর্তন সম্পন্ন হলে &ldquo;Save Changes&rdquo; বাটনে ক্লিক করুন।</span>
                </p>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0F3C53] hover:bg-[#154d68] disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                    {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
                    <span>{saving ? "সংরক্ষণ হচ্ছে..." : "Save Changes"}</span>
                </button>
            </div>

            {/* Test Video Modal */}
            {previewVideoId && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setPreviewVideoId(null)}
                >
                    <div
                        className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-3 bg-gray-900 text-white text-xs font-bold">
                            <span>YouTube Video Preview</span>
                            <button
                                onClick={() => setPreviewVideoId(null)}
                                className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                        <div className="relative aspect-video">
                            <iframe
                                src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1`}
                                title="Preview"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
