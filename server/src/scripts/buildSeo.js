/**
 * Génération SEO statique de MonBaobab.
 *
 * Pour chaque page publique (accueil, listes, fiches pays, articles, personnalités, récits…),
 * écrit dist/<route>/index.html : la coquille de l'application + balises propres à la page
 * (title, description, canonical, Open Graph, Twitter, JSON-LD) + un instantané lisible du contenu
 * dans #root. React remplace cet instantané au chargement ; les robots qui n'exécutent pas
 * JavaScript (aperçus WhatsApp/Facebook/LinkedIn, Bing, robots d'IA) voient le vrai contenu.
 * Écrit aussi sitemap.xml (uniquement des routes qui existent) et robots.txt.
 *
 * Usage : node server/src/scripts/buildSeo.js [--dist <dossier>] [--soft]
 *   --soft : en cas d'erreur (base injoignable…), avertit sans faire échouer le build.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.resolve(__dirname, '../..')
const rootDir = path.resolve(serverDir, '..')

const args = process.argv.slice(2)
const argValue = (name) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}
const SOFT = args.includes('--soft')
const DIST = path.resolve(rootDir, argValue('--dist') || process.env.SEO_DIST_DIR || 'dist')
const SHELL_FILE = '_shell.html'

const SITE = (process.env.SITE_URL || 'https://monbaobab.com').replace(/\/$/, '')
const SITE_NAME = 'MonBaobab'
const DEFAULT_IMAGE = `${SITE}/og/monbaobab-default.jpg`
const DEFAULT_DESCRIPTION =
  'Histoires, cultures, savoirs et talents d’Afrique : fiches pays, personnalités, récits et proverbes, documentés et partagés par la communauté MonBaobab.'

/* ---------------------------------------------------------------- utilitaires */

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const plain = (value) =>
  String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\d+\]/g, '')
    .replace(/[#*_`>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const clip = (value, max = 158) => {
  const text = plain(value)
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`
}

const absolute = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`
}

const isoDate = (value) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined
}

const year = (value) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date.getUTCFullYear() : null
}

const paragraphs = (text, max = 12) =>
  String(text ?? '')
    .split(/\n{2,}/)
    .map((p) => plain(p))
    .filter(Boolean)
    .slice(0, max)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('\n')

/** Texte d'article (syntaxe du carnet : ## parties, > citations, - listes, [n] notes) → HTML sûr */
const articleHtml = (content = '') =>
  String(content)
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const inline = (text) =>
        esc(text)
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/\s*\[(\d+)\]/g, '<sup><a href="#ref-$1">$1</a></sup>')
      const lines = chunk.split('\n').map((line) => line.trim())
      if (/^#{2,3}\s/.test(chunk)) return `<h2>${inline(chunk.replace(/^#{2,3}\s+/, ''))}</h2>`
      if (lines.every((line) => line.startsWith('>'))) return `<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`
      if (lines.every((line) => /^[-•]\s+/.test(line))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-•]\s+/, ''))}</li>`).join('')}</ul>`
      return `<p>${inline(lines.join(' '))}</p>`
    })
    .join('\n')

const referencesHtml = (references = []) =>
  references.length
    ? `<h2>Références</h2><ol>${references
        .map(
          (ref, i) =>
            `<li id="ref-${i + 1}">${esc(ref.title)}${[ref.author, ref.publisher, ref.year].filter(Boolean).length ? ` — ${esc([ref.author, ref.publisher, ref.year].filter(Boolean).join(', '))}` : ''}${ref.url ? ` <a href="${esc(ref.url)}" rel="nofollow">${esc(ref.url)}</a>` : ''}</li>`,
        )
        .join('')}</ol>`
    : ''

const list = (items, render = (item) => esc(item)) =>
  items && items.length ? `<ul>${items.map((item) => `<li>${render(item)}</li>`).join('')}</ul>` : ''

const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`

const breadcrumbLd = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absolute(crumb.path),
  })),
})

/* ------------------------------------------------------------ rendu des pages */

const headTags = (page) => {
  const title = page.title ? `${page.title} · ${SITE_NAME}` : `${SITE_NAME} — Histoires, cultures et savoirs d’Afrique`
  const description = clip(page.description || DEFAULT_DESCRIPTION)
  const url = absolute(page.path)
  const image = absolute(page.image) || DEFAULT_IMAGE
  const jsonLd = [].concat(page.jsonLd || [])
  if (page.breadcrumbs) jsonLd.push(breadcrumbLd(page.breadcrumbs))

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:type" content="${page.type || 'website'}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(page.title || title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title || title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    jsonLd.length
      ? `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify(
          jsonLd.length === 1 ? { '@context': 'https://schema.org', ...jsonLd[0] } : { '@context': 'https://schema.org', '@graph': jsonLd },
        ).replace(/</g, '\\u003c')}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ')
}

