"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/autoplay";
import "swiper/css/pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ServiceCards() {
    const { language } = useLanguage();
    const isBn = language === "bn";

    const [tourCount, setTourCount] = useState(null);
    const [hajjCount, setHajjCount] = useState(null);
    const [umrahCount, setUmrahCount] = useState(null);
    const [content, setContent] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

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

        fetch(`${API_BASE}/api/home-content/services`)
            .then((r) => r.json())
            .then((d) => setContent(d?.data?.data || null))
            .catch(() => {});
    }, []);

    const getCardTitle = (id, fallbackBn, fallbackEn) => {
        if (!content || !content.items) return isBn ? fallbackBn : fallbackEn;
        const item = content.items.find(i => i.id === id);
        if (!item || !item.title) return isBn ? fallbackBn : fallbackEn;
        return isBn ? item.title.bn : item.title.en;
    };

    const getCardImage = (id, fallback) => {
        if (!content || !content.items) return fallback;
        const item = content.items.find(i => i.id === id);
        return item && item.image ? item.image : fallback;
    };

    const cards = [
        {
            id: "tour",
            label: getCardTitle("tour", "ট্যুর প্যাকেজ", "Tour Packages"),
            image: getCardImage("tour", "/images/tour-service.jpg"),
            href: "/tour",
            count: tourCount,
            countLabel: isBn ? "টি প্যাকেজ" : "packages",
        },
        {
            id: "hajj",
            label: getCardTitle("hajj", "হজ্জ", "Hajj"),
            image: getCardImage("hajj", "/images/hajj-service.jpg"),
            href: "/hajj-umrah?type=hajj",
            count: hajjCount,
            countLabel: isBn ? "টি প্যাকেজ" : "packages",
        },
        {
            id: "umrah",
            label: getCardTitle("umrah", "উমরাহ", "Umrah"),
            image: getCardImage("umrah", "/images/ummrah-service.jpg"),
            href: "/hajj-umrah?type=umrah",
            count: umrahCount,
            countLabel: isBn ? "টি প্যাকেজ" : "packages",
        },
        {
            id: "flight",
            label: getCardTitle("flight", "ফ্লাইট", "Flight"),
            image: getCardImage("flight", "/images/flight-service.jpg"),
            href: "/flight",
            count: null,
            countLabel: null,
        },
    ];

    const tagText = content?.tagText?.[isBn ? 'bn' : 'en'] || (isBn ? "আমাদের সেবা" : "Our Services");
    const headingText = content?.heading?.[isBn ? 'bn' : 'en'] || (isBn ? "আপনার স্বপ্নের যাত্রার জন্য" : "Everything You Need for");
    const headingHighlightText = content?.headingHighlight?.[isBn ? 'bn' : 'en'] || (isBn ? "সেরা সেবা" : "Your Journey");
    const descriptionText = content?.description?.[isBn ? 'bn' : 'en'] || (isBn 
        ? "ট্যুর প্যাকেজ থেকে শুরু করে হজ্জ, উমরাহ ও ফ্লাইট বুকিং — Divine Travelers-এ আপনার প্রতিটি ভ্রমণের প্রয়োজন পূরণ করা হয় বিশ্বস্ততার সাথে।" 
        : "From curated tour packages to Hajj, Umrah, and flight bookings — Divine Travelers covers every step of your journey with trusted expertise.");

    const sectionLabel = isBn ? "আমাদের সেবাসমূহ" : "We Offers";

    return (
        <section className="w-full bg-white">
            <style dangerouslySetInnerHTML={{__html: `
                .service-swiper {
                    width: 100%;
                    padding-top: 50px;
                    padding-bottom: 50px;
                }
                .service-swiper-slide {
                    width: 300px;
                    height: 450px;
                }
                @media (max-width: 768px) {
                    .service-swiper-slide {
                        width: 240px;
                        height: 360px;
                    }
                }
                @media (max-width: 480px) {
                    .service-swiper-slide {
                        width: 200px;
                        height: 300px;
                    }
                }
            `}} />
            
            {/* Section Header */}
            <div className="px-5 md:px-10 lg:px-14 pt-12 pb-8 flex flex-col items-center text-center">
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E64266]/20 bg-[#E64266]/[0.06] mb-5">
                    <span
                        className="text-[#E64266] text-[11px] font-semibold tracking-[0.25em] uppercase font-eyebrow"
                    >
                        {tagText}
                    </span>
                </div>

                {/* Big Title */}
                <h2
                    className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {headingText}{" "}
                    <span style={{ color: "#E64266" }}>{headingHighlightText}</span>
                </h2>

                {/* Short Description */}
                <p
                    className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
                    style={{ fontFamily: "var(--font-primary)" }}
                >
                    {descriptionText}
                </p>
            </div>

            {/* 3D Coverflow Slider for cards */}
            <div className="w-full max-w-[1200px] mx-auto pb-16 px-4 overflow-hidden relative" style={{ minHeight: '500px' }}>
                {!mounted ? (
                    <div className="w-full h-full flex items-center justify-center opacity-0">
                        {/* Placeholder to prevent layout shift */}
                    </div>
                ) : (
                    <Swiper
                    effect={"coverflow"}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={"auto"}
                    loop={true}
                    loopedSlides={4}
                    speed={800}
                    coverflowEffect={{
                        rotate: 50,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true,
                    }}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    pagination={{ clickable: true }}
                    modules={[EffectCoverflow, Autoplay, Pagination]}
                    className="service-swiper"
                >
                    {[...cards, ...cards].map((card, i) => (
                        <SwiperSlide 
                            key={`${card.id}-${i}`} 
                            className="service-swiper-slide rounded-2xl overflow-hidden shadow-2xl relative"
                        >
                            <Link
                                href={card.href}
                                className="group block w-full h-full cursor-pointer"
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Hover dark shadow overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 ease-out" />

                                {/* ── Card Content — bottom-center ── */}
                                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-10 px-4 pb-8">
                                    {/* Title — always visible, white, centered */}
                                    <h3
                                        className="text-white text-2xl font-bold text-center leading-tight transition-transform duration-500 group-hover:-translate-y-2"
                                        style={{
                                            fontFamily: "var(--font-heading)",
                                            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {card.label}
                                    </h3>

                                    {/* Count — hidden by default, slides up on hover */}
                                    {card.count !== null && (
                                        <div className="overflow-hidden mt-1" style={{ height: "30px" }}>
                                            <p
                                                className="text-[#E64266] text-[15px] font-bold tracking-wide text-center
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
                                <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#E64266] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-20" />
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
                )}
            </div>
        </section>
    );
}
