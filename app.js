
var express = require ('express');
var mysql = require('mysql');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();

//SET UP TEMPLATE ENGINE
app.set('view engine','ejs');

//STATIC FILES
app.use(express.static('./public'));

//LISTEN TO PORT
app.listen(3000);
console.log('You are listening to port 3000');


//DEFINIRANJE OBJEKTA data KOJEG CEMO KASNIJE KORISTITI DA U NJEGA SPREMIMO SCRAPPANE PODATKE
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


//CONNECT TO DATABASE
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'analyzer'
});

//KOLIKO SAM SKUZIO PRETVARA 0 i 1 KOJE PRIMI OD SAJTA u UTF8 ali nisam siguran dal to radi!
/*Returns middleware that only parses urlencoded bodies.
This parser accepts only UTF-8 encoding of the body and supports automatic inflation of gzip and deflate encodings.
A new body object containing the parsed data is populated on the request object after the middleware (i.e. req.body).
This object will contain key-value pairs, where the value can be a string or array (when extended is false), or any type (when extended is true).*/

var urlencodedParser = bodyParser.urlencoded({extended:false});

  app.get('/scrap',function(req,res){

    renderFuckingPage(res);

  });
  /*app.get('/scrapedurl',function(req,res){

    //GET DATA FROM DB AND PASS IT TO view todo.ejs
    connection.query('SELECT time, url, title FROM scrap ORDER BY time DESC;',function(err,rows,fields){
      //Ako nema errora
        if(!err){
          //šalji na todo podatke iz baze(rows) koje dok saljemo spremamo u varijablu scrapped
          res.render('scrapedurl',{scrapped:rows});
      }
        else
        console.log('No results');
    });

  });*/

  //KADA nam stranica nešto šalje? U ovom slučaju stisnut je submit button?
  app.post('/scrap', urlencodedParser, function(req,res){

      //Nadji url koji treba scrappat sa req.body.item(to je ime submit buttona u todo.ejs)
      data.url = req.body.item;

      //Tu pocinje scrappanje cheerio loada body url-a koji je unesen
      request(data.url, function(error, response, body) {

      //Body se loada u cheerio module
      var $ = cheerio.load(body);

      //SAMOOBJAŠNJIVO
      data.http_status = response.statusCode;
      data.con_type = response.headers['content-type'];
      data.con_length = response.headers['content-length'];
      data.server = response.headers['server'];
      data.title = $('title').text();
      data.date = require('moment')().format('YYYY-MM-DD');
      data.time = require('moment')().format('HH:mm:ss');

      if(error) {
        console.log("Error: " + error);
      }

      // DEBUG samo da vidimo sta se radi i sta je procitano da ne moras u bazu svaki put
      /*console.log("Status code: " + data.http_status);
      console.log("content-type: " + data.con_type);
      console.log("content-length: " + data.con_length);
      console.log("server: " + data.server);
      console.log("title: " + data.title);
      console.log("date: " + data.date);
      console.log("date: " + data.time);
      console.log('Type: ' + req.body.item);*/

      //SPREMANJE SCRAPPANIH PODATAKA U BAZU
      connection.query(
        "INSERT INTO scrap (url,http_status,con_type,con_length,server,title,date,time) VALUES ('"+data.url+"','"+data.http_status+"','"+data.con_type+"','"+data.con_length+"','"+data.server+"','"+data.title+"','"+data.date+"','"+data.time+"')",
        function(err) {
        if (!err)
          console.log('MySQL query SUCESSFULL !');
        else
          console.log('MySQL query FAILED !');
        });


        renderFuckingPage(res);
    });


});

var renderFuckingPage = function(res){
  //GET DATA FROM DB AND PASS IT TO view todo.ejs
  connection.query('SELECT time, url, title, date FROM scrap ORDER BY date DESC, time DESC LIMIT 5;',function(err,rows,fields){
    //Ako nema errora
      if(!err){
        //šalji na todo podatke iz baze(rows) koje dok saljemo spremamo u varijablu scrapped
        //console.log({scrapped:rows});
        res.render('scrap',{scrapped:rows});
    }
      else
      console.log('No results');
  });
};
