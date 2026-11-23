// The two renderers of a layout's draw steps: SVG for the live preview over the cover, a canvas for the baked
// 1024x1024 JPEG. One list of steps, two outputs that match.
import { S, css } from './analyse'
import { familyList, fontStr } from './fonts'
import type { DrawOp } from './types'

/** An eased fade: full at the edge, still strong over the text, gone at the end. */
const gradStops = (a: number): [number, number][] => [[0, a], [0.45, a * 0.82], [0.75, a * 0.4], [1, 0]]
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const n2 = (v: number): string => (Math.round(v * 100) / 100).toString()

/** The steps as an SVG document (viewBox 1000); `idp` keeps gradient ids apart when several are on one page. */
export function toSvg(ops: DrawOp[], imgUrl: string, idp: string, label = ''): string {
  const defs: string[] = []
  let gid = 0
  const walk = (list: DrawOp[], out: string[]): void => {
    for (const o of list) {
      if (o.t === 'image') out.push(`<image href="${esc(imgUrl)}" x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" preserveAspectRatio="xMidYMid slice"/>`)
      else if (o.t === 'rect') out.push(`<rect x="${n2(o.x)}" y="${n2(o.y)}" width="${n2(o.w)}" height="${n2(o.h)}" fill="${css(o.fill)}"${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`)
      else if (o.t === 'grad') {
        const id = `${idp}g${++gid}`
        const [x1, y1, x2, y2] = o.edge === 'left' ? [o.from, 0, o.to, 0] : [0, o.from, 0, o.to]
        defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}">${gradStops(o.a).map(([p, a]) => `<stop offset="${p}" stop-color="${css(o.colour)}" stop-opacity="${a.toFixed(3)}"/>`).join('')}</linearGradient>`)
        if (o.edge === 'left') out.push(`<rect x="${n2(Math.min(o.from, o.to))}" y="0" width="${n2(Math.abs(o.to - o.from))}" height="${S}" fill="url(#${id})"/>`)
        else out.push(`<rect x="0" y="${n2(Math.min(o.from, o.to))}" width="${S}" height="${n2(Math.abs(o.to - o.from))}" fill="url(#${id})"/>`)
      } else if (o.t === 'radial') {
        const id = `${idp}g${++gid}`
        const c = css(o.colour)
        defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${o.cx}" cy="${o.cy}" r="${o.r}"><stop offset="0" stop-color="${c}" stop-opacity="${o.a.toFixed(3)}"/><stop offset="0.55" stop-color="${c}" stop-opacity="${(o.a * 0.75).toFixed(3)}"/><stop offset="1" stop-color="${c}" stop-opacity="${(o.a * 0.25).toFixed(3)}"/></radialGradient>`)
        out.push(`<rect x="0" y="0" width="${S}" height="${S}" fill="url(#${id})"/>`)
      } else if (o.t === 'circle') {
        let f = ''
        if (o.shadow) {
          const id = `${idp}f${++gid}`
          defs.push(`<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity=".35"/></filter>`)
          f = ` filter="url(#${id})"`
        }
        out.push(`<circle cx="${n2(o.cx)}" cy="${n2(o.cy)}" r="${o.r}" fill="${o.fill ? css(o.fill) : 'none'}"${o.stroke ? ` stroke="${css(o.stroke)}" stroke-width="${o.sw}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}${f}/>`)
      } else if (o.t === 'group') {
        const inner: string[] = []
        walk(o.children, inner)
        out.push(`<g transform="rotate(${o.rot} ${n2(o.cx)} ${n2(o.cy)})">${inner.join('')}</g>`)
      } else if (o.t === 'text') {
        let f = ''
        if (o.glow) {
          // as the canvas shadow: the text's alpha blurred, in the glow colour, under the text itself
          const id = `${idp}f${++gid}`
          defs.push(`<filter id="${id}" filterUnits="userSpaceOnUse" x="-1500" y="-1500" width="3000" height="3000" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${n2(o.glow.r)}" result="b"/><feFlood flood-color="${css(o.glow.colour)}" flood-opacity="${o.glow.a.toFixed(3)}"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`)
          f = ` filter="url(#${id})"`
        }
        const st = o.stroke ? ` stroke="${css(o.stroke)}" stroke-width="${n2(o.sw ?? 1)}" stroke-linejoin="round" paint-order="stroke"` : ''
        out.push(`<text transform="translate(${o.x.toFixed(2)} ${o.y.toFixed(2)}) rotate(${o.rot.toFixed(3)})" x="${o.dx.toFixed(2)}" y="0" font-family="${esc(familyList(o.f))}" font-weight="${o.f.weight}" font-style="${o.f.style}" font-size="${o.size}" letter-spacing="${(o.ls * o.size).toFixed(2)}"${o.f.ws ? ` word-spacing="${(o.f.ws * o.size).toFixed(2)}"` : ''} fill="${o.noFill ? 'none' : css(o.fill)}"${st} opacity="${o.opacity}"${f} style="font-kerning:normal;white-space:pre">${esc(o.text)}</text>`)
      } else if (o.t === 'poly') {
        out.push(`<polygon points="${o.pts.map(([px, py]) => `${n2(px)},${n2(py)}`).join(' ')}" fill="${o.fill ? css(o.fill) : 'none'}"${o.stroke ? ` stroke="${css(o.stroke)}" stroke-width="${o.sw ?? 1}" stroke-linejoin="miter"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`)
      } else if (o.t === 'frame') {
        out.push(`<rect x="${n2(o.x)}" y="${n2(o.y)}" width="${n2(o.w)}" height="${n2(o.h)}"${o.rx ? ` rx="${o.rx}"` : ''} fill="none" stroke="${css(o.stroke)}" stroke-width="${o.sw}"${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`)
      } else if (o.t === 'imgcircle') {
        const id = `${idp}c${++gid}`
        defs.push(`<clipPath id="${id}"><circle cx="${n2(o.cx)}" cy="${n2(o.cy)}" r="${n2(o.r)}"/></clipPath>`)
        out.push(`<image href="${esc(imgUrl)}" x="${n2(o.cx - o.r)}" y="${n2(o.cy - o.r)}" width="${n2(2 * o.r)}" height="${n2(2 * o.r)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`)
      }
    }
  }
  const body: string[] = []
  walk(ops, body)
  // ltr whatever the page: the layouts place text by its start on the left
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" style="direction:ltr;display:block;width:100%;height:100%" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}><defs>${defs.join('')}</defs>${body.join('')}</svg>`
}

/** The steps drawn on a px x px canvas, the cover image from `img`. */
export function toCanvas(ops: DrawOp[], img: HTMLImageElement, px: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = px
  const x = c.getContext('2d')!
  const k = px / S
  x.scale(k, k)
  x.fillStyle = '#000'
  x.fillRect(0, 0, S, S)
  x.imageSmoothingQuality = 'high'
  const walk = (list: DrawOp[]): void => {
    for (const o of list) {
      x.save()
      if (o.t === 'image') {
        const iw = img.naturalWidth, ih = img.naturalHeight, sc = Math.max(o.w / iw, o.h / ih), sw = o.w / sc, sh = o.h / sc
        x.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, o.x, o.y, o.w, o.h)
      } else if (o.t === 'rect') {
        x.globalAlpha = o.opacity ?? 1
        x.fillStyle = css(o.fill)
        x.fillRect(o.x, o.y, o.w, o.h)
      } else if (o.t === 'grad') {
        const g = o.edge === 'left' ? x.createLinearGradient(o.from, 0, o.to, 0) : x.createLinearGradient(0, o.from, 0, o.to)
        gradStops(o.a).forEach(([p, a]) => g.addColorStop(p, css(o.colour, a === 0 ? 0.0001 : a)))
        x.fillStyle = g
        if (o.edge === 'left') x.fillRect(Math.min(o.from, o.to), 0, Math.abs(o.to - o.from), S)
        else x.fillRect(0, Math.min(o.from, o.to), S, Math.abs(o.to - o.from))
      } else if (o.t === 'radial') {
        const g = x.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, o.r)
        g.addColorStop(0, css(o.colour, o.a))
        g.addColorStop(0.55, css(o.colour, o.a * 0.75))
        g.addColorStop(1, css(o.colour, o.a * 0.25))
        x.fillStyle = g
        x.fillRect(0, 0, S, S)
      } else if (o.t === 'circle') {
        x.globalAlpha = o.opacity ?? 1
        x.beginPath()
        x.arc(o.cx, o.cy, o.r, 0, Math.PI * 2)
        if (o.shadow) { x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 20 * k; x.shadowOffsetY = 8 * k }
        if (o.fill) { x.fillStyle = css(o.fill); x.fill() }
        x.shadowColor = 'transparent'
        if (o.stroke) { x.strokeStyle = css(o.stroke); x.lineWidth = o.sw ?? 1; x.stroke() }
      } else if (o.t === 'group') {
        x.translate(o.cx, o.cy)
        x.rotate((o.rot * Math.PI) / 180)
        x.translate(-o.cx, -o.cy)
        walk(o.children)
      } else if (o.t === 'text') {
        x.globalAlpha = o.opacity
        x.fillStyle = css(o.fill)
        x.font = fontStr(o.f, o.size)
        x.letterSpacing = `${o.ls * o.size}px`
        x.wordSpacing = `${(o.f.ws ?? 0) * o.size}px`
        x.textBaseline = 'alphabetic'
        x.textAlign = 'left'
        x.direction = 'ltr'
        x.fontKerning = 'normal'
        x.translate(o.x, o.y)
        x.rotate((o.rot * Math.PI) / 180)
        if (o.glow) {
          // shadowBlur is in device pixels and is twice the gaussian's sigma (the SVG stdDeviation)
          x.shadowColor = css(o.glow.colour, o.glow.a)
          x.shadowBlur = 2 * o.glow.r * k
          x.shadowOffsetX = 0
          x.shadowOffsetY = 0
        }
        if (o.stroke) {
          x.strokeStyle = css(o.stroke)
          x.lineWidth = o.sw ?? 1
          x.lineJoin = 'round'
          x.strokeText(o.text, o.dx, 0)
        }
        if (!o.noFill) x.fillText(o.text, o.dx, 0)
      } else if (o.t === 'poly') {
        x.globalAlpha = o.opacity ?? 1
        x.beginPath()
        o.pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)))
        x.closePath()
        if (o.fill) { x.fillStyle = css(o.fill); x.fill() }
        if (o.stroke) { x.strokeStyle = css(o.stroke); x.lineWidth = o.sw ?? 1; x.lineJoin = 'miter'; x.stroke() }
      } else if (o.t === 'frame') {
        x.globalAlpha = o.opacity ?? 1
        x.strokeStyle = css(o.stroke)
        x.lineWidth = o.sw
        x.beginPath()
        if (o.rx) x.roundRect(o.x, o.y, o.w, o.h, o.rx)
        else x.rect(o.x, o.y, o.w, o.h)
        x.stroke()
      } else if (o.t === 'imgcircle') {
        x.beginPath()
        x.arc(o.cx, o.cy, o.r, 0, Math.PI * 2)
        x.clip()
        const iw = img.naturalWidth, ih = img.naturalHeight, side = Math.min(iw, ih)
        x.drawImage(img, (iw - side) / 2, (ih - side) / 2, side, side, o.cx - o.r, o.cy - o.r, 2 * o.r, 2 * o.r)
      }
      x.restore()
    }
  }
  walk(ops)
  return c
}
