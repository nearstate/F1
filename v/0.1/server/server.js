var jsMop = require("gbL-jsMop"),
	http = require("http"),
	config = require("./config"),
	express = require("express")
	;

var I = { receive: {}, send: {} };

I.send.logInfo = function(){};
I.send.initApp = function(){};
I.send.configuration = function(){};

I.receive.newApp = function(app) {

	// Listen
	var	server = http.createServer(app);
	server.listen(config.port);

	server.addListener("connection", function(stream) {
		stream.setTimeout(config.connectionTimeout);
	});
	server.on("close", function() {
		I.send.logInfo("Terminating");
		process.exit();
	});

	I.send.logInfo("Listening...");

	// Terminate server on key press
	process.stdin.resume();
	process.stdin.once("data", function() { server.close(); });

};

var mop = new jsMop.Mop()
	.register(I, "controller")
	.boot({
		"logger" : require("./logger"),
		"router" : require("./router"),
		"forms server" : require("./formsServer"),
		"persistance" : require("./riakAgent"),
		"config server" : require("./configServer"),
		"published server" : require("./publishedServer")
	});

I.send.configuration(config);
I.send.initApp();



