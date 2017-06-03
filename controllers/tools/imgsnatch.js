// Including
var request = require('request');
var screenshot = require('url-to-image');
var mysql = require('../mysql');
var fs = require('fs');
var validUrl = require('valid-url');
var cheerio = require('cheerio');
//------------------------------------------------------------------------------

// Functon for deleting images if image ID does not exist in database
var checkImages = function() {

  // Defining file path
  var fileNames = './public/imgsnatch/';

  // For every file we check if it exists in database
  fs.readdirSync(fileNames).forEach(file => {

    // We send query to check if ID exists
    mysql.sendQuery("SELECT * FROM scrap WHERE id=" + file.replace('.png','') + ";",
      function(err, rows, fields) {

      // If ID does not exist we delete image
      if(rows == '') {
        fs.unlink('./public/imgsnatch/' + file);
      }

    });
  });
};
//------------------------------------------------------------------------------

// Function that takes screenshot
var takeScr = function(url, res) {

  // Checking if URL is not valid
  if (!validUrl.isUri(url)) {
    res.render('index', {
      error: 'URL is not valid ! (\"' + url + '\")',
      content: 'tools/imgsnatch.ejs'});
    return;
  }

  // First we check if we can access page with request
  request(url, function(error, response, body) {

    // If error happens we send error message
    if(error) {
      res.render('index', {
        error: 'IMG Snatcher can not access given URL !',
        content: 'tools/imgsnatch.ejs'});
      return;
    }

    // If status code is not 200 we stop process and send error message
    if(response.statusCode != 200) {
      res.render('index', {
        error: 'URL can not be accessed. Status code: ' + response.statusCode + ' !',
        content: 'tools/imgsnatch.ejs'});
      return;
    }

    // Load cherio so we can get title from it
    var $ = cheerio.load(body);

    // Inserting new file into database and on return we create image with newly
    // created id of scrap
    mysql.sendQuery("INSERT INTO scrap (url, date, time, title, http_status) VALUES ( \
      '" + url + "', \
      '" + require('moment')().format('YYYY-MM-DD') + "', \
      '" + require('moment')().format('HH:mm:ss') + "', \
      '" + $('title').text() + "', \
      "  + res.statusCode + ");",
      function(err, rows) {

        // Taking screenshot of url and saving it as returned id+.png
        screenshot(url, './public/imgsnatch/' + rows.insertId + '.png').done(function() {

          // Preview picture for user
          previewScr(rows.insertId, res);

      });
    });
  });
};
//------------------------------------------------------------------------------


// Function for previewing picture to user
var previewScr = function(id, res) {

  // Check for id if it is numeric
  if(isNaN(parseFloat(id)) && !isFinite(id)) {
    res.render('index', {
      error: 'ID must be numbers onlys ! ',
      content:'tools/imgsnatch.ejs'});
    return;
  }

  // Check for id
  if(id < 0) {
    res.render('index', {
      error: 'ID can not be less than 0 !',
      content:'tools/imgsnatch.ejs'});
    return;
  }

  // Check if entered ID exists in database
  mysql.sendQuery("SELECT * FROM scrap WHERE id=" + id + ";", function(err, rows, fields) {

    // If there is no picture with that ID
    if(rows == '') {
      res.render('index', {
        error: 'There is no picture with requested ID !',
        content:'tools/imgsnatch.ejs'});
      return;
    }

    // If id exists in database but not in file
    if(!fs.existsSync('./public/imgsnatch/' + id + '.png')) {
      res.render('index', {
        error: 'Picture doesnt exist or it was deleted !',
        content:'tools/imgsnatch.ejs'});
      return;
    }

    // Render user page with picture to preview
    var picid = {id: "/imgsnatch/" + id + '.png'};
    res.render('index', {
      picid: picid,
      content:'tools/imgsnatch.ejs',
      rows: rows});

  });

};
//------------------------------------------------------------------------------


// Exporting functions
module.exports = {
  takeScr:takeScr,
  checkImages: checkImages,
  previewScr: previewScr
}
//------------------------------------------------------------------------------
