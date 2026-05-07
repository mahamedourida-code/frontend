import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppLogo } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
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
      title: "Blog | AxLiner",
    };
  }

  return {
    title: `${post.title} | AxLiner Blog`,
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
        url: "https://www.axliner.com/crop.png",
      },
    },
    mainEntityOfPage: `https://www.axliner.com/blogs/${post.slug}`,
  };

  return (
    <main className="min-h-screen bg-[#E9ECE4] text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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

      <article>
        <header className="mx-auto max-w-6xl px-4 pb-9 pt-28 sm:px-6 lg:px-8 lg:pb-12 lg:pt-32">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <Link href="/blogs" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f165e] hover:text-[#24104b]">
                Blog
              </Link>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-black">
                {post.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-black">
                <span>{post.date}</span>
                <span className="text-[#2f165e]">/</span>
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-[24px] shadow-[0_18px_55px_rgba(42,35,64,0.09)] sm:min-h-[320px] lg:min-h-[380px]">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(280px,0.3fr)] lg:px-8">
          <div className="rounded-[26px] border border-white/60 bg-white/36 p-5 shadow-[0_18px_55px_rgba(42,35,64,0.07)] backdrop-blur-xl sm:p-7 lg:p-8">
            <p className="text-base leading-8 text-black">
              {post.intro}
            </p>

            <div className="mt-9 space-y-9">
              {post.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-2xl font-semibold leading-tight tracking-normal text-[#111827]">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-8 text-black">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-[22px] bg-[#2f165e] p-5 text-white sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">
                Takeaway
              </p>
              <p className="mt-4 text-base leading-7">
                {post.takeaway}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-white/65 pt-6">
              <Image
                src={post.authorImage}
                alt={post.authorImageAlt}
                width={52}
                height={52}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f165e]">
                  Written by
                </p>
                <p className="mt-1 text-base font-semibold text-black">{post.authorName}</p>
                <p className="text-sm leading-6 text-black/70">{post.authorRole}</p>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-[24px] border border-white/60 bg-white/32 shadow-[0_18px_50px_rgba(42,35,64,0.07)] backdrop-blur-xl">
              <div className="relative aspect-[1.18]">
                <Image
                  src={post.supportingImage}
                  alt={post.supportingImageAlt}
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f165e]">
                  Related workflow
                </p>
                <p className="mt-3 text-base leading-7 text-black">
                  Try a real handwritten image, scanned paper table, or PDF page and review the extracted spreadsheet output before download.
                </p>
                <Button asChild className="mt-5 rounded-full bg-[#2f165e] px-5 text-white hover:bg-[#24104b]">
                  <Link href="/#converter">Try AxLiner</Link>
                </Button>
              </div>
            </div>
          </aside>
        </section>
      </article>
    </main>
  );
}
