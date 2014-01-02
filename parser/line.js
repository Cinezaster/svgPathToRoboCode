function areObjects(arrayOfArguments) {
    var i;
    for (i in arrayOfArguments) {
        throwErrorIfArgumentIsNotAnObject(arrayOfArguments[i], i);
    }
}

function throwErrorIfArgumentIsNotAnObject(argument, point) {
    if (argument === null && typeof argument !== 'object') {
        throw new Error(point + ' is not an object');
    }
}

function haveXY(arrayOfArguments) {
    var i;
    for (i in arrayOfArguments) {
       throwErrorIfArgumentDoesntHaveXY(arrayOfArguments[i], i); 
    }
}

function throwErrorIfArgumentDoesntHaveXY(axisPoint, point) {
    if (typeof axisPoint.x === 'undefined' || typeof axisPoint.y === 'undefined')
        throw new Error(point + '.x or ' + point + '.y does not exist')
}

function allXYAreNumbers(arrayOfArguments) {
    for (var point in arrayOfArguments) {
        for(var axis in arrayOfArguments[point]) {
            ifArgumentAxisIsNaNTryToParseFloat (arrayOfArguments[point][axis]);
            throwErrorIfPositionOnAxisIsNaN(arrayOfArguments[point][axis], point, axis);
        } 
    }
}

function ifArgumentAxisIsNaNTryToParseFloat(axisPoint) {
    if (typeof axisPoint != 'number') {
        axisPoint = parseFloat (axisPoint);
    }
}

function throwErrorIfPositionOnAxisIsNaN (axisPoint, point, axis) {
    if (typeof axisPoint != 'number')
        throw new Error('cannot turn ' + point + '.' + axis + ' into a number')
}

function throwErrorIfUndefined (value){
    if (value === 'undefined')
            throw new Error("value cannot be undefined");
}

function throwErrorIfNaN (value) {
    if (typeof(value) !== "number")
            throw new Error("value must be a number");
}
function throwErrorIfArgumentIsNotBetweenZeroandOne (value){
    if (value > 1 || value < 0)
            throw new Error("value must be between 0 and 1");
};

function throwErrorIfStartDistanceIsBiggerThenResolution(startDistance, resolution){
	if (startDistance > resolution) {
		throw new Error("startDistance cannot be bigger then the resolution");
	}
};

function Line(a,b){

	areObjects([a,b]);
    haveXY([a,b]);
    allXYAreNumbers([a,b]);

	this.a = a;
	this.b = b;
	var distanceX = b.x - a.x;
	var distanceY = b.y - a.y;
	this.lineLength = Math.sqrt(Math.pow(distanceX,2)+ Math.pow(distanceY,2));
	this.pointsOnLine = [];

};

Line.prototype = {
	x: function (t){
		throwErrorIfUndefined(t);
        throwErrorIfNaN(t);
        throwErrorIfArgumentIsNotBetweenZeroandOne(t);
		return this.a.x +(t * (this.b.x - this.a.x))
	},
	y: function (t){
		throwErrorIfUndefined(t);
        throwErrorIfNaN(t);
        throwErrorIfArgumentIsNotBetweenZeroandOne(t);
		return this.a.y + (t* (this.b.y - this.a.y))
	},
	toPoints: function (startDistance, resolution) {
		throwErrorIfUndefined(startDistance);
        throwErrorIfNaN(startDistance);
        throwErrorIfUndefined(resolution);
        throwErrorIfNaN(resolution);
		throwErrorIfStartDistanceIsBiggerThenResolution(startDistance, resolution);

		var t = (1 / (this.lineLength/resolution)) + 1/(this.lineLength/startDistance);
		while (t < 1) {
			this.pointsOnLine.push({
				x : this.x(t),
				y : this.y(t)
			})
			t += 1 / (this.lineLength/resolution);
		}
	},
	convertTo: function (type, config){
		this.convertor = require('./' + type +'.js');
		this.convertor = new this.convertor(config);
	},
	convert: function (){
		throwErrorIfUndefined(this.convertor);
		for (var i = 0; i < this.pointsOnLine.length; i++) {
			this.pointsOnLine[i] = this.convertor.convert(this.pointsOnLine[i]);
		};
	}
}

module.exports = Line;