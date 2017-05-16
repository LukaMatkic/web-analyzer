var express = require ('express');
var scrapController = require('./controllers/scrapController.js');

var app = express();

//SET UP TEMPLATE ENGINE
app.set('view engine','ejs');

//STATIC FILES
app.use(express.static('./public'));

//FIRE controllers
scrapController(app);

//LISTEN TO PORT
app.listen(3000);
console.log('You are listening to port 3000');
