var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');

//-----------------------------------------------------------------------------
// Funkcija za prikaz statistike
var loadScrapID = function(req, res, id) {

  // If there is no rows in return user entered wrong ID
  if(id.length > 20) {
    if(typeof req.user != 'undefined') {
      res.render('index',{
        content: 'tools/sitedata.ejs',
        error: 'Length of ID can not be more than 20 characters !',
        user: req.user});
    } else {
      res.render('index',{
        content: 'tools/sitedata.ejs',
        error: 'Length of ID can not be more than 20 characters !'});
    }
    return;
  }

  // Ucitavamo html data (opcenito o stranici)
  mysql.sendQuery("SELECT * FROM scrap WHERE id = '" + id + "';", function(err, rows, fields) {

    // If there is no rows in return user entered wrong ID
    if(rows == '') {
      if(typeof req.user != 'undefined') {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          error: 'There is no scrap with requested ID \"' + id + '\" !',
          user: req.user});
      } else {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          error: 'There is no scrap with requested ID \"' + id + '\" !'});
      }
      return;
    }

    // If user is logged in
    if(typeof req.user != 'undefined') {
      // If scrape is private it cannot be shown
      if(rows[0].private == true) {
        // If user is not creator we send err msh too
        if(req.user.id != rows[0].id_user) {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          error: 'Analyze id ID \"' + id + '\" is private !',
          info: 'You can make your analyzes private too !',
          user: req.user});
          return;
        }
      }
    // If user is not logged in
    } else {
      // If scrap isnt anonymous we display error message
      // *guests can preview only anonymous analyzes
      if(rows[0].id_user != '') {
        if(typeof req.user != 'undefined') {
          res.render('index',{
            content: 'tools/sitedata.ejs',
            error: 'Scrap with requested ID \"' + id + '\" is private and can not be shown !',
            info: 'Only registered users can make their analyzes private !',
            user: req.user});
        } else {
          res.render('index',{
            content: 'tools/sitedata.ejs',
            error: 'Scrap with requested ID \"' + id + '\" is private and can not be shown !',
            info: 'Only registered users can make their analyzes private !'});
        }
        return;
      }
    };

    // Ucitavamo headere sa stranice
    loadHeadData(id, function(rows2, fields2) {

      var rows3 = [];
      for(var i=0;i<rows2.length;i++) {
        switch(rows2[i].head_value) {
          case 0:
            rows3[i] = '<h1>';
            break;
          case 1:
            rows3[i] = '<h2>';
            break;
          case 2:
            rows3[i] = '<h3>';
            break;
          case 3:
            rows3[i] = '<h4>';
            break;
          case 4:
            rows3[i] = '<h5>';
            break;
          case 5:
            rows3[i] = '<h6>';
            break;
          case 6:
            rows3[i] = '<p>';
            break;
          case 7:
            rows3[i] = '<a>';
            break;
        }
      }

      // If picture (path) exists it will be show too
      if(fs.existsSync('./public/imgsnatch/' + id + '.png')) {
        // If user is logged in
        if(typeof req.user != 'undefined') {
          // We send picture id to preview too
          var idx = {id: '/imgsnatch/' + id + '.png'};
          res.render('index',{
            content: 'tools/sitedata.ejs',
            analyzed: rows,
            headers: rows2,
            picture: idx,
            headers2: rows3,
            sucess: 'Data from scrap ID \"' + id + '\" loaded sucessfully !'});
        // If user is not logged in
        } else {
          res.render('index',{
            content: 'tools/sitedata.ejs',
            analyzed: rows,
            headers: rows2,
            warn: 'Picture can be previewed only to logged in users !',
            headers2: rows3,
            sucess: 'Data from scrap ID \"' + id + '\" loaded sucessfully !'});
        }
      // If there is no picture we preview it without
      } else {
        res.render('index',{
          content: 'tools/sitedata.ejs',
          analyzed: rows,
          headers: rows2,
          headers2: rows3,
          sucess: 'Data from scrap ID \"' + id + '\" loaded sucessfully !'});
      }

    });
  });
}
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
