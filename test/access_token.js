/* global describe it before after */

var request = require('supertest'),
    app = require('../app'),
    Account = require('../lib/Account');
    
describe('GET /access_token', function() {

    var testAccount = new Account({email: 'joe@example.com', password: 'secret'});
    before(function addTestingAccount(done) {
        testAccount.register(done);
    });
    after(function removeTestingAccount(done) {
        testAccount.remove(done);
    });
    it('gives token with proper credentials', function(done) {
        request(app)
            .get('/access_token')
            .query({email: testAccount.data.email, password: testAccount.data.password})
            .expect(200, done);
    });
    it('refuses for unknown user', function(done) {
        request(app)
            .get('/access_token')
            .query({email: 'anonymous@somewhere.io', password: 'whatever'})
            .expect(403, done);
    });
    it('refuses for bad password', function(done) {
        request(app)
            .get('/access_token')
            .query({email: testAccount.data.email, password: 'notthesecret'})
            .expect(403, done);
    });
});