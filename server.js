require('dotenv').config();

var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var app = express();

// Setting app properties
app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 3000);

// Express Session
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'bigphonysecret'
}));

app.use(passport.initialize());
app.use(passport.session());

// Setup passport
passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH2_CLIENT_ID,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET,
    callbackURL: process.env.OAUTH2_CALLBACK
}, (token, refreshToken, profile, done) => {
    let imageUrl = '';
    
    if (profile.photos && profile.photos.length) {
        imageUrl = profile.photos[0].value;
    }

    let user = {
        id: profile.id,
        displayName: profile.displayName,
        image: imageUrl
    };

    done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/auth/login', passport.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/');
});

app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.get('/', (req, res) => {
    res.locals.profile = req.user;
    res.locals.login = '/auth/login';
    res.locals.logout = '/auth/logout';
    res.render('index')
});

app.listen(app.get('port'), function() {
    console.log('Server has started on port ' + app.get('port'));
});