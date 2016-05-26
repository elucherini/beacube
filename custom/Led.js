//var gpio = require('pi-gpio');
/*
function Led(direction){
	gpio.setup(16, gpio.DIR_OUT, ()=>{
		var state = false;
		if(direction == 'in')
			state = true;
		gpio.write(16, state, function(err) {
			if(err) console.log("[LED] " + err);
		});
	});
};

module.exports = Led;*/

var Gpio = require('onoff').Gpio,
  led;

function Led(action){
	switch(action){
		case 'subscribe':
			led = new Gpio(23, 'out');
			break;
		case 'in':
			led.write(1);
			break;
		case 'out':
			led.write(0);
			break;
		case 'unsubscribe':
			if(led) led.unexport();
			break;
	}
};

module.exports = Led;
