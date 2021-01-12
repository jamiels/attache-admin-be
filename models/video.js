const { Model, DataTypes } = require("sequelize");
const { sequelizeConnection } = require("../utility/db_connection");

const Video = sequelizeConnection.define(
  "Video",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelizeConnection,
    modelName: "Video",
    timestamps: true,
    createdAt: "CREATED_DT",
    updatedAt: false,
    createdOn: false,
  },
);
module.exports = Video;
