import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ParticlesBackground from "@/components/ParticlesBackground";
import { AppLogo } from "@/components/AppIcon";

export const metadata = {
  title: "AxLiner Blog - OCR & Excel Conversion Guides",
  description: "Learn how to convert invoices, handwritten tables, and documents to Excel using AI-powered OCR technology.",
};

const blogPosts = [
  {
    slug: "convert-invoice-to-excel",
    title: "How to Convert Invoice Images to Excel Spreadsheets",
    description: "A comprehensive guide on extracting invoice data from images and converting them into structured Excel files using AI-powered OCR.",
    date: "November 9, 2025",
    readTime: "5 min read",
    category: "Tutorial",
    tags: ["Invoice", "OCR", "Excel", "Automation"]
  },
  {
    slug: "handwritten-table-to-excel",
    title: "Converting Handwritten Tables to Excel: Complete Guide",
    description: "Learn how to digitize handwritten tables and forms into Excel spreadsheets with high accuracy using advanced OCR technology.",
    date: "November 9, 2025",
    readTime: "6 min read",
    category: "Tutorial",
    tags: ["Handwritten", "Tables", "Excel", "OCR"]
  }
];

export default function BlogsPage() {
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
                  <Link href="/">Home</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              AxLiner Blog
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Guides, tutorials, and insights on converting documents to Excel using AI-powered OCR
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {blogPosts.map((post) => {
              return (
                <Card key={post.slug} className="bg-white dark:bg-card border border-border shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                  <CardHeader>
                    <div className="mb-3">
                      <Badge variant="secondary" className="mb-3">
                        {post.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                      <Link href={`/blogs/${post.slug}`}>
                        Read Article →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <Card className="bg-white dark:bg-card border border-border shadow-sm max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Convert Your Documents?</h2>
                <p className="text-muted-foreground mb-6">
                  Try AxLiner today and experience the power of AI-driven document conversion
                </p>
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/dashboard">Start Converting Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
