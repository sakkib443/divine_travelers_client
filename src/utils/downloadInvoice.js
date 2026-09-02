// Reusable helper to download a booking's PDF invoice.
// Backend contract: GET /api/bookings/:id/invoice -> PDF blob (attachment).
// Auth via Authorization: Bearer <token>. Allowed for admin or the booking owner.

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch a booking invoice PDF and trigger a browser download.
 * Throws on any failure so callers can surface a toast.
 *
 * @param {string} bookingId  Booking _id
 * @param {string} token      Bearer token (admin or owner)
 * @param {string} [trackingId] Optional tracking id used in the filename
 */
export async function downloadInvoice(bookingId, token, trackingId) {
    if (!token) throw new Error("You must be signed in to download the invoice.");

    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        // Backend sends a JSON error body on failure — read the message if we can.
        let message = `Failed to download invoice (${res.status})`;
        try {
            const data = await res.json();
            if (data?.message) message = data.message;
        } catch {
            /* non-JSON error body — keep the default message */
        }
        throw new Error(message);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${trackingId || bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export default downloadInvoice;
