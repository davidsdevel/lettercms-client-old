const withPrefresh = require('@prefresh/next');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const withSourceMaps = require('@zeit/next-source-maps')();
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const {
  SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  NODE_ENV,
  ENV,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FIREBASE_APP_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_DATABASE_URL,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_API_KEY,
  FIREBASE_MESSAGING_SENDER_ID
} = process.env;

const isProd = NODE_ENV === 'production';

const webpackConfig = {
  webpack(config, { dev, isServer }) {
      if (!dev) {
        config.optimization.minimize = true;

        config.optimization.minimizer.push(
          new TerserPlugin({
            cache: path.resolve(__dirname, '..', '.next', 'cache', 'terser-minify'),
            terserOptions: {
              output: {
                beautify: false,
                comments: /# sourceMappingURL/i,
              },
              compress: true,
              mangle: true
            },
            extractComments: false
          })
        );
      }
    // Move Preact into the framework chunk instead of duplicating in routes:
    const splitChunks = config.optimization && config.optimization.splitChunks
    if (splitChunks) {
      const cacheGroups = splitChunks.cacheGroups
      const test = /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/
      if (cacheGroups.framework) {
        cacheGroups.preact = Object.assign({}, cacheGroups.framework, { test })
      }
    }

    if (isServer) {
      config.externals.push(
        /^(preact|preact-render-to-string|preact-context-provider)([\\/]|$)/
      )
      config.resolve.alias['@sentry/browser'] = '@sentry/node';
    }

    // Install webpack aliases:
    const aliases = config.resolve.alias || (config.resolve.alias = {})
    aliases.react = aliases['react-dom'] = 'preact/compat';

    // Automatically inject Preact DevTools:
    if (dev && !isServer) {
      const entry = config.entry
      config.entry = () =>
        entry().then((entries) => {
          entries['main.js'] = ['preact/debug'].concat(entries['main.js'] || [])
          return entries
        })
    }

    if (
      SENTRY_DSN &&
      SENTRY_ORG &&
      SENTRY_PROJECT &&
      SENTRY_AUTH_TOKEN &&
      ENV === 'production'
    ) {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: '.next',
          ignore: ['node_modules'],
          stripPrefix: ['webpack://_N_E/'],
          urlPrefix: `~${basePath}/_next`,
          release: COMMIT_SHA,
        })
      )
    }

    return config
  },
  assetPrefix: process.env.ASSETS,
  env: {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FIREBASE_APP_ID,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_DATABASE_URL,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_API_KEY,
    FIREBASE_MESSAGING_SENDER_ID,
    ENV,
    SENTRY_DSN,
    RELEASE: require('../package.json').version
  },
  distDir: '../.next',
}

let final = withPrefresh(webpackConfig);

if(process.env.ENV === 'production')
  final = withSourceMaps({
    ...final,
    serverRuntimeConfig: {
      rootDir: path.join(__dirname, '..'),
    }
  })

module.exports = final;

