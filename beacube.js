var Bleacon = require('bleacon');
var express = require('express');
var bodyParser = require('body-parser');
var chokidar = require('chokidar');
var os = require('os');
var sys = require('sys')
var exec = require('child_process').exec;
var mDNS = require('mdns');
var blasterPwm = require('pi-blaster.js');

var UserBeacon = require("./UserBeacon");
var Datastore = require("./Datastore");
var Trigger = require ("./Trigger");

const TIME_TO_LIVE = 1; //minutes

userBLE = Array();
trigger = new Trigger();

/* GROUP */
inCounter = 0;
groupUser = new UserBeacon({uuid: "GRP", major: "0", minor: "0", rssi: -54, measuredPower: -54, accuracy: 1, proximity: 'immediate'});
groupUser.user.setUsername("Group");
groupUser.user.setTriggerzone(100);

/********************
*   Bleacon Setup   *
*********************/
function startBLEscan(){	//executed after module dir scan is completed
	Bleacon.startScanning();
	console.log("[BLE] Scan started....");
};

Bleacon.on('discover', function(bleacon) {
	var uuid = bleacon.uuid + "-" + bleacon.major + "-" + bleacon.minor;
    if(userBLE[uuid]!=null) {
    	userBLE[uuid].update(bleacon);
    }
    else{ //new beacon
    	console.log('[BLE] Discovered uuid: ' + uuid);
		userBLE[uuid] = new UserBeacon(bleacon);
		// retrieve record from DB
		usersDB.findOne({uuid: uuid}, function(res){
	        if(res!=null){
	          console.log("[BLE] Hello " + res.username);
	          userBLE[res.uuid].user.setUsername(res.username);
	          for(var t in res.triggerlist){
	          	var triggerName = res.triggerlist[t];
	          	userBLE[res.uuid].subscribeUser(trigger.getCode(triggerName), triggerName);
	          }
	          userBLE[res.uuid].user.setTriggerzone(res.triggerzone);
	        }
	        else{
	          console.log("[BLE] Unknown user..");
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
      console.log('[BLE] Deleted uuid: ' + item);
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
	//console.log(req.body);
	if (userBLE[req.params.uuid] != null) {
		if (req.body.username != null && req.body.username !== ""){
			console.log("[REST] Registration for" + req.params.uuid + ": " + req.body.username );
			userBLE[req.params.uuid].user.setUsername(req.body.username);
		}
		if (req.body.triggerzone != null && !isNaN(req.body.triggerzone)){
			console.log("[REST] Triggerzone for " + req.params.uuid + ":" + req.body.triggerzone);
			userBLE[req.params.uuid].user.setTriggerzone(req.body.triggerzone);
		}
		//save to DB
		process.emit('userRegistration', {uuid: req.params.uuid}, {uuid: req.params.uuid, username: userBLE[req.params.uuid].user.username, triggerzone: userBLE[req.params.uuid].user.triggerzone, triggerlist: []});
		res.sendStatus(200);
	}
	else
		res.sendStatus(404);
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

rest.get('/group/triggerlist', function(req,res) {
	var result = [];
	for (var item in trigger.list) {
		var sub = (groupUser.isSubscribed(item))? "yes" : "no";
		result.push({ name: item, subscribed: sub });
	}
	res.json(result);
});

rest.post('/group/subscribe', function(req, res) {
	if (req.body.name in trigger.list) {
		var ok = groupUser.subscribeUser(trigger.getCode(req.body.name), req.body.name);
		if (ok) res.sendStatus(200);
		else res.sendStatus(404);
	}
	else
		res.sendStatus(404);
});

rest.post('/group/unsubscribe', function(req, res) {
	if (req.body.name in trigger.list){//userBLE[req.params.uuid].user.triggerlist) {
		var ok = groupUser.unsubscribeUser(req.body.name);
		if (ok) res.sendStatus(200);
		else res.sendStatus(404);
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

rest.get('/log', function(req,res) {
	exec("tail --lines=20 out.log", function (error, stdout, stderr) {
		if (error !== null)
			res.sendStatus(404);
		else{
			res.setHeader('content-type', 'text/plain');
			res.send(stdout);
		}
	});
});

rest.get('/err', function(req,res) {
	exec("tail --lines=20 err.log", function (error, stdout, stderr) {
		if (error !== null)
			res.sendStatus(404);
		else{
			res.setHeader('content-type', 'text/plain');
			res.send(stdout);
		}
	});
});

rest.get('/shutdown', function(req,res) { //pm2 delete beacube; shutdown -h +1;
	exec("shutdown -h +1", function (error, stdout, stderr) {
		if (error !== null)
			res.sendStatus(404);
		else{
			res.sendStatus(200);
			exec("pm2 delete beacube", undefined);
		}
	});
});

/********************
*      RGB LED      *
*********************/
rest.post('/rgb', function(req, res) {
	if (req.body.R != null && req.body.G != null && req.body.B != null) {
		console.log("[RGB LED] (" + req.body.R + ", " + req.body.G + ", " +req.body.B + ")") 
		blasterPwm.setPwm(17, req.body.R); //R
		blasterPwm.setPwm(27, req.body.G); //G
		blasterPwm.setPwm(18, req.body.B); //B
		res.sendStatus(200);
	}
	else
		res.sendStatus(404);
});

rest.use('/admin', express.static(__dirname + '/admin'));

var server = rest.listen(80, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("[REST] server listening...");
  console.log("[WEB] server listening...");
});

/********************
*   Triggers DB     *
*********************/
var triggersDB = new Datastore({ filename: 'DB/triggers.db', inMemoryOnly: false });
process.on('storeTrigger', function(trigger){
  triggersDB.insert(trigger);
  if (trigger.state == 'in'){
  	inCounter++;
  	if(inCounter>1){
  		console.log("Ce ne sono almeno 2! (" + inCounter +")");
  		for (var item in userBLE) {
   			var ble = userBLE[item];
   			ble.executeOut();
  		}
  		groupUser.user.executeTriggers('in');
  	}
  }
  else{
  	inCounter--;
  	if(inCounter<=1){
  		console.log("Una vita di stenti (" + inCounter + ")");
  		for (var item in userBLE) {
   			var ble = userBLE[item];
   			ble.checkTriggerZone();
  		}
  		groupUser.user.executeTriggers('out');
  	}
  }
});

/********************
*  	  Users DB      *
*********************/
var usersDB = new Datastore({ filename: 'DB/users.db', inMemoryOnly: false }, function() {
	usersDB.findOne({uuid: groupUser.uuid}, function(res){
        if(res!=null){
          console.log("[GRP] Load settings ");
          for(var t in res.triggerlist){
          	var triggerName = res.triggerlist[t];
          	groupUser.subscribeUser(trigger.getCode(triggerName), triggerName);
          }
        }
        else{
        	process.emit('userRegistration', {uuid: groupUser.uuid}, {uuid: groupUser.uuid, username: groupUser.user.username, triggerzone: groupUser.user.triggerzone, triggerlist: []});
        }
    });
});
process.on('userRegistration', function(selector, entry){
	usersDB.upsert(selector, entry);
});
process.on('triggerSubscription', function(selector, entry){
	usersDB.update(selector, entry);
});

/********************
*  Trigger Watcher   *
*********************/
var watcher = chokidar.watch('custom/', { ignored: /[\/\\]\./, /*ignored: /.*[^js]$/,*/ persistent: true, depth: 1 });
watcher.on('add', function(path) {
	console.log("[WATCHER] " + path + " has been added!");
	var dir = path.split('/')[0];
	var file = path.split('/')[1];
	if(os.type() == "Windows_NT"){
		dir = path.split('\\')[0];			// Windows
		file = path.split('\\')[1];
	}
	trigger.load({ folder: dir + '/', subscribe: false }, file);
});
watcher.on('unlink', function(path) {
	console.log("[WATCHER] " + path + " has been deleted!");
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
	console.log("[WATCHER] " + path + " has been changed!");
	var dir = path.split('/')[0];
	var file = path.split('/')[1];
	if(os.type() == "Windows_NT"){
		dir = path.split('\\')[0];			// Windows
		file = path.split('\\')[1];
	}
	trigger.update({ folder: dir + '/', subscribe: false }, file);
});

watcher.on('error', function(error) {
	console.log("[WATCHER] " + error);
});

watcher.on('ready', function(){
	console.log("[WATCHER] Module directory scan completed..");
	startBLEscan();
});

/********************
*   Multicast DNS   *
*********************/
console.log("[Multicast DNS] Beacube service advertising...");
var ad = mDNS.createAdvertisement(mDNS.tcp('beacube'), 80);
ad.start();
