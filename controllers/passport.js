var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('./mysql');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        mysql.sendQuery("SELECT * FROM user WHERE id =" + id + ";", function(err, rows){
            done(err, rows[0]);
        });
    });

    // Za registraciju
    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists

            mysql.sendQuery("SELECT * FROM user WHERE username = '" + username + "';", function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false);
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: password
                    };

                    mysql.sendQuery("INSERT INTO user (username, password, email) VALUES ('" + newUserMysql.username + "', '" + newUserMysql.password + "', '" + newUserMysql.email + "');",function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // Login korisnika
    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            mysql.sendQuery("SELECT * FROM user WHERE username = '" + username + "';", function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (password !== rows[0].password)
                    return done(null, false); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};
