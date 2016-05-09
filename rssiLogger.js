var noble = require('noble');

var rssiData = Array();

const DATASET = 1000;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([],true);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
    rssiData.push(peripheral.rssi);
    console.log(peripheral.rssi);
    if(rssiData.length>=DATASET){
    	process.exit(0);
    }
});