const path = require('path');
const {env, app} = require('./config');
const { withSentryConfig } = require('@sentry/nextjs');

const cfg = {
  eslint: {
    ignoreDuringBuilds: true
  },
  poweredByHeader: false,
  env: {
    ...env,
    FIREBASE_CONFIG: JSON.stringify(app.firebaseConfig),
    RELEASE:  app.version,
  },
  sentry: {
    hideSourceMaps: true,
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

const sentryWebpackPluginOptions = {
  silent: true
}

module.exports = withSentryConfig(cfg, sentryWebpackPluginOptions);
