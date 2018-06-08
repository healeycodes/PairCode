const request = require('supertest')
const app = require('../app.js')
const models = require('../models')

describe('Testing root path', () => {
    test('It should respond to the GET method with code 200', () => {
        return request(app).get('/')
        .expect(200)
    })
})
