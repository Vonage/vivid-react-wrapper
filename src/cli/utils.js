const { join } = require('path'),
    { access, F_OK, readFileSync } = require('fs'),
    { spawn } = require('child_process')


const isExistingFile = (fileName) => new Promise(
  (resolve, reject) => access(
    fileName,
    F_OK,
    error => error
      ? reject(false)
      : resolve(fileName)
  ))

const isPackageJsonExists = () => {
    const filePath = join(process.cwd(), 'package.json')
    return isExistingFile(filePath);
}

const getParsedPackageJson = (packageJsonFilePath) => JSON.parse(readFileSync(packageJsonFilePath, { encoding: 'utf8' }))

const getVividPackageNames = ({ dependencies, devDependencies }) => {
    const isVividPackageName = (packageName) => /@vonage\/vwc-*/.test(packageName)
    const unique = (stringArray) => Array.from(new Set(stringArray))
    const packages = [
        ...Object.keys(dependencies),
        ...Object.keys(devDependencies)
    ]
    return unique(packages).filter(isVividPackageName)
}

const getCustomElementTagsDefinitionsList = (vividPackageNames) => new Promise((resolve, reject) => {
    const child = spawn('node',
        [
            './node_modules/web-component-analyzer/cli.js',
            'analyze',
            `node_modules/{${vividPackageNames.join(',')}}/{src/,}*.?s`,
            '--discoverNodeModules',
            '--format', 'json',
        ], { cwd: process.cwd() })
    const result = [];
    child.on('error', error => reject(error))
    child.stdout.on('data', data => {
        const stringOutput = data.toString()
        let jsonObject
        if (stringOutput.indexOf('{') >= 0) {
            try {
                jsonObject = JSON.parse(stringOutput)
            } catch (error) {
                return
            }
            result.push(jsonObject)
        } else if (stringOutput.indexOf('!!!') < 0) {
            console.info(stringOutput)
        }
    }
    )
    child.on('exit', () => resolve(result.reduce((acc, x) => ([...acc, ...x.tags]), []))
    )
})

module.exports = {
    isPackageJsonExists,
    getParsedPackageJson,
    getVividPackageNames,
    getCustomElementTagsDefinitionsList,
}