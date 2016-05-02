var util = require('util');
var EventEmitter = require('events');

/* ************************ 
*        User Class       *
***************************/

var User = function(username, triggerzone){
	this.username = username;
	this.triggerzone = triggerzone;
	
	this.on('trigger', function() {
		//console.log("Trigger!");
  });
};

/****** PUBLIC METHODS ******/

/* User extends EventEmitter */
util.inherits(User, EventEmitter);

/* trigger */
User.prototype.trigger = function() {
  this.emit('trigger');
};

/* setUsername */
User.prototype.setUsername = function(un) {
	this.username = un;
};

/* getTriggerzone */
User.prototype.getTriggerzone = function() {
	return this.triggerzone;
};

/* setTriggerzone */
User.prototype.setTriggerzone = function(tz) {
	this.triggerzone = tz;
};

module.exports = User;