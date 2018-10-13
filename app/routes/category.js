const express = require('express'),
  router = express.Router(),
  models = require('../models/'),
  to = require('await-to-js').default,
  CategoryModel = models.CategoryModel;


router.get('/', async function (req, res) {
  let { q } = req.query;
  const reg = new RegExp(q, 'i');
  const [error, categories] = await to(CategoryModel.find({name: {$regex: reg}}))

  if (error) {
    res.statusCode = 404;
    res.send({ error: 'Not Found', status: 'ERROR' });
    return;
  }
  
  res.send({ categories, status: 'OK' })
});

module.exports = router;
