// Données complètes des 54 pays africains avec coordonnées ajustées pour la carte réaliste

export interface AfricanCountry {
  id: string
  name: string
  nameFr: string
  capital: string
  population: string
  area: string
  languages: string[]
  currency: string
  description: string
  culture: string
  color: string
  svgPath?: string // Path SVG pour la forme du pays
  center: [number, number] // [x, y] pour le centre du pays sur la carte (0-1000)
  // Nouvelles propriétés pour la page détaillée
  rites?: string[]
  customs?: string[]
  foods?: string[]
  traditions?: string[]
  festivals?: string[]
  arts?: string[]
}

export const allAfricanCountries: AfricanCountry[] = [
  // Afrique du Nord
  { 
    id: 'MA', 
    name: 'Morocco', 
    nameFr: 'Maroc', 
    capital: 'Rabat', 
    population: '37M', 
    area: '447K km²', 
    languages: ['Arabe', 'Amazigh'], 
    currency: 'Dirham', 
    description: 'Carrefour entre Afrique et Europe', 
    culture: 'Le Maroc est un pays riche en traditions millénaires, où se mêlent influences arabes, berbères et africaines. L\'architecture mauresque avec ses palais, mosquées et médinas témoigne d\'un héritage artistique exceptionnel. La musique gnawa, classée au patrimoine immatériel de l\'UNESCO, résonne dans les rues avec ses rythmes hypnotiques et ses chants spirituels.', 
    color: '#8E44AD', 
    center: [140, 120],
    rites: [
      'Cérémonie du thé à la menthe (rituel d\'hospitalité)',
      'Mariage traditionnel avec henné et musique',
      'Fête de l\'Aïd al-Adha (sacrifice rituel)',
      'Cérémonie de circoncision (rite de passage)'
    ],
    customs: [
      'Hospitalité légendaire (offrir le thé à tout visiteur)',
      'Respect des aînés et de la hiérarchie familiale',
      'Prière cinq fois par jour',
      'Jeûne du Ramadan',
      'Port du djellaba et du caftan traditionnel'
    ],
    foods: [
      'Couscous royal (semoule avec viande et légumes)',
      'Tajine (plat mijoté dans un plat en terre cuite)',
      'Pastilla (feuilleté sucré-salé au pigeon)',
      'Harira (soupe traditionnelle du Ramadan)',
      'Méchoui (agneau rôti entier)',
      'Thé à la menthe (boisson nationale)'
    ],
    festivals: [
      'Festival des Musiques Sacrées de Fès',
      'Festival Gnaoua d\'Essaouira',
      'Festival des Roses de Kelaa M\'Gouna',
      'Moussem de Tan-Tan (patrimoine UNESCO)'
    ],
    arts: [
      'Zellige (mosaïques en céramique)',
      'Tapis berbères (tissages traditionnels)',
      'Poterie de Safi et Fès',
      'Calligraphie arabe',
      'Bijoux berbères en argent'
    ]
  },
  { id: 'DZ', name: 'Algeria', nameFr: 'Algérie', capital: 'Alger', population: '44M', area: '2,38M km²', languages: ['Arabe', 'Tamazight'], currency: 'Dinar', description: 'Plus grand pays d\'Afrique', culture: 'Culture berbère, musique raï', color: '#4A90E2', center: [290, 210] },
  { id: 'TN', name: 'Tunisia', nameFr: 'Tunisie', capital: 'Tunis', population: '12M', area: '163K km²', languages: ['Arabe'], currency: 'Dinar', description: 'Pays de la révolution du jasmin', culture: 'Culture méditerranéenne, mosaïques', color: '#3498DB', center: [310, 135] },
  { id: 'LY', name: 'Libya', nameFr: 'Libye', capital: 'Tripoli', population: '7M', area: '1,76M km²', languages: ['Arabe'], currency: 'Dinar', description: 'Pays du désert et de l\'histoire', culture: 'Culture arabe, architecture ancienne', color: '#E67E22', center: [475, 190] },
  { id: 'EG', name: 'Egypt', nameFr: 'Égypte', capital: 'Le Caire', population: '109M', area: '1,01M km²', languages: ['Arabe'], currency: 'Livre', description: 'Berceau de la civilisation pharaonique', culture: 'Civilisation antique, art islamique', color: '#F39C12', center: [645, 155] },
  { id: 'SD', name: 'Sudan', nameFr: 'Soudan', capital: 'Khartoum', population: '45M', area: '1,88M km²', languages: ['Arabe', 'Anglais'], currency: 'Livre', description: 'Pays des pyramides de Méroé', culture: 'Culture nubienne, musique traditionnelle', color: '#16A085', center: [625, 350] },
  { id: 'SS', name: 'South Sudan', nameFr: 'Soudan du Sud', capital: 'Juba', population: '11M', area: '619K km²', languages: ['Anglais'], currency: 'Livre', description: 'Plus jeune pays d\'Afrique', culture: 'Diversité ethnique, traditions pastorales', color: '#1ABC9C', center: [640, 435] },
  { id: 'EH', name: 'Western Sahara', nameFr: 'Sahara occidental', capital: 'Laâyoune', population: '600K', area: '266K km²', languages: ['Arabe'], currency: 'Dirham', description: 'Territoire disputé', culture: 'Culture sahraouie', color: '#8E44AD', center: [200, 315] },
  
  // Afrique de l'Ouest
  { id: 'MR', name: 'Mauritania', nameFr: 'Mauritanie', capital: 'Nouakchott', population: '5M', area: '1,03M km²', languages: ['Arabe', 'Français'], currency: 'Ouguiya', description: 'Pays du désert', culture: 'Culture maure, musique traditionnelle', color: '#8E44AD', center: [175, 275] },
  { 
    id: 'SN', 
    name: 'Senegal', 
    nameFr: 'Sénégal', 
    capital: 'Dakar', 
    population: '17M', 
    area: '197K km²', 
    languages: ['Français', 'Wolof'], 
    currency: 'Franc CFA', 
    description: 'Terre de la Teranga', 
    culture: 'Le Sénégal incarne l\'esprit de la Teranga, une hospitalité légendaire qui fait de ce pays une destination chaleureuse. La musique mbalax, popularisée par Youssou N\'Dour, rythme la vie quotidienne. La lutte sénégalaise, sport national, combine force physique et traditions spirituelles. Dakar, capitale culturelle, vibre au rythme de ses marchés colorés et de sa scène artistique dynamique.', 
    color: '#E67E22', 
    center: [135, 415],
    rites: [
      'Cérémonie de circoncision (rite de passage)',
      'Mariage traditionnel avec dot et cérémonies',
      'Cérémonie de baptême (nommage)',
      'Rites funéraires avec griots et tambours'
    ],
    customs: [
      'Teranga (hospitalité sacrée)',
      'Respect des griots (conteurs traditionnels)',
      'Cérémonie du thé (trois services)',
      'Salutations respectueuses et formelles',
      'Port du boubou traditionnel'
    ],
    foods: [
      'Thieboudienne (riz au poisson, plat national)',
      'Yassa (poulet ou poisson mariné au citron)',
      'Mafé (sauce à l\'arachide avec viande)',
      'Pastels (beignets de poisson)',
      'Bissap (jus d\'hibiscus)',
      'Thiakry (dessert au mil et yaourt)'
    ],
    festivals: [
      'Festival International de Jazz de Saint-Louis',
      'Festival des Arts Nègres (FESMAN)',
      'Festival du Sahel à Dakar',
      'Festival de la Kora à Kaolack'
    ],
    arts: [
      'Sculptures en bois (masques et statuettes)',
      'Tissus wax et bazin',
      'Peinture sous-verre',
      'Bijoux en or et corail',
      'Poterie traditionnelle'
    ]
  },
  { id: 'GM', name: 'Gambia', nameFr: 'Gambie', capital: 'Banjul', population: '2M', area: '11K km²', languages: ['Anglais'], currency: 'Dalasi', description: 'Plus petit pays d\'Afrique continentale', culture: 'Musique traditionnelle', color: '#16A085', center: [125, 445] },
  { id: 'GW', name: 'Guinea-Bissau', nameFr: 'Guinée-Bissau', capital: 'Bissau', population: '2M', area: '36K km²', languages: ['Portugais'], currency: 'Franc CFA', description: 'Petit pays lusophone', culture: 'Musique traditionnelle', color: '#16A085', center: [150, 500] },
  { id: 'GN', name: 'Guinea', nameFr: 'Guinée', capital: 'Conakry', population: '13M', area: '246K km²', languages: ['Français'], currency: 'Franc', description: 'Pays de la bauxite', culture: 'Musique mandingue, traditions', color: '#3498DB', center: [230, 480] },
  { id: 'SL', name: 'Sierra Leone', nameFr: 'Sierra Leone', capital: 'Freetown', population: '8M', area: '72K km²', languages: ['Anglais'], currency: 'Leone', description: 'Pays des diamants', culture: 'Musique traditionnelle', color: '#F39C12', center: [240, 525] },
  { id: 'LR', name: 'Liberia', nameFr: 'Libéria', capital: 'Monrovia', population: '5M', area: '111K km²', languages: ['Anglais'], currency: 'Dollar', description: 'Première république d\'Afrique', culture: 'Traditions américano-libériennes', color: '#E67E22', center: [315, 545] },
  { id: 'CI', name: 'Ivory Coast', nameFr: 'Côte d\'Ivoire', capital: 'Yamoussoukro', population: '28M', area: '322K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Premier producteur de cacao', culture: 'Musique coupé-décalé, zouglou', color: '#F39C12', center: [335, 600] },
  { 
    id: 'GH', 
    name: 'Ghana', 
    nameFr: 'Ghana', 
    capital: 'Accra', 
    population: '32M', 
    area: '239K km²', 
    languages: ['Anglais'], 
    currency: 'Cedi', 
    description: 'Premier pays indépendant d\'Afrique', 
    culture: 'Le Ghana, premier pays d\'Afrique subsaharienne à obtenir son indépendance, est un symbole de liberté et de fierté africaine. La musique highlife, née dans les années 1920, continue d\'influencer la scène musicale mondiale. Le tissu kente, aux motifs géométriques colorés, est porté lors des grandes occasions et représente l\'identité culturelle ghanéenne.', 
    color: '#F1C40F', 
    center: [480, 640],
    rites: [
      'Funérailles traditionnelles (cérémonies élaborées)',
      'Cérémonie de nommage (8 jours après la naissance)',
      'Rite de puberté (passage à l\'âge adulte)',
      'Cérémonie de mariage avec dot'
    ],
    customs: [
      'Respect des chefs traditionnels (Asantehene)',
      'Port du kente lors des grandes occasions',
      'Cérémonie d\'hommage aux ancêtres',
      'Système de clans et lignages',
      'Hospitalité proverbiale'
    ],
    foods: [
      'Jollof rice (riz épicé, plat national)',
      'Fufu (pâte de plantain et igname)',
      'Banku et tilapia (poisson grillé)',
      'Red red (haricots rouges avec plantain)',
      'Kelewele (plantain épicé frit)',
      'Palm wine (vin de palme)'
    ],
    festivals: [
      'Festival de Homowo (Ga)',
      'Festival d\'Aboakyir (Winneba)',
      'Festival de Panafest (panafricanisme)',
      'Festival de Chale Wote (arts urbains)'
    ],
    arts: [
      'Tissu kente (tissage traditionnel)',
      'Sculptures Akan (or et bronze)',
      'Adinkra (symboles imprimés)',
      'Poterie et céramique',
      'Bijoux en or (tradition Ashanti)'
    ]
  },
  { id: 'TG', name: 'Togo', nameFr: 'Togo', capital: 'Lomé', population: '8M', area: '57K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Petit pays, grande culture', culture: 'Vaudou, artisanat', color: '#16A085', center: [515, 665] },
  { id: 'BJ', name: 'Benin', nameFr: 'Bénin', capital: 'Porto-Novo', population: '13M', area: '115K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Berceau du vaudou', culture: 'Vaudou, royaume du Dahomey', color: '#3498DB', center: [575, 645] },
  { id: 'NG', name: 'Nigeria', nameFr: 'Nigeria', capital: 'Abuja', population: '223M', area: '924K km²', languages: ['Anglais'], currency: 'Naira', description: 'Pays le plus peuplé d\'Afrique', culture: 'Nollywood, afrobeat', color: '#27AE60', center: [540, 650] },
  { id: 'NE', name: 'Niger', nameFr: 'Niger', capital: 'Niamey', population: '25M', area: '1,27M km²', languages: ['Français'], currency: 'Franc CFA', description: 'Pays du désert du Sahara', culture: 'Culture touarègue, musique traditionnelle', color: '#E74C3C', center: [505, 440] },
  { id: 'ML', name: 'Mali', nameFr: 'Mali', capital: 'Bamako', population: '21M', area: '1,24M km²', languages: ['Français'], currency: 'Franc CFA', description: 'Ancien Empire du Mali', culture: 'Musique mandingue, griots', color: '#F39C12', center: [350, 350] },
  { id: 'BF', name: 'Burkina Faso', nameFr: 'Burkina Faso', capital: 'Ouagadougou', population: '21M', area: '274K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Pays des hommes intègres', culture: 'Cinéma africain, masques', color: '#27AE60', center: [400, 505] },
  { id: 'TD', name: 'Chad', nameFr: 'Tchad', capital: 'N\'Djamena', population: '17M', area: '1,28M km²', languages: ['Français', 'Arabe'], currency: 'Franc CFA', description: 'Pays du lac Tchad', culture: 'Diversité ethnique, traditions nomades', color: '#E74C3C', center: [555, 445] },
  
  // Afrique Centrale
  { id: 'CM', name: 'Cameroon', nameFr: 'Cameroun', capital: 'Yaoundé', population: '27M', area: '475K km²', languages: ['Français', 'Anglais'], currency: 'Franc CFA', description: 'Afrique en miniature', culture: 'Musique makossa, football', color: '#3498DB', center: [520, 680] },
  { id: 'CF', name: 'Central African Republic', nameFr: 'République centrafricaine', capital: 'Bangui', population: '5M', area: '623K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Cœur de l\'Afrique', culture: 'Musique traditionnelle, pygmées', color: '#16A085', center: [600, 575] },
  { id: 'GQ', name: 'Equatorial Guinea', nameFr: 'Guinée équatoriale', capital: 'Malabo', population: '1M', area: '28K km²', languages: ['Espagnol', 'Français'], currency: 'Franc CFA', description: 'Petit pays riche en pétrole', culture: 'Traditions bantoues', color: '#E67E22', center: [500, 720] },
  { id: 'GA', name: 'Gabon', nameFr: 'Gabon', capital: 'Libreville', population: '2M', area: '268K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Pays de la forêt équatoriale', culture: 'Masques, traditions bantoues', color: '#27AE60', center: [540, 760] },
  { id: 'CG', name: 'Congo', nameFr: 'Congo', capital: 'Brazzaville', population: '6M', area: '342K km²', languages: ['Français'], currency: 'Franc CFA', description: 'Pays de la rumba', culture: 'Musique rumba, traditions bantoues', color: '#E67E22', center: [600, 775] },
  { id: 'CD', name: 'DR Congo', nameFr: 'RD Congo', capital: 'Kinshasa', population: '95M', area: '2,34M km²', languages: ['Français'], currency: 'Franc', description: 'Deuxième plus grand pays d\'Afrique', culture: 'Musique soukous, rumba congolaise', color: '#C0392B', center: [625, 750] },
  { id: 'AO', name: 'Angola', nameFr: 'Angola', capital: 'Luanda', population: '34M', area: '1,25M km²', languages: ['Portugais'], currency: 'Kwanza', description: 'Pays du pétrole et des diamants', culture: 'Musique kizomba, semba', color: '#E74C3C', center: [535, 850] },
  { id: 'ST', name: 'Sao Tome and Principe', nameFr: 'São Tomé-et-Príncipe', capital: 'São Tomé', population: '200K', area: '964 km²', languages: ['Portugais'], currency: 'Dobra', description: 'Îles équatoriales', culture: 'Traditions portugaises', color: '#27AE60', center: [465, 768] },
  { id: 'CV', name: 'Cape Verde', nameFr: 'Cap-Vert', capital: 'Praia', population: '600K', area: '4K km²', languages: ['Portugais'], currency: 'Escudo', description: 'Archipel atlantique', culture: 'Musique morna, traditions', color: '#F39C12', center: [85, 450] },
  
  // Afrique de l'Est
  { id: 'ER', name: 'Eritrea', nameFr: 'Érythrée', capital: 'Asmara', population: '4M', area: '118K km²', languages: ['Tigrinya'], currency: 'Nakfa', description: 'Pays de la mer Rouge', culture: 'Architecture italienne, traditions', color: '#E74C3C', center: [725, 240] },
  { id: 'ET', name: 'Ethiopia', nameFr: 'Éthiopie', capital: 'Addis-Abeba', population: '120M', area: '1,10M km²', languages: ['Amharique'], currency: 'Birr', description: 'Pays qui n\'a jamais été colonisé', culture: 'Musique éthiopienne, églises rupestres', color: '#C0392B', center: [750, 350] },
  { id: 'DJ', name: 'Djibouti', nameFr: 'Djibouti', capital: 'Djibouti', population: '1M', area: '23K km²', languages: ['Français', 'Arabe'], currency: 'Franc', description: 'Carrefour stratégique', culture: 'Culture somalie, traditions nomades', color: '#3498DB', center: [800, 300] },
  { id: 'SO', name: 'Somalia', nameFr: 'Somalie', capital: 'Mogadiscio', population: '17M', area: '638K km²', languages: ['Somali'], currency: 'Shilling', description: 'Pays de la Corne de l\'Afrique', culture: 'Poésie somalie, traditions nomades', color: '#F39C12', center: [860, 500] },
  { id: 'KE', name: 'Kenya', nameFr: 'Kenya', capital: 'Nairobi', population: '55M', area: '580K km²', languages: ['Anglais', 'Swahili'], currency: 'Shilling', description: 'Pays de la grande migration', culture: 'Musique benga, marathon', color: '#16A085', center: [800, 600] },
  { id: 'UG', name: 'Uganda', nameFr: 'Ouganda', capital: 'Kampala', population: '47M', area: '241K km²', languages: ['Anglais', 'Swahili'], currency: 'Shilling', description: 'Perle de l\'Afrique', culture: 'Musique traditionnelle, danse', color: '#27AE60', center: [790, 640] },
  { id: 'RW', name: 'Rwanda', nameFr: 'Rwanda', capital: 'Kigali', population: '13M', area: '26K km²', languages: ['Kinyarwanda', 'Français'], currency: 'Franc', description: 'Pays des mille collines', culture: 'Danse traditionnelle, artisanat', color: '#E74C3C', center: [775, 670] },
  { id: 'BI', name: 'Burundi', nameFr: 'Burundi', capital: 'Gitega', population: '12M', area: '28K km²', languages: ['Kirundi', 'Français'], currency: 'Franc', description: 'Pays des tambours', culture: 'Tambours sacrés, danse', color: '#C0392B', center: [775, 715] },
  { id: 'TZ', name: 'Tanzania', nameFr: 'Tanzanie', capital: 'Dodoma', population: '63M', area: '947K km²', languages: ['Swahili', 'Anglais'], currency: 'Shilling', description: 'Pays du Kilimandjaro', culture: 'Musique taraab, art tingatinga', color: '#1ABC9C', center: [800, 800] },
  { id: 'MW', name: 'Malawi', nameFr: 'Malawi', capital: 'Lilongwe', population: '20M', area: '118K km²', languages: ['Anglais', 'Chichewa'], currency: 'Kwacha', description: 'Pays du lac Malawi', culture: 'Musique traditionnelle', color: '#3498DB', center: [775, 785] },
  { id: 'ZM', name: 'Zambia', nameFr: 'Zambie', capital: 'Lusaka', population: '19M', area: '753K km²', languages: ['Anglais'], currency: 'Kwacha', description: 'Pays du cuivre', culture: 'Musique traditionnelle', color: '#F39C12', center: [700, 850] },
  { id: 'ZW', name: 'Zimbabwe', nameFr: 'Zimbabwe', capital: 'Harare', population: '15M', area: '391K km²', languages: ['Anglais'], currency: 'Dollar', description: 'Pays des ruines du Grand Zimbabwe', culture: 'Sculpture shona, musique', color: '#E67E22', center: [740, 915] },
  { id: 'BW', name: 'Botswana', nameFr: 'Botswana', capital: 'Gaborone', population: '2M', area: '582K km²', languages: ['Anglais', 'Setswana'], currency: 'Pula', description: 'Pays du delta de l\'Okavango', culture: 'Traditions tswana, safari', color: '#16A085', center: [650, 915] },
  { id: 'MZ', name: 'Mozambique', nameFr: 'Mozambique', capital: 'Maputo', population: '32M', area: '801K km²', languages: ['Portugais'], currency: 'Metical', description: 'Pays de la côte de l\'océan Indien', culture: 'Musique marrabenta', color: '#E74C3C', center: [800, 975] },
  { id: 'MG', name: 'Madagascar', nameFr: 'Madagascar', capital: 'Antananarivo', population: '28M', area: '587K km²', languages: ['Malgache', 'Français'], currency: 'Ariary', description: 'Île aux trésors uniques', culture: 'Musique salegy, traditions malgaches', color: '#27AE60', center: [940, 1000] },
  
  // Afrique Australe
  { id: 'ZA', name: 'South Africa', nameFr: 'Afrique du Sud', capital: 'Pretoria', population: '60M', area: '1,22M km²', languages: ['Anglais', 'Afrikaans'], currency: 'Rand', description: 'Nation arc-en-ciel', culture: 'Musique jazz, vin, safari', color: '#E74C3C', center: [660, 1035] },
  { id: 'LS', name: 'Lesotho', nameFr: 'Lesotho', capital: 'Maseru', population: '2M', area: '30K km²', languages: ['Sesotho', 'Anglais'], currency: 'Loti', description: 'Royaume dans le ciel', culture: 'Traditions basotho, artisanat', color: '#3498DB', center: [665, 1025] },
  { id: 'SZ', name: 'Eswatini', nameFr: 'Eswatini', capital: 'Mbabane', population: '1M', area: '17K km²', languages: ['Swati', 'Anglais'], currency: 'Lilangeni', description: 'Petit royaume montagneux', culture: 'Traditions swazi, danse', color: '#F39C12', center: [700, 1035] },
  { id: 'NA', name: 'Namibia', nameFr: 'Namibie', capital: 'Windhoek', population: '3M', area: '825K km²', languages: ['Anglais'], currency: 'Dollar', description: 'Pays des dunes et du désert', culture: 'Art rupestre, traditions', color: '#E67E22', center: [600, 990] },
  
  // Îles
  { id: 'MU', name: 'Mauritius', nameFr: 'Maurice', capital: 'Port Louis', population: '1M', area: '2K km²', languages: ['Anglais', 'Français'], currency: 'Roupie', description: 'Perle de l\'océan Indien', culture: 'Sega, diversité culturelle', color: '#8E44AD', center: [925, 975] },
  { id: 'SC', name: 'Seychelles', nameFr: 'Seychelles', capital: 'Victoria', population: '100K', area: '455 km²', languages: ['Créole', 'Anglais'], currency: 'Roupie', description: 'Archipel paradisiaque', culture: 'Musique créole, traditions', color: '#3498DB', center: [925, 725] },
  { id: 'KM', name: 'Comoros', nameFr: 'Comores', capital: 'Moroni', population: '900K', area: '1,9K km²', languages: ['Comorien', 'Français'], currency: 'Franc', description: 'Archipel volcanique', culture: 'Musique traditionnelle', color: '#16A085', center: [875, 725] },
]

// Fonction pour obtenir un pays par son ID
export const getCountryById = (id: string): AfricanCountry | undefined => {
  return allAfricanCountries.find(country => country.id === id)
}

// Fonction pour obtenir tous les pays
export const getAllCountries = (): AfricanCountry[] => {
  return allAfricanCountries
}

// Fonction pour obtenir les pays par région
export const getCountriesByRegion = (_region: string): AfricanCountry[] => {
  // Cette fonction peut être étendue pour grouper par région
  return allAfricanCountries
}
