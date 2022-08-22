const path = require('path');
const {env, app} = require('./config');

const {
  SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  FACEBOOK_APP_ID,
  JWT_AUTH
} = env;

const cfg = {
  eslint: {
    ignoreDuringBuilds: true
  },
  poweredByHeader: false,
  webpack(config, { isServer }) {

    if (isServer)
      config.resolve.alias['@sentry/browser'] = '@sentry/node';

    return config;
  },
  env: {
    FACEBOOK_APP_ID,
    FIREBASE_CONFIG: JSON.stringify(app.firebaseConfig),
    SENTRY_DSN,
    JWT_AUTH,
    RELEASE:  app.version,
  },
   async headers() {
    return [
        {
          source: '/api/revalidate',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'POST,OPTIONS,HEAD'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
            },
          ]
        }
      ];
  }
};

module.exports = cfg;
