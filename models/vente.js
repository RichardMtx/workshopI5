var mongoose = require('mongoose');

// Vente Schema
var VenteSchema = mongoose.Schema({
	emailAcheteur: {
		type: String
	},
	emailVendeur: {
		type: String
	},
	numeroTelAcheteur: {
		type: String
	},
	numeroTelVendeur: {
		type: String
	},
	adresseLivraison: {
		type: String
	},
	adresseVendeur: {
		type: String
	},
	dateDepotColis: {
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
	createdTypeBy: {
		type: String
	},
	statutAcheteur: {
		type: String
	},
	statutVendeur: {
		type: String
	},
	createdAtFormat: {
		type: String
	}
});

var Vente = module.exports = mongoose.model('Vente', VenteSchema);

module.exports.createVente = function (newVente, callback) {
	newVente.save(callback);
}

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
	}).sort('-_id').exec(callback);
}