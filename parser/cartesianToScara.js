module.exports = function (xyPosition){
		var xy = xyPosition
		var error = false;
		for (var i = 1; i < xy.length; i++) {
			var cartX = xy[i].x - 200;
			var cartY = xy[i].y - 200;
			var armLenght = 100;
				// distance between point and swivel point
			var distB = Math.sqrt(Math.pow(cartX,2)+ Math.pow(cartY,2));
				// height of the Isosceles Triangl
			var isosHeight = Math.sqrt(Math.pow(armLenght,2)-(Math.pow((distB/2),2)))
				// bottom corner of Base to x as
			var hoekBase = Math.asin(cartY/distB)* 180 /Math.PI ;
			var hoekTop= 2 * Math.acos(isosHeight/100) * 180 /Math.PI;
			var hoekBaseCorner = (180-hoekTop)/2;
			// check in wich quadrant the point
		   	xy[i].step0 = (cartX > 0)? hoekBase - hoekBaseCorner+360 : (180 - hoekBase) - hoekBaseCorner;
		   	xy[i].step0 = (xy[i].step0 > 360)? xy[i].step0-360 : xy[i].step0;
			xy[i].step1 = xy[i].step0 +180 - hoekTop;


			if (isNaN(xy[i].step0)|| isNaN(xy[i].step1)) {
				console.log("ERROR: DRAWING is out of reach of the robot arm");
				error = true;
				break;
			}
		}
		return (error)? []:xy
	}