#!/usr/bin/env python3
"""Lit une page web et affiche son texte lisible (titre, URL finale, statut).

    python3 -I lire.py URL [--max 12000] [--debut 0]

Sert à vérifier qu'une source dit bien ce qu'on lui fait dire. Bibliothèque standard uniquement.
"""
import html
import re
import sys
import urllib.request
from html.parser import HTMLParser

UA = 'MonBaobab-donnees/1.0 (plateforme culturelle, verification de references publiques)'


class Texte(HTMLParser):
    SAUTER = {'script', 'style', 'noscript', 'svg', 'nav', 'footer', 'header', 'form', 'iframe'}
    BLOCS = {'p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'tr', 'br', 'section', 'article', 'dd', 'dt', 'blockquote'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.skip, self.title, self.in_title = [], 0, '', False

    def handle_starttag(self, tag, attrs):
        if tag in self.SAUTER:
            self.skip += 1
        if tag == 'title':
            self.in_title = True
        if tag in self.BLOCS:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in self.SAUTER and self.skip:
            self.skip -= 1
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        elif not self.skip:
            self.parts.append(data)


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    url = args[0]
    maxi = int(args[args.index('--max') + 1]) if '--max' in args else 12000
    debut = int(args[args.index('--debut') + 1]) if '--debut' in args else 0
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'fr,en;q=0.8'})
    try:
        with urllib.request.urlopen(req, timeout=40) as res:
            brut = res.read(4_000_000)
            charset = res.headers.get_content_charset() or 'utf-8'
            final, statut, ctype = res.geturl(), res.status, res.headers.get('Content-Type', '')
    except Exception as exc:  # noqa: BLE001
        print(f'ECHEC {url} : {exc}')
        sys.exit(2)
    print(f'STATUT {statut}\nURL {final}\nTYPE {ctype}')
    if 'html' not in ctype and 'xml' not in ctype:
        print(brut[:maxi].decode(charset, 'replace'))
        return
    p = Texte()
    p.feed(brut.decode(charset, 'replace'))
    texte = re.sub(r'[ \t]+', ' ', html.unescape(''.join(p.parts)))
    texte = re.sub(r'\n\s*\n+', '\n', texte).strip()
    print(f'TITRE {p.title.strip()}\nLONGUEUR {len(texte)}\n---')
    print(texte[debut:debut + maxi])


if __name__ == '__main__':
    main()
