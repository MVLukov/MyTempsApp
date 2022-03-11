import { Sequelize } from "sequelize";
import config from "config";

const cr = {
    dbName: config.get("dbName"),
    dbUser: config.get("dbUser"),
    dbPassword: config.get("dbPassword"),
    dbHost: config.get("dbHost"),
    dbDriver: config.get("dbDriver"),
    // dbPort: config.get("dbPort")
};

const connection = new Sequelize(cr.dbName, cr.dbUser, cr.dbPassword, {
    host: cr.dbHost,
    dialect: cr.dbDriver,
    // port: cr.dbPort
});

export default connection;
