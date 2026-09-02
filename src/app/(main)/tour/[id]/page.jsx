"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LuArrowLeft,
    LuClock,
    LuMapPin,
    LuStar,
    LuCalendarDays,
    LuPhone,
    LuMessageCircle,
    LuChevronRight,
    LuCircleCheck,
    LuCircleDot,
    LuUsers,
    LuShieldCheck,
    LuPlane,
    LuCamera,
    LuUtensils,
    LuBed,
    LuArrowRight,
    LuLoader,
    LuCircleX
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/context/SiteSettingsContext";
import Link from "next/link";
import BookingModal from "@/components/shared/BookingModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TourDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === 'bn';
    const fontFamily = isBn ? 'Hind Siliguri, sans-serif' : 'Poppins, sans-serif';
    const headingFont = isBn ? 'Hind Siliguri, sans-serif' : 'var(--font-heading)';

    const [tour, setTour] = useState(null);
    const [relatedTours, setRelatedTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchTour = async () => {
            setLoading(true);
            setError(false);
            try {
                // Try fetching by slug first, then by ID
                let res = await fetch(`${API_BASE}/api/tours/slug/${id}`);
                let data = await res.json();

                if (!data.success) {
                    // Fallback to ID
                    res = await fetch(`${API_BASE}/api/tours/${id}`);
                    data = await res.json();
                }

                if (data.success && data.data) {
                    setTour(data.data);
                    // Fetch related tours
                    const allRes = await fetch(`${API_BASE}/api/tours/active`);
                    const allData = await allRes.json();
                    if (allData.success && allData.data) {
                        setRelatedTours(allData.data.filter(t => t._id !== data.data._id).slice(0, 3));
                    }
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTour();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="text-center">
                    <LuLoader size={40} className="animate-spin mx-auto mb-4" style={{ color: '#E64266' }} />
                    <p className="text-gray-400 text-sm" style={{ fontFamily }}>{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-300 uppercase" style={{ fontFamily: headingFont }}>
                        {isBn ? 'ট্যুর পাওয়া যায়নি' : 'Tour Not Found'}
                    </h1>
                    <Link href="/tour" className="mt-4 inline-block text-sm font-bold text-[#E64266] hover:underline" style={{ fontFamily }}>
                        {isBn ? 'ট্যুর পেজে ফিরুন' : 'Back to Tours'}
                    </Link>
                </div>
            </div>
        );
    }

    const getCurrencySymbol = (c) => c === 'USD' ? '$' : '৳';
    const sym = getCurrencySymbol(tour.currency);
    const savings = (tour.oldPrice || 0) - (tour.price || 0);

    return (
        <div className="bg-[#F9FAFB] min-h-screen">
            <div className="h-16" />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20">

                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[12px] text-gray-400 mb-6"
                    style={{ fontFamily }}
                >
                    <Link href="/" className="hover:text-gray-700 transition-colors">{isBn ? 'হোম' : 'Home'}</Link>
                    <LuChevronRight size={12} />
                    <Link href="/tour" className="hover:text-gray-700 transition-colors">{isBn ? 'ট্যুর' : 'Tour'}</Link>
                    <LuChevronRight size={12} />
                    <span className="text-gray-700 font-semibold">{isBn ? (tour.titleBn || tour.title) : tour.title}</span>
                </motion.nav>

                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden mb-10"
                >
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-grow p-6 md:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors"
                                    style={{ fontFamily }}
                                >
                                    <LuArrowLeft size={14} />
                                    {isBn ? 'পিছনে' : 'Back'}
                                </button>
                                <div className="h-4 w-px bg-gray-200" />
                                {tour.isFeatured && (
                                    <span className="px-2.5 py-1 bg-[#E64266] text-white text-[8px] font-bold uppercase tracking-widest rounded-md font-eyebrow">
                                        {isBn ? 'ফিচার্ড' : 'Featured'}
                                    </span>
                                )}
                                {tour.locationType && (
                                    <span className="px-2.5 py-1 bg-[#021E14] text-white text-[8px] font-bold uppercase tracking-widest rounded-md font-eyebrow">
                                        {tour.locationType}
                                    </span>
                                )}
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[8px] font-bold uppercase tracking-widest rounded-md font-eyebrow">
                                    {tour.category}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <LuMapPin size={14} className="text-[#E64266]" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-eyebrow" style={{ fontFamily }}>
                                    {isBn ? (tour.destinationBn || tour.destination) : tour.destination}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tight leading-none mb-3" style={{ fontFamily: headingFont }}>
                                {isBn ? (tour.titleBn || tour.title) : tour.title}
                            </h1>

                            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-lg" style={{ fontFamily }}>
                                {isBn ? (tour.descriptionBn || tour.description || '') : (tour.description || '')}
                            </p>

                            {/* Rating + Price */}
                            <div className="flex items-center gap-6 flex-wrap">
                                {tour.rating > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <LuStar size={16} className="text-[#E64266] fill-[#E64266]" />
                                        <span className="text-sm font-bold text-gray-800">{tour.rating}</span>
                                        {tour.reviewsCount > 0 && (
                                            <span className="text-[11px] text-gray-400">({tour.reviewsCount} {isBn ? 'রিভিউ' : 'reviews'})</span>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black" style={{ color: '#0F3C53', fontFamily: headingFont }}>
                                            {sym}{tour.price?.toLocaleString()}
                                        </span>
                                        {tour.oldPrice > 0 && (
                                            <span className="text-base text-gray-300 line-through">{sym}{tour.oldPrice?.toLocaleString()}</span>
                                        )}
                                    </div>
                                    {savings > 0 && (
                                        <p className="text-[11px] text-green-600 font-bold mt-0.5" style={{ fontFamily }}>
                                            {isBn ? `আপনি ${sym}${savings.toLocaleString()} সাশ্রয় করছেন` : `You save ${sym}${savings.toLocaleString()}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="md:w-[420px] flex-shrink-0 flex items-center justify-center p-5">
                            <div className="w-full h-full min-h-[240px] relative overflow-hidden rounded-md">
                                {tour.image ? (
                                    <img
                                        src={tour.image}
                                        alt={isBn ? (tour.titleBn || tour.title) : tour.title}
                                        className="absolute inset-0 w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#021E14' }}>
                                        <LuMapPin size={60} className="text-white/10" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow min-w-0 space-y-8">

                        {/* Quick Stats */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: LuClock, label: isBn ? 'সময়কাল' : 'Duration', value: isBn ? (tour.durationBn || tour.duration) : tour.duration },
                                { icon: LuUsers, label: isBn ? 'গ্রুপ সাইজ' : 'Group Size', value: tour.groupSize ? `Max ${tour.groupSize}` : 'N/A' },
                                { icon: LuPlane, label: isBn ? 'ট্যুর টাইপ' : 'Tour Type', value: isBn ? (tour.tourTypeBn || tour.tourType || 'N/A') : (tour.tourType || 'N/A') },
                                { icon: LuStar, label: isBn ? 'রেটিং' : 'Rating', value: tour.rating ? `${tour.rating} ★` : 'N/A' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-md border border-gray-100 p-4 text-center shadow-sm">
                                    <item.icon size={20} className="mx-auto mb-2 text-[#E64266]" />
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1" style={{ fontFamily }}>{item.label}</p>
                                    <p className="text-sm font-bold text-gray-800" style={{ fontFamily }}>{item.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* About */}
                        {(tour.longDescription || tour.longDescriptionBn) && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'বিস্তারিত তথ্য' : 'About This Tour'}
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4" style={{ fontFamily }}>
                                    {isBn ? (tour.longDescriptionBn || tour.longDescription) : tour.longDescription}
                                </p>
                                {tour.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {tour.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                        )}

                        {/* Itinerary */}
                        {tour.itinerary?.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'ভ্রমণসূচি' : 'Itinerary'}
                                </h2>
                                <div className="space-y-0">
                                    {tour.itinerary.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#E64266' }}>
                                                    {item.day}
                                                </div>
                                                {idx < tour.itinerary.length - 1 && (
                                                    <div className="w-px h-10 bg-gray-100" />
                                                )}
                                            </div>
                                            <div className="pt-1 pb-5">
                                                <p className="text-sm font-bold text-gray-800 mb-1" style={{ fontFamily }}>
                                                    {isBn ? (item.titleBn || item.title) : item.title}
                                                </p>
                                                <p className="text-[12px] text-gray-400" style={{ fontFamily }}>
                                                    {isBn ? (item.descriptionBn || item.description || '') : (item.description || '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* What's Included */}
                        {tour.includes?.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'কী কী অন্তর্ভুক্ত' : "What's Included"}
                                </h2>
                                <div className="space-y-3">
                                    {(isBn && tour.includesBn?.length > 0 ? tour.includesBn : tour.includes).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-md">
                                            <LuCircleCheck size={16} className="text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 font-medium" style={{ fontFamily }}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* What's Excluded */}
                        {tour.excludes?.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'যা অন্তর্ভুক্ত নয়' : "What's Excluded"}
                                </h2>
                                <div className="space-y-3">
                                    {(isBn && tour.excludesBn?.length > 0 ? tour.excludesBn : tour.excludes).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 py-2.5 px-4 bg-red-50/50 rounded-md">
                                            <LuCircleX size={16} className="text-red-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 font-medium" style={{ fontFamily }}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* FAQs */}
                        {tour.faqs?.length > 0 && (
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'সাধারণ জিজ্ঞাসা' : 'Frequently Asked Questions'}
                                </h2>
                                <div className="space-y-4">
                                    {tour.faqs.map((faq, idx) => (
                                        <div key={idx} className="border border-gray-100 rounded-md p-5">
                                            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-start gap-2" style={{ fontFamily }}>
                                                <LuCircleDot size={14} className="text-[#E64266] mt-0.5 flex-shrink-0" />
                                                {isBn ? (faq.questionBn || faq.question) : faq.question}
                                            </h3>
                                            <p className="text-[13px] text-gray-500 leading-relaxed pl-[22px]" style={{ fontFamily }}>
                                                {isBn ? (faq.answerBn || faq.answer) : faq.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-[360px] flex-shrink-0">
                        <div className="lg:sticky lg:top-32 space-y-5">

                            {/* Booking Card */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-baseline gap-3 mb-1">
                                    <span className="text-4xl font-black" style={{ color: '#0F3C53', fontFamily: headingFont }}>
                                        {sym}{tour.price?.toLocaleString()}
                                    </span>
                                    {tour.oldPrice > 0 && (
                                        <span className="text-lg text-gray-300 line-through font-medium">{sym}{tour.oldPrice?.toLocaleString()}</span>
                                    )}
                                </div>
                                {savings > 0 && (
                                    <p className="text-[11px] text-green-600 font-bold mb-6" style={{ fontFamily }}>
                                        {isBn ? `${sym}${savings.toLocaleString()} সাশ্রয়` : `Save ${sym}${savings.toLocaleString()}`} · {isBn ? 'প্রতি জন' : 'per person'}
                                    </p>
                                )}

                                <div className="space-y-3 mb-6">
                                    {[
                                        { label: isBn ? 'সময়কাল' : 'Duration', value: isBn ? (tour.durationBn || tour.duration) : tour.duration },
                                        { label: isBn ? 'ট্যুর টাইপ' : 'Type', value: isBn ? (tour.tourTypeBn || tour.tourType || 'N/A') : (tour.tourType || 'N/A') },
                                        { label: isBn ? 'গ্রুপ সাইজ' : 'Group Size', value: tour.groupSize ? `Max ${tour.groupSize}` : 'N/A' },
                                        ...(tour.rating ? [{ label: isBn ? 'রেটিং' : 'Rating', value: `${tour.rating} ${tour.reviewsCount ? `(${tour.reviewsCount})` : ''}` }] : []),
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-[12px] text-gray-400 font-medium" style={{ fontFamily }}>{item.label}</span>
                                            <span className="text-[12px] text-gray-800 font-bold" style={{ fontFamily }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setBookingOpen(true)}
                                    className="w-full py-3.5 rounded-md text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-[#E64266]/20 flex items-center justify-center gap-2 font-eyebrow"
                                    style={{ backgroundColor: '#E64266', fontFamily }}
                                >
                                    <LuCalendarDays size={16} />
                                    {isBn ? 'এখনই বুক করুন' : 'Book Now'}
                                </button>

                            </motion.div>

                            {/* Why Choose Us */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'কেন আমাদের বেছে নেবেন' : 'Why Choose Us'}
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: LuShieldCheck, text: isBn ? 'সম্পূর্ণ নিরাপদ ভ্রমণ' : '100% Safe Travel' },
                                        { icon: LuUsers, text: isBn ? '১০,০০০+ খুশি ভ্রমণকারী' : '10,000+ Happy Travelers' },
                                        { icon: LuCamera, text: isBn ? 'পেশাদার গাইড' : 'Professional Guides' },
                                        { icon: LuStar, text: isBn ? '৫-তারা অভিজ্ঞতা' : '5-Star Experiences' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-[#E64266]/10 flex items-center justify-center flex-shrink-0">
                                                <item.icon size={14} className="text-[#E64266]" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-gray-700" style={{ fontFamily }}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Contact */}
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-md p-6 relative overflow-hidden" style={{ backgroundColor: '#021E14' }}>
                                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(239,140,44,0.15)' }} />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 font-eyebrow" style={{ color: '#E64266' }}>
                                        {isBn ? 'সাহায্য দরকার?' : 'Need Help?'}
                                    </p>
                                    <p className="text-sm font-bold text-white mb-1" style={{ fontFamily }}>
                                        {isBn ? 'ট্যুর বিশেষজ্ঞের সাথে কথা বলুন' : 'Talk to a Tour Expert'}
                                    </p>
                                    <p className="text-[11px] text-white/40 leading-relaxed mb-5" style={{ fontFamily }}>
                                        {isBn ? 'কাস্টম ট্যুর প্ল্যান করতে আমাদের সাথে যোগাযোগ করুন।' : 'Contact us to customize your perfect tour package.'}
                                    </p>
                                    <div className="space-y-2">
                                        <a
                                            href={buildTelUrl(settings.contactPhone)}
                                            className="w-full py-3 rounded-md flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 font-eyebrow"
                                            style={{ backgroundColor: '#E64266', fontFamily }}
                                        >
                                            <LuPhone size={13} />
                                            {isBn ? 'কল করুন' : 'Call Now'}
                                        </a>
                                        <a
                                            href={buildWhatsAppUrl(settings.whatsappNumber, `Hi, I need help with tour booking for "${tour.title}". Please contact me.`)}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-full py-3 rounded-md flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border border-white/15 transition-all hover:bg-white/5 font-eyebrow"
                                            style={{ fontFamily }}
                                        >
                                            <FaWhatsapp size={13} />
                                            {isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Related Tours */}
                {relatedTours.length > 0 && (
                    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-8 leading-none" style={{ fontFamily: headingFont }}>
                            {isBn ? 'আরো ট্যুর ' : 'More Tour '}<span style={{ color: '#E64266' }}>{isBn ? 'দেখুন' : 'Options'}</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {relatedTours.map((rt, idx) => {
                                const rSym = getCurrencySymbol(rt.currency);
                                return (
                                    <Link href={`/tour/${rt.slug || rt._id}`} key={rt._id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="group bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500"
                                        >
                                            <div className="relative h-44 overflow-hidden">
                                                {rt.image ? (
                                                    <img
                                                        src={rt.image}
                                                        alt={isBn ? (rt.titleBn || rt.title) : rt.title}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#021E14' }}>
                                                        <LuMapPin size={30} className="text-white/10" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                                {rt.locationType && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-[8px] font-bold uppercase tracking-widest rounded-md shadow-sm font-eyebrow" style={{ fontFamily }}>
                                                            {rt.locationType}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                    <LuMapPin size={11} className="text-[#E64266]" />
                                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow font-eyebrow" style={{ fontFamily }}>
                                                        {isBn ? (rt.destinationBn || rt.destination) : rt.destination}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0F3C53] transition-colors mb-1 line-clamp-1" style={{ fontFamily }}>
                                                    {isBn ? (rt.titleBn || rt.title) : rt.title}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-black" style={{ color: '#0F3C53', fontFamily: headingFont }}>{rSym}{rt.price?.toLocaleString()}</span>
                                                        {rt.oldPrice > 0 && <span className="text-[10px] text-gray-300 line-through">{rSym}{rt.oldPrice?.toLocaleString()}</span>}
                                                    </div>
                                                    {rt.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <LuStar size={12} className="text-[#E64266] fill-[#E64266]" />
                                                            <span className="text-[11px] font-bold text-gray-700">{rt.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* Bottom CTA */}
            <section className="bg-white border-t border-gray-100 py-12 md:py-20">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-5 leading-none" style={{ fontFamily: headingFont }}>
                        {isBn ? 'অ্যাডভেঞ্চার শুরু করুন' : 'Start Your Adventure'}
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed" style={{ fontFamily }}>
                        {isBn ? 'আজই আপনার স্বপ্নের ট্যুর বুক করুন। আমাদের বিশেষজ্ঞ দল সবকিছু সাজিয়ে দেবে।' : 'Book your dream tour today. Our expert team will arrange everything for you.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href={buildWhatsAppUrl(settings.whatsappNumber,
                                `🌍 Tour Booking - Divine Travelers\n\n` +
                                `Tour: ${tour.title}\n` +
                                `Destination: ${tour.destination}\n` +
                                `Price: ${sym}${tour.price?.toLocaleString()} per person\n\n` +
                                `I would like to book this tour. Please assist me.`
                            )}
                            target="_blank" rel="noopener noreferrer"
                            className="px-10 py-4 rounded-md text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-[#25D366]/20 hover:-translate-y-0.5 flex items-center gap-2 font-eyebrow"
                            style={{ backgroundColor: '#25D366', fontFamily }}
                        >
                            <FaWhatsapp size={16} />
                            {isBn ? 'এখনই বুক করুন' : 'Book Now'}
                        </a>
                        <a
                            href={buildWhatsAppUrl(settings.whatsappNumber, `Hi, I need help with tour booking. Please contact me.`)}
                            target="_blank" rel="noopener noreferrer"
                            className="px-10 py-4 rounded-md text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 font-eyebrow"
                            style={{ backgroundColor: '#021E14', fontFamily }}
                        >
                            <FaWhatsapp size={16} />
                            {isBn ? 'যোগাযোগ করুন' : 'Contact Us'}
                        </a>
                    </div>
                </div>
            </section>
            <BookingModal
                isOpen={bookingOpen}
                onClose={() => setBookingOpen(false)}
                type="tour"
                serviceName={tour?.title || ''}
                serviceId={tour?._id || ""}
                extraFields={[
                    { key: "travelDate", label: isBn ? "ভ্রমণের তারিখ" : "Travel Date", type: "date", required: true },
                    { key: "persons", label: isBn ? "যাত্রীর সংখ্যা" : "Number of Travelers", type: "number", placeholder: "1", required: true },
                ]}
                summary={{
                    image: tour?.image || tour?.gallery?.[0],
                    icon: '🌍',
                    title: tour?.title || (isBn ? 'ট্যুর' : 'Tour'),
                    subtitle: tour?.destination || (isBn ? 'ট্যুর প্যাকেজ' : 'Tour Package'),
                    lineItems: tour?.price > 0 ? [{ label: isBn ? 'প্যাকেজ · জনপ্রতি' : 'Package · per person', value: tour.price }] : [],
                    total: tour?.price || 0,
                    totalLabel: isBn ? 'জনপ্রতি' : 'Per person',
                    currency: sym,
                }}
            />
        </div>
    );
}
