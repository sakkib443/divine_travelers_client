import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Rubik, Teko, Syne, Hind_Siliguri, Josefin_Sans } from "next/font/google";

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

export const metadata = {
  title: {
    template: "%s | Divine Travelers",
    default: "Divine Travelers | Journey Beyond Borders",
  },
  description:
    "Divine Travelers - Your trusted partner for flight booking, Hajj & Umrah packages, and tour planning.",
  keywords: [
    "flight booking",
    "hajj umrah",
    "tour packages",
    "Bangladesh travel",
    "Divine Travelers",
  ],
  authors: [{ name: "Divine Travelers" }],
  creator: "Divine Travelers",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Divine Travelers",
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
    <html lang="en" className={`${rubik.variable} ${teko.variable} ${syne.variable} ${hindSiliguri.variable} ${josefinSans.variable}`} suppressHydrationWarning>
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
