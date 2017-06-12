// All includes
var cheerio = require('cheerio');
var request = require('request');
var mysql = require('../mysql'); // Including mysql.js so we can send queries
var fs = require('fs');
var timeAgo = require('node-time-ago');
var screenshot = require('url-to-image');
//------------------------------------------------------------------------------

// Function for web page scrapping
var scrapURL = function(url, redirect, img, anon, headings, child, req, res) {
  // Preparing data var
  var data = {
    url: "",
    // HTTP headers
    http_status: -1,
    con_length: -1,
    con_type: "",
    server: "",
    // HTML tags
    title: "",
    charset: "",
    // OG pen Graph
    // Other
    date: "",
    time: "",
    id_user: 0
  };
console.log('Varijabla redirect: ' + redirect);
  function redirs(){
      var maxRedirs = 5;
      if(redirect == 'on'){
          return {
              followRedirs: true,
              followAll: true,
              maxredirs: maxRedirs
          };
      }
      else {
          return {
              followRedirs: false,
              followAll: false,
              maxredirs: maxRedirs
          };
      }
  }
  var redirs2 = redirs();
  console.log('Follow Redirects: ' + redirs2.followRedirs);
  console.log('Follow ALL Redirects: ' + redirs2.followAll);
  console.log('Max Redirects: ' + redirs2.maxredirs);

  // Sending request
  request(options = { url: url, followRedirect: redirs2.followRedirs, followAllRedirects: redirs2.followAll, maxRedirects: redirs2.maxredirs}, function(error, response, body) {

      console.log('Follow Redirects: ' + redirs2.followRedirs);
      console.log('Follow ALL Redirects: ' + redirs2.followAll);
      console.log('Max Redirects: ' + redirs2.maxredirs);

    //Body se loada u cheerio module
    var $ = cheerio.load(body);

    // If error happens
    if(error) {
      res.render('index1', {
        content: 'tools/scraper.ejs',
        error: 'Error happened while analyzing URL !',
        user: req.user});
      return;
    }

    // If status code is between 301 and 400
    if (response.statusCode >= 301 && response.statusCode <= 400) {
        console.log('No Redirect Allowed!');
        startRedirScrape(req, res, data, url, response, $);
        return;
    }
    else {
        console.log('Found, or redirected!');
    startBaseScrape(req, res, data, url, response, img, anon, headings, child, $);

  }
});
};
//-----------------------------------------------------------------------------

