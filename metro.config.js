const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SavoMind is a separate Python checkout used by the local API server. Metro
// must not crawl or bundle it as part of the Expo application.
config.resolver.blockList = [/[/\\]SavoMind[/\\].*/];

module.exports = config;
