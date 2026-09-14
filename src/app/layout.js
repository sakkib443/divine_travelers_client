import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Rubik, Teko, Syne, Hind_Siliguri, Josefin_Sans, Poppins, Bungee_Hairline } from "next/font/google";

const rubik = Rubik({ 
  subsets: ["latin"], 
  variable: "--next-font-rubik" 
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--next-font-teko"
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--next-font-syne"
});

const hindSiliguri = Hind_Siliguri({ 
  subsets: ["bengali"], 
  weight: ["300", "400", "500", "600", "700"], 
  variable: "--next-font-hind" 
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--next-font-josefin"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--next-font-poppins"
});

const bungee = Bungee_Hairline({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--next-font-bungee"
});

export const metadata = {
  title: {
    template: "%s | Divine Travellers",
    default: "Divine Travellers | Journey Beyond Borders",
  },
  description:
    "Divine Travellers - Your trusted partner for flight booking, Hajj & Umrah packages, and tour planning.",
  keywords: [
    "flight booking",
    "hajj umrah",
    "tour packages",
    "Bangladesh travel",
    "Divine Travellers",
  ],
  authors: [{ name: "Divine Travellers" }],
  creator: "Divine Travellers",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Divine Travellers",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rubik.variable} ${teko.variable} ${syne.variable} ${hindSiliguri.variable} ${josefinSans.variable} ${poppins.variable} ${bungee.variable}`} suppressHydrationWarning>
      <head>
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
