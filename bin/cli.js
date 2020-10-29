const { OutputLanguage, CLIArgument, WCAConfigAll } = require('../src/cli/consts')
const { generateWrappers } = require('../src/cli/generator')
const {
  isFileExists,
  getParsedJson,
  getVividPackageNames,
  getInputArgument,
  getVividLatestRelease,
  getCustomElementTagsDefinitionsList } = require('../src/cli/utils')

getInputArgument(CLIArgument.All) ?
  getVividLatestRelease().then(
    getCustomElementTagsDefinitionsList(WCAConfigAll)
  ).then(generateWrappers(
    getInputArgument(CLIArgument.Output, './src/generated'),
    getInputArgument(CLIArgument.Language, OutputLanguage.JavaScript)
  ))
  : isFileExists('package.json')
    .then(getParsedJson)
    .then(getVividPackageNames)
    .then(getCustomElementTagsDefinitionsList())
    .then(generateWrappers(
      getInputArgument(CLIArgument.Output, './src/generated'),
      getInputArgument(CLIArgument.Language, OutputLanguage.JavaScript)
    ))
