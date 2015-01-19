var levelup = require('level');
var config = require('../config');
var bcrypt = require('bcrypt');
var validator = require('validator');
var jwt = require('jwt-simple');

var accountDb = levelup(config.accountDb);

var Account = function(data) {
    this.data = {email: data.email, password: data.password};
};

Account.prototype.data = {};

Account.prototype.isValid = function () {
    return validator.isEmail(this.data.email)
        && validator.isLength(this.data.password, 1);
};

Account.prototype.register = function(callback) {
    var data = this.data;
    accountDb.get(data.email, function(err, value) {
        if (err && !err.notFound) return callback(err);
        if (!err) return callback(null, false); // account already exists
        bcrypt.hash(data.password, 10, function(err, hash) {
            if (err) return callback(err);
            accountDb.put(data.email, hash, function(err) {
                if (err) return callback(err);
                callback(null, true);
            });
        });
    });
};

Account.prototype.authenticate = function(callback) {
    var password = this.data.password;
    accountDb.get(this.data.email, function(err, value) {
        if (err) {
            if (err.notFound) return callback(null, false);
            return callback(err);
        }
        bcrypt.compare(password, value, function(err, res) {
            if (err) return callback(err);
            return callback(null, res);
        });
    });
};

Account.all = function(callback) {
    var accounts = [];
    accountDb.createReadStream()
        .on('data', function (data) {
            accounts.push(data.key);
        })
        .on('end', function() {
            return callback(accounts);
        });
};

Account.prototype.remove = function(callback) {
    accountDb.del(this.data.email, function(err){
        if (err) return callback(err);
        callback();
    });
};

Account.prototype.accessToken = function() {
    return jwt.encode({user: this.data.email}, config.tokenSecret);
};

Account.fromToken = function(token) {
    try {
        var content = jwt.decode(token, config.tokenSecret);
        return new Account({email: content.user, password: '-'});
    } catch(e) {
        return null;
    }
};

module.exports = Account;