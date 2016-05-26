//var gpio = require('rpi-gpio');
var Gpio = require('onoff').Gpio,
  led,
  photoresistor;

 var lastState = undefined;

function Light(action){
	/*if(direction=='in'){
		// -- PHOTORESISTOR
		gpio.setup(7, gpio.DIR_IN, () =>  {
			gpio.read(7, function(err, value) {
				// -- LED
				console.log("[LIGHT]" + !value);
		       	gpio.setup(18, gpio.DIR_OUT, () => {
					gpio.write(18, !value, function(err) {
						if(err) console.log("[LIGHT] " + err);
					});
				});
		       	// --
		    });
		});
		// --
	} else {
		console.log("[LIGHT] false");
		gpio.setup(18, gpio.DIR_OUT, () => {
			gpio.write(18, false, function(err) {
				if(err) console.log("[LIGHT] " + err);
			});
		});
	}
*/

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
			break;
		case 'out':
			lastState = 0;
			break;
		case 'unsubscribe':
			if(led) led.unexport();
			if(photoresistor) photoresistor.unexport();
			break;
	}

};

module.exports = Light;