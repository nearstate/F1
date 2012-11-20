var express = require("express");

(function(context) {
	
	context.bootstrap = { init: function(mop) { mop.register(new Router(), "Router"); } };

	function Router(mop) {

		var config = {};

		var I = { receive: {}, send: {} };
		
		I.send.newApp = function(){};
		I.send.logInfo = function(){};

		I.send.formsGET = function(){};
		I.send.formsCloneGET = function(){};
		I.send.formsPUT = function(){};
		I.send.formsDELETE = function(){};
		
		I.send.clientTemplatesGET = function(){};
		I.send.clientScriptsGET = function(){};

		I.send.publishedPOST = function(){};
		I.send.publishedGET = function() { };

		I.send.clonesGET = function() {};
		I.send.clonesDELETE = function() {};
		I.send.clonesPUT = function() {};

		I.receive.configuration = function(configuration) { config = configuration; },

		I.receive.initApp = function() {

			// Application
			var app = express();

			app.all("*", function(req, res, next) {

				I.send.logInfo("\n\n" + req.method, req.originalUrl);

				var originalWriteHead = res.writeHead;
				res.writeHead = function() {
					I.send.logInfo("Writing header", arguments[0], "for request", res.req.url);
					originalWriteHead.apply(res, arguments);
				};

				next();
			});

			app.use(express["static"](config.clientRoot));

			app.get("/config/client/templates", I.send.clientTemplatesGET);
			app.get("/config/client/scripts", I.send.clientScriptsGET);

			app.get("/forms", I.send.formsGET);
			app.get("/forms/:formId", I.send.formsGET);
			app.get("/forms/:formId/clone", I.send.formsCloneGET);
			app.put("/forms/:formId", I.send.formsPUT);

			app.post("/published/", I.send.publishedPOST);
			app.get("/published/", I.send.publishedGET);

			app.get("/clones", I.send.clonesGET);
			app.get("/clones/:cloneId", I.send.clonesGET);
			app.put("/clones/:cloneId", I.send.clonesPUT);

			app.delete("/clones/:cloneId", I.send.clonesDELETE);

			app.delete("/forms/:formId", I.send.formsDELETE);

			I.send.newApp(app);
		};

		return I;
	}

})(module.exports);