var noble = require('noble');
var express = require('express');
var UserBeacon = require("./UserBeacon")

userBLE = [];

/********************
*   Noble Setup     *
*********************/
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([],true);
    console.log('\nBLE scanning...');
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
    if(userBLE[peripheral.uuid]!=null){
    	userBLE[peripheral.uuid].updateRSSI(peripheral.rssi);
    	//console.log('Update RSSI by ' + peripheral.uuid + ": " + peripheral.rssi + "(" + userBLE[peripheral.uuid].calculateDistance() + ")");
    }
    else{
    	console.log('DISCOVERED UUID: ' + peripheral.uuid);
      userBLE[peripheral.uuid] = new UserBeacon(peripheral.uuid, peripheral.rssi, "Nome beacon");
    }  
});

/* Remove discovered beacon that no longer appear */
var BeaconCleaner = setInterval(function(){ //not exaustively tested
  var timestamp = Date.now();
  for (var item in userBLE) {
    var ble = userBLE[item];
    if(ble!=null && (timestamp-ble.last)>2)
      //userBLE[ble.uuid]=null;
  	 delete userBLE[item];
  }
}, 3*60*1000); //3 min*/



/********************
*   RESTful API     *
*********************/
var rest = express();
// respond with "hello world" when a GET request is made to the homepage
rest.get('/hello', function(req, res) {
  res.send('Welcome to Beacube!');
});

rest.get('/beacons', function(req,res){
	var result = [];
	for (var item in userBLE) {
    var ble = userBLE[item];
    //result.push({ uuid: ble.uuid, rssi: ble.rssi, username: ble.username,  last: ble.last,  distance: ble.distance });
    result.push(ble);
  }
	res.json(result);
});

var server = rest.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("App listening at http://%s:%s", host, port)
});