if (process.argv.length < 4) {
	if (process.argv.length < 3) {
	  process.exit(1);
	}
}
Array.prototype.removeEmpty = function () {
	if (this[0] == ''){
		this.splice(0, 1);
	}
	if (this[this.length-1] == '') {
		this.splice(-1,1);
	}
	return this;
}

Array.prototype.toFloat = function() {
  	for (i=0;i<this.length;i++) {
  		this[i]=parseFloat(this[i]);
  	}
  	return this;
};

Array.prototype.insert = function(index, item) {
	  this.splice(index, 0, item);
}

var roundUpto = function(number, upto){
    return Number(number.toFixed(upto));
}

function generateGuid() {
  var result, i, j;
  result = '';
  for(j=0; j<32; j++) {
    if( j == 8 || j == 12|| j == 16|| j == 20) 
      result = result + '-';
    i = Math.floor(Math.random()*16).toString(16).toUpperCase();
    result = result + i;
  }
  return result;
}

var fs = require('fs'),
	Bezier = require('./bezier.js'),
	Curves2Lines = require('./curves2Lines.js'),
	CartesianToScara = require('./cartesianToScara.js'),
	filename = process.argv[2], 
	conversionType = process.argv[3],
	output = process.argv[4], 
	XmlStream = require('xml-stream'), 
	stream = fs.createReadStream(filename,{encoding: "utf8"}), 
	xml =new XmlStream(stream), 
	paths = new Array(), 
	allPaths = new Array(), 
	svgData,
	svgObject = {g:{},data:{}},
	guid,
	totalLength = 0,
	resolution = 3,
	transform =  new Array(),
	processing = "void setup() {\r\nsize(400, 400);\r\nnoLoop();\r\n}\r\n \r\n void position(x,y,l) {\r\n if(l == 0) {\r\nstroke(#FFCC00);\r\n} else {\r\nstroke(#00CCFF);\r\n}\r\n ellipse(x,y,1,1)}\r\n void draw() {\r\n background(255);\r\nnoFill()\;\r\n",
	gcode = "";




xml.collect('path');

xml.on('endElement: path', function(item) {
	if(item.$.transform){
		var regExp = /\(([^)]+)\)/;
		var transform = regExp.exec(item.$.transform)[1].split(' ')
		svgObject.g[guid].transform[0] = parseFloat(svgObject.g[guid].transform[0]) + parseFloat(transform[0]);
		svgObject.g[guid].transform[1] = parseFloat(svgObject.g[guid].transform[1]) + parseFloat(transform[1]);
	}
	var pathData = item.$.d
	var pathSegmentPattern = /[a-z][^a-z]*/ig;
	// split on every letter
	var pathSegments = pathData.match(pathSegmentPattern);
	// add to an array with all the paths (l,L,h,H,v,V,s,S,c,C,M)
  	paths.push(pathSegments);

  	var pathGuid = generateGuid();
  	if (!svgObject.g[guid]) {
  		guid = generateGuid();
		svgObject.g[guid] = [];
		svgObject.g[guid].path = [];
		svgObject.g[guid].transform = [0,0];
  	}

  	svgObject.g[guid].path[pathGuid] = pathSegments;
});

xml.on('startElement: g', function(item){
	guid = generateGuid();
	svgObject.g[guid] = [];
	svgObject.g[guid].path = [];
	if(item.$.transform){
		var regExp = /\(([^)]+)\)/;
		svgObject.g[guid].transform = regExp.exec(item.$.transform)[1].split(' ')
	}else{
		svgObject.g[guid].transform = [0,0];
	}

});

