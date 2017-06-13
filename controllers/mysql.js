// Includamo potrebne libraryje
var express   =    require("express");
var app       =    express();

var mysql = require('mysql'); // Includamo mysql libraty da mozemo koristiti mysql bazu

//-----------------------------------------------------------------------------
// Podatci za connect na mysql bazu
var connection = mysql.createPool({
  connectionLimit : 1000, // Broju korisnika koji se odjednom mogu spojiti, ostali idu u red za cekanje - queue
  host     : 'localhost',
  user     : 'root',
  password : 'lozinka',
  database : 'analyzer',
  debug    : false
});
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Globalna funkcija za slanje querija u bazu i "return" podataka
var sendQuery = function(query, callback) {

    connection.getConnection(function(err, connection) {

        // Ako se ne moze connectirati ispisujemo u konzolu
        if (err) {
          console.log("ERROR [#1] [Cannot connect to database]");
          return callback(err);
        }

        // Saljemo queri u bazu
        connection.query(query, function(err2, rows, fields) {

            connection.release();

            // Ako nema nista od podataka za prikazati
            if(!rows) {
              console.log("WARNING [#1] [No results from query]");
              console.log(err2);
            }

            return callback(err2, rows, fields);

        });

        // Ako se pojavi error prilikom povrata izbaze ispisujemo ga
        connection.on('error', function(err) {
          console.log("ERROR [#2] [No query retured from database]");
          return callback(err);
        });

        // DEBUG - query status
        console.log('\n--------------------[QUERY STATUS]--------------------');
        console.log('CONNECTION ID:\n\t' + connection.threadId);
        console.log('QUERY:\n\t\'' + query +'\'');
        console.log('ERROR:\n\t' + err)
        console.log('------------------[QUERY STATUS END]------------------\n');
  });
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Module.exports aktiviraju da se funkcija moze includati
module.exports = {
  sendQuery: sendQuery
}
//-----------------------------------------------------------------------------
