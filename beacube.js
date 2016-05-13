var noble = require('noble');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var UserBeacon = require("./UserBeacon");
var Datastore = require("./Datastore");

const TIME_TO_LIVE = 3; //minutes

userBLE = Array();

/********************
*   Noble Setup     *
*********************/
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([],true);
    console.log('BLE scanning...\n');
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
    if(userBLE[peripheral.uuid]!=null) {
    	userBLE[peripheral.uuid].update(peripheral.rssi);
		//if (userBLE[peripheral.uuid].distance <= userBLE[peripheral.uuid].user.triggerzone)		// beacon is in triggerzone
		//	userBLE[peripheral.uuid].user.trigger();
    	//console.log('Update RSSI by ' + peripheral.uuid + ": " + peripheral.rssi);
    }
    else{
    	console.log('DISCOVERED UUID: ' + peripheral.uuid);
      userBLE[peripheral.uuid] = new UserBeacon(peripheral.uuid, peripheral.rssi, null, null);
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
*   Triggers DB     *
*********************/
var triggersDB = new Datastore({ filename: 'DB/triggers.db', autoload: true, inMemoryOnly: false });
process.on('saveTrigger', function(trigger){
  triggersDB.insert(trigger);
});


/********************
*   RESTful API     *
*********************/
var rest = express();
rest.use(cors());
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
		//console.log("Values received: " + req.body.username + " " + req.body.triggerzone);
		
		if (req.body.username != null){
			console.log("Username is " + req.body.username );
			userBLE[req.params.uuid].user.setUsername(req.body.username);
    }
		else
			console.log("Username was null");
		if (req.body.triggerzone != null && !isNaN(req.body.triggerzone)){
			console.log("Triggerzone is " + req.body.triggerzone);
			userBLE[req.params.uuid].user.setTriggerzone(req.body.triggerzone);
    }
		else
			console.log("Triggerzone was null");
	}
	res.json(userBLE[req.params.uuid].getJson());
});


var server = rest.listen(8082, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("REST server listening at http://%s:%s", host, port)
});


/********************
*    Web Server     *
*********************/
var web = express();
web.use('/admin', express.static(__dirname + '/admin'));
web.use(cors());

var webserver = web.listen(8000, function () {
  var host = webserver.address().address
  var port = webserver.address().port
  console.log("Web App listening at http://%s:%s", host, port)
});