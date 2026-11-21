import type { RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, Draggable, InertiaPlugin)

// Animations de l'accueil. Elles ne tournent que si le visiteur n'a pas demandé à réduire les animations ;
// sans elles, la page reste complète et lisible.
const MOTION_OK = '(prefers-reduced-motion: no-preference)'
const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

export const useHomeMotion = (scope: RefObject<HTMLElement | null>) => {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const one = (selector: string) => q(selector)[0]

      gsap.matchMedia().add(MOTION_OK, () => {
        // 1. Hero : le titre monte ligne par ligne, le symbole s'ouvre sur les baobabs
        SplitText.create(one('[data-motion="hero-title"]'), {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.15 }),
        })
        gsap.from(q('[data-motion="hero-item"]'), { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.6 })
        gsap.from(one('[data-motion="hero-mark"]'), {
          scale: 0.85,
          rotate: -8,
          autoAlpha: 0,
          transformOrigin: '50% 60%',
          duration: 1.4,
          ease: 'expo.out',
          delay: 0.2,
        })
        gsap.from(one('[data-motion="hero-photo"]'), { scale: 1.4, transformOrigin: '50% 50%', duration: 2, ease: 'power2.out', delay: 0.2 })
        gsap.to(one('[data-motion="hero-mark"]'), {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: { trigger: one('.mbh-hero'), start: 'top top', end: 'bottom top', scrub: true },
        })

        // 2. Manifeste : les mots s'allument au fil de la lecture
        SplitText.create(one('[data-motion="manifesto"]'), {
          type: 'words',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              opacity: 0.15,
              stagger: 0.05,
              ease: 'none',
              scrollTrigger: { trigger: self.elements[0], start: 'top 80%', end: 'bottom 45%', scrub: true },
            }),
        })

        // Chiffres qui défilent jusqu'à leur valeur
        q('[data-count]').forEach((el) => {
          const counter = { value: 0 }
          gsap.to(counter, {
            value: Number(el.dataset.count),
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onUpdate: () => {
              el.textContent = formatNumber(Math.round(counter.value))
            },
          })
        })

        // Apparitions groupées : statistiques, portes, récits, équipe, carte du Cap-Vert
        const reveals = q('[data-reveal]')
        gsap.set(reveals, { autoAlpha: 0, y: 40 })
        ScrollTrigger.batch(reveals, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }),
        })

        // 4. Atlas : le contour se dessine, puis les repères tombent sur la carte
        gsap
          .timeline({ scrollTrigger: { trigger: one('.mbh-atlas'), start: 'top 70%', once: true } })
          .from(one('[data-motion="africa-line"]'), { drawSVG: 0, duration: 1.6, ease: 'power2.inOut' })
          .from(one('[data-motion="africa-fill"]'), { opacity: 0, duration: 0.8 }, '-=0.6')
          .from(q('[data-motion="pin"]'), { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.5)', stagger: 0.15 }, '-=0.3')

        // 6. Valeurs : les pastilles tombent, puis se laissent déplacer
        const pills = q('.mbh-pill')
        gsap.from(pills, {
          y: -240,
          rotate: () => gsap.utils.random(-45, 45),
          autoAlpha: 0,
          duration: 1.2,
          ease: 'bounce.out',
          stagger: 0.08,
          scrollTrigger: { trigger: one('[data-motion="pills"]'), start: 'top 75%', once: true },
        })
        Draggable.create(pills, {
          type: 'x,y',
          bounds: one('.mbh-values'),
          inertia: true,
          onPress() {
            gsap.to(this.target, { scale: 1.08, duration: 0.2 })
          },
          onRelease() {
            gsap.to(this.target, { scale: 1, duration: 0.3 })
          },
        })
      })
    },
    { scope }
  )
}
