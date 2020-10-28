const { OutputLanguage, CLIArgument } = require('../src/cli/consts')
const { generateWrappers } = require('../src/cli/generator')
const {
  isFileExists,
  getParsedJson,
  getVividPackageNames,
  getInputArgument,
  getCustomElementTagsDefinitionsList } = require('../src/cli/utils')

isFileExists('package.json')
  .then(getParsedJson)
  .then(getVividPackageNames)
  .then(getCustomElementTagsDefinitionsList)
  .then(generateWrappers(
      getInputArgument(CLIArgument.Output, './src/generated'),
      getInputArgument(CLIArgument.Language, OutputLanguage.JavaScript)
  ))
