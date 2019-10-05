/* eslint-disable */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');
// const path = require('path');
//images: [`${path.join(__dirname, 'public','img','tours','tour-1-1.jpg')}`],
 //success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
 //success_url: `${req.protocol}://${req.get('host')}/?tour=${
 // req.params.tourId
//}&user=${req.user.id}&price=${tour.price}`,

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // console.log(JSON.parse(req.user.id))
  // 1. get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //  console.log('tour', tour);
  // 2. create checkout session
  //
  //
  // first part is information about the session.
  // below the 'line_items' is the information abou the
  // item the customer about to purchase.
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `https://picjumbo.com/wp-content/uploads/young-traveler-admires-beautiful-manarola-town-italy-2210x1473.jpg`
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3.
  res.status(200).json({
    status: 'success',
    session: session
  });

});

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  const created = await Booking.create({ tour, user, price });
  console.log(created);
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_KEY
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   console.log("originalUrl", req.originalUrl);
//   console.log("split", req.originalUrl.split('?')[0]);

//   // This is only temporary, b/c everyone can make bookings w/o paying.
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();
//   let booked = await Booking.create({ tour, user, price });
//   console.log("booked ", booked);

//   const url = req.originalUrl.split('?')[0];
//   console.log(url);
//   res.redirect(url);
//   // res.redirect(req.originalUrl.split('?')[0]);
// });

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
