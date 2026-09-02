"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSearch,
    FiLoader,
    FiTrash2,
    FiCheck,
    FiX,
    FiStar,
    FiRefreshCw,
} from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const statusFilters = [
    { key: "all", label: "All", color: "gray" },
    { key: "pending", label: "Pending", color: "yellow" },
    { key: "approved", label: "Approved", color: "green" },
    { key: "rejected", label: "Rejected", color: "red" },
];

const statusBadge = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminTestimonials() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [acting, setActing] = useState(null);
    const token = useSelector(selectToken);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== "all") params.set("status", filter);
            if (search.trim()) params.set("searchTerm", search.trim());
            const url = `${API_BASE}/api/testimonials${
                params.toString() ? `?${params}` : ""
            }`;
            const res = await fetch(url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setItems(data.data);
            } else {
                setItems([]);
            }
        } catch {
            setItems([]);
            toast.error("Failed to fetch testimonials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const updateStatus = async (id, body, successMsg) => {
        setActing(id);
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(successMsg);
                fetchAll();
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch {
            toast.error("Update failed");
        } finally {
            setActing(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete review by ${name}? This cannot be undone.`)) return;
        setActing(id);
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Review deleted");
                setItems((prev) => prev.filter((t) => t._id !== id));
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete");
        } finally {
            setActing(null);
        }
    };

    const counts = items.reduce(
        (acc, t) => {
            acc.all += 1;
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        },
        { all: 0, pending: 0, approved: 0, rejected: 0 }
    );

    const filtered = items.filter((t) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
            t.name?.toLowerCase().includes(q) ||
            t.message?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage user reviews — approve, reject, or delete
                    </p>
                </div>
                <button
                    onClick={fetchAll}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                {statusFilters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            filter === f.key
                                ? "bg-[#0F3C53] text-white"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {f.label}
                        <span className="ml-2 text-[11px] opacity-75">
                            ({counts[f.key] || 0})
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or message..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <FiLoader className="w-8 h-8 text-gray-300 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">No testimonials found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((t) => (
                        <div
                            key={t._id}
                            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#0F3C53] text-white flex items-center justify-center font-bold">
                                        {t.name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {t.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {t.role || t.user?.email || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Rating */}
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FiStar
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < t.rating
                                                        ? "fill-[#E64266] text-[#E64266]"
                                                        : "text-gray-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {/* Status badge */}
                                    <span
                                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${statusBadge[t.status]}`}
                                    >
                                        {t.status}
                                    </span>
                                    {t.isFeatured && (
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                            ★ Featured
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                &quot;{t.message}&quot;
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                                {t.status !== "approved" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                t._id,
                                                { status: "approved" },
                                                "Review approved"
                                            )
                                        }
                                        disabled={acting === t._id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50 cursor-pointer"
                                    >
                                        <FiCheck size={13} /> Approve
                                    </button>
                                )}
                                {t.status !== "rejected" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                t._id,
                                                { status: "rejected" },
                                                "Review rejected"
                                            )
                                        }
                                        disabled={acting === t._id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                                    >
                                        <FiX size={13} /> Reject
                                    </button>
                                )}
                                <button
                                    onClick={() =>
                                        updateStatus(
                                            t._id,
                                            { isFeatured: !t.isFeatured },
                                            t.isFeatured
                                                ? "Removed from featured"
                                                : "Marked as featured"
                                        )
                                    }
                                    disabled={acting === t._id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 cursor-pointer"
                                >
                                    <FiStar size={13} />
                                    {t.isFeatured ? "Unfeature" : "Feature"}
                                </button>
                                <button
                                    onClick={() => handleDelete(t._id, t.name)}
                                    disabled={acting === t._id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-50 cursor-pointer ml-auto"
                                >
                                    <FiTrash2 size={13} /> Delete
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                                {new Date(t.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
