// ===================================================================
// Divine Travelers — Flight inquiry shared data & helpers
// Used by the home-hero Flight tab, the /flight inquiry page and the
// admin Flight Inquiry queue so all three speak the same shapes.
// ===================================================================

// ── Airport lists ───────────────────────────────────────────────────
// Picker input shows "City (CODE)"; dropdown row shows the airport+country.
export const BD_AIRPORTS = [
    { code: "DAC", city: "Dhaka", airport: "Hazrat Shahjalal Intl", country: "Bangladesh", flag: "🇧🇩" },
    { code: "CGP", city: "Chattogram", airport: "Shah Amanat Intl", country: "Bangladesh", flag: "🇧🇩" },
    { code: "ZYL", city: "Sylhet", airport: "Osmani Intl", country: "Bangladesh", flag: "🇧🇩" },
    { code: "CXB", city: "Cox's Bazar", airport: "Cox's Bazar Airport", country: "Bangladesh", flag: "🇧🇩" },
    { code: "JSR", city: "Jashore", airport: "Jashore Airport", country: "Bangladesh", flag: "🇧🇩" },
    { code: "BZL", city: "Barishal", airport: "Barishal Airport", country: "Bangladesh", flag: "🇧🇩" },
    { code: "RJH", city: "Rajshahi", airport: "Shah Makhdum Airport", country: "Bangladesh", flag: "🇧🇩" },
    { code: "SPD", city: "Saidpur", airport: "Saidpur Airport", country: "Bangladesh", flag: "🇧🇩" },
];

export const INTL_AIRPORTS = [
    { code: "JED", city: "Jeddah", airport: "King Abdulaziz Intl", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "MED", city: "Madinah", airport: "Prince Mohammad Intl", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "RUH", city: "Riyadh", airport: "King Khalid Intl", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "DXB", city: "Dubai", airport: "Dubai Intl", country: "UAE", flag: "🇦🇪" },
    { code: "AUH", city: "Abu Dhabi", airport: "Zayed Intl", country: "UAE", flag: "🇦🇪" },
    { code: "SHJ", city: "Sharjah", airport: "Sharjah Intl", country: "UAE", flag: "🇦🇪" },
    { code: "DOH", city: "Doha", airport: "Hamad Intl", country: "Qatar", flag: "🇶🇦" },
    { code: "KWI", city: "Kuwait City", airport: "Kuwait Intl", country: "Kuwait", flag: "🇰🇼" },
    { code: "BAH", city: "Bahrain", airport: "Bahrain Intl", country: "Bahrain", flag: "🇧🇭" },
    { code: "MCT", city: "Muscat", airport: "Muscat Intl", country: "Oman", flag: "🇴🇲" },
    { code: "KUL", city: "Kuala Lumpur", airport: "KL Intl (KLIA)", country: "Malaysia", flag: "🇲🇾" },
    { code: "SIN", city: "Singapore", airport: "Changi Airport", country: "Singapore", flag: "🇸🇬" },
    { code: "BKK", city: "Bangkok", airport: "Suvarnabhumi Airport", country: "Thailand", flag: "🇹🇭" },
    { code: "IST", city: "Istanbul", airport: "Istanbul Airport", country: "Turkey", flag: "🇹🇷" },
    { code: "LHR", city: "London", airport: "Heathrow Airport", country: "United Kingdom", flag: "🇬🇧" },
    { code: "MAN", city: "Manchester", airport: "Manchester Airport", country: "United Kingdom", flag: "🇬🇧" },
    { code: "CDG", city: "Paris", airport: "Charles de Gaulle", country: "France", flag: "🇫🇷" },
    { code: "FRA", city: "Frankfurt", airport: "Frankfurt Airport", country: "Germany", flag: "🇩🇪" },
    { code: "FCO", city: "Rome", airport: "Fiumicino Airport", country: "Italy", flag: "🇮🇹" },
    { code: "JFK", city: "New York", airport: "John F. Kennedy Intl", country: "USA", flag: "🇺🇸" },
    { code: "LAX", city: "Los Angeles", airport: "Los Angeles Intl", country: "USA", flag: "🇺🇸" },
    { code: "YYZ", city: "Toronto", airport: "Pearson Intl", country: "Canada", flag: "🇨🇦" },
    { code: "SYD", city: "Sydney", airport: "Kingsford Smith", country: "Australia", flag: "🇦🇺" },
    { code: "DEL", city: "Delhi", airport: "Indira Gandhi Intl", country: "India", flag: "🇮🇳" },
    { code: "CCU", city: "Kolkata", airport: "Netaji Subhas Chandra Bose Intl", country: "India", flag: "🇮🇳" },
    { code: "BOM", city: "Mumbai", airport: "Chhatrapati Shivaji Intl", country: "India", flag: "🇮🇳" },
    { code: "MAA", city: "Chennai", airport: "Chennai Intl", country: "India", flag: "🇮🇳" },
    { code: "KTM", city: "Kathmandu", airport: "Tribhuvan Intl", country: "Nepal", flag: "🇳🇵" },
    { code: "CMB", city: "Colombo", airport: "Bandaranaike Intl", country: "Sri Lanka", flag: "🇱🇰" },
    { code: "MLE", city: "Male", airport: "Velana Intl", country: "Maldives", flag: "🇲🇻" },
    { code: "HKG", city: "Hong Kong", airport: "Hong Kong Intl", country: "Hong Kong", flag: "🇭🇰" },
    { code: "CAN", city: "Guangzhou", airport: "Baiyun Intl", country: "China", flag: "🇨🇳" },
    { code: "ICN", city: "Seoul", airport: "Incheon Intl", country: "South Korea", flag: "🇰🇷" },
    { code: "NRT", city: "Tokyo", airport: "Narita Intl", country: "Japan", flag: "🇯🇵" },
    { code: "CAI", city: "Cairo", airport: "Cairo Intl", country: "Egypt", flag: "🇪🇬" },
];

