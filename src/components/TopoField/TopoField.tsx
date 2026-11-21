import { useEffect, useRef } from 'react'
import './TopoField.css'

/**
 * Courbes de niveau génératives (motif de marque, DESIGN.md §6) : un relief de bruit
 * qui dérive lentement, et une colline qui suit le curseur.
 * Canvas 2D + marching squares, sans dépendance.
 */

const LEVELS = 13 // nombre de courbes
// ponytail: ~3 ms de calcul par image à 1440×900 (mesuré) ; sur écran tactile, grille plus
// grossière et cadence réduite pour ménager les téléphones modestes
const isCoarse = () => window.matchMedia('(pointer: coarse)').matches
const DRIFT = 0.035 // vitesse de dérive du relief
const BUMP_RADIUS = 210 // px
const BUMP_HEIGHT = 0.8

// Bruit de valeur 2D lissé, 3 octaves : assez organique pour des courbes de niveau
const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return h - Math.floor(h)
}
const smooth = (t: number) => t * t * (3 - 2 * t)
const valueNoise = (x: number, y: number) => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const u = smooth(x - xi)
  const v = smooth(y - yi)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x: number, y: number) =>
  valueNoise(x, y) * 0.57 + valueNoise(x * 2.03, y * 2.03) * 0.29 + valueNoise(x * 4.1, y * 4.1) * 0.14

export const TopoField = ({ className = '' }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const styles = getComputedStyle(canvas)
    const strong = styles.getPropertyValue('--topo-strong').trim() || '#174123'
    const soft = styles.getPropertyValue('--topo-soft').trim() || '#77a162'
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const CELL = isCoarse() ? 18 : 14 // px CSS par cellule de grille
    const FPS = isCoarse() ? 20 : 30

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let field = new Float32Array(0)
    let frame = 0
    let last = 0
    let time = 0
    let visible = true
    // Position du curseur lissée (le relief suit avec un peu d'inertie)
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / CELL) + 1
      rows = Math.ceil(height / CELL) + 1
      field = new Float32Array(cols * rows)
    }

    const draw = () => {
      const scale = 0.0042
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * CELL
          const y = j * CELL
          let value = fbm(x * scale + time, y * scale - time * 0.6)
          if (pointer.strength > 0.001) {
            const dx = x - pointer.x
            const dy = y - pointer.y
            value += BUMP_HEIGHT * pointer.strength * Math.exp(-(dx * dx + dy * dy) / (BUMP_RADIUS * BUMP_RADIUS))
          }
          field[j * cols + i] = value
        }
      }

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1.1
      ctx.lineJoin = 'round'

      for (let level = 1; level <= LEVELS; level++) {
        const threshold = 0.18 + (level / (LEVELS + 1)) * 0.95
        ctx.beginPath()
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = field[j * cols + i]
            const b = field[j * cols + i + 1]
            const c = field[(j + 1) * cols + i + 1]
            const d = field[(j + 1) * cols + i]
            const index = (a > threshold ? 8 : 0) | (b > threshold ? 4 : 0) | (c > threshold ? 2 : 0) | (d > threshold ? 1 : 0)
            if (index === 0 || index === 15) continue

            const x = i * CELL
            const y = j * CELL
            // Points d'intersection interpolés sur les 4 côtés de la cellule
            const top = x + CELL * ((threshold - a) / (b - a))
            const right = y + CELL * ((threshold - b) / (c - b))
            const bottom = x + CELL * ((threshold - d) / (c - d))
            const left = y + CELL * ((threshold - a) / (d - a))

            const seg = (x1: number, y1: number, x2: number, y2: number) => {
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
            }
            switch (index) {
              case 1: case 14: seg(x, left, bottom, y + CELL); break
              case 2: case 13: seg(bottom, y + CELL, x + CELL, right); break
              case 3: case 12: seg(x, left, x + CELL, right); break
              case 4: case 11: seg(top, y, x + CELL, right); break
              case 5: seg(x, left, top, y); seg(bottom, y + CELL, x + CELL, right); break
              case 6: case 9: seg(top, y, bottom, y + CELL); break
              case 7: case 8: seg(x, left, top, y); break
              case 10: seg(top, y, x + CELL, right); seg(x, left, bottom, y + CELL); break
            }
          }
        }
        // Une courbe sur quatre est plus marquée, comme les courbes maîtresses d'une carte
        ctx.strokeStyle = level % 4 === 0 ? strong : soft
        ctx.globalAlpha = level % 4 === 0 ? 0.22 : 0.3
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!visible || now - last < 1000 / FPS) return
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      time += dt * DRIFT
      pointer.x += (pointer.tx - pointer.x) * 0.12
      pointer.y += (pointer.ty - pointer.y) * 0.12
      pointer.strength += (pointer.target - pointer.strength) * 0.08
      draw()
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
      pointer.tx = event.clientX - rect.left
      pointer.ty = event.clientY - rect.top
      if (inside && pointer.target === 0) {
        // première entrée : la colline apparaît sous le curseur au lieu de glisser depuis un coin
        pointer.x = pointer.tx
        pointer.y = pointer.ty
      }
      pointer.target = inside && event.pointerType === 'mouse' ? 1 : 0
    }
    const onPointerLeave = () => {
      pointer.target = 0
    }

    resize()
    draw()

    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    resizeObserver.observe(canvas)

    if (reduceMotion) {
      // Version statique : un seul tracé, pas d'animation ni de suivi du curseur
      return () => resizeObserver.disconnect()
    }

    // N'anime que lorsque le relief est à l'écran et l'onglet visible
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === 'visible'
    })
    intersection.observe(canvas)
    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className={`topo-field ${className}`} aria-hidden="true" />
}
