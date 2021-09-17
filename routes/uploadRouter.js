const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

// customizing multer's storage 
// pass diskStorage an object with config settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // cb = callback()
        cb(null, 'public/images'); // null = no error, 2nd argument: path to save files
    },
	// make sure file name on server matches the name of file on client side 
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

// only allow specific file types to be uploaded
const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true); // no error, allow image to be uploaded
};
// multer module is now configured to allow image uploads
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

// creating the router
const uploadRouter = express.Router();

// configure routes for image uploads
uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
	// multer has passed control to the next middleware. Meaning image has succcesfully uploaded
	res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
	// multer adds the file object  as a property of the res object
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;