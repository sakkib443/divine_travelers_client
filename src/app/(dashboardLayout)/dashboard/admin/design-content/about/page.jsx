"use client";

// ===================================================================
// Admin → Website Content → About Page
// Every section of /about is edited here and saved to the database.
// Each tab maps 1:1 to a section document in `homecontents`.
// ===================================================================

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSave, FiLoader, FiRefreshCw, FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiExternalLink,
} from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SECTIONS = ["about", "aboutFounder", "aboutTeam", "aboutWhy", "aboutCta"];
const TAB_LABELS = {
    about: "1. Story",
    aboutFounder: "2. Founder",
    aboutTeam: "3. Team",
    aboutWhy: "4. Why Choose Us",
    aboutCta: "5. Call to Action",
};

// ─── Reusable field components (same look as the Home Page editor) ───
function Field({ label, value, onChange, placeholder, wide, textarea, help, rows }) {
    const Tag = textarea ? "textarea" : "input";
    return (
        <div className={wide ? "md:col-span-2" : ""}>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
            <Tag
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={textarea ? rows || 3 : undefined}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-transparent text-gray-800 placeholder-gray-400 resize-none"
            />
            {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
        </div>
    );
}

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

function BilingualField({ label, data, onChange, placeholder, textarea, rows }) {
    const d = data || { en: "", bn: "" };
    return (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`${label} (English)`} value={d.en} onChange={(v) => onChange({ ...d, en: v })} placeholder={placeholder} textarea={textarea} rows={rows} />
            <Field label={`${label} (বাংলা)`} value={d.bn} onChange={(v) => onChange({ ...d, bn: v })} placeholder={placeholder} textarea={textarea} rows={rows} />
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

// Show / hide the whole section on the public page.
function VisibilityToggle({ value, onChange }) {
    const visible = value !== false;
    return (
        <section className="bg-white rounded-xl border border-gray-100 p-5 mb-5 flex items-center justify-between gap-4">
            <div>
                <p className="font-bold text-gray-900">Show this section on the website</p>
                <p className="text-xs text-gray-500 mt-0.5">
                    Turn off to hide the whole section from /about without deleting its content.
                </p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!visible)}
                className={`w-14 h-8 rounded-full transition-all flex items-center p-1 shrink-0 ${visible ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"}`}
                aria-pressed={visible}
            >
                <span className="w-6 h-6 rounded-full bg-white shadow" />
            </button>
        </section>
    );
}

// Repeatable-row shell: header with move up/down + delete.
function RowCard({ title, index, total, onUp, onDown, onRemove, children }) {
    return (
        <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700">{title}</span>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={onUp} disabled={index === 0}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 cursor-pointer" title="Move up">
                        <FiChevronUp size={14} />
                    </button>
                    <button type="button" onClick={onDown} disabled={index === total - 1}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30 cursor-pointer" title="Move down">
                        <FiChevronDown size={14} />
                    </button>
                    <button type="button" onClick={onRemove}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 cursor-pointer" title="Remove">
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
        </div>
    );
}

// Move an item within an array (returns a new array).
const move = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};

