// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Tambahkan modul fallback untuk error missing asset registry path
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'missing-asset-registry-path': require.resolve('./assets/placeholder.js'),
};

// Konfigurasi transformasi Metro
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;