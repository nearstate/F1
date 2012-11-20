(function(context) {
	
	context.bootstrap = function(mop) { mop.register(new Server(), "Published forms server"); };

	function Server() {

		var I = { receive: {}, send: {} };
		I.send.getForm = function(formId, callback){};
		I.send.putPublished = function(item, callback){};
		I.send.listPublishedForms = function(){};

		I.receive.publishedPOST = function(req, res) {
			var data = "";
			req.on("data", function(chunk) {
				data += chunk;
			}).on("end", function() {
				publishForm(data, res);
			});
		};

		I.receive.publishedGET = function(req, res) {
			if(req.params.hasOwnProperty("formId")) {
				getFormById(req, res);
			} else {
				listPublishedForms(req, res);
			}
		};

		return I;

		function listPublishedForms(req, res) {
			I.send.listPublishedForms(function(data) {
				var ret = { items: [] };
				for(var d in data) {
					ret.items.push({
						name: data[d].name,
						version: data[d].version,
						key: data[d].key
					});
				}
				res.send(ret);
			});
		}

		function publishForm(data, res) {
			var item = JSON.parse(data);
			if(!item.hasOwnProperty("form")) throw new Error("No form found");
			if(!item.hasOwnProperty("name")) throw new Error("No name found");
			I.send.putPublished(item, function(err) {
				if(err) {
					res.send(err, 500);
				} else {
					res.send(item, 201);
				}
			});
		}

		function putFormById(formId, payload, res) {
			I.send.putForm(formId, payload, function(err) {
				if(err) {
					res.send(err, 500);
				} else {
					res.send(payload, 201);
				}
			});
		}
	}

})(module.exports);