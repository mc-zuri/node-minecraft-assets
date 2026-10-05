const fs = require('fs')
const path = require('path')

module.exports = mcDataToNode

// directory: the folder of the version's files; pathOf(entry): where one of its top-level entries is, when the version
// shares some with another (see bedrock.js)
function mcDataToNode (mcData, mcVersion, directory = path.join(__dirname, '/../minecraft-assets/data/', mcVersion, '/'), pathOf = entry => path.join(directory, entry)) {
  const indexes = require('./indexes.js')(mcData)
  function findItemOrBlockByName (name) {
    const item = indexes.itemsByName[name]
    if (item !== undefined) return item
    return indexes.blocksByName[name]
  }
  function getTexture (name) {
    const texture = findItemOrBlockByName(name)?.texture
    return texture ? texture.replace('minecraft:', '') : null
  }
  return {
    blocks: indexes.blocksByName,
    blocksArray: mcData.blocksTextures,

    items: indexes.itemsByName,
    itemsArray: mcData.itemsTextures,

    textureContent: indexes.textureContentByName,
    textureContentArray: mcData.textureContent,

    blocksStates: mcData.blocksStates,
    blocksModels: mcData.blocksModels,
    directory,
    version: mcVersion,

    findItemOrBlockByName: findItemOrBlockByName,
    getTexture: getTexture,

    getImageContent: function (name) {
      const texture = getTexture(name)
      if (texture == null) { return null }
      // the files are in blocks/ and items/, which the textures of newer versions name block/ and item/
      const file = texture.replace(/^block\//, 'blocks/').replace(/^item\//, 'items/') + '.png'
      return 'data:image/png;base64,' + fs.readFileSync(pathOf(file), 'base64')
    }
  }
}
