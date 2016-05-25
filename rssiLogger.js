var Bleacon = require('bleacon');

Bleacon.startScanning();
var rssiData = Array();
const DATASET = 1000;

Bleacon.on('discover', function(bleacon) {
    rssiData.push(bleacon.rssi);
    console.log(bleacon.rssi);
    if(rssiData.length>=DATASET){
    	process.exit(0);
    }
});