import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandVisualFrame } from "@/components/BrandVisual";
import { MarketingNavBar } from "@/components/MarketingNavBar";
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
  title: "AxLiner Journal | The bookkeeping profession in 2026",
  description:
    "Honest writing about running a bookkeeping or accounting practice in 2026: pricing, retention, daily life, and how AI is reshaping the work.",
  alternates: {
    canonical: "https://www.axliner.com/blogs",
  },
  openGraph: {
    title: "AxLiner Journal",
    description:
      "Field notes for bookkeepers and accountants: pricing, client retention, daily life, profession trends.",
    url: "https://www.axliner.com/blogs",
    siteName: "AxLiner",
    type: "website",
  },
};

export default function BlogsPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <MarketingNavBar />

      {/* Masthead */}
      <section className="ax-marketing-container-editorial pb-10 pt-32 lg:pt-36">
        <div className="border-b-2 border-neutral-900 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">
            The AxLiner Journal
          </p>
          <h1 className="ax-marketing-section-title mt-5 max-w-4xl text-black">
            Field notes for the people who keep the books.
          </h1>
          <p className="ax-marketing-lead mt-6 max-w-3xl text-black">
            Honest writing about running a bookkeeping or accounting practice in 2026: pricing models, client
            retention, the Sunday-evening reality, and what AI is actually doing to the profession.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-neutral-900/10 pt-5 text-sm font-bold uppercase tracking-[0.12em] text-neutral-900">
            <span className="text-emerald-700">All issues</span>
            <span>Client retention</span>
            <span>Pricing trends</span>
            <span>Daily life</span>
            <span>Profession in 2026</span>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured ? (
        <section className="ax-marketing-container-editorial pb-16">
          <Link href={`/blogs/${featured.slug}`} className="group block">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
              <BrandVisualFrame treatment="photo" className="relative aspect-[5/4] w-full overflow-hidden lg:aspect-[6/5]">
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="rounded-md object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </BrandVisualFrame>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                  Featured / {featured.eyebrow}
                </p>
                <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-4xl lg:text-[42px]">
                  <span className="bg-[linear-gradient(to_bottom,transparent_62%,#a7f3d0_62%,#a7f3d0_92%,transparent_92%)] decoration-clone box-decoration-clone px-0.5 group-hover:bg-[linear-gradient(to_bottom,transparent_60%,#6ee7b7_60%,#6ee7b7_94%,transparent_94%)]">
                    {featured.title}
                  </span>
                </h2>
                <p className="ax-marketing-body mt-5 max-w-xl text-black">
                  {featured.description}
                </p>
                <div className="mt-7 flex items-center gap-3 text-sm font-bold text-neutral-900">
                  <Image
                    src={featured.authorImage}
                    alt={featured.authorImageAlt}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-100"
                  />
                  <span>{featured.authorName}</span>
                  <span className="text-emerald-700">/</span>
                  <span>{featured.readTime}</span>
                  <span className="text-neutral-400">·</span>
                  <span>{featured.date}</span>
                </div>
                <p className="mt-7 inline-flex items-center gap-2 text-base font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Read the issue
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Issue list */}
      <section className="ax-marketing-container-editorial pb-24">
        <div className="border-t-2 border-neutral-900 pt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-900">
            More from the journal
          </p>
        </div>

        <div className="mt-10 space-y-14">
          {rest.map((post, index) => {
            const parts = dateParts(post.date);

            return (
              <article
                key={post.slug}
                className="grid gap-6 border-b border-neutral-900/10 pb-14 last:border-none last:pb-0 md:grid-cols-[88px_minmax(0,1fr)]"
              >
                {/* Date stamp — editorial mast block */}
                <div className="flex h-[88px] w-[88px] flex-col items-center justify-center bg-emerald-700 text-white">
                  <span className="text-[10px] font-bold uppercase leading-none tracking-[0.18em]">{parts.month}</span>
                  <span className="mt-1.5 text-[34px] font-bold leading-none">{parts.day}</span>
                  <span className="mt-1 text-[10px] font-bold leading-none tracking-[0.14em]">{parts.year}</span>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                    Issue no. {String(index + 2).padStart(2, "0")} · {post.eyebrow}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl">
                    <Link href={`/blogs/${post.slug}`} className="transition-colors hover:text-emerald-700">
                      {post.title}
                    </Link>
                  </h2>

                  <div className="mt-6 grid gap-7 lg:grid-cols-[330px_minmax(0,1fr)]">
                    <Link href={`/blogs/${post.slug}`} className="group relative block h-[200px] w-full lg:w-[330px]">
                      <BrandVisualFrame treatment="photo" className="h-full w-full">
                        <Image
                          src={post.image}
                          alt={post.imageAlt}
                          fill
                          sizes="(min-width: 1024px) 330px, 100vw"
                          className="rounded-md object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </BrandVisualFrame>
                    </Link>

                    <div className="flex min-h-[200px] flex-col justify-between">
                      <div>
                        <p className="ax-marketing-body text-black">
                          {post.description}
                        </p>
                        <div className="mt-5 flex items-center gap-3 text-sm font-bold text-neutral-900">
                          <Image
                            src={post.authorImage}
                            alt={post.authorImageAlt}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-100"
                          />
                          <span>{post.authorName}</span>
                          <span className="text-emerald-700">/</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <Link
                        href={`/blogs/${post.slug}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700 transition-transform duration-300 hover:translate-x-1"
                      >
                        Read the issue
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer of journal */}
        <div className="mt-20 rounded-md border-2 border-neutral-900 bg-emerald-100 px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-800">The next issue</p>
              <p className="mt-3 text-2xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-[28px]">
                A new field note lands every Thursday. Honest, short, and written for the people doing the work.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                href="/sign-up?next=%2Fblogs"
                className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Get the journal
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
