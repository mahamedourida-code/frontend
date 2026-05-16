import { MetadataRoute } from 'next'
import { industrySolutions } from '@/lib/industry-solutions'
import { blogPosts } from '@/lib/blogs'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.axliner.com'
  const lastModified = new Date()
  const legacySolutionRoutes = [
    '/solutions/handwritten-tables',
    '/solutions/paper-forms',
    '/solutions/financial-documents',
    '/solutions/data-entry',
  ]
  const industrySolutionRoutes = industrySolutions.map((solution) => `/solutions/${solution.slug}`)
  const blogRoutes = blogPosts.map((post) => `/blogs/${post.slug}`)
  
  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/benchmarks`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${baseUrl}/how-axliner-is-built`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.78,
    })),
    {
      url: `${baseUrl}/handwritten-to-excel`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/image-to-excel`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/screenshot-to-excel`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jpg-to-excel`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...legacySolutionRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...industrySolutionRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/products`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
