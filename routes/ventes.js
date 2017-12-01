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
	router.get('/:id([a-zA-Z0-9]{5})', ensureAuthenticated, function (req, res) {
		var id = req.params.id;

		Vente.getVenteByURL(id, function (err, vente) {
			if (err)
				res.render('/');

			else if (vente.state == 'NEWBYVENDEUR' && req.user.email != vente.emailVendeur) {
				res.render('vente-complete-acheteur', {
					vente: vente
				});
			} else if (vente.state == 'NEWBYACHETEUR' && req.user.email != vente.emailAcheteur) {
				res.render('vente-complete-vendeur', {
					vente: vente
				});
			} else if (((vente.state == 'COMPLETED') && vente.statutAcheteur != 'true') || ((vente.state == 'COMPLETED') && vente.statutVendeur != 'true')) {
				if (req.user.email == vente.emailAcheteur) {
					var whoami_complete = true;

					var statut_complete = false;

					if(vente.statutAcheteur == 'true'){
						statut_complete = true;
					}
					res.render('vente-complete-validation', {
						vente: vente, whoami_complete: whoami_complete, statut_complete: statut_complete
					});
				}
				else if (req.user.email == vente.emailVendeur){
					var whoami_complete = false;

					var statut_complete = false;
					if(vente.statutVendeur == 'true'){
						statut_complete = true;
					}

					res.render('vente-complete-validation', {
						vente: vente, whoami_complete: whoami_complete, statut_complete: statut_complete
					});
				}
				else{
					res.redirect('/');
				}
			} else if ((vente.state == 'COMPLETED') && (vente.statutVendeur == 'true' && vente.statutAcheteur == 'true')) {
				if (req.user.email == vente.emailAcheteur) {

					res.render('payer-acheteur', {
						vente: vente
					});
				} else {
					res.render('payer-wait', {
						vente: vente
					});
				}
			} else {
				res.render('vente-wait', {
					vente: vente
				});
			}
		})
	});

	router.post('/:id([a-zA-Z0-9]{5})', ensureAuthenticated, function (req, res) {
		if (req.body.completedata == 'acheteur') {
			var data = req.body;

			var updateVente = {
				emailAcheteur: req.user.email,
				numeroTelAcheteur: data.numeroTel,
				adresseLivraison: data.adresseLivraison,
				montantVente: data.montantVente,
				montantLivraison: data.montantLivraison,
				montantTotal: data.montantTotal,
				state: 'COMPLETED',
			};

			Vente.findOneAndUpdate({
				'url': req.params.id
			}, updateVente, function (err, vente) {
				if (err) return res.send(500, {
					error: err
				});
				console.log("succesfully saved");
				res.redirect('/ventes/' + req.params.id);
			});

		} else if (req.body.completedata == 'vendeur') {
			var data = req.body;

			var updateVente = {
				emailVendeur: req.user.email,
				dateDepotColis: data.datedepotVendeur,
				numeroTelVendeur: data.telVendeur,
				adresseVendeur: data.adresseVendeur,
				state: 'COMPLETED',
			};

			Vente.findOneAndUpdate({
				'url': req.params.id
			}, updateVente, function (err, vente) {
				if (err) return res.send(500, {
					error: err
				});
				console.log("succesfully saved");
				res.redirect('/ventes/' + req.params.id);
			});

		} else if (req.body.validationTransaction == 'validationTransaction') {
			var id = req.params.id;
			Vente.getVenteByURL(id, function (err, vente) {
				if (req.user.email == vente.emailAcheteur) {
					var updateVente = {
						statutAcheteur: 'true',
					};

				} else {
					var updateVente = {
						statutVendeur: 'true',
					};
				}

				Vente.findOneAndUpdate({
					'url': req.params.id
				}, updateVente, function (err, vente) {
					if (err) return res.send(500, {
						error: err
					});
					console.log("succesfully saved");
					res.redirect('/ventes/' + req.params.id);
				});
			});
		}
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

		var state = '';

		if (req.body.whoami == 'acheteur') {
			req.body.emailAcheteur = req.user.email;
			state = "NEWBYACHETEUR";
		}
		if (req.body.whoami == 'vendeur') {
			req.body.emailVendeur = req.user.email;
			state = "NEWBYVENDEUR";
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
			state: state,
			createdTypeBy: data.whoami,
			url: url,
			createdAtFormat: moment().format('Do MMMM  YYYY à HH:mm')
		});

		Vente.createVente(newVente, function (err, vente) {
			if (err) throw err;
			console.log(vente);
		});
		console.log(url);
		res.redirect('/ventes/' + url)
	});

	module.exports = router;