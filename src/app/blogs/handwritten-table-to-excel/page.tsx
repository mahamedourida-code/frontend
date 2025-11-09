import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ParticlesBackground from "@/components/ParticlesBackground";
import { AppLogo } from "@/components/AppIcon";

export const metadata = {
  title: "Converting Handwritten Tables to Excel: Complete Guide | AxLiner",
  description: "Learn how to digitize handwritten tables and forms into Excel spreadsheets with high accuracy using advanced OCR technology.",
};

export default function HandwrittenTableToExcelPost() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <ParticlesBackground />
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: 'url(/duplo30.jpg)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 pt-3 lg:pt-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[35px] border-2 border-[#2BAAD8] shadow-lg shadow-[#2BAAD8]/10 backdrop-blur-md p-2 lg:p-3 flex items-center justify-between" style={{ backgroundColor: '#fbfdfc' }}>
              <div className="flex-shrink-0">
                <AppLogo />
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/blogs">
                    ← Back to Blogs
                  </Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/dashboard">Try Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary">Tutorial</Badge>
                <Badge variant="outline">Handwriting Recognition</Badge>
                <Badge variant="outline">OCR</Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Converting Handwritten Tables to Excel: Complete Guide
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>November 9, 2025</span>
                <span>•</span>
                <span>6 min read</span>
              </div>
            </div>

            {/* Article Body */}
            <div className="space-y-8">
              {/* Introduction */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <p className="text-lg leading-relaxed">
                    Handwritten tables are everywhere—field notes, meeting minutes, inventory sheets, patient records, and classroom assessments. Converting these handwritten documents to digital Excel files has traditionally been a tedious manual process. With AI-powered OCR, you can now automate this conversion with remarkable accuracy.
                  </p>
                </CardContent>
              </Card>

              {/* Challenges */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">
                    Challenges with Handwritten Data
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      Handwriting recognition is significantly more complex than printed text OCR due to:
                    </p>
                    <ul className="space-y-4 ml-6">
                      <li className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Varied writing styles:</strong> Every person writes differently with unique letter formations and spacing
                      </li>
                      <li className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Poor legibility:</strong> Rushed handwriting, corrections, and smudges create ambiguity
                      </li>
                      <li className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Complex table structures:</strong> Handdrawn tables often have irregular cells, merged rows, and unclear boundaries
                      </li>
                      <li className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Mixed content:</strong> Numbers, text, symbols, and abbreviations appear side by side
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* How AxLiner Solves This */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">
                    How AxLiner Handles Handwriting
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      AxLiner uses a 7B parameter Llama 3-based OCR model specifically fine-tuned on handwritten datasets. This enables:
                    </p>
                    <div className="space-y-6 mt-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">High Accuracy (96.8%)</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Trained on thousands of handwritten samples to recognize diverse writing styles and characters.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Table Structure Detection</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Automatically identifies rows, columns, headers, and cell boundaries even in handdrawn tables.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Contextual Understanding</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Uses context to disambiguate similar-looking characters (like "0" vs "O", "1" vs "l").
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Multi-Language Support</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Works with handwritten text in 8+ languages including English, French, German, Arabic, and Chinese.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step-by-Step Guide */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">Step-by-Step: Handwritten Table to Excel</h2>
                  
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          1
                        </div>
                        <h3 className="text-2xl font-semibold">Capture the Handwritten Table</h3>
                      </div>
                      <p className="text-muted-foreground ml-13 mb-4">
                        Take a clear photo or scan of your handwritten table. Tips for best results:
                      </p>
                      <ul className="space-y-2 ml-13 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Use good lighting to avoid shadows</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Hold the camera directly above the document (not at an angle)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Ensure the entire table is visible and in focus</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Higher resolution images (at least 1080p) work better</span>
                        </li>
                      </ul>
                    </div>

                    {/* Step 2 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          2
                        </div>
                        <h3 className="text-2xl font-semibold">Upload to AxLiner Dashboard</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        Visit the <Link href="/dashboard" className="text-primary hover:underline">AxLiner Dashboard</Link> and upload your handwritten table images. Select the appropriate language if your table contains non-English text. You can process multiple tables simultaneously.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          3
                        </div>
                        <h3 className="text-2xl font-semibold">AI Processing & Recognition</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        The AI model analyzes the image, detects the table structure, recognizes handwritten characters, and extracts the data. Processing typically takes 20-40 seconds depending on table complexity.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                          4
                        </div>
                        <h3 className="text-2xl font-semibold">Review & Download Excel</h3>
                      </div>
                      <p className="text-muted-foreground ml-13">
                        Preview the extracted data to verify accuracy, then download your Excel file. The table structure is preserved with proper row and column alignment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Use Cases */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">Real-World Applications</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Healthcare Records</h3>
                      <p className="text-muted-foreground">
                        Digitize patient logs, medication charts, and clinical notes for electronic health records (EHR).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Field Research</h3>
                      <p className="text-muted-foreground">
                        Convert field notes, survey data, and observation tables to Excel for analysis.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Inventory Management</h3>
                      <p className="text-muted-foreground">
                        Transform handwritten stock counts and warehouse logs into digital inventory systems.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Education</h3>
                      <p className="text-muted-foreground">
                        Digitize grade books, attendance sheets, and student assessment forms.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Construction & Engineering</h3>
                      <p className="text-muted-foreground">
                        Convert site inspection forms and measurement logs to digital records.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Meeting Minutes</h3>
                      <p className="text-muted-foreground">
                        Turn handwritten action items and notes into shareable Excel spreadsheets.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-white dark:bg-card border border-border shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6">Tips for Better Recognition</h2>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold text-sm">1</span>
                      </div>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Write clearly:</strong> Use printed letters rather than cursive for higher accuracy
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold text-sm">2</span>
                      </div>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Define table boundaries:</strong> Draw clear lines for rows and columns
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold text-sm">3</span>
                      </div>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Avoid corrections:</strong> Cross-outs and overwrites can confuse the OCR
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold text-sm">4</span>
                      </div>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Use dark ink:</strong> Black or dark blue ink provides better contrast than light colors
                      </p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold mb-4">Ready to Digitize Your Handwritten Tables?</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Start converting handwritten documents to Excel in seconds with AxLiner
                  </p>
                  <Button asChild size="lg" variant="secondary" className="rounded-full">
                    <Link href="/dashboard">Try Free Now - No Credit Card Required</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