const snapshot = (page) => {
  const crumbs = page.breadcrumbs
    ? `<nav aria-label="Fil d’Ariane">${page.breadcrumbs
        .map((crumb, i) => (i < page.breadcrumbs.length - 1 ? link(crumb.path, crumb.name) : esc(crumb.name)))
        .join(' › ')}</nav>`
    : ''
  return `<div class="seo-snapshot">
<header><a href="/">${SITE_NAME}</a> · ${link('/map', 'Explorer')} · ${link('/recits', 'Récits')} · ${link('/reperes', 'Repères')} · ${link('/contribute', 'Contribuer')}</header>
<main>
${crumbs}
<h1>${esc(page.heading || page.title || SITE_NAME)}</h1>
${page.body || `<p>${esc(page.description || DEFAULT_DESCRIPTION)}</p>`}
</main>
</div>`
}

const renderPage = (shell, page) =>
  shell
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->\n    ${headTags(page)}\n    <!--seo:end-->`)
    .replace('<div id="root"></div>', () => `<div id="root">${snapshot(page)}</div>`)

/* ------------------------------------------------------------- collecte des pages */

const collectPages = async (models) => {
  const { Blog, Country, HistoricalFigure, Story, Collection, TimelineEvent, Proverb } = models

  const [blogs, countries, figures, stories, collections, events, proverbs] = await Promise.all([
    Blog.find({ published: true }).sort({ createdAt: -1 }).lean(),
    Country.find({ isActive: { $ne: false } }).sort({ nameFr: 1 }).lean(),
    HistoricalFigure.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean(),
    Story.find({ published: true }).sort({ createdAt: -1 }).lean(),
    Collection.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean(),
    TimelineEvent.find({ isActive: { $ne: false } }).sort({ date: 1 }).lean(),
    Proverb.find({}).sort({ countryName: 1 }).lean(),
  ])

  const pages = []
  const home = { name: 'Accueil', path: '/' }
  const countryName = (c) => c.nameFr || c.name

  /* Accueil */
  pages.push({
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    heading: 'L’Afrique a beaucoup à raconter.',
    description: DEFAULT_DESCRIPTION,
    body: `<p>${esc(DEFAULT_DESCRIPTION)}</p>
<h2>Explorer</h2>${list(
      [
        ['/map', `Explorer les pays (${countries.length})`],
        ['/recits', `Récits (${blogs.length + stories.length} articles et histoires, ${collections.length} dossiers)`],
        ['/reperes', `Repères (${events.length} dates, ${figures.length} personnalités, ${proverbs.length} proverbes)`],
        ['/sources', 'Sources'],
        ['/contribute', 'Contribuer'],
      ],
      ([href, label]) => link(href, label),
    )}
