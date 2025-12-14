const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//@desc Register a user
//@route POST /api/auth/register
//@access public
const register = asyncHandler( async (req,res) => {
    console.log(req.body)
    const {username, email, password} = req.body
    if(!username || !email || !password) {
        res.status(400)
        throw new Error('All fields are mandatory')
    }

    const userAvailable = await User.findOne({email})
    if(userAvailable) {
        res.status(400)
        throw new Error('User already registered!')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    if(user) {
        res.status(201).json({_id: user.id, email: user.email})
    } else {
        res.status(400)
        throw new Error('User data is not valid')
    }
})

//@desc Login a user
//@route POST /api/auth/login
//@access public
const login = asyncHandler( async (req,res) => {
    const {email, password} =  req.body
    if(!email || !password) {
        res.status(400)
        throw new Error('All fields are mandatory!')
    }

    const user = await User.findOne({email})

    if(!user) {
        res.status(404)
        throw new Error('There is no such user')
    }

    if(user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    )
    res.status(200).json({accessToken})
    } else {
        res.status(401)
        throw new Error('Email or password is not valid')
    }
})

module.exports = {
    register,
    login
}