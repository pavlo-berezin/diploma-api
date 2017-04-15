var models = require('../app/models/');
var ArticleModel = models.ArticleModel;
module.exports = function (app) {
  // Article routes
  app.post('/article', function(req, res) {
      var article = new ArticleModel(req.body);
      article.save(function (err) {
        if (!err) {
            return res.send({ status: 'OK', article: article });
        } else {
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
        }
    });
  });

  app.get('/article/:id', function (req, res) {
    const id = req.params.id;
    ArticleModel.findById(id, function (err, found) {
      res.send({ status: 'OK', article: found })
    });
  });

  app.get('/article', function(req,res) {
    ArticleModel.find({}, function(err, found) {
      if(!err) {
        res.send({ status: 'OK', articles: found })
      }
    })
  });

  app.delete('/article/:id', function (req, res) {
    const id = req.params.id;
    ArticleModel.findByIdAndRemove(id, function (err, found) {
      res.send({ status: 'OK', removed: found })
    });
  });
};
