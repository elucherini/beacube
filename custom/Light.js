var gpio = require('rpi-gpio');

function Light(direction){
	if(direction=='in'){
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

};

module.exports = Light;