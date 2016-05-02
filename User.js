var util = require('util');
var EventEmitter = require('events');

var User = function(username){
	this.username = username;
	
	this.on('trigger', function() {
		//console.log("Trigger!");
  });
};

/* User extends EventEmitter */
util.inherits(User, EventEmitter);

/* Triggers event */
User.prototype.trigger = function() {
  this.emit('trigger');
};

User.prototype.setUsername = function(un) {
	this.username = un;
};

module.exports = User;