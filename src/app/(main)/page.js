"use client";

import Hero from "@/components/sections/Hero";
import NoticeTicker from "@/components/sections/NoticeTicker";
import ServiceCards from "@/components/sections/ServiceCards";
import PopularTours from "@/components/sections/PopularTours";
import AboutStory from "@/components/sections/AboutStory";
import Testimonials from "@/components/sections/Testimonials";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

import * as LuIcons from "react-icons/lu";

export default function HomePage() {
  const [currentImg, setCurrentImg] = useState(0);
  const { t, language } = useLanguage();
  const bnFont = "var(--font-primary)";
  const headingFont = "var(--font-heading)";
  const isBn = language === 'bn';

  // Dynamic content state
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/home-content`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const map = {};
          json.data.forEach((doc) => { map[doc.section] = doc.data; });
          setHomeData(map);
        }
      })
      .catch(() => { });
  }, []);

  // ─── Helper to get bilingual text ───
  const bt = (obj, fallback = "") => {
    if (!obj) return fallback;
    return isBn ? (obj.bn || obj.en || fallback) : (obj.en || fallback);
  };

  // ─── Consultation Data ───
  const cd = homeData?.consultation;

  // ─── Why Choose Us Data ───
  const wc = homeData?.whyChooseUs;
  const whyChooseCards = wc?.cards?.length
    ? wc.cards.map((c) => ({ title: bt(c.title), desc: bt(c.description), icon: c.icon, color: c.color }))
    : [
      { title: t('fastProcessing'), desc: t('fastProcessingDesc'), icon: "⚡", color: "#E64266" },
      { title: t('support247'), desc: t('support247Desc'), icon: "💬", color: "#10B981" },
      { title: t('affordablePrices'), desc: t('affordablePricesDesc'), icon: "💰", color: "#8B5CF6" },
    ];

  const stats = wc?.stats?.length
    ? wc.stats.map((s) => ({ num: s.value, label: bt(s.label), color: s.color }))
    : [
      { num: "10+", label: t('yearsExperience'), color: "#0F3C53" },
      { num: "10K+", label: t('tripsArranged'), color: "#E64266" },
      { num: "98%", label: t('statSuccessRate'), color: "#10B981" },
      { num: "50+", label: t('countriesCovered'), color: "#8B5CF6" },
      { num: "24/7", label: t('customerSupport'), color: "#0F3C53" },
    ];

  const consultingImages = [
    "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % consultingImages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Hero heroData={homeData?.hero} />
      <NoticeTicker data={homeData?.noticeBoard} />
      {/* Why Choose Us */}
      {(!wc || wc.isActive !== false) && (
        <section
          className="py-16 md:py-24 px-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/why-chose-us-bg.jpg')" }}
        >
          {/* Optional light overlay to ensure text is readable if the image is busy */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>

          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-30 blur-[120px]" style={{ background: 'radial-gradient(circle, #0F3C5315, transparent)' }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-20 blur-[100px]" style={{ background: 'radial-gradient(circle, #E6426615, transparent)' }} />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 mt-12">
              {whyChooseCards.map((item, i) => {
                let iconName = item.icon;
                if (iconName === '⚡') iconName = 'LuRocket';
                else if (iconName === '💬') iconName = 'LuHeadphones';
                else if (iconName === '💰') iconName = 'LuWallet';

                const Icon = LuIcons[iconName];
                const IconComponent = Icon ? <Icon size={42} strokeWidth={1.5} className="text-white" /> : <span className="text-white text-4xl">{item.icon}</span>;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="group flex flex-col items-center text-center p-4 transition-transform duration-300 cursor-default"
                  >
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: item.color || "#F9A826",
                        boxShadow: `0 8px 30px ${item.color || '#F9A826'}4D`
                      }}
                    >
                      {IconComponent}
                    </div>
                    <h4 className="text-xl font-bold text-[#111827] mb-3" style={{ fontFamily: headingFont }}>{item.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs" style={{ fontFamily: bnFont || 'Poppins, sans-serif' }}>{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-14 bg-white/95 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/50 shadow-lg"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-center justify-center lg:justify-between gap-6 lg:gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 lg:gap-4">
                    <div className="w-1 h-8 lg:h-10 rounded-full shadow-inner" style={{ backgroundColor: stat.color }} />
                    <div>
                      <div className="text-xl lg:text-2xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-heading)' }}>{stat.num}</div>
                      <div className="text-[9px] lg:text-[10px] text-gray-500 font-bold uppercase tracking-wider" style={{ fontFamily: bnFont || 'Poppins, sans-serif' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <ServiceCards />

      {/* --- POPULAR TOURS --- */}
      <PopularTours />

      {/* --- ABOUT STORY --- */}
      <AboutStory />

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
