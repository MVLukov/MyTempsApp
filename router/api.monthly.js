import { Router } from "express";
import avgDailyTemps from "../models/avgDailyTemps.model.js";
import dbConn from "../connection.js"
import { fn, col, Op } from "sequelize";

import dayjs from "dayjs";


const router = Router();

router.get("/getYear", async (req, res) => {
	let data = await dbConn.query(`SELECT DISTINCT date_part('year', "date") as year FROM "avgMonthlyTemps";`);
	data = data[0];
	data = data.map(el => {
		return el.year;
	});
	res.json(data);
});

router.get("/getMonth", async (req, res) => {
	let startOfYear = dayjs().set('year', req.query.year).startOf('year').format("YYYY-MM-DD");
	let endOfYear = dayjs().set('year', req.query.year).endOf('year').format("YYYY-MM-DD");
	let sql = `SELECT DISTINCT date_part('month', "date") as month FROM "avgMonthlyTemps" WHERE "date" >= :startOfYear AND "date" <= :endOfYear;`

	let data = await dbConn.query(sql,{
		replacements: {startOfYear, endOfYear}
	});
	
	data = data[0];
	data = data.map(el => {
		if (el.month < 10) {
			return "0" + el.month;
		} else {
			return `${el.month}`;
		}
	});
	res.json(data.sort().reverse());
});

router.get("/temp", async (req, res) => {
	let splited = req.query.date.split("-");
	if(splited[1] !== 0) splited[1] = splited[1] - 1;
	let startOfMonth = dayjs().locale("bg").set("year",splited[0]).set("month",splited[1]).startOf("month").format("YYYY-MM-DD");
	let endOfMonth = dayjs().locale("bg").set("year",splited[0]).set("month",splited[1]).startOf("month").endOf("month").format("YYYY-MM-DD");

	let data = await avgDailyTemps.findAll({
		where: {
			date: {
				[Op.gte]: startOfMonth,
				[Op.lte]: endOfMonth
			}
		},
		raw: true,
		order: [
			["id", "ASC"]
		]
	});
	res.json(data);
});

router.get("/loadGauge", async (req, res) => {
	let splited = req.query.date.split("-");
	if(splited[1] !== 0) splited[1] = splited[1] - 1;
	let startOfMonth = dayjs().locale("bg").set("year",splited[0]).set("month",splited[1]).startOf("month").format("YYYY-MM-DD");
	let endOfMonth = dayjs().locale("bg").set("year",splited[0]).set("month",splited[1]).startOf("month").endOf("month").format("YYYY-MM-DD");
  
	let data = await avgDailyTemps.findAll({
	  attributes: [
		[fn("AVG", col("temp")), "temp"],
		[fn("AVG", col("hum")), "hum"],
		//[fn("AVG", col("feelsLike")), "feelsLike"],
		"date",
	  ],
	  where: {
		date: {
		  [Op.gte]: startOfMonth,
		  [Op.lte]: endOfMonth
		}
	  },
	  group: ["date"],
	  order: [
		["date", "ASC"]
	  ],
	  raw: true,
	});
	res.json(data);
});

export default router;