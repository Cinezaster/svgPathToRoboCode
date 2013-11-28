var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , SocketIOFileUploadServer = require('socketio-file-upload')
  , BTSP = require('bluetooth-serial-port')
  , BTserial = new BTSP.BluetoothSerialPort()
  , fs = require('fs')
  , painterPositions =[];

server.listen(3000);

app.use(SocketIOFileUploadServer.router);
app.use(express.static(__dirname + '/public'));
app.use('/uploads',express.static(__dirname + '/public'));

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
    });

	socket.on('process',function(data){

	    	var stepData = '';
	    	var spawn = require('child_process').spawn,
		    ls = spawn('node', [
		    	'../parser/parser.js', 
		    	__dirname +"/public/upload/"+ data,
		    	'scara',
		    	'processing'
		    ]);

		    ls.stdout.on('data', function (data) {
	  			stepData += data
			});
			ls.stdout.on('end', function () {
				console.log(typeof stepData);
				console.log(stepData);
	  			try {
      				var data = JSON.parse(stepData);
      				if (data.painterPositions !== undefined){
    				painterPositions = data.painterPositions;
    				console.log(painterPositions);
    			}
    			} catch (er) {
     				// uh oh!  bad json!
     				console.log('error: '+ er.message);
    			}
			});

			ls.stderr.on('data', function (data) {
			  console.log('stderr: ' + data);
			});

			ls.on('close', function (code) {
			  console.log('child process exited with code ' + code);
			  socket.emit('processed',data);
			});
	    })

    socket.on('giveFiles', function(){
    	fs.readdir(__dirname +"/public/upload", function(err,files){
			socket.emit('giveFiles',files);
		});
    });

    

    socket.on('search_Bluetooth', function(data){
    	if (data == "new") {
    		socket.emit('console','start searching for bluetooth device');
    		console.log('start searching for bluetooth devices:');
    		BTserial.close();
    		BTserial.inquire();
    	} else {
    		for (var i = 0; i < BTDevices.length; i++) {
    			socket.emit('device',{address: TDevices[i].address, name: TDevices[i].name, channel: TDevices[i].channel});
    		}
    	}
    	
    });

    var BTDevices = [];

    BTserial.on('found', function(address, name) {
    	BTserial.findSerialPortChannel(address, function(channel) {
    		socket.emit('device',{address: address, name: name, channel: channel});
    		socket.emit('console','found device: '+address + ' with name: '+name + " on channel: " + channel);
    		BTDevices.push({address: address, name: name, channel: channel});
    	});
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
    	for (var i = 0; i < BTDevices.length; i++) {
    		var channel;
    		if (BTDevices[i].address === address) {
    			channel = BTDevices[i].channel;
    		};
    	};
		BTserial.connect(address, channel, function() {
			socket.emit('console','Bluetooth connected with '+ address);
			console.log('Bluetooth connected with '+ address);
			socket.emit('connected_Bluetooth',{address:address});
		},function (){
			socket.emit('console','Cannot connect');
			console.log('Cannot connect');
		})
    });

    socket.on('close_Bluetooth_Connection', function(){
    	BTserial.close();
    	if (!BTserial.isOpen()) {
    		socket.emit('console','Bluetooth connectie is gesloten');
    	}
    });

    socket.on('paint', function(){
    	if (BTserial.isOpen()) {
    		console.log('paint');
    		BTserial.write(new Buffer('0,0,0,0\n', 'utf8'), function (err, bytesWritten){
            	if (err) {
            		console.log(err);
            		socket.emit('error',{message: "fail to write to robot"});
            	};
            	console.log("BytesWritten : "+bytesWritten)
            });
    	} else {
    		socket.emit('console','no bluetooth connection');
    	}
    });

    var paintPosition;
    var lastPostion;

    var paint = function(){
    	if(paintPosition !== painterPositions.length) {
    		console.log(painterPositions[paintPosition].p+','+painterPositions[paintPosition].s+','+painterPositions[paintPosition].l+',1\n');
    		if (lastPostion !== paintPosition) {
    			lastPostion = paintPosition;
	    		BTserial.write(new Buffer(painterPositions[paintPosition].p+','+painterPositions[paintPosition].s+','+painterPositions[paintPosition].l+',1\n', 'utf8'), function (err, bytesWritten){
	            	if (err) {
	            		console.log(err);
	            		socket.emit('error',{message: "fail to write to robot"});
	            	};
	            	paintPosition++;
	            	socket.emit('paint',{progress: (painterPositions.length/paintPosition)*100});
	            });
    		}
    	} else {
    		BTserial.write(new Buffer('0,0,0,2\n', 'utf8'), function (err, bytesWritten){
            	if (err) {
            		console.log(err);
            		socket.emit('error',{message: "fail to write to robot"});
            	};
            });
    	}
    };

    var startPaint = function (){
    	console.log('start Painting')
    	paintPosition = 0;
    	paint();
    };

    var endPaint = function(){
    	socket.emit('console','end of painting')
    };

    var getFromRobot = function(data){
    	console.log('recieved from Robot '+ data);
    	if (data == "h"){
    		startPaint()
    	} else if (data == "p") {
    		paint();
    	} else if (data == "e") {
    		endPaint();
    	}
    }
    var dataBuffer = "";
    BTserial.on('data', function(buffer) {
    	dataBuffer = dataBuffer + buffer.toString('utf8');
            if(dataBuffer.indexOf("\n") != -1){
                getFromRobot(dataBuffer.slice(0,1));
                dataBuffer = "";
            }
        
	});

});

