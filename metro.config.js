const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. Get the base config
let config;
try {
  config = getSentryExpoConfig(__dirname);
} catch (e) {
  config = getDefaultConfig(__dirname);
}

// 2. Wrap it with NativeWind
module.exports = withNativeWind(config, { input: './global.css' });
