var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , SocketIOFileUploadServer = require('socketio-file-upload')
  , BTSP = require('bluetooth-serial-port')
  , BTserial = new BTSP.BluetoothSerialPort();

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
		socket.emit('saved_image', event);
	    console.log(event.file);

	    socket.on('process',function(data){
	    	var spawn = require('child_process').spawn,
		    ls = spawn('node', [
		    	'../parser/parser.js', 
		    	event.file.pathName,
		    	'scara',
		    	'processing'
		    ]);

		    ls.stdout.on('data', function (data) {
	  			console.log('stdout: ' + data);
			});

			ls.stderr.on('data', function (data) {
			  console.log('stderr: ' + data);
			});

			ls.on('close', function (code) {
			  console.log('child process exited with code ' + code);
			  socket.emit('processed',{});
			});
	    })
    });

    

    socket.on('search_Bluetooth', function(){
    	socket.emit('console','start searching for bluetooth device');
    	console.log('start searching for bluetooth device:');
    	BTserial.close();
    	BTserial.inquire();
    });

    BTserial.on('found', function(address, name) {
    	console.log('Found: ' + address + ' with name ' + name);
    	socket.emit('device',{address: address, name: name});
    	socket.emit('console','found device: '+address + ' with name: '+name);
    });

    BTserial.on('data', function(data) {
	console.log(data.toString('ascii'));
	});

	BTserial.on('failure',function(err){
		socket.emit('console','failure: '+ err);
		console.log('failure: '+ err)
	});

	BTserial.on('finished',function(){
		socket.emit('console','finished searching');
		socket.emit('search_Bluetooth_stopped',{});
		console.log('finished searching')
	})



    socket.on('open_Bluetooth_Connection',function(address){
    	socket.emit('console','try to connect to device with address: '+address);
    	console.log('try to connect to device with address: '+address);
    	BTserial.findSerialPortChannel(address, function(channel) {
    		socket.emit('console','found bluetooth channel '+ channel);
    		console.log('found bluetooth channel '+ channel);
    		BTserial.connect(address, channel, function() {
    			socket.emit('console','Bluetooth connected with '+ address);
    			console.log('Bluetooth connected with '+ address);
    			socket.emit('connected_Bluetooth',{address:address});
    		},function (){
    			socket.emit('console','Cannot connect');
    			console.log('Cannot connect');
    		})
    	})
    	
    });
    socket.on('close_Bluetooth_Connection', function(){
    	BTserial.close();
    	if (!BTserial.isOpen()) {
    		socket.emit('console','Bluetooth connectie is gesloten');
    	}
    })

    socket.on('start_Painting',function(){
    	if (BTserial.isOpen()) {
			// paint
			BTserial.write(new Buffer('p121s234l1\r','ascii'), function (err, bytesWritten){
                	if (err) {
                		console.log(err);
                		socket.emit('error',{message: "fail to write to robot"});
                	};
                });
		}
    });
});

