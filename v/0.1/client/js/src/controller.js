(function(context) {

	context.controller = {
		bootstrap : function(mop) { mop.register(new Controller(), "Controller"); }
	};

	function Controller() {

		var I = { receive: {}, send: {} };
		I.send.listForms = function(callback){};
		I.send.getForm = function(formName, callback){};
		I.send.prettyPrintForm = function(formName, container){};
		I.send.buildForm = function(data){};
		I.send.renderFormEditor = function(formName, container){};
		I.send.listPublishedForms = function(callback){};
		I.send.getCloneOfForm = function(formName, callback){};
		I.send.logInfo = function(toLog){};
		I.send.renderFormFiller = function(formName, container){};
		I.send.deleteForm = function(formName, callback){};
		I.send.listClones = function(formName, callback){};
		I.send.deleteClone = function(formName, callback){};
		I.send.getClone = function(cloneId, callback){};

		I.receive.init = function() {
			container = $("#main");
			$(window).bind("hashchange", runHashRoute);
			runHashRoute();
		};

		var container = null;

		function show(tmplName, viewData) {
			var view = context.templates[tmplName](viewData || {}, context.templates.raw);
			container.empty();
			$(view).appendTo(container);
		}

		function formNameFromRoute(route) {
			return route.substring(route.indexOf("/") + 1);
		}

		function buildForm(route, onFormReadyCallback) {
			var formName = formNameFromRoute(route);
			I.send.getForm(formName, function(data) {
				I.send.buildForm(data);
				onFormReadyCallback(formName);
			});
		}

		function cloneForm(route, onFormReadyCallback) {
			var formName = formNameFromRoute(route);
			I.send.getCloneOfForm(formName, function(data) {
				I.send.buildForm(data, function(form) {
					onFormReadyCallback(form.get_name());
				});
			});
		}

		var routes = {
			
			"delete-clone" : function(route) {
				var formName = formNameFromRoute(route);
				I.send.deleteClone(formName, function() {
					window.history.back();
				});
			},

			"delete" : function(route) {
				var formName = formNameFromRoute(route);
				I.send.deleteForm(formName, function() {
					window.history.back();
				});
			},

			// add a form
			"add" : function(route) {
				show("add");
				$(container).find("input[type=text]").change(function() {
					var data = { "name" : $(this).val() };
					$(container).find("input[name=content]").val(JSON.stringify(data));
				});
			},

			"edit-raw" : function(route) {
				buildForm(route, function(formName) {
					show("raw-form");
					I.send.prettyPrintForm(
						formName,
						$(container).find(".form .control textarea[name='content']")[0]
					);
				});
			},

			"edit": function(route) {
				buildForm(route, function(formName) {
					show("edit");
					I.send.renderFormEditor(
						formName,
						$(container).find(".edit-surface")[0]
					);
				});
			},

			"list-forms" : function(route) {
				I.send.listForms(function(data) {
					show("form-list", data);
				});
			},

			"fill-forms" : function(route) {
				I.send.listPublishedForms(function(data) {
					show("fill-forms-list", data);
				});
			},

			"fill" : function(route) {
				cloneForm(route, function(formName) {
					show("fill");
					I.send.renderFormFiller(
						formName,
						$(container).find(".fill-surface")[0]
					);
				});
			},

			"publish" : function(route) {
				var formName = formNameFromRoute(route);
				I.send.getForm(formName, function(data) {
					show("publish", data);
				});
			},

			"home" : function(route) {
				show("home");
			},

			"view-clones" : function(route) {
				I.send.listClones(function(data) {
					show("clone-list", data);
				});
			},

			"view-clone" : function(route) {
				var cloneName = formNameFromRoute(route);
				I.send.getClone(cloneName, function(data) {
					var vals = "";
					for(var i in data.item.form.items) {
						var item = data.item.form.items[i];
						vals += item.name + ": " + item.value + "<br />";
					}
					data.literal = vals;
					show("view-clone", data);
				});
			}
		};

		function runHashRoute() {
			runRoute(location.hash.slice(1));
		}

		function runRoute(reqRoute) {

			var match = null;
			for(var route in routes) {
				if(reqRoute.length < route.length) continue;
				if(reqRoute.substring(0, route.length) === route) {
					match = route;
					break;
				}
			}
			I.send.logInfo("Matched route?", match);
			if(match)
				routes[match](reqRoute);
			else
				routes.home(reqRoute);
		}

		return I;
	}

})(window.ndf1 = window.ndf1 || {});