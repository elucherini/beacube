var client = new $.RestClient('/');

if (window.location.search !== "") {		// shows up only when 'uuid' is defined
	var uuid = window.location.search.replace("?uuid=", "");
	
	client.add('beacons', { url: 'beacons/'+uuid });
	client.add('triggerlist', { url: 'triggerlist/'+uuid });
	var currBeacon = client.beacons.read();
	var triggerList = client.triggerlist.read();
	
	currBeacon.always(function() {		// sets current username and trigger zone
		var currName = JSON.parse(currBeacon.responseText).user,
			currTrigger = JSON.parse(currBeacon.responseText).triggerzone;
		if (currName != null)
			$('#name-bar').attr('placeholder', currName);
		if (currTrigger != null)
			$('.range-slider__range').attr('value', currTrigger);
	});
	
	triggerList.always(function() {		// prints trigger list
		if (triggerList.responseText !== '[]') {
			var jResponse = JSON.parse(triggerList.responseText);
			for (var i in jResponse) {				
				var appendCode = '';
				appendCode += '<div class="checkbox"> <label></label></div>';
				var input = '<input type="checkbox" value="' + jResponse[i].name + '"';
				if (jResponse[i].subscribed === "yes")
					input += ' checked';
				input += '>' + jResponse[i].name;
				var appendElem = $(appendCode);
				$('#triggerlist').append(appendElem);
				var inputElem = $(input);
				appendElem.append(inputElem);
				inputElem.click(function() {		// When checkboxes change, sends POST to subscribe to/unsubscribe from trigger
					var box = $(this);
					//console.log(box);
					if (box.attr('checked')) {
						// SUBSCRIBE
						$.post("http://localhost/subscribe/"+uuid,{name: box.val()});
					}
					else if (!box.attr('checked')) {
						//UNSUBSCRIBE
						$.post("http://localhost/unsubscribe/"+uuid,{name: box.val()});
					}
				});
			}
		}
		else {
			var text = "No triggers available";
			$('#triggerlist').append(text);
		}
		
	});
	
	$('#form-settings').submit(function(e) {	// POSTs settings from form
		var newName = $('#name-bar').val(),
			newTrigger = $('.range-slider__range').val();
		
		$.post("http://localhost/beacons/"+uuid,{username: newName,triggerzone: newTrigger});
	});
}