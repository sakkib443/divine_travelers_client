"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHome,
    FiUsers,
    FiBook,
    FiSettings,
    FiMenu,
    FiX,
    FiChevronDown,
    FiLogOut,
    FiBell,
    FiSearch,
    FiArrowLeft,
    FiPlus,
    FiPackage,
    FiGlobe,
    FiMapPin,
    FiFileText,
    FiMail,
    FiCalendar,
    FiDollarSign,
    FiImage,
    FiStar,
    FiMessageSquare,
    FiClipboard,
    FiBookOpen,
    FiLayout,
    FiPhone,
    FiBriefcase,
    FiUserCheck,
    FiUpload,
    FiCheckCircle,
} from "react-icons/fi";
import { LuPlane, LuGraduationCap, LuShieldCheck } from "react-icons/lu";
import { FaKaaba } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated, selectToken, logout, updateUser } from "@/redux/features/authSlice";

const menuItems = [
    {
        name: "Dashboard",
        href: "/dashboard/admin",
        icon: FiHome,
    },

    // ─────────── ADMIN ───────────
    {
        section: "OPERATIONS",
    },
    {
        name: "Bookings",
        icon: FiCalendar,
        children: [
            { name: "Flight Bookings", href: "/dashboard/admin/flight-inquiries", icon: LuPlane },
            { name: "Tour Bookings", href: "/dashboard/admin/bookings?type=tour", icon: FiMapPin },
            { name: "Hajj Bookings", href: "/dashboard/admin/bookings?type=hajj", icon: FaKaaba },
        ],
    },
    {
        name: "Admins",
        icon: FiUsers,
        children: [
            { name: "All Admins", href: "/dashboard/admin/users", icon: FiUsers },
            { name: "Add Admin", href: "/dashboard/admin/users/create", icon: FiPlus },
        ],
    },
    {
        section: "TRAVEL & PACKAGES",
    },
    {
        name: "Tour Packages",
        icon: FiMapPin,
        children: [
            { name: "All Packages", href: "/dashboard/admin/tours", icon: FiMapPin },
            { name: "Create Package", href: "/dashboard/admin/tours/create", icon: FiPlus },
        ],
    },
    {
        name: "Hajj & Umrah",
        icon: FaKaaba,
        children: [
            { name: "All Packages", href: "/dashboard/admin/hajj-umrah", icon: FaKaaba },
            { name: "Create Package", href: "/dashboard/admin/hajj-umrah/create", icon: FiPlus },
        ],
    },
    // Air tickets are parked for now — hidden from the nav, but the pages and the
    // ticket module behind them are untouched. Drop the `hidden` flags to bring
    // the section back.
    {
        section: "AIR TICKETS",
        hidden: true,
    },
    {
        name: "Ticket Generator",
        href: "/dashboard/admin/ticket-generator",
        icon: LuPlane,
        hidden: true,
    },
    {
        name: "Saved Tickets",
        href: "/dashboard/admin/all-tickets",
        icon: FiClipboard,
        hidden: true,
    },
    {
        section: "CONTENT & DESIGN",
    },
    {
        name: "Blog",
        icon: FiBook,
        children: [
            { name: "All Posts", href: "/dashboard/admin/blog", icon: FiBook },
            { name: "Write Post", href: "/dashboard/admin/blog/create", icon: FiPlus },
        ],
    },
    {
        name: "Reviews",
        href: "/dashboard/admin/testimonials",
        icon: FiStar,
    },
    {
        name: "Website Content",
        icon: FiLayout,
        children: [
            { name: "Home Page", href: "/dashboard/admin/design-content/home", icon: FiHome },
            { name: "Logo & Favicon", href: "/dashboard/admin/design-content/branding", icon: FiImage },
            { name: "Contact Page", href: "/dashboard/admin/design-content/contact", icon: FiPhone },
            { name: "Social Links", href: "/dashboard/admin/design-content/social", icon: FiGlobe },
            { name: "Legal Pages", href: "/dashboard/admin/design-content/legal", icon: FiFileText },
        ],
    },
    {
        section: "SETTINGS",
    },
    {
        name: "Profile",
        href: "/dashboard/admin/profile",
        icon: FiUsers,
    },

];

