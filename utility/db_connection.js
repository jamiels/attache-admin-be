const { Sequelize } = require("sequelize");

console.log(process.env.LOCAL_DB);
const sequelizeConnection = new Sequelize(process.env.LOCAL_DB);

const synchronizeDatabaseTables = async sequelizeInstance => {
  console.log("Database sync");
  await sequelizeInstance.sync({ force: true });
};

const checkDatabaseConnection = async sequelizeInstance => {
  try {
    await sequelizeInstance.authenticate();
    console.info(sequelizeInstance.getDatabaseName());
    console.info("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// synchronizeDatabaseTables(sequelizeConnection);

module.exports = {
  sequelizeConnection,
  synchronizeDatabaseTables,
  checkDatabaseConnection,
};
