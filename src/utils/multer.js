import __dirname from '../utils.js'
import multer from 'multer'

//diccionario de carpetas
const fieldToFolder = {
    profileImage: 'profiles/',
    productImage: 'products/',
    document: 'documents/',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = fieldToFolder[file.fieldname] || ''
        const uploadPath = `${__dirname}/../public/uploads/${folderName}` 
        cb(null, uploadPath);
    },
    filename: function(req, file, cb){
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const uploader = multer({
    storage,
    onError: function(err, next) {
        console.log("file upload-img error", err)
        next()
    }
})

export default uploader;