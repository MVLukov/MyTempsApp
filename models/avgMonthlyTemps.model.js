import dbConn from "../connection.js";
import { DataTypes } from "sequelize";

let avgMonthlyTemps = dbConn.define(
  "avgMonthlyTemps",
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
      type: DataTypes.STRING,
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

export default avgMonthlyTemps;
