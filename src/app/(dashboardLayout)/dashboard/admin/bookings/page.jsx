"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LuSearch, LuFilter, LuLoader, LuTrash2, LuCheckCircle, LuXCircle, LuClock, LuRefreshCw, LuEye, LuX, LuFileText, LuMessageSquare, LuSend, LuGlobe, LuCalendar, LuWallet, LuPlus } from "react-icons/lu";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectToken } from "@/redux/features/authSlice";
import { downloadInvoice } from "@/utils/downloadInvoice";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STATUSES = ["pending", "processing", "confirmed", "cancelled", "rejected"];
const TYPES = ["tour", "hajj"];
const TYPE_LABEL = { tour: "Tour", hajj: "Hajj/Umrah" };
const TYPE_COLOR = { tour: "#10b981", hajj: "#8b5cf6" };

const STATUS_STYLE = {
    pending:    "bg-yellow-100 text-yellow-800",
    processing: "bg-[#0F3C53]/10 text-[#0F3C53]",
    confirmed:  "bg-green-100 text-green-800",
    cancelled:  "bg-gray-100 text-gray-600",
    rejected:   "bg-red-100 text-red-700",
};

const PAYMENT_METHODS = ["cash", "bkash", "nagad", "rocket", "card", "bank", "other"];
const PAY_STATUS_STYLE = {
    unpaid:   "bg-red-100 text-red-700",
    partial:  "bg-amber-100 text-amber-800",
    paid:     "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-600",
};
const PAY_STATUSES = ["unpaid", "partial", "paid", "refunded"];
const money = (n, cur = "BDT") => `${cur === "BDT" || !cur ? "৳" : cur + " "}${Number(n || 0).toLocaleString()}`;

// Turn a camelCase details key into a readable label (roomType → "Room Type")
const humanize = (k) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

