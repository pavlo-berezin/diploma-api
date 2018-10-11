const models = require('../models'),
      request = require('request-promise-native'),
      ArticleModel = models.ArticleModel,
      controllers = require('../controllers'),
      categoriesController = controllers.categoriesController,
      to = require('await-to-js').default;

const controller = {};

controller.saveArticle = (data) => {
  const promise = new Promise(async (resolve, reject) => {
    const article = new ArticleModel(data);

    const [err] = await to(article.save());

    if (err) {
      let error, statusCode;
      console.log('onsave', err);
      if (err.name == 'ValidationError') {
        statusCode = 400;
        error = ({ error: 'Validation error', status: 'ERROR' });
      } else {
        statusCode = 500;
        error = ({ error: 'Server error', status: 'ERROR' });
      }
      reject({ error, statusCode })
      return;
    }

    const [entitiesErr, entities] = await to(categoriesController.getEntities(article.body));

    if (entitiesErr) {
      resolve({ article, status: 'OK' });
      console.log('failed to get Enitites for Article: ' + article.id);
      console.log(entitiesErr);
      return;
    }

    const [categoriesError, categories] = await to(categoriesController.getCategories(entities));

    if (categoriesError) {
      resolve({ article, status: 'OK' });
      console.log('failed to get Categories for Article: ' + article.id);
      console.log(categoriesError);
      return;
    }

    const conditions = { _id: article.id };
    const update = {$set: {categories}};
    const options = {new: true};
    const query = ArticleModel.findOneAndUpdate(conditions, update, options);

    const [updateErr, updatedArticle] = await to(query);

    if (updateErr) {
      console.log('failed to update for Article' + article.id);
      console.log(updateErr);
    }

    resolve({ article: updatedArticle, status: 'OK' })
  });

  return promise;
}

module.exports = controller;
