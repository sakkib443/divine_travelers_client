"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiSave, FiLoader, FiImage } from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import ImageInput from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BrandingPage() {
    const token = useSelector(selectToken);
    const { settings, refetch } = useSiteSettings();
    const [logoUrl, setLogoUrl] = useState("");
    const [faviconUrl, setFaviconUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (settings && !loaded) {
            setLogoUrl(settings.logoUrl || "");
            setFaviconUrl(settings.faviconUrl || "");
            setLoaded(true);
        }
    }, [settings, loaded]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ logoUrl, faviconUrl }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            toast.success("Branding saved! Logo and favicon updated.");
            await refetch();
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design &amp; Content</span>
                        <span>/</span>
                        <span className="text-gray-600 font-medium">Branding</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Logo &amp; Favicon</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Update the website logo and browser favicon. Changes apply instantly across the entire site.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm"
                >
                    {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="space-y-6">
                {/* Logo Section */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-[#0F3C53]/10 flex items-center justify-center flex-shrink-0">
                            <FiImage className="text-[#0F3C53] w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Website Logo</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Shown in the navbar, footer, and admin sidebar. Recommended: PNG with transparent background, min. 300px wide.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <ImageInput
                            label="Logo Image URL"
                            value={logoUrl}
                            onChange={setLogoUrl}
                            placeholder="https://... or /images/logo.png"
                            hint="Upload or paste a direct image URL"
                            labelClass="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
                            inputClass="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-transparent text-gray-800 placeholder-gray-400"
                        />
                        {/* Preview */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Live Preview</p>
                            <div className="h-[80px] border border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 px-4">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt="Logo Preview"
                                        className="max-h-[60px] max-w-full object-contain"
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">No logo URL set</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Favicon Section */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-[#E64266]/10 flex items-center justify-center flex-shrink-0">
                            <FiImage className="text-[#E64266] w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Browser Favicon</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                The small icon shown in browser tabs and bookmarks. Recommended: Square PNG or ICO, 32×32 or 64×64 px.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <ImageInput
                            label="Favicon Image URL"
                            value={faviconUrl}
                            onChange={setFaviconUrl}
                            placeholder="https://... or /favicon.png"
                            hint="Upload or paste a direct image URL"
                            labelClass="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
                            inputClass="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F3C53] focus:ring-2 focus:ring-[#0F3C53]/10 bg-transparent text-gray-800 placeholder-gray-400"
                        />
                        {/* Preview */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Live Preview</p>
                            <div className="h-[80px] border border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 gap-3">
                                {faviconUrl ? (
                                    <>
                                        <img
                                            src={faviconUrl}
                                            alt="Favicon Preview"
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />
                                        <img
                                            src={faviconUrl}
                                            alt="Favicon 16px"
                                            className="w-4 h-4 object-contain"
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />
                                        <span className="text-xs text-gray-400">32px / 16px</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-400">No favicon URL set</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Bottom Save */}
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0F3C53] hover:bg-[#1565c0] disabled:bg-gray-300 text-white font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
