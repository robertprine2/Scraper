// requiring the connection to the db passing in the username and password 
var db = require('./connection.js');
var encrypto = require('crypto');
var salt = 'salt orsomething';
var password;
var newPass;



module.exports = orm;
