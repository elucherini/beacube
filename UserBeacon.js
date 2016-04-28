/* ************************ 
*     UserBeacon Class    *
***************************/
var UserBeacon = function(uuid, rssi, username){ //class constructor
	this.uuid = uuid;
  this.rssi = rssi;
	this.username = username;
  this.last = Date.now();
  this.distance = this._computeDistance();
};

/* ----- calculateDistance ---- */
UserBeacon.prototype._computeDistance = function() {
	var txPower = -59 //usually ranges between -59 to -65
 	if (this.rssi == 0) {
  		this.distance = -1.0; 
	}
  else{
  	var ratio = this.rssi*1.0/txPower;
  	if (ratio < 1.0) {
    	this.distance = Math.pow(ratio,10);
  	}
  	else {
      this.distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    }
  }
};

/* ----- touch ---- */
UserBeacon.prototype.touch = function() {
	this.last = Date.now();
};

/* ----- updateRSSI ---- */
UserBeacon.prototype.updateRSSI = function(rssi) {
  this.rssi = rssi;
  this.touch();
  this._computeDistance();
};

module.exports = UserBeacon;