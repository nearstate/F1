var config = module.exports;

config["BrowserTests"] = {
	rootPath: "../",
	environment: "browser",
	libs: [ "lib/**/*.js" ],
	sources: [ "js/**/*.js" ],
	tests: [ "spec/*-spec.js" ]
};