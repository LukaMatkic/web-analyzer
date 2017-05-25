var express = require ('express');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var mysql = require('./controllers/mysql'); // Potrebno za mysql querije
var lastScrapsTable = require('./controllers/tools/lastanalyzes'); // Potrebno za kontrolirati tablicu najnovijih scrapova
var scrapEngine = require('./controllers/tools/scraper10'); // Potrebno za scrappati url
var showAnalyze = require('./controllers/tools/sitedata'); // Potrebno za osvjeziti alanyze dio

var urlencodedParser = bodyParser.urlencoded({extended:false}); // Pretvaramo http zahtjev

// Namjestamo viwe engine za ejs
app.set('view engine','ejs');

//STATIC FILES
app.use(express.static('./public'));

//------------------------------------------------------------------------------
// Slusamo (listen) port 3000 za daljnje akcije
app.listen(3001);
console.log('\n-------------------[SERVER STATUS]--------------------');
console.log('SERVER STARTED !\n\tYou are listening to port: 3001');
console.log('\n--------------------[SERVER END]----------------------');

//------------------------------------------------------------------------------


//------------------------------------------------------------------------
// Kada dode na homepage
app.get('/',function(req,res){
  // Ucitavamo homepage
  res.render('home');
});
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// Kada dode na tool Scrapper 1.0
app.get('/scraper10',function(req,res){
  // Prikazujemo mu samo tool
  res.render('tools-scraper10');
});
//------------------------------------------------------------------------

//------------------------------------------------------------------------
//  Kada kliknemo na submit button za pocetak scrape-anja URL-a
app.post('/scraper10', urlencodedParser, function(req, res){
  // Pokrecemo scrap engine
  scrapEngine.scrapURL(req.body.item, req.body.redirect, res);
});
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// Za prikaz Site Data tools
app.get('/sitedata', urlencodedParser, function(req, res){
  // Prikazujemo Site Tools stranicu
  res.render('tools-sitedata');
});
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// Kada dode na stranicu za pogledat analizu
app.get('/sitedata/:id', urlencodedParser, function(req,res){
  // Updateamo tablicu za pregled podataka o stranici
  showAnalyze.loadScrapID(req.params.id, res);
});
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// Kada dode na stranicu za pogledat analizu
app.get('/lastanalyzes', urlencodedParser, function(req,res){
  // Updateamo tablicu za pregled podataka o stranici
  lastScrapsTable.reloadTable(res);
});
//------------------------------------------------------------------------
