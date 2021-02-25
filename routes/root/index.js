const router = require('express').Router();
const cors = require('../../middlewares/cors');

router
  .use(cors)
  .use(require('./files'))

module.exports = router;
