
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
        var annotations = data.annotations.sort(function(a,b) {
            return b.confidence - a.confidence;
        });
        var perAnnotation = 10 / annotations.length;
        if (perAnnotation > 1) {
            ~~perAnnotation;
            var extraFirst = perAnnotation % annotations.length;
        } else {
            extraFirst = 0;
            perAnnotation = 1;
        }
        var categories = [];
        var slicedCategories;
        var toSlice;
        for (var i = 0; i < annotations.length; i++) {
            toSlice = perAnnotation;

            if (i == 0) {
                toSlice += extraFirst;
            }

            filteredCategories = annotations[i].categories ? annotations[i].categories.slice(0, toSlice) : [];

            [].push.apply(categories, filteredCategories);

            if (categories.length >= 10) {
                break;
            }
        }
        return categories;
    }
};
