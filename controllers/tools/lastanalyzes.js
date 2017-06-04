var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');
var timeAgo = require('node-time-ago');
//-----------------------------------------------------------------------------
// Funkcija za refreshati tablicu sa najnovijim scrapovima
var reloadTable = function(req, res) {

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

      // Change rows.time into "time-ago" format
      for(var i=0;i<rows.length;i++) {
        var times = rows[i].time.split(':'); // Spliting 00:00:00 format into times[]...
        rows[i].time = timeAgo(new Date(
            rows[i].date.getFullYear(),
            rows[i].date.getMonth(),
            rows[i].date.getDate(),
            times[0], times[1], times[2]
          )
        );
      };

      // Rendering last analyzes page with data
      // If user is logged in
      if(req.isAuthenticated()) { // If user is logged in no info is shown
          res.render('index', {
          content: 'tools/lastanalyzes.ejs',
          scrapped: rows,
          picture: picture});
      } else { // If he is not we send him info too
        res.render('index', {
        content: 'tools/lastanalyzes.ejs',
        scrapped: rows,
        picture: picture,
        info: 'Guests can only preview anonymous analyzes or analyzes from other guests !'});
      }
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
