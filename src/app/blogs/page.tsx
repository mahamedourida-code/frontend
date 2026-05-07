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

      <section className="mx-auto max-w-5xl px-4 pb-7 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="border-b border-black/10 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2f165e]">
            AxLiner Blog
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Handwritten OCR notes for real paper workflows.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black">
            Practical notes for teams turning paper tables, pen-written forms, scanned PDFs, receipts, and messy document photos into spreadsheets that are easy to review.
          </p>
          <div className="mt-7 flex gap-7 overflow-x-auto border-t border-black/10 pt-4 text-sm font-semibold text-black">
            <span className="whitespace-nowrap text-[#2f165e]">Latest</span>
            <span className="whitespace-nowrap">Handwritten OCR</span>
            <span className="whitespace-nowrap">Batch workflows</span>
            <span className="whitespace-nowrap">Excel output</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="divide-y divide-black/10 border-b border-black/10">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="grid min-h-[168px] grid-cols-[minmax(0,1fr)_112px] gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_168px] sm:gap-8"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <Image
                    src={post.authorImage}
                    alt={post.authorImageAlt}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-black">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="text-black/50">/</span>
                    <span>{post.date}</span>
                    <span className="text-black/50">/</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-semibold leading-snug tracking-normal sm:text-2xl">
                  <Link href={`/blogs/${post.slug}`} className="hover:text-[#2f165e]">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/80 sm:text-base sm:leading-7">
                  {post.description}
                </p>
                <div className="mt-4 text-sm font-semibold text-[#2f165e]">
                  {post.eyebrow}
                </div>
              </div>

              <Link href={`/blogs/${post.slug}`} className="group relative h-[112px] overflow-hidden bg-white sm:h-[118px]">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  sizes="(min-width: 640px) 168px, 112px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
