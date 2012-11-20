var fs = require("fs");

(function(context) {
	
	context.bootstrap = function(mop) { mop.register(new Server(), "Config server"); };

	function Server() {

		var config;
		var I = { receive: {}, send: {} };

		I.receive.configuration = function(configuration) { config = configuration; };

		I.receive.clientTemplatesGET = function(req, res) {
			fs.readdir(config.clientRoot + "/tmpl", function(err, files) {
				var ret = [];
				for(var i = 0; i < files.length; i++) {
					ret.push(files[i].substring(0, files[i].length - 14));
				}
				res.send(ret);
			});
		};

		I.receive.clientScriptsGET = function(req, res) {
			fs.readdir(config.clientRoot + "/js/src", function(err, files) {
				var ret = [];
				for(var i = 0; i < files.length; i++) {
					if(files[i]!=="main.js")
						ret.push("/js/src/" + files[i]);
				}
				res.send(ret);
			});
		};

		return I;
	}

})(module.exports);