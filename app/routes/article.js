const express = require('express'),
      router = express.Router(),
      models = require('../models/'),
      controllers = require('../controllers'),
      to = require('await-to-js').default,
      ArticleModel = models.ArticleModel,
      articlesController = controllers.articlesController;

router.post('/', async function (req, res) {
  const [error, article] = await to(articlesController.saveArticle(req.body));

  if (error) {
    res.statusCode = error.statusCode;
    res.send(error.error);
  }

  res.statusCode = 200;
  res.send(article);
});

router.get('/:id', async function (req, res) {
  const id = req.params.id;

  const [err, article] = await to(ArticleModel.findById(id));

  if (!err) {
    res.send({ article, status: 'OK' });
  } else {
    res.statusCode = 404;
    res.send({ error: 'Article not Found', status: 'ERROR'});
  }
});

router.get('/', async function (req, res) {
  let { categories } = req.query;
  let filter = {}

  if (categories && categories.length) {
    categories = Array.isArray(categories) ? categories : [categories];

    filter.categories = { $all: categories.map(el => new RegExp(el, 'i')) }
  }

  const [err, articles] = await to(ArticleModel.find(filter).sort('-date').populate('categories').exec());

  if (!err) {
    res.send({ articles, status: 'OK' })
  } else {
    res.statusCode = 404;
    res.send({ error: 'Not Found', status: 'ERROR' });
  }
});

router.delete('/:id', async function (req, res) {
  const id = req.params.id;

  const [err, article] = await to(ArticleModel.findByIdAndRemove(id));

  if (!err) {
    res.send({ status: 'OK', removed: article })
  } else {
    res.statusCode = 500;
    res.send({ error: `Internal error: ${err}`, status: 'ERROR' });
  }
});


module.exports = router;
