var util = require('util');
var EventEmitter = require('events').EventEmitter;

/* ************************ 
*        User Class       *
***************************/

var User = function(username, triggerzone){ // class constructor
	this.username = username;
	this.triggerzone = triggerzone;
	this.triggerlist = Array();
	this._state = 'out';
	
	this.on('in', function() {
		console.log(this.username + " is IN!");
		process.emit("storeTrigger", {username: this.username, state: 'in', time: Date.now()});
  	});
	
	this.on('out', function(){
		console.log(this.username + " is OUT!");
		process.emit("storeTrigger", {username: this.username, state: 'out', time: Date.now()});
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

/* subscribe to trigger */
User.prototype.subscribe = function (t, name) {
	if (triggerlist[name] == null)
		triggerlist[name] = t;
};

/* unsubscribe to trigger */
User.prototype.unsubscribe = function (name) {
	if (triggerlist[name] != null)
		delete triggerlist[name];
};

/*  */
User.prototype.getSubscriptions = function() {
	return triggerlist;
};

module.exports = User;