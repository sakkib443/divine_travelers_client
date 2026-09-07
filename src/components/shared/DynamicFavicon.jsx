"use client";

// ===================================================================
// Divine Travelers - Dynamic Favicon Injector
// Reads faviconUrl from SiteSettingsContext and injects a <link> tag
// into the document head, overriding the static favicon from layout.js.
// Falls back to /favicon.png if no custom URL is set in DB.
// ===================================================================

import { useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function DynamicFavicon() {
    const { settings } = useSiteSettings();

    useEffect(() => {
        const url = settings?.faviconUrl || "/favicon.png";
        // Update all existing icon links
        const links = document.querySelectorAll("link[rel*='icon']");
        if (links.length > 0) {
            links.forEach((link) => {
                link.setAttribute("href", url);
            });
        } else {
            // Create a new one if none exist
            const link = document.createElement("link");
            link.rel = "icon";
            link.href = url;
            document.head.appendChild(link);
        }
    }, [settings?.faviconUrl]);

    return null;
}
