import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Privacy Policy – Helping Mechons" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <section className="py-16 bg-primary text-on-primary">
          <div className="section-container">
            <h1 className="font-headline text-headline-xl-mobile text-on-primary mb-3">Privacy Policy</h1>
            <p className="text-on-primary-container text-body-md">Last updated: June 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container max-w-3xl mx-auto space-y-10 text-body-md text-on-surface-variant leading-relaxed">

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, make a donation, or contact us. This includes your name, email address, phone number, and payment details (processed securely via Razorpay).</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to process donations, send donation receipts, communicate updates about our work, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">3. Data Security</h2>
              <p>We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. Your payment data is handled exclusively by Razorpay and never stored on our servers.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">4. Cookies</h2>
              <p>We use essential cookies to maintain your login session and improve site performance. No tracking or advertising cookies are used.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">5. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. We will respond within 30 days.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">6. Third-Party Services</h2>
              <p>We use Supabase for authentication and database storage, and Razorpay for payment processing. These services have their own privacy policies which we encourage you to review.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">7. Updates to This Policy</h2>
              <p>We may update this Privacy Policy periodically. We will notify you of significant changes by email or by posting a notice on our site.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">8. Contact Us</h2>
              <p>For privacy-related queries, reach us at{" "}
                <a href="mailto:helpingmechons@gmail.com" className="text-secondary hover:underline">
                  helpingmechons@gmail.com
                </a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
