console.log( ' ');
console.log ('\\\\\\\\\ START PARSING SVG '+ process.argv[2] +' //////////');
console.log( ' ');

if (process.argv.length < 4) {
	if (process.argv.length < 3) {
	  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
	  process.exit(1);
	}
}

Array.prototype.toFloat = function() {
	if (this[0] == ''){
		this.splice(0, 1);
	}
  	for (i=0;i<this.length;i++) {
  		this[i]=parseFloat(this[i]);
  	}
  	return this;
};

Array.prototype.insert = function(index, item) {
	  this.splice(index, 0, item);
}

var fs = require('fs'),
	Bezier = require('./bezier.js'),
	PointsOnCurve = require('./pointsOnCurve.js'),
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
	totalLength = 0,
	processing = "void setup() {\r\nsize(400, 400);\r\nnoLoop();\r\n}\r\n \r\n void draw() {\r\n background(102);\r\nnoFill()\;\r\n"


xml.collect('path');
xml.on('endElement: path', function(item) {
	var pathData = item.$.d
	var pathSegmentPattern = /[a-z][^a-z]*/ig;
	// split on every letter
	var pathSegments = pathData.match(pathSegmentPattern);
	// add to an array with all the paths (l,L,h,H,v,V,s,S,c,C,M)
  	paths.push(pathSegments); 	
});

