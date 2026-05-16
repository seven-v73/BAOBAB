export interface CountryMapPlace {
  name: string
  type: 'capital' | 'economic' | 'historic' | 'cultural' | 'natural' | 'port'
  coordinates: [number, number]
  description: string
  highlight?: string
}

export const countryMapPlaces: Record<string, CountryMapPlace[]> = {
  DZ: [
    { name: 'Alger', type: 'capital', coordinates: [36.7538, 3.0588], description: 'Capitale ouverte sur la Méditerranée, connue pour la Casbah, les institutions et la vie culturelle.', highlight: 'Casbah, port, institutions' },
    { name: 'Oran', type: 'port', coordinates: [35.6971, -0.6308], description: 'Grande ville portuaire de l’ouest, associée au raï, au commerce et aux influences méditerranéennes.' },
    { name: 'Constantine', type: 'historic', coordinates: [36.365, 6.6147], description: 'Ville des ponts et des reliefs, importante dans l’histoire urbaine et savante algérienne.' },
  ],
  AO: [
    { name: 'Luanda', type: 'capital', coordinates: [-8.839, 13.2894], description: 'Capitale littorale, centre politique, économique et musical de l’Angola.' },
    { name: 'Huambo', type: 'cultural', coordinates: [-12.7761, 15.7392], description: 'Ville des hauts plateaux, carrefour agricole et culturel du centre.' },
    { name: 'Benguela', type: 'port', coordinates: [-12.5763, 13.4055], description: 'Ville côtière liée au chemin de fer, aux échanges et à l’Atlantique.' },
  ],
  BJ: [
    { name: 'Porto-Novo', type: 'capital', coordinates: [6.4969, 2.6289], description: 'Capitale administrative, marquée par les patrimoines yoruba, goun et afro-brésilien.' },
    { name: 'Cotonou', type: 'economic', coordinates: [6.3703, 2.3912], description: 'Principal pôle économique, portuaire et urbain du pays.' },
    { name: 'Abomey', type: 'historic', coordinates: [7.1829, 1.9912], description: 'Ancienne capitale du royaume du Dahomey, connue pour ses palais royaux.' },
  ],
  BF: [
    { name: 'Ouagadougou', type: 'capital', coordinates: [12.3714, -1.5197], description: 'Capitale politique et culturelle, connue pour le FESPACO et les arts vivants.' },
    { name: 'Bobo-Dioulasso', type: 'cultural', coordinates: [11.1784, -4.2979], description: 'Ville musicale et commerçante, forte de traditions mandingues et bobo.' },
    { name: 'Banfora', type: 'natural', coordinates: [10.6333, -4.7667], description: 'Porte des Cascades, des dômes de Fabédougou et du lac de Tengrela.' },
  ],
  BI: [
    { name: 'Gitega', type: 'capital', coordinates: [-3.4264, 29.9306], description: 'Capitale politique au cœur du pays, proche de traditions royales et tambourinaires.' },
    { name: 'Bujumbura', type: 'economic', coordinates: [-3.3614, 29.3599], description: 'Grande ville sur le lac Tanganyika, centre économique et portuaire.' },
  ],
  BW: [
    { name: 'Gaborone', type: 'capital', coordinates: [-24.6282, 25.9231], description: 'Capitale administrative et économique du Botswana.' },
    { name: 'Maun', type: 'natural', coordinates: [-19.9833, 23.4167], description: 'Porte du delta de l’Okavango et des circuits de conservation.' },
    { name: 'Francistown', type: 'economic', coordinates: [-21.17, 27.5079], description: 'Ville du nord-est liée aux mines, aux routes et aux échanges régionaux.' },
  ],
  CD: [
    { name: 'Kinshasa', type: 'capital', coordinates: [-4.4419, 15.2663], description: 'Capitale sur le fleuve Congo, immense centre musical, politique et urbain.' },
    { name: 'Lubumbashi', type: 'economic', coordinates: [-11.6647, 27.4794], description: 'Pôle minier et industriel du Katanga.' },
    { name: 'Kisangani', type: 'historic', coordinates: [0.5167, 25.2], description: 'Ville fluviale importante dans l’histoire commerciale du bassin du Congo.' },
  ],
  CF: [
    { name: 'Bangui', type: 'capital', coordinates: [4.3947, 18.5582], description: 'Capitale sur l’Oubangui, point d’entrée culturel et administratif du pays.' },
    { name: 'Bambari', type: 'economic', coordinates: [5.7679, 20.6757], description: 'Ville du centre, liée aux routes intérieures et aux échanges agricoles.' },
  ],
  CG: [
    { name: 'Brazzaville', type: 'capital', coordinates: [-4.2634, 15.2429], description: 'Capitale au bord du fleuve Congo, face à Kinshasa.' },
    { name: 'Pointe-Noire', type: 'port', coordinates: [-4.7692, 11.8664], description: 'Grand port atlantique et centre économique majeur.' },
  ],
  CI: [
    { name: 'Yamoussoukro', type: 'capital', coordinates: [6.8276, -5.2893], description: 'Capitale politique au centre du pays, connue pour la basilique Notre-Dame de la Paix.', highlight: 'Capitale politique' },
    { name: 'Abidjan', type: 'economic', coordinates: [5.36, -4.0083], description: 'Métropole économique, culturelle et lagunaire, cœur des médias, de la musique et des affaires.', highlight: 'Plateau, Cocody, lagune' },
    { name: 'Grand-Bassam', type: 'historic', coordinates: [5.2118, -3.7388], description: 'Ville historique classée par l’UNESCO, mémoire coloniale, littorale et artisanale.' },
    { name: 'Bouaké', type: 'cultural', coordinates: [7.6906, -5.0391], description: 'Grande ville du centre, carrefour commercial et culturel.' },
    { name: 'Man', type: 'natural', coordinates: [7.4125, -7.5538], description: 'Ville des montagnes de l’ouest, proche des cascades, ponts de lianes et masques.' },
  ],
  CM: [
    { name: 'Yaoundé', type: 'capital', coordinates: [3.848, 11.5021], description: 'Capitale politique sur les collines du Centre.' },
    { name: 'Douala', type: 'economic', coordinates: [4.0511, 9.7679], description: 'Grand port, capitale économique et scène culturelle majeure.' },
    { name: 'Bamenda', type: 'cultural', coordinates: [5.9631, 10.1591], description: 'Ville des hauts plateaux, liée aux cultures grassfields.' },
  ],
  CV: [
    { name: 'Praia', type: 'capital', coordinates: [14.933, -23.5133], description: 'Capitale de Santiago, centre politique et urbain de l’archipel.' },
    { name: 'Mindelo', type: 'port', coordinates: [16.8901, -24.9804], description: 'Ville portuaire de São Vicente, haut lieu de musique et de morna.' },
  ],
  DJ: [
    { name: 'Djibouti', type: 'capital', coordinates: [11.5721, 43.1456], description: 'Capitale portuaire stratégique entre mer Rouge et océan Indien.' },
    { name: 'Tadjourah', type: 'historic', coordinates: [11.7878, 42.8844], description: 'Ancienne ville côtière, porte vers le golfe et les paysages volcaniques.' },
  ],
  EG: [
    { name: 'Le Caire', type: 'capital', coordinates: [30.0444, 31.2357], description: 'Mégapole du Nil, proche de Gizeh, capitale politique et culturelle.' },
    { name: 'Alexandrie', type: 'port', coordinates: [31.2001, 29.9187], description: 'Ville méditerranéenne liée aux savoirs antiques, au port et aux échanges.' },
    { name: 'Louxor', type: 'historic', coordinates: [25.6872, 32.6396], description: 'Ville des temples et nécropoles de l’Égypte antique.' },
  ],
  ER: [
    { name: 'Asmara', type: 'capital', coordinates: [15.3229, 38.9251], description: 'Capitale des hauts plateaux, connue pour son architecture moderniste.' },
    { name: 'Massawa', type: 'port', coordinates: [15.6097, 39.45], description: 'Port historique de la mer Rouge.' },
  ],
  EH: [
    { name: 'Laâyoune', type: 'capital', coordinates: [27.1536, -13.2033], description: 'Principal centre urbain du Sahara occidental, au cœur des routes sahariennes atlantiques.' },
    { name: 'Dakhla', type: 'port', coordinates: [23.6848, -15.958], description: 'Ville littorale connue pour sa baie, la pêche et les paysages désert-océan.' },
  ],
  ET: [
    { name: 'Addis-Abeba', type: 'capital', coordinates: [8.9806, 38.7578], description: 'Capitale fédérale et siège de l’Union africaine.' },
    { name: 'Lalibela', type: 'historic', coordinates: [12.0316, 39.0476], description: 'Ville des églises taillées dans la roche.' },
    { name: 'Axoum', type: 'historic', coordinates: [14.1319, 38.7193], description: 'Ancien centre du royaume d’Axoum et de ses stèles.' },
  ],
  GA: [
    { name: 'Libreville', type: 'capital', coordinates: [0.4162, 9.4673], description: 'Capitale littorale entre Atlantique, institutions et cultures urbaines.' },
    { name: 'Lambaréné', type: 'historic', coordinates: [-0.7001, 10.2406], description: 'Ville sur l’Ogooué, liée aux circulations fluviales.' },
  ],
  GH: [
    { name: 'Accra', type: 'capital', coordinates: [5.6037, -0.187], description: 'Capitale dynamique, centre artistique, politique et entrepreneurial.' },
    { name: 'Kumasi', type: 'historic', coordinates: [6.6666, -1.6163], description: 'Cœur historique ashanti, lié au kente, au royaume et aux marchés.' },
    { name: 'Cape Coast', type: 'historic', coordinates: [5.1053, -1.2466], description: 'Ville côtière de mémoire, connue pour son château et son histoire atlantique.' },
  ],
  GM: [
    { name: 'Banjul', type: 'capital', coordinates: [13.4549, -16.579], description: 'Capitale à l’embouchure du fleuve Gambie.' },
    { name: 'Serekunda', type: 'economic', coordinates: [13.4383, -16.6781], description: 'Grand centre urbain et commercial.' },
  ],
  GN: [
    { name: 'Conakry', type: 'capital', coordinates: [9.6412, -13.5784], description: 'Capitale côtière et portuaire, centre musical et politique.' },
    { name: 'Kankan', type: 'cultural', coordinates: [10.3854, -9.3057], description: 'Ville mandingue importante, liée à l’oralité et au commerce.' },
  ],
  GQ: [
    { name: 'Malabo', type: 'capital', coordinates: [3.7504, 8.7371], description: 'Capitale insulaire sur Bioko.' },
    { name: 'Bata', type: 'economic', coordinates: [1.8656, 9.7699], description: 'Grande ville continentale et portuaire.' },
  ],
  GW: [
    { name: 'Bissau', type: 'capital', coordinates: [11.8817, -15.617], description: 'Capitale au bord de l’estuaire du Geba.' },
    { name: 'Bolama', type: 'historic', coordinates: [11.5769, -15.4767], description: 'Ancienne capitale, mémoire insulaire et coloniale.' },
  ],
  KE: [
    { name: 'Nairobi', type: 'capital', coordinates: [-1.2921, 36.8219], description: 'Capitale, hub régional et ville proche d’un parc national.' },
    { name: 'Mombasa', type: 'port', coordinates: [-4.0435, 39.6682], description: 'Port swahili historique sur l’océan Indien.' },
    { name: 'Kisumu', type: 'economic', coordinates: [-0.0917, 34.768], description: 'Ville du lac Victoria, carrefour commercial de l’ouest.' },
  ],
  KM: [
    { name: 'Moroni', type: 'capital', coordinates: [-11.7172, 43.2473], description: 'Capitale de Grande Comore, entre volcan, médina et océan.' },
    { name: 'Mutsamudu', type: 'port', coordinates: [-12.1667, 44.4], description: 'Ville portuaire d’Anjouan.' },
  ],
  LR: [
    { name: 'Monrovia', type: 'capital', coordinates: [6.3156, -10.8074], description: 'Capitale atlantique, centre politique et portuaire.' },
    { name: 'Gbarnga', type: 'economic', coordinates: [6.9954, -9.4712], description: 'Ville intérieure, carrefour agricole et routier.' },
  ],
  LS: [
    { name: 'Maseru', type: 'capital', coordinates: [-29.31, 27.48], description: 'Capitale du royaume de montagne.' },
    { name: 'Thaba Bosiu', type: 'historic', coordinates: [-29.3667, 27.7167], description: 'Site historique majeur de la nation basotho.' },
  ],
  LY: [
    { name: 'Tripoli', type: 'capital', coordinates: [32.8872, 13.1913], description: 'Capitale méditerranéenne, centre politique et portuaire.' },
    { name: 'Benghazi', type: 'economic', coordinates: [32.1167, 20.0667], description: 'Grande ville de Cyrénaïque.' },
    { name: 'Ghadamès', type: 'historic', coordinates: [30.1337, 9.5007], description: 'Ville saharienne et oasis historique.' },
  ],
  MA: [
    { name: 'Rabat', type: 'capital', coordinates: [34.0209, -6.8416], description: 'Capitale administrative, ville impériale et littorale.' },
    { name: 'Casablanca', type: 'economic', coordinates: [33.5731, -7.5898], description: 'Métropole économique et portuaire.' },
    { name: 'Fès', type: 'historic', coordinates: [34.0181, -5.0078], description: 'Ville savante et artisanale, célèbre pour sa médina.' },
    { name: 'Marrakech', type: 'cultural', coordinates: [31.6295, -7.9811], description: 'Ville culturelle, touristique et artisanale au pied de l’Atlas.' },
  ],
  MG: [
    { name: 'Antananarivo', type: 'capital', coordinates: [-18.8792, 47.5079], description: 'Capitale des hautes terres, centre politique et culturel.' },
    { name: 'Toamasina', type: 'port', coordinates: [-18.1492, 49.4023], description: 'Grand port de la côte est.' },
    { name: 'Mahajanga', type: 'port', coordinates: [-15.7167, 46.3167], description: 'Ville côtière du nord-ouest, liée aux échanges de l’océan Indien.' },
  ],
  ML: [
    { name: 'Bamako', type: 'capital', coordinates: [12.6392, -8.0029], description: 'Capitale sur le Niger, centre politique, musical et commercial.' },
    { name: 'Tombouctou', type: 'historic', coordinates: [16.7666, -3.0026], description: 'Ville de manuscrits, de savoirs et de routes transsahariennes.' },
    { name: 'Djenné', type: 'historic', coordinates: [13.9061, -4.5533], description: 'Ville en banco, célèbre pour sa grande mosquée et son histoire urbaine.' },
  ],
  MR: [
    { name: 'Nouakchott', type: 'capital', coordinates: [18.0735, -15.9582], description: 'Capitale atlantique et saharienne.' },
    { name: 'Chinguetti', type: 'historic', coordinates: [20.463, -12.362], description: 'Ville ancienne connue pour ses bibliothèques et routes caravanières.' },
  ],
  MU: [
    { name: 'Port Louis', type: 'capital', coordinates: [-20.1609, 57.5012], description: 'Capitale portuaire et économique de Maurice.' },
    { name: 'Mahébourg', type: 'historic', coordinates: [-20.4081, 57.7], description: 'Ville côtière liée à l’histoire maritime.' },
  ],
  MW: [
    { name: 'Lilongwe', type: 'capital', coordinates: [-13.9626, 33.7741], description: 'Capitale administrative du Malawi.' },
    { name: 'Blantyre', type: 'economic', coordinates: [-15.7861, 35.0058], description: 'Grand centre économique du sud.' },
    { name: 'Mangochi', type: 'natural', coordinates: [-14.4782, 35.2645], description: 'Ville proche du lac Malawi et de ses routes touristiques.' },
  ],
  MZ: [
    { name: 'Maputo', type: 'capital', coordinates: [-25.9692, 32.5732], description: 'Capitale portuaire, musicale et architecturale.' },
    { name: 'Beira', type: 'port', coordinates: [-19.8333, 34.85], description: 'Port central et carrefour ferroviaire.' },
    { name: 'Ilha de Moçambique', type: 'historic', coordinates: [-15.0342, 40.7358], description: 'Île historique classée, mémoire de l’océan Indien.' },
  ],
  NA: [
    { name: 'Windhoek', type: 'capital', coordinates: [-22.5609, 17.0658], description: 'Capitale des hauts plateaux namibiens.' },
    { name: 'Swakopmund', type: 'port', coordinates: [-22.6833, 14.5333], description: 'Ville côtière entre désert et Atlantique.' },
    { name: 'Walvis Bay', type: 'port', coordinates: [-22.9575, 14.5053], description: 'Port majeur et lagune riche en biodiversité.' },
  ],
  NE: [
    { name: 'Niamey', type: 'capital', coordinates: [13.5116, 2.1254], description: 'Capitale sur le fleuve Niger.' },
    { name: 'Agadez', type: 'historic', coordinates: [16.9742, 7.9865], description: 'Ville saharienne, carrefour touareg et caravanier.' },
    { name: 'Zinder', type: 'historic', coordinates: [13.8072, 8.9881], description: 'Ancienne capitale et pôle culturel haoussa.' },
  ],
  NG: [
    { name: 'Abuja', type: 'capital', coordinates: [9.0765, 7.3986], description: 'Capitale fédérale planifiée au centre du pays.' },
    { name: 'Lagos', type: 'economic', coordinates: [6.5244, 3.3792], description: 'Mégapole économique, musicale, technologique et portuaire.' },
    { name: 'Kano', type: 'historic', coordinates: [12.0022, 8.592], description: 'Ville historique haoussa, liée au commerce transsaharien.' },
    { name: 'Ibadan', type: 'cultural', coordinates: [7.3775, 3.947], description: 'Grand centre yoruba, universitaire et culturel.' },
  ],
  RW: [
    { name: 'Kigali', type: 'capital', coordinates: [-1.9441, 30.0619], description: 'Capitale des collines, centre politique et créatif.' },
    { name: 'Huye', type: 'cultural', coordinates: [-2.5967, 29.7394], description: 'Ville universitaire et culturelle du sud.' },
  ],
  SC: [
    { name: 'Victoria', type: 'capital', coordinates: [-4.6191, 55.4513], description: 'Petite capitale de Mahé, cœur administratif de l’archipel.' },
    { name: 'Praslin', type: 'natural', coordinates: [-4.3293, 55.7467], description: 'Île connue pour la Vallée de Mai et les paysages granitiques.' },
  ],
  SD: [
    { name: 'Khartoum', type: 'capital', coordinates: [15.5007, 32.5599], description: 'Capitale au confluent des Nils bleu et blanc.' },
    { name: 'Omdourman', type: 'cultural', coordinates: [15.6445, 32.4777], description: 'Ville de marchés, mémoire mahdiste et traditions soufies.' },
    { name: 'Méroé', type: 'historic', coordinates: [16.9378, 33.7489], description: 'Site des pyramides koushites et de la civilisation de Méroé.' },
  ],
  SL: [
    { name: 'Freetown', type: 'capital', coordinates: [8.4657, -13.2317], description: 'Capitale entre collines et Atlantique, liée à l’histoire krio.' },
    { name: 'Bo', type: 'economic', coordinates: [7.9564, -11.74], description: 'Ville importante du sud et carrefour intérieur.' },
  ],
  SN: [
    { name: 'Dakar', type: 'capital', coordinates: [14.7167, -17.4677], description: 'Capitale atlantique, scène artistique, musicale et politique majeure.' },
    { name: 'Saint-Louis', type: 'historic', coordinates: [16.0326, -16.4818], description: 'Ancienne capitale, ville insulaire et patrimoine architectural.' },
    { name: 'Touba', type: 'cultural', coordinates: [14.8667, -15.8833], description: 'Ville spirituelle mouride et grand lieu de rassemblement.' },
  ],
  SO: [
    { name: 'Mogadiscio', type: 'capital', coordinates: [2.0469, 45.3182], description: 'Capitale côtière de l’océan Indien, mémoire swahilie et somalie.' },
    { name: 'Hargeisa', type: 'economic', coordinates: [9.56, 44.065], description: 'Grand centre urbain du nord.' },
  ],
  SS: [
    { name: 'Juba', type: 'capital', coordinates: [4.8594, 31.5713], description: 'Capitale sur le Nil Blanc, centre politique du plus jeune État africain.' },
    { name: 'Wau', type: 'cultural', coordinates: [7.7029, 27.9953], description: 'Ville du nord-ouest, carrefour culturel et ferroviaire.' },
  ],
  ST: [
    { name: 'São Tomé', type: 'capital', coordinates: [0.3365, 6.7273], description: 'Capitale insulaire, liée aux plantations, au cacao et à l’Atlantique.' },
    { name: 'Santo António', type: 'port', coordinates: [1.6394, 7.4178], description: 'Ville principale de Príncipe.' },
  ],
  SZ: [
    { name: 'Mbabane', type: 'capital', coordinates: [-26.3054, 31.1367], description: 'Capitale administrative des hauts plateaux.' },
    { name: 'Lobamba', type: 'cultural', coordinates: [-26.4667, 31.2], description: 'Centre royal et cérémoniel du royaume.' },
  ],
  TD: [
    { name: "N'Djamena", type: 'capital', coordinates: [12.1348, 15.0557], description: 'Capitale proche du lac Tchad et du fleuve Chari.' },
    { name: 'Abéché', type: 'historic', coordinates: [13.8292, 20.8324], description: 'Ville historique de l’est, ancienne capitale du Ouaddaï.' },
  ],
  TG: [
    { name: 'Lomé', type: 'capital', coordinates: [6.1725, 1.2314], description: 'Capitale côtière, marché, port et scène artistique.' },
    { name: 'Kpalimé', type: 'natural', coordinates: [6.9, 0.6333], description: 'Ville des plateaux, proche des forêts, cascades et artisanats.' },
    { name: 'Kara', type: 'cultural', coordinates: [9.5511, 1.1861], description: 'Ville du nord, proche de traditions kabiyè et de paysages montagneux.' },
  ],
  TN: [
    { name: 'Tunis', type: 'capital', coordinates: [36.8065, 10.1815], description: 'Capitale méditerranéenne, médina, institutions et culture urbaine.' },
    { name: 'Carthage', type: 'historic', coordinates: [36.8528, 10.3233], description: 'Site antique majeur lié à la Méditerranée punique et romaine.' },
    { name: 'Sfax', type: 'economic', coordinates: [34.7398, 10.76], description: 'Grand centre économique et portuaire.' },
  ],
  TZ: [
    { name: 'Dodoma', type: 'capital', coordinates: [-6.163, 35.7516], description: 'Capitale administrative au centre du pays.' },
    { name: 'Dar es Salaam', type: 'port', coordinates: [-6.7924, 39.2083], description: 'Grande ville portuaire et économique.' },
    { name: 'Zanzibar', type: 'historic', coordinates: [-6.1659, 39.2026], description: 'Archipel swahili, Stone Town et routes de l’océan Indien.' },
    { name: 'Arusha', type: 'natural', coordinates: [-3.3869, 36.683], description: 'Porte des parcs du nord et du Kilimandjaro.' },
  ],
  UG: [
    { name: 'Kampala', type: 'capital', coordinates: [0.3476, 32.5825], description: 'Capitale des collines, centre économique et culturel.' },
    { name: 'Jinja', type: 'natural', coordinates: [0.4244, 33.2042], description: 'Ville liée au Nil et aux activités fluviales.' },
  ],
  ZA: [
    { name: 'Pretoria', type: 'capital', coordinates: [-25.7479, 28.2293], description: 'Capitale administrative et ville des jacarandas.' },
    { name: 'Le Cap', type: 'port', coordinates: [-33.9249, 18.4241], description: 'Ville portuaire, Table Mountain et mémoire du Cap.' },
    { name: 'Johannesburg', type: 'economic', coordinates: [-26.2041, 28.0473], description: 'Métropole économique, minière, artistique et historique.' },
    { name: 'Durban', type: 'port', coordinates: [-29.8587, 31.0218], description: 'Grand port de l’océan Indien, cultures zouloues et indiennes.' },
  ],
  ZM: [
    { name: 'Lusaka', type: 'capital', coordinates: [-15.3875, 28.3228], description: 'Capitale et centre économique de la Zambie.' },
    { name: 'Livingstone', type: 'natural', coordinates: [-17.8419, 25.8543], description: 'Ville proche des chutes Victoria.' },
    { name: 'Ndola', type: 'economic', coordinates: [-12.9587, 28.6366], description: 'Ville de la Copperbelt et des échanges miniers.' },
  ],
  ZW: [
    { name: 'Harare', type: 'capital', coordinates: [-17.8252, 31.0335], description: 'Capitale du Zimbabwe et centre culturel contemporain.' },
    { name: 'Bulawayo', type: 'cultural', coordinates: [-20.1325, 28.6265], description: 'Ville ndebele, industrielle et culturelle.' },
    { name: 'Masvingo', type: 'historic', coordinates: [-20.0637, 30.8277], description: 'Ville proche du site du Grand Zimbabwe.' },
  ],
}

export const getCountryMapPlaces = (countryId: string, capital?: string): CountryMapPlace[] => {
  const places = countryMapPlaces[countryId.toUpperCase()] || []

  if (places.length > 0) return places

  return capital
    ? [{
        name: capital,
        type: 'capital',
        coordinates: [0, 0],
        description: 'Capitale à compléter depuis l’administration avec ses coordonnées et repères locaux.',
        highlight: 'Coordonnées à enrichir',
      }]
    : []
}
