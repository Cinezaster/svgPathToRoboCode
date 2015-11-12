module.exports = function (resolution, pathArray){
	var lines = new Array();
	var previousPath, startPoint;
	for (var i = 0; i < pathArray.length; i++) {
		var currentPath = pathArray[i];
		if (currentPath.type === "M") {
			// set startpoint
			//console.log('M')
			var newLine = {
				type: 'M',
				points: [currentPath.points[0], currentPath.points[1]],
				paint: false,
				gcode: "M05 S0\r\n G0 X" + currentPath.points[0] + " Y"+ currentPath.points[1] +" \/\/ MoveTo\r\n M03 S2000\r\nG4 P100"
			}
			lines.push(newLine)
			startpoint = {
				x: currentPath.points[0],
				y: currentPath.points[1],
				paint: currentPath.paint
			}
		}
		if (currentPath.type === "L") {
			// add to lines
			//console.log('L')
			currentPath.gcode = "G1 X" + currentPath.points[2] + " Y" + currentPath.points[3];
			lines.push(currentPath)
		}
		if (currentPath.type === "C") {
			// aiaiaiai it is a bezier curve, lets split it up in different lines and add those lines to the lines list
			//console.log('C')
			var renderedCurve = resolution;
			
			var secondPointX, secondPointY, firstPointX, firstPointY;
			while (renderedCurve < currentPath.bezier.arcLength) {
				var u = (1/currentPath.bezier.arcLength)*renderedCurve
				var newLine = {
					type : 'L',
					points: [],
					paint: currentPath.paint
				}
				if (renderedCurve === resolution) {
					if (renderedCurve + resolution > currentPath.bezier.arcLength) {
						secondPointX = currentPath.bezier.d.x
						secondPointY = currentPath.bezier.d.y
					} else {
						secondPointX = currentPath.bezier.mx(u)
						secondPointY = currentPath.bezier.my(u)
					}
					
					newLine.points = [currentPath.bezier.a.x, currentPath.bezier.a.y, secondPointX, secondPointY]
					newLine.gcode = "G1 X" + secondPointX + " Y" + secondPointY;
				} else if (renderedCurve + resolution > currentPath.bezier.arcLength) {
					firstPointX = secondPointX;
					firstPointY = secondPointY;
					secondPointX = currentPath.bezier.d.x
					secondPointY = currentPath.bezier.d.y
					newLine.points = [firstPointX, firstPointY, secondPointX, secondPointY]
					newLine.gcode = "G1 X" + secondPointX + " Y" + secondPointY;
				} else {
					firstPointX = secondPointX;
					firstPointY = secondPointY;
					secondPointX = currentPath.bezier.mx(u)
					secondPointY = currentPath.bezier.my(u)
					newLine.points = [firstPointX, firstPointY, secondPointX, secondPointY]
					newLine.gcode = "G1 X" + secondPointX + " Y" + secondPointY;
				}
				renderedCurve = renderedCurve + resolution;
				lines.push(newLine);
			}
		}
		if (currentPath.type === "Z") {
			// connect with last startPoint and clear start point
			//console.log('Z')
			var prevLine = lines[lines.length-1]
			var newLine = {
				type : 'L',
				points: [prevLine.points[2],prevLine.points[3], currentPath.points[0], currentPath[1]],
				paint: currentPath.paint
			}
		}
		if (currentPath.type === "O") {
			//console.log('O')
			startpoint = {
				x: currentPath.points[0],
				y: currentPath.points[1],
				paint: currentPath.paint
			}
		};
	};
	return lines;
};