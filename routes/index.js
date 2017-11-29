var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', function (req, res) {
	res.render('home', {
		layout: false
	});
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

// Get dashboard
router.get('/dashboard', ensureAuthenticated, function (req, res) {
	res.render('dashboard');
});

// Get fonctionnement
router.get('/fonctionnement', function (req, res) {
	res.render('fonctionnement');
});

// Get A propos
router.get('/apropos', function (req, res) {
	res.render('apropos');
});

// GetFAQ
router.get('/faq', function (req, res) {
	res.render('faq');
});


module.exports = router;