xml.on('endElement: svg', function(item) {
	//svgData  stores all svg data.
	svgData = item.$	
	svgObject.data = svgData;
});
xml.on('end', function(){
	// start processing the data

	allPaths = [{
		type: "O",
		points: [0, 0],
		paint: false
	}];

	var size = {}

	if (svgObject.data.viewBox) {
		var viewBox = svgObject.data.viewBox.split(' ')
		size.x = parseInt(viewBox[2])
		size.y = parseInt(viewBox[2])
	} else {
		size.x = parseInt(svgObject.data.width)
		size.y = parseInt(svgObject.data.height)
	}

	for (var key in svgObject.g) {
   		if (svgObject.g.hasOwnProperty(key)) {
      		var obj = svgObject.g[key];
      		var transform = obj.transform.toFloat();
			for (var uid in obj.path) {
         		if (obj.path.hasOwnProperty(uid)) {
         			var path = obj.path[uid]
         			for (var i = 0; i < path.length; i++) {
         				if (svgObject.data.version == 1.1 ) {
         					var numbers = path[i].substr(1).replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(/ +/).removeEmpty().toFloat();
         					if ( path[i].slice(0, 1) == path[i].slice(0, 1).toUpperCase()){
         						for (var j = 0; j < numbers.length; j++) {
	         						if (j%2 !== 0){
	         							numbers[j] = numbers[j]+transform[1];
	         						} else {
	         							numbers[j] = numbers[j]+transform[0];
	         						}
	         					};
         					}
							allPaths.push({
								type: path[i].slice(0, 1),
								points : numbers.toFloat(),
								paint : true
							});
         				} else if (svgObject.data.version == 1.2) {
         					var numbers = path[i].substr(1).replace(/-/gi, ',-').split(",").removeEmpty().toFloat();
         					if ( path[i].slice(0, 1) == path[i].slice(0, 1).toUpperCase()){
								for (var j = 0; j < numbers.length; j++) {
	         						if (j%2 !== 0){
	         							numbers[j] = numbers[j]+transform[0];
	         						} else {
	         							numbers[j] = numbers[j]+transform[1];
	         						}
	         					};
         					}
							allPaths.push({
								type: path[i].slice(0, 1),
								points : numbers.toFloat(),
								paint : true
							});
			         	} else if (svgObject.data.version == 1.0) {
			         		var numbers = path[i].substr(1).replace(/\s/g, ',').split(",").removeEmpty().toFloat();
         					if ( path[i].slice(0, 1) == path[i].slice(0, 1).toUpperCase()){
         						for (var j = 0; j < numbers.length; j++) {
	         						if (j%2 !== 0){
	         							numbers[j] = numbers[j]+transform[1];
	         						} else {
	         							numbers[j] = numbers[j]+transform[0];
	         						}
	         					};
         					}
							allPaths.push({
								type: path[i].slice(0, 1),
								points : numbers.toFloat(),
								paint : true
							});
			         	}
         			};
         		}
      		}
   		}
	}
	// change all the relative positioned paths to absolute paths
	for (var i = 1; i < allPaths.length; i++) {
		var absolutePointsArray = new Array();
		var prevAbsoluteX = allPaths[i-1].points[allPaths[i-1].points.length-2];
		var prevAbsoluteY = allPaths[i-1].points[allPaths[i-1].points.length-1];
		absolutePointsArray[0] = allPaths[i-1].points[allPaths[i-1].points.length-2];
		absolutePointsArray[1] = allPaths[i-1].points[allPaths[i-1].points.length-1];
		if (allPaths[i].type !== allPaths[i].type.toUpperCase()) {
			if (allPaths[i].type !== "v" && allPaths[i].type !== "h" && allPaths[i].type !== "z" && allPaths[i].type !== "l") {
				for (var j = 0; j < allPaths[i].points.length; j++) {
					if (j%2 == 0) {
						absolutePointsArray[j+2] = prevAbsoluteX + allPaths[i].points[j]
					} else {
						absolutePointsArray[j+2] = prevAbsoluteY + allPaths[i].points[j]
					}
				}
			} else {
				if (allPaths[i].type === "v") {
					absolutePointsArray[2] = prevAbsoluteX 
					absolutePointsArray[3] = prevAbsoluteY + allPaths[i].points[0]
				} else if(allPaths[i].type === "h") {
					absolutePointsArray[2] = prevAbsoluteX + allPaths[i].points[0]
					absolutePointsArray[3] = prevAbsoluteY 
				} else if(allPaths[i].type === "z") {
					for (var j = i - 1; j >= 0; j--) {
						if (allPaths[j].type === "M") {

							absolutePointsArray[2] = allPaths[j].points[0]
							absolutePointsArray[3] = allPaths[j].points[1]
							break;
						}
					};
				} else if(allPaths[i].type === "l") {

					absolutePointsArray[2] = prevAbsoluteX  + allPaths[i].points[0]
					absolutePointsArray[3] = prevAbsoluteY + allPaths[i].points[1]
				}
			}
			
			// deze posities zijn relatief en moeten absolute gemaakt worden.
			// ga één terug en kijk of deze al absoluut is en trek alle x y op bij de absolute waarden.
		} else if(allPaths[i].type == "V") {
					absolutePointsArray[2] = prevAbsoluteX
					absolutePointsArray[3] = allPaths[i].points[0]
		} else if(allPaths[i].type == "H") {
					absolutePointsArray[2] = allPaths[i].points[0]
					absolutePointsArray[3] = prevAbsoluteY
		} else if(allPaths[i].type == "L") {
					absolutePointsArray[2] = allPaths[i].points[0]
					absolutePointsArray[3] = allPaths[i].points[1]
		} else if(allPaths[i].type == "S" || allPaths[i].type == "C") {
				for (var j = 0; j < allPaths[i].points.length; j++) {
					if (j%2 == 0) {
						absolutePointsArray[j+2] = allPaths[i].points[j]
					} else {
						absolutePointsArray[j+2] = allPaths[i].points[j]
					}
			    }
		} else if(allPaths[i].type == "Q") {
			allPaths[i].type = "C";
			absolutePointsArray[2] = allPaths[i].points[0];
			absolutePointsArray[3] = allPaths[i].points[1];
			absolutePointsArray[4] = allPaths[i].points[0];
			absolutePointsArray[5] = allPaths[i].points[1];
			absolutePointsArray[6] = allPaths[i].points[2];
			absolutePointsArray[7] = allPaths[i].points[3];
		}

		
		if(allPaths[i].type !== "M") {
			allPaths[i].type = allPaths[i].type.toUpperCase()
			allPaths[i].points = absolutePointsArray;
		}
		if (allPaths[i].type === "H" || allPaths[i].type === "V") {
			allPaths[i].type = "L"
		}
	};


	//"S" to Curves
	for (var i = 0; i < allPaths.length; i++) {
		if (allPaths[i].type === "S") {
			var prevX = allPaths[i-1].points[allPaths[i-1].points.length-2];
			var prevY = allPaths[i-1].points[allPaths[i-1].points.length-1];
			var prevX2 = allPaths[i-1].points[allPaths[i-1].points.length-4];
			var prevY2 = allPaths[i-1].points[allPaths[i-1].points.length-3];
			if (prevX2 === undefined) {
				prevX2 = prevX
			}
			if (prevY2 === undefined) {
				prevY2 = prevY
			}
			var prevLineX = prevX - prevX2;
			var newPointX
			if (prevX > prevX2) {
				newPointX = allPaths[i].points[0] + prevLineX
			} else {
				newPointX = allPaths[i].points[0] + prevLineX
			}
			

			var prevLineY = prevY - prevY2;
			var newPointY
			if (prevY > prevY2) {
				newPointY = allPaths[i].points[1] + prevLineY
			} else {
				newPointY = allPaths[i].points[1] + prevLineY
			}
			
			
			var points = [
				allPaths[i].points[0], 
				allPaths[i].points[1], 
				newPointX, 
				newPointY, 
				allPaths[i].points[2], 
				allPaths[i].points[3], 
				allPaths[i].points[4], 
				allPaths[i].points[5]
			]
			allPaths[i].type = "C"
			allPaths[i].points = points
		} else if (allPaths[i].type === "C" && allPaths[i].points.length === 6) {
			var points = [
				allPaths[i-1].points[allPaths[i-1].points.length-2],
				allPaths[i-1].points[allPaths[i-1].points.length-1],
				allPaths[i].points[0], 
				allPaths[i].points[1], 
				allPaths[i].points[2], 
				allPaths[i].points[3], 
				allPaths[i].points[4], 
				allPaths[i].points[5]
			]
			allPaths[i].points = points
		}
	};

	//add lenght to all C's and L's + calculate total lenght of the curve
	for (var i = 0 ; i < allPaths.length; i++) {
		var p = allPaths[i].points
		if (allPaths[i].type === "C") {
			allPaths[i].bezier = new Bezier({x:p[0],y:p[1]},{x:p[2],y:p[3]},{x:p[4],y:p[5]},{x:p[6],y:p[7]});
			allPaths[i].startLength = totalLength;
			totalLength = totalLength + allPaths[i].bezier.arcLength;
			allPaths[i].endLength = totalLength;
		} else if (allPaths[i].type === "L") {
			allPaths[i].length = Math.sqrt(Math.pow((p[0]-p[2]),2)+Math.pow((p[1]-p[3]),2));
			allPaths[i].startLength = totalLength;
			totalLength = totalLength +  allPaths[i].length;
			allPaths[i].endLength = totalLength;
		}
	};

	
	// PROCESSING OUTPUT show bezier curves
	if (output === "processing" ) {
		for (var i = 0 ; i < allPaths.length; i++) {
			var color = (allPaths[i].paint)? 0 : 230 ;
			processing = processing + "stroke("+ color +")\;\r\n"
			if (allPaths[i].type === "C") {

				var y = ""
				for (var j =  0; j < allPaths[i].points.length; j++) {
					y = y + allPaths[i].points[j] + ', '
				};

				processing = processing + "bezier (" + y.slice(0,-2) + ")\;\r\n";

			} else if (allPaths[i].type === "L") {

				var y = ""
				for (var j =  0; j < allPaths[i].points.length; j++) {
					y = y + allPaths[i].points[j] + ', '
				};

				processing = processing + "line (" + y.slice(0,-2) + ")\;\r\n";

			}
		};
	};

	// replace Curves with lines
	var allReady4GCode = new Curves2Lines(resolution, allPaths);

	// PROCESSING OUTPUT show bezier curves
	if (output === "processingx" ) {
		var color = "0, 200, 0";
		for (var i = 0 ; i < allReady4GCode.length; i++) {
			var newColor = (allReady4GCode[i].paint)? "0, 200, 0" : "0" ;	
			if (newColor !== color) {
				processing = processing + "stroke("+ color +")\;\r\n"
				color = newColor;
			}
			if (allReady4GCode[i].type === "M") {
				var lastPointx = (allReady4GCode[i-1])? allReady4GCode[i-1].points[2]:0
				var lastPointy = (allReady4GCode[i-1])? allReady4GCode[i-1].points[3]:0
				processing = processing + "line("+ lastPointx + ', '+ lastPointy + ', ' + allReady4GCode[i].points[0] + ', '+ allReady4GCode[i].points[1] +')\;\r\n';
			} else {
				processing = processing + "line("+ allReady4GCode[i].points[0] + ', '+ allReady4GCode[i].points[1] + ', ' + allReady4GCode[i].points[2] + ', '+ allReady4GCode[i].points[3] +')\;\r\n';
			}
		};
		processing = processing + "stroke(0, 200, 0)\;\r\n"
		var lastPointx = (allReady4GCode[i-1])? allReady4GCode[i-1].points[2]:0
		var lastPointy = (allReady4GCode[i-1])? allReady4GCode[i-1].points[3]:0
		processing = processing + "line("+ lastPointx + ', '+ lastPointy + ', 0, 0)\;\r\n';
			
	};

	// flip it
	for (var i = 0; i < allReady4GCode.length; i++) {
		for (var j = 1; j < allReady4GCode[i].points.length; j+=2) {
			allReady4GCode[i].points[j] = size.y - allReady4GCode[i].points[j]
		};
	};

	// scale
	var scale = 0.5;
	for (var i = 0; i < allReady4GCode.length; i++) {
		for (var j = 0; j < allReady4GCode[i].points.length; j++) {
			allReady4GCode[i].points[j] = allReady4GCode[i].points[j]*scale
		};
	};

	var newLine = '\n';
	var laserPower = 1000; //1000 max = 100 duty cycle , 250 = min 1/256 duty cycle, 625 = mid
	var feedSpeed = 1000;
	var setFeedSpeed = true
	// Make G-code
	gcode = gcode + "M05 S0" + newLine; // turn off laser
	gcode = gcode + "G21 G90 G64 G40" + newLine;
	gcode = gcode + "TO M6" + newLine; // Pause

	for (var i = 0; i < allReady4GCode.length; i++) {
		var step = allReady4GCode[i];
		switch (step.type) {
			case 'M' :
				gcode = gcode + "M05" + newLine; // turn off laser
				gcode = gcode + "G0 X" + roundUpto(step.points[0],4) + " Y"+ roundUpto(step.points[1],4)  + newLine;
				gcode = gcode + "M03 S"+ laserPower + newLine; // turn on laser
				gcode = gcode + "G4 P0.2" + newLine;
				setFeedSpeed = true
			break;
			case 'L' :
				var feed = (setFeedSpeed)? " F"+feedSpeed:""
				setFeedSpeed = false
				gcode = gcode + "G1 X" + roundUpto(step.points[2],4) + " Y"+ roundUpto(step.points[3],4) + feed + newLine;
			break;
		}
	};

	gcode = gcode + "M05" + newLine; // turn off laser
	gcode = gcode + "G0 X0 Y0" + newLine;

	// OUTPUT gcode file
	var gcodeFileName = filename.split('/').slice(-1).pop()
	fs.writeFile(__dirname+"/../public/gcode/"+ gcodeFileName +".gcode", gcode, function(err) {
		if(err) {
		    console.log(err);
		} else {
		    //console.log("The processing file was saved in public");
		}
		/*var spawn = require('child_process').spawn
			, ls    = spawn('processing-java', [
	    		'--sketch='+ __dirname+'/../paintOverBluetooth/public/processing', 
	    		'--output='+ __dirname+'/tmp',
	    		'--force',
	    		'--run'
	    	]);*/
	});


	if (output === "processing" || output === "processingx") {
		processing = processing +"}";

		// PROCESSING OUTPUT finish the processing data and write to processing file and execupte that file.
		fs.writeFile(__dirname+"/../public/processing/processing.pde", processing, function(err) {
			if(err) {
			    console.log(err);
			} else {
			    //console.log("The processing file was saved in public");
			}
			/*var spawn = require('child_process').spawn
				, ls    = spawn('processing-java', [
		    		'--sketch='+ __dirname+'/../paintOverBluetooth/public/processing', 
		    		'--output='+ __dirname+'/tmp',
		    		'--force',
		    		'--run'
		    	]);*/
		}); 
	};
})





