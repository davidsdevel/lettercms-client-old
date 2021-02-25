const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const {DefinePlugin} = require('webpack');

let definePluginConfig = {
  'process.env.NODE_ENV': '\'production\'',
  'process.env.DAVIDSDEVEL_TARGET': '\'' + process.env.DAVIDSDEVEL_TARGET + '\''
};

if (process.env.DB_CLIENT) {
  definePluginConfig['process.env.DB_CLIENT'] = '\'' + process.env.DB_CLIENT + '\'';
}

module.exports = {
  entry: resolve(__dirname, 'index.js'),
  output: {
    filename: 'index.dist.js',
    path: __dirname,
    libraryTarget: 'umd',
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new DefinePlugin(definePluginConfig)
  ],
  externals: [
    /@prefresh\/next/,
    /@sentry\/browser/,
    /@sentry\/integrations/,
    /@sentry\/node/,
    /bcrypt/,
    /connect-ensure-login/,
    /connect-session-knex/,
    /express/,
    /express-fileupload/,
    /express-ip/,
    /express-session/,
    /express-ua-middleware/,
    /feed/,
    /firebase/,
    /firebase-admin/,
    /i18n-iso-countries/,
    /isomorphic-fetch/,
    /jimp/,
    /knex/,
    /next/,
    /node-mailjet/,
    /node-schedule/,
    /passport/,
    /passport-local/,
    /preact/,
    /preact-render-to-string/,
    /react/,
    /react-dom/,
    /react-ssr-prepass/,
    /recharts/,
    /redux/,
    /xml-js/
  ],
  mode: 'production',
  target: 'node',
};
