var util = require('util');
var EventEmitter = require('events').EventEmitter;

/* ************************ 
*        User Class       *
***************************/

var User = function(username, triggerzone){ // class constructor
	this.username = username;
	this.triggerzone = triggerzone;
	this._state = 'out';
	
	this.on('in', function() {
		console.log(this.username + "is IN!");
		process.emit("saveTrigger", {username: this.username, state: 'in', time: Date.now()});
  	});
	
	this.on('out', function(){
		console.log(this.username + "is OUT!");
		process.emit("saveTrigger", {username: this.username, state: 'out', time: Date.now()});
	});
};

/****** PUBLIC METHODS ******/

/* User extends EventEmitter */
util.inherits(User, EventEmitter);

/* trigger */
User.prototype.checkTrigger = function(distance) {
	if (this.triggerzone!=null && distance<=this.triggerzone){
		if(this._state == null || this._state=='out'){
			this._state='in';
			this.emit('in');
		}
	}
	else if(this.triggerzone!=null && (this._state == null || this._state=='in') ){
		this._state='out';
		this.emit('out');
	}
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
	this.triggerzone = parseFloat(tz);
};

module.exports = User;