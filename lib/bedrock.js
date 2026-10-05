// Bedrock Edition assets: minecraft-assets/data/bedrock/<version>/, asked for as 'bedrock_<version>'.
//
// data/bedrock/versions.json lists the versions exported, and may say for a version where each of its top-level
// entries (blocks/, blocks_models.json, ...) is: { "<version>": { "paths": { "<entry>": "<version holding it>" } } }.
// Versions whose files came out identical share them that way, as minecraft-data's dataPaths.json does.
const fs = require('fs')
const path = require('path')
const mcDataToNode = require('./loader')

const root = path.join(__dirname, '..', 'minecraft-assets', 'data', 'bedrock')

function compareVersions (a, b) {
  const x = a.split('.').map(Number)
  const y = b.split('.').map(Number)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0)
  }
  return 0
}

const toMajor = version => version.split('.').slice(0, 2).join('.')

function readIndex () {
  const file = path.join(root, 'versions.json')
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))
  // an export without an index: every folder that has blocks states
  if (!fs.existsSync(root)) return {}
  return Object.fromEntries(fs.readdirSync(root)
    .filter(v => fs.existsSync(path.join(root, v, 'blocks_states.json')))
    .map(v => [v, {}]))
}

const index = readIndex()
const versions = Object.keys(index).sort(compareVersions)
// version -> its assets, held weakly: the same object while anyone keeps it, and a build that goes through every
// version does not hold them all
const cache = {}

// The version whose assets serve `version`: itself, else the newest exported before it of the same major (1.26.52
// takes 1.26.51's), else null
function resolveVersion (version) {
  if (index[version]) return version
  return versions.filter(v => toMajor(v) === toMajor(version) && compareVersions(v, version) < 0).pop() ?? null
}

function load (version) {
  const resolved = resolveVersion(version)
  if (!resolved) return null
  const cached = cache[resolved]?.deref()
  if (cached) return cached

  const paths = index[resolved].paths ?? {}
  // where a top-level entry of the version is
  const pathOf = entry => path.join(root, paths[entry] ?? resolved, entry)
  const readJson = (file, fallback) => {
    const p = pathOf(file)
    if (!fs.existsSync(p)) {
      if (fallback !== undefined) return fallback
      throw new Error(`minecraft-assets bedrock ${resolved} has no ${file}`)
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  }

  const data = {
    blocksTextures: readJson('blocks_textures.json'),
    itemsTextures: readJson('items_textures.json', []),
    textureContent: [],
    blocksStates: readJson('blocks_states.json'),
    blocksModels: readJson('blocks_models.json')
  }
  const assets = mcDataToNode(data, 'bedrock_' + resolved, path.join(root, resolved) + path.sep, pathOf)

  // texture_content.json, or the same built from the textures when the export left it out
  let textureContent
  const getTextureContent = () => {
    if (!textureContent) {
      textureContent = readJson('texture_content.json', null)
      if (!textureContent) {
        const named = new Map()
        for (const entry of [...data.itemsTextures, ...data.blocksTextures]) {
          if (!named.has(entry.name) || !named.get(entry.name)) named.set(entry.name, entry.texture)
        }
        textureContent = [...named].map(([name, texture]) => {
          const file = texture && pathOf(texture.replace(/^minecraft:/, '') + '.png')
          return { name, texture: file && fs.existsSync(file) ? 'data:image/png;base64,' + fs.readFileSync(file, 'base64') : null }
        })
      }
    }
    return textureContent
  }
  Object.defineProperty(assets, 'textureContentArray', { enumerable: true, get: getTextureContent })
  Object.defineProperty(assets, 'textureContent', {
    enumerable: true,
    get: () => Object.fromEntries(getTextureContent().map(entry => [entry.name, entry]))
  })

  // what only Bedrock assets have: how the client draws each block (layer, tint, liquid, neighbours), the tint
  // colours per biome, the client entities, their particle effects, and where the export came from
  const lazy = (name, file, fallback) => {
    let value
    Object.defineProperty(assets, name, { enumerable: true, get: () => (value = value ?? readJson(file, fallback)) })
  }
  lazy('blocksRender', 'blocks_render.json', { blocks: {} })
  lazy('tints', 'tints.json', null)
  lazy('entities', 'entities.json', null)
  lazy('particles', 'particles.json', null)
  lazy('meta', 'meta.json', {})
  assets.pathOf = pathOf

  cache[resolved] = new WeakRef(assets)
  return assets
}

module.exports = { load, versions, resolveVersion }
