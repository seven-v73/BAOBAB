import { Fragment } from 'react'
import type { ReactNode } from 'react'

/**
 * Rendu sûr du texte des articles (aucun HTML brut n'est interprété).
 *
 * Syntaxe acceptée — volontairement simple pour les contributeurs :
 *   ## Titre de partie        ### Sous-titre
 *   > Citation mise en exergue
 *   - élément de liste        1. élément numéroté
 *   *italique*   **gras**   [1] appel de note (renvoie à la référence n°1)
 *   Paragraphes séparés par une ligne vide.
 */

export interface ArticleReference {
  title: string
  author?: string
  publisher?: string
  year?: number | null
  url?: string
  note?: string
}

export type Block =
  | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string; id?: string }
  | { type: 'ul' | 'ol'; items: string[] }

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

export const parseArticle = (content: string): Block[] => {
  const blocks: Block[] = []
  const used = new Set<string>()
  const chunks = content.replace(/\r\n/g, '\n').split(/\n{2,}/)

  for (const raw of chunks) {
    const chunk = raw.trim()
    if (!chunk) continue
    const lines = chunk.split('\n').map((line) => line.trim())

    if (/^#{2,3}\s/.test(chunk) && lines.length === 1) {
      const level = chunk.startsWith('###') ? 'h3' : 'h2'
      const text = chunk.replace(/^#{2,3}\s+/, '')
      let id = slugify(text) || `partie-${blocks.length}`
      while (used.has(id)) id = `${id}-2`
      used.add(id)
      blocks.push({ type: level, text, id })
    } else if (lines.every((line) => line.startsWith('>'))) {
      blocks.push({ type: 'quote', text: lines.map((line) => line.replace(/^>\s?/, '')).join(' ') })
    } else if (lines.every((line) => /^[-•]\s+/.test(line))) {
      blocks.push({ type: 'ul', items: lines.map((line) => line.replace(/^[-•]\s+/, '')) })
    } else if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      blocks.push({ type: 'ol', items: lines.map((line) => line.replace(/^\d+[.)]\s+/, '')) })
    } else if (/^#{2,3}\s/.test(lines[0])) {
      // Titre suivi directement d'un paragraphe (sans ligne vide)
      const text = lines[0].replace(/^#{2,3}\s+/, '')
      let id = slugify(text) || `partie-${blocks.length}`
      while (used.has(id)) id = `${id}-2`
      used.add(id)
      blocks.push({ type: lines[0].startsWith('###') ? 'h3' : 'h2', text, id })
      blocks.push({ type: 'p', text: lines.slice(1).join(' ') })
    } else {
      blocks.push({ type: 'p', text: lines.join(' ') })
    }
  }
  return blocks
}

/** Texte brut, sans syntaxe (pour les extraits, le temps de lecture…) */
export const plainText = (content: string) =>
  content
    .replace(/^#{2,3}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*?|\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const readingMinutes = (content: string) => Math.max(1, Math.round(plainText(content).split(' ').length / 220))

/** Mise en forme en ligne : **gras**, *italique*, [n] → appel de note */
const renderInline = (text: string, references: ArticleReference[] | undefined, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g
  let last = 0
  let match: RegExpExecArray | null
  let index = 0
  while ((match = pattern.exec(text))) {
    const token = match[0]
    if (match.index > last) {
      // Pas d'espace avant un appel de note (« tissu¹ », pas « tissu ¹ »)
      const before = text.slice(last, match.index)
      nodes.push(/^\[\d+\]$/.test(token) ? before.replace(/\s+$/, '') : before)
    }
    const key = `${keyPrefix}-${index++}`
    if (token.startsWith('**')) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    else if (token.startsWith('*')) nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    else {
      const n = Number(token.slice(1, -1))
      const ref = references?.[n - 1]
      nodes.push(
        ref ? (
          <sup key={key} className="ab-cite">
            <a href={`#ref-${n}`} aria-label={`Référence ${n} : ${ref.title}`} data-tooltip={ref.title}>
              {n}
            </a>
          </sup>
        ) : (
          <sup key={key} className="ab-cite is-missing" title="Référence introuvable">
            {n}
          </sup>
        ),
      )
    }
    last = match.index + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

interface ArticleBodyProps {
  content: string
  references?: ArticleReference[]
  /** Ajoute une lettrine au premier paragraphe */
  dropCap?: boolean
}

export const ArticleBody = ({ content, references, dropCap = true }: ArticleBodyProps) => {
  const blocks = parseArticle(content)
  let firstParagraph = dropCap

  return (
    <div className="ab">
      {blocks.map((block, i) => {
        const key = `b${i}`
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={key} id={block.id} className="ab-h2" data-reveal>
                {renderInline(block.text, references, key)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={key} id={block.id} className="ab-h3" data-reveal>
                {renderInline(block.text, references, key)}
              </h3>
            )
          case 'quote':
            return (
              <blockquote key={key} className="ab-quote" data-reveal>
                <p>{renderInline(block.text, references, key)}</p>
              </blockquote>
            )
          case 'ul':
          case 'ol': {
            const List = block.type
            return (
              <List key={key} className="ab-list" data-reveal>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, references, `${key}-${j}`)}</li>
                ))}
              </List>
            )
          }
          default: {
            const isFirst = firstParagraph
            firstParagraph = false
            return (
              <p key={key} className={isFirst ? 'ab-p ab-dropcap' : 'ab-p'} data-reveal>
                {renderInline(block.text, references, key)}
              </p>
            )
          }
        }
      })}
    </div>
  )
}

/** Liste des références numérotées (fin d'article) */
export const ReferenceList = ({ references }: { references: ArticleReference[] }) => (
  <ol className="ab-refs">
    {references.map((ref, i) => (
      <li key={i} id={`ref-${i + 1}`}>
        <span className="ab-refs__title">{ref.title}</span>
        {(ref.author || ref.publisher || ref.year) && (
          <span className="ab-refs__meta">
            {[ref.author, ref.publisher, ref.year].filter(Boolean).map((part, j) => (
              <Fragment key={j}>
                {j > 0 && ' · '}
                {part}
              </Fragment>
            ))}
          </span>
        )}
        {ref.note && <span className="ab-refs__note">{ref.note}</span>}
        {ref.url && (
          <a href={ref.url} target="_blank" rel="noopener noreferrer nofollow" className="ab-refs__link">
            {ref.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]} ↗
          </a>
        )}
      </li>
    ))}
  </ol>
)
