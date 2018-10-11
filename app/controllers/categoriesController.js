
const models = require('../models'),
      request = require('request-promise-native'),
      CategoryModel = models.CategoryModel,
      to = require('await-to-js').default;

const controller = {};

controller.getEntities = async (text) => {
  const url = 'https://api.dandelion.eu/datatxt/nex/v1';
  const token = '2932ce6ca2614984a39468537ba9533d';
  const include = ['types', 'categories', 'lod', 'alternate_labels'].join(', ');
  const params = { text, token, include};

  const promise = new Promise(async (resolve, reject) => {
    const options = {
      url,
      form: params,
      resolveWithFullResponse: true
    };

    const [error, response] = await to(request.post(options));
    if (!error && /^2/.test('' + response.statusCode)) {
      resolve(JSON.parse(response.body));
    } else {
      reject(error);
    }
  });
  
  return promise;
};

controller.getCategories = async ({ annotations }) => {
  const maxLength = 10;

  const annotationsMap = annotations
    .reduce((p, {confidence, categories = []}) => [...p, ...categories.map(category => ({confidence, category}))], [])
    .reduce((result, {confidence, category}) => {
      result[category] = result[category] || {};
      result[category].count = (result[category].count || 0) + 1;
      result[category].confidenceSum = (result[category].confidenceSum || 0) + confidence;

      return result;
    }, {});


    const stringCategories = Object.entries(annotationsMap)
                  .sort(([aKey, aVal], [bKey, bVal]) => {
                    if (bVal.count === aVal.count) {
                      const aConfAvg = aVal.confidenceSum / aVal.count;
                      const bConfAvg = bVal.confidenceSum / bVal.count;

                      return bConfAvg === aConfAvg ? 0 : (bConfAvg > aConfAvg ? 1 : -1);
                    }

                    return bVal.count > aVal.count ? 1 : -1;
                  })
                  .map(([key]) => key)
                  .slice(0, maxLength);

    const promise = new Promise(async (resolve, reject) => {
      const [findError, categories] = await to(CategoryModel.find({name: {$in: stringCategories}}));

      if (findError) {
        reject(findError);
        return;
      }

      const categoriesToInsert = stringCategories.filter(name => !categories.find(category => category.name === name))
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

module.exports = controller;
