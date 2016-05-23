var gpio = require('rpi-gpio');

function Led(direction){
	gpio.setup(7, gpio.DIR_OUT, ()=>{
		var state = false;
		if(direction == 'in')
			state = true;
		gpio.write(7, state, function(err) {
			if(err) console.log("[LED] " + err);
		});
	});
};

module.exports = Led;