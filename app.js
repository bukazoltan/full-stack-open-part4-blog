const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const blogsRouter = require("./controllers/blogs");
const config = require("./utils/config");
const logger = require("./utils/logger");
mongoose.connect(
  config.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      logger.error("Error connecting to mongodb");
    } else {
      logger.info("Connected to mongodb");
    }
  }
);

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogsRouter);

module.exports = app;
