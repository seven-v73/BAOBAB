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

// Année lisible : les dates anciennes sont en numérotation astronomique (an 0 = 1 av. J.-C.),
// -2499 s'écrit « 2500 av. J.-C. » (même règle que src/utils/afrique.ts côté site)
const year = (value) => {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return null
  const y = date.getUTCFullYear()
  if (y <= 0) return `${1 - y} av. J.-C.`
  return y < 1000 ? `${y} apr. J.-C.` : String(y)
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
            `<li id="ref-${i + 1}">${esc(ref.title)}${[ref.author, ref.publisher, ref.year].filter(Boolean).length ? `, ${esc([ref.author, ref.publisher, ref.year].filter(Boolean).join(', '))}` : ''}${ref.url ? ` <a href="${esc(ref.url)}" rel="nofollow">${esc(ref.url)}</a>` : ''}</li>`,
        )
        .join('')}</ol>`
    : ''

const list = (items, render = (item) => esc(item)) =>
  items && items.length ? `<ul>${items.map((item) => `<li>${render(item)}</li>`).join('')}</ul>` : ''

const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`

// Comparaison de noms sans accents ni casse (« Léopold » = « leopold »)
const norm = (value) =>
  plain(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const maxDate = (items) =>
  items.reduce((latest, item) => {
    const date = isoDate(item?.updatedAt)
    return date && (!latest || date > latest) ? date : latest
  }, undefined)

/** Quelques autres pages de la même rubrique, pour que chaque fiche en relie d'autres */
const seeAlso = (items, current, render, count = 6) => {
  const index = items.indexOf(current)
  const others = [...items.slice(index + 1), ...items.slice(0, Math.max(index, 0))].filter((item) => item !== current).slice(0, count)
  return others.length ? `<h2>À découvrir aussi</h2>${list(others, render)}` : ''
}

const FICHE_TYPES_FR = {
  langue: 'Langue', peuple: 'Peuple', site: 'Lieu', tradition: 'Tradition', personnalite: 'Personnalité',
  evenement: 'Événement', oeuvre: 'Œuvre', proverbe: 'Proverbe',
}
const joinPlain = (parts) => parts.filter(Boolean).join(' · ')

// Adresse lisible si le contenu en a une (/figures/nelson-mandela), sinon l'identifiant
const slugOf = (doc) => doc.slug || doc._id

/** Ancienne adresse par identifiant, quand le contenu a désormais une adresse lisible */
const aliasOf = (section, doc) => (doc.slug ? [`/${section}/${doc._id}`] : [])

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
  const title = page.title ? `${page.title} · ${SITE_NAME}` : `${SITE_NAME} : histoires, cultures et savoirs d’Afrique`
  const description = clip(page.description || DEFAULT_DESCRIPTION)
  const url = absolute(page.path)
  const image = absolute(page.image) || DEFAULT_IMAGE
  const jsonLd = [].concat(page.jsonLd || [])
  if (page.breadcrumbs) jsonLd.push(breadcrumbLd(page.breadcrumbs))

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    page.canonical === false ? '' : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:type" content="${page.type || 'website'}" />`,
    page.canonical === false ? '' : `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(page.title || title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(page.imageAlt || page.heading || page.title || SITE_NAME)}" />`,
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

// Portraits illustrés du site (src/data/reperesContent.ts), pour les aperçus de partage
const portraitsIllustres = () => {
  const fichier = path.join(rootDir, 'src/data/reperesContent.ts')
  if (!fs.existsSync(fichier)) return new Map()
  const texte = fs.readFileSync(fichier, 'utf8')
  return new Map([...texte.matchAll(/nom:\s*'([^']+)'[\s\S]*?portrait:\s*'(\/content\/[^']+)'/g)].map((m) => [norm(m[1]), m[2]]))
}

/* ------------------------------------------------------------- collecte des pages */

const collectPages = async (models) => {
  const { Blog, Country, HistoricalFigure, Story, Collection, TimelineEvent, Proverb, Fiche } = models

  const [blogs, countries, figures, stories, collections, events, proverbs, fiches] = await Promise.all([
    Blog.find({ published: true }).sort({ createdAt: -1 }).lean(),
    Country.find({ isActive: { $ne: false } }).sort({ nameFr: 1 }).lean(),
    HistoricalFigure.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean(),
    Story.find({ published: true }).sort({ createdAt: -1 }).lean(),
    Collection.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean(),
    TimelineEvent.find({ isActive: { $ne: false } }).sort({ date: 1 }).lean(),
    Proverb.find({}).sort({ countryName: 1 }).lean(),
    // Base de connaissances : seulement ce que l'équipe a relu et publié (jamais les fiches en revue)
    Fiche ? Fiche.find({ statut: 'publie', type: { $ne: 'pays' } }).sort({ titre: 1 }).lean() : [],
  ])

  const pages = []
  const home = { name: 'Accueil', path: '/' }
  const countryName = (c) => c.nameFr || c.name

  /* Accueil */
  pages.push({
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: maxDate([...blogs, ...stories, ...countries, ...figures, ...collections, ...events]),
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
<h2>À lire</h2>${list(blogs.slice(0, 6), (b) => link(`/blog/${slugOf(b)}`, b.title))}`,
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
    lastmod: maxDate(countries),
    body: list(countries, (c) => `${link(`/country/${c.id.toLowerCase()}`, countryName(c))} : ${esc(c.capital || '')}`),
  })
  // Personnalités repérées par leur nom dans les « personnalités » de la fiche pays (ex. « Nelson Mandela - président »)
  const figureIn = (entry) => figures.find((f) => f.name && norm(f.name).length >= 4 && norm(entry).includes(norm(f.name)))
  const countryOfFigure = new Map()
  for (const c of countries) {
    for (const entry of c.notableFigures || []) {
      const f = figureIn(entry)
      if (f && !countryOfFigure.has(String(f._id))) countryOfFigure.set(String(f._id), c)
    }
  }

  for (const c of countries) {
    const name = countryName(c)
    const code = String(c.id || '').toUpperCase()
    const countryProverbs = proverbs.filter((p) => String(p.country) === String(c._id) || norm(p.countryName) === norm(name))
    const countryBlogs = blogs.filter((b) => b.country === code)
    const countryFigures = figures.filter((f) => countryOfFigure.get(String(f._id)) === c || (f.relatedCountries || []).some((id) => String(id) === String(c._id)))
    const countryFiches = fiches.filter((f) => String(f.pays).toUpperCase() === code)
    const countryEvents = events.filter((e) => (e.relatedCountries || []).some((id) => String(id) === String(c._id)))
    // Personnalités liées au pays mais absentes de sa liste « personnalités »
    const otherFigures = countryFigures.filter((f) => !(c.notableFigures || []).some((entry) => figureIn(entry) === f))
    const notable = (entry) => {
      const f = figureIn(entry)
      return f ? link(`/figures/${slugOf(f)}`, entry) : esc(entry)
    }
    const description = c.oneSentenceSummary || c.description || `${name} : histoire, langues et cultures.`
    pages.push({
      path: `/country/${c.id.toLowerCase()}`,
      title: `${name} : histoire, langues et cultures`,
      heading: name,
      description,
      image: `https://flagcdn.com/w1280/${c.id.toLowerCase()}.png`,
      imageAlt: `Drapeau : ${name}`,
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
${c.notableFigures?.length ? `<h2>Personnalités</h2>${list(c.notableFigures, notable)}` : ''}
${list(otherFigures, (f) => link(`/figures/${slugOf(f)}`, f.name))}
${c.oralTraditions?.length ? `<h2>Traditions orales</h2>${list(c.oralTraditions)}` : ''}
${c.customs?.length ? `<h2>Coutumes</h2>${list(c.customs)}` : ''}
${c.festivals?.length ? `<h2>Fêtes et festivals</h2>${list(c.festivals)}` : ''}
${c.discoveryIntro ? `<h2>Par où commencer</h2><p>${esc(plain(c.discoveryIntro))}</p>` : ''}
${countryEvents.length ? `<h2>Dates clés</h2>${list(countryEvents, (e) => `${year(e.date) ?? ''} : ${link(`/timeline/${slugOf(e)}`, e.title)}`)}` : ''}
${countryFiches.length ? `<h2>Fiches de la base de connaissances</h2>${list(countryFiches, (f) => `${link(`/fiche/${f.ficheId}`, f.titre)} : ${esc(FICHE_TYPES_FR[f.type] || 'Fiche')}`)}` : ''}
${countryBlogs.length ? `<h2>À lire</h2>${list(countryBlogs, (b) => link(`/blog/${slugOf(b)}`, b.title))}` : ''}
${countryProverbs.length ? `<h2>Proverbes</h2>${list(countryProverbs.slice(0, 8), (p) => `<blockquote>${esc(p.text)}</blockquote>${p.explanation ? ` ${esc(p.explanation)}` : ''}`)}` : ''}
${seeAlso(countries, c, (o) => link(`/country/${o.id.toLowerCase()}`, countryName(o)))}`,
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
    lastmod: maxDate([...blogs, ...stories, ...collections]),
    priority: '0.9',
    body: `<h2>Articles</h2>${list(blogs, (b) => `${link(`/blog/${slugOf(b)}`, b.title)} : ${esc(clip(b.excerpt, 140))}`)}
<h2>Histoires</h2>${list(stories, (s) => `${link(`/stories/${slugOf(s)}`, s.title)} : ${esc(s.subtitle || clip(s.description, 120))}`)}
<h2>Dossiers</h2>${list(collections, (c) => `${link(`/collections/${slugOf(c)}`, c.title)} : ${esc(c.shortDescription || '')}`)}`,
  })
  for (const b of blogs) {
    const path_ = `/blog/${slugOf(b)}`
    const aliases_ = aliasOf('blog', b)
    pages.push({
      path: path_,
      aliases: aliases_,
      title: b.title,
      description: b.excerpt || b.content,
      image: b.image,
      type: 'article',
      lastmod: b.updatedAt,
      breadcrumbs: [home, { name: 'Récits', path: '/recits' }, { name: b.title, path: path_ }],
      priority: '0.8',
      body: `<p><em>${esc(b.category || '')} · ${b.kind === 'temoignage' ? 'Témoignage' : 'Article documenté'} · ${esc(b.author || SITE_NAME)}</em></p>\n${b.excerpt ? `<p><strong>${esc(plain(b.excerpt))}</strong></p>` : ''}\n${articleHtml(b.content)}\n${referencesHtml(b.references)}\n${(() => {
        const country = b.country && countries.find((c) => String(c.id).toUpperCase() === b.country)
        return country ? `<p>Pays : ${link(`/country/${country.id.toLowerCase()}`, countryName(country))}</p>` : ''
      })()}\n${seeAlso(blogs, b, (o) => link(`/blog/${slugOf(o)}`, o.title), 5)}`,
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
    lastmod: maxDate([...events, ...figures]),
    body: `<h2>Dates</h2>${list(events, (e) => `${year(e.date) ?? ''} : ${link(`/timeline/${slugOf(e)}`, e.title)}`)}
<h2>Personnalités</h2>${list(figures, (f) => `${link(`/figures/${slugOf(f)}`, f.name)} : ${esc(f.shortBiography || '')}`)}
<h2>Proverbes</h2>${list(
      proverbs,
      (p) => `<blockquote>${esc(p.text)}</blockquote> <small>${esc([p.countryName, p.language].filter(Boolean).join(' · '))}</small>${p.explanation ? `<p>${esc(p.explanation)}</p>` : ''}`,
    )}`,
  })
  const illustres = portraitsIllustres()
  for (const f of figures) {
    const path_ = `/figures/${slugOf(f)}`
    const aliases_ = aliasOf('figures', f)
    const born = year(f.birthDate)
    const died = year(f.deathDate)
    const span = born ? ` (${born}${died ? `–${died}` : ''})` : ''
    pages.push({
      path: path_,
      aliases: aliases_,
      title: `${f.name}${span}`,
      heading: f.name,
      description: f.shortBiography || f.biography,
      image: f.image || illustres.get(norm(f.name)),
      imageAlt: f.images?.find((i) => i.url === f.image)?.caption || f.name,
      type: 'profile',
      lastmod: f.updatedAt,
      breadcrumbs: [home, { name: 'Repères', path: '/reperes' }, { name: f.name, path: path_ }],
      priority: '0.7',
      body: `<p><strong>${esc(f.shortBiography || '')}</strong></p>
${paragraphs(f.biography, 20)}
${f.achievements?.length ? `<h2>Réalisations</h2>${list(f.achievements.map((a) => (typeof a === 'string' ? a : a?.title || a?.description || '')).filter(Boolean))}` : ''}
${countryOfFigure.get(String(f._id)) ? `<p>Pays : ${link(`/country/${countryOfFigure.get(String(f._id)).id.toLowerCase()}`, countryName(countryOfFigure.get(String(f._id))))}</p>` : ''}
${seeAlso(figures, f, (o) => link(`/figures/${slugOf(o)}`, o.name))}`,
      jsonLd: {
        '@type': 'Person',
        name: f.name,
        alternateName: f.nameNative || undefined,
        description: clip(f.shortBiography || f.biography, 300),
        image: f.image ? absolute(f.image) : undefined,
        birthPlace: f.birthPlace?.location ? { '@type': 'Place', name: f.birthPlace.location } : undefined,
        birthDate: born && !born.includes('av.') ? isoDate(f.birthDate)?.slice(0, 10) : undefined,
        deathDate: died && !died.includes('av.') ? isoDate(f.deathDate)?.slice(0, 10) : undefined,
        nationality: countryOfFigure.get(String(f._id)) ? { '@type': 'Country', name: countryName(countryOfFigure.get(String(f._id))) } : undefined,
        url: absolute(path_),
      },
    })
  }

  for (const s of stories) {
    const path_ = `/stories/${slugOf(s)}`
    const aliases_ = aliasOf('stories', s)
    pages.push({
      path: path_,
      aliases: aliases_,
      title: s.subtitle ? `${s.title} : ${s.subtitle}` : s.title,
      heading: s.title,
      description: s.description,
      image: s.coverImage,
      type: 'article',
      lastmod: s.updatedAt,
      breadcrumbs: [home, { name: 'Récits', path: '/recits' }, { name: s.title, path: path_ }],
      priority: '0.7',
      body: `<p>${esc(plain(s.description))}</p>
${(s.chapters || []).map((ch) => `<h2>${esc(ch.title || '')}</h2>\n${paragraphs(ch.content, 20)}`).join('\n')}
${seeAlso(stories, s, (o) => link(`/stories/${slugOf(o)}`, o.title), 5)}`,
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
    const path_ = `/collections/${slugOf(c)}`
    const aliases_ = aliasOf('collections', c)
    pages.push({
      path: path_,
      aliases: aliases_,
      title: c.title,
      description: c.shortDescription || c.description,
      image: c.coverImage,
      lastmod: c.updatedAt,
      breadcrumbs: [home, { name: 'Récits', path: '/recits' }, { name: c.title, path: path_ }],
      priority: '0.6',
      body: `${paragraphs(c.description, 10)}\n${seeAlso(collections, c, (o) => link(`/collections/${slugOf(o)}`, o.title), 5)}`,
      jsonLd: { '@type': 'CollectionPage', name: c.title, description: clip(c.shortDescription || c.description, 300), url: absolute(path_) },
    })
  }

  for (const e of events) {
    const path_ = `/timeline/${slugOf(e)}`
    const aliases_ = aliasOf('timeline', e)
    const y = year(e.date)
    pages.push({
      path: path_,
      aliases: aliases_,
      title: y ? `${e.title} (${y})` : e.title,
      heading: e.title,
      description: e.shortDescription || e.description,
      image: e.images?.[0],
      lastmod: e.updatedAt,
      breadcrumbs: [home, { name: 'Repères', path: '/reperes' }, { name: e.title, path: path_ }],
      priority: '0.6',
      body: `<p><em>${esc(e.period || '')}${e.location?.region ? ` · ${esc(e.location.region)}` : ''}${y ? ` · ${y}` : ''}</em></p>\n${paragraphs(e.description, 10)}\n${seeAlso(events, e, (o) => `${year(o.date) ?? ''} : ${link(`/timeline/${slugOf(o)}`, o.title)}`)}`,
    })
  }

  /* Fiches publiées de la base de connaissances */
  for (const f of fiches) {
    const path_ = `/fiche/${f.ficheId}`
    const country = countries.find((c) => String(c.id).toUpperCase() === String(f.pays).toUpperCase())
    const kind = FICHE_TYPES_FR[f.type] || 'Fiche'
    const crumbs = country
      ? [home, { name: 'Explorer', path: '/map' }, { name: countryName(country), path: `/country/${country.id.toLowerCase()}` }, { name: f.titre, path: path_ }]
      : [home, { name: f.titre, path: path_ }]
    pages.push({
      path: path_,
      title: country ? `${f.titre} (${countryName(country)})` : f.titre,
      heading: f.titre,
      description: f.description,
      type: f.type === 'personnalite' ? 'profile' : 'article',
      lastmod: f.updatedAt,
      breadcrumbs: crumbs,
      priority: '0.6',
      body: `<p><em>${esc(joinPlain([kind, f.periode, country && countryName(country)]))}</em></p>
${paragraphs(f.description, 10)}
${f.verification?.etat === 'verifie' ? '<p>Fiche vérifiée par l’équipe MonBaobab.</p>' : ''}
${(f.sources || []).length ? `<h2>Sources</h2><ol>${f.sources.map((src) => `<li>${esc(src.titre)}${src.institution ? `, ${esc(src.institution)}` : ''}${src.url ? ` <a href="${esc(src.url)}" rel="nofollow">${esc(src.url)}</a>` : ''}</li>`).join('')}</ol>` : ''}
${country ? `<p>Pays : ${link(`/country/${country.id.toLowerCase()}`, countryName(country))}</p>` : ''}`,
      jsonLd:
        f.type === 'personnalite'
          ? { '@type': 'Person', name: f.titre, description: clip(f.description, 300), url: absolute(path_), sameAs: f.wikidata ? [`https://www.wikidata.org/wiki/${f.wikidata}`] : undefined }
          : {
              '@type': 'Article',
              headline: clip(f.titre, 110),
              description: clip(f.description, 300),
              about: f.wikidata ? { '@id': `https://www.wikidata.org/wiki/${f.wikidata}` } : undefined,
              citation: (f.sources || []).map((src) => src.url || src.titre).filter(Boolean),
              dateModified: isoDate(f.updatedAt),
              publisher: { '@id': `${SITE}/#organization` },
              inLanguage: 'fr',
              mainEntityOfPage: absolute(path_),
            },
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

/** Page servie par nginx (statut 404) pour les adresses inconnues ; React y affiche sa page introuvable */
const notFoundPage = () => ({
  path: '/404',
  title: 'Page introuvable',
  noindex: true,
  canonical: false,
  body: `<p>Cette page n’existe pas ou a été déplacée.</p>${list(
    [
      ['/', 'Accueil'],
      ['/map', 'Explorer les pays'],
      ['/recits', 'Récits'],
      ['/reperes', 'Repères'],
    ],
    ([href, label]) => link(href, label),
  )}`,
})

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
    <priority>${page.priority || '0.5'}</priority>${page.image ? `
    <image:image><image:loc>${esc(absolute(page.image))}</image:loc></image:image>` : ''}
  </url>`,
    )
    .join('\n')
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`,
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
    // Anciennes adresses (/figures/<identifiant>) : page de redirection immédiate vers l'adresse lisible.
    // Les liens déjà partagés continuent de marcher, et Google transfère le référencement.
    for (const alias of page.aliases || []) {
      fs.writeFileSync(
        path.join(DIST, `${alias}.html`),
        `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(page.title || SITE_NAME)}</title><link rel="canonical" href="${esc(absolute(page.path))}"><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0; url=${esc(page.path)}"></head><body><p><a href="${esc(page.path)}">${esc(page.title || SITE_NAME)}</a></p></body></html>\n`,
      )
    }
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
      Fiche: await load('Fiche'),
    }
  }

  try {
    const pages = await collectPages(models)
    writePages(shell, pages)
    fs.writeFileSync(path.join(DIST, '404.html'), renderPage(shell, notFoundPage()))
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
      console[SOFT ? 'warn' : 'error'](`SEO : génération ${SOFT ? 'ignorée' : 'échouée'} : ${error.message}`)
      process.exit(SOFT ? 0 : 1)
    })
}
