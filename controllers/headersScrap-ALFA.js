/// TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/// TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/// TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/// TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/// TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/// TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// NE DIRAJ SANJINE !!!!!!!!!!!!!
// NE DIRAJ SANJINE !!!!!!!!!!!!!
// NE DIRAJ SANJINE !!!!!!!!!!!!!

//    .l.

var bodyParser = require('body-parser');
var mysql = require('mysql');
var cheerio = require('cheerio');
var request = require('request');

//DEFINIRANJE OBJEKTA data KOJEG CEMO KASNIJE KORISTITI DA U NJEGA SPREMIMO SCRAPPANE PODATKE
var data = {
  /* http_status: -1,
  con_length: -1,
  con_type: "",
  server: "",
  title: "",
  date: "",
  time: ""*/
  url: "",
  id_scrap: -1,
  title: "",
  value: -1
};

//CONNECT TO DATABASE
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'analyzer'
});

data.url = "http://www.microsoft.hr/"

request(data.url, function(error, response, html) {

  //ERROR ?
  if(error) {
    console.log("Error: " + error);
  }

  //Loadamo body da mozemo iscitavati headere
  var $ = cheerio.load(html);

 var BlaArray1 = $("div:has(:header)").map(function() {
    return $(this).text();
    }).get();


  for(var i = 0; i < BlaArray1.length; i++) {
      console.log('DIV ------------------------- \n' + BlaArray1[i]);
  }


  connection.query(
    "INSERT INTO scrap (url,http_status,con_type,con_length,server,title,date,time) VALUES ('"+data.url+"','"+data.http_status+"','"+data.con_type+"','"+data.con_length+"','"+data.server+"','"+data.title+"','"+data.date+"','"+data.time+"')",

    function(err) {
    if (!err)
      console.log('MySQL query SUCESSFULL !');
    else
      console.log('MySQL query FAILED !');
    });
});
