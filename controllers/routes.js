// Includes
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended:false});
var flash    = require('connect-flash');
//------------------------------------------------------------------------------

// Project includes
var mysql = require('./mysql'); // Potrebno za mysql querije
var lastScrapsTable = require('./tools/lastanalyzes'); // Potrebno za kontrolirati tablicu najnovijih scrapova
var scrapEngine = require('./tools/scraper'); // Potrebno za scrappati url
var showAnalyze = require('./tools/sitedata'); // Potrebno za osvjeziti alanyze dio
var imgsnatch = require('./tools/imgsnatch'); //
var homepage = require('./homepage');
//..............................................................................

// We export all our routes
module.exports = function(app, passport) {

	// Request for home page
	app.get('/', function(req, res) {
		 homepage.loadHomepage(req, res);
	});

	// Request for login page
	app.get('/login', function(req, res) {
		// If user is logged in in we redirect him to profile
		if(req.isAuthenticated()) {
			res.redirect('/profile');
		} else {
			res.render('index', {
				content: 'user/login.ejs',
				error: req.flash('loginMessage')});
		}
	});

	// Request from user to login into his account
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
    });


	// User requests signup form
	app.get('/signup', function(req, res) {
		// If user is logged in in we redirect him to profile
		if(req.isAuthenticated()) {
			res.redirect('/profile');
		// render the page and pass in any flash data if it exists
		} else {
			res.render('index', {
				content: 'user/signup.ejs',
				error: req.flash('signupMessage')});
		};
	});

	// Procesuiranje registracije
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	// Sekcija s profilom
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('index', {
			content: 'user/profile.ejs',
			user : req.user, // get the user out of session and pass to template
			sucess: req.flash('loginMessageW'),
			error: req.flash('loginMessage')
		});
	});

	// User logs out
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/start');
	});

	// If user requests /start dir, if he is logged in we redirect him to his profile
	app.get('/start', function(req, res) {
		if(req.isAuthenticated()) {
			res.render('index', {
				content: 'user/profile.ejs',
				user: req.user});
		} else {
			res.render('index', {content: 'user/start.ejs'});
		}
	});

	// User requests to use scraper tool
	app.get('/scraper',function(req,res){
		// If user is logged in
		if(req.isAuthenticated()) {
			// Display him normal page with user
	  	res.render('index', {
				content: 'tools/scraper.ejs',
				user: req.user});
		// If user is not logged in
		} else {
			// Display hm page with info
			res.render('index', {
				content: 'tools/scraper.ejs',
				info: "Guests can only analyze HTTP headings. Login for more !"});
		}
	});

	// User starts scrapper tool
	app.post('/scraper', urlencodedParser, function(req, res) {
		// If user is logged in
	  if(req.isAuthenticated()) {
			// Scrapper for users starts
	  	scrapEngine.scrapURL(
				req.body.item,
				req.body.redirect,
				req.body.imgsnatch,
				req.body.anonymous,
				req.body.headings,
				req.body.childs,
				req,
				res);
		// If user is not logged in
		} else {
			// We start only simple scrapping
			scrapEngine.simpleScrapUrl(req.body.item, res);
		}
	});

	// Request for sitedata tool
	app.get('/sitedata', urlencodedParser, function(req, res){
	  // Prikazujemo Site Tools stranicu
		if(req.isAuthenticated()) { // Ako je logiran prikazujemo bez infa
			res.render('index', {
				content: 'tools/sitedata.ejs',
				user: req.user});
		} else {
			res.render('index', {
				content: 'tools/sitedata.ejs',
				info: 'Guests can only preview analyzes from other guests !'});
		}
	});

	// User runs sitedata request
	app.post('/sitedata', urlencodedParser, function(req, res){
	  showAnalyze.loadScrapID(req, res, req.body.enterid);
	});

	// User request last analyzes tool
	app.get('/lastanalyzes', urlencodedParser, function(req, res){
	  // Updateamo tablicu za pregled podataka o stranici
		lastScrapsTable.reloadTable(req, res);
	});

	// User requests imgsnatch tool
	app.get('/imgsnatch/', urlencodedParser, function(req, res){
		// If user is logged in
		if(req.isAuthenticated()) {
			// We display him page
			res.render('index', {
				content: 'tools/imgsnatch.ejs',
				user: req.user});
		// Else if user is not logged in
		} else {
			//We display him error page
			res.render('index', {
				content: 'other/errorpage.ejs',
				error: 'You are not welcome here !'});
		}
	});

	// User starts imgsnatch tool with URL
	app.post('/imgsnatch', urlencodedParser, function(req, res){
		// If user clicks on button for URL
		if(req.body.hasOwnProperty("urlbutton")) {
	  	imgsnatch.takeScr(req.body.item, res);
		// Else if user clicks on ID button
		} else {
			imgsnatch.previewScr(req.body.enterid, res);
		}
	});

};
//------------------------------------------------------------------------------

// Check if user is logged in
function isLoggedIn(req, res, next) {

	// If user is logged in we continue
	if(req.isAuthenticated()) {
		return next();
	}

	// If they are not we redirect them to homepage
	res.redirect('/');
}
