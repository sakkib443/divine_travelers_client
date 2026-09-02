"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import {
    LuStar,
    LuPlus,
    LuX,
    LuLoader,
    LuCheck,
    LuChevronLeft,
    LuChevronRight,
    LuQuote,
} from "react-icons/lu";
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectToken,
} from "@/redux/features/authSlice";
import { useLanguage } from "@/context/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Testimonials() {
    const { t, language } = useLanguage();
    const isBn = language === "bn";
    const bnFont = "var(--font-primary)";
    const headingFont = "var(--font-heading)";

    const router = useRouter();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const token = useSelector(selectToken);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Fallback testimonials shown while no approved reviews exist
    const fallback = [
        {
            _id: "f1",
            name: t("testimonial1Name"),
            message: t("testimonial1Text"),
            rating: 5,
        },
        {
            _id: "f2",
            name: t("testimonial2Name"),
            message: t("testimonial2Text"),
            rating: 5,
        },
        {
            _id: "f3",
            name: t("testimonial3Name"),
            message: t("testimonial3Text"),
            rating: 5,
        },
    ];

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/approved`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setItems(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch testimonials:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const reviews = items.length > 0 ? items : fallback;

    const handleAddClick = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        setModalOpen(true);
    };

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto text-center">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#E64266]" />
                    <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#E64266]/15 bg-[#E64266]/[0.05]">
                        <span
                            className="text-[#E64266] text-xs font-semibold tracking-[0.25em] uppercase font-eyebrow"
                            style={{ fontFamily: bnFont }}
                        >
                            {t("testimonials")}
                        </span>
                    </div>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#E64266]" />
                </div>
                <h2
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 md:mb-14"
                    style={{
                        fontFamily: headingFont,
                        color: "#111827",
                        textTransform: "uppercase",
                    }}
                >
                    {t("voicesOfOur")}{" "}
                    <span style={{ color: "#0F3C53" }}>{t("clients")}</span>
                </h2>

                {/* Reviews Carousel */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LuLoader className="w-8 h-8 text-gray-300 animate-spin" />
                    </div>
                ) : (
                    <>
                        <Swiper
                            modules={[Autoplay, Navigation]}
                            spaceBetween={24}
                            slidesPerView={1}
                            loop={reviews.length > 3}
                            speed={700}
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                            }}
                            navigation={{
                                prevEl: ".testimonials-prev",
                                nextEl: ".testimonials-next",
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="!pb-2"
                        >
                            {reviews.map((review, i) => (
                                <SwiperSlide key={review._id || i} className="h-auto">
                                    <div className="relative h-full p-8 rounded-2xl border border-gray-100 bg-white text-left hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                                        {/* Quote icon */}
                                        <LuQuote className="absolute top-5 right-5 w-8 h-8 text-[#0F3C53]/10" />

                                        {/* Stars */}
                                        <div className="flex gap-1 mb-4">
                                            {Array.from({ length: review.rating || 5 }).map(
                                                (_, j) => (
                                                    <LuStar
                                                        key={j}
                                                        className="text-[#E64266] fill-[#E64266]"
                                                        size={16}
                                                    />
                                                )
                                            )}
                                        </div>

                                        {/* Message */}
                                        <p
                                            className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow line-clamp-5"
                                            style={{ fontFamily: bnFont }}
                                        >
                                            &quot;{review.message || review.text}&quot;
                                        </p>

                                        {/* Author */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                            {review.avatar ? (
                                                <img
                                                    src={review.avatar}
                                                    alt={review.name}
                                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                            ) : (
                                                <div
                                                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                                                    style={{
                                                        backgroundColor:
                                                            i % 2 === 0 ? "#0F3C53" : "#E64266",
                                                    }}
                                                >
                                                    {review.name?.[0] || "?"}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="font-bold text-gray-800 text-sm truncate"
                                                    style={{ fontFamily: bnFont }}
                                                >
                                                    {review.name}
                                                </p>
                                                <p
                                                    className="text-xs text-gray-400 truncate"
                                                    style={{ fontFamily: bnFont }}
                                                >
                                                    {review.role || t("verifiedClient")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Navigation Arrows */}
                        {reviews.length > 3 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button
                                    type="button"
                                    className="testimonials-prev w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0F3C53] hover:text-[#0F3C53] hover:bg-[#0F3C53]/5 transition-all duration-300 cursor-pointer"
                                    aria-label="Previous"
                                >
                                    <LuChevronLeft className="text-xl" />
                                </button>
                                <button
                                    type="button"
                                    className="testimonials-next w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0F3C53] hover:text-[#0F3C53] hover:bg-[#0F3C53]/5 transition-all duration-300 cursor-pointer"
                                    aria-label="Next"
                                >
                                    <LuChevronRight className="text-xl" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Add Review Button */}
                <div className="mt-10 flex flex-col items-center gap-3">
                    <button
                        onClick={handleAddClick}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F3C53] hover:bg-[#1565c0] text-white rounded-full font-semibold text-[13px] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                        style={{ fontFamily: bnFont }}
                    >
                        <LuPlus className="w-4 h-4" />
                        {isBn ? "আপনার রিভিউ যোগ করুন" : "Add Your Review"}
                    </button>
                    {!isAuthenticated && (
                        <p className="text-xs text-gray-400" style={{ fontFamily: bnFont }}>
                            {isBn
                                ? "রিভিউ দিতে আগে লগইন করুন"
                                : "Login first to submit a review"}
                        </p>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <ReviewModal
                        onClose={() => setModalOpen(false)}
                        onSuccess={fetchTestimonials}
                        token={token}
                        user={user}
                        isBn={isBn}
                        bnFont={bnFont}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}

// ───── Review Modal ─────────────────────────────────────────────────────────
function ReviewModal({ onClose, onSuccess, token, user, isBn, bnFont }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (message.trim().length < 10) {
            setError(
                isBn
                    ? "রিভিউ কমপক্ষে ১০ অক্ষরের হতে হবে"
                    : "Review must be at least 10 characters"
            );
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/testimonials`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating,
                    message: message.trim(),
                    role: role.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to submit review");
            }
            setSuccess(true);
            onSuccess?.();
            setTimeout(onClose, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3
                        className="text-lg font-bold text-gray-900"
                        style={{ fontFamily: bnFont }}
                    >
                        {isBn ? "আপনার অভিজ্ঞতা শেয়ার করুন" : "Share Your Experience"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                        aria-label="Close"
                    >
                        <LuX className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                {success ? (
                    <div className="px-6 py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <LuCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <p
                            className="text-gray-800 font-semibold mb-1"
                            style={{ fontFamily: bnFont }}
                        >
                            {isBn ? "ধন্যবাদ!" : "Thank You!"}
                        </p>
                        <p
                            className="text-gray-500 text-sm"
                            style={{ fontFamily: bnFont }}
                        >
                            {isBn
                                ? "আপনার রিভিউ approval এর জন্য পাঠানো হয়েছে"
                                : "Your review has been submitted for approval"}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="px-6 py-5 space-y-4">
                        {/* User info */}
                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                            <div className="w-9 h-9 rounded-full bg-[#0F3C53] flex items-center justify-center text-white font-bold text-sm">
                                {user?.firstName?.[0] || user?.email?.[0] || "?"}
                            </div>
                            <div>
                                <p
                                    className="text-sm font-semibold text-gray-800"
                                    style={{ fontFamily: bnFont }}
                                >
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label
                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2"
                                style={{ fontFamily: bnFont }}
                            >
                                {isBn ? "রেটিং" : "Rating"}
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 cursor-pointer"
                                    >
                                        <LuStar
                                            size={28}
                                            className={
                                                (hoverRating || rating) >= star
                                                    ? "fill-[#E64266] text-[#E64266]"
                                                    : "text-gray-300"
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Role (optional) */}
                        <div>
                            <label
                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2"
                                style={{ fontFamily: bnFont }}
                            >
                                {isBn ? "পেশা / শহর (ঐচ্ছিক)" : "Role / City (optional)"}
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder={
                                    isBn
                                        ? "যেমন: ব্যবসায়ী, ঢাকা"
                                        : "e.g. Business Owner, Dhaka"
                                }
                                maxLength={100}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10"
                                style={{ fontFamily: bnFont }}
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label
                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2"
                                style={{ fontFamily: bnFont }}
                            >
                                {isBn ? "আপনার রিভিউ" : "Your Review"}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder={
                                    isBn
                                        ? "Divine Travelers এর সাথে আপনার অভিজ্ঞতা লিখুন..."
                                        : "Tell us about your experience with Divine Travelers..."
                                }
                                maxLength={1000}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 resize-none"
                                style={{ fontFamily: bnFont }}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 text-right">
                                {message.length}/1000
                            </p>
                        </div>

                        {error && (
                            <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                            style={{ fontFamily: bnFont }}
                        >
                            {submitting ? (
                                <>
                                    <LuLoader className="w-4 h-4 animate-spin" />
                                    {isBn ? "জমা হচ্ছে..." : "Submitting..."}
                                </>
                            ) : isBn ? (
                                "রিভিউ জমা দিন"
                            ) : (
                                "Submit Review"
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
}
