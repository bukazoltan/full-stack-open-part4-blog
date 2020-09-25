const blogsRouter = require("express").Router();
const { request, response } = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const SavedBlog = await blog.save();
  user.blogs = user.blogs.concat(SavedBlog._id);
  await user.save();

  return response.status(201).send(SavedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  let blogToBeDeleted = await Blog.findById(request.params.id);
  let userID = decodedToken.id;
  let blogsOwner = String(blogToBeDeleted.user);

  if (blogsOwner === userID) {
    const deletedBlog = await Blog.findByIdAndRemove(request.params.id);
    return response.status(200).send({ message: "deleted" });
  } else {
    return response.status(400).send({ error: "error deleting resource" });
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const updatedInfo = request.body;
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedInfo,
    { runValidators: true, context: "query" }
  );
  if (updatedInfo) {
    response.json(updatedInfo);
    response.status(200);
  } else {
    response.json({ error: "error updating resource" });
    response.status(400).end();
  }
});

module.exports = blogsRouter;
