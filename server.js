const Sentry = require('@sentry/node');
const sdk = require('@lettercms/sdk');

// Server
const express = require('express');
const server = express();
const nextApp = require('next');
const {join} = require('path');

// Express Middlewares
const session = require('express-session');
//const KnexSessionStore = require('connect-session-knex')(session);

// Router
const rootRouter = require('./routes/root');
const Router = require('./middlewares/posts');

const dev = process.env.NODE_ENV !== 'production';
const app = nextApp({
  dev,
  conf: {
    distDir: '.next',
  }
});
const handle = app.getRequestHandler();

Sentry.init({
  enabled: process.env.NODE_ENV === 'production',
  dsn: process.env.SENTRY_DSN,
  maxBreadcrumbs: 50,
  debug: true,
  environment: 'app:server',
  release: require('./package.json').version
});

const PORT = process.env.PORT || 3000;
const renderPost = new Router();

const sess = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000 * 24,
  },
};

if (!dev) {
  sess.cookie.secure = true;
  server.set('trust proxy', 1);
}

server
  .use(Sentry.Handlers.requestHandler({
    user: false,//['email', 'ID'], // default: true = ['id', 'username', 'email']
    version: false
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(session(sess))
  .use('/', rootRouter)
  .use((req, res, next) => {
    req.subdomain = 'davidsdevel';
    req.handle = handle;
    req.renderApp = (req, req, path, query) => app.render(req, res, path, query);
    req.generatetoken = subdomain  => jwt.sign({subdomain}, 'davidsdevel')
    next();
  });

  server
    .get('/:title', (req, res, next) => renderPost.render(req, res, next))
    .get('/:category/:title', (req, res, next) => renderPost.render(req, res, next))
    .get('/:year/:month/:title', (req, res, next) => renderPost.render(req, res, next))
    .get('/:year/:month/:day/:title', (req, res, next) => renderPost.render(req, res, next))
    .all('*', async (req, res) => {
      const token = req.generatetoken(req.subdomain);
      const subSDK = new sdk.Letter(token);

      const {mainUrl} = await subSDK.blogs.single(['mainUrl']);

      if (req.url === mainUrl)
        return req.renderApp(req, res, '/', {});

      req.handle(req, res);
    });

  server
    .use(Sentry.Handlers.errorHandler())
    .use(function onError(err, req, res, next) {
      // The error id is attached to `res.sentry` to be returned
      // and optionally displayed to the user for support.
      console.error(err)
      res.statusCode = 500;
      req.renderApp(req, res, '/_error', {code: res.sentry});
    });

async function prepare() {
  try {
   console.log('Preparing Client...');
    await app.prepare();
    console.log('Prepared Client'); 

    return Promise.resolve(server);
  } catch(err) {
    return Promise.reject();
  }
}

async function initApp() {
  try {
    await prepare();

    server.listen(PORT, err => {
      if (err)
        throw new Error(err);

      console.log(`> Worker ${process.pid} Listen on Port: ${PORT}`);
    });
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  init: initApp,
  server,
  prepare
};
