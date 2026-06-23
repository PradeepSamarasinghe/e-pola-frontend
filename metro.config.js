const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports to fix @sentry/core resolving issues
config.resolver.unstable_enablePackageExports = true;
// Handle .js, .mjs extensions correctly for modern Sentry releases
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
