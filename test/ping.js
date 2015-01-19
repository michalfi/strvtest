/* global describe it */

var request = require('supertest'),
    app = require('../app');
    
describe('GET /ping', function() {
    it('returns pong', function(done) {
        request(app)
            .get('/ping')
            .expect(200)
            .expect('pong', done);
    });
});