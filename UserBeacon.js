var KalmanFilter = require('kalmanjs').default;
//var Filter = require('./Filter');
var User = require('./User');
var Bleacon = require('bleacon');

/* ************************ 
*     UserBeacon Class    *
***************************/
var UserBeacon = function(bleacon){ //class constructor
	/* Private */
  this._kalmanFilter = new KalmanFilter({R: 29.5, Q: 400000, A: 1, B: 1, C: 1});
  /* Beacon */
  this.uuid = bleacon.uuid + "-" + bleacon.major + "-" + bleacon.minor;
  //this.major = bleacon.major;
  //this.minor = bleacon.minor;
  this.rssi = this._kalmanFilter.filter(bleacon.rssi);
  this.measuredPower = bleacon.measuredPower;
  this.accuracy = bleacon.accuracy;
  this.proximity = bleacon.proximity;

  //this._filter = new Filter(40, this.rssi);  //arg: window size, start value

	//this.username = username;
  this.user = new User(null, null);
  this.last = Date.now();
  this._computeDistance(this.rssi);
};


/********* PUBLIC METHODS *******************/
/* ----- getJson ---- */
UserBeacon.prototype.getJson = function(){
  return {uuid: this.uuid, rssi: this.rssi, distance: this.distance, proximity: this.proximity, last: this.last, user: this.user.username, triggerzone: this.user.triggerzone};
};

/* ----- updateRSSI ---- */
UserBeacon.prototype.update = function(bleacon) {
  this.rssi = this._kalmanFilter.filter(bleacon.rssi);
  this.measuredPower = bleacon.measuredPower;
  this.accuracy = bleacon.accuracy;
  this.proximity = bleacon.proximity;
  this.last = Date.now();
  //---------
  //this._computeDistance(this._filter.push(this.rssi));
  this._computeDistance(this.rssi);
  this.user.checkTrigger(this.distance);
};

UserBeacon.prototype.subscribeUser = function(trigger, name){
  if (trigger!=null && name!=null) {
      var ok = this.user.subscribe(trigger, name);
      if(ok) process.emit('triggerSubscription', {uuid: this.uuid}, {triggerlist: this.user.getTriggersArray()});
      return ok;
    }
    else
      return false;
};

UserBeacon.prototype.unsubscribeUser = function(triggerName){
  if (trigger!=null) {
      var ok = this.user.unsubscribe(triggerName);
      if(ok) process.emit('triggerSubscription', {uuid: this.uuid}, {triggerlist: this.user.getTriggersArray()});
      return ok;
    }
    else
      return false;
};

UserBeacon.prototype.isSubscribed = function (trigger) {
  return this.user.isSubscribed(trigger);
};

/********** PRIVATE METHODS ******************/
/* ----- calculateDistance ---- */
UserBeacon.prototype._computeDistance = function() {
  // OLD vers.
  var distance;
  if (this.rssi == 0) {
    this.distance = -1; 
  }
  else{
    var ratio = this.rssi*1.0/this.measuredPower;
    if (ratio < 1.0) 
      this.distance = Math.pow(ratio,10);
    else 
      this.distance =  (5.3103)*Math.pow(ratio,2.0916) - 4.3325;    
  }
  return this.distance;

  // Path Loss Model
  /*var n=2;  //decay ratio (usually 2 in indoor)
  var d0 = 2; //reference distance
  var p0 = -67; //rssi @ d0
  return  d0*Math.pow(10,(p0-rssi)/(10*n));*/
};

module.exports = UserBeacon;