// Function basic scrapping
var startBaseScrape = function(req, res, data, url, response, img, anon, headings, child, $) {

    // Loading data
    data.url = url;
    if(typeof req.user != 'undefined') data.id_user = req.user.id;
    data.http_status = response.statusCode;
    data.con_length = response.headers['content-length'];
    data.con_type = response.headers['content-type'];
    data.server = response.headers['server'];
    data.title = $('title').text();
    data.charset = response.headers['Accept-Charset'];
    data.date = require('moment')().format('YYYY-MM-DD');
    data.time = require('moment')().format('HH:mm:ss');

    // If some data is set to undefined we set it to ''
    if(data.con_type === undefined) data.con_type = '';
    if(data.server === undefined) data.server = '';
    if(data.title === undefined) data.title = '';
    if(data.con_length === undefined) data.con_length = -1;
    if(data.charset === undefined) data.charset = '';

    // Set id_user to 0 if anonymous
    if(anon) data.id_user = 0;

    // Sending query to database
    mysql.sendQuery("INSERT INTO scrap (url,id_user,http_status,con_type,con_length,server,title,charset,date,time) VALUES ( \
      '" + data.url + "', \
      " + data.id_user + ", \
      " + data.http_status + ", \
      '" + data.con_type + "', \
      " + data.con_length + ", \
      '" + data.server + "', \
      '" + data.title + "', \
      '" + data.charset + "', \
      '" + data.date + "', \
      '" + data.time + "');",
      function(err, rows, fields) {

        // If error happend while writing to database
        if(err) {
          res.render('index1', {
            content: 'tools/scraper.ejs',
            error: 'Error happened while writing analyze to database !',
            user: req.user});
            return;
        }

        // If image scrape is selected we scrape image of site
        if(img) {
          screenshot(url, './public/imgsnatch/' + rows.insertId + '.png').done(function() {});
        }

        // If scrape child urls is selected
        if(child) {
          scrapeRedirects(rows.insertId, $);
        }

        // Sending query to get back data from databse
        mysql.sendQuery("SELECT * FROM scrap WHERE id=" + rows.insertId + ";",
          function(err2, rows2, fields2) {

            // If error happens while reading from base
          if(err2) {
            res.render('index1', {
              content: 'tools/scraper.ejs',
              error: 'Error happened while reading analyze to database !',
              user: req.user});
              return;
          }

          // Scrapping headings
          scrapHeadings($, rows, rows2, headings, req, res, function(rowsx) {

            var heads = headings;
            if(!heads) heads = false;
            var urlchild = child;
            if(!urlchild) urlchild = false;

            // Preparing picture object witch tells if picture of scrap exists
            var picture = [];
            if(fs.existsSync('./public/imgsnatch/' + rows2[0].id + '.png')) {
              picture[0] = true;
            } else {
              picture[0] = false;
            }

            // Change rows.time into "time-ago" format
            for(var i=0;i<rows2.length;i++) {
              var times = rows2[i].time.split(':'); // Spliting 00:00:00 format into times[]...
              rows2[i].time = timeAgo(new Date(
                  rows2[i].date.getFullYear(),
                  rows2[i].date.getMonth(),
                  rows2[i].date.getDate(),
                  times[0], times[1], times[2]
                )
              );
            }

            var yours = [];
            for(var i=0;i<rows2.length;i++) {
              if(rows2[i].id_user == req.user.id) {
                yours[i] = true;
              } else {
                yours[i] = false;
              }
            }

            var anonim = [];
            for(var i=0;i<rows2.length;i++) {
              if(rows2[i].id_user === 0) {
                anonim[i] = false;
              } else {
                anonim[i] = true;
              }
            }

            // If there is picture scraped too we send warning
            if(img) {
              res.render('index1', {
                content: 'tools/scraper.ejs',
                sucess: 'Analyze of URL \"' + data.url + '\" and ID \"' + rows2[0].id + '\" has completed sucessfully !',
                sucscr: rows2,
                headers: rowsx,
                picture: picture,
                yours: yours,
                anonim: anonim,
                heading: heads,
                child: urlchild,
                user: req.user,
                warn: 'Image will be avaliable after magic is applyed !'});
            } else {
              res.render('index1', {
                content: 'tools/scraper.ejs',
                sucess: 'Analyze of URL \"' + data.url + '\" and ID \"' + rows2[0].id + '\" has completed sucessfully !',
                sucscr: rows2,
                headers: rowsx,
                picture: picture,
                yours: yours,
                anonim: anonim,
                child: urlchild,
                heading: heads,
                user: req.user});
            }

          });
        });
    });
};
//------------------------------------------------------------------------------

// Function for scrapping data from redirected page
var startRedirScrape = function(req, res, data, url, response, $){

  // Loading basic data of site
  data.url = url;
  data.http_status = response.statusCode;
  data.title = $('title').text();
  data.date = require('moment')().format('YYYY-MM-DD');
  data.time = require('moment')().format('HH:mm:ss');

  // If some data is set to undefined we set it to ''
  if (data.title === undefined) data.title = '';

  // Sending query
  mysql.sendQuery("INSERT INTO scrap (url,id_user,http_status,title,date,time) VALUES ( \
    '" + data.url + "', \
    " + req.user.id + ", \
    " + data.http_status + ", \
    '" + data.title + "', \
    '" + data.date + "', \
    '" + data.time + "';",
    function(err, rows, fields) {

    // If error happend while writing to database
    if(err) {
      res.render('index1', {
        content: 'tools/scraper.ejs',
        error: 'Error happened while writing analyze to database !',
        warn: 'URL returned status code \"' + data.http_status + '\" !',
        user: req.user});
        return;
    }

    // Sending query to get back data from databse
    mysql.sendQuery("SELECT * FROM scrap WHERE id=" + rows.insertId + ";",
      function(err2, rows2, fields2) {

      // If error happens while reading from base
      if(err2) {
        res.render('index1', {
          content: 'tools/scraper.ejs',
          error: 'Error happened while reading analyze to database !',
          warn: 'URL returned status code \"' + data.http_status + '\" !',
          user: req.user});
          return;
      }

      // If everything works
      res.render('index1', {
        content: 'tools/scraper.ejs',
        sucess: 'Analyze of URL \"' + data.url + '\" and ID \"' + rows2[0].id + '\" has completed sucessfully !',
        warn: 'URL returned status code \"' + data.http_status + '\" !',
        user: req.user});
        return;
    });
  });
};
//------------------------------------------------------------------------------

