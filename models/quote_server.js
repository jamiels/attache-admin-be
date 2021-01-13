const { Model, DataTypes } = require("sequelize");
const { sequelizeConnection } = require("../utility/db_connection");

const QUOTESERVER = sequelizeConnection.define(
  "QUOTESERVER",
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
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelizeConnection,
    modelName: "QUOTESERVER",
    timestamps: true,
    createdAt: "CREATED_DT",
    updatedAt: false,
    createdOn: false,
  },
);
module.exports = QUOTESERVER;
