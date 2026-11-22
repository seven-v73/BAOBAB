/**
 * Photos du site (hors contenus de la base) : toutes viennent de Wikimedia Commons sous licence libre.
 * Leur licence demande de citer l'auteur : chaque légende et la page Sources reprennent ce crédit.
 */
export interface CreditPhoto {
  src: string
  legende: string
  credit: string
  page: string
}

export const CREDITS_PHOTOS: CreditPhoto[] = [
  { src: '/content/home/baobabs.webp', legende: 'Baobab dans la région de l’Est, Burkina Faso', credit: 'Desijwo, CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Baobab_dans_la_r%C3%A9gion_de_l%27Est_du_Burkina_Faso.jpg' },
  { src: '/content/home/tiebele.webp', legende: 'Maison peinte de la cour royale de Tiébélé, Burkina Faso', credit: 'Alexander Leisser, CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Tiebele_village_in_Burkina_Faso_04.jpg' },
  { src: '/content/register/tiebele.webp', legende: 'Grenier peint de la cour royale de Tiébélé, Burkina Faso', credit: 'Alexander Leisser, CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Tiebele_village_in_Burkina_Faso_06.jpg' },
  { src: '/content/home/faso-dan-fani.webp', legende: 'Tisserandes au travail dans un village du Burkina Faso', credit: 'Btwien, CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Art_of_Weaving.jpg' },
  { src: '/content/home/calebasses.webp', legende: 'Calebasse décorée au village artisanal de Wadata, Niamey, Niger', credit: 'Habibou Souley Hajara, CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Une_calebasse_teinte_%C3%A0_l%27artisanat_wadata_de_niamey.jpg' },
  { src: '/content/home/cap-vert.webp', legende: 'Côte nord de Santo Antão, Cap-Vert', credit: 'Konstantin Krismer, CC BY 3.0', page: 'https://commons.wikimedia.org/wiki/File:Coastline_Santo_Antao.JPG' },
  { src: '/content/recits/mansa-musa.webp', legende: 'Mansa Musa sur son trône, détail de l’Atlas catalan (1375), Bibliothèque nationale de France', credit: 'domaine public', page: 'https://commons.wikimedia.org/wiki/File:Catalan_Atlas_BNF_Sheet_6_Mansa_Musa.jpg' },
  { src: '/content/recits/empire-sahel.webp', legende: 'Tombeau des Askia, Gao, Mali', credit: 'David Sessoms, CC BY-SA 2.0', page: 'https://commons.wikimedia.org/wiki/File:Tombeau_dAskia_in_Gao_by_David_Sessoms.jpg' },
]

/** « Légende. Photo : auteur, licence, Wikimedia Commons. » */
export const legendeAvecCredit = (src: string, legende?: string) => {
  const c = CREDITS_PHOTOS.find((p) => p.src === src)
  if (!c) return legende || ''
  return `${legende || c.legende}. ${c.credit === 'domaine public' ? 'Domaine public' : `Photo : ${c.credit}`}, Wikimedia Commons.`
}
