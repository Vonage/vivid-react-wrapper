const { join } = require('path'),
    { access, F_OK, readFileSync, readdirSync, unlink } = require('fs'),
    mkdirp = require('mkdirp'),
    { spawnSync } = require('child_process')

const toCommaSeparatedList = collection => (collection || []).map(x => `'${x.name}'`).join(',')    
const capitalize = input => input.replace(/(^|\s)[a-z]/g, s => s.toUpperCase())
const deCapitalize = input => input.replace(/(^|\s)[A-Z]/g, s => s.toLowerCase())
const kebab2Camel = input => deCapitalize(input.split('-').map(x => capitalize(x)).join(''))
const cleanupDir = p => {
    mkdirp.sync(p)
    readdirSync(p).map(f => unlink(join(p, f), () => {}))
}
const WEB_ANALYZER_CONFIG = (packageNames, analyzerOutputFile) => [
  './node_modules/web-component-analyzer/cli.js',
  'analyze',
  `node_modules/{${packageNames.join(',')}}/{src/,}*.?s`,
  '--discoverNodeModules',
  '--format', 'json',
  '--outFile', analyzerOutputFile
]

const isFileExists = (fileName) => new Promise(
  (resolve, reject) => access(
    filePath(fileName),
    F_OK,
    error => error
      ? reject(false)
      : resolve(fileName)
  ))
const filePath = (fileName) => join(process.cwd(), fileName)

const getParsedJson = (jsonFilePath) => JSON.parse(readFileSync(jsonFilePath, { encoding: 'utf8' }))

const getVividPackageNames = ({ dependencies, devDependencies }) => {
    const isVividPackageName = (packageName) => /@vonage\/vwc-*/.test(packageName)
    const unique = (stringArray) => Array.from(new Set(stringArray))
    const packages = [
        ...Object.keys(dependencies),
        ...Object.keys(devDependencies)
    ]
    return unique(packages).filter(isVividPackageName)
}

const getCustomElementTagsDefinitionsList = (vividPackageNames) => new Promise((resolve) => {
    const analyzerOutput = filePath('/temp/analyzerOutput.json')
    const child = spawnSync('node', WEB_ANALYZER_CONFIG(vividPackageNames, analyzerOutput), { cwd: process.cwd() })
    if (child.status === 0) {
        const output = getParsedJson(analyzerOutput)
        return resolve(output.tags)
    }
})

const getInputArgument = (argumentName, defaultValue = null) => {
    const argumentObjects = process.argv
        .filter(argument => argument.indexOf('=') >= 0)
        .map(argument => ({
            name: argument.split('=')[0].replace(/--/g, ''),
            value: argument.split('=')[1]
        }))
    const targetArgument = argumentObjects.find(argumentObject => argumentObject.name === argumentName)
    return targetArgument ? targetArgument.value : defaultValue
}

module.exports = {
    toCommaSeparatedList,
    cleanupDir,
    capitalize,
    kebab2Camel,
    getInputArgument,
    isFileExists,
    getParsedJson,
    getVividPackageNames,
    getCustomElementTagsDefinitionsList
}