// https://gist.github.com/BonsaiDen/670236

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

function Bezier(a, b, c, d) {

    areObjects([a,b,c,d]);
    haveXY([a,b,c,d]);
    allXYAreNumbers([a,b,c,d]);

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    
    this.len = 100;
    this.arcLengths = new Array(this.len + 1);
    this.arcLengths[0] = 0;
    this.arcLength = 0
    
    var previousX = this.x(0);
    var previousY = this.y(0);

    for(var i = 1; i <= this.len; i += 1) {
        var x  = this.x(i * 0.01);
        var y = this.y(i * 0.01);

        var distanceX = previousX - x;
        var distanceY = previousY - y;        
        this.arcLength += Math.sqrt(Math.pow(distanceX,2) + Math.pow(distanceY,2));
        this.arcLengths[i] = this.arcLength;
        previousX = x;
        previousY = y;
    }
}
 
Bezier.prototype = {
    map: function(u) {
        throwErrorIfUndefined(u);
        throwErrorIfNaN(u);
        throwErrorIfArgumentIsNotBetweenZeroandOne(u);
               
        var targetLength = u * this.arcLength;
        var low = 0
        var high = this.len;
        var index = 0;

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
        throwErrorIfUndefined(t);
        throwErrorIfNaN(t);
        throwErrorIfArgumentIsNotBetweenZeroandOne(t);

        return ((1 - t) * (1 - t) * (1 - t)) * this.a.x
               + 3 * ((1 - t) * (1 - t)) * t * this.b.x
               + 3 * (1 - t) * (t * t) * this.c.x
               + (t * t * t) * this.d.x;
    },
    
    y: function (t) {
        throwErrorIfUndefined(t);
        throwErrorIfNaN(t);
        throwErrorIfArgumentIsNotBetweenZeroandOne(t);

        return ((1 - t) * (1 - t) * (1 - t)) * this.a.y
               + 3 * ((1 - t) * (1 - t)) * t * this.b.y
               + 3 * (1 - t) * (t * t) * this.c.y
               + (t * t * t) * this.d.y;
    }
};

module.exports = Bezier;