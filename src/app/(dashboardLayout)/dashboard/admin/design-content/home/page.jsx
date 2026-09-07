"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiSave, FiLoader, FiRefreshCw, FiPlus, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SECTIONS = ["hero", "noticeBoard", "whyChooseUs", "services", "about"];
const TAB_LABELS = { hero: "Hero", noticeBoard: "Notice Board", whyChooseUs: "Why Choose Us", services: "Services", about: "About Us" };

// ─── Reusable Field Components ───────────────────────────────────────
function Field({ label, value, onChange, placeholder, wide, textarea, help }) {
    const Tag = textarea ? "textarea" : "input";
    return (
        <div className={wide ? "md:col-span-2" : ""}>
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

// Field-এর মতোই দেখতে, কিন্তু ভেতরে লিংক বক্সের পাশে Upload বাটন ও
// ছোট প্রিভিউ থাকে — এই পেজের সব ছবির ঘরে এটাই ব্যবহার হয়।
function ImageField({ label, value, onChange, placeholder, help, wide }) {
    return (
        <div className={wide ? "md:col-span-2" : ""}>
            <ImageInput
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                hint={help}
                labelClass="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
                inputClass="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-transparent text-gray-800 placeholder-gray-400"
            />
        </div>
    );
}

function BilingualField({ label, data, onChange, placeholder, textarea }) {
    const d = data || { en: "", bn: "" };
    return (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`${label} (English)`} value={d.en} onChange={(v) => onChange({ ...d, en: v })} placeholder={placeholder} textarea={textarea} />
            <Field label={`${label} (বাংলা)`} value={d.bn} onChange={(v) => onChange({ ...d, bn: v })} placeholder={placeholder} textarea={textarea} />
        </div>
    );
}

function SectionCard({ title, desc, children }) {
    return (
        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">{title}</h2>
            {desc && <p className="text-xs text-gray-500 mb-5">{desc}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

// ─── Hero Background Slides ──────────────────────────────────────────
// The pictures that fade behind the hero. Upload replaces the old workflow of
// dropping files in /public and editing the code.
function SlidesEditor({ slides, setSlides }) {
    const token = useSelector(selectToken);
    const [uploading, setUploading] = useState(false);

    const upload = async (file, index) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch(`${API_BASE}/api/upload/single`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Upload failed");
            const next = [...slides];
            if (index == null) next.push({ image: json.data.url });
            else next[index] = { ...next[index], image: json.data.url };
            setSlides(next);
            toast.success("Image uploaded");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const move = (i, dir) => {
        const j = i + dir;
        if (j < 0 || j >= slides.length) return;
        const next = [...slides];
        [next[i], next[j]] = [next[j], next[i]];
        setSlides(next);
    };

    return (
        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Background Pictures</h2>
            <p className="text-xs text-gray-500 mb-5">
                These fade one after another behind the hero. Add at least one — with none saved,
                the site falls back to the four pictures shipped with it.<br />
                <span className="font-semibold text-gray-600">Recommended Size:</span> 1920x1080 pixels (16:9 ratio) for best display.
            </p>

            {slides.length === 0 && (
                <p className="text-[13px] text-gray-400 mb-4">No pictures added yet.</p>
            )}

            <div className="space-y-3">
                {slides.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                        <img
                            src={s.image}
                            alt={`Slide ${i + 1}`}
                            className="w-24 h-14 rounded object-cover border border-gray-100 flex-shrink-0 bg-gray-50"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Slide {i + 1}</p>
                            <input
                                value={s.image || ""}
                                onChange={(e) => {
                                    const next = [...slides];
                                    next[i] = { ...next[i], image: e.target.value };
                                    setSlides(next);
                                }}
                                placeholder="/hero.jpg or https://..."
                                className="w-full mt-1 px-2 py-1.5 text-[12px] border border-gray-200 rounded outline-none focus:border-[#0F3C53] bg-transparent text-gray-700"
                            />
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                                className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30" title="Move up">
                                <FiChevronUp size={13} />
                            </button>
                            <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1}
                                className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30" title="Move down">
                                <FiChevronDown size={13} />
                            </button>
                            <label className="cursor-pointer px-2.5 py-1.5 rounded text-[11px] font-bold bg-[#0F3C53] text-white hover:opacity-90">
                                Replace
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], i)} />
                            </label>
                            <button type="button" onClick={() => setSlides(slides.filter((_, x) => x !== i))}
                                className="w-7 h-7 rounded bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center" title="Remove">
                                <FiTrash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
                <label className={`cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold text-white hover:opacity-90 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    style={{ backgroundColor: "#0F3C53" }}>
                    {uploading ? <FiLoader size={13} className="animate-spin" /> : <FiPlus size={13} />}
                    {uploading ? "Uploading..." : "Upload Picture"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files?.[0], null)} />
                </label>
                <button type="button" onClick={() => setSlides([...slides, { image: "" }])}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                    <FiPlus size={13} /> Add by URL
                </button>
            </div>
        </section>
    );
}

// ─── Hero Editor ─────────────────────────────────────────────────────
// Mirrors what the live Hero actually renders: a background image slider, the
// badge + heading, and the two buttons. No video field — the Hero has never
// rendered a video. The search card below the hero is not editable here: it is
// driven by the tour data itself.
function HeroEditor({ data, setData }) {
    const d = data || {};
    const set = (k, v) => setData({ ...d, [k]: v });

    const slides = d.slides || [];
    const setSlides = (next) => set("slides", next.map((s, i) => ({ ...s, order: i })));

    return (
        <>
            <SlidesEditor slides={slides} setSlides={setSlides} />

            <SectionCard title="Slider Speed" desc="How long each background picture stays before the next one fades in">
                <Field
                    label="Seconds per slide"
                    value={d.slideSeconds ?? ""}
                    onChange={(v) => set("slideSeconds", v === "" ? "" : Number(v))}
                    placeholder="4"
                    help="Leave empty for the default (4 seconds)"
                />
            </SectionCard>

            <SectionCard title="Hero Text" desc="The badge pill and the big heading over the pictures">
                <BilingualField label="Badge Text" data={d.badgeText} onChange={(v) => set("badgeText", v)} placeholder="Open: Sat–Thu | 9:30am–8:30pm" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="YOUR JOURNEY STARTS WITH DIVINE TRAVELERS" />
            </SectionCard>



        </>
    );
}

// ─── Services Editor ─────────────────────────────────────────────────
function ServicesEditor({ data, setData }) {
    const d = data || {};
    const items = d.items || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setItem = (idx, k, v) => {
        const copy = [...items];
        copy[idx] = { ...copy[idx], [k]: v };
        set("items", copy);
    };

    return (
        <>
            <SectionCard title="Section Header" desc="Title and description of services section">
                <BilingualField label="Tag Text" data={d.tagText} onChange={(v) => set("tagText", v)} placeholder="OUR SERVICES" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="WHAT WE" />
                <BilingualField label="Heading Highlight" data={d.headingHighlight} onChange={(v) => set("headingHighlight", v)} placeholder="OFFER" />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} placeholder="Comprehensive travel..." textarea />
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Service Cards</h2>
                        <p className="text-xs text-gray-500">Edit the 4 primary service cards (Image & Title)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-5 relative">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-gray-700">#{idx + 1} — {item.id ? item.id.toUpperCase() : "Service"}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <BilingualField label="Title" data={item.title} onChange={(v) => setItem(idx, "title", v)} placeholder="Tour Packages" />
                                <ImageField label="Image" value={item.image} onChange={(v) => setItem(idx, "image", v)} wide />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <SectionCard title="Bottom CTA" desc="Call to action below service cards">
                <BilingualField label="CTA Text" data={d.bottomCTAText} onChange={(v) => set("bottomCTAText", v)} placeholder="View All Services" />
                <Field label="CTA Link" value={d.bottomCTALink} onChange={(v) => set("bottomCTALink", v)} placeholder="/contact" />
            </SectionCard>
        </>
    );
}

// ─── About Editor ────────────────────────────────────────────────
function AboutEditor({ data, setData }) {
    const d = data || {};
    const features = d.features || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setFeature = (idx, k, v) => { const f = [...features]; f[idx] = { ...f[idx], [k]: v }; set("features", f); };

    return (
        <>
            <SectionCard title="Heading & Text" desc="Main text shown on the right side">
                <BilingualField label="Main Heading" data={d.heading} onChange={(v) => set("heading", v)} />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>
            
            <SectionCard title="Images" desc="The two overlapping images on the left side">
                <ImageField label="Main Image (Bottom)" value={d.image1} onChange={(v) => set("image1", v)} help="Recommended: Portrait or large landscape image" />
                <ImageField label="Square Image (Top Left)" value={d.image2} onChange={(v) => set("image2", v)} help="Recommended: Square format (e.g., 600x600)" />
            </SectionCard>
            
            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div><h2 className="text-lg font-bold text-gray-900">Features</h2><p className="text-xs text-gray-500">The 2 highlights below the description (e.g. 2018, 50+)</p></div>
                </div>
                <div className="space-y-4">
                    {features.map((feature, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-gray-700">Feature #{idx + 1}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Large Value" value={feature.value} onChange={(v) => setFeature(idx, "value", v)} placeholder="e.g. 2018 or 50+" />
                                <Field label="Icon Name (e.g. LuGlobe)" value={feature.icon} onChange={(v) => setFeature(idx, "icon", v)} placeholder="LuGlobe" help="Valid Lucide React icon name" />
                                <BilingualField label="Title" data={feature.title} onChange={(v) => setFeature(idx, "title", v)} placeholder="The First Trip We Operated" />
                                <BilingualField label="Subtitle / Description" data={feature.subtitle} onChange={(v) => setFeature(idx, "subtitle", v)} textarea />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

// ─── Why Choose Us Editor ────────────────────────────────────────────
function WhyChooseEditor({ data, setData }) {
    const d = data || {};
    const cards = d.cards || [];
    const stats = d.stats || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setCard = (idx, k, v) => { const c = [...cards]; c[idx] = { ...c[idx], [k]: v }; set("cards", c); };
    const setStat = (idx, k, v) => { const s = [...stats]; s[idx] = { ...s[idx], [k]: v }; set("stats", s); };
    const addCard = () => set("cards", [...cards, { title: { en: "", bn: "" }, description: { en: "", bn: "" }, icon: "🎯", color: "#0F3C53", order: cards.length + 1 }]);
    const removeCard = (idx) => set("cards", cards.filter((_, i) => i !== idx));
    const addStat = () => set("stats", [...stats, { value: "", label: { en: "", bn: "" }, color: "#0F3C53", order: stats.length + 1 }]);
    const removeStat = (idx) => set("stats", stats.filter((_, i) => i !== idx));

    return (
        <>
            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div><h2 className="text-lg font-bold text-gray-900">Feature Cards</h2><p className="text-xs text-gray-500">{cards.length} cards (Maximum 3)</p></div>
                    {cards.length < 3 && (
                        <button type="button" onClick={addCard} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F3C53] bg-[#0F3C53]/10 rounded-lg hover:bg-[#0F3C53]/20 cursor-pointer"><FiPlus size={14} /> Add Card</button>
                    )}
                </div>
                <div className="space-y-4">
                    {cards.map((card, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-gray-700">#{idx + 1} — {card.title?.en || "New"}</span>
                                {cards.length > 3 && (
                                    <button type="button" onClick={() => removeCard(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer"><FiTrash2 size={14} /></button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <BilingualField label="Title" data={card.title} onChange={(v) => setCard(idx, "title", v)} />
                                <BilingualField label="Description" data={card.description} onChange={(v) => setCard(idx, "description", v)} textarea />
                                <Field label="Icon Name (e.g. LuRocket)" value={card.icon} onChange={(v) => setCard(idx, "icon", v)} placeholder="LuRocket" help="Must be a valid Lucide React icon name (e.g., LuRocket, LuHeadphones, LuWallet)." />
                                <Field label="Color" value={card.color} onChange={(v) => setCard(idx, "color", v)} placeholder="#0F3C53" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div><h2 className="text-lg font-bold text-gray-900">Stats Bar</h2><p className="text-xs text-gray-500">{stats.length} stats</p></div>
                    <button type="button" onClick={addStat} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F3C53] bg-[#0F3C53]/10 rounded-lg hover:bg-[#0F3C53]/20 cursor-pointer"><FiPlus size={14} /> Add Stat</button>
                </div>
                <div className="space-y-3">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-wrap items-end gap-3 border border-gray-100 rounded-lg p-3">
                            <Field label="Value" value={stat.value} onChange={(v) => setStat(idx, "value", v)} placeholder="10+" />
                            <BilingualField label="Label" data={stat.label} onChange={(v) => setStat(idx, "label", v)} placeholder="Years Experience" />
                            <Field label="Color" value={stat.color} onChange={(v) => setStat(idx, "color", v)} placeholder="#0F3C53" />
                            <button type="button" onClick={() => removeStat(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer mb-1"><FiTrash2 size={14} /></button>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

// ─── Notice Board Editor ─────────────────────────────────────────────
function NoticeBoardEditor({ data, setData }) {
    const d = data || {};
    const notices = d.notices || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setNotice = (idx, k, v) => { const n = [...notices]; n[idx] = { ...n[idx], [k]: v }; set("notices", n); };
    const addNotice = () => set("notices", [...notices, { en: "", bn: "" }]);
    const removeNotice = (idx) => set("notices", notices.filter((_, i) => i !== idx));
    const moveNotice = (idx, dir) => {
        const n = [...notices];
        const target = idx + dir;
        if (target < 0 || target >= n.length) return;
        [n[idx], n[target]] = [n[target], n[idx]];
        set("notices", n);
    };

    return (
        <>
            <SectionCard title="Visibility" desc="Toggle to show or hide the Notice Board on the client site">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-lg">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={d.isActive !== false} onChange={(e) => set("isActive", e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F3C53]"></div>
                    </label>
                    <span className="text-sm font-semibold text-gray-700">Show Notice Board</span>
                </div>
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div><h2 className="text-lg font-bold text-gray-900">Notices & Offers</h2><p className="text-xs text-gray-500">{notices.length} messages</p></div>
                    <button type="button" onClick={addNotice} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F3C53] bg-[#0F3C53]/10 rounded-lg hover:bg-[#0F3C53]/20 cursor-pointer"><FiPlus size={14} /> Add Notice</button>
                </div>
                <div className="space-y-4">
                    {notices.map((notice, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-gray-700">Notice #{idx + 1}</span>
                                <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => moveNotice(idx, -1)} className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><FiChevronUp size={14} /></button>
                                    <button type="button" onClick={() => moveNotice(idx, 1)} className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><FiChevronDown size={14} /></button>
                                    <button type="button" onClick={() => removeNotice(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer"><FiTrash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Message (English)" value={notice.en} onChange={(v) => setNotice(idx, "en", v)} textarea placeholder="Special offer: Free Dubai visa..." />
                                <Field label="Message (বাংলা)" value={notice.bn} onChange={(v) => setNotice(idx, "bn", v)} textarea placeholder="বিশেষ অফার: আমাদের প্রিমিয়াম দুবাই..." />
                            </div>
                        </div>
                    ))}
                    {notices.length === 0 && (
                        <p className="text-sm text-gray-400">No notices added yet. Click "Add Notice" to start.</p>
                    )}
                </div>
            </section>
        </>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function HomeContentPage() {
    const token = useSelector(selectToken);
    const [activeTab, setActiveTab] = useState("hero");
    const [allData, setAllData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content`);
            const json = await res.json();
            if (json.success && json.data) {
                const map = {};
                json.data.forEach((doc) => { map[doc.section] = doc.data; });
                setAllData(map);
            }
        } catch (err) { console.error("Fetch error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const updateData = (section, newData) => setAllData((prev) => ({ ...prev, [section]: newData }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content/${activeTab}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(allData[activeTab]),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            toast.success(`${TAB_LABELS[activeTab]} saved successfully!`);
        } catch (err) { toast.error(err.message || "Save failed"); }
        finally { setSaving(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design & Content</span><span>/</span>
                        <span className="text-gray-600 font-medium">Home Page</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Home Page Content</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage all homepage sections from here</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FiRefreshCw /> Refresh
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm">
                        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {saving ? "Saving..." : `Save ${TAB_LABELS[activeTab]}`}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {SECTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setActiveTab(s)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${activeTab === s ? "bg-[#0F3C53] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                    >
                        {TAB_LABELS[s]}
                    </button>
                ))}
            </div>

            {/* Editor */}
            {activeTab === "hero" && <HeroEditor data={allData.hero} setData={(d) => updateData("hero", d)} />}
            {activeTab === "noticeBoard" && <NoticeBoardEditor data={allData.noticeBoard} setData={(d) => updateData("noticeBoard", d)} />}
            {activeTab === "services" && <ServicesEditor data={allData.services} setData={(d) => updateData("services", d)} />}
            {activeTab === "about" && <AboutEditor data={allData.about} setData={(d) => updateData("about", d)} />}
            {activeTab === "whyChooseUs" && <WhyChooseEditor data={allData.whyChooseUs} setData={(d) => updateData("whyChooseUs", d)} />}

            {/* Bottom Save */}
            <div className="flex justify-end mt-6">
                <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg cursor-pointer">
                    {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                    {saving ? "Saving..." : `Save ${TAB_LABELS[activeTab]}`}
                </button>
            </div>
        </div>
    );
}
