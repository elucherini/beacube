var client = new $.RestClient('/');

if (window.location.search !== "") {
	client.add('triggerlist', { url: 'group/triggerlist' });
	var triggerList = client.triggerlist.read();
	
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
						$.post("/group/subscribe/",{name: box.val()});
					}
					else if (!box.attr('checked')) {
						//UNSUBSCRIBE
						$.post("group/unsubscribe/",{name: box.val()});
					}
				});
			}
		}
		else {
			var text = "No triggers available";
			$('#triggerlist').append(text);
		}
		
	});
}