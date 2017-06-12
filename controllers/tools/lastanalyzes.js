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
      res.render('index1', {
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

      for(var i=0;i<rows.length;i++) {
        if(rows[i].title.length > 24) {
          rows[i].title = rows[i].title.substring(0, 20) + '...';
        }
      }

      for(var i=0;i<rows.length;i++) {
        if(rows[i].url.length > 32) {
          rows[i].url = rows[i].url.substring(0, 28) + '...';
        }
      }

      // Sending query for later headers check
      mysql.sendQuery("SELECT id_scrap FROM headers GROUP BY id_scrap;",
        function(errx, rowsx, fieldsx) {

        // Sending query for later childs check
        mysql.sendQuery("SELECT id_scrap FROM child_scrap GROUP BY id_scrap;",
          function(erry, rowsy, fieldsy) {

          // Check if heading exists
          var headings = [];
          for(var i=0;i<rows.length;i++) {
            var check = false;
            for(var j=0;j<rowsx.length;j++) {
              if(rows[i].id == rowsx[j].id_scrap) {
                check = true;
                break;
              }
            }
            if(check) {
              headings[i] = true;
            } else {
              headings[i] = false;
            }
          }

          // Check if childs exists
          var childs = [];
          for(var i=0;i<rows.length;i++) {
            var check = false;
            for(var j=0;j<rowsy.length;j++) {
              if(rows[i].id == rowsy[j].id_scrap) {
                check = true;
                break;
              }
            }
            if(check) {
              childs[i] = true;
            } else {
              childs[i] = false;
            }
          }

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

            res.render('index1', {
            content: 'tools/lastanalyzes.ejs',
            scrapped: rows,
            picture: picture,
            anonim: anonim,
            yours: yours,
            childs: childs,
            heading: headings,
            user: req.user});

          } else { // If he is not we send him info too
            res.render('index1', {
            content: 'tools/lastanalyzes.ejs',
            scrapped: rows,
            picture: picture,
            heading: headings,
            user: req.user,
            info: 'Guests can only preview anonymous analyzes or analyzes from other guests !'});
          }
        });
    });


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
