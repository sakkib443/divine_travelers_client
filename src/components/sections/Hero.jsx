"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    LuMapPin,
    LuPlane,
    LuCalendar,
    LuSearch,
    LuChevronDown,
    LuClock,
    LuCalendarCheck,
    LuArrowRight,
    LuX,
    LuCheck,
} from "react-icons/lu";
import { FaFacebookF, FaTwitter, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FaKaaba } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
    useSiteSettings,
    buildWhatsAppUrl,
    buildTelUrl,
} from "@/context/SiteSettingsContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FROM_AIRPORTS, TO_AIRPORTS, defaultDepartDate, composeFlightParams } from "@/utils/flight";
import {
    TripTypePills, AirportField, SwapButton, PassengerStepper, CabinSelect,
    FlightDateField, LegsEditor,
} from "@/components/flight/FlightFields";
import { LuPlaneTakeoff, LuPlaneLanding } from "react-icons/lu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_SLIDE_SECONDS = 4;

// Brand tokens — single source of truth
const BRAND = {
    primary: "#0F3C53",
    primaryDark: "#1565c0",
    accent: "#E64266",
    accentDark: "#D97A1E",
    whatsapp: "#25D366",
    whatsappDark: "#1FB955",
};

// ─── Field Label ─────────────────────────────────────────────────────────────
const FieldLabel = ({ children, bnFont }) => (
    <p
        className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.08em] leading-none mb-1.5"
        style={{ fontFamily: bnFont }}
    >
        {children}
    </p>
);

