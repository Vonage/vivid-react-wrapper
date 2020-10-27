const { getVividPackageNames } = require('./utils')

it('getVividPackageNames', () => {
  const packageJson = {
    dependencies: {
      "@vonage/vwc-button": "0.1",
      "@vonage/vwc-icon": "0.2",
      "@nvm/vwc-badge": "0.2",
    },
    devDependencies: {
      "@vonage/vwc-dropdown": "0.1",
      "@vonage/component": "0.2",
    },
    otherDependencies: {
      "@vonage/vwc-nav": "0.3",
    }
  }
  const expectedList = [
    '@vonage/vwc-button',
    '@vonage/vwc-icon',
    '@vonage/vwc-dropdown'
  ]
  expect(getVividPackageNames(packageJson)).toStrictEqual(expectedList);
});