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

      <article className="mx-auto max-w-[760px] px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <header>
          <Link href="/blogs" className="text-sm font-semibold text-[#2f165e] hover:text-[#24104b]">
            AxLiner Blog
          </Link>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-black sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-xl leading-8 text-black/70">
            {post.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Image
              src={post.authorImage}
              alt={post.authorImageAlt}
              width={42}
              height={42}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-black">{post.authorName}</p>
              <p className="text-sm leading-5 text-black/60">
                {post.readTime} / {post.date}
              </p>
            </div>
          </div>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-white">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="760px"
              className="object-cover"
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-black/60">{post.imageAlt}</p>
        </header>

        <section className="mt-9 border-t border-black/10 pt-8">
          <p className="text-[20px] leading-[32px] text-black">
            {post.intro}
          </p>

          <div className="mt-10 space-y-10">
            {post.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold leading-tight tracking-normal text-black">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-[20px] leading-[32px] text-black">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 border-l-4 border-[#2f165e] pl-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f165e]">
              Takeaway
            </p>
            <p className="mt-3 text-[20px] leading-[32px] text-black">
              {post.takeaway}
            </p>
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-black/10 pt-6">
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
        </section>
      </article>
    </main>
  );
}
