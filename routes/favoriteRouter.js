const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorites');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorite.find({user: req.user._id})
	.populate('User')
	.populate('Campsites')
	.then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
	.catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
// does the user have a 'favorite' document?
	Favorite.findOne({user: req.user._id })
		.then(favdoc => {
			// Yes:if it does exist
			console.log('favdoc:\n', favdoc);
			console.log('req.body:\n', req.body);
			console.log('req.user:\n', req.user);
			if(favdoc) {
				// do any campsite objectId's from request.body NOT match objectId's from user's favorite.campsites?
				req.body.forEach(campsite  => {
					if(!favdoc.campsites.indexOf(campsite) == -1) {
						console.log(campsite);
						favdoc.campsites.push(campsite);
					}
					else {
						res.setHeader("Content-Type", "application/json");
						res.json("That campsite is already in the list of favorites!");
					}
				});
				favdoc.save()
				.then(saveddoc => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(saveddoc);
				})
				.catch(err => next(err));
			}
			else { // user does not have a fav doc yet
				Favorite.create({user: req.user._id, campsites: req.body})
				.then(favorite => {
					console.log('Favorite Created ', favorite);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				})
				.catch(err => next(err));
			}				
		})
		.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
    res.end('PUT operation is not supported');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOneAndDelete({user: req.user._id})
	.then(fav => {
		res.statusCode = 200;
		if(fav) {
			res.setHeader('Content-Type', 'application/json');
			res.json(fav);
		} else {
			res.setHeader('Content-Type', 'application/json');
			res.end('You do not have any favorites to delete.');
		}
	})
});


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
    res.end('GET operation is not supported.');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({user: req.user._id})
	.then(favdoc => {
		if (favdoc){
			if(!favdoc.campsites.includes(req.params.campsiteId)) {
				favdoc.campsites.push(req.params.campsiteId);
				favdoc.save()
				.then(savedFav => {
					res.status= 200;
					res.setHeader("Content-Type", "application/json");
					res.json(savedFav);
				}).catch(err => next(err));
			}
			else {
				res.setHeader("Content-Type", "application/json");
				res.json("That campsite is already in the list of favorites!");
			}
		} 
		else {
			Favorite.create({user: req.user._id, campsites: req.params.campsiteId})
			.then(favorite => {
				console.log('Favorite Created ', favorite);
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(favorite);
			})
			.catch(err => next(err));
		}
	}).catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
    res.end('PUT operation is not supported');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({ user: req.user._id })
	.then(favdoc => {
		console.log("favdoc:\n", favdoc);
		if(favdoc) {
			console.log("req.params:\n", req.params);
			const campsiteToDelete = req.params.campsiteId;
			favdoc.campsites.splice(favdoc.campsites.indexOf(campsiteToDelete), 1);
			favdoc.save()
			.then(saveddoc => {
				if(saveddoc) {
					res.setHeader('Content-Type', 'application/json');
					res.json(saveddoc);
				} else {
					res.setHeader('Content-Type', 'application/json');
					res.end('You do not have any favorites to delete.');
				}
			})
			.catch(err => next(err));
		}
	}).catch(err => next(err));
})




// use indexOf to find the index of the campsite in the favorites.campsites array
// store the result from above into a const variable called result
// use slice to remove the campsite at the specific index from the Campsites array in the favorites document




// configure routes for image uploads
// uploadRouter.route('/')
// .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
// .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     res.statusCode = 403;
//     res.end('GET operation not supported on /imageUpload');
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
	// multer has passed control to the next middleware. Meaning image has succcesfully uploaded
	// res.statusCode = 200;
    // res.setHeader('Content-Type', 'application/json');
	// multer adds the file object  as a property of the res object
    // res.json(req.file);
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    // res.statusCode = 403;
    // res.end('PUT operation not supported on /imageUpload');
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    // res.statusCode = 403;
    // res.end('DELETE operation not supported on /imageUpload');
// });

module.exports = favoriteRouter;