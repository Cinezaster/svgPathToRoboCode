var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , SocketIOFileUploadServer = require('socketio-file-upload');

server.listen(3000);

app.use(SocketIOFileUploadServer.router).use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {

	 // Make an instance of SocketIOFileUploadServer and listen on this socket:
    var uploader = new SocketIOFileUploadServer();
    uploader.dir = __dirname +"/public/upload";
    uploader.listen(socket);
    uploader.on("error", function(event){
    console.log("Error from uploader", event);
});

    // Do something when a file is saved:
    uploader.on("saved", function(event){
        console.log(event.file);
        var spawn = require('child_process').spawn,
	    ls    = spawn('node', [
	    	'../parser/parser.js', 
	    	event.file.pathName,
	    	'scara',
	    	'processing'
	    	]); 
    });
});