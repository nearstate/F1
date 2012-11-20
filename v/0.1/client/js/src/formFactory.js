(function(context) {

	context.formFactory = { bootstrap : function(mop) { mop.register(new Factory(mop), "Form factory"); } };

	function Factory(mop) {

		var I = { receive: { }, send: { } };

		I.send.logInfo = function(toLog) {};
		I.send.logDebug = function(toLog) {};
		I.send.logError = function(toLog) {};
		I.send.census = function() {};
		
		I.receive.buildForm = function(data, callback) {
			var formData = data;
			if(formData.hasOwnProperty("item")) formData = formData.item;
			var form = new context.Form(formData);
			if(!(form.get_name())) {
				I.send.logError("Invalid form data", data);
				return;
			}
			var formName = "Form " + form.get_name();
			if(!exists(formName)) {
				I.send.logInfo("Creating " + formName);
				mop.register(form, formName);
			} else {
				I.send.logDebug(formName + " already exists");
			}
			console.log(form);
			if(callback) callback(form);
		};

		return I;

		function exists(formName) {
			return ~I.send.census().indexOf(formName);
		}
	}

})(window.ndf1 = window.ndf1 || {});