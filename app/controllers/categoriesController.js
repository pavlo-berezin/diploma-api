
var models = require('../models');
var request = require('request');

module.exports = {
    getEntities: function(text) {
        var url = 'https://api.dandelion.eu/datatxt/nex/v1'
        var token = '2932ce6ca2614984a39468537ba9533d';
        var include = ['types', 'categories', 'lod', 'alternate_labels'].join(', ');
        var params = {
            text: text,
            token: token,
            include: include
        }
        return new Promise(function (fulfill, reject){
            request.post(
                url,
                { form: params },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        fulfill(JSON.parse(body));
                    } else {
                        reject(response);
                    }
                }
            );
         });
    },

    getCategories: function(data) {
        var categories = [];
        data.annotations.forEach(function(annotation) {
            [].push.apply(categories, annotation.categories.filter(function(el, i) {
                return i < 3;
            }));
        });
        return categories;
    }
};
