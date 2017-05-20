var mysql = require('./mysql'); // Includamo mysql.js da mozemo slati querije

//-----------------------------------------------------------------------------
// Funkcija za refreshati tablicu sa najnovijim scrapovima

var reloadTable = function(res) {

  // Saljemo query
  mysql.sendQuery('SELECT id,time, url, title, date FROM scrap ORDER BY date DESC, time DESC LIMIT 5;', function(rows,fields)
  {
    // Saljemo dobivene redove iz querija da se prikazu u fileu
    res.render('scrap',{scrapped:rows});
  });

};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Radimo exports
module.exports = {
  reloadTable: reloadTable
};
//-----------------------------------------------------------------------------
