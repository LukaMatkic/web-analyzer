// Includes
var mysql = require('./mysql');
//------------------------------------------------------------------------------

// Function for showing satistics on home page
var homeStatistics = function(callback) {

	// Var for saving data
	var data = {
		scraps: 0,
		users: 0,
		headings: 0,
		logins: 0
	}

	// Sending query to get number of scraps
	mysql.sendQuery('SELECT * FROM scrap;', function(err, rows, fields) {
		data.scraps = rows.length;

		// Sending query to get number of headers
		mysql.sendQuery('SELECT * FROM headers;', function(err, rows, fields) {
			data.headings = rows.length;

			// Sending query to get number of users
			mysql.sendQuery('SELECT * FROM user;', function(err, rows, fields) {
				data.users = rows.length;

				// Sending query to get number of users
				mysql.sendQuery('SELECT * FROM logins;', function(err, rows, fields) {
					data.logins = rows.length;

				// Returning object
				return callback(data);

				});
			});
		});
	});
};
//------------------------------------------------------------------------------


// Function for rendering front page
var loadHomepage = function(res) {

	homeStatistics(function(data) {
		res.render('index', {
			content: 'other/homepage.ejs',
			data: data});
	});

};
//------------------------------------------------------------------------------


// Exporting
module.exports = {
	loadHomepage: loadHomepage
}