function SidebarItem({ item, isCollapsed, badge = 0, childBadges = null }) {
    // Per-child badge count, resolved from the child link's ?type= query or name
    const childBadge = (child) => {
        if (!childBadges || !child.href) return 0;
        
        if (child.name === "Flight Bookings") {
            return childBadges["flight"] || 0;
        }

        const q = child.href.split("?")[1];
        if (!q) return 0;
        const type = new URLSearchParams(q).get("type");
        return (type && childBadges[type]) || 0;
    };
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(item.defaultOpen || false);

    // Match a link that may carry query params (e.g. bookings ?type=, users
    // ?group=). Every param in the link's query must match the current URL.
    const linkActive = (href) => {
        if (!href) return false;
        const [p, q] = href.split("?");
        if (p !== pathname) return false;
        if (!q) return true;
        const want = new URLSearchParams(q);
        for (const [k, v] of want.entries()) {
            if ((searchParams.get(k) || "") !== v) return false;
        }
        return true;
    };

    const isActive = item.href
        ? linkActive(item.href)
        : item.children?.some((child) => linkActive(child.href));

    useEffect(() => {
        if (item.children && item.children.some((child) => linkActive(child.href))) {
            setIsOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams, item.children]);

    if (item.children) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group w-full flex items-center justify-between pl-[13px] pr-4 py-2 border-l-[3px] transition-colors text-[13px] ${isActive
                        ? "border-[#E64266] bg-[#FEF4E9] text-[#b45309] dark:bg-[#E64266]/10 dark:text-[#E64266]"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                        }`}
                >
                    <div className="relative flex items-center gap-3">
                        <item.icon className={`w-[17px] h-[17px] ${isActive ? "text-[#E64266]" : "text-gray-400 group-hover:text-gray-600"}`} />
                        {!isCollapsed && <span className="font-medium">{item.name}</span>}
                        {isCollapsed && badge > 0 && (
                            <span className="absolute -top-1.5 -right-2 w-2 h-2 rounded-full bg-[#E64266]" />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center gap-1.5">
                            {badge > 0 && (
                                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#E64266] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                    {badge > 99 ? "99+" : badge}
                                </span>
                            )}
                            <FiChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isActive ? "text-[#E64266]" : "text-gray-300"}`}
                            />
                        </div>
                    )}
                </button>
                <AnimatePresence>
                    {isOpen && !isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-0.5 space-y-0 overflow-hidden"
                        >
                            {item.children.map((child) => {
                                const cb = childBadge(child);
                                return (
                                    <Link
                                        key={child.name}
                                        href={child.href}
                                        className={`flex items-center gap-2.5 pl-11 pr-4 py-[7px] text-[12px] border-l-[3px] transition-colors ${linkActive(child.href)
                                            ? "border-[#E64266] bg-[#FEF4E9] text-[#b45309] font-semibold dark:bg-[#E64266]/10 dark:text-[#E64266]"
                                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/50"
                                            }`}
                                    >
                                        {child.icon && <child.icon className="w-3.5 h-3.5" />}
                                        <span className="flex-1">{child.name}</span>
                                        {cb > 0 && (
                                            <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-[#E64266] text-white text-[9.5px] font-bold flex items-center justify-center leading-none">
                                                {cb > 99 ? "99+" : cb}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={`group flex items-center gap-3 pl-[13px] pr-4 py-2 border-l-[3px] transition-colors text-[13px] ${isActive
                ? "border-[#E64266] bg-[#FEF4E9] text-[#b45309] dark:bg-[#E64266]/10 dark:text-[#E64266]"
                : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                }`}
        >
            <item.icon className={`w-[17px] h-[17px] ${isActive ? "text-[#E64266]" : "text-gray-400 group-hover:text-gray-600"}`} />
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
        </Link>
    );
}

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

    // Helper: check if JWT token is expired
    const isTokenExpired = (tkn) => {
        if (!tkn) return true;
        try {
            const payload = JSON.parse(atob(tkn.split('.')[1]));
            // exp is in seconds, Date.now() is in ms
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    useEffect(() => {
        setMounted(true);
        // Initial check
        if (!token || !isAuthenticated || isTokenExpired(token)) {
            dispatch(logout());
            router.replace("/login");
            return;
        }
        setIsLoading(false);

        // Periodic check every 60 seconds — auto-logout if token expired
        const interval = setInterval(() => {
            if (isTokenExpired(token)) {
                dispatch(logout());
                router.replace("/login");
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [token, isAuthenticated, router, dispatch]);

    // ── Booking notifications: bell dropdown + sidebar badge ──
    // Server truth: pending bookings. Bell hides items the admin has clicked
    // (dismissed ids live in localStorage, per browser); the sidebar badge is
    // ALWAYS the live pending count — it only drops when a status changes.
    const [bookingNotif, setBookingNotif] = useState({ pendingCount: 0, byType: {}, items: [] });
    const [dismissedNotifs, setDismissedNotifs] = useState(() => {
        if (typeof window === "undefined") return [];
        try { return JSON.parse(localStorage.getItem("dt-dismissed-booking-notifs") || "[]"); } catch { return []; }
    });
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const dismissNotif = (id) => {
        setDismissedNotifs((prev) => {
            const next = [...new Set([...prev, id])].slice(-300);
            try { localStorage.setItem("dt-dismissed-booking-notifs", JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
    };

    // Hydrate live profile flags (role) from the server so the
    // sidebar reflects HR changes without requiring a fresh login.
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        const load = async () => {
            try {
                const r = await fetch(`${BACKEND}/api/bookings/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!r.ok) return;
                const d = await r.json();
                if (!cancelled && d?.data) setBookingNotif({ pendingCount: d.data.pendingCount || 0, byType: d.data.byType || {}, items: d.data.items || [] });
            } catch { /* network hiccup — next poll will retry */ }
        };
        load();
        const iv = setInterval(load, 30000);                  // poll every 30s
        const onChanged = () => load();                        // instant refresh after status updates
        const onFocus = () => load();
        window.addEventListener("bookings-changed", onChanged);
        window.addEventListener("focus", onFocus);
        return () => { cancelled = true; clearInterval(iv); window.removeEventListener("bookings-changed", onChanged); window.removeEventListener("focus", onFocus); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, pathname]);
    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        fetch(`${BACKEND}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (cancelled || !d?.data) return;
                const me = d.data;
                if (user && me.role !== user.role) {
                    dispatch(updateUser({ role: me.role }));
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const [flightInquiryCount, setFlightInquiryCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        const loadStats = async () => {
            try {
                const r = await fetch(`${BACKEND}/api/inquiries/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!r.ok) return;
                const d = await r.json();
                if (!cancelled && d?.data?.['flight-booking']?.new) {
                    setFlightInquiryCount(d.data['flight-booking'].new);
                } else if (!cancelled) {
                    setFlightInquiryCount(0);
                }
            } catch {}
        };
        loadStats();
        const iv = setInterval(loadStats, 30000);
        const onChanged = () => loadStats();
        window.addEventListener("inquiries-changed", onChanged);
        window.addEventListener("focus", onChanged);
        return () => { cancelled = true; clearInterval(iv); window.removeEventListener("inquiries-changed", onChanged); window.removeEventListener("focus", onChanged); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, pathname]);

    // Access gate
    useEffect(() => {
        const role = user?.role;
        if (!role) return;
        if (role !== "admin" && role !== "manager") {
            dispatch(logout());
            router.replace("/login");
        }
    }, [user, pathname, router, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    if (!mounted || (isLoading && (!token || !isAuthenticated))) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-3 border-[#021E14] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">{!mounted ? "Loading..." : "Authenticating..."}</p>
                </div>
            </div>
        );
    }

    // Bell list = pending bookings the admin has not clicked yet
    const unseenNotifs = bookingNotif.items.filter((n) => !dismissedNotifs.includes(n._id));

    const renderSidebarContent = (isCollapsedMode = false) => (
        <>
            {menuItems.filter(item => {
                if (item.hidden) return false;
                if (user?.role === 'manager') {
                    if (item.name === "Dashboard" || item.name === "Admins" || item.name === "Profile") return false;
                }
                return true;
            }).map((item, index) => {
                if (item.section) {
                    if (isCollapsedMode) return <div key={index} className="my-3 border-t border-gray-100 dark:border-gray-700/50" />;
                    return (
                        <p key={index} className="px-4 pt-3.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 font-eyebrow">
                            {item.section}
                        </p>
                    );
                }
                return (
                    <SidebarItem
                        key={item.name}
                        item={item}
                        isCollapsed={isCollapsedMode}
                        badge={item.name === "Bookings" ? bookingNotif.pendingCount + flightInquiryCount : 0}
                        childBadges={item.name === "Bookings" ? { ...bookingNotif.byType, flight: flightInquiryCount } : null}
                    />
                );
            })}
        </>
    );

    return (
        <div className="min-h-screen bg-[#F5F6FA] dark:bg-gray-900">
            {/* Desktop Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${isSidebarOpen ? "w-[260px]" : "w-[70px]"
                    } bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/50 hidden lg:flex flex-col`}
            >
                {/* Logo */}
                <div className="h-[88px] flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Logo className={`transition-all duration-300 ${isSidebarOpen ? "h-[76px]" : "h-9"} w-auto`} />
                    </Link>
                </div>

                {/* Back to Website */}
                <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-700/30 flex-shrink-0">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group text-[12px]"
                    >
                        <FiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        {isSidebarOpen && <span className="font-medium">Back to Website</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-2 space-y-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    {renderSidebarContent(!isSidebarOpen)}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-[#F8FAFC] dark:bg-gray-700/30">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white" style={{ backgroundColor: '#021E14' }}>
                                {user?.firstName?.[0] || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-gray-800 dark:text-white truncate">
                                    {user?.firstName || "Admin"} {user?.lastName || ""}
                                </p>
                                <p className="text-[10px] text-gray-400 capitalize">{user?.role || "admin"}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-[12px] font-medium"
                    >
                        <FiLogOut size={14} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed top-0 left-0 z-50 w-[260px] h-screen bg-white dark:bg-gray-800 lg:hidden flex flex-col"
                        >
                            <div className="h-[88px] flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700/50">
                                <Link href="/" className="flex items-center gap-2.5">
                                    <Logo className="h-[76px] w-auto" />
                                </Link>
                                <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-md hover:bg-gray-100">
                                    <FiX className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <nav className="flex-1 py-3 space-y-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                {renderSidebarContent(false)}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={`${isSidebarOpen ? "lg:ml-[260px]" : "lg:ml-[70px]"} transition-all duration-300`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-[88px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-700/50 px-4 lg:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FiMenu className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FiMenu className="w-4.5 h-4.5 text-gray-400" />
                        </button>
                        <div className="relative hidden md:block">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-[#F5F6FA] dark:bg-gray-700 border border-gray-100 dark:border-gray-600 focus:border-[#021E14] focus:ring-1 focus:ring-[#021E14]/10 text-[13px] text-gray-600 placeholder-gray-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notifications - new pending bookings */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen((o) => !o)}
                                className="relative p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                title="Booking notifications"
                            >
                                <FiBell className="w-[18px] h-[18px] text-gray-400" />
                                {unseenNotifs.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E64266] text-white text-[9px] font-bold flex items-center justify-center leading-none border-2 border-white dark:border-gray-800">
                                        {unseenNotifs.length > 9 ? "9+" : unseenNotifs.length}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <>
                                        {/* click-away backdrop */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-[340px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-[13px] font-bold text-gray-800 dark:text-white">New Bookings</p>
                                                {unseenNotifs.length > 0 && (
                                                    <button
                                                        onClick={() => { unseenNotifs.forEach((n) => dismissNotif(n._id)); }}
                                                        className="text-[11px] font-semibold text-gray-400 hover:text-[#E64266] transition"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[320px] overflow-y-auto">
                                                {unseenNotifs.length === 0 ? (
                                                    <div className="py-10 text-center text-gray-400">
                                                        <FiBell className="mx-auto mb-2 opacity-40" size={22} />
                                                        <p className="text-[12px]">No new booking requests</p>
                                                    </div>
                                                ) : (
                                                    unseenNotifs.map((n) => (
                                                        <button
                                                            key={n._id}
                                                            onClick={() => {
                                                                dismissNotif(n._id);
                                                                setIsNotifOpen(false);
                                                                router.push(`/dashboard/admin/bookings?type=${n.type}&open=${n._id}`);
                                                            }}
                                                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                                        >
                                                            <span className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${n.type === "tour" ? "bg-emerald-500" : n.type === "hajj" ? "bg-violet-500" : "bg-gray-500"}`}>
                                                                <FiCalendar size={14} />
                                                            </span>
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-[12.5px] font-semibold text-gray-800 dark:text-white truncate">
                                                                    {n.serviceName || `${n.type} booking`}
                                                                </span>
                                                                <span className="block text-[11px] text-gray-400 truncate">
                                                                    {n.name} · {n.trackingId || ""}
                                                                </span>
                                                                <span className="block text-[10px] text-gray-300 mt-0.5">
                                                                    {n.createdAt ? new Date(n.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                                                                </span>
                                                            </span>
                                                            <span className="mt-1 w-2 h-2 rounded-full bg-[#E64266] shrink-0" />
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Visit Site */}
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            <FiGlobe size={12} />
                            Visit Site
                        </Link>

                        {/* User */}
                        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: '#021E14' }}>
                                {user?.firstName?.[0] || "A"}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[12px] font-semibold text-gray-700 dark:text-white">
                                    {user?.firstName || "Admin"}
                                </p>
                                <p className="text-[10px] text-gray-400 capitalize">{user?.role || "admin"}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-h-[calc(100vh-60px)]">{children}</main>
            </div>
        </div>
    );
}
