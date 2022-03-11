import dbConn from "../connection.js";
import { DataTypes } from "sequelize";

let temps = dbConn.define(
  "temps",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    temp: {
      type: DataTypes.FLOAT,
    },
    hum: {
      type: DataTypes.FLOAT,
    },
    feelsLike: {
      type: DataTypes.FLOAT,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    time: {
      type: DataTypes.TIME,
    },
    flag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    updatedAt: false,
    createdAt: false,
  }
);

export default temps;
