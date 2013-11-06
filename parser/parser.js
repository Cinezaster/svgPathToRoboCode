if (process.argv.length < 4) {
	if (process.argv.length < 3) {
	  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
	  process.exit(1);
	}
}


Array.prototype.toFloat=function() {
	if (this[0] == ''){
		this.splice(0, 1);
	}
  	for (i=0;i<this.length;i++) {
  		this[i]=parseFloat(this[i]);
  	}
  	return this;
};

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
	var pathSegments = pathData.match(pathSegmentPattern);
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
			allPaths.push({
				type: paths[i][j].slice(0, 1),
				points : arrayOfNumbers.toFloat()
			})
		}
	}
	for (var i = 0; i < allPaths.length; i++) {
		console.log(allPaths[i])
		if (allPaths[i].type !== allPaths[i].type.toUpperCase()) {
			// deze posities zijn relatief en moeten absolute gemaakt worden.
			// ga één terug en kijk of deze al absoluut is en trek alle x y op bij de absolute waarden.
		}
	}
})


//calculate slope
//slope = (Ax - Bx)/(Ay - By)