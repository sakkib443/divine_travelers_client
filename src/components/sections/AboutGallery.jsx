"use client";

// ===================================================================
// AboutGallery Component
// A dynamic photo & video gallery mosaic matching the exact 8-slot layout.
// Left: 3 cards | Center: 2 tall cards | Right: 3 cards.
// Supports custom image upload and YouTube video playback in modal.
// ===================================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuPlay, LuMaximize2, LuX, LuVideo } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Extracts 11-character YouTube video ID from various URL formats
 */
export function extractYouTubeId(url) {
    if (!url || typeof url !== "string") return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

export default function AboutGallery({ content = null }) {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const font = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const heading = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";

    const [activeVideo, setActiveVideo] = useState(null); // { id, title }
    const [activePhoto, setActivePhoto] = useState(null); // { url, title }

    if (!content || content.isActive === false) return null;

    const t = (field) => (field ? (isBn ? field.bn || field.en : field.en || field.bn) : "");

    // Normalizing 8 items map by slot (1 to 8)
    const rawItems = Array.isArray(content.items) ? content.items : [];
    const itemsBySlot = {};
    rawItems.forEach((item) => {
        if (item && item.slot) {
            itemsBySlot[item.slot] = item;
        }
    });

    const getItem = (slotNum) => {
        return itemsBySlot[slotNum] || {
            slot: slotNum,
            type: "image",
            imageUrl: "",
            youtubeUrl: "",
            title: { en: "", bn: "" },
        };
    };

    // Slots arranged as per user's layout:
    // Left column: 1, 2, 3
    // Center column: 4, 5 (tall cards)
    // Right column: 6, 7, 8
    const colLeft = [getItem(1), getItem(2), getItem(3)];
    const colCenter = [getItem(4), getItem(5)];
    const colRight = [getItem(6), getItem(7), getItem(8)];

    // Handler when user clicks on a gallery card
    const handleCardClick = (item) => {
        const isVideo = item.type === "video" || Boolean(item.youtubeUrl);
        if (isVideo) {
            const vidId = extractYouTubeId(item.youtubeUrl);
            if (vidId) {
                setActiveVideo({
                    id: vidId,
                    title: t(item.title) || (isBn ? "ভিডিও দেখুন" : "Watch Video"),
                });
                return;
            }
        }
        if (item.imageUrl) {
            setActivePhoto({
                url: item.imageUrl,
                title: t(item.title) || "",
            });
        }
    };

    // Helper to resolve card image source
    const getCardImage = (item) => {
        if (item.imageUrl) return item.imageUrl;
        const vidId = extractYouTubeId(item.youtubeUrl);
        if (vidId) return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
        return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";
    };

    // Individual card renderer
    const renderCard = (item, heightClass, isTall = false) => {
        const isVideo = item.type === "video" || Boolean(item.youtubeUrl);
        const imgSrc = getCardImage(item);
        const cardTitle = t(item.title);

        return (
            <motion.div
                key={item.slot}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (item.slot - 1) * 0.06 }}
                onClick={() => handleCardClick(item)}
                className={`group relative ${heightClass} w-full rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-gray-100 border border-black/5`}
            >
                {/* Background image */}
                <img
                    src={imgSrc}
                    alt={cardTitle || `Gallery item ${item.slot}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                />

                {/* Ambient dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Video Indicator Pill */}
                {isVideo && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E64266]/90 backdrop-blur-md text-white text-[11px] font-bold shadow-lg tracking-wider uppercase">
                        <LuVideo className="w-3.5 h-3.5" />
                        <span>{isBn ? "ভিডিও" : "Video"}</span>
                    </div>
                )}

                {/* Central Action Button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    {isVideo ? (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-[#E64266] flex items-center justify-center shadow-xl shadow-black/20 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E64266] group-hover:text-white">
                            <LuPlay className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5" fill="currentColor" />
                        </div>
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <LuMaximize2 className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Bottom Title Bar */}
                {cardTitle && (
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10">
                        <p
                            className="text-white text-sm sm:text-base font-semibold drop-shadow-md leading-tight line-clamp-2 group-hover:text-amber-200 transition-colors"
                            style={{ fontFamily: font }}
                        >
                            {cardTitle}
                        </p>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <section className="py-20 md:py-28 bg-white relative overflow-hidden" style={{ fontFamily: font }}>
            {/* Subtle decorative background glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#E64266]/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#0F3C53]/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10">
                {/* ─── Header ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14 md:mb-16 max-w-3xl mx-auto"
                >
                    {t(content.eyebrow) && (
                        <span
                            className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow px-3.5 py-1.5 rounded-full bg-[#E64266]/10 inline-block mb-3"
                            style={{ color: "#E64266" }}
                        >
                            {t(content.eyebrow)}
                        </span>
                    )}
                    <h2
                        className="font-black uppercase tracking-tight mt-1 mb-4"
                        style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(2rem, 4vw, 3.1rem)" }}
                    >
                        {t(content.heading) || (isBn ? "আমাদের ভ্রমণ গ্যালারি" : "Moments Captured Around The World")}
                    </h2>
                    {t(content.description) && (
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto">
                            {t(content.description)}
                        </p>
                    )}
                </motion.div>

                {/* ─── Desktop 3-Column Layout (Matching User Image with 6px gap) ─── */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-[6px] items-start">
                    {/* Column 1 (Left - 3 items) */}
                    <div className="flex flex-col gap-[6px]">
                        {renderCard(colLeft[0], "h-[260px]")}
                        {renderCard(colLeft[1], "h-[260px]")}
                        {renderCard(colLeft[2], "h-[260px]")}
                    </div>

                    {/* Column 2 (Center - 2 tall items) */}
                    <div className="flex flex-col gap-[6px]">
                        {renderCard(colCenter[0], "h-[393px]", true)}
                        {renderCard(colCenter[1], "h-[393px]", true)}
                    </div>

                    {/* Column 3 (Right - 3 items) */}
                    <div className="flex flex-col gap-[6px]">
                        {renderCard(colRight[0], "h-[245px]")}
                        {renderCard(colRight[1], "h-[255px]")}
                        {renderCard(colRight[2], "h-[286px]")}
                    </div>
                </div>

                {/* ─── Mobile & Tablet Layout (Responsive & Touch Friendly with 6px gap) ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-[6px]">
                    {/* Left Column for Mobile */}
                    <div className="flex flex-col gap-[6px]">
                        {renderCard(colLeft[0], "h-[220px] sm:h-[250px]")}
                        {renderCard(colCenter[0], "h-[300px] sm:h-[350px]", true)}
                        {renderCard(colLeft[1], "h-[220px] sm:h-[250px]")}
                        {renderCard(colRight[1], "h-[220px] sm:h-[250px]")}
                    </div>

                    {/* Right Column for Mobile */}
                    <div className="flex flex-col gap-[6px]">
                        {renderCard(colRight[0], "h-[220px] sm:h-[250px]")}
                        {renderCard(colLeft[2], "h-[220px] sm:h-[250px]")}
                        {renderCard(colCenter[1], "h-[300px] sm:h-[350px]", true)}
                        {renderCard(colRight[2], "h-[250px] sm:h-[280px]")}
                    </div>
                </div>
            </div>

            {/* ════════ Video Modal Popup ════════ */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                        onClick={() => setActiveVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gray-900/90 border-b border-white/10">
                                <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[80%]">
                                    {activeVideo.title}
                                </p>
                                <button
                                    onClick={() => setActiveVideo(null)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Responsive 16:9 Video Embed */}
                            <div className="relative w-full aspect-video bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full border-0"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ════════ Photo Lightbox Modal ════════ */}
            <AnimatePresence>
                {activePhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                        onClick={() => setActivePhoto(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActivePhoto(null)}
                                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                title="Close"
                            >
                                <LuX className="w-6 h-6" />
                            </button>
                            <img
                                src={activePhoto.url}
                                alt={activePhoto.title || "Full photo"}
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                            />
                            {activePhoto.title && (
                                <p className="mt-4 text-white text-base font-semibold drop-shadow text-center">
                                    {activePhoto.title}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
