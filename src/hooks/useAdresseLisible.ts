import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { lienContenu, type Section } from '../utils/liens'

/**
 * Ouverte par son ancienne adresse (/figures/<identifiant>), une page passe à son adresse
 * lisible (/figures/nelson-mandela) sans recharger ni ajouter d'entrée dans l'historique.
 */
export const useAdresseLisible = (section: Section, doc: { _id?: string; slug?: string } | null | undefined) => {
  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (!doc?.slug) return
    const cible = lienContenu(section, doc)
    if (decodeURIComponent(pathname) !== cible) navigate(`${cible}${search}${hash}`, { replace: true })
  }, [doc, section, pathname, search, hash, navigate])
}
