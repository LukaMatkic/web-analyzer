var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije

//-----------------------------------------------------------------------------
// Funkcija za refreshati tablicu sa najnovijim scrapovima
var reloadTable = function(res) {

  // Saljemo query
  mysql.sendQuery('SELECT * FROM scrap ORDER BY date DESC, time DESC LIMIT 10;', function(rows,fields)
  {
    // Saljemo dobivene redove iz querija da se prikazu u fileu
    res.render('tools-lastanalyzes',{scrapped:rows});
  });

};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Radimo exports
module.exports = {
  reloadTable: reloadTable
};
//-----------------------------------------------------------------------------
