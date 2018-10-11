const models = require('../models'),
  request = require('request-promise-native'),
  TextCategoryModel = models.TextCategoryModel,
  controllers = require('../controllers'),
  categoriesController = controllers.categoriesController,
  to = require('await-to-js').default;

async function getEntities(text) {
  const url = 'https://api.dandelion.eu/datatxt/nex/v1';
  const token = '2932ce6ca2614984a39468537ba9533d';
  const include = ['types', 'categories', 'lod', 'alternate_labels'].join(', ');
  const params = { text, token, include };

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
}

function getCategoryInfoMap({ annotations }) {
  const categoryInfoMap = annotations
    .reduce((p, { confidence, categories = [] }) => [...p, ...categories.map(category => ({ confidence, category }))], [])
    .reduce((result, { confidence, category }) => {
      let { count = 0, avgWeight = 0, minWeight = Number.MAX_SAFE_INTEGER, maxWeight = 0 } = result[category] || {};
      count++;
      avgWeight = avgWeight + ((confidence - avgWeight) / count);
      minWeight = Math.min(minWeight, confidence);
      maxWeight = Math.max(maxWeight, confidence);

      return {
        ...result,
        [category]: { count, avgWeight, minWeight, maxWeight }
      };
    }, {});

  return categoryInfoMap;
}

async function getTextCategoriesArray(text, length = 10) {
  const promise = new Promise(async (resolve, reject) => {
    const [entitiesErr, entities] = await to(getEntities(text));

    if (entitiesErr) {
      console.log('failed to get Enitites');
      console.log(entitiesErr);
      reject(entitiesErr);
      return;
    }

    let categoryInfoMap = getCategoryInfoMap(entities);
    categoryInfoMap = cutCategoryInfoMap(categoryInfoMap, length);

    const [categoriesError, categories] = await to(categoriesController.getCategories(Object.keys(categoryInfoMap)));

    if (categoriesError) {
      reject(categoriesError);
      return;
    }

    const categoriesInfoToSave = Object.entries(categoryInfoMap)
      .map(([key, value]) => ({
        ...value,
        category: categories.find(category => category.name === key)
      }));

    const [textCategoriesError, textCategories] = await to(TextCategoryModel.insertMany(categoriesInfoToSave));

    if (textCategoriesError) {
      reject(textCategoriesError);
      return;
    }

    resolve(textCategories);
  });


  return promise;
}

function cutCategoryInfoMap(map, length) {
  return Object.entries(map)
    .sort(([aKey, aVal], [bKey, bVal]) => {
      if (bVal.count === aVal.count) {
        const aConfAvg = aVal.avgWeight;
        const bConfAvg = bVal.avgWeight;

        return bConfAvg === aConfAvg ? 0 : (bConfAvg > aConfAvg ? 1 : -1);
      }

      return bVal.count > aVal.count ? 1 : -1;
    })
    .slice(0, length)
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
}

module.exports = { getEntities, getCategoryInfoMap, getTextCategoriesArray }

