const express = require('express'),
      router = express.Router(),
      models = require('../models/'),
      controllers = require('../controllers'),
      to = require('await-to-js').default,
      ArticleModel = models.ArticleModel,
      categoriesController = controllers.categoriesController;

router.post('/', async function (req, res) {
  var article = new ArticleModel(req.body);

  const [err] = await to(article.save());

  if (!err) {
    const [entitiesErr, entities] = await to(categoriesController.getEntities(article.body));

    if (!entitiesErr) {
      const categories = categoriesController.getCategories(entities);
      const conditions = { _id: article.id };
      const update = {$set: {categories}};
      const options = {new: true};
      const query = ArticleModel.findOneAndUpdate(conditions, update, options);

      const [updateErr, updatedArticle] = await to(query);

      if (!updateErr) {
        res.send({ article: updatedArticle, status: 'OK' });
      } else {
        console.log('failed to update for Article' + article.id);
        console.log(updateErr);
      }
    } else {
      res.send({ article, status: 'OK' });
      console.log('failed to get Enitites for Article: ' + article.id);
      console.log(error);
    }
  } else {
    if (err.name == 'ValidationError') {
      res.statusCode = 400;
      res.send({ error: 'Validation error', status: 'ERROR' });
    } else {
      res.statusCode = 500;
      res.send({ error: 'Server error', status: 'ERROR' });
    }
  }
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

  const [err, articles] = await to(ArticleModel.find(filter).sort('-date').exec());

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
