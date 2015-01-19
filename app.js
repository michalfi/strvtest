var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var Firebase = require('firebase');
var busboy = require('connect-busboy');
var azure = require('azure-storage');

var Account = require('./lib/Account');
var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(busboy());

app.get('/ping', function (req, res) {
	res.send('pong');
});

passport.use(new LocalStrategy({ usernameField: 'email'}, function(username, password, done) {
    var acc = new Account({email: username, password: password});
    if (!acc.isValid()) return done(null, false);
    acc.authenticate(function(err, authSucceeded) {
        if (err) return done(err);
        if (!authSucceeded) return done(null, false);
        return done(null, acc);
    });
}));
passport.use(new BearerStrategy(function(token, done) {
    var acc = Account.fromToken(token);
    if (!acc) return done(null, false);
    return done(null, acc);
}));
app.use(passport.initialize());
var forceBearerAuth = passport.authenticate('bearer', { session: false });

app.get('/access_token', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            writeError(res, 'InvalidEmailPassword', 'Specified e-mail / password combination is not valid.', 403);
        } else {
            writeContent(res, {access_token: user.accessToken()});
        }
    })(req, res, next);
});

app.post('/accounts', function(req, res) {
    var acc = new Account(req.body);
    if (!acc.isValid()) return writeError(res, 'InvalidCredentials', 'Invalid email or password');
    acc.register(function(err, registrationSucceeded) {
        if (err) return writeError(res, 'InternalError', 'Account storage error', 500);
        if (!registrationSucceeded) return writeError(res, 'EmailExists', 'Specified e-mail address is already registered.', 403);
        res.status(201).end();
    });
});

app.post('/contacts', forceBearerAuth, function(req, res) {
    var contactData = req.body;
    contactData.owner = req.user.data.email;
    var contactsDb = new Firebase(config.contactsDb);
    var newContact = contactsDb.push();
    newContact.set(contactData, function() {
    res
        .header('location', newContact.toString())
        .status(201)
        .end();
    });
});

app.post('/photos', forceBearerAuth, function(req, res) {
    if (!req.busboy) return writeError(res, 'MultipartExpected', 'Only multipart/form-data request allowed');
    var contact = req.query['contactId'];
    if (!contact) return writeError(res, 'ContactIdMissing', 'ContactId is required');
    var ignore = false;
    req.busboy.on('file', function (fieldname, file, filename) {
        if (ignore) return; // only accept 1 upload
        ignore = true;
        var blobSvc = azure.createBlobService(config.photoStorage.accountName, config.photoStorage.accountKey);
        var blobStream = blobSvc.createWriteStreamToBlockBlob(config.photoStorage.container, contact, function(err, result, response) {
            if (err) return writeError(res, 'InternalError', 'Photo storage error', 500);
            res
                .header('location', blobSvc.getUrl(config.photoStorage.container, contact))
                .status(201).end();
        });
        file.pipe(blobStream);
    });
    req.pipe(req.busboy);
});

var writeError = function(res, errorType, errorDescription, statusCode) {
    writeContent(res, {type: errorType, message: errorDescription}, statusCode || 400);
};

var writeContent = function(res, content, statusCode) {
    res
        .header('content-type', 'application/json')
        .status(statusCode || 200)
        .send(content);
};

module.exports = app;