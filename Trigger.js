var path = require('path'),
	fs = require('fs');


var Trigger = function() {
	this.list = new Array();
};

Trigger.prototype.load = function (params, file, callback) {			//	params = {	folder: '(path)',
																		//	subscribe: true	}
															
	if (file.split(".")[1] !== "js") {
		console.log("[TRIGGER] " + file + " is not a .js file or belongs to a subfolder, won't be loaded");
		return;
	}
	var filename = file.split(".")[0];
	
	if (!(filename in this.list)) {
		this.list[filename] = require('./' + params.folder + filename);
		console.log("[TRIGGER] " + filename + " loaded");
	}
	else
		console.log("[TRIGGER] " + filename + " already exists, call update method instead");
	
	if (params.subscribe)
		callback(this.list[filename], filename);
};

Trigger.prototype.delete = function (params, file, callback) {			//	params = {	folder: '(path)',
																		//	unsubscribe: true	}				
	if (file.split(".")[1] !== "js")
		return;
	var filename = file.split(".")[0];
	
	if (filename in this.list) {
		console.log("[TRIGGER] " + "Deleting cache entry for " + filename);
		delete require.cache[require.resolve('./' + params.folder + filename)];
		delete this.list[filename];
		console.log("[TRIGGER] " + filename + " deleted\n");
	}
	else
		console.log("[TRIGGER] " + filename + " is not in the list, won't be deleted");
	
	if (params.unsubscribe)
		callback(filename);
};

Trigger.prototype.update = function (params, file, callback) {			//	params = { folder: '(path)' }				
	if (file.split(".")[1] !== "js")
		return;
	var filename = file.split(".")[0];
	
	if (filename in this.list) {
		console.log("[TRIGGER] " + filename + " changed. Deleting old cache entry...");
		delete require.cache[require.resolve('./' + params.folder + filename)];
		this.list[filename] = require('./' + params.folder + filename);
		console.log("[TRIGGER] " + filename + " updated");
	}
	else
		console.log("[TRIGGER] " + filename + " is not in the list, won't be changed");
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