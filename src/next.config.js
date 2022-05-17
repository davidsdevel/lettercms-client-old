const withPrefresh = require('@prefresh/next');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const withSourceMaps = require('@zeit/next-source-maps');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const {version} = require('../package.json');

const {
  SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  FACEBOOK_APP_SECRET,
  FACEBOOK_APP_ID,
  NODE_ENV,
  ENV
} = process.env;

const isProd = NODE_ENV === 'production';
const basePath = path.join(__dirname, '..');

const cfg = {
  webpack(config, { dev, isServer }) {

    if (!dev && !isServer) {
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

    if (!isServer) {
      config.module.rules.push({
        test: /@lettercms\/.*/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: false,
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
            minified: false,
            sourceMap: false,
            compact: false
          }
        }
      });
    }

    // Move Preact into the framework chunk instead of duplicating in routes:
    const splitChunks = config.optimization && config.optimization.splitChunks;

    if (splitChunks) {
      const {cacheGroups} = splitChunks;

      const test = /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/;

      if (cacheGroups.framework) {
        cacheGroups.preact = Object.assign({}, cacheGroups.framework, { test });
      }
    }

    if (isServer) {
      config.externals.push(
        /^(preact|preact-render-to-string|preact-context-provider)([\\/]|$)/
      );
      config.resolve.alias['@sentry/browser'] = '@sentry/node';
    }

    // Install webpack aliases:
    const aliases = config.resolve.alias || (config.resolve.alias = {});
    aliases.react = aliases['react-dom'] = 'preact/compat';

    // Automatically inject Preact DevTools:
    if (dev && !isServer) {
      const entry = config.entry;
      config.entry = () =>
        entry().then((entries) => {
          entries['main.js'] = ['preact/debug'].concat(entries['main.js'] || []);
          return entries;
        });
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
          release: version,
        })
      );
    }

    return config;
  },
  assetPrefix: ENV === 'production'
    ? 'https://davids-devel-1565378708258.web.app'
    : '',
  env: {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FIREBASE_CONFIG: `{
      "apiKey": "AIzaSyAbaJKknzBo2Dy1_wEnU-nie4D4PBMnOxA",
      "authDomain": "lettercms-1.firebaseapp.com",
      "databaseURL": "https://lettercms-1-default-rtdb.firebaseio.com",
      "projectId": "lettercms-1",
      "storageBucket": "lettercms-1.appspot.com",
      "messagingSenderId": "665199508384",
      "appId": "1:665199508384:web:d721315546970a764142c5",
      "measurementId": "G-S5T194FVV6"
    }`,
    ENV,
    SENTRY_DSN,
    RELEASE: require('../package.json').version,
  },
  distDir: isProd ? '../.next' : '../.nextDev'
};

let final = withPrefresh(cfg);

final = withSourceMaps({
  ...final,
  serverRuntimeConfig: {
    rootDir: basePath,
  }
});

module.exports = final;
