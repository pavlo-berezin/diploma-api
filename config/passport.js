const passport = require('passport'),
      Strategy = require('passport-local').Strategy,
      to = require('await-to-js').default,
      models = require('../app/models'),
      UserModel = models.UserModel;

module.exports = () => {
  passport.use(new Strategy(
    async function(username, password, cb) {
      const [err, user] = await to(UserModel.findOne({ username }).select('+password'));
  
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
  
      const [passwordErr, verified] = await to(user.comparePassword(password));
  
      if (passwordErr) { return cb(passwordErr); }
      if (!verified) { return cb(null, false); }
  
      return cb(null, user);
  }));

  passport.use('local-signup', new Strategy(
    { passReqToCallback : true },
    async function(req, username, password, cb) {
      const [err, user] = await to(UserModel.findOne({ username }));
      if (err) { return cb(err); }
      if (user) { return cb(null, false) }

      const newUser = new UserModel(req.body);

      const [saveError] = await to(newUser.save());

      if (saveError) { return cb(err); }

      return cb(null, newUser);
    }
  ));

  passport.serializeUser(function(user, cb) {
    cb(null, user._id);
  });
  
  passport.deserializeUser(async function(id, cb) {
    const [err, user] = await to(UserModel.findById(id));
  
    if (err) return cb(err);
  
    return cb(null, user);
  });
};


