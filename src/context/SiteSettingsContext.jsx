"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Default fallback so components never get undefined values during initial render
const DEFAULTS = {
    contactPhone: "XXXXXXX",
    contactPhoneAlt: "",
    contactEmail: "XXXXXXX",
    whatsappNumber: "XXXXXXX",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    address: "XXXXXXX",
    addressBn: "XXXXXXX",

    // Working Hours
    workingDays: "Sat - Thu: Open",
    workingDaysBn: "শনি - বৃহঃ: খোলা",
    workingHours: "9:30 AM - 8:30 PM",
    workingHoursBn: "সকাল ৯:৩০ - রাত ৮:৩০",

    // Map
    mapEmbedUrl: "https://maps.google.com/maps?q=Bangladesh&t=&z=7&ie=UTF8&iwloc=&output=embed",
    mapLabel: "XXXXXXX",
    mapLabelBn: "XXXXXXX",

    // Stats
    countriesCount: "50+",
    happyClientsCount: "10K+",

    social: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        tiktok: "",
    },
};

const SiteSettingsContext = createContext({
    settings: DEFAULTS,
    loading: true,
    refetch: () => {},
});

export function SiteSettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings`);
            const data = await res.json();
            if (data.success && data.data) {
                setSettings({
                    ...DEFAULTS,
                    ...data.data,
                    social: { ...DEFAULTS.social, ...(data.data.social || {}) },
                });
            }
        } catch (err) {
            console.error("Failed to fetch site settings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext);
}

// Helpers
export function buildWhatsAppUrl(number, message = "") {
    const digits = (number || "").replace(/\D/g, "");
    const text = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${digits}${text}`;
}

export function buildTelUrl(phone) {
    return `tel:${(phone || "").replace(/[^\d+]/g, "")}`;
}

export function buildMailUrl(email) {
    return `mailto:${email || ""}`;
}
