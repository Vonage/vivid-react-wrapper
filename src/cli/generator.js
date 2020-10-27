const { cleanupDir, kebab2Camel, capitalize, toCommaSeparatedList } = require('./utils')
const { getTemplate, TemplateToken } = require('./templates')
const { writeFileSync } = require('fs')
const { join } = require('path')

const OutputLanguage = {
    JavaScript: 'js',
    TypeScript: 'ts'
}

const generateWrappers = (tags, outputDir, language = OutputLanguage.JavaScript) => {
    cleanupDir(outputDir)
    const imports = []
    const exports = []

    for (const tag of tags) {
        const camelizedName = kebab2Camel(tag.name)
        const componentName = capitalize(camelizedName)
        const componentOutputFileName = join(process.cwd(), outputDir, `${camelizedName}.g.${language}`)

        writeFileSync(
            componentOutputFileName,
            getTemplate('react-component', language)
                .replace(TemplateToken.EVENTS, toCommaSeparatedList(tag.events))
                .replace(TemplateToken.PROPERTIES, toCommaSeparatedList(tag.properties))
                .replace(TemplateToken.ATTRIBUTES, toCommaSeparatedList(tag.attributes))
                .replace(new RegExp(TemplateToken.COMPONENT_CLASS_NAME, 'g'), componentName)
                .replace(new RegExp(TemplateToken.TAG, 'g'), tag.name)
        )
        
    }

    const indexOutputFileName = join(process.cwd(), outputDir, `index.${language}`)
    writeFileSync(
        indexOutputFileName,
        getTemplate('index', language)
            .replace(TemplateToken.EXPORTS, exports.join(',\n'))
            .replace(TemplateToken.IMPORTS, imports.join('\n'))
    )
}

module.exports = {
    generateWrappers,
    OutputLanguage
}
