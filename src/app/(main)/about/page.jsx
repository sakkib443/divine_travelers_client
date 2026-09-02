"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    LuUsers,
    LuTarget,
    LuZap,
    LuShieldCheck,
    LuHeart,
    LuArrowRight,
    LuGlobe,
    LuCompass,
    LuAward,
    LuMap,
    LuQuote,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import AboutStory from "@/components/sections/AboutStory";

// ─────────────────────────────────────────────────────────────
// Company owner — replace name, title, photo & message with the
// real details. To use a local photo, drop it in /public (e.g.
// owner.jpg) and set `photo: "/owner.jpg"`.
// ─────────────────────────────────────────────────────────────
const OWNER = {
    name: "Md. Abdul Karim",
    nameBn: "মোঃ আব্দুল করিম",
    title: "Founder & Managing Director",
    titleBn: "প্রতিষ্ঠাতা ও ব্যবস্থাপনা পরিচালক",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    message:
        "When I founded Divine Travelers, the vision was simple — to make international travel and migration honest, transparent, and accessible for every Bangladeshi. Thousands of successful journeys later, that same promise still drives everything we do. Your dream destination is our mission.",
    messageBn:
        "ডিভাইন ট্রাভেলার্স প্রতিষ্ঠার সময় আমার স্বপ্ন ছিল সহজ — প্রতিটি বাংলাদেশির জন্য আন্তর্জাতিক ভ্রমণ ও মাইগ্রেশনকে সৎ, স্বচ্ছ ও সহজলভ্য করা। আজ হাজারো সফল যাত্রার পরও সেই প্রতিশ্রুতিই আমাদের প্রতিটি কাজের চালিকাশক্তি। আপনার স্বপ্নের গন্তব্যই আমাদের লক্ষ্য।",
};

// ─── Team members — replace with real names, roles & photos ───
const TEAM = [
    {
        name: "Rafiul Islam",
        nameBn: "রফিউল ইসলাম",
        role: "Senior Travel Consultant",
        roleBn: "সিনিয়র ট্রাভেল কনসালট্যান্ট",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    },
    {
        name: "Nusrat Jahan",
        nameBn: "নুসরাত জাহান",
        role: "Tour Manager",
        roleBn: "ট্যুর ও হোটেল ম্যানেজার",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    },
    {
        name: "Tanvir Ahmed",
        nameBn: "তানভীর আহমেদ",
        role: "Documentation Officer",
        roleBn: "ডকুমেন্টেশন অফিসার",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    },
    {
        name: "Sadia Rahman",
        nameBn: "সাদিয়া রহমান",
        role: "Customer Support Lead",
        roleBn: "কাস্টমার সাপোর্ট লিড",
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    },
];

const stats = [
    { value: "10K+", valueBn: "১০K+", label: "Trips Arranged", labelBn: "ট্রিপ সম্পন্ন" },
    { value: "50+", valueBn: "৫০+", label: "Destinations", labelBn: "গন্তব্য" },
    { value: "98%", valueBn: "৯৮%", label: "Success Rate", labelBn: "সাফল্যের হার" },
    { value: "6+", valueBn: "৬+", label: "Years Experience", labelBn: "বছরের অভিজ্ঞতা" },
];

const values = [
    {
        icon: LuTarget,
        title: "Expert Guidance",
        titleBn: "বিশেষজ্ঞ গাইডেন্স",
        desc: "Every application is handled by experienced consultants who guide you at every step.",
        descBn: "প্রতিটি আবেদন অভিজ্ঞ পরামর্শদাতাদের দ্বারা পরিচালিত হয় যারা প্রতিটি ধাপে আপনাকে গাইড করেন।",
    },
    {
        icon: LuZap,
        title: "Fast Processing",
        titleBn: "দ্রুত প্রসেসিং",
        desc: "We make flight and travel arrangements as smooth and quick as possible.",
        descBn: "ফ্লাইট, হোটেল ও ভ্রমণ ব্যবস্থা যতটা সম্ভব সহজ ও দ্রুত করতে আমরা কাজ করি।",
    },
    {
        icon: LuShieldCheck,
        title: "Trust & Security",
        titleBn: "বিশ্বাস ও নিরাপত্তা",
        desc: "Your documents and personal information are handled with strict confidentiality.",
        descBn: "আপনার নথি ও ব্যক্তিগত তথ্য কঠোর গোপনীয়তার সাথে পরিচালিত হয়।",
    },
    {
        icon: LuHeart,
        title: "Client Care",
        titleBn: "ক্লায়েন্ট কেয়ার",
        desc: "We are dedicated to giving every client honest advice and dependable support.",
        descBn: "আমরা প্রতিটি ক্লায়েন্টকে সৎ পরামর্শ ও নির্ভরযোগ্য সহায়তা দিতে নিবেদিত।",
    },
];

