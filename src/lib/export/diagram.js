import { saveBlob, safeFileName } from './save'

// SVG presentation properties we copy from computed styles so the standalone
// SVG renders identically to the on-screen one (the diagrams are styled with
// Tailwind utility *classes*, which a raw serialize would drop).
const STYLE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'color',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'text-transform',
  'letter-spacing',
]

function inlineStyles(source, target) {
  const computed = window.getComputedStyle(source)
  let css = ''
  for (const prop of STYLE_PROPS) {
    const val = computed.getPropertyValue(prop)
    if (val) css += `${prop}:${val};`
  }
  target.setAttribute('style', css)
  const srcChildren = source.children
  const tgtChildren = target.children
  for (let i = 0; i < srcChildren.length; i++) inlineStyles(srcChildren[i], tgtChildren[i])
}

// Rasterise a live <svg> element to a PNG Blob at `scale`× resolution.
export async function svgToPngBlob(svgEl, scale = 2) {
  const rect = svgEl.getBoundingClientRect()
  const width = Math.ceil(rect.width) || svgEl.viewBox?.baseVal?.width || 800
  const height = Math.ceil(rect.height) || svgEl.viewBox?.baseVal?.height || 600

  const clone = svgEl.cloneNode(true)
  inlineStyles(svgEl, clone)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)

  const svgStr = new XMLSerializer().serializeToString(clone)
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`

  const img = new Image()
  img.width = width
  img.height = height
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('Failed to rasterise the diagram'))
    img.src = svgUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0, width, height)

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export async function downloadDiagramPng(svgEl, artefact) {
  const blob = await svgToPngBlob(svgEl, 2)
  saveBlob(blob, `${safeFileName(artefact?.id, artefact?.name)}.png`)
}

const blobToDataUrl = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })

// One slide (16:9) with a title and the diagram image scaled to fit, via
// pptxgenjs (lazy-loaded).
export async function downloadDiagramPptx(svgEl, artefact) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pngBlob = await svgToPngBlob(svgEl, 2)
  const dataUrl = await blobToDataUrl(pngBlob)

  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 })
  pptx.layout = 'WIDE'
  const slide = pptx.addSlide()
  slide.addText(artefact?.name ?? artefact?.id ?? 'Diagram', {
    x: 0.5,
    y: 0.3,
    w: 12.3,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: '111827',
  })

  // Fit the image into the area below the title, preserving aspect ratio.
  const areaX = 0.5
  const areaY = 1.1
  const areaW = 12.3
  const areaH = 5.9
  const ratio = pngBlob.size
    ? svgEl.getBoundingClientRect().width / svgEl.getBoundingClientRect().height
    : 16 / 9
  let w = areaW
  let h = w / ratio
  if (h > areaH) {
    h = areaH
    w = h * ratio
  }
  slide.addImage({
    data: dataUrl,
    x: areaX + (areaW - w) / 2,
    y: areaY + (areaH - h) / 2,
    w,
    h,
  })

  const blob = await pptx.write({ outputType: 'blob' })
  saveBlob(blob, `${safeFileName(artefact?.id, artefact?.name)}.pptx`)
}
