var request = require('request');
var screenshot = require('url-to-image');
var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
//------------------------------------------------------------------------------
// Funkcija za provjeru ako:
//  a) U BAZI NEMA SLIKE A U FILEU IMA
//      - tada brisemo sliku iz filea
//  b( U BAZI IMA SLIKE A U FILEU NEMA
//      - tada brisemo row iz baze
var checkImages = function() {

  // Provjeravamo prvo a) U BAZI NEMA SLIKE A U FILEU IMA
  var fileNames = './public/imgsnatch/';

  // Za svaki file (sliku) u datoteci provjeravamo dali postoji u bazi
  fs.readdirSync(fileNames).forEach(file => {

    // Saljemo queri za provjeru ako postoji
    mysql.sendQuery("SELECT * FROM scrap WHERE id=" + file.replace('.png','') + ";", function(err, rows, fields) {

      // Ako ne postoji brisemo ju
      if(rows == '') {
        fs.unlink('./public/imgsnatch/' + file);
        console.log("DELETED: " + file);
      }
      /*DEBUG - za prikaz ako je ne pobrise
      else
      {
         console.log("NOT DELETED: " + file);
      };*/
    });
  });

};
//------------------------------------------------------------------------------
var takeScr = function(url, res) {

  // Provjeravamo ako je request 200 da mozemo slikati
  request(url, function(error, response) {
    if(error) {
      console.log("desio se neki error, krivi su dizajneri !")
      return;
    }
    if(response.statusCode != 200) {
      console.log("opet su krivi dizajnerix !");
      return;
    } });

    mysql.sendQuery("INSERT INTO scrap (url,date,time) VALUES ( \
      '" + url + "', \
      '" + require('moment')().format('YYYY-MM-DD') + "', \
      '" + require('moment')().format('HH:mm:ss') + "');",
      function(err, rows) {
        screenshot(url, './public/imgsnatch/' + rows.insertId + '.png').done(function() {

          var picid = {id: "/imgsnatch/" + rows.insertId + '.png'};
          res.render('index', {picid:picid, content:'tools/imgsnatch.ejs'});
      });
    });
}

module.exports = {
  takeScr:takeScr,
  checkImages: checkImages
}
