//var gpio = require('rpi-gpio');
var Gpio = require('onoff').Gpio,
  led,
  photoresistor;

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
			photoresistor = new Gpio(4, 'in');
			break;
		case 'in':
			var photo = photoresistor.readSync();
			console.log("[PhotoR]" + photo^1 );
			led.write(photo^1);
			break;
		case 'out':
			led.write(0);
			break;
		case 'unsubscribe':
			if(led) led.unexport();
			if(photoresistor) photoresistor.unexport();
			break;
	}

};

module.exports = Light;