// ─── 1. Story (shared with the Home page) ────────────────────────────
function StoryEditor({ data, setData }) {
    const d = data || {};
    const features = d.features || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setFeature = (idx, k, v) => { const f = [...features]; f[idx] = { ...f[idx], [k]: v }; set("features", f); };

    return (
        <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <p className="text-[13px] text-amber-800">
                    <strong>Note:</strong> this block also appears on the Home page, so editing it changes both pages.
                </p>
            </div>

            <VisibilityToggle value={d.isActive} onChange={(v) => set("isActive", v)} />

            <SectionCard title="Heading & Text" desc="Main text shown on the right side">
                <BilingualField label="Main Heading" data={d.heading} onChange={(v) => set("heading", v)} />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>

            <SectionCard title="Images" desc="The two overlapping images on the left side">
                <ImageField label="Main Image (Bottom)" value={d.image1} onChange={(v) => set("image1", v)} help="Portrait or large landscape" />
                <ImageField label="Square Image (Top Left)" value={d.image2} onChange={(v) => set("image2", v)} help="Square format (e.g. 600x600)" />
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Highlights</h2>
                    <p className="text-xs text-gray-500">The two highlights under the description (e.g. 2018, 50+)</p>
                </div>
                <div className="space-y-4">
                    {features.map((feature, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-4">
                            <span className="text-sm font-bold text-gray-700 block mb-3">Highlight #{idx + 1}</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Large Value" value={feature.value} onChange={(v) => setFeature(idx, "value", v)} placeholder="e.g. 2018 or 50+" />
                                <Field label="Icon Name" value={feature.icon} onChange={(v) => setFeature(idx, "icon", v)} placeholder="LuGlobe" help="Any Lucide icon name, e.g. LuGlobe, LuMap" />
                                <BilingualField label="Title" data={feature.title} onChange={(v) => setFeature(idx, "title", v)} />
                                <BilingualField label="Subtitle" data={feature.subtitle} onChange={(v) => setFeature(idx, "subtitle", v)} textarea />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

// ─── 2. Founder message ──────────────────────────────────────────────
function FounderEditor({ data, setData }) {
    const d = data || {};
    const set = (k, v) => setData({ ...d, [k]: v });

    return (
        <>
            <VisibilityToggle value={d.isActive} onChange={(v) => set("isActive", v)} />

            <SectionCard title="Section Heading" desc="The small label and title above the card">
                <BilingualField label="Eyebrow (small label)" data={d.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Leadership" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="Message from our Founder" />
            </SectionCard>

            <SectionCard title="Founder Details" desc="Photo, name and designation shown beside the message">
                <ImageField label="Photo" value={d.photo} onChange={(v) => set("photo", v)} help="Portrait photo, around 800x1000" wide />
                <BilingualField label="Name" data={d.name} onChange={(v) => set("name", v)} placeholder="Md. Abdul Karim" />
                <BilingualField label="Designation" data={d.title} onChange={(v) => set("title", v)} placeholder="Founder & Managing Director" />
            </SectionCard>

            <SectionCard title="Message" desc="The quote shown beside the photo">
                <BilingualField label="Message" data={d.message} onChange={(v) => set("message", v)} textarea rows={6} />
            </SectionCard>
        </>
    );
}

// ─── 3. Team ─────────────────────────────────────────────────────────
function TeamEditor({ data, setData }) {
    const d = data || {};
    const members = d.members || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setMember = (idx, k, v) => { const m = [...members]; m[idx] = { ...m[idx], [k]: v }; set("members", m); };
    const addMember = () => set("members", [...members, { name: { en: "", bn: "" }, role: { en: "", bn: "" }, photo: "", order: members.length + 1 }]);

    return (
        <>
            <VisibilityToggle value={d.isActive} onChange={(v) => set("isActive", v)} />

            <SectionCard title="Section Heading" desc="Shown above the team grid">
                <BilingualField label="Eyebrow (small label)" data={d.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Our Team" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
                        <p className="text-xs text-gray-500">{members.length} member{members.length === 1 ? "" : "s"} · shown in this order</p>
                    </div>
                    <button type="button" onClick={addMember}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F3C53] bg-[#0F3C53]/10 rounded-lg hover:bg-[#0F3C53]/20 cursor-pointer">
                        <FiPlus size={14} /> Add Member
                    </button>
                </div>
                <div className="space-y-4">
                    {members.map((m, idx) => (
                        <RowCard
                            key={idx}
                            title={`#${idx + 1} — ${m.name?.en || "New member"}`}
                            index={idx}
                            total={members.length}
                            onUp={() => set("members", move(members, idx, idx - 1))}
                            onDown={() => set("members", move(members, idx, idx + 1))}
                            onRemove={() => set("members", members.filter((_, i) => i !== idx))}
                        >
                            <ImageField label="Photo" value={m.photo} onChange={(v) => setMember(idx, "photo", v)} help="Square or portrait, around 600x600" wide />
                            <BilingualField label="Name" data={m.name} onChange={(v) => setMember(idx, "name", v)} />
                            <BilingualField label="Role" data={m.role} onChange={(v) => setMember(idx, "role", v)} />
                        </RowCard>
                    ))}
                    {members.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                            No team members yet — click “Add Member”.
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}

// ─── 4. Why choose us ────────────────────────────────────────────────
function WhyEditor({ data, setData }) {
    const d = data || {};
    const cards = d.cards || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setCard = (idx, k, v) => { const c = [...cards]; c[idx] = { ...c[idx], [k]: v }; set("cards", c); };
    const addCard = () => set("cards", [...cards, { icon: "LuTarget", title: { en: "", bn: "" }, description: { en: "", bn: "" }, order: cards.length + 1 }]);

    return (
        <>
            <VisibilityToggle value={d.isActive} onChange={(v) => set("isActive", v)} />

            <SectionCard title="Section Heading" desc="Shown above the value cards">
                <BilingualField label="Eyebrow (small label)" data={d.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Why Choose Us" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Value Cards</h2>
                        <p className="text-xs text-gray-500">{cards.length} card{cards.length === 1 ? "" : "s"} · four fit one row on desktop</p>
                    </div>
                    <button type="button" onClick={addCard}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F3C53] bg-[#0F3C53]/10 rounded-lg hover:bg-[#0F3C53]/20 cursor-pointer">
                        <FiPlus size={14} /> Add Card
                    </button>
                </div>
                <div className="space-y-4">
                    {cards.map((c, idx) => (
                        <RowCard
                            key={idx}
                            title={`#${idx + 1} — ${c.title?.en || "New card"}`}
                            index={idx}
                            total={cards.length}
                            onUp={() => set("cards", move(cards, idx, idx - 1))}
                            onDown={() => set("cards", move(cards, idx, idx + 1))}
                            onRemove={() => set("cards", cards.filter((_, i) => i !== idx))}
                        >
                            <Field label="Icon Name" value={c.icon} onChange={(v) => setCard(idx, "icon", v)} placeholder="LuTarget"
                                help="Any Lucide icon name — e.g. LuTarget, LuZap, LuShieldCheck, LuHeart" wide />
                            <BilingualField label="Title" data={c.title} onChange={(v) => setCard(idx, "title", v)} />
                            <BilingualField label="Description" data={c.description} onChange={(v) => setCard(idx, "description", v)} textarea />
                        </RowCard>
                    ))}
                    {cards.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                            No cards yet — click “Add Card”.
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}

// ─── 5. Call to action ───────────────────────────────────────────────
function CtaEditor({ data, setData }) {
    const d = data || {};
    const set = (k, v) => setData({ ...d, [k]: v });

    return (
        <>
            <VisibilityToggle value={d.isActive} onChange={(v) => set("isActive", v)} />

            <SectionCard title="Text" desc="The closing band at the bottom of the page">
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>

            <SectionCard title="Buttons" desc="Leave a button's text empty to hide that button">
                <BilingualField label="Button 1 Text" data={d.button1Text} onChange={(v) => set("button1Text", v)} placeholder="Contact Us" />
                <Field label="Button 1 Link" value={d.button1Link} onChange={(v) => set("button1Link", v)} placeholder="/contact" wide />
                <BilingualField label="Button 2 Text" data={d.button2Text} onChange={(v) => set("button2Text", v)} placeholder="Explore Tours" />
                <Field label="Button 2 Link" value={d.button2Link} onChange={(v) => set("button2Link", v)} placeholder="/tour" wide />
            </SectionCard>
        </>
    );
}

// ─── Main page ───────────────────────────────────────────────────────
export default function AboutContentPage() {
    const token = useSelector(selectToken);
    const [activeTab, setActiveTab] = useState("about");
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
        } catch (err) {
            toast.error("Could not load content");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const updateData = (section, newData) => setAllData((prev) => ({ ...prev, [section]: newData }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content/${activeTab}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(allData[activeTab] || {}),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            toast.success(`${TAB_LABELS[activeTab]} saved — the website is updated.`);
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
        );
    }

    const SaveButton = ({ big }) => (
        <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 ${big ? "px-6 py-3" : "px-5 py-2 text-sm"} bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer`}
        >
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            {saving ? "Saving..." : `Save ${TAB_LABELS[activeTab]}`}
        </button>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design & Content</span><span>/</span>
                        <span className="text-gray-600 font-medium">About Page</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">About Page Content</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Every section of the About page — edit, reorder or hide each one.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/about" target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FiExternalLink /> View page
                    </a>
                    <button type="button" onClick={fetchAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FiRefreshCw /> Refresh
                    </button>
                    <SaveButton />
                </div>
            </div>

            {/* Tabs — one per section, in page order */}
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
            {activeTab === "about" && <StoryEditor data={allData.about} setData={(d) => updateData("about", d)} />}
            {activeTab === "aboutFounder" && <FounderEditor data={allData.aboutFounder} setData={(d) => updateData("aboutFounder", d)} />}
            {activeTab === "aboutTeam" && <TeamEditor data={allData.aboutTeam} setData={(d) => updateData("aboutTeam", d)} />}
            {activeTab === "aboutWhy" && <WhyEditor data={allData.aboutWhy} setData={(d) => updateData("aboutWhy", d)} />}
            {activeTab === "aboutCta" && <CtaEditor data={allData.aboutCta} setData={(d) => updateData("aboutCta", d)} />}

            {/* Bottom save */}
            <div className="flex justify-end mt-6">
                <SaveButton big />
            </div>
        </div>
    );
}
