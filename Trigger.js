var path = require('path'),
	fs = require('fs');


var Trigger = function() {
	this.list = new Array();
};
/*
Trigger.prototype.loadAll = function (params, callback) {		// params = {	folder: '(path)',
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
					continue;
				}
				
				var filename = file.split(".")[0];
				//console.log("File " + file + " is a js file. Name: " + filename);
				
				if (filename in that.list) {		// MUST BE TESTED
					console.log(filename + " already here. Deleting cache entry...");
					delete require.cache[require.resolve('./' + params.folder + filename)];
				}
				
				that.list[filename] = require('./' + params.folder + filename);
				//watcher.add(params.folder + file, { persistent: true, alwaysStat: true });
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
};
*/
Trigger.prototype.load = function (params, file, callback) {			//	params = {	folder: '(path)',
																		//	subscribe: true	}
															
	if (file.split(".")[1] !== "js") {
		console.log(file + " is not a .js file or belongs to a subfolder, won't be loaded\n");
		return;
	}
	var filename = file.split(".")[0];
	
	if (!(filename in this.list)) {
		this.list[filename] = require('./' + params.folder + filename);
		console.log(filename + " loaded\n");
	}
	else
		console.log(filename + " already exists, call update method instead\n");
	
	if (params.subscribe)
		callback(this.list[filename], filename);
};

Trigger.prototype.delete = function (params, file, callback) {			//	params = {	folder: '(path)',
																		//	unsubscribe: true	}				
	if (file.split(".")[1] !== "js")
		return;
	var filename = file.split(".")[0];
	
	if (filename in this.list) {
		console.log("Deleting cache entry for " + filename);
		delete require.cache[require.resolve('./' + params.folder + filename)];
		delete this.list[filename];
		console.log(filename + " deleted\n");
	}
	else
		console.log(filename + " is not in the list, won't be deleted\n");
	
	if (params.unsubscribe)
		callback(filename);
};

Trigger.prototype.update = function (params, file, callback) {			//	params = { folder: '(path)' }				
	if (file.split(".")[1] !== "js")
		return;
	var filename = file.split(".")[0];
	
	if (filename in this.list) {
		console.log(filename + " changed. Deleting old cache entry...");
		delete require.cache[require.resolve('./' + params.folder + filename)];
		this.list[filename] = require('./' + params.folder + filename);
		console.log(filename + " updated\n");
	}
	else
		console.log(filename + " is not in the list, won't be changed\n");
	/*
	if (params.subscribe)
		callback(this.list[filename], filename);
	*/
};

Trigger.prototype.getCode = function (triggerName){
	if(triggerName in this.list)
		return this.list[triggerName];
	else
		return undefined;
};

module.exports = Trigger;