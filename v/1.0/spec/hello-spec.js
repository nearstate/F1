buster.spec.expose();

describe("Given mop", function() {

	var mop = null;

	before(function() {
		mop = new gbL.jsMop.Mop();
		mop.boot(window.ndf);
	});

	describe("When I send a hello", function() {

		var actual = null;

		/*before(function() {
			mop.withRegistered({
				receive_helloResponse: function(message) { actual = message; }
			}, function() {
				mop.send("hi").as("hello");
			});
		});*/

		it("it should send a helloResponse message", function() {
			expect(actual).toEqual("hello again");

		});
	});

	describe("When I send a render junk message", function() {

		/*before(function() {
			$("body").empty();
			mop.send("hi there").as("render junk");
		});*/

		it("it should create a div", function() {
			expect($("div").length).toEqual(1);
		});

		it("it should create a div containing my message", function() {
			expect($("div").html()).toEqual("hi there");
		});

		it("it should do anything", function() {
			expect(true).toEqual(true);
		});


	});
});