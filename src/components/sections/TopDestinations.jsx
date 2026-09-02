"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LuMapPin, LuClock, LuStar, LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Top Tour Destinations — homepage showcase of featured tour packages.
 * Pulls admin-marked featured tours (falls back to active tours) from the API.
 * Renders nothing if no tours are available.
 */
export default function TopDestinations() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bodyFont = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";

    const [tours, setTours] = useState([]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                // Prefer featured tours; fall back to active tours for the homepage.
                let res = await fetch(`${API_BASE}/api/tours/featured`);
                let data = await res.json();
                let list = data?.success && Array.isArray(data.data) ? data.data : [];
                if (list.length === 0) {
                    res = await fetch(`${API_BASE}/api/tours/active`);
                    data = await res.json();
                    list = data?.success && Array.isArray(data.data) ? data.data : [];
                }
                if (active) setTours(list.slice(0, 6));
            } catch (err) {
                console.error("Failed to fetch tours:", err);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    if (tours.length === 0) return null;

    const money = (tour) => {
        const symbol = !tour.currency || tour.currency === "BDT" ? "৳" : `${tour.currency} `;
        return `${symbol}${Number(tour.price || 0).toLocaleString()}`;
    };

    return (
        <section className="py-16 md:py-20 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#E64266]" />
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E64266]/15 bg-[#E64266]/[0.05]">
                                <span className="text-[#E64266] text-[10px] font-semibold tracking-[0.25em] uppercase font-eyebrow" style={{ fontFamily: bodyFont }}>
                                    {isBn ? "✦ জনপ্রিয় গন্তব্য" : "✦ Popular Destinations"}
                                </span>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-[#111827] leading-[1] uppercase" style={{ fontFamily: headingFont }}>
                            {isBn ? "সেরা ট্যুর " : "TOP TOUR "}
                            <span style={{ color: "#E64266" }}>{isBn ? "গন্তব্য" : "DESTINATIONS"}</span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-3 leading-relaxed" style={{ fontFamily: bodyFont }}>
                            {isBn
                                ? "আমাদের হাতে বাছাই করা আকর্ষণীয় ট্যুর প্যাকেজগুলো ঘুরে দেখুন এবং আপনার পরবর্তী গন্তব্য বেছে নিন।"
                                : "Explore our hand-picked tour packages and choose your next unforgettable destination."}
                        </p>
                    </div>
                    <Link
                        href="/tour"
                        className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 shrink-0"
                        style={{ fontFamily: bodyFont, background: "linear-gradient(135deg, #0F3C53 0%, #2A74A8 100%)" }}
                    >
                        {isBn ? "সব ট্যুর দেখুন" : "View All Tours"} <LuArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour, i) => (
                        <motion.div
                            key={tour._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link
                                href={`/tour/${tour.slug || tour._id}`}
                                className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#E64266]/30 hover:shadow-xl transition-all duration-500 h-full"
                            >
                                <div className="relative aspect-[16/11] overflow-hidden">
                                    <img
                                        src={tour.image || "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800"}
                                        alt={tour.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
                                        {/* Location Type */}
                                        {tour.locationType && (
                                            <span className="px-2.5 py-1 bg-[#E64266] text-white text-[9px] font-bold uppercase tracking-widest rounded-md shadow-sm" style={{ fontFamily: "var(--font-eyebrow)" }}>
                                                {tour.locationType}
                                            </span>
                                        )}
                                        {/* Destination pill */}
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/85 shadow-sm">
                                            <LuMapPin className="w-3.5 h-3.5 text-[#E64266]" />
                                            <span className="text-[11px] font-bold text-gray-800" style={{ fontFamily: bodyFont }}>
                                                {isBn ? (tour.destinationBn || tour.destination) : tour.destination}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Rating */}
                                    {tour.rating > 0 && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md bg-black/40">
                                            <LuStar className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                                            <span className="text-[11px] font-bold text-white" style={{ fontFamily: bodyFont }}>
                                                {Number(tour.rating).toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h3
                                        className="text-xl font-bold text-gray-900 line-clamp-1 uppercase group-hover:text-[#E64266] transition-colors"
                                        style={{ fontFamily: headingFont }}
                                    >
                                        {isBn ? (tour.titleBn || tour.title) : tour.title}
                                    </h3>

                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-medium" style={{ fontFamily: bodyFont }}>
                                        {tour.duration && (
                                            <span className="flex items-center gap-1.5">
                                                <LuClock className="w-3.5 h-3.5" />
                                                {isBn ? (tour.durationBn || tour.duration) : tour.duration}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block" style={{ fontFamily: bodyFont }}>
                                                {isBn ? "শুরু" : "From"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-[#0F3C53]" style={{ fontFamily: "var(--font-heading)" }}>
                                                    {money(tour)}
                                                </span>
                                                {tour.oldPrice > 0 && (
                                                    <span className="text-xs text-gray-300 line-through" style={{ fontFamily: "var(--font-heading)" }}>
                                                        {!tour.currency || tour.currency === "BDT" ? "৳" : `${tour.currency} `}{Number(tour.oldPrice).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="w-9 h-9 rounded-full bg-[#E64266]/10 flex items-center justify-center text-[#E64266] group-hover:bg-[#E64266] group-hover:text-white transition-all">
                                            <LuArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-10 flex justify-center md:hidden">
                    <Link
                        href="/tour"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white"
                        style={{ fontFamily: bodyFont, background: "linear-gradient(135deg, #0F3C53 0%, #2A74A8 100%)" }}
                    >
                        {isBn ? "সব ট্যুর দেখুন" : "View All Tours"} <LuArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
