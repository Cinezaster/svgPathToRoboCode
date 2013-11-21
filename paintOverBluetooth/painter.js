var BTSP = require('bluetooth-serial-port');
var BTserial = new BTSP.BluetoothSerialPort();
 
var checkConnection = function () {
	var timer = setInterval(function(){
		if (BTserial.isOpen()) {
			console.log('connection is open')
		} else {
			console.log('search for bluetooth device')
			BTserial.inquire();
			clearInterval(this);
		};
	},5000);
};


BTserial.on('found', function(address, name) {
 
    // you might want to check the found address with the address of your
    // bluetooth enabled Arduino device here.
	console.log('Found: ' + address + ' with name ' + name);

	// TODO let the web-client know wich are all the bluetooth devices
    BTserial.findSerialPortChannel(address, function(channel) {
    	console.log('found bluetooth device with address: '+address + ' on channel: '+ channel);
        BTserial.connect(address, channel, function() {
            console.log('connected');

            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', function (data) {
                BTserial.write(new Buffer(data,'ascii'), function (err, bytesWritten){
                	if (err) {
                		console.log(err);
                		BTserial.close();
                		console.log(BTserial.isOpen());
                	};
                });
            });

			checkConnection();

        }, function () {
            console.log('cannot connect');
        });
    });
});

BTserial.on('data', function(data) {
	console.log(data.toString('ascii'));
});

BTserial.on('failure',function(err){
	console.log('failure: '+ err)
});

BTserial.on('finished',function(){
	console.log('finished searching')
})

checkConnection();

