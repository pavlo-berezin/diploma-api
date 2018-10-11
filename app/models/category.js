var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
  name: { type : String , unique : true, required : true, dropDups: true },
});

var CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
