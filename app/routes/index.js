const express = require('express'),
      router = express.Router();

router.use('/article', require('./article'));
router.use('/auth', require('./auth'));
router.use('/category', require('./category'))


module.exports = router;
