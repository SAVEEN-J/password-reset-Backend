require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { log, error } = require("./utlis/logger");
const { URI, PORT } = require("./utlis/config");
const usersRouter = require("./Controller/usersRoutes");


app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);

mongoose
  .connect(URI)
  .then(() => {
    log("Connected to Mongo DB");
  })
  .catch((err) => {
    error("Error connecting to MongoDB",error.message);
  });

app.get("/", (req, res) => {
  res.send("<h1>Password Reset</h1>");
});

app.use(usersRouter);

module.exports = app;
