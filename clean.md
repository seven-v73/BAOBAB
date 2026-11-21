# Grand ménage MonBaobab

> Audit du site actuel, fait le 19/11/2026. Objectif : passer d'un site qui fait 12 choses à moitié à un site qui en fait 4 bien.
> Le volume réel de contenu n'a pas été vérifié (API locale éteinte pendant l'audit). À contrôler en production avant de supprimer quoi que ce soit.

## Le cap

Le site se recentre sur ce que promet la maquette Figma validée : **l'Atlas, les Récits, le Patrimoine et la Contribution.**

Tout le reste sort de la navigation. « Mettre en pause » veut dire retirer de la nav et des routes, pas supprimer le code.

## Le constat

- **30 pages** pour une plateforme culturelle, plus une boutique, un réseau social, des quiz et un tableau de bord fourre-tout.
- **Les mêmes choses portent des noms différents.**
  - `/blog` s'appelle « Carnet de savoirs » dans le menu et « Récits et mémoire » en titre de page.
  - `/stories` s'appelle « Mémoires » dans la nav et « Récits et histoires » en titre de page.
  - « Comprendre » mène aux Collections.
  - Trois rubriques racontent des histoires, et le visiteur ne sait pas laquelle ouvrir.
- **La fiche pays est un labyrinthe** (`CountryDetail.tsx`, 1 679 lignes).
  - 7 onglets : Repères, Carte, Culture, Mémoire, Liens, Médias, Sources.
  - 4 blocs « Regarder, Écouter, Goûter, Transmettre ».
  - 4 boutons pour contribuer et 4 raccourcis.
- **Le tableau de bord mélange tout** (`Dashboard.tsx`, 3 017 lignes) : commandes, statistiques mensuelles, favoris, « À garder », écriture d'articles, gestion de produits, proverbes, lectures sauvegardées, progression et paramètres.
- **Le style est incohérent.**
  - L'accueil a le nouveau style.
  - Les pages intérieures gardent l'ancien bandeau en dégradé vert (« Boutique Africaine », « Carte interactive »).
  - Cause : 19 feuilles CSS globales empilées dans `src/styles/` (34 000 lignes de CSS au total, environ 350 `!important`). Elles se corrigent les unes les autres : `human-design`, `human-experience`, `premium-polish`, `production-ergonomics`, `contrast-system`, etc.

## Le tri

### Garder

