"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useLanguage } from "@/context/LanguageContext";
import { LuStar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

import "swiper/css";
import "swiper/css/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PopularTours() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch up to 10 tours for the slider
        fetch(`${API_BASE}/api/tours?limit=10`)
            .then((r) => r.json())
            .then((d) => {
                if (d.success && d.data) {
                    setTours(d.data);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || tours.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden relative">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                    <h2 
                        className="text-3xl md:text-4xl font-bold text-gray-900"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        {isBn ? "আমাদের জনপ্রিয় ট্যুর" : "Our Popular Tours"}
                    </h2>
                    
                    <Link 
                        href="/tour"
                        className="text-[#E64266] font-medium hover:underline tracking-wide"
                    >
                        {isBn ? "সব ট্যুর দেখুন" : "View All Tours"}
                    </Link>
                </div>

                {/* Slider */}
                <div className="relative group">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={28}
                        slidesPerView={1}
                        loop={tours.length >= 3}
                        speed={800}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true, // Pauses on hover as requested
                        }}
                        navigation={{
                            prevEl: ".popular-prev",
                            nextEl: ".popular-next",
                        }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                        }}
                        className="!pb-14"
                    >
                        {tours.map((tour) => (
                            <SwiperSlide key={tour._id}>
                                <div className="bg-white rounded-[20px] overflow-hidden h-full flex flex-col group/card shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-50 transition-all duration-300">
                                    {/* Image Container */}
                                    <div className="relative h-[220px] overflow-hidden">
                                        <img 
                                            src={tour.image} 
                                            alt={isBn ? (tour.titleBn || tour.title) : tour.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                                        />
                                        
                                        {/* Badge */}
                                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-[11px] font-semibold tracking-widest uppercase">
                                            {isBn ? "জনপ্রিয় ট্যুর" : "Popular Tour"}
                                        </div>
                                    </div>
                                    
                                    {/* Content Container */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Rating & Reviews */}
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <div className="flex text-black gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <LuStar 
                                                        key={i} 
                                                        className={`text-[12px] ${i < Math.floor(tour.rating || 5) ? 'fill-black' : 'fill-transparent text-gray-300'}`} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-gray-400 text-[11px] mt-0.5 font-medium tracking-wide" style={{ fontFamily: "var(--font-primary)" }}>
                                                ({tour.reviewsCount || 0} {isBn ? "রিভিউ" : "Reviews"})
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 
                                            className="text-[17px] font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover/card:text-[#E64266] transition-colors"
                                            style={{ fontFamily: "var(--font-heading)" }}
                                        >
                                            {isBn ? (tour.titleBn || tour.title) : tour.title}
                                        </h3>

                                        {/* Details */}
                                        <div className="flex flex-col gap-1.5 mb-5" style={{ fontFamily: "var(--font-primary)" }}>
                                            <p className="text-gray-500 text-[12.5px] font-medium flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                {isBn ? (tour.durationBn || tour.duration) : tour.duration}
                                            </p>
                                            <p className="text-gray-500 text-[12.5px] font-medium flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                {isBn ? (tour.destinationBn || tour.destination) : tour.destination}
                                            </p>
                                        </div>

                                        {/* Price & Button Container */}
                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">{isBn ? "শুরু" : "Starts From"}</span>
                                                <div className="flex items-center gap-1.5">
                                                    {tour.oldPrice && (
                                                        <span className="text-gray-400 text-[13px] line-through decoration-gray-300">
                                                            ৳{tour.oldPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span className="text-[#E64266] font-black text-[17px]">
                                                        ৳{tour.price?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <Link 
                                                href={`/tour/${tour.slug}`}
                                                className="px-4 py-2 rounded-full bg-[#0F172A] text-white font-semibold text-[12px] hover:bg-[#E64266] transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                {isBn ? "বিস্তারিত দেখুন" : "View Details"}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Arrows */}
                    <button className="popular-prev absolute top-[35%] -left-4 md:-left-6 lg:-left-12 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#E64266] hover:border-[#E64266] shadow-md hover:shadow-lg z-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <LuChevronLeft className="text-xl" />
                    </button>
                    <button className="popular-next absolute top-[35%] -right-4 md:-right-6 lg:-right-12 w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#E64266] hover:border-[#E64266] shadow-md hover:shadow-lg z-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <LuChevronRight className="text-xl" />
                    </button>
                </div>
            </div>
        </section>
    );
}