// ─── Dropdown Component (Portal-based — escapes all stacking contexts) ──────
function Dropdown({ icon, label, value, placeholder, options, onSelect, onClear, searchable, bnFont, isBn }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => setMounted(true), []);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: rect.width,
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        const onScroll = () => updatePosition();
        const onResize = () => updatePosition();
        const onClickOutside = (e) => {
            const t = e.target;
            if (
                triggerRef.current && !triggerRef.current.contains(t) &&
                panelRef.current && !panelRef.current.contains(t)
            ) {
                setOpen(false);
                setSearch("");
            }
        };
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        document.addEventListener("click", onClickOutside);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("click", onClickOutside);
        };
    }, [open, updatePosition]);

    const filtered = useMemo(() => {
        if (!searchable || !search.trim()) return options;
        const q = search.trim().toLowerCase();
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                (o.labelBn && o.labelBn.includes(search.trim()))
        );
    }, [options, search, searchable]);

    const selected = useMemo(
        () => options.find((o) => o.value === value),
        [options, value]
    );
    const displayValue = selected
        ? (isBn && selected.labelBn ? selected.labelBn : selected.label)
        : null;

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full h-[52px] flex items-center gap-3 pl-4 pr-12 rounded-xl border border-gray-200 bg-white hover:border-[#0F3C53]/60 text-left cursor-pointer"
            >
                <div className="flex-1 min-w-0">
                    <FieldLabel bnFont={bnFont}>{label}</FieldLabel>
                    <p
                        className={`text-[13px] font-semibold leading-snug truncate ${displayValue ? "text-gray-900" : "text-gray-400"}`}
                        style={{ fontFamily: bnFont }}
                    >
                        {displayValue || placeholder}
                    </p>
                </div>
            </button>

            {/* Right-side icons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                {value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        className="pointer-events-auto w-5 h-5 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center cursor-pointer"
                        aria-label="Clear selection"
                    >
                        <LuX size={11} />
                    </button>
                )}
                <LuChevronDown
                    size={16}
                    className={open ? "rotate-180 text-[#0F3C53]" : "text-gray-400"}
                />
            </div>

            {/* Dropdown panel — rendered in portal at document.body to escape stacking contexts */}
            {mounted && open && createPortal(
                <div
                    ref={panelRef}
                    style={{
                        position: "absolute",
                        top: pos.top,
                        left: pos.left,
                        width: pos.width,
                        zIndex: 9999,
                    }}
                    className="bg-white border border-gray-200 rounded-xl shadow-2xl shadow-black/20"
                >
                    {searchable && (
                        <div className="p-2 border-b border-gray-100">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isBn ? "টাইপ করে খুঁজুন" : "Type to search"}
                                className="w-full px-3 py-2 text-[13px] bg-gray-50 rounded-lg outline-none text-gray-800 placeholder-gray-400"
                                style={{ fontFamily: bnFont }}
                            />
                        </div>
                    )}
                    <ul
                        role="listbox"
                        className="max-h-[280px] overflow-y-auto p-1 m-0 list-none"
                    >
                        {filtered.length > 0 ? (
                            filtered.map((opt) => {
                                const isSelected = value === opt.value;
                                const code = (opt.value || "").slice(0, 3).toUpperCase();
                                return (
                                    <li key={opt.value} className="m-0 p-0">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => {
                                                onSelect(opt.value);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#0F3C53]/10"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {opt.flag && (
                                                <span className="text-lg flex-shrink-0 leading-none">
                                                    {opt.flag}
                                                </span>
                                            )}
                                            <span className="flex-1 min-w-0 block">
                                                <span
                                                    className={`block text-[13px] font-semibold truncate leading-tight ${
                                                        isSelected ? "text-[#0F3C53]" : "text-gray-900"
                                                    }`}
                                                    style={{ fontFamily: bnFont }}
                                                >
                                                    {isBn && opt.labelBn ? opt.labelBn : opt.label}
                                                </span>
                                                {opt.sub && (
                                                    <span className="block text-[11px] text-gray-500 truncate leading-tight mt-px">
                                                        {opt.sub}
                                                    </span>
                                                )}
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold tracking-wider flex-shrink-0 ${
                                                    isSelected ? "text-[#0F3C53]" : "text-gray-400"
                                                }`}
                                            >
                                                {isSelected ? <LuCheck size={14} /> : code}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })
                        ) : (
                            <li
                                className="py-8 text-center text-gray-400 text-[13px]"
                                style={{ fontFamily: bnFont }}
                            >
                                {isBn ? "কিছু পাওয়া যায়নি" : "No results found"}
                            </li>
                        )}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
}

// ─── Date Field ──────────────────────────────────────────────────────────────
function DateField({ icon, label, value, onChange, bnFont }) {
    const today = new Date().toISOString().split("T")[0];
    return (
        <label className="group h-[52px] flex items-center gap-3 px-4 rounded-xl border border-gray-200 bg-white hover:border-[#0F3C53]/60 hover:shadow-sm focus-within:border-[#0F3C53] transition-all cursor-pointer">
            <div className="flex-1 min-w-0">
                <FieldLabel bnFont={bnFont}>{label}</FieldLabel>
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    min={today}
                    className="w-full text-[13px] font-semibold text-gray-900 bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus:border-transparent p-0 cursor-pointer leading-snug"
                    style={{ colorScheme: "light", boxShadow: "none" }}
                />
            </div>
        </label>
    );
}

// ─── Star Rating Picker ──────────────────────────────────────────────────────
// ─── Tab Button ──────────────────────────────────────────────────────────────
function TabButton({ active, icon, label, onClick, bnFont }) {
    return (
        <button
            type="button"
            onClick={onClick}
            role="tab"
            aria-selected={active}
            className={`relative flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 px-1.5 sm:px-3 lg:px-5 py-2.5 rounded-t-xl font-semibold text-[11px] sm:text-[12px] whitespace-nowrap transition-all duration-200 cursor-pointer flex-1 sm:flex-none ${
                active
                    ? "bg-white text-[#0F3C53] shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
                    : "bg-white/80 backdrop-blur-md text-gray-600 hover:bg-white hover:text-gray-900"
            }`}
            style={{ fontFamily: bnFont }}
        >
            <span className={active ? "text-[#0F3C53]" : "text-[#E64266]"}>{icon}</span>
            {label}
            {active && (
                <motion.span
                    layoutId="active-tab"
                    className="absolute -bottom-px left-3 right-3 h-[3px] bg-[#0F3C53] rounded-full"
                />
            )}
        </button>
    );
}

// ─── Search Submit Button ────────────────────────────────────────────────────
function SearchButton({ label, onClick, bnFont, disabled }) {
    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`group h-[52px] w-full lg:w-auto px-7 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[13px] tracking-wide transition-all ${
                disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "text-white cursor-pointer active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5"
            }`}
            style={disabled ? { fontFamily: bnFont } : {
                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
                fontFamily: bnFont,
                boxShadow: `0 6px 20px ${BRAND.primary}55`,
            }}
        >
            <LuSearch size={16} />
            {label}
            <LuArrowRight
                size={15}
                className={disabled ? "" : "group-hover:translate-x-0.5 transition-transform"}
            />
        </button>
    );
}

// ─── Main Hero Component ─────────────────────────────────────────────────────
export default function Hero({ heroData }) {
    const [activeTab, setActiveTab] = useState("tour");
    const { t, language } = useLanguage();
    const { settings } = useSiteSettings();
    const router = useRouter();
    const isBn = language === "bn";
    const bnFont = "var(--font-primary)";

    // Bilingual text helper
    const bt = (obj, fallback = "") => {
        if (!obj) return fallback;
        return isBn ? (obj.bn || obj.en || fallback) : (obj.en || fallback);
    };
    const hd = heroData || {};

    // Background slides mirror the dashboard EXACTLY — the database is the
    // single source of truth. Remove a slide in the admin panel and it
    // disappears here too; with none saved the gradient shows through.
    const slides = [...(hd.slides || [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => s.image)
        .filter(Boolean);
    const slideSeconds = Number(hd.slideSeconds) > 0 ? Number(hd.slideSeconds) : DEFAULT_SLIDE_SECONDS;

    // Auto-rotate hero background slider
    const [heroSlide, setHeroSlide] = useState(0);
    useEffect(() => {
        if (slides.length < 2) return;
        const id = setInterval(() => setHeroSlide((s) => (s + 1) % slides.length), slideSeconds * 1000);
        return () => clearInterval(id);
    }, [slides.length, slideSeconds]);

    // Clamp during render rather than in an effect: the slide list can shrink
    // between renders (admin removes a picture), and correcting it afterwards
    // would paint one frame with nothing showing.
    const activeSlide = slides.length ? heroSlide % slides.length : 0;

    // Second CTA. "whatsapp" (the default) means "use the number from Settings",
    // which keeps one WhatsApp number for the whole site.
    const isWhatsAppCta = !hd.ctaButton2Link || hd.ctaButton2Link === "whatsapp";
    const ctaButton2Label = hd.ctaButton2Text
        ? bt(hd.ctaButton2Text)
        : (isBn ? "প্রশ্ন করুন" : "Ask a question");
    const whatsappMessage = hd.whatsappMessage
        ? bt(hd.whatsappMessage)
        : (isBn ? "ট্যুর/ভ্রমণ সম্পর্কে জানতে চাই" : "I need help with tour/travel services");

    // ── Data ──
    const [tours, setTours] = useState([]);

    // ── Flight State (hero only collects & forwards to /flight) ──
    const [flight, setFlight] = useState({
        tripType: "oneway",
        from: "",
        to: "",
        departDate: defaultDepartDate(),
        returnDate: "",
        passengers: 1,
        cabin: "economy",
        legs: [],
    });
    const setFl = (k, v) => setFlight((p) => ({ ...p, [k]: v }));
    const onFlightTripType = (t) =>
        setFlight((p) => ({
            ...p,
            tripType: t,
            legs: t === "multi" && p.legs.length === 0 ? [{ from: "", to: "", date: "" }] : p.legs,
        }));

    // ── Tour State ──
    const [tourLocType, setTourLocType] = useState("");
    const [tourDest, setTourDest] = useState("");
    const [tourType, setTourType] = useState("");
    const [tourDate, setTourDate] = useState("");

    // Fetch all data from API
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                const tRes = await fetch(`${API_BASE}/api/tours/active`, { signal: ac.signal }).catch(() => null);
                if (tRes) {
                    const tData = await tRes.json();
                    if (tData.success && tData.data) setTours(tData.data);
                }
            } catch (err) {
                if (err.name !== "AbortError") console.error("Hero fetch error:", err);
            }
        })();
        return () => ac.abort();
    }, []);

    // ── Options ──
    const tourLocTypeOptions = [
        { value: "Domestic", label: "Domestic", labelBn: "ডোমেস্টিক" },
        { value: "International", label: "International", labelBn: "ইন্টারন্যাশনাল" },
    ];

    // Derive tour packages mapped by location type
    const tourDestOptions = useMemo(() => {
        const out = [];
        for (const t of tours) {
            if (tourLocType && t.locationType !== tourLocType) continue;
            out.push({
                value: t.slug,
                label: t.title,
                labelBn: t.titleBn || t.title,
                sub: t.destination || "",
            });
        }
        return out;
    }, [tours, tourLocType]);

    // Derive unique tour categories from API data
    const tourTypeOptions = useMemo(() => {
        const labelMap = {
            adventure: { en: "Adventure", bn: "অ্যাডভেঞ্চার" },
            beach: { en: "Beach Tour", bn: "বিচ ট্যুর" },
            nature: { en: "Nature & Wildlife", bn: "প্রকৃতি ও বন্যপ্রাণী" },
            culture: { en: "Cultural", bn: "সাংস্কৃতিক" },
            historical: { en: "Historical", bn: "ঐতিহাসিক" },
            religious: { en: "Religious", bn: "ধর্মীয়" },
            hill: { en: "Hill Station", bn: "পাহাড়" },
            city: { en: "City Tour", bn: "সিটি ট্যুর" },
            international: { en: "International", bn: "আন্তর্জাতিক" },
            luxury: { en: "Luxury", bn: "বিলাসবহুল" },
        };
        const seen = new Set();
        const out = [];
        for (const t of tours) {
            const cat = t.category;
            if (!cat || seen.has(cat)) continue;
            seen.add(cat);
            const m = labelMap[cat];
            out.push({
                value: cat,
                label: m ? m.en : cat.charAt(0).toUpperCase() + cat.slice(1),
                labelBn: m ? m.bn : cat,
            });
        }
        return out;
    }, [tours]);

    // ── Validation Logic ──
    const isFlightIncomplete = useMemo(() => {
        if (!flight.from || !flight.to || !flight.departDate) return true;
        if (flight.tripType === "round" && !flight.returnDate) return true;
        if (flight.tripType === "multi") {
            if (flight.legs.length === 0) return true;
            for (const leg of flight.legs) {
                if (!leg.from || !leg.to || !leg.date) return true;
            }
        }
        return false;
    }, [flight]);

    const isTourIncomplete = !tourLocType || !tourDest || !tourDate;

    // ── Search Handlers ──
    // Flight search: compose URL params and land on /flight pre-filled.
    const handleFlightSearch = useCallback(() => {
        const params = composeFlightParams(flight);
        router.push("/flight?" + params.toString());
    }, [flight, router]);

    const handleTourSearch = useCallback(() => {
        if (tourDest) {
            // tourDest holds the slug
            router.push(`/tour/${tourDest}`);
        } else {
            const params = new URLSearchParams();
            if (tourLocType) params.set("locationType", tourLocType);
            if (tourDate) params.set("date", tourDate);
            const qs = params.toString();
            router.push(qs ? `/tour?${qs}` : "/tour");
        }
    }, [tourDest, tourLocType, tourDate, router]);

    // ── Hajj & Umrah State ──
    const [hajjType, setHajjType] = useState("");

    const hajjTypeOptions = [
        { value: "hajj", label: "Hajj Package", labelBn: "হজ প্যাকেজ" },
        { value: "umrah", label: "Umrah Package", labelBn: "ওমরাহ প্যাকেজ" },
    ];

    const handleHajjSearch = useCallback(() => {
        router.push(hajjType ? `/hajj-umrah?type=${hajjType}` : "/hajj-umrah");
    }, [hajjType, router]);

    const isHajjIncomplete = !hajjType;

    // ── Tab Configuration ──
    const tabs = [
        { id: "tour", label: isBn ? "ট্যুর প্যাকেজ" : "Tour Packages", icon: <LuMapPin size={14} /> },
        { id: "hajj", label: isBn ? "হজ ও ওমরাহ" : "Hajj & Umrah", icon: <FaKaaba size={13} /> },
        { id: "flight", label: isBn ? "ফ্লাইট" : "Flight", icon: <LuPlane size={14} className="-rotate-45" /> },
    ];

    const searchConfig = {
        tour: { handler: handleTourSearch, btnLabel: isBn ? "ট্যুর খুঁজুন" : "Find Tour" },
        hajj: { handler: handleHajjSearch, btnLabel: isBn ? "প্যাকেজ খুঁজুন" : "Find Package" },
    };

    const fieldProps = { isBn, bnFont };

    return (
        <div className="relative w-full flex flex-col">
            <section className="relative min-h-[240px] aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[75vh] flex flex-col bg-[#0a1a14] pb-6 lg:pb-[80px]">
                {/* Background */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                {/* Background slides */}
                {slides.map((src, i) => (
                    <div
                        key={`${src}-${i}`}
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                        style={{ backgroundImage: `url('${src}')`, opacity: activeSlide === i ? 1 : 0 }}
                    />
                ))}
                {/* A very light black overlay is kept so white text remains somewhat readable, 
                    but no color/blue tints are applied. */}
                <div className="absolute inset-0 bg-black/20 z-10" />
            </div>

            {/* Navbar spacer */}
            <div className="h-24 lg:h-20 flex-shrink-0" />

            {/* Content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-6 flex-1 flex flex-col items-center pb-0">
                {/* Spacer top to balance text */}
                <div className="flex-1" />
                
                {/* Hero Text */}
                <div className="flex flex-col items-center justify-center text-center -mt-16 sm:-mt-20 lg:-mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-5"
                    >
                        <LuClock className="text-white w-3.5 h-3.5" />
                        <span
                            className="text-white text-[9px] lg:text-[10px] font-bold tracking-widest uppercase font-eyebrow"
                            style={{ fontFamily: bnFont }}
                        >
                            {hd.badgeText ? bt(hd.badgeText) : t("openingHour")}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="font-bold text-white mb-5 lg:mb-4 tracking-tight uppercase"
                        style={{
                            fontFamily: "var(--font-heading)",
                            color: "#FFFFFF",
                            textShadow: "0 8px 30px rgba(0,0,0,0.5)",
                            fontSize: "clamp(1.25rem, 5vw, 3.5rem)",
                            lineHeight: "1.1",
                        }}
                    >
                        {(() => {
                            let text = hd.heading ? bt(hd.heading) : t("heroTitle");
                            if (text.toUpperCase() === "YOUR JOURNEY STARTS WITH DIVINE TRAVELERS") {
                                text = "YOUR JOURNEY STARTS WITH\nDIVINE TRAVELERS";
                            } else if (text === "আপনার যাত্রা শুরু হোক Divine Travelers দিয়ে") {
                                text = "আপনার যাত্রা শুরু হোক\nDivine Travelers -এর সাথে";
                            }
                            
                            return text.split('\n').map((line, idx) => {
                                const isDivineLine = line.toUpperCase().includes("DIVINE TRAVELERS");
                                
                                if (isDivineLine) {
                                    const parts = line.split(/(DIVINE TRAVELERS)/i);
                                    return (
                                        <span key={idx} className={idx > 0 ? "block mt-4 lg:mt-6" : "block"}>
                                            {parts.map((part, i) => {
                                                if (part.toUpperCase() === "DIVINE TRAVELERS") {
                                                    return (
                                                        <span key={i} className="inline-flex items-center justify-center mt-2 lg:mt-4 leading-none font-black tracking-widest" style={{ textShadow: "0 0 2px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.8)" }}>
                                                            <span style={{ color: "#0F3C53" }}>DIVINE</span>
                                                            <span style={{ color: "#E64266" }} className="ml-2 lg:ml-3">TRAVELERS</span>
                                                        </span>
                                                    );
                                                }
                                                return <span key={i}>{part}</span>;
                                            })}
                                        </span>
                                    );
                                }

                                return (
                                    <span key={idx} className={idx > 0 ? "block mt-4 lg:mt-6" : "block"}>
                                        {line}
                                    </span>
                                );
                            });
                        })()}
                    </motion.h1>


                </div>

                {/* Spacer bottom to push content to center/top */}
                <div className="flex-1" />
            </div>


        </section>

        {/* ════════════════════════════════════════════════════════════════
            SEARCH WIDGET — Static below banner on mobile, Absolute on desktop
        ════════════════════════════════════════════════════════════════ */}
        <div className="relative left-1/2 -translate-x-1/2 lg:-mt-[70px] w-full max-w-5xl px-5 z-40 -mt-12 sm:-mt-16 pb-2 lg:pb-4">
                    {/* Tabs */}
                    <div
                        role="tablist"
                        className="flex gap-1 justify-start w-full"
                    >
                        {tabs.map((tab) => (
                            <TabButton
                                key={tab.id}
                                active={activeTab === tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                onClick={() => setActiveTab(tab.id)}
                                bnFont={bnFont}
                            />
                        ))}
                    </div>

                    {/* Search Card */}
                    <div className="bg-white rounded-none shadow-2xl shadow-black/20 p-3 lg:p-4">
                        {/* ─ FLIGHT TAB — collects trip details & forwards to /flight ─ */}
                        {activeTab === "flight" && (
                            <div className="space-y-2.5">
                                <TripTypePills value={flight.tripType} onChange={onFlightTripType} isBn={isBn} bnFont={bnFont} />

                                {/* All Inputs in a single row on desktop */}
                                <div className={`grid grid-cols-1 gap-2.5 ${flight.tripType === "round" ? "lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_0.9fr_0.9fr]" : "lg:grid-cols-[1.3fr_1.3fr_1.2fr_1fr_1fr]"}`}>
                                    <AirportField
                                        label={isBn ? "কোথা থেকে" : "From"}
                                        value={flight.from}
                                        onChange={(v) => setFl("from", v)}
                                        options={FROM_AIRPORTS}
                                        placeholder={isBn ? "শহর বা এয়ারপোর্ট" : "City or airport"}
                                        icon={<LuPlaneTakeoff size={17} />}
                                        isBn={isBn} bnFont={bnFont}
                                    />
                                    <SwapButton onClick={() => setFlight((p) => ({ ...p, from: p.to, to: p.from }))} />
                                    <AirportField
                                        label={isBn ? "কোথায়" : "To"}
                                        value={flight.to}
                                        onChange={(v) => setFl("to", v)}
                                        options={TO_AIRPORTS}
                                        placeholder={isBn ? "শহর বা এয়ারপোর্ট" : "City or airport"}
                                        icon={<LuPlaneLanding size={17} />}
                                        isBn={isBn} bnFont={bnFont}
                                    />
                                    <FlightDateField
                                        label={isBn ? "যাত্রার তারিখ" : "Departure"}
                                        value={flight.departDate}
                                        onChange={(v) => setFl("departDate", v)}
                                        isBn={isBn} bnFont={bnFont}
                                    />
                                    {flight.tripType === "round" && (
                                        <FlightDateField
                                            label={isBn ? "ফেরার তারিখ" : "Return"}
                                            value={flight.returnDate}
                                            onChange={(v) => setFl("returnDate", v)}
                                            isBn={isBn} bnFont={bnFont}
                                        />
                                    )}
                                    <PassengerStepper value={flight.passengers} onChange={(v) => setFl("passengers", v)} isBn={isBn} bnFont={bnFont} />
                                    <CabinSelect value={flight.cabin} onChange={(v) => setFl("cabin", v)} isBn={isBn} bnFont={bnFont} />
                                </div>

                                {/* Multi-city legs */}
                                {flight.tripType === "multi" && (
                                    <LegsEditor
                                        legs={flight.legs}
                                        setLegs={(legs) => setFl("legs", legs)}
                                        fromOptions={FROM_AIRPORTS}
                                        toOptions={TO_AIRPORTS}
                                        isBn={isBn} bnFont={bnFont}
                                    />
                                )}

                                {/* Search Button Centered Below */}
                                <div className="flex justify-center pt-2">
                                    <button
                                        type="button"
                                        onClick={isFlightIncomplete ? undefined : handleFlightSearch}
                                        disabled={isFlightIncomplete}
                                        className={`group h-[52px] w-full lg:w-auto px-12 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[13px] tracking-wide transition-all ${
                                            isFlightIncomplete
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                                : "text-white cursor-pointer active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5"
                                        }`}
                                        style={isFlightIncomplete ? { fontFamily: bnFont } : { 
                                            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`, 
                                            fontFamily: bnFont, 
                                            boxShadow: `0 6px 20px ${BRAND.primary}55` 
                                        }}
                                    >
                                        <LuPlane size={16} className="-rotate-45" />
                                        {isBn ? "ফ্লাইট খুঁজুন" : "Search"}
                                        <LuArrowRight size={15} className={isFlightIncomplete ? "" : "group-hover:translate-x-0.5 transition-transform"} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab !== "flight" && (
                        <div
                            className={`grid grid-cols-1 gap-2.5 ${activeTab === 'hajj' ? 'lg:grid-cols-[1fr_auto]' : 'lg:grid-cols-[1.2fr_1.5fr_1fr_auto]'}`}
                        >

                                
                                {/* ─ HAJJ & UMRAH TAB ─ */}


                                
                                {activeTab === "hajj" && (


                                
                                    <Dropdown


                                
                                        icon={<FaKaaba size={16} />}


                                
                                        label={isBn ? "প্যাকেজ ধরন" : "Package Type"}


                                
                                        value={hajjType}


                                
                                        placeholder={isBn ? "হজ বা ওমরাহ বাছুন" : "Select Hajj or Umrah"}


                                
                                        options={hajjTypeOptions}


                                
                                        onSelect={setHajjType}


                                
                                        onClear={() => setHajjType("")}


                                
                                        {...fieldProps}


                                
                                    />


                                
                                )}



                                
                                {/* ─ TOUR TAB ─ */}
                                {activeTab === "tour" && (
                                    <>
                                        <Dropdown
                                            icon={<LuMapPin size={18} />}
                                            label={isBn ? "ট্যুর ধরন" : "Tour Type"}
                                            value={tourLocType}
                                            placeholder={isBn ? "ডোমেস্টিক / ইন্টারন্যাশনাল" : "Domestic / International"}
                                            options={tourLocTypeOptions}
                                            onSelect={(v) => { setTourLocType(v); setTourDest(""); }}
                                            onClear={() => { setTourLocType(""); setTourDest(""); }}
                                            {...fieldProps}
                                        />
                                        <Dropdown
                                            icon={<LuMapPin size={18} />}
                                            label={isBn ? "ট্যুর প্যাকেজ" : "Tour Package"}
                                            value={tourDest}
                                            placeholder={isBn ? "প্যাকেজ বাছুন" : "Select package"}
                                            options={tourDestOptions}
                                            onSelect={setTourDest}
                                            onClear={() => setTourDest("")}
                                            searchable
                                            {...fieldProps}
                                        />
                                        <DateField
                                            icon={<LuCalendar size={18} />}
                                            label={isBn ? "ভ্রমণের তারিখ" : "Travel Date"}
                                            value={tourDate}
                                            onChange={setTourDate}
                                            bnFont={bnFont}
                                        />
                                    </>
                                )}

                            <SearchButton
                                label={searchConfig[activeTab]?.btnLabel}
                                onClick={searchConfig[activeTab]?.handler}
                                disabled={activeTab === "tour" ? isTourIncomplete : activeTab === "hajj" ? isHajjIncomplete : false}
                                bnFont={bnFont}
                            />
                        </div>
                        )}
                    </div>
            </div>

        </div>
    );
}
