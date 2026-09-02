"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuSearch,
    LuClock,
    LuMapPin,
    LuStar,
    LuFilter,
    LuChevronDown,
    LuLayoutGrid,
    LuList,
    LuCalendar,
    LuUsers,
    LuArrowRight,
    LuHeart,
    LuEye,
    LuCompass,
    LuCheck,
    LuLoader
} from "react-icons/lu";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Hero background slider images (preview)
const HERO_SLIDES = [
    "https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const tourCategories = [
    { en: "All Tours", bn: "সব ট্যুর", key: "all" },
    { en: "Adventure", bn: "অ্যাডভেঞ্চার", key: "adventure" },
    { en: "City Tour", bn: "সিটি ট্যুর", key: "city" },
    { en: "Beach", bn: "সমুদ্র সৈকত", key: "beach" },
    { en: "Nature", bn: "প্রকৃতি", key: "nature" },
    { en: "Culture", bn: "সংস্কৃতি", key: "culture" },
    { en: "Historical", bn: "ইতিহাস", key: "historical" },
    { en: "International", bn: "আন্তর্জাতিক", key: "international" },
    { en: "Luxury", bn: "বিলাসবহুল", key: "luxury" },
    { en: "Hill Station", bn: "পাহাড়", key: "hill" },
    { en: "Religious", bn: "ধর্মীয়", key: "religious" },
];

const locationTypes = [
    { en: "All Tours", bn: "সব ট্যুর", key: "all" },
    { en: "Domestic", bn: "ডোমেস্টিক", key: "Domestic" },
    { en: "International", bn: "ইন্টারন্যাশনাল", key: "International" },
];

const tourTypes = [
    { en: "All Types", bn: "সব ধরন", key: "all" },
    { en: "Solo Tour", bn: "একক ট্যুর", key: "Solo Tour" },
    { en: "Group Tour", bn: "গ্রুপ ট্যুর", key: "Group Tour" },
    { en: "Family Tour", bn: "ফ্যামিলি ট্যুর", key: "Family Tour" },
    { en: "Couple Tour", bn: "কাপল ট্যুর", key: "Couple Tour" },
];

