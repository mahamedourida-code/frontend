import { AppIcon } from "@/components/AppIcon"
import Link from "next/link"

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Exceletto ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Exceletto is an AI-powered OCR (Optical Character Recognition) service that converts images of tables 
              and documents into editable Excel (XLSX) files. The Service uses machine learning models to extract 
              and structure data from your uploaded images.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">3.1 Account Creation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To use the Service, you must create an account by providing accurate and complete information. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">3.2 Account Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for all activities that occur under your account. You must notify us immediately 
                  of any unauthorized use of your account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">3.3 Age Requirement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 13 years old to use the Service. Users under 18 must have parental consent.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Credits and Usage</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">4.1 Credit System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Service operates on a credit-based system. Each user receives 80 credits per month. 
                  Processing one image costs 1 credit. Credits reset monthly and do not roll over.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">4.2 Fair Use</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to use the Service in accordance with fair use principles. Excessive or abusive usage 
                  may result in account suspension.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree NOT to use the Service to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Violate any intellectual property rights</li>
              <li>Process images containing personal information of others without consent</li>
              <li>Attempt to reverse engineer or exploit the Service</li>
              <li>Use the Service for automated or bulk processing without permission</li>
              <li>Share your account credentials with others</li>
              <li>Circumvent usage limits or restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">6.1 Your Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You retain all rights to the images and documents you upload. By using the Service, you grant us 
                  a limited license to process your content for the purpose of providing the Service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">6.2 Our Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Service, including its code, design, algorithms, and branding, is owned by Exceletto and 
                  protected by intellectual property laws. You may not copy, modify, or distribute our content 
                  without permission.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">6.3 Generated Files</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Excel files generated by the Service are yours to use. However, you are responsible for 
                  ensuring the accuracy of the extracted data before use.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We strive to provide reliable service, but we do not guarantee:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Uninterrupted access to the Service</li>
              <li>100% accuracy in OCR results</li>
              <li>Compatibility with all image formats or quality levels</li>
              <li>Permanent storage of your files (files are deleted after 30 days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
              WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR THAT OCR RESULTS WILL BE ACCURATE. 
              YOU USE THE SERVICE AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EXCELETTO SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA OR REVENUE, 
              ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. We process your data in accordance 
              with applicable data protection laws. Please review our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">11.1 By You</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may delete your account at any time through the settings page. Upon deletion, your data will 
                  be permanently removed within 30 days.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">11.2 By Us</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account if you violate these Terms or engage 
                  in abusive behavior. We will notify you via email before termination when possible.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of significant changes 
              via email or through the Service. Your continued use of the Service after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> legal@exceletto.com<br />
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain 
              in full force and effect.
            </p>
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
