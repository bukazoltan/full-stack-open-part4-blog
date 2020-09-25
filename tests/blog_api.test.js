const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");

const Blog = require("../models/blog");
const User = require("../models/user");
const test_helper = require("./test_helper");
const { blogsInDB } = require("./test_helper");
let testToken = "";
let blogIds = [];

beforeAll(async () => {
  // registering a user
  await User.deleteMany({});
  let testUser = await api.post("/api/users").send(helper.testUser);

  // authenticating user
  let tokenRequest = await api.post("/api/login").send(helper.testUser);
  testToken = tokenRequest.body.token;
});

beforeEach(async () => {
  // cleaning up after the previous test
  await Blog.deleteMany({});
  // adding notes
  for (let note of helper.testData) {
    let noteObject = new Blog(note);
    blogIds.push(noteObject.id);

    await noteObject.save();
  }
});

describe("when there is initially some notes saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("blogs have id instead of _id", async () => {
    let response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });
});
describe("adding new blogs", () => {
  test("new blog can be added", async () => {
    const newTestBlog = {
      title: "Interesting Blog",
      author: "Michael Chan",
      url: "https://interestingblog.com/",
      likes: 7,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send(newTestBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await helper.blogsInDB();
    expect(blogsAfter).toHaveLength(helper.testData.length + 1);
  });

  test("if likes is missing from request, it defaults to 0", async () => {
    const newTestBlogWithoutLikes = {
      title: "More Interesting Blog",
      author: "John Smith",
      url: "https://moreinterestingblog.com/",
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send(newTestBlogWithoutLikes);
    expect(response.body.likes).toBe(0);
  });

  test("if data is incomplete, the server responds with 400", async () => {
    const testBlogWithoutTitle = {
      author: "John Smith",
      url: "https://moreinterestingblog.com/",
    };
    const testBlogWithoutURL = {
      title: "Nice Blog",
      author: "John Smith",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send(testBlogWithoutTitle)
      .expect(400);
    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send(testBlogWithoutURL)
      .expect(400);
  });
});

describe("deleting and updating", () => {
  test("deleting a resource with a specific id", async () => {
    const newTestBlogWithoutLikes = {
      title: "More Interesting Blog",
      author: "John Smith",
      url: "https://moreinterestingblog.com/",
    };

    const newBlogToBeDeleted = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${testToken}`)
      .send(newTestBlogWithoutLikes);

    const idToDelete = newBlogToBeDeleted.body.id;

    await api
      .delete(`/api/blogs/${idToDelete}`)
      .set("Authorization", `Bearer ${testToken}`)
      .expect(200);
  });

  test("updating a resource with a specific id", async () => {
    for (let id in blogIds) {
      let newTestBlog = await Blog.findById(blogIds[id]);
      newTestBlog["likes"] = 8;
      await api.put(`/api/blogs/${blogIds[id]}`).send(newTestBlog).expect(200);
    }
  });
});

afterAll(() => {
  mongoose.connection.close();
});
