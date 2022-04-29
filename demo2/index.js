const express = require('express');
const cors = require('cors');
const app = express();
const session = require('express-session');
require('dotenv').config();
const reminder = require("./utils/reminder");
const cron = require('node-cron');
const { Admin, router } = require('./routes/admin');
const passport = require('passport');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
cron.schedule('* 0 0 * * *', reminder);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// implement admin login using session
app.use(passport.initialize());
app.use(passport.session());

Admin(app);
// implement routes
app.use('/admins', router)
app.use('/users', require('./routes/user').router);
require('./routes/user').resetPassword(app);
app.use('/products', require('./routes/product'));
app.use('/categories', require('./routes/category'));
app.use('/orders', require('./routes/order'));
app.use('/carts', require('./routes/cart'));

app.use('*', (req, res) => res.status(404).send({ msg: 'route not found' }));
module.exports = app;