"use client";

// ===================================================================
// Divine Travelers — Flight form building blocks
// Shared by the home-hero Flight tab and the /flight inquiry page so
// both surfaces behave identically (autocomplete, pills, legs…).
// ===================================================================

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
    LuPlane, LuPlaneTakeoff, LuPlaneLanding, LuChevronDown, LuX, LuPlus,
    LuMinus, LuUsers, LuArmchair, LuArrowUpDown, LuCircleCheck, LuCircleX,
} from "react-icons/lu";
import { filterAirports, airportLabel, TRIP_TYPES, CABIN_CLASSES } from "@/utils/flight";

const NAVY = "#1a1a4e";

// ── Trip-type pill toggle (One Way · Round Way · Multi City) ────────
export function TripTypePills({ value, onChange, isBn, bnFont }) {
    return (
        <div className="flex flex-wrap gap-1.5" role="radiogroup">
            {TRIP_TYPES.map((t) => (
                <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={value === t.value}
                    onClick={() => onChange(t.value)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                        value === t.value
                            ? "text-white shadow-md"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    style={{ fontFamily: bnFont, ...(value === t.value ? { background: NAVY } : {}) }}
                >
                    {isBn ? t.labelBn : t.label}
                </button>
            ))}
        </div>
    );
}

// ── Airport autocomplete ────────────────────────────────────────────
// value is the canonical "City (CODE)" string. Typing matches city,
// airport, country and IATA code.
export function AirportField({ label, value, onChange, options, placeholder, icon, isBn, bnFont, compact = false }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapRef = useRef(null);

    useEffect(() => {
        const onDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const matches = filterAirports(options, query).slice(0, 30);

    const pick = (a) => {
        onChange(airportLabel(a));
        setQuery("");
        setOpen(false);
    };

    return (
        <div ref={wrapRef} className="relative">
            <div
                className={`${compact ? "h-[48px]" : "h-[52px]"} flex items-center gap-2.5 px-3.5 rounded-xl border border-gray-200 bg-white transition-all cursor-pointer focus-within:border-[#1D4ED8]`}
                onClick={() => setOpen(true)}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.08em] leading-none mb-1" style={{ fontFamily: bnFont }}>
                        {label}
                    </p>
                    <input
                        value={open ? query : value}
                        onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
                        onFocus={() => { setOpen(true); setQuery(""); }}
                        placeholder={value || placeholder}
                        className="w-full text-[13px] font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400 leading-snug"
                        style={{ fontFamily: bnFont, boxShadow: "none" }}
                    />
                </div>
                {value && !open ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); }}
                        className="p-1 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
                        aria-label="Clear"
                    >
                        <LuX size={13} />
                    </button>
                ) : (
                    <LuChevronDown size={14} className={`text-gray-300 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                )}
            </div>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-xl border border-gray-100 shadow-2xl max-h-[280px] overflow-y-auto py-1">
                    {matches.length === 0 ? (
                        <p className="px-4 py-3 text-[12px] text-gray-400" style={{ fontFamily: bnFont }}>
                            {isBn ? "কোনো এয়ারপোর্ট পাওয়া যায়নি" : "No airports found"}
                        </p>
                    ) : (
                        matches.map((a) => (
                            <button
                                key={a.code}
                                type="button"
                                onClick={() => pick(a)}
                                className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-gray-50 transition"
                            >
                                <span className="text-lg leading-none mt-0.5">{a.flag}</span>
                                <span className="min-w-0">
                                    <span className="block text-[13px] font-semibold text-gray-800">
                                        {a.city} ({a.code})
                                    </span>
                                    <span className="block text-[11px] text-gray-400 truncate">
                                        {a.airport} · {a.country}
                                    </span>
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ── Swap button (From ⇄ To) ────────────────────────────────────────
export function SwapButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Swap airports"
            className="mx-auto w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-[#1a1a4e] hover:border-[#1a1a4e]/40 transition lg:hidden"
        >
            <LuArrowUpDown size={14} />
        </button>
    );
}

// ── Passengers stepper (1–9) ────────────────────────────────────────
export function PassengerStepper({ value, onChange, isBn, bnFont, compact = false }) {
    const n = Math.max(1, Math.min(9, Number(value) || 1));
    return (
        <div className={`${compact ? "h-[48px]" : "h-[52px]"} flex items-center gap-2.5 px-3.5 rounded-xl border border-gray-200 bg-white focus-within:border-[#1D4ED8]`}>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.08em] leading-none mb-1" style={{ fontFamily: bnFont }}>
                    {isBn ? "যাত্রী" : "Passengers"}
                </p>
                <p className="text-[13px] font-semibold text-gray-900 leading-snug">{n}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => onChange(Math.max(1, n - 1))} disabled={n <= 1}
                    className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-gray-600" aria-label="Fewer passengers">
                    <LuMinus size={12} />
                </button>
                <button type="button" onClick={() => onChange(Math.min(9, n + 1))} disabled={n >= 9}
                    className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-gray-600" aria-label="More passengers">
                    <LuPlus size={12} />
                </button>
            </div>
        </div>
    );
}

// ── Cabin class dropdown ────────────────────────────────────────────
export function CabinSelect({ value, onChange, isBn, bnFont, compact = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCabin = CABIN_CLASSES.find(c => c.value === value) || CABIN_CLASSES[0];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`${compact ? "h-[48px]" : "h-[52px]"} w-full flex items-center justify-between px-3.5 rounded-xl border ${isOpen ? "border-[#1D4ED8]" : "border-gray-200 hover:border-gray-300"} bg-white cursor-pointer transition-all`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.08em] leading-none mb-1" style={{ fontFamily: bnFont }}>
                            {isBn ? "ক্লাস" : "Cabin class"}
                        </p>
                        <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate" style={{ fontFamily: bnFont }}>
                            {isBn ? selectedCabin.labelBn : selectedCabin.label}
                        </p>
                    </div>
                </div>
                <LuChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#1D4ED8]" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {CABIN_CLASSES.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => {
                                onChange(c.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors ${
                                value === c.value 
                                    ? "bg-[#1D4ED8]/5 text-[#1D4ED8] font-bold" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            style={{ fontFamily: bnFont }}
                        >
                            {isBn ? c.labelBn : c.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Date field ──────────────────────────────────────────────────────
export function FlightDateField({ label, value, onChange, isBn, bnFont, compact = false }) {
    const today = new Date().toISOString().split("T")[0];
    return (
        <label className={`${compact ? "h-[48px]" : "h-[52px]"} flex items-center gap-2.5 px-3.5 rounded-xl border border-gray-200 bg-white cursor-pointer focus-within:border-[#1D4ED8]`}>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.08em] leading-none mb-1" style={{ fontFamily: bnFont }}>
                    {label}
                </p>
                <input
                    type="date"
                    value={value}
                    min={today}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-[13px] font-semibold text-gray-900 bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus:border-transparent p-0 cursor-pointer leading-snug"
                    style={{ colorScheme: "light", boxShadow: "none" }}
                />
            </div>
        </label>
    );
}

// ── Multi-city legs editor (max 8) ─────────────────────────────────
export function LegsEditor({ legs, setLegs, fromOptions, toOptions, isBn, bnFont }) {
    const update = (i, k, v) => setLegs(legs.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
    const remove = (i) => setLegs(legs.filter((_, idx) => idx !== i));
    const add = () => legs.length < 8 && setLegs([...legs, { from: "", to: "", date: "" }]);

    return (
        <div className="space-y-2.5">
            {legs.map((leg, i) => (
                <div key={i} className="relative rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide" style={{ fontFamily: bnFont }}>
                            {isBn ? `ফ্লাইট ${i + 2}` : `Flight ${i + 2}`}
                        </p>
                        <button type="button" onClick={() => remove(i)}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center" aria-label="Remove flight">
                            <LuX size={12} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                        <AirportField compact label={isBn ? "কোথা থেকে" : "From"} value={leg.from} onChange={(v) => update(i, "from", v)}
                            options={fromOptions} placeholder={isBn ? "শহর বাছুন" : "Select city"} icon={<LuPlaneTakeoff size={16} />} isBn={isBn} bnFont={bnFont} />
                        <AirportField compact label={isBn ? "কোথায়" : "To"} value={leg.to} onChange={(v) => update(i, "to", v)}
                            options={toOptions} placeholder={isBn ? "শহর বাছুন" : "Select city"} icon={<LuPlaneLanding size={16} />} isBn={isBn} bnFont={bnFont} />
                        <FlightDateField compact label={isBn ? "তারিখ" : "Date"} value={leg.date} onChange={(v) => update(i, "date", v)} isBn={isBn} bnFont={bnFont} />
                    </div>
                </div>
            ))}
            {legs.length < 8 && (
                <button type="button" onClick={add}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dashed border-gray-300 text-[12px] font-bold text-gray-500 hover:border-[#1a1a4e]/50 hover:text-[#1a1a4e] transition"
                    style={{ fontFamily: bnFont }}>
                    <LuPlus size={14} /> {isBn ? "ফ্লাইট যোগ করুন" : "Add flight"}
                </button>
            )}
        </div>
    );
}

// ── Success / error slide-in toast (360px, top-right, progress bar) ─
export function showFlightToast({ ok = true, firstName = "", isBn = false, errorText = "" }) {
    const DURATION = 5000;
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? "animate-slide-in-right" : "animate-slide-out-right"} relative w-[360px] max-w-[92vw] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden`}
            >
                <div className="flex items-start gap-3 p-4">
                    <span className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-[#10B981]/10 text-[#10B981]" : "bg-red-50 text-red-500"}`}>
                        {ok ? <LuCircleCheck size={20} /> : <LuCircleX size={20} />}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5">
                            {ok
                                ? (isBn ? `ধন্যবাদ, ${firstName}!` : `Thank you, ${firstName}!`)
                                : (isBn ? "জমা দেওয়া যায়নি" : "Submission failed")}
                            <LuPlane size={15} className="-rotate-45 text-[#1a1a4e]" />
                        </p>
                        <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                            {ok
                                ? (isBn
                                    ? "আপনার ফ্লাইট ইনকোয়ারি সফলভাবে জমা হয়েছে। আমাদের টিম ২৪ ঘণ্টার মধ্যে WhatsApp-এ যোগাযোগ করবে।"
                                    : "Your flight inquiry has been submitted successfully. Our team will reach out on WhatsApp within 24 hours.")
                                : (errorText || (isBn ? "আবার চেষ্টা করুন।" : "Please try again."))}
                        </p>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="p-1 text-gray-300 hover:text-gray-500 flex-shrink-0" aria-label="Close">
                        <LuX size={14} />
                    </button>
                </div>
                {/* progress bar: shrinks 100% → 0% across the toast's life */}
                <div
                    className={`h-[3px] rounded-full ${ok ? "bg-[#10B981]" : "bg-red-400"} animate-progress-shrink`}
                    style={{ animationDuration: `${DURATION}ms` }}
                />
            </div>
        ),
        { duration: DURATION, position: "top-right" }
    );
}
