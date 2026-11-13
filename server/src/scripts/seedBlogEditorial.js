/**
 * Réécriture éditoriale du carnet de savoirs (novembre 2026).
 *
 * Remplace les six articles d'origine (textes génériques sans sources) par des articles
 * documentés, en conservant leurs identifiants (liens, référencement, vues) et leurs images.
 * Chaque affirmation factuelle renvoie à une référence numérotée [n].
 * Quand les sources divergent, le texte le dit au lieu de trancher.
 *
 * Sauvegarde préalable de la collection dans /root/baobab-backups/.
 * Usage : node src/scripts/seedBlogEditorial.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const AUTHOR = 'Rédaction MonBaobab'

const articles = [
  /* ------------------------------------------------------------------ Bogolan */
  {
    match: '/content/blog/bogolan-mali.webp',
    title: 'Bògòlanfini : le tissu de terre du Mali',
    category: 'Arts',
    country: 'ML',
    tags: ['Mali', 'Textile', 'Bogolan', 'Artisanat', 'Teinture'],
    excerpt:
      'Ni peinture ni simple teinture : le bogolan naît d’une réaction entre des feuilles riches en tanins et une boue chargée de fer. Histoire, technique et usages d’un tissu devenu emblème du Mali.',
    content: `On le croise aujourd’hui sur des coussins, des vestes ou des affiches, souvent imité par l’impression industrielle. Pourtant, le bògòlanfini — que l’on abrège en « bogolan » — est d’abord une technique précise, née au Mali, où la couleur ne se pose pas sur le tissu : elle s’y fabrique.

## Un nom qui dit la matière

Le mot vient du bamanankan. *Bɔgɔ* désigne la terre ou la boue, et *bògòlan* renvoie plus précisément à une argile riche en fer ; *fini* signifie le tissu [1]. Le bògòlanfini est donc, littéralement, le tissu fait avec de la terre.

La technique est associée à plusieurs peuples du Mali, mais c’est la version bamanan (bambara) qui est devenue la plus connue hors du pays [1].

## Une couleur qui naît d’une réaction

Le procédé se déroule en plusieurs temps, et chacun compte.

D’abord, le coton est trempé dans un bain préparé avec des feuilles de *n’gallama*, qui le teinte en jaune [1][2]. Certaines descriptions de musée précisent que deux feuillages sont bouillis ensemble : le *n’gallama* et le *n’tjankara* (*Combretum glutinosum*) [3].

Ensuite, les motifs sont tracés avec une boue soigneusement choisie, prélevée dans le lit des cours d’eau puis laissée à fermenter dans une jarre en terre [1]. Le Centre du folklore du Smithsonian indique une récolte au printemps et une fermentation d’environ un an [2] ; d’autres ateliers parlent de durées bien plus courtes. Les pratiques varient, et les sources avec elles.

Le secret est chimique : le fer contenu dans la boue réagit avec les tanins déposés par les feuilles. Là où la boue a été posée, le tissu devient brun sombre, presque noir, et cette couleur tient au lavage [4].

Enfin, le jaune est retiré des zones non peintes avec du savon ou de l’eau de Javel, ce qui fait apparaître le fond clair et donne au bogolan son contraste caractéristique [1].

> Le dessin du bogolan n’est pas posé sur le tissu : il naît d’une rencontre entre la terre et la plante.

## Des mains et des rôles

Dans la production traditionnelle, les hommes tissent les bandes de coton et les femmes teignent [1]. Ce partage a évolué : l’encyclopédie note qu’aujourd’hui, la plus grande partie des tissus est produite par des hommes [1].

## Un vêtement qui protège et qui marque les passages

Le bogolan n’était pas seulement décoratif. Les chasseurs le portaient comme camouflage, comme protection rituelle et comme signe de statut [1]. Les femmes en étaient enveloppées après leur initiation à l’âge adulte, puis immédiatement après un accouchement [1]. Le tissu accompagnait ainsi des moments où le corps et la personne changent de statut.

## Du village aux podiums

À partir de la fin des années 1970, des artistes se sont emparés du bogolan. Le Groupe Bogolan Kasobané réunit six artistes qui collaborent depuis 1978 [1], et le styliste malien Chris Seydou est crédité d’avoir fait entrer le bogolan dans la mode internationale [1].

Ce succès a un revers : de grandes quantités de « bogolan » sont désormais produites en série pour le tourisme et l’export, avec des motifs simplifiés, souvent appliqués au pochoir [1].

## Comment reconnaître un bogolan fait main

- Le tissu est souvent composé de bandes de coton étroites, cousues entre elles.
- Les traits sont légèrement irréguliers : ils ont été peints à la main, pas imprimés.
- Le noir n’est pas uniforme ; il varie selon l’épaisseur de la boue et le tissage.
- Au toucher, la surface peinte est un peu plus rêche que le fond.

Acheter un bogolan fait main, c’est rémunérer un savoir-faire qui demande du temps, des matières choisies et une connaissance fine des saisons.`,
    references: [
      { title: 'Bògòlanfini', publisher: 'Wikipedia (édition anglaise)', url: 'https://en.wikipedia.org/wiki/B%C3%B2g%C3%B2lanfini', note: 'Étymologie, étapes du procédé, rôles, usages, Kasobané, Chris Seydou, production en série.' },
      { title: 'Making Bogolan', publisher: 'Smithsonian Center for Folklife and Cultural Heritage', url: 'https://folklife.si.edu/malian-bogolan/making-bogolan/smithsonian', note: 'Feuilles utilisées, récolte et fermentation de la boue.' },
      { title: 'Mud cloth (bogolanfini) — fiche de collection', publisher: 'Bowers Museum', url: 'https://collections.bowers.org/objects/144804/mud-cloth-bogolanfini', note: 'Feuilles de n’gallama et de n’tjankara.' },
      { title: 'Mud Cloth, objet n° 3382/1', publisher: 'Museum of Anthropology, University of British Columbia (Reciprocal Research Network)', url: 'https://www.rrncommunity.org/items/624894/print', note: 'Réaction entre acide tannique et oxyde de fer.' },
    ],
  },

  /* ------------------------------------------------------------------ Griots */
  {
    match: '/content/blog/griot-kora.webp',
    title: 'Griots et griottes : la mémoire qui chante',
    category: 'Histoire',
    country: 'GN',
    tags: ['Griots', 'Oralité', 'Empire du Mali', 'Soundiata', 'Patrimoine immatériel'],
    excerpt:
      'Historiens, généalogistes, musiciens, conseillers : les griots d’Afrique de l’Ouest portent une mémoire qui se transmet de génération en génération. À Nyagassola, en Guinée, un balafon vieux de plusieurs siècles en est le symbole.',
    content: `Dans une grande partie de l’Afrique de l’Ouest, une famille peut connaître ses ancêtres sur des dizaines de générations sans avoir jamais ouvert un registre. Cette mémoire a des gardiens : les griots et les griottes.

## Qui sont les griots ?

L’Encyclopædia Britannica décrit le griot comme un « troubadour-historien » d’Afrique de l’Ouest, dont la fonction est héréditaire. Ses missions traditionnelles : conserver les généalogies, les récits historiques et les traditions orales — et chanter les louanges [1].

Dans les langues mandingues, on les appelle *jeli* ou *jali*. D’autres langues ont leurs propres mots, et la réalité qu’ils recouvrent varie d’une société à l’autre [3].

Réduire le griot à un « chanteur de louanges » serait pourtant trompeur. Le chercheur Thomas A. Hale, qui a consacré une grande partie de ses travaux à cette profession, rappelle qu’ils sont aussi historiens, généalogistes, conseillers, porte-parole et diplomates [3][4].

## D’où vient le mot « griot » ?

Le terme lui-même reste débattu. Il apparaît dans des récits de voyageurs européens du XVIIᵉ siècle, notamment une relation de voyage sur la côte sénégambienne publiée en 1637 [3]. Plusieurs origines ont été proposées depuis — wolof ou peule notamment — et Hale a avancé sa propre hypothèse [3]. Ce débat dit quelque chose d’important : la profession existe dans de nombreuses sociétés, sous des noms différents, et le mot « griot » est une étiquette commode plus qu’un terme d’origine.

## Le Sosso-Bala, un balafon devenu patrimoine de l’humanité

À Nyagassola, dans le nord de la Guinée, la famille Dökala — les griots Kouyaté du village — garde un instrument hors du commun : le Sosso-Bala [2].

C’est un balafon sacré d’environ 1,5 mètre, à vingt lames, sous lesquelles sont fixées des calebasses qui servent de résonateurs [2]. Selon l’UNESCO, il appartenait à l’origine au roi Soumaoro Kanté, monté sur le trône du Sosso au début du XIIIᵉ siècle [2]. Au fil des siècles, il a accompagné la transmission des grands récits épiques, au premier rang desquels l’épopée de Soundiata, le fondateur de l’Empire du Mali [2].

Seul le *Balatigui*, le patriarche de la famille et gardien de l’instrument, peut en jouer, et seulement lors de grandes occasions comme le Nouvel An musulman ou les funérailles [2]. L’UNESCO le décrit comme le symbole de la liberté et de la cohésion de la communauté mandingue [2].

L’« Espace culturel du Sosso-Bala » a été proclamé chef-d’œuvre du patrimoine oral et immatériel en 2001, puis inscrit en 2008 sur la Liste représentative du patrimoine culturel immatériel de l’humanité [2].

> Une épopée racontée par un griot n’est pas une version « non écrite » de l’histoire : c’est une autre manière de la conserver, avec ses règles, ses gardiens et ses moments.

## Une parole qui a ses règles

La tradition orale n’est pas une mémoire floue. Elle s’apprend longuement, se transmet dans des familles précises, et se dit dans des circonstances définies — un mariage, des funérailles, une intronisation. Le contexte compte autant que le texte : une même généalogie ne se récite pas de la même façon partout.

## Et aujourd’hui ?

Les griots n’ont pas disparu ; ils ont changé de scène. Beaucoup sont devenus des musiciens de premier plan, enregistrés et diffusés dans le monde entier. Mais la radio, les enregistrements et le téléphone ont aussi transformé la demande : moins de louanges commandées, plus de concerts. Documenter les récits avec ceux qui les portent — et non à leur place — reste l’enjeu.`,
    references: [
      { title: 'Griot', publisher: 'Encyclopædia Britannica', url: 'https://www.britannica.com/art/griot', note: 'Définition, caractère héréditaire, missions.' },
      { title: 'Cultural space of Sosso-Bala (Espace culturel du Sosso-Bala)', publisher: 'UNESCO, patrimoine culturel immatériel', year: 2008, url: 'https://ich.unesco.org/en/RL/cultural-space-of-sosso-bala-00009', note: 'Nyagassola, famille Dökala, description, Soumaoro Kanté, usages, proclamation 2001 et inscription 2008.' },
      { title: 'From the Griot of Roots to the Roots of Griot: A New Look at the Origins of a Controversial African Term for Bard', author: 'Thomas A. Hale', publisher: 'Oral Tradition, vol. 12, n° 2, p. 249-278', year: 1997, url: 'https://journal.oraltradition.org/wp-content/uploads/files/articles/12ii/2_Hale.pdf', note: 'Rôles des griots et débat sur l’origine du mot.' },
      { title: 'Griots and Griottes: Masters of Words and Music', author: 'Thomas A. Hale', publisher: 'Indiana University Press', year: 1998, note: 'Ouvrage de référence pour aller plus loin.' },
    ],
  },

  /* ------------------------------------------------------------------ Gelede */
  {
    match: '/content/blog/masque-africain.webp',
    title: 'Gelede : quand les masques rendent hommage aux mères',
    category: 'Culture',
    country: 'BJ',
    tags: ['Gelede', 'Masques', 'Yoruba', 'Bénin', 'Nigeria', 'Togo', 'Patrimoine immatériel'],
    excerpt:
      'Chez les Yoruba-Nago du Bénin, du Nigeria et du Togo, le Gelede associe masques sculptés, danses et chants satiriques. Une cérémonie unique, que l’UNESCO décrit comme la seule société masquée connue gouvernée aussi par des femmes.',
    content: `Dans les musées, un masque est souvent présenté seul, sous une vitrine, éclairé comme une sculpture. Mais la plupart des masques africains n’ont pas été faits pour être regardés immobiles : ils dansent, ils chantent, ils parlent à une communauté. Le Gelede en est un exemple saisissant.

## Une cérémonie des Yoruba-Nago

Le Gelede est pratiqué par la communauté yoruba-nago, répartie entre le Bénin, le Nigeria et le Togo [1]. Il a lieu chaque année après les récoltes, lors d’événements importants, et aussi en période de sécheresse ou d’épidémie [1]. La cérémonie se déroule généralement la nuit, sur une place publique, les danseurs se préparant dans une maison voisine [1].

## Masques, danses et chants

Le Gelede réunit plusieurs arts à la fois. Les masques sculptés et les costumes demandent un long travail de préparation ; les danses les mettent en mouvement ; et les chants, en langue yoruba, retracent l’histoire et les mythes du peuple yoruba-nago [1].

Ces chants mêlent registre épique et registre lyrique, avec beaucoup d’ironie et de moquerie [1]. Les masques satiriques mobilisent souvent des figures animales : le serpent, symbole de puissance, ou l’oiseau, messager des « mères » [1].

> Le masque Gelede ne se comprend pas sans la nuit, la place, la danse, le chant — et les rires de ceux qui reconnaissent ce qui est moqué.

## Un hommage aux femmes

La cérémonie rend hommage à la mère primordiale, Iyà Nlà, et au rôle des femmes dans l’organisation et le développement de la société yoruba [1]. L’UNESCO souligne une particularité remarquable : le Gelede est la seule société masquée connue qui soit aussi gouvernée par des femmes [1].

Même si la pratique s’est adaptée à une société devenue plus patriarcale, ses danses et son patrimoine oral peuvent être lus comme le témoignage d’un ordre ancien où les femmes tenaient une place centrale [1].

## Un patrimoine reconnu et menacé

Le patrimoine oral du Gelede a été proclamé chef-d’œuvre du patrimoine oral et immatériel de l’humanité en 2001, puis inscrit en 2008 sur la Liste représentative de l’UNESCO [1].

L’UNESCO identifie deux menaces : la perte progressive des savoir-faire traditionnels, liée aux évolutions techniques, et le tourisme, qui risque de transformer le Gelede en produit folklorique [1].

## Regarder un masque sans le réduire

Que l’on visite un musée ou que l’on assiste à une cérémonie, quelques questions aident à mieux voir :

- **Qui l’a fait, et pour qui ?** Un masque appartient à une communauté, souvent à une société précise, pas à « l’Afrique » en général.
- **Quand sort-il ?** Récolte, funérailles, initiation, crise : le moment donne le sens.
- **Que dit-il, et à qui ?** Beaucoup de masques sont drôles, critiques, moqueurs. Les lire uniquement comme « sacrés » ou « mystérieux » efface leur humour et leur portée sociale.
- **Que sait-on vraiment de son histoire ?** Une fiche honnête dit aussi ce que l’on ignore — y compris la manière dont un objet est arrivé dans une collection.

*Note : l’illustration de cet article montre une sculpture africaine en contexte muséal ; elle n’est pas un masque Gelede.*`,
    references: [
      { title: 'Oral heritage of Gelede (Patrimoine oral Gelede)', publisher: 'UNESCO, patrimoine culturel immatériel', year: 2008, url: 'https://ich.unesco.org/en/RL/oral-heritage-of-gelede-00002', note: 'Communauté, calendrier, contenu des chants et des masques, rôle des femmes, menaces, proclamation 2001 et inscription 2008.' },
    ],
  },

  /* ------------------------------------------------------------------ Djenné */
  {
    match: '/content/blog/marche-mali.webp',
    title: 'Djenné, la ville-marché au pied de la Grande Mosquée',
    category: 'Histoire',
    country: 'ML',
    tags: ['Mali', 'Djenné', 'Marchés', 'Commerce transsaharien', 'Patrimoine mondial', 'Architecture de terre'],
    excerpt:
      'Habitée depuis plus de deux mille ans, Djenné fut un carrefour du commerce de l’or à travers le Sahara. Son marché hebdomadaire se tient toujours devant la plus célèbre mosquée de terre crue du monde.',
    content: `Un marché raconte un pays mieux que bien des livres : les produits de saison, les langues qui se croisent, les routes par lesquelles arrivent les marchandises. À Djenné, au Mali, le marché raconte en plus deux mille ans d’histoire.

## Une ville très ancienne

Selon l’UNESCO, le site est habité depuis environ 250 avant notre ère. Djenné est devenue un centre de marché et un maillon important du commerce transsaharien de l’or [1][2].

Autour de la ville actuelle se trouvent plusieurs sites archéologiques — Djenné-Djeno, Hambarketolo, Tonomba et Kaniana — qui témoignent de cette longue occupation [3].

## Un marché devant la mosquée

Le marché traditionnel de Djenné se tient chaque semaine sur la place de la Grande Mosquée [2]. Cette proximité n’a rien d’anecdotique : à Djenné, la vie religieuse, la vie marchande et la vie urbaine partagent le même espace.

> Le marché de Djenné n’est pas installé à côté du patrimoine : il en fait partie.

## La Grande Mosquée, un chef-d’œuvre de terre

La Grande Mosquée actuelle a été reconstruite en 1907 [2]. Elle est souvent présentée comme le plus grand édifice en terre crue du monde.

Un bâtiment de terre a besoin de soins. Chaque année, au printemps, avant la saison des pluies, les habitants se réunissent pour recouvrir les murs d’un nouvel enduit d’argile : c’est le *crépissage* [4]. Ce chantier est à la fois une nécessité — sans lui, les murs sèchent et s’effritent — et une grande fête collective qui célèbre le patrimoine, la foi et la communauté de la ville [4].

## Un patrimoine mondial en danger

Les « Villes anciennes de Djenné » ont été inscrites sur la Liste du patrimoine mondial de l’UNESCO en 1988 [1]. Depuis 2016, elles figurent aussi sur la Liste du patrimoine mondial en péril, en raison notamment de l’insécurité dans la région [1].

## Ce que l’on apprend en regardant un marché

Que ce soit à Djenné ou ailleurs, un marché se lit à plusieurs niveaux :

- **Les produits** disent les saisons, les cultures locales et les routes commerciales.
- **Les langues** disent qui vient d’où : un marché est souvent l’endroit le plus multilingue d’une région.
- **L’organisation** de l’espace — qui vend quoi, à quel endroit, à quel jour — révèle des règles sociales anciennes.
- **Les bâtiments** autour racontent ce que la ville a choisi de construire, de garder et d’entretenir ensemble.`,
    references: [
      { title: 'Old Towns of Djenné (Villes anciennes de Djenné)', publisher: 'UNESCO, Centre du patrimoine mondial', year: 1988, url: 'https://whc.unesco.org/en/list/116', note: 'Inscription en 1988, ancienneté, commerce transsaharien, inscription sur la liste en péril en 2016.' },
      { title: 'Old Towns of Djenné (Mali) — Urban Heritage Atlas', publisher: 'UNESCO, Centre du patrimoine mondial', url: 'https://whc.unesco.org/en/urban-heritage-atlas/djenne', note: 'Reconstruction de la Grande Mosquée (1907), marché hebdomadaire sur la place de la mosquée.' },
      { title: 'Great Mosque of Djenné', publisher: 'Smarthistory', url: 'https://smarthistory.org/?p=1976', note: 'Sites archéologiques du « cercle de Djenné ».' },
      { title: 'Ancient Malian city celebrates annual replastering of mosque', publisher: 'Arab News (dépêche)', url: 'https://www.arabnews.pk/node/2604511', note: 'Le crépissage annuel avant la saison des pluies.' },
    ],
  },

  /* ------------------------------------------------------------------ Karité */
  {
    match: '/content/blog/karite-burkina.webp',
    title: 'Le karité, de l’arbre des savanes au marché mondial',
    category: 'Économie',
    country: 'BF',
    tags: ['Karité', 'Agroforesterie', 'Femmes', 'Burkina Faso', 'Ghana', 'Mali', 'Commerce'],
    excerpt:
      'Le karité pousse sur une bande de savanes longue de plus de 5 000 km. Son beurre, transformé surtout par des femmes, nourrit les familles, soigne la peau des nouveau-nés… et se retrouve dans le chocolat industriel.',
    content: `On connaît surtout le beurre de karité par les cosmétiques. C’est pourtant une petite partie de son histoire. Le karité est d’abord un arbre, un aliment, un savoir de femmes — et une matière première dont la plus grande part part vers l’industrie alimentaire.

## Un arbre des savanes

Le karité (*Vitellaria paradoxa*) est originaire d’une bande de végétation qui s’étend sur plus de 5 000 kilomètres, du Sénégal jusqu’à l’Éthiopie et l’Ouganda [1]. Il n’est pas planté en vergers : il pousse dans les parcs agroforestiers, au milieu des champs et des savanes, ce qui fait de sa cueillette une activité étroitement liée aux saisons.

## Un savoir de femmes

La cueillette des fruits et la transformation des noix sont généralement assurées par des femmes, d’abord pour la consommation du foyer [1]. La fabrication du beurre est souvent réalisée par des groupes informels de femmes qui mettent en commun leur travail [1] — un travail long, qui passe par plusieurs étapes de séchage, de concassage, de torréfaction, de broyage, de barattage et de cuisson.

Ces groupes jouent aussi un rôle clé dans la diffusion des innovations de transformation [1].

> Derrière chaque pot de beurre de karité, il y a des heures de travail, souvent collectif, presque toujours féminin.

## Un aliment avant d’être un cosmétique

Le fruit est riche en vitamines et en minéraux, et la matière grasse de l’amande est une ressource alimentaire essentielle pour les familles rurales [1]. Le beurre est aussi utilisé depuis longtemps pour les soins de la peau, en particulier ceux des nouveau-nés [1].

## Où part le karité exporté ?

La plus grande partie des exportations est destinée à l’industrie alimentaire, où le karité est transformé en équivalents de beurre de cacao (utilisés en chocolaterie) et en margarine [1]. Les cosmétiques et la pharmacie représentent un marché plus petit, mais en croissance et à forte valeur ajoutée [1].

Ces données proviennent d’une analyse publiée par la FAO au début des années 2000 ; les volumes ont évolué depuis, mais la structure du marché — beaucoup de noix brutes, peu de beurre transformé sur place — reste un enjeu majeur pour les productrices.

## Pourquoi c’est important

Le karité pose une question simple : qui capte la valeur ? Quand les noix sont exportées brutes, l’essentiel de la valeur ajoutée se fait ailleurs. Quand le beurre est transformé localement, par des coopératives organisées et correctement rémunérées, une part plus grande reste dans les villages.

Pour l’acheteur, quelques repères :

- **Préférer le beurre transformé sur place**, idéalement par une coopérative identifiée.
- **Demander l’origine** : pays, région, groupement.
- **Se méfier des mentions vagues** comme « karité africain » sans aucune précision.`,
    references: [
      { title: 'Reinforcing sound management through trade: shea tree products in Africa', author: 'E. T. Masters, J. A. Yidana, P. N. Lovett', publisher: 'FAO — Organisation des Nations unies pour l’alimentation et l’agriculture', url: 'https://www.fao.org/4/y5918e/y5918e11.htm', note: 'Aire de répartition, rôle des femmes, usages alimentaires et cosmétiques, débouchés à l’export.' },
    ],
  },

  /* ------------------------------------------------------------------ Villes */
  {
    match: '/content/blog/ville-abidjan.webp',
    title: 'Dakar, Abidjan, Lagos : trois scènes culturelles qui rayonnent',
    category: 'Société',
    country: '',
    tags: ['Dakar', 'Abidjan', 'Lagos', 'Dak’Art', 'MASA', 'Nollywood', 'Industries créatives'],
    excerpt:
      'Une biennale d’art contemporain, un grand marché des arts du spectacle, une industrie du film née de cassettes vidéo : comment trois villes d’Afrique de l’Ouest sont devenues des capitales culturelles.',
    content: `Les grandes villes africaines sont souvent décrites par leurs chiffres : population, croissance, embouteillages. On parle moins de ce qu’elles produisent et exportent en matière de culture. Trois exemples, documentés, montrent pourtant à quel point Dakar, Abidjan et Lagos pèsent dans les arts du continent.

## Dakar : la biennale et les arts numériques

La Biennale de Dakar, dite Dak’Art, a été créée sous la présidence d’Abdou Diouf. Sa première édition, en 1990, était consacrée à la littérature ; c’est en 1992 qu’elle s’est tournée vers les arts visuels [1]. Elle est devenue l’un des principaux rendez-vous de l’art contemporain africain [1].

En 2014, Dakar a rejoint le Réseau des villes créatives de l’UNESCO au titre des arts numériques, parmi 28 nouvelles villes désignées le 1ᵉʳ décembre de cette année-là [2].

## Abidjan : le grand marché des arts du spectacle

Le Marché des arts du spectacle d’Abidjan (MASA) a été créé officiellement en 1990, lors de la deuxième Conférence des ministres de la Culture de la Francophonie, à Liège [3]. Sa première édition s’est tenue à Abidjan du 27 mars au 1ᵉʳ avril 1993, avec plus de 400 professionnels [3].

Après une interruption, le MASA a été relancé en 2014 [3]. Il réunit tous les deux ans à Abidjan le théâtre, la musique et la danse du continent, avec un objectif clair : faire se rencontrer artistes, programmateurs et diffuseurs.

> Un festival montre des artistes ; un marché comme le MASA leur ouvre des scènes pour les années suivantes.

## Lagos : Nollywood, née d’une cassette vidéo

L’histoire est devenue un mythe fondateur. En 1992, le commerçant Kenneth Nnebue, installé à Lagos, produit *Living in Bondage*, réalisé par Chris Obi Rapu, notamment pour écouler un stock de cassettes VHS vierges [5]. Le film est généralement considéré comme le point de départ de l’industrie que l’on appelle aujourd’hui Nollywood, même s’il n’était pas le premier film nigérian diffusé en vidéo [5]. Les chiffres de budget et de ventes varient fortement selon les sources.

En 2009, une enquête de l’Institut de statistique de l’UNESCO, portant sur l’année 2006, a classé le Nigeria au deuxième rang mondial pour le nombre de longs métrages produits : 872 productions (au format vidéo), derrière l’Inde (1 091) et devant les États-Unis (485) [4].

Ce classement porte sur le **nombre** de films, pas sur les recettes : les budgets de Nollywood restent sans commune mesure avec ceux de Hollywood. Mais il dit l’essentiel : une industrie bâtie sans grands studios ni réseau de salles a trouvé son public, d’abord en Afrique, puis dans la diaspora.

## Ce que ces trois villes ont en commun

- **Des institutions qui durent** : une biennale, un marché, une industrie — pas seulement des événements ponctuels.
- **Un public local d’abord** : chacune de ces scènes s’est construite pour et avec son public avant de s’exporter.
- **Des circuits continentaux** : artistes, techniciens et programmateurs y circulent d’un pays à l’autre.`,
    references: [
      { title: 'Dakar Biennale', publisher: 'Wikipedia (édition anglaise)', url: 'https://en.wikipedia.org/wiki/Dakar_Biennale', note: 'Création, édition littéraire de 1990, tournant vers les arts visuels en 1992.' },
      { title: 'UNESCO designates 28 new Creative Cities worldwide', publisher: 'ASEF culture360', year: 2014, url: 'https://culture360.asef.org/news-events/unesco-designates-28-new-creative-cities-worldwide', note: 'Désignation de Dakar, ville créative des arts numériques, le 1ᵉʳ décembre 2014.' },
      { title: 'Brief History', publisher: 'MASA — Marché des arts du spectacle d’Abidjan (site officiel)', url: 'https://www.en.masa.ci/general-information', note: 'Création en 1990, première édition en 1993, relance en 2014.' },
      { title: 'Nigeria surpasses Hollywood as world’s second largest film producer – UN', publisher: 'ONU Info (UN News)', year: 2009, url: 'https://news.un.org/en/story/2009/05/299102-nigeria-surpasses-hollywood-worlds-second-largest-film-producer-un', note: 'Enquête de l’Institut de statistique de l’UNESCO sur l’année 2006.' },
      { title: 'Meet ‘Nollywood’: The second largest movie industry in the world', publisher: 'Fortune', year: 2015, url: 'https://fortune.com/2015/06/24/nollywood-movie-industry/', note: 'Living in Bondage et les débuts de Nollywood.' },
    ],
  },
]

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const blogs = mongoose.connection.db.collection('blogs')

  // 1. Sauvegarde
  const backupDir = '/root/baobab-backups'
  fs.mkdirSync(backupDir, { recursive: true })
  const all = await blogs.find({}).toArray()
  const backupFile = path.join(backupDir, `blogs-avant-refonte-${new Date().toISOString().slice(0, 10)}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(all, null, 2))
  console.log(`Sauvegarde : ${all.length} articles → ${backupFile}`)

  // 2. Statut de modération pour les articles existants
  const migrated = await blogs.updateMany({ status: { $exists: false } }, [
    { $set: { status: { $cond: ['$published', 'published', 'pending'] }, kind: 'savoir', references: [], reviewNote: '' } },
  ])
  console.log(`Statuts initialisés : ${migrated.modifiedCount}`)

  // 3. Réécriture éditoriale
  for (const article of articles) {
    const { match, ...fields } = article
    const result = await blogs.updateOne(
      { image: match },
      {
        $set: {
          ...fields,
          author: AUTHOR,
          kind: 'savoir',
          status: 'published',
          published: true,
          verified: true,
          image: match,
          updatedAt: new Date(),
        },
      },
    )
    console.log(`${result.matchedCount ? '✔' : '✘ introuvable'} ${article.title}`)
  }

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
