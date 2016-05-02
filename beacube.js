var noble = require('noble');
var express = require('express');
var UserBeacon = require("./UserBeacon")

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
    if(userBLE[peripheral.uuid]!=null){
    	userBLE[peripheral.uuid].updateRSSI(peripheral.rssi);
    	//console.log('Update RSSI by ' + peripheral.uuid + ": " + peripheral.rssi);
    }
    else{
    	console.log('DISCOVERED UUID: ' + peripheral.uuid);
      userBLE[peripheral.uuid] = new UserBeacon(peripheral.uuid, peripheral.rssi, "Nome beacon");
    }  
});

/* Remove discovered beacon that no longer appear */
var BeaconCleaner = setInterval(function(){
  var timestamp = Date.now();
  for (var item in userBLE) {
    var ble = userBLE[item];
    if(ble!=null && (timestamp-ble.last)>2){
      console.log('DELETED UUID: ' + item);
  	 delete userBLE[item];
    }
  }
}, TIME_TO_LIVE*60*1000);


/********************
*   RESTful API     *
*********************/
var rest = express();

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
	res.json(userBLE[req.params.uuid].getJson());
});

/* Returns json object of nearest beacon...*/
rest.get('/nearest', function(req, res) {
	var min = null;
	for (var item in userBLE) {
    var current = userBLE[item];
    if((min!=null && current.distance < min.distance) || min==null)
      min=current;
	}
	res.json(min.getJson());
});

var server = rest.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("REST server listening at http://%s:%s", host, port)
});


/********************
*    Web Server     *
*********************/
var web = express();
web.use('/admin', express.static(__dirname + '/admin'));
var webserver = web.listen(80, function () {
  var host = webserver.address().address
  var port = webserver.address().port
  console.log("Web App listening at http://%s:%s", host, port)
});