<h2>À lire</h2>${list(blogs.slice(0, 6), (b) => link(`/blog/${b._id}`, b.title))}`,
    jsonLd: [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: SITE_NAME,
        url: `${SITE}/`,
        inLanguage: 'fr',
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: SITE_NAME,
        url: `${SITE}/`,
        logo: `${SITE}/Logo/Fichier%204@2x.png`,
      },
    ],
  })

  /* Pays */
  pages.push({
    path: '/map',
    title: 'Carte interactive des pays d’Afrique',
    description: `Explorez les ${countries.length} pays d’Afrique : capitales, langues, histoire, cultures, cuisines et personnalités.`,
    breadcrumbs: [home, { name: 'Explorer', path: '/map' }],
    priority: '0.9',
    body: list(countries, (c) => `${link(`/country/${c.id.toLowerCase()}`, countryName(c))} — ${esc(c.capital || '')}`),
  })
  for (const c of countries) {
    const name = countryName(c)
    const description = c.oneSentenceSummary || c.description || `${name} : histoire, langues et cultures.`
    pages.push({
      path: `/country/${c.id.toLowerCase()}`,
      title: `${name} : histoire, langues et cultures`,
      heading: name,
      description,
      image: `https://flagcdn.com/w1280/${c.id.toLowerCase()}.png`,
      lastmod: c.updatedAt,
      breadcrumbs: [home, { name: 'Explorer', path: '/map' }, { name, path: `/country/${c.id.toLowerCase()}` }],
      priority: '0.8',
      body: `<p>${esc(description)}</p>
${c.description && c.description !== description ? `<p>${esc(plain(c.description))}</p>` : ''}
<dl><dt>Capitale</dt><dd>${esc(c.capital)}</dd><dt>Région</dt><dd>${esc(c.region || '')}</dd><dt>Population</dt><dd>${esc(c.population || '')}</dd><dt>Langues</dt><dd>${esc((c.languages || []).join(', '))}</dd><dt>Monnaie</dt><dd>${esc(c.currency || '')}</dd></dl>
${c.keyFacts?.length ? `<h2>À savoir</h2>${list(c.keyFacts)}` : ''}
${c.historyHighlights?.length ? `<h2>Repères historiques</h2>${list(c.historyHighlights)}` : ''}
${c.peoples?.length ? `<h2>Peuples</h2>${list(c.peoples)}` : ''}
${c.musicAndArts?.length ? `<h2>Musiques et arts</h2>${list(c.musicAndArts)}` : ''}
${c.foodCulture?.length ? `<h2>Cuisine</h2>${list(c.foodCulture)}` : ''}
${c.notableFigures?.length ? `<h2>Personnalités</h2>${list(c.notableFigures)}` : ''}`,
      jsonLd: {
        '@type': 'Country',
        name,
        alternateName: c.officialName || undefined,
        description: clip(description, 300),
        url: absolute(`/country/${c.id.toLowerCase()}`),
        containedInPlace: { '@type': 'Continent', name: 'Afrique' },
      },
    })
  }

  /* Récits : articles, histoires et dossiers (remplace /blog, /stories et /collections) */
  pages.push({
    path: '/recits',
    title: 'Récits : articles, témoignages et dossiers sur l’Afrique',
    description: 'Articles documentés, histoires transmises et dossiers thématiques pour comprendre les lieux, les époques et les héritages africains.',
    breadcrumbs: [home, { name: 'Récits', path: '/recits' }],
    changefreq: 'daily',
    priority: '0.9',
    body: `<h2>Articles</h2>${list(blogs, (b) => `${link(`/blog/${b._id}`, b.title)} — ${esc(clip(b.excerpt, 140))}`)}
<h2>Histoires</h2>${list(stories, (s) => `${link(`/stories/${s._id}`, s.title)} — ${esc(s.subtitle || clip(s.description, 120))}`)}
<h2>Dossiers</h2>${list(collections, (c) => `${link(`/collections/${c._id}`, c.title)} — ${esc(c.shortDescription || '')}`)}`,
  })
  for (const b of blogs) {
    const path_ = `/blog/${b._id}`
    pages.push({
      path: path_,
      title: b.title,
      description: b.excerpt || b.content,
      image: b.image,
      type: 'article',
      lastmod: b.updatedAt,
      breadcrumbs: [home, { name: 'Récits', path: '/recits' }, { name: b.title, path: path_ }],
      priority: '0.8',
      body: `<p><em>${esc(b.category || '')} · ${b.kind === 'temoignage' ? 'Témoignage' : 'Article documenté'} · ${esc(b.author || SITE_NAME)}</em></p>\n${b.excerpt ? `<p><strong>${esc(plain(b.excerpt))}</strong></p>` : ''}\n${articleHtml(b.content)}\n${referencesHtml(b.references)}`,
      jsonLd: {
        '@type': 'Article',
        headline: clip(b.title, 110),
        description: clip(b.excerpt || b.content, 300),
        image: b.image ? [absolute(b.image)] : undefined,
        datePublished: isoDate(b.createdAt),
        dateModified: isoDate(b.updatedAt),
        author: { '@type': b.authorId && b.author !== 'Rédaction MonBaobab' ? 'Person' : 'Organization', name: b.author || SITE_NAME },
        citation: (b.references || []).map((ref) => ref.url || ref.title),
        publisher: { '@id': `${SITE}/#organization` },
        articleSection: b.category || undefined,
        keywords: (b.tags || []).join(', ') || undefined,
        inLanguage: 'fr',
        mainEntityOfPage: absolute(path_),
      },
    })
  }

  /* Repères : dates, personnalités et proverbes (remplace /timeline, /figures et /proverbs) */
  pages.push({
    path: '/reperes',
    title: 'Repères : dates, personnalités et proverbes d’Afrique',
    description: 'Les grandes dates de l’histoire africaine, les personnalités qui l’ont marquée et les proverbes qui la transmettent.',
    breadcrumbs: [home, { name: 'Repères', path: '/reperes' }],
    priority: '0.9',
    body: `<h2>Dates</h2>${list(events, (e) => `${year(e.date) ?? ''} — ${link(`/timeline/${e._id}`, e.title)}`)}
<h2>Personnalités</h2>${list(figures, (f) => `${link(`/figures/${f._id}`, f.name)} — ${esc(f.shortBiography || '')}`)}
<h2>Proverbes</h2>${list(
      proverbs,
      (p) => `<blockquote>${esc(p.text)}</blockquote> <small>${esc([p.countryName, p.language].filter(Boolean).join(' · '))}</small>${p.explanation ? `<p>${esc(p.explanation)}</p>` : ''}`,
    )}`,
  })
  for (const f of figures) {
    const path_ = `/figures/${f._id}`
    const born = year(f.birthDate)
    const died = year(f.deathDate)
    const span = born ? ` (${born}${died ? `–${died}` : ''})` : ''
    pages.push({
      path: path_,
      title: `${f.name}${span}`,
      heading: f.name,
      description: f.shortBiography || f.biography,
      image: f.image,
      type: 'profile',
      lastmod: f.updatedAt,
      breadcrumbs: [home, { name: 'Repères', path: '/reperes' }, { name: f.name, path: path_ }],
      priority: '0.7',
      body: `<p><strong>${esc(f.shortBiography || '')}</strong></p>
${paragraphs(f.biography, 20)}
${f.achievements?.length ? `<h2>Réalisations</h2>${list(f.achievements.map((a) => (typeof a === 'string' ? a : a?.title || a?.description || '')).filter(Boolean))}` : ''}`,
      jsonLd: {
        '@type': 'Person',
        name: f.name,
        alternateName: f.nameNative || undefined,
        description: clip(f.shortBiography || f.biography, 300),
        image: f.image ? absolute(f.image) : undefined,
        birthPlace: f.birthPlace?.location ? { '@type': 'Place', name: f.birthPlace.location } : undefined,
        url: absolute(path_),
      },
    })
  }

  for (const s of stories) {
    const path_ = `/stories/${s._id}`
    pages.push({
      path: path_,
      title: s.subtitle ? `${s.title} : ${s.subtitle}` : s.title,
      heading: s.title,
      description: s.description,
      image: s.coverImage,
      type: 'article',
      lastmod: s.updatedAt,
      breadcrumbs: [home, { name: 'Récits', path: '/recits' }, { name: s.title, path: path_ }],
      priority: '0.7',
      body: `<p>${esc(plain(s.description))}</p>
${(s.chapters || []).map((ch) => `<h2>${esc(ch.title || '')}</h2>\n${paragraphs(ch.content, 20)}`).join('\n')}`,
      jsonLd: {
        '@type': 'Article',
        headline: clip(s.title, 110),
        description: clip(s.description, 300),
        genre: s.category || undefined,
        timeRequired: s.readingTime ? `PT${s.readingTime}M` : undefined,
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@id': `${SITE}/#organization` },
        datePublished: isoDate(s.createdAt),
        dateModified: isoDate(s.updatedAt),
        inLanguage: 'fr',
        mainEntityOfPage: absolute(path_),
      },
    })
  }

  for (const c of collections) {
    const path_ = `/collections/${c._id}`
    pages.push({
      path: path_,
      title: c.title,
      description: c.shortDescription || c.description,
      image: c.coverImage,
      lastmod: c.updatedAt,
      breadcrumbs: [home, { name: 'Récits', path: '/recits' }, { name: c.title, path: path_ }],
      priority: '0.6',
      body: paragraphs(c.description, 10),
      jsonLd: { '@type': 'CollectionPage', name: c.title, description: clip(c.shortDescription || c.description, 300), url: absolute(path_) },
    })
  }

  for (const e of events) {
    const path_ = `/timeline/${e._id}`
    const y = year(e.date)
    pages.push({
      path: path_,
      title: y ? `${e.title} (${y})` : e.title,
      heading: e.title,
      description: e.shortDescription || e.description,
      image: e.images?.[0],
      lastmod: e.updatedAt,
      breadcrumbs: [home, { name: 'Repères', path: '/reperes' }, { name: e.title, path: path_ }],
      priority: '0.6',
      body: `<p><em>${esc(e.period || '')}${e.location?.region ? ` · ${esc(e.location.region)}` : ''}${y ? ` · ${y}` : ''}</em></p>\n${paragraphs(e.description, 10)}`,
    })
  }

  /* Pages simples */
  pages.push(
    {
      path: '/sources',
      title: 'Sources et provenance des contenus',
      description: 'D’où viennent les contenus de MonBaobab : sources, méthode de vérification et contributions.',
      breadcrumbs: [home, { name: 'Sources', path: '/sources' }],
      priority: '0.5',
    },
    {
      path: '/contribute',
      title: 'Contribuer : partager une histoire, un savoir, un lieu',
      description: 'Partagez un récit, un proverbe, une recette ou un savoir-faire pour enrichir la mémoire collective africaine.',
      breadcrumbs: [home, { name: 'Contribuer', path: '/contribute' }],
      priority: '0.5',
    },
  )

  return pages
}

