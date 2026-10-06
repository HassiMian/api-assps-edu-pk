import { lstatSync, readlinkSync, readdirSync, symlinkSync, unlinkSync, existsSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'

const root = process.cwd()
const distDir = process.env.NEXT_DIST_DIR || '.next'
const externalDir = resolve(root, distDir, 'node_modules')
const rootNodeModules = resolve(root, 'node_modules')

if (!existsSync(externalDir)) process.exit(0)

let normalized = 0
for (const name of readdirSync(externalDir)) {
  const linkPath = join(externalDir, name)
  let stat
  try { stat = lstatSync(linkPath) } catch { continue }
  if (!stat.isSymbolicLink()) continue

  const target = readlinkSync(linkPath)
  const absoluteTarget = resolve(dirname(linkPath), target)
  const marker = `${sep}node_modules${sep}`
  const markerIndex = absoluteTarget.lastIndexOf(marker)
  if (markerIndex < 0) continue

  const packagePath = absoluteTarget.slice(markerIndex + marker.length)
  const portableTarget = resolve(rootNodeModules, packagePath)
  if (!existsSync(portableTarget)) continue

  const portableRelative = relative(dirname(linkPath), portableTarget) || basename(portableTarget)
  if (target === portableRelative) continue

  unlinkSync(linkPath)
  symlinkSync(portableRelative, linkPath)
  normalized++
}

console.log(`NEXT_EXTERNAL_LINKS_NORMALIZED ${normalized}`)
