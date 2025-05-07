const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

let TOKEN

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
    
        await user.save()

        TOKEN = (await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })
            .expect('Content-Type', /application\/json/)
        ).body.token

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
            .set({ 
                "Authorization": "Bearer " + TOKEN
            })
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
        const initialBlogsDB = await api.get('/api/blogs')
        const blogs = initialBlogsDB.body.map(blog => blog)

        await api
            .delete(`/api/blogs/${blogs[0].id}`)
            .set({ 
                "Authorization": "Bearer " + TOKEN
            })
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
            .set({ 
                "Authorization": "Bearer " + TOKEN
            })
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
            .set({ 
                "Authorization": "Bearer " + TOKEN
            })
            .expect(400)
    })

    test('adding a blog with an invalid token returns status 401', async () => {
        const newBlog = {
            title: "somethingsomething",
            author: "Jane Doe",
            likes: 20
        }

        await api
            .post('/api/blogs')
            .expect(401)
    })
})

after(async () => {
    await mongoose.connection.close()
})