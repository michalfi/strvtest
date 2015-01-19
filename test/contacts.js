/* global describe it before after */

var request = require('supertest'),
    app = require('../app'),
    config = require('../config'),
    Account = require('../lib/Account'),
    Firebase = require('firebase');
    
describe('POST /contacts', function() {
    var sampleContactData = { firstName: 'John', lastName: 'Doe', phone: '555123456' };
    var sampleAccount = new Account({email: 'joe@example.com', password: 'whatever'});
    it('creates a firebase entry', function(done) {
        request(app)
            .post('/contacts')
            .set('Authorization', 'Bearer ' + sampleAccount.accessToken())
            .send(sampleContactData)
            .expect(201)
            .expect('location', /.*/)
            .end(function(err, res) {
                if (err) throw err;
                var contactRef = new Firebase(res.header['location']);
                contactRef.remove();
                done();
            });
    });
    it('refuses without a token', function(done) {
        request(app)
            .post('/contacts')
            .send(sampleContactData)
            .expect(401, done);
    });
    it('refuses with a garbage token', function(done) {
        request(app)
            .post('/contacts')
            .set('Authorization', 'Bearer garbage')
            .send(sampleContactData)
            .expect(401, done);
    });
});