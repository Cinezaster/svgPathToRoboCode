var BTSP = require('bluetooth-serial-port');
var serial = new BTSP.BluetoothSerialPort();
 
serial.on('found', function(address, name) {
 
    // you might want to check the found address with the address of your
    // bluetooth enabled Arduino device here.
 	console.log(name);
    serial.findSerialPortChannel(address, function(channel) {
        serial.connect(bluetoothAddress, channel, function() {
            console.log('connected');
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            console.log('Press "1" or "0" and "ENTER" to turn on or off the light.')
 
            process.stdin.on('data', function (data) {
                serial.write(data);
            });
 
            serial.on('data', function(data) {
                console.log('Received: ' + data);
            });
        }, function () {
            console.log('cannot connect');
        });
    });
});
 
serial.inquire();
