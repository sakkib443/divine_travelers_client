"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
    FiMenu,
    FiX,
    FiChevronDown,
    FiLogOut,
    FiSettings,
    FiGrid,
    FiMail,
    FiMapPin,
    FiClock,
    FiGlobe,
} from "react-icons/fi";
import {
    selectCurrentUser,
    selectIsAuthenticated,
    logout,
} from "@/redux/features/authSlice";
import { useLanguage } from "@/context/LanguageContext";
import {
    useSiteSettings,
    buildMailUrl,
} from "@/context/SiteSettingsContext";
import Logo from "@/components/shared/Logo";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langRef = useRef(null);
    const { language, setLanguage, t } = useLanguage();
    const { settings } = useSiteSettings();

    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const pathname = usePathname();

    const isBn = language === 'bn';
    const bnFont = 'var(--font-primary)';
    const headingFont = 'var(--font-heading)';

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close language dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: t('home'), href: "/" },
        { name: isBn ? 'ট্যুর প্যাকেজ' : 'Tour Packages', href: "/tour" },
        { name: t('hajjUmrah'), href: "/hajj-umrah" },
        { name: isBn ? 'ফ্লাইট' : 'Flight', href: "/flight" },
        { name: t('aboutUs'), href: "/about" },
        { name: t('blog'), href: "/blog" },
        { name: t('contact'), href: "/contact" },
    ];

    // Dashboard/settings destinations for the profile dropdown (admin-only site).
    const dashboardHref = "/dashboard/admin";
    const settingsHref = "/dashboard/admin/profile";

    const handleLogout = () => {
        dispatch(logout());
        setIsProfileOpen(false);
    };

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Main Navbar */}
            <nav
                className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                    ? "py-1 bg-white/98 backdrop-blur-xl shadow-lg shadow-black/5"
                    : "py-2 bg-white"
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-20 lg:h-[88px]">

                        {/* Logo */}
                        <Link href="/" className="flex items-center group flex-shrink-0">
                            <Logo className="h-[78px] lg:h-[94px] w-auto transition-transform group-hover:scale-105" />
                        </Link>

                        {/* Center Navigation - Desktop */}
                        <div className="hidden lg:flex items-center gap-0.5">
                            {navLinks.map((link) => (
                                <div
                                    key={link.href}
                                    className="relative"
                                    onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className={`relative flex items-center gap-1 px-3 xl:px-4 py-2 text-[15px] font-semibold tracking-wide transition-colors ${isActive(link.href)
                                            ? "text-[#E64266]"
                                            : "text-gray-700 hover:text-[#0F3C53]"
                                            }`}
                                        style={{ fontFamily: 'var(--next-font-poppins)' }}
                                    >
                                        {link.name}
                                        {link.hasDropdown && (
                                            <FiChevronDown
                                                className={`w-3.5 h-3.5 transition-transform ${activeDropdown === link.name ? "rotate-180 text-[#E64266]" : "text-gray-400"
                                                    }`}
                                            />
                                        )}
                                        {/* Active Indicator */}
                                        {isActive(link.href) && (
                                            <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#E64266] rounded-full" />
                                        )}
                                    </Link>

                                    {/* Dropdown Menu */}
                                    {link.hasDropdown && (
                                        <AnimatePresence>
                                            {activeDropdown === link.name && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full left-0 pt-2 z-50"
                                                >
                                                    <div className="bg-white rounded-xl shadow-2xl shadow-black/10 border border-gray-100 p-2 min-w-[240px]">
                                                        {link.dropdownItems?.map((item) => (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                                            >
                                                                <span className="text-lg">{item.icon}</span>
                                                                <span
                                                                    className="font-medium text-gray-700 text-[15px] group-hover:text-[#0F3C53] transition-colors"
                                                                    style={{ fontFamily: 'var(--next-font-poppins)' }}
                                                                >
                                                                    {item.name}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            {/* Language Switcher */}
                            <div className="relative" ref={langRef}>
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#0F3C53]/40 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700"
                                    style={{ fontFamily: bnFont }}
                                >
                                    <FiGlobe className="w-4 h-4 text-[#0F3C53]" />
                                    <span className="hidden sm:inline">{language === 'bn' ? 'বাংলা' : 'EN'}</span>
                                    <FiChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isLangOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl shadow-black/10 border border-gray-100 py-1.5 min-w-[160px] z-[60]"
                                        >
                                            <button
                                                onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${language === 'en' ? 'text-[#0F3C53] bg-[#0F3C53]/5' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                style={{ fontFamily: 'var(--next-font-poppins)' }}
                                            >
                                                <span className="text-lg">🇬🇧</span>
                                                English
                                                {language === 'en' && <span className="ml-auto text-[#0F3C53]">✓</span>}
                                            </button>
                                            <button
                                                onClick={() => { setLanguage('bn'); setIsLangOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${language === 'bn' ? 'text-[#0F3C53] bg-[#0F3C53]/5' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                style={{ fontFamily: 'Hind Siliguri, sans-serif' }}
                                            >
                                                <span className="text-lg">🇧🇩</span>
                                                বাংলা
                                                {language === 'bn' && <span className="ml-auto text-[#0F3C53]">✓</span>}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Auth / Profile */}
                            {mounted && (isAuthenticated && user ? (
                                <div className="relative">
                                    <motion.button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-all"
                                        style={{ backgroundColor: '#0F3C53' }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full rounded-md object-cover" alt="" />
                                            ) : (
                                                user.firstName?.[0] || "U"
                                            )}
                                        </div>
                                        <span className="hidden md:block text-sm font-semibold text-white" style={{ fontFamily: 'var(--next-font-poppins)' }}>
                                            {user.firstName}
                                        </span>
                                        <FiChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-2 w-64 bg-white backdrop-blur-xl rounded-xl shadow-2xl shadow-black/10 border border-gray-100 py-2 overflow-hidden z-[60]"
                                            >
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                                    <p className="font-semibold text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                                </div>

                                                <div className="py-1">
                                                    <DropdownLink
                                                        href={dashboardHref}
                                                        icon={FiGrid}
                                                        label={t('dashboard')}
                                                        fontFamily={bnFont}
                                                    />
                                                    <DropdownLink
                                                        href={settingsHref}
                                                        icon={FiSettings}
                                                        label={t('accountSettings')}
                                                        fontFamily={bnFont}
                                                    />
                                                </div>

                                                <div className="pt-1 border-t border-gray-100">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                                                        style={{ fontFamily: bnFont }}
                                                    >
                                                        <FiLogOut className="w-4 h-4" />
                                                        {t('signOut')}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
                                        style={{ fontFamily: bnFont, backgroundColor: '#E64266' }}
                                    >
                                        {t('login')}
                                    </Link>
                                </div>
                            ))}

                            {/* Mobile Menu Toggle */}
                            <motion.button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="lg:hidden p-2.5 rounded-lg bg-gray-100 text-gray-700"
                                whileTap={{ scale: 0.95 }}
                            >
                                {isMobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl overflow-hidden"
                        >
                            <div className="px-4 py-6 max-h-[80vh] overflow-y-auto">
                                {/* Nav Links */}
                                <div className="space-y-1 mb-6">
                                    {navLinks.map((link, index) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            {link.hasDropdown ? (
                                                <>
                                                    <div className="flex items-center">
                                                        <Link
                                                            href={link.href}
                                                            className={`flex-1 px-4 py-3 text-[18px] font-semibold rounded-l-lg transition-colors ${isActive(link.href)
                                                                ? "text-[#E64266] bg-[#E64266]/5"
                                                                : "text-gray-700 hover:bg-gray-50"
                                                                }`}
                                                            style={{ fontFamily: 'var(--next-font-poppins)' }}
                                                            onClick={() => setIsMobileOpen(false)}
                                                        >
                                                            {link.name}
                                                        </Link>
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                                                            className={`px-4 py-3 rounded-r-lg transition-colors ${activeDropdown === link.name
                                                                ? "text-[#E64266] bg-[#E64266]/5"
                                                                : "text-gray-400 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                                                        </button>
                                                    </div>
                                                    <AnimatePresence>
                                                        {activeDropdown === link.name && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-1 mb-2">
                                                                    {link.dropdownItems?.map((item) => (
                                                                        <Link
                                                                            key={item.href}
                                                                            href={item.href}
                                                                            className="block px-3 py-2 text-[15px] text-gray-500 hover:text-[#0F3C53] rounded-lg transition-colors"
                                                                            style={{ fontFamily: 'var(--next-font-poppins)' }}
                                                                            onClick={() => setIsMobileOpen(false)}
                                                                        >
                                                                            {item.icon} {item.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className={`block px-4 py-3 text-[18px] font-semibold rounded-lg transition-colors ${isActive(link.href)
                                                        ? "text-[#E64266] bg-[#E64266]/5"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    style={{ fontFamily: 'var(--next-font-poppins)' }}
                                                    onClick={() => setIsMobileOpen(false)}
                                                >
                                                    {link.name}
                                                </Link>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mobile Language Switcher */}
                                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-eyebrow" style={{ fontFamily: bnFont }}>{t('languageLabel')}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${language === 'en'
                                                ? 'bg-[#0F3C53] text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                            style={{ fontFamily: 'var(--next-font-poppins)' }}
                                        >
                                            <span>🇬🇧</span> English
                                        </button>
                                        <button
                                            onClick={() => setLanguage('bn')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${language === 'bn'
                                                ? 'bg-[#0F3C53] text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                            style={{ fontFamily: 'Hind Siliguri, sans-serif' }}
                                        >
                                            <span>🇧🇩</span> বাংলা
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Auth */}
                                {!isAuthenticated && (
                                    <Link
                                        href="/login"
                                        className="block py-3 text-center text-white font-semibold rounded-lg"
                                        style={{ fontFamily: bnFont, backgroundColor: '#E64266' }}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        {t('login')}
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}

function DropdownLink({ href, icon: Icon, label, fontFamily }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#0F3C53] transition-all"
            style={{ fontFamily: fontFamily || 'var(--next-font-poppins)' }}
        >
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    );
}
