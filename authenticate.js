const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
	return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
	new JwtStrategy(
		opts,
		(jwt_payload, done) => {
			console.log('JWT payload: ', jwt_payload);
			User.findOne({_id: jwt_payload._id}, (err, user) => {
				if(err) {
					return done(err, false); // error, no user found
				} else if(user) { // a user document was found
					return done(null, user); //null: no error, return user document
				} else { 
					return done(null, false); // no error, no user found either
				}
			});
		}
	)
);

exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = (req, res, next) => {
	const isAdmin = req.user.admin;
	console.log("isAdmin", isAdmin);
	if(isAdmin){
		next();
	}
	else if(!isAdmin) {
		const err = new Error("You are not authorized to perform this operation!");
		res.statusCode = 403;
		next(err);
	}
	
};