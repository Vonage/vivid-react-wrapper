const { cleanupDir, kebab2Camel, capitalize, toCommaSeparatedList } = require('./utils')
const { getTemplate, TemplateToken } = require('./templates')
const { writeFileSync } = require('fs')
const { join } = require('path')
const { OutputLanguage } = require('./consts')

const getPropTypes = tag => {
    const properties = (tag.properties || [])
        .filter(prop => prop.type) // only props having certain type
        .filter(prop => /\'.*?\'/.test(prop.name) || /^([a-zA-Z_$][a-zA-Z\\d_$]*)$/.test(prop.name)) // only props having valid names
    const isBoolean = type => /(true|false)/.test(type)
    const isNumber = type => /(integer)/.test(type)
    const isString = type => type === 'string | undefined'
    const isTypeSet = type => /(\".*?\" \|)/.test(type)
    const getSetTypeOptions = setType => setType.split('|').map(x => x.trim())
    const mapTypeToPropType = type => ['boolean', 'string', 'number', 'array'].indexOf(type) >= 0
        ? (type === 'boolean' ? 'bool' : type)
        : isTypeSet(type) ? `oneOf([${getSetTypeOptions(type).join(',')}])`
            : isString(type) ? 'string' : isNumber(type) ? 'number' : isBoolean(type) ? 'bool' : `any /* ${type} */`
    const result = properties.map(x => `  ${x.name}: PropTypes.${mapTypeToPropType(x.type.toLowerCase())}`)
    return result
}

const renderComponent = tag => language => componentName => {
    const result = getTemplate('react-component', language)
        .replace(TemplateToken.EVENTS, toCommaSeparatedList(tag.events))
        .replace(TemplateToken.PROPERTIES, toCommaSeparatedList(tag.properties))
        .replace(TemplateToken.ATTRIBUTES, toCommaSeparatedList(tag.attributes))
        .replace(TemplateToken.PROP_TYPES, getPropTypes(tag).join(',\n'))
        .replace(new RegExp(TemplateToken.COMPONENT_CLASS_NAME, 'g'), componentName)
        .replace(new RegExp(TemplateToken.TAG, 'g'), tag.name)

    return result
}

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
        console.info(`Processing ${componentName}...`)

        writeFileSync(
            componentOutputFileName,
            renderComponent(tag)(language)(componentName)
        )
    }

    const indexOutputFileName = join(process.cwd(), outputDir, `index.${language}`)
    writeFileSync(
        indexOutputFileName,
        getTemplate('index', language)
            .replace(TemplateToken.EXPORTS, exports.join(',\n'))
            .replace(TemplateToken.IMPORTS, imports.join('\n'))
    )
    console.info(`${imports.length} wrappers generated at ${outputDir}`)
}

module.exports = {
    generateWrappers
}
