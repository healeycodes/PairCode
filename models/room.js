module.exports = (sequelize, DataTypes) => {
    var Room = sequelize.define('Room', {
        roomid: DataTypes.STRING,
        html: DataTypes.TEXT,
        css: DataTypes.TEXT,
        js: DataTypes.TEXT
    }, {});
    Room.associate = function(models) {
        // associations can be defined here
    };
    return Room;
};