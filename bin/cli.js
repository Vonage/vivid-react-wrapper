const { generateWrappers } = require('../src/cli/generator')
const {
  isPackageJsonExists,
  getParsedPackageJson,
  getVividPackageNames,
  getInputArgument,
  getCustomElementTagsDefinitionsList } = require('../src/cli/utils')

isPackageJsonExists()
  .then(getParsedPackageJson)
  .then(getVividPackageNames)
  .then(getCustomElementTagsDefinitionsList)
  .then(tags => generateWrappers(tags, getInputArgument('output', './src/generated')))
