/* global describe it before after */

var request = require('supertest'),
    app = require('../app'),
    Account = require('../lib/Account');
    
describe('POST /accounts', function() {

    var testAccount = new Account({email: 'joe@example.com', password: 'secret'});
    before(function addTestingAccount(done) {
        testAccount.register(done);
    });
    after(function removeTestingAccount(done) {
        testAccount.remove(done);
    });
    it('registers a new user', function(done) {
        var newAccount = new Account({email: 'bob@sample.io', password: 'private'});
        request(app)
            .post('/accounts')
            .send(newAccount.data)
            .expect(201)
            .end(function(err, res) {
                if (err) throw err;
                newAccount.remove(done);
            });
    });
    it('refuses for existing user', function(done) {
        request(app)
            .post('/accounts')
            .send(testAccount.data)
            .expect(403, done);
    });
});