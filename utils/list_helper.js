var _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return _.sumBy(blogs, (o) => {
    return o.likes;
  });
};

const favoriteBlog = (blogs) => {
  const compare = (a, b) => {
    if (a.likes < b.likes) {
      return 1;
    }
    if (a.likes > b.likes) {
      return -1;
    }
    return 0;
  };
  return blogs.sort(compare)[0];
};

const mostBlogs = (blogs) => {
  // Make an object with key-value pairs (authors - amount of blogs) - it can be useful later
  let blogsByAuthor = {};
  blogs.forEach((blog) => {
    if (!(blog.author in blogsByAuthor)) {
      blogsByAuthor[blog.author] = 1;
    } else {
      blogsByAuthor[blog.author] += 1;
    }
  });

  // Convert the object into an array and sort it
  sortable = _.toPairsIn(blogsByAuthor);

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  // return a formatted object according to specifications
  return {
    author: sortable[0][0],
    blogs: sortable[0][1],
  };
};

const mostLikes = (blogs) => {
  // summarize likes by author
  const likesByAuthor = {};
  blogs.forEach((blog) => {
    if (!(blog.author in likesByAuthor)) {
      likesByAuthor[blog.author] = blog.likes;
    } else {
      likesByAuthor[blog.author] += blog.likes;
    }
  });
  // Convert the object into an array and sort it
  let sortable = [];
  for (let author in likesByAuthor) {
    sortable.push([author, likesByAuthor[author]]);
  }
  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });

  // return a formatted object according to specifications
  return {
    author: sortable[0][0],
    likes: sortable[0][1],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
