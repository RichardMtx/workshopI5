var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function (req, res) {
	res.render('register');
});

// Login
router.get('/login', function (req, res) {
	res.render('login');
});

// Register User
router.post('/register', function (req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Votre prénom et votre nom sont requis').notEmpty();
	req.checkBody('email', 'L\'email est requis').notEmpty();
	req.checkBody('email', 'L\'email est requis').isEmail();
	req.checkBody('username', 'Le nom d\'utilisateur est requis').notEmpty();
	req.checkBody('password', 'Le mot de passe est requis').notEmpty();
	req.checkBody('password2', 'Les mots de passe doivent être les mêmes').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		User.createUser(newUser, function (err, user) {
			if (err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'Vous pouvez désormais vous connecter !');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, {
					message: 'Les informations entrées sont incorrectes. Réessayez...'
				});
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {
						message: 'Le mot de passe est incorrect'
					});
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	}),
	function (req, res) {
		res.redirect('/dashboard');
	});

router.get('/logout', function (req, res) {
	req.logout();

	req.flash('success_msg', 'Vous êtes déconnecté');

	res.redirect('/users/login');
});

module.exports = router;