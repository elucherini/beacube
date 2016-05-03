
/* ************************ 
*      GreenLed Class     *
***************************/
var GreenLed = function(userin, userout, ledon) {	// class constructor
	this.userin = userin;	// true = user has just entered
	this.userout = userout;	// true = user has just left
	this.ledon = ledon;		// true = on
};

/****** PUBLIC METHODS *****/

/* greenLedOff */
GreenLed.prototype.greenLedOff = function() {
	if (this.ledon /* && this.userout*/)
		ledon = false;
};

/* greenLedOn */
GreenLed.prototype.greenLedOn = function() {
	if (this.ledoff /* && this.userin*/)
		ledon = true;
};

/* getLedStatus */
GreenLed.prototype.getLedStatus = function() {
	return this.ledon;
};



/* ************************ 
*        RedLed Class     *
***************************/
var RedLed = function(userin, userout) {	// class constructor
	this.userin = userin;
	this.userout = userout;
	this.ledon = false;
};

/****** PUBLIC METHODS *****/

/* redLedOff */
RedLed.prototype.redLedOff = function() {
	if (this.ledon /* && this.userout*/)
		ledon = false;
};

/* redLedOn */
RedLed.prototype.redLedOn = function() {
	if (this.ledoff /* && this.userin*/)
		ledon = true;
};

/* getLedStatus */
RedLed.prototype.getLedStatus = function() {
	return this.ledon;
};

module.exports = GreenLed;
module.exports = RedLed;