// Function for scrap headings from URL
var scrapHeadings = function($, rows5, rows, headings, req, res, callback) {

  // If headings are not checked to scrap dont do anything
  if(!headings) {
    return callback();
  }

  // Counter so we know value of next query because as we insert them we will
  // later read them by order as we saved them using count
  var count = 0;

  // Head of the query
  var query = "INSERT INTO headers (id_scrap,head_text,head_value,head_order) VALUES ";

  // For every * we do
  $("*").map(function() {

      // Getting name of this (h1,h2,p,a...) and refer it as value
      var hValue = headerToValue(this.name);

      // If value is usable (1,2,3,4...) but not -1
      if(hValue != -1) {

        // Getting and checking text and saving for database query
        var hText = $(this).text();
        hText = checkHeaderText(hText);
        query += "(" + rows[0].id + ",'" + hText + "'," + hValue + "," + count + "),\n";
        count++;

        // If hValue is 7 it means this heading is link from a
        // example (<a href='link here') so we check and save it
        if(hValue == 7) {

          // Change this.attrigs.href to string
          var nes = '' + this.attribs.href + '';

          // If length is over 127 we dont save it
          if (nes.length > 127) {
              nes = '';
          }

          // If href doesnt have two dots it cant be link
          // Maybe it can but this is good filter for bad links
          if(countChars(nes, '.') < 2) {
              nes = '';
          }

          // If somewhere in string there is ' char string is deleted
          // ' char in link causes error while executing query
          for(var i=0;i<nes.length;i++) {
            if(nes[i] == '\'') {
              nes = '';
              break;
            }
          }

          // Sending href to database
          query += "(" + rows[0].id + ",'" + nes + "'," + 8 + "," + count + "),\n";
          count++;

        }
      }
  });

  // Formating query that last char , is replaced with ;
  query = query.substring(0, query.length - 2);

  // Sending query, finally ! :)
  mysql.sendQuery(query + ';', function(err, rows2, fields){

    // Returning rows
    return callback(rows2);
  });
};
//------------------------------------------------------------------------------

// Function for start scrapping every redirect and saving it into child_scrap
// This saves only URL-s and not data, user can later scrap data
var scrapeRedirects = function(id, $) {

  // Var for remembering urls before saving into database
  var data = [];

  // Count will count how much data exists
  var count = 0;

  // Head of the query
  var query = "INSERT INTO child_scrap (id_scrap,url) VALUES ";

  // Function to map every a from $ (body)
  $("a").map(function() {

    // Getting url from <a>
    var url = '' + this.attribs.href + '';

    // If length is over 127 we skip
    if (url.length > 127) {
      url = '';
    }

    // If href doesnt have two dots it cant be link
    // Maybe it can but this is good filter for bad links
    if(countChars(url, '.') < 2) {
      url = '';
    }

    // If first letter is # or / we discard it too
    if(url[0] === '#' || url[0] === '/') {
      url = '';
    }

    // If somewhere in string there is ' char string is deleted
    // ' char in link causes error while executing query
    for(var i=0;i<url.length;i++) {
      if(url[i] == '\'') {
        url = '';
        break;
      }
    }

    // If url is longer than 2 chars and is does not already exists in data
    var exists = false;
    if(url.length > 2) {
      for(var i=0;i<count;i++) {
        if(data[i] === url) {
          exists = true;
          break;
        }
      }
    }

    // If url does not exists we save it into var for later database insertion
    if(!exists && url.length > 5) {
      data[count] = url;
      count++;
    }
  });

  // Creating query
  for(var i=0;i<data.length;i++) {
    // Saving each data to query
    query += "(" + id + ",'" + data[i] + "'),\n";
  }

  // Formating query that last char , is replaced with ;
  query = query.substring(0, query.length - 2);

  // Sending query, finally ! :)
  mysql.sendQuery(query + ';', function(err, rows2, fields) {});

};
//------------------------------------------------------------------------------

