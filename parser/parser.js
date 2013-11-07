console.log( ' ');
console.log ('\\\\\\\\\ START PARSING SVG '+ process.argv[2] +' //////////');
console.log( ' ');

if (process.argv.length < 4) {
	if (process.argv.length < 3) {
	  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
	  process.exit(1);
	}
}


// https://gist.github.com/BonsaiDen/670236
function Bezier(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    
    this.len = 100;
    this.arcLengths = new Array(this.len + 1);
    this.arcLengths[0] = 0;
    
    var ox = this.x(0), oy = this.y(0), clen = 0;
    for(var i = 1; i <= this.len; i += 1) {
        var x = this.x(i * 0.01), y = this.y(i * 0.01);
        var dx = ox - x, dy = oy - y;        
        clen += Math.sqrt(dx * dx + dy * dy);
        this.arcLengths[i] = clen;
        ox = x, oy = y;
    }
    this.length = clen;    
}
 
Bezier.prototype = {
    map: function(u) {
        var targetLength = u * this.arcLengths[this.len];
        var low = 0, high = this.len, index = 0;
        while (low < high) {
            index = low + (((high - low) / 2) | 0);
            if (this.arcLengths[index] < targetLength) {
                low = index + 1;
            
            } else {
                high = index;
            }
        }
        if (this.arcLengths[index] > targetLength) {
            index--;
        }
        
        var lengthBefore = this.arcLengths[index];
        if (lengthBefore === targetLength) {
            return index / this.len;
        
        } else {
            return (index + (targetLength - lengthBefore) / (this.arcLengths[index + 1] - lengthBefore)) / this.len;
        }
    },
    
    mx: function (u) {
        return this.x(this.map(u));
    },
    
    my: function (u) {
        return this.y(this.map(u));
    },
    
    x: function (t) {
        return ((1 - t) * (1 - t) * (1 - t)) * this.a.x
               + 3 * ((1 - t) * (1 - t)) * t * this.b.x
               + 3 * (1 - t) * (t * t) * this.c.x
               + (t * t * t) * this.d.x;
    },
    
    y: function (t) {
        return ((1 - t) * (1 - t) * (1 - t)) * this.a.y
               + 3 * ((1 - t) * (1 - t)) * t * this.b.y
               + 3 * (1 - t) * (t * t) * this.c.y
               + (t * t * t) * this.d.y;
    }
};


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

var fs = require('fs')
	, filename = process.argv[2]
	, conversionType = process.argv[3]
	, XmlStream = require('xml-stream')
	, paths = new Array()
	, allPaths = new Array()
	, svgData
	;

var stream = fs.createReadStream(filename,{encoding: "utf8"});
var xml = new XmlStream(stream);
xml.collect('path');
xml.on('endElement: path', function(item) {
	var pathData = item.$.d
	var pathSegmentPattern = /[a-z][^a-z]*/ig;
	var pathSegments = pathData.match(pathSegmentPattern); //splitten voor elke letter
  	paths.push(pathSegments);
  	
});
xml.on('endElement: svg', function(item) {
	svgData = item.$
		
});
xml.on('end', function(){
	// alles in een lijst dumpen
	paths.unshift(['O'+svgData.width.slice(0,-2)/2+','+svgData.height.slice(0, -2)/2]);
	
	for (var i = 0; i < paths.length; i++) {
		for (var j = 0; j < paths[i].length; j++) {
			
			var numbers = paths[i][j].substr(1).replace(/-/gi, ',-');
			var arrayOfNumbers = numbers.split(",");
			if (paths[i][j].slice(0, 1) !== 'z'){
				allPaths.push({
				type: paths[i][j].slice(0, 1),
				points : arrayOfNumbers.toFloat(),
				paint : true
			})
			}
			
		}
	}
	for (var i = 1; i < allPaths.length; i++) {
		var absolutePointsArray = new Array();
		var prevAbsoluteX = allPaths[i-1].points[allPaths[i-1].points.length-2];
		var prevAbsoluteY = allPaths[i-1].points[allPaths[i-1].points.length-1];
		absolutePointsArray[0] = allPaths[i-1].points[allPaths[i-1].points.length-2];
		absolutePointsArray[1] = allPaths[i-1].points[allPaths[i-1].points.length-1];
		if (allPaths[i].type !== allPaths[i].type.toUpperCase()) {
			if (allPaths[i].type !== "v" && allPaths[i].type !== "h") {
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
					absolutePointsArray[2] = prevAbsoluteX
					absolutePointsArray[3] = prevAbsoluteY + allPaths[i].points[0]
				} 
			}
			
			// deze posities zijn relatief en moeten absolute gemaakt worden.
			// ga één terug en kijk of deze al absoluut is en trek alle x y op bij de absolute waarden.
		} else if(allPaths[i].type == "V") {
					absolutePointsArray[2] = prevAbsoluteX
					absolutePointsArray[3] = allPaths[i].points[0]
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
		if (allPaths[i].type === "H" || allPaths[i].type === "V") {
			allPaths[i].type = "L"
		}
	}
	// alle "M" (moveTo's) vervangen door curves door de vorige en volgende points te spiegelen
	// alle "S" (shorthand smoot curve to's) vervangen door cubic beziers
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
			var points = [prevX, prevY, prevX - prevLineX, prevY - prevLineY, nextX + nextLineX, nextY + nextLineY, nextX, nextY]
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
	//console.log(allPaths);

	// check alle curves en controleer of ze inline liggen zoniet een curve bijmaken die de overgang vloeiend maakt
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
			if (slope - nextSlope > 0.01 || slope - nextSlope < -0.01 ) {
				if (slope - nextSlope !== Infinity ) {
					if (slope - nextSlope !== -Infinity) {
						console.log('ellipse('+testX+', '+ testY + ', 10, 10 );');
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
						console.log(length)
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
						console.log(length2);
						console.log(opositeX2);
						console.log(opositeY2);
							
							
						if (length2 < 20) {

							opositeX2 = fixedX2 +4*(fixedX2 - dirX2);
							opositeY2 = fixedY2 +4*(fixedY2 - dirY2);
						}
						console.log(opositeX2);
						console.log(opositeY2);
						console.log('')

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
				
			};
			
			
		}
	};
	//console.log(allPaths);


	//add lenght 
	for (var i = 0 ; i < allPaths.length; i++) {
		var p = allPaths[i].points
		if (allPaths[i].type === "C") {
			allPaths[i].bezier = new Bezier({x:p[0],y:p[1]},{x:p[2],y:p[3]},{x:p[4],y:p[5]},{x:p[6],y:p[7]})
		} else if (allPaths[i].type === "L") {
			allPaths[i].length = Math.sqrt(Math.pow((p[0]-p[2]),2)+Math.pow((p[1]-p[3]),2))
		}

	}
	//console.log(allPaths);

	//make bezier processing stuff
	var x = "noFill()\;"
		
	for (var i = 0 ; i < allPaths.length; i++) {
		var color = (allPaths[i].paint)? 255 : 0 ;
		x = x + "stroke("+ color +")\;"
		if (allPaths[i].type === "C") {

			var y = ""
			for (var j =  0; j < allPaths[i].points.length; j++) {
				y = y + allPaths[i].points[j] + ', '
			};

			x = x + "bezier (" + y.slice(0,-2) + ")\;";

		} else if (allPaths[i].type === "L") {

			var y = ""
			for (var j =  0; j < allPaths[i].points.length; j++) {
				y = y + allPaths[i].points[j] + ', '
			};

			x = x + "line (" + y.slice(0,-2) + ")\;";

		}
		
	};
	console.log(x);

})