const express = require('express'),
      router = express.Router(),
      ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
      passport = require('passport');

router.post('/login', passport.authenticate('local'), async function (req, res) {
  res.send({ user: req.user, status: 'OK' });
});

router.post('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup'), function(req,res) {
  res.send({ user: req.user, status: 'OK' });
});

router.get('/getCurrentUser', ensureLoggedIn(), function(req, res) {
  res.send({ user: req.user, status: 'OK' });
});

module.exports = router;
