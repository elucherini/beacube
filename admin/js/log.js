var client = new $.RestClient('/');
client.add('log');

setInterval(function() {
	var logData = client.log.read();
	logData.always(function() {
		//$("#log-textarea").val(JSON.stringify(logData));
		var logResponseText = logData["responseText"];
		//var logText = logResponseText.replace("\n", "<br />");
		$("#log-textarea").val(logResponseText);
	});
}, 1000);