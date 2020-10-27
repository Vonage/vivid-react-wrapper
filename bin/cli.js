
const {
  isPackageJsonExists,
  getParsedPackageJson,
  getVividPackageNames,
  getCustomElementTagsDefinitionsList } = require('../src/cli/utils')

isPackageJsonExists()
  .then(getParsedPackageJson)
  .then(getVividPackageNames)
  .then(getCustomElementTagsDefinitionsList)
  .then(console.log)