// Géographie partagée par l'accueil et la page Explorer : capitales, projection sur le contour
// de la maquette (src/data/africaOutline.ts) et territoires à fiche enrichie.

/** Capitale de chaque pays : [latitude, longitude] */
export const CAPITAL_COORDS: Record<string, [number, number]> = {
  MA: [34.02, -6.84], DZ: [36.75, 3.06], TN: [36.81, 10.18], LY: [32.89, 13.19], EG: [30.04, 31.24],
  SD: [15.5, 32.56], SS: [4.85, 31.58], EH: [27.15, -13.2], MR: [18.08, -15.98], SN: [14.69, -17.44],
  GM: [13.45, -16.58], GW: [11.86, -15.6], GN: [9.64, -13.58], SL: [8.48, -13.23], LR: [6.3, -10.8],
  CI: [6.83, -5.29], GH: [5.6, -0.19], TG: [6.13, 1.22], BJ: [6.5, 2.6], NG: [9.06, 7.49],
  NE: [13.51, 2.11], ML: [12.64, -8.0], BF: [12.37, -1.52], TD: [12.13, 15.06], CM: [3.85, 11.5],
  CF: [4.39, 18.56], GQ: [3.75, 8.78], GA: [0.42, 9.47], CG: [-4.27, 15.28], CD: [-4.32, 15.31],
  AO: [-8.84, 13.23], ST: [0.34, 6.73], CV: [14.93, -23.51], ER: [15.32, 38.93], ET: [9.03, 38.74],
  DJ: [11.59, 43.15], SO: [2.05, 45.32], KE: [-1.29, 36.82], UG: [0.35, 32.58], RW: [-1.95, 30.06],
  BI: [-3.43, 29.93], TZ: [-6.16, 35.75], MW: [-13.96, 33.79], ZM: [-15.39, 28.32], ZW: [-17.83, 31.05],
  BW: [-24.65, 25.91], MZ: [-25.97, 32.57], MG: [-18.88, 47.51], ZA: [-25.75, 28.19], LS: [-29.31, 27.48],
  SZ: [-26.31, 31.14], NA: [-22.56, 17.08], MU: [-20.16, 57.5], SC: [-4.62, 55.45], KM: [-11.7, 43.26],
}

/** Projette une position sur le contour (unités du viewBox AFRICA_VIEWBOX), calée sur la maquette Figma. */
export const projectOnAfrica = ([lat, lon]: [number, number]) => ({ x: 9.209 * lon + 161.1, y: -9.183 * lat + 344.2 })

type Photo = { src: string; caption: string }

/** Pays dont la fiche est enrichie : couleur de leur territoire (logotypes de la charte) et photos. */
export const ENRICHED_TERRITORIES: Record<string, { color: string; tagline: string; gallery?: Photo[] }> = {
  BF: {
    color: 'var(--brand-terre)',
    tagline: 'Le pays des hommes intègres',
    gallery: [
      { src: '/content/home/tiebele.webp', caption: 'Maison peinte de la cour royale de Tiébélé. Photo : Alexander Leisser, CC BY-SA 4.0, Wikimedia Commons.' },
      { src: '/content/home/faso-dan-fani.webp', caption: 'Tisserandes au travail. Photo : Btwien, CC BY-SA 4.0, Wikimedia Commons.' },
      { src: '/content/home/baobabs.webp', caption: 'Baobab dans la région de l’Est. Photo : Desijwo, CC BY-SA 4.0, Wikimedia Commons.' },
    ],
  },
  CI: { color: 'var(--brand-desert)', tagline: 'Entre lagunes, forêts et savanes' },
  CV: {
    color: 'var(--brand-abysse)',
    tagline: 'Dix îles au large de l’Atlantique',
    gallery: [{ src: '/content/home/cap-vert.webp', caption: 'Côte nord de Santo Antão. Photo : Konstantin Krismer, CC BY 3.0, Wikimedia Commons.' }],
  },
}
