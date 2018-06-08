const request = require('supertest')
const app = require('../app.js')
const models = require('../models')

describe('Testing root path', () => {
    test('It should respond to the GET method with code 200', () => {
        return request(app).get('/').expect(200)
    })
})

describe('Testing new-room path', () => {
    test('It should forward with code 302', () => {
        return request(app).get('/new-room').expect(302)
    })
})

describe('Testing new-room forward', () => {
    test('The URL should contain \'room\'', () => {
        return request(app).get('/new-room')
            .then(res => { expect(res.header.location).toMatch(/room/) })
    })
})

describe('Testing room server-side render', () => {
    test('The page should contain the room\'s ID', () => {
        return request(app).get('/new-room')
            .then(res => {
                return request(app).get(res.header.location)
                    .then(roomRes => { expect(roomRes.text).toMatch(new RegExp(res.header.location.split("/")[2])) })
            })
    })
})