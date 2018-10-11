
const models = require('../models'),
  CategoryModel = models.CategoryModel,
  to = require('await-to-js').default;


async function getCategories(categoriesList) {
  const promise = new Promise(async (resolve, reject) => {
    const [findError, categories] = await to(CategoryModel.find({ name: { $in: categoriesList } }));

    if (findError) {
      reject(findError);
      return;
    }

    const categoriesToInsert = categoriesList.filter(name => !categories.find(category => category.name === name))
      .map(name => ({ name }))
    const [insertError, insertedCategories] = await to(CategoryModel.insertMany(categoriesToInsert));

    if (insertError) {
      reject(insertError);
      return;
    }

    resolve(insertedCategories.concat(categories));
  });

  return promise;
};

module.exports = { getCategories };
