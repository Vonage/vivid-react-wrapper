const { cleanupDir, kebab2Camel, capitalize, toCommaSeparatedList } = require('./utils')
const { getTemplate, TemplateToken } = require('./templates')
const { writeFileSync } = require('fs')
const { join } = require('path')
const { OutputLanguage } = require('./consts')

const generateWrappers = (outputDir, language = OutputLanguage.JavaScript) => (tags) => {
    cleanupDir(outputDir)
    const imports = []
    const exports = []

    for (const tag of tags) {
        const camelizedName = kebab2Camel(tag.name)
        const componentName = capitalize(camelizedName)
        const componentFileExt = `.${language}`
        const componentFileName = `${camelizedName}.g`
        const componentOutputFileName = join(process.cwd(), outputDir, `${componentFileName}${componentFileExt}`)
        imports.push(`import { ${componentName} } from './${componentFileName}'`)
        exports.push(`  ${componentName}`)

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
    generateWrappers
}
