"use client";

// ===================================================================
// /flight — Flight Booking Inquiry page
// One centered card: trip details (autofilled from the hero's URL
// params) + contact block. Submits to POST /api/inquiries and stays
// on the page with a slide-in success toast.
// ===================================================================

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toastLib from "react-hot-toast";
import {
    LuPlane, LuPlaneTakeoff, LuPlaneLanding, LuLoader, LuSend, LuChevronRight,
    LuUser, LuPhone, LuMail, LuMessageSquare,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";
import {
    FROM_AIRPORTS, TO_AIRPORTS, defaultDepartDate, parseFlightParams, buildFlightSummary,
} from "@/utils/flight";
import {
    TripTypePills, AirportField, SwapButton, PassengerStepper, CabinSelect,
    FlightDateField, LegsEditor, showFlightToast,
} from "@/components/flight/FlightFields";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const NAVY = "#1a1a4e";

const initialForm = () => ({
    tripType: "oneway",
    from: "",
    to: "",
    departDate: defaultDepartDate(),
    returnDate: "",
    passengers: 1,
    cabin: "economy",
    legs: [],
    name: "",
    phone: "",
    email: "",
    note: "",
});

function FlightInquiryContent() {
    const searchParams = useSearchParams();
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const bnFont = "var(--font-primary)";
    const headingFont = "var(--font-heading)";

    const [f, setF] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

    // ── Autofill everything from the hero's URL params on mount ──
    useEffect(() => {
        const parsed = parseFlightParams(searchParams);
        setF((p) => ({
            ...p,
            tripType: parsed.tripType || p.tripType,
            from: parsed.from || p.from,
            to: parsed.to || p.to,
            departDate: parsed.departDate || p.departDate,
            returnDate: parsed.returnDate || p.returnDate,
            passengers: Math.max(1, Math.min(9, Number(parsed.passengers) || p.passengers)),
            cabin: parsed.cabin || p.cabin,
            legs: parsed.legs.length ? parsed.legs : p.legs,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Round Way needs a return date field; multi needs legs — keep state tidy
    const onTripType = (t) => {
        setF((p) => ({
            ...p,
            tripType: t,
            legs: t === "multi" && p.legs.length === 0 ? [{ from: "", to: "", date: "" }] : p.legs,
        }));
    };

    // toast the specific missing field and return false
    const fail = (msg) => { toastLib.error(msg); return false; };
    const validate = () => {
        if (!f.from) return fail(isBn ? "কোথা থেকে যাবেন সেটা বাছাই করুন" : "Please select the From airport");
        if (!f.to) return fail(isBn ? "গন্তব্য বাছাই করুন" : "Please select the To airport");
        if (!f.departDate) return fail(isBn ? "যাত্রার তারিখ দিন" : "Please pick a departure date");
        if (!f.name.trim()) return fail(isBn ? "আপনার নাম লিখুন" : "Please enter your full name");
        if (!f.phone.trim()) return fail(isBn ? "WhatsApp নম্বর দিন" : "Please enter your WhatsApp number");
        return true;
    };

    const summary = buildFlightSummary(f, f.note);

    const handleSubmit = async () => {
        if (validate() !== true) return;
        setSubmitting(true);
        try {
            const body = {
                service: "flight-booking",
                serviceLabel: "Flight Booking",
                name: f.name.trim(),
                email: f.email.trim(),
                phone: f.phone.trim(),
                subject: `Flight: ${f.from} → ${f.to}`,
                message: summary,
                extra: {
                    tripType: f.tripType,
                    from: f.from,
                    to: f.to,
                    departDate: f.departDate,
                    returnDate: f.tripType === "round" ? f.returnDate : "",
                    passengers: String(f.passengers),
                    cabin: f.cabin,
                    ...(f.tripType === "multi" ? { legs: f.legs } : {}),
                },
                pageUrl: typeof window !== "undefined" ? window.location.href : "",
            };
            const res = await fetch(`${BACKEND}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Something went wrong");

            const firstName = f.name.trim().split(/\s+/)[0];
            showFlightToast({ ok: true, firstName, isBn });
            setF(initialForm()); // stay on the page, reset everything
        } catch (err) {
            showFlightToast({ ok: false, isBn, errorText: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const openWhatsApp = () => {
        const text = `${isBn ? "ফ্লাইট ইনকোয়ারি" : "Flight inquiry"}:\n${summary}${f.name ? `\nName: ${f.name}` : ""}`;
        const url = buildWhatsAppUrl(settings, text);
        if (url) window.open(url, "_blank");
    };

    const label = "text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5";
    const input = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none bg-white";

    return (
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: bnFont || "Poppins, sans-serif" }}>
            <div className="max-w-3xl mx-auto py-10 md:py-14 px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-4" style={{ fontFamily: bnFont }}>
                    <Link href="/" className="hover:text-[#1a1a4e] transition">{isBn ? "হোম" : "Home"}</Link>
                    <LuChevronRight size={12} />
                    <span className="text-gray-600 font-semibold">{isBn ? "ফ্লাইট ইনকোয়ারি" : "Flight Inquiry"}</span>
                </nav>

                {/* Heading */}
                <h1
                    className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6"
                    style={{ fontFamily: headingFont, color: NAVY }}
                >
                    {isBn ? "ফ্লাইট বুকিং ইনকোয়ারি" : "FLIGHT BOOKING INQUIRY"}
                </h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-2xl bg-white border border-gray-100 shadow-lg p-5 md:p-8 space-y-5"
                >
                    {/* Trip type */}
                    <TripTypePills value={f.tripType} onChange={onTripType} isBn={isBn} bnFont={bnFont} />

                    {/* From / To with mobile swap */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3 items-center">
                        <AirportField
                            label={isBn ? "কোথা থেকে" : "From"}
                            value={f.from}
                            onChange={(v) => set("from", v)}
                            options={FROM_AIRPORTS}
                            placeholder={isBn ? "শহর বা এয়ারপোর্ট" : "City or airport"}
                            icon={<LuPlaneTakeoff size={17} />}
                            isBn={isBn} bnFont={bnFont}
                        />
                        <SwapButton onClick={() => setF((p) => ({ ...p, from: p.to, to: p.from }))} />
                        <AirportField
                            label={isBn ? "কোথায়" : "To"}
                            value={f.to}
                            onChange={(v) => set("to", v)}
                            options={TO_AIRPORTS}
                            placeholder={isBn ? "শহর বা এয়ারপোর্ট" : "City or airport"}
                            icon={<LuPlaneLanding size={17} />}
                            isBn={isBn} bnFont={bnFont}
                        />
                    </div>

                    {/* Dates + passengers + class */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${f.tripType === "round" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-2.5 lg:gap-3`}>
                        <FlightDateField label={isBn ? "যাত্রার তারিখ" : "Departure"} value={f.departDate} onChange={(v) => set("departDate", v)} isBn={isBn} bnFont={bnFont} />
                        {f.tripType === "round" && (
                            <FlightDateField label={isBn ? "ফেরার তারিখ" : "Return"} value={f.returnDate} onChange={(v) => set("returnDate", v)} isBn={isBn} bnFont={bnFont} />
                        )}
                        <PassengerStepper value={f.passengers} onChange={(v) => set("passengers", v)} isBn={isBn} bnFont={bnFont} />
                        <CabinSelect value={f.cabin} onChange={(v) => set("cabin", v)} isBn={isBn} bnFont={bnFont} />
                    </div>

                    {/* Multi-city legs */}
                    {f.tripType === "multi" && (
                        <LegsEditor legs={f.legs} setLegs={(legs) => set("legs", legs)} fromOptions={FROM_AIRPORTS} toOptions={TO_AIRPORTS} isBn={isBn} bnFont={bnFont} />
                    )}

                    <hr className="border-gray-100" />

                    {/* Contact block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={label} style={{ fontFamily: bnFont }}>{isBn ? "পুরো নাম *" : "Full name *"}</label>
                            <div className="relative">
                                <LuUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input value={f.name} onChange={(e) => set("name", e.target.value)} className={`${input} pl-10`} placeholder={isBn ? "আপনার নাম" : "Your name"} />
                            </div>
                        </div>
                        <div>
                            <label className={label} style={{ fontFamily: bnFont }}>{isBn ? "WhatsApp নম্বর *" : "WhatsApp number *"}</label>
                            <div className="relative">
                                <LuPhone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input value={f.phone} onChange={(e) => set("phone", e.target.value)} className={`${input} pl-10`} placeholder="01XXXXXXXXX" />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={label} style={{ fontFamily: bnFont }}>{isBn ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)"}</label>
                            <div className="relative">
                                <LuMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={`${input} pl-10`} placeholder="you@example.com" />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={label} style={{ fontFamily: bnFont }}>{isBn ? "বার্তা (ঐচ্ছিক)" : "Message (optional)"}</label>
                            <div className="relative">
                                <LuMessageSquare size={15} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                                <textarea rows={3} value={f.note} onChange={(e) => set("note", e.target.value)} className={`${input} pl-10 resize-none`} placeholder={isBn ? "বিশেষ কিছু জানানোর থাকলে লিখুন…" : "Anything specific we should know…"} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-[13px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
                            style={{ background: NAVY, fontFamily: bnFont }}
                        >
                            {submitting ? <LuLoader size={16} className="animate-spin" /> : <LuSend size={15} />}
                            {submitting ? (isBn ? "জমা হচ্ছে…" : "Submitting…") : (isBn ? "ইনকোয়ারি জমা দিন" : "Submit Inquiry")}
                        </button>
                        <button
                            type="button"
                            onClick={openWhatsApp}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-[13px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ background: "#25D366", fontFamily: bnFont }}
                        >
                            <FaWhatsapp size={16} />
                            {isBn ? "WhatsApp-এ পাঠান" : "WhatsApp instead"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function FlightInquiryPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                    <LuPlane size={28} className="-rotate-45 text-[#1a1a4e] animate-pulse" />
                </div>
            }
        >
            <FlightInquiryContent />
        </Suspense>
    );
}
