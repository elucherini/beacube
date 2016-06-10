//var gpio = require('rpi-gpio');
var Gpio = require('onoff').Gpio,
  led = undefined,
  photoresistor = undefined;

 var lastState = 1;	//1 -> in

 function updateLight(){
 	photoresistor.read(function(err, value){
 		led.write(lastState && (value^1));
 	});
 }

function Light(action){
	switch(action){
		case 'subscribe':
			led = new Gpio(24, 'out');
			photoresistor = new Gpio(4, 'in', 'both');
			photoresistor.watch(function(err, value){
				led.write(lastState && (value^1));
			});
			break;
		case 'in':
			lastState = 1;
			updateLight();
			break;
		case 'out':
			lastState = 0;
			updateLight();
			break;
		case 'unsubscribe':
			if(led) led.unexport();
			if(photoresistor) photoresistor.unexport();
			led = photoresistor = undefined;
			break;
	}

};

module.exports = Light;