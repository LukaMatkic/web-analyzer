var mysql = require('./mysql'); // Includamo mysql.js da mozemo slati querije

//-----------------------------------------------------------------------------
// Funkcija za prikaz statistike
var loadScrapID = function(id, res) {

  // Ako id stavimo -1 tada znaci da nam prikaze zadnjeg
  if(id == -1) {
    mysql.sendQuery('SELECT * FROM scrap WHERE id = (SELECT id FROM scrap ORDER BY date DESC, time DESC LIMIT 1);', function(rows,fields) {

      // Saljemo dobivene redove iz querija da se prikazu u fileu
      res.render('analyzed',{analyzed:rows});
    });
  // Ako nije trazimo prema ID-u
  } else {
    mysql.sendQuery('SELECT * FROM scrap WHERE id = ' + id, function(rows,fields) {

      // Saljemo dobivene redove iz querija da se prikazu u fileu
      res.render('analyzed',{analyzed:rows});
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
