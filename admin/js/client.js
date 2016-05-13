
var client = new $.RestClient('http://127.0.0.1:8082/');
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
				appendText += '<table>';
					appendText += '<tr>';
						appendText += '<th>User</th>';
						appendText += '<td>';
							appendText += (jResponse[i].user != null)? jResponse[i].user : jResponse[i].uuid + '(not registered)';
						appendText += '</td>';
					appendText += '</tr>';
					appendText += '<tr>';
						appendText += '<th>Trigger zone</th>';
						appendText += '<td>';
							appendText += jResponse[i].triggerzone;
						appendText += '</td>';
					appendText += '</tr>';
					appendText += '<tr>';
						appendText += '<th>Distance</th>';
						appendText += '<td>';
							appendText += jResponse[i].distance;
						appendText += '</td>';
					appendText += '</tr>';
				appendText += '</table>';
				
				appendText += '<a href="settings.html?uuid=' + jResponse[i].uuid + '" class="btn btn-primary">Settings</a>';
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
				appendText += '<table>';
					appendText += '<tr>';
						appendText += '<th>User</th>';
						appendText += '<td>';
							appendText += (jResponse[i].user != null)? jResponse[i].user : jResponse[i].uuid + '(not registered)';
						appendText += '</td>';
					appendText += '</tr>';
					appendText += '<tr>';
						appendText += '<th>Trigger zone</th>';
						appendText += '<td>';
							appendText += jResponse[i].triggerzone;
						appendText += '</td>';
					appendText += '</tr>';
					appendText += '<tr>';
						appendText += '<th>Distance</th>';
						appendText += '<td>';
							appendText += jResponse[i].distance;
						appendText += '</td>';
					appendText += '</tr>';
				appendText += '</table>';
				
				appendText += '<a href="settings.html?uuid=' + jResponse[i].uuid + '" class="btn btn-primary">Settings</a>';
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