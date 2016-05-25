//var KalmanFilter = require('kalmanjs').default;
var Filter = require('./Filter');
var User = require('./User');

const REF_POWER = -61; //usually ranges between -59 to -65

/* ************************ 
*     UserBeacon Class    *
***************************/
var UserBeacon = function(uuid, rssi, username, triggerzone){ //class constructor
	/* Private */
  //this._kalmanFilter = new KalmanFilter({R: 0.00068, Q: 1999.4});
  this._filter = new Filter(40, rssi);  //arg: window size, start value
  /* Public */
  this.uuid = uuid;
  this.rssi = rssi;
	//this.username = username;
  this.user = new User(username, triggerzone);
  this.last = Date.now();
  this.distance = this._computeDistance(rssi);
};


/********* PUBLIC METHODS *******************/
/* ----- getJson ---- */
UserBeacon.prototype.getJson = function(){
  return {uuid: this.uuid, rssi: this.rssi, distance: this.distance, last: this.last, user: this.user.username, triggerzone: this.user.triggerzone};
};

/* ----- updateRSSI ---- */
UserBeacon.prototype.update = function(rssi) {
  this.rssi = rssi;
  this.last = Date.now();
  //this.distance = this._kalmanFilter.filter(this._computeDistance(rssi));
  this.distance = this._computeDistance(this._filter.push(rssi));
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
UserBeacon.prototype._computeDistance = function(rssi) {
  // OLD vers.
  var distance;
  if (rssi == 0) {
    distance = -1; 
  }
  else{
    var ratio = rssi*1.0/REF_POWER;
    if (ratio < 1.0) 
      distance = Math.pow(ratio,10);
    else 
      distance =  (5.3103)*Math.pow(ratio,2.0916) - 4.3325;    
  }
  return distance;

  // Path Loss Model
  /*var n=2;  //decay ratio (usually 2 in indoor)
  var d0 = 2; //reference distance
  var p0 = -67; //rssi @ d0
  return  d0*Math.pow(10,(p0-rssi)/(10*n));*/
};

module.exports = UserBeacon;