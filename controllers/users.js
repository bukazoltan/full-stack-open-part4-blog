const userRouter = require("express").Router();
const { request, response, next } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const bcrypt = require("bcrypt");

userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  response.json(users);
});

userRouter.post("/", async (request, response, next) => {
  const body = request.body;
  if (body.password.length < 3) {
    return response
      .status(400)
      .send({ error: "The password was not long enough" });
  }
  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();
  return response.json(savedUser);
});

module.exports = userRouter;
