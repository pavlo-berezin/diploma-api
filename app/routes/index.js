const express = require('express'),
      router = express.Router();

router.use('/article', require('./article'));

module.exports = router;
