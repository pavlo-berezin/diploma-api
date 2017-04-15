var Schema = require('mongoose').Schema;

var articleSchema = new Schema({
  title:  String,
  author: String,
  body:   String,
  date: { type: Date, default: Date.now }
});

var ArticleModel = mongoose.model('Article', articleSchema);

module.exports = ArticleModel;
