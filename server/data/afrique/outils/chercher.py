#!/usr/bin/env python3
"""Recherche de pistes dans Wikipédia (fr, en) et Wikidata.

    python3 -I chercher.py "requête" [--langue fr|en] [--wikidata]

Affiche titres et URL : ce sont des pistes à ouvrir (lire.py), pas des sources en soi.
Les références institutionnelles se trouvent souvent dans les notes des articles.
"""
import json
import sys
import urllib.parse
import urllib.request

UA = 'MonBaobab-donnees/1.0 (plateforme culturelle, recherche de references)'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read())


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    q = args[0]
    langue = args[args.index('--langue') + 1] if '--langue' in args else 'fr'
    if '--wikidata' in args:
        data = get('https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode(
            {'action': 'wbsearchentities', 'search': q, 'language': langue, 'uselang': langue, 'limit': 10, 'format': 'json'}))
        for e in data.get('search', []):
            print(f"{e['id']}\t{e.get('label', '')}\t{e.get('description', '')}\thttps://www.wikidata.org/wiki/{e['id']}")
        return
    data = get(f'https://{langue}.wikipedia.org/w/api.php?' + urllib.parse.urlencode(
        {'action': 'query', 'list': 'search', 'srsearch': q, 'srlimit': 10, 'format': 'json'}))
    for r in data.get('query', {}).get('search', []):
        titre = r['title']
        print(f"{titre}\thttps://{langue}.wikipedia.org/wiki/{urllib.parse.quote(titre.replace(' ', '_'))}")


if __name__ == '__main__':
    main()
