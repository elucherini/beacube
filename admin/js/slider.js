var rangeSlider = function(){
  var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');
  var string = '';
    
  slider.each(function(){

    value.each(function(){
      var value = $(this).prev().attr('value');
  if (value <= 2)
	  string = 'immediate<br>< 2 m';
  else if (value > 2 && value <= 5)
	  string = 'near<br>2~5 m';
  else if (value > 5 && value <= 8)
	  string = 'far<br>5~8 m';
	  $(this).html(string);
    });

    range.on('input', function(){
      var currVal = value.prev().attr('value');
	  if (currVal <= 2)
		  string = 'immediate<br>< 2 m';
	  else if (currVal > 2 && currVal <= 5)
		  string = 'near<br>2~5 m';
	  else if (currVal > 5)
		  string = 'far<br>5~8 m';
		  $(this).html(string);
	
      $(this).next(value).html(string);
    });
  });
};

rangeSlider();