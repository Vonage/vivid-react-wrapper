
const { isPackageJsonExists,
    packageJsonFile,
    getCustomElementTagsDefinitionsList } = require('../src/cli/utils')

isPackageJsonExists().then(
    () => {
        getCustomElementTagsDefinitionsList().then(
            tags => console.log(tags)
        )
    }
)