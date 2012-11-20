(function(context) {

	context.bootstrap = { init: function(mop) { mop.register(new Logger(mop), "Logger"); } };

	function Logger(mop) {
		
		return {
			receive_log: function() {
				var args = Array.prototype.slice.apply(arguments);
				args.unshift(new Date());
				if(mop.topics.length > 1) args.unshift(mop.topics[1].toUpperCase());

				console.log.apply(this, args);
			}
		};

	}

})(module.exports);