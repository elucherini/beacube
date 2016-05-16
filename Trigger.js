var path = require('path'),
	fs = require('fs');


var Trigger = function() {
	this.list = new Array();
};

Trigger.prototype.load = function (params, callback) {		// params = {	folder: '(path)',
															//				subscribe: true	}

	console.log("List: " + this.list);
	//console.log("folder: " + params.folder + ", subscribe: " + params.subscribe);
	//console.log("Current path: " + __dirname);
	fs.readdir(params.folder, function (err, files) {
		if (err == null) {
			for (var item in files) {
				var file = files[item];
				if (file.split(".")[1] !== 'js') {
					console.log("File " + file + " is not a js file!!");
					return;
				}
				var filename = file.split(".")[0].toLowerCase();
				console.log("File " + file + " is a js file. Name: " + filename);
				if (!(filename in this.list)) {
					this.list[filename] = require(path.join('./' + params.folder, filename));
					console.log(filename + " loaded. Require on: " + path.join('./' + params.folder, filename));
					return;
				}
				else {
					console.log(filename + " already here");
					// might have updated the module
					// TODO: clear require cache, require again
				}
				
				if (params.subscribe) {
					console.log("Subscription requested for " + filename);
					callback(filename, this.list[filename]);
				}
			}
		}
		else {
			console.log("Attempting to read files in custom directory. ERROR: " + err);
		}
    });
}

Trigger.prototype.getList = function () {
	return this.list;
};

module.exports = Trigger;