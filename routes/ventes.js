var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Vente = require('../models/vente');


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

// Get new vente
router.get('/new', ensureAuthenticated, function (req, res) {
	res.render('vente-new');
});

// Get new vente
router.post('/new', ensureAuthenticated, function (req, res) {
	res.json(req.body);
});

module.exports = router;