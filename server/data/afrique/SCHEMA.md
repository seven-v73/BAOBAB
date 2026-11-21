# Base de connaissances MonBaobab — schéma des fiches pays

Copie maîtresse des données culturelles de MonBaobab, **versionnée dans ce dépôt** : la plateforme ne dépend d'aucun
service tiers pour ses contenus. Chaque pays a un fichier `pays/<CODE>.json` (code ISO 3166-1 alpha-2). Les graines
`graines/<CODE>.json` sont collectées automatiquement (Wikidata, UNESCO) et servent de point de départ.

## Principes

1. **Tout est sourcé et vérifiable** : chaque élément cite au moins une source de la liste `sources` du fichier, que
   l'auteur de la fiche a réellement ouverte. Pas de lien inventé, pas d'affirmation sans source.
2. **Sources prioritaires** : UNESCO (whc, ich, unesdoc), AODL, musées nationaux et institutions africaines, archives
   nationales, universités, revues scientifiques en accès libre (OpenEdition, Persée, Cairn libre, JSTOR open),
   Glottolog, Wikidata (identifiants). Wikipédia est admise comme source secondaire, jamais seule pour un fait sensible.
3. **Rédigé par MonBaobab** : les descriptions sont écrites en français, dans nos mots (2 à 5 phrases), jamais
   copiées. Les citations exactes sont courtes et entre guillemets avec leur source.
4. **Droits séparés** : la donnée (notice) et l'image ont chacune leur licence. Image uniquement depuis Wikimedia
   Commons sous licence libre (CC0, CC BY, CC BY-SA, domaine public), avec crédit. Sinon : pas d'image, lien vers la notice.
5. **Pluralité** : on nomme les peuples, langues, villes, époques et pratiques ; on évite « l'Afrique » comme bloc,
   les clichés et le vocabulaire colonial (« tribu », « primitif », « fétiche »…) sauf en citation datée.
6. **Contenus sensibles** : rites, objets sacrés, savoirs initiatiques, restes humains → `sensible: true` et une note ;
   ces fiches attendent une validation par la communauté ou une institution partenaire avant publication.
7. **Cycle de validation** : `brouillon` → `en_revue` → `valide_expert` → `publie`. Les fiches produites par la
   collecte arrivent en `en_revue`. Un retrait demandé par une communauté ou un ayant droit passe à `retire`.

## Structure d'un fichier pays

```jsonc
{
  "code": "ML", "nom": "Mali", "region": "ouest", "wikidata": "Q912",
  "maj": "2026-11-21",                     // date de dernière vérification
  "pays": {
    "nom_officiel": "République du Mali", "capitale": "Bamako",
    "langues_officielles": ["…"], "langues_nationales": ["…"],
    "population": { "valeur": 22395489, "annee": 2022, "source": "S1" },
    "superficie_km2": 1241231, "monnaie": "Franc CFA (UEMOA)",
    "resume": "…", "sources": ["S1", "S2"]
  },
  "langues":      [ /* Langue */ ],
  "peuples":      [ /* Peuple ou communauté */ ],
  "sites":        [ /* Lieu ou site */ ],
  "traditions":   [ /* Tradition ou pratique */ ],
  "personnalites":[ /* Personne */ ],
  "evenements":   [ /* Événement ou période */ ],
  "oeuvres":      [ /* Œuvre ou objet */ ],
  "proverbes":    [ /* Proverbe publié */ ],
  "sources":      [ /* Source */ ]
}
```

### Champs communs à chaque élément

| Champ | Type | Obligatoire | Note |
|---|---|---|---|
| `id` | chaîne | oui | `<CODE>-<type>-<slug>`, ex. `ML-site-djenne` |
| `nom` ou `titre` | chaîne | oui | en français ; `nom_local` pour la forme locale |
| `description` | chaîne | oui | 2 à 5 phrases, nos mots |
| `regions` | chaînes | non | régions ou villes du pays |
| `langues` | chaînes | non | langues concernées |
| `periode` | chaîne | non | « XIVe siècle », « depuis 1960 »… |
| `sources` | identifiants | oui | renvoient à `sources[].id` |
| `wikidata` | QID | si existe | identifiant pivot pour relier les fiches |
| `image` | objet | non | `{ url, page_commons, auteur, licence }` Commons uniquement |
| `sensible` | booléen | non | voir principe 6, avec `note_sensibilite` |
| `statut` | chaîne | oui | `en_revue` à la collecte |
| `verification` | objet | oui | `{ etat: "a_verifier" \| "verifie" \| "corrige", le, note }` |

### Champs propres à chaque type

- **Langue** : `famille`, `glottocode`, `statut_linguistique` (officielle, nationale, véhiculaire, régionale, minoritaire, menacée ; `statut` reste le cycle de validation), `locuteurs` `{valeur, annee, source}`, `ecritures` (latin, ajami, n'ko, tifinagh…).
- **Peuple / communauté** : `langues`, `regions`, `pays_partages` (codes ISO), `organisation`, `activites`.
- **Site** : `type` (patrimoine_mondial, liste_indicative, ville_historique, site_archeologique, site_naturel, musee, monument, lieu_de_memoire), `unesco_id`, `inscription` (année), `coordonnees` `{lat, lng}`.
- **Tradition** : `categorie` (musique, danse, rite, artisanat, textile, cuisine, oralite, savoir, fete, jeu_sport, architecture), `nom_local`, `communautes`, `unesco` `{liste, id, annee, url}` ou `null`, `transmission` (vivante, fragile, menacée, revitalisée).
- **Personne** : `naissance` `{date, lieu}`, `deces` `{date, lieu}`, `roles`, `domaines`, `epoque`.
- **Événement** : `date` (ISO 8601 ; avant J.-C. en numérotation astronomique : 814 av. J.-C. → `-000813-01-01`), `date_affichee` (« 814 av. J.-C. »), `precision` (jour, mois, annee, siecle), `fin`, `acteurs`.
- **Œuvre / objet** : `type` (masque, sculpture, textile, bijou, manuscrit, instrument, architecture, livre, film, musique, peinture), `createur` ou `communaute`, `materiaux`, `institution` (détentrice), `numero_inventaire`, `url_notice`, `droits`.
- **Proverbe** : `texte_original`, `langue`, `traduction` (française), `sens`, `publication` (référence complète : auteur, titre, éditeur, année, page). Un proverbe sans publication vérifiable n'est pas retenu.
- **Source** : `id` (`S1`, `S2`…), `titre`, `institution`, `auteur`, `annee`, `url`, `type` (institution, archive, musee, unesco, universite, article_scientifique, livre, base_de_donnees, encyclopedie, presse), `licence` (CC0, CC BY, CC BY-SA, « tous droits réservés »…), `consulte_le` (AAAA-MM-JJ).

`outils/verifier.mjs` contrôle chaque fichier
(schéma, références de sources, liens qui répondent, identifiants Wikidata existants, dates) et produit un rapport.
