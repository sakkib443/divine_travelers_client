// ===================================================================
// Divine Travelers - Shared Logo (Dynamic)
// logoUrl is managed from Admin Dashboard → Design & Content → Branding
// Falls back to /images/logo.png if no custom URL is set in DB.
// ===================================================================

"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Logo({
    className = "h-12 w-auto",
    dark = false,
    badgeClassName = "",
    alt = "Divine Travelers",
}) {
    const { settings } = useSiteSettings();
    const src = settings?.logoUrl || "/images/logo.png";

    return (
        <img
            src={src}
            alt={alt}
            className={`object-contain ${className}`}
        />
    );
}
