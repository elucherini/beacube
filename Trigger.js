var path = require('path'),
	fs = require('fs');


var Trigger = function() {
	this.list = new Array();
};

Trigger.prototype.load = function (params, callback) {		// params = {	folder: '(path)',
															//				subscribe: true	}
	var that = this;
	console.log("Loading files from %s...", params.folder);
	
	fs.readdir(params.folder, function (err, files) {
		if (err == null) {
			
			//console.log(files);
			
			for (var item in files) {
				var file = files[item];
				
				if (file.split(".")[1] !== 'js') {
					//console.log("File " + file + " is not a js file!!");
					return;
				}
				
				var filename = file.split(".")[0].toLowerCase();
				//console.log("File " + file + " is a js file. Name: " + filename);
				
				if (filename in that.list) {		// MUST BE TESTED
					console.log(filename + " already here. Deleting cache entry...");
					delete require.cache[require.resolve('./' + params.folder + filename)];
				}
				
				that.list[filename] = require('./' + params.folder + filename);
				console.log(filename + " loaded");
				
				if (params.subscribe) {
					//console.log("Subscription requested for " + filename);
					callback(that.list[filename], filename);
				}
				else {
					//console.log("No subscription requested for " + filename);
				}
				//console.log(filename + " key is " + that.list[filename]);
				//that.list[filename].apply(that, [3]);
			}
		}
		else {
			//console.log("Attempting to read files in custom directory. ERROR: " + err);
		}
    });
}

Trigger.prototype.getList = function () {
	return this.list;
};

module.exports = Trigger;