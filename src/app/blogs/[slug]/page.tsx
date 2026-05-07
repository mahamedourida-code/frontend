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
      "@type": "Organization",
      name: "AxLiner",
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
        <header className="mx-auto max-w-7xl px-4 pb-10 pt-32 sm:px-6 lg:px-8 lg:pb-14 lg:pt-40">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
            <div>
              <Link href="/blogs" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f165e] hover:text-[#24104b]">
                Blog
              </Link>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>
              <p className="mt-6 text-lg leading-8 text-black">
                {post.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-black">
                <span>{post.date}</span>
                <span className="text-[#2f165e]">/</span>
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden rounded-[34px] shadow-[0_28px_80px_rgba(42,35,64,0.10)] lg:min-h-[560px]">
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

        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)] lg:px-8">
          <div className="rounded-[34px] border border-white/60 bg-white/36 p-6 shadow-[0_24px_70px_rgba(42,35,64,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
            <p className="text-xl leading-9 text-black">
              {post.intro}
            </p>

            <div className="mt-10 space-y-10">
              {post.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-3xl font-semibold leading-tight tracking-normal text-[#111827]">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-5">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-lg leading-9 text-black">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-[28px] bg-[#2f165e] p-6 text-white sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">
                Takeaway
              </p>
              <p className="mt-4 text-xl leading-8">
                {post.takeaway}
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-white/60 bg-white/32 shadow-[0_22px_60px_rgba(42,35,64,0.08)] backdrop-blur-xl">
              <div className="relative aspect-[0.92]">
                <Image
                  src={post.supportingImage}
                  alt={post.supportingImageAlt}
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
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
