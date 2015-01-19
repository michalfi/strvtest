/* global describe it before after */

var request = require('supertest'),
    app = require('../app'),
    config = require('../config'),
    Account = require('../lib/Account'),
    azure = require('azure-storage');

describe('POST /photos', function() {
    var sampleAccount = new Account({email: 'joe@example.com', password: 'whatever'});
    var sampleContactId = 'person1234';
    it('uploads the photo', function(done) {
        request(app)
            .post('/photos')
            .set('Authorization', 'Bearer ' + sampleAccount.accessToken())
            .query({contactId: sampleContactId})
            .attach('photo', './README.md')
            .expect(201)
            .expect('location', /.*/)
            .end(function(err, res) {
                if (err) throw err;
                var blobSvc = azure.createBlobService(config.photoStorage.accountName, config.photoStorage.accountKey);
                blobSvc.deleteBlob(config.photoStorage.container, sampleContactId, function(err, response) {
                    if (err) throw err;
                    done();
                });
            });
    });
    it('refuses without a token', function(done) {
        request(app)
            .post('/photos')
            .expect(401, done);
    });
    it('refuses with a garbage token', function(done) {
        request(app)
            .post('/photos')
            .set('Authorization', 'Bearer garbage')
            .expect(401, done);
    });
    it('refuses when not multipart', function(done) {
        request(app)
            .post('/photos')
            .query({contactId: sampleContactId})
            .set('Authorization', 'Bearer ' + sampleAccount.accessToken())
            .expect(400, done);
    });
    it('refuses when contactId is missing', function(done) {
        request(app)
            .post('/photos')
            .set('Authorization', 'Bearer ' + sampleAccount.accessToken())
            .attach('photo', './README.md')
            .expect(400, done);
    });
});