// From = Bangladesh first (plus intl for flexibility); To = international first.
export const FROM_AIRPORTS = [...BD_AIRPORTS, ...INTL_AIRPORTS];
export const TO_AIRPORTS = [...INTL_AIRPORTS, ...BD_AIRPORTS];

// "Dhaka (DAC)" — the canonical display/value format everywhere.
export const airportLabel = (a) => `${a.city} (${a.code})`;

// Match against city, airport, country and IATA code.
export const filterAirports = (list, q) => {
    const s = (q || "").trim().toLowerCase();
    if (!s) return list;
    return list.filter(
        (a) =>
            a.city.toLowerCase().includes(s) ||
            a.airport.toLowerCase().includes(s) ||
            a.country.toLowerCase().includes(s) ||
            a.code.toLowerCase().includes(s)
    );
};

// ── Cabin classes ───────────────────────────────────────────────────
export const CABIN_CLASSES = [
    { value: "economy", label: "Economy", labelBn: "ইকোনমি", short: "ECO" },
    { value: "premium", label: "Premium", labelBn: "প্রিমিয়াম", short: "PRE" },
    { value: "business", label: "Business", labelBn: "বিজনেস", short: "BUS" },
    { value: "first", label: "First", labelBn: "ফার্স্ট", short: "FST" },
];

export const cabinLabel = (v, isBn = false) => {
    const c = CABIN_CLASSES.find((x) => x.value === v);
    return c ? (isBn ? c.labelBn : c.label) : v;
};

export const TRIP_TYPES = [
    { value: "oneway", label: "One Way", labelBn: "ওয়ান ওয়ে" },
    { value: "round", label: "Round Way", labelBn: "রাউন্ড ওয়ে" },
    { value: "multi", label: "Multi City", labelBn: "মাল্টি সিটি" },
];

export const tripTypeLabel = (v, isBn = false) => {
    const t = TRIP_TYPES.find((x) => x.value === v);
    return t ? (isBn ? t.labelBn : t.label) : v;
};

// Default departure = today + 3 days (YYYY-MM-DD).
export const defaultDepartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
};

// ── URL params: hero → /flight ──────────────────────────────────────
export const composeFlightParams = (f) => {
    const params = new URLSearchParams();
    if (f.from) params.set("from", f.from);
    if (f.to) params.set("to", f.to);
    if (f.departDate) params.set("dep", f.departDate);
    if (f.tripType === "round" && f.returnDate) params.set("ret", f.returnDate);
    params.set("travelers", String(f.passengers || 1));
    params.set("class", f.cabin || "economy");
    params.set("type", f.tripType || "oneway");
    if (f.tripType === "multi") {
        (f.legs || []).forEach((leg, i) => {
            if (leg.from) params.set(`leg${i + 1}From`, leg.from);
            if (leg.to) params.set(`leg${i + 1}To`, leg.to);
            if (leg.date) params.set(`leg${i + 1}Date`, leg.date);
        });
    }
    return params;
};

// /flight: read every param back into form state (legN… decoded too).
export const parseFlightParams = (searchParams) => {
    const get = (k) => searchParams.get(k) || "";
    const legs = [];
    for (let i = 1; i <= 8; i++) {
        const from = get(`leg${i}From`);
        const to = get(`leg${i}To`);
        const date = get(`leg${i}Date`);
        if (from || to || date) legs.push({ from, to, date });
    }
    return {
        tripType: ["oneway", "round", "multi"].includes(get("type")) ? get("type") : "oneway",
        from: get("from"),
        to: get("to"),
        departDate: get("dep"),
        returnDate: get("ret"),
        passengers: get("travelers"),
        cabin: get("class"),
        legs,
    };
};

// ── Readable summary — request `message` AND the WhatsApp text ─────
export const buildFlightSummary = (f, note = "") => {
    const lines = [`Trip type: ${tripTypeLabel(f.tripType)}`];
    if (f.tripType === "multi") {
        const allLegs = [{ from: f.from, to: f.to, date: f.departDate }, ...(f.legs || [])];
        allLegs.forEach((leg, i) => {
            lines.push(`Leg ${i + 1}: ${leg.from || "—"} → ${leg.to || "—"} on ${leg.date || "—"}`);
        });
    } else {
        lines.push(`From: ${f.from}`);
        lines.push(`To: ${f.to}`);
        lines.push(`Departure: ${f.departDate}`);
        if (f.tripType === "round" && f.returnDate) lines.push(`Return: ${f.returnDate}`);
    }
    lines.push(`Passengers: ${f.passengers}`);
    lines.push(`Class: ${cabinLabel(f.cabin)}`);
    if (note && note.trim()) lines.push(`Note: ${note.trim()}`);
    return lines.join("\n");
};

// INQ-###### — stable pseudo-number derived from the Mongo _id.
export const inquiryNumber = (id) =>
    "INQ-" + parseInt(String(id).slice(-6), 16).toString().padStart(6, "0");
