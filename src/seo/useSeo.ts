import { useEffect } from 'react'

/**
 * Balises SEO côté navigateur. Met à jour en place les mêmes balises que celles écrites
 * par server/src/scripts/buildSeo.js dans les pages pré-générées (aucun doublon).
 */

export const SITE_URL = 'https://monbaobab.com'
const SITE_NAME = 'MonBaobab'
const DEFAULT_TITLE = 'MonBaobab : histoires, cultures et savoirs d’Afrique'
export const DEFAULT_DESCRIPTION =
  'Histoires, cultures, savoirs et talents d’Afrique : fiches pays, personnalités, récits, proverbes et quiz, documentés et partagés par la communauté MonBaobab.'
const DEFAULT_IMAGE = `${SITE_URL}/og/monbaobab-default.jpg`

export interface SeoInput {
  title?: string
  description?: string
  /** Chemin canonique (par défaut : l'URL courante sans paramètres) */
  path?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const plain = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const clip = (value: string, max = 158) => {
  const text = plain(value)
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${space > 80 ? cut.slice(0, space) : cut}…`
}

const absolute = (url?: string) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

const setJsonLd = (data?: SeoInput['jsonLd']) => {
  const existing = document.getElementById('seo-jsonld')
  if (!data) {
    existing?.remove()
    return
  }
  const items = Array.isArray(data) ? data : [data]
  const payload =
    items.length === 1
      ? { '@context': 'https://schema.org', ...items[0] }
      : { '@context': 'https://schema.org', '@graph': items }
  const el = existing || Object.assign(document.createElement('script'), { id: 'seo-jsonld', type: 'application/ld+json' })
  el.textContent = JSON.stringify(payload)
  if (!existing) document.head.appendChild(el)
}

export const applySeo = (input: SeoInput) => {
  const title = input.title ? `${input.title} · ${SITE_NAME}` : DEFAULT_TITLE
  const description = clip(input.description || DEFAULT_DESCRIPTION)
  const url = absolute(input.path ?? window.location.pathname)
  const image = absolute(input.image) || DEFAULT_IMAGE
  const shareTitle = input.title || DEFAULT_TITLE

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', input.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
  setCanonical(url)
  setMeta('property', 'og:type', input.type || 'website')
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:title', shareTitle)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:image', image)
  setMeta('name', 'twitter:title', shareTitle)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)
  setJsonLd(input.jsonLd)
}

/** Applique les balises dès que `input` est disponible (passer `null` pendant le chargement). */
export const useSeo = (input: SeoInput | null) => {
  const key = input ? JSON.stringify(input) : ''
  useEffect(() => {
    if (input) applySeo(input)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
