var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');

//-----------------------------------------------------------------------------
// Funkcija za prikaz statistike
var loadScrapID = function(id, res) {

  // Ucitavamo html data (opcenito o stranici)
  loadScrapData(id, function(rows, fields){

    // Ucitavamo headere sa stranice
    loadHeadData(id, function(rows2, fields2){

      // If picture (path) exists it will be show too
      if(fs.existsSync('./public/imgsnatch/' + id + '.png')) {
        // We send picture id to preview too
        var idx = {id: '/imgsnatch/' + id + '.png'};
        res.render('index',{content:'tools/sitedata.ejs', analyzed:rows, headers:rows2, picture:idx});
      } else {
        res.render('index',{content:'tools/sitedata.ejs', analyzed:rows, headers:rows2});
      }


    });

  });

};

//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
// Funkcija za ucitavanje i return rowova za opcenite podatke

var loadScrapData = function(id, callback) {

  // Ako id stavimo -1 tada znaci da nam prikaze zadnjeg
  if(id == -1) {
    mysql.sendQuery('SELECT * FROM scrap WHERE id = (SELECT id FROM scrap ORDER BY date DESC, time DESC LIMIT 1);', function(err, rows, fields) {
    return callback(rows, fields);
    });
  // Ako nije trazimo prema ID-u
  } else {
    mysql.sendQuery('SELECT * FROM scrap WHERE id = ' + id, function(err, rows, fields) {
    return callback(rows, fields);
    });
  }
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
