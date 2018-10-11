var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  body: String,
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  date: { type: Date, default: Date.now }
});

var ArticleModel = mongoose.model('Article', articleSchema);

module.exports = ArticleModel;
