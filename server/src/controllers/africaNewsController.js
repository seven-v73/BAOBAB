import logger from '../utils/logger.js'
import { getCache, setCache } from '../utils/cache.js'

const NEWS_SOURCES = [
  { name: 'Africanews', feed: 'https://www.africanews.com/feed/rss' },
  { name: 'RFI Afrique', feed: 'https://www.rfi.fr/fr/afrique/rss' },
]

const CACHE_KEY = 'news:africa:rss:v1'
const CACHE_TTL_SECONDS = 15 * 60
let memoryCache = null

const decodeXml = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .trim()

const stripHtml = (value = '') => decodeXml(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? decodeXml(match[1]) : ''
}

const getImage = (item) => {
  const media = item.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*\burl=["']([^"']+)["']/i)
  const fromDescription = getTag(item, 'description').match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)
  return decodeXml(media?.[1] || fromDescription?.[1] || '')
}

const parseFeed = (xml, source) => {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>/gi) || []
  return entries.map((item, index) => {
    const title = stripHtml(getTag(item, 'title'))
    const url = getTag(item, 'link')
    const excerpt = stripHtml(getTag(item, 'description')).slice(0, 280)
    const date = getTag(item, 'pubDate') || getTag(item, 'dc:date') || new Date().toISOString()
    const category = stripHtml(getTag(item, 'category')) || 'Actualité'

    return {
      id: `${source.name.toLowerCase().replace(/\W+/g, '-')}-${index}-${url}`,
      title,
      excerpt,
      category,
      country: 'AF',
      image: getImage(item),
      source: source.name,
      date: Number.isNaN(Date.parse(date)) ? new Date().toISOString() : new Date(date).toISOString(),
      url,
    }
  }).filter((article) => article.title && /^https?:\/\//i.test(article.url))
}

const fetchFeed = async (source) => {
  const response = await fetch(source.feed, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
      'User-Agent': 'MonBaobabNewsBot/1.0 (+https://monbaobab.com)',
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`)
  return parseFeed(await response.text(), source)
}

// GET /api/news/africa — flux RSS de médias publiant volontairement leurs actualités.
export const getAfricaNews = async (req, res) => {
  const cached = await getCache(CACHE_KEY)
  if (cached) return res.json(cached)
  if (memoryCache && memoryCache.expiresAt > Date.now()) return res.json(memoryCache.payload)

  const results = await Promise.allSettled(NEWS_SOURCES.map(fetchFeed))
  const articles = results
    .flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .filter((article, index, all) => all.findIndex((item) => item.url === article.url) === index)
    .slice(0, 12)

  results
    .filter((result) => result.status === 'rejected')
    .forEach((result) => logger.warn('Flux d’actualité Afrique indisponible:', result.reason?.message))

  const payload = { items: articles, updatedAt: new Date().toISOString() }
  memoryCache = { payload, expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000 }
  await setCache(CACHE_KEY, payload, CACHE_TTL_SECONDS)
  res.json(payload)
}