export default function AboutPage() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const font = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const heading = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";
    const T = (en, bn) => (isBn ? bn : en);

    return (
        <div style={{ fontFamily: font }}>


            {/* ════════ 2. OUR STORY ════════ */}
            <AboutStory />

            {/* ════════ 3. FOUNDER / OWNER ════════ */}
            <section className="py-20 md:py-28" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow" style={{ color: "#E64266" }}>
                            {T("Leadership", "নেতৃত্ব")}
                        </span>
                        <h2 className="font-black uppercase tracking-tight mt-3" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                            {T("Message from our Founder", "প্রতিষ্ঠাতার বার্তা")}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid lg:grid-cols-[360px_1fr] gap-8 lg:gap-14 items-center bg-white rounded-3xl p-6 md:p-10 lg:p-12 shadow-xl shadow-black/[0.06] border border-gray-100"
                    >
                        {/* Photo */}
                        <div className="relative mx-auto lg:mx-0 w-full max-w-[320px]">
                            <div className="absolute -inset-3 rounded-3xl -z-0" style={{ background: "linear-gradient(135deg, rgba(239,140,44,0.18), rgba(53,144,207,0.14))" }} />
                            <div className="relative rounded-3xl overflow-hidden shadow-lg">
                                <img src={OWNER.photo} alt={isBn ? OWNER.nameBn : OWNER.name} className="w-full h-[340px] object-cover" />
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <LuQuote className="w-12 h-12 mb-4" style={{ color: "rgba(239,140,44,0.35)" }} />
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8" style={{ fontFamily: font }}>
                                {isBn ? OWNER.messageBn : OWNER.message}
                            </p>
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="font-black uppercase tracking-tight" style={{ fontFamily: heading, color: "#021E14", fontSize: "1.5rem" }}>
                                        {isBn ? OWNER.nameBn : OWNER.name}
                                    </p>
                                    <p className="text-sm font-semibold" style={{ color: "#0F3C53" }}>
                                        {isBn ? OWNER.titleBn : OWNER.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ════════ 4. TEAM ════════ */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14 max-w-2xl mx-auto"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow" style={{ color: "#E64266" }}>
                            {T("Our Team", "আমাদের টিম")}
                        </span>
                        <h2 className="font-black uppercase tracking-tight mt-3 mb-4" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                            {T("Meet the People Behind Divine Travelers", "ডিভাইন ট্রাভেলার্সের পেছনের মানুষগুলো")}
                        </h2>
                        <p className="text-gray-500">
                            {T("A dedicated team working every day to make your journey effortless.", "প্রতিদিন আপনার যাত্রাকে সহজ করতে নিবেদিত একটি টিম।")}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                        {TEAM.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group rounded-2xl overflow-hidden bg-[#F8FAFC] border border-gray-100 hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1 transition-all"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={m.photo}
                                        alt={isBn ? m.nameBn : m.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-bold text-gray-900 leading-tight" style={{ fontFamily: font }}>
                                        {isBn ? m.nameBn : m.name}
                                    </h3>
                                    <p className="text-[12px] font-semibold mt-1" style={{ color: "#0F3C53" }}>
                                        {isBn ? m.roleBn : m.role}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ 5. WHY CHOOSE US ════════ */}
            <section className="py-20 md:py-28" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14 max-w-2xl mx-auto"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow" style={{ color: "#E64266" }}>
                            {T("Why Choose Us", "কেন আমরা")}
                        </span>
                        <h2 className="font-black uppercase tracking-tight mt-3 mb-4" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                            {T("Built on Trust & Results", "বিশ্বাস ও ফলাফলের উপর গড়া")}
                        </h2>
                        <p className="text-gray-500">
                            {T("What makes thousands of clients choose Divine Travelers again and again.", "যে কারণে হাজারো ক্লায়েন্ট বারবার ডিভাইন ট্রাভেলার্সকে বেছে নেন।")}
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1 transition-all"
                            >
                                <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(2,30,20,0.06)" }}>
                                    <v.icon className="w-6 h-6" style={{ color: "#021E14" }} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: font }}>
                                    {isBn ? v.titleBn : v.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {isBn ? v.descBn : v.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ 6. CTA ════════ */}
            <section className="py-20 md:py-24 bg-white">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-12 md:py-16 text-center border border-gray-100"
                        style={{ background: "linear-gradient(135deg, rgba(239,140,44,0.10) 0%, rgba(53,144,207,0.10) 100%)" }}
                    >
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(239,140,44,0.12)" }} />
                        <div className="relative z-10">
                            <h2 className="font-black uppercase tracking-tight mb-5" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                                {T("Ready to Start Your Journey?", "আপনার যাত্রা শুরু করতে প্রস্তুত?")}
                            </h2>
                            <p className="text-base md:text-lg max-w-2xl mx-auto mb-9 text-gray-600">
                                {T(
                                    "Let our experts handle the paperwork while you focus on the destination. Talk to us today.",
                                    "কাগজপত্রের ঝামেলা আমাদের বিশেষজ্ঞদের হাতে ছেড়ে দিন, আপনি শুধু গন্তব্য নিয়ে ভাবুন। আজই যোগাযোগ করুন।"
                                )}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/20"
                                    style={{ backgroundColor: "#E64266", fontFamily: font }}
                                >
                                    {T("Contact Us", "যোগাযোগ করুন")}
                                    <LuArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/tour"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:bg-gray-50"
                                    style={{ border: "1px solid #021E14", color: "#021E14", fontFamily: font }}
                                >
                                    {T("Explore Tours", "ট্যুর দেখুন")}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
