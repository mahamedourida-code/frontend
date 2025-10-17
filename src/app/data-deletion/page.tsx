import { AppIcon } from "@/components/AppIcon"
import Link from "next/link"
import { Trash2, AlertCircle, Clock, CheckCircle2 } from "lucide-react"

export default function DataDeletionPage() {
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
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Data Deletion Instructions</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Learn how to delete your data from Exceletto
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Quick Overview */}
          <div className="bg-muted/50 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Quick Overview
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-0">
              You have full control over your data. You can delete your account and all associated data 
              at any time through your account settings, or by contacting us directly.
            </p>
          </div>

          {/* What Data Can Be Deleted */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Data Can Be Deleted</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you request data deletion, the following information will be permanently removed:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li><strong>Account Information:</strong> Email, name, password, and profile data</li>
              <li><strong>Processing History:</strong> All records of images you've processed</li>
              <li><strong>Uploaded Images:</strong> Any images stored during processing (these are already deleted automatically after processing)</li>
              <li><strong>Generated Files:</strong> All Excel files you've created using our service</li>
              <li><strong>Usage Statistics:</strong> Credits usage and processing metrics</li>
              <li><strong>Authentication Data:</strong> All login sessions and tokens</li>
            </ul>
          </section>

          {/* Method 1: Self-Service Deletion */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Method 1: Self-Service Deletion (Recommended)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The fastest way to delete your data is through your account settings:
            </p>
            
            <div className="bg-muted/30 rounded-lg p-6 border space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-1">Log in to your account</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit <Link href="/sign-in" className="text-primary hover:underline">https://exceletto.vercel.app/sign-in</Link>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-1">Go to Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate to Dashboard → Settings (or visit <Link href="/dashboard/settings" className="text-primary hover:underline">/dashboard/settings</Link>)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-1">Delete your account</h3>
                  <p className="text-sm text-muted-foreground">
                    Scroll to the bottom of the Account Settings section and click "Delete Account"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-medium mb-1">Confirm deletion</h3>
                  <p className="text-sm text-muted-foreground">
                    Confirm your decision. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>Instant Deletion:</strong> Your data will be deleted immediately upon confirmation.
              </p>
            </div>
          </section>

          {/* Method 2: Email Request */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Method 2: Email Request</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you cannot access your account or prefer to contact us directly:
            </p>

            <div className="bg-muted/30 rounded-lg p-6 border">
              <h3 className="font-medium mb-3">Send an email to:</h3>
              <div className="bg-background rounded p-4 border mb-4">
                <p className="font-mono text-sm">privacy@exceletto.com</p>
              </div>

              <h3 className="font-medium mb-2">Include in your email:</h3>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 text-sm">
                <li>Subject line: "Data Deletion Request"</li>
                <li>Your registered email address</li>
                <li>Your full name (as registered)</li>
                <li>Brief reason for deletion (optional)</li>
              </ul>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Response Time:</strong> We will process your request within 7 business days and confirm via email.
                </p>
              </div>
            </div>
          </section>

          {/* What Happens After Deletion */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Happens After Deletion</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium mb-2">Immediate Effects</h3>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>You will be logged out immediately</li>
                  <li>You will no longer be able to access your account</li>
                  <li>Your email address will be freed up for future registration</li>
                  <li>All active sessions will be terminated</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-medium mb-2">Within 24 Hours</h3>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>All your files will be permanently deleted from our storage</li>
                  <li>Your processing history will be removed from our database</li>
                  <li>Your personal information will be erased from our systems</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-medium mb-2">Within 30 Days</h3>
                <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                  <li>All backup copies will be permanently deleted</li>
                  <li>Your data will be completely removed from all our systems</li>
                  <li>No recovery will be possible after this point</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Retention Exceptions */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Retention Exceptions</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In some cases, we may retain certain information as required by law:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>
                <strong>Legal Obligations:</strong> Information required for tax, accounting, or legal compliance 
                (typically anonymized transaction records)
              </li>
              <li>
                <strong>Security Logs:</strong> Anonymized security and fraud prevention logs may be retained 
                for up to 90 days
              </li>
              <li>
                <strong>Aggregated Analytics:</strong> Anonymized usage statistics that cannot identify you 
                (e.g., "number of images processed per month")
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3 italic">
              Note: None of this retained data can be used to identify you personally.
            </p>
          </section>

          {/* Facebook Data */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Shared via Facebook</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you used Facebook to share files generated by Exceletto, please note:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2 mt-3">
              <li>
                <strong>Shared Links:</strong> Links you shared via Facebook Messenger will remain in your 
                Facebook message history. You'll need to delete those messages directly in Facebook.
              </li>
              <li>
                <strong>Facebook Data:</strong> We do not store your Facebook account information. 
                We only use Facebook's sharing functionality.
              </li>
              <li>
                <strong>Download Links:</strong> Shared download links will become inactive after your 
                account deletion and files will no longer be accessible.
              </li>
            </ul>
          </section>

          {/* Reactivation */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Can I Reactivate My Account?</h2>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-5">
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">No, account deletion is permanent and irreversible.</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Once your account is deleted, all your data is permanently erased and cannot be recovered. 
                If you wish to use Exceletto again in the future, you will need to create a new account 
                with a fresh start.
              </p>
            </div>
          </section>

          {/* Need Help */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about data deletion or need assistance:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 border">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Support</p>
                  <p className="font-mono text-sm">privacy@exceletto.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">General Support</p>
                  <p className="font-mono text-sm">support@exceletto.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-sm">We typically respond within 24-48 hours</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Related Links */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="font-semibold mb-4">Related Resources</h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/privacy-policy" 
              className="inline-flex items-center text-primary hover:underline"
            >
              Privacy Policy →
            </Link>
            <Link 
              href="/terms-of-service" 
              className="inline-flex items-center text-primary hover:underline"
            >
              Terms of Service →
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="inline-flex items-center text-primary hover:underline"
            >
              Account Settings →
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
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
              <Link href="/data-deletion" className="hover:text-foreground transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
