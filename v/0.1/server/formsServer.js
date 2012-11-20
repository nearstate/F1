(function(context) {

	context.bootstrap = function(mop) { mop.register(new Server(), "Forms server"); };

	function newUUID() {
		return require("node-uuid").v4();
	}

	function Server() {

		var I = { receive: {}, send: {} };
		I.send.listForms = function(){};
		I.send.putForm = function(formId, payload, callback){};
		I.send.putClone = function(formId, payload, callback){};
		I.send.getForm = function(formId, callback){};
		I.send.deleteForm = function(formId, callback){};
		I.send.listClones = function(){};
		I.send.deleteClone = function(cloneId, callback){};
		I.send.getClone = function(cloneId, callback){};
		
		I.receive.formsGET = function(req, res) {
			if(req.params.hasOwnProperty("formId")) {
				getFormById(req, res);
			} else {
				listForms(req, res);
			}
		};

		I.receive.formsCloneGET = function(req, res) {
			if(!req.params.hasOwnProperty("formId")) {
				throw new Error("No form id to clone");
			} else {
				cloneFormById(req, res);
			}
		};

		I.receive.clonesPUT = function(req, res) {
			var data = "";
			req.on("data", function(chunk) {
				data += chunk;
			}).on("end", function() {
				putCloneById(req.params.cloneId, data, res);
			});
		};

		I.receive.formsPUT = function(req, res) {
			var data = "";
			req.on("data", function(chunk) {
				data += chunk;
			}).on("end", function() {
				putFormById(req.params.formId, data, res);
			});
		};

		I.receive.formsDELETE = function(req, res) {
			if(!req.params.hasOwnProperty("formId")) {
				throw new Error("No form id to delete");
			} else {
				deleteFormById(req.params.formId, res);
			}
		};

		I.receive.clonesDELETE = function(req, res) {
			if(!req.params.hasOwnProperty("cloneId")) {
				throw new Error("No clone id to delete");
			} else {
				deleteCloneById(req.params.cloneId, res);
			}
		};

		I.receive.clonesGET = function(req, res) {
			if(req.params.hasOwnProperty("cloneId")) {
				getCloneById(req, res);
			} else {
				listClones(req, res);
			}
		};

		return I;

		function listClones(req, res) {
			I.send.listClones(function(data) {
				var ret = { items: [] };
				for(var d in data) ret.items.push({ name: data[d] });
				res.send(ret);
			});
		}

		function listForms(req, res) {
			I.send.listForms(function(data) {
				var ret = { items: [] };
				for(var d in data) ret.items.push({ name: data[d] });
				res.send(ret);
			});
		}

		function getFormById(req, res) {
			var formId = req.params.formId;
			I.send.getForm(formId, function(data) {
				var ret = { links: [
					{ "rel" : "self", "href" : req.originalUrl },
					{ "rel" : "clone", "href" : req.originalUrl + "/clone" }
				] };
				ret.item = data;
				res.send(ret);
			});
		}

		function getCloneById(req, res) {
			var cloneId = req.params.cloneId;
			I.send.getClone(cloneId, function(data) {
				var ret = { links: [ ] };
				ret.item = data;
				res.send(200, ret);
			});
		}

		function cloneFormById(req, res) {
			var formId = req.params.formId;
			I.send.getForm(formId, function(data) {
				var newFormId = formId + "-" + newUUID();
				data.parentId = data.key;
				data.key = newFormId;
				I.send.putClone(newFormId, JSON.stringify(data), function(err) {
					if(err) {
						res.send(500, err);
					} else {
						var ret = { links: [ ] };
						ret.item = data;
						res.send(201, ret);
					}
				});
			});
		}

		function putFormById(formId, payload, res) {
			I.send.putForm(formId, payload, function(err) {
				if(err) {
					res.send(500, err);
				} else {
					res.send(201, payload);
				}
			});
		}

		function putCloneById(cloneId, payload, res) {
			I.send.putClone(cloneId, payload, function(err) {
				if(err) {
					res.send(500, err);
				} else {
					res.send(201, payload);
				}
			});
		}

		function deleteFormById(formId, res) {
			I.send.deleteForm(formId, function(err) {
				if(err) {
					if(err.statusCode==404)
						res.send("", 200);
					else
						res.send(err, 500);
				} else {
					res.send("", 200);
				}
			});
		}

		function deleteCloneById(cloneId, res) {
			I.send.deleteClone(cloneId, function(err) {
				if(err) {
					if(err.statusCode==404)
						res.send("", 200);
					else
						res.send(err, 500);
				} else {
					res.send("", 200);
				}
			});
		}
	}

})(module.exports);