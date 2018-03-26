var models = require('../app/models/');
var controllers = require('../app/controllers');
var ArticleModel = models.ArticleModel;
var categoriesController = controllers.categoriesController;
module.exports = function (app) {
    app.use(function(req, res, next) {
        res.header("Content-Type", "application/json");
        next();
    });

    // Article routes
    app.post('/article', function(req, res) {
        var article = new ArticleModel(req.body);
        article.save(function (err) {
            if (!err) {
                categoriesController.getEntities(article.body).then(function(resp){
                ArticleModel.update({ _id: article.id }, { $set: { categories: categoriesController.getCategories(resp)}}, function(article) {
                    return res.send({ status: 'OK', article: article, message: 'HELLO'});
                })
                }).catch(function(error) {
                    console.log('failed to get Enitites for Article: ' + article.id);
                    console.log(error);
                });
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
        var categories = req.query.categories && req.query.categories.split(',');
        console.log(categories);
        var filter = {}
        if (categories) {
            categories = categories.map(function(el) {
                return new RegExp(el, 'i');
            });

            filter.categories = {
                $all: categories
            }

        }
        ArticleModel.find(filter).sort('-date').exec(function(err, found) {
            if(!err) {
                res.send({ status: 'OK', articles: found })
            }
        });
    });

    app.delete('/article/:id', function (req, res) {
        const id = req.params.id;
        ArticleModel.findByIdAndRemove(id, function (err, found) {
            res.send({ status: 'OK', removed: found })
        });
    });
};
