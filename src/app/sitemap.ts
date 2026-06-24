import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://exchangehub.vercel.app'
  const locales = ['', '/en', '/zh', '/zh-HK', '/ja', '/ko']

  const pages = [
    '', '/marketplace', '/shops', '/rates',
    '/login', '/register', '/create-order',
  ]

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '/rates' ? 'hourly' : 'daily' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )
}