/* ------------------------------------------------------------------- écriture */

const writeSitemap = (pages) => {
  const today = new Date().toISOString().slice(0, 10)
  const body = pages
    .filter((page) => !page.noindex)
    .map(
      (page) => `  <url>
    <loc>${esc(absolute(page.path))}</loc>
    <lastmod>${(isoDate(page.lastmod) || today).slice(0, 10)}</lastmod>
    <changefreq>${page.changefreq || 'weekly'}</changefreq>
    <priority>${page.priority || '0.5'}</priority>
  </url>`,
    )
    .join('\n')
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  )
}

const writeRobots = () => {
  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /dashboard
Disallow: /checkout
Disallow: /cart
Disallow: /orders/
Disallow: /blog/admin
Disallow: /blog/ecrire
Disallow: /${SHELL_FILE}

Sitemap: ${SITE}/sitemap.xml
`,
  )
}

const writePages = (shell, pages) => {
  // /country/sn → dist/country/sn.html (servi par nginx via `try_files $uri $uri.html …`).
  // Pas de dossier/index.html : nginx redirigerait /country/sn vers /country/sn/ (301).
  // Écriture atomique : fichier temporaire puis renommage (jamais de page à moitié écrite servie).
  for (const page of pages) {
    const target = page.path === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${page.path}.html`)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    const tmp = `${target}.tmp-${process.pid}`
    fs.writeFileSync(tmp, renderPage(shell, page))
    fs.renameSync(tmp, target)
  }
}

