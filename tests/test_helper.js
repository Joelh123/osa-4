const Blog = require('../models/blog')

const initialBlogs = [
  {
      title: "Kalat",
      author: "Karppi Koski",
      url: "something.com",
      likes: 3
  },
  {
      title: "Joet",
      author: "Joel Jokinen",
      url: "anything.com",
      likes: 0
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}