function BookingsContent() {
    const searchParams = useSearchParams();
    const urlType = searchParams.get("type") || "";
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [typeFilter, setTypeFilter] = useState(urlType);
    const [showCreate, setShowCreate] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [country, setCountry] = useState("");
    const [countryQuery, setCountryQuery] = useState(""); // debounced value that actually triggers a fetch
    const [paymentStatus, setPaymentStatus] = useState("");
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState(null);
    const [noteModal, setNoteModal] = useState(null); // { id, status }
    const [note, setNote] = useState("");
    const [detailsModal, setDetailsModal] = useState(null); // full booking object
    const [invoicing, setInvoicing] = useState(null); // booking id currently downloading an invoice
    const token = useSelector(selectToken);

    // Keep the type filter locked to the URL (?type=) so the 4 sub-menus each
    // show their own bookings; changes when navigating between sub-menus.
    useEffect(() => { setTypeFilter(urlType); }, [urlType]);

    // Bell click lands here with ?open=<id> - pop that booking's details modal once.
    const openParam = searchParams.get("open") || "";
    const openedRef = useRef("");
    useEffect(() => {
        if (!openParam || openedRef.current === openParam || !bookings.length) return;
        const target = bookings.find((b) => b._id === openParam);
        if (target) {
            openedRef.current = openParam;
            setDetailsModal(target);
        }
    }, [openParam, bookings]);

    const fetchBookings = async () => {
        setLoading(true);
        setError(false);
        const params = new URLSearchParams();
        if (typeFilter) params.set("type", typeFilter);
        if (statusFilter) params.set("status", statusFilter);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        if (countryQuery.trim()) params.set("country", countryQuery.trim());
        if (paymentStatus) params.set("paymentStatus", paymentStatus);
        try {
            const res = await fetch(`${BACKEND}/api/bookings?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.success !== false) {
                setBookings(data.data || []);
            } else {
                setBookings([]);
                setError(true);
            }
        } catch {
            setBookings([]);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Debounce the free-text country input → only push to countryQuery after typing settles
    useEffect(() => {
        const t = setTimeout(() => setCountryQuery(country), 400);
        return () => clearTimeout(t);
    }, [country]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchBookings(); }, [typeFilter, statusFilter, dateFrom, dateTo, countryQuery, paymentStatus]);

    // Count of active server-side filters (for the badge)
    const activeFilterCount = [typeFilter, statusFilter, dateFrom, dateTo, countryQuery.trim(), paymentStatus].filter(Boolean).length;

    const clearFilters = () => {
        setTypeFilter("");
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
        setCountry("");
        setCountryQuery("");
        setPaymentStatus("");
        setSearch("");
    };

    // Merge an updated booking into the list + keep the open modal in sync
    const syncBooking = (updated) => {
        if (!updated?._id) return;
        setBookings(prev => prev.map(b => (b._id === updated._id ? { ...b, ...updated } : b)));
        setDetailsModal(prev => (prev && prev._id === updated._id ? { ...prev, ...updated } : prev));
    };

    const updateStatus = async (id, status, adminNote = "") => {
        setUpdating(id);
        try {
            const res = await fetch(`${BACKEND}/api/bookings/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, adminNote }),
            });
            const data = await res.json();
            if (res.ok && data.success !== false) {
                toast.success("Status updated");
                setNoteModal(null);
                setNote("");
                fetchBookings();
                window.dispatchEvent(new Event("bookings-changed"));
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const deleteBooking = async (id) => {
        if (!confirm("Delete this booking?")) return;
        try {
            const res = await fetch(`${BACKEND}/api/bookings/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.success !== false) {
                toast.success("Booking deleted");
                if (detailsModal?._id === id) setDetailsModal(null);
                fetchBookings();
            } else {
                toast.error(data.message || "Failed to delete booking");
            }
        } catch {
            toast.error("Failed to delete booking");
        }
    };

    const handleDownloadInvoice = async (booking) => {
        setInvoicing(booking._id);
        try {
            await downloadInvoice(booking._id, token, booking.trackingId);
            toast.success("Invoice downloaded");
        } catch (e) {
            toast.error(e.message || "Failed to download invoice");
        } finally {
            setInvoicing(null);
        }
    };

    const filtered = bookings.filter(b =>
        !search || b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search)
    );

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        {urlType && <span className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TYPE_COLOR[urlType]}18`, color: TYPE_COLOR[urlType] }}><LuFileText size={20} /></span>}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{urlType ? `${TYPE_LABEL[urlType]} Bookings` : "All Bookings"}</h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {urlType ? `Create, track & manage ${TYPE_LABEL[urlType].toLowerCase()} bookings` : "Manage tour & hajj bookings"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ background: "#E64266" }}>
                            <LuPlus size={16} /> New Booking
                        </button>
                        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                            <LuRefreshCw size={14} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                    {/* Row 1: search + type + status + clear */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2">
                            <LuSearch size={16} className="text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
                                className="w-full text-sm outline-none" />
                        </div>
                        {!urlType && (
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
                                <option value="">All Types</option>
                                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                            </select>
                        )}
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white">
                            <option value="">All Status</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <div className="flex items-center gap-2 ml-auto">
                            {activeFilterCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0F3C53]/10 text-[#0F3C53]">
                                    <LuFilter size={12} /> {activeFilterCount} active
                                </span>
                            )}
                            <button onClick={clearFilters} disabled={activeFilterCount === 0 && !search}
                                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                                <LuX size={14} /> Clear filters
                            </button>
                        </div>
                    </div>

                    {/* Row 2: date range + country + team member + payment status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-50">
                        <label className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                            <LuCalendar size={15} className="text-gray-400 flex-shrink-0" />
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">From</span>
                            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)}
                                className="w-full text-sm outline-none text-gray-700 bg-transparent" />
                        </label>
                        <label className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                            <LuCalendar size={15} className="text-gray-400 flex-shrink-0" />
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">To</span>
                            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)}
                                className="w-full text-sm outline-none text-gray-700 bg-transparent" />
                        </label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                            <LuGlobe size={15} className="text-gray-400 flex-shrink-0" />
                            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country"
                                className="w-full text-sm outline-none bg-transparent" />
                        </div>
                        <div className="relative">
                            <LuWallet size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                                className="w-full appearance-none pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white cursor-pointer capitalize">
                                <option value="">All Payments</option>
                                {PAY_STATUSES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Per-type stats — only on the "All Bookings" view (each sub-menu is single-type) */}
                {!urlType && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {TYPES.map(t => {
                            const count = bookings.filter(b => b.type === t).length;
                            return (
                                <div key={t} className="bg-white rounded-xl border border-gray-100 p-3 text-center cursor-pointer hover:border-[#0F3C53] transition"
                                    onClick={() => setTypeFilter(typeFilter === t ? "" : t)}>
                                    <div className="text-2xl font-bold" style={{ color: TYPE_COLOR[t] }}>{count}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{TYPE_LABEL[t]}</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-16"><LuLoader size={32} className="animate-spin text-[#0F3C53]" /></div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <LuX size={24} className="text-red-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 mb-1">Failed to load bookings</h3>
                        <p className="text-sm text-gray-400 mb-4">Something went wrong while fetching bookings.</p>
                        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-[#0F3C53] hover:bg-[#0F3C53] rounded-lg text-sm text-white font-medium transition">
                            <LuRefreshCw size={14} /> Try Again
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {["Type", "Service", "Customer", "Contact", "Status", "Date", "Actions"].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">No bookings found</td></tr>
                                    )}
                                    {filtered.map((b, i) => (
                                        <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                                                    style={{ background: TYPE_COLOR[b.type] }}>
                                                    {TYPE_LABEL[b.type]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800 max-w-32 truncate">{b.serviceName}</div>
                                                {b.amount > 0 ? (
                                                    <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${PAY_STATUS_STYLE[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                                                        {money(b.paidAmount, b.currency)} / {money(b.amount, b.currency)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-block mt-1 text-[10px] text-gray-300">no amount set</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800">{b.name}</div>
                                                <div className="text-xs text-gray-400">{b.user?.email || b.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                <div>{b.phone}</div>
                                                <div className="text-xs">{b.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select value={b.status}
                                                    onChange={e => {
                                                        if (["confirmed", "rejected"].includes(e.target.value)) {
                                                            setNoteModal({ id: b._id, status: e.target.value });
                                                        } else {
                                                            updateStatus(b._id, e.target.value);
                                                        }
                                                    }}
                                                    disabled={updating === b._id}
                                                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${STATUS_STYLE[b.status]}`}>
                                                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">
                                                {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setDetailsModal(b)} title="View details"
                                                        className="p-1.5 text-[#0F3C53] hover:text-[#0F3C53] hover:bg-[#0F3C53]/5 rounded-lg transition">
                                                        <LuEye size={15} />
                                                    </button>
                                                    <button onClick={() => handleDownloadInvoice(b)} disabled={invoicing === b._id} title="Download invoice"
                                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition disabled:opacity-50">
                                                        {invoicing === b._id ? <LuLoader size={15} className="animate-spin" /> : <LuFileText size={15} />}
                                                    </button>
                                                    <button onClick={() => deleteBooking(b._id)} title="Delete"
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                        <LuTrash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Note Modal */}
            {noteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="font-bold text-gray-800 mb-2">
                            {noteModal.status === "confirmed" ? "✅ Confirm Booking" : "❌ Reject Booking"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Add an optional note for the user</p>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                            placeholder="e.g. Your booking is confirmed for May 15..."
                            className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F3C53] mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => { setNoteModal(null); setNote(""); }}
                                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={() => updateStatus(noteModal.id, noteModal.status, note)}
                                className={`flex-1 py-2 rounded-lg text-sm text-white font-medium transition ${noteModal.status === "confirmed" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                                {noteModal.status === "confirmed" ? "Confirm" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal — shows full booking incl. type-specific `details` */}
            {detailsModal && (() => {
                const b = detailsModal;
                const details = b.details && typeof b.details === "object" ? b.details : {};
                const fields = Object.entries(details).filter(([k, v]) => k !== "message" && v !== "" && v !== null && v !== undefined);
                const message = details.message;
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailsModal(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-start justify-between p-5 border-b border-gray-100">
                                <div className="min-w-0 flex-1 pr-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: TYPE_COLOR[b.type] }}>{TYPE_LABEL[b.type]}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[b.status]}`}>{b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 mt-2 break-words">{b.serviceName}</h3>
                                    <button onClick={() => handleDownloadInvoice(b)} disabled={invoicing === b._id}
                                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-60 whitespace-nowrap"
                                        style={{ background: "#E64266" }}>
                                        {invoicing === b._id ? <LuLoader size={15} className="animate-spin" /> : <LuFileText size={15} />}
                                        {invoicing === b._id ? "Preparing..." : "Download Invoice"}
                                    </button>
                                </div>
                                <button onClick={() => setDetailsModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition shrink-0"><LuX size={20} /></button>
                            </div>
                            {/* Body */}
                            <div className="p-5 space-y-5">
                                {/* Customer */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Customer</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div><span className="text-gray-400">Name: </span><span className="font-medium text-gray-800">{b.name}</span></div>
                                        <div><span className="text-gray-400">Phone: </span><span className="font-medium text-gray-800">{b.phone}</span></div>
                                        <div className="col-span-2 break-all"><span className="text-gray-400">Email: </span><span className="font-medium text-gray-800">{b.email}</span></div>
                                        {b.user?.email && b.user.email !== b.email && (
                                            <div className="col-span-2 break-all"><span className="text-gray-400">Account: </span><span className="font-medium text-gray-800">{b.user.email}</span></div>
                                        )}
                                    </div>
                                </div>
                                {/* Booking-specific details */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Booking Details</p>
                                    {fields.length === 0 && !message ? (
                                        <p className="text-sm text-gray-400 italic">No additional details provided.</p>
                                    ) : (
                                        <div className="space-y-2 text-sm">
                                            {fields.map(([k, v]) => (
                                                <div key={k} className="flex justify-between gap-4">
                                                    <span className="text-gray-400">{humanize(k)}</span>
                                                    <span className="font-medium text-gray-800 text-right">{String(v)}</span>
                                                </div>
                                            ))}
                                            {message && (
                                                <div className="pt-1">
                                                    <span className="text-gray-400">Message</span>
                                                    <p className="mt-1 bg-gray-50 rounded-lg p-3 text-gray-800 whitespace-pre-wrap">{String(message)}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Payment */}
                                <PaymentSection
                                    key={b._id}
                                    booking={b}
                                    token={token}
                                    onUpdated={(updated) => { setDetailsModal(updated); fetchBookings(); }}
                                />

                                {/* Remarks / notes */}
                                <RemarksSection
                                    booking={b}
                                    token={token}
                                    onUpdated={syncBooking}
                                />

                                {/* Meta */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Meta</p>
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div><span className="text-gray-400">Submitted: </span><span className="font-medium text-gray-800">{b.createdAt ? new Date(b.createdAt).toLocaleString("en-GB") : "—"}</span></div>
                                        {b.serviceId && <div className="break-all"><span className="text-gray-400">Service ID: </span><span className="font-mono text-xs text-gray-600">{b.serviceId}</span></div>}
                                        {b.adminNote && <div><span className="text-gray-400">Admin Note: </span><span className="font-medium text-gray-800">{b.adminNote}</span></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {showCreate && (
                <CreateBookingModal
                    token={token}
                    defaultType={urlType}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); fetchBookings(); }}
                />
            )}
        </div>
    );
}

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
            <BookingsContent />
        </Suspense>
    );
}

// ── Payment management for a single booking (inside the details modal) ──
function PaymentSection({ booking, token, onUpdated }) {
    const [amount, setAmount] = useState(booking.amount || 0);
    const [savingAmount, setSavingAmount] = useState(false);
    const [pay, setPay] = useState({ amount: "", method: "cash", reference: "", note: "" });
    const [savingPay, setSavingPay] = useState(false);
    const cur = booking.currency || "BDT";

    const saveAmount = async () => {
        setSavingAmount(true);
        try {
            const res = await fetch(`${BACKEND}/api/bookings/${booking._id}/amount`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: Number(amount) }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            toast.success("Total amount updated");
            onUpdated(data.data);
        } catch (e) { toast.error(e.message || "Failed to update amount"); }
        finally { setSavingAmount(false); }
    };

    const recordPayment = async () => {
        if (!pay.amount || Number(pay.amount) <= 0) { toast.error("Enter a valid payment amount"); return; }
        setSavingPay(true);
        try {
            const res = await fetch(`${BACKEND}/api/bookings/${booking._id}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: Number(pay.amount), method: pay.method, reference: pay.reference, note: pay.note }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            toast.success("Payment recorded");
            setPay({ amount: "", method: "cash", reference: "", note: "" });
            onUpdated(data.data);
        } catch (e) { toast.error(e.message || "Failed to record payment"); }
        finally { setSavingPay(false); }
    };

    return (
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Payment</p>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Total</p>
                    <p className="text-sm font-bold text-gray-800">{money(booking.amount, cur)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Paid</p>
                    <p className="text-sm font-bold text-green-700">{money(booking.paidAmount, cur)}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Due</p>
                    <p className="text-sm font-bold text-red-600">{money(booking.dueAmount, cur)}</p>
                </div>
            </div>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 ${PAY_STATUS_STYLE[booking.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                {(booking.paymentStatus || "unpaid").toUpperCase()}
            </span>

            {/* Set total amount */}
            <div className="flex gap-2 mb-3">
                <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Total amount (quote)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F3C53]" />
                <button onClick={saveAmount} disabled={savingAmount}
                    className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 whitespace-nowrap">
                    {savingAmount ? "..." : "Set Total"}
                </button>
            </div>

            {/* Record a manual/office payment */}
            <div className="bg-[#0F3C53]/5/50 border border-[#0F3C53]/10 rounded-lg p-3 space-y-2">
                <p className="text-[11px] font-semibold text-gray-600">Record a payment (cash / office / manual)</p>
                <div className="grid grid-cols-2 gap-2">
                    <input type="number" min="0" value={pay.amount} onChange={e => setPay(p => ({ ...p, amount: e.target.value }))} placeholder="Amount"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white" />
                    <select value={pay.method} onChange={e => setPay(p => ({ ...p, method: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none capitalize bg-white">
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input value={pay.reference} onChange={e => setPay(p => ({ ...p, reference: e.target.value }))} placeholder="Reference / TrxID (optional)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none col-span-2 bg-white" />
                    <input value={pay.note} onChange={e => setPay(p => ({ ...p, note: e.target.value }))} placeholder="Note (optional)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none col-span-2 bg-white" />
                </div>
                <button onClick={recordPayment} disabled={savingPay}
                    className="w-full py-2 bg-[#0F3C53] text-white rounded-lg text-sm font-medium hover:bg-[#0F3C53] disabled:opacity-50">
                    {savingPay ? "Recording..." : "+ Add Payment"}
                </button>
            </div>

            {/* Payment history */}
            {Array.isArray(booking.payments) && booking.payments.length > 0 && (
                <div className="mt-3">
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Payment history</p>
                    <div className="space-y-1.5">
                        {booking.payments.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                                <div className="min-w-0">
                                    <span className="font-semibold text-gray-800">{money(p.amount, cur)}</span>
                                    <span className="text-gray-400 ml-2 capitalize">{p.method}</span>
                                    {p.reference && <span className="text-gray-400 ml-2">#{p.reference}</span>}
                                    {p.note && <span className="text-gray-400 ml-2 italic">{p.note}</span>}
                                </div>
                                <span className="text-gray-400 whitespace-nowrap ml-2">{new Date(p.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


// ── Remarks history + add-remark (admin or assigned team member) ──
function RemarksSection({ booking, token, onUpdated }) {
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);
    const remarks = Array.isArray(booking.remarks) ? booking.remarks : [];

    const addRemark = async () => {
        const t = text.trim();
        if (!t) return;
        setPosting(true);
        try {
            const res = await fetch(`${BACKEND}/api/bookings/${booking._id}/remarks`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: t }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            setText("");
            toast.success("Remark added");
            onUpdated(data.data || { _id: booking._id, remarks: [...remarks, { text: t, authorName: "Admin", at: new Date().toISOString() }] });
        } catch (e) {
            toast.error(e.message || "Failed to add remark");
        } finally {
            setPosting(false);
        }
    };

    return (
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <LuMessageSquare size={12} /> Remarks {remarks.length > 0 && <span className="text-gray-300">({remarks.length})</span>}
            </p>
            {remarks.length === 0 ? (
                <p className="text-sm text-gray-400 italic mb-2">No remarks yet.</p>
            ) : (
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                    {remarks.map((r, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-gray-700">{r.authorName || "—"}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {r.at ? new Date(r.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                            </div>
                            <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-wrap break-words">{r.text}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addRemark(); } }}
                    placeholder="Add a remark…"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F3C53]/30"
                />
                <button
                    onClick={addRemark}
                    disabled={posting || !text.trim()}
                    className="px-3 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                    style={{ background: "#0F3C53" }}
                >
                    {posting ? <LuLoader size={14} className="animate-spin" /> : <LuSend size={14} />}
                </button>
            </div>
        </div>
    );
}

// ── Admin: create a booking on a customer's behalf ──
// Each type pulls its selectable list straight from the database so bookings
// stay in sync with the real tours/packages.
const TYPE_SOURCE = {
    tour:  { url: "/api/tours/active",       selectLabel: "Tour Package",        name: (t) => t.title, price: (t) => t.price,        sub: (t) => t.destination },
    hajj:  { url: "/api/hajj-umrah/active",  selectLabel: "Hajj / Umrah Package",name: (p) => p.name,  price: (p) => p.price,        sub: (p) => (p.type === "hajj" ? "Hajj" : "Umrah") },
};

function CreateBookingModal({ token, defaultType, onClose, onCreated }) {
    const [f, setF] = useState({
        type: defaultType || "tour",
        serviceName: "", serviceId: "",
        name: "", email: "", phone: "",
        country: "", travelDate: "", notes: "", amount: "",
    });
    const [options, setOptions] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(false);
    const [selectedId, setSelectedId] = useState("");
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const src = TYPE_SOURCE[f.type] || TYPE_SOURCE.tour;
    const input = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E64266]/20 focus:border-[#E64266]";
    const label = "block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1";

    // Load the DB list whenever the booking type changes.
    useEffect(() => {
        const s = TYPE_SOURCE[f.type];
        if (!s) return;
        setLoadingOpts(true);
        setOptions([]);
        setSelectedId("");
        setF((p) => ({ ...p, serviceName: "", serviceId: "", country: "", amount: "" }));
        fetch(`${BACKEND}${s.url}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setOptions(Array.isArray(d?.data) ? d.data : (d?.data?.data || [])))
            .catch(() => {})
            .finally(() => setLoadingOpts(false));
    }, [f.type]);

    // Pick an item → auto-fill service name, id, price (editable) & location.
    const onSelect = (id) => {
        setSelectedId(id);
        const item = options.find((o) => String(o._id) === String(id));
        if (!item) { setF((p) => ({ ...p, serviceName: "", serviceId: "", country: "" })); return; }
        setF((p) => ({
            ...p,
            serviceName: src.name(item),
            serviceId: String(item._id),
            country: src.sub(item) || "",
            amount: src.price(item) ? String(src.price(item)) : "",
        }));
    };

    const submit = async () => {
        if (!f.serviceName.trim()) return toast.error(`Please select a ${src.selectLabel.toLowerCase()}`);
        if (!f.name.trim()) return toast.error("Customer name is required");
        if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("A valid email is required");
        if (!f.phone.trim()) return toast.error("Phone is required");

        setSaving(true);
        try {
            const details = {};
            if (f.country.trim()) details.country = f.country.trim();
            if (f.travelDate) details.travelDate = f.travelDate;
            if (f.notes.trim()) details.notes = f.notes.trim();

            // Sent WITHOUT the admin token so the booking is recorded as the
            // customer's own guest booking, not the admin's.
            const body = {
                type: f.type,
                serviceName: f.serviceName.trim(),
                name: f.name.trim(),
                email: f.email.trim().toLowerCase(),
                phone: f.phone.trim(),
                details,
            };
            if (f.serviceId) body.serviceId = f.serviceId;

            const res = await fetch(`${BACKEND}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed to create booking");

            const booking = data.data?.booking || data.data;
            const account = data.data?.account;

            // Set the quoted total (needs admin auth).
            if (booking?._id && Number(f.amount) > 0) {
                await fetch(`${BACKEND}/api/bookings/${booking._id}/amount`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ amount: Number(f.amount) }),
                }).catch(() => {});
            }

            toast.success(account?.isNew
                ? `Booking created — account made for ${f.email}`
                : `Booking created for ${f.email}`);
            onCreated();
        } catch (e) {
            toast.error(e.message || "Failed to create booking");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2.5">
                        <span className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${TYPE_COLOR[f.type]}18`, color: TYPE_COLOR[f.type] }}><LuPlus size={18} /></span>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">New {TYPE_LABEL[f.type]} Booking</h3>
                            <p className="text-[12px] text-gray-400">Create a booking on a customer's behalf</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><LuX size={18} /></button>
                </div>

                <div className="p-5 space-y-4">
                    {/* tracking note */}
                    <div className="flex items-start gap-2 rounded-lg bg-[#E64266]/8 border border-[#E64266]/20 px-3 py-2.5">
                        <LuFileText size={15} className="text-[#E64266] mt-0.5 shrink-0" />
                        <p className="text-[12px] text-gray-600">A tracking ID is generated for this booking — the customer can follow its status from the Track page.</p>
                    </div>

                    <div>
                        <label className={label}>Booking Type</label>
                        <select value={f.type} onChange={(e) => set("type", e.target.value)} className={`${input} capitalize`}>
                            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                        </select>
                    </div>

                    {/* DB-driven picker for the current type */}
                    <div>
                        <label className={label}>{src.selectLabel} *</label>
                        <select value={selectedId} onChange={(e) => onSelect(e.target.value)} className={input} disabled={loadingOpts}>
                            <option value="">{loadingOpts ? "Loading…" : `Select ${src.selectLabel.toLowerCase()}…`}</option>
                            {options.map((o) => (
                                <option key={o._id} value={o._id}>
                                    {src.name(o)}
                                    {src.price(o) ? ` — ৳${Number(src.price(o)).toLocaleString()}` : ""}
                                    {src.sub(o) ? ` · ${src.sub(o)}` : ""}
                                </option>
                            ))}
                        </select>
                        {!loadingOpts && options.length === 0 && (
                            <p className="text-[11px] text-amber-600 mt-1">No {src.selectLabel.toLowerCase()} found — add some in the admin catalog first.</p>
                        )}
                    </div>

                    {/* Payment amount — prefilled from the selection, editable */}
                    <div>
                        <label className={label}>Payment Amount (৳)</label>
                        <input type="number" min="0" value={f.amount} onChange={(e) => set("amount", e.target.value)} className={input}
                            placeholder="Auto-filled from selection — editable" />
                    </div>

                    <div className="pt-1 border-t border-gray-100" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Customer</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className={label}>Full Name *</label><input value={f.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="Customer name" /></div>
                        <div><label className={label}>Phone *</label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} className={input} placeholder="01XXXXXXXXX" /></div>
                        <div className="sm:col-span-2"><label className={label}>Email *</label><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={input} placeholder="customer@email.com" /></div>
                    </div>

                    <div className="pt-1 border-t border-gray-100" />
                    <div><label className={label}>Travel / Start Date <span className="text-gray-300 normal-case">optional</span></label><input type="date" value={f.travelDate} onChange={(e) => set("travelDate", e.target.value)} className={input} /></div>
                    <div><label className={label}>Notes <span className="text-gray-300 normal-case">optional</span></label><textarea rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} className={`${input} resize-none`} placeholder="Any special request or reference…" /></div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5" style={{ background: "#E64266" }}>
                        {saving ? <LuLoader size={15} className="animate-spin" /> : <LuPlus size={15} />} Create Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
