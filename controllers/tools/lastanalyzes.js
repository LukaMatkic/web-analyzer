var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');
//-----------------------------------------------------------------------------
// Funkcija za refreshati tablicu sa najnovijim scrapovima
var reloadTable = function(res) {

  // Saljemo query
  mysql.sendQuery('SELECT * FROM scrap ORDER BY date DESC, time DESC LIMIT 10;', function(err, rows,fields)
  {
    // Ako ne dobijemo nitijedan rows onda za sada ne saljemo nistas
    if(rows == '') {
      res.render('index', {
        content: 'tools/lastanalyzes.ejs',
        error: "No analyzes to preview !"});
    } else {
      // If id exists in database but not in file
      var picture = [];
      for(var i=0;i<rows.length;i++) {
        if(fs.existsSync('./public/imgsnatch/' + rows[i].id + '.png')) {
          picture[i] = true;
        } else {
          picture[i] = false;
        }
      }

      res.render('index', {
        content: 'tools/lastanalyzes.ejs',
        scrapped:rows,
        picture: picture});
    }
  });

};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Radimo exports
module.exports = {
  reloadTable: reloadTable
};
//-----------------------------------------------------------------------------
