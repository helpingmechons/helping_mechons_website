import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import MobileDonateBar from "@/components/layout/MobileDonateBar";

// Fonts are self-hosted by next/font: downloaded at build time, served from
// our own domain, preloaded, with font-display: swap. That avoids two extra
// connections to Google (and a render-blocking stylesheet) on every visit,
// which matters a lot on slow mobile networks.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-body" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style:   ["normal", "italic"],
  axes:    ["opsz"],
  display: "swap",
  variable: "--font-headline",
});

export const metadata = {
  title: { default: "Helping Mechons", template: "%s | Helping Mechons" },
  description:
    "Helping Mechons is a Visakhapatnam-based NGO providing medical assistance, food distribution, grocery support, education, and orphanage care to vulnerable communities across India.",
  keywords: [
    "NGO", "charity", "donation", "Visakhapatnam", "Vizag",
    "India", "humanitarian", "food distribution", "medical aid",
  ],
  openGraph: {
    title: "Helping Mechons — Healing Lives, One Mission at a Time",
    description:
      "Join us in supporting medical aid, food security, education, and orphanage care across India.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://helping-mechons.vercel.app",
    siteName: "Helping Mechons",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon:     [{ url: "/icon.png", type: "image/png" }, { url: "/favicon.ico" }],
    apple:    [{ url: "/apple-icon.png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="bg-background text-on-surface font-body antialiased pb-16 md:pb-0">
        {children}
        <MobileDonateBar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#041627",
              color: "#ffffff",
              border: "1px solid #1a2b3c",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
