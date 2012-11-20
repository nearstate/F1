(function(context) {

	context.formAgent = { bootstrap: function(mop) { mop.register(new FormAgent(), "form agent"); } };

	function FormAgent() {

		var I = { receive: {}, send: {} },
			working = null
			;

		I.send.logError = function(){};
		I.send.logInfo = function(){};
		
		I.receive.init = function() {
			$("body").on("click", ".actions", function(e) {
				var act = $(e.srcElement).data("action");
				if(!act || act.length < "form.x".length) return;
				var formAct = act.substring("form.".length);
				var form = $(e.currentTarget).closest(".form");
				var data = {};
				form.find("*").each(function(i, e) {
					if(e.hasOwnProperty("value") && e.hasOwnProperty("name") && e.name && e.name!=="") {
						if($(e).hasClass("json")) {
							data[e.name] = JSON.parse(e.value);
						} else {
							data[e.name] = e.value;
						}
					}
				});

				process(formAct, data);
			});
		};

		function abortWorking(because) {
			if(working && !working.isResolved()) working.abort();
		}

		I.receive.listClones = function(callback) {
			abortWorking("clones");
			$.when(working = $.ajax({
				type: "GET",
				url: "/clones"
			})).done(function(data) {
				callback(data);
			}).fail(function() {
				console.log("fail", arguments);
			});
		};

		I.receive.listForms = function(callback) {
			abortWorking("list forms");
			$.when(working = $.ajax({
				type: "GET",
				url: "/forms"
			})).done(function(data) {
				callback(data);
			}).fail(function() {
				console.log("fail", arguments);
			});
		};

		I.receive.getForm = function(formId, callback) {
			abortWorking("get form");
			$.when(working = $.ajax({
				type: "GET",
				url: "/forms/" + formId
			})).done(callback).fail(function() {
				I.send.logError("Failed to get form " + formId);
			});
		};

		I.receive.getClone = function(cloneId, callback) {
			abortWorking("get clone");
			$.when(working = $.ajax({
				type: "GET",
				url: "/clones/" + cloneId
			})).done(callback).fail(function() {
				I.send.logError("Failed to get clone " + cloneId);
			});
		};

		I.receive.getCloneOfForm = function(toCloneId, callback) {
			abortWorking("get form clone");
			$.when(working = $.ajax({
				type: "GET",
				url: "/forms/" + toCloneId + "/clone"
			})).done(callback).fail(function() {
				I.send.logError("Failed to get clone of form " + toCloneId);
			});
		};

		I.receive.listPublishedForms = function(callback) {
			abortWorking("list published forms");
			$.when(working = $.ajax({
				type: "GET",
				url: "/published/"
			})).done(function(data) {
				callback(data);
			}).fail(function() {
				console.log("fail", arguments);
			});
		};

		I.receive.deleteForm = function(formId, callback) {
			abortWorking("delete form");
			$.when(working = $.ajax({
				type: "DELETE",
				url: "/forms/" + formId
			})).done(function() {
				callback();
			}).fail(function() {
				console.log("fail", arguments);
			});
		};

		I.receive.deleteClone = function(formId, callback) {
			abortWorking("delete clone");
			$.when(working = $.ajax({
				type: "DELETE",
				url: "/clones/" + formId
			})).done(function() {
				callback();
			}).fail(function() {
				console.log("fail", arguments);
			});
		};

		return I;

		function publishForm(formId) {
			abortWorking();
			I.receive.getForm(formId, function(data) {
				$.when(working = $.ajax({
					type: "POST",
					url: "/published/",
					contentType: "application/json",
					data: JSON.stringify(data.item)
				})).done(function() {
					I.send.logInfo("Published form " + formId);
				}).fail(function() {
					I.send.logError("Failed publishing form " + formId);
				});
			});
		}

		function process(act, data) {
			if(act=="PUBLISH") {
				if(!data.hasOwnProperty("formId")) throw "Form id must be specified";
				publishForm(data.formId);
				return;
			}
			var ajaxType = act;
			var content = data.content;
			if(!content || !content.name) throw "Form must contain name";
			var ajaxUrl = "/forms/" + content.name;

			if(act=="POSTFILLED") {
				ajaxType = "PUT";
				ajaxUrl = "/clones/" + content.key;
			}

			working = $.ajax({
				type: ajaxType,
				url: ajaxUrl,
				contentType: "application/json",
				data: JSON.stringify(content)
			});
		}
	}

})(window.ndf1 = window.ndf1 || {});