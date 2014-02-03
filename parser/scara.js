function Scara(config) {
	// defaults
	this.config = {
		radius: 200,
		steps : 1.8,
		microSteps : 8,
		startPosition : 0
	};
	for (var configItem in config) {
		if (config.hasOwnProperty(configItem)) {
			this.config[configItem]= config[configItem];
		}
	}
}

Scara.prototype = {
	convert: function(xyPoint){
		var convertedX = xyPoint.x - this.config.radius;
		var convertedY = xyPoint.y - this.config.radius;
		var armLenght = this.config.radius / 2;
		var distanceFromMiddleToPoint = Math.sqrt(Math.pow(convertedX,2)+ Math.pow(convertedY,2));
		var heightOfIsoscelesTriangle = Math.sqrt(Math.pow(armLenght,2)-(Math.pow((distanceFromMiddleToPoint/2),2)));
		var angleBetweenXAxisAndBase = Math.asin(convertedY/distanceFromMiddleToPoint)* 180 /Math.PI;
		var topAngle = 2 * Math.acos(heightOfIsoscelesTriangle/100) * 180 /Math.PI;
		var angleBetweenBaseCorner = (180-topAngle)/2;
		var axis1 = (convertedX > 0)? angleBetweenXAxisAndBase - angleBetweenBaseCorner+360 : (180 - angleBetweenXAxisAndBase) - angleBetweenBaseCorner;
		axis1 = axis1 - 90; // set start position
		axis1 = (axis1 > 360)? axis1-360 : axis1;
		axis1 = (axis1 < 0)? axis1 + 360 : axis1;
		var axis2 = axis1 + 180 - topAngle;
		axis2 = axis2 - 270 // set start position
		axis2 = (axis2 < 0)? axis2 + 360 : axis2;
		axis2 = (axis2 > 360)? axis2-360 : axis2;
		var step = 1/(this.config.steps/ this.config.microSteps)
		return {
			x: xyPoint.x,
			y: xyPoint.y,
			axis1Degree : axis1,
			axis2Degree : axis2,
			axis1StepperPosition : Math.round(axis1 * step),
			axis2StepperPosition : Math.round(-axis2 * step)
		}
	}
}

module.exports = Scara;