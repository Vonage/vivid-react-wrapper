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
  .then(generateWrappers(
      getInputArgument('output', './src/generated')
  ))
