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
  assetPrefix: app.stage === 'production'
    ? 'https://davids-devel-1565378708258.web.app'
    : '',
  env: {
    FACEBOOK_APP_ID,
    FIREBASE_CONFIG: JSON.stringify(app.firebaseConfig),
    SENTRY_DSN,
    JWT_AUTH,
    RELEASE:  app.version,
  },
  async rewrites() {
    return [
      {
        source: "/:subdomain/feed",
        destination: "/api/feed?subdomain=:subdomain"
      },
      {
        source: "/:subdomain/sitemap.xml",
        destination: "/api/sitemap?subdomain=:subdomain"
      },
      {
        source: "/:subdomain/robots.txt",
        destination: "/api/robots?subdomain=:subdomain"
      },
      {
        source: "/:subdomain/manifest.json",
        destination: "/api/manifest?subdomain=:subdomain"
      },
      {
        source: '/:subdomain',
        destination: '/?subdomain=:subdomain',
      },
      {
        source: '/:subdomain/:_url',
        destination: '/post?subdomain=:subdomain&ID=:_url',
      }
    ]
  }
};

module.exports = cfg;