| Quoi | Routes | Ce qui change |
|---|---|---|
| Carte et fiche pays | `/map`, `/country/:id` | La fiche pays passe à 4 onglets : Repères, Culture, Mémoire, Sources. Liens et Médias rentrent dans Culture ou Mémoire. Les blocs d'actions en double disparaissent. |
| Contribuer | `/contribute` | Reste dans la nav. C'est le seul canal de participation. |
| Sources | `/sources` | Sort de la nav. Lien depuis le pied de page et depuis chaque article. |
| Newsletter | | Déjà prévue dans la maquette (appel à l'action). |
| Équipe | | Section de l'accueil, déjà dans la maquette. |
| Recherche | `/search` | Reste dans la barre du haut. |
| Connexion, inscription, admin | `/login`, `/register`, `/admin` | Nécessaires au fonctionnement. |

### Fusionner

| Avant | Après | Comment |
|---|---|---|
| Carnet de savoirs (`/blog`), Mémoires (`/stories`), Collections (`/collections`) | **Récits** | Une seule rubrique, avec un filtre par type : article, témoignage, dossier. Les collections deviennent des dossiers. |
| Chronologies (`/timeline`), Personnalités (`/figures`), Proverbes (`/proverbs`) | **Repères** | Une seule page avec un filtre par type. Surtout, ces contenus sont rangés dans la fiche de chaque pays. |

### Réduire

| Quoi | Garder seulement |
|---|---|
| Tableau de bord (`/dashboard`) | Mon profil, mes contributions, mes lectures sauvegardées. L'écriture d'articles part dans l'admin. |

### Mettre en pause

Retirés de la nav et des routes. Le code reste en place pour plus tard.

| Quoi | Routes et fichiers | Pourquoi |
|---|---|---|
| Boutique | `/shop`, `/cart`, `/checkout`, `/orders/:id`, `AdminProducts`, coupons, avis, Stripe | Vide aujourd'hui, 6 pages et un admin de 1 000 lignes. L'audit `SECURITY.md` y a trouvé 3 failles de paiement. À rouvrir plus tard, sous forme de simples liens vers des artisans. |
| Cercles de mémoire | `/communities`, `/communities/create`, `/communities/:id` | Un réseau social demande de la modération et une audience. La participation passe par Contribuer. |
| Fil social | `/community` | Publications, likes, images, vidéos, PDF. Relié à aucun lien du site. |
| Quiz et progression | `/quizzes`, `/quizzes/:id`, route serveur `progress` | Ce sont des gadgets tant qu'il n'y a pas beaucoup de contenu. Le type « Quiz » sort aussi de la fiche pays. |
| Recommandations | route serveur `recommendations` | Pas utile à ce volume de contenu. |

### Jeter

| Quoi | Détail |
|---|---|
| 8 fichiers de pages morts | `src/pages/vitrine/Home.tsx`, `auth/Login.tsx`, `auth/Register.tsx`, `blog/Blog.tsx`, `blog/BlogPost.tsx`, `shop/Shop.tsx`, `shop/Cart.tsx`, `dashboard/Dashboard.tsx`. Importés nulle part. |
| Fil d'actualités de l'accueil | Section « L'Afrique qui se construit aujourd'hui ». L'accueil devient celui de la maquette Figma. |
| Les « Six portes » de l'accueil | Remplacées par les 4 portes de la maquette. |

## La nouvelle navigation

**Accueil · Explorer · Récits · Repères · Contribuer**

- Il ne reste plus assez de liens pour justifier le menu **Ressources**. Le menu déroulant dessiné dans Figma (composant « Menu/Ressources », cadres « Ressources ouvert » et « Menu ouvert ») est à retirer ou à remplacer.
- La nav Figma desktop et le menu mobile sont à mettre à jour avec ces 5 entrées.

## Visite avec le backend allumé (19/11/2026)

### Le contenu réel (base locale)

| Rubrique | Éléments | Verdict |
|---|---|---|
| Pays | 55 | Le socle. |
| Proverbes | 24 | Assez pour une rubrique. |
| Chronologie | 10 | Mince, mieux rangée dans les fiches pays. |
| Personnalités | 8 | Mince, idem. |
| Collections | 8 | À fondre dans Récits. |
| Quiz | 6 | Confirme la pause. |
| Récits (`/stories`) | 3 | Très mince. |
| Cercles | 1 | Confirme la pause. |
| Fil social (`/community`) | 1 publication | Confirme la pause. |
| Articles (`/blog`) | **0** | Ce que le site affiche est du contenu de secours codé en dur (`src/data/foundationContent.ts`). |
| Sources | **0** | Idem : les « 4 sources affichées » viennent du code, pas de la base. |
| Produits | 0 | Confirme la pause de la boutique. |
| Contributions | 0 | |

C'est la base locale : à recompter en production avant de couper.

### Ce qui ne va pas

1. **En local, le front ne parle pas au backend.** `vite.config.ts` n'a pas de proxy et il n'y a pas de `.env` : chaque appel `/api` reçoit la page HTML au lieu des données. Les pages tournent sur du contenu de secours ou restent vides. Il faut ajouter un proxy `/api` vers `http://localhost:3000` dans `vite.config.ts`.
2. **Du faux contenu se fait passer pour du vrai.** Avec 0 article et 0 source en base, le site affiche quand même des articles et « 4 sources affichées » sortis de `src/data/foundationContent.ts`. Pour une plateforme qui mise sur la vérification, c'est le plus gênant. Soit on importe ce contenu en base, soit on affiche un vrai état vide.
3. **La fiche pays tourne en rond.**
   - Elle fait 18 239 px de haut, soit 24 écrans sur desktop et 33 sur mobile.
   - Elle a 20 titres de section et 62 liens ou boutons.
   - Elle répète les mêmes champs dans une dizaine de blocs générés : « Ouagadougou » apparaît 38 fois, « Bronze de Ouagadougou » 15 fois, « Tô sauce gombo » 12 fois, « Salutations longues » 9 fois.
   - Les blocs « Fil de visite », « Commencer par », « Carnet de découverte », « Une journée imaginaire », « Carte mentale » et « Atelier du savoir » recyclent tous les mêmes 4 ou 5 infos (`src/data/countryDiscoveryDefaults.ts`, 1 413 lignes).
   - Trois sections servent seulement à choisir où aller : « Choisir quoi explorer maintenant », « Choisir une porte d'entrée », « Choisir une intention ».
   - Une jauge « Boussole MonBaobab 71 %, En construction » expose l'état interne au visiteur.
   - Données incomplètes : le Burkina Faso n'a que « Français » comme langue.
4. **Les pages de liste se ressemblent toutes et paraissent vides.** Récits, Collections, Chronologie et Personnalités utilisent le même gabarit : bandeau en dégradé, barre de filtres, cartes avec une image grise et un pictogramme. Il n'y a aucune image réelle sur ces pages.
5. **Trois cartes d'Afrique, trois styles.**
   - Accueil : carte sauge, dans la charte.
   - `/map` : carte politique multicolore avec drapeaux, hors charte.
   - Fiche pays : une « carte immersive » de plus.
6. **Les bandeaux changent de couleur d'une page à l'autre.** Vert foncé sur Récits, vert délavé sur Collections.
7. **Chaque changement de page floute tout l'écran** pendant 420 ms (`src/styles/page-transitions.css`). Ça donne une impression de lenteur.
8. **Requêtes en double.**
   - L'accueil appelle `/api/settings` 7 fois, parce que 10 composants appellent `fetchSettings()` sans partage.
   - En dev, les statistiques et les contenus à la une partent aussi en double.
9. **Le fil d'actualités de l'accueil est en anglais** (titres Africanews bruts) sur un site en français.
10. **Les dates de la chronologie sont fausses.** « Royaume d'Axoum » s'affiche « 1 janvier 100 » : une année seule est convertie en date précise.
11. **Sur mobile, la nav du bas n'a que des pictogrammes, sans libellés.** Sur desktop, le lien « Ressources » s'allume quand on est sur Chronologie, ce qui est normal mais peu lisible.

## Bugs vus pendant l'audit

- `/stories` reste bloqué sur « Chargement… » quand l'API ne répond pas.
- Sur `/collections`, la pastille active de la nav cache le libellé « Comprendre » pendant le chargement.
- Le titre de l'onglet (`index.html`) dit encore « Histoire, Culture et Produits Authentiques ».

## Ordre de travail proposé

1. **Brancher le front sur le backend en local** (proxy Vite), puis **vérifier le contenu en production.** Compter les articles, récits, collections, repères et produits. Une section vide se coupe sans débat. Décider du sort du contenu de secours de `foundationContent.ts` : l'importer en base ou le retirer.
2. **Mettre à jour Figma.** Nouvelle nav à 5 entrées, retrait du menu Ressources, et maquettes des pages Récits, Repères et fiche pays.
3. **Couper.** Supprimer les 8 fichiers morts, puis retirer de la nav et des routes la boutique, les cercles, le fil social et les quiz.
4. **Fusionner.** Créer Récits et Repères avec leurs filtres, et ajouter des redirections depuis les anciennes adresses (`/blog`, `/stories`, `/collections`, `/timeline`, `/figures`, `/proverbs`).
5. **Alléger la fiche pays et le tableau de bord.**
6. **Nettoyer le CSS.** Remplacer les 19 feuilles empilées par les variables et composants de la charte, page par page, en commençant par les pages gardées.
7. **Corriger les bugs** listés plus haut.
