"use client";

// ===================================================================
// Admin → Website Content → Page Banners
// Manage the top banner of each public page (Tour Packages, Hajj &
// Umrah). Edit the text, upload one or more background images (they
// auto-rotate like a slider), hide a banner, or reset it to default.
// ===================================================================

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiSave, FiLoader, FiRefreshCw, FiExternalLink, FiRotateCcw } from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import { ImageGalleryInput } from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// public path of each page, for the "View page" link
const PAGE_PATH = { tour: "/tour", "hajj-umrah": "/hajj-umrah" };

function Field({ label, value, onChange, placeholder, textarea, help }) {
    const Tag = textarea ? "textarea" : "input";
    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
            <Tag
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={textarea ? 3 : undefined}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-transparent text-gray-800 placeholder-gray-400 resize-none"
            />
            {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
        </div>
    );
}

function Bilingual({ label, data, onChange, placeholder, textarea }) {
    const d = data || { en: "", bn: "" };
    return (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`${label} (English)`} value={d.en} onChange={(v) => onChange({ ...d, en: v })} placeholder={placeholder} textarea={textarea} />
            <Field label={`${label} (বাংলা)`} value={d.bn} onChange={(v) => onChange({ ...d, bn: v })} placeholder={placeholder} textarea={textarea} />
        </div>
    );
}

function Card({ title, desc, children }) {
    return (
        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">{title}</h2>
            {desc && <p className="text-xs text-gray-500 mb-5">{desc}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

function BannerEditor({ data, setData }) {
    const d = data || {};
    const set = (k, v) => setData({ ...d, [k]: v });
    const visible = d.isActive !== false;

    return (
        <>
            {/* Visibility */}
            <section className="bg-white rounded-xl border border-gray-100 p-5 mb-5 flex items-center justify-between gap-4">
                <div>
                    <p className="font-bold text-gray-900">Show this banner on the page</p>
                    <p className="text-xs text-gray-500 mt-0.5">Turn off to hide the custom banner (the page falls back to its built-in one).</p>
                </div>
                <button type="button" onClick={() => set("isActive", !visible)}
                    className={`w-14 h-8 rounded-full transition-all flex items-center p-1 shrink-0 ${visible ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"}`}>
                    <span className="w-6 h-6 rounded-full bg-white shadow" />
                </button>
            </section>

            {/* Background images */}
            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <h2 className="text-lg font-bold text-gray-900 mb-0.5">Background Images</h2>
                <p className="text-xs text-gray-500 mb-4">
                    Upload one or more. With more than one, they fade one after another like a slider.
                    Recommended size: 1920×1080.
                </p>
                <ImageGalleryInput
                    value={d.slides || []}
                    onChange={(arr) => set("slides", arr)}
                    hint="Upload multiple at once, or paste image URLs."
                />
                <div className="mt-4 max-w-xs">
                    <Field
                        label="Seconds per slide"
                        value={d.slideSeconds ?? 4}
                        onChange={(v) => set("slideSeconds", Number(v) || 4)}
                        placeholder="4"
                        help="How long each image stays before the next fades in."
                    />
                </div>
            </section>

            {/* Text */}
            <Card title="Banner Text" desc="The small label, big heading and the line under it.">
                <Bilingual label="Eyebrow (small label)" data={d.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Discover Amazing Places" />
                <Bilingual label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="Explore The" />
                <Bilingual label="Highlighted word(s)" data={d.headingHighlight} onChange={(v) => set("headingHighlight", v)} placeholder="World" />
                <Bilingual label="Subtitle" data={d.subtitle} onChange={(v) => set("subtitle", v)} textarea />
            </Card>
        </>
    );
}

export default function PageBannersPage() {
    const token = useSelector(selectToken);
    const [banners, setBanners] = useState({});   // { page: data }
    const [order, setOrder] = useState([]);        // page keys in list order
    const [labels, setLabels] = useState({});      // page → label
    const [activeTab, setActiveTab] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/page-banners`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                const map = {}, lbl = {}, keys = [];
                json.data.forEach((b) => { map[b.page] = b; lbl[b.page] = b.pageLabel || b.page; keys.push(b.page); });
                setBanners(map); setLabels(lbl); setOrder(keys);
                setActiveTab((prev) => prev || keys[0] || "");
            }
        } catch {
            toast.error("Could not load banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const updateData = (page, newData) => setBanners((p) => ({ ...p, [page]: newData }));

    const handleSave = async () => {
        if (!activeTab) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/page-banners/${activeTab}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(banners[activeTab] || {}),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            toast.success(`${labels[activeTab]} banner saved — the page is updated.`);
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!activeTab) return;
        if (!confirm(`Reset the ${labels[activeTab]} banner to its default content and image?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/page-banners/${activeTab}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Reset failed");
            updateData(activeTab, json.data);
            toast.success("Reset to default.");
        } catch (err) {
            toast.error(err.message || "Reset failed");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><FiLoader className="w-8 h-8 text-gray-300 animate-spin" /></div>;
    }

    const SaveBtn = ({ big }) => (
        <button type="button" onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 ${big ? "px-6 py-3" : "px-5 py-2 text-sm"} bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer`}>
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            {saving ? "Saving..." : `Save ${labels[activeTab] || ""}`}
        </button>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design & Content</span><span>/</span>
                        <span className="text-gray-600 font-medium">Page Banners</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Page Banners</h1>
                    <p className="text-sm text-gray-500 mt-0.5">The top banner of each page — text, images and visibility.</p>
                </div>
                <div className="flex items-center gap-2">
                    {PAGE_PATH[activeTab] && (
                        <a href={PAGE_PATH[activeTab]} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <FiExternalLink /> View page
                        </a>
                    )}
                    <button type="button" onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FiRotateCcw /> Reset
                    </button>
                    <button type="button" onClick={fetchAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FiRefreshCw /> Refresh
                    </button>
                    <SaveBtn />
                </div>
            </div>

            {/* Tabs — one per page */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {order.map((p) => (
                    <button key={p} onClick={() => setActiveTab(p)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${activeTab === p ? "bg-[#0F3C53] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                        {labels[p]}
                    </button>
                ))}
            </div>

            {/* Editor */}
            {activeTab && <BannerEditor data={banners[activeTab]} setData={(d) => updateData(activeTab, d)} />}

            <div className="flex justify-end mt-6"><SaveBtn big /></div>
        </div>
    );
}
