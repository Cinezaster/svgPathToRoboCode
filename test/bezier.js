var bezier = require("../parser/bezier");
var chai = require("chai");

chai.should();

describe('bezier', function(){
	var bezierObject = new bezier({x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1});
	describe('#new bezier()', function(){
		it('should create a new bezier object', function (done){
			bezierObject.should.be.an("object");
			done();
		});
		it('should contain a b c d xy coordinates', function (done){
			bezierObject.a.should.deep.equal({x:0,y:0});
			bezierObject.b.should.deep.equal({x:1,y:0});
			bezierObject.c.should.deep.equal({x:1,y:1});
			bezierObject.d.should.deep.equal({x:0,y:1});
			done();
		});
		it('should create an arc with a certain length', function(done){
			bezierObject.arcLength.should.equal(1.9999214596775872);
			done();
		})
	});
	describe('#bezier.map(u)', function(){
		it ('should return t for a given position on the arc between 0 - 1', function (done){
			bezierObject.map(0).should.equal(0);
			bezierObject.map(1).should.equal(1);
			(Math.round(bezierObject.map(0.5)*10)/10).should.equal(0.5);
			done();
		});
		it ('should return error when t is negative or higher then 1', function (done){
			(function (){bezierObject.map(2)}).should.throw(Error);
			done();
		});
		it ('should return a number', function (done){
			bezierObject.map(0.2).should.be.an("number");
			done();
		});
		it ('shoudl return an error if u is not a number', function(done){
			(function (){bezierObject.map('a')}).should.throw(Error);
			(function (){bezierObject.map({x:4})}).should.throw(Error);
			done();
		})
	});
	describe('#bezier.x(t)', function (){
		it ('should return a number',function (done){
			bezierObject.x(0.5).should.be.an('number');
			done();
		});
		it ('should throw an error if t is out of bounce', function(done){
			(function(){bezierObject.x(2)}).should.throw(Error);
			(function(){bezierObject.x(0)}).should.not.throw(Error);
			(function(){bezierObject.x(1)}).should.not.throw(Error);
			done();
		});
		it ('should throw an error if t is undefined', function(done){
			(function(){bezierObject.x()}).should.throw(Error);
			done();
		});
		it ('should throw an error if t is not a number', function(done){
			(function(){bezierObject.x('a')}).should.throw(Error);
			done();
		})
	});
	describe('#bezier.y(t)', function (){
		it ('should return a number',function (done){
			bezierObject.y(0.5).should.be.an('number');
			done();
		});
		it ('should throw an error if t is out of bounce', function(done){
			(function(){bezierObject.y(2)}).should.throw(Error);
			(function(){bezierObject.y(0)}).should.not.throw(Error);
			(function(){bezierObject.y(1)}).should.not.throw(Error);
			done();
		});
		it ('should throw an error if t is undefined', function(done){
			(function(){bezierObject.y()}).should.throw(Error);
			done();
		});
		it ('should throw an error if t is not a number', function(done){
			(function(){bezierObject.y('a')}).should.throw(Error);
			done();
		})
	});
})

