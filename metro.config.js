const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Résoudre les modules natifs incompatibles avec le web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Stripe React Native n'est pas compatible web — retourner un module vide
    if (moduleName === '@stripe/stripe-react-native' || moduleName.startsWith('@stripe/stripe-react-native/')) {
      return { type: 'empty' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
