import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Country from '../models/Country.js'
import Community from '../models/Community.js'
import CommunityMember from '../models/CommunityMember.js'
import CommunityPost from '../models/CommunityPost.js'
import Settings from '../models/Settings.js'
import User from '../models/User.js'
import logger from '../utils/logger.js'

dotenv.config()

const sourceNotes = [
  'Repères généraux à consolider avec des sources officielles nationales, UNESCO, Union africaine, Banque mondiale et instituts statistiques.',
  'Les informations pratiques susceptibles de changer doivent être revérifiées avant usage voyage, commerce ou média.',
]

const countries = [
  {
    id: 'SN',
    name: 'Senegal',
    nameFr: 'Sénégal',
    officialName: 'République du Sénégal',
    capital: 'Dakar',
    region: 'Afrique de l’Ouest',
    subregion: 'Sahel atlantique',
    languages: ['Français', 'Wolof', 'Pulaar', 'Sérère', 'Diola', 'Mandingue'],
    currency: 'Franc CFA BCEAO',
    description: 'Le Sénégal relie façade atlantique, mémoire sahélienne, villes créatives et fortes traditions d’hospitalité. Dakar, Saint-Louis, Gorée, Touba et le Sine-Saloum forment des portes d’entrée vers une culture urbaine, religieuse, musicale et artisanale très vivante.',
    culture: 'Teranga, oralité, mbalax, confréries, pêche, textile, lutte traditionnelle et cuisine familiale structurent une partie importante du quotidien.',
    oneSentenceSummary: 'Un pays carrefour où l’Atlantique, la parole, la musique et l’hospitalité dessinent une identité immédiatement reconnaissable.',
    discoveryIntro: 'Commencez par Dakar et Saint-Louis, puis reliez musique, marchés, îles de mémoire, confréries religieuses et savoirs du quotidien.',
    keyFacts: ['Dakar est un centre culturel majeur d’Afrique de l’Ouest', 'La teranga désigne une hospitalité active et sociale', 'Saint-Louis et Gorée portent une forte mémoire historique'],
    peoples: ['Wolof', 'Pulaar/Toucouleur', 'Sérère', 'Diola', 'Mandingue', 'Soninké'],
    languageNotes: 'Le français est langue officielle. Le wolof est très présent dans les échanges urbains, avec de nombreuses autres langues nationales selon les régions.',
    historyHighlights: ['Royaumes du Waalo, du Cayor, du Sine et du Saloum', 'Saint-Louis comme ancien centre colonial', 'Indépendance en 1960'],
    notableFigures: ['Léopold Sédar Senghor - poète et président', 'Cheikh Anta Diop - savant et historien', 'Youssou N’Dour - artiste'],
    musicAndArts: ['Mbalax', 'Sabar', 'Peinture sous verre', 'Mode dakaroise'],
    foodCulture: ['Ceebu jën', 'Yassa', 'Mafé', 'Bissap'],
    oralTraditions: ['Griots', 'Généalogies', 'Proverbes wolof', 'Récits familiaux'],
    knowledgeToPreserve: ['Savoirs de pêche', 'Textiles et teinture', 'Paroles de griots', 'Cuisine de transmission'],
    recommendedPaths: [
      { title: 'Dakar vivant', description: 'Musique, marchés, création et mémoire urbaine.', items: ['Dakar', 'Gorée', 'Médina', 'Mbalax'] },
      { title: 'Fleuve et mémoire', description: 'Saint-Louis, vallée du fleuve et histoires sahéliennes.', items: ['Saint-Louis', 'Fleuve Sénégal', 'Waalo'] },
    ],
    relatedThemes: ['Atlantique', 'Oralité', 'Musique', 'Hospitalité', 'Mémoire'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'ML',
    name: 'Mali',
    nameFr: 'Mali',
    officialName: 'République du Mali',
    capital: 'Bamako',
    region: 'Afrique de l’Ouest',
    subregion: 'Sahel',
    languages: ['Bambara/Bamanankan', 'Français', 'Peul', 'Soninké', 'Songhay', 'Tamasheq'],
    currency: 'Franc CFA BCEAO',
    description: 'Le Mali occupe une place centrale dans l’histoire des grands empires ouest-africains, des cités savantes et des traditions orales. Mandé, Tombouctou, Djenné, Ségou et le pays dogon forment des repères puissants pour comprendre mémoire, commerce, architecture et parole.',
    culture: 'Griots, kora, bogolan, manuscrits, architectures de terre et récits mandingues donnent au Mali une profondeur culturelle majeure.',
    oneSentenceSummary: 'Une terre de mémoire impériale, de musique et de parole où l’histoire se transmet autant par les archives que par les voix.',
    discoveryIntro: 'Reliez l’empire du Mali, Tombouctou, Djenné, la musique mandingue, les textiles et les récits de famille.',
    keyFacts: ['L’empire du Mali fut une puissance médiévale majeure', 'Tombouctou est associée aux manuscrits et aux savoirs', 'Le bogolan relie textile, terre et symboles'],
    peoples: ['Bambara', 'Malinké', 'Peul', 'Soninké', 'Songhay', 'Dogon', 'Touareg'],
    languageNotes: 'Le bamanankan est largement parlé. Plusieurs langues nationales portent des traditions régionales importantes.',
    historyHighlights: ['Empire du Ghana', 'Empire du Mali', 'Mansa Moussa', 'Tombouctou et Djenné', 'Indépendance en 1960'],
    notableFigures: ['Soundiata Keïta - fondateur de l’empire du Mali', 'Mansa Moussa - souverain célèbre', 'Ali Farka Touré - musicien'],
    musicAndArts: ['Kora', 'Ngoni', 'Bogolan', 'Architecture soudano-sahélienne'],
    foodCulture: ['Tô', 'Riz au gras', 'Fonio', 'Sauces familiales'],
    oralTraditions: ['Épopée de Soundiata', 'Griots mandingues', 'Louanges et généalogies'],
    knowledgeToPreserve: ['Manuscrits', 'Textiles teints', 'Lutherie traditionnelle', 'Architecture de terre'],
    recommendedPaths: [
      { title: 'Mandé et empires', description: 'Comprendre Soundiata, Mansa Moussa et les réseaux sahéliens.', items: ['Niani', 'Kangaba', 'Tombouctou'] },
      { title: 'Objets qui parlent', description: 'Bogolan, kora, manuscrits et architecture.', items: ['Bogolan', 'Kora', 'Djenné'] },
    ],
    relatedThemes: ['Empires', 'Oralité', 'Textile', 'Musique', 'Savoirs'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'BF',
    name: 'Burkina Faso',
    nameFr: 'Burkina Faso',
    officialName: 'Burkina Faso',
    capital: 'Ouagadougou',
    region: 'Afrique de l’Ouest',
    subregion: 'Sahel',
    languages: ['Mooré', 'Dioula', 'Fulfulde', 'Français'],
    currency: 'Franc CFA BCEAO',
    description: 'Le Burkina Faso est souvent associé à l’intégrité, aux savoir-faire artisanaux, au cinéma africain, aux masques, au tissage et à une forte culture communautaire. Ouagadougou, Bobo-Dioulasso et les pays mossi, bobo, lobi ou sénoufo offrent des lectures multiples du territoire.',
    culture: 'Masques, bronze, textile, danse, cinéma, humour social et mémoire de Thomas Sankara nourrissent un imaginaire très fort.',
    oneSentenceSummary: 'Un pays de dignité, d’artisanat et de création populaire où la communauté reste un repère central.',
    discoveryIntro: 'Explorez Ouagadougou, le cinéma, les masques, les textiles et la mémoire politique contemporaine.',
    keyFacts: ['Ouagadougou accueille le FESPACO', 'Le nom Burkina Faso signifie souvent “pays des hommes intègres”', 'Les arts du bronze et du textile y sont très présents'],
    peoples: ['Mossi', 'Bobo', 'Gourmantché', 'Lobi', 'Peul', 'Sénoufo'],
    languageNotes: 'Le mooré est très parlé, avec le dioula, le fulfulde et de nombreuses langues locales selon les régions.',
    historyHighlights: ['Royaumes mossi', 'Haute-Volta coloniale', 'Révolution de 1983', 'Renommage en Burkina Faso en 1984'],
    notableFigures: ['Thomas Sankara - président et symbole d’intégrité', 'Sotigui Kouyaté - comédien et griot', 'Joseph Ki-Zerbo - historien'],
    musicAndArts: ['Balafon', 'Masques', 'Bronze', 'Cinéma', 'Danse'],
    foodCulture: ['Tô', 'Riz gras', 'Bissap', 'Dolo'],
    oralTraditions: ['Proverbes mooré', 'Contes', 'Généalogies', 'Parole de conseil'],
    knowledgeToPreserve: ['Masques rituels contextualisés', 'Savoir du karité', 'Cinéma panafricain', 'Textile traditionnel'],
    recommendedPaths: [
      { title: 'Ouaga créative', description: 'Cinéma, théâtre, arts visuels et débats publics.', items: ['FESPACO', 'Ouagadougou', 'Artisanat'] },
      { title: 'Intégrité et mémoire', description: 'Comprendre la portée de Thomas Sankara.', items: ['Sankara', 'Révolution', 'Jeunesse'] },
    ],
    relatedThemes: ['Cinéma', 'Intégrité', 'Artisanat', 'Masques', 'Sahel'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'CI',
    name: 'Côte d’Ivoire',
    nameFr: 'Côte d’Ivoire',
    officialName: 'République de Côte d’Ivoire',
    capital: 'Yamoussoukro',
    region: 'Afrique de l’Ouest',
    subregion: 'Golfe de Guinée',
    languages: ['Français', 'Baoulé', 'Dioula', 'Bété', 'Sénoufo', 'Agni'],
    currency: 'Franc CFA BCEAO',
    description: 'La Côte d’Ivoire relie forêts, savanes, villes dynamiques, cultures akan, mandé, krou et gur, et une forte créativité musicale et urbaine. Abidjan est un grand centre économique et culturel ouest-africain.',
    culture: 'Zouglou, coupé-décalé, masques, parures, cuisine populaire et humour urbain composent une culture très expressive.',
    oneSentenceSummary: 'Un pays de carrefours urbains et culturels où Abidjan dialogue avec des traditions régionales puissantes.',
    discoveryIntro: 'Partez d’Abidjan, puis reliez musiques urbaines, peuples, marchés, cuisine et arts des masques.',
    keyFacts: ['Yamoussoukro est la capitale politique', 'Abidjan est un centre économique majeur', 'Le cacao occupe une place importante dans l’économie'],
    peoples: ['Akan', 'Mandé', 'Krou', 'Gur/Sénoufo', 'Dan', 'Baoulé'],
    languageNotes: 'Le français est officiel. Le dioula sert souvent de langue de circulation, avec de nombreuses langues régionales.',
    historyHighlights: ['Royaumes akan et baoulé', 'Période coloniale française', 'Indépendance en 1960', 'Développement d’Abidjan'],
    notableFigures: ['Félix Houphouët-Boigny - premier président', 'Alpha Blondy - artiste', 'Frédéric Bruly Bouabré - artiste'],
    musicAndArts: ['Zouglou', 'Coupé-décalé', 'Masques Dan', 'Textiles et parures'],
    foodCulture: ['Attiéké', 'Alloco', 'Garba', 'Sauce graine'],
    oralTraditions: ['Contes akan', 'Proverbes', 'Récits familiaux', 'Paroles de sagesse'],
    knowledgeToPreserve: ['Art des masques', 'Cuisine populaire', 'Musique urbaine', 'Savoirs agricoles'],
    relatedThemes: ['Abidjan', 'Musique', 'Cuisine', 'Masques', 'Commerce'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'GH',
    name: 'Ghana',
    nameFr: 'Ghana',
    officialName: 'Republic of Ghana',
    capital: 'Accra',
    region: 'Afrique de l’Ouest',
    subregion: 'Golfe de Guinée',
    languages: ['Anglais', 'Twi', 'Ewe', 'Ga', 'Dagbani', 'Fante'],
    currency: 'Cedi ghanéen',
    description: 'Le Ghana est marqué par l’histoire akan, ashanti, les routes de l’or, la mémoire atlantique et une forte vie culturelle contemporaine. Accra, Kumasi et Cape Coast offrent des entrées complémentaires sur création, pouvoir, commerce et mémoire.',
    culture: 'Kente, adinkra, highlife, cérémonies akan, mémoire des forts côtiers et énergie créative d’Accra structurent de nombreux récits.',
    oneSentenceSummary: 'Un pays où symboles, textiles, musique et mémoire atlantique se répondent.',
    discoveryIntro: 'Reliez Accra, Kumasi, le kente, les symboles adinkra et les sites de mémoire côtiers.',
    keyFacts: ['Accra est la capitale', 'Kumasi est un centre ashanti majeur', 'Cape Coast et Elmina portent une mémoire historique sensible'],
    peoples: ['Akan', 'Ewe', 'Ga-Dangme', 'Mole-Dagbani', 'Guan'],
    languageNotes: 'L’anglais est officiel. Le twi et d’autres langues nationales sont très présentes dans la vie quotidienne.',
    historyHighlights: ['Royaume ashanti', 'Commerce de l’or', 'Forts côtiers', 'Indépendance en 1957'],
    notableFigures: ['Kwame Nkrumah - leader panafricain', 'Yaa Asantewaa - reine mère résistante', 'Kofi Annan - diplomate'],
    musicAndArts: ['Highlife', 'Kente', 'Adinkra', 'Perles et orfèvrerie'],
    foodCulture: ['Jollof', 'Waakye', 'Banku', 'Kelewele'],
    oralTraditions: ['Proverbes akan', 'Symboles adinkra', 'Récits ashanti'],
    knowledgeToPreserve: ['Tissage kente', 'Symboles adinkra', 'Mémoire des forts', 'Musique highlife'],
    relatedThemes: ['Kente', 'Adinkra', 'Panafricanisme', 'Mémoire', 'Musique'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'NG',
    name: 'Nigeria',
    nameFr: 'Nigeria',
    officialName: 'Federal Republic of Nigeria',
    capital: 'Abuja',
    region: 'Afrique de l’Ouest',
    subregion: 'Golfe de Guinée',
    languages: ['Anglais', 'Haoussa', 'Yoruba', 'Igbo', 'Fulfulde'],
    currency: 'Naira',
    description: 'Le Nigeria est l’un des grands pôles démographiques, culturels et économiques du continent. Lagos, Kano, Abuja, Ibadan et Port Harcourt révèlent une mosaïque de peuples, d’industries créatives, de marchés et d’histoires politiques.',
    culture: 'Nollywood, afrobeat, cultures yoruba, haoussa, igbo, bronzes du Bénin, mode et littérature donnent au Nigeria une portée mondiale.',
    oneSentenceSummary: 'Un géant culturel où cinéma, musique, littérature, commerce et traditions régionales circulent à grande vitesse.',
    discoveryIntro: 'Explorez Lagos, Nollywood, l’afrobeat, les royaumes anciens et les grandes langues du pays.',
    keyFacts: ['Abuja est la capitale fédérale', 'Lagos est un centre économique et créatif majeur', 'Nollywood est une industrie audiovisuelle influente'],
    peoples: ['Haoussa-Fulani', 'Yoruba', 'Igbo', 'Ijaw', 'Kanuri', 'Tiv'],
    languageNotes: 'L’anglais est officiel. Haoussa, yoruba et igbo font partie des grandes langues de circulation, avec de nombreuses autres langues.',
    historyHighlights: ['Cités haoussa', 'Royaume du Bénin', 'Oyo', 'Colonisation britannique', 'Indépendance en 1960'],
    notableFigures: ['Wole Soyinka - prix Nobel de littérature', 'Fela Kuti - musicien', 'Chinua Achebe - écrivain'],
    musicAndArts: ['Afrobeat', 'Afrobeats', 'Nollywood', 'Bronzes du Bénin', 'Textiles'],
    foodCulture: ['Jollof rice', 'Egusi', 'Suya', 'Pounded yam'],
    oralTraditions: ['Ifá', 'Proverbes igbo', 'Poésie haoussa', 'Récits familiaux'],
    knowledgeToPreserve: ['Patrimoines yoruba, igbo et haoussa', 'Cinéma populaire', 'Littérature', 'Arts du bronze'],
    relatedThemes: ['Cinéma', 'Musique', 'Littérature', 'Royaumes', 'Marchés'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'MA',
    name: 'Morocco',
    nameFr: 'Maroc',
    officialName: 'Royaume du Maroc',
    capital: 'Rabat',
    region: 'Afrique du Nord',
    subregion: 'Maghreb',
    languages: ['Arabe', 'Amazighe', 'Français', 'Darija'],
    currency: 'Dirham marocain',
    description: 'Le Maroc relie Atlantique, Méditerranée, Atlas, Sahara et villes impériales. Rabat, Casablanca, Fès, Marrakech, Tanger et Essaouira composent un territoire de circulations, d’arts, de commerce et de mémoires amazighes et arabes.',
    culture: 'Zellige, gnawa, artisanat du cuir, gastronomie, poésie, architecture et hospitalité structurent une culture dense et très visible.',
    oneSentenceSummary: 'Un carrefour maghrébin entre montagnes, médinas, océan et héritages amazighs et arabes.',
    discoveryIntro: 'Reliez médinas, Atlas, musiques gnawa, artisanat, cuisine et routes sahariennes.',
    keyFacts: ['Rabat est la capitale', 'Fès, Marrakech, Meknès et Rabat sont des villes impériales', 'La culture amazighe est centrale dans l’identité du pays'],
    peoples: ['Amazighs', 'Arabes marocains', 'Communautés sahariennes'],
    languageNotes: 'L’arabe et l’amazighe sont langues officielles. La darija est très utilisée dans la vie quotidienne.',
    historyHighlights: ['Dynasties idrisside, almoravide, almohade, mérinide et alaouite', 'Villes impériales', 'Indépendance en 1956'],
    notableFigures: ['Ibn Battûta - voyageur', 'Fatima al-Fihriya - associée à la Qarawiyyin', 'Tayeb Saddiki - théâtre'],
    musicAndArts: ['Gnawa', 'Malhoun', 'Zellige', 'Tapis', 'Cuir'],
    foodCulture: ['Couscous', 'Tajine', 'Thé à la menthe', 'Pastilla'],
    oralTraditions: ['Poésie amazighe', 'Contes', 'Musiques confrériques'],
    knowledgeToPreserve: ['Artisanat de médina', 'Musiques gnawa', 'Savoirs amazighs', 'Architecture en terre'],
    relatedThemes: ['Maghreb', 'Médinas', 'Atlas', 'Artisanat', 'Gnawa'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'ET',
    name: 'Ethiopia',
    nameFr: 'Éthiopie',
    officialName: 'République démocratique fédérale d’Éthiopie',
    capital: 'Addis-Abeba',
    region: 'Afrique de l’Est',
    subregion: 'Corne de l’Afrique',
    languages: ['Amharique', 'Oromo', 'Tigrinya', 'Somali', 'Afar'],
    currency: 'Birr éthiopien',
    description: 'L’Éthiopie porte une histoire ancienne liée à Axoum, au christianisme oriental, aux hauts plateaux, aux manuscrits, au café et à la victoire d’Adwa. Addis-Abeba est aussi un centre diplomatique africain majeur.',
    culture: 'Café, injera, Église éthiopienne, musiques modales, alphasyllabaire guèze et mémoires d’Adwa forment des repères forts.',
    oneSentenceSummary: 'Une terre de hauts plateaux, de manuscrits, de café et de souveraineté historique.',
    discoveryIntro: 'Commencez par Axoum, Lalibela, Addis-Abeba, le café et la mémoire d’Adwa.',
    keyFacts: ['Addis-Abeba accueille le siège de l’Union africaine', 'Axoum fut une puissance antique', 'Adwa reste un symbole de souveraineté africaine'],
    peoples: ['Oromo', 'Amhara', 'Tigréens', 'Somali', 'Afar', 'Sidama'],
    languageNotes: 'L’amharique est langue fédérale de travail. Plusieurs langues régionales ont une forte importance politique et culturelle.',
    historyHighlights: ['Royaume d’Axoum', 'Christianisation ancienne', 'Églises de Lalibela', 'Victoire d’Adwa en 1896'],
    notableFigures: ['Menelik II - empereur', 'Taytu Betul - impératrice', 'Haile Selassie - empereur'],
    musicAndArts: ['Musiques éthiopiques', 'Manuscrits enluminés', 'Croix éthiopiennes', 'Danse eskista'],
    foodCulture: ['Injera', 'Doro wat', 'Café éthiopien', 'Berbere'],
    oralTraditions: ['Poésie religieuse', 'Récits royaux', 'Chants liturgiques'],
    knowledgeToPreserve: ['Cérémonie du café', 'Manuscrits', 'Architecture rupestre', 'Mémoires d’Adwa'],
    relatedThemes: ['Axoum', 'Adwa', 'Café', 'Manuscrits', 'Union africaine'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'KE',
    name: 'Kenya',
    nameFr: 'Kenya',
    officialName: 'Republic of Kenya',
    capital: 'Nairobi',
    region: 'Afrique de l’Est',
    subregion: 'Grands Lacs et côte swahilie',
    languages: ['Anglais', 'Swahili', 'Kikuyu', 'Luo', 'Kalenjin', 'Maasai'],
    currency: 'Shilling kényan',
    description: 'Le Kenya relie hauts plateaux, vallée du Rift, Nairobi, côte swahilie et traditions pastorales. Le pays est aussi associé à l’innovation numérique, à la course de fond, aux arts urbains et à la mémoire des luttes anticoloniales.',
    culture: 'Swahili, beadwork maasaï, littérature, tech de Nairobi, marathon et traditions côtières donnent au Kenya plusieurs visages.',
    oneSentenceSummary: 'Un carrefour est-africain entre savanes, côte swahilie, innovation et mémoires communautaires.',
    discoveryIntro: 'Reliez Nairobi, Mombasa, la vallée du Rift, les cultures pastorales et l’innovation numérique.',
    keyFacts: ['Nairobi est un hub régional', 'Le swahili est une grande langue de circulation est-africaine', 'La vallée du Rift porte une forte importance géographique et historique'],
    peoples: ['Kikuyu', 'Luhya', 'Luo', 'Kalenjin', 'Kamba', 'Maasai', 'Mijikenda'],
    languageNotes: 'Le swahili et l’anglais sont officiels. De nombreuses langues communautaires structurent les identités locales.',
    historyHighlights: ['Cités swahilies côtières', 'Période coloniale britannique', 'Révolte Mau Mau', 'Indépendance en 1963'],
    notableFigures: ['Wangari Maathai - militante écologiste', 'Jomo Kenyatta - leader politique', 'Ngũgĩ wa Thiong’o - écrivain'],
    musicAndArts: ['Benga', 'Beadwork', 'Littérature', 'Arts urbains'],
    foodCulture: ['Ugali', 'Nyama choma', 'Sukuma wiki', 'Thé kényan'],
    oralTraditions: ['Récits communautaires', 'Chants pastoraux', 'Proverbes swahili'],
    knowledgeToPreserve: ['Savoirs pastoraux', 'Côte swahilie', 'Écologie communautaire', 'Langues locales'],
    relatedThemes: ['Swahili', 'Rift', 'Écologie', 'Innovation', 'Course'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'TZ',
    name: 'Tanzania',
    nameFr: 'Tanzanie',
    officialName: 'République-Unie de Tanzanie',
    capital: 'Dodoma',
    region: 'Afrique de l’Est',
    subregion: 'Côte swahilie et Grands Lacs',
    languages: ['Swahili', 'Anglais', 'Chaga', 'Sukuma', 'Haya', 'Nyamwezi'],
    currency: 'Shilling tanzanien',
    description: 'La Tanzanie relie Kilimandjaro, Zanzibar, côte swahilie, Grands Lacs et mémoire du socialisme ujamaa. Dar es Salaam, Dodoma, Arusha et Stone Town donnent des entrées complémentaires sur commerce, politique, nature et culture.',
    culture: 'Swahili, taarab, sculpture makonde, épices de Zanzibar, récits de l’océan Indien et diversité communautaire structurent l’identité du pays.',
    oneSentenceSummary: 'Une porte de l’océan Indien où swahili, épices, montagnes et mémoires politiques se croisent.',
    discoveryIntro: 'Explorez Zanzibar, le Kilimandjaro, les musiques taarab, le swahili et les routes de commerce.',
    keyFacts: ['Dodoma est la capitale', 'Dar es Salaam reste un grand centre économique', 'Zanzibar porte une forte mémoire de l’océan Indien'],
    peoples: ['Sukuma', 'Chaga', 'Haya', 'Nyamwezi', 'Maasai', 'Makonde', 'Zanzibaris'],
    languageNotes: 'Le swahili est une langue nationale majeure et un symbole d’unité, avec de nombreuses langues communautaires.',
    historyHighlights: ['Cités swahilies', 'Sultanat de Zanzibar', 'Tanganyika et Zanzibar', 'Union en 1964'],
    notableFigures: ['Julius Nyerere - père de la nation', 'Bi Kidude - chanteuse taarab', 'Abdulrazak Gurnah - écrivain'],
    musicAndArts: ['Taarab', 'Bongo Flava', 'Sculpture makonde', 'Architecture swahilie'],
    foodCulture: ['Pilau', 'Ugali', 'Épices de Zanzibar', 'Poissons côtiers'],
    oralTraditions: ['Poésie swahilie', 'Contes côtiers', 'Chants communautaires'],
    knowledgeToPreserve: ['Culture swahilie', 'Sculpture makonde', 'Poésie', 'Savoirs maritimes'],
    relatedThemes: ['Swahili', 'Zanzibar', 'Kilimandjaro', 'Océan Indien', 'Ujamaa'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'ZA',
    name: 'South Africa',
    nameFr: 'Afrique du Sud',
    officialName: 'Republic of South Africa',
    capital: 'Pretoria',
    region: 'Afrique australe',
    subregion: 'Afrique australe',
    languages: ['Zulu', 'Xhosa', 'Afrikaans', 'Anglais', 'Sotho', 'Tswana', 'Venda'],
    currency: 'Rand sud-africain',
    description: 'L’Afrique du Sud porte une histoire complexe faite de royaumes, de migrations, de colonisation, d’apartheid et de reconstruction démocratique. Johannesburg, Cape Town, Durban, Pretoria et Soweto ouvrent des lectures urbaines, politiques, artistiques et mémorielles.',
    culture: 'Jazz, gumboot, littérature, townships, langues multiples, arts visuels et mémoire anti-apartheid composent une scène culturelle très forte.',
    oneSentenceSummary: 'Un pays de langues, de luttes et de création où la mémoire politique reste très présente.',
    discoveryIntro: 'Reliez Soweto, Robben Island, Johannesburg, musiques, littératures et récits de justice.',
    keyFacts: ['Le pays compte plusieurs langues officielles', 'Pretoria est la capitale administrative', 'La fin de l’apartheid marque l’histoire mondiale des droits humains'],
    peoples: ['Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Afrikaners', 'Coloured communities', 'Indiens sud-africains'],
    languageNotes: 'Le pays reconnaît onze langues officielles. Le zulu, le xhosa, l’afrikaans et l’anglais sont parmi les plus visibles.',
    historyHighlights: ['Royaumes zulu et xhosa', 'Colonisations néerlandaise et britannique', 'Apartheid', 'Élections démocratiques de 1994'],
    notableFigures: ['Nelson Mandela - président et résistant', 'Desmond Tutu - archevêque', 'Miriam Makeba - artiste'],
    musicAndArts: ['Jazz sud-africain', 'Gumboot', 'Kwaito', 'Arts visuels', 'Littérature'],
    foodCulture: ['Braaï', 'Bobotie', 'Bunny chow', 'Pap'],
    oralTraditions: ['Praise poetry', 'Récits de lutte', 'Chants de travail'],
    knowledgeToPreserve: ['Mémoire anti-apartheid', 'Langues locales', 'Musiques populaires', 'Archives communautaires'],
    relatedThemes: ['Apartheid', 'Justice', 'Jazz', 'Langues', 'Démocratie'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
  {
    id: 'CM',
    name: 'Cameroon',
    nameFr: 'Cameroun',
    officialName: 'République du Cameroun',
    capital: 'Yaoundé',
    region: 'Afrique centrale',
    subregion: 'Golfe de Guinée et hauts plateaux',
    languages: ['Français', 'Anglais', 'Fulfulde', 'Ewondo', 'Duala', 'Bassa', 'Bamileke'],
    currency: 'Franc CFA BEAC',
    description: 'Le Cameroun est souvent décrit comme une Afrique en miniature par sa diversité géographique, linguistique et culturelle. Littoral, hauts plateaux, forêt, savane, villes francophones et anglophones composent un espace très contrasté.',
    culture: 'Makossa, bikutsi, chefferies des Grassfields, masques, cuisine variée et football nourrissent une identité dense et populaire.',
    oneSentenceSummary: 'Un pays de grande diversité où langues, régions, musiques et cuisines changent vite d’un territoire à l’autre.',
    discoveryIntro: 'Reliez Douala, Yaoundé, les Grassfields, les musiques populaires, la cuisine et les chefferies.',
    keyFacts: ['Yaoundé est la capitale politique', 'Douala est un grand centre économique', 'Le pays a une double histoire francophone et anglophone'],
    peoples: ['Bamiléké', 'Beti', 'Duala', 'Bassa', 'Peul', 'Bamoun', 'Sawa'],
    languageNotes: 'Le français et l’anglais sont officiels. Les langues communautaires sont nombreuses et importantes dans les pratiques quotidiennes.',
    historyHighlights: ['Royaume bamoun', 'Présences allemandes, françaises et britanniques', 'Indépendance en 1960-1961', 'Réunification partielle'],
    notableFigures: ['Ruben Um Nyobè - figure politique', 'Manu Dibango - musicien', 'Francis Bebey - artiste et écrivain'],
    musicAndArts: ['Makossa', 'Bikutsi', 'Masques grassfields', 'Sculpture', 'Danse'],
    foodCulture: ['Ndolé', 'Poulet DG', 'Koki', 'Eru'],
    oralTraditions: ['Chefferies', 'Contes', 'Proverbes', 'Récits de lignage'],
    knowledgeToPreserve: ['Chefferies traditionnelles', 'Musiques populaires', 'Langues locales', 'Cuisine régionale'],
    relatedThemes: ['Diversité', 'Makossa', 'Chefferies', 'Forêt', 'Football'],
    sourceQuality: 'community',
    lastUpdated: '2026',
    sourceNotes,
    isActive: true,
  },
]

const seedProductionFoundation = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  let created = 0
  let updated = 0

  for (const country of countries) {
    const existing = await Country.findOne({ id: country.id })
    if (existing) {
      await Country.updateOne(
        { _id: existing._id },
        {
          $set: country,
          $setOnInsert: { views: 0 },
        }
      )
      updated++
    } else {
      await Country.create(country)
      created++
    }
  }

  const settings = await Settings.getSettings()
  settings.contactEmail = 'contact@monbaobab.com'
  settings.description = 'Un espace pour découvrir, transmettre et relier les cultures africaines avec soin.'
  await settings.save()

  const creator = await User.findOne({ role: 'admin', isActive: true }).sort({ createdAt: 1 }) ||
    await User.findOne({ isActive: true }).sort({ createdAt: 1 })

  if (creator) {
    let community = await Community.findOne({ name: 'Baobab' })
    if (!community) {
      community = await Community.create({
        name: 'Baobab',
        description: 'Le cercle commun de MonBaobab pour partager des savoirs, poser des questions et faire vivre la mémoire africaine au quotidien.',
        type: 'public',
        culture: 'Afrique',
        tags: ['monbaobab', 'transmission', 'culture', 'savoirs'],
        creator: creator._id,
        settings: {
          allowMemberPosts: true,
          requireApproval: false,
          allowInvitations: true,
        },
      })
    }

    await CommunityMember.updateOne(
      { community: community._id, user: creator._id },
      {
        $set: {
          role: 'owner',
          status: 'active',
          lastActive: new Date(),
        },
        $setOnInsert: {
          joinedAt: new Date(),
        },
      },
      { upsert: true }
    )

    const starterPosts = [
      {
        content: 'Bienvenue dans le cercle Baobab. Ici, on peut poser une question, proposer une source, partager un souvenir familial ou signaler un savoir culturel à préserver. Le plus important: rester précis, respectueux et utile aux autres.',
        category: 'Discussion',
        tags: ['accueil', 'communauté', 'transmission'],
      },
      {
        content: 'Idée de contribution: choisissez un pays, ajoutez une tradition, un plat, une figure ou un proverbe, puis indiquez ce que vous savez de la source. Même une petite contribution bien située peut aider quelqu’un à découvrir autrement.',
        category: 'Partage',
        tags: ['contribution', 'sources', 'pays'],
      },
      {
        content: 'Question ouverte: quel savoir de votre famille, de votre ville ou de votre pays mérite d’être mieux documenté sur MonBaobab ? Une chanson, une pratique, un lieu, un mot, un artisanat, une histoire ?',
        category: 'Question',
        tags: ['question', 'mémoire', 'famille'],
      },
    ]

    for (const post of starterPosts) {
      const existing = await CommunityPost.findOne({
        community: community._id,
        content: post.content,
      })
      if (!existing) {
        await CommunityPost.create({
          ...post,
          community: community._id,
          author: creator._id,
          isApproved: true,
        })
      }
    }

    community.memberCount = await CommunityMember.countDocuments({ community: community._id, status: 'active' })
    community.postCount = await CommunityPost.countDocuments({ community: community._id, isApproved: true })
    await community.save()
  }

  logger.info(`Socle pays production: ${created} créé(s), ${updated} mis à jour`)
  return { created, updated }
}

export { seedProductionFoundation }

if (process.argv[1] && process.argv[1].includes('seedProductionFoundation.js')) {
  seedProductionFoundation()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error('Erreur pendant le seed production foundation', { message: error.message, stack: error.stack })
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      process.exit(1)
    })
}
