const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native/rn-get-polyfills' || moduleName.endsWith('/rn-get-polyfills')) {
    return {
      filePath: path.resolve(__dirname, 'scripts/empty-polyfill.js'),
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.serializer.getPolyfills = ({ platform }) => {
  return [];
};

module.exports = config;
