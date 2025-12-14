const express = require('express')
const dotenv = require('dotenv').config()
const fileRoutes = require('./routes/fileRoutes.js')
const authRoutes = require('./routes/authRoutes.js')
const errorHandler = require('./middleware/errorHandler.js')
const connectDB = require('./config/dbConfig.js')
const path = require('path')

connectDB()
const app = express()
app.use(express.json())

app.use(express.static(path.join('..','Client')))

app.use('/api', fileRoutes)
app.use('/api', authRoutes)
app.use(errorHandler)

app.listen(5000, () => {
    console.log('Server is listening at port 5000')
})