// Function for guests to scrape some URL, guests can only scrape HTML tags from given URL
var simpleScrapUrl = function(url, res) {

  // Sending request to URL
  request(url, function(error, response, body) {

    // If error happens
    if(error) {
      res.render('index1', {
        content: 'tools/scraper.ejs',
        error: 'Error happened while analyzing URL !'});
      return;
    }

    // If status code is not 200 - OK
    if(response.statusCode != 200) {
      res.render('index1', {
        content: 'tools/scraper.ejs',
        error: 'Status code of given URL is not 200 !',
        info: 'Login for advanced URL analyzing options !'});
      return;
    }

    // Creating var for data storing
    var data = {
      url: '',
      http_status: 0,
      con_length: 0,
      con_type: '',
      server: '',
      title: '',
      charset: '',
      date: '',
      time: ''
  };

    // Loading body and data
    var $ = cheerio.load(body);

    data.url = url;
    data.http_status = response.statusCode;
    data.con_length = response.headers['content-length'];
    data.con_type = response.headers['content-type'];
    data.server = response.headers['server'];
    data.title = $('title').text();
    data.charset = response.headers['Accept-Charset'];
    data.date = require('moment')().format('YYYY-MM-DD');
    data.time = require('moment')().format('HH:mm:ss');

    // Checking if any element is 'undefined'
    if(data.con_length === undefined) data.con_length = 0;
    if(data.con_type === undefined) data.con_type = '';
    if(data.server === undefined) data.server = '';
    if(data.title === undefined) data.title = '';
    if(data.charset === undefined) data.charset = '';
    if(data.date === undefined) data.date = '';
    if(data.time === undefined) data.time = '';

    // Saving into database
    mysql.sendQuery("INSERT INTO scrap (url,id_user,http_status,con_type,con_length,server,title,charset,date,time) VALUES ( \
      '" + data.url + "', \
      0, \
      " + data.http_status + ", \
      '" + data.con_type + "', \
      " + data.con_length + ", \
      '" + data.server + "', \
      '" + data.title + "', \
      '" + data.charset + "', \
      '" + data.date + "', \
      '" + data.time + "' \
      );", function(err, rows, fields) {

      // If there is error happened
      if(err) {
        res.render('index1', {
          content: 'tools/scraper.ejs',
          error: 'Something went wrong with inserton of analyze into database !'});
        return;
      }

      // If everything is okay we display sucess and inserted analyze
      mysql.sendQuery("SELECT * FROM scrap WHERE id=" + rows.insertId + ";",
      function(err, rows, fields) {

        // If there is error happened
        if(err) {
          res.render('index1', {
            content: 'tools/scraper.ejs',
            error: 'Something went wrong with reading analyze from database !'});
          return;
        }

        // Preparing picture object witch tells if picture of scrap exists
        var picture = [];
        if(fs.existsSync('./public/imgsnatch/' + rows[0].id + '.png')) {
          picture[0] = true;
        } else {
          picture[0] = false;
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
        }

        // Displaying scraper
        res.render('index1', {
          content: 'tools/scraper.ejs',
          sucess: 'Analyze of URL \"' + data.url + '\" and ID \"' + rows[0].id + '\" has completed sucessfully !',
          info: 'All your analyzes are anonymous, to track your analyzes please login !',
          sucscr: rows,
          picture: picture});
      });
    });
  });
};
//------------------------------------------------------------------------------

// Function to count number of specific character in substring
var countChars = function(string, char) {
  var counter = 0;
  for(var i=0;i<string.length;i++) {
    if(string[i] == char) {
      counter++;
    }
  }
  return counter;
};
//------------------------------------------------------------------------------

// Function for returning value of h*,a,p (h1,h2...a,p..) like h1 = 0, h2 = 1...
var headerToValue = function(header) {
    switch (header) {
        case 'h1':
            return 0;
        case 'h2':
            return 1;
        case 'h3':
            return 2;
        case 'h4':
            return 3;
        case 'h5':
            return 4;
        case 'h6':
            return 5;
        case 'p':
            return 6;
        case 'a':
            return 7;
        default:
            return -1;
    }
};
//-----------------------------------------------------------------------------

