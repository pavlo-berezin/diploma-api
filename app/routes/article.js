const express = require('express'),
      router = express.Router(),
      models = require('../models/'),
      controllers = require('../controllers'),
      ArticleModel = models.ArticleModel,
      categoriesController = controllers.categoriesController;

router.post('/', function (req, res) {
  var article = new ArticleModel(req.body);

  article.save(function (err) {
    if (!err) {
      categoriesController.getEntities(article.body).then(function (resp) {
        ArticleModel.update({ _id: article.id }, { $set: { categories: categoriesController.getCategories(resp) } }, function (newArticle) {
          return res.send({ status: 'OK', article: newArticle});
        })
      }).catch(function (error) {
        console.log('failed to get Enitites for Article: ' + article.id);
        console.log(error);
      });
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
});

router.get('/:id', function (req, res) {
  const id = req.params.id;
  ArticleModel.findById(id, function (err, found) {
    if (err) {
      res.statusCode = 404;
      res.send({ error: 'Article not Found', status: 'ERROR' });
    } else {
      res.send({ status: 'OK', article: found })
    }
  });
});

router.get('/', function (req, res) {
  var categories = req.query.categories && req.query.categories.split(',');
  var filter = {}

  if (categories) {
    categories = categories.map(function (el) {
      return new RegExp(el, 'i');
    });

    filter.categories = {
      $all: categories
    }
  }

  ArticleModel.find(filter).sort('-date').exec(function (err, found) {
    if (!err) {
      res.send({ status: 'OK', articles: found })
    } else {
      res.statusCode = 404;
      res.send({ error: 'Not Found', status: 'ERROR' });
    }
  });
});

router.delete('/:id', function (req, res) {
  const id = req.params.id;

  ArticleModel.findByIdAndRemove(id, function (err, found) {
    if (!err) {
      res.send({ status: 'OK', removed: found })
    } else {
      res.statusCode = 500;
      res.send({ error: 'Internal error', status: 'ERROR' });
    }
  });
});


module.exports = router;
