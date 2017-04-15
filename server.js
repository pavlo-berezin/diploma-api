var express     = require('express');
var winston     = require('winston');
var mongoose    = require('mongoose');

var settings    = require('./config/settings');
var routes      = require('./config/routes');
var bodyParser  = require('body-parser');

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

  mongoose.connect('mongodb://localhost/diploma');
  var db = mongoose.connection;

  db.on('error', function (err) {
      console.error('connection error:', err.message);
  });
  db.once('open', function callback () {
      console.log("Connected to DB!");
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  routes(app);

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
