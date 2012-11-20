var riak = require("riak-js"),
	uuid = require("node-uuid")
	;

(function(context) {

	context.bootstrap = { init: function(mop) { mop.register(new Agent(), "Riak agent" ); } };

	function Agent() {

		var I = { receive: {}, send: {} };

		I.receive.listForms = listForms;
		I.receive.putForm = putForm;
		I.receive.configuration = setConfig;
		I.receive.getForm = getForm;
		I.receive.putPublished = putPublished;
		I.receive.listPublishedForms = listPublishedForms;
		I.receive.deleteForm = deleteForm;
		I.receive.putClone = putClone;
		I.receive.listClones = listClones;
		I.receive.deleteClone = deleteClone;
		I.receive.getClone = getClone;

		I.send.logInfo = function(){};

		var config = {};
		var FORMS_KEY = "forms";
		var PUBLISHED_KEY = "published-forms";
		var CLONES_KEY = "clones";

		return I;

		function setConfig(configuration) {
			config = configuration;
		}

		var client;

		function buildClient() {
			if(!config || !config.riak) throw "No Riak config";
			return client || (client = riak.getClient({
				host: config.riak.host,
				port: config.riak.port,
				debug: true
			}));
		}

		// Forms
		function formsBucket() {
			return config.riak.namespace + ".forms";
		}

		function initFormsKey(callback) {
			I.send.logInfo("Creating forms listing meta-data: " + FORMS_KEY);
			buildClient().save(formsBucket(), FORMS_KEY, "{}", callback);
		}

		function initPublishedKey(callback) {
			I.send.logInfo("Creating published forms listing meta-data: " + PUBLISHED_KEY);
			buildClient().save(formsBucket(), PUBLISHED_KEY, "{}", callback);
		}

		function initClonesKey(callback) {
			I.send.logInfo("Creating clones listing meta-data: " + CLONES_KEY);
			buildClient().save(formsBucket(), CLONES_KEY, "{}", callback);
		}

		function listForms(callback) {
			buildClient().get(formsBucket(), FORMS_KEY, function(err, data, meta) {
				if(meta.statusCode==404) { // not found
					initFormsKey(callback);
					return;
				}
				if(err) throw err; // some other error
				// otherwise parse
				var forms = [];
				for(var i = meta.links.length; i-- > 0; ) {
					if(meta.links[i].tag=="form") forms.push(meta.links[i].key);
				}
				callback(forms);
			});
		}

		function listClones(callback) {
			buildClient().get(formsBucket(), CLONES_KEY, function(err, data, meta) {
				if(meta.statusCode==404) {
					initClonesKey(callback);
					return;
				}
				if(err) throw err; // some other error
				var clones = [];
				for(var i = meta.links.length; i-- > 0; ) {
					if(meta.links[i].tag=="clone") clones.push(meta.links[i].key);
				}
				callback(clones);
			});
		}

		function deleteForm(formId, callback) {
			var client = buildClient();
			var bucket = formsBucket();
			client.get(bucket, FORMS_KEY, function(err, data, meta) {
				if(err) throw err;
				removeLinkToKey(meta, formId, function(err, data) {
					if(err) throw err;
					client.remove(bucket, formId, callback);
				});
			});
		}

		function deleteClone(cloneId, callback) {
			var client = buildClient();
			var bucket = formsBucket();
			client.get(bucket, CLONES_KEY, function(err, data, meta) {
				if(err) throw err;
				removeLinkToKey(meta, cloneId, function(err, data) {
					if(err) throw err;
					client.remove(bucket, cloneId, callback);
				});
			});
		}

		function putClone(formId, data, callback) {
			var form = JSON.parse(data);
			var client = buildClient();
			var bucket = formsBucket();
			client.save(bucket, formId, form, function(err) {
				if(err) throw err;
				client.get(bucket, CLONES_KEY, function(err, data, meta) {

					var ensureLink = function() {
						ensureLinkToKey(meta, formId, "clone", function() {
							if(form.parentId)
								ensureLinkToKey(meta, form.parentId, "parent", callback);
							else
								callback();
						});
					};

					// create if necessary
					if(meta.statusCode == 404) {
						initClonesKey(function(err) {
							if(err) throw err;
							client.get(bucket, CLONES_KEY, function(err) {
								if(err) throw err;
								// created - now update with links
								ensureLink();
							});
						});
					} else {
						ensureLink();
					}
				});
			});
		}

		function putForm(formId, data, callback) {
			var form = JSON.parse(data);
			var client = buildClient();
			var bucket = formsBucket();
			client.save(bucket, formId, form, function(err) {
				if(err) throw err;
				client.get(bucket, FORMS_KEY, function(err, data, meta) {

					var ensureLink = function() { ensureLinkToKey(meta, formId, "form", callback); };

					// create if necessary
					if(meta.statusCode==404) {
						initFormsKey(function(err) {
							if(err) throw err;
							client.get(bucket, FORMS_KEY, function(err, data, meta) {
								if(err) throw err;
								// created - now update with new link
								ensureLink();
							});
						});
					} else {
						ensureLink();
					}

				});
			});
		}

		function removeLinkToKey(meta, key, callback) {
			var toRemove = [];
			for(var i = meta.links.length; i-- > 0; ) {
				if(meta.links[i].key == key) toRemove.push(meta.links[i]);
			}
			for(var j = toRemove.length; j-- > 0; ) {
				console.log(j, meta.links.indexOf(toRemove[j]));
				meta.links.splice(meta.links.indexOf(toRemove[j]), 1);
			}
			client.save(meta.bucket, meta.key, meta.data || "{}", meta, callback);
		}

		function ensureLinkToKey(meta, key, tag, callback) {
			var alreadyLinked = false;
			var linkToMe = { bucket: meta.bucket, key: key, tag: tag };

			for(var i = meta.links.length; i-- > 0; ) {
				if(meta.links[i].key == key) alreadyLinked = true;
			}
			if(!alreadyLinked) {
				meta.addLink(linkToMe);
				client.save(meta.bucket, meta.key, meta.data || "{}", meta, callback);
			} else {
				callback();
			}
		}

		function getClone(cloneId, callback) {
			buildClient().get(formsBucket(), cloneId, function(err, data, meta) {
				if(err) throw err;
				callback(data);
			});
		}

		function getForm(formId, callback) {
			buildClient().get(formsBucket(), formId, function(err, data, meta) {
				if(err) throw err;
				callback(data);
			});
		}

		// Published

		function putPublished(item, callback) {
			var client = buildClient(),
				id = uuid.v4()
				;

			item.key = id;
			
			client.save(formsBucket(), id, item, function(err, data, meta) {
				if(err) throw err;
				var createdKey = meta.key;

				client.get(formsBucket(), PUBLISHED_KEY, function(err, data, meta) {

					var ensureLink = function() { ensureLinkToKey(meta, createdKey, "published-form", callback); };

					// create if necessary
					if(meta.statusCode == 404) {
						initPublishedKey(function(err) {
							if(err) throw err;
							client.get(formsBucket(), PUBLISHED_KEY, function(err, data, meta) {
								if(err) throw err;
								// created - now update with new link
								ensureLink();
							});
						});
					} else {
						ensureLink();
					}

				});
			});
		}

		function listPublishedForms(callback) {
			var client = buildClient();
			client.walk(formsBucket(), PUBLISHED_KEY, [[ "_", "published-form" ]], function(err, data, meta) {
				if(meta.statusCode==404) { // not found
					initPublishedKey(callback);
					return;
				}
				if(err) throw err; // some other error
				// otherwise parse
				callback(data);
			});
		}

	}

})(module.exports);