"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LuBellRing } from "react-icons/lu";

export default function NoticeTicker({ data }) {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bnFont = "var(--font-primary)";
    const headingFont = "var(--font-heading)";

    if (!data || data.isActive === false) return null;

    const notices = data.notices || [];
    if (notices.length === 0) return null;

    return (
        <div className="w-full bg-[#0F3C53] text-white flex items-center h-12 overflow-hidden relative border-b border-[#E64266]/20">
            {/* Left Static Badge */}
            <div className="absolute left-0 top-0 bottom-0 z-10 bg-[#0F3C53] flex items-center px-4 md:px-6 shadow-[10px_0_15px_-3px_rgba(15,60,83,1)] border-r border-[#E64266]/30">
                <div className="flex items-center gap-2 text-[#E64266] font-bold uppercase tracking-wider text-xs md:text-sm">
                    <LuBellRing className="text-lg animate-pulse" />
                    <span className="hidden sm:inline whitespace-nowrap" style={{ fontFamily: headingFont }}>
                        {isBn ? "নোটিশ ও অফার" : "Notice & Offers"}
                    </span>
                </div>
            </div>
            
            {/* Scrolling Content */}
            <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] w-max">
                {/* We render the same array multiple times to create a seamless infinite scroll loop */}
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex whitespace-nowrap">
                        {notices.map((notice, idx) => (
                            <div key={`${i}-${idx}`} className="flex items-center">
                                <span className="mx-6 md:mx-10 text-[13px] md:text-[14px]" style={{ fontFamily: bnFont }}>
                                    {isBn ? notice.bn : notice.en}
                                </span>
                                {/* Separator Dot */}
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E64266]/50"></span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
