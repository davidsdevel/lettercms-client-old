const app = require('./app');
const env = require('./env');

app.isDev = process.env.NODE_ENV !== 'production';

process.env = Object.assign({}, process.env, env);

module.exports = {
  app,
  env
};
