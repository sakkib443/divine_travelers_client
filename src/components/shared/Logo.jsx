// ===================================================================
// Divine Travelers - Shared Logo
// ===================================================================

export default function Logo({
    className = "h-12 w-auto",
    dark = false,
    badgeClassName = "",
    alt = "Divine Travelers",
}) {
    return (
        <img
            src="/images/logo.png"
            alt={alt}
            className={`object-contain ${className}`}
        />
    );
}
