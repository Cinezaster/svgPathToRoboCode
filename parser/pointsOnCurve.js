module.exports = function (resolution, pathArray){
	var totalLength = pathArray[pathArray.length-1].endLength;
	var currentPath = 1;
	var pointCloud = new Array();
	for (var cL = 0; cL < totalLength/resolution; cL++) {
		for (var i = 0; i < pathArray.length; i++) {
			if (cL*resolution >= pathArray[i].startLength && cL*resolution < pathArray[i].endLength) {
				currentPath = i;
				break;
			};
		};
		var lP = pathArray[currentPath]
		var xP;
		var yP;
		if (lP.type === "L") {
			relPosOnLine = cL*resolution - lP.startLength;
			relPosOnLineInPerc = relPosOnLine / lP.length
			xP = lP.points[0] + ((lP.points[2]-lP.points[0])*relPosOnLineInPerc);
			yP = lP.points[1] + ((lP.points[3]-lP.points[1])*relPosOnLineInPerc);
		} else if (lP.type === "C") {
			relPosOnLine = cL*resolution - lP.startLength;
			relPosOnLineInPerc = relPosOnLine / lP.bezier.length
			xP = lP.bezier.mx(relPosOnLineInPerc);
			yP = lP.bezier.my(relPosOnLineInPerc);
		};
		pointCloud.push({
			dist: cL*2,
			x : xP,
			y : yP,
			paint : lP.paint
		})  	
	};
	return pointCloud;
};