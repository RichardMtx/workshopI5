var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment')
moment.locale('fr')
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

		if (vente.state == 'A compléter' && req.user.email == vente.emailVendeur) {
			res.render('vente-complete-acheteur', {
				vente: vente
			});
		} else {
			res.render('vente-view', {
				vente: vente
			});
		}
	})
});

router.post('/:id([a-zA-Z0-9]{5})', ensureAuthenticated, function (req, res) {

	var data = req.body;

	var updateVente = {
		emailAcheteur: data.emailAcheteur,
		numeroTelAcheteur: data.numeroTel,
		adresseLivraison: data.adresseLivraison,
		montantVente: data.montantVente,
		montantLivraison: data.montantLivraison,
		montantTotal: data.montantTotal,
		state: 'En cours',
	};

	Vente.findOneAndUpdate({
		'url': req.params.id
	}, updateVente, function (err, vente) {
		if (err) return res.send(500, {
			error: err
		});
		console.log("Vente /" + req.params.id + " mise à jour");
		res.redirect('/ventes/' + req.params.id);
	});

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
	if (req.body.whoami == 'acheteur') {
		req.body.emailAcheteur = req.user.email;
	}
	if (req.body.whoami == 'vendeur') {
		req.body.emailVendeur = req.user.email;
	}

	var data = req.body;
	var url = makeid();

	var newVente = new Vente({
		emailAcheteur: data.emailAcheteur,
		emailVendeur: data.emailVendeur,
		numeroTelAcheteur: data.numeroTel,
		adresseLivraison: data.adresseLivraison,
		montantVente: data.montantVente,
		montantLivraison: data.montantLivraison,
		montantTotal: data.montantTotal,
		numeroTelVendeur: data.telVendeur,
		adresseVendeur: data.adresseVendeur,
		dateDepotColis: data.datedepotVendeur,
		state: 'A compléter',
		createdTypeBy: data.whoami,
		url: url,
		createdAtFormat: moment().format('Do MMMM  YYYY à HH:mm')
	});

	Vente.createVente(newVente, function (err, vente) {
		if (err) throw err;
		console.log("Vente /" + url + " créée");
	});

	res.redirect('/ventes/' + url)
});

module.exports = router;