function TourContent() {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === 'bn';
    const fontFamily = isBn ? 'Hind Siliguri, sans-serif' : 'Poppins, sans-serif';
    const headingFont = isBn ? 'Hind Siliguri, sans-serif' : 'var(--font-heading)';

    const searchParams = useSearchParams();
    const initialDestination = searchParams.get("destination") || "";
    const initialCategory = searchParams.get("category") || "all";
    const initialDate = searchParams.get("date") || "";

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialDestination);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState(200000);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedLocationType, setSelectedLocationType] = useState("all");
    const [travelDate, setTravelDate] = useState(initialDate);
    const [viewMode, setViewMode] = useState("grid");
    const [sortBy, setSortBy] = useState("featured");
    const [showFilters, setShowFilters] = useState(false);
    const [heroSlide, setHeroSlide] = useState(0);

    // Auto-rotate hero slider
    useEffect(() => {
        const id = setInterval(() => setHeroSlide((s) => (s + 1) % HERO_SLIDES.length), 4000);
        return () => clearInterval(id);
    }, []);

    // Fetch tours from API
    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/tours/active`);
                const data = await res.json();
                if (data.success && data.data) {
                    setTours(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch tours:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    const filteredTours = useMemo(() => {
        const result = tours.filter(tour => {
            const matchesSearch =
                tour.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tour.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tour.titleBn && tour.titleBn.includes(searchQuery)) ||
                (tour.destinationBn && tour.destinationBn.includes(searchQuery));

            const matchesCategory = selectedCategory === "all" || tour.category === selectedCategory;
            const matchesLocation = selectedLocationType === "all" || tour.locationType === selectedLocationType;
            const matchesPrice = (tour.price || 0) <= priceRange;
            const matchesType = selectedType === "all" || tour.tourType === selectedType;

            return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesType;
        });

        if (sortBy === "price-asc") {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "price-desc") {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        return result;
    }, [tours, searchQuery, selectedCategory, selectedLocationType, priceRange, selectedType, sortBy]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setSelectedLocationType("all");
        setPriceRange(200000);
        setSelectedType("all");
        setTravelDate("");
    };

    const getCurrencySymbol = (currency) => {
        return currency === 'USD' ? '$' : '৳';
    };

    const handleNewsletter = (e) => {
        e.preventDefault();
        toast(isBn
            ? 'নিউজলেটার সাবস্ক্রিপশন শীঘ্রই আসছে। যোগাযোগ করতে আমাদের সাথে কথা বলুন।'
            : 'Newsletter signup is coming soon. Please contact us to get in touch.');
    };



    return (
        <>
        <div className="bg-[#F8FAFC] min-h-screen text-[#021E14]" style={{ fontFamily }}>
            {/* 1. Hero Section */}
            <section className="relative py-10 md:py-14 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {HERO_SLIDES.map((src, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                            style={{ backgroundImage: `url('${src}')`, opacity: heroSlide === i ? 1 : 0 }}
                        />
                    ))}
                    <div className="absolute inset-0 bg-[#021E14]/40" />
                </div>

                <div className="relative z-10 max-w-4xl w-full px-4 text-center flex flex-col items-center">
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 font-eyebrow"
                        style={{ color: 'rgba(255,255,255,0.7)', fontFamily }}
                    >
                        {isBn ? 'আশ্চর্যজনক জায়গা আবিষ্কার করুন' : 'Discover Amazing Places'}
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4"
                        style={{ fontFamily: headingFont, color: '#FFFFFF' }}
                    >
                        {isBn ? 'বিশ্ব ' : 'Explore The '}<span style={{ color: '#E64266' }}>{isBn ? 'ঘুরে দেখুন' : 'World'}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-sm font-normal mb-8 max-w-md"
                        style={{ color: 'rgba(255,255,255,0.6)', fontFamily }}
                    >
                        {isBn ? 'অবিস্মরণীয় অভিজ্ঞতার জন্য হস্তশিল্পে তৈরি ট্যুর প্যাকেজ।' : 'Handcrafted tour packages designed for unforgettable experiences.'}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="w-full max-w-xl relative group mx-auto"
                    >
                        <LuSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10" size={18} />
                        <input
                            type="text"
                            placeholder={isBn ? "আপনার পরবর্তী গন্তব্য খুঁজুন..." : "Find your next destination..."}
                            className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-md rounded-2xl text-sm font-normal shadow-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            style={{ fontFamily }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </div>
            </section>

            {/* 2. Main Body Layout */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700 shadow-sm"
                        style={{ fontFamily }}
                    >
                        <LuFilter size={16} />
                        {showFilters ? (isBn ? 'ফিল্টার লুকান' : 'Hide Filters') : (isBn ? 'ফিল্টার দেখান' : 'Show Filters')}
                        <LuChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

                    {/* LEFT SIDEBAR */}
                    <aside className={`w-full lg:w-[300px] flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="lg:sticky lg:top-32 space-y-5">
                            <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden">
                                {/* Sidebar Header */}
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-[#021E14] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: headingFont }}>
                                        <LuFilter size={16} style={{ color: '#E64266' }} /> {isBn ? 'ফিল্টার' : 'Filters'}
                                    </h3>
                                    <button
                                        onClick={resetFilters}
                                        className="text-[10px] font-semibold uppercase tracking-wider hover:underline"
                                        style={{ color: '#0F3C53', fontFamily }}
                                    >
                                        {isBn ? 'সব রিসেট' : 'Reset All'}
                                    </button>
                                </div>

                                {/* Location Type */}
                                <div className="px-5 py-5 border-b border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3" style={{ fontFamily }}>{isBn ? 'লোকেশন' : 'Location'}</h4>
                                    <div className="space-y-0.5">
                                        {locationTypes.map(loc => (
                                            <button
                                                key={loc.key}
                                                onClick={() => setSelectedLocationType(loc.key)}
                                                className={`w-full text-left py-2 px-1 transition-all text-[13px] flex items-center gap-3 ${selectedLocationType === loc.key
                                                    ? "text-[#021E14] font-semibold"
                                                    : "text-gray-600 hover:text-gray-900 font-normal"
                                                    }`}
                                                style={{ fontFamily }}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selectedLocationType === loc.key ? 'bg-[#E64266] border-[#E64266]' : 'border-gray-300 bg-white'}`}>
                                                    {selectedLocationType === loc.key && <LuCheck size={12} className="text-white" />}
                                                </div>
                                                {isBn ? loc.bn : loc.en}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tour Category */}
                                <div className="px-5 py-5 border-b border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3" style={{ fontFamily }}>{isBn ? 'ক্যাটেগরি' : 'Category'}</h4>
                                    <div className="space-y-0.5">
                                        {tourCategories.map(cat => (
                                            <button
                                                key={cat.key}
                                                onClick={() => setSelectedCategory(cat.key)}
                                                className={`w-full text-left px-3 py-2 rounded transition-all text-[13px] flex items-center justify-between ${selectedCategory === cat.key
                                                    ? "bg-gray-100 text-[#021E14] font-semibold"
                                                    : "text-gray-600 hover:bg-gray-50 font-normal"
                                                    }`}
                                                style={{ fontFamily }}
                                            >
                                                {isBn ? cat.bn : cat.en}
                                                {selectedCategory === cat.key && (
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E64266' }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="px-5 py-5 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]" style={{ fontFamily }}>{isBn ? 'মূল্য সীমা' : 'Price Range'}</h4>
                                        <span className="text-[12px] font-bold" style={{ color: '#021E14' }}>৳{priceRange.toLocaleString()}</span>
                                    </div>
                                    <div className="relative w-full h-1 bg-gray-100 rounded-full">
                                        <input
                                            type="range"
                                            min="1000"
                                            max="200000"
                                            step="1000"
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                            className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-20
                                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#021E14] [&::-webkit-slider-thumb]:border-2
                                            [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                                        />
                                        <div
                                            className="absolute h-full rounded-full transition-all"
                                            style={{ width: `${((priceRange - 1000) / 199000) * 100}%`, backgroundColor: '#021E14' }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[10px] text-gray-400">৳1,000</span>
                                        <span className="text-[10px] text-gray-400">৳2,00,000</span>
                                    </div>
                                </div>

                                {/* Tour Type */}
                                <div className="px-5 py-5">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3" style={{ fontFamily }}>{isBn ? 'ট্যুরের ধরন' : 'Tour Type'}</h4>
                                    <div className="space-y-0.5">
                                        {tourTypes.map(type => (
                                            <button
                                                key={type.key}
                                                onClick={() => setSelectedType(type.key)}
                                                className={`w-full text-left px-3 py-2 rounded transition-all text-[13px] flex items-center justify-between ${selectedType === type.key
                                                    ? "bg-gray-100 text-[#021E14] font-semibold"
                                                    : "text-gray-600 hover:bg-gray-50 font-normal"
                                                    }`}
                                                style={{ fontFamily }}
                                            >
                                                {isBn ? type.bn : type.en}
                                                {selectedType === type.key && (
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E64266' }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="p-5 rounded-lg text-white relative overflow-hidden" style={{ backgroundColor: '#021E14' }}>
                                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'rgba(239,140,44,0.15)' }} />
                                <h4 className="text-sm font-black uppercase tracking-[0.15em] mb-2" style={{ fontFamily: headingFont, color: '#E64266' }}>
                                    {isBn ? 'কাস্টম অভিজ্ঞতা' : 'Custom Experience'}
                                </h4>
                                <p className="text-[11px] font-normal leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.5)', fontFamily }}>
                                    {isBn ? 'আমাদের ট্রাভেল বিশেষজ্ঞদের দ্বারা শুধুমাত্র আপনার জন্য তৈরি একটি অনন্য যাত্রা পরিকল্পনা করুন।' : 'Plan a unique journey tailored just for you by our travel experts.'}
                                </p>
                                <a
                                    href={buildWhatsAppUrl(settings.whatsappNumber, "Hi, I'd like to get a quote for a custom tour package.")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2.5 rounded border text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-[#021E14] font-eyebrow"
                                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', fontFamily }}
                                >
                                    {isBn ? 'কোটেশন নিন' : 'Get a Quote'}
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT CONTENT AREA */}
                    <main className="flex-grow min-w-0">
                        {/* Control Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 pb-4 md:pb-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-[#021E14] uppercase leading-none mb-1.5" style={{ fontFamily: headingFont }}>
                                    {isBn ? (tourCategories.find(c => c.key === selectedCategory)?.bn || 'সব ট্যুর') : (tourCategories.find(c => c.key === selectedCategory)?.en || 'All Tours')}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-normal uppercase tracking-[0.2em] font-eyebrow" style={{ fontFamily }}>
                                    {isBn ? `${filteredTours.length}টি ফলাফল পাওয়া গেছে` : `Found ${filteredTours.length} results`}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex bg-white rounded-md p-1 border border-gray-100">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-gray-50 text-primary" : "text-gray-300 hover:text-gray-500"}`}
                                    >
                                        <LuLayoutGrid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-gray-50 text-primary" : "text-gray-300 hover:text-gray-500"}`}
                                    >
                                        <LuList size={16} />
                                    </button>
                                </div>
                                <div className="relative">
                                    <select
                                        className="pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-600 outline-none cursor-pointer appearance-none min-w-[140px] shadow-sm font-eyebrow"
                                        style={{ fontFamily }}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="featured">{isBn ? 'ফিচার্ড' : 'Featured'}</option>
                                        <option value="price-asc">{isBn ? 'মূল্য: কম-বেশি' : 'Price: Low-High'}</option>
                                        <option value="price-desc">{isBn ? 'মূল্য: বেশি-কম' : 'Price: High-Low'}</option>
                                    </select>
                                    <LuChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8" : "space-y-6 md:space-y-8"}>
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <div key={idx} className={`bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm flex flex-col ${viewMode === "list" ? "md:flex-row h-auto md:h-64" : ""}`}
                                        style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.08}s both` }}>
                                        {/* Skeleton Image */}
                                        <div className={`relative overflow-hidden bg-gray-100 ${viewMode === "grid" ? "h-52" : "w-full md:w-1/3 h-52 md:h-full"}`}>
                                            <div className="absolute inset-0 skeleton-shimmer" />
                                        </div>
                                        {/* Skeleton Content */}
                                        <div className={`p-5 flex flex-col justify-between flex-grow ${viewMode === "list" ? "md:w-2/3" : ""}`}>
                                            <div>
                                                <div className="h-5 w-4/5 rounded bg-gray-100 mb-3 skeleton-shimmer" />
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded-full bg-gray-100 skeleton-shimmer" />
                                                        <div className="h-3 w-16 rounded bg-gray-100 skeleton-shimmer" />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded-full bg-gray-100 skeleton-shimmer" />
                                                        <div className="h-3 w-8 rounded bg-gray-100 skeleton-shimmer" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                <div className="flex flex-col gap-1">
                                                    <div className="h-2.5 w-12 rounded bg-gray-100 skeleton-shimmer" />
                                                    <div className="h-5 w-20 rounded bg-gray-100 skeleton-shimmer" />
                                                </div>
                                                <div className="h-9 w-28 rounded-md bg-gray-100 skeleton-shimmer" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredTours.length > 0 ? (
                                    <div className={viewMode === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8"
                                        : "space-y-6 md:space-y-8"
                                    }>
                                        {filteredTours.map((tour, idx) => {
                                            const sym = getCurrencySymbol(tour.currency);
                                            return (
                                                <motion.div
                                                    layout
                                                    key={tour._id || idx}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                                    className={`group bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col ${viewMode === "list" ? "md:flex-row h-auto md:h-64" : ""
                                                        }`}
                                                >
                                                    {/* Image Section */}
                                                    <div className={`relative overflow-hidden ${viewMode === "grid" ? "h-52" : "w-full md:w-1/3 h-52 md:h-full"}`}>
                                                        {tour.image ? (
                                                            <img
                                                                loading="lazy"
                                                                decoding="async"
                                                                src={tour.image}
                                                                alt={isBn ? tour.titleBn || tour.title : tour.title}
                                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#021E14' }}>
                                                                <LuCompass size={40} className="text-white/10" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                                        {/* Featured & Location Type Badges */}
                                                        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                                                            {tour.isFeatured && (
                                                                <span className="px-2.5 py-1 bg-[#E64266] text-white text-[8px] font-bold uppercase tracking-widest rounded-md shadow-sm font-eyebrow" style={{ fontFamily }}>
                                                                    {isBn ? 'ফিচার্ড' : 'Featured'}
                                                                </span>
                                                            )}
                                                            {tour.locationType && (
                                                                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-[8px] font-bold uppercase tracking-widest rounded-md shadow-sm font-eyebrow" style={{ fontFamily }}>
                                                                    {tour.locationType}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {tour.tourType && (
                                                            <div className="absolute top-3 right-3">
                                                                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] font-bold rounded-md shadow-sm" style={{ fontFamily }}>
                                                                    {isBn ? (tour.tourTypeBn || tour.tourType) : tour.tourType}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Location on image */}
                                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                                                            <LuMapPin size={11} className="text-[#E64266]" />
                                                            <span className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow font-eyebrow" style={{ fontFamily }}>
                                                                {isBn ? (tour.destinationBn || tour.destination) : tour.destination}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Details Section */}
                                                    <div className={`p-5 flex flex-col justify-between flex-grow ${viewMode === "list" ? "md:w-2/3" : ""}`}>
                                                        <div>
                                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0F3C53] transition-colors leading-snug mb-3 line-clamp-2" style={{ fontFamily }}>
                                                                {isBn ? (tour.titleBn || tour.title) : tour.title}
                                                            </h3>

                                                            {/* Meta Info */}
                                                            <div className="flex items-center gap-4 text-gray-400 mb-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <LuClock size={13} />
                                                                    <span className="text-[11px] font-medium" style={{ fontFamily }}>
                                                                        {isBn ? (tour.durationBn || tour.duration) : tour.duration}
                                                                    </span>
                                                                </div>
                                                                {tour.rating > 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <LuStar size={13} className="text-[#E64266] fill-[#E64266]" />
                                                                        <span className="text-[11px] font-bold text-gray-700">{tour.rating}</span>
                                                                        {tour.reviewsCount > 0 && (
                                                                            <span className="text-[10px] text-gray-300">({tour.reviewsCount})</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Footer: Price + CTA */}
                                                        <div className="pt-4 border-t border-gray-50">
                                                            <div className="flex flex-col mb-4">
                                                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider leading-none mb-1.5" style={{ fontFamily }}>
                                                                    {isBn ? 'প্রতি জন' : 'per person'}
                                                                </span>
                                                                <div className="flex items-baseline gap-1.5 leading-none">
                                                                    <span className="text-base font-bold text-[#0F3C53]">
                                                                        {sym}{tour.price?.toLocaleString()}
                                                                    </span>
                                                                    {tour.oldPrice > 0 && (
                                                                        <span className="text-[10px] text-gray-300 line-through">{sym}{tour.oldPrice?.toLocaleString()}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/tour/${tour.slug || tour._id}`}
                                                                    className="flex-grow py-2.5 bg-[#0F3C53] hover:bg-[#2b78b0] text-white rounded-md font-bold text-[11px] uppercase tracking-wider transition-all text-center"
                                                                    style={{ fontFamily }}
                                                                >
                                                                    {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                                                                </Link>
                                                                <Link
                                                                    href={`/tour/${tour.slug || tour._id}`}
                                                                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center justify-center text-gray-400 transition-all border border-gray-100"
                                                                >
                                                                    <LuArrowRight size={18} />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-96 flex flex-col items-center justify-center text-center py-20 bg-white rounded-md border border-dashed border-gray-200">
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="mb-8 p-6 bg-gray-50 rounded-full"
                                        >
                                            <LuCompass size={48} className="text-gray-200" />
                                        </motion.div>
                                        <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight" style={{ fontFamily: headingFont }}>
                                            {isBn ? 'কিছু পাওয়া যায়নি' : 'Nothing Found'}
                                        </h3>
                                        <p className="text-gray-400 text-[11px] font-normal mt-2 max-w-[200px]" style={{ fontFamily }}>
                                            {isBn ? 'আপনার শর্ত অনুযায়ী কোনো ট্যুর পাওয়া যায়নি।' : "We couldn't find any tours matching your criteria."}
                                        </p>
                                        <button
                                            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                                            className="mt-6 px-6 py-2.5 bg-[#021E14] text-white rounded-md text-[10px] font-bold uppercase tracking-widest transition-all font-eyebrow"
                                            style={{ fontFamily }}
                                        >
                                            {isBn ? 'সার্চ ক্লিয়ার করুন' : 'Clear Search'}
                                        </button>
                                    </div>
                                )}
                            </AnimatePresence>
                        )}
                    </main>
                </div>
            </div>

            {/* Newsletter */}
            <section className="bg-white py-24 border-t border-gray-50">
                <div className="max-w-[1400px] mx-auto px-4 text-center">
                    <LuUsers className="text-secondary mx-auto mb-6" size={32} />
                    <h2 className="text-3xl md:text-5xl font-black text-[#021E14] uppercase tracking-tight mb-4" style={{ fontFamily: headingFont }}>
                        {isBn ? 'আমাদের ' : 'Join Our '}<span className="text-primary">{isBn ? 'গ্লোবাল ক্লাবে যোগ দিন' : 'Global Club'}</span>
                    </h2>
                    <p className="text-gray-400 text-[12px] max-w-lg mx-auto mb-10 font-normal leading-relaxed" style={{ fontFamily }}>
                        {isBn
                            ? 'সপ্তাহে একবার আল্ট্রা-এক্সক্লুসিভ ট্যুর ডিল এবং বিলাসবহুল ভ্রমণ অনুপ্রেরণা পেতে আপডেট থাকুন।'
                            : 'Stay updated with ultra-exclusive tour deals and luxury travel inspiration delivered once a week.'}
                    </p>
                    <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex gap-2 p-1.5 bg-gray-50 rounded-md border border-gray-100 focus-within:bg-white transition-all shadow-sm">
                        <input type="email" placeholder={isBn ? "ইমেইল এড্রেস" : "Email address"} className="flex-grow px-5 py-3 text-[11px] bg-transparent outline-none font-normal" style={{ fontFamily }} />
                        <button type="submit" className="px-6 py-3 bg-[#021E14] text-white rounded-md font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-black/10 font-eyebrow" style={{ fontFamily }}>
                            {isBn ? 'যোগ দিন' : 'Join Now'}
                        </button>
                    </form>
                </div>
            </section>

        </div >
        </>
    );
}

export default function TourPage() {
    return (
        <main>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            }>
                <TourContent />
            </Suspense>
        </main>
    );
}
