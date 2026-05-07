import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppLogo } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { blogPosts } from "@/lib/blogs";

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
    <main className="min-h-screen bg-[#E9ECE4] text-[#111827]">
      <nav className="fixed left-0 right-0 top-0 z-50 pt-3 backdrop-blur-2xl lg:pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-[35px] border border-black/10 bg-neutral-100/55 p-2 shadow-[0_18px_45px_rgba(20,20,20,0.08)] ring-1 ring-white/35 backdrop-blur-2xl lg:p-3">
            <Link href="/" aria-label="AxLiner home">
              <AppLogo />
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              <Link className="rounded-full px-4 py-2 text-sm font-semibold text-black hover:bg-white/50" href="/#features">
                Solutions
              </Link>
              <Link className="rounded-full px-4 py-2 text-sm font-semibold text-black hover:bg-white/50" href="/pricing">
                Pricing
              </Link>
              <Link className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-[#2f165e]" href="/blogs">
                Blogs
              </Link>
              <Link className="rounded-full px-4 py-2 text-sm font-semibold text-black hover:bg-white/50" href="/#benchmarks">
                Benchmarks
              </Link>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild className="rounded-full bg-[#2f165e] px-5 text-white hover:bg-[#24104b]">
                <Link href="/#converter">Try It</Link>
              </Button>
            </div>

            <MobileNav />
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6 lg:px-8 lg:pb-12 lg:pt-32">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2f165e]">
            AxLiner blog
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl lg:text-5xl">
            Clear writing about handwritten paper, OCR, and Excel workflows.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-black">
            Practical notes for teams turning paper tables, pen-written forms, scanned PDFs, receipts, and messy document photos into spreadsheets that are easy to review.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-[26px] border border-white/60 bg-white/35 shadow-[0_18px_55px_rgba(42,35,64,0.07)] backdrop-blur-xl"
            >
              <Link href={`/blogs/${post.slug}`} className="group block">
                <div className="relative aspect-[1.75] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                </div>
              </Link>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#2f165e]">
                  <span>{post.eyebrow}</span>
                  <span className="h-1 w-1 rounded-full bg-[#2f165e]/55" />
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold leading-snug tracking-normal sm:text-2xl">
                  <Link href={`/blogs/${post.slug}`} className="hover:text-[#2f165e]">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-6 text-black">
                  {post.description}
                </p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={post.authorImage}
                      alt={post.authorImageAlt}
                      width={34}
                      height={34}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-black">{post.authorName}</p>
                      <p className="text-xs text-black/70">{post.authorRole}</p>
                    </div>
                  </div>
                </div>
                <Button asChild className="mt-5 rounded-full bg-[#2f165e] px-5 text-white hover:bg-[#24104b]">
                  <Link href={`/blogs/${post.slug}`}>Read article</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
