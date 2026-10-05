# API

`require('minecraft-assets')(version)` gives the assets of a Java Edition version (`'1.21.4'`), or of a Bedrock
Edition one with its edition prefix (`'bedrock_1.26.51'`). A version without assets of its own takes those of the
newest version before it of the same major (`'1.16.5'` gives 1.16.4's), or null when there is none.

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

## bedrockVersions

list of the Bedrock Edition versions with assets, without their edition prefix

## Bedrock Edition

The assets of a Bedrock version have the same blocks, items and texture content as Java's, in the same form: the
blockstates (variants keyed by the Bedrock block state) and models are Java's format. They also have:

### blocksRender

how the game draws each block, beyond its model: `{ blocks: { name: { layer, tint, cube, liquid, connect } } }`

### tints

the colours tinted faces take per biome, in the form of minecraft-data's tints

### entities

the client entities: their definitions, geometry, render controllers, animations and materials

### particles

the client's particle effects, by identifier, as the packs write them (description, curves, components, events), and the
pack files they came from; null for versions without (before 1.16.201)

### meta

where the assets were exported from

### pathOf(entry)

where one of the version's top-level files or folders is (`pathOf('blocks')`): a version may share some with
another, so they are not all in `directory`

## Functions

### findItemOrBlockByName(name)

get a block or item texture by name

### getTexture(name)

get the texture path by name, or null for a name with no texture

### getImageContent(name)

generate the base64 representation of a texture from the name
