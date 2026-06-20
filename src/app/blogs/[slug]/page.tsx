import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandVisualFrame } from "@/components/BrandVisual";
import { MarketingNavBar } from "@/components/MarketingNavBar";
import { blogPosts, getBlogPost } from "@/lib/blogs";

type BlogPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Journal | AxLiner",
    };
  }

  return {
    title: `${post.title} | AxLiner Journal`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://www.axliner.com/blogs/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.axliner.com/blogs/${post.slug}`,
      siteName: "AxLiner",
      type: "article",
      publishedTime: "2026-05-07",
      images: [
        {
          url: `https://www.axliner.com${post.image}`,
          alt: post.imageAlt,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `https://www.axliner.com${post.image}`,
    datePublished: "2026-05-07",
    dateModified: "2026-05-07",
    author: {
      "@type": "Person",
      name: post.authorName,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "AxLiner",
      logo: {
        "@type": "ImageObject",
        url: "https://www.axliner.com/og-image.png",
      },
    },
    mainEntityOfPage: `https://www.axliner.com/blogs/${post.slug}`,
  };

  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="ax-marketing-page min-h-screen bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <MarketingNavBar />

      <article className="ax-marketing-container-reading max-w-[760px] pb-20 pt-32 lg:pt-36">
        <header>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700 transition-colors hover:text-emerald-800"
          >
            <span aria-hidden="true">←</span>
            The AxLiner Journal
          </Link>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-900">
            {post.eyebrow}
          </p>
          <h1 className="ax-marketing-section-title mt-4 text-black">
            {post.title}
          </h1>
          <p className="ax-marketing-lead mt-6 text-black">
            {post.description}
          </p>

          <div className="mt-7 flex items-center gap-3 border-y border-neutral-900/10 py-5">
            <Image
              src={post.authorImage}
              alt={post.authorImageAlt}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-100"
            />
            <div>
              <p className="text-sm font-bold text-neutral-900">{post.authorName}</p>
              <p className="text-sm font-semibold leading-5 text-neutral-700">
                {post.readTime} <span className="text-emerald-700">/</span> {post.date}
              </p>
            </div>
          </div>

          <BrandVisualFrame treatment="photo" className="mt-8 aspect-[16/9]">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="760px"
              className="rounded-md object-cover"
            />
          </BrandVisualFrame>
          <p className="mt-3 text-sm font-semibold leading-6 text-neutral-700">{post.imageAlt}</p>
        </header>

        <section className="mt-10 border-t-2 border-neutral-900 pt-9">
          {/* Dropcap intro */}
          <p className="text-[21px] font-semibold leading-[34px] text-neutral-900 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[68px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-emerald-700">
            {post.intro}
          </p>

          <div className="mt-12 space-y-12">
            {post.sections.map((section, sIndex) => (
              <section key={section.title}>
                <div className="flex items-baseline gap-4">
                  <span className="text-[11px] font-bold leading-none tracking-[0.18em] text-emerald-700">
                    §{String(sIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="ax-h3 font-bold leading-tight text-neutral-900">
                    {section.title}
                  </h2>
                </div>
                <div className="mt-5 space-y-5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-[19px] font-semibold leading-[32px] text-neutral-900">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Takeaway block */}
          <div className="mt-14 rounded-md border-2 border-neutral-900 bg-emerald-100 px-7 py-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-800">
              The takeaway
            </p>
            <p className="mt-3 text-[20px] font-bold leading-[32px] text-neutral-900">
              {post.takeaway}
            </p>
          </div>

          {/* Author card */}
          <div className="mt-12 flex items-center gap-4 border-t border-neutral-900/10 pt-7">
            <Image
              src={post.authorImage}
              alt={post.authorImageAlt}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-100"
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Written by
              </p>
              <p className="mt-1 text-base font-bold text-neutral-900">{post.authorName}</p>
              <p className="text-sm font-semibold leading-6 text-neutral-700">{post.authorRole}</p>
            </div>
          </div>
        </section>
      </article>

      {/* Related issues */}
      {otherPosts.length > 0 ? (
        <section className="ax-marketing-container-editorial pb-24">
          <div className="border-t-2 border-neutral-900 pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">
              Keep reading
            </p>
            <h3 className="ax-h2 mt-3 font-bold leading-tight text-neutral-900">
              Other issues from the journal
            </h3>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {otherPosts.map((other) => (
              <Link
                href={`/blogs/${other.slug}`}
                key={other.slug}
                className="group block border-t border-neutral-900/15 pt-6"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                  {other.eyebrow}
                </p>
                <h4 className="mt-3 text-xl font-bold leading-snug tracking-tight text-neutral-900 transition-colors group-hover:text-emerald-700 sm:text-[22px]">
                  {other.title}
                </h4>
                <p className="ax-marketing-card-copy mt-3 line-clamp-3">
                  {other.description}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Read
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
