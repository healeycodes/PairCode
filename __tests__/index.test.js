/*
 * index.test.js
 * Basic tests for models. Can be built out later.
 */
describe('models/index', () => {
    it('Returns the Room model', () => {
        const models = require('../models')
        expect(models.Room).not.toBeUndefined()
    })
})
