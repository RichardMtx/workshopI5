var mongoose = require('mongoose');

// Vente Schema
var VenteSchema = mongoose.Schema({
	emailAcheteur: {
		type: String
	},
	emailVendeur: {
		type: String
	},
	numeroTel: {
		type: String
	},
	adresseLivraison: {
		type: String
	},
	montantVente: {
		type: String
	},
	montantLivraison: {
		type: String
	},
	montantTotal: {
		type: String
	},
	state: {
		type: String
	},
	url: {
		type: String
	},
	createdAt: {
		type: String
	}
});

var Vente = module.exports = mongoose.model('Vente', VenteSchema);

module.exports.createVente = function (newVente, callback) {
	newVente.save(callback);
}
/* 
module.exports.getVenteByUsername = function (username, callback) {
	var query = {
		username: username
	};
	Vente.findOne(query, callback);
}
 */
module.exports.getVenteById = function (id, callback) {
	Vente.findById(id, callback);
}

module.exports.getVenteByURL = function (url, callback) {
	var query = {
		url: url
	};
	Vente.findOne(query, callback);
}

module.exports.getVentesByEmail = function (email, callback) {
	Vente.find({
		$or: [{
			emailAcheteur: email
		}, {
			emailVendeur: email
		}]
	}, callback);
}