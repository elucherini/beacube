var Filter = function(window, startVal){
	this._values = [];
	this._winsize = window;
	this._last = startVal;
};

function average(array) {
	var sum = 0, j = 0; 
	for (var i = 0; i < array.length, isFinite(array[i]); i++) { 
    	sum += parseFloat(array[i]); ++j; 
    } 
	return j ? sum / j : 0; 
};

Filter.prototype.push = function(val){
	this._values.push(val);
	if(this._values.length > this._winsize){
		this._values.shift();
		this._last = average(this._values);
	}
	return this._last;
};

Filter.prototype.getLast = function(){
	return this._last;
};


module.exports = Filter;
