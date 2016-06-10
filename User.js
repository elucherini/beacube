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
		console.log("[USER] " + this.username + " is IN!");
		this.executeTriggers('in');
		process.emit("storeTrigger", {username: this.username, state: 'in', time: Date.now()});
  	});
	
	this.on('out', function(){
		console.log("[USER] " + this.username + " is OUT!");
		this.executeTriggers('out');
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

User.prototype.forceCurrentState = function(distance) {
	if (this.triggerzone!=null && distance<=this.triggerzone){
		this._state='in';
		this.executeTriggers('in');
	}
	else if(this.triggerzone!=null){
		this._state='out';
		this.executeTriggers('out');
	}
}

User.prototype.executeTriggers = function(action) {
	if (this.triggerlist != undefined) {
		for (var item in this.triggerlist)
			this.triggerlist[item].apply(this, [action]);
	}
}

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
	if (!(name in this.triggerlist)) {
		this.triggerlist[name] = t;
		console.log("[USER] " + this.username + " subscribed to " + name);
		this.triggerlist[name].apply(this, ['subscribe']);
		if(this._state)
			this.triggerlist[name].apply(this, [this._state]);
		return true
	}
	else
		return false;
};

/* unsubscribe to trigger */
User.prototype.unsubscribe = function (name) {
	if (name in this.triggerlist) {
		this.triggerlist[name].apply(this, ['unsubscribe']);
		delete this.triggerlist[name];
		console.log("[USER] " + this.username + " unsubscribed from " + name);
		return true;
	}
	else
		return false;
};

User.prototype.getTriggersArray = function (name) {
	var triggersArray = [];
	for (var t in this.triggerlist) {
		triggersArray.push(t);
  	}
	return triggersArray;
};

User.prototype.isSubscribed = function (trigger) {
	if (trigger in this.triggerlist)
    	return true;
    else
    	return false;	
};

module.exports = User;