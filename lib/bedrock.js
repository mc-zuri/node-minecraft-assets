// Bedrock Edition assets: data/bedrock/<version>/ in the layout of the Java versions' folders, made by
// minecraft-bedrock-extractor. data/bedrock/versions.json maps every Bedrock version minecraft-data knows to the folder
// that holds its assets (versions whose assets are the same share one).
const fs = require('fs')
const path = require('path')
const mcDataToNode = require('./loader')

const root = path.join(__dirname, '../minecraft-assets/data/bedrock')
const indexFile = path.join(root, 'versions.json')
const folders = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : {}
const cache = {}

function readJson (folder, name, fallback) {
  const file = path.join(root, folder, name + '.json')
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback
}

// '1.21.0' -> the assets of Bedrock 1.21.0, or null
function load (version) {
  const folder = folders[version]
  if (folder === undefined) return null
  if (!cache[version]) {
    const data = {
      blocksTextures: readJson(folder, 'blocks_textures', []),
      itemsTextures: readJson(folder, 'items_textures', []),
      textureContent: readJson(folder, 'texture_content', []),
      blocksStates: readJson(folder, 'blocks_states', {}),
      blocksModels: readJson(folder, 'blocks_models', {})
    }
    cache[version] = mcDataToNode(data, 'bedrock_' + version, 'bedrock/' + folder)
  }
  return cache[version]
}

module.exports = { load, versions: Object.keys(folders) }
