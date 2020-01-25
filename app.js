var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');

const db = require('./db');
const { Book } = db.models;

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routing
app.use('/', indexRouter);
app.use('/books', booksRouter);


/**
 * Middleware: Return the error to console and pass data to template
 */

app.use(function(err, req, res, next) {
  // Print full error to console
  console.log('Error details: ' + err);
  res.status(err.status || 500);
  res.render('error', {err});
});

// Handle 404 errors by serving correct page template
app.get('*', function(req, res){
  res.status(404).render('page-not-found');
});

module.exports = app;