describe('models/room', () => {
    beforeAll(() => {
        const models = require('../models')
        models.sequelize.sync()
    })

    beforeEach(() => {
        this.Room = require('../models').Room
    })

    describe('Create', () => {
        it('Creates a Room', () => {
            return this.Room.create({ roomid: '123', html: 'a string', css: 'a string', js: 'a string' }).then((room) => {
                expect(room.roomid).toBe('123')
                expect(room.html).toBe('a string')
                expect(room.css).toBe('a string')
                expect(room.js).toBe('a string')
            })
        })
    })
})
