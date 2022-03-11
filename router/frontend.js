import { Router } from "express";
import temps from "../models/temps.model.js";
import dayjs from "dayjs";
import path from "path";

const router = Router();

router.get("/", (req, res) => {
  console.log(dayjs().locale("bg").format());
  res.sendFile(path.join(process.cwd(), 'view/index.html'));
});

router.get("/monthly", (req, res) => {
  res.sendFile(path.join(process.cwd(), "view/avg.html"));
})

router.get("/save", (req, res) => {
  let date = dayjs().locale("bg").format("YYYY-MM-DD");
  let time = dayjs().locale("bg").format("HH:mm:ss");

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

export default router;