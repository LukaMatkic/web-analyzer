var request = require('request');
var screenshot = require('url-to-image');
var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije


var takeScr = function(url, res) {

  // Provjeravamo ako je request 200 da mozemo slikati
  request(url, function(error, response) {
    if(error) {
      console.log("desio se neki error, krivi su dizajneri !")
      return;
    }
    if(response.statusCode != 200) {
      console.log("opet su krivi dizajneri !");
      return;
    } });

  // Slikamo i spremamo u bazu
  mysql.sendQuery("INSERT INTO image (url) VALUES ('"+url+"')", function(rows,fields) {
    screenshot(url, './public/imgsnatch/' + rows.insertId + '.png').done(function() {
      //DEBUG
      //console.log("Image saved ny ID: " + rows.insertId);
      res.render('tools-imgsnatch', {id:rows.insertId});
    });
  });

}

module.exports = {
  takeScr:takeScr
}
