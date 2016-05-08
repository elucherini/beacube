var KalmanFilter = require('kalmanjs').default;
var User = require('./User');
var GreenLed = require('./Led');

const MAX_SAMPLES = 30;
const TX_POWER = -59; //usually ranges between -59 to -65

/* ************************ 
*     UserBeacon Class    *
***************************/
var UserBeacon = function(uuid, rssi, username, triggerzone){ //class constructor
	/* Private */
  this._kalmanFilter = new KalmanFilter();
  /* Public */
  this.uuid = uuid;
  this.rssi = rssi;
	//this.username = username;
  this.user = new User(username, triggerzone);
  this.last = Date.now();
  this.distance = this._computeDistance();
};


/********* PUBLIC METHODS *******************/
/* ----- touch ---- */
UserBeacon.prototype.touch = function() {
	this.last = Date.now();
};

/* ----- updateRSSI ---- */
UserBeacon.prototype.updateRSSI = function(rssi) {
  this.rssi = rssi;
  this.touch();
  this.distance = this._kalmanFilter.filter(this._computeDistance(rssi));
};

/* ----- getJson ---- */
UserBeacon.prototype.getJson = function(){
  return {uuid: this.uuid, rssi: this.rssi, distance: this.distance, last: this.last, user: this.user.username, triggerzone: this.user.triggerzone};
};

/********** PRIVATE METHODS ******************/
/* ----- calculateDistance ---- */
UserBeacon.prototype._computeDistance = function(rssi) {
  // OLD vers.
  /*  var distance;
    if (rssi == 0) {
      distance = -1.0; 
    }
    else{
      var ratio = rssi*1.0/TX_POWER;
      if (ratio < 1.0) 
        distance = Math.pow(ratio,10);
      else 
        distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    }
    return distance;
    */

  // Path Loss Model
  var n=2;  //decay ratio (usually 2 in indoor)
  var d0 = 1; //reference distance
  var p0 = -67; //rssi @ d0
  return  d0*Math.pow(10,(p0-rssi)/(10*n));
};

module.exports = UserBeacon;