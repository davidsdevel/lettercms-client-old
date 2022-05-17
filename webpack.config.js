const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const {DefinePlugin} = require('webpack');

const firebaseData = JSON.stringify({
  apiKey: 'AIzaSyAzcg06Z-3ukLDhVkvxM7V0lCNwYTwHpho',
  authDomain: 'davids-devel-1565378708258.firebaseapp.com',
  databaseURL: 'https://davids-devel-1565378708258.firebaseio.com',
  projectId: 'davids-devel-1565378708258',
  storageBucket: '',
  messagingSenderId: '167456236988',
  appId: '1:167456236988:web:0896b0297732acc2'
});

let definePluginConfig = {
  'process.env.NODE_ENV': '\'production\''
};

module.exports = {
  entry: {
    'firebase-messaging-sw': resolve(__dirname, 'src', 'public', 'firebase-messaging-sw.js'),
    'offline-sw': resolve(__dirname, 'src', 'public', 'offline-sw.js'),
  },
  output: {
    filename: 'index.dist.js',
    path: resolve(__dirname, 'public'),
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      cache: path.resolve(__dirname, '.next', 'cache', 'terser-server'),
      terserOptions: {
        output: {
          beautify: false,
          comments: /# sourceMappingURL/i,
        },
        compress: true,
        mangle: true
      },
      extractComments: false
    })],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
            minified: !isDev,
            sourceMap: isDev,
            compact: !isDev,
          }
        }
      }
    ]
  },
  plugins: [
    new DefinePlugin(definePluginConfig)
  ],
  externals: [
    /@lettercms\/sdk/,
    /@prefresh\/next/,
    /@sentry\/browser/,
    /@sentry\/integrations/,
    /@sentry\/node/,
    /express/,
    /express-session/,
    /feed/,
    /isomorphic-fetch/,
    /jsonwebtoken/,
    /next/,
    /preact/,
    /preact-render-to-string/,
    /react/,
    /react-dom/,
    /react-ssr-prepass/,
    /redux/
  ],
  mode: 'production',
  target: 'node',
};
