module.exports = function(grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'ppw/ppw.js',
                dest: 'ppw/ppw-min.js'
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                ignores: ['node_modules/**', 'ppw/_addons/**', 'ppw/_scripts/**', '**/*.min.js']
            },
            uses_defaults: ['run.js']
        },

        jscs: {
            options: {
                config: ".jscs.json"
            },
            src: ['run.js']
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs-checker');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('test', ['jshint', 'jscs']);

};
