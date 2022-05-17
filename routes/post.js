const router = require('express').Router();
const Router = require('../middlewares/posts');
const renderPost = new Router();
const {Letter} = require('@lettercms/sdk');


router
  .get('/', (req, res) => req.renderApp(req, res, '/', {}))
  .get('/:title', (req, res, next) => renderPost.render(req, res, next))
  .get('/:category/:title', (req, res, next) => renderPost.render(req, res, next))
  .get('/:year/:month/:title', (req, res, next) => renderPost.render(req, res, next))
  .get('/:year/:month/:day/:title', (req, res, next) => renderPost.render(req, res, next));

module.exports = router;
