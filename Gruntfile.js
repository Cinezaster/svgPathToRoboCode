'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },
    jshint: {
     options: {
       jshintrc: '.jshintrc'
     },
     default: ['Gruntfile.js', 'parser/*.js'],
    },
    watch: {
      test: {
        files: ['test/*.js', 'parser/*js'],
        tasks: ['mochaTest'],

      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['mochaTest']);

};