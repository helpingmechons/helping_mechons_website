import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import MobileDonateBar from "@/components/layout/MobileDonateBar";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollProgress from "@/components/motion/ScrollProgress";

// Fonts are bundled in app/fonts (Latin subset, OFL licence) and served from
// our own domain, preloaded, with font-display: swap. No connection to Google
// at build time or at runtime, which matters on slow mobile networks.
//
// Anek (display) and Mukta (body) are both from Ek Type, an Indian foundry.
// Anek is variable in weight AND width; the hero animates its width axis.
// Anek has a Telugu sibling (Anek Telugu) if the site adds Telugu pages.
const anek = localFont({
  src: "./fonts/AnekLatin-Variable.woff2",
  weight: "100 800",
  display: "swap",
  variable: "--font-headline",
  declarations: [{ prop: "font-stretch", value: "75% 125%" }],
});
const mukta = localFont({
  src: [
    { path: "./fonts/Mukta-400.woff2", weight: "400" },
    { path: "./fonts/Mukta-500.woff2", weight: "500" },
    { path: "./fonts/Mukta-600.woff2", weight: "600" },
    { path: "./fonts/Mukta-700.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-body",
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

export const viewport = {
  themeColor: "#0f2b46",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anek.variable} ${mukta.variable}`}>
      <body className="bg-background text-on-surface font-body antialiased pb-16 md:pb-0">
        <a href="#main" className="skip-link">Skip to content</a>
        <SmoothScroll />
        <ScrollProgress />
        {children}
        <MobileDonateBar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0f2b46",
              color: "#ffffff",
              border: "1px solid #17395a",
              borderRadius: "10px",
            },
          }}
        />
      </body>
    </html>
  );
}
