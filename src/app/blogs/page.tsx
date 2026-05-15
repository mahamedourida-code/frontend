import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppLogo } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { blogPosts } from "@/lib/blogs";

function dateParts(date: string) {
  const [month = "", rest = ""] = date.split(" ");
  const day = rest.replace(",", "");
  const year = date.split(", ")[1] || "";

  return {
    month: month.slice(0, 5).toUpperCase(),
    day,
    year,
  };
}

export const metadata: Metadata = {
  title: "AxLiner Blog | Handwritten Images, Paper Tables, and Excel OCR",
  description:
    "Practical articles about converting handwritten paper, scanned forms, notes, receipts, and table images into clean Excel spreadsheets.",
  alternates: {
    canonical: "https://www.axliner.com/blogs",
  },
  openGraph: {
    title: "AxLiner Blog",
    description:
      "Guides for handwritten OCR, paper-to-Excel workflows, batch conversion, and document processing.",
    url: "https://www.axliner.com/blogs",
    siteName: "AxLiner",
    type: "website",
  },
};

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="fixed left-0 right-0 top-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-md border border-border bg-background/82 p-2 shadow-sm backdrop-blur-2xl lg:p-3">
            <Link href="/" aria-label="AxLiner home">
              <AppLogo />
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              <Link className="rounded-md px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted" href="/#features">
                Solutions
              </Link>
              <Link className="rounded-md px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted" href="/pricing">
                Pricing
              </Link>
              <Link className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/blogs">
                Blogs
              </Link>
              <Link className="rounded-md px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted" href="/#benchmarks">
                Benchmarks
              </Link>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
                <Link href="/#converter">Try It</Link>
              </Button>
            </div>

            <MobileNav />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="border-b border-black/10 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            AxLiner Blog
          </p>
          <h1 className="mt-4 text-3xl font-light leading-tight tracking-normal sm:text-4xl">
            AxLiner Blogs - handwritten OCR, data entry, and document workflow notes.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-black">
            Practical notes for teams turning paper tables, pen-written forms, scanned PDFs, receipts, and messy document photos into spreadsheets that are easy to review.
          </p>
          <div className="mt-7 flex gap-7 overflow-x-auto border-t border-black/10 pt-4 text-sm font-semibold text-black">
            <span className="whitespace-nowrap text-primary">Latest</span>
            <span className="whitespace-nowrap">Handwritten OCR</span>
            <span className="whitespace-nowrap">Batch workflows</span>
            <span className="whitespace-nowrap">Excel output</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {blogPosts.map((post) => {
            const parts = dateParts(post.date);

            return (
              <article
                key={post.slug}
                className="grid gap-5 md:grid-cols-[76px_minmax(0,1fr)]"
              >
                <div className="flex h-[76px] w-[76px] flex-col items-center justify-center bg-primary text-primary-foreground shadow-[0_16px_36px_rgb(0 0 0 / 0.14)]">
                  <span className="text-[11px] font-bold uppercase leading-none">{parts.month}</span>
                  <span className="mt-1 text-3xl font-semibold leading-none">{parts.day}</span>
                  <span className="mt-1 text-[10px] font-bold leading-none">{parts.year}</span>
                </div>

                <div className="min-w-0">
                  <h2 className="text-2xl font-light leading-tight tracking-normal text-black sm:text-3xl">
                    <Link href={`/blogs/${post.slug}`} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </h2>

                  <div className="mt-5 border-t border-black/10 pt-6">
                    <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
                      <Link href={`/blogs/${post.slug}`} className="group relative h-[190px] w-full overflow-hidden bg-card lg:w-[330px]">
                        <Image
                          src={post.image}
                          alt={post.imageAlt}
                          fill
                          sizes="(min-width: 1024px) 330px, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </Link>

                      <div className="flex min-h-[190px] flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-sm text-black">
                            <Image
                              src={post.authorImage}
                              alt={post.authorImageAlt}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <span className="font-medium">{post.authorName}</span>
                            <span className="text-black/50">/</span>
                            <span>{post.readTime}</span>
                          </div>
                          <p className="mt-4 line-clamp-4 text-base leading-7 text-black/80">
                            {post.description}
                          </p>
                        </div>

                        <Link href={`/blogs/${post.slug}`} className="mt-4 text-base font-semibold text-primary underline-offset-4 hover:underline">
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
