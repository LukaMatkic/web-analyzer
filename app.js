var express = require ('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var passport = require('passport');
var flash    = require('connect-flash');
var port     = process.env.PORT || 3001;
var IpStrategy = require('passport-ip').Strategy;

//SOCKET IO STUFF
var socket = require('socket.io'); //include
var server = app.listen(port, function(){ //stvara se server varijabla
    console.log('listening to 3001');
});
var io = socket(server); //klijent prek socketa traži od servera podatke
io.on('connection', function(socket){ //'socket' je ovdje svaka zasebna konekcija
    console.log('I exist as a socket!!!!!!!!!!!', socket.id);

    socket.on('Scraping', function(data){ //'Scraping' message receives 'data' as 2nd argument
        console.log('\nData: ' + data.message + '\n'); //server side console.log for debugging
        io.sockets.emit('Scraping', data);   //emits 'data' object, to all sockets, passed as an argument from .js 'Scraping'
    });
});

// Require imgsnatch
var imgsnatch = require('./controllers/tools/imgsnatch');
imgsnatch.checkImages(); // Deleting images if image exists but is not linked to any row in database

var urlencodedParser = bodyParser.urlencoded({extended:false}); // Pretvaramo http zahtjev
app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

passport.use(new IpStrategy({
  range: '10.0.0.0/8'
}, function(profile, done){
  done(null, profile);
  //profile.id is the ip address.
}));

// required for passport
app.use(session({
	secret: '4523423rewredr132d413423',
	resave: true,
	saveUninitialized: true
 } )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Pokrecemo program
console.log('\n-------------------[SERVER STATUS]--------------------');
console.log('SERVER STARTED !\n\tYou are listening to port: ' + port);
console.log('\n--------------------[SERVER END]----------------------');

require('./controllers/passport')(passport); // pass passport for configuration
require('./controllers/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
