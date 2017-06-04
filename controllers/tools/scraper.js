var cheerio = require('cheerio');
var request = require('request');
var mysql = require('../mysql'); // Includamo mysql.js da mozemo slati querije

//-----------------------------------------------------------------------------
// Funkcija za scrappanje stranice
var scrapURL = function(url, redirect, res) {
    console.log('Varijabla redirect: ' + redirect);
    console.log('STATUS: ' + res.statusCode);
    var statCode = res.statusCode;

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
        time: ""
    };

    // Tu pocinje scrappanje cheerio loada body url-a koji je unesen
    request(url, function(error, response, body) {
        console.log(response.statusCode);
        console.log('Error: ' + error);
        //Body se loada u cheerio module
        var $ = cheerio.load(body);


        // Ukoliko postoji error ispisujemo ga
        if (error) {
            console.log("ERROR [#3] [Cannot analyze given URL]");
        }

        if ((statCode >= 301 && statCode <= 400) && redirect === undefined) {

            DeniedRedirScrape(data, url, response, $);


        } //ovdje završava if
        else {

            BaseScrape(data, url, response, $);

        // Dio za spremanje u bazu, prvo stvaramo osnocni query
        MainQuery(data, $);

        // Reloadamo korisniku tablicu zadnjih analiza
        res.render('index', {content: 'tools/scraper.ejs'});
    }


});
};
//-----------------------------------------------------------------------------





// Underneath the hood
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
var BaseScrape = function(data, url, response, $){
    console.log('Nije poslan redirect.');

    // Ucitavamo podatke od stranice i sortiramo ih u "data" varijablu
    data.url = url;
    data.http_status = response.statusCode;
    data.con_length = response.headers['content-length'];
    data.con_type = response.headers['content-type'];
    data.server = response.headers['server'];

    data.title = $('title').text();
    data.charset = response.headers['Accept-Charset'];

    data.date = require('moment')().format('YYYY-MM-DD');
    data.time = require('moment')().format('HH:mm:ss');


    // Provjeravamo ako nema settanih vrijednosti stavljamo NULL
    if (data.con_type === undefined) {
        data.con_type = '';
    }
    if (data.server === undefined) {
        data.server = '';
    }
    if (data.title === undefined) {
        data.title = '';
    }
    if (data.con_length === undefined) {
        data.con_length = -1;
    }
    if (data.charset === undefined) {
        data.charset = '';
    }
};

var DeniedRedirScrape = function(data, url, response, $){
    console.log('Poslan je redirect, i prihvacen je.');
    // Ucitavamo podatke od stranice i sortiramo ih u "data" varijablu
    data.url = url;

    data.title = $('title').text();

    data.date = require('moment')().format('YYYY-MM-DD');
    data.time = require('moment')().format('HH:mm:ss');


    // Provjeravamo ako nema settanih vrijednosti stavljamo NULL
    if (data.con_type === undefined) {
        data.con_type = '';
    }
    if (data.server === undefined) {
        data.server = '';
    }
    if (data.title === undefined) {
        data.title = '';
    }
    if (data.con_length === undefined) {
        data.con_length = -1;
    }
    if (data.charset === undefined) {
        data.charset = '';
    }

};

//-----------------------------------------------------------------------------

//QUERIES
//-----------------------------------------------------------------------------
var MainQuery = function(data, $) {
    mysql.sendQuery("INSERT INTO scrap (url,id_user,http_status,con_type,con_length,server,title,charset,date,time) VALUES ( \
      '" + data.url + "', \
      '0', \
      " + data.http_status + ", \
      '" + data.con_type + "', \
      " + data.con_length + ", \
      '" + data.server + "', \
      '" + data.title + "', \
      '" + data.charset + "', \
      '" + data.date + "', \
      '" + data.time + "' \
    );", function(err, rows, fields) {


        headeri($, rows);

    });
};
//-----------------------------------------------------------------------------
// Dodajemo u query sve headere
var headeri = function($, rows) {
    var count = 0;

    $(":header").map(function() {
        var hText = $(this).text(); // Dobivamo text iz headera
        var hValue = headerToValue(this.name); // Dobivamo ID headera (h1,h2...) u vrijednosti (0,1,...)

        hText = checkHeaderText(hText);

        mysql.sendQuery("INSERT INTO headers (id_scrap,head_text,head_value,head_order) VALUES (" + rows.insertId + ",'" + hText + "'," + hValue + "," + count + ");",
            function(){});

        count++;
    });
};

//-----------------------------------------------------------------------------
// Funkcija za povrat vrijednosti h* (h1,h2...) elementa h1 = 0, h2 = 1...
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
        default:
            return -1;
    }
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Funkcija za provjeru teksta u headeru (da se ne spremaju svakakvi znakovi itd...)
var checkHeaderText = function(text) {
    var newText = ''; // Ovdje cemo spremat slovo po slovo novu rijec

    // Ako je text headera duzi od 128 slova skratiti cemo ga i dodati "..."
    if (text.length > 127) {
        text = text.substring(0, 124) + '...';
    }

    // Provjeravamo ako je znak dopusten za spremanje u bazu
    for (var i = 0; i < text.length; i++) {

        // Saljemo text[i] (jedan znak) na provjeru
        revalidCharacter(text[i], function(char) {

            // Ako nije ni false niti true znaci da znak treba zamjeniti
            // sa znakom koji dobijemo natrag ("char")
            if (char != false && char != true) {
                newText += char;

                // Ako je znak vazeci samo ga prepisujemo
            } else if (char == true) {
                newText += text[i];
            }
        });

    }

    return newText;
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Funkcija za provjeru znaka dali je valjan
/* POVRATNE VRIJEDNOSTI:
      false - znak se nece koristiti (brise se)
      true - znak se smije koristiti
      '%' - znak ce se zamjenit sa znakom %
*/
var revalidCharacter = function(char, callback) {
    switch (char) {
        // Brojevi
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
            // Znakovi
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
            // Specijalni znakovi
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
            // Ostalo
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
            // Ukoliko znak nije pronadem znaci da je nedopusten i saljemo false
        default:
            return callback(false);
    }
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Radimo exports
module.exports = {
    scrapURL: scrapURL
};
//-----------------------------------------------------------------------------