xml.on('endElement: svg', function(item) {
	//svgData  stores all svg data.
	svgData = item.$	
});
xml.on('end', function(){
	// start processing the data

	// add a start point in the middle of the svg
	paths.unshift(['O'+svgData.width.slice(0,-2)/2+','+svgData.height.slice(0, -2)/2]);
	
	// fill allPaths array with an object of all the paths
	for (var i = 0; i < paths.length; i++) {
		for (var j = 0; j < paths[i].length; j++) {
			
			var numbers = paths[i][j].substr(1).replace(/-/gi, ',-');
			var arrayOfNumbers = numbers.split(",");
			allPaths.push({
				type: paths[i][j].slice(0, 1),
				points : arrayOfNumbers.toFloat(),
				paint : true
			});
		}
	};

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
		} else if(allPaths[i].type == "S") {
				for (var j = 0; j < allPaths[i].points.length; j++) {
					if (j%2 == 0) {
						absolutePointsArray[j+2] = allPaths[i].points[j]
					} else {
						absolutePointsArray[j+2] = allPaths[i].points[j]
					}
			    }
		}
		//console.log(absolutePointsArray);
		if(allPaths[i].type !== "M") {
			allPaths[i].type = allPaths[i].type.toUpperCase()
			allPaths[i].points = absolutePointsArray;
		}
		if (allPaths[i].type === "H" || allPaths[i].type === "V" || allPaths[i].type === "Z") {
			allPaths[i].type = "L"
		}
	};
	
	// change all "M" and "S" to Curves
	for (var i = 0; i < allPaths.length; i++) {
		if (allPaths[i].type === "M") {
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
			var prevLineX = prevX2 - prevX;
			var prevLineY = prevY2 - prevY;
			var nextX = allPaths[i+1].points[0];
			var nextY = allPaths[i+1].points[1];
			var nextX2 = allPaths[i+1].points[2];
			var nextY2 = allPaths[i+1].points[3];
			if (nextX2 == nextX && allPaths[i+1].type !== "L") {

				nextX2 = allPaths[i+1].points[4];
			}
			if (nextY2 == nextY && allPaths[i+1].type !== "L") {
				nextY2 = allPaths[i+1].points[5];
			}
			var nextLineX = nextX - nextX2;
			var nextLineY = nextY - nextY2;
			var prevDirX = prevX - prevLineX;
			var prevDirY = prevY - prevLineY;

			// TODO check minimum lenght on both directions, specially if previous or next was a L

			var points = [
				prevX, 
				prevY, 
				prevDirX , 
				prevDirY, 
				nextX + nextLineX, 
				nextY + nextLineY, 
				nextX, 
				nextY
			]
			allPaths[i].type = "C"
			allPaths[i].points = points
			allPaths[i].paint = false

		} else if (allPaths[i].type === "S") {
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
		} 
	};

	// check if all the curves are in one fluid line if not add a new curve in between to smooth out this curve
	for (var i = 1; i < allPaths.length-1; i++) {
		var slope = function () {
			var fixedX = allPaths[i].points[allPaths[i].points.length-2];
			var fixedY = allPaths[i].points[allPaths[i].points.length-1];
			var dirX = allPaths[i].points[allPaths[i].points.length-4];
			var dirY = allPaths[i].points[allPaths[i].points.length-3];
			if (fixedX === dirX && fixedY === dirY && allPaths[i].type === "C") {
				var dirX = allPaths[i].points[allPaths[i].points.length-6];
				var dirY = allPaths[i].points[allPaths[i].points.length-5];	
			}
			return (fixedX - dirX)/(fixedY - dirY);
		}();
		var nextSlope = function () {
			var fixedX = allPaths[i+1].points[0];
			var fixedY = allPaths[i+1].points[1];
			var dirX = allPaths[i+1].points[2];
			var dirY = allPaths[i+1].points[3];
			if (fixedX === dirX && fixedY === dirY && allPaths[i+1].type === "C") {
				var dirX = allPaths[i+1].points[4];
				var dirY = allPaths[i+1].points[5];
			}
			return (fixedX - dirX)/(fixedY - dirY);
		}();

		if (slope !== nextSlope ) {
			
			var testX = allPaths[i].points[allPaths[i].points.length-2];
			var testY = allPaths[i].points[allPaths[i].points.length-1];			
			if (slope - nextSlope > 0.8 || slope - nextSlope < -0.8 ) { // 0.8 is a good falue 
				if (Math.abs(slope) !== Math.abs(nextSlope)) {
						var fixedX = allPaths[i].points[allPaths[i].points.length-2];
						var fixedY = allPaths[i].points[allPaths[i].points.length-1];
						var dirX = allPaths[i].points[allPaths[i].points.length-4];
						var dirY = allPaths[i].points[allPaths[i].points.length-3];
						if (fixedX === dirX && fixedY === dirY && allPaths[i].type === "C") {
							var dirX = allPaths[i].points[allPaths[i].points.length-6];
							var dirY = allPaths[i].points[allPaths[i].points.length-5];	
						}
						var opositeX = fixedX +(fixedX - dirX);
						var opositeY = fixedY +(fixedY - dirY);
						var length = Math.sqrt(Math.pow((fixedX-opositeX),2)+Math.pow((fixedY-opositeY),2));
						if (length < 20 ) {
							opositeX = fixedX +4*(fixedX - dirX);
							opositeY = fixedY +4*(fixedY - dirY);
						}
						var fixedX2 = allPaths[i+1].points[0];
						var fixedY2 = allPaths[i+1].points[1];
						var dirX2 = allPaths[i+1].points[2];
						var dirY2 = allPaths[i+1].points[3];
						if (fixedX2 === dirX2 && fixedY2 === dirY2 && allPaths[i+1].type === "C") {
							var dirX2 = allPaths[i+1].points[4];
							var dirY2 = allPaths[i+1].points[5];
						}
						var opositeX2 = fixedX2 +(fixedX2 - dirX2);
						var opositeY2 = fixedY2 +(fixedY2 - dirY2);
						var length2 = Math.sqrt(Math.pow((fixedX2-opositeX2),2)+Math.pow((fixedY2-opositeY2),2));						
							
						if (length2 < 20) {

							opositeX2 = fixedX2 +4*(fixedX2 - dirX2);
							opositeY2 = fixedY2 +4*(fixedY2 - dirY2);
						}
						
						//TODO check if the oposite value fall out of the drawing box

						allPaths.insert(i+1,{
							type: "C",
							points : [
								fixedX,
								fixedY,
								opositeX,
								opositeY,
								opositeX2,
								opositeY2,
								fixedX2,
								fixedY2
							],
							paint: false
						});
						i++
					//console.log(slope- nextSlope);

					};
				
			};
			
			
		}
	};

	//add lenght to all C's and L's + calculate total lenght of the curve
	for (var i = 0 ; i < allPaths.length; i++) {
		var p = allPaths[i].points
		if (allPaths[i].type === "C") {
			allPaths[i].bezier = new Bezier({x:p[0],y:p[1]},{x:p[2],y:p[3]},{x:p[4],y:p[5]},{x:p[6],y:p[7]});
			allPaths[i].startLength = totalLength;
			totalLength = totalLength + allPaths[i].bezier.length;
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
			var color = (allPaths[i].paint)? 255 : 0 ;
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
	}
	
	// PointsOnCurve returns object of x y paint on a give distance on the curve
	var points = new PointsOnCurve(10,allPaths);

	// PROCESSING OUTPUT show bezier curves
	if (output === "processing" ) {
		var color = 255;
		for (var i = 0 ; i < points.length; i++) {
			var newColor = (points[i].paint)? 255 : 0 ;	
			if (newColor !== color) {
				processing = processing + "stroke("+ color +")\;\r\n"
				color = newColor;
			}
			processing = processing + "ellipse("+ points[i].x + ', '+ points[i].y + ', 1, 1)\;\r\n';
			
		};
	}

	var xyPoints = new CartesianToScara(points);

	// PROCESSING OUTPUT show two arms based on there angle
	if (output === "processing") {
		processing = processing + "colorMode(HSB, "+xyPoints.length+")\;\r\n"
		for (var i = 1 ; i < xyPoints.length; i++) {
			processing = processing + "stroke("+i+","+xyPoints.length+", 100)\;\r\n"
			var	secondXPoint = 200 + Math.cos(xyPoints[i].step0*Math.PI/180)* 100 ;
			var secondYPoint = 200 + Math.sin(xyPoints[i].step0*Math.PI/180)* 100 ;
			processing = processing + "line( 200, 200, "+secondXPoint+", "+secondYPoint+")\;\r\n";
			var	thirdXPoint = secondXPoint + Math.cos(xyPoints[i].step1*Math.PI/180)* 100;
			var thirdYPoint = secondYPoint + Math.sin(xyPoints[i].step1*Math.PI/180)* 100;
			processing = processing + "line( " +secondXPoint+", "+secondYPoint+", "+thirdXPoint+", "+thirdYPoint+")\;\r\n";

		};
	};
	
	// PROCESSING OUTPUT finish the processing data and write to processing file and execupte that file.
	if (output === "processing") {
		processing = processing +"}";
		fs.writeFile(__dirname+"/processing/processing.pde", processing, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	    var spawn = require('child_process').spawn,
	    ls    = spawn('processing-java', [
	    	'--sketch='+ __dirname+'/processing', 
	    	'--output='+ __dirname+'/tmp',
	    	'--force',
	    	'--run'
	    	]);
		}); 
	};
})





