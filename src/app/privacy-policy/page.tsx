import { AppIcon } from "@/components/AppIcon"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <AppIcon size={40} />
            <span className="text-xl font-bold">Exceletto</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Exceletto. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              OCR (Optical Character Recognition) service to convert images of tables into Excel files.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">2.1 Account Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
                  <li>Email address</li>
                  <li>Full name</li>
                  <li>Password (encrypted)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">2.2 Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information about how you use our service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
                  <li>Images uploaded for processing</li>
                  <li>Processing history and statistics</li>
                  <li>Credits usage</li>
                  <li>Device and browser information</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Provide and maintain our OCR service</li>
              <li>Process your images and generate Excel files</li>
              <li>Manage your account and subscription</li>
              <li>Send you service-related notifications</li>
              <li>Improve our service and develop new features</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We take data security seriously:
              </p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
                <li>Your data is stored securely using Supabase (PostgreSQL database)</li>
                <li>Images and files are stored in encrypted cloud storage</li>
                <li>We use industry-standard encryption for data transmission (HTTPS/TLS)</li>
                <li>Passwords are hashed and never stored in plain text</li>
                <li>Processed files are automatically deleted after 30 days</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data as follows:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2 mt-3">
              <li><strong>Account data:</strong> Until you delete your account</li>
              <li><strong>Uploaded images:</strong> Deleted immediately after processing</li>
              <li><strong>Generated Excel files:</strong> Stored for 30 days, then automatically deleted</li>
              <li><strong>Processing history:</strong> Retained for analytics purposes (anonymized after 90 days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Sharing Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share your data only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li><strong>Service Providers:</strong> We use third-party services (Supabase for database, Fly.io for hosting, DeepInfra for OCR processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you explicitly share files using our sharing features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Delete your account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and authenticate your account. 
              We do not use tracking or advertising cookies. You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for users under 13 years of age. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy or how we handle your data, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> privacy@exceletto.com<br />
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Exceletto. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
