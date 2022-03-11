import express from "express";
import config from "config";
import dailyRouter from "./router/api.daily.js";
import fnRouter from "./router/frontend.js";
import monthlyRouter from "./router/api.monthly.js";
import dbConn from "./connection.js";

import temps from "./models/temps.model.js";
import avgDailyTemps from "./models/avgDailyTemps.model.js";
import avgMonthlyTemps from "./models/avgMonthlyTemps.model.js";
import { fn, col, Op } from "sequelize";

import dayjs from "dayjs";
dayjs().locale("bg");

const app = express();
const port = config.get("port");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/daily", dailyRouter);
app.use("/api/monthly", monthlyRouter);
app.use("/", fnRouter);

async function start() {
  try {
    await dbConn.authenticate();
    console.log("DB connected!");
    // temps.sync({ alter: true });
    // avgDailyTemps.sync({ alter: true });
    // avgMonthlyTemps.sync({ alter: true });

    app.listen(port, () => {
      console.log("Server is running on port: ", port);
    });
  } catch (error) {
    console.log(error);
  }
}

start();

async function setAvgDaily() {
  let startOfDay = dayjs().locale("bg").subtract(1, "day").startOf("day").format("YYYY-MM-DD");
  let endOfDay = dayjs().locale("bg").subtract(1, "day").endOf("day").format("YYYY-MM-DD");

  let data = await temps.findAndCountAll({
    attributes: [
      [fn("AVG", col("temp")), "temp"],
      [fn("AVG", col("hum")), "hum"],
      [fn("AVG", col("feelsLike")), "feelsLike"],
      "date",
    ],
    where: {
      flag: false,
      date: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay
      }
    },
    group: ["date"],
    order: [
      ["date", "ASC"]
    ],
    raw: true,
  });

  if (data.count.length > 0) {
    data = data.rows[0];
    temps.update({ flag: true }, { where: { date: data.date } });
    avgDailyTemps.create(data);
  }
}

async function setAvgMonthly() {
  let monthToday = dayjs().locale("bg").format("MM");
  let monthYesterday = dayjs().locale("bg").subtract(1, "day").format("MM");

  if (monthToday !== monthYesterday) {
    let startOfMonth = dayjs().locale("bg").subtract(1, "month").startOf("month").format("YYYY-MM-DD");
    let endOfMonth = dayjs().locale("bg").subtract(1, "month").endOf("month").format("YYYY-MM-DD");

    let data = await avgDailyTemps.findAndCountAll({
      attributes: [
        [fn("AVG", col("temp")), "temp"],
        [fn("AVG", col("hum")), "hum"],
        [fn("AVG", col("feelsLike")), "feelsLike"]
      ],
      where: {
        flag: false,
        date: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        },
      },
      raw: true,
    });


    if (data.count.length > 0) {
      data = data.rows[0];

      avgMonthlyTemps.create({
        temp: data.temp,
        hum: data.hum,
        feelsLike: data.feelsLike,
        date: dayjs(startOfMonth).format("YYYY-MM-DD")
      });

      console.log(`startOfMonth: ${startOfMonth} - endOfMonth: ${endOfMonth}`);

      avgDailyTemps.update({ flag: true }, {
        where: {
          date: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth
          }
        }
      });
    }
  }
}

setInterval(async () => {
  await setAvgDaily();
  await setAvgMonthly();
}, 10 * 10 * 1000);
