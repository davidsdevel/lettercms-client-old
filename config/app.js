const {argv} = require('yargs');
const {join} = require('path');

const isDev = process.env.NODE_ENV !== 'production'

const sessionConfig = {
  secret: 'lettercms-client-app',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000 * 24,
  }
};

if (!isDev)
  sessionConfig.cookie.secure = true;

const stage = argv.stage || 'preview';

const appConfig = {
  version: require('../package.json').version,
  stage,
  firebaseConfig: {
    apiKey: 'AIzaSyAbaJKknzBo2Dy1_wEnU-nie4D4PBMnOxA',
    authDomain: 'lettercms-1.firebaseapp.com',
    databaseURL: 'https://lettercms-1-default-rtdb.firebaseio.com',
    projectId: 'lettercms-1',
    storageBucket: 'lettercms-1.appspot.com',
    messagingSenderId: '665199508384',
    appId: '1:665199508384:web:d721315546970a764142c5',
    measurementId: 'G-S5T194FVV6'
  }
}