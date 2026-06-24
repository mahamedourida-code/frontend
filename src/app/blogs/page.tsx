import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { MarketingFooter } from "@/components/MarketingFooter"
import { MarketingNavBar } from "@/components/MarketingNavBar"
import { blogPosts } from "@/lib/blogs"

export const metadata: Metadata = {
  title: "AxLiner Journal | The bookkeeping profession in 2026",
  description: "Honest writing about running a bookkeeping or accounting practice in 2026: pricing, retention, daily life, and how AI is reshaping the work.",
  alternates: { canonical: "https://www.axliner.com/blogs" },
  openGraph: {
    title: "AxLiner Journal",
    description: "Field notes for bookkeepers and accountants: pricing, client retention, daily life, profession trends.",
    url: "https://www.axliner.com/blogs",
    siteName: "AxLiner",
    type: "website",
  },
}

export default function BlogsPage() {
  const [featured, ...rest] = blogPosts

  return (
    <div className="ax-marketing-page min-h-screen bg-[#FDFBF7] text-[#191919]">
      <MarketingNavBar />

      <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-32 sm:px-5 lg:px-9 lg:pt-40">
        <header className="grid max-w-[1120px] gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div>
            <h1 className="ax-h1 max-w-[820px]">
              Field notes for the people who keep the books.
            </h1>
            <p className="mt-6 max-w-[720px] text-lg font-medium leading-8 text-[#444] sm:text-xl">
              Practical writing on pricing, client work, modern bookkeeping, and where AI genuinely removes the busywork.
            </p>
          </div>
          <div className="relative hidden min-h-[320px] overflow-hidden rounded-[28px] border border-black/10 bg-white lg:block">
            <Image
              src="/photos/austin-distel-mpN7xjKQ_Ns-unsplash.jpg"
              alt="Bookkeeper working in a modern office"
              fill
              priority
              sizes="260px"
              className="object-contain p-3"
            />
          </div>
        </header>

        {featured ? (
          <Link href={`/blogs/${featured.slug}`} className="group mt-16 grid overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_18px_55px_rgba(25,25,25,0.06)] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[360px] bg-[#f4f2ed] p-4 sm:min-h-[520px]">
              <Image src={featured.image} alt={featured.imageAlt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-contain p-4" />
            </div>
            <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--landing-blue)]">Featured · {featured.eyebrow}</p>
              <div className="mt-16">
                <h2 className="ax-h2">{featured.title}</h2>
                <p className="mt-6 text-base font-medium leading-7 text-[#555] sm:text-lg">{featured.description}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#555]">
                  <Image src={featured.authorImage} alt={featured.authorImageAlt} width={36} height={36} className="h-9 w-auto rounded-full object-contain" />
                  <span>{featured.authorName}</span><span>·</span><span>{featured.readTime}</span><span>·</span><span>{featured.date}</span>
                </div>
                <p className="mt-9 font-semibold text-[var(--landing-blue)]">Read the story <span aria-hidden>→</span></p>
              </div>
            </div>
          </Link>
        ) : null}

        <section className="mt-20">
          <div className="flex items-end justify-between border-b border-black/10 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--landing-blue)]">Latest</p>
              <h2 className="ax-h2 mt-3">More from the journal</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blogs/${post.slug}`} className="group flex min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_14px_45px_rgba(25,25,25,0.05)]">
                <div className="relative min-h-[260px] bg-[#f4f2ed]">
                  <Image src={post.image} alt={post.imageAlt} fill sizes="(min-width: 1280px) 470px, (min-width: 768px) 50vw, 100vw" className="object-contain p-3" />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--landing-blue)]">{post.eyebrow} · {post.date}</p>
                  <h3 className="mt-4 text-2xl font-medium leading-tight tracking-[-0.035em]">{post.title}</h3>
                  <p className="mt-4 line-clamp-3 text-[15px] font-medium leading-6 text-[#555]">{post.description}</p>
                  <p className="mt-auto pt-8 text-sm font-semibold text-[var(--landing-blue)]">Read {post.readTime} <span aria-hidden>→</span></p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
