var client = new $.RestClient('/');

if (window.location.search !== "") {
	var uuid = window.location.search.replace("?uuid=", "");
	
	client.add('post', { url: 'beacons/'+uuid });
	var currBeacon = client.post.read();
	
	currBeacon.always(function() {		// sets current username and trigger zone
		var currName = currBeacon.responseJSON.user,
			currTrigger = currBeacon.responseJSON.triggerzone;
		if (currName != null)
			$('#name-bar').attr('placeholder', currName);
		if (currTrigger != null)
			$('.range-slider__range').attr('value', currTrigger);
	});
	
	$('#form-settings').submit(function(e) {	// POSTs settings from form
		var newName = $('#name-bar').val(),
			newTrigger = $('.range-slider__range').val();
		
		$.post("http://localhost/beacons/"+uuid,{username: newName,triggerzone: newTrigger}, function(data){
            if(data==='done')
            {
            	alert("Success");
            }
        });
	});
}