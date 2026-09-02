"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiSearch, FiLoader, FiEdit, FiTrash2, FiEye,
    FiRefreshCw, FiPlus, FiX, FiMapPin,
    FiUsers, FiDollarSign, FiClock, FiStar, FiFilter,
    FiCalendar, FiTag,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TourPackages() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [viewingTour, setViewingTour] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const token = useSelector(selectToken);
    const router = useRouter();

    const fetchTours = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/tours`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && data.data) {
                setTours(Array.isArray(data.data) ? data.data : []);
            } else {
                setTours([]);
            }
        } catch {
            toast.error("Failed to fetch tours");
            setTours([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTours(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this tour package?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`${API_BASE}/api/tours/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Tour package deleted successfully");
                setTours(prev => prev.filter(t => t._id !== id));
                if (viewingTour?._id === id) setViewingTour(null);
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete tour");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = tours.filter(t => {
        const matchSearch =
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.destination?.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || t.status === filter || t.category === filter;
        return matchSearch && matchFilter;
    });

    const totalRevenue = tours.reduce((sum, t) => sum + ((t.price || 0) * (t.bookings || 0)), 0);
    const totalBookings = tours.reduce((sum, t) => sum + (t.bookings || 0), 0);

    const getCategoryColor = (cat) => {
        const colors = {
            beach: "#3B82F6", adventure: "#10B981", international: "#8B5CF6",
            hill: "#F59E0B", luxury: "#EF4444", religious: "#EC4899",
            city: "#6366F1", culture: "#14B8A6", nature: "#22C55E",
            historical: "#A855F7",
        };
        return colors[cat] || "#6B7280";
    };

    const getStatusColor = (status) => {
        const colors = {
            active: "#10B981", upcoming: "#3B82F6", completed: "#6B7280", cancelled: "#EF4444",
        };
        return colors[status] || "#6B7280";
    };

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* View Modal */}
            <AnimatePresence>
                {viewingTour && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingTour(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-gray-100" style={{ backgroundColor: '#021E14' }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-white">
                                        <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Tour Package</p>
                                        <h3 className="text-lg font-bold mt-0.5">{viewingTour.title}</h3>
                                    </div>
                                    <button onClick={() => setViewingTour(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                                        <FiX size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                {viewingTour.image && (
                                    <img src={viewingTour.image} alt={viewingTour.title} className="w-full h-40 object-cover rounded-lg" />
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Destination", value: viewingTour.destination, icon: FiMapPin },
                                        { label: "Duration", value: viewingTour.duration, icon: FiClock },
                                        { label: "Price", value: `৳${viewingTour.price?.toLocaleString()}`, icon: FiDollarSign },
                                        { label: "Group Size", value: viewingTour.groupSize || "N/A", icon: FiUsers },
                                        { label: "Category", value: viewingTour.category, icon: FiTag },
                                        { label: "Status", value: viewingTour.status, icon: FiFilter },
                                        { label: "Bookings", value: `${viewingTour.bookings || 0}`, icon: FiCalendar },
                                        { label: "Rating", value: viewingTour.rating ? `⭐ ${viewingTour.rating}` : "N/A", icon: FiStar },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                                            <p className="text-[13px] font-semibold text-gray-700 mt-0.5 capitalize">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                {viewingTour.description && (
                                    <div className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description</p>
                                        <p className="text-[12px] text-gray-600">{viewingTour.description}</p>
                                    </div>
                                )}
                                {viewingTour.includes?.length > 0 && (
                                    <div className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Includes</p>
                                        <ul className="space-y-1">
                                            {viewingTour.includes.map((inc, i) => (
                                                <li key={i} className="text-[12px] text-gray-600 flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-green-500" /> {inc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => { setViewingTour(null); router.push(`/dashboard/admin/tours/create?id=${viewingTour._id}`); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: '#021E14' }}
                                    >
                                        <FiEdit size={13} /> Edit Package
                                    </button>
                                    <button
                                        onClick={() => { setViewingTour(null); handleDelete(viewingTour._id); }}
                                        className="px-4 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 border border-red-200 hover:bg-red-50"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#021E14' }}>
                        Tour Packages
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">{tours.length} packages • {totalBookings} total bookings</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchTours} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50">
                        <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <Link href="/dashboard/admin/tours/create" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: '#021E14' }}>
                        <FiPlus size={13} /> New Package
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Packages", value: tours.length, color: "#021E14" },
                    { label: "Total Bookings", value: totalBookings, color: "#3B82F6" },
                    { label: "Est. Revenue", value: `৳${(totalRevenue / 1000).toFixed(0)}K`, color: "#10B981" },
                    { label: "Active Packages", value: tours.filter(t => t.status === "active").length, color: "#E64266" },
                ].map((s) => (
                    <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-xl font-semibold text-gray-800">{s.value}</p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                        placeholder="Search tours..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F5F6FA] dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[13px] focus:border-[#021E14] outline-none"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {["all", "active", "upcoming", "completed"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${filter === s
                                ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                            style={filter === s ? { backgroundColor: '#021E14' } : {}}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tour Cards Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <FiLoader className="animate-spin" size={24} style={{ color: '#021E14' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FiMapPin size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">No Tour Packages Found</h3>
                    <p className="text-[12px] text-gray-400 mb-4">Create your first tour package to get started</p>
                    <Link href="/dashboard/admin/tours/create" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: '#021E14' }}>
                        <FiPlus size={13} /> Create Tour
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((tour, i) => (
                        <motion.div
                            key={tour._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden group hover:shadow-lg transition-all"
                        >
                            {/* Card Image / Placeholder */}
                            <div className="h-40 relative overflow-hidden" style={{ backgroundColor: '#021E14' }}>
                                {tour.image ? (
                                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FiMapPin size={40} className="text-white/10" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                            style={{ backgroundColor: getCategoryColor(tour.category) }}>
                                            {tour.category}
                                        </span>
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                            style={{ backgroundColor: getStatusColor(tour.status) }}>
                                            {tour.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute top-3 right-3 flex gap-1.5 transition-opacity">
                                    <button onClick={() => setViewingTour(tour)} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 hover:bg-white shadow-sm">
                                        <FiEye size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(tour._id); }}
                                        disabled={deleting === tour._id}
                                        className="w-8 h-8 rounded-lg bg-red-50 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-100 disabled:opacity-50 shadow-sm"
                                    >
                                        {deleting === tour._id ? <FiLoader size={14} className="animate-spin" /> : <FiTrash2 size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                                <h3 className="text-[13px] font-bold text-gray-800 dark:text-white line-clamp-1">{tour.title}</h3>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                                    <FiMapPin size={10} /> {tour.destination}
                                </p>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                    <div>
                                        <p className="text-lg font-bold" style={{ color: '#021E14' }}>৳{tour.price?.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400">{tour.duration}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-semibold text-gray-600">{tour.bookings || 0}/{tour.groupSize || 20}</p>
                                        <p className="text-[10px] text-gray-400">Booked</p>
                                    </div>
                                </div>

                                {tour.groupSize > 0 && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(((tour.bookings || 0) / (tour.groupSize || 20)) * 100, 100)}%`,
                                                    backgroundColor: '#E64266',
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-semibold text-gray-400">
                                            {Math.round(((tour.bookings || 0) / (tour.groupSize || 20)) * 100)}%
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={() => router.push(`/dashboard/admin/tours/create?id=${tour._id}`)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiEdit size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => setViewingTour(tour)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white transition-colors"
                                        style={{ backgroundColor: '#021E14' }}
                                    >
                                        <FiEye size={12} /> View
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
