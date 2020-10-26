const { join } = require('path'),
    { access, F_OK, readFileSync } = require('fs'),
    { spawn } = require('child_process')

const packageJsonFile = join(process.cwd(), 'package.json')
const isFileExists = async fileName => new Promise((resolve, reject) => access(fileName, F_OK, error => error ? reject(false) : resolve(true)))
const isPackageJsonExists = async () => await isFileExists(packageJsonFile)
const isVividElementPackage = package => /@vonage\/vwc-*/.test(package)

const getVividPackages = (packageJson = packageJsonFile) => {
    const pkgContent = JSON.parse(readFileSync(packageJson, { encoding: 'utf8' }))
    const packages = [
        ...Object.keys(pkgContent.devDependencies),
        ...Object.keys(pkgContent.dependencies)
    ].filter(isVividElementPackage).reduce((acc, pkg) => {
        acc[pkg] = pkg
        return acc
    }, {});
    return Object.keys(packages)
}

const getCustomElementTagsDefinitionsList = async () => new Promise((resolve, reject) => {
    const child = spawn('node',
        [
            './node_modules/web-component-analyzer/cli.js',
            'analyze',
            `node_modules/{${getVividPackages().join(',')}}/{src/,}*.?s`,
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
    getCustomElementTagsDefinitionsList,
    getVividPackages,
    isPackageJsonExists,
    packageJsonFile
}