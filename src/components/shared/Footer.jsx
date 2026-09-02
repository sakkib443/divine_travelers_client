"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiPhone,
    FiMail,
    FiMapPin,
    FiArrowRight,
    FiSend,
} from "react-icons/fi";
import {
    FaFacebookF,
    FaWhatsapp,
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaLinkedin,
    FaTiktok,
} from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import {
    useSiteSettings,
    buildWhatsAppUrl,
    buildTelUrl,
    buildMailUrl,
} from "@/context/SiteSettingsContext";
import Logo from "@/components/shared/Logo";

const SOCIAL_META = {
    facebook: { icon: FaFacebookF, label: "Facebook", color: "#1877F2" },
    instagram: { icon: FaInstagram, label: "Instagram", color: "#E4405F" },
    twitter: { icon: FaTwitter, label: "Twitter", color: "#1DA1F2" },
    youtube: { icon: FaYoutube, label: "YouTube", color: "#FF0000" },
    linkedin: { icon: FaLinkedin, label: "LinkedIn", color: "#0A66C2" },
    tiktok: { icon: FaTiktok, label: "TikTok", color: "#000000" },
};

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { t, language } = useLanguage();
    const { settings } = useSiteSettings();
    const bnFont = 'var(--font-primary)';
    const headingFont = 'var(--font-heading)';

    const quickServicesLinks = [
        { name: t('home'), href: "/" },
        { name: language === 'bn' ? 'ট্যুর প্যাকেজ' : 'Tour Packages', href: "/tour" },
        { name: t('hajjUmrah'), href: "/hajj-umrah" },
        { name: language === 'bn' ? 'ফ্লাইট' : 'Flight', href: "/flight" },
        { name: t('aboutUs'), href: "/about" },
        { name: t('blog'), href: "/blog" },
        { name: t('contact'), href: "/contact" },
    ];

    // Build active social links from settings (only those with a URL set)
    const activeSocial = Object.entries(settings.social || {})
        .filter(([, url]) => url && url.trim())
        .map(([key, url]) => {
            const meta = SOCIAL_META[key];
            if (!meta) return null;
            return { key, url, ...meta };
        })
        .filter(Boolean);

    // Always include WhatsApp at the end if a number is set
    if (settings.whatsappNumber) {
        activeSocial.push({
            key: "whatsapp",
            url: buildWhatsAppUrl(settings.whatsappNumber),
            icon: FaWhatsapp,
            label: "WhatsApp",
            color: "#25D366",
        });
    }

    return (
        <footer className="bg-[#F8FAFC] text-gray-900 overflow-hidden border-t border-gray-100">
            {/* CTA Section */}
            <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F3C53 0%, #2A74A8 100%)" }}>
                <div className="absolute inset-0">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #E64266, transparent 70%)" }} />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #ffffff, transparent 70%)" }} />
                </div>
                <div className="relative max-w-[1400px] mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3
                            className="text-3xl md:text-4xl font-bold text-white mb-2"
                            style={{ fontFamily: headingFont, textTransform: 'uppercase', letterSpacing: '0.02em' }}
                        >
                            {t('readyToStart')}
                        </h3>
                        <p className="text-white/80 text-sm" style={{ fontFamily: bnFont }}>
                            {t('footerCTADesc')}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href={buildTelUrl(settings.contactPhone)}
                            className="px-6 py-3.5 bg-white text-[#0F3C53] rounded-lg font-semibold text-sm hover:-translate-y-1 transition-all flex items-center gap-2"
                            style={{ fontFamily: bnFont }}
                        >
                            <FiPhone className="w-4 h-4" />
                            {t('callNow')}
                        </a>
                        <Link
                            href="/contact"
                            className="px-6 py-3.5 rounded-lg font-semibold text-sm hover:-translate-y-1 transition-all flex items-center gap-2 text-white border border-white/30 hover:bg-white/10"
                            style={{ fontFamily: bnFont }}
                        >
                            {t('freeConsultation')}
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

                    {/* Brand & Social */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center group">
                            <Logo className="h-20 sm:h-24 w-auto" badgeClassName="transition-transform group-hover:scale-105" />
                        </Link>

                        <p className="text-gray-600 text-sm leading-relaxed max-w-sm" style={{ fontFamily: bnFont }}>
                            {t('footerBrandDesc')}
                        </p>

                        {/* Social Links */}
                        {activeSocial.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                {activeSocial.map((social) => (
                                    <a
                                        key={social.key}
                                        href={social.url}
                                        aria-label={social.label}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-white transition-all hover:-translate-y-1"
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = social.color; e.currentTarget.style.borderColor = social.color; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = ''; }}
                                    >
                                        <social.icon size={16} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Services */}
                    <div>
                        <h4
                            className="text-lg font-bold mb-6 text-gray-900"
                            style={{ fontFamily: headingFont, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                            {language === 'bn' ? 'কুইক সার্ভিসেস' : 'Quick Services'}
                        </h4>
                        <ul className="space-y-3">
                            {quickServicesLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 hover:text-[#E64266] transition-colors text-sm flex items-center gap-2 group"
                                        style={{ fontFamily: bnFont }}
                                    >
                                        <span className="w-0 group-hover:w-2 h-[2px] bg-[#E64266] transition-all overflow-hidden" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4
                            className="text-lg font-bold mb-6 text-gray-900"
                            style={{ fontFamily: headingFont, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        >
                            {t('contactUs')}
                        </h4>
                        <div className="space-y-4">
                            <a href={buildTelUrl(settings.contactPhone)} className="flex items-center gap-3 text-gray-700 hover:text-[#E64266] transition-colors text-sm group">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E64266]/10 group-hover:border-[#E64266]/20 transition-colors">
                                    <FiPhone className="w-4 h-4 text-[#E64266]" />
                                </div>
                                <div style={{ fontFamily: bnFont }}>
                                    <p className="font-semibold text-gray-900 group-hover:text-[#E64266] transition-colors">{settings.contactPhone}</p>
                                    <p className="text-xs text-gray-500">{t('hotlineTime')}</p>
                                </div>
                            </a>
                            <a href={buildMailUrl(settings.contactEmail)} className="flex items-center gap-3 text-gray-700 hover:text-[#E64266] transition-colors text-sm group">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F3C53]/10 group-hover:border-[#0F3C53]/20 transition-colors">
                                    <FiMail className="w-4 h-4 text-[#0F3C53]" />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif' }} className="group-hover:text-[#E64266] transition-colors">{settings.contactEmail}</span>
                            </a>
                            {(settings.address || settings.addressBn) && (
                                <div className="flex items-center gap-3 text-gray-700 text-sm group">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F3C53]/10 group-hover:border-[#0F3C53]/20 transition-colors">
                                        <FiMapPin className="w-4 h-4 text-[#0F3C53]" />
                                    </div>
                                    <span style={{ fontFamily: bnFont }} className="leading-relaxed">
                                        {language === 'bn' && settings.addressBn ? settings.addressBn : settings.address}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Payment Methods */}
                <div className="py-6 border-t border-gray-100 mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold" style={{ fontFamily: bnFont }}>
                            {t('acceptedPayment')}
                        </span>
                        <div className="flex items-center gap-4">
                            {["bKash", "Nagad", "Rocket", "Visa", "MasterCard", "Bank Transfer"].map((method) => (
                                <span
                                    key={method}
                                    className="px-3 py-1.5 bg-gray-50 rounded text-[10px] font-semibold text-gray-500 border border-gray-200"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500" style={{ fontFamily: bnFont }}>
                        © {currentYear} Divine Travelers. {t('allRightsReserved')}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500" style={{ fontFamily: bnFont }}>
                        <Link href="/about" className="hover:text-[#E64266] transition-colors">{t('aboutUs')}</Link>
                        <Link href="/contact" className="hover:text-[#E64266] transition-colors">{t('contactUs')}</Link>
                        <Link href="/privacy-policy" className="hover:text-[#E64266] transition-colors">{t('privacyPolicy')}</Link>
                        <Link href="/refund-policy" className="hover:text-[#E64266] transition-colors">{language === 'bn' ? 'রিফান্ড পলিসি' : 'Refund Policy'}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
