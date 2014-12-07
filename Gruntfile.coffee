"use strict";

module.exports = (grunt) ->
	require("time-grunt") grunt
	require("load-grunt-tasks") grunt
	grunt.initConfig
		pkg: grunt.file.readJSON("package.json")

		files:
			js: ["**/*.js"]
			serverFile: [ "index.js" ],

		jshint:
			options:
				jshintrc: ".jshintrc"
				ignores: ["node_modules/**"]

			uses_defaults: "<%= files.serverFile %>"

		jscs:
			uses_defaults: "<%= files.serverFile %>"

		nodeunit:
			all: ["tests/test-*.js"]

		david:
		    all:
		      options:
		        update: false

	grunt.registerTask "test", ["jshint", "jscs", "nodeunit", "david"]
	grunt.registerTask "default", ["test"]