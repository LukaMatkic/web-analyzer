var express = require ('express');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var mysql = require('./controllers/mysql'); // Potrebno za mysql querije
var lastScrapsTable = require('./controllers/lastScrapsTable'); // Potrebno za kontrolirati tablicu najnovijih scrapova
var scrapEngine = require('./controllers/scrapEngine'); // Potrebno za scrappati url
var showAnalyze = require('./controllers/showAnalyze'); // Potrebno za osvjeziti alanyze dio

var urlencodedParser = bodyParser.urlencoded({extended:false}); // Pretvaramo http zahtjev

// Namjestamo viwe engine za ejs
app.set('view engine','ejs');

//STATIC FILES
app.use(express.static('./public'));

//------------------------------------------------------------------------------
// Slusamo (listen) port 3000 za daljnje akcije
app.listen(3000);
console.log('\n-------------------[SERVER STATUS]--------------------');
console.log('SERVER STARTED !\n\tYou are listening to port: 3000');
//------------------------------------------------------------------------------


//------------------------------------------------------------------------
// Kada dode na homepage

app.get('/',function(req,res){

  // Updateamo tablicu zadnjih scrapova
  lastScrapsTable.reloadTable(res);

});

//------------------------------------------------------------------------

//------------------------------------------------------------------------
// Kada dode na stranicu za pogledat analizu

app.get('/showAnalyze/:id', urlencodedParser, function(req,res){

  // Updateamo tablicu za pregled podataka o stranici
  showAnalyze.loadScrapID(req.params.id, res);

});

//------------------------------------------------------------------------


//------------------------------------------------------------------------
//  Kada kliknemo na submit button za pocetak scrape-anja URL-a

app.post('/', urlencodedParser, function(req, res){

  // Pokrecemo scrap engine
  scrapEngine.scrapURL(req.body.item, req.body.redirect, res);

});
