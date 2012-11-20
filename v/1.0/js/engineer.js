(function(context) {

	context.bootstrap = { init: function(jsmop) { buildEngineer(jsmop); } };

	function buildEngineer(mop) {

		mop.register({
			receive_hello: onHello,
			receive_render_junk: onRender
		});

		function onHello() {
			mop.send("hello again").as("helloResponse");
		}

		function onRender(toRender) {
			$("body").append($("<div />").html(toRender));
		}
	}

})( (window.ndf = window.ndf || {})[Math.random()] = {} );