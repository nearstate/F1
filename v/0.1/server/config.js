module.exports = {

	// port the server will run on
	"port": "3000",
	
	// this is the time which keep-alive connections will remain open.
	// Set this to a short value in development environment to ensure that the server closes quickly.
	"connectionTimeout": "500",

	"riak": {
		"host": "127.0.0.1",
		"port": 8098,
		"namespace": "ndf1v0.1"
	},

	"clientRoot": __dirname.substring(0, __dirname.lastIndexOf("/")) + "/client"

};