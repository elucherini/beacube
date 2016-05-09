var client = new $.RestClient('http://localhost:8082/');

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
			/*
		$.ajax({
			url: 'http://localhost:8082/beacons/'+uuid,
			type: 'post',
			data: {
				"username": newName,
				"triggerzone": newTrigger
			},
			headers: {
				'content-type': 'application/json'       //If your header name has spaces or any other char not appropriate
				//"Header Name Two": 'Header Value Two'  //for object property name, use quoted notation shown in second
			},
			dataType: 'json',
			success: function (data) {
				alert("SUCCESS");
			}
		});*/
			
		var json = { username: newName, triggerzone: newTrigger };
		//json = JSON.stringify(json);
		var validate = client.post.create(json);
		console.log(JSON.stringify(json));
		
		validate.success(function(data) {		// confirms success (always() NOT RIGHT TBH)
			$('#settings').append('<span>Changes saved</span>');
		});
		
	});
}