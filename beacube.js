var noble = require('noble');
var express = require('express');
var bodyParser = require('body-parser');
var chokidar = require('chokidar');
var UserBeacon = require("./UserBeacon");
var Datastore = require("./Datastore");
var mDNS = require('mdns');
var Trigger = require ("./Trigger");
var os = require('os');

const TIME_TO_LIVE = 3; //minutes

userBLE = Array();
trigger = new Trigger();

/********************
*   Noble Setup     *
*********************/
function startBLEscan(){	//executed after module dir scan is completed
	noble.startScanning([],true);
	console.log("[BLE scan] started....")
}

noble.on('discover', function(peripheral) {
    if(userBLE[peripheral.uuid]!=null) {
    	userBLE[peripheral.uuid].update(peripheral.rssi);
    	//console.log('Update RSSI by ' + peripheral.uuid + ": " + peripheral.rssi);
    }
    else{ //new beacon
    	console.log('DISCOVERED UUID: ' + peripheral.uuid);
		userBLE[peripheral.uuid] = new UserBeacon(peripheral.uuid, peripheral.rssi, null, null);
		// retrive record from DB
		usersDB.findOne({uuid: peripheral.uuid}, function(res){
	        if(res!=null){
	          console.log("Hello " + res.username);
	          userBLE[res.uuid].user.setUsername(res.username);
	          for(var t in res.triggerlist){
	          	var triggerName = res.triggerlist[t];
	          	userBLE[res.uuid].subscribeUser(trigger.getCode(triggerName), triggerName);
	          }
	          userBLE[res.uuid].user.setTriggerzone(res.triggerzone);
	        }
	        else{
	          console.log("Unknown user..");
	        }
      });
    }  
});

/* Remove discovered beacon that no longer appear */
var BeaconCleaner = setInterval(function(){
  var timestamp = Date.now();
  for (var item in userBLE) {
    var ble = userBLE[item];
    if(ble!=null && (timestamp-ble.last)>TIME_TO_LIVE*60*1000){
      console.log('DELETED UUID: ' + item);
  	 delete userBLE[item];
    }
  }
}, TIME_TO_LIVE*60*1000);


/********************
*   RESTful API     *
*********************/
var rest = express();
//Here we are configuring express to use body-parser as middle-ware.
rest.use(bodyParser.urlencoded({ extended: false }));
rest.use(bodyParser.json());

rest.get('/hello', function(req, res) {
	res.send('Welcome to Beacube!');
});

rest.get('/beacons', function(req,res) {
	var result = [];
	for (var item in userBLE) {
    	var ble = userBLE[item].getJson();
    	result.push(ble);
    }
	res.json(result);
});

/* Returns json object of specified beacon */
rest.get('/beacons/:uuid', function(req, res) {
	if (userBLE[req.params.uuid] != null)
		res.json(userBLE[req.params.uuid].getJson());
	else
		res.send(null);
});

/* Returns json object of nearest beacon...*/
rest.get('/nearest', function(req, res) {
	var min = null;
	for (var item in userBLE) {
    var current = userBLE[item];
    if((min!=null && current.distance < min.distance) || min == null)
      min = current;
	}
	if (min != null)
		res.json(min.getJson());
	else
		res.send(null);
});

/* Edits username and trigger zone */
rest.post('/beacons/:uuid', function(req, res) {
	console.log("POST received");
	//console.log(req.body);
	if (userBLE[req.params.uuid] != null) {
		if (req.body.username != null && req.body.username !== ""){
			console.log("Username is " + req.body.username );
			userBLE[req.params.uuid].user.setUsername(req.body.username);
		}
		if (req.body.triggerzone != null && !isNaN(req.body.triggerzone)){
			console.log("Triggerzone is " + req.body.triggerzone);
			userBLE[req.params.uuid].user.setTriggerzone(req.body.triggerzone);
		}
		// save into the DB
		if(userBLE[req.params.uuid].user!=null){
		  process.emit('userRegistration', {uuid: req.params.uuid}, {uuid: req.params.uuid, username: userBLE[req.params.uuid].user.username, triggerzone: userBLE[req.params.uuid].user.triggerzone, triggerlist: []});
		}
		res.sendStatus(200);
	}
	else
		res.sendStatus(404);
});

