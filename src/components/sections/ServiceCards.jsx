"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ServiceCards() {
    const { language } = useLanguage();
    const isBn = language === "bn";

    const [tourCount, setTourCount] = useState(null);
    const [hajjCount, setHajjCount] = useState(null);
    const [umrahCount, setUmrahCount] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/tours?limit=1`)
            .then((r) => r.json())
            .then((d) => setTourCount(d?.meta?.total ?? null))
            .catch(() => {});

        fetch(`${API_BASE}/api/hajj-umrah?type=hajj&limit=1`)
            .then((r) => r.json())
            .then((d) => setHajjCount(d?.meta?.total ?? null))
            .catch(() => {});

        fetch(`${API_BASE}/api/hajj-umrah?type=umrah&limit=1`)
            .then((r) => r.json())
            .then((d) => setUmrahCount(d?.meta?.total ?? null))
            .catch(() => {});
    }, []);

    const cards = [
        {
            id: "tour",
            label: isBn ? "ট্যুর প্যাকেজ" : "Tour Packages",
            image: "/images/tour-service.jpg",
            href: "/tour",
            count: tourCount,
            countLabel: isBn ? "টি প্যাকেজ" : "packages",
        },
        {
            id: "hajj",
            label: isBn ? "হজ্জ" : "Hajj",
            image: "/images/hajj-service.jpg",
            href: "/hajj-umrah?type=hajj",
            count: hajjCount,
            countLabel: isBn ? "টি প্যাকেজ" : "packages",
        },
        {
            id: "umrah",
            label: isBn ? "উমরাহ" : "Umrah",
            image: "/images/ummrah-service.jpg",
            href: "/hajj-umrah?type=umrah",
            count: umrahCount,
            countLabel: isBn ? "টি প্যাকেজ" : "packages",
        },
        {
            id: "flight",
            label: isBn ? "ফ্লাইট" : "Flight",
            image: "/images/flight-service.jpg",
            href: "/flight",
            count: null,
            countLabel: null,
        },
    ];

    const sectionLabel = isBn ? "আমাদের সেবাসমূহ" : "We Offers";

    return (
        <section className="w-full bg-white">
            {/* Section Header */}
            <div className="px-5 md:px-10 lg:px-14 pt-12 pb-8 flex flex-col items-center text-center">
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E64266]/20 bg-[#E64266]/[0.06] mb-5">
                    <span
                        className="text-[#E64266] text-[11px] font-semibold tracking-[0.25em] uppercase font-eyebrow"
                    >
                        {isBn ? "আমাদের সেবা" : "Our Services"}
                    </span>
                </div>

                {/* Big Title */}
                <h2
                    className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {isBn ? (
                        <>
                            আপনার স্বপ্নের যাত্রার জন্য{" "}
                            <span style={{ color: "#E64266" }}>সেরা সেবা</span>
                        </>
                    ) : (
                        <>
                            Everything You Need for{" "}
                            <span style={{ color: "#E64266" }}>Your Journey</span>
                        </>
                    )}
                </h2>

                {/* Short Description */}
                <p
                    className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
                    style={{ fontFamily: "var(--font-primary)" }}
                >
                    {isBn
                        ? "ট্যুর প্যাকেজ থেকে শুরু করে হজ্জ, উমরাহ ও ফ্লাইট বুকিং — Divine Travelers-এ আপনার প্রতিটি ভ্রমণের প্রয়োজন পূরণ করা হয় বিশ্বস্ততার সাথে।"
                        : "From curated tour packages to Hajj, Umrah, and flight bookings — Divine Travelers covers every step of your journey with trusted expertise."}
                </p>
            </div>

            {/* Full-width 4-column portrait cards */}
            <div className="flex flex-col sm:flex-row w-full" style={{ minHeight: "480px" }}>
                {cards.map((card, i) => (
                    <Link
                        key={card.id}
                        href={card.href}
                        className="group relative flex-1 overflow-hidden cursor-pointer"
                        style={{ minHeight: "480px" }}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={card.image}
                                alt={card.label}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </div>

                        {/* Base gradient — always present */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                        {/* Hover dark shadow overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 ease-out" />

                        {/* Vertical divider between cards (desktop only) */}
                        {i < cards.length - 1 && (
                            <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-white/10 z-10 hidden sm:block" />
                        )}

                        {/* ── Card Content — bottom-center ── */}
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-10 px-4 pb-8">
                            {/* Title — always visible, white, centered */}
                            <h3
                                className="text-white text-[22px] md:text-2xl font-bold text-center leading-tight"
                                style={{
                                    fontFamily: "var(--font-heading)",
                                    textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                                    color: "#ffffff",
                                }}
                            >
                                {card.label}
                            </h3>

                            {/* Count — hidden by default, slides up on hover */}
                            {card.count !== null && (
                                <div className="overflow-hidden mt-2" style={{ height: "32px" }}>
                                    <p
                                        className="text-[#E64266] text-[17px] font-bold tracking-wide text-center
                                                   translate-y-full group-hover:translate-y-0
                                                   opacity-0 group-hover:opacity-100
                                                   transition-all duration-500 ease-out"
                                    >
                                        {card.count} {card.countLabel}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom accent bar on hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E64266] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-20" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
