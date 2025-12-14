const express = require('express')
const router = express.Router()
const {
    uploadFile,
    getMyFile,
    getPublicFile,
    downloadFile,
    deleteFile
} = require('../Controllers/fileController')
const upload = require('../utils/uploadFile')
const authintication = require('../middleware/authMiddleware')

// router.use(authintication)

router.post('/files/upload',authintication,upload.single('file'), uploadFile)

router.get('/files/my',authintication, getMyFile)

router.get('/files/public', getPublicFile)

router.get('/files/:id/download', downloadFile)

router.delete('/files/:id/delete', deleteFile)

module.exports = router