const express = require('express'),
      expressSession = require('express-session'),
      winston = require('winston'),
      mongoose = require('mongoose'),
      settings = require('./config/settings'),
      routes = require('./app/routes'),
      bodyParser = require('body-parser'),
      passport = require('passport'),
      configPassport = require('./config/passport');

winston.add(winston.transports.File, {
  filename: './logs/exceptions.log',
  level: 'debug',
  humanReadableUnhandledException: true,
  handleExceptions: true,
  json: false,
  colorize: true
});

module.exports.start = function (done) {
  var app = express();

  mongoose.connect('mongodb://localhost/diploma', { useMongoClient: true });
  var db = mongoose.connection;

  db.on('error', function (err) {
    console.error('connection error:', err.message);
  });
  db.once('open', function callback() {
    console.log("Connected to DB!");
  });

  configPassport();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(function (req, res, next) {
    res.header("Content-Type", "application/json");
    next();
  });
  // TODO: move secrets out.
  app.use(expressSession(({ secret: 'randomSecret', resave: false, saveUninitialized: false })));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', routes);

  app.listen(settings.port, function () {
    console.log("Listening on port " + settings.port);

    if (done) {
      return done(null, app, server);
    }
  }).on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
      console.log('Address in use. Is the server already running?');
    }
    if (done) {
      return done(e);
    }
  });
};

module.exports.start();
