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
              value: 'http://localhost:3000,lettercms-api-staging.herokuapp.com,lettercms-api.herokuapp.com,lettercms-api.vercel.app,lettercms.vercel.app,*.lettercms.vercel.app'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'POST,OPTIONS'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
            },
          ]
        }
      ];
  },
  async rewrites() {
    return [
      {
        source: "/feed",
        destination: "/api/feed"
      },
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap"
      },
      {
        source: "/robots.txt",
        destination: "/api/robots"
      },
      {
        source: "/manifest.json",
        destination: "/api/manifest"
      }
    ]
  }
};

module.exports = cfg;
