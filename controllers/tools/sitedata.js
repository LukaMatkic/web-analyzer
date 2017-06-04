var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');

//-----------------------------------------------------------------------------
// Funkcija za prikaz statistike
var loadScrapID = function(req, res, id) {

  // If there is no rows in return user entered wrong ID
  if(id.length > 20) {
    res.render('index',{
      content: 'tools/sitedata.ejs',
      error: 'Length of ID can not be more than 20 characters !'});
    return;
  }

  // Ucitavamo html data (opcenito o stranici)
  mysql.sendQuery("SELECT * FROM scrap WHERE id = '" + id + "';", function(err, rows, fields) {

    // If there is no rows in return user entered wrong ID
    if(rows == '') {
      res.render('index',{
        content: 'tools/sitedata.ejs',
        error: 'There is no scrap with requested ID \"' + id + '\" !'});
      return;
    }

    // If scrape is private it cannot be shown
    if(rows[0].private == true) {
      // If req.user exists - user is logged in
      if(typeof req.user != 'undefined') {
        // If user is not creator we send err msh too
        if(req.user.id != rows[0].id_user) {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          error: 'Analyze id ID \"' + id + '\" is private !'});
          return;
        }

      // If req.user does not exist user is not logged in so we send error msg
      } else {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          error: 'Scrap with requested ID \"' + id + '\" is private and can not be shown !'});
        return;
      }
    };

    // Ucitavamo headere sa stranice
    loadHeadData(id, function(rows2, fields2) {

      // If picture (path) exists it will be show too
      if(fs.existsSync('./public/imgsnatch/' + id + '.png')) {
        // We send picture id to preview too
        var idx = {id: '/imgsnatch/' + id + '.png'};
        res.render('index',{
          content: 'tools/sitedata.ejs',
           analyzed: rows,
           headers: rows2,
           picture: idx,
           sucess: 'Data from scrap ID \"' + id + '\" loaded sucessfully !'});
      // If there is no picture we preview it without
      } else {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          analyzed: rows,
          headers: rows2,
          sucess: 'Data from scrap ID \"' + id + '\" loaded sucessfully !'});
      }

    });
  });
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Funkcija za ucitavanje i return rowova za opcenite podatke

var loadHeadData = function(id, callback) {

  // Ako id stavimo -1 tada znaci da nam prikaze zadnjeg
  if(id == -1) {
    mysql.sendQuery('SELECT * FROM headers WHERE id_scrap = (SELECT id FROM scrap ORDER BY date DESC, time DESC LIMIT 1);', function(err, rows, fields) {
    return callback(rows, fields);
    });
  // Ako nije trazimo prema ID-u
  } else {
    mysql.sendQuery('SELECT * FROM headers WHERE id_scrap = ' + id, function(err, rows, fields) {
    return callback(rows, fields);
    });
  }
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Radimo exports
module.exports = {
  loadScrapID: loadScrapID
};
//-----------------------------------------------------------------------------
