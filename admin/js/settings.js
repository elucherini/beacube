var client = new $.RestClient('/');

if (window.location.search !== "") {
	var uuid = window.location.search.replace("?uuid=", "");
	
	client.add('beacons', { url: 'beacons/'+uuid });
	client.add('triggerlist', { url: 'triggerlist/'+uuid });
	var currBeacon = client.beacons.read();
	var triggerList = client.triggerlist.read();
	
	currBeacon.always(function() {		// sets current username and trigger zone
		var currName = currBeacon.responseJSON.user,
			currTrigger = currBeacon.responseJSON.triggerzone;
		if (currName != null)
			$('#name-bar').attr('placeholder', currName);
		if (currTrigger != null)
			$('.range-slider__range').attr('value', currTrigger);
	});
	
	triggerList.always(function() {
		var appendCode = '';
		if (triggerList.responseText !== '[]') {
			var jResponse = triggerList.responseJSON;
			for (var i in jResponse) {
				appendCode += '<div class="checkbox">';
				appendCode += '<label> <input type="checkbox" value="' + jResponse[i].name + '"';
				if (jResponse[i].subscribed === "yes")
					appendCode += ' checked';
				appendCode += '>';
				appendCode += jResponse[i].name;
				appendCode += '</label> </div>';
			}
		}
		else
			appendCode = "No triggers available";
		$('#triggerlist').append(appendCode);
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