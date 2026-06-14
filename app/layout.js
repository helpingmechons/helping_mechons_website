import "./globals.css";
import { Toaster } from "sonner";
import MobileDonateBar from "@/components/layout/MobileDonateBar";

export const metadata = {
  title: { default: "Helping Mechons", template: "%s | Helping Mechons" },
  description: "Helping Mechons is a Hyderabad-based NGO providing medical assistance, food distribution, grocery support, education, and orphanage care to vulnerable communities.",
  keywords: ["NGO", "charity", "donation", "Hyderabad", "India", "humanitarian", "food distribution", "medical aid"],
  openGraph: {
    title: "Helping Mechons — Healing Lives, One Mission at a Time",
    description: "Join us in supporting medical aid, food security, education, and orphanage care across India.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://helpingmechons.org",
    siteName: "Helping Mechons", locale: "en_IN", type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body antialiased pb-16 md:pb-0">
        {children}
        {/* Mobile sticky donate bar — hidden on md+ */}
        <MobileDonateBar />
        <Toaster position="top-right" toastOptions={{
          style: { background: "#041627", color: "#ffffff", border: "1px solid #1a2b3c", borderRadius: "8px" },
        }} />
      </body>
    </html>
  );
}
