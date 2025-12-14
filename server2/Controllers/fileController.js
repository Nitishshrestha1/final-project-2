const asyncHandler = require('express-async-handler')
const File = require('../models/File')
const path = require('path')
const fs = require('fs')

//@desc upload a file
//@route POST /api/files/upload
//@access private
const uploadFile = asyncHandler( async (req,res) => {
    const {privacy} = req.body

    if(!privacy) {
        res.status(400)
        throw new Error('privacy  is required')
    }

    console.log(req.file)
    console.log(privacy)

    const file = req.file
    if(!file) {
        res.status(400)
        throw new Error('File absolutely  is required')
    }

    const fileCheck = await File.findOne({filename: file.filename})
    if(fileCheck) {
        res.status(400)
        throw new Error('File with such name already exists')
    }

    const newFile = await File.create({
        filename: file.originalname,
        path: file.path,
        size: file.size,
        uploaded_by: req.user.id,
        privacy: privacy
    })
    res.status(200).json({message: `${newFile.filename} is successfully uploaded`})
})

//@desc Get my file
//@route GET /api/files/my
//@access private
const getMyFile = asyncHandler( async (req,res) => {
    const myid = req.user.id

    const myFiles = await File.find({uploaded_by: myid})

    if(myFiles) {
        res.status(200).json({myFiles})
    } else {
        res.status(404)
        throw new Error('You have not uploaded any files')
    }
})

//@desc Get public file
//@route POST /api/files/public
//@access public
const getPublicFile = asyncHandler( async (req,res) => {
    const publicFiles = await File.find({privacy: 'public'})

    if(publicFiles) {
        res.status(200).json({publicFiles})
    } else {
        res.status(404)
        throw new Error('There is no public file to share')
    }
})

//@desc Download a file
//@route GET /api/files/:id/download
//@access public
const downloadFile = asyncHandler( async (req,res) => {
    const fileId = req.params.id
    const file = await File.findById(fileId)
    if(!file) {
        res.status(404)
        throw new Error('File not found')
    }

    const filePath = path.resolve(file.path)

    fs.access(filePath, (err) => {
        if(err) {
            res.status(404)
            throw err
        }
    })

    res.status(200).download(filePath, file.filename)
})

//@desc Delete a file
//@route POST /api/files/:id/delete
//@access private
const deleteFile = asyncHandler( async (req,res) => {
    const fileId = req.params.id
    const file = await File.findById(fileId)
    if(!file) {
        res.status(404)
        throw new Error('File not found')
    }

    const filePath = path.join(__dirname,'..','uploads',`${file.filename}`)
    console.log(__dirname)

    await File.findByIdAndDelete(req.params.id)

    fs.unlink(filePath, (err) => {
        if(err) {
            res.status(400)
            throw err
        }
    })

    res.status(200).json({ message: 'File deleted successfully' });
})

module.exports = {
    uploadFile,
    getMyFile,
    getPublicFile,
    downloadFile,
    deleteFile
}