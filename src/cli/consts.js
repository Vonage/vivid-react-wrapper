const WCAConfig = { // web-component-analyzer config
  tempFolder: 'temp',
  tempFileName: 'analyzerOutput.json',
  nodeArgumentsFactory: (packageNames, analyzerOutputFile) => [
    './node_modules/web-component-analyzer/cli.js',
    'analyze',
    `node_modules/{${packageNames.join(',')}}/{src/,}*.?s`,
    '--discoverNodeModules',
    '--format', 'json',
    '--outFile', analyzerOutputFile
  ]
}

const CLIArgument = {
    Output: 'output', // output folder
    Language: 'language', // language js,ts
    All: 'all' // ignore local package.json and produce wrappers for *all* Vivid components
}

const OutputLanguage = {
    JavaScript: 'js',
    TypeScript: 'ts'
}

module.exports = {
    OutputLanguage,
    WCAConfig,
    CLIArgument
}