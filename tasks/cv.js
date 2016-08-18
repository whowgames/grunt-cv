/*
 * grunt-cv
 * https://github.com/whowgames/grunt-cv
 *
 * Copyright (c) 2015 Marko Kercmar
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('cv', 'Appends __cv hash on all IMG URLs in CSS', function() {
    var _fs = require('fs');
    var _crypto = require('crypto');
    var _uri = require('uri-js');

    var _md5 = function(str) {
        return _crypto
            .createHash('md5')
            .update(str)
            .digest('hex');
    };

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
        docroot: './',
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
        // Concat specified files.
        var src = f.src.filter(function(filepath) {
            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(filepath)) {
                return false;
            }

            var source = grunt.file.read(filepath);

            var pattern = /url\(.*?['"]{0,1}\)/ig

            var matches = source.match(pattern);

            for (var i in matches) {
                var match = matches[i];
                var orig = match;

                //grunt.log.writeln(match);

                if (orig.match(/\?__cv=[a-z0-9]{32}/ig) && orig.indexOf('&') < 0) {
                    match = orig.substring(0, orig.indexOf('?')) + orig.substring(orig.indexOf('?')+38);
                }

                if (match.indexOf('?') === 1) {
                    continue;
                }

                var clean = match.replace('url(', '').replace(')', '').replace("'", '').replace("'", '').replace('"', '').replace('"', '');
                var filepath = _uri.normalize(clean);
                var filepath_fs = options.docroot + filepath;

                if (filepath.charAt(0) != '/') filepath = '/' + filepath;

                if (_fs.existsSync(filepath_fs)) {
                    var data = _fs.readFileSync(filepath_fs);
                    var hash = _md5(data);
                    hash = hash.substr(0, 30) + "00";

                    source = source.replace(orig, "url('" + filepath + "?__cv=" + hash + "')");

                    //grunt.log.writeln(orig);
                    //grunt.log.writeln("url('" + filepath + "?__cv=" + hash + "')");
                } else {
                    //grunt.log.writeln(match);
                }
            }

            grunt.file.write(f.dest, source);

            grunt.log.writeln('File "' + f.dest + '" written.');
        });
    });
  });
};
