var express = require ('express');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var mysql = require('./controllers/mysql'); // Potrebno za mysql querije
var lastScrapsTable = require('./controllers/lastScrapsTable'); // Potrebno za kontrolirati tablicu najnovijih scrapova
var scrapEngine = require('./controllers/scrapEngine'); // Potrebno za scrappati url

var urlencodedParser = bodyParser.urlencoded({extended:false}); // Pretvaramo http zahtjev

//SET UP TEMPLATE ENGINE
app.set('view engine','ejs');

//STATIC FILES
app.use(express.static('./public'));

//------------------------------------------------------------------------------
// Slusamo (listen) port 3000 za daljnje akcije
app.listen(3000);
console.log("\n\n\n\n\n\n");
console.log('\n-------------------[SERVER STATUS]--------------------');
console.log('SERVER STARTED !\n\tYou are listening to port: 3000');
console.log('\n--------------------[SERVER END]----------------------');
//------------------------------------------------------------------------------


//------------------------------------------------------------------------
// Kada dode na homepage

app.get('/',function(req,res){

  // Updateamo tablicu zadnjih scrapova
  lastScrapsTable.reloadTable(res);

});

//------------------------------------------------------------------------


//------------------------------------------------------------------------
//  Kada kliknemo na submit button za pocetak scrape-anja URL-a

app.post('/', urlencodedParser, function(req, res){

  // Pokrecemo scrap engine
  scrapEngine.scrapURL(req.body.item, res);

});
