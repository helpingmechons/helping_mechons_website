import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Terms of Use – Helping Mechons" };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <section className="py-16 bg-primary text-on-primary">
          <div className="section-container">
            <h1 className="font-headline text-headline-xl-mobile text-on-primary mb-3">Terms of Use</h1>
            <p className="text-on-primary-container text-body-md">Last updated: June 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container max-w-3xl mx-auto space-y-10 text-body-md text-on-surface-variant leading-relaxed">

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using the Helping Mechons website, you agree to be bound by these Terms of Use. If you do not agree, please do not use the site.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">2. Use of the Platform</h2>
              <p>Helping Mechons provides this platform to facilitate charitable donations and community engagement. You agree to use it only for lawful purposes and in a way that does not infringe the rights of others.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">3. Donations</h2>
              <p>All donations made through this platform are voluntary contributions to Helping Mechons. Donations are non-refundable unless there has been an error in processing. We will confirm receipt of your donation by email.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">4. Accuracy of Information</h2>
              <p>We strive to keep all information on this site accurate and up to date. However, we make no warranties about the completeness or accuracy of the content provided.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">5. Intellectual Property</h2>
              <p>All content on this site — including the Helping Mechons logo, photographs, and text — is the property of Helping Mechons and may not be reproduced without written permission.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">6. Limitation of Liability</h2>
              <p>Helping Mechons shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or its services.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">7. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the site after changes constitutes your acceptance of the revised terms.</p>
            </div>

            <div>
              <h2 className="font-headline text-headline-md text-primary mb-3">8. Contact</h2>
              <p>For any questions about these terms, please contact us at{" "}
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
