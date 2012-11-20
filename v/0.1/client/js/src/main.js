(function(context) {

	context.templates = { raw : { } };

	function indexAndLoadTemplates() {
		
		return $.get("/config/client/templates", function(data) {
			for(var i = 0; i < data.length; i++) {
				loadingTemplates.push(loadAndCompileTemplate(data[i]));
			}
		});

	}

	function loadAndCompileTemplate(templateName) {
		
		return $.get("/tmpl/" + templateName + "-template.html", function(template) {
			context.templates.raw[templateName] = template;
			context.templates[templateName] = Mustache.compile(template);
		});

	}

	function indexAndLoadScripts() {
		
		return $.get("/config/client/scripts", function(data) {
			for(var i = 0; i< data.length; i++) {
				loadingScripts.push($.getScript(data[i]));
			}
		});

	}

	function init() {
		
		var mop = new gbL.jsMop.Mop()
			.boot(context);

		mop.registerHandler("log", function() {
			var level = mop.topics.slice(-1)[0];
			var toLog = Array.prototype.slice.call(arguments, 0);
			toLog.unshift(level.toUpperCase());
			console.log.apply(console, toLog);
		});

		$("body").append(context.templates["editor-centre-float-panel"]());
		
		mop.send().as("init");

	}

	var loadingIndexes = [], loadingTemplates = [], loadingScripts = [], i;
	loadingIndexes.push(indexAndLoadTemplates());
	loadingIndexes.push(indexAndLoadScripts());

	$.when.apply(this, loadingIndexes).then(function() {
		$.when.apply(this, loadingTemplates).then(function() {
			$.when.apply(this, loadingScripts).then(function() {
				$(function() { init(); });
			});
		});
	});

})(window.ndf1 = window.ndf1 || {});