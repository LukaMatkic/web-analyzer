var cheerio = require('cheerio');
var request = require('request');
var mysql = require('./mysql'); // Includamo mysql.js da mozemo slati querije
var lastScrapsTable = require('./lastScrapsTable'); // Includamo da mozemo updateat tablicu

//-----------------------------------------------------------------------------
// Funkcija za scrappanje stranice
var scrapURL = function(url, res) {

  // Tu pocinje scrappanje cheerio loada body url-a koji je unesen
  request(url, function(error, response, body) {

    // Temporary objekt za spremanje scrap podataka
    var data = {
      url: "",
      http_status: -1,
      con_length: -1,
      con_type: "",
      server: "",
      title: "",
      date: "",
      time: ""
    };

    // Ukoliko postoji error ispisujemo ga
    if(error) {
      console.log("ERROR [#3] [Cannot analyze given URL]");
    }

    //Body se loada u cheerio module
    var $ = cheerio.load(body);

    // Ucitavamo podatke od stranice i sortiramo ih u "data" varijablu
    data.url = url;
    data.http_status = response.statusCode;
    data.con_type = response.headers['content-type'];
    data.con_length = response.headers['content-length'];
    data.server = response.headers['server'];
    data.title = $('title').text();
    data.date = require('moment')().format('YYYY-MM-DD');
    data.time = require('moment')().format('HH:mm:ss');

    // Provjeravamo ako nema settanih vrijednosti stavljamo NULL
    if(data.con_type == undefined) { data.con_type = ''; }
    if(data.server == undefined) { data.server = ''; }
    if(data.title == undefined) { data.title = ''; }
    if(data.con_length == undefined) { data.con_length = -1; }

    // DEBUG - samo da vidimo sta se radi i sta je procitano da ne moras u bazu svaki put
    /*
    console.log("Status code: " + data.http_status);
    console.log("content-type: " + data.con_type);
    console.log("content-length: " + data.con_length);
    console.log("server: " + data.server);
    console.log("title: " + data.title);
    console.log("date: " + data.date);
    console.log("date: " + data.time);
    console.log('Type: ' + req.body.item);
    */

    // Stvaramo queri koji saljemo kako bi spremili podatke
    mysql.sendQuery(
        "INSERT INTO scrap (url,http_status,con_type,con_length,server,title,date,time) VALUES ( \
          '"+data.url+"', \
          "+data.http_status+", \
          '"+data.con_type+"', \
          "+data.con_length+", \
          '"+data.server+"', \
          '"+data.title+"', \
          '"+data.date+"', \
          '"+data.time+"' \
        );", function(){

          // Updateamo tablicu zadnjih scrapova
          lastScrapsTable.reloadTable(res);
          
        });

  });

};

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Radimo exports
module.exports = {
  scrapURL: scrapURL
};
//-----------------------------------------------------------------------------
