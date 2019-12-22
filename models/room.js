module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Room",
    {
      roomid: DataTypes.STRING,
      html: DataTypes.TEXT,
      css: DataTypes.TEXT,
      js: DataTypes.TEXT
    },
    {}
  );
};
