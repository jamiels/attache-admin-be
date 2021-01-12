const { Model, DataTypes } = require("sequelize");
const { sequelizeConnection } = require("../utility/db_connection");

const User = sequelizeConnection.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isResetTokenValid: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelizeConnection,
    modelName: "User",
    timestamps: true,
    createdAt: "CREATED_DT",
    updatedAt: false,
    createdOn: false,
  },
);

module.exports = User;
