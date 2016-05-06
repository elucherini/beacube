
var client = new $.RestClient('http://localhost:8081/');
client.add('beacons');
client.add('nearest');

var res, nearest;

setInterval(function() {
	bl = client.beacons.read();
	
	bl.always(function(data) {	
		$('#beacon-list').empty();
		
		var appendText = '';
		if (bl.responseText !== '[]') {
			var jResponse = bl.responseJSON;
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
	nearest = client.nearest.read();
	
	nearest.always(function(data) {		
		$('#nearest-beacon').empty();
		
		var appendText = '';
		if (nearest.responseText !== '') {
			var jResponse = nearest.responseJSON;
			appendText += '<p>';
			appendText += '<b>UUID:</b> ' + jResponse.uuid + '<br>';
			appendText += '<b>Distance:</b> ' + jResponse.distance + '<br>';
			appendText += '<b>User:</b> ' + jResponse.user + '<br>';
			appendText += '<b>Trigger zone:</b> ' + jResponse.triggerzone;
			appendText += '</p>';
		}
		else
			appendText = "No beacons connected";
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