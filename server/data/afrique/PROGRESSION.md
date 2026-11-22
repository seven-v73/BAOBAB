# Base de connaissances Afrique : suivi de la progression

> État au **22 novembre 2026**. Ce fichier sert à reprendre le travail plus tard.
> Le modèle des données est décrit dans [SCHEMA.md](SCHEMA.md).

## Où en est-on

- **33 pays sur 55** ont un fichier dans `pays/`. Tous passent `node outils/verifier.mjs` sans erreur (l'Égypte a 3 alertes).
- On compte **3 969 éléments** et **3 549 sources citées**. À l'import, cela donne **4 002 fiches** (une fiche « pays » de plus par pays).
- L'import a été testé sur une base jetable :
  - les 4 002 fiches sont créées avec le statut `en_revue` ;
  - relancer l'import ne crée pas de doublons (4 002 restent inchangées).
- **Vérification croisée.** Un second agent a relu les affirmations contre leurs sources pour le Sénégal seulement. Les 32 autres pays sont *recherchés mais pas encore contre-vérifiés* : leur `verification.etat` vaut `a_verifier`.
- **Rien n'est publié automatiquement.** Chaque fiche passe par l'admin (*Base de connaissances*) : relire, valider, puis publier. Une fiche sensible ne se publie qu'avec une note.

## Détail par pays

Colonnes : langues, peuples, sites, traditions, personnalités, événements, œuvres, proverbes. « Wiki » est la part des sources tirées de Wikipédia. « Sens. » est le nombre d'éléments marqués sensibles.

| Code | Pays | Région | Lang. | Peup. | Sites | Trad. | Pers. | Évén. | Œuvr. | Prov. | Total | Sources | Wiki | Sens. | Contre-vérif. |
|---|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|---|
| AO | Angola | Centre | 16 | 9 | 10 | 10 | 15 | 31 | 13 | 9 | **113** | 76 | 32 % | 24 | à faire |
| BF | Burkina Faso | Ouest | 19 | 11 | 11 | 14 | 15 | 30 | 13 | 0 | **113** | 96 | 7 % | 31 | à faire |
| BJ | Bénin | Ouest | 17 | 8 | 14 | 11 | 19 | 27 | 11 | 7 | **114** | 118 | 48 % | 26 | à faire |
| CD | RD Congo | Centre | 17 | 12 | 16 | 15 | 17 | 35 | 13 | 7 | **132** | 127 | 41 % | 32 | à faire |
| CF | Centrafrique | Centre | 17 | 8 | 11 | 10 | 15 | 32 | 9 | 1 | **103** | 86 | 26 % | 19 | à faire |
| CG | Congo | Centre | 13 | 9 | 10 | 12 | 22 | 32 | 14 | 9 | **121** | 102 | 33 % | 38 | à faire |
| CI | Côte d'Ivoire | Ouest | 16 | 11 | 15 | 14 | 18 | 31 | 15 | 0 | **120** | 122 | 31 % | 20 | à faire |
| CM | Cameroun | Centre | 16 | 10 | 12 | 14 | 15 | 32 | 13 | 0 | **112** | 112 | 29 % | 31 | à faire |
| CV | Cap-Vert | Ouest | 7 | 7 | 11 | 15 | 20 | 32 | 11 | 9 | **112** | 107 | 36 % | 22 | à faire |
| DJ | Djibouti | Est | 8 | 8 | 12 | 13 | 18 | 35 | 10 | 2 | **106** | 82 | 40 % | 9 | à faire |
| DZ | Algérie | Nord | 14 | 7 | 17 | 22 | 22 | 32 | 12 | 5 | **131** | 172 | 34 % | 26 | à faire |
| EG | Égypte | Nord | 11 | 8 | 17 | 19 | 24 | 34 | 12 | 7 | **132** | 130 | 19 % | 24 | à faire (3 alertes) |
| EH | Sahara occidental | Nord | 7 | 10 | 11 | 11 | 16 | 31 | 12 | 0 | **98** | 52 | 48 % | 55 | à faire |
| GA | Gabon | Centre | 15 | 10 | 12 | 11 | 21 | 32 | 14 | 3 | **118** | 128 | 35 % | 27 | à faire |
| GH | Ghana | Ouest | 16 | 11 | 11 | 16 | 18 | 35 | 10 | 11 | **128** | 133 | 31 % | 14 | à faire |
| GM | Gambie | Ouest | 13 | 9 | 14 | 13 | 17 | 32 | 11 | 8 | **117** | 107 | 10 % | 27 | à faire |
| GN | Guinée | Ouest | 19 | 14 | 12 | 12 | 20 | 35 | 12 | 0 | **124** | 85 | 5 % | 42 | à faire |
| GQ | Guinée équatoriale | Centre | 15 | 10 | 16 | 10 | 18 | 33 | 13 | 0 | **115** | 80 | 43 % | 26 | à faire |
| GW | Guinée-Bissau | Ouest | 19 | 12 | 11 | 11 | 22 | 31 | 14 | 0 | **120** | 121 | 40 % | 34 | à faire |
| LR | Libéria | Ouest | 18 | 14 | 10 | 13 | 20 | 34 | 14 | 8 | **131** | 113 | 39 % | 34 | à faire |
| LY | Libye | Nord | 9 | 8 | 14 | 12 | 20 | 35 | 11 | 0 | **109** | 91 | 20 % | 25 | à faire |
| MA | Maroc | Nord | 14 | 8 | 19 | 26 | 25 | 32 | 10 | 7 | **141** | 160 | 46 % | 17 | à faire |
| ML | Mali | Ouest | 14 | 11 | 11 | 18 | 20 | 34 | 11 | 5 | **124** | 129 | 38 % | 18 | à faire |
| MR | Mauritanie | Ouest | 9 | 9 | 11 | 17 | 16 | 35 | 9 | 0 | **106** | 105 | 21 % | 19 | à faire |
| NE | Niger | Ouest | 17 | 11 | 15 | 15 | 20 | 35 | 15 | 11 | **139** | 67 | 4 % | 23 | à faire |
| NG | Nigeria | Ouest | 18 | 10 | 14 | 20 | 21 | 34 | 15 | 8 | **140** | 129 | 35 % | 31 | à faire |
| SD | Soudan | Nord | 17 | 10 | 12 | 18 | 18 | 34 | 11 | 2 | **122** | 85 | 12 % | 30 | à faire |
| SL | Sierra Leone | Ouest | 19 | 13 | 13 | 12 | 18 | 34 | 15 | 8 | **132** | 134 | 41 % | 18 | à faire |
| SN | Sénégal | Ouest | 15 | 12 | 16 | 13 | 24 | 35 | 11 | 6 | **132** | 107 | 67 % | 16 | **faite** |
| ST | Sao Tomé-et-Principe | Centre | 9 | 6 | 13 | 15 | 17 | 34 | 11 | 0 | **105** | 85 | 27 % | 16 | à faire |
| TD | Tchad | Centre | 16 | 10 | 12 | 12 | 17 | 35 | 12 | 0 | **114** | 71 | 44 % | 28 | à faire |
| TG | Togo | Ouest | 17 | 12 | 12 | 13 | 20 | 30 | 12 | 10 | **126** | 121 | 28 % | 32 | à faire |
| TN | Tunisie | Nord | 9 | 7 | 19 | 18 | 20 | 33 | 13 | 0 | **119** | 116 | 2 % | 20 | à faire |

## Ce qui reste à faire

### 1. Les 22 pays sans fichier

- **Est** : Burundi (BI), Comores (KM), Érythrée (ER), Éthiopie (ET), Kenya (KE), Madagascar (MG), Maurice (MU), Ouganda (UG), Rwanda (RW), Seychelles (SC), Somalie (SO), Soudan du Sud (SS), Tanzanie (TZ).
- **Australe** : Afrique du Sud (ZA), Botswana (BW), Eswatini (SZ), Lesotho (LS), Malawi (MW), Mozambique (MZ), Namibie (NA), Zambie (ZM), Zimbabwe (ZW).

Les régions Est et Australe sont donc presque vides. Ce sont les priorités pour l'équilibre du continent.

### 2. La contre-vérification des 32 pays recherchés

Il faut une passe de l'agent vérificateur sur chaque pays, sauf le Sénégal. Elle retire ou corrige les affirmations que leurs sources ne soutiennent pas, puis met à jour `verification`.

### 3. Lacunes connues des données

- **Proverbes.** 12 pays n'en ont aucun (BF, CI, CM, EH, GN, GQ, GW, LY, MR, ST, TD, TN), faute de recueil en ligne citable. Il faudra des sources papier : recueils, AODL, ou les contributions des membres.
- **Wikipédia.** Sa part dépasse 40 % pour plusieurs pays (SN 67 %, BJ, EH 48 %, MA 46 %…). C'est à remplacer progressivement par les sources d'origine (UNESCO, musées, archives, articles).
- **Images.** Aucune pour l'instant. Les droits des images sont à traiter à part des données, avec une licence explicite par image.
- **Sources difficiles d'accès.** Le site du British Museum répond 403. Le site du Met répond 429, mais son API fonctionne.
- **Sujets sensibles.** 9 à 55 éléments par pays (le Sahara occidental est le plus concerné). Ils demandent une relecture humaine, et une validation communautaire si possible, avant publication.

## Reprendre le travail

Depuis Claude Code, dans ce projet :

1. **Produire les pays manquants.**
   - Relancer le workflow `base-afrique-pays` avec :
     - `scriptPath` : `~/.claude/projects/-www-wwwroot-BAOBAB/3640eb92-767c-4015-a635-da3be44206b5/workflows/scripts/base-afrique-pays-wf_14107ecb-11b.js` ;
     - `args` : `{ root: "<clone>/server/data/afrique", date: "<AAAA-MM-JJ>", pays: [{ code, nom, region }, …] }`, avec uniquement les 22 pays restants.
   - La reprise de l'ancien run (`resumeFromRunId: wf_8f625c98-62a`) n'est possible que dans la même session. Sinon, on relance avec la liste réduite.
2. **Contre-vérifier les pays existants.** Même workflow, ou une variante qui n'exécute que l'étape « Vérification », sur les 32 pays marqués « à faire ».
3. **Contrôler les fichiers** avec `node outils/verifier.mjs`. Il doit indiquer 0 erreur.
4. **Commiter les fichiers `pays/*.json`** et pousser sur `stability`.
5. **Déployer** avec `sudo bash /home/seven/deploy-monbaobab.sh`.
   - Le script lance `importerBaseAfrique.js`, qui crée les nouvelles fiches en `en_revue`.
   - L'import ne modifie jamais une fiche déjà validée, publiée ou retirée. Il la signale seulement (« nouvelle version à relire »).

## Côté site : points en suspens (hors base de données)

- **Paramètres.** Description, notifications et mode maintenance sont enregistrés, mais n'ont encore aucun effet sur le site.
- **Membres.** « Supprimer » désactive le compte au lieu de l'effacer.
- **Fiches publiées.** Elles apparaissent sur la page du pays (onglets), dans Repères (événements datés) et sur `/fiche/:id`. Aucune fiche n'a d'image pour l'instant.
