
var client = new $.RestClient('http://131.114.170.108:8082/');
client.add('beacons');
client.add('nearest');

var list, nearest;

setInterval(function() {
	// print list of beacons
	list = client.beacons.read();
	
	list.always(function(data) {	
		$('#beacon-list').empty();
		
		var appendText = '';
		if (list.responseText !== '[]') {
			var jResponse = list.responseJSON;
			for (var i in jResponse) {
				appendText += '<p>';
				appendText += '<b>UUID:</b> ' + jResponse[i].uuid + '<br>';
				appendText += '<b>Distance:</b> ' + jResponse[i].distance + '<br>';
				appendText += '<b>User:</b> ' + jResponse[i].user + '<br>';
				appendText += '<b>Trigger zone:</b> ' + jResponse[i].triggerzone;
				appendText += '</p>';
			}
		}
		else
			appendText = "No beacons connected";
		$('#beacon-list').append(appendText);
});
	// print nearest beacon
	nearest = client.nearest.read();
	
	nearest.always(function(/*data*/) {		
		$('#nearest-beacon').empty();
		
		var appendText = '';
		var jResponse = nearest.responseJSON;
		
		if (nearest.responseText !== '') {
			appendText += '<p>';
			appendText += '<b>UUID:</b> ' + jResponse.uuid + '<br>';
			appendText += '<b>Distance:</b> ' + jResponse.distance + '<br>';
			appendText += '<b>User:</b> ' + jResponse.user + '<br>';
			appendText += '<b>Trigger zone:</b> ' + jResponse.triggerzone;
			appendText += '</p>';
		}
		else
			appendText = "No beacons connected";
		
		if (jResponse.user == null)	
			appendText += '<a href="settings.html?uuid=' + jResponse.uuid + '" class="btn btn-primary">Register</a>';
		$('#nearest-beacon').append(appendText);
		
	});
}, 500);



/*
Basic CRUD Verbs

// C
client.foo.create({a:21,b:42});
// POST /rest/api/foo/ (with data a=21 and b=42)
// Note: data can also be stringified to: {"a":21,"b":42} in this case, see options below

// R
client.foo.read();
// GET /rest/api/foo/
client.foo.read(42);
// GET /rest/api/foo/42/

// U
client.foo.update(42, {my:"updates"});
// PUT /rest/api/42/   my=updates

// D
client.foo.destroy(42);
client.foo.del(42);
// DELETE /rest/api/foo/42/
// Note: client.foo.delete() has been disabled due to IE compatibility
*/