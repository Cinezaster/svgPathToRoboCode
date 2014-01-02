TESTS = test/*.js
REPORTER = spec

test:	
		mocha \
				--recursive \
                --reporter $(REPORTER) \
                $(TESTS)
                
lint: 
		jslint \
				parser/bezier.js

 .PHONY: test lint
