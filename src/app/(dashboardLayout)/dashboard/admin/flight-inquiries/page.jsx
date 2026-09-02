"use client";

// ===================================================================
// Admin — Flight Inquiry queue
// Real-time queue of visitor flight-booking requests (service:
// 'flight-booking' rows in the generic inquiry collection).
// ===================================================================

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    LuPlane, LuLoader, LuSearch, LuRefreshCw, LuEye, LuTrash2, LuX,
    LuChevronLeft, LuChevronRight, LuInbox, LuCircleCheck, LuLayers,
} from "react-icons/lu";
import { FiPhone, FiLoader } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import { inquiryNumber, tripTypeLabel, cabinLabel } from "@/utils/flight";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const NAVY = "#1a1a4e";

const STATUSES = ["new", "contacted", "converted", "closed", "spam"];
const STATUS_STYLE = {
    new: "bg-[#0F3C53]/5 text-[#0F3C53] border-[#0F3C53]/20",
    contacted: "bg-amber-50 text-amber-600 border-amber-200",
    converted: "bg-emerald-50 text-emerald-600 border-emerald-200",
    closed: "bg-gray-100 text-gray-500 border-gray-200",
    spam: "bg-red-50 text-red-500 border-red-200",
};

const waLink = (phone, text) => {
    const digits = String(phone || "").replace(/[^\d]/g, "");
    const withCc = digits.startsWith("880") ? digits : digits.startsWith("0") ? "880" + digits.slice(1) : digits;
    return `https://wa.me/${withCc}?text=${encodeURIComponent(text)}`;
};

