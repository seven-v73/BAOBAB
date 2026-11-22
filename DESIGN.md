# DESIGN.md : MonBaobab (site web)

Référence de design du site **monbaobab.com**. Source de vérité : [`Design/MonBaobab Brand Guideline.pdf`](Design/MonBaobab%20Brand%20Guideline.pdf) (Branding guideline 2026, O. Y. Barnabas). Ce document traduit la charte en règles applicables au code. En cas de conflit, la charte prime ; les règles marquées **[web]** sont des compléments propres au site, absents de la charte.

> **Style officiel de MonBaobab.** Ce document décrit le design en ligne sur monbaobab.com depuis le 21 novembre 2026 (refonte d'après les maquettes Figma). Toute nouvelle page, tout nouveau composant et tout support de la marque le suivent : jetons de couleur et de police (§12), composants (§9) et ton éditorial (§1). On ne réintroduit pas l'ancien style (or `#d4af37`, thème sombre par défaut, Nunito Sans, ombres lourdes).

---

## 1. Essence de la marque

**MonBaobab, l'Afrique à découvrir autrement.**
Un atlas culturel africain : récits, atlas, patrimoine et savoir-faire des 55 pays, présentés de façon accessible, contextualisée et contemporaine.

| Principe | Ce que ça implique pour l'interface |
|---|---|
| Explorer sans frontières | La navigation invite à la découverte (carte, pays, thèmes), jamais une seule porte d'entrée. |
| Transmettre pour faire vivre | Le contenu est roi : lisibilité, hiérarchie claire, sources visibles. |
| Valoriser la diversité | Chaque pays/territoire peut avoir sa couleur d'accent (voir logotype des territoires). |
| Raconter autrement | Pas de clichés visuels (savane au coucher de soleil, masques génériques, motifs « tribaux » décoratifs). |

**Personnalité** : curieuse, accessible, ouverte, contemporaine, humaine.

**Direction du site : « l'atlas vivant ».** Chaque partie du site emprunte un objet familier de l'exploration et le détourne : la carte devient la page, les courbes de niveau habillent les grandes surfaces vertes, le symbole de la marque devient une fenêtre sur une photo. On évite la landing classique (titre, image, trois cartes, bouton). L'audace passe par la mise en scène et l'interaction, jamais par une sortie de la charte (couleurs, polices, logo).
→ Interface **claire, aérée, chaleureuse**. Pas de luxe doré, pas de « dark premium », pas d'effets tape-à-l'œil.

**Ton éditorial**
- Langage simple, vivant, engageant ; on évite le jargon de spécialiste.
- On parle de personnes et d'histoires, pas de « peuples » abstraits.
- Phrases d'accroche courtes, en minuscules de phrase, terminées par un point : *« Découvrez l'Afrique autrement. »*
- Accents et orthographe impeccables (les maquettes de la charte contiennent « Decouvrez » et « les richesse » : ne pas reproduire).
- On vouvoie partout (interface, formulaires, messages).
- **Sobriété** (relecture du 22/11/2026). Ce qui fait « texte généré » et qu'on n'écrit pas :
  - les superlatifs et l'emphase : « légendaire », « exceptionnel », « fascinant », « le plus riche de l'histoire », « véritable joyau », « perle de… » ;
  - les ouvertures en « Découvrez », « Explorez », « Plongez dans » ;
  - le registre de motivation (« puiser de la force », « une boussole pour la jeunesse ») ;
  - « l'Afrique » comme un bloc quand on parle d'un pays, d'un peuple ou d'une époque précise ;
  - les tirets cadratins (—) : on écrit avec des virgules, des parenthèses ou deux-points ;
  - les points d'exclamation dans les messages (« Article créé. », pas « Article créé avec succès ! ») ;
  - les Majuscules À Chaque Mot dans les titres ;
  - les emojis, et les icônes décoratives répétées en puce (une icône sert à agir ou à repérer un type, pas à orner chaque ligne) ;
  - la légende présentée comme un fait : on écrit « selon l'épopée », « selon al-Umari », et on date.

---

## 2. Logo

Le symbole a une double lecture : **un baobab abstrait** (ancrage, mémoire, transmission) et **un œil stylisé** (regard, curiosité, découverte). Il est accompagné de la signature typographique « Mon / Baobab » sur deux lignes.

### Fichiers (dans `public/`)

| Usage | Fichier |
|---|---|
| Logo principal (forêt + sauge) | `Logo/Fichier 3.svg` |
| Logo blanc (sur fond forêt / photo sombre) | `Logo/Fichier 7.svg` |
| Logo noir (monochrome) | `Logo/Fichier 8.svg` |
| Icône sauge | `Logo/Fichier 4.svg` |
| Icône blanche | `Logo/Fichier 13.svg` |
| Icône noire | `Logo/Fichier 12.svg` |
| Territoire : Côte d'Ivoire (orange désert) | `Logo/Fichier 11.svg` |
| Territoire : Burkina Faso (rouge terre cuite) | `Logo/Fichier 10.svg` |
| Territoire : Cap-Vert (bleu abysse) | `Logo/Fichier 9.svg` |

`public/LogoFiles/*` et `public/monbaobab-mark.svg` sont **obsolètes** (ancien vert `#057236`). Ne plus les utiliser. Les SVG de territoire contiennent un `<text>` en ZT Nature : vectoriser le texte ou s'assurer que la police est chargée.

Les SVG du kit colorent leurs formes via un bloc `<style>` interne. Certains outils (convertisseurs, aperçus) ignorent ce bloc et les affichent tout noirs : lire les `fill` dans le code plutôt que se fier à l'aperçu.

### Wordmark horizontal
Variante sur une seule ligne, symbole + « MonBaobab » accolé. Absente de la charte PDF, livrée seulement dans le kit :

| Version | Fichier |
|---|---|
| Blanc | `Design/Mon Baobab Branding/Logo de marque/Logo BAOBAB/Fichier 3 (2)@2x.png` |
| Noir | `Design/Mon Baobab Branding/Logo de marque/Logo BAOBAB/Fichier 4@2x.png` |

**[web]** Utile pour un en-tête compact ou mobile, où le logo sur deux lignes manque de hauteur. Il n'existe qu'en PNG blanc ou noir : demander au brand designer un SVG et une version couleur (forêt + sauge) avant de l'utiliser en production. Mêmes règles de zone de réserve et d'interdits que le logo principal.

### Versions autorisées
1. **Original** : symbole sauge + texte forêt, sur blanc/crème. À privilégier partout où c'est possible.
2. **Sur fond forêt** : symbole sauge + texte blanc.
3. **Sur fond sauge** : symbole blanc + texte forêt.
4. **Noir ou blanc** pur, seulement quand aucune version couleur n'est possible.

### Zone de réserve et taille
- Zone de protection = **hauteur d'un « B » de « Baobab »** sur les quatre côtés. Rien (texte, bord, autre élément) n'y entre.
- Proportions de construction : voir charte p.12 (rapports 1x, 2/3x, 1/3x, 1/6x). Toujours redimensionner de façon proportionnelle.
- **[web]** Taille minimale : logo complet ≥ **120 px** de large ; icône seule ≥ **24 px** (favicon 16/32 px toléré).

### Logotype des territoires
Le nom du pays s'ajoute sous « Baobab », en ZT Nature, dans une couleur secondaire de la palette. Valable sur tous les fonds, sauf ceux qui nuisent à la lisibilité. **[web]** Utilisable en en-tête des pages pays.

### Interdits
Ne pas : changer les couleurs · changer la police · supprimer « Mon » · appliquer effets, ombres ou dégradés · faire pivoter · déformer ou modifier les proportions · poser sur un fond non établi (ex. rose) · poser sur une photo ou texture qui gâche la lisibilité.

---

## 3. Couleurs

### Palette officielle

| Nom | Token | Hex | Pantone | Rôle |
|---|---|---|---|---|
| Vert forêt | `--brand-foret` | `#174123` | 2411 C | **Couleur principale.** Titres, texte fort, fonds d'accent, boutons primaires. |
| Vert sauge | `--brand-sauge` | `#77a162` | 2264 C | Symbole du logo, icônes (accent), illustrations, fonds doux. |
| Bleu turquoise minéral | `--brand-turquoise` | `#00a39a` | 3272 C | Touche secondaire. |
| Bleu abysse | `--brand-abysse` | `#1478a6` | 2185 C | Touche secondaire, info. |
| Jaune ambre | `--brand-ambre` | `#e2b52f` | 4017 C | Touche secondaire, mise en avant, fonds d'affiche. |
| Orange désert | `--brand-desert` | `#e87525` | 158 C | Touche secondaire. |
| Rouge terre cuite | `--brand-terre` | `#d94a3a` | 179 C | Touche secondaire, erreur. |
| Brun baobab | `--brand-brun` | `#75462e` | 7602 C | Touche secondaire, texte chaud. |

Neutres relevés dans la charte :

| Nom | Token | Hex | Usage |
|---|---|---|---|
| Crème | `--brand-creme` | `#f8f7f1` | **Fond dominant** des pages. |
| Blanc | `--brand-blanc` | `#ffffff` | Cartes, surfaces surélevées. |
| Vert pâle | `--brand-vert-pale` | `#f2f6f0` | Fonds de panneaux latéraux, sections alternées. |
| Encre | `--brand-encre` | `#111111` | Texte courant long (la charte utilise du noir pour le texte courant). |

### Proportions (charte p.22)
- **60 % crème/blanc** : de grandes surfaces claires pour des compositions propres.
- **26 % vert forêt** : l'identifiant principal de la marque.
- **≈ 2 % par couleur secondaire** : touches ponctuelles (pictos, éléments de texte jugés pertinents, mises en avant, catégories).

> Le texte de la charte p.22 parle de « blanc et bleu indigo » : c'est une coquille. Le visuel de la même page montre crème 60 % + vert forêt 26 %. On suit le visuel.

**Règle pratique** : un écran = fond clair + vert forêt + **une** couleur secondaire au plus. Jamais d'arc-en-ciel de la palette sur un même bloc. Jamais de dégradé entre couleurs de marque.

### Contrastes (WCAG 2.2)

| Couleur | Sur crème | Blanc dessus | Texte autorisé ? |
|---|---|---|---|
| Vert forêt | **10.8:1** | **11.6:1** | Oui, toutes tailles. |
| Brun baobab | **7.3:1** | **7.9:1** | Oui, toutes tailles. |
| Bleu abysse | **4.6:1** | **4.9:1** | Oui (liens, texte courant ≥ 16 px). |
| Rouge terre cuite | 3.9:1 | 4.2:1 | Grand texte (≥ 24 px ou 19 px gras) et éléments d'UI seulement. |
| Orange désert | 2.8:1 | 3.0:1 | Non pour le texte. Décor, pictos à côté d'un libellé. |
| Vert sauge | 2.8:1 | 3.0:1 | Non pour le texte. Décor, icônes accompagnées d'un libellé. |
| Turquoise | 2.9:1 | 3.1:1 | Non pour le texte. Décor. |
| Jaune ambre | 1.8:1 | 1.9:1 | **Jamais** en texte sur clair. En **fond**, avec texte forêt dessus (6.0:1). |

Conséquences :
- Les libellés de territoire sur fond clair (orange, rouge) sont du **grand texte** ou doublés d'un texte lisible ailleurs.
- Un bouton coloré secondaire porte un texte **forêt** (ambre, sauge) ou **blanc** (abysse, brun, forêt). Jamais de blanc sur ambre, sauge, turquoise ou orange.

### Couleurs d'état **[web]**

| État | Couleur | Note |
|---|---|---|
| Succès | `--brand-foret` (fond `--brand-vert-pale`) | |
| Info | `--brand-abysse` | |
| Avertissement | fond `--brand-ambre`, texte forêt | |
| Erreur | `--brand-terre` en bordure/icône, message en forêt ou encre | Le rouge seul n'est pas assez contrasté pour du petit texte. |

Ne jamais signaler un état par la couleur seule : toujours une icône et/ou un texte.

---

## 4. Typographie

| Rôle | Police | Usage |
|---|---|---|
| **Titres** | **GC Regain** | H1–H3, accroches, citations mises en avant, grands chiffres. |
| **Texte courant** | **ZT Nature** (variable) | Corps de texte, navigation, boutons, formulaires, H4–H6, légendes. Également la police de la signature du logo. |

La charte déconseille d'ajouter ou combiner d'autres polices. Pas de troisième famille (fini Nunito Sans / Source Serif 4).

> **Licence** : le PDF embarque `GCRegainDemo` (version démo). Acheter une licence web de GC Regain et de ZT Nature avant mise en production. Auto-héberger en `woff2` dans `public/fonts/` avec `font-display: swap`.

**Polices gratuites de remplacement**, en attendant les licences (Google Fonts, chargées dans `index.html`). Ce sont celles de la maquette Figma, qui fait foi :
- **Hepta Slab** 700/800 pour GC Regain (titres).
- **Hanken Grotesk** 400 à 700 pour ZT Nature (texte courant).

```css
--font-titre: 'Hepta Slab', 'Roboto Slab', Georgia, serif;
--font-texte: 'Hanken Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
```

Quand les licences arrivent : ajouter les `@font-face` de GC Regain et ZT Nature, et les placer en tête de ces deux piles.

### Échelle **[web]**

| Token | Taille | Interligne | Police / graisse |
|---|---|---|---|
| `--text-display` | `clamp(2.75rem, 6vw, 5rem)` | 1.05 | GC Regain 400 |
| `--text-h1` | `clamp(2.25rem, 4.5vw, 3.5rem)` | 1.1 | GC Regain 400 |
| `--text-h2` | `clamp(1.75rem, 3vw, 2.5rem)` | 1.15 | GC Regain 400 |
| `--text-h3` | `1.5rem` | 1.2 | GC Regain 400 |
| `--text-h4` | `1.25rem` | 1.3 | ZT Nature 700 |
| `--text-lead` | `1.25rem` | 1.5 | ZT Nature 400 |
| `--text-body` | `1rem` (16 px min) | 1.6 | ZT Nature 400 |
| `--text-small` | `0.875rem` | 1.5 | ZT Nature 400 |
| `--text-label` | `0.8125rem` | 1.3 | ZT Nature 600 |

Règles :
- Titres en **vert forêt**, casse de phrase (pas de TOUT EN CAPITALES), `text-wrap: balance`.
- Texte courant en encre ou forêt, largeur de ligne **60–75 caractères** (`max-width: 68ch`), `text-wrap: pretty`.
- Chiffres tabulaires (`font-variant-numeric: tabular-nums`) dans les tableaux, statistiques et prix.
- Graisses ZT Nature : 400 texte, 600 libellés, 700 emphase. Éviter les graisses fines (< 300) sous 24 px.

---

## 5. Iconographie

Style des pictogrammes de la charte (p.23) :
- **Contour (outline)**, trait régulier ≈ **2 px à 24 px**, extrémités et angles **arrondis**.
- **Bicolore** : forme principale en **vert forêt**, un détail d'accent en **vert sauge** (flèche, combiné, puce, pastille).
- Grille 24 × 24, pas de remplissage plein sauf petits détails.

Implémentation : `lucide-react` (déjà installé) correspond à ce style (`strokeWidth={2}`, `strokeLinecap="round"`). Couleur par défaut `--brand-foret` ; accent sauge réservé aux pictos illustratifs (sections, états vides), pas aux icônes de contrôle. Les SVG de la charte sont dans `public/Icons/`.

### Pictogrammes du kit (`public/Icons/`)

15 pictos, chacun en 3 variantes numérotées par blocs de 15 : **bicolore** forêt + sauge (14 à 28), **noir** (29 à 43), **blanc** (44 à 58). Une même icône a toujours 15 numéros d'écart d'une variante à l'autre. Chaque numéro existe en `.svg` et en `@2x.png`.

| Picto | Bicolore | Noir | Blanc |
|---|---|---|---|
| Mail | `Fichier 14` | `Fichier 29` | `Fichier 44` |
| Globe | `Fichier 15` | `Fichier 30` | `Fichier 45` |
| Pouce (j'aime) | `Fichier 16` | `Fichier 31` | `Fichier 46` |
| Envoyer dans une fenêtre | `Fichier 17` | `Fichier 32` | `Fichier 47` |
| Loupe (recherche) | `Fichier 18` | `Fichier 33` | `Fichier 48` |
| Partager (flèche vers le haut) | `Fichier 19` | `Fichier 34` | `Fichier 49` |
| Corbeille | `Fichier 20` | `Fichier 35` | `Fichier 50` |
| Historique | `Fichier 21` | `Fichier 36` | `Fichier 51` |
| Traduction | `Fichier 22` | `Fichier 37` | `Fichier 52` |
| Utilisateur | `Fichier 23` | `Fichier 38` | `Fichier 53` |
| Téléphone | `Fichier 24` | `Fichier 39` | `Fichier 54` |
| Cœur (favori) | `Fichier 25` | `Fichier 40` | `Fichier 55` |
| Télécharger | `Fichier 26` | `Fichier 41` | `Fichier 56` |
| Applications (grille) | `Fichier 27` | `Fichier 42` | `Fichier 57` |
| Image | `Fichier 28` | `Fichier 43` | `Fichier 58` |

Choix de la variante : bicolore sur fond clair, blanc sur fond forêt ou photo sombre, noir seulement en impression monochrome. Pouce (16), loupe (18) et cœur (25) sont entièrement en forêt dans la version « bicolore ». **[web]** Pour toute icône absente de cette liste, utiliser l'équivalent `lucide-react`.

Interdits : icônes pleines + contour mélangées, emojis comme icônes d'interface, filtres `brightness`/`contrast` sur les icônes.

---

## 6. Motifs de marque

Trois éléments graphiques, à utiliser avec parcimonie :

1. **Courbes de niveau (topographie)** : rappellent le relief et l'empreinte sur le territoire. Motif signature.
   - **Version vivante [web]** : composant `src/components/TopoField/TopoField.tsx` (canvas 2D, sans dépendance). Le relief dérive lentement et une colline se forme sous le curseur. Une courbe sur quatre est plus marquée, comme les courbes maîtresses d'une carte. Réservé au haut de la page d'accueil. Statique avec `prefers-reduced-motion`, en pause hors écran, allégé sur écran tactile.
   - `Motifs/Fichier 59.svg` (forêt + sauge), `61` (noir), `62` (blanc).
   - Sur fond forêt : traits blancs ou sauge à **8–15 % d'opacité** (cf. couverture de la charte).
   - Sur fond clair : traits forêt/sauge à faible opacité, ou pleine opacité dans une bande décorative (bas de section, bord d'image).
2. **Motif œil / goutte** : dérivé de l'icône, en répétition. `Motifs/Fichier 60.svg`. Pour fonds de bannières, pages vides, packaging ; jamais derrière du texte.
3. **Blocs obliques arrondis** : formes à grands rayons, bords inclinés, issues du symbole (cf. t-shirt sauge p.27). Apportent modernité et douceur aux visuels (héros, cartes de mise en avant).

Règles : un seul motif par section ; jamais sous du texte de lecture sans voile suffisant ; ne remplace pas le quadrillage technique actuel (`body::before`), qui est à supprimer.

---

## 7. Photographie

La charte annonce un chapitre « Style photographique » non livré ; règles déduites des visuels (palette p.21, affiches p.31) :
- **Réel et vivant** : paysages, matières, artisanat, personnes en situation. Lumière naturelle.
- Images qui **portent les couleurs de la palette** (forêt, kente ambre/rouge, désert, océan, baobab).
- Cadrages larges laissant de l'espace pour un titre (girafe sur ciel dégagé) ou image en bas de composition sous un aplat de couleur (affiche ambre).
- Personnes nommées et contextualisées quand c'est possible ; pas de banque d'images « Afrique générique ».
- Pas de filtres sépia/dorés, pas de vignettage.
- Texte sur photo : uniquement sur une zone calme ou avec un aplat forêt ; vérifier le contraste.
- Toujours un `alt` descriptif (lieu, sujet, contexte).

---

## 8. Mise en page

### Grille et espacements **[web]**
- Base **4 px** ; échelle : `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
- Conteneur max **1200 px** (contenu éditorial **720 px**), marges latérales `clamp(16px, 5vw, 48px)`.
- Beaucoup de blanc : sections espacées de **96–128 px** sur desktop, **64 px** sur mobile.
- Composition type de la charte : **panneau latéral vert pâle avec titre forêt + contenu sur blanc**. Bon modèle pour les pages de rubrique.

### Rayons **[web]**
Inspirés des formes arrondies du symbole.

| Token | Valeur | Usage |
|---|---|---|
| `--radius-sm` | 8 px | Champs, petits boutons, badges carrés. |
| `--radius-md` | 16 px | Cartes, images. |
| `--radius-lg` | 28 px | Blocs héros, panneaux de mise en avant. |
| `--radius-pill` | 999 px | Boutons, puces de filtre, tags. |

Rayons imbriqués concentriques : rayon intérieur = rayon extérieur − padding.

### Profondeur
L'identité est **plate**. Pas d'ombres portées marquées, pas de glassmorphism, pas de lueurs dorées.
- Séparer par la **couleur de fond** (crème / blanc / vert pâle) et des bordures fines `1px` forêt à 12 %.
- Ombre autorisée uniquement pour les éléments flottants (menus, modales) : `0 8px 24px rgb(23 65 35 / 0.10)`.

---

## 9. Composants

**Bouton primaire** : fond forêt, texte crème, `--radius-pill`, hauteur 44 px min, ZT Nature 600. Survol : fond `#0f2e18` (forêt assombri). Appui : `transform: scale(0.97)` dès `:active`. Focus : anneau 2 px forêt + décalage 2 px.
**Bouton secondaire** : contour 1.5 px forêt, texte forêt, fond transparent. Survol : fond vert pâle.
**Bouton d'accent** (rare, une fois par écran) : fond ambre, texte forêt.
**Lien** : bleu abysse ou forêt, souligné (`text-underline-offset: 0.2em`). Plus de liens dorés.

**Carte** : fond blanc sur page crème, `--radius-md`, bordure forêt 12 %, image en haut, titre GC Regain forêt, méta en ZT Nature small. Survol (souris uniquement, `@media (hover: hover) and (pointer: fine)`) : bordure forêt 30 % + légère translation (`translateY(-2px)`), pas d'ombre lourde. Les boutons ne se soulèvent pas au survol : seules les cartes le font.
**Carte pays / territoire** : bande ou tag dans la couleur secondaire attribuée au pays (cf. logotype des territoires).

**Champ de formulaire** : fond blanc, bordure forêt 20 %, `--radius-sm`, hauteur 44 px, libellé visible au-dessus (pas de placeholder seul). Focus : bordure forêt + anneau forêt. Erreur : bordure terre cuite + message avec icône.

**Barre du haut** : logo à gauche ; au centre, la navigation en **pilule** (Accueil, Explorer, Récits, Repères, Contribuer), fond vert pâle, élément actif sur pastille blanche ; à droite, un bouton rond de recherche (qui se déplie) et le bouton « Rejoindre » forêt (ou l'accès à Mon espace une fois connecté). Sur l'accueil, la barre se pose dans la carte verte du haut, pilule en verre. Sur mobile, logo + recherche + menu burger (morphose GSAP).
**Pages de connexion** (connexion, inscription, mot de passe oublié) : pages autonomes sans barre ni pied, formulaire à gauche (mini en-tête logo + « Retour au site »), grande photo légendée à droite en carte arrondie.
**Pied de page** : carte forêt arrondie (`--radius-lg`) détachée des bords, texte blanc, grand symbole en filigrane, logo blanc, accroche « L'Afrique à découvrir autrement. » et trois colonnes (Naviguer, Territoires, MonBaobab).

**Haut de la page d'accueil** : carte verte arrondie à courbes de niveau vivantes (maquette Figma « Landing MonBaobab »). Titre sur trois lignes, « autrement. » en ambre ; à droite, le grand symbole de la marque avec une photo de baobabs dans l'œil. La navigation se pose dans la carte, en verre. Boutons « Explorer l'atlas » (ambre) et « Lire les récits » (verre).

**Lecture pluriculturelle** (Récits, Repères et toute liste de contenus) :
- Chaque contenu affiche son **pays et sa région** (« Burkina Faso · Afrique de l'Ouest »), précédés d'un point de la couleur de sa région. Sans pays identifiable : « Tout le continent » ou « Afrique et monde ».
- **Une couleur secondaire par région**, en décor seulement (points, filets, fonds teintés) : Nord orange désert, Ouest ambre, Centre turquoise, Est abysse, Australe terre cuite (`REGION_COLORS`, `src/utils/afrique.ts`).
- **Filtre par région** en pastilles, visible aussi sur mobile, avec les compteurs. Une région vide reste affichée et invite à contribuer.
- Les listes **alternent les régions** (`interleaveByRegion`) : aucune région ne monopolise le haut de page.
- Proverbes : toujours la **langue et le pays d'origine** (« Proverbe mooré · Burkina Faso »).
- Années anciennes : « 2500 av. J.-C. » (`formatYear`). Une date au 1ᵉʳ janvier signale une année seule : pas de jour inventé.
- Contenu sans image : fond teinté de la couleur de sa région avec les courbes de niveau en filigrane ; personnalité sans portrait : ses initiales sur fond teinté, sans motif sous le texte.

**Tags / filtres** : `--radius-pill`, fond vert pâle, texte forêt ; actif : fond forêt, texte crème.
**Carte interactive (atlas)** : pays en sauge clair, survol/sélection forêt, frontières crème ; les accents secondaires servent à catégoriser (régions, thèmes), un par catégorie.

---

## 10. Mouvement **[web]**

Sobre et utile, au service de la découverte.
- Durées : 150 ms (survol, petits états), 250 ms (ouverture menus/panneaux), 400 ms max (transitions de page). Les sorties sont plus courtes que les entrées (environ 75 %).
- Courbe unique : `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, en entrée **et** en sortie. Jamais `ease-in` : il démarre lentement et rend l'interface molle.
- Retour au clic dès l'appui (`:active`), jamais seulement au relâchement.
- Animer `transform` et `opacity` uniquement. Transitions CSS plutôt que `@keyframes` pour tout ce qui peut être interrompu (menu ouvert puis refermé aussitôt).
- Effets de survol réservés aux appareils à souris : `@media (hover: hover) and (pointer: fine)`.
- GSAP est réservé aux mises en scène de la marque (titre de l'accueil, morphose du menu mobile). Le reste : transitions CSS.
- Animations continues autorisées seulement pour le décor génératif (topographie vivante), jamais pour le contenu, et toujours coupées par `prefers-reduced-motion`.
- Respecter `prefers-reduced-motion: reduce` (supprimer translations et parallaxe).
- Pas de scintillement doré, pas de rebonds, pas d'animations en boucle sur le contenu.

---

## 11. Accessibilité

- Contrastes : voir §3. Texte ≥ 4.5:1, grand texte et UI ≥ 3:1.
- Cibles tactiles ≥ 44 × 44 px.
- Focus toujours visible (anneau **forêt** 2 px + décalage 2 px), jamais `outline: none` sans remplacement. Pas d'anneau sauge : 2.8:1 sur crème, sous le minimum de 3:1 exigé pour un indicateur de focus.
- Structure de titres hiérarchique (un seul H1 par page).
- `lang="fr"` ; noms propres en langue locale avec `lang` approprié si besoin.
- Thème sombre **[web]** (optionnel, le thème clair est le thème par défaut de la marque) : fond `#0e2616`, surfaces forêt `#174123`, texte crème, accents ambre (6.0:1 sur forêt) ; sauge et orange réservés au grand texte/décor (3.9:1).

---

## 12. Jetons CSS de référence

À placer dans `src/index.css` à la place des variables actuelles. Les noms sémantiques `--color-*` existants sont conservés pour limiter la migration.

```css
:root {
  /* Palette de marque */
  --brand-foret: #174123;
  --brand-sauge: #77a162;
  --brand-turquoise: #00a39a;
  --brand-abysse: #1478a6;
  --brand-ambre: #e2b52f;
  --brand-desert: #e87525;
  --brand-terre: #d94a3a;
  --brand-brun: #75462e;
  --brand-creme: #f8f7f1;
  --brand-blanc: #ffffff;
  --brand-vert-pale: #f2f6f0;
  --brand-encre: #111111;

  /* Sémantique (thème clair, par défaut) */
  --color-bg: var(--brand-creme);
  --color-bg-secondary: var(--brand-vert-pale);
  --color-bg-card: var(--brand-blanc);
  --color-text: var(--brand-encre);
  --color-heading: var(--brand-foret);
  --color-text-muted: #4a5a4f;
  --color-primary: var(--brand-foret);
  --color-primary-hover: #0f2e18;
  --color-on-primary: var(--brand-creme);
  --color-accent: var(--brand-sauge);
  --color-link: var(--brand-abysse);
  --color-border: rgb(23 65 35 / 0.12);
  --color-border-strong: rgb(23 65 35 / 0.30);
  --color-focus: var(--brand-foret);
  --color-success: var(--brand-foret);
  --color-info: var(--brand-abysse);
  --color-warning: var(--brand-ambre);
  --color-danger: var(--brand-terre);

  /* Typo */
  --font-titre: 'Hepta Slab', 'Roboto Slab', Georgia, serif; /* GC Regain en tête quand la licence est prête */
  --font-texte: 'Hanken Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; /* idem ZT Nature */

  /* Formes */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 28px;
  --radius-pill: 999px;
  --shadow-float: 0 8px 24px rgb(23 65 35 / 0.10);

  /* Mouvement */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;

  /* Mise en page */
  --nav-h: 72px;
  --dock-space: 104px; /* place réservée en bas pour la boussole */
}
```

---

## 13. Migration depuis l'ancien style

Terminée le 21 novembre 2026 : toutes les pages (publiques, membres, administration) sont au style de la refonte.

Règles pour ne pas y revenir :
- **Aucune feuille globale de style** en dehors de `src/index.css`, qui ne contient que les jetons, la remise à zéro et deux utilitaires (`.sr-only`, `.container`). Le dossier `src/styles/` (or, dégradés, quadrillage, `!important` sur les boutons) a été supprimé : ne pas le recréer.
- **Pages de lecture** (article, histoire, dossier, date, personnalité, récit) : toujours le composant `Lecture` (`src/components/Lecture`), gabarit de la maquette « Récit ».
- **Listes** (Récits, Repères, Sources, Recherche) : intro + pastilles `TypeChips` + filtre par région + cartes blanches arrondies.
- **Boutons** : `.mbr-button` dans les pages, composant `Button` ailleurs ; jamais de dégradé ni d'ombre lourde.
- **Icônes** : `lucide-react` uniquement.
- Les anciennes variables (`--color-*`, `--space-*`, `--accent`…) sont rebranchées sur la charte dans `index.css` ; pour du code neuf, utiliser directement `--brand-*`.

---

## 14. Points ouverts dans la charte

À faire trancher par le brand designer :
1. **Taille minimale du logo** : la page 13 l'annonce sans donner de valeur (règle web provisoire en §2).
2. **Typographie principale** : le texte p.20 désigne ZT Nature comme « principale » alors que GC Regain est étiquetée « titres » et utilisée sur les affiches. Interprétation retenue : GC Regain titres, ZT Nature tout le reste.
3. **« Bleu indigo »** p.22 : coquille, le visuel montre le vert forêt.
4. **Style photographique** et **Explosions** : présents au sommaire, absents du document.
5. **Licences** GC Regain (fichier démo dans le PDF) et ZT Nature pour le web.
