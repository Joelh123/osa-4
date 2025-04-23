const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)

const Blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
    
        const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
        const promiseArray = blogObjects.map(blog => blog.save())
        await Promise.all(promiseArray)
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const titles = response.body.map(r => r.title)

        assert(titles.includes('Kalat'))
    })

    test('a valid blog can be added', async () => {
        const newBlog = {
            title: "Uusi",
            author: "John Doe",
            url: "google.com",
            likes: 2
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

        const titles = blogsAtEnd.map(b => b.title)
        assert(titles.includes('Uusi'))
    })

    test('a blog can be updated', async () => {
        const initialBlogsDB = await api.get('/api/blogs')
        const blogs = initialBlogsDB.body.map(blog => blog)

        const updatedBlog = {
            title: blogs[0].title,
            author: blogs[0].author,
            url: blogs[0].url,
            likes: blogs[0].likes + 1
        }

        await api
            .put(`/api/blogs/${blogs[0].id}`)
            .send(updatedBlog)
            .expect(201)

        assert((helper.initialBlogs[0].likes + 1) === updatedBlog.likes)
    })

    test('a blog can be deleted', async () => {
        await api
            .delete('/api/blogs/67f8ac479cb3cd6e3bf25233')
            .expect(204)
    })

    test('id is formatted correctly', async () => {
        const response = await api.get('/api/blogs')

        const blogs = response.body.map(blog => Object.keys(blog))
        
        assert(blogs.map(blog => blog.includes("id")))
    })

    test('if likes property is missing, default to 0', async () => {
        const newBlog = {
            title: "Uusi",
            author: "John Doe",
            url: "google.com",
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        const blogs = blogsAtEnd.map(blog => blog)
        assert(blogs.at(-1).likes === 0)
    })

    test('blogs with missing titles or urls return status 400', async () => {
        const newBlog = {
            title: "somethingsomething",
            author: "Jane Doe",
            likes: 20
        }

        await api
            .post('/api/blogs')
            .expect(400)
    })
})

after(async () => {
    await mongoose.connection.close()
})