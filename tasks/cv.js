/*
 * grunt-cv
 * https://github.com/whowgames/grunt-cv
 *
 * Copyright (c) 2015 Marko Kercmar
 * Licensed under the MIT license.
 */

'use strict';

var _fs = require('fs');
var _crypto = require('crypto');
var _uri = require('uri-js');

var _md5 = function(str) {
    return _crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
};

module.exports = function(grunt) {
    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('cv', 'Appends __cv hash on all IMG URLs in CSS', function() {
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

                    source = source.replace(orig, "url('" + module.exports.getCV(match, options.docroot) + "')");
                }

                grunt.file.write(f.dest, source);

                grunt.log.writeln('File "' + f.dest + '" written.');
            });
        });
    });
};
module.exports.getCV = function(sourceFilePath, docroot) {
    if (sourceFilePath.match(/\?__cv=[a-z0-9]{32}/ig) && sourceFilePath.indexOf('&') < 0) {
        sourceFilePath = sourceFilePath.substring(0, sourceFilePath.indexOf('?')) + sourceFilePath.substring(sourceFilePath.indexOf('?')+38);
    }

    if (sourceFilePath.indexOf('?') === 1) {
        return sourceFilePath;
    }

    var clean = sourceFilePath.replace('url(', '').replace(')', '').replace("'", '').replace("'", '').replace('"', '').replace('"', '');
    var filepath = _uri.normalize(clean);
    var filepath_fs = (docroot || "") + filepath;

    if (filepath.charAt(0) != '/') filepath = '/' + filepath;

    if (_fs.existsSync(filepath_fs)) {
        var data = _fs.readFileSync(filepath_fs);
        var hash = _md5(data);
        hash = hash.substr(0, 30) + "00";

        return filepath + "?__cv=" + hash;
    }

    return sourceFilePath;
}
