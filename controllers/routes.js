var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended:false});

var mysql = require('./mysql'); // Potrebno za mysql querije
var lastScrapsTable = require('./tools/lastanalyzes'); // Potrebno za kontrolirati tablicu najnovijih scrapova
var scrapEngine = require('./tools/scraper10'); // Potrebno za scrappati url
var showAnalyze = require('./tools/sitedata'); // Potrebno za osvjeziti alanyze dio
var imgsnatch = require('./tools/imgsnatch'); //

// We export all our routes
module.exports = function(app, passport) {

	// Request for home page
	app.get('/', function(req, res) {
		 res.render('index', {content: 'other/homepage.ejs'});
	});

	// Request for login page
	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('index', {content: 'user/login.ejs'});
	});

	// Request from user to login into his account
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : false // allow flash messages
		}),
        function(req, res) {

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// Prikaz registracije
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('index', {content: 'user/signup.ejs'});
	});

	// Procesuiranje registracije
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : false
	}));

	// Sekcija s profilom
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('index', {
			content: 'user/profile.ejs',
			user : req.user // get the user out of session and pass to template
		});
	});

	// Odjavljuje se
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// We render user page
	app.get('/start', function(req, res) {
		if(req.isAuthenticated()) {
			res.render('index', {content: 'user/profile.ejs', user: req.user});
		} else {
			res.render('index', {content: 'user/start.ejs'});
		}
	});

	// User requests to use scraper tool
	app.get('/scraper10',function(req,res){
	  res.render('index', {content: 'tools/scraper10.ejs'});
	});

	//  User starts scrapper tool
	app.post('/scraper10', urlencodedParser, function(req, res){
	  // Pokrecemo scrap engine
	  scrapEngine.scrapURL(req.body.item, req.body.redirect, res);
	});

	// Request for sitedata tool
	app.get('/sitedata', urlencodedParser, function(req, res){
	  // Prikazujemo Site Tools stranicu
	  res.render('index', {content: 'tools/sitedata.ejs'});
	});

	// User runs sitedata request
	app.get('/sitedata/:id', urlencodedParser, function(req,res){
	  // Updateamo tablicu za pregled podataka o stranici
	  showAnalyze.loadScrapID(req.params.id, res);
	});

	// User request last analyzes tool
	app.get('/lastanalyzes', urlencodedParser, function(req,res){
	  // Updateamo tablicu za pregled podataka o stranici
	  lastScrapsTable.reloadTable(res);
	});

	// User requests imgsnatch tool
	app.get('/imgsnatch/', urlencodedParser, function(req,res){
	  res.render('index', {content: 'tools/imgsnatch.ejs'});
	});

	// User starts imgsnatch tool
	app.post('/imgsnatch', urlencodedParser, function(req, res){
	  // Pokrecemo scrap engine
	  imgsnatch.takeScr(req.body.item, res);
	});

};

// Check if user is logged in
function isLoggedIn(req, res, next) {

	// If user is logged in we continue
	if(req.isAuthenticated()) {
		return next();
	}

	// If they are not we redirect them to homepage
	res.redirect('/');
}
