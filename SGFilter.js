var SG = require('ml-savitzky-golay');

var SGFilter = function(polynomial,windowSize){
	this._values = [];
	this._windowSize = windowSize;
	this._polynomial = polynomial;
	this._last = 0;

	this._options = {derivative: 0, windowSize: this._windowSize, polynomial: this._polynomial}
};

SGFilter.prototype.push = function(val){
	this._values.push(val);
	if(this._values.length > this._windowSize){
		this._values.shift();
		this._last = SG(this._values,1,this._options);
	}
	return this._last;
	console.log(this._values);
};

SGFilter.prototype.getLast = function(){
	return this._last;
};


module.exports = SGFilter;
