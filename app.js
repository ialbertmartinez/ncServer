var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321'));

function auth(req, res, next) {
  if(!req.signedCookies.user) {
    // console.log("request headers: ", req.headers);
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    }

    // console.log("authHeader", authHeader);
    // console.log('Buffer.from("YWRtaW46cGFzc3dvcmQ=", "base64")\n', Buffer.from("YWRtaW46cGFzc3dvcmQ=", 'base64'));
    // console.log('Buffer.from("YWRtaW46cGFzc3dvcmQ=", "base64").toString()', Buffer.from("YWRtaW46cGFzc3dvcmQ=", 'base64').toString());

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
    // check username & password are valid
    if (user === 'admin' && pass === 'password') {
        res.cookie('user', 'admin', {signed: true});
        /* res.cookie(arg1, arg2, arg3): create a new cookie for the authed user
              'user'/arg1: prop name/key for cookie. creates a 'user' property 
                           on the signed cookie object
              'admin'/arg2: the value stored in the name property  (aka. user: 'admin')

              {signed: true}/arg3: object with config values. set signed to true so express can use the secret key from cookie-parser and make a signed cookie
              */
        return next(); // authorized
    } else {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        return next(err);
    }
  } // ./end of if(!req.signedCookies.user) conditional
  else {
    if(req.signedCookies.user === 'admin') {
      return next(); // authorized
    } 
    else {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
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