const fmtWhen = (d) =>
    new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default function FlightInquiriesPage() {
    const token = useSelector(selectToken);
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1, limit: 20 });
    const [stats, setStats] = useState({ total: 0, new: 0, converted: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState(null);
    const [savingId, setSavingId] = useState(null);

    const fetchRows = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ service: "flight-booking", page: String(page), limit: "20" });
            if (statusFilter) params.set("status", statusFilter);
            if (search.trim()) params.set("search", search.trim());
            const res = await fetch(`${BACKEND}/api/inquiries?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRows(data.data || []);
                setMeta(data.meta || { total: 0, pages: 1, page: 1, limit: 20 });
            }
        } catch { /* poll again later */ } finally {
            setLoading(false);
        }
    }, [token, page, statusFilter, search]);

    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND}/api/inquiries/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const s = data?.data?.["flight-booking"] || {};
            setStats({ total: s.total || 0, new: s.new || 0, converted: s.converted || 0 });
        } catch { /* non-fatal */ }
    }, [token]);

    useEffect(() => { fetchRows(); }, [fetchRows]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const notifyChanged = () => window.dispatchEvent(new Event("inquiries-changed"));

    const updateStatus = async (id, status) => {
        setSavingId(id);
        try {
            const res = await fetch(`${BACKEND}/api/inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            setRows((p) => p.map((r) => (r._id === id ? { ...r, status } : r)));
            setDetail((p) => (p && p._id === id ? { ...p, status } : p));
            toast.success("Status updated");
            fetchStats();
            notifyChanged();
        } catch (e) {
            toast.error(e.message || "Failed to update status");
        } finally {
            setSavingId(null);
        }
    };

    const remove = async (id) => {
        if (!confirm("Delete this inquiry? This cannot be undone.")) return;
        try {
            const res = await fetch(`${BACKEND}/api/inquiries/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            setRows((p) => p.filter((r) => r._id !== id));
            if (detail?._id === id) setDetail(null);
            toast.success("Inquiry deleted");
            fetchStats();
            notifyChanged();
        } catch (e) {
            toast.error(e.message || "Failed to delete");
        }
    };

    const routeOf = (r) => {
        const x = r.extra || {};
        if (x.tripType === "multi") {
            const count = 1 + (Array.isArray(x.legs) ? x.legs.length : 0);
            return { multi: true, count };
        }
        return { from: x.from || "—", to: x.to || "—" };
    };

    const statCards = [
        { label: "Total", value: stats.total, icon: LuLayers, color: "#1a1a4e" },
        { label: "On page", value: rows.length, icon: LuInbox, color: "#0F3C53" },
        { label: "New", value: stats.new, icon: LuPlane, color: "#E64266" },
        { label: "Converted", value: stats.converted, icon: LuCircleCheck, color: "#10B981" },
    ];

    return (
        <div className="p-4 lg:p-8 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#E642661a", color: "#E64266" }}>
                        <LuPlane size={22} className="-rotate-45" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)", color: NAVY }}>
                            Flight Inquiries
                        </h1>
                        <p className="text-[12px] text-gray-400">Real-time queue of visitor flight-booking requests.</p>
                    </div>
                </div>
                <button
                    onClick={() => { fetchRows(); fetchStats(); }}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                    <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((c, i) => (
                    <motion.div
                        key={c.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 * i }}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}14`, color: c.color }}>
                                <c.icon size={15} />
                            </span>
                            <span className="text-2xl font-bold text-gray-900 tabular-nums">{c.value}</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter + search */}
            <div className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {["", ...STATUSES].map((s) => (
                        <button
                            key={s || "all"}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition ${
                                statusFilter === s ? "text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            style={statusFilter === s ? { background: NAVY } : {}}
                        >
                            {s || "All"}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 md:max-w-xs md:ml-auto">
                    <LuSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search name / phone / route…"
                        className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FiLoader size={26} className="animate-spin text-[#E64266]" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="m-5 py-14 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <LuInbox size={34} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No inquiries match this filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["Inquiry #", "Customer", "Route", "When", "Trip / Class", "Status", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.map((r, i) => {
                                    const route = routeOf(r);
                                    const x = r.extra || {};
                                    return (
                                        <motion.tr
                                            key={r._id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.03 * i }}
                                            className="hover:bg-gray-50/60 transition"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-md bg-gray-100 text-gray-600 whitespace-nowrap">
                                                    {inquiryNumber(r._id)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold whitespace-nowrap" style={{ color: NAVY }}>{r.name}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                                    <FiPhone size={10} /> {r.phone}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {route.multi ? (
                                                    <span className="text-[12px] font-semibold text-gray-700">
                                                        {route.count} legs <span className="text-[#E64266]">⇢</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[12px] font-semibold text-gray-700">
                                                        <span>{route.from}</span> <span className="text-gray-300 mx-0.5">→</span> <span>{route.to}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{fmtWhen(r.createdAt)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#1a1a4e]/5 text-[#1a1a4e] uppercase">
                                                    {x.tripType || "—"} · {cabinLabel(x.cabin)?.slice(0, 3).toUpperCase() || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={r.status}
                                                    disabled={savingId === r._id}
                                                    onChange={(e) => updateStatus(r._id, e.target.value)}
                                                    className={`text-[11px] font-bold uppercase px-2 py-1.5 rounded-lg border outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLE[r.status] || STATUS_STYLE.new}`}
                                                >
                                                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => setDetail(r)} title="View details"
                                                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition">
                                                        <LuEye size={14} />
                                                    </button>
                                                    <a href={waLink(r.phone, `Hello ${r.name}, regarding your flight inquiry ${inquiryNumber(r._id)} —`)}
                                                        target="_blank" rel="noreferrer" title="Reply on WhatsApp"
                                                        className="w-8 h-8 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition">
                                                        <FaWhatsapp size={14} />
                                                    </a>
                                                    <button onClick={() => remove(r._id)} title="Delete"
                                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                                                        <LuTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && meta.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-[12px] text-gray-400">
                            Page {meta.page} of {meta.pages} · {meta.total} total
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 hover:bg-gray-50">
                                <LuChevronLeft size={14} />
                            </button>
                            <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40 hover:bg-gray-50">
                                <LuChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {detail && (() => {
                const x = detail.extra || {};
                const legs = Array.isArray(x.legs) ? x.legs : [];
                const Row = ({ k, v }) => (
                    <div className="flex items-start justify-between gap-4 py-1.5">
                        <span className="text-[12px] text-gray-400">{k}</span>
                        <span className="text-[13px] font-semibold text-gray-800 text-right">{v || "—"}</span>
                    </div>
                );
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {/* Sticky header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 md:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E642661a", color: "#E64266" }}>
                                        <LuPlane size={18} className="-rotate-45" />
                                    </span>
                                    <div>
                                        <p className="font-mono text-[11px] font-bold text-gray-400">{inquiryNumber(detail._id)}</p>
                                        <h3 className="font-bold text-gray-900 leading-tight">{detail.subject || "Flight Inquiry"}</h3>
                                    </div>
                                </div>
                                <button onClick={() => setDetail(null)} className="p-2 rounded-full hover:bg-gray-100 transition"><LuX size={18} /></button>
                            </div>

                            <div className="p-5 md:p-6 space-y-5">
                                {/* Customer */}
                                <section>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Customer</p>
                                    <div className="rounded-xl border border-gray-100 px-4 py-2 divide-y divide-gray-50">
                                        <Row k="Name" v={detail.name} />
                                        <Row k="WhatsApp" v={<a className="text-[#1a1a4e] underline" href={`tel:${detail.phone}`}>{detail.phone}</a>} />
                                        <Row k="Email" v={detail.email ? <a className="text-[#1a1a4e] underline" href={`mailto:${detail.email}`}>{detail.email}</a> : "—"} />
                                    </div>
                                </section>

                                {/* Flight details */}
                                <section>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Flight details</p>
                                    <div className="rounded-xl border border-gray-100 px-4 py-2 divide-y divide-gray-50">
                                        <Row k="Trip type" v={tripTypeLabel(x.tripType)} />
                                        {x.tripType === "multi" ? (
                                            <>
                                                <Row k="Leg 1" v={`${x.from || "—"} → ${x.to || "—"} · ${x.departDate || "—"}`} />
                                                {legs.map((l, i) => (
                                                    <Row key={i} k={`Leg ${i + 2}`} v={`${l.from || "—"} → ${l.to || "—"} · ${l.date || "—"}`} />
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                <Row k="From" v={x.from} />
                                                <Row k="To" v={x.to} />
                                                <Row k="Departure" v={x.departDate} />
                                                {x.tripType === "round" && <Row k="Return" v={x.returnDate} />}
                                            </>
                                        )}
                                        <Row k="Passengers" v={x.passengers} />
                                        <Row k="Cabin" v={cabinLabel(x.cabin)} />
                                    </div>
                                </section>

                                {/* Full message */}
                                <section>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Full message</p>
                                    <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 border border-gray-100 p-4 text-[12.5px] text-gray-700 font-sans leading-relaxed">{detail.message || "—"}</pre>
                                </section>

                                {/* Meta */}
                                <section className="flex items-center justify-between">
                                    <p className="text-[12px] text-gray-400">Submitted {fmtWhen(detail.createdAt)}</p>
                                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLE[detail.status] || STATUS_STYLE.new}`}>
                                        {detail.status}
                                    </span>
                                </section>

                                {/* Actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <a href={waLink(detail.phone, `Hello ${detail.name}, regarding your flight inquiry ${inquiryNumber(detail._id)} —`)}
                                        target="_blank" rel="noreferrer"
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[13px] font-bold transition hover:-translate-y-0.5 hover:shadow-lg"
                                        style={{ background: "#25D366" }}>
                                        <FaWhatsapp size={15} /> Reply on WhatsApp
                                    </a>
                                    <a href={detail.email ? `mailto:${detail.email}?subject=${encodeURIComponent("Re: " + (detail.subject || "Flight Inquiry"))}` : undefined}
                                        aria-disabled={!detail.email}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[13px] font-bold transition hover:-translate-y-0.5 hover:shadow-lg ${!detail.email ? "opacity-40 pointer-events-none" : ""}`}
                                        style={{ background: NAVY }}>
                                        Reply by Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
