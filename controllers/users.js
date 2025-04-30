const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { error } = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { user: 0 })
    response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
    try {
        const { username, name, password } = request.body

        if (password.length < 3 || username.length < 3) {
            return response.status(400).send({ error: "username and password must be 3 characters or more" }).end()
        }

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = new User({
            username,
            name,
            passwordHash
        })

        const savedUser = await user.save()

        response.status(201).json(savedUser)
    } catch (e) {
        next(e)
    }
})

module.exports = usersRouter