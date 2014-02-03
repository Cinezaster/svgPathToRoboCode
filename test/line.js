var line = require("../parser/line");
var chai = require("chai");

chai.should();

describe('Line', function(){
	var lineObject = new line({x:10,y:10},{x:11,y:11});
	describe('#new line()', function(){
		it('should be an object',function (done) {
			lineObject.should.be.an('object');
			done();
		});
		it('should contain a b xy coordinates', function (done){
			lineObject.a.should.deep.equal({x:10,y:10});
			lineObject.b.should.deep.equal({x:11,y:11});
			done();
		});
		it('should contain a line with lenght', function (done){
			lineObject.lineLength.should.equal(1.4142135623730951);
			done();
		});
	});
	describe('#line.x(t)', function (){
		it('should be an number', function (done) {
			lineObject.x(0.2).should.be.an('number');
			done();
		});
		it('should throw an error if t is out of bound', function(done) {
			(function(){lineObject.x(2)}).should.throw(Error);
			(function(){lineObject.x(1)}).should.not.throw(Error);
			(function(){lineObject.x(0)}).should.not.throw(Error);
			done();
		})
		it('should throw an error if t is not a number', function(done){
			(function(){lineObject.x('a')}).should.throw(Error);
			done();
		})
		it('should throw an error if t is undefined', function (){
			(function(){lineObject.x()}).should.throw(Error);
		})
	});
	describe('#line.y(t)', function (){
		it('should be an number', function (done) {
			lineObject.y(0.2).should.be.an('number');
			done();
		});
		it('should throw an error if t is out of bound', function(done) {
			(function(){lineObject.y(2)}).should.throw(Error);
			(function(){lineObject.y(1)}).should.not.throw(Error);
			(function(){lineObject.y(0)}).should.not.throw(Error);
			done();
		})
		it('should throw an error if t is not a number', function(done){
			(function(){lineObject.y('a')}).should.throw(Error);
			done();
		})
		it('should throw an error if t is undefined', function (){
			(function(){lineObject.y()}).should.throw(Error);
		})
	})
	describe('#line.toPoints(startAtDistance, resolution)', function () {
			lineObject.toPoints(0,0.2);
		it('should create an object pointsOnLine', function(done){
			lineObject.pointsOnLine.should.be.an('array');
			done();
		});
		it('should contain objects with x and y values as numbers', function (done) {
			lineObject.pointsOnLine[0].should.be.an('object');
			lineObject.pointsOnLine[0].x.should.be.an('number');
			lineObject.pointsOnLine[0].y.should.be.an('number');
			done();
		});
		it('should throw an error in case startAtDistance an resolution are NaN or undefined', function (done){
			(function(){lineObject.toPoints('a','b')}).should.throw(Error);
			(function(){lineObject.toPoints()}).should.throw(Error);
			done();
		})
		it('should throw an error if startAtDistance is bigger then resolution', function(done){
			(function(){lineObject.toPoints(0.2,0.1)}).should.throw(Error);
			done();
		})
	})
	describe('#convertTo(string)', function (){
		it('should create a convertor with settings', function (done){
			lineObject.convertTo('scara',{
				radius: 20,
				steps : 1.8,
				microSteps : 1/8
			});
			lineObject.convertor.should.be.an('object');
			done();
		})
		describe('#convertor.convert(xyPoint)',function(){
			it ('it should return axis1 and axis2 positions', function (done){
				lineObject.convert();
				lineObject.pointsOnLine[0].should.have.property('axis1Degree');
				lineObject.pointsOnLine[0].should.have.property('axis2Degree');
				done();
			})
		})
	})
})