const { generateWrappers } = require('../src/cli/generator')
const {
  isExistingFile,
  getParsedJson,
  getVividPackageNames,
  getInputArgument,
  getCustomElementTagsDefinitionsList } = require('../src/cli/utils')

isExistingFile('package.json')
  .then(getParsedJson)
  .then(getVividPackageNames)
  .then(getCustomElementTagsDefinitionsList)
  .then(tags => generateWrappers(tags, getInputArgument('output', './src/generated')))
