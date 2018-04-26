var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');


// set-up database
var mongoose = require('mongoose');
mongoose.connect('mongodb://bart:20BarT01@ds255329.mlab.com:55329/m2w');
var db = mongoose.connection;

// check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

db.on('error', function (err) {
    console.log(err);
});

// bring in model
var User = require('./models/user');

// var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes for api
app.use('/api', apiRouter);

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};

// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


// route for user signup
app.route('/signup').get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});


app.route('/signup').post((req, res) => {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;

    user.save(err => {
        console.log(err)
        if (err) {
            console.log('there is an error');
            res.redirect('/signup');
        } else {
            req.session.user = user;
            res.redirect('/dashboard');
        }
    });
});


// route for user Login
app.route('/login').get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.route('/login').post((req, res) => {
    var username = req.body.username,
        password = req.body.password;

    // User.findOne({"username": username}).then(function (user) {
    //     if (!user) {
    //         res.redirect('/login');
    //     } else if (!user.validPassword(password)) {
    //         res.redirect('/login');
    //     } else {
    //         req.session.user = user.dataValues;
    //         res.redirect('/dashboard');
    //     }
    // });

    User.findOne({ username: username }, function (err, user) {
        if (err) {
            res.redirect('/login/invalid');
        }

        if (user !== null) {
            user.comparePassword(password, function (err, isMatch) {
                if (err) res.redirect('/login/invalid');
                if (isMatch === true) {
                    console.log(password + " : ", isMatch); // -&gt; Password123: true
                    console.log('dataValues : ', user);
                    req.session.user = user;
                    res.redirect('/dashboard');
                } else {
                    res.redirect('/login/invalid');
                }
            });
        } else {
            res.redirect('/login/invalid');
        }
    });
});

// if password or username was invalid
app.route('/login/invalid').get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + '/public/invalid.html');
});


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.redirect('/login');
    }
});

// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// route for settings
app.get('/settings', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(__dirname + '/public/settings.html');
    } else {
        res.redirect('/login');
    }
});

// avoids /favicon.ico 404 error
app.get('/favicon.ico', function(req, res) {
    res.status(204);
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});



module.exports = app;