// Function for checking text in headings
var checkHeaderText = function(text) {
    var newText = ''; // Here we will save char by char

    // If text is longr than 127 we will cut it and place dots
    if (text.length > 127) {
        text = text.substring(0, 124) + '...';
    }

    // For each char we check if it is allowed
    for (var i = 0; i < text.length; i++) {

        // Sending text[i] for check for every char in string
        revalidCharacter(text[i], function(char) {

            // If it is not false or true it needs to be changed
            // with callback letter ("char")
            if (char !== false && char !== true) {
                newText += char;

            // If it is allowed to use (true) we just copy it
        } else if (char === true) {
                newText += text[i];
            }
        });
    }

    // Returning new string witch will be saved to database
    return newText;
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Function to check ig char can be used
/* CALLBACK DATA:
      false - char wont be used, it will be deleted
      true - char can be used
      '%' - char will be replaced with char %
*/
var revalidCharacter = function(char, callback) {
    switch (char) {
        // Numbers
        case '0':
            return callback(true);
        case '1':
            return callback(true);
        case '2':
            return callback(true);
        case '3':
            return callback(true);
        case '4':
            return callback(true);
        case '5':
            return callback(true);
        case '6':
            return callback(true);
        case '7':
            return callback(true);
        case '8':
            return callback(true);
        case '9':
            return callback(true);
        // Chars
        case 'a':
            return callback(true);
        case 'b':
            return callback(true);
        case 'c':
            return callback(true);
        case 'd':
            return callback(true);
        case 'e':
            return callback(true);
        case 'f':
            return callback(true);
        case 'g':
            return callback(true);
        case 'h':
            return callback(true);
        case 'i':
            return callback(true);
        case 'j':
            return callback(true);
        case 'k':
            return callback(true);
        case 'l':
            return callback(true);
        case 'm':
            return callback(true);
        case 'n':
            return callback(true);
        case 'o':
            return callback(true);
        case 'p':
            return callback(true);
        case 'r':
            return callback(true);
        case 's':
            return callback(true);
        case 't':
            return callback(true);
        case 'u':
            return callback(true);
        case 'v':
            return callback(true);
        case 'z':
            return callback(true);
        case 'w':
            return callback(true);
        case 'y':
            return callback(true);
        case 'A':
            return callback(true);
        case 'B':
            return callback(true);
        case 'C':
            return callback(true);
        case 'D':
            return callback(true);
        case 'E':
            return callback(true);
        case 'F':
            return callback(true);
        case 'G':
            return callback(true);
        case 'H':
            return callback(true);
        case 'I':
            return callback(true);
        case 'J':
            return callback(true);
        case 'K':
            return callback(true);
        case 'L':
            return callback(true);
        case 'M':
            return callback(true);
        case 'N':
            return callback(true);
        case 'O':
            return callback(true);
        case 'P':
            return callback(true);
        case 'R':
            return callback(true);
        case 'S':
            return callback(true);
        case 'T':
            return callback(true);
        case 'U':
            return callback(true);
        case 'V':
            return callback(true);
        case 'Z':
            return callback(true);
        case 'W':
            return callback(true);
        case 'Y':
            return callback(true);
        case 'Q':
            return callback(true);
        case 'q':
            return callback(true);
        // Special chars
        case 'č':
            return callback('c');
        case 'Č':
            return callback('C');
        case 'ć':
            return callback('c');
        case 'Ć':
            return callback('C');
        case 'đ':
            return callback('d');
        case 'Đ':
            return callback('D');
        case 'ž':
            return callback('z');
        case 'Ž':
            return callback('Z');
        case 'š':
            return callback('s');
        case 'Š':
            return callback('S');
        // Other
        case ' ':
            return callback(true);
        case ':':
            return callback(true);
        case '.':
            return callback(true);
        case '(':
            return callback(true);
        case ')':
            return callback(true);
        // If char is not find it is not allowed to be used
        default:
            return callback(false);
    }
};
//-----------------------------------------------------------------------------

// Exporting
module.exports = {
    scrapURL: scrapURL,
    simpleScrapUrl: simpleScrapUrl
};
//-----------------------------------------------------------------------------
