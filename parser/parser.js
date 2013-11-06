if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

var fs = require('fs')
	, filename = process.argv[2]
	, XmlStream = require('xml-stream')
	, paths = new Array()
	, continuousPath = new Array()
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
	paths.unshift(['M'+svgData.width.slice(0,-2)/2+','+svgData.height.slice(0, -2)/2]);
	for (var i = 0; i < paths.length; i++) {
		for (var j = 0; j < paths[i].length; j++) {
			var curveType = paths[i][j].slice(0, 1);
			var curvePoints = paths[i][j].substr(1).split(",");
			var nextCurveType = function () {
				if (paths[i].length == j+1){
					if( paths.length == i+1){
						return;
					} else {
						return paths[i+1][0].slice(0, 1)
					}
				} else {
					return paths[i][j+1].slice(0, 1)
				}
			}();
			var nextCurvePoints = function () {
				if (paths[i].length == j+1){
					if( paths.length == i+1){
						return;
					} else {
						return paths[i+1][0].substr(1).split(",");
					}
				} else {
					return paths[i][j+1].substr(1).split(",");
				}
			}();
			
						console.log(curveType+ ' ' + curvePoints + ' - ' + nextCurveType +' '+ nextCurvePoints);
						  
			switch (curveType) {
				case 'M':
					switch (nextCurveType) {
						case "M":
							Add line
						break;
					}
				break;
				case 'c':
					console.log('curve');
				break;
				case 'v':
					console.log('kleine v');
				break;
				case 'V':
					console.log('grote V');
				break;
				case 'h':
					console.log('kleine horizontal');
				break;
				case 'z':
					console.log('end');
				break;
				case 'l':
					console.log('line');
				break;
				case 's':
					console.log('iets met S');
				break;
			}
		}
	}
})


//calculate slope
//slope = (Ax - Bx)/(Ay - By)