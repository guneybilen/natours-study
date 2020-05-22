const express = require('express');
// const http = require('http');

const app = express();
// const server = http.createServer(app);
const server = app.listen(8810, () => {
  console.log('App running on port 8810...');
});

const io = require('socket.io').listen(server);

// const io = socket(server);
//
//
const path = require('path');
const cors = require('cors');
// const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
//const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const favicon = require('express-favicon');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const bookingController = require('./controllers/bookingController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// const app = express();

//required for deploying heroku for https protocol.
//heroku uses https by default.
app.enable('trust proxy');

app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.png')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// const rooms = ['myroom'];

const users = {};

io.on('connection', so => {
  // so.on('joinroom', room => {
  //   if(rooms.includes(room)){
  //   so.join(room);
  //   return so.emit("success", `You have successfully joined the ${room} room`)
  //   } else {
  //     so.emit("err", "no room with this " + room)
  //   });

  if (!users[so.id]) {
    users[so.id] = so.id;
  }

  //so.join('myroom');

  if (
    io.nsps['/'].adapter.rooms.myroom &&
    io.nsps['/'].adapter.rooms.myroom.length > 2
  ) {
    return;
  }

  so.on('leave', () => {
    Object.keys(users).forEach(function(key) {
      console.log(users[key]);
    });

    // console.log(so.id);
    delete users[so.id];
    app.get('api/v1/users/logout');
  });

  so.emit('yourID', so.id);
  io.sockets.emit('allUsers', users);
  so.on('disconnect', () => {
    console.log('disconnect');
    delete users[so.id];
    app.get('api/v1/users/logout');
  });

  so.on('callUser', data => {
    io.to(data.userToCall).emit('hey', {
      signal: data.signalData,
      from: data.from
    });
  });

  so.on('acceptCall', data => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

module.exports = app;