rest.post('/subscribe/:uuid', function(req, res) {
	if (req.params.uuid != null && userBLE[req.params.uuid] != null) {
		if (req.body.name in trigger.list) {
			var ok = userBLE[req.params.uuid].subscribeUser(trigger.getCode(req.body.name), req.body.name);
			if (ok) res.sendStatus(200);
			else res.sendStatus(404);
		}
		else
			res.sendStatus(404);
	}
	else
		res.sendStatus(404);
});

rest.post('/unsubscribe/:uuid', function(req, res) {
	if (req.params.uuid != null) {
		if (req.body.name in trigger.list){//userBLE[req.params.uuid].user.triggerlist) {
			var ok = userBLE[req.params.uuid].unsubscribeUser(req.body.name);
			if (ok) res.sendStatus(200);
			else res.sendStatus(404);
		}
		else
			res.sendStatus(404);
	}
	else
		res.sendStatus(404);
});

rest.post('/triggerlist', function(req, res) {		// TODO: FINISH
	if (req.body.url != null) {
		// DOWNLOAD
		
		// IN DOWNLOAD CALLBACK:
		// load new trigger and add it to trigger.list
		//trigger.load({ folder: "custom/", subscribe: req.body.subscribe });
		res.sendStatus(200);
	}
	else
		res.sendStatus(404);
});

rest.get('/triggerlist', function(req,res) {
	var result = [];
	for (var item in trigger.list) {
		result.push({ name: item });
  }
	res.json(result);
});

rest.get('/triggerlist/:uuid', function(req,res) {
	var result = [];
	for (var item in trigger.list) {
		var sub;
		if (req.params.uuid != null && userBLE[req.params.uuid] != null) {
			sub = (userBLE[req.params.uuid].isSubscribed(item))? "yes" : "no";
		}
		else
			sub = "undefined";
		result.push({ name: item, subscribed: sub });
	}
	res.json(result);
});

rest.use('/admin', express.static(__dirname + '/admin'));

var server = rest.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("REST+WEBAPP server listening at http://%s:%s", host, port)
});

/********************
*   Triggers DB     *
*********************/
var triggersDB = new Datastore({ filename: 'DB/triggers.db', inMemoryOnly: false });
process.on('storeTrigger', function(trigger){
  triggersDB.insert(trigger);
});

/********************
*  	  Users DB      *
*********************/
var usersDB = new Datastore({ filename: 'DB/users.db', inMemoryOnly: false });
process.on('userRegistration', function(selector, entry){
	usersDB.upsert(selector, entry);
});
process.on('triggerSubscription', function(selector, entry){
	usersDB.update(selector, entry, false);
});

/********************
*  Trigger Watcher   *
*********************/
var watcher = chokidar.watch('custom/', { ignored: /[\/\\]\./, /*ignored: /.*[^js]$/,*/ persistent: true, depth: 1 });
watcher.on('add', function(path) {
	console.log(path + " has been added!");
	var dir = path.split('/')[0];
	var file = path.split('/')[1];
	if(os.type() == "Windows_NT"){
		dir = path.split('\\')[0];			// Windows
		file = path.split('\\')[1];
	}
	trigger.load({ folder: dir + '/', subscribe: false }, file);
});
watcher.on('unlink', function(path) {
	console.log(path + " has been deleted!");
	var dir = path.split('/')[0];
	var file = path.split('/')[1];
	if(os.type() == "Windows_NT"){
		dir = path.split('\\')[0];			// Windows
		file = path.split('\\')[1];
	}
	trigger.delete({ folder: dir + '/', unsubscribe: true }, file, function(name) {
		for (var item in userBLE)
			userBLE[item].user.unsubscribe(name);
	});
});
watcher.on('change', function(path) {
	console.log(path + " has been changed!");
	var dir = path.split('/')[0];
	var file = path.split('/')[1];
	if(os.type() == "Windows_NT"){
		dir = path.split('\\')[0];			// Windows
		file = path.split('\\')[1];
	}
	trigger.update({ folder: dir + '/', subscribe: false }, file);
});

watcher.on('error', function(error) {
	console.log(error);
});

watcher.on('ready', function(){
	console.log("Module directory scan completed..");
	startBLEscan();
});

/********************
*   Multicast DNS   *
*********************/
console.log("[Multicast DNS] Beacube service advertising...");
var ad = mDNS.createAdvertisement(mDNS.tcp('beacube'), 80);
ad.start();
