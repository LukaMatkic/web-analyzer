var request = require('request');
var screenshot = require('url-to-image');
var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');

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
    mysql.sendQuery("SELECT * FROM image WHERE id=" + file.replace('.png','') + ";", function(err, rows, fields) {

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

  // Provjeravamo zatim b) U BAZI IMA SLIKE A U FILEU NEMA
  // Saljemo query da dobijemo sve podatke
  mysql.sendQuery("SELECT * FROM image", function(err, rows, fields) {

    // Za svaki row
    for(var i=0;i<rows.length;i++) {

      // Ako slika ne postoji
      if(!fs.existsSync('./public/imgsnatch/' + rows[i].id + '.png')) {

        // Pobrisi ga u bazi slanjem ovog quija
        mysql.sendQuery('DELETE FROM image WHERE id=' + rows[i].id + ';',function(){});
        //console.log('DELETED ROW: ' + rows[i].id + ' [No pcture]');
      }
    }

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

  // Slikamo i spremamo u bazu
  mysql.sendQuery("INSERT INTO image (url) VALUES ('"+url+"')", function(err, rows, fields) {

    screenshot(url, './public/imgsnatch/' + rows.insertId + '.png').done(function() {
        //DEBUG
        var recenica = {
            id: "/imgsnatch/" + rows.insertId + '.png'
        };

        res.render('index', {recenica:recenica, content:'tools/imgsnatch.ejs'});
    });
  });

}

module.exports = {
  takeScr:takeScr,
  checkImages: checkImages
}
