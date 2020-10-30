const { join } = require('path'),
    { access, F_OK, readFileSync, readdirSync, unlink, rmdirSync, createWriteStream } = require('fs'),
    mkdirp = require('mkdirp'),
    { spawnSync } = require('child_process'),
    { WCAConfig, tempFolder } = require('./consts'),
    { Octokit } = require('@octokit/core'),
    extract = require('extract-zip')

const getGithubToken = () => process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_TOKEN
const toCommaSeparatedList = collection => (collection || []).map(x => `'${x.name}'`).join(',')
const capitalize = input => input.replace(/(^|\s)[a-z]/g, s => s.toUpperCase())
const deCapitalize = input => input.replace(/(^|\s)[A-Z]/g, s => s.toLowerCase())
const kebab2Camel = input => deCapitalize(input.split('-').map(x => capitalize(x)).join(''))
const getFileNameFromDispositionHeader = input => /filename=(.*$)/.exec(input)[1]
const cleanupDir = p => {
    mkdirp.sync(p)
    readdirSync(p).map(f => unlink(join(p, f), () => { }))
}

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
    const result = unique(packages).filter(isVividPackageName)
    console.log(`Vivid packages detected from package.json: \n${result.map(x => `  - ${x}`).join('\n')}`)
    return result
}

const getCustomElementTagsDefinitionsList = (config = WCAConfig) => (vividPackageNames) => new Promise((resolve) => {
    const analyzerOutput = filePath(join(config.tempFolder, config.tempFileName))
    const child = spawnSync(
        'node',
        config.nodeArgumentsFactory(vividPackageNames, analyzerOutput),
        { cwd: process.cwd() }
    )
    if (child.status === 0) {
        const output = getParsedJson(analyzerOutput)
        rmdirSync(filePath(config.tempFolder), { recursive: true })
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

const getVividLatestRelease = async (config = { tempFolder, tempFileName: 'vivid.zip' }) => {
    cleanupDir(filePath(tempFolder))
    console.log(`Fetching latest Vivid release artifact...`)
    if (!getGithubToken()) {
        console.warn(`It seems GITHUB_ACCESS_TOKEN or GITHUB_TOKEN environment variable is not defined.`)
        return
    }
    const octokit = new Octokit({ auth: getGithubToken() })
    const result = await octokit.request('GET /repos/Vonage/vivid/zipball')
    if (result.status === 200) {
        const filename = getFileNameFromDispositionHeader(result.headers['content-disposition'])
        console.info(`Got zipball ${filename}`)
        const outFolder = filePath(config.tempFolder)
        const vividZipFileName = join(outFolder, config.tempFileName)
        const vividZipStream = createWriteStream(vividZipFileName)
        vividZipStream.write(Buffer.from(result.data))
        try {
            await extract(vividZipFileName, { dir: outFolder })
        } catch (err) {
            console.error(err)
        }
        return `${outFolder}/**/components/**`
    }
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
    getVividLatestRelease,
    getCustomElementTagsDefinitionsList
}