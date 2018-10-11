const models = require('../models'),
  mongoose = require('mongoose');
  ArticleModel = models.ArticleModel,
  UserModel = models.UserModel,
  controllers = require('../controllers'),
  textCategoriesController = controllers.textCategoriesController,
  to = require('await-to-js').default;

async function saveArticle(data) {
  const promise = new Promise(async (resolve, reject) => {
    data.author = data.author && mongoose.Types.ObjectId(data.author);

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

    const [textCategoriesError, textCategories] = await to(textCategoriesController.getTextCategoriesArray(article.body));

    if (textCategoriesError) {
      resolve({ article, status: 'OK' });
      console.log('failed to get textCategories for Article: ' + article.id);
      console.log(textCategoriesError);
      return;
    }

    const articleConditions = { _id: article.id };
    const userConditions = { _id: article.author };
    const update = { $set: { textCategories } };
    const options = { new: true };
    const articleQuery = ArticleModel.findOneAndUpdate(articleConditions, update, options).populate({ 
      path: 'textCategories',
      populate: {
        path: 'category',
        model: 'Category'
      }
    });
    const userQuery = UserModel.findOneAndUpdate(userConditions, update, options);

    const [articleUpdateErr, updatedArticle] = await to(articleQuery);
    const [userUpdateErr] = await to(userQuery);

    if (articleUpdateErr) {
      resolve({ article: updatedArticle, status: 'OK' })
      console.log('Failed to add textCategories to Article:' + article.id);
      console.log(updateErr);
      return;
    }

    if (userUpdateErr) {
      console.log('Failed to add textCategories to User, Article: ' + article.id);
      console.log(userUpdateErr);
    }

    resolve({ article: updatedArticle, status: 'OK' })
  });

  return promise;
}

module.exports = { saveArticle };