export const buildSeo = async ({ models } = {}) => {
  const indexFile = path.join(DIST, 'index.html')
  const shellFile = path.join(DIST, SHELL_FILE)
  if (!fs.existsSync(indexFile)) throw new Error(`Aucun build trouvé dans ${DIST}`)

  // Après un nouveau build, index.html est la coquille vierge : on la conserve pour les générations suivantes
  const index = fs.readFileSync(indexFile, 'utf8')
  if (!index.includes('data-seo-generated')) fs.writeFileSync(shellFile, index)
  const shell = fs.readFileSync(shellFile, 'utf8').replace('<html lang="fr">', '<html lang="fr" data-seo-generated>')
  if (!shell.includes('<!--seo:start-->') || !shell.includes('<div id="root"></div>')) {
    throw new Error('index.html ne contient pas les marqueurs attendus (<!--seo:start--> et <div id="root"></div>)')
  }

  let ownConnection = false
  let mongoose
  if (!models) {
    const dotenv = (await import('dotenv')).default
    dotenv.config({ path: path.join(serverDir, '.env') })
    mongoose = (await import('mongoose')).default
    if (mongoose.connection.readyState === 0) {
      if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI non défini')
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      ownConnection = true
    }
    const load = async (name) => (await import(`../models/${name}.js`)).default
    models = {
      Blog: await load('Blog'),
      Country: await load('Country'),
      HistoricalFigure: await load('HistoricalFigure'),
      Story: await load('Story'),
      Collection: await load('Collection'),
      TimelineEvent: await load('TimelineEvent'),
      Proverb: await load('Proverb'),
    }
  }

  try {
    const pages = await collectPages(models)
    writePages(shell, pages)
    writeSitemap(pages)
    writeRobots()
    return pages.length
  } finally {
    if (ownConnection) await mongoose.disconnect()
  }
}

// Exécution directe en ligne de commande
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSeo()
    .then((count) => {
      console.log(`SEO : ${count} pages générées dans ${DIST} (+ sitemap.xml, robots.txt)`)
      process.exit(0)
    })
    .catch((error) => {
      console[SOFT ? 'warn' : 'error'](`SEO : génération ${SOFT ? 'ignorée' : 'échouée'} — ${error.message}`)
      process.exit(SOFT ? 0 : 1)
    })
}
