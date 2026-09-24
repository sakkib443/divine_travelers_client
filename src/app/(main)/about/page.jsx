"use client";

// ===================================================================
// /about — every section on this page is database-driven.
// Content lives in the `homecontents` collection (sections: about,
// aboutFounder, aboutTeam, aboutWhy, aboutCta) and is edited from
// Admin → Website Content → About Page. Nothing here is hardcoded:
// change it in the dashboard and this page changes with it.
// ===================================================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import * as Icons from "react-icons/lu";
import { LuQuote, LuArrowRight, LuLoader } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import AboutStory from "@/components/sections/AboutStory";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AboutPage() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const font = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const heading = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";

    // One request returns every section document; we index it by section name.
    const [sections, setSections] = useState(null);

    useEffect(() => {
        let alive = true;
        fetch(`${API_BASE}/api/home-content`)
            .then((r) => r.json())
            .then((json) => {
                if (!alive) return;
                const map = {};
                (json?.data || []).forEach((doc) => { map[doc.section] = doc.data; });
                setSections(map);
            })
            .catch(() => { if (alive) setSections({}); });
        return () => { alive = false; };
    }, []);

    // Pick the active language, falling back to the other one so a field that
    // was only filled in English still shows in Bangla mode.
    const t = (field) => (field ? (isBn ? field.bn || field.en : field.en || field.bn) : "");
    // A section renders unless the admin explicitly switched it off.
    const on = (s) => Boolean(s) && s.isActive !== false;

    if (!sections) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LuLoader className="w-7 h-7 animate-spin text-gray-300" />
            </div>
        );
    }

    const story = sections.about;
    const founder = sections.aboutFounder;
    const team = sections.aboutTeam;
    const why = sections.aboutWhy;
    const cta = sections.aboutCta;

    const members = [...(team?.members || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const cards = [...(why?.cards || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return (
        <div style={{ fontFamily: font }}>

            {/* ════════ 1. OUR STORY ════════ */}
            {on(story) && <AboutStory content={story} />}

            {/* ════════ 2. FOUNDER / OWNER ════════ */}
            {on(founder) && (
                <section className="py-20 md:py-28" style={{ backgroundColor: "#F8FAFC" }}>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            {t(founder.eyebrow) && (
                                <span className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow" style={{ color: "#E64266" }}>
                                    {t(founder.eyebrow)}
                                </span>
                            )}
                            <h2 className="font-black uppercase tracking-tight mt-3" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                                {t(founder.heading)}
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid lg:grid-cols-[360px_1fr] gap-8 lg:gap-14 items-center bg-white rounded-3xl p-6 md:p-10 lg:p-12 shadow-xl shadow-black/[0.06] border border-gray-100"
                        >
                            {/* Photo */}
                            {founder.photo && (
                                <div className="relative mx-auto lg:mx-0 w-full max-w-[320px]">
                                    <div className="absolute -inset-3 rounded-3xl -z-0" style={{ background: "linear-gradient(135deg, rgba(239,140,44,0.18), rgba(53,144,207,0.14))" }} />
                                    <div className="relative rounded-3xl overflow-hidden shadow-lg">
                                        <img src={founder.photo} alt={t(founder.name)} className="w-full h-[340px] object-cover" />
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div>
                                <LuQuote className="w-12 h-12 mb-4" style={{ color: "rgba(239,140,44,0.35)" }} />
                                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8" style={{ fontFamily: font }}>
                                    {t(founder.message)}
                                </p>
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                    <div>
                                        <p className="font-black uppercase tracking-tight" style={{ fontFamily: heading, color: "#021E14", fontSize: "1.5rem" }}>
                                            {t(founder.name)}
                                        </p>
                                        <p className="text-sm font-semibold" style={{ color: "#0F3C53" }}>
                                            {t(founder.title)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ════════ 3. TEAM ════════ */}
            {on(team) && members.length > 0 && (
                <section className="py-20 md:py-28 bg-white">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-14 max-w-2xl mx-auto"
                        >
                            {t(team.eyebrow) && (
                                <span className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow" style={{ color: "#E64266" }}>
                                    {t(team.eyebrow)}
                                </span>
                            )}
                            <h2 className="font-black uppercase tracking-tight mt-3 mb-4" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                                {t(team.heading)}
                            </h2>
                            <p className="text-gray-500">{t(team.description)}</p>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                            {members.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group rounded-2xl overflow-hidden bg-[#F8FAFC] border border-gray-100 hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1 transition-all"
                                >
                                    <div className="relative h-56 overflow-hidden bg-gray-100">
                                        {m.photo && (
                                            <img
                                                src={m.photo}
                                                alt={t(m.name)}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-bold text-gray-900 leading-tight" style={{ fontFamily: font }}>
                                            {t(m.name)}
                                        </h3>
                                        <p className="text-[12px] font-semibold mt-1" style={{ color: "#0F3C53" }}>
                                            {t(m.role)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ════════ 4. WHY CHOOSE US ════════ */}
            {on(why) && cards.length > 0 && (
                <section className="py-20 md:py-28" style={{ backgroundColor: "#F8FAFC" }}>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-14 max-w-2xl mx-auto"
                        >
                            {t(why.eyebrow) && (
                                <span className="text-[11px] font-bold uppercase tracking-[0.25em] font-eyebrow" style={{ color: "#E64266" }}>
                                    {t(why.eyebrow)}
                                </span>
                            )}
                            <h2 className="font-black uppercase tracking-tight mt-3 mb-4" style={{ fontFamily: heading, color: "#021E14", fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                                {t(why.heading)}
                            </h2>
                            <p className="text-gray-500">{t(why.description)}</p>
                        </motion.div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                            {cards.map((v, i) => {
                                // Icon name is stored as a string (e.g. "LuTarget") so the
                                // admin can change it without a code deploy.
                                const Icon = Icons[v.icon] || Icons.LuTarget;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1 transition-all"
                                    >
                                        <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(2,30,20,0.06)" }}>
                                            <Icon className="w-6 h-6" style={{ color: "#021E14" }} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: font }}>
                                            {t(v.title)}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {t(v.description)}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ════════ 5. CTA ════════ */}
            {on(cta) && (
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
                                    {t(cta.heading)}
                                </h2>
                                <p className="text-base md:text-lg max-w-2xl mx-auto mb-9 text-gray-600">
                                    {t(cta.description)}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    {t(cta.button1Text) && (
                                        <Link
                                            href={cta.button1Link || "/contact"}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/20"
                                            style={{ backgroundColor: "#E64266", fontFamily: font }}
                                        >
                                            {t(cta.button1Text)}
                                            <LuArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                    {t(cta.button2Text) && (
                                        <Link
                                            href={cta.button2Link || "/tour"}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:bg-gray-50"
                                            style={{ border: "1px solid #021E14", color: "#021E14", fontFamily: font }}
                                        >
                                            {t(cta.button2Text)}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}
        </div>
    );
}
