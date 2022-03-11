import { Router } from "express";
import temps from "../models/temps.model.js";
import avgDailyTemps from "../models/avgDailyTemps.model.js";
import avgMonthlyTemps from "../models/avgMonthlyTemps.model.js";
import dbConn from "../connection.js"
import { fn, col, Op } from "sequelize";

import dayjs from "dayjs";
// import "dayjs/locale/bg";

const router = Router();

router.get("/temp", async (req, res) => {
	let startOfDay = dayjs().locale("bg").startOf("day").format("YYYY-MM-DD");
	let endOfDay = dayjs().locale("bg").endOf("day").format("YYYY-MM-DD");

	let data = await temps.findAll({
		where: {
			date: {
				[Op.gte]: startOfDay,
				[Op.lte]: endOfDay
			}
		},
		attributes: ["temp"],
		raw: true,
		order: [
			["id", "ASC"]
		]
	})
	data = data.map(el => {
		return el.temp;
	})
	res.json(data);
})

router.get("/feelsLike", async (req, res) => {
	let startOfDay = dayjs().locale("bg").startOf("day").format("YYYY-MM-DD");
	let endOfDay = dayjs().locale("bg").endOf("day").format("YYYY-MM-DD");

	let data = await temps.findAll({
		where: {
			date: {
				[Op.gte]: startOfDay,
				[Op.lte]: endOfDay
			}
		},
		attributes: ["feelsLike"],
		raw: true,
		order: [
			["id", "ASC"]
		]
	})
	data = data.map(el => {
		return el.feelsLike;
	})
	res.json(data);
})

router.get("/hum", async (req, res) => {
	let startOfDay = dayjs().locale("bg").startOf("day").format("YYYY-MM-DD");
	let endOfDay = dayjs().locale("bg").endOf("day").format("YYYY-MM-DD");

	let data = await temps.findAll({
		where: {
			date: {
				[Op.gte]: startOfDay,
				[Op.lte]: endOfDay
			}
		},
		attributes: ["hum"],
		raw: true,
		order: [
			["id", "ASC"]
		]
	})
	data = data.map(el => {
		return el.hum;
	})
	res.json(data);
})

router.get("/time", async (req, res) => {
	let startOfDay = dayjs().locale("bg").startOf("day").format("YYYY-MM-DD");
	let endOfDay = dayjs().locale("bg").endOf("day").format("YYYY-MM-DD");

	let data = await temps.findAll({
		where: {
			date: {
				[Op.gte]: startOfDay,
				[Op.lte]: endOfDay
			}
		},
		attributes: ["time"],
		raw: true,
		order: [
			["id", "ASC"]
		]
	})
	data = data.map(el => {
		return el.time;
	})
	res.json(data);
})

router.get("/lastTemp", async (req, res) => {
	let startOfDay = dayjs().locale("bg").startOf("day").format("YYYY-MM-DD");
	let endOfDay = dayjs().locale("bg").endOf("day").format("YYYY-MM-DD");

	let data = await temps.findAll({
		where: {
			date: {
				[Op.gte]: startOfDay,
				[Op.lte]: endOfDay
			}
		},
		attributes: ["temp", "id"],
		limit: 1,
		order: [
			["id", "DESC"]
		],
		raw: true
	})
	data = data.map(el => {
		return el.temp;
	})
	res.json(data);
})

router.get("/lastHum", async (req, res) => {
	let startOfDay = dayjs().locale("bg").startOf("day").format("YYYY-MM-DD");
	let endOfDay = dayjs().locale("bg").endOf("day").format("YYYY-MM-DD");

	let data = await temps.findAll({
		where: {
			date: {
				[Op.gte]: startOfDay,
				[Op.lte]: endOfDay
			}
		},
		attributes: ["hum", "id"],
		limit: 1,
		order: [
			["id", "DESC"]
		],
		raw: true
	})
	data = data.map(el => {
		return el.hum;
	})
	res.json(data);
})

router.get("/temps", async (req, res) => {
	let data = await temps.findAll({
		raw: true, order: [
			["date", "DESC"]
		]
	});
	res.json(data);
});


router.get("/save", (req, res) => {
	let date = dayjs().locale("bg").format("YYYY-MM-DD");
	let time = dayjs().locale("bg").format("HH:mm:ss");

	console.log(`Date: ${date} Time: ${time}`);

	let data = {
		temp: req.query.temp,
		hum: req.query.hum,
		feelsLike: req.query.feelsLike,
		date,
		time,
		flag: false,
	};

	try {
		temps.create(data);
	} catch (error) {
		console.log(error);
	}
	res.end();
});

router.get("/update", (req, res) => {
	temps.update({ flag: false }, { where: { flag: true } });
	avgDailyTemps.destroy({ truncate: true });
	res.redirect("/temps");
})

router.get("/getYear", async (req, res) => {
	let data = await dbConn.query(`SELECT DISTINCT date_part('year', "date") as year FROM "temps" AS "temps";`);
	data = data[0];
	data = data.map(el => {
		return el.year;
	})
	res.json(data);
})

router.get("/getMonth", async (req, res) => {
	let startOfYear = dayjs().set('year', req.query.year).startOf('year').format("YYYY-MM-DD");
	let endOfYear = dayjs().set('year', req.query.year).endOf('year').format("YYYY-MM-DD");
	let sql = `SELECT DISTINCT date_part('month', "date") as month FROM "temps" AS "temps" WHERE "date" >= :startOfYear AND "date" <= :endOfYear;`

	let data = await dbConn.query(sql, {
		replacements: {
			startOfYear,
			endOfYear
		}
	});
	data = data[0];
	data = data.map(el => {
		if (el.month < 10) {
			return "0" + el.month;
		} else {
			return `${el.month}`;
		}
	})
	res.json(data.sort().reverse());
})

router.get("/getDay", async (req, res) => {
	if (req.query.month !== 0) req.query.month -= 1;
	let startOfMonth = dayjs().set('year', req.query.year).set('month', req.query.month).startOf('month').format("YYYY-MM-DD");
	let endOfMonth = dayjs().set('year', req.query.year).set('month', req.query.month).endOf('month').format("YYYY-MM-DD");

	let sql = `SELECT DISTINCT date_part('day', "date") as day FROM "temps" AS "temps" WHERE "date" >= :startOfMonth AND "date" <= :endOfMonth;`;

	let data = await dbConn.query(sql, {
		replacements: {
			startOfMonth,
			endOfMonth
		}
	});
	data = data[0];
	data = data.map(el => {
		if (el.day < 10) {
			return "0" + el.day;
		} else {
			return `${el.day}`;
		}
	})
	res.json(data.sort().reverse());
})

router.get("/loadData", async (req, res) => {
	let data = await temps.findAll({
		where: { date: req.query.date },
		raw: true,
		attributes: ["id", "temp", "hum", "feelsLike", "time", "date"],
		order: [
			["id", "ASC"]
		]
	})
	res.json(data);
})

router.get("/loadGauge", async (req, res) => {
	let data = await avgDailyTemps.findAll({
		where: { date: req.query.date },
		raw: true,
		attributes: ["temp", "hum", "feelsLike"],
	})
	res.json(data);
})

export default router;