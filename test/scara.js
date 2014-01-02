var scara = require("../parser/scara");
var chai = require("chai");

chai.should();

describe('scara', function(){
	var scaraObject = new scara({
		radius: 20,
		steps : 1.8,
		mircoSteps : 1/8
	})
	describe('#new scara()', function(){
		it('should be an object', function (done){
			scaraObject.should.be.an('object');
			done();
		});
		it('should have a config object with properties radius and steps ', function(done){
			scaraObject.config.should.be.an('object');
			scaraObject.config.should.have.property('radius');
			scaraObject.config.should.have.property('steps');
			scaraObject.config.should.have.property('mircoSteps');
			done();
		})
	})
})