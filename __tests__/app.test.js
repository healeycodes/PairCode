/*
 * app.test.js
 * Integration testing for PairCode
 */
const request = require('supertest');
const { app } = require('../app.js');
const { models } = require('../models');

describe('app', () => {

    beforeAll(() => {
        return expect(require('../models').sequelize.sync()).not.toBeUndefined();
    });

    describe('Testing root path', () => {
        test('It should respond to the GET method with code 200', () => {
            return request(app).get('/').expect(200);
        });
    });

    describe('Testing new-room path', () => {
        test('It should forward with code 302', () => {
            return request(app).get('/new-room').expect(302);
        });
    });

    describe('Testing new-room forward', () => {
        test('The URL should contain \'room\'', () => {
            request(app).get('/new-room')
                .then(res => {
                    return expect(res.header.location).toMatch(/room/)
                })
                .catch(err => new Error(err.message));
        });
    });

    describe('Testing room server-side render', () => {
        test('The page should contain the room\'s ID', () => {
            request(app).get('/new-room')
                .then(res => request(app).get(res.header.location))
                .then(roomRes => {
                    return expect(roomRes.text).toMatch(new RegExp(res.header.location.split("/")[2]));
                })
                .catch(err => new Error(err.message));
        });
    });

    describe('Testing database integration', () => {
        beforeAll(() => {
            return require('../models').sequelize.sync();
        });
        beforeEach(() => {
            this.Room = require('../models').Room;
        });
        describe('A room is created during this route', () => {
            it('Creates a Room', () => {
                let initialRes = null;
                request(app).get('/new-room')
                    .then(res => {
                      initialRes = res;
                      request(app).get(res.header.location);
                    })
                    .then(() => this.Room.findOne({
                        where: {
                            roomid: initialRes.header.location.split("/")[2]
                        }
                    }))
                    .then(room => {
                        return expect(room).not.toBeNull();
                    })
                    .catch(err => new Error(err.message));
            });
        });
    });
  
    afterAll(async () => {
      // Wait for verbose SQL logging to complete
      function delay(t, v) {
         return new Promise(function(resolve) { 
             setTimeout(resolve.bind(null, v), t)
         });
      }
      return await delay(5000).then(() => true);
    });
});
