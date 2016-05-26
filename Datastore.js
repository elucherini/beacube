var neDB = require('nedb')

var Datastore = function(params){ ///params example { filename: 'data.db', autoload: true, inMemoryOnly: false })
	this.params = params;
	this.db = new neDB(params);

	this.db.loadDatabase(function (err) {
		if(err==null){
			console.log("[DB] Database " + params.filename + " opened!")
		}
		else{
			console.log("[DB] Error on database " + params.filename + ":" + err);
		}
	});
};


Datastore.prototype.insert = function(entry) {
	if(entry!=null){
		this.db.insert(entry, function (err) {
			if(err!=null){
				console.log("[DB] Error inserting in " + this.params.filename + ": " + err);
			}
		});
	}
}

/* UpSert -> Update + Insert: try to update, if no entry matches the selector add new */
Datastore.prototype.upsert = function(selector,entry) {
	if(selector!=null && entry!=null){
		this.db.update(selector, entry, {upsert: true}, function (err, numAffected, affectedDocuments, upsert) {
			if(err!=null){
				console.log("[DB] Error upserting in " + this.params.filename + ": " + err);
			}
		});
	}
}

Datastore.prototype.update = function(selector, entry, multiAllowed) {
	if(selector!=null && entry!=null){
		if(multiAllowed==undefined)
			multiAllowed = true;
		this.db.update(selector, { $set: entry }, { multi: multiAllowed}, function (err, numReplaced) {
			if(err!=null){
				console.log("[DB] Error updating in " + this.params.filename + ": " + err);
			}
		});
	}
}


Datastore.prototype.findOne = function(query, callback) {
	if(query!=null){
		this.db.findOne(query, function (err, doc) {
			callback(doc)
		});
	}
}

module.exports = Datastore;