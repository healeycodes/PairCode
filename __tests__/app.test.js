const request = require('supertest')
const app = require('../app.js')

describe('Testing root path', () => {
    test('It should respond to the GET method with code 200', () => {
        return request(app).get('/')
        .expect(200)
    })
})
