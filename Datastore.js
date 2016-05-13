var neDB = require('nedb')

var Datastore = function(params){ ///params example { filename: 'data.db', autoload: true, inMemoryOnly: false })
	this.params = params;
	this.db = new neDB(params);

	this.db.loadDatabase(function (err) {
		if(err==null){
			console.log("Database " + params.filename + " opened!")
		}
		else{
			console.log("Error on database " + params.filename + ":" + err);
		}
	});
};

Datastore.prototype.insert = function(entry) {
	if(entry!=null){
		this.db.insert(entry, function (err) {
			if(err!=null){
				console.log("Error inserting in " + this.params.filename + ": " + err);
			}
		});
	}
}

module.exports = Datastore;