var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Vente = require('../models/vente');
var User = require('../models/user');

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
router.get('/:id', ensureAuthenticated, function (req, res) {
	var id = req.params.id;
	Vente.getVenteByURL(id, function (err, vente) {
		if (err)
			res.render('/');
		console.log(vente);
		res.render('vente-view', {
			vente: vente
		});
	})
});

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

// Get new vente
router.post('/new', ensureAuthenticated, function (req, res) {
	req.body.emailAcheteur = req.user.email;
	var data = req.body;
	var url = makeid();

	var newVente = new Vente({
		emailAcheteur: data.emailAcheteur,
		emailVendeur: data.emailVendeur,
		numeroTel: data.numeroTel,
		adresseLivraison: data.adresseLivraison,
		montantVente: data.montantVente,
		montantLivraison: data.montantLivraison,
		montantTotal: data.montantTotal,
		state: "NEWBYACHETEUR",
		url: url
	});

	Vente.createVente(newVente, function (err, vente) {
		if (err) throw err;
		console.log(vente);
	});

	res.redirect('/ventes/' + url)
});

module.exports = router;