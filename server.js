const Sentry = require('@sentry/node');
const jwt = require('jsonwebtoken');

// Server
const express = require('express');
const server = express();
const nextApp = require('next');
const {join} = require('path');
const conf = require('./src/next.config');

// Express Middlewares
const session = require('express-session');

// Router
const rootRouter = require('./routes/root');
const postRouter = require('./routes/post');

const dev = process.env.NODE_ENV !== 'production';
const app = nextApp({
  dev,
  conf: {
    ...conf,
    distDir: conf.distDir.replace('../', './')
  }
});
const handle = app.getRequestHandler();

Sentry.init({
  enabled: !dev,
  dsn: process.env.SENTRY_DSN,
  maxBreadcrumbs: 50,
  debug: true,
  environment: 'client:server:staging',
  release: require('./package.json').version
});

const PORT = process.env.PORT || 3001;

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
    user: false,
    version: false
  }))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(session(sess))
  .use('/:subdomain', (req, res, next) => {
    req.subdomain = req.params.subdomain;
    req.handle = handle;

    req.renderApp = (request, response, path, query) => app.render(request, response, path, query);
    req.generateToken = subdomain  => jwt.sign({subdomain}, 'davidsdevel')
    
    next();
  }, rootRouter, postRouter)
  .all('*', (req, res) => req.handle(req, res));

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
        throw err;

      console.log(`> Worker ${process.pid} Listen on Port: ${PORT}`);
    });
  } catch (err) {
    throw err;
  }
}

module.exports = {
  init: initApp,
  server,
  prepare
};
