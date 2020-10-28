const CLIArgument = {
    Output: 'output', // output folder
    Language: 'language', // language js,ts
    IgnorePackageJson: 'ignore-package-json' // ignore local package.json and produce wrappers for *all* Vivid components
}

const OutputLanguage = {
    JavaScript: 'js',
    TypeScript: 'ts'
}

module.exports = {
    OutputLanguage,
    CLIArgument
}