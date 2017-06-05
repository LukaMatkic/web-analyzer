var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije
var fs = require('fs');
var timeAgo = require('node-time-ago');
//-----------------------------------------------------------------------------

// Function for getting right query for database (if user is logged, or not)
var userQuery = function(req) {
  if(typeof req.user == 'undefined') { // If user isnt logged in
    return "SELECT * FROM scrap WHERE id_user=0 ORDER BY date DESC, time DESC LIMIT 10;";
  } else { // If user is logged in
    return "SELECT * FROM scrap WHERE private=false UNION ALL SELECT * FROM scrap WHERE private=true AND id_user=" + req.user.id + " ORDER BY date DESC, time DESC LIMIT 10;";
  }
}
//------------------------------------------------------------------------------

// Funkcija za refreshati tablicu sa najnovijim scrapovima
var reloadTable = function(req, res) {

  // Saljemo query
  mysql.sendQuery(userQuery(req), function(err, rows,fields)
  {
    // Ako ne dobijemo nitijedan rows onda za sada ne saljemo nistas
    if(rows == '') {
      res.render('index', {
        content: 'tools/lastanalyzes.ejs',
        error: "No analyzes to preview !"});
        return;
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

        var yours = [];
        for(var i=0;i<rows.length;i++) {
          if(rows[i].id_user == req.user.id) {
            yours[i] = true;
          } else {
            yours[i] = false;
          }
        }

        var anonim = [];
        for(var i=0;i<rows.length;i++) {
          if(rows[i].id_user == 0) {
            anonim[i] = false;
          } else {
            anonim[i] = true;
          }
        }

        res.render('index', {
        content: 'tools/lastanalyzes.ejs',
        scrapped: rows,
        picture: picture,
        anonim: anonim,
        yours: yours});

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
