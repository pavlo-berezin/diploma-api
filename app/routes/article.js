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

  const [err, article] = await to(ArticleModel.findById(id).populate({
    path: 'textCategories',
    populate: {
      path: 'category',
      model: 'Category'
    }
  }).populate('author'));

  if (!err) {
    res.send({ article, status: 'OK' });
  } else {
    res.statusCode = 404;
    res.send({ error: 'Article not Found', status: 'ERROR' });
  }
});

router.get('/', async function (req, res) {
  let { categories } = req.query;

  if (categories && categories.length) {
    categories = Array.isArray(categories) ? categories : [categories];
  }

  // TODO: Investigate other filtering approaches.

  let [err, articles] = await to(
    ArticleModel.find({})
      .sort('-date')
      .populate({
        path: 'textCategories',
        populate: {
          path: 'category',
          model: 'Category'
        }
      })
      .populate('author')
      .lean()
      .exec()
  );

  articles = (categories && categories.length) ? articles.filter((article) => {
    const textCategories = article && article.textCategories;
    return textCategories && textCategories.length && textCategories.some((textCategory) => {
      const category = textCategory && textCategory.category;
      const name = category && category.name;
      return name && categories.includes(name);
    });
  }) : articles;

  if (!err) {
    res.send({ articles, status: 'OK' })
  } else {
    console.log(err);
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
