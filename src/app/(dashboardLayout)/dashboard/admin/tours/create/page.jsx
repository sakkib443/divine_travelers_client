"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiArrowLeft, FiSave, FiMapPin, FiDollarSign,
    FiCalendar, FiUsers, FiClock, FiImage, FiFileText,
    FiPlus, FiTrash2, FiLoader, FiTag, FiHelpCircle,
    FiList, FiStar,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput, { ImageGalleryInput } from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = [
    { value: "adventure", label: "Adventure" },
    { value: "beach", label: "Beach" },
    { value: "city", label: "City Tour" },
    { value: "culture", label: "Culture" },
    { value: "hill", label: "Hill Station" },
    { value: "international", label: "International" },
    { value: "luxury", label: "Luxury" },
    { value: "religious", label: "Religious" },
    { value: "nature", label: "Nature" },
    { value: "historical", label: "Historical" },
];

const tourTypes = [
    { value: "Solo Tour", label: "Solo Tour" },
    { value: "Group Tour", label: "Group Tour" },
    { value: "Family Tour", label: "Family Tour" },
    { value: "Couple Tour", label: "Couple Tour" },
    { value: "Corporate Tour", label: "Corporate Tour" },
];

const statuses = [
    { value: "active", label: "Active" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

function TourForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEdit = !!editId;

    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        titleBn: "",
        image: "",
        gallery: [],
        destination: "",
        destinationBn: "",
        locationType: "Domestic",
        category: "adventure",
        tourType: "",
        tourTypeBn: "",
        duration: "",
        durationBn: "",
        departureDate: "",
        price: "",
        oldPrice: "",
        currency: "BDT",
        groupSize: "20",
        description: "",
        descriptionBn: "",
        longDescription: "",
        longDescriptionBn: "",
        status: "active",
        isActive: true,
        isFeatured: false,
        rating: "0",
        order: "0",
        metaTitle: "",
        metaDescription: "",
    });

    const [itinerary, setItinerary] = useState([]);
    const [includes, setIncludes] = useState("");
    const [includesBn, setIncludesBn] = useState("");
    const [excludes, setExcludes] = useState("");
    const [excludesBn, setExcludesBn] = useState("");
    const [tags, setTags] = useState("");
    const [faqs, setFaqs] = useState([]);

    // Fetch tour data for edit mode
    useEffect(() => {
        if (isEdit) {
            fetchTour();
        }
    }, [editId]);

    const fetchTour = async () => {
        setFetching(true);
        try {
            const res = await fetch(`${API_BASE}/api/tours/${editId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && data.data) {
                const t = data.data;
                setFormData({
                    title: t.title || "",
                    titleBn: t.titleBn || "",
                    image: t.image || "",
                    gallery: Array.isArray(t.gallery) ? t.gallery : [],
                    destination: t.destination || "",
                    destinationBn: t.destinationBn || "",
                    locationType: t.locationType || "Domestic",
                    category: t.category || "adventure",
                    tourType: t.tourType || "",
                    tourTypeBn: t.tourTypeBn || "",
                    duration: t.duration || "",
                    durationBn: t.durationBn || "",
                    departureDate: t.departureDate || "",
                    price: t.price?.toString() || "",
                    oldPrice: t.oldPrice?.toString() || "",
                    currency: t.currency || "BDT",
                    groupSize: t.groupSize?.toString() || "20",
                    description: t.description || "",
                    descriptionBn: t.descriptionBn || "",
                    longDescription: t.longDescription || "",
                    longDescriptionBn: t.longDescriptionBn || "",
                    status: t.status || "active",
                    isActive: t.isActive !== false,
                    isFeatured: t.isFeatured || false,
                    rating: t.rating?.toString() || "0",
                    order: t.order?.toString() || "0",
                    metaTitle: t.metaTitle || "",
                    metaDescription: t.metaDescription || "",
                });
                setItinerary(t.itinerary || []);
                setIncludes((t.includes || []).join("\n"));
                setIncludesBn((t.includesBn || []).join("\n"));
                setExcludes((t.excludes || []).join("\n"));
                setExcludesBn((t.excludesBn || []).join("\n"));
                setTags((t.tags || []).join(", "));
                setFaqs(t.faqs || []);
            } else {
                toast.error("Tour not found");
                router.push("/dashboard/admin/tours");
            }
        } catch {
            toast.error("Failed to fetch tour");
            router.push("/dashboard/admin/tours");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Itinerary helpers
    const addItineraryDay = () => {
        setItinerary(prev => [...prev, { day: prev.length + 1, title: "", titleBn: "", description: "", descriptionBn: "" }]);
    };

    const updateItinerary = (index, field, value) => {
        setItinerary(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const removeItineraryDay = (index) => {
        setItinerary(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 })));
    };

    // FAQ helpers
    const addFaq = () => {
        setFaqs(prev => [...prev, { question: "", questionBn: "", answer: "", answerBn: "" }]);
    };

    const updateFaq = (index, field, value) => {
        setFaqs(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const removeFaq = (index) => {
        setFaqs(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.destination || !formData.price || !formData.duration) {
            toast.error("Please fill required fields (Title, Destination, Price, Duration)");
            return;
        }

        setLoading(true);
        try {
            // Blank values are sent explicitly: PATCH treats an absent key as
            // "leave unchanged", so dropping them made clearing a field a silent no-op.
            // tourType/oldPrice clear with null — the Mongoose enum and number cast
            // both reject "".
            const payload = {
                ...formData,
                price: Number(formData.price) || 0,
                tourType: formData.tourType || null,
                oldPrice: formData.oldPrice === "" ? null : Number(formData.oldPrice),
                groupSize: formData.groupSize === "" ? 20 : Number(formData.groupSize),
                rating: Number(formData.rating) || 0,
                order: Number(formData.order) || 0,
                itinerary: itinerary.filter(item => item.title),
                includes: includes.split("\n").map(s => s.trim()).filter(Boolean),
                includesBn: includesBn.split("\n").map(s => s.trim()).filter(Boolean),
                excludes: excludes.split("\n").map(s => s.trim()).filter(Boolean),
                excludesBn: excludesBn.split("\n").map(s => s.trim()).filter(Boolean),
                tags: tags.split(",").map(s => s.trim()).filter(Boolean),
                faqs: faqs.filter(f => f.question && f.answer),
            };

            const url = isEdit ? `${API_BASE}/api/tours/${editId}` : `${API_BASE}/api/tours`;
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(isEdit ? "Tour updated successfully!" : "Tour created successfully!");
                router.push("/dashboard/admin/tours");
            } else {
                toast.error(data.message || "Failed to save tour");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-[13px] text-gray-700 dark:text-gray-200 focus:border-[#021E14] focus:ring-1 focus:ring-[#021E14]/10 outline-none transition-all placeholder-gray-400";

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-32">
                <FiLoader className="animate-spin" size={24} style={{ color: '#021E14' }} />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard/admin/tours" className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                    <FiArrowLeft size={16} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#021E14' }}>
                        {isEdit ? "Edit Tour Package" : "Create Tour Package"}
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        {isEdit ? `Editing: ${formData.title}` : "Add a new tour package to your catalog"}
                    </p>
                </div>
            </div>

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* ==== Section 1: Basic Info ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiMapPin size={14} style={{ color: '#E64266' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Package Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Package Title (English) *</label>
                            <input name="title" value={formData.title} onChange={handleChange} className={inputClass} placeholder="e.g. Majestic Switzerland: Alpine Adventure" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Package Title (Bengali)</label>
                            <input name="titleBn" value={formData.titleBn} onChange={handleChange} className={inputClass} placeholder="e.g. মনোরম সুইজারল্যান্ড: আল্পাইন অ্যাডভেঞ্চার" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Destination (English) *</label>
                            <input name="destination" value={formData.destination} onChange={handleChange} className={inputClass} placeholder="e.g. Switzerland" required />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Destination (Bengali)</label>
                            <input name="destinationBn" value={formData.destinationBn} onChange={handleChange} className={inputClass} placeholder="e.g. সুইজারল্যান্ড" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Duration (English) *</label>
                            <input name="duration" value={formData.duration} onChange={handleChange} className={inputClass} placeholder="e.g. 07 Days or 3 Days 2 Nights" required />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Duration (Bengali)</label>
                            <input name="durationBn" value={formData.durationBn} onChange={handleChange} className={inputClass} placeholder="e.g. ০৭ দিন" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Location Type *</label>
                            <select name="locationType" value={formData.locationType} onChange={handleChange} className={inputClass}>
                                <option value="Domestic">Domestic</option>
                                <option value="International">International</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Category *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Tour Type</label>
                            <select name="tourType" value={formData.tourType} onChange={handleChange} className={inputClass}>
                                <option value="">Select type</option>
                                {tourTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Tour Type (Bengali)</label>
                            <input name="tourTypeBn" value={formData.tourTypeBn} onChange={handleChange} className={inputClass} placeholder="গ্রুপ ট্যুর" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Departure Date</label>
                            <input name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                            <ImageInput
                                label="Cover Image"
                                value={formData.image}
                                onChange={(v) => setFormData(prev => ({ ...prev, image: v }))}
                                inputClass={inputClass}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <ImageGalleryInput
                                label="Gallery"
                                value={formData.gallery}
                                onChange={(v) => setFormData(prev => ({ ...prev, gallery: v }))}
                                hint="ট্যুরের ডিটেইল পেজে এই ছবিগুলো গ্যালারিতে দেখাবে"
                            />
                        </div>
                    </div>
                </div>

                {/* ==== Section 2: Pricing ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiDollarSign size={14} style={{ color: '#E64266' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Pricing & Group</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Price *</label>
                            <input name="price" type="number" value={formData.price} onChange={handleChange} className={inputClass} placeholder="0" required />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Old Price (Strike-through)</label>
                            <input name="oldPrice" type="number" value={formData.oldPrice} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Currency</label>
                            <select name="currency" value={formData.currency} onChange={handleChange} className={inputClass}>
                                <option value="BDT">BDT (৳)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Group Size</label>
                            <input name="groupSize" type="number" value={formData.groupSize} onChange={handleChange} className={inputClass} placeholder="20" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Rating (0-5)</label>
                            <input name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Display Order</label>
                            <input name="order" type="number" value={formData.order} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* ==== Section 3: Description ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiFileText size={14} style={{ color: '#E64266' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Description</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Short Description (English)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="Brief overview of the tour..." />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Short Description (Bengali)</label>
                                <textarea name="descriptionBn" value={formData.descriptionBn} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="ট্যুরের সংক্ষিপ্ত বিবরণ..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Long Description (English)</label>
                                <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Detailed description of the tour package..." />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Long Description (Bengali)</label>
                                <textarea name="longDescriptionBn" value={formData.longDescriptionBn} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="ট্যুর প্যাকেজের বিস্তারিত বিবরণ..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==== Section 4: Itinerary ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FiList size={14} style={{ color: '#E64266' }} />
                            <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Itinerary</h2>
                        </div>
                        <button type="button" onClick={addItineraryDay} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50">
                            <FiPlus size={12} /> Add Day
                        </button>
                    </div>
                    <div className="space-y-4">
                        {itinerary.length === 0 && (
                            <p className="text-[12px] text-gray-400 text-center py-4">No itinerary items yet. Click "Add Day" to start.</p>
                        )}
                        {itinerary.map((item, index) => (
                            <div key={index} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-4 relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#E64266' }}>
                                            {item.day}
                                        </span>
                                        <span className="text-[11px] font-bold uppercase text-gray-400">Day {item.day}</span>
                                    </span>
                                    <button type="button" onClick={() => removeItineraryDay(index)} className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input value={item.title} onChange={(e) => updateItinerary(index, 'title', e.target.value)} className={inputClass} placeholder="Day title (English)" />
                                    <input value={item.titleBn || ""} onChange={(e) => updateItinerary(index, 'titleBn', e.target.value)} className={inputClass} placeholder="Day title (Bengali)" />
                                    <input value={item.description || ""} onChange={(e) => updateItinerary(index, 'description', e.target.value)} className={inputClass} placeholder="Day description (English)" />
                                    <input value={item.descriptionBn || ""} onChange={(e) => updateItinerary(index, 'descriptionBn', e.target.value)} className={inputClass} placeholder="Day description (Bengali)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==== Section 5: Inclusions & Exclusions ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiTag size={14} style={{ color: '#E64266' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Inclusions, Exclusions & Tags</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">What's Included (English, one per line)</label>
                            <textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder={"Hotel accommodation\nBreakfast & Dinner\nSightseeing tours"} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">What's Included (Bengali, one per line)</label>
                            <textarea value={includesBn} onChange={(e) => setIncludesBn(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder={"হোটেল থাকা\nসকালের ও রাতের খাবার\nদর্শনীয় স্থান ভ্রমণ"} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">What's Excluded (English, one per line)</label>
                            <textarea value={excludes} onChange={(e) => setExcludes(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder={"Personal expenses\nTravel insurance\nLunch"} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">What's Excluded (Bengali, one per line)</label>
                            <textarea value={excludesBn} onChange={(e) => setExcludesBn(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder={"ব্যক্তিগত খরচ\nভ্রমণ বীমা\nদুপুরের খাবার"} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Tags (comma separated)</label>
                            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="Alpine, Nature, Luxury, Couple" />
                        </div>
                    </div>
                </div>

                {/* ==== Section 6: FAQs ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FiHelpCircle size={14} style={{ color: '#E64266' }} />
                            <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">FAQs</h2>
                        </div>
                        <button type="button" onClick={addFaq} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50">
                            <FiPlus size={12} /> Add FAQ
                        </button>
                    </div>
                    <div className="space-y-4">
                        {faqs.length === 0 && (
                            <p className="text-[12px] text-gray-400 text-center py-4">No FAQs yet. Click "Add FAQ" to start.</p>
                        )}
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-4 relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase text-gray-400">FAQ #{index + 1}</span>
                                    <button type="button" onClick={() => removeFaq(index)} className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input value={faq.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} className={inputClass} placeholder="Question (English)" />
                                    <input value={faq.questionBn || ""} onChange={(e) => updateFaq(index, 'questionBn', e.target.value)} className={inputClass} placeholder="Question (Bengali)" />
                                    <input value={faq.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} className={inputClass} placeholder="Answer (English)" />
                                    <input value={faq.answerBn || ""} onChange={(e) => updateFaq(index, 'answerBn', e.target.value)} className={inputClass} placeholder="Answer (Bengali)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==== Section 7: Status & SEO ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiStar size={14} style={{ color: '#E64266' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Status & SEO</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-5 pt-5">
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-600 cursor-pointer">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                                Active
                            </label>
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-600 cursor-pointer">
                                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                                Featured
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Meta Title (SEO)</label>
                            <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} className={inputClass} placeholder="SEO title" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Meta Description (SEO)</label>
                            <input name="metaDescription" value={formData.metaDescription} onChange={handleChange} className={inputClass} placeholder="SEO description" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link href="/dashboard/admin/tours" className="px-5 py-2.5 rounded-lg text-[12px] font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#021E14' }}>
                        {loading ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                        {loading ? "Saving..." : isEdit ? "Update Package" : "Create Package"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

export default function CreateTourPackage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-32">
                <FiLoader className="animate-spin" size={24} style={{ color: '#021E14' }} />
            </div>
        }>
            <TourForm />
        </Suspense>
    );
}
