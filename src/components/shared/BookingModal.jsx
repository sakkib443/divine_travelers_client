"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuLoader, LuCopy, LuArrowRight, LuShieldCheck, LuLock, LuCheck } from "react-icons/lu";
import { useSelector } from "react-redux";
import { selectToken, selectCurrentUser } from "@/redux/features/authSlice";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Manual payment methods. Mobile options (bKash/Nagad/Rocket) show a "Send Money"
// number + a TrxID field; the TrxID is saved with the booking for admin verification.
const PAYMENT_METHODS = [
    { key: "bkash", label: "bKash", color: "#E2136E", hint: "Send Money", mobile: true },
    { key: "nagad", label: "Nagad", color: "#EE5A29", hint: "Send Money", mobile: true },
    { key: "rocket", label: "Rocket", color: "#8C3494", hint: "Send Money", mobile: true },
    { key: "cash", label: "On confirmation", color: "#16A34A", hint: "Cash / Office" },
];

const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E64266]/50 focus:border-[#E64266] transition";
const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5";

// hiddenFields: values the page knows but the customer shouldn't type — e.g. the
//   country slug, which the server needs to build the right document checklist.
export default function BookingModal({ isOpen, onClose, type, serviceName, serviceId = "", extraFields = [], hiddenFields = {}, summary = null }) {
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);
    const { settings } = useSiteSettings();
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", paymentMethod: "", trxId: "", ...Object.fromEntries(extraFields.map(f => [f.key, f.defaultValue ?? ""])) });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [trackingId, setTrackingId] = useState("");

    const typeLabels = { tour: "Tour Booking", hajj: "Hajj/Umrah Booking" };

    useEffect(() => {
        if (!isOpen) return;
        setSuccess(false); setError(""); setTrackingId("");
        // Re-seed defaults on open: the page may have changed them since mount
        // (e.g. the visitor picked a different option before clicking Apply).
        const defaults = Object.fromEntries(
            extraFields.filter(f => f.defaultValue !== undefined).map(f => [f.key, f.defaultValue])
        );
        if (Object.keys(defaults).length) setForm(prev => ({ ...prev, ...defaults }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        // Instant prefill from the store (name = firstName + lastName; phone is often absent in the token).
        if (user) {
            const fullName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();
            setForm(prev => ({ ...prev, name: prev.name || fullName, email: prev.email || user.email || "", phone: prev.phone || user.phone || "" }));
        }
        // Enrich from the saved profile so phone (not carried in the JWT) also prefills.
        if (token) {
            fetch(`${BACKEND}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => (r.ok ? r.json() : null))
                .then(d => {
                    const u = d?.data;
                    if (!u) return;
                    const fullName = u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
                    setForm(prev => ({ ...prev, name: prev.name || fullName, email: prev.email || u.email || "", phone: prev.phone || u.phone || "" }));
                })
                .catch(() => {});
        }
    }, [isOpen, user, token]);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const mobilePay = ["bkash", "nagad", "rocket"].includes(form.paymentMethod);
        if (mobilePay && !form.trxId.trim()) {
            setError("Please enter your payment TrxID, or choose 'On confirmation'.");
            return;
        }
        setLoading(true);
        try {
            const { name, email, phone, message, paymentMethod, trxId, ...rest } = form;
            const body = {
                type, serviceName, serviceId, name, email, phone,
                details: { ...rest, ...hiddenFields, message, paymentMethod, trxId },
            };
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await fetch(`${BACKEND}/api/bookings`, { method: "POST", headers, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Something went wrong");
            const booking = data.data?.booking || data.data;
            setTrackingId(booking?.trackingId || "");
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currency = summary?.currency || "৳";
    const fmt = (n) => `${currency}${Number(n || 0).toLocaleString()}`;
    const hasSummary = !!summary;
    const hasTotal = hasSummary && Number(summary.total) > 0;

    const payNumbers = {
        bkash: settings?.bkashNumber || settings?.whatsappNumber || settings?.contactPhone || "",
        nagad: settings?.nagadNumber || settings?.whatsappNumber || settings?.contactPhone || "",
        rocket: settings?.rocketNumber || settings?.whatsappNumber || settings?.contactPhone || "",
    };
    const selectedMethod = PAYMENT_METHODS.find(m => m.key === form.paymentMethod);
    const isMobilePay = !!selectedMethod?.mobile;
    const payNumber = isMobilePay ? payNumbers[form.paymentMethod] : "";

    // Options may be plain strings, or {value,label} when the stored value differs
    // from what we show (e.g. profession slug "job-holder" vs "Job Holder").
    const optionOf = (o) => (typeof o === "string" ? { value: o, label: o } : o);

    const renderField = (f) => (
        <div key={f.key} className={f.full ? "sm:col-span-2" : undefined}>
            <label className={labelClass}>{f.label}{f.required && " *"}</label>
            {f.type === "select" ? (
                <select name={f.key} value={form[f.key]} onChange={handleChange} required={f.required} className={inputClass}>
                    <option value="">{f.placeholder || "Select..."}</option>
                    {f.options?.map((o) => {
                        const opt = optionOf(o);
                        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                    })}
                </select>
            ) : f.type === "textarea" ? (
                <textarea name={f.key} rows={2} value={form[f.key]} onChange={handleChange} placeholder={f.placeholder || ""} required={f.required} className={inputClass} />
            ) : (
                <input name={f.key} type={f.type || "text"} value={form[f.key]} onChange={handleChange} placeholder={f.placeholder || ""} required={f.required} className={inputClass} />
            )}
            {f.hint && <p className="text-[11px] text-gray-400 mt-1">{f.hint}</p>}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(8, 12, 22, 0.7)", backdropFilter: "blur(3px)" }}
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-y-auto ${success ? "max-w-md" : hasSummary ? "max-w-4xl" : "max-w-md"}`}
                    >
                        {/* Close */}
                        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/70 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition backdrop-blur-sm">
                            <LuX size={18} />
                        </button>

                        {success ? (
                            /* ---------------- ORDER PLACED ---------------- */
                            <div className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                                    className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
                                    style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
                                >
                                    <span className="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping" style={{ background: "#22c55e" }} />
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.18 }}>
                                        <LuCheck size={44} className="text-white" strokeWidth={3} />
                                    </motion.span>
                                </motion.div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Order Placed!</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Your {(typeLabels[type] || "booking").toLowerCase()} request is received — our team will contact you shortly.
                                </p>

                                {trackingId && (
                                    <div className="mb-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 font-eyebrow">Your Tracking ID</p>
                                        <button type="button" onClick={() => navigator?.clipboard?.writeText(trackingId)}
                                            className="inline-flex items-center gap-2 text-lg font-extrabold text-gray-800 hover:text-[#E64266] transition-colors" title="Copy tracking ID">
                                            {trackingId} <LuCopy size={15} />
                                        </button>
                                        <p className="text-xs text-gray-400 mt-1">Save this as your booking reference number.</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-3">
                                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ---------------- CHECKOUT ---------------- */
                            <div className={hasSummary ? "grid lg:grid-cols-[1.35fr_1fr] items-stretch" : ""}>
                                {/* LEFT: form */}
                                <div className="order-2 lg:order-1 p-6 sm:p-8">
                                    <div className="mb-6 pr-8">
                                        <h2 className="text-xl font-bold text-gray-900">{typeLabels[type] || "Booking"}</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">{serviceName}</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Your Details</p>
                                            <div>
                                                <label className={labelClass}>Full Name *</label>
                                                <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className={inputClass} />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>Phone *</label>
                                                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+880 1XXXXXXXXX" className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Email *</label>
                                                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className={inputClass} />
                                                </div>
                                            </div>
                                            {extraFields.length > 0 && (
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {extraFields.map(renderField)}
                                                </div>
                                            )}

                                            <div>
                                                <label className={labelClass}>Additional Message</label>
                                                <textarea name="message" value={form.message} onChange={handleChange} rows={2}
                                                    placeholder="Any specific requirements or questions..." className={`${inputClass} resize-none`} />
                                            </div>
                                        </div>

                                        {/* Payment method (optional) */}
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                                Payment Method <span className="font-normal normal-case tracking-normal text-gray-300">— optional</span>
                                            </p>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                {PAYMENT_METHODS.map(m => {
                                                    const active = form.paymentMethod === m.key;
                                                    return (
                                                        <button type="button" key={m.key}
                                                            onClick={() => setForm(p => ({ ...p, paymentMethod: active ? "" : m.key }))}
                                                            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${active ? "border-transparent" : "border-gray-200 hover:border-gray-300"}`}
                                                            style={active ? { boxShadow: `0 0 0 2px ${m.color}`, background: `${m.color}0f` } : {}}>
                                                            <span className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: m.color }}>
                                                                {m.label[0]}
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block text-[13px] font-semibold text-gray-800 truncate">{m.label}</span>
                                                                <span className="block text-[10px] text-gray-400">{m.hint}</span>
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {isMobilePay && (
                                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3.5 space-y-3">
                                                    <p className="text-[13px] leading-relaxed text-gray-600">
                                                        <span className="font-semibold text-gray-800">Send Money</span> via {selectedMethod.label}{hasTotal ? ` (${fmt(summary.total)})` : ""} to the number below, then paste your TrxID.
                                                    </p>
                                                    {payNumber ? (
                                                        <button type="button" onClick={() => navigator?.clipboard?.writeText(payNumber)}
                                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-gray-300">
                                                            <span>
                                                                <span className="block text-[10px] uppercase tracking-wider text-gray-400">{selectedMethod.label} — Send Money</span>
                                                                <span className="block text-base font-bold tracking-wide text-gray-900">{payNumber}</span>
                                                            </span>
                                                            <LuCopy size={16} className="text-gray-400 shrink-0" />
                                                        </button>
                                                    ) : (
                                                        <p className="text-xs text-amber-600">Payment number not set yet — please contact us to pay.</p>
                                                    )}
                                                    <div>
                                                        <label className={labelClass}>{selectedMethod.label} TrxID *</label>
                                                        <input name="trxId" value={form.trxId} onChange={handleChange} placeholder="e.g. 9AB7CDE1FG" className={inputClass} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                                        <button type="submit" disabled={loading}
                                            className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-lg shadow-orange-500/20"
                                            style={{ background: "linear-gradient(135deg, #E64266, #D97A1E)" }}>
                                            {loading ? <><LuLoader size={16} className="animate-spin" /> Submitting...</>
                                                : <>Confirm Booking{hasTotal && ` · ${fmt(summary.total)}`} <LuArrowRight size={16} /></>}
                                        </button>

                                        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                            <LuLock size={12} /> No login required · We'll contact you to confirm.
                                        </p>
                                    </form>
                                </div>

                                {/* RIGHT: order summary */}
                                {hasSummary && (
                                    <div className="order-1 lg:order-2 flex flex-col p-6 sm:p-7 text-white"
                                        style={{ background: "linear-gradient(160deg, #0c1a3a 0%, #16294f 55%, #1e3f75 100%)" }}>
                                        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45 mb-5 font-eyebrow">Order Summary</h3>

                                        <div className="flex items-center gap-3 mb-5">
                                            {summary.image ? (
                                                <img src={summary.image} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/15" />
                                            ) : (
                                                <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl ring-1 ring-white/10">
                                                    {summary.icon || "🧾"}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-semibold leading-tight truncate">{summary.title}</p>
                                                {summary.subtitle && <p className="text-sm text-white/55 truncate">{summary.subtitle}</p>}
                                            </div>
                                        </div>

                                        {summary.lineItems?.length > 0 && (
                                            <div className="space-y-2.5 border-t border-white/10 pt-4">
                                                {summary.lineItems.map((li, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-white/60">{li.label}</span>
                                                        <span className="font-medium">{fmt(li.value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 border-t border-white/10 pt-4 flex items-end justify-between">
                                            <span className="text-sm text-white/60">{summary.totalLabel || "Grand Total"}</span>
                                            <span className="text-2xl font-bold" style={{ color: "#F5A54D" }}>
                                                {hasTotal ? fmt(summary.total) : "On confirmation"}
                                            </span>
                                        </div>

                                        <div className="mt-auto pt-6 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-white/45"><LuShieldCheck size={14} /> Secure &amp; confidential</div>
                                            <div className="flex items-center gap-2 text-xs text-white/45"><LuCheck size={14} /> No payment needed to submit</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
