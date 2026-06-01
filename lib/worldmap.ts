// Minimal, dependency-free TopoJSON → SVG path conversion for the node map.
// Decodes the vendored Natural Earth 110m countries TopoJSON (world-atlas v2)
// and projects it equirectangularly into a 360×180 degree-space viewBox
// (x = lon + 180, y = 90 - lat) — the same space NodeMap uses for its markers,
// so HTML-overlaid pulse dots stay aligned. No d3 / topojson-client.

import topoData from './countries-110m.json'

interface Topology {
  arcs: number[][][]
  transform: { scale: [number, number]; translate: [number, number] }
  objects: { countries: { geometries: Geometry[] } }
}
interface PolygonGeom {
  type: 'Polygon'
  arcs: number[][]
}
interface MultiPolygonGeom {
  type: 'MultiPolygon'
  arcs: number[][][]
}
type Geometry = PolygonGeom | MultiPolygonGeom | { type: string }

const topo = topoData as unknown as Topology

// Dequantize delta-encoded arcs into absolute [lon, lat] coordinates.
function decodeArcs(): [number, number][][] {
  const { scale, translate } = topo.transform
  return topo.arcs.map((arc) => {
    let x = 0
    let y = 0
    return arc.map(([dx, dy]) => {
      x += dx
      y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]] as [number, number]
    })
  })
}

const ARCS = decodeArcs()

// Stitch a ring's arc indices (negative => referenced arc, reversed) into points,
// dropping the shared endpoint between consecutive arcs.
function ringPoints(ring: number[]): [number, number][] {
  const pts: [number, number][] = []
  for (const idx of ring) {
    const reversed = idx < 0
    const arc = ARCS[reversed ? ~idx : idx]
    if (!arc) continue
    const seq = reversed ? arc.slice().reverse() : arc
    for (let i = 0; i < seq.length; i++) {
      if (pts.length && i === 0) continue
      pts.push(seq[i])
    }
  }
  return pts
}

function ringToPath(ring: number[]): string {
  const pts = ringPoints(ring)
  if (pts.length < 2) return ''
  let d = ''
  for (let i = 0; i < pts.length; i++) {
    const x = pts[i][0] + 180 // lon → [0, 360]
    const y = 90 - pts[i][1] //  lat → [0, 180]
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' '
  }
  return d + 'Z'
}

// One SVG path string per polygon ring across all country geometries.
export const COUNTRY_PATHS: string[] = (() => {
  const paths: string[] = []
  for (const g of topo.objects.countries.geometries) {
    if (g.type === 'Polygon') {
      for (const ring of (g as PolygonGeom).arcs) {
        const d = ringToPath(ring)
        if (d) paths.push(d)
      }
    } else if (g.type === 'MultiPolygon') {
      for (const poly of (g as MultiPolygonGeom).arcs) {
        for (const ring of poly) {
          const d = ringToPath(ring)
          if (d) paths.push(d)
        }
      }
    }
  }
  return paths
})()
