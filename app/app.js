require("dotenv").config(); // Load environment variables
var createError = require('http-errors');
var express = require('express');
var Database = require("./config/db"); // Import the Database class
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');

// Database connect
(async () => {
    const db = await new Database(path.join(__dirname, process.env.DATA_DIR));
    if (db) {
        console.log("Database is loaded from folder: ", Database.getDataFolderDir());
        // Perform other actions with the initialized instance
    } else {
        console.log("Failed to initialize the Database.");
    }
})();

// Require Routers
var indexRouter = require('./routes/index');
var searchRouter = require('./routes/searchRouter');
var filesRouter = require('./routes/filesRouter');
var databaseRouter = require('./routes/databaseRouter');
var BPlusTreeRouter = require('./routes/BPlusTreeRouter');

// Site entry point
const config = require('./config')();
process.env.PORT = config.port;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Register Routers
app.use('/', indexRouter);
app.use('/search', searchRouter);
app.use('/files', filesRouter);
app.use('/database', databaseRouter);
app.use('/testbtree', BPlusTreeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
