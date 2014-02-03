var scara = require("../parser/scara");
var chai = require("chai");

chai.should();

describe('scara', function(){
	var scaraObject = new scara({
		radius: 200,
	})
	describe('#new scara()', function(){
		it('should be an object', function (done){
			scaraObject.should.be.an('object');
			done();
		});
		it('should have a config object with properties radius, steps, mircoSteps and startPosition ', function(done){
			scaraObject.config.should.be.an('object');
			scaraObject.config.should.have.property('radius');
			scaraObject.config.should.have.property('steps');
			scaraObject.config.should.have.property('microSteps');
			scaraObject.config.should.have.property('startPosition');
			done();
		});
		it('should have a default value of 1.8 for steps', function(done){
			scaraObject.config.steps.should.equal(1.8);
			done();
		})
	})
})