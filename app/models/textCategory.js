var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const textCategorySchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'CategoryInfo' },
  count: Number,
  minWeight: Number,
  maxWeight: Number,
  avgWeight: Number,
  createdAt: { type: Date, default: Date.now },
});

var TextCategoryModel = mongoose.model('TextCategory', textCategorySchema);

module.exports = TextCategoryModel;
