(function() {
	
	$(function() {

		$("body").on("click", ".matting", function(e) {
			if(this==e.target) {
				if(!$(this).hasClass("lock")) $(this).hide();
			}
		}).on("selectstart", ".indicator", function(e) {
			e.preventDefault();
		})
		;
	});

})();