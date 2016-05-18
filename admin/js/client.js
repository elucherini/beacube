
var client = new $.RestClient('/');
client.add('beacons');
client.add('nearest');
client.add('triggerlist');

var list, nearest, triggers;
var appendTriggers = '';

setInterval(function() {
	// print list of beacons
	list = client.beacons.read();
	
	list.always(function() {	
		$('#beacon-list').empty();
		
		var appendCode = '';
		if (list.responseText !== '[]') {
			var jResponse = JSON.parse(list.responseText);
			for (var i in jResponse) {
				triggers = client.triggerlist.read(jResponse[i].uuid);
				
				triggers.always(function() {
					appendTriggers = '';
					if (triggers.responseText !== '[]') {
						var jTriggers = JSON.parse(triggers.responseText);
						for (var j in jTriggers) {
							if (jTriggers[j].subscribed === "yes") {
								appendTriggers += jTriggers[j].name + " ";
							}
						}
					}
					if (appendTriggers === '')
						appendTriggers = "No triggers";
				});
				
				console.log(appendTriggers);
				appendCode += '<table>';
					appendCode += '<tr>';
						appendCode += '<th>User</th>';
						appendCode += '<td>';
							appendCode += (jResponse[i].user != null)? jResponse[i].user : jResponse[i].uuid + '(not registered)';
						appendCode += '</td>';
					appendCode += '</tr>';
					appendCode += '<tr>';
						appendCode += '<th>Trigger zone</th>';
						appendCode += '<td>';
							appendCode += jResponse[i].triggerzone;
						appendCode += '</td>';
					appendCode += '</tr>';
					appendCode += '<tr>';
						appendCode += '<th>Triggers</th>';
						appendCode += '<td>';
							appendCode += appendTriggers;
						appendCode += '</td>';
					appendCode += '</tr>';
					appendCode += '<tr>';
						appendCode += '<th>Distance</th>';
						appendCode += '<td>';
							appendCode += jResponse[i].distance;
						appendCode += '</td>';
					appendCode += '</tr>';
				appendCode += '</table>';
				
				appendCode += '<a href="settings.html?uuid=' + jResponse[i].uuid + '" class="btn btn-primary">Settings</a>';
			}
		}
		else
			appendCode = "No beacons connected";
		$('#beacon-list').append(appendCode);
	});
	// print nearest beacon
	nearest = client.nearest.read();
	
	nearest.always(function(/*data*/) {		
		$('#nearest-beacon').empty();
		
		var appendCode = '';
		var jResponse = JSON.parse(nearest.responseText);
		
		if (nearest.responseText !== '') {
				appendCode += '<table>';
					appendCode += '<tr>';
						appendCode += '<th>User</th>';
						appendCode += '<td>';
							appendCode += (jResponse.user !== null)? jResponse.user : jResponse.uuid + ' (not registered)';
						appendCode += '</td>';
					appendCode += '</tr>';
				appendCode += '</table>';
				
				appendCode += '<a href="settings.html?uuid=' + jResponse.uuid + '" class="btn btn-primary">Settings</a>';
		}
		else
			appendCode = "No beacons connected";
		$('#nearest-beacon').append(appendCode);
		
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