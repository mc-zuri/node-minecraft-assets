# API

## Blocks

### blocks

blocks textures by name

### blocksArray

array of blocks textures

## Items

### items

items textures by name

### itemsArray

array of items textures

## Texture content

### textureContent

texture content by name

### textureContentArray

array of texture content

## version

## directory

## versions

list of supported versions

## Functions

### findItemOrBlockByName(name)

get a block or item texture by name

### getTexture(name)

get the texture path by name

### getImageContent(name)

generate the base64 representation of a texture from the name

## bedrockVersions

list of the Bedrock versions there are assets of, without their `bedrock_` prefix (`'1.21.0'`): every version
minecraft-data has. `require('minecraft-assets')('bedrock_1.21.0')` gives a Bedrock version's assets, the same API as a
Java version's; `directory` is its folder of `data/bedrock`, which versions with the same assets share
(`data/bedrock/versions.json`).
